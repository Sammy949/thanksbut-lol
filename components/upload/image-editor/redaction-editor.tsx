"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { applyRedactions, type Redaction } from "@/lib/image-editing";

interface RedactionEditorProps {
  source: HTMLCanvasElement;
  redactions: Redaction[];
  onChange: (next: Redaction[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

type Interaction =
  | { type: "create"; id: string; startX: number; startY: number }
  | { type: "move"; id: string; offsetX: number; offsetY: number }
  | { type: "resize"; id: string };

const MIN_SIZE = 0.02;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Drag on the screenshot to draw redaction rectangles; click to select; drag a
 * rect to move it, the corner handle to resize, Delete/Backspace to remove.
 * Rectangles are stored normalised (0–1) so they map cleanly onto export.
 */
export function RedactionEditor({
  source,
  redactions,
  onChange,
  selectedId,
  onSelect,
}: RedactionEditorProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const previewRef = React.useRef<HTMLCanvasElement>(null);
  const interaction = React.useRef<Interaction | null>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = () => {
      const scale = Math.min(
        viewport.clientWidth / source.width,
        viewport.clientHeight / source.height,
        1,
      );
      setSize({ width: source.width * scale, height: source.height * scale });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    measure();
    return () => observer.disconnect();
  }, [source]);

  React.useLayoutEffect(() => {
    const preview = previewRef.current;
    const ctx = preview?.getContext("2d");
    if (!preview || !ctx) return;
    const rendered = applyRedactions(source, redactions);
    ctx.clearRect(0, 0, preview.width, preview.height);
    ctx.drawImage(rendered, 0, 0);
  }, [source, redactions]);

  const pointToNorm = (clientX: number, clientY: number) => {
    const box = containerRef.current?.getBoundingClientRect();
    if (!box || !box.width || !box.height) return { x: 0, y: 0 };
    return {
      x: clamp01((clientX - box.left) / box.width),
      y: clamp01((clientY - box.top) / box.height),
    };
  };

  const startCreate = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return; // only on empty canvas
    e.currentTarget.focus();
    const { x, y } = pointToNorm(e.clientX, e.clientY);
    const id = crypto.randomUUID();
    interaction.current = { type: "create", id, startX: x, startY: y };
    onChange([...redactions, { id, x, y, w: 0, h: 0, mode: "blur" }]);
    onSelect(id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const startMove = (e: React.PointerEvent, r: Redaction) => {
    e.stopPropagation();
    containerRef.current?.focus();
    const { x, y } = pointToNorm(e.clientX, e.clientY);
    interaction.current = {
      type: "move",
      id: r.id,
      offsetX: x - r.x,
      offsetY: y - r.y,
    };
    onSelect(r.id);
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const startResize = (e: React.PointerEvent, r: Redaction) => {
    e.stopPropagation();
    containerRef.current?.focus();
    interaction.current = { type: "resize", id: r.id };
    onSelect(r.id);
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const act = interaction.current;
    if (!act) return;
    const { x, y } = pointToNorm(e.clientX, e.clientY);

    onChange(
      redactions.map((r) => {
        if (r.id !== act.id) return r;
        if (act.type === "create") {
          return {
            ...r,
            x: Math.min(act.startX, x),
            y: Math.min(act.startY, y),
            w: Math.abs(x - act.startX),
            h: Math.abs(y - act.startY),
          };
        }
        if (act.type === "move") {
          return {
            ...r,
            x: clamp01(Math.min(x - act.offsetX, 1 - r.w)),
            y: clamp01(Math.min(y - act.offsetY, 1 - r.h)),
          };
        }
        // resize
        return { ...r, w: clamp01(x - r.x), h: clamp01(y - r.y) };
      }),
    );
  };

  const endInteraction = () => {
    const act = interaction.current;
    interaction.current = null;
    if (!act) return;
    // Drop accidental tiny rectangles.
    onChange(
      redactions.filter((r) => r.id !== act.id || (r.w >= MIN_SIZE && r.h >= MIN_SIZE)),
    );
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
      e.preventDefault();
      onChange(redactions.filter((r) => r.id !== selectedId));
      onSelect(null);
    }
  };

  return (
    <div
      ref={viewportRef}
      className="flex h-full min-h-0 w-full min-w-0 items-center justify-center"
    >
      <div
        ref={containerRef}
        role="application"
        aria-label="Redaction canvas. Drag to hide personal information."
        tabIndex={0}
        onPointerDown={startCreate}
        onPointerMove={onMove}
        onPointerUp={endInteraction}
        onPointerCancel={endInteraction}
        onKeyDown={onKeyDown}
        style={size}
        className="bg-surface-variant focus-visible:outline-primary relative shrink-0 touch-none select-none focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <canvas
          ref={previewRef}
          width={source.width}
          height={source.height}
          aria-label="Screenshot with redactions applied"
          className="pointer-events-none block h-full w-full"
        />

        {redactions.map((r) => {
          const selected = r.id === selectedId;
          return (
            <div
              key={r.id}
              onPointerDown={(e) => startMove(e, r)}
              style={{
                left: `${r.x * 100}%`,
                top: `${r.y * 100}%`,
                width: `${r.w * 100}%`,
                height: `${r.h * 100}%`,
              }}
              className={cn(
                "absolute cursor-move",
                selected ? "ring-primary z-10 ring-2" : "ring-on-surface/40 ring-1",
              )}
            >
              {selected && (
                <span
                  onPointerDown={(e) => startResize(e, r)}
                  className="bg-primary absolute -right-1.5 -bottom-1.5 size-3 cursor-se-resize rounded-none"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
