import type { ApiRequestHandler } from '@bao/types'
import { envString, loadRootEnv } from '@bao/env'

loadRootEnv(__dirname)

export const adminAuth: ApiRequestHandler = (req, res, next) => {
  const configuredKey = envString('ADMIN_API_KEY')
  const providedKey = req.headers['x-admin-key']

  if (!configuredKey) {
    return next(new Error('ADMIN_API_KEY_NOT_CONFIGURED'))
  }

  if (!providedKey || providedKey !== configuredKey) {
    return res.status(401).send({ message: 'UNAUTHORIZED' })
  }

  return next()
}
