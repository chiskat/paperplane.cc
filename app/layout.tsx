import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { cn } from '@/utils/style'
import ClientProvider from './client-provider'
import { fontFZYanSong, fontIosevka, fontLXGWWenKai, fontSwift } from './fonts'

import '@/utils/init-lib'
import '../styles/theme.css'
import '../styles/app.css'

export const metadata: Metadata = {
  title: '纸飞机的信笺 PaperPlane.cc',
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
        <link
          rel="alternate"
          type="application/rss+xml"
          title="纸飞机的信笺 PaperPlane.cc"
          href="/rss.xml"
        />
      </head>

      <body style={{ marginRight: '0 !important' }}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  )
}
