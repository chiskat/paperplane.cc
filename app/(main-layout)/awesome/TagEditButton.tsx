'use client'

import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
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
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { FileUpload, FileUploadTrigger } from '@/components/ui/file-upload'
import { toast } from '@/components/ui/toast'
import { useTRPC } from '@/lib/trpc-client'
import { awesomeTagZod } from '@/lib/zods/awesome'

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
      icon: source?.icon ?? undefined,
      iconFile: undefined,
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

            <form.Field name="iconFile">
              {field => (
                <Field>
                  <FieldLabel>图标</FieldLabel>

                  <div className="flex items-center gap-3">
                    <form.Subscribe
                      selector={s => ({
                        icon: s.values.icon,
                        iconFile: s.values.iconFile,
                      })}
                    >
                      {({ icon, iconFile }) => {
                        const preview =
                          iconFile instanceof File ? URL.createObjectURL(iconFile) : (icon ?? null)
                        return preview ? (
                          <img
                            src={preview}
                            alt="标签图标预览"
                            className="h-7 w-7 shrink-0 object-cover"
                          />
                        ) : null
                      }}
                    </form.Subscribe>

                    <FileUpload
                      className="flex-1 gap-1"
                      accept="image/*"
                      maxFiles={1}
                      disabled={isEditMode && tagListLoading}
                      acceptedFiles={field.state.value instanceof File ? [field.state.value] : []}
                      onFileChange={({ acceptedFiles }) => {
                        const file = acceptedFiles[0] ?? null
                        field.handleChange(() => file)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <FileUploadTrigger asChild>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={isEditMode && tagListLoading}
                          >
                            选择图片
                          </Button>
                        </FileUploadTrigger>

                        <form.Subscribe selector={s => s.values.iconFile?.name}>
                          {iconFileName => (
                            <span className="text-muted-foreground truncate text-xs">
                              {iconFileName ?? '未选择文件'}
                            </span>
                          )}
                        </form.Subscribe>
                      </div>
                    </FileUpload>
                  </div>

                  <FieldDescription>可选，上传标签图标</FieldDescription>
                </Field>
              )}
            </form.Field>

            {submitError ? (
              <p className="rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs text-rose-700">
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
            disabled={pending}
            onClick={() => {
              form.handleSubmit()
            }}
          >
            {pending
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
