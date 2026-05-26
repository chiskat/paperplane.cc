'use client'

import { IconInbox, IconPlus } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Highlighter } from '@/components/ui/highlighter'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useSession } from '@/lib/auth-client'
import { useTRPC } from '@/lib/trpc-client'
import { WLBProfileEditButton } from './_profile/ProfileEditButton'
import { WLBProfileListItem, type WLBProfileListItemData } from './_profile/ProfileListItem'
import { WLBProfilePanel } from './_profile/ProfilePanel'
import { WLBRecordPanel } from './_record/RecordPanel'
import { WLBSubscriptionPanel } from './_subscription/SubscriptionPanel'
import { TrafficView } from './_view/TrafficView'

const SKELETON_KEYS = {
  profileList: 'wlb-profile-skeleton',
}

export default function WLBPageClient() {
  const trpc = useTRPC()
  const { user, isPending: userPending } = useSession()
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const authenticated = Boolean(user)

  const { data: profileQueryData = [], isPending: profilesPending } = useQuery({
    ...trpc.wlb.profile.list.queryOptions(),
    enabled: authenticated,
  })

  const profiles = authenticated ? profileQueryData : []

  useEffect(() => {
    if (!userPending && !authenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedProfileId(null)
    }
  }, [authenticated, userPending])

  const selectedProfile = selectedProfileId
    ? (profiles.find(profile => profile.id === selectedProfileId) ?? null)
    : null
  const activeProfileId = selectedProfile?.id ?? null
  const loading = userPending || (authenticated && profilesPending)

  return (
    <main className="grid h-[calc(100dvh-8rem)] min-h-0 w-full gap-5 sm:h-[calc(100dvh-8.5rem)] lg:h-[calc(100dvh-9rem)] lg:grid-cols-[minmax(280px,360px)_1fr]">
      <ProfileListPanel
        profiles={profiles}
        selectedProfileId={activeProfileId}
        authenticated={authenticated}
        loading={loading}
        onSelectProfile={setSelectedProfileId}
        onDeleteProfile={profileId => {
          if (selectedProfileId === profileId) {
            setSelectedProfileId(null)
          }
        }}
      />

      <ProfileDetailTabs selectedProfile={selectedProfile} authenticated={authenticated} />
    </main>
  )
}

