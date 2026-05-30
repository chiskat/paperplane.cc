'use client'

import { createListCollection } from '@ark-ui/react/select'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import chinaDivisionPc from 'china-division/dist/pc.json'
import dayjs from 'dayjs'
import { MapPinIcon } from 'lucide-react'
import { useEffect, useMemo, useState, type ComponentProps, type ReactNode } from 'react'
import type { z } from 'zod'

import { InputField } from '@/components/field/input'
import { NumberInputField } from '@/components/field/number-input'
import { SelectField, type SelectCollectionItem } from '@/components/field/select'
import { formatFieldErrors, type TanstackFieldLike } from '@/components/field/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRequiredIndicator,
} from '@/components/ui/field'
import { Input, type InputProps } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'
import { wlbOffworkTimeZod, wlbProfileZod } from '@/lib/zods/wlb'
import { SalaryDayType, WLBWeekendOffworkType } from '@/models/enums'
import { WLBProfilePositionButton } from './ProfilePositionButton'

export type WLBProfileFormValue = z.input<typeof wlbProfileZod>

const TIME_FORMAT = 'HH:mm'
const DEFAULT_OFFWORK_TIME = 18 * 60 * 60 * 1000
const CHINA_DIVISION = chinaDivisionPc as Record<string, string[]>
const WEEKEND_OPTIONS = [
  { value: WLBWeekendOffworkType.DEFAULT, label: '双休' },
  { value: WLBWeekendOffworkType.WORKDAY_SAT, label: '周日单休' },
  { value: WLBWeekendOffworkType.WORKDAY_SUN, label: '周六单休' },
  { value: WLBWeekendOffworkType.WORKDAY_WEEKEND, label: '无休息日' },
]
const SALARY_DAY_OPTIONS = [
  { value: SalaryDayType.EARLY_TO_WORKDAY, label: '提前到工作日' },
  { value: SalaryDayType.LATER_TO_WORKDAY, label: '顺延到工作日' },
  { value: SalaryDayType.ANYDAY, label: '按自然日' },
]

function createSelectCollection(items: SelectCollectionItem[]) {
  return createListCollection({
    items,
    itemToString: item => item.label,
    itemToValue: item => item.value,
  })
}

function toSelectItems(values: string[]): SelectCollectionItem[] {
  return values.map(value => ({ value, label: value }))
}

const PROVINCE_COLLECTION = createSelectCollection(toSelectItems(Object.keys(CHINA_DIVISION)))
const WEEKEND_COLLECTION = createSelectCollection(WEEKEND_OPTIONS)
const SALARY_DAY_COLLECTION = createSelectCollection(SALARY_DAY_OPTIONS)

function millisecondsToTimeString(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return ''
  }

  return dayjs().startOf('day').add(value, 'millisecond').format(TIME_FORMAT)
}

function timeStringToMilliseconds(value: string) {
  if (!value) {
    return undefined
  }

  const time = dayjs(value, TIME_FORMAT, true)
  if (!time.isValid()) {
    return undefined
  }

  return time.diff(time.startOf('day'))
}

function getSubmitErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  return '提交失败，请稍后重试'
}

function asStringField(field: TanstackFieldLike<string>) {
  return field as TanstackFieldLike<string | null | undefined>
}

interface TimeInputFieldProps<TValue extends number | undefined = number> extends Omit<
  InputProps,
  'value' | 'onChange' | 'onBlur' | 'type' | 'min' | 'max' | 'step'
> {
  field: TanstackFieldLike<TValue>
  label: ReactNode
  required?: boolean
  description?: ReactNode
}

