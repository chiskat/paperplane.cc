'use client'

import { createListCollection } from '@ark-ui/react/select'
import { useForm } from '@tanstack/react-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState, type ComponentProps, type ReactNode } from 'react'
import type { z } from 'zod'

import { InputField } from '@/components/field/input'
import { SegmentGroupField } from '@/components/field/segment-group'
import { SelectField, type SelectCollectionItem } from '@/components/field/select'
import { SwitchField } from '@/components/field/switch'
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
import { wlbSubscriptionZod } from '@/lib/zods/wlb'
import type { WLBProfile } from '@/models/browser'
import { WLBSubscriptionMessage, WLBSubscriptionType } from '@/models/enums'

export type WLBSubscriptionFormValue = z.input<typeof wlbSubscriptionZod>

export interface WLBSubscriptionEditButtonProps extends Omit<
  ComponentProps<typeof Button>,
  'onSubmit'
> {
  children: ReactNode
  profile: WLBProfile
  subscriptionId?: string
  onSuccess?: () => void
}

const SUBSCRIPTION_TYPE_OPTIONS = [
  { value: WLBSubscriptionType.EMAIL, label: '邮件' },
  { value: WLBSubscriptionType.OAROBOT, label: 'OA 机器人' },
]

const SUBSCRIPTION_MESSAGE_OPTIONS = [
  { value: WLBSubscriptionMessage.IMAGE, label: '图片' },
  { value: WLBSubscriptionMessage.TEXT, label: '文本' },
  { value: WLBSubscriptionMessage.ALL, label: '图片 + 文本' },
]

const TIME_FORMAT = 'HH:mm'

function createSelectCollection(items: SelectCollectionItem[]) {
  return createListCollection({
    items,
    itemToString: item => item.label,
    itemToValue: item => item.value,
  })
}

function toOARobotCollection(items: Array<{ id: string; name: string }>) {
  return createSelectCollection(items.map(item => ({ value: item.id, label: item.name })))
}

const subscriptionMessageCollection = createSelectCollection(SUBSCRIPTION_MESSAGE_OPTIONS)

function getSubmitErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return '提交失败，请稍后重试'
}

function getDefaultConfig(type: WLBSubscriptionType, currentConfig?: unknown) {
  const config =
    currentConfig && typeof currentConfig === 'object' && !Array.isArray(currentConfig)
      ? (currentConfig as Record<string, unknown>)
      : {}

  if (type === WLBSubscriptionType.EMAIL) {
    return { email: typeof config.email === 'string' ? config.email : '' }
  }

  return { robotId: typeof config.robotId === 'string' ? config.robotId : '' }
}

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

interface TriggerTimeInputFieldProps extends Omit<
  InputProps,
  'value' | 'onChange' | 'onBlur' | 'type' | 'min' | 'max' | 'step'
> {
  field: TanstackFieldLike<number>
  profile: WLBProfile
  label: ReactNode
  required?: boolean
  description?: ReactNode
}

function TriggerTimeInputField(props: TriggerTimeInputFieldProps) {
  const { field, profile, label, required = false, description, ...inputProps } = props
  const errorMessage = formatFieldErrors(field.state.meta.errors)
  const offworkTime = useMemo(
    () => dayjs().startOf('day').add(profile.offworkTime, 'millisecond'),
    [profile.offworkTime]
  )
  const value = offworkTime.add(field.state.value, 'millisecond').format(TIME_FORMAT)

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
          const triggerTime = timeStringToMilliseconds(event.target.value)
          const nextValue =
            typeof triggerTime === 'number'
              ? dayjs()
                  .startOf('day')
                  .add(triggerTime, 'millisecond')
                  .diff(offworkTime, 'millisecond')
              : 0
          field.handleChange(() => nextValue)
        }}
        onBlur={field.handleBlur ?? undefined}
      />

      {description ? <FieldDescription>{description}</FieldDescription> : null}

      {!field.state.meta.isValid && errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </Field>
  )
}

