import z from 'zod'

import { awesomeTagIconUploadPathPrefix } from './awesome'
import { OARobotMessageUploadPathPrefix } from './oa-robot'

export enum UserContentPresetType {
  AWESOME_TAG_ICON = 'AWESOME_TAG_ICON',
  OA_ROBOT_MESSAGE = 'OA_ROBOT_MESSAGE',
}

export const userContentUploadPathMap: Record<UserContentPresetType, string> = {
  [UserContentPresetType.AWESOME_TAG_ICON]: awesomeTagIconUploadPathPrefix,
  [UserContentPresetType.OA_ROBOT_MESSAGE]: OARobotMessageUploadPathPrefix,
}

export const presignZod = z.object({
  filename: z.string(),
  usage: z.enum([UserContentPresetType.AWESOME_TAG_ICON, UserContentPresetType.OA_ROBOT_MESSAGE]),
})

export const presignResultZod = z.object({
  id: z.string(),
  uploadURL: z.url(),
  expiredAt: z.date(),
})

export const checkZod = z.object({
  id: z.string(),
})

export const checkResultZod = z.discriminatedUnion('ready', [
  z.object({
    ready: z.literal(true),
    publicURL: z.url().refine(value => {
      const allowURLPrefixes = Object.values(userContentUploadPathMap).map(
        path => `https://${process.env.NEXT_PUBLIC_S3_CNAME}${path}`
      )

      return allowURLPrefixes.some(allowURLPrefix => value.startsWith(allowURLPrefix))
    }, '文件地址不在允许的用户内容路径下'),
  }),
  z.object({
    ready: z.literal(false),
  }),
])
