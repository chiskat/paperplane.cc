'use client'

import { createListCollection } from '@ark-ui/react/select'
import { useForm } from '@tanstack/react-form'
import dayjs from 'dayjs'
import type { ReactNode } from 'react'
import type { input } from 'zod'

import { Button } from '@/components/ui/button'
import {
  CalendarNextTrigger,
  CalendarPrevTrigger,
  CalendarTable,
  CalendarTableDays,
  CalendarView,
  CalendarViewControl,
  CalendarViewDate,
  CalendarWeekDays,
  parseDate,
} from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker, DatePickerContent, DatePickerInput } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShortRedirectType } from '@/models/enums'
import { addShortItemZod } from '@/zods/short'

const redirectTypeLabelMap: Record<ShortRedirectType, string> = {
  [ShortRedirectType.PERMANENTLY]: '永久重定向 (301)',
  [ShortRedirectType.TEMPORARY]: '临时重定向 (302)',
  [ShortRedirectType.JAVASCRIPT]: '通过 JavaScript 跳转',
}

const redirectTypeCollection = createListCollection({
  items: Object.values(ShortRedirectType).map(type => ({
    label: redirectTypeLabelMap[type],
    value: type,
  })),
  itemToString: item => item.label,
  itemToValue: item => item.value,
})

export type FormValue = input<typeof addShortItemZod> & {
  expiredAt?: unknown
}

const DEFAULT_VALUES: FormValue = {
  url: '',
  key: undefined,
  tag: undefined,
  redirectType: ShortRedirectType.PERMANENTLY,
  expiredAt: undefined,
  public: false,
  reuse: false,
}

