"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  X,
  UploadCloud,
  ArrowRight,
  ChevronDown,
  Shield,
  BadgeCheck,
  Globe,
  Heart,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { submissionSchema, type SubmissionValues } from "@/lib/submission-schema";
import { CATEGORIES } from "@/constants/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StampMark } from "@/components/archive/stamp-mark";

interface SubmissionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubmissionDrawer({ open, onOpenChange }: SubmissionDrawerProps) {
  const [tab, setTab] = React.useState("compose");
  const [showText, setShowText] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [archivedId, setArchivedId] = React.useState<string | null>(null);

  const form = useForm<SubmissionValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      category: "job",
      company: "",
      text: "",
      caption: "",
      displayName: "",
    },
    mode: "onSubmit",
  });

  const values = form.watch();

  const resetAll = React.useCallback(() => {
    form.reset({
      category: "job",
      company: "",
      text: "",
      caption: "",
      displayName: "",
    });
    setTab("compose");
    setShowText(false);
    setPreview((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
    setArchivedId(null);
  }, [form]);

  const handleOpenChange = (next: boolean) => {
    if (!next) resetAll();
    onOpenChange(next);
  };

  const onPickImage = (file: File | undefined) => {
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return file ? URL.createObjectURL(file) : null;
    });
    form.setValue("image", file, { shouldValidate: true });
  };

  const onSubmit = (data: SubmissionValues) => {
    // UI phase: no real upload. Simulate archiving and show the success state.
    void data;
    setArchivedId(`#REJ-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="bg-ink-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            "bg-surface-container-lowest data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2 md:data-[state=open]:slide-in-from-right-2 fixed inset-x-0 bottom-0 z-50 flex h-[92vh] max-h-[860px] flex-col rounded-t-[1.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] duration-300",
            "md:inset-y-0 md:right-0 md:left-auto md:h-full md:max-h-none md:w-[440px] md:rounded-none md:border-l md:shadow-[-10px_0_40px_rgba(0,0,0,0.1)]",
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            Submit a rejection artifact
          </DialogPrimitive.Title>

          {archivedId ? (
            <SuccessView
              id={archivedId}
              category={values.category}
              onView={() => handleOpenChange(false)}
              onShare={() =>
                toast.success("Link copied", {
                  description: "Share your rejection with the world.",
                })
              }
            />
          ) : (
            <>
              {/* Drag handle (mobile) */}
              <div className="flex justify-center pt-3 pb-1 md:hidden">
                <div className="bg-outline-variant h-1.5 w-12 rounded-full" />
              </div>

              <div className="border-gallery-gray flex items-center justify-between border-b px-5 py-4">
                <div>
                  <h2 className="text-headline-md text-on-surface font-display">
                    Submit Artifact
                  </h2>
                  <p className="text-body-md text-on-surface-variant font-body mt-0.5">
                    Archive your rejection for the culture.
                  </p>
                </div>
                <DialogPrimitive.Close className="text-outline hover:text-on-surface flex size-9 items-center justify-center rounded-full transition-colors">
                  <X className="size-5" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              </div>

              <Tabs
                value={tab}
                onValueChange={setTab}
                className="flex min-h-0 flex-1 flex-col"
              >
                <TabsList className="px-5">
                  <TabsTrigger value="compose">Compose</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
                </TabsList>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
                  <TabsContent value="compose">
                    <ComposeForm
                      form={form}
                      preview={preview}
                      onPickImage={onPickImage}
                      showText={showText}
                      onRevealText={() => setShowText(true)}
                    />
                  </TabsContent>
                  <TabsContent value="preview">
                    <PreviewCard values={values} preview={preview} />
                  </TabsContent>
                  <TabsContent value="guidelines">
                    <Guidelines />
                  </TabsContent>
                </div>
              </Tabs>

              <div className="border-gallery-gray border-t p-5">
                <Button
                  shape="sheet"
                  className="w-full"
                  onClick={form.handleSubmit(onSubmit)}
                >
                  Archive Yours
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/* -------------------------------------------------------------------------- */

type FormApi = ReturnType<typeof useForm<SubmissionValues>>;

function ComposeForm({
  form,
  preview,
  onPickImage,
  showText,
  onRevealText,
}: {
  form: FormApi;
  preview: string | null;
  onPickImage: (file: File | undefined) => void;
  showText: boolean;
  onRevealText: () => void;
}) {
  const error = form.formState.errors.image?.message;

  return (
    <form className="flex flex-col gap-6">
      {/* Image dropzone — primary */}
      <div className="flex flex-col gap-2">
        {preview ? (
          <div className="border-gallery-gray relative aspect-[4/3] w-full overflow-hidden rounded-xl border">
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
            <div className="bg-surface-container border-gallery-gray flex size-12 items-center justify-center rounded-full border transition-transform group-hover:scale-105">
              <UploadCloud className="text-on-surface-variant size-5" />
            </div>
            <div>
              <p className="text-body-md text-on-background font-body">
                Upload Screenshot
              </p>
              <p className="text-meta-data text-muted-type mt-1 font-mono">
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
        {error && (
          <p className="text-meta-data text-rejection-red font-mono">{error}</p>
        )}

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
            className="text-meta-data text-muted-type hover:text-on-surface mt-1 inline-flex items-center gap-1 self-start font-mono"
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
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const active = field.value === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => field.onChange(c.value)}
                    aria-pressed={active}
                    className={cn(
                      "text-meta-data rounded-full border px-4 py-2 font-mono transition-colors",
                      active
                        ? "bg-ink-black text-paper-white border-ink-black"
                        : "bg-surface-bright text-on-surface-variant border-gallery-gray hover:border-outline",
                    )}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
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

/* -------------------------------------------------------------------------- */

const CATEGORY_LABEL = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label]),
) as Record<SubmissionValues["category"], string>;

function PreviewCard({
  values,
  preview,
}: {
  values: SubmissionValues;
  preview: string | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-label-caps text-muted-type text-center font-mono uppercase">
        Artifact Preview
      </p>
      <article className="bg-paper-white border-gallery-gray flex flex-col gap-4 rounded-xl border p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="text-headline-md text-ink-black font-display">
            {values.company || "Anonymous"}
          </span>
          <Badge variant="outline">{CATEGORY_LABEL[values.category]}</Badge>
        </div>
        {preview && (
          <div className="bg-surface-variant relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            <Image src={preview} alt="" fill className="object-cover grayscale" />
          </div>
        )}
        {values.text && (
          <p className="text-body-md text-muted-type font-body italic">
            &ldquo;{values.text}&rdquo;
          </p>
        )}
        {values.caption && (
          <p className="text-body-md text-on-surface-variant font-body">
            {values.caption}
          </p>
        )}
        <div className="border-gallery-gray flex items-center justify-between border-t pt-4">
          <span className="text-meta-data text-muted-type font-mono">Just now</span>
          <span className="text-meta-data text-muted-type font-mono">🥲 0</span>
        </div>
      </article>
      <p className="text-body-md text-muted-type font-body px-4 text-center">
        This is how your rejection will appear in the archive. Ready to share the
        hustle?
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const GUIDELINES = [
  {
    icon: Shield,
    title: "Privacy First",
    body: "Scrub any personal info (names, emails, phones) from your screenshots. We love rejection, not doxxing.",
  },
  {
    icon: BadgeCheck,
    title: "Real Rejections Only",
    body: "Keep it authentic. The internet's hustle is more interesting than fiction.",
  },
  {
    icon: Globe,
    title: "All Industries Welcome",
    body: "Tech, art, academia, dating—if it's a 'no', it's art.",
  },
  {
    icon: Heart,
    title: "Keep it Classy",
    body: "We celebrate the hustle. No hate speech or harassment.",
  },
];

function Guidelines() {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-headline-md text-on-surface font-display text-center">
        Submission Guidelines
      </h3>
      <ul className="flex flex-col gap-5">
        {GUIDELINES.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-3">
            <Icon className="text-on-surface mt-0.5 size-5 shrink-0" />
            <div>
              <p className="text-body-md text-on-surface font-body font-semibold">
                {title}
              </p>
              <p className="text-body-md text-on-surface-variant font-body">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function SuccessView({
  id,
  category,
  onView,
  onShare,
}: {
  id: string;
  category: SubmissionValues["category"];
  onView: () => void;
  onShare: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex items-center justify-between">
        <DialogPrimitive.Close className="text-on-surface flex size-9 items-center justify-center rounded-full">
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <h2 className="text-headline-lg-mobile text-primary font-display">
          Archived for the culture.
        </h2>
        <p className="text-body-lg text-on-surface-variant font-display italic">
          Your artifact is now part of the internet&apos;s history.
        </p>
      </div>

      <div className="border-primary/40 relative mt-8 flex-1 overflow-hidden rounded-2xl border p-6">
        <div className="flex items-center justify-between">
          <span className="text-meta-data text-on-surface font-mono">ID: {id}</span>
          <Badge variant="solid">{CATEGORY_LABEL[category]}</Badge>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <div className="bg-surface-container-high h-3 w-2/3 rounded-full" />
          <div className="bg-surface-container-high h-3 w-full rounded-full" />
          <div className="bg-surface-container-high h-3 w-5/6 rounded-full" />
          <div className="bg-surface-container-high h-3 w-1/2 rounded-full" />
        </div>
        <div className="mt-8 flex justify-center">
          <StampMark label="Archived" className="text-headline-lg-mobile" />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Button variant="accent" shape="sheet" className="w-full" onClick={onView}>
          View in Archive
        </Button>
        <Button variant="secondary" shape="sheet" className="w-full" onClick={onShare}>
          Share this Rejection
        </Button>
      </div>
    </div>
  );
}