export function WLBSubscriptionEditButton({
  children,
  profile,
  subscriptionId,
  onSuccess,
  ...restProps
}: WLBSubscriptionEditButtonProps) {
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const profileId = profile.id
  const isEditMode = Boolean(subscriptionId)

  const {
    data: currentSubscription,
    isPending: currentSubscriptionLoading,
    refetch: refetchCurrentSubscription,
  } = useQuery({
    ...trpc.wlb.subscription.get.queryOptions({ id: subscriptionId ?? '' }),
    enabled: open && isEditMode,
  })

  const { data: oaRobotProfiles = [], isPending: oaRobotProfilesLoading } = useQuery({
    ...trpc.oaRobot.profile.list.queryOptions(),
    enabled: open,
  })

  const oaRobotCollection = useMemo(() => toOARobotCollection(oaRobotProfiles), [oaRobotProfiles])

  const defaultValues = useMemo((): WLBSubscriptionFormValue => {
    const type = currentSubscription?.type ?? WLBSubscriptionType.EMAIL
    return {
      ...(isEditMode ? { id: currentSubscription?.id ?? subscriptionId } : {}),
      name: currentSubscription?.name ?? '',
      enable: currentSubscription?.enable ?? true,
      timeOffset: currentSubscription?.timeOffset ?? 0,
      message: currentSubscription?.message ?? WLBSubscriptionMessage.IMAGE,
      type,
      config: getDefaultConfig(type, currentSubscription?.config),
    } as WLBSubscriptionFormValue
  }, [currentSubscription, isEditMode, subscriptionId])

  const loadingDisabled = isEditMode && currentSubscriptionLoading

  const form = useForm({
    defaultValues,
    validators: { onSubmit: wlbSubscriptionZod },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        if (subscriptionId) {
          await trpcClient.wlb.subscription.update.mutate({ ...value, id: subscriptionId })
        } else {
          await trpcClient.wlb.subscription.add.mutate({ ...value, profileId })
        }

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.wlb.subscription.listByProfile.queryKey({ profileId }),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.wlb.subscription.listByProfile.pathKey(),
          }),
          subscriptionId
            ? queryClient.invalidateQueries({
                queryKey: trpc.wlb.subscription.get.queryKey({ id: subscriptionId }),
              })
            : Promise.resolve(),
        ])

        toast.success({
          title: isEditMode ? '更新成功' : '创建成功',
          description: isEditMode ? 'WLB 订阅已更新' : 'WLB 订阅已创建',
        })
        setOpen(false)
        onSuccess?.()
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
            refetchCurrentSubscription()
          }
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" {...restProps}>
          {children}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[min(92vw,680px)] sm:max-w-[min(92vw,680px)]">
        <DialogHeader title={isEditMode ? '编辑 WLB 订阅' : '新建 WLB 订阅'} />

        <DialogBody>
          <form
            className="flex flex-col gap-6"
            onSubmit={event => {
              event.preventDefault()
              event.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <div className="grid items-start gap-4 sm:grid-cols-2">
              <form.Field name="type">
                {field => (
                  <SegmentGroupField
                    field={field}
                    label="订阅类型"
                    required
                    defaultValue={WLBSubscriptionType.EMAIL}
                    onValueChange={value => {
                      form.setFieldValue('config', () => getDefaultConfig(value))
                    }}
                    disabled={loadingDisabled}
                    fieldClassName="min-w-0"
                    labelClassName="mb-2 text-xs"
                    groupClassName="rounded-lg p-0.5"
                    indicatorClassName="rounded-md"
                    size="sm"
                    options={SUBSCRIPTION_TYPE_OPTIONS}
                  />
                )}
              </form.Field>

              <form.Field name="enable">
                {field => (
                  <SwitchField
                    field={field as TanstackFieldLike<boolean | null | undefined>}
                    label="已启用"
                    required
                    disabled={loadingDisabled}
                    fieldClassName="w-fit"
                    contentClassName="min-h-7 flex-none justify-center gap-0"
                    labelClassName="whitespace-nowrap"
                  />
                )}
              </form.Field>
            </div>

            <div className="grid items-start gap-4 sm:grid-cols-2">
              <form.Field name="name">
                {field => (
                  <InputField
                    field={field}
                    label="名称"
                    required
                    placeholder="例如：下班邮件提醒"
                    disabled={loadingDisabled}
                  />
                )}
              </form.Field>

              <form.Field name="timeOffset">
                {field => (
                  <TriggerTimeInputField
                    field={field as TanstackFieldLike<number>}
                    profile={profile}
                    label="触发时间"
                    required
                    description={`默认与下班时间 ${millisecondsToTimeString(profile.offworkTime)} 相同`}
                    disabled={loadingDisabled}
                  />
                )}
              </form.Field>
            </div>

            <div className="grid items-start gap-4 sm:grid-cols-2">
              <form.Subscribe selector={state => state.values.type ?? WLBSubscriptionType.EMAIL}>
                {type =>
                  type === WLBSubscriptionType.EMAIL ? (
                    <form.Field name="config.email">
                      {field => (
                        <InputField
                          field={field}
                          label="邮箱地址"
                          required
                          placeholder="name@example.com"
                          disabled={loadingDisabled}
                        />
                      )}
                    </form.Field>
                  ) : (
                    <form.Field name="config.robotId">
                      {field => (
                        <SelectField
                          field={field as TanstackFieldLike<string | null | undefined>}
                          label="OA 机器人"
                          required
                          multiple={false}
                          collection={oaRobotCollection}
                          placeholder={oaRobotProfilesLoading ? '正在加载机器人' : '请选择机器人'}
                          disabled={loadingDisabled || oaRobotProfilesLoading}
                          description={
                            oaRobotProfiles.length === 0
                              ? '请先在 OA 机器人页面创建云端机器人'
                              : undefined
                          }
                        />
                      )}
                    </form.Field>
                  )
                }
              </form.Subscribe>

              <form.Field name="message">
                {field => (
                  <SelectField
                    field={field as TanstackFieldLike<string | null | undefined>}
                    label="消息类型"
                    required
                    multiple={false}
                    collection={subscriptionMessageCollection}
                    placeholder="请选择订阅消息类型"
                    disabled={loadingDisabled}
                  />
                )}
              </form.Field>
            </div>

            {submitError ? (
              <FieldDescription className="border-destructive/30 bg-destructive/8 text-destructive rounded-md border px-3 py-2">
                {submitError}
              </FieldDescription>
            ) : null}
          </form>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={form.state.isSubmitting}
            onClick={() => setOpen(false)}
          >
            取消
          </Button>

          <Button
            type="button"
            size="lg"
            disabled={form.state.isSubmitting}
            onClick={() => void form.handleSubmit()}
          >
            {form.state.isSubmitting
              ? isEditMode
                ? '保存中...'
                : '创建中...'
              : isEditMode
                ? '保存订阅'
                : '创建订阅'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
