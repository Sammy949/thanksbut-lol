"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { X, ArrowRight, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useArchiveSubmission } from "@/hooks/use-create-archive";
import { submissionSchema, type SubmissionValues } from "@/lib/submission-schema";
import type { ArchiveImage } from "@/types/archive";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ComposeForm } from "./compose-form";
import { ArtifactPreview } from "./artifact-preview";
import { SubmissionGuidelines } from "./submission-guidelines";
import { SubmissionSuccess } from "./submission-success";
import { ImageEditor } from "./image-editor/image-editor";

const DEFAULTS: SubmissionValues = {
  category: "job",
  company: "",
  text: "",
  caption: "",
  displayName: "",
};

interface SubmissionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubmissionDrawer({ open, onOpenChange }: SubmissionDrawerProps) {
  const [tab, setTab] = React.useState("compose");
  const [showText, setShowText] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [archivedId, setArchivedId] = React.useState<string | null>(null);
  const [manageToken, setManageToken] = React.useState<string | null>(null);
  const [editingFile, setEditingFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [slowArchive, setSlowArchive] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const { uploadImage, createArchive } = useArchiveSubmission();
  // A completed upload is retained for retry if publication fails.
  const uploadRef = React.useRef<{ file: File; image: ArchiveImage } | null>(null);
  const submittingRef = React.useRef(false);

  const form = useForm<SubmissionValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: DEFAULTS,
    mode: "onSubmit",
  });

  const values = useWatch({ control: form.control }) as SubmissionValues;

  const resetAll = React.useCallback(() => {
    form.reset(DEFAULTS);
    setTab("compose");
    setShowText(false);
    setPreview((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
    setArchivedId(null);
    setManageToken(null);
    uploadRef.current = null;
    setUploading(false);
  }, [form]);

  const handleOpenChange = (next: boolean) => {
    if (!next && submittingRef.current) return;
    if (!next) resetAll();
    onOpenChange(next);
  };

  const onPickImage = (file: File | undefined) => {
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return file ? URL.createObjectURL(file) : null;
    });
    form.setValue("image", file, { shouldValidate: true });
    // A removed screenshot must not reuse a previously completed upload.
    if (!file) {
      uploadRef.current = null;
      setUploading(false);
    }
  };

  const onSubmit = async (data: SubmissionValues) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSlowArchive(false);
    // Elapsed time alone does not establish a cause or guarantee completion.
    const slowTimer = setTimeout(() => setSlowArchive(true), 7000);
    try {
      let image: ArchiveImage | undefined;
      if (data.image) {
        if (uploadRef.current?.file === data.image) image = uploadRef.current.image;
        else {
          setUploading(true);
          image = await uploadImage(data.image);
          uploadRef.current = { file: data.image, image };
          setUploading(false);
        }
      }

      const created = await createArchive({
        category: data.category,
        ...(image ? { image } : {}),
        ...(data.text ? { text: data.text } : {}),
        ...(data.company ? { company: data.company } : {}),
        ...(data.caption ? { caption: data.caption } : {}),
        ...(data.displayName ? { displayName: data.displayName } : {}),
      });
      form.reset(data);
      setArchivedId(created.id);
      setManageToken(created.manageToken);
      toast.success("Archived for the culture", {
        description: "Your rejection is now part of the wall.",
      });
    } catch (error) {
      if (error instanceof ConvexError && String(error.data).includes("expired")) {
        setTab("compose");
        uploadRef.current = null;
        form.setError("image", {
          message: "This upload expired. Remove the screenshot and choose it again.",
        });
      }
      toast.error("Couldn't publish your submission", {
        description:
          "Your submission is still here. Check your connection and try again.",
      });
    } finally {
      clearTimeout(slowTimer);
      setSlowArchive(false);
      setUploading(false);
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <>
      <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="bg-on-surface/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-sm" />
          <DialogPrimitive.Content
            // The image editor is a full-screen overlay rendered outside this
            // dialog. While it's open, ignore "interact outside" / Escape so
            // editing the screenshot doesn't silently dismiss the drawer.
            onInteractOutside={(e) => {
              if (editingFile) e.preventDefault();
            }}
            onEscapeKeyDown={(e) => {
              if (editingFile) e.preventDefault();
            }}
            className={cn(
              "bg-surface-container-lowest data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2 md:data-[state=open]:slide-in-from-right-2 fixed inset-x-0 bottom-0 z-50 flex h-[92vh] max-h-[860px] flex-col rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.15)] duration-300",
              "md:inset-y-0 md:right-0 md:left-auto md:h-full md:max-h-none md:w-[560px] md:rounded-none md:border-l md:shadow-[-10px_0_40px_rgba(0,0,0,0.1)]",
            )}
          >
            <DialogPrimitive.Title className="sr-only">
              Submit a rejection
            </DialogPrimitive.Title>

            {archivedId ? (
              <SubmissionSuccess
                id={archivedId}
                manageToken={manageToken}
                values={values}
                preview={preview}
                onView={() => {
                  handleOpenChange(false);
                  window.location.assign(`/?a=${archivedId}`);
                }}
                onShare={async () => {
                  const url = `${window.location.origin}/?a=${archivedId}`;
                  try {
                    await navigator.clipboard.writeText(url);
                    toast.success("Link copied", {
                      description: "Public link copied.",
                    });
                  } catch {
                    toast.error("Couldn't copy the link", {
                      description: "Copy it manually: " + url,
                    });
                  }
                }}
              />
            ) : (
              <>
                {/* Drag handle (mobile) */}
                <div className="flex justify-center pt-3 pb-1 md:hidden">
                  <div className="bg-outline-variant h-1.5 w-12 rounded-none" />
                </div>

                <div className="flex items-start justify-between px-5 py-4">
                  <div>
                    <h2 className="text-headline-md text-on-surface font-display">
                      Submit a rejection
                    </h2>
                    <p className="text-body-md text-on-surface-variant font-body mt-0.5">
                      No account needed. Your submission will be public.
                    </p>
                  </div>
                  <DialogPrimitive.Close
                    disabled={submitting}
                    className="text-outline hover:text-on-surface flex size-9 items-center justify-center rounded-none transition-colors"
                  >
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
                        onEditImage={setEditingFile}
                        showText={showText}
                        onRevealText={() => setShowText(true)}
                      />
                    </TabsContent>
                    <TabsContent value="preview">
                      <ArtifactPreview values={values} preview={preview} />
                    </TabsContent>
                    <TabsContent value="guidelines">
                      <SubmissionGuidelines />
                    </TabsContent>
                  </div>
                </Tabs>

                <div className="border-outline-variant border-t p-5">
                  <p className="text-code-snippet text-secondary mb-3 font-mono">
                    Check screenshots, text, and captions for personal details. Archive
                    Yours uploads your screenshot and publishes your submission.
                  </p>
                  <Button
                    shape="sheet"
                    className="w-full"
                    disabled={submitting}
                    onClick={() =>
                      form.handleSubmit(onSubmit, (errors) => {
                        setTab("compose");
                        if (errors.text) setShowText(true);
                        toast.error("Check your submission", {
                          description: "Fix the highlighted fields, then try again.",
                        });
                        const field = (
                          ["text", "company", "caption", "displayName"] as const
                        ).find((name) => errors[name]);
                        if (field) requestAnimationFrame(() => form.setFocus(field));
                      })()
                    }
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Archiving…
                      </>
                    ) : (
                      <>
                        Archive Yours
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* Uploading overlay — blocks the form and shows clear progress so
                the upload+archive round-trip never feels broken or lets the user
                double-submit. */}
            {submitting && (
              <div className="bg-surface-container-lowest/95 absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 px-8 text-center backdrop-blur-sm">
                <Loader2 className="text-primary size-10 animate-spin" />
                <div>
                  <p className="text-headline-sm text-on-surface font-display">
                    {uploading ? "Uploading screenshot…" : "Archiving…"}
                  </p>
                  <p className="text-code-snippet text-on-surface-variant mt-1 font-mono">
                    {uploading
                      ? "Big screenshots can take a few seconds."
                      : slowArchive
                        ? "This is taking longer than usual. Your submission is still pending."
                        : "Publishing your submission."}
                  </p>
                </div>
              </div>
            )}

            {/* Rendered INSIDE the dialog content (it's `fixed inset-0`, so it
                still fills the screen) so it lives in the dialog's focus scope —
                otherwise Radix's focus trap makes the editor inert. */}
            {editingFile && (
              <ImageEditor
                file={editingFile}
                onCancel={() => setEditingFile(null)}
                onComplete={(processed) => {
                  onPickImage(processed);
                  setEditingFile(null);
                  setTab("compose"); // back to compose so they can add a detail or two
                  toast.success("Screenshot ready", {
                    description: "Review your submission, then choose Archive Yours.",
                  });
                }}
              />
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
