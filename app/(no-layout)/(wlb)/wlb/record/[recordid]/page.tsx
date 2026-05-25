import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { RecordView } from '@/app/(main-layout)/wlb/_view/RecordView'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isLocalhostRequest } from '@/utils/ip-limit'

export default async function WLBRecordView({ params }: PageProps<'/wlb/record/[recordid]'>) {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session?.user && !isLocalhostRequest(requestHeaders)) {
    return notFound()
  }

  const { recordid } = await params
  const record = await prisma.wLBDailyRecord.findFirst({
    where: { id: recordid },
    include: { profile: true },
  })

  if (!record || !record.profile) {
    return notFound()
  }

  const { profile } = record

  return <RecordView record={record} profile={profile} />
}
