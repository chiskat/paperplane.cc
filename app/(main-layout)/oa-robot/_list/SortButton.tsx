'use client'

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { IconGripVertical } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { useEffect, useId, useMemo, useState, type ComponentProps, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useMounted } from '@/hooks/use-mounted'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'
import { OARobotType } from '@/models/enums'
import { cn } from '@/utils/style'
import {
  resortOARobotLocalProfiles,
  useOARobotLocalProfiles,
  type OARobotProfileListItem,
} from '../localProfileStorage'
import { oaRobotTypeIconMap } from '../robot-icon'

interface SortableProfileItem {
  id: string
  name: string
  index: number
  type: OARobotType
}

function dragId(id: string) {
  return `profile:${id}`
}

function parseDragId(id: string) {
  const parts = id.split(':')
  if (parts.length === 2 && parts[0] === 'profile') {
    return parts[1]!
  }
  return null
}

function createOrderKey(items: SortableProfileItem[]) {
  return items.map(item => item.id).join(',')
}

function SortableRow({
  item,
  hideWhileDragging,
}: {
  item: SortableProfileItem
  hideWhileDragging: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dragId(item.id),
  })

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        visibility: hideWhileDragging ? 'hidden' : undefined,
      }}
      className={cn(
        'flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700',
        isDragging &&
          'z-10 border-sky-300 bg-sky-50/80 shadow-[0_10px_30px_-20px_rgba(2,132,199,0.6)]'
      )}
    >
      <Image
        src={oaRobotTypeIconMap[item.type].icon}
        alt={oaRobotTypeIconMap[item.type].alt}
        className="size-5 shrink-0 rounded"
      />

      <span className="min-w-0 flex-1 truncate">{item.name || '未命名'}</span>

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="cursor-grab touch-none bg-white text-slate-500 active:cursor-grabbing"
        aria-label={`拖拽排序 ${item.name}`}
        {...attributes}
        {...listeners}
      >
        <IconGripVertical size={14} />
      </Button>
    </li>
  )
}

function OverlayRow({ item }: { item: SortableProfileItem }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700">
      <Image
        src={oaRobotTypeIconMap[item.type].icon}
        alt={oaRobotTypeIconMap[item.type].alt}
        className="size-5 shrink-0 rounded"
      />

      <span className="min-w-0 flex-1 truncate">{item.name || '未命名'}</span>

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="cursor-grab touch-none bg-white text-slate-500 active:cursor-grabbing"
        aria-label={`拖拽排序 ${item.name}`}
      >
        <IconGripVertical size={14} />
      </Button>
    </div>
  )
}

export interface OARobotSortButtonProps extends Omit<ComponentProps<typeof Button>, 'onSubmit'> {
  list: OARobotProfileListItem[]
  source: 'local' | 'cloud'
  children: ReactNode
}

export function OARobotSortButton({
  list,
  source,
  children,
  ...restProps
}: OARobotSortButtonProps) {
  const [sortDialogOpen, setSortDialogOpen] = useState(false)
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()
  const [, setLocalProfiles] = useOARobotLocalProfiles()

  const mounted = useMounted()
  const dndContextId = useId()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const sourceList = useMemo(
    () =>
      [...list]
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
        .map(item => ({
          id: item.id,
          name: item.name,
          index: item.index ?? 0,
          type: item.type,
        })),
    [list]
  )
  const [draftList, setDraftList] = useState<SortableProfileItem[]>(sourceList)
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const [dragging, setDragging] = useState<SortableProfileItem | null>(null)

  useEffect(() => {
    setDraftList(sourceList)
  }, [sourceList])

  const sourceOrderKey = useMemo(() => createOrderKey(sourceList), [sourceList])
  const draftOrderKey = useMemo(() => createOrderKey(draftList), [draftList])
  const hasChanged = sourceOrderKey !== draftOrderKey
  const sortableIds = useMemo(() => draftList.map(item => dragId(item.id)), [draftList])

  const resortMutation = useMutation({
    mutationFn: async (items: SortableProfileItem[]) => {
      const payload = items.map((item, index) => ({ id: item.id, index }))
      if (source === 'local') {
        setLocalProfiles(prev => resortOARobotLocalProfiles(prev ?? [], payload))
        return
      }
      return trpcClient.oaRobot.profile.resort.mutate(payload)
    },
    onSuccess: async () => {
      if (source === 'cloud') {
        await queryClient.invalidateQueries({ queryKey: trpc.oaRobot.profile.list.pathKey() })
      }
      setSortDialogOpen(false)
    },
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItemId(null)
    setDragging(null)

    if (!over || active.id === over.id) {
      return
    }

    const activeId = parseDragId(String(active.id))
    const overId = parseDragId(String(over.id))
    if (!activeId || !overId) {
      return
    }

    setDraftList(current => {
      const oldIndex = current.findIndex(item => item.id === activeId)
      const newIndex = current.findIndex(item => item.id === overId)
      if (oldIndex < 0 || newIndex < 0) {
        return current
      }
      return arrayMove(current, oldIndex, newIndex)
    })
  }

  return (
    <Dialog
      open={sortDialogOpen}
      closeOnInteractOutside={false}
      onOpenChange={({ open }) => {
        setSortDialogOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" {...restProps}>
          {children}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[min(92vw,720px)] sm:max-w-[min(92vw,720px)]">
        <DialogHeader
          title={source === 'local' ? 'OA 机器人排序（本地）' : 'OA 机器人排序（云端）'}
          description="通过拖拽调整 OA 机器人列表的显示顺序。"
        />

        <DialogBody scrollFade>
          {draftList.length > 0 ? (
            <DndContext
              id={dndContextId}
              sensors={sensors}
              modifiers={[restrictToVerticalAxis]}
              onDragStart={event => {
                const id = parseDragId(String(event.active.id))
                if (!id) {
                  setActiveItemId(null)
                  setDragging(null)
                  return
                }

                setActiveItemId(id)
                setDragging(draftList.find(item => item.id === id) ?? null)
              }}
              onDragCancel={() => {
                setActiveItemId(null)
                setDragging(null)
              }}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                <ul className="space-y-1.5">
                  {draftList.map(item => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      hideWhileDragging={activeItemId === item.id}
                    />
                  ))}
                </ul>

                {mounted
                  ? createPortal(
                      <DragOverlay dropAnimation={null}>
                        {dragging ? <OverlayRow item={dragging} /> : null}
                      </DragOverlay>,
                      document.body
                    )
                  : null}
              </SortableContext>
            </DndContext>
          ) : (
            <p className="py-6 text-center text-sm text-slate-500">暂无 OA 机器人</p>
          )}

          {resortMutation.error ? (
            <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {resortMutation.error.message}
            </p>
          ) : null}
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={resortMutation.isPending}
            onClick={() => setSortDialogOpen(false)}
          >
            取消
          </Button>

          <Button
            type="button"
            disabled={!hasChanged || resortMutation.isPending || draftList.length === 0}
            onClick={() => {
              void resortMutation.mutateAsync(draftList)
            }}
          >
            {resortMutation.isPending ? '保存中...' : '保存排序'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
