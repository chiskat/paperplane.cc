'use client'

import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { useMemo, useState } from 'react'

import { ApiDoc, type ApiDocProps } from '@/components/data/api-doc'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTab } from '@/components/ui/tabs'

const getTextMessageAPIDoc: (robotId: string) => ApiDocProps = robotId => ({
  metadata: {
    url: `/oa-robot/${robotId}/send`,
    method: 'POST',
    contentType: 'application/json',
    requireAuth: true,
    description: '发送纯文本消息',
  },
  request: {
    description:
      '钉钉和飞书机器人可通过 "@all" 来调整 “@所有人” 在消息中的位置，企业微信则只能默认放置在最末尾',
    fields: [
      {
        name: 'message',
        type: 'string',
        required: true,
        defaultValue: '"TEXT"',
        description: '文本消息类型此项固定为 "TEXT"',
      },
      {
        name: 'text',
        type: 'string',
        required: true,
        description: '文本消息内容',
      },
      {
        name: 'atAll',
        type: 'boolean',
        required: false,
        description: '是否 @ 所有人',
      },
      {
        name: 'atList',
        type: 'string[]',
        required: false,
        description: '@ 指定手机号码的用户，手机号码请写从 1 开头的纯数字，不要包含 “@” 和地区号',
      },
    ],
  },
  response: {
    fields: [
      {
        name: 'ok',
        type: 'boolean',
        description: '发送是否成功',
      },
    ],
  },
})

const getMarkdownMessageAPIDoc: (robotId: string) => ApiDocProps = robotId => ({
  metadata: {
    url: `/oa-robot/${robotId}/send`,
    method: 'POST',
    contentType: 'application/json',
    requireAuth: true,
    description: '发送 Markdown 富文本消息',
  },
  request: {
    description:
      '钉钉和企业微信支持多种 Markdown 语法，飞书机器人只支持超链接，具体请参考发送表单中的提示',
    fields: [
      {
        name: 'message',
        type: 'string',
        required: true,
        defaultValue: '"MARKDOWN"',
        description: 'Markdown 富文本消息类型此项固定为 "MARKDOWN"',
      },
      {
        name: 'markdown',
        type: 'string',
        required: true,
        description: '富文本消息内容',
      },
      {
        name: 'title',
        type: 'string',
        required: false,
        description: '在钉钉和飞书中用于显示通知的标题，留空则会提取正文的前几个字',
      },
      {
        name: 'atAll',
        type: 'boolean',
        required: false,
        description: '是否 @ 所有人，企业微信不支持此项',
      },
      {
        name: 'atList',
        type: 'string[]',
        required: false,
        description:
          '@ 指定手机号码的用户，企业微信不支持此项，手机号码请写从 1 开头的纯数字，不要包含 “@” 和地区号',
      },
    ],
  },
  response: {
    fields: [
      {
        name: 'ok',
        type: 'boolean',
        description: '发送是否成功，固定为 true',
      },
    ],
  },
})

const getImageMessageAPIDoc: (robotId: string) => ApiDocProps = robotId => ({
  metadata: {
    url: `/oa-robot/${robotId}/send`,
    method: 'POST',
    contentType: 'application/json',
    requireAuth: true,
    description: '发送图片消息',
  },
  request: {
    description: '图片需要先通过预签名接口上传，上传后调用 “验证图片上传成功” 接口获取公开 URL',
    fields: [
      {
        name: 'message',
        type: 'string',
        required: true,
        defaultValue: '"IMAGE"',
        description: '图片消息类型此项固定为 "IMAGE"',
      },
      {
        name: 'imageURL',
        type: 'string',
        required: true,
        description: '图片的公开 URL，只支持已上传到 PaperPlane.cc CDN 的图片',
      },
      {
        name: 'title',
        type: 'string',
        required: false,
        description: '钉钉消息通知标题，如果留空则默认为 “[图片]”',
      },
    ],
  },
  response: {
    fields: [
      {
        name: 'ok',
        type: 'boolean',
        description: '发送是否成功',
      },
    ],
  },
})

