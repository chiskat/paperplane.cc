import { NextResponse } from 'next/server'

import { getAtomXml } from '../feed.xml/_feed'

export const dynamic = 'force-static'

export async function GET() {
  return new NextResponse(getAtomXml(), {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  })
}
