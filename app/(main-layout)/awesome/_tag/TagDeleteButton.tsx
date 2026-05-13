'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type ComponentProps, type ReactNode } from 'react'

import { ConfirmButton } from '@/components/button/ConfirmButton'
import { toast } from '@/components/ui/toast'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'

export interface TagDeleteButtonProps extends Omit<
  ComponentProps<typeof ConfirmButton>,
  'children' | 'confirm' | 'onConfirm'
> {
  tagId: string
  tagName?: string
  children: ReactNode
  onSuccess?: () => void
}

export function TagDeleteButton({
  tagId,
  tagName,
  children,
  onSuccess,
  disabled,
  ...restProps
}: TagDeleteButtonProps) {
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return trpcClient.awesome.tags.delete.mutate({ id: tagId })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trpc.awesome.tags.list.queryKey() })
      toast.success({
        title: '删除成功',
        description: `标签「${tagName || '未命名'}」已删除`,
      })
      onSuccess?.()
      setOpen(false)
    },
  })

  return (
    <ConfirmButton
      {...restProps}
      disabled={disabled || deleteMutation.isPending}
      confirm={`删除后不可恢复，确认删除标签「${tagName || '未命名'}」吗？`}
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
