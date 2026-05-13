'use client'

import { TagsInput } from '@ark-ui/react/tags-input'
import { XIcon } from 'lucide-react'
import { useState } from 'react'

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'

const MAINLAND_MOBILE_REGEX = /^1[3-9]\d{9}$/

function normalizeMobile(rawValue: string) {
  const value = rawValue.trim().replace(/[\s-]+/g, '')

  if (value.startsWith('+86')) {
    return value.slice(3)
  }

  if (value.startsWith('86') && value.length === 13) {
    return value.slice(2)
  }

  return value
}

function buildValidMobileList(value: string[]) {
  const seen = new Set<string>()
  const validList: string[] = []
  const invalidList: string[] = []

  value.forEach(item => {
    const mobile = normalizeMobile(item)

    if (!mobile) {
      return
    }

    if (!MAINLAND_MOBILE_REGEX.test(mobile)) {
      invalidList.push(item)
      return
    }

    if (!seen.has(mobile)) {
      seen.add(mobile)
      validList.push(mobile)
    }
  })

  return { validList, invalidList }
}

export function SendMessageFieldAtList({
  value,
  onChange,
  onBlur,
  disabled,
  invalid,
  errorMessage,
}: {
  value: string[]
  onChange: (value: string[]) => void
  onBlur?: () => void
  disabled?: boolean
  invalid?: boolean
  errorMessage?: string
}) {
  const [mobileFormatError, setMobileFormatError] = useState<string | null>(null)

  const fieldErrorMessage = mobileFormatError ?? (invalid ? errorMessage : undefined)

  return (
    <Field invalid={invalid || Boolean(mobileFormatError)}>
      <FieldLabel>@用户列表</FieldLabel>

      <TagsInput.Root
        value={value}
        addOnPaste
        blurBehavior="add"
        disabled={disabled}
        delimiter={/[,，;\s]+/}
        onValueChange={details => {
          const { validList, invalidList } = buildValidMobileList(details.value)
          onChange(validList)

          if (invalidList.length > 0) {
            setMobileFormatError('仅支持中国大陆 11 位手机号，例如 13800138000')
            return
          }

          setMobileFormatError(null)
        }}
      >
        <TagsInput.Control className="border-input focus-within:border-primary focus-within:ring-ring/32 flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-lg border px-2 py-1 shadow-xs/5 transition-[color,box-shadow] focus-within:ring-[3px]">
          {value.map((item, index) => (
            <TagsInput.Item
              key={`${item}-${index}`}
              value={item}
              index={index}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
            >
              <TagsInput.ItemPreview>
                <TagsInput.ItemText>{item}</TagsInput.ItemText>
              </TagsInput.ItemPreview>
              <TagsInput.ItemDeleteTrigger className="cursor-pointer text-slate-400 hover:text-slate-700">
                <XIcon className="size-3" />
              </TagsInput.ItemDeleteTrigger>
              <TagsInput.ItemInput />
            </TagsInput.Item>
          ))}

          <TagsInput.Input
            onBlur={onBlur}
            className="text-foreground placeholder:text-muted-foreground/64 min-w-40 flex-1 border-0 bg-transparent px-1 py-0.5 text-sm outline-none"
            placeholder="输入手机号后回车，支持多个"
          />
        </TagsInput.Control>

        <TagsInput.HiddenInput />
      </TagsInput.Root>

      <FieldDescription>仅输入手机号，不需要带 “@”</FieldDescription>

      {fieldErrorMessage ? <FieldError>{fieldErrorMessage}</FieldError> : null}
    </Field>
  )
}
