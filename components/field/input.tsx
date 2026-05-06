'use client'

import type React from 'react'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRequiredIndicator,
} from '@/components/ui/field'
import { Input, type InputProps } from '@/components/ui/input'
import { formatFieldErrors, type TanstackFieldLike } from './utils'

export interface InputFieldProps<TValue extends string | null | undefined = string> extends Omit<
  InputProps,
  'value' | 'onChange' | 'onBlur'
> {
  field: TanstackFieldLike<TValue>
  label: React.ReactNode
  required?: boolean
  fieldClassName?: string
  labelClassName?: string
  description?: React.ReactNode
  descriptionClassName?: string
  placeholder?: string
}

export function InputField<TValue extends string | null | undefined = string>(
  props: InputFieldProps<TValue>
) {
  const {
    field,
    label,
    required = false,
    fieldClassName,
    labelClassName,
    description,
    descriptionClassName,
    placeholder,
    ...inputProps
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

      <Input
        {...inputProps}
        value={field.state.value ?? ''}
        onChange={event => field.handleChange(() => event.target.value as TValue)}
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
