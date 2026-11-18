'use client'

import { IconChevronRight, IconDeviceFloppy, IconPlus, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'

import {
  agentSkillReferenceZod,
  agentSkillZod,
  defaultSkills,
  emptySkill,
  emptySkillReference,
  type AgentSkills,
  type AgentSkillsReference,
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

export function AgentSkill({ value, onChange, className }: SimpleSkillProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [draftSkill, setDraftSkill] = useState<AgentSkills>({ ...emptySkill, references: [] })
  const [referenceDialogOpen, setReferenceDialogOpen] = useState(false)
  const [editingReferenceIndex, setEditingReferenceIndex] = useState<number | null>(null)
  const [draftReference, setDraftReference] = useState<AgentSkillsReference>({
    ...emptySkillReference,
  })
  const dialogTitle = editingIndex === null ? '新增 Skill' : '编辑 Skill'
  const referenceDialogTitle = editingReferenceIndex === null ? '新增 Reference' : '编辑 Reference'

  const openCreateDialog = () => {
    setEditingIndex(null)
    setDraftSkill({ ...emptySkill, references: [] })
    setReferenceDialogOpen(false)
    setDialogOpen(true)
  }

  const openEditDialog = (index: number) => {
    setEditingIndex(index)
    setDraftSkill({
      ...value[index],
      references: value[index].references?.map(reference => ({ ...reference })) ?? [],
    })
    setReferenceDialogOpen(false)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setReferenceDialogOpen(false)
    setDialogOpen(false)
  }

  const openCreateReferenceDialog = () => {
    setEditingReferenceIndex(null)
    setDraftReference({ ...emptySkillReference })
    setReferenceDialogOpen(true)
  }

  const openEditReferenceDialog = (index: number) => {
    const references = draftSkill.references ?? []
    const reference = references[index]
    if (!reference) return

    setEditingReferenceIndex(index)
    setDraftReference({ ...reference })
    setReferenceDialogOpen(true)
  }

  const closeReferenceDialog = () => {
    setReferenceDialogOpen(false)
  }

  const updateDraftSkill = (key: keyof AgentSkills, value: string) => {
    setDraftSkill(current => ({ ...current, [key]: value }))
  }

  const updateDraftReference = (key: keyof AgentSkillsReference, value: string) => {
    setDraftReference(current => ({ ...current, [key]: value }))
  }

  const saveReference = () => {
    const result = agentSkillReferenceZod.safeParse({
      path: draftReference.path.trim(),
      content: draftReference.content.trim(),
    })

    if (!result.success) {
      return
    }

    const nextReference = result.data

    setDraftSkill(current => {
      const references = current.references ?? []

      return {
        ...current,
        references:
          editingReferenceIndex === null
            ? [...references, nextReference]
            : references.map((reference, index) =>
                index === editingReferenceIndex ? nextReference : reference
              ),
      }
    })

    closeReferenceDialog()
  }

  const deleteReference = () => {
    if (editingReferenceIndex === null) return

    setDraftSkill(current => ({
      ...current,
      references: (current.references ?? []).filter((_, index) => index !== editingReferenceIndex),
    }))
    closeReferenceDialog()
  }

  const saveSkill = () => {
    const result = agentSkillZod.safeParse({
      name: draftSkill.name.trim(),
      description: draftSkill.description.trim(),
      content: draftSkill.content.trim(),
      references: draftSkill.references ?? [],
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
        onCreateReference={openCreateReferenceDialog}
        onEditReference={openEditReferenceDialog}
        onDelete={deleteSkill}
        onSave={saveSkill}
      />

      <ReferenceDialog
        open={referenceDialogOpen}
        title={referenceDialogTitle}
        reference={draftReference}
        canDelete={editingReferenceIndex !== null}
        onOpenChange={setReferenceDialogOpen}
        onChange={updateDraftReference}
        onDelete={deleteReference}
        onSave={saveReference}
      />
    </Dialog>
  )
}

interface SkillDialogProps {
  title: string
  skill: AgentSkills
  canDelete: boolean
  onChange: (key: keyof AgentSkills, value: string) => void
  onCreateReference: () => void
  onEditReference: (index: number) => void
  onDelete: () => void
  onSave: () => void
}

function SkillDialog({
  title,
  skill,
  canDelete,
  onChange,
  onCreateReference,
  onEditReference,
  onDelete,
  onSave,
}: SkillDialogProps) {
  const references = skill.references ?? []

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

          <Field>
            <div className="mb-3 flex items-center justify-between gap-3">
              <FieldLabel>References</FieldLabel>

              <Button size="sm" type="button" onClick={onCreateReference}>
                <IconPlus data-icon="inline-start" />
                添加 reference
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {references.length === 0 ? (
                <div className="text-muted-foreground rounded-lg border border-dashed px-3 py-6 text-center text-sm">
                  暂无 References
                </div>
              ) : (
                references.map((reference, index) => (
                  <button
                    key={`${reference.path}-${index}`}
                    type="button"
                    className="hover:bg-accent/60 focus-visible:ring-ring/32 flex min-w-0 cursor-pointer items-center gap-3 rounded-lg border bg-transparent px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-[3px]"
                    onClick={() => onEditReference(index)}
                  >
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <div className="truncate text-sm leading-tight font-medium">
                        {reference.path}
                      </div>
                    </div>

                    <IconChevronRight className="text-muted-foreground shrink-0" size={18} />
                  </button>
                ))
              )}
            </div>
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

interface ReferenceDialogProps {
  open: boolean
  title: string
  reference: AgentSkillsReference
  canDelete: boolean
  onOpenChange: (open: boolean) => void
  onChange: (key: keyof AgentSkillsReference, value: string) => void
  onDelete: () => void
  onSave: () => void
}

function ReferenceDialog({
  open,
  title,
  reference,
  canDelete,
  onOpenChange,
  onChange,
  onDelete,
  onSave,
}: ReferenceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={({ open }) => onOpenChange(open)}>
      <DialogContent className="max-w-[min(92vw,680px)] sm:max-w-[min(92vw,680px)]">
        <DialogHeader title={title} />

        <DialogBody>
          <FieldGroup>
            <Field required>
              <FieldLabel>路径</FieldLabel>
              <Input
                value={reference.path}
                placeholder="references/frontend-guide.md"
                onChange={event => onChange('path', event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>内容</FieldLabel>
              <Textarea
                value={reference.content}
                placeholder="输入这份 Reference 的内容"
                className="min-h-56 resize-y"
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

          <Button
            size="lg"
            disabled={!agentSkillReferenceZod.safeParse(reference).success}
            onClick={onSave}
          >
            <IconDeviceFloppy data-icon="inline-start" />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AgentSkillList() {
  const [skills, setSkills] = useState(defaultSkills)

  return <AgentSkill value={skills} onChange={setSkills} />
}
