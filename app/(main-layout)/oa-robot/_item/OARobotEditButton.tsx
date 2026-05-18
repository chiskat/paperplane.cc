'use client'

import { useForm } from '@tanstack/react-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { useEffect, useMemo, useState, type ComponentProps, type ReactNode } from 'react'
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

const OARobotFormZod = OARobotProfileZod.extend({
  storage: z.enum(['local', 'cloud']),
})

export type OARobotFormValue = input<typeof OARobotFormZod>

export interface OARobotEditButtonProps extends Omit<ComponentProps<typeof Button>, 'onSubmit'> {
  children: ReactNode
  profileId?: string
  source?: OARobotStorageSource
  localProfile?: OARobotLocalProfile
  onSuccess?: () => void
}

const DEFAULT_ROBOT_TYPE = OARobotType.DINGTALK

const TOKEN_GUIDE_MAP: Record<OARobotType, { title: string; description: string }> = {
  [OARobotType.DINGTALK]: {
    title: '钉钉机器人配置说明',
    description: '群管理 → 添加机器人 → 自定义；安全设置仅支持"加签"。',
  },
  [OARobotType.WXBIZ]: {
    title: '企业微信机器人配置说明',
    description: '群设置 → 添加群机器人 → 新创建。',
  },
  [OARobotType.FEISHU]: {
    title: '飞书机器人配置说明',
    description: '群机器人 → 添加 → 自定义机器人；安全设置仅支持"签名校验"。',
  },
}

const FEISHU_AUTH_TIP =
  '飞书发送图片和"@用户"需要点此链接创建平台应用，并在下方填入平台应用的 AppId 和 AppSecret。在"开发配置"→"权限管理"中开通"获取与上传图片或文件资源"权限，才可以发送图片；开通"通过手机号或邮箱获取用户 ID"和"获取用户 userID"权限，才能"@用户"。'

const ROBOT_TYPE_OPTIONS = oaRobotTypeOptions.map(option => ({
  value: option.value,
  label: (
    <>
      <Image src={option.icon} alt={option.alt} className="size-4" />
      <span>{option.label}</span>
    </>
  ),
}))

const STORAGE_OPTIONS: Array<{ value: OARobotStorageSource; label: string }> = [
  { value: 'cloud', label: '云端' },
  { value: 'local', label: '浏览器本地' },
]

function getFeishuCredentials(extraAuth: unknown) {
  const data =
    extraAuth && typeof extraAuth === 'object' && !Array.isArray(extraAuth)
      ? (extraAuth as Record<string, unknown>)
      : {}
  return {
    feishuAppId: typeof data.feishuAppId === 'string' ? data.feishuAppId : '',
    feishuAppSecret: typeof data.feishuAppSecret === 'string' ? data.feishuAppSecret : '',
  }
}

