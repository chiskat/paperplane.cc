import { TRPCLink } from '@trpc/client'
import { set } from 'lodash-es'
import { parse, stringify } from 'superjson'

import { AppRouter } from '@/apis/appRouter'

const REST_FIELD_NAME = '__rest'
const FILE_FIELDS_NAME = '__fileFields'

type FileField = {
  fieldName: string
  path: Array<string | number>
}

function isFileLike(input: any): input is Blob | File {
  if (typeof input !== 'object' || input === null) {
    return false
  }

  if (typeof Blob !== 'undefined' && input instanceof Blob) {
    return true
  }

  if (typeof File !== 'undefined' && input instanceof File) {
    return true
  }

  return false
}

function isRecord(input: any): input is Record<string, unknown> {
  return Object.prototype.toString.call(input) === '[object Object]'
}

function isContainsFile(input: any): boolean {
  if (isFileLike(input)) {
    return true
  }

  if (typeof input !== 'object' || input === null) {
    return false
  }

  if (Array.isArray(input)) {
    for (const value of input) {
      if (isContainsFile(value)) {
        return true
      }
    }

    return false
  }

  if (!isRecord(input)) {
    return false
  }

  for (const value of Object.values(input)) {
    if (isContainsFile(value)) {
      return true
    }
  }

  return false
}

function serializeFormDataValue(
  input: any,
  formData: FormData,
  fileFields: FileField[],
  path: Array<string | number> = []
): any {
  if (isFileLike(input)) {
    const fieldName = `${FILE_FIELDS_NAME}.${fileFields.length}`
    formData.append(fieldName, input)
    fileFields.push({ fieldName, path })
    return null
  }

  if (Array.isArray(input)) {
    return input.map((value, index) =>
      serializeFormDataValue(value, formData, fileFields, [...path, index])
    )
  }

  if (isRecord(input)) {
    const output: Record<string, unknown> = {}

    for (const key of Object.keys(input)) {
      output[key] = serializeFormDataValue(input[key], formData, fileFields, [...path, key])
    }

    return output
  }

  return input
}

function serializeFormData(input: any): FormData {
  const formData = new FormData()
  const fileFields: FileField[] = []
  const rest = serializeFormDataValue(input, formData, fileFields)

  formData.append(REST_FIELD_NAME, stringify(rest))
  formData.append(FILE_FIELDS_NAME, stringify(fileFields))

  return formData
}

function deserializeFormData(formData: FormData): any {
  let output = parse((formData.get(REST_FIELD_NAME) as string) || '{}') as any
  const fileFields: Array<string | FileField> = parse(
    (formData.get(FILE_FIELDS_NAME) as string) || '[]'
  )

  for (const fileField of fileFields) {
    if (typeof fileField === 'string') {
      output[fileField] = formData.get(fileField)
      continue
    }

    if (fileField.path.length === 0) {
      output = formData.get(fileField.fieldName)
      continue
    }

    set(output, fileField.path, formData.get(fileField.fieldName))
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
