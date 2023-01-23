module.exports = {
  ALREADY_EXISTS: {
    code: 409,
    message: 'ALREADY_EXISTS',
  },
  EMAIL_ALREADY_TAKEN: {
    code: 409,
    message: 'EMAIL_ALREADY_TAKEN',
  },
  EXPIRED_TOKEN: {
    code: 401,
    message: 'EXPIRED_TOKEN',
  },
  FORM_ERROR: {
    code: 422,
    message: 'FORM_ERROR',
  },
  INVALID_OPERATOR: {
    code: 422,
    message: 'INVALID_OPERATOR',
  },
  INVALID_VALUE: {
    code: 422,
    message: 'INVALID_VALUE',
  },
  LIMIT_REACHED: {
    code: 409,
    message: 'LIMIT_REACHED',
  },
  MISSING_PARAM: {
    code: 409,
    message: 'MISSING_PARAM',
  },
  NO_CHANGES: {
    code: 409,
    message: 'NO_CHANGES',
  },
  NOT_AUTHORIZED: {
    code: 401,
    message: 'NOT_AUTHORIZED',
  },
  NOT_FOUND: {
    code: 404,
    message: 'NOT_FOUND',
  },
  REPEATED_RESOURCE: {
    code: 409,
    message: 'REPEATED_RESOURCE',
  },
  UNEXPECTED_ERROR: {
    code: 500,
    message: 'SYSTEM',
    payload: 'UNEXPECTED_ERROR',
  },
  UNREACHED_MINIMUM: {
    code: 409,
    message: 'UNREACHED_MINIMUM',
  },
  UNREFERENCED_RESOURCE: {
    code: 409,
    message: 'UNREFERENCED_RESOURCE',
  },
  USER_NOT_FOUND: {
    code: 404,
    message: 'USER_NOT_FOUND',
  },
}
