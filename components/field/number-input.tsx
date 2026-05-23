'use client'

import type React from 'react'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRequiredIndicator,
} from '@/components/ui/field'
import {
  NumberInput,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
  NumberInputInput,
} from '@/components/ui/number-input'
import { formatFieldErrors, type TanstackFieldLike } from './utils'

export interface NumberInputFieldProps<
  TValue extends number | null | undefined = number,
> extends Omit<
  React.ComponentProps<typeof NumberInput>,
  'value' | 'onValueChange' | 'onValueCommit' | 'children'
> {
  field: TanstackFieldLike<TValue>
  label: React.ReactNode
  required?: boolean
  fieldClassName?: string
  labelClassName?: string
  description?: React.ReactNode
  descriptionClassName?: string
  placeholder?: string
  inputProps?: Omit<
    React.ComponentProps<typeof NumberInputInput>,
    'value' | 'onChange' | 'onBlur' | 'placeholder'
  >
  groupProps?: Omit<React.ComponentProps<typeof NumberInputGroup>, 'children'>
  showControls?: boolean
}

export function NumberInputField<TValue extends number | null | undefined = number>(
  props: NumberInputFieldProps<TValue>
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
    inputProps,
    groupProps,
    showControls = true,
    ...numberInputProps
  } = props

  const errorMessage = formatFieldErrors(field.state.meta.errors)
  const rawValue = field.state.value
  const value = typeof rawValue === 'number' && Number.isFinite(rawValue) ? String(rawValue) : ''

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

      <NumberInput
        {...numberInputProps}
        value={value}
        onValueChange={details => {
          const nextValue =
            details.value === '' || !Number.isFinite(details.valueAsNumber)
              ? undefined
              : details.valueAsNumber
          field.handleChange(() => nextValue as TValue)
        }}
        onValueCommit={field.handleBlur ? () => field.handleBlur?.() : undefined}
        required={required}
        invalid={field.state.meta.isValid === false}
      >
        <NumberInputGroup {...groupProps}>
          {showControls ? <NumberInputDecrement /> : null}
          <NumberInputInput placeholder={placeholder} {...inputProps} />
          {showControls ? <NumberInputIncrement /> : null}
        </NumberInputGroup>
      </NumberInput>

      {description ? (
        <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
      ) : null}

      {!field.state.meta.isValid && errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </Field>
  )
}