export function Form({
  pending,
  submitError,
  onSubmit,
}: {
  pending: boolean
  submitError: string | null
  onSubmit: (value: FormValue) => Promise<void>
}) {
  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    validators: {
      onSubmit: addShortItemZod,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

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
        <form.Field name="url">
          {field => (
            <label className="grid gap-2 sm:col-span-2">
              <span className="text-xs text-slate-600">
                目标 URL<span className="ml-0.5 text-red-500">*</span>
              </span>
              <Input
                type="url"
                size="lg"
                value={field.state.value}
                onChange={event => field.handleChange(event.target.value)}
                onBlur={field.handleBlur}
                placeholder="https://example.com"
              />
              <FieldError error={field.state.meta.errors[0]} />
            </label>
          )}
        </form.Field>

        <form.Field name="key">
          {field => (
            <label className="grid gap-2">
              <span className="text-xs text-slate-600">短链接码（可选）</span>
              <Input
                size="lg"
                value={field.state.value ?? ''}
                onChange={event => field.handleChange(event.target.value || undefined)}
                onBlur={field.handleBlur}
                placeholder="留空则由系统随机生成"
                disabled={false}
              />
              <FieldError error={field.state.meta.errors[0]} />
            </label>
          )}
        </form.Field>

        <form.Field name="tag">
          {field => (
            <label className="grid gap-2">
              <span className="text-xs text-slate-600">标签文本（可选）</span>
              <Input
                size="lg"
                value={field.state.value ?? ''}
                onChange={event => field.handleChange(event.target.value || undefined)}
                onBlur={field.handleBlur}
                placeholder="仅用于备注"
              />
              <FieldError error={field.state.meta.errors[0]} />
            </label>
          )}
        </form.Field>

        <form.Field name="redirectType">
          {field => (
            <label className="grid gap-2">
              <span className="text-xs text-slate-600">
                跳转类型<span className="ml-0.5 text-red-500">*</span>
              </span>
              <Select
                collection={redirectTypeCollection}
                value={[field.state.value ?? ShortRedirectType.PERMANENTLY]}
                onValueChange={details => {
                  const nextValue = details.value[0] as ShortRedirectType | undefined
                  const safeValue = nextValue ?? ShortRedirectType.PERMANENTLY
                  field.handleChange(safeValue)

                  if (safeValue === ShortRedirectType.PERMANENTLY) {
                    form.setFieldValue('expiredAt', () => undefined)
                  }
                }}
              >
                <SelectTrigger size="lg" className="w-full" onBlur={field.handleBlur}>
                  <SelectValue placeholder="请选择跳转类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {redirectTypeCollection.items.map(item => (
                      <SelectItem key={item.value} item={item}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </label>
          )}
        </form.Field>

        <form.Subscribe selector={state => state.values.redirectType}>
          {redirectType => {
            const isPermanentlyRedirect =
              (redirectType ?? ShortRedirectType.PERMANENTLY) === ShortRedirectType.PERMANENTLY

            return (
              <form.Field name="expiredAt">
                {field => {
                  const expiredAt = field.state.value
                    ? dayjs(field.state.value as string | number | Date)
                    : null
                  const expiredAtValid = expiredAt?.isValid() ? expiredAt : null
                  const dateValue = expiredAtValid?.format('YYYY-MM-DD') ?? ''
                  const timeValue = expiredAtValid?.format('HH:mm') ?? ''
                  const canClearExpiredAt = !isPermanentlyRedirect && Boolean(expiredAtValid)

                  return (
                    <label className="grid gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-600">过期时间（可选）</span>
                        {canClearExpiredAt ? (
                          <button
                            type="button"
                            className="cursor-pointer text-xs text-slate-500 underline underline-offset-2 transition-colors hover:text-slate-700"
                            onClick={() => field.handleChange(undefined)}
                          >
                            清空
                          </button>
                        ) : null}
                      </div>
                      <div className="grid gap-1.5 sm:grid-cols-[minmax(0,1fr)_8rem]">
                        <DatePicker
                          className="w-full *:data-[slot=date-picker-control]:w-full"
                          locale="zh-CN"
                          selectionMode="single"
                          value={dateValue ? [parseDate(dateValue)] : []}
                          onValueChange={details => {
                            if (isPermanentlyRedirect) {
                              return
                            }

                            const pickerVal = details.value[0] as
                              | { year: number; month: number; day: number }
                              | undefined
                            const nextDateValue = pickerVal
                              ? dayjs(
                                  new Date(pickerVal.year, pickerVal.month - 1, pickerVal.day)
                                ).format('YYYY-MM-DD')
                              : undefined
                            field.handleChange(
                              mergeDateAndTime(nextDateValue, timeValue || '23:59')
                            )
                          }}
                          disabled={isPermanentlyRedirect}
                        >
                          <DatePickerInput
                            size="lg"
                            placeholder="选择日期"
                            onBlur={field.handleBlur}
                            disabled={isPermanentlyRedirect}
                          />
                          <DatePickerContent>
                            <CalendarView view="day">
                              <CalendarViewControl>
                                <CalendarPrevTrigger />
                                <CalendarViewDate />
                                <CalendarNextTrigger />
                              </CalendarViewControl>
                              <CalendarTable>
                                <CalendarWeekDays />
                                <CalendarTableDays />
                              </CalendarTable>
                            </CalendarView>
                          </DatePickerContent>
                        </DatePicker>

                        <Input
                          type="time"
                          step="60"
                          size="lg"
                          value={timeValue}
                          onChange={event => {
                            if (!dateValue || isPermanentlyRedirect) {
                              return
                            }

                            field.handleChange(mergeDateAndTime(dateValue, event.target.value))
                          }}
                          onBlur={field.handleBlur}
                          disabled={isPermanentlyRedirect || !dateValue}
                        />
                      </div>
                      {isPermanentlyRedirect ? (
                        <span className="text-xs text-slate-500">永久重定向不支持设置过期时间</span>
                      ) : null}
                      <FieldError error={field.state.meta.errors[0]} />
                    </label>
                  )
                }}
              </form.Field>
            )
          }}
        </form.Subscribe>
      </div>

      <div className="flex flex-wrap gap-5">
        <form.Field name="public">
          {field => (
            <BooleanOptionField
              checked={Boolean(field.state.value)}
              onCheckedChange={checked => field.handleChange(checked)}
              onBlur={field.handleBlur}
              label="公开可见"
              description="如果不公开，则只对登录用户可见"
            />
          )}
        </form.Field>

        <form.Field name="reuse">
          {field => (
            <BooleanOptionField
              checked={Boolean(field.state.value)}
              onCheckedChange={checked => field.handleChange(checked)}
              onBlur={field.handleBlur}
              label="可被复用"
              description="如果有匹配所有参数的短链接，则直接复用"
            />
          )}
        </form.Field>
      </div>

      {submitError ? (
        <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {submitError}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? '创建中...' : '创建短链接'}
        </Button>
      </div>
    </form>
  )
}

function FieldError({ error }: { error: unknown }) {
  if (!error) {
    return null
  }

  return <span className="block text-xs text-rose-600">{String(error)}</span>
}

function BooleanOptionField({
  checked,
  onCheckedChange,
  onBlur,
  label,
  description,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  onBlur: () => void
  label: ReactNode
  description: ReactNode
}) {
  return (
    <div className="inline-flex items-start gap-2.5 text-sm text-slate-800">
      <Checkbox
        className="mt-0.5"
        checked={checked}
        onCheckedChange={details => onCheckedChange(details.checked === true)}
        onBlur={onBlur}
      />
      <div className="grid gap-0.5 leading-5">
        <span>{label}</span>
        <span className="text-xs leading-5 text-slate-500">{description}</span>
      </div>
    </div>
  )
}

function mergeDateAndTime(dateValue: string | undefined, timeValue: string | undefined) {
  if (!dateValue) return undefined
  const d = dayjs(`${dateValue} ${timeValue || '00:00'}`)
  return d.isValid() ? d.toDate() : undefined
}
