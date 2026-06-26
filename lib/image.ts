/**
 * Browser-only image helpers for the upload flow: measure dimensions, derive an
 * aspect ratio, and generate a tiny blur placeholder for lazy loading.
 * These touch the DOM/Canvas, so only call them client-side.
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

/** Read a File's natural pixel dimensions. */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dims);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions."));
    };
    img.src = url;
  });
}

/** Aspect ratio (width / height), guarded against divide-by-zero. */
export function getAspectRatio({ width, height }: ImageDimensions): number {
  return height > 0 ? width / height : 1;
}

/**
 * Generate a small base64 blur placeholder by downscaling the image to a few
 * pixels on a canvas. Returns null if the canvas isn't available.
 */
export async function generateBlurDataUrl(
  file: File,
  size = 10,
): Promise<string | null> {
  const dims = await getImageDimensions(file).catch(() => null);
  if (!dims) return null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const scale = size / Math.max(dims.width, dims.height);
  canvas.width = Math.max(1, Math.round(dims.width * scale));
  canvas.height = Math.max(1, Math.round(dims.height * scale));

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return null;

  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/webp", 0.5);
}

/** A neutral SVG shimmer data URL, usable as a static blur placeholder. */
export function shimmerDataUrl(width = 4, height = 3): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#e2e2e2"/></svg>`;
  const base64 =
    typeof window === "undefined"
      ? Buffer.from(svg).toString("base64")
      : window.btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
}
