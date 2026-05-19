import z from 'zod'

import { OARobotType } from '@/models/enums'

export enum OARobotMessageType {
  TEXT = 'TEXT',
  MARKDOWN = 'MARKDOWN',
  IMAGE = 'IMAGE',
}

export const OARobotMessageUploadPathPrefix = '/usercontent/oarobot'

export const OARobotMessageUploadURLPrefix = `https://${process.env.NEXT_PUBLIC_S3_CNAME}${OARobotMessageUploadPathPrefix}`

export const OARobotProfileZod = z.object({
  id: z.string().optional(),

  name: z.string().min(1, '必须提供 OA 机器人的名称'),
  desc: z.string().nullish(),
  type: z.enum([OARobotType.DINGTALK, OARobotType.WXBIZ, OARobotType.FEISHU]),
  accessToken: z.string().nullish(),
  secret: z.string().nullish(),
  extraAuthentication: z.any().nullish(),
  userId: z.string().nullish(),
})

export const OARobotMessageTextZod = z.object({
  message: z.literal(OARobotMessageType.TEXT),

  text: z.string().min(1, '消息文本不能为空'),
  atAll: z.boolean().optional(),
  atList: z.array(z.string().min(1)).optional(),
})

export const OARobotMessageMarkdownZod = z.object({
  message: z.literal(OARobotMessageType.MARKDOWN),

  markdown: z.string().min(1, '消息正文不能为空'),
  title: z.string().optional(),
  atAll: z.boolean().optional(),
  atList: z.array(z.string().min(1)).optional(),
})

export const OARobotMessageImageZod = z.object({
  message: z.literal(OARobotMessageType.IMAGE),

  imageURL: z.url().startsWith(OARobotMessageUploadURLPrefix),
  title: z.string().optional(),
})

export const OARobotMessgeOpenAPIZod = z.object({
  message: z.enum([OARobotMessageType.TEXT, OARobotMessageType.MARKDOWN, OARobotMessageType.IMAGE]),
  text: z.string().optional(),
  markdown: z.string().optional(),
  title: z.string().optional(),
  imageURL: z.string().startsWith(OARobotMessageUploadURLPrefix).optional(),
  atAll: z.boolean().optional(),
  atList: z.array(z.string()).optional(),
})

export const OARobotMessageZod = z.discriminatedUnion('message', [
  OARobotMessageTextZod,
  OARobotMessageMarkdownZod,
  OARobotMessageImageZod,
])

export const OARobotSendByIdZod = OARobotMessageZod.and(z.object({ robotId: z.string().min(1) }))

export const OARobotSendByIdOpenAPIZod = OARobotMessgeOpenAPIZod.extend({
  robotId: z.string().min(1),
})

export const OARobotSendByConfigZod = OARobotMessageZod.and(
  OARobotProfileZod.pick({
    type: true,
    accessToken: true,
    secret: true,
    extraAuthentication: true,
  })
)
