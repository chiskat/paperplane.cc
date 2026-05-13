import {
  CheckCircle2Icon,
  CircleAlertIcon,
  InfoIcon,
  TriangleAlertIcon,
  type LucideProps,
} from 'lucide-react'
import type { ComponentProps, ComponentType, ReactNode } from 'react'

import { cn } from '@/utils/style'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'

const TIPS_CONFIG = {
  tips: {
    icon: InfoIcon,
    className: 'border-0 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-100',
    iconClassName: 'text-blue-600 dark:text-blue-300',
  },
  warning: {
    icon: TriangleAlertIcon,
    className: 'border-0 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100',
    iconClassName: 'text-amber-600 dark:text-amber-300',
  },
  success: {
    icon: CheckCircle2Icon,
    className:
      'border-0 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100',
    iconClassName: 'text-emerald-600 dark:text-emerald-300',
  },
  error: {
    icon: CircleAlertIcon,
    className: 'border-0 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100',
    iconClassName: 'text-rose-600 dark:text-rose-300',
  },
} as const

export type TipsType = keyof typeof TIPS_CONFIG

export interface TipsProps extends Omit<ComponentProps<typeof Alert>, 'title' | 'content'> {
  type?: TipsType
  title?: ReactNode
  content?: ReactNode
  icon?: ComponentType<LucideProps>
  iconClassName?: string
  titleClassName?: string
  contentClassName?: string
}

export function Tips(props: TipsProps) {
  const {
    type = 'tips',
    title,
    content,
    children,
    icon,
    className,
    iconClassName,
    titleClassName,
    contentClassName,
    ...rest
  } = props

  const config = TIPS_CONFIG[type]
  const Icon = icon ?? config.icon
  const description = children ?? content

  return (
    <Alert
      {...rest}
      className={cn('px-4 py-3 sm:col-span-2', config.className, className)}
      data-tips-type={type}
    >
      <Icon className={cn('size-4.5', config.iconClassName, iconClassName)} />
      {title ? <AlertTitle className={cn('text-sm', titleClassName)}>{title}</AlertTitle> : null}
      {description ? (
        <AlertDescription
          className={cn('mt-1 text-sm/relaxed whitespace-pre-line', contentClassName)}
        >
          {description}
        </AlertDescription>
      ) : null}
    </Alert>
  )
}
