export const validateFind = (req) => {
  const ids = req.query.ids ? req.query.ids.split(',') : null

  return {
    ids,
  }
}

export const validateFindOne = (req) => {
  const id = req.params.id

  return {
    id,
  }
}
