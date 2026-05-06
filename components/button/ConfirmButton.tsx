'use client'

import { type ComponentProps, type MouseEvent, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverBody,
  PopoverClose,
  PopoverContent,
  PopoverFooter,
  PopoverTrigger,
} from '@/components/ui/popover'

type ConfirmActionButtonProps = Omit<ComponentProps<typeof Button>, 'children'>

export interface ConfirmButtonProps extends ComponentProps<typeof Button> {
  confirm: ReactNode

  confirmButtonText?: ReactNode
  confirmButtonProps?: ConfirmActionButtonProps
  onConfirm?: () => void

  cancelButtonText?: ReactNode
  cancelButtonProps?: ConfirmActionButtonProps
  onCancel?: () => void

  popoverProps?: Omit<ComponentProps<typeof Popover>, 'children'>
  popoverContentProps?: Omit<ComponentProps<typeof PopoverContent>, 'children'>
  popoverBodyProps?: Omit<ComponentProps<typeof PopoverBody>, 'children'>
  popoverFooterProps?: Omit<ComponentProps<typeof PopoverFooter>, 'children'>
}

export function ConfirmButton(props: ConfirmButtonProps) {
  const {
    children,
    confirm,
    confirmButtonText = '确认',
    confirmButtonProps,
    onConfirm,
    cancelButtonText = '取消',
    cancelButtonProps,
    onCancel,
    popoverProps,
    popoverContentProps,
    popoverBodyProps,
    popoverFooterProps,
    ...buttonProps
  } = props

  const handleConfirmClick = (event: MouseEvent<HTMLButtonElement>) => {
    confirmButtonProps?.onClick?.(event)

    if (event.defaultPrevented) {
      return
    }

    onConfirm?.()
  }

  const handleCancelClick = (event: MouseEvent<HTMLButtonElement>) => {
    cancelButtonProps?.onClick?.(event)

    if (event.defaultPrevented) {
      return
    }

    onCancel?.()
  }

  return (
    <Popover {...popoverProps}>
      <PopoverTrigger asChild>
        <Button {...buttonProps}>{children}</Button>
      </PopoverTrigger>

      <PopoverContent {...popoverContentProps}>
        <PopoverBody {...popoverBodyProps}>{confirm}</PopoverBody>

        <PopoverFooter {...popoverFooterProps}>
          <PopoverClose asChild>
            <Button variant="outline" {...cancelButtonProps} onClick={handleCancelClick}>
              {cancelButtonText}
            </Button>
          </PopoverClose>

          <PopoverClose asChild>
            <Button {...confirmButtonProps} onClick={handleConfirmClick}>
              {confirmButtonText}
            </Button>
          </PopoverClose>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  )
}
