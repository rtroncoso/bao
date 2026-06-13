import { FormikProps } from 'formik';
import React, { useCallback } from 'react';

import { AuthScreenToolbar } from '@bao/client/components/Auth';
import { useLoginMusic } from '@bao/client/components/Audio';

import {
  Alert,
  AlertDescription,
  AuthCard,
  Button,
  FormField,
  LoadingOverlay,
  PageShell,
  SiteHeader
} from '@bao/ui';

import { LoginConnectedProps, FormValues } from './Login.container';

type LoginProps = LoginConnectedProps & FormikProps<FormValues>;

const Login = ({
  account,
  errors,
  handleChange,
  handleBlur,
  handleSubmit,
  isLoading,
  apiError,
  touched,
  values
}: LoginProps) => {
  const playLoginMusic = useLoginMusic();

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      void playLoginMusic();
      handleSubmit(event);
    },
    [handleSubmit, playLoginMusic]
  );

  return (
    <PageShell width="sm">
      <AuthScreenToolbar />
      {isLoading && <LoadingOverlay label="Iniciando sesión…" />}
      <SiteHeader
        title="BAO"
        subtitle="Ingresá con tu cuenta para continuar al mundo del juego."
      />
      <AuthCard
        title="Iniciar sesión"
        description="Usá tus credenciales de jugador."
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField
            type="text"
            name="username"
            label="Usuario"
            placeholder="Tu nombre de usuario"
            value={values.username}
            error={errors.username}
            touched={touched.username}
            onBlur={handleBlur('username')}
            onChange={handleChange('username')}
            autoComplete="username"
          />
          <FormField
            type="password"
            name="password"
            label="Contraseña"
            placeholder="••••••••"
            value={values.password}
            error={errors.password}
            touched={touched.password}
            onBlur={handleBlur('password')}
            onChange={handleChange('password')}
            autoComplete="current-password"
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || Object.keys(errors).length > 0}
          >
            Ingresar
          </Button>
          {apiError && !account && !isLoading && (
            <Alert variant="destructive">
              <AlertDescription>
                {apiError.message === 'SYSTEM' &&
                  'Error al conectar con el servidor. Intentá de nuevo más tarde.'}
                {apiError.message === 'INVALID_VALUE' &&
                  'Usuario o contraseña inválidos.'}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </AuthCard>
    </PageShell>
  );
};

export default Login;
