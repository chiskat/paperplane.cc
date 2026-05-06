'use client'

import type React from 'react'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRequiredIndicator,
} from '@/components/ui/field'
import { Rating } from '@/components/ui/rating'
import { cn } from '@/utils/style'
import { formatFieldErrors, type TanstackFieldLike } from './utils'

export interface RatingFieldProps extends Omit<
  React.ComponentProps<'div'>,
  'value' | 'onChange' | 'onBlur' | 'children'
> {
  field: TanstackFieldLike<number | null | undefined>
  label: React.ReactNode
  required?: boolean
  fieldClassName?: string
  labelClassName?: string
  groupClassName?: string
  description?: React.ReactNode
  descriptionClassName?: string
  clearable?: boolean
  clearedValue?: number | null | undefined
  clearText?: React.ReactNode
  icon?: React.ReactNode
}

export function RatingField(props: RatingFieldProps) {
  const {
    field,
    label,
    required = false,
    fieldClassName,
    labelClassName,
    groupClassName,
    description,
    descriptionClassName,
    clearable = true,
    clearedValue = 0,
    clearText = '清空',
    className,
    icon,
    ...divProps
  } = props

  const errorMessage = formatFieldErrors(field.state.meta.errors)
  const rawValue = field.state.value
  const currentValue = typeof rawValue === 'number' && Number.isFinite(rawValue) ? rawValue : 0

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

      <div className={cn('inline-flex items-center gap-1', groupClassName)} {...divProps}>
        <Rating
          aria-label={typeof label === 'string' ? label : '星级'}
          className={cn('leading-0', className)}
          count={5}
          value={currentValue}
          onValueChange={details => field.handleChange(() => details.value)}
          onBlur={field.handleBlur ?? undefined}
          icon={icon}
        />

        {clearable ? (
          <Button
            variant="ghost"
            size="md"
            className="ml-2 px-2 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            onClick={() => field.handleChange(() => clearedValue)}
            onBlur={field.handleBlur ?? undefined}
          >
            {clearText}
          </Button>
        ) : null}
      </div>

      {description ? (
        <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
      ) : null}

      {!field.state.meta.isValid && errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </Field>
  )
}
