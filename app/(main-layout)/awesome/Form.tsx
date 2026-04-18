'use client'

import { createListCollection } from '@ark-ui/react/select'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useDeepCompareEffect } from 'ahooks'
import { useMemo, useState } from 'react'
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
import { awesomeItemZod } from '@/zods/awesome'

const NONE_CATELOG_VALUE = '__none_catelog__'

export type FormValue = input<typeof awesomeItemZod>
type SelectOption = { value: string; label: string }

function createDefaultValues(initialValues?: Partial<FormValue>): FormValue {
  return {
    id: initialValues?.id,
    label: initialValues?.label ?? '',
    homepage: initialValues?.homepage ?? '',
    source: initialValues?.source ?? '',
    registry: initialValues?.registry ?? '',
    desc: initialValues?.desc ?? '',
    stars: typeof initialValues?.stars === 'number' ? initialValues.stars : undefined,
    catelogId: initialValues?.catelogId ?? undefined,
    tags: initialValues?.tags ? [...initialValues.tags] : [],
  }
}

function displayStarsInput(value: number | null | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return ''
  }

  return String(value)
}

function parseStarsInput(value: string) {
  const normalized = value.trim()
  if (!normalized) {
    return undefined
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function createSelectCollection(items: SelectOption[]) {
  return createListCollection({
    items,
    itemToString: item => item.label,
    itemToValue: item => item.value,
  })
}

function FieldError({ error }: { error: unknown }) {
  if (!error) {
    return null
  }

  return <span className="block text-xs text-rose-600">{String(error)}</span>
}

function FormFieldShell({
  label,
  error,
  className,
  children,
}: {
  label: string
  error: unknown
  className?: string
  children: ReactNode
}) {
  return (
    <label className={cn('grid gap-2', className)}>
      <span className="text-xs text-slate-600">{label}</span>
      {children}
      <FieldError error={error} />
    </label>
  )
}

interface SimpleFieldApi {
  state: { value: string | null | undefined; meta: { errors: unknown[] } }
  handleChange: (value: string) => void
  handleBlur: () => void
}

function TextFormField({
  field,
  label,
  type,
  placeholder,
  className,
}: {
  field: SimpleFieldApi
  label: string
  type?: string
  placeholder?: string
  className?: string
}) {
  return (
    <FormFieldShell label={label} className={className} error={field.state.meta.errors[0]}>
      <Input
        type={type}
        size="lg"
        value={field.state.value ?? ''}
        onChange={event => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
        placeholder={placeholder}
      />
    </FormFieldShell>
  )
}

function StarsInputField({
  defaultValue,
  error,
  onChange,
  onBlur,
}: {
  defaultValue: number | null | undefined
  error: unknown
  onChange: (value: number | undefined) => void
  onBlur: () => void
}) {
  const [inputValue, setInputValue] = useState(displayStarsInput(defaultValue))

  return (
    <FormFieldShell label="星级" error={error}>
      <Input
        type="text"
        size="lg"
        inputMode="decimal"
        value={inputValue}
        onChange={event => {
          const value = event.target.value
          setInputValue(value)
          onChange(parseStarsInput(value))
        }}
        onBlur={onBlur}
        placeholder="0-5"
      />
    </FormFieldShell>
  )
}

export function Form({
  pending,
  submitError,
  onSubmit,
  initialValues,
  submitLabel,
  pendingLabel,
}: {
  pending: boolean
  submitError: string | null
  onSubmit: (value: FormValue) => Promise<void>
  initialValues?: Partial<FormValue>
  submitLabel?: string
  pendingLabel?: string
}) {
  const trpc = useTRPC()

  const { data: catelogList = [], isPending: catelogLoading } = useQuery({
    ...trpc.awesome.catelogs.list.queryOptions(),
    initialData: [],
  })

  const { data: tagList = [], isPending: tagLoading } = useQuery({
    ...trpc.awesome.tags.list.queryOptions(),
    initialData: [],
  })

  const defaultValues = createDefaultValues(initialValues)

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: awesomeItemZod,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  useDeepCompareEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues])

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
    () =>
      createSelectCollection(
        tagList.map(tag => ({
          value: tag.id,
          label: tag.label,
        }))
      ),
    [tagList]
  )

  const defaultSubmitLabel =
    submitLabel ?? (defaultValues.id ? '保存 Awesome 项' : '创建 Awesome 项')
  const defaultPendingLabel = pendingLabel ?? (defaultValues.id ? '保存中...' : '创建中...')
  const starsResetKey = `${defaultValues.id ?? 'new'}:${displayStarsInput(defaultValues.stars)}`

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
        <form.Field name="catelogId">
          {field => (
            <FormFieldShell label="类别" error={field.state.meta.errors[0]}>
              <Select
                collection={catelogCollection}
                value={[field.state.value ?? NONE_CATELOG_VALUE]}
                onValueChange={details => {
                  const value = details.value[0]
                  field.handleChange(value && value !== NONE_CATELOG_VALUE ? value : undefined)
                }}
                disabled={catelogLoading}
              >
                <SelectTrigger size="lg" className="w-full" onBlur={field.handleBlur}>
                  <SelectValue placeholder={catelogLoading ? '类别加载中...' : '请选择类别'} />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    {catelogCollection.items.map(item => (
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

        <form.Field name="stars">
          {field => (
            <StarsInputField
              key={starsResetKey}
              defaultValue={field.state.value}
              error={field.state.meta.errors[0]}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
            />
          )}
        </form.Field>

        <form.Field name="label">
          {field => (
            <TextFormField
              field={field}
              label="名称"
              className="sm:col-span-2"
              placeholder="请输入 Awesome 项名称"
            />
          )}
        </form.Field>

        <form.Field name="homepage">
          {field => (
            <TextFormField
              field={field}
              label="官网"
              type="url"
              placeholder="https://example.com"
            />
          )}
        </form.Field>

        <form.Field name="source">
          {field => (
            <TextFormField
              field={field}
              label="源代码"
              type="url"
              placeholder="https://github.com/owner/repo"
            />
          )}
        </form.Field>

        <form.Field name="registry">
          {field => (
            <TextFormField
              field={field}
              label="包管理"
              className="sm:col-span-2"
              type="url"
              placeholder="https://www.npmjs.com/package/xxx"
            />
          )}
        </form.Field>

        <form.Field name="desc">
          {field => (
            <FormFieldShell
              label="介绍"
              className="sm:col-span-2"
              error={field.state.meta.errors[0]}
            >
              <Textarea
                value={field.state.value ?? ''}
                onChange={event => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                placeholder="简要介绍这个 Awesome 项"
                className="min-h-24"
              />
            </FormFieldShell>
          )}
        </form.Field>

        <form.Field name="tags">
          {field => (
            <FormFieldShell
              label="标签"
              className="sm:col-span-2"
              error={field.state.meta.errors[0]}
            >
              <Select
                collection={tagCollection}
                multiple
                closeOnSelect={false}
                value={field.state.value ?? []}
                onValueChange={details => field.handleChange(details.value)}
                disabled={tagLoading}
              >
                <SelectTrigger size="lg" className="w-full" onBlur={field.handleBlur}>
                  <SelectValue
                    placeholder={tagLoading ? '标签加载中...' : '请选择一个或多个标签'}
                  />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    {tagCollection.items.map(item => (
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
