import sharp from "sharp";

const JPEG_QUALITY = 82;
const WEBP_QUALITY = 85;
const OPTIMIZABLE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

export interface ImageUploadOptimization {
  buffer: Buffer;
  extension: string;
  mimeType: string;
  originalSize: number;
  size: number;
  savedBytes: number;
  reductionPercent: number;
  optimized: boolean;
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

export async function optimizeImageForUpload(input: OptimizeImageUploadInput): Promise<ImageUploadOptimization> {
  const extension = normalizeExtension(input.extension);
  const original = originalUpload({ ...input, extension });

  if (!OPTIMIZABLE_EXTENSIONS.has(extension)) {
    return original;
  }

  try {
    const image = sharp(input.buffer, { failOn: "none" }).rotate();
    const optimizedBuffer = await (
      extension === "jpg" || extension === "jpeg"
        ? image.jpeg({
            quality: JPEG_QUALITY,
            mozjpeg: true,
            progressive: true,
            chromaSubsampling: "4:2:0",
          })
        : extension === "png"
          ? image.png({
              compressionLevel: 9,
              adaptiveFiltering: true,
              effort: 10,
            })
          : image.webp({
              quality: WEBP_QUALITY,
              effort: 6,
            })
    ).toBuffer();

    if (optimizedBuffer.length >= input.buffer.length) {
      return original;
    }

    const savedBytes = input.buffer.length - optimizedBuffer.length;

    return {
      buffer: optimizedBuffer,
      extension,
      mimeType: mimeTypeForExtension(extension, input.mimeType),
      originalSize: input.buffer.length,
      size: optimizedBuffer.length,
      savedBytes,
      reductionPercent: Number(((savedBytes / input.buffer.length) * 100).toFixed(2)),
      optimized: true,
    };
  } catch {
    return original;
  }
}
