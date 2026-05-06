'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type ComponentProps, type ReactNode } from 'react'

import { ConfirmButton } from '@/components/button/ConfirmButton'
import { useTRPC, useTRPCClient } from '@/lib/trpc-client'

export interface ShortDeleteButtonProps extends Omit<
  ComponentProps<typeof ConfirmButton>,
  'children' | 'confirm' | 'onConfirm'
> {
  itemId: string
  itemKey?: string
  children: ReactNode
  onSuccess?: () => void
}

export function ShortDeleteButton({
  itemId,
  itemKey,
  children,
  onSuccess,
  disabled,
  ...restProps
}: ShortDeleteButtonProps) {
  const trpc = useTRPC()
  const trpcClient = useTRPCClient()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return trpcClient.short.items.delete.mutate({ id: itemId })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trpc.short.items.list.pathKey() })
      onSuccess?.()
      setOpen(false)
    },
  })

  return (
    <ConfirmButton
      {...restProps}
      disabled={disabled || deleteMutation.isPending}
      confirm={`删除后不可恢复，确认删除短链接「${itemKey || '未知'}」吗？`}
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
