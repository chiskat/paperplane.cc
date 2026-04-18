'use client'

import { useQuery } from '@tanstack/react-query'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { ReactNode, useState } from 'react'

import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from '@/components/animate-ui/components/radix/tabs'
import { KVPairs, KVPairsItem } from '@/components/data/kv-pairs'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSession } from '@/lib/auth-client'
import { useTRPC } from '@/lib/trpc-client'
import { cn } from '@/utils/style'
import { CopyButton } from '../copy-button'
import { Highlight } from '../text/Highlight'

export type ApiMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD'
  | (string & {})

export interface ApiDocMetadata {
  url: string
  method: ApiMethod
  contentType: string
  requireAuth: boolean
  description?: string
}

export interface ApiDocRequestField {
  name: string
  type: string
  required?: boolean
  defaultValue?: ReactNode
  description: string
}

export interface ApiDocResponseField {
  name: string
  type: string
  description: string
}

export interface ApiDocProps {
  metadata: ApiDocMetadata
  request?: {
    description?: string
    fields: ApiDocRequestField[]
  }
  response?: {
    description?: string
    fields: ApiDocResponseField[]
  }
  className?: string
  emptyText?: string
}

const DEFAULT_EMPTY_TEXT = '暂无数据'
const DOC_TABLE_CONTAINER_CLASS =
  'overflow-hidden rounded-xl border border-[#ddd] bg-white/85 shadow-[0_8px_25px_-20px_rgba(0,0,0,0.45)]'
const DOC_TABLE_HEADER_CLASS = 'bg-[#f7f2ee] [&_th]:text-[#4a5665]'
const DOC_TABLE_FIRST_COLUMN_CLASS = '[&_th:first-child]:pl-5 [&_td:first-child]:pl-5'
const DOC_TABLE_CELL_CLASS = 'align-top whitespace-pre-line leading-6 break-words'

function formatDescription(value: string) {
  return value.replace(/\\n/g, '\n')
}

function formatCellValue(value: ReactNode) {
  return typeof value === 'string' ? formatDescription(value) : value
}

function ApiKeyDisplay({ user, apiKey }: { user: unknown; apiKey: { key: string } | undefined }) {
  const [tokenVisible, setTokenVisible] = useState(false)

  if (!user) {
    return <span className="text-muted-foreground text-sm">登录后可用</span>
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className="select-all">{tokenVisible ? apiKey?.key : '•••••••••'}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTokenVisible(v => !v)}
        aria-label={tokenVisible ? '隐藏' : '显示'}
      >
        {tokenVisible ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
      {tokenVisible && apiKey?.key ? (
        <CopyButton value={apiKey.key} size="sm" className="h-7 w-7" />
      ) : null}
    </span>
  )
}

