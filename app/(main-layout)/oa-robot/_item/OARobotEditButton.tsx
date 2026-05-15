'use client'

import { useForm, type Updater } from '@tanstack/react-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'
import z, { type input } from 'zod'

import { InputField } from '@/components/field/input'
import { RadioGroupField } from '@/components/field/radio-group'
import { SegmentGroupField } from '@/components/field/segment-group'
import { TextareaField } from '@/components/field/textarea'
import { Tips } from '@/components/text/Tips'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { useSession } from '@/lib/auth-client'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'
import { OARobotProfileZod } from '@/lib/zods/oa-robot'
import { OARobotType } from '@/models/enums'
import { cn } from '@/utils/style'
import {
  createOARobotLocalProfile,
  findOARobotLocalProfileById,
  updateOARobotLocalProfile,
  useOARobotLocalProfiles,
  type OARobotLocalProfile,
  type OARobotLocalProfilePayload,
} from '../localProfileStorage'
import { oaRobotTypeOptions } from '../robot-icon'

type OARobotStorageSource = 'local' | 'cloud'
type FeishuCredentials = {
  feishuAppId: string
  feishuAppSecret: string
}

const OARobotFormZod = OARobotProfileZod.extend({
  storage: z.enum(['local', 'cloud']),
})

export type OARobotFormValue = input<typeof OARobotFormZod>
type OARobotProfilePayload = Pick<
  OARobotFormValue,
  'id' | 'name' | 'desc' | 'type' | 'accessToken' | 'secret' | 'extraAuthentication'
>
type OARobotEditSourceProfile = Partial<OARobotProfilePayload> | undefined

export interface OARobotEditButtonProps extends Omit<ComponentProps<typeof Button>, 'onSubmit'> {
  children: ReactNode
  profileId?: string
  source?: OARobotStorageSource
  localProfile?: OARobotLocalProfile
  onSuccess?: () => void
}

const tokenGuideMap: Record<OARobotType, { title: string; description: string }> = {
  [OARobotType.DINGTALK]: {
    title: '钉钉机器人配置说明',
    description: '群管理 → 添加机器人 → 自定义；安全设置仅支持“加签”。',
  },
  [OARobotType.WXBIZ]: {
    title: '企业微信机器人配置说明',
    description: '群设置 → 添加群机器人 → 新创建。',
  },
  [OARobotType.FEISHU]: {
    title: '飞书机器人配置说明',
    description: '群机器人 → 添加 → 自定义机器人；安全设置仅支持“签名校验”。',
  },
}

const DEFAULT_ROBOT_TYPE = OARobotType.DINGTALK

const feishuAuthenticationTip = `飞书发送图片和“@用户”需要点此链接创建平台应用，并在下方填入平台应用的 AppId 和 AppSecret。
在“开发配置”→“权限管理”中开通“获取与上传图片或文件资源”权限，才可以发送图片；
开通“通过手机号或邮箱获取用户 ID”和“获取用户 userID”权限，才能“@用户”。`

const robotTypeSegmentOptions = oaRobotTypeOptions.map(option => ({
  value: option.value,
  label: (
    <>
      <Image src={option.icon} alt={option.alt} className="size-4" />
      <span>{option.label}</span>
    </>
  ),
}))

function getExtraAuthenticationObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }
  return { ...(value as Record<string, unknown>) }
}

function getFeishuExtraAuthentication(value: unknown): FeishuCredentials {
  const data = getExtraAuthenticationObject(value)
  return {
    feishuAppId: typeof data.feishuAppId === 'string' ? data.feishuAppId : '',
    feishuAppSecret: typeof data.feishuAppSecret === 'string' ? data.feishuAppSecret : '',
  }
}

function resolveSubmitError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === 'string' && error.trim()) {
    return error
  }
  return '提交失败，请稍后重试'
}

function createProfilePayload(
  value: OARobotFormValue,
  feishuCredentials: FeishuCredentials
): OARobotProfilePayload {
  return {
    id: value.id,
    name: value.name,
    desc: value.desc,
    type: value.type,
    accessToken: value.accessToken,
    secret: value.type === OARobotType.WXBIZ ? null : value.secret,
    extraAuthentication:
      value.type === OARobotType.FEISHU
        ? {
            ...getExtraAuthenticationObject(value.extraAuthentication),
            ...feishuCredentials,
          }
        : value.extraAuthentication,
  }
}

