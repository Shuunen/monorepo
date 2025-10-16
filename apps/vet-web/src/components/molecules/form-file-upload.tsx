import { Button, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Progress } from '@monorepo/components'
import { cn, slugify } from '@monorepo/utils'
// oxlint-disable-next-line no-restricted-imports
import { CircleXIcon, FileCheckIcon, FileTextIcon, FileUpIcon, FileXIcon, RotateCcwIcon, TrashIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FieldValues, Path } from 'react-hook-form'
import type { ZodType } from 'zod/v4'
import type { FieldBaseProps } from '../../utils/form.types'
import { formatFileSize, maxPercent, uploadDurationFail, uploadDurationSuccess, uploadPercentFail } from './form-file-upload.utils'

type Props<TypeFieldValues extends FieldValues> = {
  accept: string
  onFileChange?: (file: File | undefined) => void
  onFileUploadComplete?: (file: File) => void
  onFileUploadError?: (error: string) => void
  onFileRemove?: () => void
  schema?: ZodType
  shouldFail?: boolean
} & FieldBaseProps<TypeFieldValues>

// oxlint-disable-next-line max-lines-per-function
export function FormFileUpload<TypeFieldValues extends FieldValues>({ accept, form, testId: id, label, name, onFileChange, onFileRemove, onFileUploadComplete, onFileUploadError, schema, shouldFail }: Props<TypeFieldValues>) {
  const [selectedFile, setSelectedFile] = useState<File | undefined>()
  const [uploadProgress, setUploadProgress] = useState(0)
  const retryUpload = () => selectedFile && startUpload(selectedFile)
  const buttons = {
    cancel: { action: removeFile, icon: CircleXIcon, label: 'Cancel' },
    remove: { action: removeFile, icon: TrashIcon, label: 'Remove' },
    retry: { action: retryUpload, icon: RotateCcwIcon, label: 'Retry' },
  }
  const [uploadState, setUploadState] = useState<UploadType>('idle')
  const sizeProgress = selectedFile?.size // eslint-disable-next-line no-irregular-whitespace
    ? `(${formatFileSize(selectedFile.size * (uploadProgress / maxPercent))} / ${formatFileSize(selectedFile.size)})`
    : ''
  const states = {
    error: {
      buttons: uploadProgress === 0 ? [buttons.remove] : [buttons.retry, buttons.remove],
      icon: <FileXIcon className="size-5 text-destructive" />,
      message: `Uploading failed! ${sizeProgress}`,
    },
    idle: {
      buttons: [],
      icon: <FileTextIcon className="size-5 text-muted-foreground" />,
      message: 'No file selected',
    },
    success: {
      buttons: [buttons.remove],
      icon: <FileCheckIcon className="size-5 text-success" />,
      message: `Uploading succeeded! ${sizeProgress}`,
    },
    uploading: {
      buttons: [buttons.cancel],
      icon: <FileUpIcon className="size-5 text-muted-foreground" />,
      message: `Uploading... ${sizeProgress}`,
    },
  } as const
  type UploadType = keyof typeof states
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const value = form.watch(name as Path<TypeFieldValues>)
  const idleNoFile = uploadState === 'idle' && !selectedFile

  // biome-ignore lint/correctness/useExhaustiveDependencies: cannot add removeFile to the dependency array as it would cause an infinite loop
  useEffect(() => {
    if (!value) return
    if (!value.name) {
      // when a File instance is persisted to LS, it is converted to an object and loses name and size properties so we need to reset the upload
      // this won't be an issue anymore once we switch to a more robust file handling solution, like uploading to a server and getting a ressource id back that we can store in LS
      removeFile()
      return
    }
    setSelectedFile(value)
    setUploadState('success')
    setUploadProgress(maxPercent)
  }, [value])

  // Cleanup on unmount
  useEffect(() => () => uploadIntervalRef.current && clearInterval(uploadIntervalRef.current), [])

  function resetUpload() {
    /* c8 ignore next 3 */
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    uploadIntervalRef.current && clearInterval(uploadIntervalRef.current)
    setSelectedFile(undefined)
    setUploadState('idle')
    setUploadProgress(0)
    /* c8 ignore next */
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeFile() {
    resetUpload()
    /* c8 ignore next 2 */
    onFileChange?.(undefined)
    onFileRemove?.()
    // @ts-expect-error type mismatch
    form.setValue(name, undefined)
    form.trigger(name)
  }

  function startUpload(file: File) {
    /* c8 ignore next 4 */
    const { success, error } = schema?.safeParse(file) ?? { success: true }
    if (!success) {
      onFileUploadError?.(error.message)
      onFileChange?.(file)
      setUploadState('error')
      return
    }

    setUploadState('uploading')
    setUploadProgress(0)

    const uploadDuration = shouldFail ? uploadDurationFail : uploadDurationSuccess
    const interval = 50
    const increment = (maxPercent / uploadDuration) * interval

    uploadIntervalRef.current = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = Math.min(prev + increment, maxPercent)
        if (newProgress >= maxPercent) {
          clearInterval(uploadIntervalRef.current)
          setUploadState('success')
          /* c8 ignore next */
          onFileUploadComplete?.(file)
          // @ts-expect-error type mismatch
          form.setValue(name, file)
          form.trigger(name)
          return maxPercent
        }
        if (shouldFail && newProgress >= uploadPercentFail) {
          clearInterval(uploadIntervalRef.current)
          setUploadState('error')
          /* c8 ignore next */
          onFileUploadError?.('Upload failed')
          return newProgress
        }
        return newProgress
      })
    }, interval)
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    /* c8 ignore next 3 */
    if (!file) return
    setSelectedFile(file)
    onFileChange?.(file)
    startUpload(file)
  }

  const state = states[uploadState]

  return (
    <FormField
      control={form.control}
      name={name}
      render={
        // oxlint-disable-next-line max-lines-per-function
        () => (
          <FormItem>
            <FormLabel>{label}</FormLabel>

            <FormControl>
              {idleNoFile ? (
                <Input accept={accept} data-testid={id} onChange={handleFileSelect} placeholder={state.message} ref={fileInputRef} type="file" />
              ) : (
                <div className="rounded-md border border-input bg-background p-3">
                  <div className="flex gap-3">
                    <aside className="mt-0.5">{state.icon}</aside>
                    <main className="flex grow flex-col gap-1">
                      <div className="flex justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <div className="font-medium text-sm truncate max-w-80">{selectedFile?.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-80">{state.message}</div>
                        </div>

                        <div className="flex ml-8">
                          {state.buttons.map(button => (
                            <Button key={`button-${button.label}`} onClick={button.action} size="sm" testId={`upload-action-${slugify(button.label)}`} title={button.label} variant="ghost">
                              {button.label}
                              <button.icon className="size-4" />
                            </Button>
                          ))}
                        </div>
                      </div>

                      {uploadState !== 'idle' && (
                        <div className="flex items-center">
                          <Progress className={cn('h-1 flex-1', uploadState === 'success' && '[&>div]:bg-success', uploadState === 'error' && '[&>div]:bg-destructive')} value={uploadProgress} />
                          <span className={cn('text-sm font-medium min-w-[3rem] text-right', uploadState === 'success' && 'text-success', uploadState === 'error' && 'text-destructive')}>{Math.round(uploadProgress)}%</span>
                        </div>
                      )}
                    </main>
                  </div>
                </div>
              )}
            </FormControl>

            <FormMessage testId={`error-msg-${slugify(id)}`} />
          </FormItem>
        )
      }
    />
  )
}
