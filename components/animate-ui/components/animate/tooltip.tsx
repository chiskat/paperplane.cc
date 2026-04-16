import * as motion from 'motion/react-client'
import * as React from 'react'

import {
  TooltipArrow as TooltipArrowPrimitive,
  TooltipContent as TooltipContentPrimitive,
  Tooltip as TooltipPrimitive,
  TooltipProvider as TooltipProviderPrimitive,
  TooltipTrigger as TooltipTriggerPrimitive,
  type TooltipContentProps as TooltipContentPrimitiveProps,
  type TooltipProps as TooltipPrimitiveProps,
  type TooltipProviderProps as TooltipProviderPrimitiveProps,
  type TooltipTriggerProps as TooltipTriggerPrimitiveProps,
} from '@/components/animate-ui/primitives/animate/tooltip'
import { cn } from '@/utils/style'

type TooltipProviderProps = TooltipProviderPrimitiveProps

function TooltipProvider({ openDelay = 0, ...props }: TooltipProviderProps) {
  return <TooltipProviderPrimitive openDelay={openDelay} {...props} />
}

type TooltipProps = TooltipPrimitiveProps

function Tooltip({ sideOffset = 10, ...props }: TooltipProps) {
  return <TooltipPrimitive sideOffset={sideOffset} {...props} />
}

type TooltipTriggerProps = TooltipTriggerPrimitiveProps

function TooltipTrigger({ ...props }: TooltipTriggerProps) {
  return <TooltipTriggerPrimitive {...props} />
}

type TooltipContentProps = Omit<TooltipContentPrimitiveProps, 'asChild'> & {
  children: React.ReactNode
  layout?: boolean | 'position' | 'size' | 'preserve-aspect'
}

function TooltipContent({
  className,
  children,
  layout = 'preserve-aspect',
  ...props
}: TooltipContentProps) {
  return (
    <TooltipContentPrimitive
      className={cn('z-50 w-fit rounded-md bg-[#0b0b0b] text-white', className)}
      {...props}
    >
      <motion.div className="overflow-hidden px-3 py-1.5 text-xs text-balance">
        <motion.div layout={layout}>{children}</motion.div>
      </motion.div>
      <TooltipArrowPrimitive
        className="size-3 fill-[#0b0b0b] data-[side='bottom']:translate-y-px data-[side='left']:-translate-x-px data-[side='right']:translate-x-px data-[side='top']:-translate-y-px"
        tipRadius={2}
      />
    </TooltipContentPrimitive>
  )
}

export {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  type TooltipProviderProps,
  type TooltipProps,
  type TooltipTriggerProps,
  type TooltipContentProps,
}