function lockProfileImmutableFields(
  value: OARobotFormValue,
  currentProfile?: Pick<OARobotProfilePayload, 'type'>
): OARobotFormValue {
  if (!currentProfile) {
    return value
  }

  return { ...value, type: currentProfile.type }
}

function createLocalProfilePayload(value: OARobotProfilePayload): OARobotLocalProfilePayload {
  return {
    name: value.name,
    desc: value.desc ?? null,
    type: value.type,
    accessToken: value.accessToken ?? null,
    secret: value.type === OARobotType.WXBIZ ? null : (value.secret ?? null),
    extraAuthentication: (value.extraAuthentication ??
      null) as OARobotLocalProfilePayload['extraAuthentication'],
  }
}

function createDefaultFormValue({
  isEditMode,
  editSourceProfile,
  profileId,
  source,
  preferredSource,
}: {
  isEditMode: boolean
  editSourceProfile: OARobotEditSourceProfile
  profileId?: string
  source: OARobotStorageSource
  preferredSource: OARobotStorageSource
}): OARobotFormValue {
  const type = editSourceProfile?.type ?? DEFAULT_ROBOT_TYPE

  return {
    ...(isEditMode ? { id: editSourceProfile?.id ?? profileId } : {}),
    name: editSourceProfile?.name ?? '',
    desc: editSourceProfile?.desc ?? '',
    type,
    accessToken: editSourceProfile?.accessToken ?? '',
    secret: editSourceProfile?.secret ?? (type === OARobotType.WXBIZ ? null : ''),
    extraAuthentication: editSourceProfile?.extraAuthentication ?? undefined,
    storage: isEditMode ? source : preferredSource,
  }
}

function normalizeStorageSource(value: unknown, fallback: OARobotStorageSource) {
  return value === 'cloud' || value === 'local' ? value : fallback
}

function resolveUpdater<TValue>(updater: Updater<TValue>, currentValue: TValue): TValue {
  return typeof updater === 'function'
    ? (updater as (value: TValue) => TValue)(currentValue)
    : updater
}

const storageSourceOptions: Array<{ value: OARobotStorageSource; label: string }> = [
  { value: 'cloud', label: '云端' },
  { value: 'local', label: '浏览器本地' },
]

