import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Our custom typography scale (see the @theme block in globals.css) defines
 * font-size utilities like `text-code-snippet` and `text-headline-md`. Out of
 * the box tailwind-merge can't tell these apart from text *colour* utilities
 * (`text-surface`), so composing both via cn() drops the colour — e.g. the
 * report tooltip rendered as a black box because `text-surface` got stripped.
 * Register them as font-sizes so colour and size no longer collide.
 */
const FONT_SIZES = [
  "display-lg",
  "display-lg-mobile",
  "headline-md",
  "headline-sm",
  "body-lg",
  "body-md",
  "code-snippet",
  "label-caps",
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: FONT_SIZES }],
    },
  },
});

/**
 * Merge class names while resolving Tailwind conflicts.
 * Used by every component for conditional + composed styling.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
