'use client'

import { IconTrash } from '@tabler/icons-react'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { retry } from 'omn'
import { useEffect, useMemo, useState, type ComponentProps, type ReactNode } from 'react'
import type { input } from 'zod'

import { ColorPickerField } from '@/components/field/color-picker'
import { InputField } from '@/components/field/input'
import { RadioGroupField } from '@/components/field/radio-group'
import { TextareaField } from '@/components/field/textarea'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { FileUpload, FileUploadTrigger } from '@/components/ui/file-upload'
import { toast } from '@/components/ui/toast'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'
import { awesomeTagZod } from '@/lib/zods/awesome'
import { UserContentPresetType } from '@/lib/zods/user-content'

const swatches = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
]

export type TagFormValue = input<typeof awesomeTagZod>

type UploadState = 'idle' | 'uploading' | 'checking' | 'error'

export interface TagEditButtonProps extends Omit<ComponentProps<typeof Button>, 'onSubmit'> {
  children: ReactNode
  tagId?: string
  onSuccess?: () => void
  onSubmit: (value: TagFormValue) => Promise<void>
}

export function TagEditButton({
  children,
  tagId,
  onSuccess,
  onSubmit,
  ...restProps
}: TagEditButtonProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [iconUploading, setIconUploading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const trpc = useTRPC()
  const isEditMode = Boolean(tagId)

  const { data: tagList = [], isPending: tagListLoading } = useQuery({
    ...trpc.awesome.tags.list.queryOptions(),
    enabled: open && isEditMode,
    initialData: [],
  })

  const currentTag = useMemo(
    () => (isEditMode ? tagList.find(t => t.id === tagId) : undefined),
    [isEditMode, tagId, tagList]
  )

  const defaultValues = useMemo((): TagFormValue => {
    const source = isEditMode ? currentTag : undefined
    return {
      ...(isEditMode ? { id: source?.id ?? tagId } : {}),
      label: source?.label ?? '',
      desc: source?.desc ?? '',
      color: source?.color ?? null,
      icon: source?.icon ?? null,
    }
  }, [currentTag, isEditMode, tagId])

  const form = useForm({
    defaultValues,
    validators: { onSubmit: awesomeTagZod },
    onSubmit: async ({ value }) => {
      setPending(true)
      setSubmitError(null)
      try {
        await onSubmit(value)
        toast.success({
          title: isEditMode ? '更新成功' : '新建成功',
          description: isEditMode ? '标签已更新' : '标签已创建',
        })
        setOpen(false)
        onSuccess?.()
      } catch (error) {
        if (error instanceof Error && error.message) {
          setSubmitError(error.message)
        } else if (typeof error === 'string' && error.trim()) {
          setSubmitError(error)
        } else {
          setSubmitError('提交失败，请稍后重试')
        }
      } finally {
        setPending(false)
      }
    },
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  return (
    <Dialog
      open={open}
      closeOnInteractOutside={false}
      onOpenChange={({ open: nextOpen }) => {
        setOpen(nextOpen)
        if (nextOpen) {
          setSubmitError(null)
          form.reset(defaultValues)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" {...restProps}>
          {children}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[min(92vw,720px)] sm:max-w-[min(92vw,720px)]">
        <DialogHeader
          title={isEditMode ? '编辑标签' : '添加标签'}
          description={isEditMode ? '编辑当前 Awesome 标签信息。' : '创建一个 Awesome 标签。'}
        />

        <DialogBody>
          <form
            className="space-y-6"
            onSubmit={event => {
              event.preventDefault()
              event.stopPropagation()
              form.handleSubmit()
            }}
          >
            <form.Field name="label">
              {field => (
                <InputField
                  field={field}
                  label="名称"
                  required
                  placeholder="请输入标签名称"
                  disabled={isEditMode && tagListLoading}
                />
              )}
            </form.Field>

            <form.Field name="desc">
              {field => (
                <TextareaField
                  field={field}
                  label="描述"
                  placeholder="请输入标签描述作为补充说明"
                  className="min-h-24"
                  disabled={isEditMode && tagListLoading}
                />
              )}
            </form.Field>

            <form.Field name="color">
              {field => (
                <div className="space-y-3">
                  <RadioGroupField
                    label="颜色"
                    field={{
                      state: {
                        value: field.state.value ? 'with-color' : 'no-color',
                        meta: { errors: [] },
                      },
                      handleChange: updater => {
                        const currentMode = field.state.value ? 'with-color' : 'no-color'
                        const nextMode =
                          typeof updater === 'function' ? updater(currentMode) : updater

                        if (nextMode === 'no-color') {
                          field.handleChange(() => null)
                          return
                        }

                        if (!field.state.value) {
                          field.handleChange(() => swatches[0] ?? '#3b82f6')
                        }
                      },
                    }}
                    options={[
                      { value: 'no-color', label: '无颜色' },
                      { value: 'with-color', label: '彩色标签' },
                    ]}
                    className="flex-row flex-wrap gap-4"
                    disabled={isEditMode && tagListLoading}
                  />

                  {field.state.value ? (
                    <ColorPickerField
                      field={field}
                      label="颜色值"
                      disabled={isEditMode && tagListLoading}
                      swatches={swatches}
                    />
                  ) : null}
                </div>
              )}
            </form.Field>

            <form.Field name="icon">
              {field => (
                <TagIconUploadField
                  value={field.state.value ?? null}
                  disabled={isEditMode && tagListLoading}
                  onUploadingChange={setIconUploading}
                  onChange={value => field.handleChange(() => value)}
                />
              )}
            </form.Field>

            {submitError ? (
              <p className="rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-base text-rose-700">
                {submitError}
              </p>
            ) : null}
          </form>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={pending}
            onClick={() => {
              setOpen(false)
            }}
          >
            取消
          </Button>

          <Button
            type="button"
            size="lg"
            disabled={pending || iconUploading}
            isLoading={pending}
            onClick={() => {
              form.handleSubmit()
            }}
          >
            {iconUploading
              ? '图标上传中...'
              : pending
                ? isEditMode
                  ? '保存中...'
                  : '创建中...'
                : isEditMode
                  ? '保存标签'
                  : '创建标签'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export interface TagIconUploadFieldProps {
  value: string | null
  disabled?: boolean
  onUploadingChange?: (uploading: boolean) => void
  onChange: (value: string | null) => void
}

function TagIconUploadField({
  value,
  disabled,
  onUploadingChange,
  onChange,
}: TagIconUploadFieldProps) {
  const trpc = useTRPCClient()
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [selectedFile, setSelectedFile] = useState<File>()
  const [selectedFilePreview, setSelectedFilePreview] = useState<string>()
  const [uploadError, setUploadError] = useState<string>()

  const isUploading = uploadState === 'uploading' || uploadState === 'checking'
  const isDisabled = disabled || isUploading
  const previewSrc = value ?? selectedFilePreview

  useEffect(() => {
    if (!selectedFile) {
      setSelectedFilePreview(undefined)
      return
    }

    const objectURL = URL.createObjectURL(selectedFile)
    setSelectedFilePreview(objectURL)

    return () => {
      URL.revokeObjectURL(objectURL)
    }
  }, [selectedFile])

  const handleFileChange = async (file: File | undefined) => {
    if (!file) {
      return
    }

    setSelectedFile(file)
    setUploadState('uploading')
    setUploadError(undefined)
    onUploadingChange?.(true)

    try {
      const { id, uploadURL } = await trpc.userContent.presign.mutate({
        filename: file.name,
        usage: UserContentPresetType.AWESOME_TAG_ICON,
      })

      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      if (!uploadResponse.ok) {
        throw new Error('上传失败')
      }

      setUploadState('checking')

      const result = await retry(() => trpc.userContent.check.mutate({ id }), {
        interval: 1000,
        maxRounds: 3,
        success: result => result.ready === true,
      })

      if (result.success && result.data?.ready) {
        onChange(result.data.publicURL)
        setUploadState('idle')
        toast.success({ title: '图标上传成功' })
        return
      }

      throw new Error('文件处理超时')
    } catch (error) {
      const message = error instanceof Error ? error.message : '上传失败'
      setUploadState('error')
      setUploadError(message)
      setSelectedFile(undefined)
      toast.error({ title: message })
    } finally {
      onUploadingChange?.(false)
    }
  }

  const handleRemove = () => {
    setSelectedFile(undefined)
    setUploadError(undefined)
    setUploadState('idle')
    onChange(null)
  }

  return (
    <Field invalid={uploadState === 'error'}>
      <FieldLabel>图标</FieldLabel>

      <div className="flex items-center gap-3">
        {previewSrc ? (
          <img
            src={previewSrc}
            alt="标签图标预览"
            className="size-8 shrink-0 rounded-sm object-cover"
          />
        ) : null}

        <FileUpload
          className="min-w-0 flex-1 gap-1"
          accept="image/*"
          maxFiles={1}
          disabled={isDisabled}
          acceptedFiles={selectedFile ? [selectedFile] : []}
          onFileChange={({ acceptedFiles }) => handleFileChange(acceptedFiles[0])}
        >
          <div className="flex items-center gap-2">
            <FileUploadTrigger asChild>
              <Button type="button" variant="secondary" size="sm" disabled={isDisabled}>
                {value ? '重新选择' : '选择图片'}
              </Button>
            </FileUploadTrigger>

            <span className="text-muted-foreground truncate text-xs">
              {isUploading
                ? uploadState === 'uploading'
                  ? '上传中...'
                  : '处理中...'
                : selectedFile?.name || (value ? '已上传图标' : '未选择文件')}
            </span>
          </div>
        </FileUpload>

        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isDisabled}
            aria-label="删除图标"
            onClick={handleRemove}
          >
            <IconTrash size={16} aria-hidden />
          </Button>
        ) : null}
      </div>
      {uploadError ? <FieldError>{uploadError}</FieldError> : null}
    </Field>
  )
}