function ProfileListPanel({
  profiles,
  selectedProfileId,
  authenticated,
  loading,
  onSelectProfile,
  onDeleteProfile,
}: {
  profiles: WLBProfileListItemData[]
  selectedProfileId: string | null
  authenticated: boolean
  loading: boolean
  onSelectProfile: (profileId: string | null) => void
  onDeleteProfile: (profileId: string) => void
}) {
  const createButton = (
    <WLBProfileEditButton
      size="sm"
      disabled={!authenticated}
      onSuccess={profile => {
        if (profile) {
          onSelectProfile(profile.id)
        }
      }}
    >
      <IconPlus data-icon="inline-start" />
      新建档案
    </WLBProfileEditButton>
  )

  return (
    <Card className="min-h-0 min-w-0 overflow-visible rounded-none py-0 ring-0">
      <CardHeader className="px-0">
        <CardTitle className="font-title-serif text-[26px] text-slate-800">
          Work Life Balance
        </CardTitle>
        <CardAction className="self-center">
          {authenticated ? (
            createButton
          ) : (
            <Tooltip openDelay={150}>
              <TooltipTrigger asChild>
                <span className="inline-flex">{createButton}</span>
              </TooltipTrigger>
              <TooltipContent>登录后可用</TooltipContent>
            </Tooltip>
          )}
        </CardAction>
      </CardHeader>

      <CardContent className="min-h-0 min-w-0 flex-1 px-0">
        {loading ? (
          <ProfileListSkeleton />
        ) : !authenticated ? (
          <EmptyState title="限已登录用户使用" description="登录后可创建和管理 WLB 档案。" />
        ) : profiles.length === 0 ? (
          <EmptyState title="暂无 WLB 档案" description="点击上方“新建档案”按钮来创建" />
        ) : (
          <ScrollArea className="h-full min-w-0 pr-1" scrollFade>
            <div className="flex min-w-0 flex-col gap-2">
              {profiles.map(profile => (
                <WLBProfileListItem
                  key={profile.id}
                  profile={profile}
                  active={selectedProfileId === profile.id}
                  onSelect={() => onSelectProfile(profile.id)}
                  onDeleteSuccess={() => onDeleteProfile(profile.id)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

function ProfileDetailTabs({
  selectedProfile,
  authenticated,
}: {
  selectedProfile: WLBProfileListItemData | null
  authenticated: boolean
}) {
  const trpc = useTRPC()
  const selectedProfileId = selectedProfile?.id ?? ''

  const { data: profileDetail } = useQuery({
    ...trpc.wlb.profile.get.queryOptions({ id: selectedProfileId }),
    enabled: Boolean(selectedProfileId),
  })

  if (!authenticated) {
    return <LoginRequiredState />
  }

  if (!selectedProfile) {
    return <NoProfileSelectedState />
  }

  return (
    <Card className="bg-muted/30 min-h-0 min-w-0 overflow-visible">
      <Tabs defaultValue="profile" className="min-h-0 flex-1 gap-0">
        <CardHeader className="mb-4 min-w-0 gap-3 px-6 sm:px-6">
          <CardTitle
            className="font-title-serif flex min-w-0 items-center gap-3 text-[26px] text-slate-800"
            title={selectedProfile.name}
          >
            <Highlighter
              action="underline"
              className="min-w-0 truncate align-bottom"
              color="var(--primary)"
              iterations={2}
              padding={0}
            >
              {selectedProfile.name}
            </Highlighter>
            <code
              className="bg-background/70 text-foreground max-w-[min(20rem,45%)] min-w-0 truncate rounded border px-1.5 py-0.5 font-mono text-[14px] select-all"
              title={selectedProfile.id}
            >
              {selectedProfile.id}
            </code>
          </CardTitle>

          <CardAction className="flex max-w-full items-start gap-2">
            <TabsList variant="underline" className="min-w-max">
              <TabsTrigger value="profile" className="text-base">
                工作信息
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="text-base">
                WLB 消息订阅
              </TabsTrigger>
              <TabsTrigger value="records" className="text-base">
                WLB 记录
              </TabsTrigger>
              <TabsTrigger value="traffic" className="text-base">
                实时交通状况
              </TabsTrigger>
            </TabsList>
          </CardAction>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col px-6 sm:px-6">
          <TabsContent value="profile" className="min-h-0">
            <WLBProfilePanel profileId={selectedProfile.id} />
          </TabsContent>

          <TabsContent value="records" className="min-h-0">
            <WLBRecordPanel profileId={selectedProfile.id} />
          </TabsContent>

          <TabsContent value="subscriptions" className="min-h-0">
            <WLBSubscriptionPanel profileId={selectedProfile.id} />
          </TabsContent>

          <TabsContent value="traffic" className="flex min-h-0 pb-2.5">
            <TrafficView
              className="min-h-0 flex-1 rounded-lg"
              latitude={profileDetail?.latitude}
              longitude={profileDetail?.longitude}
            />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}

function LoginRequiredState() {
  return (
    <Card className="bg-muted/30 min-h-0 min-w-0 overflow-visible">
      <CardContent className="flex min-h-0 flex-1 items-center justify-center px-6 py-6 sm:px-8">
        <div className="border-input flex max-w-sm flex-col items-center rounded-lg px-6 py-8 text-center">
          <div className="text-primary flex items-center justify-center">
            <IconInbox size={60} stroke={1.5} aria-hidden />
          </div>
          <p className="text-foreground mt-4 text-base font-medium">限已登录用户使用</p>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-input rounded-lg border border-dashed px-4 py-8 text-center">
      <p className="text-foreground text-sm font-medium">{title}</p>
      <p className="text-muted-foreground mt-2 text-sm">{description}</p>
    </div>
  )
}

function NoProfileSelectedState() {
  return (
    <Card className="bg-muted/30 min-h-0 min-w-0 overflow-visible">
      <CardContent className="flex min-h-0 flex-1 items-center justify-center px-6 py-6 sm:px-8">
        <div className="flex max-w-sm flex-col items-center text-center">
          <div className="text-primary flex items-center justify-center">
            <IconInbox size={60} stroke={1.5} aria-hidden />
          </div>
          <p className="text-foreground mt-4 text-base font-medium">当前未选择 WLB 档案</p>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            请从左侧档案列表中选择一项，工作信息、近期记录和订阅消息会在这里显示。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={`${SKELETON_KEYS.profileList}-${index}`}
          className="border-input rounded-lg border px-3 py-2.5"
        >
          <div className="flex items-center gap-3">
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/5 rounded-full" />
              <Skeleton className="h-3 w-1/3 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
