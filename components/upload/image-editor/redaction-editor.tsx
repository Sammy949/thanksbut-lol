"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { Redaction } from "@/lib/image-editing";

interface RedactionEditorProps {
  src: string;
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
  src,
  redactions,
  onChange,
  selectedId,
  onSelect,
}: RedactionEditorProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const interaction = React.useRef<Interaction | null>(null);

  const pointToNorm = (clientX: number, clientY: number) => {
    const box = containerRef.current?.getBoundingClientRect();
    if (!box) return { x: 0, y: 0 };
    return {
      x: clamp01((clientX - box.left) / box.width),
      y: clamp01((clientY - box.top) / box.height),
    };
  };

  const startCreate = (e: React.PointerEvent) => {
    if (e.target !== e.currentTarget) return; // only on empty canvas
    const { x, y } = pointToNorm(e.clientX, e.clientY);
    const id = crypto.randomUUID();
    interaction.current = { type: "create", id, startX: x, startY: y };
    onChange([...redactions, { id, x, y, w: 0, h: 0, mode: "blur" }]);
    onSelect(id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const startMove = (e: React.PointerEvent, r: Redaction) => {
    e.stopPropagation();
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
      ref={containerRef}
      role="application"
      aria-label="Redaction canvas. Drag to hide personal information."
      tabIndex={0}
      onPointerDown={startCreate}
      onPointerMove={onMove}
      onPointerUp={endInteraction}
      onPointerCancel={endInteraction}
      onKeyDown={onKeyDown}
      className="bg-surface-variant relative max-h-[60vh] w-full touch-none overflow-hidden select-none focus:outline-none"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Screenshot to redact"
        className="pointer-events-none block max-h-[60vh] w-full object-contain"
        draggable={false}
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
              r.mode === "black" ? "bg-black" : "bg-surface/10 backdrop-blur-md",
              selected ? "ring-primary z-10 ring-2" : "ring-on-surface/40 ring-1",
            )}
          >
            {selected && (
              <span
                onPointerDown={(e) => startResize(e, r)}
                className="bg-primary absolute -right-1.5 -bottom-1.5 size-3 cursor-se-resize rounded-[1px]"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
