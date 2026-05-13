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
import {
  IconArrowsVertical,
  IconChevronDown,
  IconChevronUp,
  IconFold,
  IconGripVertical,
} from '@tabler/icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

import { AwesomeCatelogNode } from '@/apis/awesome/catelogs'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
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
import { cn } from '@/utils/style'

interface SortableChildCategory {
  id: string
  name: string
  index: number
}

interface SortableRootCategory {
  id: string
  name: string
  index: number
  children: SortableChildCategory[]
}

function rootDragId(id: string) {
  return `root:${id}`
}

function childDragId(parentId: string, id: string) {
  return `child:${parentId}:${id}`
}

function parseDragId(
  id: string
): { kind: 'root'; id: string } | { kind: 'child'; parentId: string; id: string } | null {
  const parts = id.split(':')

  if (parts.length === 2 && parts[0] === 'root') {
    return { kind: 'root', id: parts[1]! }
  }

  if (parts.length === 3 && parts[0] === 'child') {
    return { kind: 'child', parentId: parts[1]!, id: parts[2]! }
  }

  return null
}

function normalizeTree(list: AwesomeCatelogNode[]): SortableRootCategory[] {
  return [...list]
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map(item => ({
      id: item.id,
      name: item.name,
      index: item.index ?? 0,
      children: [...(item.children ?? [])]
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
        .map(child => ({
          id: child.id,
          name: child.name,
          index: child.index ?? 0,
        })),
    }))
}

function createOrderKey(tree: SortableRootCategory[]) {
  const rootOrder = tree.map(item => item.id).join(',')
  const childrenOrder = tree
    .map(item => `${item.id}:${item.children.map(child => child.id).join(',')}`)
    .join('|')
  return `${rootOrder}::${childrenOrder}`
}

function SortableChildRow({ parentId, item }: { parentId: string; item: SortableChildCategory }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: childDragId(parentId, item.id),
  })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-sm text-slate-700',
        isDragging && 'z-10000'
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="cursor-grab touch-none bg-white text-slate-500 active:cursor-grabbing"
        aria-label={`拖拽排序 ${item.name}`}
        {...attributes}
        {...listeners}
      >
        <IconGripVertical size={16} />
      </Button>

      <span className="truncate">{item.name}</span>
      <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
        子类别
      </span>
    </li>
  )
}

function SortableRootBlock({
  item,
  isExpanded,
  onToggleExpand,
  hideWhileDragging,
}: {
  item: SortableRootCategory
  isExpanded: boolean
  onToggleExpand: () => void
  hideWhileDragging: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: rootDragId(item.id),
  })

  const childIds = useMemo(
    () => item.children.map(child => childDragId(item.id, child.id)),
    [item.children, item.id]
  )

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        visibility: hideWhileDragging ? 'hidden' : undefined,
      }}
      className={cn('space-y-2')}
    >
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-sm text-slate-700">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-grab touch-none bg-white text-slate-500 active:cursor-grabbing"
          aria-label={`拖拽排序 ${item.name}`}
          {...attributes}
          {...listeners}
        >
          <IconGripVertical size={16} />
        </Button>

        <span className="truncate font-medium">{item.name}</span>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="ml-auto text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label={`${isExpanded ? '折叠' : '展开'} ${item.name}`}
          aria-expanded={isExpanded}
          onClick={onToggleExpand}
        >
          {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </Button>
      </div>

      {isExpanded ? (
        <div className="mr-4 ml-5 border-l border-dashed border-slate-300 pl-3">
          {item.children.length > 0 ? (
            <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">
                {item.children.map(child => (
                  <SortableChildRow key={child.id} parentId={item.id} item={child} />
                ))}
              </ul>
            </SortableContext>
          ) : (
            <p className="py-2 text-xs text-slate-500">该类别下暂无子类别</p>
          )}
        </div>
      ) : null}
    </li>
  )
}

