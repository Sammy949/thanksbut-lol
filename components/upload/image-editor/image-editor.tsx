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
export function ImageEditor({ file, onCancel, onComplete }: ImageEditorProps) {
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

  const croppedCanvas = React.useRef<HTMLCanvasElement | null>(null);
  const [croppedUrl, setCroppedUrl] = React.useState<string | null>(null);
  const [redactions, setRedactions] = React.useState<Redaction[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const selected = redactions.find((r) => r.id === selectedId) ?? null;

  const goToRedact = async () => {
    if (!areaPixels || !url) return;
    setBusy(true);
    try {
      const canvas = await getCroppedCanvas(url, areaPixels, rotation);
      croppedCanvas.current = canvas;
      setCroppedUrl(canvas.toDataURL("image/jpeg", 0.92));
      setStage("redact");
    } finally {
      setBusy(false);
    }
  };

  const setSelectedMode = (mode: RedactionMode) => {
    if (!selectedId) return;
    setRedactions((rs) => rs.map((r) => (r.id === selectedId ? { ...r, mode } : r)));
  };

  const finish = async () => {
    if (!croppedCanvas.current) return;
    setBusy(true);
    try {
      const baked = applyRedactions(croppedCanvas.current, redactions);
      const processed = await canvasToCompressedFile(baked, file.name);
      onComplete(processed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-on-surface/60 fixed inset-0 z-[60] flex flex-col backdrop-blur-sm md:flex-row">
      {/* Stage / image */}
      <div className="bg-surface-container-lowest relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4">
        {stage === "crop" ? (
          <div className="relative h-full min-h-[50vh] w-full">
            {url && (
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
            )}
          </div>
        ) : (
          croppedUrl && (
            <RedactionEditor
              src={croppedUrl}
              redactions={redactions}
              onChange={setRedactions}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )
        )}
      </div>

      {/* Controls */}
      <aside className="bg-surface border-outline-variant flex shrink-0 flex-col gap-5 border-t p-5 md:w-80 md:border-t-0 md:border-l">
        <div className="flex items-center justify-between">
          <h2 className="text-headline-sm text-on-surface font-display">
            {stage === "crop" ? "Crop" : "Hide info"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel editing"
            className="text-on-surface-variant hover:text-on-surface"
          >
            <X className="size-5" />
          </button>
        </div>

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
              <Label>Aspect</Label>
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
                Continue
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-code-snippet text-on-surface-variant font-mono">
              Drag on the screenshot to cover names, emails, phone numbers, or IDs.
              Select a box to switch it between blur and black, or delete it.
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
                  Black
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
                Continue
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
