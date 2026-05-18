import { CSSProperties, forwardRef, ReactNode } from 'react'

import { cn } from '@/utils/style'

export interface BlurPopupCardProps {
  px?: number
  py?: number
  popupPx?: number
  popupPy?: number
  right?: number
  className?: string
  popupClassName?: string
  children?: ReactNode
  popupChildren?: ReactNode
  style?: CSSProperties
}

export const BlurPopupCard = forwardRef<HTMLDivElement, BlurPopupCardProps>(
  function BlurPopupCardWithoutRef(props, ref) {
    const {
      px = 0,
      py = 0,
      popupPx = 12,
      popupPy = 12,
      right = 0,
      className,
      popupClassName,
      children,
      popupChildren,
      style,
    } = props

    return (
      <div
        className={cn('blur-popup-card group', className)}
        style={{
          paddingLeft: px,
          paddingRight: px,
          paddingTop: py,
          paddingBottom: py,
          position: 'relative',
          ...style,
        }}
        ref={ref}
      >
        {children}

        <div
          className={cn(
            'blur-popup-card__popup z-10 hidden rounded-md bg-white/60 shadow-[0_0_5px_0_rgba(0,0,0,0.45)] backdrop-blur-lg group-hover:block hover:block',
            popupClassName
          )}
          style={{
            paddingLeft: popupPx,
            paddingRight: popupPx,
            paddingTop: popupPy,
            paddingBottom: popupPy,
            left: px - popupPx,
            top: py - popupPy,
            right: 0 - px - popupPx + right,
            position: 'absolute',
          }}
        >
          {children}

          {popupChildren}
        </div>
      </div>
    )
  }
)
