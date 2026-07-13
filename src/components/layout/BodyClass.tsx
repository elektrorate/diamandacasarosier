"use client";

import { useLayoutEffect } from "react";

interface BodyClassProps {
  className?: string;
  data?: Record<string, string>;
}

export function BodyClass({ className = "", data = {} }: BodyClassProps) {
  useLayoutEffect(() => {
    const classes = className.split(/\s+/).filter(Boolean);
    classes.forEach((value) => document.body.classList.add(value));
    Object.entries(data).forEach(([key, value]) => {
      document.body.dataset[key] = value;
    });

    return () => {
      classes.forEach((value) => document.body.classList.remove(value));
      Object.keys(data).forEach((key) => {
        delete document.body.dataset[key];
      });
    };
  }, [className, data]);

  return null;
}
