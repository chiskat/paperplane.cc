'use client'

import Artalk from 'artalk'
import { usePathname } from 'next/navigation'
import { useCallback, useRef } from 'react'

import './Commet.css'

export default function Commet() {
  const pathname = usePathname()
  const artalk = useRef<Artalk>(undefined)

  const handleContainerInit = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) {
        return
      }

      if (artalk.current) {
        artalk.current.destroy()
        artalk.current = undefined
      }

      artalk.current = Artalk.init({
        el: node,
        pageKey: pathname,
        pageTitle: document.title,
        server: process.env.NEXT_PUBLIC_ARTALK_SERVER,
        site: '纸飞机的信笺',
      })
    },
    [pathname]
  )

  return (
    <section id="comments" className="mt-10">
      <h2 className="font-title-serif mb-4 text-[26px] text-[#333]">留言</h2>
      <div ref={handleContainerInit}></div>
    </section>
  )
}
