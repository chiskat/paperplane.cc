import { NextResponse } from 'next/server'

import { getRssXml } from '../feed.xml/_feed'

export const dynamic = 'force-static'

export async function GET() {
  return new NextResponse(getRssXml(), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