export function OARobotEditButton({
  children,
  profileId,
  source = 'cloud',
  localProfile,
  onSuccess,
  ...restProps
}: OARobotEditButtonProps) {
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()

  const isEditMode = Boolean(profileId)
  const isLocalProfileEdit = isEditMode && source === 'local'

  const { user } = useSession()
  const preferredSource: OARobotStorageSource = !user && source === 'cloud' ? 'local' : source

  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [feishuAppId, setFeishuAppId] = useState('')
  const [feishuAppSecret, setFeishuAppSecret] = useState('')

  const [localProfiles, setLocalProfiles] = useOARobotLocalProfiles()

  const currentLocalProfile = useMemo(() => {
    if (!isLocalProfileEdit) {
      return undefined
    }
    return findOARobotLocalProfileById(localProfiles, profileId, localProfile)
  }, [isLocalProfileEdit, localProfile, localProfiles, profileId])

  const {
    data: currentProfile,
    isPending: currentProfileLoading,
    refetch: refetchCurrentProfile,
  } = useQuery({
    ...trpc.oaRobot.profile.get.queryOptions({ id: profileId ?? '' }),
    enabled: open && isEditMode && !isLocalProfileEdit,
  })

  const editSourceProfile = isLocalProfileEdit ? currentLocalProfile : currentProfile
  const isProfileLoading = isEditMode && !isLocalProfileEdit && currentProfileLoading

  const defaultValues = useMemo((): OARobotFormValue => {
    return createDefaultFormValue({
      isEditMode,
      editSourceProfile,
      profileId,
      source,
      preferredSource,
    })
  }, [editSourceProfile, isEditMode, preferredSource, profileId, source])

  const form = useForm({
    defaultValues,
    validators: { onSubmit: OARobotFormZod },
    onSubmit: async ({ value }) => {
      setPending(true)
      setSubmitError(null)

      const submitValue = isEditMode ? lockProfileImmutableFields(value, editSourceProfile) : value
      const storageSource = isEditMode ? source : submitValue.storage
      const payload = createProfilePayload(submitValue, { feishuAppId, feishuAppSecret })

      try {
        if (!user && storageSource === 'cloud') {
          setSubmitError('未登录状态下仅支持保存到浏览器本地')
          return
        }

        const localPayload = createLocalProfilePayload(payload)
        if (isLocalProfileEdit && profileId) {
          setLocalProfiles(prev => {
            const prevList = prev ?? []
            return updateOARobotLocalProfile(prevList, profileId, localPayload)
          })
        } else if (!profileId && storageSource === 'local') {
          setLocalProfiles(prev => {
            const prevList = prev ?? []
            return createOARobotLocalProfile(prevList, localPayload)
          })
        } else if (profileId) {
          await trpcClient.oaRobot.profile.update.mutate({
            ...payload,
            id: payload.id ?? profileId,
            type: payload.type as OARobotType,
          })
        } else {
          await trpcClient.oaRobot.profile.add.mutate({
            ...payload,
            type: payload.type as OARobotType,
          })
        }

        const shouldInvalidateCloudList = profileId
          ? !isLocalProfileEdit
          : storageSource === 'cloud'
        if (shouldInvalidateCloudList) {
          await queryClient.invalidateQueries({ queryKey: trpc.oaRobot.profile.list.pathKey() })
        }

        toast.success({
          title: isEditMode ? '更新成功' : '创建成功',
          description: isEditMode
            ? isLocalProfileEdit
              ? '本地 OA 机器人已更新'
              : 'OA 机器人已更新'
            : storageSource === 'local'
              ? '本地 OA 机器人已创建'
              : 'OA 机器人已创建',
        })
        setOpen(false)
        onSuccess?.()
      } catch (error) {
        setSubmitError(resolveSubmitError(error))
      } finally {
        setPending(false)
      }
    },
  })

  const resetForm = useCallback(() => {
    form.reset(defaultValues)
    const extraAuthentication = getFeishuExtraAuthentication(defaultValues.extraAuthentication)
    setFeishuAppId(extraAuthentication.feishuAppId)
    setFeishuAppSecret(extraAuthentication.feishuAppSecret)
  }, [defaultValues, form])

  useEffect(() => {
    resetForm()
  }, [resetForm])

  return (
    <Dialog
      open={open}
      closeOnInteractOutside={false}
      onOpenChange={({ open: nextOpen }) => {
        setOpen(nextOpen)
        if (nextOpen) {
          setSubmitError(null)
          resetForm()
          if (isEditMode && !isLocalProfileEdit) {
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
        <DialogHeader
          title={isEditMode ? '编辑 OA 机器人' : '添加 OA 机器人'}
          description={isEditMode ? '编辑当前 OA 机器人信息。' : '创建一个新的 OA 机器人。'}
        />

        <DialogBody>
          <form
            className="space-y-6"
            onSubmit={event => {
              event.preventDefault()
              event.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <div className="grid items-start gap-6 sm:grid-cols-2">
              <form.Field name="storage">
                {field => (
                  <RadioGroupField
                    field={{
                      state: {
                        value: field.state.value ?? preferredSource,
                        meta: field.state.meta,
                      },
                      handleBlur: field.handleBlur,
                      handleChange: updater => {
                        const currentValue = field.state.value ?? preferredSource
                        const nextValue = resolveUpdater(updater, currentValue)
                        field.handleChange(normalizeStorageSource(nextValue, preferredSource))
                      },
                    }}
                    label="存储位置"
                    options={storageSourceOptions.map(option => ({
                      value: option.value,
                      label: option.label,
                      itemProps: { disabled: isEditMode || (!user && option.value === 'cloud') },
                    }))}
                    groupClassName="flex-row gap-6"
                    disabled={isEditMode}
                    required
                  />
                )}
              </form.Field>

              <form.Field name="type">
                {field => (
                  <SegmentGroupField
                    field={{
                      state: {
                        value: field.state.value ?? DEFAULT_ROBOT_TYPE,
                        meta: field.state.meta,
                      },
                      handleBlur: field.handleBlur,
                      handleChange: updater => {
                        const currentValue = field.state.value ?? DEFAULT_ROBOT_TYPE
                        const nextValue = resolveUpdater(updater, currentValue)
                        const safeNextValue = (nextValue ?? DEFAULT_ROBOT_TYPE) as OARobotType
                        field.handleChange(safeNextValue)
                        if (safeNextValue === OARobotType.WXBIZ) {
                          form.setFieldValue('secret', () => null)
                        }
                      },
                    }}
                    label="OA 机器人类型"
                    required
                    disabled={isEditMode}
                    groupClassName={cn(
                      'w-full rounded-xl bg-zinc-200 p-1 dark:bg-zinc-800',
                      'has-data-invalid:border-destructive'
                    )}
                    itemClassName={cn(
                      'flex flex-1 items-center justify-center rounded-lg px-1 py-1',
                      'text-muted-foreground data-[state=checked]:text-foreground transition-colors',
                      'data-focus-visible:border-transparent data-focus-visible:ring-0'
                    )}
                    itemTextClassName="flex items-center gap-2 text-sm font-medium"
                    indicatorClassName="bg-background rounded-lg"
                    options={robotTypeSegmentOptions}
                  />
                )}
              </form.Field>
            </div>

            <form.Field name="name">
              {field => (
                <InputField
                  field={field}
                  label="名称"
                  required
                  placeholder="给机器人取个名称"
                  disabled={isProfileLoading}
                />
              )}
            </form.Field>

            <form.Field name="desc">
              {field => (
                <TextareaField
                  field={field}
                  label="描述"
                  placeholder="作为补充说明"
                  className="min-h-14"
                  disabled={isProfileLoading}
                />
              )}
            </form.Field>

            <form.Subscribe selector={state => state.values.type ?? DEFAULT_ROBOT_TYPE}>
              {type => {
                const guide = tokenGuideMap[type]
                return <Tips title={guide.title} content={guide.description} />
              }}
            </form.Subscribe>

            <form.Subscribe selector={state => state.values.type ?? DEFAULT_ROBOT_TYPE}>
              {type => {
                const isWxBiz = type === OARobotType.WXBIZ
                const isFeishu = type === OARobotType.FEISHU
                return (
                  <div className="grid items-start gap-6 sm:grid-cols-2">
                    <form.Field name="accessToken">
                      {field => (
                        <InputField
                          field={field}
                          label="Webhook 令牌"
                          placeholder="请输入 Webhook 令牌"
                          fieldClassName={isWxBiz ? 'sm:col-span-2' : undefined}
                          disabled={isProfileLoading}
                        />
                      )}
                    </form.Field>

                    {!isWxBiz ? (
                      <form.Field name="secret">
                        {field => (
                          <InputField
                            field={field}
                            label="密钥"
                            placeholder="请输入密钥"
                            disabled={isProfileLoading}
                          />
                        )}
                      </form.Field>
                    ) : null}

                    {isFeishu ? (
                      <>
                        <Field>
                          <FieldLabel>飞书 AppId</FieldLabel>
                          <Input
                            value={feishuAppId}
                            onChange={event => setFeishuAppId(event.target.value)}
                            placeholder="请输入飞书 AppId"
                            disabled={isProfileLoading}
                          />
                        </Field>

                        <Field>
                          <FieldLabel>飞书 AppSecret</FieldLabel>
                          <Input
                            value={feishuAppSecret}
                            onChange={event => setFeishuAppSecret(event.target.value)}
                            placeholder="请输入飞书 AppSecret"
                            disabled={isProfileLoading}
                          />
                        </Field>

                        <Tips title="关于 AppId 和 AppSecret" content={feishuAuthenticationTip} />
                      </>
                    ) : null}
                  </div>
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
              void form.handleSubmit()
            }}
          >
            {pending
              ? isEditMode
                ? '保存中...'
                : '创建中...'
              : isEditMode
                ? '保存编辑'
                : '完成创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
