// X/Twitter card = the same branded homepage card. Re-export the OG image so
// there's a single source of truth; Next wires twitter:image automatically.
export { alt, size, contentType } from "./opengraph-image";
export { default } from "./opengraph-image";
