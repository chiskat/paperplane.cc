'use client'

import React from 'react'

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerContent,
  ColorPickerControl,
  ColorPickerInput,
  ColorPickerSlider,
  ColorPickerSwatch,
  ColorPickerSwatchGroup,
  ColorPickerSwatchPreview,
  ColorPickerSwatchTrigger,
  ColorPickerTrigger,
  type ColorPickerProps,
} from '@/components/ui/color-picker'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRequiredIndicator,
} from '@/components/ui/field'
import { formatFieldErrors, type TanstackFieldLike } from './utils'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'

export interface ColorPickerFieldProps extends Omit<
  ColorPickerProps,
  'value' | 'defaultValue' | 'onValueChange' | 'children'
> {
  field: TanstackFieldLike<string | null | undefined>
  label: React.ReactNode
  required?: boolean
  fieldClassName?: string
  labelClassName?: string
  description?: React.ReactNode
  descriptionClassName?: string
  swatches?: string[]
}

export function ColorPickerField(props: ColorPickerFieldProps) {
  const {
    field,
    label,
    required = false,
    fieldClassName,
    labelClassName,
    description,
    descriptionClassName,
    swatches,
    ...colorPickerProps
  } = props

  const errorMessage = formatFieldErrors(field.state.meta.errors)
  const hasValue = field.state.value != null && field.state.value !== ''

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

      <ColorPicker
        {...colorPickerProps}
        value={hasValue ? field.state.value! : undefined}
        onValueChange={details => field.handleChange(() => details.value.toString('hex'))}
      >
        <ColorPickerControl>
          <InputGroup>
            <ColorPickerTrigger onBlur={field.handleBlur ?? undefined}>
              <InputGroupAddon align="inline-start">
                <ColorPickerSwatchPreview />
              </InputGroupAddon>
            </ColorPickerTrigger>
            <ColorPickerInput asChild>
              <InputGroupInput />
            </ColorPickerInput>
          </InputGroup>
        </ColorPickerControl>

        <ColorPickerContent>
          <ColorPickerArea>
            <ColorPickerAreaThumb />
          </ColorPickerArea>

          <ColorPickerSlider channel="hue" />

          {swatches ? (
            <ColorPickerSwatchGroup>
              {swatches.map(color => (
                <ColorPickerSwatchTrigger className="size-4" key={color} value={color}>
                  <ColorPickerSwatch value={color} />
                </ColorPickerSwatchTrigger>
              ))}
            </ColorPickerSwatchGroup>
          ) : null}
        </ColorPickerContent>
      </ColorPicker>

      {description ? (
        <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
      ) : null}

      {!field.state.meta.isValid && errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </Field>
  )
}
