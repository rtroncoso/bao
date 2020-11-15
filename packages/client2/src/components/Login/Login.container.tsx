import { withFormik } from 'formik';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose, Dispatch } from 'redux';
import { requestAsync, ResponseBody } from 'redux-query';
import * as Yup from 'yup';

import { withRedirect } from '@mob/client/components/HigherOrder';
import {
  AccountModel,
  login,
  loginQuery,
  LoginRequestParameters,
  selectAccount
} from '@mob/client/queries/account';
import {
  selectErrors,
  selectIsLoading
} from '@mob/client/queries/shared';
import { State } from '@mob/client/store';
import Login from './Login.component';

export interface ConnectedProps {
  account?: AccountModel | undefined;
  isLoading: boolean;
  login: Function;
  apiError: ResponseBody | null;
}

export interface FormValues {
  username: string;
  password: string;
}

const mapStateToProps = (state: State) => {
  return {
    account: selectAccount(state),
    apiError: selectErrors(state, loginQuery.url),
    isLoading: selectIsLoading(state, loginQuery.url)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  login: (body: LoginRequestParameters) => dispatch(requestAsync(login(body)))
});

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required('Ingrese un usuario'),

  password: Yup.string()
    .required('Ingrese una contraseña')
});

const formEnhancer = withFormik<ConnectedProps, FormValues>({
  validationSchema,
  mapPropsToValues: () => ({
    username: '',
    password: ''
  }),

  handleSubmit: (values, { props }) => {
    const { login } = props;

    login({
      username: values.username,
      password: values.password
    })
  }
})

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  withRedirect({
    predicate: ({ account }) => !!account,
    redirectUrl: '/characterSelection'
  }),

  formEnhancer
)(Login);