const presignApiDoc: ApiDocProps = {
  metadata: {
    url: '/user-content/presign',
    method: 'POST',
    contentType: 'application/json',
    requireAuth: false,
    description: '获取图片上传的预签名 URL，用于上传图片到 S3',
  },
  request: {
    description: '请求体为 JSON 格式',
    fields: [
      {
        name: 'usage',
        type: 'string',
        required: true,
        defaultValue: '"OA_ROBOT_MESSAGE"',
        description: '用途，此处固定为 "OA_ROBOT_MESSAGE"',
      },
      {
        name: 'filename',
        type: 'string',
        required: true,
        description: '完整文件名',
      },
    ],
  },
  response: {
    description: '返回预签名 URL 和相关信息',
    fields: [
      {
        name: 'id',
        type: 'string',
        description: '上传记录 ID，用于后续验证',
      },
      {
        name: 'uploadURL',
        type: 'string',
        description: '图片上传 URL，请使用 PUT 方法上传文件',
      },
      {
        name: 'expiredAt',
        type: 'string',
        description: 'ISO 8601 格式的过期时间，默认有效期 10 分钟',
      },
    ],
  },
}

const checkApiDoc: ApiDocProps = {
  metadata: {
    url: '/user-content/check',
    method: 'POST',
    contentType: 'application/json',
    requireAuth: false,
    description: '验证图片是否上传成功，并获取公开访问 URL',
  },
  request: {
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: '从 “获取图片上传 URL” 接口返回的上传记录 ID',
      },
    ],
  },
  response: {
    fields: [
      {
        name: 'ready',
        type: 'boolean',
        description: '图片是否已上传成功',
      },
      {
        name: 'publicURL',
        type: 'string',
        description: '仅图片是否已上传成功时有此值，图片的公开访问 URL',
      },
    ],
  },
}

export interface SendMessageAPIDocButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  robotId: string
  children: ReactNode
}

export function SendMessageAPIDocButton({
  robotId,
  children,
  ...buttonProps
}: SendMessageAPIDocButtonProps) {
  const [open, setOpen] = useState(false)
  const textMessageApiDoc = useMemo(() => getTextMessageAPIDoc(robotId), [robotId])
  const markdownMessageApiDoc = useMemo(() => getMarkdownMessageAPIDoc(robotId), [robotId])
  const imageMessageApiDoc = useMemo(() => getImageMessageAPIDoc(robotId), [robotId])

  return (
    <Dialog open={open} onOpenChange={e => setOpen(e.open)}>
      <DialogTrigger asChild>
        <Button {...buttonProps}>{children}</Button>
      </DialogTrigger>

      <DialogContent size="4xl" bottomStickOnMobile={false}>
        <DialogHeader title="机器人消息 OpenAPI 文档" />

        <DialogBody scrollFade>
          <Tabs defaultValue="text">
            <TabsList variant="underline">
              <TabsTab value="text">文本消息</TabsTab>
              <TabsTab value="markdown">Markdown 消息</TabsTab>
              <TabsTab value="image">图片消息</TabsTab>
              <TabsTab value="presign">获取图片上传 URL</TabsTab>
              <TabsTab value="check">验证图片上传成功</TabsTab>
            </TabsList>

            <TabsContent value="text" className="mt-4">
              <ApiDoc {...textMessageApiDoc} />
            </TabsContent>

            <TabsContent value="markdown" className="mt-4">
              <ApiDoc {...markdownMessageApiDoc} />
            </TabsContent>

            <TabsContent value="image" className="mt-4">
              <ApiDoc {...imageMessageApiDoc} />
            </TabsContent>

            <TabsContent value="presign" className="mt-4">
              <ApiDoc {...presignApiDoc} />
            </TabsContent>

            <TabsContent value="check" className="mt-4">
              <ApiDoc {...checkApiDoc} />
            </TabsContent>
          </Tabs>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
