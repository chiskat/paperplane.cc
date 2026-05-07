'use client'

import { createListCollection } from '@ark-ui/react/select'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type ComponentProps, type ReactNode } from 'react'
import type { input } from 'zod'

import { InputField } from '@/components/field/input'
import { RadioGroupField } from '@/components/field/radio-group'
import { SelectField } from '@/components/field/select'
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
import { toast } from '@/components/ui/toast'
import { useTRPC } from '@/lib/trpc-client'
import { awesomeCatelogZod } from '@/lib/zods/awesome'

export type CategoryFormValue = input<typeof awesomeCatelogZod>

type CategoryLevel = 'primary' | 'secondary'

export interface CategoryEditButtonProps extends Omit<ComponentProps<typeof Button>, 'onSubmit'> {
  children: ReactNode
  categoryId?: string
  parentId?: string
  onSuccess?: () => void
  onSubmit: (value: CategoryFormValue) => Promise<void>
}

export function CategoryEditButton({
  children,
  categoryId,
  parentId,
  onSuccess,
  onSubmit,
  ...restProps
}: CategoryEditButtonProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const trpc = useTRPC()
  const isEditMode = Boolean(categoryId)
  const isCreateMode = !isEditMode

  const { data: topCatelogOptions = [], isPending: catelogLoading } = useQuery({
    ...trpc.awesome.catelogs.list.queryOptions(),
    initialData: [],
    select: data =>
      data
        .filter(catelog => catelog.parentId == null)
        .map(catelog => ({ value: catelog.id, label: catelog.name })),
  })

  const {
    data: currentCategory,
    isPending: currentCategoryLoading,
    refetch: refetchCurrentCategory,
  } = useQuery({
    ...trpc.awesome.catelogs.get.queryOptions({ id: categoryId! }),
    enabled: open && isEditMode,
  })

  const defaultValues = useMemo((): CategoryFormValue => {
    const source = isCreateMode ? undefined : currentCategory
    return {
      ...(isCreateMode ? {} : { id: source?.id ?? categoryId }),
      name: source?.name ?? '',
      desc: source?.desc ?? '',
      parentId: isCreateMode ? (parentId ?? undefined) : (source?.parentId ?? undefined),
    }
  }, [categoryId, currentCategory, isCreateMode, parentId])

  const [createCategoryLevel, setCreateCategoryLevel] = useState<CategoryLevel>(
    defaultValues.parentId ? 'secondary' : 'primary'
  )

  const form = useForm({
    defaultValues,
    validators: { onSubmit: awesomeCatelogZod },
    onSubmit: async ({ value }) => {
      setPending(true)
      setSubmitError(null)
      try {
        await onSubmit(value)
        toast.success({
          title: isEditMode ? '更新成功' : '新建成功',
          description: isEditMode ? '类别已更新' : '类别已创建',
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

  useEffect(() => {
    if (!isCreateMode) {
      return
    }
    setCreateCategoryLevel(defaultValues.parentId ? 'secondary' : 'primary')
  }, [defaultValues.parentId, isCreateMode])

  const requiredParentCollection = useMemo(
    () =>
      createListCollection({
        items: topCatelogOptions,
        itemToString: item => item.label,
        itemToValue: item => item.value,
      }),
    [topCatelogOptions]
  )

  const parentNameMap = useMemo(
    () => new Map(topCatelogOptions.map(option => [option.value, option.label] as const)),
    [topCatelogOptions]
  )

  const currentParentLabel = defaultValues.parentId
    ? (parentNameMap.get(defaultValues.parentId) ??
      (catelogLoading ? '父类别加载中...' : '该父类别已不存在'))
    : ''

  useEffect(() => {
    if (!isCreateMode || createCategoryLevel !== 'primary') {
      return
    }

    form.setFieldValue('parentId', () => undefined)
  }, [createCategoryLevel, form, isCreateMode])

  return (
    <Dialog
      open={open}
      closeOnInteractOutside={false}
      onOpenChange={({ open: nextOpen }) => {
        setOpen(nextOpen)
        if (nextOpen) {
          setSubmitError(null)
          form.reset(defaultValues)

          if (isEditMode) {
            refetchCurrentCategory()
          }

          if (isCreateMode) {
            setCreateCategoryLevel(defaultValues.parentId ? 'secondary' : 'primary')
          }
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
          title={isEditMode ? '编辑类别' : '添加类别'}
          description={isEditMode ? '编辑当前 Awesome 类别信息。' : '创建一个 Awesome 类别。'}
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
            {isEditMode && defaultValues.parentId ? (
              <InputField
                field={{
                  state: { value: currentParentLabel, meta: { errors: [] } },
                  handleChange: () => undefined,
                }}
                label="父类别"
                description="父类别不可修改"
                disabled
              />
            ) : null}

            {isCreateMode ? (
              <RadioGroupField
                required
                label="类别层级"
                field={{
                  state: { value: createCategoryLevel, meta: { errors: [] } },
                  handleChange: updater => {
                    const nextValue =
                      typeof updater === 'function' ? updater(createCategoryLevel) : updater
                    const level = (nextValue ?? 'primary') as CategoryLevel
                    if (level === 'primary') {
                      form.setFieldValue('parentId', () => undefined)
                    }
                    setCreateCategoryLevel(level)
                  },
                }}
                options={[
                  { value: 'primary', label: '主类别' },
                  { value: 'secondary', label: '子类别（二级类别）' },
                ]}
                className="flex-row flex-wrap gap-4"
              />
            ) : null}

            {isCreateMode && createCategoryLevel === 'secondary' ? (
              <form.Field
                name="parentId"
                validators={{
                  onSubmit: ({ value }) => (value ? undefined : '请选择父类别'),
                }}
              >
                {field => (
                  <SelectField
                    field={field}
                    label="父类别"
                    required
                    collection={requiredParentCollection}
                    placeholder={catelogLoading ? '父类别加载中...' : '请选择父类别'}
                    disabled={catelogLoading}
                  />
                )}
              </form.Field>
            ) : null}

            <form.Field name="name">
              {field => (
                <InputField
                  field={field}
                  label="名称"
                  required
                  placeholder="请输入类别名称"
                  disabled={isEditMode && currentCategoryLoading}
                />
              )}
            </form.Field>

            <form.Field name="desc">
              {field => (
                <TextareaField
                  field={field}
                  label="描述"
                  description="可选，作为补充说明"
                  placeholder="请输入类别描述"
                  className="min-h-24"
                  disabled={isEditMode && currentCategoryLoading}
                />
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
                ? '保存类别'
                : '创建类别'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
