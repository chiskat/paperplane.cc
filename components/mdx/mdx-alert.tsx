import {
  BadgeInfoIcon,
  CircleAlertIcon,
  InfoIcon,
  LightbulbIcon,
  ShieldAlertIcon,
  TriangleAlertIcon,
} from 'lucide-react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '@/utils/style'

const ALERT_CONFIG = {
  info: {
    title: 'INFO',
    icon: InfoIcon,
    className: 'border-[#2f629d] bg-[#edf5ff] text-[#20364f]',
    iconClassName: 'text-[#2f629d]',
  },
  tip: {
    title: 'TIP',
    icon: LightbulbIcon,
    className: 'border-[#2f8f6f] bg-[#eefaf5] text-[#21473a]',
    iconClassName: 'text-[#2f8f6f]',
  },
  warning: {
    title: 'WARNING',
    icon: TriangleAlertIcon,
    className: 'border-[#d99a2b] bg-[#fff7e6] text-[#5d3f15]',
    iconClassName: 'text-[#c98218]',
  },
  danger: {
    title: 'DANGER',
    icon: CircleAlertIcon,
    className: 'border-[#c0332f] bg-[#fff0ef] text-[#5a2422]',
    iconClassName: 'text-[#c0332f]',
  },
  note: {
    title: 'NOTE',
    icon: BadgeInfoIcon,
    className: 'border-[#7a6f64] bg-[#f7f4f0] text-[#3f3933]',
    iconClassName: 'text-[#7a6f64]',
  },
  important: {
    title: 'IMPORTANT',
    icon: ShieldAlertIcon,
    className: 'border-[#8a5fb8] bg-[#f6f0ff] text-[#3d2a52]',
    iconClassName: 'text-[#8a5fb8]',
  },
  caution: {
    title: 'CAUTION',
    icon: TriangleAlertIcon,
    className: 'border-[#a35b2a] bg-[#fff3ea] text-[#573019]',
    iconClassName: 'text-[#a35b2a]',
  },
} as const

type MdxAlertType = keyof typeof ALERT_CONFIG

interface MdxAlertProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  type?: MdxAlertType
  title?: ReactNode
}

export function MdxAlert({ type = 'info', title, children, className, ...props }: MdxAlertProps) {
  const config = ALERT_CONFIG[type] ?? ALERT_CONFIG.info
  const Icon = config.icon

  return (
    <div
      {...props}
      className={cn(
        'my-6 flex gap-3 rounded-md border-l-[5px] px-4 py-3 text-[18px] leading-[1.65] shadow-[0_1px_0_rgba(0,0,0,0.03)]',
        '[&_ol]:my-2 [&_p]:my-0 [&_p+p]:mt-2 [&_pre]:my-3 [&_ul]:my-2',
        config.className,
        className
      )}
      data-alert-type={type}
    >
      <Icon className={cn('mt-1 size-5 shrink-0', config.iconClassName)} aria-hidden />

      <div className="min-w-0 flex-1">
        <div className="font-title-serif mb-1 text-[18px] font-semibold tracking-normal">
          {title || config.title}
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
