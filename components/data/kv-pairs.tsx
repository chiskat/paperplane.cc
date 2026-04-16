'use client'

import { createContext, useContext } from 'react'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/utils/style'

interface KVPairsContextValue {
  colon?: ReactNode
  reserveIconSpace: boolean
}

const KVPairsContext = createContext<KVPairsContextValue>({
  reserveIconSpace: true,
})

export interface KVPairsProps extends ComponentProps<'dl'> {
  colon?: ReactNode
  noReserveIconSpace?: boolean
  fitContentWidth?: boolean
}

export interface KVPairsItemProps extends Omit<ComponentProps<'div'>, 'children'> {
  label: ReactNode
  children?: ReactNode
  icon?: ReactNode
  labelClassName?: string
  contentClassName?: string
  iconClassName?: string
}

export function KVPairs({
  className,
  children,
  colon,
  noReserveIconSpace,
  fitContentWidth,
  ...props
}: KVPairsProps) {
  return (
    <KVPairsContext.Provider value={{ colon, reserveIconSpace: !noReserveIconSpace }}>
      <dl
        data-slot="kv-pairs"
        className={cn(
          'divide-y divide-[#e8e0d9] overflow-hidden rounded-xl border border-[#ddd] bg-white/85 shadow-[0_8px_25px_-20px_rgba(0,0,0,0.45)]',
          fitContentWidth && 'w-fit',
          className
        )}
        {...props}
      >
        {children}
      </dl>
    </KVPairsContext.Provider>
  )
}

export function KVPairsItem({
  className,
  label,
  children,
  icon,
  labelClassName,
  contentClassName,
  iconClassName,
  ...props
}: KVPairsItemProps) {
  const { colon, reserveIconSpace } = useContext(KVPairsContext)

  return (
    <div
      data-slot="kv-pairs-item"
      className={cn(
        'grid items-stretch text-[16px]',
        reserveIconSpace
          ? 'grid-cols-[2.75rem_6.5rem_minmax(0,1fr)]'
          : 'grid-cols-[6.5rem_minmax(0,1fr)]',
        className
      )}
      {...props}
    >
      {reserveIconSpace ? (
        <div
          aria-hidden
          className={cn(
            'flex h-full items-start justify-center self-stretch bg-[#f7f2ee] py-2 text-[#4a5665]',
            iconClassName
          )}
        >
          <span
            className={cn(
              'mt-1.25 inline-flex h-4 w-4 items-center justify-center',
              !icon && 'invisible'
            )}
          >
            {icon ?? <span className="h-4 w-4" />}
          </span>
        </div>
      ) : null}

      <dt
        className={cn(
          'm-0 flex items-start gap-1 self-stretch bg-[#f7f2ee] py-2 text-left leading-6 text-[#4a5665]',
          'font-medium',
          labelClassName
        )}
      >
        {!reserveIconSpace && icon ? (
          <span className="mt-0.75 inline-flex h-4 w-4 shrink-0 items-center justify-center text-[#4a5665]">
            {icon}
          </span>
        ) : null}
        <span>
          {label}
          {colon}
        </span>
      </dt>

      <dd className={cn('m-0 min-w-0 px-4 py-2 leading-6 text-[#3f4a59]', contentClassName)}>
        {children}
      </dd>
    </div>
  )
}
