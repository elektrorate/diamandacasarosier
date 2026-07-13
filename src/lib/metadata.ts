import type { Metadata } from "next";

export function createMetadata(
  title: string,
  description: string
): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: "es_ES",
      type: "website"
    }
  };
}
