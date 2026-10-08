"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { isBlurDataUrl } from "@/lib/image-metadata";
import { cn } from "@/lib/utils";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  blurDataUrl?: string;
  variant?: "card" | "inspect";
  children?: ReactNode;
}

/** A URL change (including admin replacement) starts a fresh loading lifecycle. */
export function ProgressiveImage(props: ProgressiveImageProps) {
  return <ImageRequest key={props.src} {...props} />;
}

function ImageRequest({
  src,
  alt,
  width,
  height,
  blurDataUrl,
  variant = "card",
  children,
}: ProgressiveImageProps) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [measured, setMeasured] = useState<{ width: number; height: number }>();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const storedDimensionsKnown =
    Number.isFinite(width) && Number.isFinite(height) && width! > 0 && height! > 0;
  const dimensions = storedDimensionsKnown
    ? { width: width!, height: height! }
    : measured;
  const ratio = dimensions ? dimensions.width / dimensions.height : 4 / 3;
  const preview = isBlurDataUrl(blurDataUrl) ? blurDataUrl : undefined;
  const inspect = variant === "inspect";

  const reveal = async (image: HTMLImageElement) => {
    // Cached loads and onLoad can both arrive. A late decode from a previous
    // request must not update a retried or unmounted image.
    try {
      await image.decode();
    } catch {
      // A successful load can still reject decode; keep its pixels visible.
    }
    if (imageRef.current === image && image.naturalWidth > 0) {
      setMeasured((previous) =>
        previous?.width === image.naturalWidth &&
        previous?.height === image.naturalHeight
          ? previous
          : { width: image.naturalWidth, height: image.naturalHeight },
      );
      setState("ready");
    }
  };

  return (
    <div
      data-image-state={state}
      aria-busy={state === "loading"}
      className={cn(
        "bg-surface-variant relative overflow-hidden",
        inspect
          ? "max-h-[70vh] max-w-full"
          : "aspect-[4/3] w-full sm:aspect-[var(--image-aspect)]",
        inspect && (!dimensions || state === "error") && "w-full",
        state === "error" && "min-h-32",
      )}
      style={
        {
          "--image-aspect": ratio,
          ...(inspect
            ? {
                aspectRatio: ratio,
                ...(dimensions && state !== "error"
                  ? {
                      width: `min(100%, ${dimensions.width}px, ${70 * ratio}vh)`,
                    }
                  : {}),
              }
            : {}),
        } as CSSProperties
      }
    >
      {/* The real image is visible by default, including without JavaScript.
          Width/height reserve its proportions without changing the card crop. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- use the stored
          public screenshot directly; responsive delivery is a separate change. */}
      <img
        key={attempt}
        ref={(image) => {
          imageRef.current = image;
          if (image?.complete && image.naturalWidth > 0) void reveal(image);
        }}
        src={src}
        alt={alt}
        width={dimensions?.width}
        height={dimensions?.height}
        loading={inspect ? "eager" : "lazy"}
        decoding="async"
        onLoad={(event) => void reveal(event.currentTarget)}
        onError={(event) => {
          if (imageRef.current === event.currentTarget) setState("error");
        }}
        className={cn(
          "absolute inset-0 block h-full w-full",
          inspect ? "object-contain" : "object-cover",
          state === "error" && "invisible",
        )}
      />
      {state !== "error" && (
        <div
          aria-hidden="true"
          className={cn(
            "archive-image-preview bg-surface-variant pointer-events-none absolute inset-0 bg-center bg-no-repeat transition-opacity duration-200 motion-reduce:transition-none",
            preview && "scale-110 blur-[8px]",
            inspect ? "bg-contain" : "bg-cover",
            state === "ready" && "opacity-0",
          )}
          style={preview ? { backgroundImage: `url("${preview}")` } : undefined}
        />
      )}
      {state === "loading" && (
        <span role="status" className="archive-image-loading sr-only">
          Loading screenshot
        </span>
      )}
      {state === "error" ? (
        <div className="bg-surface-variant text-on-surface absolute inset-0 flex flex-col items-center justify-center gap-3 p-3 text-center">
          <p role="status" className="text-sm">
            Couldn&apos;t load this screenshot.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setState("loading");
              setAttempt((value) => value + 1);
            }}
          >
            Retry image
          </Button>
        </div>
      ) : (
        children
      )}
      <noscript>
        <style>
          {".archive-image-preview,.archive-image-loading{display:none!important}"}
        </style>
      </noscript>
    </div>
  );
}
