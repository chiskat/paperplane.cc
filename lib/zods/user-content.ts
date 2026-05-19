import z from 'zod'

import { OARobotMessageUploadURLPrefix } from './oa-robot'

export enum UserContentPresetType {
  OA_ROBOT_MESSAGE = 'OA_ROBOT_MESSAGE',
}

export const presignZod = z.object({
  filename: z.string(),
  usage: z.enum([UserContentPresetType.OA_ROBOT_MESSAGE]),
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
    publicURL: z.url().startsWith(OARobotMessageUploadURLPrefix),
  }),
  z.object({
    ready: z.literal(false),
  }),
])
