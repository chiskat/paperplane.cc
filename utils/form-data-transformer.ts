import { TRPCLink } from '@trpc/client'
import { omit } from 'lodash-es'
import { parse, stringify } from 'superjson'

import { AppRouter } from '@/apis/appRouter'

const REST_FIELD_NAME = '__rest'
const FILE_FIELDS_NAME = '__fileFields'

function isContainsFile(input: any): boolean {
  if (typeof input !== 'object' || input === null) {
    return false
  }

  for (const key in input) {
    const value = input[key]
    if (value instanceof File || value instanceof Blob) {
      return true
    }
  }

  return false
}

function serializeFormData(input: any): FormData {
  const formData = new FormData()
  const fileField: string[] = []

  for (const key in input) {
    const value = input[key]
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value)
      fileField.push(key)
    }
  }

  formData.append(REST_FIELD_NAME, stringify(omit(input, fileField)))
  formData.append(FILE_FIELDS_NAME, stringify(fileField))

  return formData
}

function deserializeFormData(formData: FormData): object {
  const output = parse((formData.get(REST_FIELD_NAME) as string) || '{}') as any
  const fileFields: string[] = parse((formData.get(FILE_FIELDS_NAME) as string) || '[]')

  for (const key of fileFields) {
    output[key] = formData.get(key)
  }

  return output
}

export const transformFormDataLink: TRPCLink<AppRouter> = () => {
  return ({ op, next }) => {
    if (isContainsFile(op.input)) {
      return next({ ...op, input: serializeFormData(op.input) })
    }

    return next(op)
  }
}

export const transformerFormDataInput = (input: any) => {
  if (input instanceof FormData) {
    return deserializeFormData(input)
  }

  return input as typeof input
}
