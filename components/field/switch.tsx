'use client'

import type React from 'react'

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRequiredIndicator,
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/utils/style'
import { formatFieldErrors, type TanstackFieldLike } from './utils'

export interface SwitchFieldProps extends Omit<
  React.ComponentProps<typeof Switch>,
  'checked' | 'onCheckedChange' | 'onBlur' | 'label'
> {
  field: TanstackFieldLike<boolean | null | undefined>
  label: React.ReactNode
  required?: boolean
  fieldClassName?: string
  labelClassName?: string
  contentClassName?: string
  switchClassName?: string
  description?: React.ReactNode
  descriptionClassName?: string
}

export function SwitchField(props: SwitchFieldProps) {
  const {
    field,
    label,
    required = false,
    fieldClassName,
    labelClassName,
    contentClassName,
    switchClassName,
    description,
    descriptionClassName,
    ...switchProps
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

      <FieldContent className={contentClassName}>
        <Switch
          {...switchProps}
          checked={field.state.value === true}
          onCheckedChange={details => field.handleChange(() => details.checked === true)}
          onBlur={field.handleBlur ?? undefined}
          invalid={field.state.meta.isValid === false}
          className={cn(switchProps.className, switchClassName)}
        />

        {description ? (
          <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
        ) : null}

        {!field.state.meta.isValid && errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
      </FieldContent>
    </Field>
  )
}
