'use client'

import { IconArrowsSort, IconCloud, IconDeviceLaptop, IconPlus } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMounted } from '@/hooks/use-mounted'
import { useSession } from '@/lib/auth-client'
import { useTRPC } from '@/lib/trpc-client'
import ListItem from './ListItem'
import { OARobotSortButton } from './SortButton'
import { OARobotEditButton } from '../_item/OARobotEditButton'
import { useOARobotLocalProfiles, type OARobotProfileListItem } from '../localProfileStorage'

type OARobotProfileSource = 'local' | 'cloud'

export type OARobotListSelectedProfile = {
  source: OARobotProfileSource
  profile: OARobotProfileListItem
}

type OARobotListProps = {
  onSelectedProfileChange?: (selectedProfile: OARobotListSelectedProfile | null) => void
}

type ProfileItemsListProps = {
  list: OARobotProfileListItem[]
  source: OARobotProfileSource
  activeProfileId: string | null
  onSelectProfile: (profileId: string) => void
  onDeleteProfile: (profileId: string) => void
}

const EMPTY_PROFILE_LIST: OARobotProfileListItem[] = []
const EMPTY_SELECTED_PROFILE_IDS: Record<OARobotProfileSource, string | null> = {
  local: null,
  cloud: null,
}

function findSelectedProfile(
  source: OARobotProfileSource,
  profileId: string | null,
  list: OARobotProfileListItem[]
): OARobotListSelectedProfile | null {
  if (!profileId) {
    return null
  }

  const profile = list.find(item => item.id === profileId)
  return profile ? { source, profile } : null
}

function getSelectedProfileSignature(selectedProfile: OARobotListSelectedProfile | null) {
  if (!selectedProfile) {
    return 'none'
  }

  const { source, profile } = selectedProfile
  const profileUpdatedAt =
    'updatedAt' in profile && profile.updatedAt instanceof Date ? profile.updatedAt.getTime() : ''
  return [
    source,
    profile.id,
    profile.name,
    profile.type,
    'desc' in profile ? profile.desc : '',
    'accessToken' in profile ? profile.accessToken : '',
    'secret' in profile ? profile.secret : '',
    'extraAuthentication' in profile ? JSON.stringify(profile.extraAuthentication ?? null) : '',
    profileUpdatedAt,
  ].join('|')
}

