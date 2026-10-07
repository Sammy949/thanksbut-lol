"use client";

import * as React from "react";
import Cropper, { type Area } from "react-easy-crop";
import { RotateCw, Loader2, Trash2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getCroppedCanvas,
  applyRedactions,
  canvasToCompressedFile,
  type Redaction,
  type RedactionMode,
} from "@/lib/image-editing";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RedactionEditor } from "./redaction-editor";

interface ImageEditorProps {
  file: File;
  onCancel: () => void;
  onComplete: (processed: File) => void;
  completeLabel?: string;
}

const ASPECTS: { label: string; value: number }[] = [
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
  { label: "16:9", value: 16 / 9 },
];

/**
 * Privacy editor: crop the screenshot, then hide personal info with blur/black
 * boxes. Everything is processed on-device; only the final File leaves the
 * browser. Deliberately two quick stages (crop → redact) for reliable touch +
 * pointer behaviour.
 */
export function ImageEditor({
  file,
  onCancel,
  onComplete,
  completeLabel = "Use screenshot",
}: ImageEditorProps) {
  // Create + revoke the object URL in one effect so its lifecycle matches the
  // effect's. (Creating it in useMemo and revoking in a separate effect breaks
  // under React StrictMode: the dev double-invoke revokes the still-in-use URL,
  // leaving the cropper pointed at a dead blob → blank image.)
  const [url, setUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    // Setting state here is the point: under StrictMode the second setup creates
    // a fresh URL and re-renders with it, so the cropper never sees a revoked
    // blob. Creating it during render (useMemo/lazy state) reintroduces the bug.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const [stage, setStage] = React.useState<"crop" | "redact">("crop");
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [aspect, setAspect] = React.useState(4 / 3);
  const [areaPixels, setAreaPixels] = React.useState<Area | null>(null);

  const [croppedCanvas, setCroppedCanvas] = React.useState<HTMLCanvasElement | null>(
    null,
  );
  const [redactions, setRedactions] = React.useState<Redaction[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const selected = redactions.find((r) => r.id === selectedId) ?? null;

  const goToRedact = async () => {
    if (!areaPixels || !url) return;
    setError(null);
    setBusy(true);
    try {
      const canvas = await getCroppedCanvas(url, areaPixels, rotation);
      setCroppedCanvas(canvas);
      // A new crop defines a new coordinate space; old boxes must not carry over.
      setRedactions([]);
      setSelectedId(null);
      setStage("redact");
    } catch {
      setError("Couldn’t process this screenshot. Try again, or choose another image.");
    } finally {
      setBusy(false);
    }
  };

  const setSelectedMode = (mode: RedactionMode) => {
    if (!selectedId) return;
    setRedactions((rs) => rs.map((r) => (r.id === selectedId ? { ...r, mode } : r)));
  };

  const finish = async () => {
    if (!croppedCanvas) return;
    setError(null);
    setBusy(true);
    try {
      const baked = applyRedactions(croppedCanvas, redactions);
      const processed = await canvasToCompressedFile(baked, file.name);
      onComplete(processed);
    } catch {
      setError("Couldn’t process this screenshot. Try again, or choose another image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-on-surface/60 fixed inset-0 z-[60] flex flex-col backdrop-blur-sm md:flex-row">
      {/* Stage / image — the Cropper positions itself absolute inset-0, so this
          relative parent is its sizing box. min-h-0 lets it shrink under flex. */}
      <div className="bg-surface-container-lowest relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4">
        {stage === "crop"
          ? url && (
              <Cropper
                image={url}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={(_, px) => setAreaPixels(px)}
                showGrid={false}
              />
            )
          : croppedCanvas && (
              <RedactionEditor
                source={croppedCanvas}
                redactions={redactions}
                onChange={setRedactions}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            )}
      </div>

      {/* Controls — capped + scrollable on mobile so the actions are always
          reachable; full-height rail on desktop. */}
      <aside className="bg-surface border-outline-variant flex max-h-[48vh] shrink-0 flex-col gap-5 overflow-y-auto border-t p-5 md:max-h-none md:w-80 md:border-t-0 md:border-l">
        <div className="flex items-center justify-between">
          <h2 className="text-headline-sm text-on-surface font-display">
            {stage === "crop" ? "Crop" : "Hide info"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            aria-label="Cancel editing"
            className="text-on-surface-variant hover:text-on-surface"
          >
            <X className="size-5" />
          </button>
        </div>

        {error && (
          <p role="alert" className="text-error font-mono text-sm">
            {error}
          </p>
        )}
        {stage === "crop" ? (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="zoom">Zoom</Label>
              <input
                id="zoom"
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="accent-primary w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Crop ratio</Label>
              <div className="flex flex-wrap gap-2">
                {ASPECTS.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => setAspect(a.value)}
                    className={cn(
                      "text-label-caps border px-3 py-1.5 font-mono uppercase",
                      aspect === a.value
                        ? "bg-on-surface text-surface border-on-surface"
                        : "border-outline-variant text-on-surface-variant",
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              shape="sheet"
              className="self-start"
              onClick={() => setRotation((r) => (r + 90) % 360)}
            >
              <RotateCw className="size-4" />
              Rotate
            </Button>

            <div className="mt-auto flex flex-col gap-2 pt-2">
              <Button
                shape="sheet"
                className="w-full"
                disabled={busy}
                onClick={goToRedact}
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                Continue to hide details
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-code-snippet text-on-surface-variant font-mono">
              Drag on the screenshot to cover names, emails, phone numbers, or IDs.
              Select a box to change it or delete it. Use a black box for details that
              must be fully covered. Changing the crop clears these boxes.
            </p>

            <div className="flex flex-col gap-2">
              <Label>Selected box</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!selected}
                  onClick={() => setSelectedMode("blur")}
                  className={cn(
                    "text-label-caps flex-1 border px-3 py-2 font-mono uppercase disabled:opacity-40",
                    selected?.mode === "blur"
                      ? "bg-on-surface text-surface border-on-surface"
                      : "border-outline-variant text-on-surface-variant",
                  )}
                >
                  Blur
                </button>
                <button
                  type="button"
                  disabled={!selected}
                  onClick={() => setSelectedMode("black")}
                  className={cn(
                    "text-label-caps flex-1 border px-3 py-2 font-mono uppercase disabled:opacity-40",
                    selected?.mode === "black"
                      ? "bg-on-surface text-surface border-on-surface"
                      : "border-outline-variant text-on-surface-variant",
                  )}
                >
                  Black box
                </button>
                <button
                  type="button"
                  disabled={!selected}
                  aria-label="Delete box"
                  onClick={() => {
                    setRedactions((rs) => rs.filter((r) => r.id !== selectedId));
                    setSelectedId(null);
                  }}
                  className="border-outline-variant text-on-surface-variant hover:text-primary flex size-9 items-center justify-center border disabled:opacity-40"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="self-start"
              disabled={!redactions.length}
              onClick={() => {
                setRedactions([]);
                setSelectedId(null);
              }}
            >
              Reset boxes
            </Button>

            <div className="mt-auto flex flex-col gap-2 pt-2">
              <Button shape="sheet" className="w-full" disabled={busy} onClick={finish}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                {completeLabel}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                disabled={busy}
                onClick={() => setStage("crop")}
              >
                Back to crop
              </Button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
