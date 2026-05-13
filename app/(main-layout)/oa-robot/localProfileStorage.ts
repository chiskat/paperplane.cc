'use client'

import { createId } from '@paralleldrive/cuid2'
import type { inferRouterOutputs } from '@trpc/server'
import { useLocalStorageState } from 'ahooks'

import type { AppRouter } from '@/apis/appRouter'
import type { OARobotProfile } from '@/models/client'

type RouterOutputs = inferRouterOutputs<AppRouter>
type OARobotCloudProfileListItem = RouterOutputs['oaRobot']['profile']['list'][number]
type OARobotProfileIndex = Pick<OARobotProfile, 'index'>
type OARobotLocalProfileOptionalFields = Partial<
  Pick<
    OARobotProfile,
    | 'index'
    | 'desc'
    | 'accessToken'
    | 'secret'
    | 'extraAuthentication'
    | 'userId'
    | 'createdAt'
    | 'updatedAt'
  >
>
export type OARobotProfileListItem = OARobotCloudProfileListItem & {
  index?: OARobotProfileIndex['index']
}
export type OARobotLocalProfile = OARobotCloudProfileListItem & OARobotLocalProfileOptionalFields
export type OARobotLocalProfilePayload = Pick<
  OARobotLocalProfile,
  'name' | 'desc' | 'type' | 'accessToken' | 'secret' | 'extraAuthentication'
>
export interface OARobotLocalProfileResortItem {
  id: string
  index: number
}

export const OA_ROBOT_LOCAL_STORAGE_KEY = 'oa-robot:profiles:local'

export function useOARobotLocalProfiles() {
  const [localProfiles = [], setLocalProfiles] = useLocalStorageState<OARobotLocalProfile[]>(
    OA_ROBOT_LOCAL_STORAGE_KEY,
    { defaultValue: [], listenStorageChange: true }
  )

  return [localProfiles, setLocalProfiles] as const
}

export function findOARobotLocalProfileById(
  localProfiles: OARobotLocalProfile[],
  profileId?: string,
  localProfile?: OARobotLocalProfile
) {
  if (!profileId) {
    return undefined
  }
  if (localProfile?.id === profileId) {
    return localProfile
  }
  return localProfiles.find(item => item.id === profileId)
}

export function updateOARobotLocalProfile(
  localProfiles: OARobotLocalProfile[],
  profileId: string,
  patch: OARobotLocalProfilePayload
) {
  const now = new Date()
  return localProfiles.map(item =>
    item.id === profileId ? { ...item, ...patch, id: profileId, updatedAt: now } : item
  )
}

export function createOARobotLocalProfile(
  localProfiles: OARobotLocalProfile[],
  payload: OARobotLocalProfilePayload
) {
  const now = new Date()
  const nextIndex =
    localProfiles.length === 0 ? 0 : Math.max(...localProfiles.map(item => item.index ?? -1)) + 1
  const newItem: OARobotLocalProfile = {
    id: createId(),
    index: nextIndex,
    ...payload,
    userId: null,
    createdAt: now,
    updatedAt: now,
  }
  return [...localProfiles, newItem]
}

export function deleteOARobotLocalProfile(localProfiles: OARobotLocalProfile[], profileId: string) {
  return localProfiles.filter(item => item.id !== profileId)
}

export function resortOARobotLocalProfiles(
  localProfiles: OARobotLocalProfile[],
  input: OARobotLocalProfileResortItem[]
) {
  if (input.length === 0 || localProfiles.length === 0) {
    return localProfiles
  }

  const inputIndexMap = new Map(input.map(item => [item.id, item.index]))
  const now = new Date()

  return localProfiles
    .map(item => {
      const nextIndex = inputIndexMap.get(item.id)
      if (typeof nextIndex !== 'number') {
        return item
      }
      if (item.index === nextIndex) {
        return item
      }
      return { ...item, index: nextIndex, updatedAt: now }
    })
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
}
