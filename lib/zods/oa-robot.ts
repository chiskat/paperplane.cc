import z from 'zod'

import { OARobotType } from '@/models/enums'
import { compatFormData } from './common'

export enum OARobotMessageType {
  TEXT = 'TEXT',
  MARKDOWN = 'MARKDOWN',
  IMAGE = 'IMAGE',
}

export interface OARobotMessageText {
  type: OARobotMessageType.TEXT
  text: string

  atAll?: boolean
  atList?: string[]
}

export interface OARobotMessageMarkdown {
  type: OARobotMessageType.MARKDOWN
  markdown: string

  /** 标题，钉钉用于通知显示，飞书用于首行，企业微信不可用 */
  title?: string
  /** 是否 “@全体”，仅钉钉和飞书 */
  atAll?: boolean
  /** 提及用户，仅钉钉和飞书 */
  atList?: string[]
}

export interface OARobotMessageImage {
  type: OARobotMessageType.IMAGE
  image: File

  /** 标题，钉钉用于通知显示 */
  title?: string
}

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
  type: z.literal(OARobotMessageType.TEXT),

  text: z.string().min(1, '消息文本不能为空'),
  atAll: z.boolean().optional(),
  atList: z.array(z.string().min(1)).optional(),
})

export const OARobotMessageMarkdownZod = z.object({
  type: z.literal(OARobotMessageType.MARKDOWN),

  markdown: z.string().min(1, '消息正文不能为空'),
  title: z.string().optional(),
  atAll: z.boolean().optional(),
  atList: z.array(z.string().min(1)).optional(),
})

export const OARobotMessageImageZod = z.object({
  type: z.literal(OARobotMessageType.IMAGE),

  image: z.instanceof(File),
  title: z.string().optional(),
})

export const OARobotMessageZod = compatFormData(
  z.discriminatedUnion('type', [
    OARobotMessageTextZod,
    OARobotMessageMarkdownZod,
    OARobotMessageImageZod,
  ])
)

export const OARobotSendByIdZod = compatFormData(
  z.object({
    robotId: z.string().min(1),

    message: OARobotMessageZod,
  })
)

export const OARobotSendByConfigZod = compatFormData(
  z.object({
    type: OARobotProfileZod.shape.type,
    accessToken: OARobotProfileZod.shape.accessToken,
    secret: OARobotProfileZod.shape.secret,
    extraAuthentication: OARobotProfileZod.shape.extraAuthentication,

    message: OARobotMessageZod,
  })
)
