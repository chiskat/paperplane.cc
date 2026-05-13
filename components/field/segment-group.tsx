'use client'

import type React from 'react'

import {
  FieldDescription,
  FieldError,
  FieldLegend,
  FieldRequiredIndicator,
  FieldSet,
} from '@/components/ui/field'
import {
  SegmentGroup,
  SegmentGroupIndicator,
  SegmentGroupItem,
  SegmentGroupItemText,
} from '@/components/ui/segment-group'
import { cn } from '@/utils/style'
import { formatFieldErrors, type TanstackFieldLike } from './utils'

export interface SegmentOption {
  value: string
  label: React.ReactNode
  itemProps?: Omit<React.ComponentProps<typeof SegmentGroupItem>, 'value' | 'children'>
  itemTextProps?: React.ComponentProps<typeof SegmentGroupItemText>
}

export interface SegmentGroupFieldProps extends Omit<
  React.ComponentProps<typeof SegmentGroup>,
  'value' | 'onValueChange' | 'onBlur' | 'children'
> {
  field: TanstackFieldLike<string | null | undefined>
  label: React.ReactNode
  options: SegmentOption[]
  required?: boolean
  fieldClassName?: string
  labelClassName?: string
  groupClassName?: string
  itemClassName?: string
  itemTextClassName?: string
  indicatorClassName?: string
  description?: React.ReactNode
  descriptionClassName?: string
  showIndicator?: boolean
}

export function SegmentGroupField(props: SegmentGroupFieldProps) {
  const {
    field,
    label,
    options,
    required = false,
    fieldClassName,
    labelClassName,
    groupClassName,
    itemClassName,
    itemTextClassName,
    indicatorClassName,
    description,
    descriptionClassName,
    showIndicator = true,
    ...segmentGroupProps
  } = props

  const errorMessage = formatFieldErrors(field.state.meta.errors)

  return (
    <FieldSet className={fieldClassName} invalid={field.state.meta.isValid === false}>
      <FieldLegend variant="label" className={labelClassName}>
        {label}
        {required ? <FieldRequiredIndicator className="ml-1" /> : null}
      </FieldLegend>

      <SegmentGroup
        {...segmentGroupProps}
        value={field.state.value ?? ''}
        onValueChange={details => field.handleChange(() => details.value || undefined)}
        onBlur={field.handleBlur ?? undefined}
        className={cn(segmentGroupProps.className, groupClassName)}
        invalid={field.state.meta.isValid === false}
      >
        {showIndicator ? <SegmentGroupIndicator className={indicatorClassName} /> : null}
        {options.map(option => (
          <SegmentGroupItem
            key={option.value}
            value={option.value}
            {...option.itemProps}
            className={cn(itemClassName, option.itemProps?.className)}
          >
            <SegmentGroupItemText
              {...option.itemTextProps}
              className={cn(itemTextClassName, option.itemTextProps?.className)}
            >
              {option.label}
            </SegmentGroupItemText>
          </SegmentGroupItem>
        ))}
      </SegmentGroup>

      {description ? (
        <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
      ) : null}

      {!field.state.meta.isValid && errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </FieldSet>
  )
}
