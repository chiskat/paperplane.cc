'use client'

import {
  Children,
  isValidElement,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from '@/components/animate-ui/primitives/animate/tabs'

interface CodeGroupItemProps {
  label?: string
  children: ReactNode
}

export function CodeGroup({ children }: { children: ReactNode }) {
  const items = useMemo(() => Children.toArray(children).filter(isCodeGroupItem), [children])
  const values = useMemo(() => items.map((_, index) => `code-group-tab-${index}`), [items])
  const firstValue = values[0] ?? ''
  const [activeValue, setActiveValue] = useState<string | null>(null)

  if (!firstValue) {
    return null
  }

  const currentValue = activeValue && values.includes(activeValue) ? activeValue : firstValue

  return (
    <Tabs
      value={currentValue}
      onValueChange={value => setActiveValue(value)}
      data-slot="code-group-tabs"
      className="bg-muted/50 my-6 w-full gap-0 overflow-hidden rounded-xl"
    >
      <TabsHighlight className="absolute right-0 bottom-0 left-0 z-0 h-0.5 rounded-full bg-[#b3ada6] shadow-none">
        <TabsList
          data-slot="code-group-tabs-list"
          className="relative flex h-10 w-full items-center justify-between rounded-none bg-[#ece8e5] px-4 py-0 text-current"
        >
          <div className="flex h-full gap-x-5">
            {items.map((item, index) => {
              const value = values[index]

              return (
                <TabsHighlightItem
                  key={value}
                  value={value}
                  className="flex items-center justify-center"
                >
                  <TabsTrigger
                    value={value}
                    className="text-muted-foreground data-[state=active]:text-foreground font-en-sans h-full cursor-pointer px-0 text-sm"
                  >
                    {item.props.label || `代码 ${index + 1}`}
                  </TabsTrigger>
                </TabsHighlightItem>
              )
            })}
          </div>
        </TabsList>
      </TabsHighlight>

      <TabsContents className="[&_figure]:m-0 [&_figure]:overflow-hidden [&_figure]:rounded-none [&_figure]:shadow-none [&_pre]:mt-0 [&_pre]:mb-0 [&_pre]:rounded-none [&_pre]:shadow-none">
        {items.map((item, index) => {
          const value = values[index]

          return (
            <TabsContent key={value} value={value} className="w-full">
              {item.props.children}
            </TabsContent>
          )
        })}
      </TabsContents>
    </Tabs>
  )
}

export function CodeGroupItem({ children }: CodeGroupItemProps) {
  return children
}

function isCodeGroupItem(child: ReactNode): child is ReactElement<CodeGroupItemProps> {
  return isValidElement<CodeGroupItemProps>(child)
}
