import { NextResponse } from 'next/server'
import { generateOpenApiDocument } from 'trpc-to-openapi'

import { appRouter } from '@/apis/appRouter'

export function GET() {
  return NextResponse.json(
    generateOpenApiDocument(appRouter, {
      title: 'PaperPlane.cc OpenAPI 接口文档',
      description:
        '此文档仅含对外部暴露的接口，不含内部使用的 trpc 接口。请使用账户的 API Key，放置于 "X-API-KEY" 请求头中。',
      version: '',
      baseUrl: '/api',
      docsUrl: 'https://github.com/mcampa/trpc-to-openapi',
    })
  )
}
