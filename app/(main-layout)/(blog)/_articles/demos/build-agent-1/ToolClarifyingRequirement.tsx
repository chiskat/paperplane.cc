import type { UIMessage } from 'ai'
import { CheckIcon, MessageCircleQuestionIcon, SendIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ClarifyingRequirementOption {
  label: string
  description?: string
}

interface ClarifyingRequirementInput {
  question: string
  options: ClarifyingRequirementOption[]
  allowCustomText?: boolean
  customTextPlaceholder?: string
}

export interface ClarifyingRequirementOutput {
  answer: string
  source: 'custom' | 'option'
  description?: string
}

export type ClientToolUseMessage = UIMessage<
  unknown,
  never,
  {
    clarifyingRequirement: {
      input: ClarifyingRequirementInput
      output: ClarifyingRequirementOutput
    }
  }
>

export interface ToolClarifyingRequirementProps {
  part: Extract<ClientToolUseMessage['parts'][number], { type: 'tool-clarifyingRequirement' }>
  customText: string
  onCustomTextChange: (toolCallId: string, value: string) => void
  onSubmit: (toolCallId: string, output: ClarifyingRequirementOutput) => void
}

export function ToolClarifyingRequirement({
  part,
  customText,
  onCustomTextChange,
  onSubmit,
}: ToolClarifyingRequirementProps) {
  const isWaitingForUser = part.state === 'input-available'
  const customTextValue = customText.trim()

  return (
    <div className="not-prose space-y-3 text-sm">
      {part.state === 'input-streaming' && (
        <div className="text-muted-foreground flex items-center gap-2">
          <MessageCircleQuestionIcon className="size-4" />
          正在整理需要确认的问题...
        </div>
      )}

      {isWaitingForUser && (
        <>
          <div className="space-y-1.5 px-1">
            <div className="font-medium">{part.input.question}</div>
            <div className="text-muted-foreground text-xs">请选择一个最接近的方向。</div>
          </div>

          <div className="grid grid-cols-2 gap-2 px-1">
            {part.input.options.map(option => (
              <Button
                className="h-auto min-h-12 justify-start px-3 py-2 text-left whitespace-normal"
                key={option.label}
                onClick={() =>
                  onSubmit(part.toolCallId, {
                    answer: option.label,
                    description: option.description,
                    source: 'option',
                  })
                }
                type="button"
                variant="outline"
              >
                <span className="flex min-w-0 flex-col items-start gap-0.5">
                  <span className="text-foreground text-sm">{option.label}</span>
                  {option.description && (
                    <span className="text-muted-foreground text-xs leading-snug">
                      {option.description}
                    </span>
                  )}
                </span>
              </Button>
            ))}
          </div>

          {part.input.allowCustomText !== false && (
            <div className="space-y-2 px-1">
              <Textarea
                className="min-h-20 resize-y"
                onChange={event => onCustomTextChange(part.toolCallId, event.currentTarget.value)}
                placeholder={part.input.customTextPlaceholder ?? '也可以补充你的具体想法...'}
                value={customText}
              />

              <Button
                disabled={!customTextValue}
                onClick={() =>
                  onSubmit(part.toolCallId, { answer: customTextValue, source: 'custom' })
                }
                type="button"
              >
                <SendIcon className="size-3.5" />
                提交补充
              </Button>
            </div>
          )}
        </>
      )}

      {part.state === 'output-available' && (
        <div className="bg-muted/50 flex gap-2 rounded-md px-3 py-2">
          <CheckIcon className="mt-0.5 size-4 shrink-0 text-green-600" />
          <div className="min-w-0 space-y-1">
            <div className="text-muted-foreground text-xs leading-snug wrap-break-word">
              {part.input.question}
            </div>
            <div className="leading-snug font-medium wrap-break-word">{part.output.answer}</div>
          </div>
        </div>
      )}

      {part.state === 'output-error' && (
        <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2">
          {part.errorText}
        </div>
      )}
    </div>
  )
}
