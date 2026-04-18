'use client'

import { createListCollection } from '@ark-ui/react/select'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { input } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useTRPC } from '@/lib/trpc-client'
import { cn } from '@/utils/style'
import { awesomeCatelogZod } from '@/zods/awesome'

const NONE_PARENT_VALUE = '__none_parent__'

export type CategoryFormValue = input<typeof awesomeCatelogZod>

type SelectOption = { value: string; label: string }

function createDefaultValues(initialValues?: Partial<CategoryFormValue>): CategoryFormValue {
  return {
    id: initialValues?.id,
    name: initialValues?.name ?? '',
    desc: initialValues?.desc ?? '',
    parentId: initialValues?.parentId ?? undefined,
  }
}

function createSelectCollection(items: SelectOption[]) {
  return createListCollection({
    items,
    itemToString: item => item.label,
    itemToValue: item => item.value,
  })
}

function fieldErrorMessage(error: unknown) {
  if (!error) {
    return null
  }

  return String(error)
}

function FieldError({ error }: { error: unknown }) {
  const message = fieldErrorMessage(error)
  if (!message) {
    return null
  }

  return <span className="block text-xs text-rose-600">{message}</span>
}

function FormFieldShell({
  label,
  error,
  required = false,
  className,
  children,
}: {
  label: string
  error: unknown
  required?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <label className={cn('grid gap-2', className)}>
      <span className="text-xs text-slate-600">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </span>
      {children}
      <FieldError error={error} />
    </label>
  )
}

export function CategoryForm({
  pending,
  submitError,
  onSubmit,
  initialValues,
  submitLabel,
  pendingLabel,
}: {
  pending: boolean
  submitError: string | null
  onSubmit: (value: CategoryFormValue) => Promise<void>
  initialValues?: Partial<CategoryFormValue>
  submitLabel?: string
  pendingLabel?: string
}) {
  const trpc = useTRPC()

  const { data: catelogList = [], isPending: catelogLoading } = useQuery({
    ...trpc.awesome.catelogs.list.queryOptions(),
    initialData: [],
  })

  const initialId = initialValues?.id
  const initialName = initialValues?.name
  const initialDesc = initialValues?.desc
  const initialParentId = initialValues?.parentId

  const defaultValues = useMemo(
    () =>
      createDefaultValues({
        id: initialId,
        name: initialName,
        desc: initialDesc,
        parentId: initialParentId,
      }),
    [initialId, initialName, initialDesc, initialParentId]
  )

  const form = useForm({
    defaultValues,
    validators: { onSubmit: awesomeCatelogZod },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  const topCatelogOptions = useMemo(
    () =>
      catelogList
        .filter(catelog => catelog.parentId == null)
        .map(catelog => ({ value: catelog.id, label: catelog.name })),
    [catelogList]
  )

  const createParentCollection = useMemo(
    () =>
      createSelectCollection([
        { value: NONE_PARENT_VALUE, label: '(不选择父类别)' },
        ...topCatelogOptions,
      ]),
    [topCatelogOptions]
  )

  const parentNameMap = useMemo(
    () => new Map(topCatelogOptions.map(option => [option.value, option.label] as const)),
    [topCatelogOptions]
  )

  const isEditMode = Boolean(defaultValues.id)
  const hasParent = Boolean(defaultValues.parentId)
  const showParentField = !isEditMode || hasParent
  const isParentReadonly = isEditMode && hasParent
  const currentParentLabel = defaultValues.parentId
    ? (parentNameMap.get(defaultValues.parentId) ??
      (catelogLoading ? '父类别加载中...' : '该父类别已不存在'))
    : ''

  const defaultSubmitLabel = submitLabel ?? (isEditMode ? '保存类别' : '创建类别')
  const defaultPendingLabel = pendingLabel ?? (isEditMode ? '保存中...' : '创建中...')

  return (
    <form
      className="space-y-4"
      onSubmit={event => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <div className="grid items-start gap-4 sm:grid-cols-2">
        {showParentField ? (
          isParentReadonly ? (
            <FormFieldShell label="父类别" error={null} className="sm:col-span-2">
              <Input size="lg" value={currentParentLabel} disabled />
            </FormFieldShell>
          ) : (
            <form.Field name="parentId">
              {field => (
                <FormFieldShell
                  label="父类别"
                  error={field.state.meta.errors[0]}
                  className="sm:col-span-2"
                >
                  <Select
                    collection={createParentCollection}
                    value={[field.state.value ?? NONE_PARENT_VALUE]}
                    onValueChange={details => {
                      const value = details.value[0]
                      field.handleChange(value && value !== NONE_PARENT_VALUE ? value : undefined)
                    }}
                    disabled={catelogLoading}
                  >
                    <SelectTrigger size="lg" className="w-full" onBlur={field.handleBlur}>
                      <SelectValue
                        placeholder={catelogLoading ? '父类别加载中...' : '请选择父类别'}
                      />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        {createParentCollection.items.map(item => (
                          <SelectItem key={item.value} item={item}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormFieldShell>
              )}
            </form.Field>
          )
        ) : null}

        <form.Field name="name">
          {field => (
            <FormFieldShell
              label="名称"
              required
              className="sm:col-span-2"
              error={field.state.meta.errors[0]}
            >
              <Input
                size="lg"
                value={field.state.value}
                onChange={event => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                placeholder="请输入类别名称"
              />
            </FormFieldShell>
          )}
        </form.Field>

        <form.Field name="desc">
          {field => (
            <FormFieldShell
              label="描述"
              className="sm:col-span-2"
              error={field.state.meta.errors[0]}
            >
              <Textarea
                value={field.state.value ?? ''}
                onChange={event => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                placeholder="请输入类别描述"
                className="min-h-24"
              />
            </FormFieldShell>
          )}
        </form.Field>
      </div>

      {submitError ? (
        <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {submitError}
        </p>
      ) : null}

      <div className="flex items-center justify-end">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? defaultPendingLabel : defaultSubmitLabel}
        </Button>
      </div>
    </form>
  )
}