function createLocalPayload(
  value: OARobotFormValue,
  feishuCreds: { feishuAppId: string; feishuAppSecret: string }
): OARobotLocalProfilePayload {
  const hasFeishuCreds = feishuCreds.feishuAppId || feishuCreds.feishuAppSecret
  const extraAuth =
    value.type === OARobotType.FEISHU && hasFeishuCreds
      ? { ...((value.extraAuthentication as object) || {}), ...feishuCreds }
      : value.extraAuthentication

  return {
    name: value.name,
    desc: value.desc || null,
    type: value.type,
    accessToken: value.accessToken || null,
    secret: value.type === OARobotType.WXBIZ ? null : value.secret || null,
    extraAuthentication: extraAuth as OARobotLocalProfilePayload['extraAuthentication'],
  }
}

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
  const isLocalEdit = isEditMode && source === 'local'

  const { user } = useSession()
  const preferredSource: OARobotStorageSource = !user && source === 'cloud' ? 'local' : source

  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [feishuAppId, setFeishuAppId] = useState('')
  const [feishuAppSecret, setFeishuAppSecret] = useState('')

  const [localProfiles, setLocalProfiles] = useOARobotLocalProfiles()

  const currentLocalProfile = useMemo(() => {
    if (!isLocalEdit) return undefined
    return findOARobotLocalProfileById(localProfiles, profileId, localProfile)
  }, [isLocalEdit, localProfile, localProfiles, profileId])

  const {
    data: currentProfile,
    isPending: isLoadingProfile,
    refetch: refetchProfile,
  } = useQuery({
    ...trpc.oaRobot.profile.get.queryOptions({ id: profileId ?? '' }),
    enabled: open && isEditMode && !isLocalEdit,
  })

  const editSourceProfile = isLocalEdit ? currentLocalProfile : currentProfile
  const isLoading = isEditMode && !isLocalEdit && isLoadingProfile

  const defaultValues = useMemo((): OARobotFormValue => {
    const type = editSourceProfile?.type ?? DEFAULT_ROBOT_TYPE
    return {
      ...(isEditMode && editSourceProfile?.id ? { id: editSourceProfile.id } : {}),
      name: editSourceProfile?.name ?? '',
      desc: editSourceProfile?.desc ?? '',
      type,
      accessToken: editSourceProfile?.accessToken ?? '',
      secret: editSourceProfile?.secret ?? (type === OARobotType.WXBIZ ? null : ''),
      extraAuthentication: editSourceProfile?.extraAuthentication,
      storage: isEditMode ? source : preferredSource,
    }
  }, [editSourceProfile, isEditMode, preferredSource, source])

  const form = useForm({
    defaultValues,
    validators: { onSubmit: OARobotFormZod },
    onSubmit: async ({ value }) => {
      setPending(true)

      const submitValue =
        isEditMode && editSourceProfile ? { ...value, type: editSourceProfile.type } : value
      const storageSource = isEditMode ? source : submitValue.storage
      const payload = createLocalPayload(submitValue, { feishuAppId, feishuAppSecret })

      try {
        if (!user && storageSource === 'cloud') {
          throw new Error('未登录状态下仅支持保存到浏览器本地')
        }

        if (isLocalEdit && profileId) {
          setLocalProfiles(prev => updateOARobotLocalProfile(prev ?? [], profileId, payload))
        } else if (!profileId && storageSource === 'local') {
          setLocalProfiles(prev => createOARobotLocalProfile(prev ?? [], payload))
        } else if (profileId) {
          await trpcClient.oaRobot.profile.update.mutate({
            id: profileId,
            name: payload.name,
            desc: payload.desc ?? undefined,
            type: payload.type as OARobotType,
            accessToken: payload.accessToken ?? undefined,
            secret: payload.secret ?? undefined,
            extraAuthentication: payload.extraAuthentication ?? undefined,
          })
        } else {
          await trpcClient.oaRobot.profile.add.mutate({
            name: payload.name,
            desc: payload.desc ?? undefined,
            type: payload.type as OARobotType,
            accessToken: payload.accessToken ?? undefined,
            secret: payload.secret ?? undefined,
            extraAuthentication: payload.extraAuthentication ?? undefined,
          })
        }

        const shouldInvalidate = profileId ? !isLocalEdit : storageSource === 'cloud'
        if (shouldInvalidate) {
          await queryClient.invalidateQueries({ queryKey: trpc.oaRobot.profile.list.pathKey() })
        }

        const storageLabel = storageSource === 'local' ? '本地' : ''
        toast.success({
          title: isEditMode ? '更新成功' : '创建成功',
          description: `${storageLabel}OA 机器人已${isEditMode ? '更新' : '创建'}`,
        })
        setOpen(false)
        onSuccess?.()
      } catch (error) {
        const message =
          error instanceof Error && error.message ? error.message : '提交失败，请稍后重试'
        toast.error({ title: '操作失败', description: message })
      } finally {
        setPending(false)
      }
    },
  })

  const resetForm = () => {
    form.reset(defaultValues)
    const creds = getFeishuCredentials(defaultValues.extraAuthentication)
    setFeishuAppId(creds.feishuAppId)
    setFeishuAppSecret(creds.feishuAppSecret)
  }

  useEffect(() => {
    resetForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues])

  return (
    <Dialog
      open={open}
      closeOnInteractOutside={false}
      onOpenChange={({ open: nextOpen }) => {
        setOpen(nextOpen)
        if (nextOpen) {
          resetForm()
          if (isEditMode && !isLocalEdit) refetchProfile()
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
                        const nextValue =
                          typeof updater === 'function' ? updater(currentValue) : updater
                        const safeValue =
                          nextValue === 'cloud' || nextValue === 'local'
                            ? nextValue
                            : preferredSource
                        field.handleChange(safeValue)
                      },
                    }}
                    label="存储位置"
                    options={STORAGE_OPTIONS.map(option => ({
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
                        const nextValue =
                          typeof updater === 'function' ? updater(currentValue) : updater
                        const safeValue = (nextValue ?? DEFAULT_ROBOT_TYPE) as OARobotType
                        field.handleChange(safeValue)
                        if (safeValue === OARobotType.WXBIZ) {
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
                    options={ROBOT_TYPE_OPTIONS}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              )}
            </form.Field>

            <form.Subscribe selector={state => state.values.type ?? DEFAULT_ROBOT_TYPE}>
              {type => {
                const guide = TOKEN_GUIDE_MAP[type]
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
                          disabled={isLoading}
                        />
                      )}
                    </form.Field>

                    {!isWxBiz && (
                      <form.Field name="secret">
                        {field => (
                          <InputField
                            field={field}
                            label="密钥"
                            placeholder="请输入密钥"
                            disabled={isLoading}
                          />
                        )}
                      </form.Field>
                    )}

                    {isFeishu && (
                      <>
                        <Field>
                          <FieldLabel>飞书 AppId</FieldLabel>
                          <Input
                            value={feishuAppId}
                            onChange={event => setFeishuAppId(event.target.value)}
                            placeholder="请输入飞书 AppId"
                            disabled={isLoading}
                          />
                        </Field>

                        <Field>
                          <FieldLabel>飞书 AppSecret</FieldLabel>
                          <Input
                            value={feishuAppSecret}
                            onChange={event => setFeishuAppSecret(event.target.value)}
                            placeholder="请输入飞书 AppSecret"
                            disabled={isLoading}
                          />
                        </Field>

                        <Tips title="关于 AppId 和 AppSecret" content={FEISHU_AUTH_TIP} />
                      </>
                    )}
                  </div>
                )
              }}
            </form.Subscribe>
          </form>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={pending}
            onClick={() => setOpen(false)}
          >
            取消
          </Button>

          <Button
            type="button"
            size="lg"
            disabled={pending}
            onClick={() => void form.handleSubmit()}
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
