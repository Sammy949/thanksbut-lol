/** Bound inline previews to small raster images, never remote URLs or SVG. */
export const MAX_BLUR_DATA_URL_LENGTH = 4096;

export function isBlurDataUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= MAX_BLUR_DATA_URL_LENGTH &&
    /^data:image\/(?:webp|png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)
  );
}