function TimeInputField<TValue extends number | undefined = number>(
  props: TimeInputFieldProps<TValue>
) {
  const { field, label, required = false, description, ...inputProps } = props
  const errorMessage = formatFieldErrors(field.state.meta.errors)
  const value = millisecondsToTimeString(field.state.value)

  return (
    <Field required={required} invalid={field.state.meta.isValid === false}>
      <FieldLabel>
        {label}
        {required ? <FieldRequiredIndicator /> : null}
      </FieldLabel>

      <Input
        {...inputProps}
        type="time"
        step={60}
        value={value}
        onChange={event => {
          const nextValue =
            event.target.value === '' ? undefined : timeStringToMilliseconds(event.target.value)
          field.handleChange(() => nextValue as TValue)
        }}
        onBlur={field.handleBlur ?? undefined}
      />

      {description ? <FieldDescription>{description}</FieldDescription> : null}

      {!field.state.meta.isValid && errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </Field>
  )
}

export interface WLBProfileEditButtonProps extends Omit<ComponentProps<typeof Button>, 'onSubmit'> {
  children: ReactNode
  wlbProfileId?: string
  onSuccess?: (profile?: { id: string }) => void
}

export function WLBProfileEditButton({
  children,
  wlbProfileId,
  onSuccess,
  ...restProps
}: WLBProfileEditButtonProps) {
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()

  const isEditMode = Boolean(wlbProfileId)

  const {
    data: currentProfile,
    isPending: currentProfileLoading,
    refetch: refetchCurrentProfile,
  } = useQuery({
    ...trpc.wlb.profile.get.queryOptions({ id: wlbProfileId ?? '' }),
    enabled: open && isEditMode,
  })

  const saveMutation = useMutation({
    mutationFn: async (value: WLBProfileFormValue) => {
      if (wlbProfileId) {
        return trpcClient.wlb.profile.update.mutate({ ...value, id: wlbProfileId })
      }

      return trpcClient.wlb.profile.add.mutate(value)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: trpc.wlb.profile.list.pathKey() }),
        wlbProfileId
          ? queryClient.invalidateQueries({
              queryKey: trpc.wlb.profile.get.queryKey({ id: wlbProfileId }),
            })
          : Promise.resolve(),
      ])
    },
  })

  const defaultValues = useMemo((): WLBProfileFormValue => {
    const source = isEditMode ? currentProfile : undefined
    return {
      ...(isEditMode ? { id: source?.id ?? wlbProfileId } : {}),
      name: source?.name ?? '',
      company: source?.company ?? '',
      province: source?.province ?? '',
      city: source?.city ?? '',
      stockCode: source?.stockCode ?? null,
      salaryDate: source?.salaryDate ?? 1,
      offworkTime: source?.offworkTime ?? DEFAULT_OFFWORK_TIME,
      weekendOption: source?.weekendOption ?? WLBWeekendOffworkType.DEFAULT,
      salaryDayOption: source?.salaryDayOption ?? SalaryDayType.EARLY_TO_WORKDAY,
      latitude: source?.latitude ?? '',
      longitude: source?.longitude ?? '',
    }
  }, [currentProfile, isEditMode, wlbProfileId])

  const loadingDisabled = isEditMode && currentProfileLoading

  const form = useForm({
    defaultValues,
    validators: { onSubmit: wlbProfileZod },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        const savedProfile = await saveMutation.mutateAsync(value)
        toast.success({
          title: isEditMode ? '更新成功' : '新建成功',
          description: isEditMode ? '档案已更新' : '档案已创建',
        })
        setOpen(false)
        onSuccess?.(savedProfile)
      } catch (error) {
        setSubmitError(getSubmitErrorMessage(error))
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
          if (isEditMode) {
            refetchCurrentProfile()
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
        <DialogHeader title={isEditMode ? '编辑 WLB 档案' : '新建 WLB 档案'} />

        <DialogBody scrollFade>
          <form
            className="space-y-6"
            onSubmit={event => {
              event.preventDefault()
              event.stopPropagation()
              form.handleSubmit()
            }}
          >
            <form.Field name="name">
              {field => (
                <InputField
                  field={field}
                  label="名称"
                  required
                  placeholder="为此档案起个名称"
                  disabled={loadingDisabled}
                />
              )}
            </form.Field>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="company">
                {field => (
                  <InputField
                    field={field}
                    label="公司名称"
                    required
                    placeholder="请输入公司名称"
                    disabled={loadingDisabled}
                  />
                )}
              </form.Field>

              <form.Field name="stockCode">
                {field => (
                  <InputField
                    field={field}
                    label="股票代码"
                    placeholder="请输入股票代码，如 sz000001"
                    disabled={loadingDisabled}
                  />
                )}
              </form.Field>
            </div>

            <form.Subscribe
              selector={state => ({
                province: state.values.province,
                city: state.values.city,
              })}
            >
              {({ province }) => {
                const cityCollection = createSelectCollection(
                  toSelectItems(province ? (CHINA_DIVISION[province] ?? []) : [])
                )

                return (
                  <div className="grid grid-cols-2 gap-4">
                    <form.Field
                      name="province"
                      listeners={{
                        onChange: () => {
                          form.setFieldValue('city', '')
                        },
                      }}
                    >
                      {field => (
                        <SelectField
                          field={asStringField(field)}
                          label="省份"
                          required
                          multiple={false}
                          collection={PROVINCE_COLLECTION}
                          placeholder="请选择省份"
                          disabled={loadingDisabled}
                        />
                      )}
                    </form.Field>

                    <form.Field name="city">
                      {field => (
                        <SelectField
                          field={asStringField(field)}
                          label="城市"
                          required
                          multiple={false}
                          collection={cityCollection}
                          placeholder={province ? '请选择城市' : '请先选择省份'}
                          disabled={loadingDisabled || !province}
                        />
                      )}
                    </form.Field>
                  </div>
                )
              }}
            </form.Subscribe>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="salaryDate">
                {field => (
                  <NumberInputField
                    field={field}
                    label="发薪日"
                    required
                    description="每月几号发薪就填写数字几；从月末算则为负数，如 -1 表示每月最后一天"
                    placeholder="请输入发薪日，如 10"
                    disabled={loadingDisabled}
                  />
                )}
              </form.Field>

              <form.Field
                name="offworkTime"
                validators={{ onChange: wlbOffworkTimeZod, onBlur: wlbOffworkTimeZod }}
              >
                {field => (
                  <TimeInputField
                    field={field}
                    label="下班时间"
                    required
                    disabled={loadingDisabled}
                  />
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="weekendOption">
                {field => (
                  <SelectField
                    field={field as TanstackFieldLike<string | null | undefined>}
                    label="工作日调整"
                    required
                    multiple={false}
                    collection={WEEKEND_COLLECTION}
                    placeholder="请选择工作日调整"
                    disabled={loadingDisabled}
                  />
                )}
              </form.Field>

              <form.Field name="salaryDayOption">
                {field => (
                  <SelectField
                    field={field as TanstackFieldLike<string | null | undefined>}
                    label="发薪日设置"
                    required
                    multiple={false}
                    collection={SALARY_DAY_COLLECTION}
                    placeholder="请选择发薪日设置"
                    disabled={loadingDisabled}
                  />
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="latitude">
                {field => (
                  <InputField
                    field={field}
                    label="纬度"
                    required
                    placeholder="请输入纬度"
                    disabled={loadingDisabled}
                  />
                )}
              </form.Field>

              <form.Field name="longitude">
                {field => (
                  <InputField
                    field={field}
                    label="经度"
                    required
                    placeholder="请输入经度"
                    disabled={loadingDisabled}
                  />
                )}
              </form.Field>
            </div>

            <form.Subscribe
              selector={state => ({
                province: state.values.province ?? '',
                city: state.values.city ?? '',
                latitude: state.values.latitude ?? '',
                longitude: state.values.longitude ?? '',
              })}
            >
              {({ province, city, latitude, longitude }) => {
                const fallbackKeyword = [province, city].filter(Boolean).join('')

                return (
                  <WLBProfilePositionButton
                    fallbackKeyword={fallbackKeyword}
                    value={{ latitude, longitude }}
                    variant="outline"
                    size="lg"
                    disabled={loadingDisabled}
                    onChange={({ latitude, longitude }) => {
                      form.setFieldValue('latitude', () => latitude)
                      form.setFieldValue('longitude', () => longitude)
                    }}
                  >
                    <MapPinIcon />
                    从地图选择位置
                  </WLBProfilePositionButton>
                )
              }}
            </form.Subscribe>

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
            disabled={saveMutation.isPending}
            onClick={() => {
              setOpen(false)
            }}
          >
            取消
          </Button>

          <Button
            type="button"
            size="lg"
            disabled={saveMutation.isPending}
            onClick={() => {
              form.handleSubmit()
            }}
          >
            {saveMutation.isPending
              ? isEditMode
                ? '保存中...'
                : '创建中...'
              : isEditMode
                ? '保存档案'
                : '创建档案'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
