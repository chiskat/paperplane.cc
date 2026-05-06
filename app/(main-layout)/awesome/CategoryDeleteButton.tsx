'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type ComponentProps, type ReactNode } from 'react'

import type { AwesomeTreeResult } from '@/apis/awesome/items'
import { ConfirmButton } from '@/components/button/ConfirmButton'
import { toast } from '@/components/ui/toast'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'

type CategoryDeleteValue = AwesomeTreeResult & {
  hasChildren: boolean
}

export interface CategoryDeleteButtonProps extends Omit<
  ComponentProps<typeof ConfirmButton>,
  'children' | 'confirm' | 'onConfirm'
> {
  category: CategoryDeleteValue
  children: ReactNode
  onSuccess?: () => void
}

export function CategoryDeleteButton({
  category,
  children,
  onSuccess,
  disabled,
  ...restProps
}: CategoryDeleteButtonProps) {
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return trpcClient.awesome.catelogs.delete.mutate({ id: category.id })
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: trpc.awesome.items.tree.pathKey() }),
        queryClient.invalidateQueries({ queryKey: trpc.awesome.catelogs.tree.pathKey() }),
        queryClient.invalidateQueries({ queryKey: trpc.awesome.catelogs.list.pathKey() }),
      ])
      toast.success({
        title: '删除成功',
        description: `类别「${category.parent?.name ? `${category.parent.name} / ${category.name}` : category.name}」已删除`,
      })
      onSuccess?.()
      setOpen(false)
    },
  })

  return (
    <ConfirmButton
      {...restProps}
      disabled={disabled || deleteMutation.isPending}
      confirm={
        <div className="space-y-1.5 text-sm leading-relaxed">
          <p>
            删除后不可恢复，确认删除类别「
            {category.parent?.name ? `${category.parent.name} / ${category.name}` : category.name}
            」吗？
          </p>
          {category.hasChildren ? <p>此类别包含子类别，子类别也会被一并删除。</p> : null}
          <p>被删除分类下的任何 Awesome 均不会被删除，而是会被设为「未分类」。</p>
        </div>
      }
      confirmButtonText={deleteMutation.isPending ? '删除中...' : '确认删除'}
      confirmButtonProps={{ variant: 'destructive', disabled: deleteMutation.isPending }}
      cancelButtonProps={{ disabled: deleteMutation.isPending }}
      popoverProps={{
        open,
        onOpenChange: details => {
          setOpen(details.open)
          if (details.open) {
            deleteMutation.reset()
          }
        },
      }}
      popoverContentProps={{ className: 'max-w-96' }}
      onConfirm={() => {
        void deleteMutation.mutateAsync()
      }}
    >
      {children}
    </ConfirmButton>
  )
}
