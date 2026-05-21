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

export interface SegmentOption<TValue extends string = string> {
  value: TValue
  label: React.ReactNode
  itemProps?: Omit<React.ComponentProps<typeof SegmentGroupItem>, 'value' | 'children'>
  itemTextProps?: React.ComponentProps<typeof SegmentGroupItemText>
}

type SegmentGroupFieldSize = 'sm' | 'md'

const segmentGroupSizeClassNames: Record<
  SegmentGroupFieldSize,
  { item: string; itemText: string }
> = {
  sm: {
    item: 'rounded-md px-2.5 py-1',
    itemText: 'text-xs font-medium',
  },
  md: {
    item: 'rounded-lg px-3 py-1.5',
    itemText: 'text-sm font-medium',
  },
}

export interface SegmentGroupFieldProps<
  TValue extends string = string,
  TFieldValue extends TValue | null | undefined = TValue | null | undefined,
> extends Omit<
  React.ComponentProps<typeof SegmentGroup>,
  'value' | 'onValueChange' | 'onBlur' | 'children'
> {
  field: TanstackFieldLike<TFieldValue>
  label: React.ReactNode
  options: Array<SegmentOption<TValue>>
  defaultValue?: TValue
  onValueChange?: (value: TValue) => void
  required?: boolean
  size?: SegmentGroupFieldSize
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

export function SegmentGroupField<
  TValue extends string = string,
  TFieldValue extends TValue | null | undefined = TValue | null | undefined,
>(props: SegmentGroupFieldProps<TValue, TFieldValue>) {
  const {
    field,
    label,
    options,
    defaultValue,
    onValueChange,
    required = false,
    size = 'md',
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
  const invalid = field.state.meta.isValid === false
  const value = field.state.value ?? defaultValue ?? ''
  const sizeClassNames = segmentGroupSizeClassNames[size]

  return (
    <FieldSet className={fieldClassName} invalid={invalid}>
      <FieldLegend variant="label" className={labelClassName}>
        {label}
        {required ? <FieldRequiredIndicator className="ml-1" /> : null}
      </FieldLegend>

      <SegmentGroup
        {...segmentGroupProps}
        value={value}
        onValueChange={details => {
          const nextValue = (details.value || defaultValue || undefined) as TValue | undefined
          field.handleChange(() => nextValue as TFieldValue)

          if (nextValue !== undefined) {
            onValueChange?.(nextValue)
          }
        }}
        onBlur={field.handleBlur ?? undefined}
        className={cn(
          'has-data-invalid:border-destructive w-full rounded-xl bg-zinc-200 p-1',
          segmentGroupProps.className,
          groupClassName
        )}
        invalid={invalid}
      >
        {showIndicator ? (
          <SegmentGroupIndicator className={cn('bg-background rounded-lg', indicatorClassName)} />
        ) : null}
        {options.map(option => (
          <SegmentGroupItem
            key={option.value}
            value={option.value}
            {...option.itemProps}
            className={cn(
              'text-muted-foreground data-[state=checked]:text-foreground flex flex-1 items-center justify-center transition-colors',
              sizeClassNames.item,
              itemClassName,
              option.itemProps?.className
            )}
          >
            <SegmentGroupItemText
              {...option.itemTextProps}
              className={cn(
                sizeClassNames.itemText,
                itemTextClassName,
                option.itemTextProps?.className
              )}
            >
              {option.label}
            </SegmentGroupItemText>
          </SegmentGroupItem>
        ))}
      </SegmentGroup>

      {description ? (
        <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
      ) : null}

      {invalid && errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </FieldSet>
  )
}