export function ApiDoc({
  metadata,
  request,
  response,
  className,
  emptyText = DEFAULT_EMPTY_TEXT,
}: ApiDocProps) {
  const trpc = useTRPC()
  const { user } = useSession()
  const { data: apiKey } = useQuery({
    ...trpc.user.apiKey.ensure.queryOptions(),
    enabled: !!user,
  })
  const requestFields = request?.fields ?? []
  const responseFields = response?.fields ?? []

  return (
    <Tabs defaultValue="metadata" className={cn('w-full gap-4', className)}>
      <TabsList className="w-fit">
        <TabsTrigger value="metadata" fill={false} className="cursor-pointer px-4">
          元数据
        </TabsTrigger>

        <TabsTrigger value="request" fill={false} className="cursor-pointer px-4">
          入参格式
        </TabsTrigger>

        <TabsTrigger value="response" fill={false} className="cursor-pointer px-4">
          返回值
        </TabsTrigger>
      </TabsList>

      <TabsContents>
        <TabsContent value="metadata" className="space-y-3">
          {metadata.description ? (
            <p className="text-muted-foreground text-sm leading-6 whitespace-pre-line">
              {formatDescription(metadata.description)}
            </p>
          ) : null}

          <KVPairs colon="：" noReserveIconSpace labelWidth="11rem">
            <KVPairsItem label="接口 URL" contentClassName="font-mono text-[13px]">
              <Highlight keywords={metadata.url}>
                {process.env.NEXT_PUBLIC_BASE_URL + metadata.url}
              </Highlight>
            </KVPairsItem>

            <KVPairsItem label="请求方法" contentClassName="font-mono text-[13px]">
              {metadata.method}
            </KVPairsItem>

            <KVPairsItem label="Content-Type" contentClassName="font-mono text-[13px]">
              {metadata.contentType}
            </KVPairsItem>

            <KVPairsItem label="是否需鉴权" contentClassName="font-mono text-[13px]">
              {metadata.requireAuth ? '是' : '否'}
            </KVPairsItem>

            {metadata.requireAuth ? (
              <>
                <KVPairsItem label="鉴权 Header 键" contentClassName="font-mono text-[13px]">
                  X-API-KEY
                </KVPairsItem>

                <KVPairsItem label="鉴权 Header 值" contentClassName="font-mono text-[13px]">
                  <ApiKeyDisplay user={user} apiKey={apiKey} />
                </KVPairsItem>
              </>
            ) : null}
          </KVPairs>
        </TabsContent>

        <TabsContent value="request" className="space-y-3">
          {request?.description ? (
            <p className="text-muted-foreground text-sm leading-6 whitespace-pre-line">
              {formatDescription(request.description)}
            </p>
          ) : null}

          {requestFields.length > 0 ? (
            <div className={DOC_TABLE_CONTAINER_CLASS}>
              <Table className={DOC_TABLE_FIRST_COLUMN_CLASS}>
                <TableHeader className={DOC_TABLE_HEADER_CLASS}>
                  <TableRow>
                    <TableHead>字段名</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>默认值</TableHead>
                    <TableHead>说明</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {requestFields.map(field => (
                    <TableRow key={field.name}>
                      <TableCell className={DOC_TABLE_CELL_CLASS}>
                        <span className="inline-grid grid-cols-[0.5rem_auto] items-center gap-1">
                          {field.required ? (
                            <span aria-hidden className="text-red-500 select-none">
                              *
                            </span>
                          ) : null}
                          <code className="col-start-2">{formatCellValue(field.name)}</code>
                        </span>
                      </TableCell>
                      <TableCell className={cn(DOC_TABLE_CELL_CLASS, 'font-mono')}>
                        {formatCellValue(field.type)}
                      </TableCell>
                      <TableCell className={DOC_TABLE_CELL_CLASS}>
                        {formatCellValue(field.defaultValue ?? '-')}
                      </TableCell>
                      <TableCell className={DOC_TABLE_CELL_CLASS}>
                        {formatCellValue(field.description)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">{emptyText}</p>
          )}
        </TabsContent>

        <TabsContent value="response" className="space-y-3">
          {response?.description ? (
            <p className="text-muted-foreground text-sm leading-6 whitespace-pre-line">
              {formatDescription(response.description)}
            </p>
          ) : null}

          {responseFields.length > 0 ? (
            <div className={DOC_TABLE_CONTAINER_CLASS}>
              <Table className={DOC_TABLE_FIRST_COLUMN_CLASS}>
                <TableHeader className={DOC_TABLE_HEADER_CLASS}>
                  <TableRow>
                    <TableHead>字段</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>说明</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {responseFields.map(field => (
                    <TableRow key={field.name}>
                      <TableCell className={DOC_TABLE_CELL_CLASS}>
                        <code>{formatCellValue(field.name)}</code>
                      </TableCell>
                      <TableCell className={cn(DOC_TABLE_CELL_CLASS, 'font-mono')}>
                        {formatCellValue(field.type)}
                      </TableCell>
                      <TableCell className={DOC_TABLE_CELL_CLASS}>
                        {formatCellValue(field.description)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">{emptyText}</p>
          )}
        </TabsContent>
      </TabsContents>
    </Tabs>
  )
}
