import 'server-only'

import { createId } from '@paralleldrive/cuid2'

import { prisma } from '@/lib/prisma'
import { publicUpload } from '@/lib/s3-public'
import { loginProcedure, publicProcedure, router } from '@/lib/trpc'
import { awesomeTagZod } from '@/lib/zods/awesome'
import { deleteZod, resortZod } from '@/lib/zods/common'
import { Prisma } from '@/models/client'

async function uploadTagIcon(file: File): Promise<string> {
  return publicUpload(`/awesome/tags/icon/${createId()}`, Buffer.from(await file.arrayBuffer()), {
    mime: file.type,
  }).then(res => res.fileUrl)
}

export const tags = router({
  list: publicProcedure.query(() => prisma.awesomeTag.findMany({ orderBy: { index: 'asc' } })),

  add: loginProcedure.input(awesomeTagZod).mutation(async ({ input }) => {
    if (input.iconFile) {
      input.icon = await uploadTagIcon(input.iconFile as File)
      delete input.iconFile
    }

    return prisma.awesomeTag.create({
      data: { ...input, index: await prisma.awesomeTag.count() },
    })
  }),

  update: loginProcedure.input(awesomeTagZod).mutation(async ({ input }) => {
    if (input.iconFile) {
      input.icon = await uploadTagIcon(input.iconFile as File)
      delete input.iconFile
    }

    return prisma.awesomeTag.update({ where: { id: input.id }, data: input })
  }),

  delete: loginProcedure.input(deleteZod).mutation(async ({ input }) => {
    const item = await prisma.awesomeTag.findFirstOrThrow({ where: { id: input.id } })
    await prisma.awesomeTag.delete({ where: { id: item.id } })
    await prisma.awesomeTag.updateMany({
      where: { index: { gt: item.index! } },
      data: { index: { decrement: 1 } },
    })
  }),

  resort: loginProcedure.input(resortZod).mutation(async ({ input }) => {
    const caseSql = Prisma.join(
      input.map(item => Prisma.sql`WHEN ${item.id} THEN ${item.index}`),
      ' '
    )
    await prisma.$executeRaw`
      UPDATE "awesome_tag"
      SET "index" = (CASE "id" ${caseSql} END)::integer
      WHERE "id" IN (${Prisma.join(input.map(item => item.id))})
    `
  }),
})