export default function OARobotList({ onSelectedProfileChange }: OARobotListProps) {
  const mounted = useMounted()
  const { user, isPending: userPending } = useSession()
  const trpc = useTRPC()
  const [selectedTab, setSelectedTab] = useState<OARobotProfileSource | null>(null)
  const [selectedProfileIds, setSelectedProfileIds] = useState(EMPTY_SELECTED_PROFILE_IDS)
  const [localProfiles] = useOARobotLocalProfiles()
  const lastEmittedSignatureRef = useRef<string | null>(null)

  const { data: cloudProfiles, isPending: cloudProfilesPending } = useQuery({
    ...trpc.oaRobot.profile.list.queryOptions(),
    enabled: Boolean(user),
  })

  const localList = localProfiles
  const cloudList = cloudProfiles ?? EMPTY_PROFILE_LIST

  const defaultTab = userPending ? null : user ? 'cloud' : 'local'
  const activeTab = selectedTab ?? defaultTab
  const activeSource = activeTab ?? 'local'
  const activeList = activeSource === 'cloud' ? cloudList : localList

  const listPending = userPending || (Boolean(user) && cloudProfilesPending)

  const selectedProfile = useMemo(() => {
    if (!activeTab) {
      return null
    }

    return findSelectedProfile(
      activeTab,
      selectedProfileIds[activeTab],
      activeTab === 'cloud' ? cloudList : localList
    )
  }, [activeTab, cloudList, localList, selectedProfileIds])

  const selectedProfileSignature = useMemo(
    () => getSelectedProfileSignature(selectedProfile),
    [selectedProfile]
  )

  useEffect(() => {
    if (!activeTab || !onSelectedProfileChange) {
      return
    }

    if (lastEmittedSignatureRef.current === selectedProfileSignature) {
      return
    }

    lastEmittedSignatureRef.current = selectedProfileSignature
    onSelectedProfileChange(selectedProfile)
  }, [activeTab, onSelectedProfileChange, selectedProfile, selectedProfileSignature])

  const selectProfile = (source: OARobotProfileSource, profileId: string) => {
    setSelectedProfileIds(prev =>
      prev[source] === profileId ? prev : { ...prev, [source]: profileId }
    )
  }

  const clearDeletedProfile = (source: OARobotProfileSource, profileId: string) => {
    setSelectedProfileIds(prev => (prev[source] === profileId ? { ...prev, [source]: null } : prev))
  }

  return (
    <div className="h-[calc(100dvh-11rem)] min-h-0 md:sticky md:top-28">
      {mounted && !listPending ? (
        <Tabs
          className="h-full min-h-0"
          value={activeTab}
          onValueChange={value => {
            const nextTab = value as 'local' | 'cloud'
            if (nextTab === 'cloud' && !user) {
              return
            }
            setSelectedTab(nextTab)
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <TabsList className="flex-1">
              <TabsTrigger
                value="cloud"
                className="flex flex-1 items-center gap-1.5"
                disabled={!userPending && !user}
              >
                <IconCloud size={15} />
                云端
              </TabsTrigger>
              <TabsTrigger value="local" className="flex flex-1 items-center gap-1.5">
                <IconDeviceLaptop size={15} />
                本地
              </TabsTrigger>
            </TabsList>

            <OARobotSortButton
              type="button"
              variant="outline"
              className="inline-flex items-center gap-1.5"
              source={activeSource}
              list={activeList}
              disabled={activeTab == null || (activeTab === 'cloud' && !user)}
            >
              <IconArrowsSort size={15} />
              排序
            </OARobotSortButton>

            <OARobotEditButton
              className="inline-flex shrink-0 items-center gap-1.5"
              source={activeSource}
            >
              <IconPlus size={15} />
              添加
            </OARobotEditButton>
          </div>

          <TabsContent value="local" className="mt-3 min-h-0">
            <ProfileItemsList
              list={localList}
              source="local"
              activeProfileId={selectedProfileIds.local}
              onSelectProfile={profileId => selectProfile('local', profileId)}
              onDeleteProfile={profileId => clearDeletedProfile('local', profileId)}
            />
          </TabsContent>

          <TabsContent value="cloud" className="mt-3 min-h-0">
            <ProfileItemsList
              source="cloud"
              list={cloudList}
              activeProfileId={selectedProfileIds.cloud}
              onSelectProfile={profileId => selectProfile('cloud', profileId)}
              onDeleteProfile={profileId => clearDeletedProfile('cloud', profileId)}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <ProfileListSkeleton />
      )}
    </div>
  )
}

function ProfileItemsList({
  list,
  source,
  activeProfileId,
  onSelectProfile,
  onDeleteProfile,
}: ProfileItemsListProps) {
  if (list.length === 0) {
    return <p className="px-1 py-2 text-slate-500">暂无 OA 机器人，点击 “添加” 按钮来创建</p>
  }

  return (
    <ScrollArea className="h-full min-h-0 pr-1" scrollFade>
      <div className="space-y-2">
        {list.map(item => (
          <ListItem
            key={item.id}
            item={item}
            source={source}
            active={activeProfileId === item.id}
            onSelect={onSelectProfile}
            onDeleteSuccess={onDeleteProfile}
          />
        ))}
      </div>
    </ScrollArea>
  )
}

function ProfileListSkeleton() {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 min-w-36 flex-1 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>

      <div className="mt-3 space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`oa-profile-skeleton-${index}`}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2"
          >
            <div className="flex min-w-0 items-start gap-2">
              <Skeleton className="size-12 shrink-0 rounded" />

              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-3/5 rounded-full" />

                <div className="flex items-center gap-1">
                  <Skeleton className="h-6 w-14 rounded-md" />
                  <Skeleton className="h-6 w-14 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
