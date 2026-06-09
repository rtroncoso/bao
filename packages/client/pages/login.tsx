import { LoginContainer } from '@bao/client/components/Login';
import { NextPage } from 'next';
import React from 'react';

export const getServerSideProps = async () => ({ props: {} });

export const LoginPage: NextPage = (props) => <LoginContainer {...props} />;
export default LoginPage;
