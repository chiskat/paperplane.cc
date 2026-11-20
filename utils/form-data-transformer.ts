import { TRPCLink } from '@trpc/client'
import { fromFormData, toFormData } from 'omn'
import { parse, stringify } from 'superjson'

import type { AppRouter } from '@/apis/app-router'

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

export const transformFormDataLink: TRPCLink<AppRouter> = () => {
  return ({ op, next }) => {
    if (isContainsFile(op.input)) {
      return next({ ...op, input: toFormData(op.input as any, { stringify }) })
    }

    return next(op)
  }
}

export const transformerFormDataInput = (input: any) => {
  if (input instanceof FormData) {
    return fromFormData(input as any, { parse })
  }

  return input as typeof input
}
