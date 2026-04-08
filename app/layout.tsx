import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { cn } from '@/utils/style'
import ClientProvider from './ClientProvider'
import { fontFZYanSong, fontIosevka, fontLXGWWenKai, fontSwift } from './fonts'

import '@/utils/init-dayjs'
import '@/utils/init-zod'
import '../styles/theme.css'
import '../styles/app.css'

export const metadata: Metadata = {
  title: 'PaperPlane.cc',
  description: 'PaperPlane.cc by chiskat',
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="zh-CN"
      className={cn(
        fontFZYanSong.variable,
        fontIosevka.variable,
        fontSwift.variable,
        fontLXGWWenKai.variable,
        'antialiased'
      )}
    >
      <head>
        <meta name="renderer" content="webkit" />
        <meta name="force-rendering" content="webkit" />
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="msapplication-TileColor" content="#FFFFFF" />
      </head>

      <body style={{ marginRight: '0 !important' }}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  )
}
