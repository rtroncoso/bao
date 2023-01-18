import { withFormik } from 'formik';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';
import { requestAsync } from 'redux-query';
import * as Yup from 'yup';

import { withRedirect } from '@mob/client/components/Wrappers';
import {
  login,
  loginQuery,
  LoginRequestPayload,
  selectAccount
} from '@mob/client/queries/account';
import { selectErrors, selectIsLoading } from '@mob/client/queries/shared';
import { State } from '@mob/client/store';
import Login from './Login.component';

export interface FormValues {
  username: string;
  password: string;
}

const mapStateToProps = (state: State) => {
  return {
    account: selectAccount(state),
    apiError: selectErrors(state, loginQuery.queryKey),
    isLoading: selectIsLoading(state, loginQuery.queryKey)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  login: (body: LoginRequestPayload) => dispatch(requestAsync(login(body)))
});

export type LoginConnectedProps = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const validationSchema = Yup.object().shape({
  username: Yup.string().required('Ingrese un usuario'),

  password: Yup.string().required('Ingrese una contraseña')
});

const formEnhancer = withFormik<LoginConnectedProps, FormValues>({
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
    });
  }
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withRedirect<LoginConnectedProps>({
    predicate: ({ account }) => !!account,
    redirectUrl: '/characters'
  }),

  formEnhancer
)(Login);
