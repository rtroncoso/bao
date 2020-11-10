import { QueryConfig } from "redux-query";

export interface LoginRequestParameters {
  username: string;
  password: string;
}

export const loginQuery = {
  cache: false,
  force: true,
  backof: {
    maxRetries: 1
  },
  url: 'http://localhost:9000/client/accounts/login',
  options: {
    method: 'POST'
  }
};

const login = (body: LoginRequestParameters): QueryConfig<LoginRequestParameters> => {
  return {
    ...loginQuery,
    body
  }
};

export default login;
