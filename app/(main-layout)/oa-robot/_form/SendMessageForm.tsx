'use client'

import { IconApi } from '@tabler/icons-react'
import { useForm } from '@tanstack/react-form'
import Image from 'next/image'
import { useState } from 'react'

import { CheckboxField } from '@/components/field/checkbox'
import { InputField } from '@/components/field/input'
import { SegmentGroupField } from '@/components/field/segment-group'
import { TextareaField } from '@/components/field/textarea'
import { formatFieldErrors, type TanstackFieldLike } from '@/components/field/utils'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { useTRPCClient } from '@/lib/trpc-client'
import { OARobotMessageType, OARobotMessageZod } from '@/lib/zods/oa-robot'
import { OARobotType } from '@/models/enums'
import { SendMessageAPIDocButton } from './SendMessageAPIDocButton'
import { SendMessageFieldAtList } from './SendMessageFieldAtList'
import { SendMessageImageUpload } from './SendMessageFieldUpload'
import { SendMessagePlaceholder } from './SendMessagePlaceholder'
import { SendMessageTipsImage, SendMessageTipsMarkdown } from './SendMessageTips'
import type { OARobotListSelectedProfile } from '../_list/List'
import type { OARobotLocalProfile } from '../localProfileStorage'
import { oaRobotTypeIconMap } from '../robot-icon'

type SendMessageFormProps = {
  selectedProfile: OARobotListSelectedProfile | null
}

type MessageTypeValue = 'text' | 'markdown' | 'image'

type SendMessageFormValue = {
  type: MessageTypeValue
  text: string
  markdown: string
  title: string
  atAll: boolean
  atList: string[]
  imageURL: string | undefined
}

type SendMessageFieldName = keyof SendMessageFormValue
type FormApi = ReturnType<typeof useSendMessageForm>
type FieldProps = { form: FormApi; robotType: OARobotType; disabled: boolean }

const defaultMessageType: MessageTypeValue = 'text'

const defaultValues: SendMessageFormValue = {
  type: defaultMessageType,
  text: '',
  markdown: '',
  title: '',
  atAll: false,
  atList: [],
  imageURL: undefined,
}

const messageTypeOptions: Array<{ value: MessageTypeValue; label: string }> = [
  { value: 'text', label: '文本' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'image', label: '图片' },
]

const atAllDescriptions: Partial<Record<OARobotType, string>> = {
  [OARobotType.DINGTALK]:
    '可通过消息中的“@all”来调整“@所有人”文本的位置，默认在消息的末尾；开启后无法“@用户”',
  [OARobotType.FEISHU]: '可通过消息中的“@all”来调整“@所有人”文本的位置，默认在消息的末尾',
  [OARobotType.WXBIZ]: '消息末尾会“@所有人”且无法调整位置',
}

function normalizeAtList(value: string[]) {
  return Array.from(new Set(value.map(item => item.trim()).filter(Boolean)))
}

function buildMentionInput(value: SendMessageFormValue, robotType: OARobotType) {
  return {
    atAll: value.atAll,
    atList: robotType === OARobotType.DINGTALK && value.atAll ? [] : normalizeAtList(value.atList),
  }
}

function isMarkdownMentionSupported(robotType: OARobotType) {
  return robotType !== OARobotType.WXBIZ
}

const asField = <T,>(field: unknown) => field as TanstackFieldLike<T | null | undefined>

function asMessageTypeField(field: unknown): TanstackFieldLike<string | null | undefined> {
  const typed = asField<MessageTypeValue>(field)
  return {
    state: { value: typed.state.value ?? defaultMessageType, meta: typed.state.meta },
    handleBlur: typed.handleBlur,
    handleChange: updater => {
      const current = typed.state.value ?? defaultMessageType
      const next = typeof updater === 'function' ? updater(current) : updater
      typed.handleChange(() => (next as MessageTypeValue) || defaultMessageType)
    },
  }
}

function getMessageFormIssueField(path: readonly unknown[] | undefined) {
  const fieldName = path?.[0]
  if (typeof fieldName === 'string' && fieldName in defaultValues) {
    return fieldName as SendMessageFieldName
  }
  return undefined
}

function SendMessageTypeField({ form, disabled }: Pick<FieldProps, 'form' | 'disabled'>) {
  return (
    <form.Field name="type">
      {field => (
        <SegmentGroupField
          field={asMessageTypeField(field)}
          label="消息类型"
          options={messageTypeOptions}
          disabled={disabled}
          fieldClassName="w-full sm:w-1/2"
          groupClassName="w-full rounded-xl bg-zinc-200 p-1 dark:bg-zinc-800"
          itemClassName="text-muted-foreground data-[state=checked]:text-foreground flex flex-1 items-center justify-center rounded-lg px-3 py-1.5 transition-colors"
          itemTextClassName="text-sm font-medium"
          indicatorClassName="bg-background rounded-lg"
        />
      )}
    </form.Field>
  )
}

