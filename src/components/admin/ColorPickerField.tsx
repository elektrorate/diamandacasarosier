"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";

const DEFAULT_COLOR = "#000000";
const POPOVER_WIDTH = 292;
const POPOVER_HEIGHT = 350;
const POPOVER_MARGIN = 12;

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  help?: string;
  className?: string;
}

type DragTarget = "spectrum" | "hue" | null;

function toHexPart(value: number) {
  return value.toString(16).padStart(2, "0").toUpperCase();
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function clampRgb(value: number) {
  return Math.round(clamp(value, 0, 255));
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${toHexPart(clampRgb(r))}${toHexPart(clampRgb(g))}${toHexPart(clampRgb(b))}`;
}

function expandShortHex(value: string) {
  return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toUpperCase();
}

function normalizeHex(value: string) {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (/^#[0-9a-fA-F]{3}$/.test(withHash)) return expandShortHex(withHash);
  if (/^#[0-9a-fA-F]{6}$/.test(withHash)) return withHash.toUpperCase();
  return null;
}

function normalizeColor(value: string) {
  const hex = normalizeHex(value);
  if (hex) return hex;

  const rgb = value.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  if (rgb) return rgbToHex(Number(rgb[1]), Number(rgb[2]), Number(rgb[3]));

  return DEFAULT_COLOR;
}

function hexToRgb(value: string) {
  const hex = normalizeColor(value).slice(1);
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function rgbToHsv(r: number, g: number, b: number) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let h = 0;

  if (delta !== 0) {
    if (max === red) h = ((green - blue) / delta) % 6;
    else if (max === green) h = (blue - red) / delta + 2;
    else h = (red - green) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  return {
    h,
    s: max === 0 ? 0 : delta / max,
    v: max,
  };
}

function hsvToRgb(h: number, s: number, v: number) {
  const hue = ((h % 360) + 360) % 360;
  const chroma = v * s;
  const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = v - chroma;
  let r = 0;
  let g = 0;
  let b = 0;

  if (hue < 60) [r, g, b] = [chroma, x, 0];
  else if (hue < 120) [r, g, b] = [x, chroma, 0];
  else if (hue < 180) [r, g, b] = [0, chroma, x];
  else if (hue < 240) [r, g, b] = [0, x, chroma];
  else if (hue < 300) [r, g, b] = [x, 0, chroma];
  else [r, g, b] = [chroma, 0, x];

  return {
    r: clampRgb((r + m) * 255),
    g: clampRgb((g + m) * 255),
    b: clampRgb((b + m) * 255),
  };
}

function getPopoverPosition(clientX: number, clientY: number) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const fitsRight = clientX + POPOVER_MARGIN + POPOVER_WIDTH <= viewportWidth - POPOVER_MARGIN;
  const fitsBelow = clientY + POPOVER_MARGIN + POPOVER_HEIGHT <= viewportHeight - POPOVER_MARGIN;
  const left = fitsRight ? clientX + POPOVER_MARGIN : clientX - POPOVER_WIDTH - POPOVER_MARGIN;
  const top = fitsBelow ? clientY + POPOVER_MARGIN : clientY - POPOVER_HEIGHT - POPOVER_MARGIN;

  return {
    left: clamp(left, POPOVER_MARGIN, Math.max(POPOVER_MARGIN, viewportWidth - POPOVER_WIDTH - POPOVER_MARGIN)),
    top: clamp(top, POPOVER_MARGIN, Math.max(POPOVER_MARGIN, viewportHeight - POPOVER_HEIGHT - POPOVER_MARGIN)),
  };
}

export default function ColorPickerField({
  label,
  value,
  onChange,
  disabled = false,
  help,
  className = "",
}: ColorPickerFieldProps) {
  const normalizedValue = useMemo(() => normalizeColor(value), [value]);
  const rgb = hexToRgb(normalizedValue);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const [hexState, setHexState] = useState({ source: normalizedValue, input: normalizedValue });
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ left: POPOVER_MARGIN, top: POPOVER_MARGIN });
  const [dragTarget, setDragTarget] = useState<DragTarget>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const spectrumRef = useRef<HTMLDivElement | null>(null);
  const hueRef = useRef<HTMLDivElement | null>(null);
  const liveColorRef = useRef({ hsv, onChange });

  const hexInput = hexState.source === normalizedValue ? hexState.input : normalizedValue;

  useEffect(() => {
    liveColorRef.current = { hsv, onChange };
  }, [hsv, onChange]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const commitColor = useCallback((nextValue: string) => {
    const nextHex = normalizeHex(nextValue) ?? normalizeColor(nextValue);
    setHexState({ source: nextHex, input: nextHex });
    liveColorRef.current.onChange(nextHex);
  }, []);

  const commitHsv = useCallback((h: number, s: number, v: number) => {
    const nextRgb = hsvToRgb(h, s, v);
    commitColor(rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b));
  }, [commitColor]);

  const updateFromSpectrum = useCallback((clientX: number, clientY: number) => {
    const rect = spectrumRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nextSaturation = clamp((clientX - rect.left) / rect.width, 0, 1);
    const nextValue = 1 - clamp((clientY - rect.top) / rect.height, 0, 1);
    commitHsv(liveColorRef.current.hsv.h, nextSaturation, nextValue);
  }, [commitHsv]);

  const updateFromHue = useCallback((clientX: number) => {
    const rect = hueRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nextHue = clamp((clientX - rect.left) / rect.width, 0, 1) * 360;
    commitHsv(nextHue, liveColorRef.current.hsv.s, liveColorRef.current.hsv.v);
  }, [commitHsv]);

  useEffect(() => {
    if (!dragTarget) return;

    function handlePointerMove(event: PointerEvent) {
      if (dragTarget === "spectrum") updateFromSpectrum(event.clientX, event.clientY);
      else updateFromHue(event.clientX);
    }

    function handlePointerUp() {
      setDragTarget(null);
    }

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragTarget, updateFromHue, updateFromSpectrum]);

  function handleTriggerClick(event: ReactMouseEvent<HTMLButtonElement>) {
    if (disabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const clientX = event.clientX || rect.left + rect.width;
    const clientY = event.clientY || rect.top + rect.height / 2;
    setPosition(getPopoverPosition(clientX, clientY));
    setIsOpen((current) => !current);
  }

  function handleHexChange(nextValue: string) {
    const next = nextValue.startsWith("#") ? nextValue : `#${nextValue}`;
    setHexState({ source: normalizedValue, input: next.toUpperCase() });
    const validHex = normalizeHex(next);
    if (validHex) onChange(validHex);
  }

  function handleRgbChange(channel: "r" | "g" | "b", nextValue: string) {
    const nextRgb = { ...rgb, [channel]: clampRgb(Number(nextValue)) };
    commitColor(rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b));
  }

  const popover = (
    <div
      ref={popoverRef}
      className="cms-color-picker-popover"
      style={{ left: position.left, top: position.top }}
      role="dialog"
      aria-label={`Seleccionar ${label}`}
    >
      <div
        ref={spectrumRef}
        className="cms-color-picker-popover__spectrum"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h} 100% 50%))`,
        }}
        onPointerDown={(event) => {
          event.preventDefault();
          setDragTarget("spectrum");
          updateFromSpectrum(event.clientX, event.clientY);
        }}
      >
        <span
          className="cms-color-picker-popover__spectrum-handle"
          style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
        />
      </div>

      <div
        ref={hueRef}
        className="cms-color-picker-popover__hue"
        onPointerDown={(event) => {
          event.preventDefault();
          setDragTarget("hue");
          updateFromHue(event.clientX);
        }}
      >
        <span className="cms-color-picker-popover__hue-handle" style={{ left: `${(hsv.h / 360) * 100}%` }} />
      </div>

      <div className="cms-color-picker-popover__values">
        <label className="cms-color-picker-popover__hex">
          <span>Hex</span>
          <input
            value={hexInput}
            spellCheck={false}
            inputMode="text"
            maxLength={7}
            onChange={(event) => handleHexChange(event.target.value)}
            onBlur={() => setHexState({ source: normalizedValue, input: normalizedValue })}
          />
        </label>
        {(["r", "g", "b"] as const).map((channel) => (
          <label key={channel}>
            <span>{channel.toUpperCase()}</span>
            <input
              type="number"
              min={0}
              max={255}
              value={rgb[channel]}
              onChange={(event) => handleRgbChange(channel, event.target.value)}
            />
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`field cms-color-picker-field ${className}`.trim()}>
      <span>{label}</span>
      <button
        ref={triggerRef}
        type="button"
        className="cms-color-picker-trigger"
        disabled={disabled}
        aria-expanded={isOpen}
        aria-label={`${label}: ${normalizedValue}`}
        onClick={handleTriggerClick}
      >
        <span className="cms-color-picker-trigger__swatch" style={{ backgroundColor: normalizedValue }} />
        <span className="cms-color-picker-trigger__value">{normalizedValue}</span>
      </button>
      {help ? <small>{help}</small> : null}
      {isOpen && typeof document !== "undefined" ? createPortal(popover, document.body) : null}
    </div>
  );
}
