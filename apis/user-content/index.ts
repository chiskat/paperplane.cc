import path from 'path'
import dayjs from 'dayjs'

import { prisma } from '@/lib/prisma'
import { publicFileExists, publicUploadPreSign } from '@/lib/s3'
import { publicProcedure, router } from '@/lib/trpc'
import { OARobotMessageUploadPathPrefix } from '@/lib/zods/oa-robot'
import {
  checkResultZod,
  checkZod,
  presignResultZod,
  presignZod,
  UserContentPresetType,
} from '@/lib/zods/user-content'
import { generateShortKey } from '../short/helper/generate-short-key'

const pathMap: Record<UserContentPresetType, string> = {
  [UserContentPresetType.OA_ROBOT_MESSAGE]: OARobotMessageUploadPathPrefix,
}

export const userContent = router({
  presign: publicProcedure
    .meta({ openapi: { method: 'POST', path: '/user-content/presign', protect: false } })
    .input(presignZod)
    .output(presignResultZod)
    .mutation(async ({ input, ctx }) => {
      const session = await ctx.getSession()
      const { filename, usage } = input

      const expiresInSeconds = 600
      const key = generateShortKey(10)
      const ext = path.extname(filename).slice(1)
      const filePath = `${pathMap[usage]}/${key}.${ext}`
      const expiredAt = dayjs().add(expiresInSeconds, 'seconds').toDate()

      const { preSignUrl: uploadURL } = await publicUploadPreSign(filePath, {
        expiresIn: expiresInSeconds,
      })
      const record = await prisma.userContent.create({
        data: {
          key,
          filePath,
          uploadURL,
          ready: false,
          usage,
          expiredAt,
          userId: session?.user.id || null,
        },
      })
      const result = { id: record.id, uploadURL: record.uploadURL, expiredAt: record.expiredAt! }

      return result
    }),

  check: publicProcedure
    .meta({ openapi: { method: 'POST', path: '/user-content/check', protect: false } })
    .input(checkZod)
    .output(checkResultZod)
    .mutation(async ({ input }) => {
      const { id } = input
      const record = await prisma.userContent.findUniqueOrThrow({ where: { id } })
      const publicURL = `https://${process.env.NEXT_PUBLIC_S3_CNAME}${record.filePath}`
      if (record.ready) {
        return { ready: true, publicURL }
      }

      const fileExists = await publicFileExists(record.filePath)
      if (fileExists) {
        await prisma.userContent.update({ where: { id }, data: { ready: true } })

        return { ready: true, publicURL }
      }

      return { ready: false }
    }),
})
