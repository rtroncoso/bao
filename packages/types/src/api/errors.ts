export type ApiErrorCode =
  | 'ALREADY_EXISTS'
  | 'EMAIL_ALREADY_TAKEN'
  | 'EXPIRED_TOKEN'
  | 'FORM_ERROR'
  | 'INVALID_OPERATOR'
  | 'INVALID_VALUE'
  | 'LIMIT_REACHED'
  | 'MISSING_PARAM'
  | 'NO_CHANGES'
  | 'NOT_AUTHORIZED'
  | 'NOT_FOUND'
  | 'REPEATED_RESOURCE'
  | 'UNEXPECTED_ERROR'
  | 'UNREACHED_MINIMUM'
  | 'UNREFERENCED_RESOURCE'
  | 'USER_NOT_FOUND'

export interface ApiErrorDefinition {
  code: number
  message: ApiErrorCode | 'SYSTEM'
  payload?: string
  variables?: Record<string, unknown>
}

export type ApiErrorMap = Record<ApiErrorCode, ApiErrorDefinition>

export interface ApiError extends Error {
  payload?: string
  variables?: Record<string, unknown>
}

export function isApiErrorCode(message: string): message is ApiErrorCode {
  return message !== 'SYSTEM' && message in API_ERROR_CODES
}

/** Canonical list used for runtime checks */
export const API_ERROR_CODES: Record<ApiErrorCode, true> = {
  ALREADY_EXISTS: true,
  EMAIL_ALREADY_TAKEN: true,
  EXPIRED_TOKEN: true,
  FORM_ERROR: true,
  INVALID_OPERATOR: true,
  INVALID_VALUE: true,
  LIMIT_REACHED: true,
  MISSING_PARAM: true,
  NO_CHANGES: true,
  NOT_AUTHORIZED: true,
  NOT_FOUND: true,
  REPEATED_RESOURCE: true,
  UNEXPECTED_ERROR: true,
  UNREACHED_MINIMUM: true,
  UNREFERENCED_RESOURCE: true,
  USER_NOT_FOUND: true,
}

export function createApiError(
  code: ApiErrorCode,
  payload?: string
): ApiError {
  const err = new Error(code) as ApiError
  if (payload !== undefined) {
    err.payload = payload
  }
  return err
}
