'use client'

import { createListCollection } from '@ark-ui/react/select'
import { IconMichelinStar } from '@tabler/icons-react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type ComponentProps, type ReactNode } from 'react'
import type { input } from 'zod'

import { InputField } from '@/components/field/input'
import { RatingField } from '@/components/field/rating'
import { SelectCollectionItem, SelectField } from '@/components/field/select'
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
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'
import { awesomeItemZod } from '@/zods/awesome'

const NONE_CATELOG_VALUE = '__no_catelog__'

export type FormValue = input<typeof awesomeItemZod>

function createSelectCollection(items: SelectCollectionItem[]) {
  return createListCollection({
    items,
    itemToString: item => item.label,
    itemToValue: item => item.value,
  })
}

export interface AwesomeEditButtonProps extends Omit<
  ComponentProps<typeof Button>,
  'id' | 'onSubmit'
> {
  children: ReactNode
  id?: string
  catelogId?: string
  onSuccess?: () => void
}

export function AwesomeEditButton({
  children,
  id,
  catelogId,
  onSuccess,
  ...restProps
}: AwesomeEditButtonProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isEditMode = Boolean(id)
  const isCreateMode = !isEditMode

  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()

  const { data: catelogList = [], isPending: catelogLoading } = useQuery({
    ...trpc.awesome.catelogs.list.queryOptions(),
    initialData: [],
  })

  const { data: tagList = [], isPending: tagLoading } = useQuery({
    ...trpc.awesome.tags.list.queryOptions(),
    initialData: [],
  })

  const {
    data: currentAwesome,
    isPending: currentAwesomeLoading,
    refetch: refetchCurrentAwesome,
  } = useQuery({
    ...trpc.awesome.items.get.queryOptions({ id: id! }),
    enabled: open && isEditMode,
  })

  const createAwesomeMutation = useMutation({
    mutationFn: async (value: FormValue) => {
      return await trpcClient.awesome.items.add.mutate(value)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trpc.awesome.items.tree.pathKey() })
    },
  })

  const updateAwesomeMutation = useMutation({
    mutationFn: async (value: FormValue) => {
      return await trpcClient.awesome.items.update.mutate(value)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trpc.awesome.items.tree.pathKey() })
    },
  })

  const defaultValues = useMemo((): FormValue => {
    const source = isCreateMode ? undefined : currentAwesome
    return {
      ...(isCreateMode ? {} : { id: source?.id ?? id }),
      label: source?.label ?? '',
      homepage: source?.homepage ?? '',
      source: source?.source ?? '',
      registry: source?.registry ?? '',
      desc: source?.desc ?? '',
      stars: typeof source?.stars === 'number' ? source.stars : undefined,
      catelogId: isCreateMode ? (catelogId ?? undefined) : (source?.catelogId ?? undefined),
      tags: source?.tags?.map(tag => tag.id) ?? [],
    }
  }, [catelogId, currentAwesome, id, isCreateMode])

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: awesomeItemZod,
    },
    onSubmit: async ({ value }) => {
      setPending(true)
      setSubmitError(null)
      try {
        if (isEditMode) {
          await updateAwesomeMutation.mutateAsync(value)
        } else {
          await createAwesomeMutation.mutateAsync(value)
        }
        toast.success({
          title: isEditMode ? '更新成功' : '新建成功',
          description: isEditMode ? 'Awesome 项已更新' : 'Awesome 项已创建',
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

  const catelogCollection = useMemo(
    () =>
      createSelectCollection([
        { value: NONE_CATELOG_VALUE, label: '(不选择类别)' },
        ...catelogList.map(catelog => ({
          value: catelog.id,
          label: catelog.parent?.name ? `${catelog.parent.name} / ${catelog.name}` : catelog.name,
        })),
      ]),
    [catelogList]
  )

  const tagCollection = useMemo(
    () => createSelectCollection(tagList.map(tag => ({ value: tag.id, label: tag.label }))),
    [tagList]
  )

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
            refetchCurrentAwesome()
          }
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" {...restProps}>
          {children}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[min(92vw,780px)] sm:max-w-[min(92vw,780px)]">
        <DialogHeader
          title={isEditMode ? '编辑 Awesome' : '添加 Awesome'}
          description={isEditMode ? '编辑当前 Awesome 信息。' : '创建一条 Awesome 项目。'}
        />

        <DialogBody>
          <form
            className="grid items-start gap-4 space-y-4 sm:grid-cols-2"
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
                  placeholder="请输入 Awesome 项名称"
                  disabled={isEditMode && currentAwesomeLoading}
                />
              )}
            </form.Field>

            <form.Field name="homepage">
              {field => (
                <InputField
                  field={field}
                  label="官网"
                  type="url"
                  placeholder="官网主页或文档地址"
                  required
                  disabled={isEditMode && currentAwesomeLoading}
                />
              )}
            </form.Field>

            <form.Field name="source">
              {field => (
                <InputField
                  field={field}
                  label="源代码"
                  type="url"
                  placeholder="GitHub 仓库地址"
                  disabled={isEditMode && currentAwesomeLoading}
                />
              )}
            </form.Field>

            <form.Field name="registry">
              {field => (
                <InputField
                  field={field}
                  label="包管理"
                  type="url"
                  placeholder="npm、Docker Hub、PyPI 等"
                  disabled={isEditMode && currentAwesomeLoading}
                />
              )}
            </form.Field>

            <form.Field name="desc">
              {field => (
                <div className="sm:col-span-2">
                  <TextareaField
                    field={field}
                    label="介绍"
                    placeholder="简要介绍这个 Awesome 项"
                    className="min-h-24"
                    disabled={isEditMode && currentAwesomeLoading}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="tags">
              {field => (
                <div className="sm:col-span-2">
                  <SelectField
                    field={field}
                    label="标签"
                    collection={tagCollection}
                    multiple
                    closeOnSelect={false}
                    placeholder={tagLoading ? '标签加载中...' : '请选择一个或多个标签'}
                    disabled={tagLoading || (isEditMode && currentAwesomeLoading)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="catelogId">
              {field => (
                <SelectField
                  field={{
                    state: {
                      value: field.state.value ?? NONE_CATELOG_VALUE,
                      meta: field.state.meta,
                    },
                    handleChange: updater => {
                      const prevValue = field.state.value ?? NONE_CATELOG_VALUE
                      const nextValue = typeof updater === 'function' ? updater(prevValue) : updater
                      field.handleChange(() =>
                        nextValue && nextValue !== NONE_CATELOG_VALUE ? nextValue : undefined
                      )
                    },
                    handleBlur: field.handleBlur,
                  }}
                  label="类别"
                  collection={catelogCollection}
                  placeholder={catelogLoading ? '类别加载中...' : '请选择类别'}
                  disabled={catelogLoading}
                />
              )}
            </form.Field>

            <form.Field name="stars">
              {field => (
                <RatingField
                  className="text-[#f01879]"
                  field={field}
                  icon={<IconMichelinStar />}
                  label="星级"
                />
              )}
            </form.Field>

            {submitError ? (
              <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700">
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
                ? '保存 Awesome 项'
                : '创建 Awesome 项'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
