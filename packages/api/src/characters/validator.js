
export const validateFind = req => {

  const ids = req.query.ids ? req.query.ids.split(',') : null
  const accountId = req.query.accountId || null

  return {
    ids,
    accountId
  }
}

export const validateFindOne = req => {

  const id = req.params.id;

  return {
    id
  }
}

export const validateInventory = req => {

  const characterId = req.params.id;

  return {
    characterId
  }
}