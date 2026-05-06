'use client'

import type React from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRequiredIndicator,
} from '@/components/ui/field'
import { formatFieldErrors, type TanstackFieldLike } from './utils'

export interface CheckboxFieldProps extends Omit<
  React.ComponentProps<typeof Checkbox>,
  'checked' | 'onCheckedChange' | 'onBlur'
> {
  field: TanstackFieldLike<boolean | null | undefined>
  label: React.ReactNode
  required?: boolean
  fieldClassName?: string
  labelClassName?: string
  contentClassName?: string
  description?: React.ReactNode
  descriptionClassName?: string
}

export function CheckboxField(props: CheckboxFieldProps) {
  const {
    field,
    label,
    required = false,
    fieldClassName,
    labelClassName,
    contentClassName,
    description,
    descriptionClassName,
    ...checkboxProps
  } = props

  const errorMessage = formatFieldErrors(field.state.meta.errors)

  return (
    <Field
      className={fieldClassName}
      orientation="horizontal"
      invalid={field.state.meta.isValid === false}
    >
      <Checkbox
        {...checkboxProps}
        checked={field.state.value === true}
        onCheckedChange={details => field.handleChange(() => details.checked === true)}
        onBlur={field.handleBlur}
      />

      <FieldContent className={contentClassName}>
        <FieldLabel className={labelClassName}>
          {label}
          {required ? <FieldRequiredIndicator /> : null}
        </FieldLabel>

        {description ? (
          <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
        ) : null}

        {!field.state.meta.isValid && errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
      </FieldContent>
    </Field>
  )
}
