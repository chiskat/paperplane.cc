'use client'

import { useForm } from '@tanstack/react-form'
import Image from 'next/image'
import { useState } from 'react'

import { CheckboxField } from '@/components/field/checkbox'
import { InputField } from '@/components/field/input'
import { SegmentGroupField } from '@/components/field/segment-group'
import { TextareaField } from '@/components/field/textarea'
import { formatFieldErrors, type TanstackFieldLike } from '@/components/field/utils'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel, FieldRequiredIndicator } from '@/components/ui/field'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadDropzoneIcon,
  FileUploadItem,
  FileUploadItemGroup,
  FileUploadItemPreview,
  FileUploadItemPreviewImage,
  FileUploadTitle,
  FileUploadTrigger,
} from '@/components/ui/file-upload'
import { toast } from '@/components/ui/toast'
import { useTRPCClient } from '@/lib/trpc-client'
import { OARobotMessageType, OARobotMessageZod } from '@/lib/zods/oa-robot'
import { OARobotType } from '@/models/enums'
import type { OARobotListSelectedProfile } from './List'
import type { OARobotLocalProfile } from './localProfileStorage'
import { oaRobotTypeIconMap } from './robot-icon'
import { SendMessageFieldAtList } from './SendMessageFieldAtList'
import { SendMessagePlaceholder } from './SendMessagePlaceholder'
import { SendMessageTipsImage, SendMessageTipsMarkdown } from './SendMessageTips'

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
  image: File | undefined
}

type SendMessageFieldName = keyof SendMessageFormValue
type SendMessageFormApi = ReturnType<typeof useSendMessageForm>
type SendMessageFormSectionProps = {
  form: SendMessageFormApi
  robotType: OARobotType
  disabled: boolean
}

const defaultMessageType: MessageTypeValue = 'text'

