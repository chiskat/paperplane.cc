import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { TrafficView } from '@/app/(main-layout)/wlb/_view/traffic-view'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isLocalhostRequest } from '@/utils/ip-limit'

export const TILES_LOADED_FLAG = 'wlb_traffic_map_tiles_loaded'

export default async function WLBTrafficView({ params }: PageProps<'/wlb/traffic/[profileid]'>) {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session?.user && !isLocalhostRequest(requestHeaders)) {
    notFound()
  }

  const { profileid } = await params
  const profile = await prisma.wLBProfile.findUnique({
    where: { id: profileid },
    select: { latitude: true, longitude: true },
  })

  if (!profile) {
    notFound()
  }

  return (
    <TrafficView
      className="h-162.5 w-162.5"
      latitude={profile.latitude}
      longitude={profile.longitude}
      tilesLoadedFlag={TILES_LOADED_FLAG}
    />
  )
}
