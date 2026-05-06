import { NextResponse } from 'next/server'

import { allLlms } from '@/.content-collections/generated'

export async function GET() {
  return new NextResponse(allLlms[0].content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
