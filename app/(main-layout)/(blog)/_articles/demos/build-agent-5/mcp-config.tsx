'use client'

import { createListCollection } from '@ark-ui/react/select'
import { IconDeviceFloppy, IconLink, IconPlus, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type McpTransportType = 'http' | 'sse'

export interface McpServerConfig {
  name: string
  url: string
  transportType: McpTransportType
}

const mcpTransportTypeLabelMap: Record<McpTransportType, string> = {
  http: '流式 HTTP',
  sse: 'SSE',
}

const mcpTransportTypeCollection = createListCollection({
  items: Object.entries(mcpTransportTypeLabelMap).map(([value, label]) => ({
    label,
    value: value as McpTransportType,
  })),
  itemToString: item => item.label,
  itemToValue: item => item.value,
})

export const emptyMcpServerConfig: McpServerConfig = { name: '', url: '', transportType: 'http' }

const isValidMcpServerConfig = (config: McpServerConfig) =>
  config.name.trim() !== '' && config.url.trim() !== ''

export interface SimpleMcpProps {
  value: McpServerConfig[]
  onChange: (value: McpServerConfig[]) => void
  className?: string
}

export function McpConfig({ value, onChange, className }: SimpleMcpProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [draftConfig, setDraftConfig] = useState<McpServerConfig>({ ...emptyMcpServerConfig })
  const dialogTitle = editingIndex === null ? '新增 MCP 服务器' : '编辑 MCP 服务器'

  const openCreateDialog = () => {
    setEditingIndex(null)
    setDraftConfig({ ...emptyMcpServerConfig })
    setDialogOpen(true)
  }

  const openEditDialog = (index: number) => {
    setEditingIndex(index)
    setDraftConfig({ ...value[index] })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
  }

  const updateDraftConfig = (key: keyof McpServerConfig, value: string | McpTransportType) => {
    setDraftConfig(current => ({ ...current, [key]: value }))
  }

  const saveConfig = () => {
    const nextConfig = {
      name: draftConfig.name.trim(),
      url: draftConfig.url.trim(),
      transportType: draftConfig.transportType,
    }

    if (!isValidMcpServerConfig(nextConfig)) {
      return
    }

    if (editingIndex === null) {
      onChange([...value, nextConfig])
    } else {
      onChange(value.map((config, index) => (index === editingIndex ? nextConfig : config)))
    }

    closeDialog()
  }

  const deleteConfig = () => {
    if (editingIndex === null) return

    onChange(value.filter((_, index) => index !== editingIndex))
    closeDialog()
  }

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={({ open }) => {
        if (open) setDialogOpen(true)
        else closeDialog()
      }}
    >
      <div className={className}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="font-heading text-base font-medium">
              已配置 {value.length} 个 MCP 服务器
            </span>
          </div>

          <Button size="sm" onClick={openCreateDialog}>
            <IconPlus data-icon="inline-start" />
            新增 MCP 服务器
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {value.length === 0 ? (
            <div className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm">
              暂无 MCP 服务器
            </div>
          ) : (
            value.map((config, index) => (
              <button
                key={`${config.name}-${index}`}
                type="button"
                className="hover:bg-accent/60 focus-visible:ring-ring/32 flex min-w-0 cursor-pointer items-center gap-3 rounded-lg border bg-transparent p-3 text-left transition-colors outline-none focus-visible:ring-[3px]"
                onClick={() => openEditDialog(index)}
              >
                <IconLink className="text-muted-foreground shrink-0" size={18} />

                <div className="flex min-w-0 flex-1 items-baseline gap-2">
                  <div className="shrink-0 text-base font-medium whitespace-nowrap">
                    {config.name}
                  </div>
                  <span className="text-muted-foreground shrink-0" aria-hidden="true">
                    ·
                  </span>
                  <div className="text-muted-foreground shrink-0 text-xs uppercase">
                    {mcpTransportTypeLabelMap[config.transportType]}
                  </div>
                  <span className="text-muted-foreground shrink-0" aria-hidden="true">
                    ·
                  </span>
                  <div className="text-muted-foreground min-w-0 flex-1 truncate text-sm">
                    {config.url}
                  </div>
                </div>

                <div className="shrink-0 text-sm">点击以编辑</div>
              </button>
            ))
          )}
        </div>
      </div>

      <SimpleMcpDialog
        title={dialogTitle}
        config={draftConfig}
        canDelete={editingIndex !== null}
        onChange={updateDraftConfig}
        onDelete={deleteConfig}
        onSave={saveConfig}
      />
    </Dialog>
  )
}

interface SimpleMcpDialogProps {
  title: string
  config: McpServerConfig
  canDelete: boolean
  onChange: (key: keyof McpServerConfig, value: string | McpTransportType) => void
  onDelete: () => void
  onSave: () => void
}

function SimpleMcpDialog({
  title,
  config,
  canDelete,
  onChange,
  onDelete,
  onSave,
}: SimpleMcpDialogProps) {
  return (
    <DialogContent className="max-w-[min(92vw,640px)] sm:max-w-[min(92vw,640px)]">
      <DialogHeader title={title} />

      <DialogBody>
        <FieldGroup>
          <Field required>
            <FieldLabel>名称</FieldLabel>
            <Input
              value={config.name}
              placeholder="mcp-"
              onChange={event => onChange('name', event.target.value)}
            />
          </Field>

          <Field required>
            <FieldLabel>URL</FieldLabel>
            <Input
              value={config.url}
              placeholder="https://example.com"
              onChange={event => onChange('url', event.target.value)}
            />
          </Field>

          <Field required>
            <FieldLabel>传输方式</FieldLabel>
            <Select
              collection={mcpTransportTypeCollection}
              value={[config.transportType]}
              onValueChange={details => {
                const nextValue = details.value[0] as McpTransportType | undefined
                onChange('transportType', nextValue ?? 'http')
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="请选择传输方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {mcpTransportTypeCollection.items.map(item => (
                    <SelectItem key={item.value} item={item}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </DialogBody>

      <DialogFooter>
        {canDelete ? (
          <Button className="mr-auto" variant="destructive" size="lg" onClick={onDelete}>
            <IconTrash data-icon="inline-start" />
            删除
          </Button>
        ) : null}

        <DialogClose asChild>
          <Button variant="outline" size="lg">
            取消
          </Button>
        </DialogClose>

        <Button size="lg" disabled={!isValidMcpServerConfig(config)} onClick={onSave}>
          <IconDeviceFloppy data-icon="inline-start" />
          保存
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
