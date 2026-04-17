'use client'

import { ReactNode } from 'react'

import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from '@/components/animate-ui/components/radix/tabs'
import { KVPairs, KVPairsItem } from '@/components/data/kv-pairs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/utils/style'
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
  authHeaderKey?: string
  authHeaderValue?: ReactNode
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

export function ApiDoc({
  metadata,
  request,
  response,
  className,
  emptyText = DEFAULT_EMPTY_TEXT,
}: ApiDocProps) {
  const requestFields = request?.fields ?? []
  const responseFields = response?.fields ?? []
  const hasAuthHeader = !!(metadata.authHeaderKey || metadata.authHeaderValue)

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

            <KVPairsItem label="鉴权 Header 键" contentClassName="font-mono text-[13px]">
              {metadata.requireAuth ? metadata.authHeaderKey || '-' : '-'}
            </KVPairsItem>

            <KVPairsItem label="鉴权 Header 值" contentClassName="font-mono text-[13px]">
              {metadata.requireAuth ? metadata.authHeaderValue || '-' : '-'}
            </KVPairsItem>
          </KVPairs>

          {!metadata.requireAuth && hasAuthHeader ? (
            <p className="text-muted-foreground text-xs">
              已提供鉴权 Header 信息，但当前标记为无需鉴权。
            </p>
          ) : null}
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
