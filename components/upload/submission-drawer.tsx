"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { X, ArrowRight, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCreateArchive } from "@/hooks/use-create-archive";
import { submissionSchema, type SubmissionValues } from "@/lib/submission-schema";
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
  const [editingFile, setEditingFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const createArchive = useCreateArchive();

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

  const onSubmit = async (data: SubmissionValues) => {
    setSubmitting(true);
    try {
      const { id } = await createArchive({
        category: data.category,
        file: data.image,
        text: data.text || undefined,
        company: data.company || undefined,
        caption: data.caption || undefined,
        displayName: data.displayName || undefined,
      });
      setArchivedId(id);
      toast.success("Archived for the culture", {
        description: "Your rejection is now part of the wall.",
      });
    } catch (err) {
      const description =
        err instanceof ConvexError
          ? String(err.data)
          : err instanceof Error
            ? err.message
            : "Please try again.";
      toast.error("Couldn't archive that", { description });
    } finally {
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
              Submit a rejection artifact
            </DialogPrimitive.Title>

            {archivedId ? (
              <SubmissionSuccess
                id={archivedId}
                category={values.category}
                onView={() => handleOpenChange(false)}
                onShare={async () => {
                  const url = `${window.location.origin}/?a=${archivedId}`;
                  try {
                    await navigator.clipboard.writeText(url);
                    toast.success("Link copied", { description: url });
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
                      Submit Artifact
                    </h2>
                    <p className="text-body-md text-on-surface-variant font-body mt-0.5">
                      Archive your rejection for the culture.
                    </p>
                  </div>
                  <DialogPrimitive.Close className="text-outline hover:text-on-surface flex size-9 items-center justify-center rounded-none transition-colors">
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
                  <Button
                    shape="sheet"
                    className="w-full"
                    disabled={submitting}
                    onClick={form.handleSubmit(onSubmit, () =>
                      toast.error("Almost there", {
                        description:
                          "Add a screenshot or some rejection text first.",
                      }),
                    )}
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
                  setTab("preview");
                  toast.success("Screenshot ready", {
                    description: "Cropped and redacted. Review, then archive it.",
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
