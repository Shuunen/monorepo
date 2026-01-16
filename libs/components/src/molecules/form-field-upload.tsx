import { camelToKebabCase, slugify } from "@monorepo/utils";
// oxlint-disable-next-line no-restricted-imports
import { CircleXIcon, FileCheckIcon, FileTextIcon, FileUpIcon, FileXIcon, RotateCcwIcon, TrashIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type ControllerRenderProps, useFormContext } from "react-hook-form";
import { Button } from "../atoms/button";
import { FormControl } from "../atoms/form";
import { Input } from "../atoms/input";
import { Progress } from "../atoms/progress";
import { cn } from "../shadcn/utils";
import { getFieldMetadataOrThrow } from "./auto-form.utils";
import { FormFieldBase, type FormFieldBaseProps } from "./form-field";
import { formatFileSize, maxPercent, uploadDurationFail, uploadDurationSuccess, uploadPercentFail } from "./form-field-upload.const";

type FormFieldUploadProps = FormFieldBaseProps & {
  accept?: string;
  onFileChange?: (file: File | undefined) => void;
  onFileUploadComplete?: (file: File) => void;
  onFileUploadError?: (error: string) => void;
  onFileRemove?: () => void;
  shouldFail?: boolean;
};

// oxlint-disable-next-line max-lines-per-function, max-statements
export function FormFieldUpload({ accept, fieldName, fieldSchema, isOptional, logger, readonly = false, shouldFail, onFileChange, onFileRemove, onFileUploadComplete, onFileUploadError }: FormFieldUploadProps) {
  const metadata = getFieldMetadataOrThrow(fieldName, fieldSchema);
  const { placeholder, state = "editable" } = metadata;
  const isDisabled = ["disabled", "readonly"].includes(state);
  const testId = camelToKebabCase(fieldName);
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [uploadProgress, setUploadProgress] = useState(0);
  const retryUpload = () => selectedFile && startUpload(selectedFile);
  const buttons = {
    cancel: { action: removeFile, icon: CircleXIcon, label: "Cancel" },
    remove: { action: removeFile, icon: TrashIcon, label: "Remove" },
    retry: { action: retryUpload, icon: RotateCcwIcon, label: "Retry" },
  };
  const [uploadState, setUploadState] = useState<UploadType>("idle");
  const sizeProgress = selectedFile?.size ? `(${formatFileSize(selectedFile.size * (uploadProgress / maxPercent))} / ${formatFileSize(selectedFile.size)})` : "";
  const states = {
    error: {
      // oxlint-disable-next-line no-nested-ternary
      buttons: isDisabled ? [] : uploadProgress === 0 ? [buttons.remove] : [buttons.retry, buttons.remove],
      icon: <FileXIcon className="size-5 text-destructive" />,
      message: `Uploading failed! ${sizeProgress}`,
    },
    idle: {
      buttons: [],
      icon: <FileTextIcon className="size-5 text-muted-foreground" />,
      message: "No file selected",
    },
    success: {
      buttons: isDisabled ? [] : [buttons.remove],
      icon: <FileCheckIcon className="size-5 text-success" />,
      message: `Uploading succeeded! ${sizeProgress}`,
    },
    uploading: {
      buttons: [buttons.cancel],
      icon: <FileUpIcon className="size-5 text-muted-foreground" />,
      message: `Uploading... ${sizeProgress}`,
    },
  } as const;
  type UploadType = keyof typeof states;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const idleNoFile = uploadState === "idle" && !selectedFile;
  const { watch } = useFormContext();
  const fieldValue = watch(fieldName);

  useEffect(() => {
    const currentValue = fieldValue as File | undefined;
    if (!currentValue) {
      return;
    }
    if (!currentValue.name) {
      return;
    }
    setSelectedFile(currentValue);
    setUploadState("success");
    setUploadProgress(maxPercent);
  }, [fieldValue]);

  // Cleanup on unmount
  useEffect(() => () => uploadIntervalRef.current && clearInterval(uploadIntervalRef.current), []);

  function resetUpload() {
    /* c8 ignore next 3 */
    // oxlint-disable-next-line no-unused-expressions
    uploadIntervalRef.current && clearInterval(uploadIntervalRef.current);
    setSelectedFile(undefined);
    setUploadState("idle");
    setUploadProgress(0);
    /* c8 ignore next */
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeFile(onChange: ControllerRenderProps["onChange"]) {
    resetUpload();
    /* c8 ignore next 2 */
    onFileChange?.(undefined);
    onFileRemove?.();
    onChange(undefined);
  }

  function startUpload(file: File) {
    const { success, error } = fieldSchema.safeParse(file);
    if (!success) {
      onFileUploadError?.(error.message);
      onFileChange?.(file);
      setUploadState("error");
      return;
    }

    setUploadState("uploading");
    setUploadProgress(0);

    const uploadDuration = shouldFail ? uploadDurationFail : uploadDurationSuccess;
    const interval = 50;
    const increment = (maxPercent / uploadDuration) * interval;

    uploadIntervalRef.current = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = Math.min(prev + increment, maxPercent);
        if (newProgress >= maxPercent) {
          clearInterval(uploadIntervalRef.current);
          setUploadState("success");
          onFileUploadComplete?.(file);
          return maxPercent;
        }
        if (shouldFail && newProgress >= uploadPercentFail) {
          clearInterval(uploadIntervalRef.current);
          setUploadState("error");
          /* c8 ignore next */
          onFileUploadError?.("Upload failed");
          return newProgress;
        }
        return newProgress;
      });
    }, interval);
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>, onChange: (value: File) => void) {
    const file = event.target.files?.[0];
    /* c8 ignore next 3 */
    if (!file) {
      return;
    }

    setSelectedFile(file);
    onChange(file);
    onFileChange?.(file);
    startUpload(file);
  }

  const currentState = states[uploadState];
  const stateTestId = `upload-${uploadState}`;
  const props = { fieldName, fieldSchema, isOptional, logger, readonly };

  return (
    <FormFieldBase {...props}>
      {/* oxlint-disable-next-line max-lines-per-function */}
      {({ field }) => (
        <FormControl>
          {idleNoFile ? (
            <Input accept={accept} disabled={isDisabled} name={`${testId}-${stateTestId}`} onChange={event => handleFileSelect(event, field.onChange)} placeholder={placeholder || currentState.message} ref={fileInputRef} type="file" />
          ) : (
            <div className="flex gap-3 overflow-hidden rounded-md border border-input bg-background p-3" data-testid={`${testId}-${stateTestId}`}>
              <aside className="mt-0.5">{currentState.icon}</aside>
              <main className="flex max-w-full grow flex-col gap-1 overflow-hidden">
                <div className="flex justify-between gap-3">
                  <div className={cn("flex flex-col gap-1", { "max-w-[calc(100%-100px)]": !isDisabled })}>
                    <div className="truncate text-sm font-medium">{selectedFile?.name}</div>
                    <div className="truncate text-sm text-muted-foreground">{currentState.message}</div>
                  </div>

                  <div className="flex">
                    {currentState.buttons.map(button => (
                      <Button key={`button-${button.label}`} name={`upload-action-${slugify(button.label)}`} onClick={() => button.action(field.onChange)} size="sm" title={button.label} variant="ghost">
                        {button.label}
                        <button.icon className="size-4" />
                      </Button>
                    ))}
                  </div>
                </div>

                {uploadState !== "idle" && (
                  <div className="flex items-center">
                    <Progress className={cn("h-1 flex-1", uploadState === "success" && "[&>div]:bg-success", uploadState === "error" && "[&>div]:bg-destructive")} value={uploadProgress} />
                    <span className={cn("min-w-12 text-right text-sm font-medium", uploadState === "success" && "text-success", uploadState === "error" && "text-destructive")}>{Math.round(uploadProgress)}%</span>
                  </div>
                )}
              </main>
            </div>
          )}
        </FormControl>
      )}
    </FormFieldBase>
  );
}