const defaultValues: SendMessageFormValue = {
  type: defaultMessageType,
  text: '',
  markdown: '',
  title: '',
  atAll: false,
  atList: [],
  image: undefined,
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

function getMessageFormIssueField(path: readonly unknown[] | undefined) {
  const fieldName = path?.[0]
  if (typeof fieldName === 'string' && fieldName in defaultValues) {
    return fieldName as SendMessageFieldName
  }
  return undefined
}

const asStringField = (field: unknown) => field as TanstackFieldLike<string | null | undefined>
const asBooleanField = (field: unknown) => field as TanstackFieldLike<boolean | null | undefined>
const asStringListField = (field: unknown) =>
  field as TanstackFieldLike<string[] | null | undefined>

function asMessageTypeField(field: unknown) {
  const typedField = field as TanstackFieldLike<MessageTypeValue | null | undefined>

  const segmentField: TanstackFieldLike<string | null | undefined> = {
    state: {
      value: typedField.state.value ?? defaultMessageType,
      meta: typedField.state.meta,
    },
    handleBlur: typedField.handleBlur,
    handleChange: updater => {
      const currentValue = typedField.state.value ?? defaultMessageType
      const nextValue = typeof updater === 'function' ? updater(currentValue) : updater
      typedField.handleChange(
        () => (nextValue as MessageTypeValue | null | undefined) || defaultMessageType
      )
    },
  }

  return segmentField
}

function isMarkdownMentionSupported(robotType: OARobotType) {
  return robotType !== OARobotType.WXBIZ
}

function SendMessageTypeField({
  form,
  disabled,
}: Pick<SendMessageFormSectionProps, 'form' | 'disabled'>) {
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

function SendMessageMentionFieldsContainer({
  form,
  robotType,
  disabled,
}: SendMessageFormSectionProps) {
  return (
    <div className="grid items-start gap-6 sm:grid-cols-2">
      <form.Field name="atAll">
        {atAllField => (
          <CheckboxField
            field={asBooleanField(atAllField)}
            label="@所有人"
            description={atAllDescriptions[robotType]}
            disabled={disabled}
          />
        )}
      </form.Field>

      <form.Subscribe selector={state => state.values.atAll}>
        {atAll => (
          <form.Field name="atList">
            {atListField => {
              const field = asStringListField(atListField)
              const atListDisabled =
                disabled || (robotType === OARobotType.DINGTALK && atAll === true)
              const errorMessage = formatFieldErrors(field.state.meta.errors)

              return (
                <SendMessageFieldAtList
                  value={field.state.value ?? []}
                  disabled={atListDisabled}
                  onChange={nextValue => field.handleChange(() => nextValue)}
                  onBlur={field.handleBlur}
                  invalid={field.state.meta.isValid === false}
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

type SendMessageImageUploadProps = {
  value: File | undefined
  disabled: boolean
  onChange: (file: File | undefined) => void
}

function SendMessageImageUpload({ value, disabled, onChange }: SendMessageImageUploadProps) {
  const acceptedFiles = value ? [value] : []

  return (
    <FileUpload
      maxFiles={1}
      accept="image/*"
      disabled={disabled}
      acceptedFiles={acceptedFiles}
      onFileChange={details => onChange(details.acceptedFiles[0] || undefined)}
    >
      {value ? (
        <FileUploadItemGroup className="m-0 list-none p-0">
          <FileUploadItem file={value} className="bg-card block overflow-hidden rounded-2xl border">
            <div className="bg-muted relative aspect-video">
              <FileUploadItemPreview
                className="size-full rounded-none bg-transparent"
                type="image/*"
              >
                <FileUploadItemPreviewImage className="rounded-none object-contain" />
              </FileUploadItemPreview>
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{value.name}</p>
                <p className="text-muted-foreground text-xs">
                  {(value.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <FileUploadTrigger asChild>
                <Button type="button" size="sm" variant="outline" disabled={disabled}>
                  重新选择
                </Button>
              </FileUploadTrigger>
            </div>
          </FileUploadItem>
        </FileUploadItemGroup>
      ) : (
        <FileUploadDropzone>
          <FileUploadDropzoneIcon />
          <FileUploadTitle>点击或拖拽上传图片</FileUploadTitle>
        </FileUploadDropzone>
      )}
    </FileUpload>
  )
}

function SendMessageTextFields({ form, robotType, disabled }: SendMessageFormSectionProps) {
  return (
    <>
      <form.Field name="text">
        {field => (
          <TextareaField
            field={asStringField(field)}
            label="文本内容"
            required
            disabled={disabled}
            className="min-h-28"
            placeholder="请输入要发送的文本消息"
          />
        )}
      </form.Field>

      <SendMessageMentionFieldsContainer form={form} robotType={robotType} disabled={disabled} />
    </>
  )
}

function SendMessageMarkdownFields({ form, robotType, disabled }: SendMessageFormSectionProps) {
  const supportsMention = isMarkdownMentionSupported(robotType)

  return (
    <>
      <form.Field name="markdown">
        {field => (
          <TextareaField
            field={asStringField(field)}
            label="Markdown 内容"
            required
            disabled={disabled}
            className="min-h-32"
            placeholder="请输入 Markdown 消息内容"
          />
        )}
      </form.Field>

      {SendMessageTipsMarkdown(robotType)}

      {supportsMention ? (
        <form.Field name="title">
          {field => (
            <InputField
              field={asStringField(field)}
              label={robotType === OARobotType.DINGTALK ? '钉钉推送标题' : '飞书富文本标题'}
              disabled={disabled}
              placeholder="留空则会从 Markdown 自动提取"
            />
          )}
        </form.Field>
      ) : null}

      {supportsMention ? (
        <SendMessageMentionFieldsContainer form={form} robotType={robotType} disabled={disabled} />
      ) : null}
    </>
  )
}

function SendMessageImageFields({ form, robotType, disabled }: SendMessageFormSectionProps) {
  return (
    <>
      <form.Field name="image">
        {field => {
          const errorMessage = formatFieldErrors(field.state.meta.errors)

          return (
            <Field required invalid={field.state.meta.isValid === false}>
              <FieldLabel>
                上传图片
                <FieldRequiredIndicator />
              </FieldLabel>

              <SendMessageImageUpload
                value={field.state.value}
                disabled={disabled}
                onChange={file => field.handleChange(() => file)}
              />

              {!field.state.meta.isValid && errorMessage ? (
                <FieldError>{errorMessage}</FieldError>
              ) : null}
            </Field>
          )
        }}
      </form.Field>

      {robotType === OARobotType.DINGTALK ? (
        <form.Field name="title">
          {field => (
            <InputField
              field={asStringField(field)}
              label="钉钉通知标题"
              disabled={disabled}
              placeholder="可留空，将显示为“[图片]”"
            />
          )}
        </form.Field>
      ) : null}

      {SendMessageTipsImage(robotType)}
    </>
  )
}

function SendMessageFields({ form, robotType, disabled }: SendMessageFormSectionProps) {
  return (
    <form.Subscribe selector={state => state.values.type}>
      {type => {
        if (type === 'text') {
          return <SendMessageTextFields form={form} robotType={robotType} disabled={disabled} />
        } else if (type === 'markdown') {
          return <SendMessageMarkdownFields form={form} robotType={robotType} disabled={disabled} />
        } else {
          return <SendMessageImageFields form={form} robotType={robotType} disabled={disabled} />
        }
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
        <p className="text-sm text-slate-600">
          {robotTypeMeta.label}机器人 · {profileSourceText}
        </p>
      </div>
    </div>
  )
}

function buildMessagePayloadInput(value: SendMessageFormValue, robotType: OARobotType) {
  const title = value.title.trim()

  switch (value.type) {
    case 'text':
      return {
        type: OARobotMessageType.TEXT,
        text: value.text.trim(),
        ...buildMentionInput(value, robotType),
      }

    case 'markdown':
      if (!isMarkdownMentionSupported(robotType)) {
        return {
          type: OARobotMessageType.MARKDOWN,
          markdown: value.markdown.trim(),
        }
      }

      return {
        type: OARobotMessageType.MARKDOWN,
        markdown: value.markdown.trim(),
        title: title || undefined,
        ...buildMentionInput(value, robotType),
      }

    case 'image':
      return {
        type: OARobotMessageType.IMAGE,
        image: value.image,
        title: robotType === OARobotType.DINGTALK ? title || undefined : undefined,
      }
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
    if (!fieldName) continue
    fields[fieldName] = [...(fields[fieldName] ?? []), issue]
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
  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => (robotType ? validateMessageFormValue(value, robotType) : undefined),
    },
    onSubmit: async ({ value }) => {
      if (!selectedProfile) {
        setSubmitError('请先在左侧列表中选择一个 OA 机器人')
        return
      }

      setPending(true)
      setSubmitError(null)

      try {
        const robotType = selectedProfile.profile.type
        const message = buildMessagePayload(value, robotType)

        if (selectedProfile.source === 'cloud') {
          await trpcClient.oaRobot.messages.sendById.mutate({
            robotId: selectedProfile.profile.id,
            message,
          })
        } else {
          const localProfile = selectedProfile.profile as OARobotLocalProfile
          await trpcClient.oaRobot.messages.sendByConfig.mutate({
            type: localProfile.type,
            accessToken: localProfile.accessToken,
            secret: localProfile.secret,
            extraAuthentication: localProfile.extraAuthentication,
            message,
          })
        }

        toast.success({ title: '发送成功', description: '消息已提交给机器人' })
        form.reset({ ...defaultValues, type: value.type })
      } catch (error) {
        const message = formatFieldErrors([error]) || '发送失败，请稍后重试'
        setSubmitError(message)
        toast.error({ title: '发送失败', description: message })
      } finally {
        setPending(false)
      }
    },
  })

  return form
}

export default function SendMessageForm({ selectedProfile }: SendMessageFormProps) {
  const trpcClient = useTRPCClient()
  const [pending, setPending] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const robotType = selectedProfile?.profile.type

  const form = useSendMessageForm({
    selectedProfile,
    robotType,
    trpcClient,
    setPending,
    setSubmitError,
  })

  const formDisabled = pending || !selectedProfile

  if (!selectedProfile) {
    return <SendMessagePlaceholder />
  }

  const selectedRobotType = selectedProfile.profile.type

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
        <SendMessageTypeField form={form} disabled={formDisabled} />
        <SendMessageFields form={form} robotType={selectedRobotType} disabled={formDisabled} />

        {submitError ? (
          <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-base text-rose-700">
            {submitError}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={formDisabled}>
            {pending ? '发送中...' : '发送消息'}
          </Button>
        </div>
      </form>
    </div>
  )
}
