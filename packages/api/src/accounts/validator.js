
export const validateFind = req => {

  const ids = req.query.ids ? req.query.ids.split(',') : null

  return {
    ids
  }
}

export const validateFindOne = req => {

  const id = req.params.id;

  return {
    id
  }
}

export const validateLogin = req => {

	const username = req.body.username;
	const password = req.body.password;

	if(!username || !password){
		throw new Error("MISSING_PARAMS");
	}

	return {
		username,
		password
	}
}

export const validateToken = req => {

	const token = req.headers['x-auth'];

	if(!token){
		throw new Error("MISSING_PARAMS");
	}

	return {
		token
	}
}