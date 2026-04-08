'use client'

import { isMotionComponent, motion, type HTMLMotionProps } from 'motion/react'
import * as React from 'react'

import { cn } from '@/utils/style'

type AnyProps = Record<string, unknown>

type DOMMotionProps<T extends HTMLElement = HTMLElement> = Omit<
  HTMLMotionProps<keyof HTMLElementTagNameMap>,
  'ref'
> & { ref?: React.Ref<T> }

type WithAsChild<Base extends object> =
  | (Base & { asChild: true; children: React.ReactElement })
  | (Base & { asChild?: false | undefined })

type SlotProps<T extends HTMLElement = HTMLElement> = {
  children?: React.ReactNode
} & DOMMotionProps<T>

function getMotionComponent(type: React.ElementType): React.ElementType | null {
  if (isMotionComponent(type)) return type

  if (typeof type !== 'string') return null
  const component = Reflect.get(motion, type)
  return component ? (component as React.ElementType) : null
}

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return node => {
    refs.forEach(ref => {
      if (!ref) return
      if (typeof ref === 'function') {
        ref(node)
      } else {
        ;(ref as React.RefObject<T | null>).current = node
      }
    })
  }
}

function mergeProps<T extends HTMLElement>(
  childProps: AnyProps,
  slotProps: DOMMotionProps<T>
): AnyProps {
  const merged: AnyProps = { ...childProps, ...slotProps }

  if (childProps.className || slotProps.className) {
    merged.className = cn(childProps.className as string, slotProps.className as string)
  }

  if (childProps.style || slotProps.style) {
    merged.style = {
      ...(childProps.style as React.CSSProperties),
      ...(slotProps.style as React.CSSProperties),
    }
  }

  return merged
}

function Slot<T extends HTMLElement = HTMLElement>({ children, ref, ...props }: SlotProps<T>) {
  const isValidChild = React.isValidElement(children)

  if (!isValidChild) return null
  const childType = children.type as React.ElementType
  const Base = getMotionComponent(childType)

  const { ref: childRef, ...childProps } = children.props as AnyProps

  const mergedProps = mergeProps(childProps, props)

  if (!Base) {
    return children
  }

  return React.createElement(Base, {
    ...mergedProps,
    ref: mergeRefs(childRef as React.Ref<T>, ref),
  })
}

export { Slot, type SlotProps, type WithAsChild, type DOMMotionProps, type AnyProps }
