import { isBlurDataUrl } from "./image-metadata";

export interface ImageDimensions {
  width: number;
  height: number;
}

export type PreparedImage = Partial<ImageDimensions> & { blurDataUrl?: string };

/**
 * Prepare only the final cropped/redacted File. Decode once for dimensions and
 * a tiny inline preview; no original or second file is uploaded. Optional
 * metadata must never keep publication waiting on a stuck browser decoder.
 */
export function prepareArchiveImage(file: File): Promise<PreparedImage> {
  return new Promise((resolve) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    const finish = (metadata: PreparedImage) => {
      clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      image.removeAttribute("src");
      URL.revokeObjectURL(url);
      resolve(metadata);
    };
    const timer = setTimeout(() => finish({}), 5000);
    image.onerror = () => finish({});
    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      if (!width || !height) return finish({});
      const metadata: PreparedImage = { width, height };
      try {
        const canvas = document.createElement("canvas");
        const scale = 10 / Math.max(width, height);
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        const context = canvas.getContext("2d");
        if (context) {
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const preview = canvas.toDataURL("image/webp", 0.5);
          if (isBlurDataUrl(preview)) metadata.blurDataUrl = preview;
        }
      } catch {
        // Dimensions remain useful even when canvas encoding is unavailable.
      }
      finish(metadata);
    };
    image.src = url;
  });
}
