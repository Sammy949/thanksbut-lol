"use client";

import * as React from "react";
import Image from "next/image";
import { type useForm, Controller } from "react-hook-form";
import { UploadCloud, ChevronDown, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { type SubmissionValues } from "@/lib/submission-schema";
import { CATEGORIES } from "@/constants/categories";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type SubmissionFormApi = ReturnType<typeof useForm<SubmissionValues>>;

interface ComposeFormProps {
  form: SubmissionFormApi;
  preview: string | null;
  onPickImage: (file: File | undefined) => void;
  showText: boolean;
  onRevealText: () => void;
}

/** The Compose tab: image-primary dropzone, text fallback, and metadata fields. */
export function ComposeForm({
  form,
  preview,
  onPickImage,
  showText,
  onRevealText,
}: ComposeFormProps) {
  const error = form.formState.errors.image?.message;

  return (
    <form className="flex flex-col gap-6">
      {/* Image dropzone — primary */}
      <div className="flex flex-col gap-2">
        {preview ? (
          <div className="border-outline-variant relative aspect-[4/3] w-full overflow-hidden rounded-xl border">
            <Image
              src={preview}
              alt="Screenshot preview"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => onPickImage(undefined)}
              className="bg-surface/80 text-on-surface absolute top-2 right-2 flex size-8 items-center justify-center rounded-full backdrop-blur-sm"
              aria-label="Remove screenshot"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ) : (
          <label className="border-outline-variant bg-surface-bright hover:bg-surface-container-low group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 text-center transition-colors">
            <div className="bg-surface-container border-outline-variant flex size-12 items-center justify-center rounded-full border transition-transform group-hover:scale-105">
              <UploadCloud className="text-on-surface-variant size-5" />
            </div>
            <div>
              <p className="text-body-md text-on-background font-body">
                Upload Screenshot
              </p>
              <p className="text-code-snippet text-secondary font-body mt-1">
                PNG, JPG up to 5MB
              </p>
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => onPickImage(e.target.files?.[0])}
            />
          </label>
        )}
        {error && <p className="text-code-snippet text-primary font-body">{error}</p>}

        {/* Text fallback — progressive reveal */}
        {showText ? (
          <Textarea
            rows={4}
            placeholder="Paste the crushing blow here…"
            className="mt-2"
            {...form.register("text")}
          />
        ) : (
          <button
            type="button"
            onClick={onRevealText}
            className="text-code-snippet text-secondary hover:text-on-surface font-body mt-1 inline-flex items-center gap-1 self-start"
          >
            no screenshot? add text
            <ChevronDown className="size-3.5" />
          </button>
        )}
      </div>

      <Field label="Company (optional)">
        <Input placeholder="e.g. Acme Corp" {...form.register("company")} />
      </Field>

      <div className="flex flex-col gap-3">
        <Label>Category</Label>
        <Controller
          control={form.control}
          name="category"
          render={({ field }) => (
            <ToggleGroup
              type="single"
              value={field.value}
              onValueChange={(v) => v && field.onChange(v)}
              className="flex-wrap gap-2"
            >
              {CATEGORIES.map((c) => (
                <ToggleGroupItem
                  key={c.value}
                  value={c.value}
                  className={cn(
                    "text-code-snippet rounded-full border px-4 py-2 font-mono",
                    "bg-surface-bright text-on-surface-variant border-outline-variant hover:border-outline",
                    "data-[state=on]:bg-on-surface data-[state=on]:text-surface data-[state=on]:border-on-surface",
                  )}
                >
                  {c.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        />
      </div>

      <Field label="Caption (optional)">
        <Textarea
          rows={2}
          placeholder="Context makes it art…"
          {...form.register("caption")}
        />
      </Field>

      <Field label="Display name (optional)">
        <Input
          placeholder="Stay anonymous, or sign it"
          {...form.register("displayName")}
        />
      </Field>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
