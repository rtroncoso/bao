import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FormikProps } from 'formik';
import React from 'react';

import {
  AlertStyled,
  FormStyled,
  FormTitleStyled
} from '@mob/client/components/App/App.styles';
import { Button } from '@mob/client/components/Button';
import { Input } from '@mob/client/components/Input';

import { LoginConnectedProps, FormValues } from './Login.container';
import LoginStyled from './Login.styles';
import { Graphic } from '@mob/core';

type LoginProps = LoginConnectedProps & FormikProps<FormValues>;

const Login: React.FC<LoginProps> = ({
  account,
  errors,
  handleChange,
  handleBlur,
  handleSubmit,
  isLoading,
  apiError,
  touched,
  values
}) => {
  const graphic = new Graphic({ id: 0 });
  console.log(graphic);
  return (
    <LoginStyled>
      {isLoading && (
        <div className="fixed top-0 left-0 z-50 block w-full h-full bg-white opacity-75">
          <span
            className="relative block w-0 h-0 mx-auto my-0 text-indigo-800 opacity-75 top-1/2"
            style={{ top: '50%' }}
          >
            <FontAwesomeIcon icon={faCircleNotch} size="5x" spin />
          </span>
        </div>
      )}
      <FormStyled onSubmit={handleSubmit}>
        <FormTitleStyled>Login</FormTitleStyled>
        <Input
          type="text"
          name="username"
          placeholder="Usuario"
          value={values.username}
          errors={errors.username}
          touched={touched.username}
          onBlur={handleBlur('username')}
          onChange={handleChange('username')}
        />
        <Input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={values.password}
          errors={errors.password}
          touched={touched.password}
          onBlur={handleBlur('password')}
          onChange={handleChange('password')}
        />
        <Button
          type="submit"
          disabled={isLoading || Object.keys(errors).length > 0}
        >
          Ingresar
        </Button>
        {apiError && !account && !isLoading && (
          <AlertStyled className="w-full mt-8" role="alert">
            {apiError.message === 'SYSTEM' && (
              <p className="font-bold">Error al conectar con el servidor</p>
            )}
            {apiError.message === 'INVALID_VALUE' && (
              <p className="font-bold">Usuario o contraseña inválidos</p>
            )}
          </AlertStyled>
        )}
      </FormStyled>
    </LoginStyled>
  );
};

export default Login;
