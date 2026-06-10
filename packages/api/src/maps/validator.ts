import type { AuthenticatedRequest } from '@bao/types'

export const validateFind = (req: AuthenticatedRequest) => {
  const ids = req.query.ids ? String(req.query.ids).split(',') : null
  return { ids }
}

export const validateFindOne = (req: AuthenticatedRequest) => ({
  id: req.params.id,
})
