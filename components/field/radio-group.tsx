'use client'

import type React from 'react'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLegend,
  FieldRequiredIndicator,
  FieldSet,
} from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/utils/style'
import { formatFieldErrors, type TanstackFieldLike } from './utils'

export interface RadioOption {
  value: string
  label: React.ReactNode
  itemProps?: Omit<React.ComponentProps<typeof RadioGroupItem>, 'value' | 'children'>
}

export interface RadioGroupFieldProps extends Omit<
  React.ComponentProps<typeof RadioGroup>,
  'value' | 'onValueChange' | 'onBlur' | 'children'
> {
  field: TanstackFieldLike<string | null | undefined>
  label: React.ReactNode
  options: RadioOption[]
  required?: boolean
  fieldClassName?: string
  labelClassName?: string
  groupClassName?: string
  description?: React.ReactNode
  descriptionClassName?: string
}

export function RadioGroupField(props: RadioGroupFieldProps) {
  const {
    field,
    label,
    options,
    required = false,
    fieldClassName,
    labelClassName,
    groupClassName,
    description,
    descriptionClassName,
    ...radioGroupProps
  } = props

  const errorMessage = formatFieldErrors(field.state.meta.errors)

  return (
    <FieldSet className={fieldClassName} invalid={field.state.meta.isValid === false}>
      <FieldLegend variant="label" className={labelClassName}>
        {label}
        {required ? <FieldRequiredIndicator className="ml-1" /> : null}
      </FieldLegend>

      <RadioGroup
        {...radioGroupProps}
        value={field.state.value ?? ''}
        onValueChange={details => field.handleChange(() => details.value)}
        onBlur={field.handleBlur ?? undefined}
        className={cn(radioGroupProps.className, groupClassName)}
      >
        {options.map(option => (
          <Field key={option.value} className="w-fit">
            <RadioGroupItem value={option.value} {...option.itemProps}>
              {option.label}
            </RadioGroupItem>
          </Field>
        ))}
      </RadioGroup>

      {description ? (
        <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
      ) : null}

      {!field.state.meta.isValid && errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </FieldSet>
  )
}
