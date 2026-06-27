import imageCompression from "browser-image-compression";

/**
 * Client-side image pipeline for the privacy editor. Everything runs in the
 * browser; only the final processed File is ever uploaded. Canvas export also
 * strips EXIF/metadata (canvas has no concept of it).
 */

export type RedactionMode = "blur" | "black";

/** A redaction rectangle, normalised (0–1) to the cropped image box. */
export interface Redaction {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  mode: RedactionMode;
}

/** react-easy-crop reports the crop area in natural image pixels. */
export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Could not load image")));
    image.src = url;
  });
}

function rotatedSize(width: number, height: number, rotation: number) {
  const rad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  };
}

/** Render the cropped (and rotated) region to a canvas at natural resolution. */
export async function getCroppedCanvas(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation = 0,
): Promise<HTMLCanvasElement> {
  const image = await createImage(imageSrc);

  const work = document.createElement("canvas");
  const workCtx = work.getContext("2d");
  if (!workCtx) throw new Error("Canvas unsupported");

  const { width: bw, height: bh } = rotatedSize(image.width, image.height, rotation);
  work.width = bw;
  work.height = bh;

  workCtx.translate(bw / 2, bh / 2);
  workCtx.rotate((rotation * Math.PI) / 180);
  workCtx.drawImage(image, -image.width / 2, -image.height / 2);

  const data = workCtx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
  );

  const out = document.createElement("canvas");
  out.width = pixelCrop.width;
  out.height = pixelCrop.height;
  out.getContext("2d")?.putImageData(data, 0, 0);
  return out;
}

/** Bake blur / black redactions onto a copy of the cropped canvas. */
export function applyRedactions(
  source: HTMLCanvasElement,
  redactions: Redaction[],
): HTMLCanvasElement {
  const W = source.width;
  const H = source.height;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  ctx.drawImage(source, 0, 0);

  // Pristine copy to sample from for blur (so stacked rects don't double-blur).
  const pristine = document.createElement("canvas");
  pristine.width = W;
  pristine.height = H;
  pristine.getContext("2d")?.drawImage(source, 0, 0);

  const blurRadius = Math.max(6, Math.round(Math.min(W, H) * 0.02));

  for (const r of redactions) {
    const x = Math.round(r.x * W);
    const y = Math.round(r.y * H);
    const w = Math.round(r.w * W);
    const h = Math.round(r.h * H);
    if (w <= 0 || h <= 0) continue;

    if (r.mode === "black") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(x, y, w, h);
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.filter = `blur(${blurRadius}px)`;
      ctx.drawImage(pristine, 0, 0);
      ctx.restore();
    }
  }

  return canvas;
}

/**
 * Export a canvas to a compressed File. `toBlob` drops all metadata; the
 * compressor keeps screenshots readable while shrinking the upload.
 */
export async function canvasToCompressedFile(
  canvas: HTMLCanvasElement,
  fileName: string,
): Promise<File> {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92),
  );
  if (!blob) throw new Error("Image export failed");

  const name = fileName.replace(/\.\w+$/, "") + ".jpg";
  const raw = new File([blob], name, { type: "image/jpeg" });

  // Keep rejection text legible while still shrinking the upload.
  return imageCompression(raw, {
    maxSizeMB: 2,
    maxWidthOrHeight: 2000,
    initialQuality: 0.9,
    useWebWorker: true,
  });
}
