'use client'

import { IconDeviceFloppy, IconPlus, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'

import {
  agentSkillZod,
  defaultSimpleSkills,
  emptySkill,
  type AgentSkills,
} from '@/app/api/agent/demo/build-agent-3/skills-meeting'
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
import { Textarea } from '@/components/ui/textarea'

export interface SimpleSkillProps {
  value: AgentSkills[]
  onChange: (value: AgentSkills[]) => void
  className?: string
}

export function SimpleSkill({ value, onChange, className }: SimpleSkillProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [draftSkill, setDraftSkill] = useState<AgentSkills>({ ...emptySkill })
  const dialogTitle = editingIndex === null ? '新增 Skill' : '编辑 Skill'

  const openCreateDialog = () => {
    setEditingIndex(null)
    setDraftSkill({ ...emptySkill })
    setDialogOpen(true)
  }

  const openEditDialog = (index: number) => {
    setEditingIndex(index)
    setDraftSkill({ ...value[index] })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
  }

  const updateDraftSkill = (key: keyof AgentSkills, value: string) => {
    setDraftSkill(current => ({ ...current, [key]: value }))
  }

  const saveSkill = () => {
    const result = agentSkillZod.safeParse({
      name: draftSkill.name.trim(),
      description: draftSkill.description.trim(),
      content: draftSkill.content.trim(),
    })

    if (!result.success) {
      return
    }

    const nextSkill = result.data

    if (editingIndex === null) {
      onChange([...value, nextSkill])
    } else {
      onChange(value.map((skill, index) => (index === editingIndex ? nextSkill : skill)))
    }

    closeDialog()
  }

  const deleteSkill = () => {
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
              已加载 {value.length} 个 Skill
            </span>
          </div>

          <Button size="sm" onClick={openCreateDialog}>
            <IconPlus data-icon="inline-start" />
            新增 Skill
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {value.length === 0 ? (
            <div className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm">
              暂无 Skills
            </div>
          ) : (
            value.map((skill, index) => (
              <button
                key={`${skill.name}-${index}`}
                type="button"
                className="hover:bg-accent/60 focus-visible:ring-ring/32 flex min-w-0 cursor-pointer items-center gap-3 rounded-lg border bg-transparent p-3 text-left transition-colors outline-none focus-visible:ring-[3px]"
                onClick={() => openEditDialog(index)}
              >
                <div className="flex min-w-0 flex-1 items-baseline gap-2">
                  <div className="shrink-0 text-base font-medium whitespace-nowrap">
                    {skill.name}
                  </div>
                  <div className="text-muted-foreground min-w-0 flex-1 truncate text-sm">
                    {skill.description}
                  </div>
                </div>

                <div className="shrink-0 text-sm">点击以编辑</div>
              </button>
            ))
          )}
        </div>
      </div>

      <SkillDialog
        title={dialogTitle}
        skill={draftSkill}
        canDelete={editingIndex !== null}
        onChange={updateDraftSkill}
        onDelete={deleteSkill}
        onSave={saveSkill}
      />
    </Dialog>
  )
}

interface SkillDialogProps {
  title: string
  skill: AgentSkills
  canDelete: boolean
  onChange: (key: keyof AgentSkills, value: string) => void
  onDelete: () => void
  onSave: () => void
}

function SkillDialog({ title, skill, canDelete, onChange, onDelete, onSave }: SkillDialogProps) {
  return (
    <DialogContent className="max-w-[min(92vw,640px)] sm:max-w-[min(92vw,640px)]">
      <DialogHeader title={title} />

      <DialogBody>
        <FieldGroup>
          <Field required>
            <FieldLabel>名称</FieldLabel>
            <Input
              value={skill.name}
              placeholder="frontend-design"
              onChange={event => onChange('name', event.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>描述</FieldLabel>
            <Input
              value={skill.description}
              placeholder="一句话描述这个 Skill 的能力"
              onChange={event => onChange('description', event.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>内容</FieldLabel>
            <Textarea
              value={skill.content}
              placeholder="输入 Skill 的完整 Markdown 内容"
              className="min-h-40 resize-y"
              onChange={event => onChange('content', event.target.value)}
            />
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

        <Button size="lg" disabled={!agentSkillZod.safeParse(skill).success} onClick={onSave}>
          <IconDeviceFloppy data-icon="inline-start" />
          保存
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export function SimpleSkillList() {
  const [skills, setSkills] = useState(defaultSimpleSkills)

  return <SimpleSkill value={skills} onChange={setSkills} />
}