function MentionFields({ form, robotType, disabled }: FieldProps) {
  return (
    <div className="grid items-start gap-6 sm:grid-cols-2">
      <form.Field name="atAll">
        {field => (
          <CheckboxField
            field={asField<boolean>(field)}
            label="@所有人"
            description={atAllDescriptions[robotType]}
            disabled={disabled}
          />
        )}
      </form.Field>

      <form.Subscribe selector={state => state.values.atAll}>
        {atAll => (
          <form.Field name="atList">
            {field => {
              const typedField = asField<string[]>(field)
              const isDisabled = disabled || (robotType === OARobotType.DINGTALK && atAll === true)
              const errorMessage = formatFieldErrors(typedField.state.meta.errors)

              return (
                <SendMessageFieldAtList
                  value={typedField.state.value ?? []}
                  disabled={isDisabled}
                  onChange={nextValue => typedField.handleChange(() => nextValue)}
                  onBlur={typedField.handleBlur}
                  invalid={typedField.state.meta.isValid === false}
                  errorMessage={errorMessage}
                />
              )
            }}
          </form.Field>
        )}
      </form.Subscribe>
    </div>
  )
}

function SendMessageTextFields({ form, robotType, disabled }: FieldProps) {
  return (
    <>
      <form.Field name="text">
        {field => (
          <TextareaField
            field={asField<string>(field)}
            label="文本内容"
            required
            disabled={disabled}
            className="min-h-28"
            placeholder="请输入要发送的文本消息"
          />
        )}
      </form.Field>

      <MentionFields form={form} robotType={robotType} disabled={disabled} />
    </>
  )
}

function SendMessageMarkdownFields({ form, robotType, disabled }: FieldProps) {
  const supportsMention = isMarkdownMentionSupported(robotType)

  return (
    <>
      <form.Field name="markdown">
        {field => (
          <TextareaField
            field={asField<string>(field)}
            label="Markdown 内容"
            required
            disabled={disabled}
            className="min-h-32"
            placeholder="请输入 Markdown 消息内容"
          />
        )}
      </form.Field>

      {SendMessageTipsMarkdown(robotType)}

      {supportsMention && (
        <form.Field name="title">
          {field => (
            <InputField
              field={asField<string>(field)}
              label={robotType === OARobotType.DINGTALK ? '钉钉推送标题' : '飞书富文本标题'}
              disabled={disabled}
              placeholder="留空则会从 Markdown 自动提取"
            />
          )}
        </form.Field>
      )}

      {supportsMention && <MentionFields form={form} robotType={robotType} disabled={disabled} />}
    </>
  )
}

function SendMessageImageFields({ form, robotType, disabled }: FieldProps) {
  return (
    <>
      <form.Field name="imageURL">
        {field => {
          const errorMessage = formatFieldErrors(field.state.meta.errors)

          return (
            <SendMessageImageUpload
              value={field.state.value}
              disabled={disabled}
              invalid={field.state.meta.isValid === false}
              errorMessage={errorMessage}
              onChange={imageURL => field.handleChange(() => imageURL)}
            />
          )
        }}
      </form.Field>

      {robotType === OARobotType.DINGTALK && (
        <form.Field name="title">
          {field => (
            <InputField
              field={asField<string>(field)}
              label="钉钉通知标题"
              disabled={disabled}
              placeholder="可留空，将显示为“[图片]”"
            />
          )}
        </form.Field>
      )}

      {SendMessageTipsImage(robotType)}
    </>
  )
}

function SendMessageFields({ form, robotType, disabled }: FieldProps) {
  return (
    <form.Subscribe selector={state => state.values.type}>
      {type => {
        const props = { form, robotType, disabled }
        if (type === 'text') return <SendMessageTextFields {...props} />
        if (type === 'markdown') return <SendMessageMarkdownFields {...props} />
        return <SendMessageImageFields {...props} />
      }}
    </form.Subscribe>
  )
}

