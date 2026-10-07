"use client";

import * as React from "react";
import { type useForm, Controller } from "react-hook-form";
import { UploadCloud, ChevronDown, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { imageFileSchema, type SubmissionValues } from "@/lib/submission-schema";
import { CATEGORIES } from "@/constants/categories";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type SubmissionFormApi = ReturnType<typeof useForm<SubmissionValues>>;

interface ComposeFormProps {
  form: SubmissionFormApi;
  preview: string | null;
  /** Remove the current image (and reset). */
  onPickImage: (file: File | undefined) => void;
  /** A freshly chosen screenshot — opens the privacy editor before upload. */
  onEditImage: (file: File) => void;
  showText: boolean;
  onRevealText: () => void;
}

/** The Compose tab: image-primary dropzone, text fallback, and metadata fields. */
export function ComposeForm({
  form,
  preview,
  onPickImage,
  onEditImage,
  showText,
  onRevealText,
}: ComposeFormProps) {
  const error = form.formState.errors.image?.message;
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <form className="flex flex-col gap-6">
      {/* Image dropzone — primary */}
      <div className="flex flex-col gap-2">
        {preview ? (
          <div className="border-outline-variant relative w-full overflow-hidden rounded-none border">
            {/* eslint-disable-next-line @next/next/no-img-element -- local full-ratio screenshot */}
            <img
              src={preview}
              alt="Screenshot preview"
              className="max-h-80 w-full object-contain"
            />
            <button
              type="button"
              onClick={() => onPickImage(undefined)}
              className="bg-surface/80 text-on-surface absolute top-2 right-2 flex size-8 items-center justify-center rounded-none backdrop-blur-sm"
              aria-label="Remove screenshot"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              aria-describedby={error ? "image-error" : undefined}
              onClick={() => fileInputRef.current?.click()}
              className="border-outline-variant bg-surface-bright hover:bg-surface-container-low group flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-none border-2 border-dashed p-8 text-center transition-colors"
            >
              <div className="bg-surface-container border-outline-variant flex size-12 items-center justify-center rounded-none border transition-transform group-hover:scale-105">
                <UploadCloud className="text-on-surface-variant size-5" />
              </div>
              <div>
                <p className="text-body-md text-on-background font-body">
                  Choose screenshot
                </p>
                <p className="text-code-snippet text-secondary font-body mt-1">
                  PNG, JPG, or WebP up to 8MB
                </p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) {
                  const checked = imageFileSchema.safeParse(file);
                  if (!checked.success)
                    form.setError("image", {
                      message: checked.error.issues[0].message,
                    });
                  else {
                    form.clearErrors("image");
                    onEditImage(file);
                  }
                }
              }}
            />
          </>
        )}
        {error && (
          <p
            id="image-error"
            role="alert"
            className="text-code-snippet text-primary font-body"
          >
            {error}
          </p>
        )}

        {/* Text fallback — progressive reveal */}
        {showText ? (
          <Field
            name="text"
            label="Rejection text"
            error={form.formState.errors.text?.message}
          >
            <Textarea
              id="text"
              aria-invalid={Boolean(form.formState.errors.text)}
              aria-describedby={form.formState.errors.text ? "text-error" : undefined}
              rows={4}
              placeholder="Paste the rejection email"
              className="mt-2"
              {...form.register("text")}
            />
          </Field>
        ) : (
          <button
            type="button"
            onClick={onRevealText}
            className="text-code-snippet text-secondary hover:text-on-surface font-body mt-1 inline-flex items-center gap-1 self-start"
          >
            Paste text instead
            <ChevronDown className="size-3.5" />
          </button>
        )}
      </div>

      <Field
        name="company"
        label="Organisation (optional)"
        error={form.formState.errors.company?.message}
      >
        <Input
          placeholder="Company, university, or organisation"
          id="company"
          aria-invalid={Boolean(form.formState.errors.company)}
          aria-describedby={form.formState.errors.company ? "company-error" : undefined}
          {...form.register("company")}
        />
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
                    "text-code-snippet rounded-none border px-4 py-2 font-mono",
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

      <Field
        name="caption"
        label="Caption (optional)"
        error={form.formState.errors.caption?.message}
      >
        <Textarea
          rows={2}
          placeholder="Add context, if you’d like"
          id="caption"
          aria-invalid={Boolean(form.formState.errors.caption)}
          aria-describedby={form.formState.errors.caption ? "caption-error" : undefined}
          {...form.register("caption")}
        />
      </Field>

      <Field
        name="displayName"
        label="Display name (optional)"
        error={form.formState.errors.displayName?.message}
      >
        <Input
          placeholder="Leave blank to post without a name"
          id="displayName"
          aria-invalid={Boolean(form.formState.errors.displayName)}
          aria-describedby={
            form.formState.errors.displayName ? "displayName-error" : undefined
          }
          {...form.register("displayName")}
        />
      </Field>
    </form>
  );
}

function Field({
  name,
  label,
  error,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error && (
        <p id={`${name}-error`} role="alert" className="text-error font-body text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
