'use client'

import type { ListCollection } from '@ark-ui/react/collection'
import type React from 'react'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRequiredIndicator,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatFieldErrors, type TanstackFieldLike } from './utils'

export type SelectCollectionItem = {
  value: string
  label: string
}

interface SelectFieldCommonProps extends Omit<
  React.ComponentProps<typeof Select<SelectCollectionItem>>,
  'value' | 'onValueChange' | 'collection' | 'multiple'
> {
  label: React.ReactNode
  collection: ListCollection<SelectCollectionItem>
  required?: boolean
  fieldClassName?: string
  labelClassName?: string
  description?: React.ReactNode
  descriptionClassName?: string
  placeholder?: string
  triggerProps?: Omit<React.ComponentProps<typeof SelectTrigger>, 'onBlur' | 'children'>
}

interface SelectFieldSingleProps extends SelectFieldCommonProps {
  field: TanstackFieldLike<string | null | undefined>
  multiple?: false
}

interface SelectFieldMultipleProps extends SelectFieldCommonProps {
  field: TanstackFieldLike<string[] | null | undefined>
  multiple: true
}

export type SelectFieldProps = SelectFieldSingleProps | SelectFieldMultipleProps

export function SelectField(props: SelectFieldProps) {
  const {
    field,
    label,
    collection,
    required = false,
    fieldClassName,
    labelClassName,
    description,
    descriptionClassName,
    placeholder,
    triggerProps,
    multiple = false,
    ...selectProps
  } = props

  const errorMessage = formatFieldErrors(field.state.meta.errors)
  const selectValue = multiple
    ? ((field.state.value ?? []) as string[])
    : field.state.value
      ? [field.state.value as string]
      : []

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

      <Select
        {...selectProps}
        multiple={multiple}
        collection={collection}
        value={selectValue}
        onValueChange={details => {
          if (multiple) {
            ;(field as TanstackFieldLike<string[] | null | undefined>).handleChange(
              () => details.value
            )
            return
          }

          const value = details.value[0]
          ;(field as TanstackFieldLike<string | null | undefined>).handleChange(
            () => value || undefined
          )
        }}
      >
        <SelectTrigger className="w-full" {...triggerProps} onBlur={field.handleBlur ?? undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            {collection.items.map(item => (
              <SelectItem key={item.value} item={item}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {description ? (
        <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
      ) : null}

      {!field.state.meta.isValid && errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </Field>
  )
}