function SendMessageProfileHeader({
  selectedProfile,
}: {
  selectedProfile: OARobotListSelectedProfile
}) {
  const robotTypeMeta = oaRobotTypeIconMap[selectedProfile.profile.type]
  const profileSourceText = selectedProfile.source === 'local' ? '本地' : '云端'
  const robotId = selectedProfile.source === 'cloud' ? selectedProfile.profile.id : null

  return (
    <div className="flex items-stretch gap-3">
      <Image
        src={robotTypeMeta.icon}
        alt={robotTypeMeta.alt}
        className="h-full w-13 shrink-0 object-contain"
      />

      <div className="min-w-0">
        <p className="truncate text-lg font-semibold text-slate-900">
          {selectedProfile.profile.name}
        </p>

        <p className="mt-0.5 text-sm text-slate-600 [&>span:not(:first-child)]:before:mx-1 [&>span:not(:first-child)]:before:content-['·'] [&>span:not(:first-child)]:before:select-none">
          <span>{robotTypeMeta.label}机器人</span>
          <span>{profileSourceText}</span>
          {selectedProfile.source === 'cloud' && (
            <span>
              <code className="select-all">{robotId}</code>
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

function buildMessagePayloadInput(value: SendMessageFormValue, robotType: OARobotType) {
  const title = value.title.trim()
  const mention = buildMentionInput(value, robotType)

  if (value.type === 'text') {
    return { message: OARobotMessageType.TEXT, text: value.text.trim(), ...mention }
  }

  if (value.type === 'markdown') {
    const base = { message: OARobotMessageType.MARKDOWN, markdown: value.markdown.trim() }
    if (!isMarkdownMentionSupported(robotType)) return base
    return { ...base, title: title || undefined, ...mention }
  }

  return {
    message: OARobotMessageType.IMAGE,
    imageURL: value.imageURL,
    title: robotType === OARobotType.DINGTALK ? title || undefined : undefined,
  }
}

function buildMessagePayload(value: SendMessageFormValue, robotType: OARobotType) {
  return OARobotMessageZod.parse(buildMessagePayloadInput(value, robotType))
}

function validateMessageFormValue(value: SendMessageFormValue, robotType: OARobotType) {
  const result = OARobotMessageZod.safeParse(buildMessagePayloadInput(value, robotType))
  if (result.success) return undefined

  const fields: Partial<Record<SendMessageFieldName, unknown[]>> = {}
  for (const issue of result.error.issues) {
    const fieldName = getMessageFormIssueField(issue.path)
    if (fieldName) fields[fieldName] = [...(fields[fieldName] ?? []), issue]
  }
  return { fields }
}

type UseSendMessageFormOptions = {
  selectedProfile: OARobotListSelectedProfile | null
  robotType: OARobotType | undefined
  trpcClient: ReturnType<typeof useTRPCClient>
  setPending: (pending: boolean) => void
  setSubmitError: (message: string | null) => void
}

function useSendMessageForm({
  selectedProfile,
  robotType,
  trpcClient,
  setPending,
  setSubmitError,
}: UseSendMessageFormOptions) {
  return useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => (robotType ? validateMessageFormValue(value, robotType) : undefined),
    },
    onSubmit: async ({ value, formApi }) => {
      if (!selectedProfile) {
        setSubmitError('请先在左侧列表中选择一个 OA 机器人')
        return
      }

      setPending(true)
      setSubmitError(null)

      try {
        const { profile, source } = selectedProfile
        const message = buildMessagePayload(value, profile.type)

        if (source === 'cloud') {
          await trpcClient.oaRobot.messages.sendById.mutate({ robotId: profile.id, ...message })
        } else {
          const local = profile as OARobotLocalProfile
          await trpcClient.oaRobot.messages.sendByConfig.mutate({
            type: local.type,
            accessToken: local.accessToken,
            secret: local.secret,
            extraAuthentication: local.extraAuthentication,
            ...message,
          })
        }

        toast.success({ title: '发送成功', description: '消息已提交给机器人' })
        formApi.reset({ ...defaultValues, type: value.type })
      } catch (error) {
        const message = formatFieldErrors([error]) || '发送失败，请稍后重试'
        setSubmitError(message)
        toast.error({ title: '发送失败', description: message })
      } finally {
        setPending(false)
      }
    },
  })
}

export default function SendMessageForm({ selectedProfile }: SendMessageFormProps) {
  const trpcClient = useTRPCClient()
  const [pending, setPending] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useSendMessageForm({
    selectedProfile,
    robotType: selectedProfile?.profile.type,
    trpcClient,
    setPending,
    setSubmitError,
  })

  if (!selectedProfile) return <SendMessagePlaceholder />

  const disabled = pending || !selectedProfile
  const robotType = selectedProfile.profile.type

  return (
    <div className="bg-white">
      <SendMessageProfileHeader selectedProfile={selectedProfile} />

      <form
        noValidate
        className="mt-6 flex flex-col gap-6"
        onSubmit={event => {
          event.preventDefault()
          event.stopPropagation()
          setSubmitError(null)
          void form.handleSubmit()
        }}
      >
        <SendMessageTypeField form={form} disabled={disabled} />
        <SendMessageFields form={form} robotType={robotType} disabled={disabled} />

        {submitError && (
          <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-base text-rose-700">
            {submitError}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          {selectedProfile.source === 'cloud' ? (
            <SendMessageAPIDocButton
              variant="outline"
              size="lg"
              robotId={selectedProfile.profile.id}
            >
              <IconApi />
              通过 API 发送消息
            </SendMessageAPIDocButton>
          ) : null}

          <Button type="submit" size="lg" disabled={disabled}>
            {pending ? '发送中...' : '发送消息'}
          </Button>
        </div>
      </form>
    </div>
  )
}