function OverlayRootBlock({
  item,
  isExpanded,
}: {
  item: SortableRootCategory
  isExpanded: boolean
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-sm text-slate-700">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-grab touch-none bg-white text-slate-500 active:cursor-grabbing"
          aria-label={`拖拽排序 ${item.name}`}
        >
          <IconGripVertical size={16} />
        </Button>

        <span className="truncate font-medium">{item.name}</span>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="ml-auto text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label={`${isExpanded ? '折叠' : '展开'} ${item.name}`}
          aria-expanded={isExpanded}
        >
          {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </Button>
      </div>

      {isExpanded ? (
        <div className="mr-4 ml-5 border-l border-dashed border-slate-300 pl-3">
          {item.children.length > 0 ? (
            <ul className="space-y-2">
              {item.children.map(child => (
                <li
                  key={child.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-sm text-slate-700"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-grab touch-none bg-white text-slate-500 active:cursor-grabbing"
                    aria-label={`拖拽排序 ${child.name}`}
                  >
                    <IconGripVertical size={16} />
                  </Button>

                  <span className="truncate">{child.name}</span>
                  <span className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
                    子类别
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-2 text-xs text-slate-500">该类别下暂无子类别</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

export interface CategorySortButtonProps extends Omit<ComponentProps<typeof Button>, 'onSubmit'> {
  children: ReactNode
}

export function CategorySortButton({ children, ...restProps }: CategorySortButtonProps) {
  const [sortDialogOpen, setSortDialogOpen] = useState(false)
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()

  const { data: tree = [], isPending } = useQuery({
    ...trpc.awesome.catelogs.tree.queryOptions(),
    initialData: [],
  })

  const mounted = useMounted()
  const dndContextId = useId()
  const [dragging, setDragging] = useState<SortableRootCategory | null>(null)
  const [activeRootId, setActiveRootId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const sourceTree = useMemo(() => normalizeTree(tree), [tree])
  const [draftTree, setDraftTree] = useState<SortableRootCategory[]>(sourceTree)
  const [expandedRootIds, setExpandedRootIds] = useState<Set<string>>(new Set())
  const previousRootIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    setDraftTree(sourceTree)
  }, [sourceTree])

  useEffect(() => {
    const currentRootIds = sourceTree.map(item => item.id)

    setExpandedRootIds(current => {
      const previousRootIds = previousRootIdsRef.current
      const nextExpanded = new Set<string>()

      if (previousRootIds.size === 0 && current.size === 0) {
        currentRootIds.forEach(id => nextExpanded.add(id))
      } else {
        currentRootIds.forEach(id => {
          if (current.has(id) || !previousRootIds.has(id)) {
            nextExpanded.add(id)
          }
        })
      }

      return nextExpanded
    })

    previousRootIdsRef.current = new Set(currentRootIds)
  }, [sourceTree])

  const sourceOrderKey = useMemo(() => createOrderKey(sourceTree), [sourceTree])
  const draftOrderKey = useMemo(() => createOrderKey(draftTree), [draftTree])
  const hasChanged = sourceOrderKey !== draftOrderKey
  const rootIds = useMemo(() => draftTree.map(item => rootDragId(item.id)), [draftTree])

  const resortMutation = useMutation({
    mutationFn: async (nextTree: SortableRootCategory[]) => {
      const payload = [
        ...nextTree.map((item, index) => ({ id: item.id, index })),
        ...nextTree.flatMap(parent =>
          parent.children.map((child, index) => ({ id: child.id, index }))
        ),
      ]

      return trpcClient.awesome.catelogs.resort.mutate(payload)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: trpc.awesome.items.tree.pathKey() }),
        queryClient.invalidateQueries({ queryKey: trpc.awesome.catelogs.tree.pathKey() }),
        queryClient.invalidateQueries({ queryKey: trpc.awesome.catelogs.list.pathKey() }),
      ])
      setSortDialogOpen(false)
    },
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveRootId(null)
    setDragging(null)

    if (!over || active.id === over.id) {
      return
    }

    const activeMeta = parseDragId(String(active.id))
    const overMeta = parseDragId(String(over.id))

    if (!activeMeta || !overMeta || activeMeta.kind !== overMeta.kind) {
      return
    }

    if (activeMeta.kind === 'root' && overMeta.kind === 'root') {
      setDraftTree(current => {
        const oldIndex = current.findIndex(item => item.id === activeMeta.id)
        const newIndex = current.findIndex(item => item.id === overMeta.id)

        if (oldIndex < 0 || newIndex < 0) {
          return current
        }

        return arrayMove(current, oldIndex, newIndex)
      })
      return
    }

    if (activeMeta.kind !== 'child' || overMeta.kind !== 'child') {
      return
    }

    if (activeMeta.parentId !== overMeta.parentId) {
      return
    }

    setDraftTree(current =>
      current.map(parent => {
        if (parent.id !== activeMeta.parentId) {
          return parent
        }

        const oldIndex = parent.children.findIndex(item => item.id === activeMeta.id)
        const newIndex = parent.children.findIndex(item => item.id === overMeta.id)

        if (oldIndex < 0 || newIndex < 0) {
          return parent
        }

        return {
          ...parent,
          children: arrayMove(parent.children, oldIndex, newIndex),
        }
      })
    )
  }

  const showEmpty = !isPending && draftTree.length === 0

  return (
    <Dialog
      open={sortDialogOpen}
      closeOnInteractOutside={false}
      onOpenChange={({ open }) => {
        setSortDialogOpen(open)
        if (open) {
          setExpandedRootIds(new Set(sourceTree.map(item => item.id)))
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" {...restProps}>
          {children}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[min(92vw,720px)] sm:max-w-[min(92vw,720px)]">
        <DialogHeader title="类别排序" description="通过拖拽调整类别显示顺序。" />

        <DialogBody scrollFade>
          {isPending ? (
            <p className="py-6 text-center text-sm text-slate-500">类别加载中...</p>
          ) : null}

          {showEmpty ? (
            <p className="py-6 text-center text-sm text-slate-500">暂无可排序的类别</p>
          ) : null}

          {!isPending && draftTree.length > 0 ? (
            <DndContext
              id={dndContextId}
              sensors={sensors}
              modifiers={[restrictToVerticalAxis]}
              onDragStart={event => {
                const activeMeta = parseDragId(String(event.active.id))
                if (!activeMeta || activeMeta.kind !== 'root') {
                  setActiveRootId(null)
                  setDragging(null)
                  return
                }

                setActiveRootId(activeMeta.id)
                setDragging(draftTree.find(item => item.id === activeMeta.id) ?? null)
              }}
              onDragCancel={() => {
                setActiveRootId(null)
                setDragging(null)
              }}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={rootIds} strategy={verticalListSortingStrategy}>
                <ul className="space-y-3">
                  {draftTree.map(item => (
                    <SortableRootBlock
                      key={item.id}
                      item={item}
                      isExpanded={expandedRootIds.has(item.id)}
                      hideWhileDragging={activeRootId === item.id}
                      onToggleExpand={() => {
                        setExpandedRootIds(current => {
                          const next = new Set(current)
                          if (next.has(item.id)) {
                            next.delete(item.id)
                          } else {
                            next.add(item.id)
                          }
                          return next
                        })
                      }}
                    />
                  ))}

                  {mounted
                    ? createPortal(
                        <DragOverlay dropAnimation={null}>
                          {dragging ? (
                            <OverlayRootBlock
                              item={dragging}
                              isExpanded={expandedRootIds.has(dragging.id)}
                            />
                          ) : null}
                        </DragOverlay>,
                        document.body
                      )
                    : null}
                </ul>
              </SortableContext>
            </DndContext>
          ) : null}

          {resortMutation.error ? (
            <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {resortMutation.error.message}
            </p>
          ) : null}
        </DialogBody>

        <DialogFooter>
          <ButtonGroup className="mr-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setExpandedRootIds(new Set())
              }}
            >
              <IconFold size={15} />
              全部折叠
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setExpandedRootIds(new Set(draftTree.map(item => item.id)))
              }}
            >
              <IconArrowsVertical size={15} />
              全部展开
            </Button>
          </ButtonGroup>

          <Button
            type="button"
            variant="outline"
            disabled={resortMutation.isPending}
            onClick={() => {
              setSortDialogOpen(false)
            }}
          >
            取消
          </Button>

          <Button
            type="button"
            disabled={!hasChanged || resortMutation.isPending || draftTree.length === 0}
            onClick={() => {
              void resortMutation.mutateAsync(draftTree)
            }}
          >
            {resortMutation.isPending ? '保存中...' : '保存排序'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
