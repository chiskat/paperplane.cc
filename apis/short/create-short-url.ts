import { TRPCError } from '@trpc/server'
import { omit } from 'lodash-es'
import z from 'zod'

import { prisma } from '@/lib/prisma'
import { addShortItemZod, shortURLPrefix } from '@/lib/zods/short'
import { Short } from '@/models/client'
import { ShortRedirectType } from '@/models/enums'
import { generateShortKeyByRecord, ShortKeyRecord } from './helper/generate-short-key'

export async function createShortURL(
  input: z.input<typeof addShortItemZod>,
  userId?: string | null
) {
  const data = addShortItemZod.parse(input)

  if (data.expiredAt && data.redirectType === ShortRedirectType.PERMANENTLY) {
    throw new TRPCError({
      code: 'UNPROCESSABLE_CONTENT',
      message: '指定了过期时间的短链接不能使用 “永久重定向” 的跳转方式',
    })
  }

  if (data.key) {
    const sameKey = await prisma.short.findFirst({
      where: { key: data.key, OR: [{ expiredAt: { gt: new Date() } }, { expiredAt: null }] },
    })

    if (!sameKey) {
      const result = await prisma.short.create({
        data: { ...omit(data, ['reuse']), key: data.key, userId },
      })

      return { ...result, $full: shortURLPrefix + result.key, $reuse: false }
    }

    if (
      data.reuse &&
      sameKey.url === data.url &&
      sameKey.tag === data.tag &&
      sameKey.redirectType === data.redirectType &&
      sameKey.expiredAt === data.expiredAt &&
      sameKey.public === data.public
    ) {
      return { ...sameKey, $full: shortURLPrefix + sameKey.key, $reuse: true }
    }

    throw new TRPCError({
      code: 'CONFLICT',
      message: `此短链接码 “${sameKey.key}” 与现有的短链接码重复，请更换短链接码后重试`,
    })
  }

  if (data.reuse) {
    const same = await prisma.short.findFirst({
      where: {
        url: data.url,
        tag: data.tag,
        redirectType: data.redirectType,
        expiredAt: data.expiredAt,
        public: data.public,
      },
    })

    if (same) {
      return { ...same, $full: shortURLPrefix + same.key, $reuse: true }
    }
  }

  let keyRecord: ShortKeyRecord | undefined = undefined
  let exist: Short | null = null

  do {
    keyRecord = generateShortKeyByRecord(4, keyRecord)
    exist = await prisma.short.findFirst({
      where: { key: keyRecord.key, OR: [{ expiredAt: { gt: new Date() } }, { expiredAt: null }] },
      include: { author: true },
    })
  } while (exist)

  const result = await prisma.short.create({
    data: { ...omit(data, ['reuse']), key: keyRecord.key, userId },
  })

  return { ...result, $full: shortURLPrefix + result.key, $reuse: false }
}
