import { NextResponse } from 'next/server'

import { createTRPCContext } from '@/lib/trpc'
import { createTRPCCaller } from '@/lib/trpc-server'
import { ShortRedirectType } from '@/models/enums'

export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const key = (await params).key

  const trpcContext = await createTRPCContext({ req: request })
  const trpcCaller = createTRPCCaller(trpcContext)

  const { url, redirectType } = await trpcCaller.short.items.get({ key })

  if (redirectType === ShortRedirectType.JAVASCRIPT) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>跳转中...</title>
        </head>
        <body>
          <script>
            window.location.replace("${url}")
          </script>
        </body>
      </html>
    `

    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }

  return NextResponse.redirect(url, {
    status: redirectType === ShortRedirectType.PERMANENTLY ? 301 : 302,
  })
}
