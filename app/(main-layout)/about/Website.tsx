import { IconCpu, IconLink } from '@tabler/icons-react'
import Link from 'next/link'
import { cloneElement, ReactNode } from 'react'

import { BlurPopupCard } from '@/components/effect/BlurPopupCard'
import { getTechTagByName } from '@/components/tag/tech-tags'
import { Highlight } from '@/components/text/Highlight'
import { Separator } from '@/components/ui/separator'

export interface WebsiteProps {
  title: string
  icon: ReactNode
  href: string
  hrefHighlight?: string | string[]
  desc?: string
  techs?: string[]
}

export default function Website(props: WebsiteProps) {
  const { title, icon, href, desc, hrefHighlight, techs } = props
  const techTags = (techs ?? [])
    .map(item => {
      const Tag = getTechTagByName(item)
      return Tag ? { name: item, Tag } : null
    })
    .filter(
      (item): item is { name: string; Tag: NonNullable<ReturnType<typeof getTechTagByName>> } =>
        item !== null
    )

  const popup = (
    <div className="mt-3 flex flex-col gap-2">
      <Separator className="mt-3" />

      <table>
        <tbody>
          <tr>
            <td className="w-24 cursor-default py-1 leading-normal whitespace-nowrap">
              <span className="inline-flex items-center">
                <IconLink className="mr-1" size={16} /> 地址：
              </span>
            </td>

            <td className="py-1 leading-normal">
              <Link className="text-gray-500 underline" href={href} target="_blank">
                <Highlight keywords={hrefHighlight}>{href.replace('https://', '')}</Highlight>
              </Link>
            </td>
          </tr>

          {techTags.length > 0 ? (
            <tr>
              <td className="w-24 cursor-default py-1 leading-normal whitespace-nowrap">
                <span className="inline-flex items-center">
                  <IconCpu className="mr-1" size={16} /> 技术栈：
                </span>
              </td>

              <td className="py-1 leading-normal">
                {techTags.map(({ name, Tag }, index) => (
                  <span key={`${name}-${index}`}>
                    <Tag />
                    {index < techTags.length - 1 ? ' ' : null}
                  </span>
                ))}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )

  return (
    <BlurPopupCard right={-120} popupChildren={popup}>
      <Link href={href} target="_blank">
        <div className="flex shrink-0 cursor-pointer flex-nowrap gap-4">
          {cloneElement(icon as any, { style: { height: 48, width: 48 } })}

          <div className="flex flex-col gap-0">
            <p className="font-title-serif text-[20px] leading-[1.3] text-gray-700">{title}</p>
            {desc ? (
              <p className="font-sans text-[16px] leading-[1.3] text-gray-400">{desc}</p>
            ) : null}
          </div>
        </div>
      </Link>
    </BlurPopupCard>
  )
}
