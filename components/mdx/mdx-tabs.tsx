'use client'

import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'

import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from '@/components/animate-ui/components/radix/tabs'
import { cn } from '@/utils/style'

interface MdxTabProps {
  label?: string
  value?: string
  children: ReactNode
}

export function MdxTabs({ children, className }: { children: ReactNode; className?: string }) {
  const items = Children.toArray(children).filter(isMdxTab)

  if (items.length === 0) {
    return children
  }

  const tabValues = normalizeTabValues(items)
  const defaultValue = tabValues[0]

  return (
    <Tabs defaultValue={defaultValue} className={cn('my-6 w-full gap-0', className)}>
      <TabsList className="h-9 p-1">
        {items.map((item, index) => {
          const value = tabValues[index]

          return (
            <TabsTrigger
              key={value}
              value={value}
              fill={false}
              itemClassName="flex h-full items-center"
              className="font-en-sans cursor-pointer px-3"
            >
              {item.props.label || `选项 ${index + 1}`}
            </TabsTrigger>
          )
        })}
      </TabsList>

      <TabsContents>
        {items.map((item, index) => (
          <TabsContent
            key={tabValues[index]}
            value={tabValues[index]}
            className="flow-root"
            style={{ overflow: 'visible' }}
          >
            {item.props.children}
          </TabsContent>
        ))}
      </TabsContents>
    </Tabs>
  )
}

export function MdxTab({ children }: MdxTabProps) {
  return children
}

function normalizeTabValues(items: ReactElement<MdxTabProps>[]) {
  const used = new Set()

  return items.map((item, index) => {
    const rawValue = item.props.value?.trim() || `tab-${index + 1}`
    const normalizedValue = rawValue.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')
    const baseValue = normalizedValue.replace(/^-+|-+$/g, '') || `tab-${index + 1}`
    let value = baseValue
    let seed = 1

    while (used.has(value)) {
      value = `${baseValue}-${seed}`
      seed += 1
    }

    used.add(value)
    return value
  })
}

function isMdxTab(child: ReactNode): child is ReactElement<MdxTabProps> {
  return isValidElement<MdxTabProps>(child)
}
