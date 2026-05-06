'use client'

import type React from 'react'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRequiredIndicator,
} from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { formatFieldErrors, type TanstackFieldLike } from './utils'

export interface TextareaFieldProps extends Omit<
  React.ComponentProps<typeof Textarea>,
  'value' | 'onChange' | 'onBlur'
> {
  field: TanstackFieldLike<string | null | undefined>
  label: React.ReactNode
  required?: boolean
  fieldClassName?: string
  labelClassName?: string
  description?: React.ReactNode
  descriptionClassName?: string
  placeholder?: string
}

export function TextareaField(props: TextareaFieldProps) {
  const {
    field,
    label,
    required = false,
    fieldClassName,
    labelClassName,
    description,
    descriptionClassName,
    placeholder,
    ...textareaProps
  } = props

  const errorMessage = formatFieldErrors(field.state.meta.errors)

  return (
    <Field
      className={fieldClassName}
      required={required}
      invalid={field.state.meta.isValid === false}
    >
      <FieldLabel className={labelClassName}>
        {label}
        {required ? <FieldRequiredIndicator /> : null}
      </FieldLabel>

      <Textarea
        {...textareaProps}
        value={field.state.value ?? ''}
        onChange={event => field.handleChange(() => event.target.value)}
        onBlur={field.handleBlur ?? undefined}
        placeholder={placeholder}
      />

      {description ? (
        <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
      ) : null}

      {!field.state.meta.isValid && errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </Field>
  )
}
