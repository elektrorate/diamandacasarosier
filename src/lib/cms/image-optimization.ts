import sharp from "sharp";

const WEBP_QUALITY = 85;
const MAX_IMAGE_DIMENSION = 2560;
const OPTIMIZABLE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "avif"]);

export interface ImageUploadOptimization {
  buffer: Buffer;
  extension: string;
  mimeType: string;
  originalSize: number;
  size: number;
  savedBytes: number;
  reductionPercent: number;
  optimized: boolean;
  width?: number;
  height?: number;
}

interface OptimizeImageUploadInput {
  buffer: Buffer;
  extension: string;
  mimeType: string;
}

function normalizeExtension(extension: string) {
  return extension.toLowerCase().replace(/^\./, "");
}

function mimeTypeForExtension(extension: string, fallback: string) {
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return fallback;
}

function originalUpload(input: OptimizeImageUploadInput): ImageUploadOptimization {
  return {
    buffer: input.buffer,
    extension: normalizeExtension(input.extension),
    mimeType: input.mimeType,
    originalSize: input.buffer.length,
    size: input.buffer.length,
    savedBytes: 0,
    reductionPercent: 0,
    optimized: false,
  };
}

function scaledDimensions(width?: number, height?: number) {
  if (!width || !height) return {};
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

export async function optimizeImageForUpload(input: OptimizeImageUploadInput): Promise<ImageUploadOptimization> {
  const extension = normalizeExtension(input.extension);
  const original = originalUpload({ ...input, extension });

  if (!OPTIMIZABLE_EXTENSIONS.has(extension)) {
    return original;
  }

  try {
    const source = sharp(input.buffer, { failOn: "none" }).rotate();
    const metadata = await source.metadata();
    const dimensions = scaledDimensions(metadata.width, metadata.height);
    const optimizedBuffer = await source
      .clone()
      .resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: WEBP_QUALITY,
        effort: 6,
        smartSubsample: true,
      })
      .toBuffer();

    if (optimizedBuffer.length >= input.buffer.length && extension !== "avif") {
      return original;
    }

    const savedBytes = input.buffer.length - optimizedBuffer.length;

    return {
      buffer: optimizedBuffer,
      extension: "webp",
      mimeType: mimeTypeForExtension("webp", input.mimeType),
      originalSize: input.buffer.length,
      size: optimizedBuffer.length,
      savedBytes,
      reductionPercent: Number(((savedBytes / input.buffer.length) * 100).toFixed(2)),
      optimized: true,
      ...dimensions,
    };
  } catch {
    return original;
  }
}
