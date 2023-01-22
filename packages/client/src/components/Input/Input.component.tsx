import React, { InputHTMLAttributes } from 'react';

import { FormErrorStyled } from '@bao/client/components/App/App.styles';
import InputStyled from './Input.styles';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  placeholder?: string;
  errors?: string;
  touched?: boolean;
}

const Input = ({ label, ...props }: InputProps) => {
  return (
    <React.Fragment>
      {label && <label htmlFor={props.name}>{label}</label>}
      <InputStyled {...props} />
      {props.errors && props.touched && (
        <FormErrorStyled>{props.errors}</FormErrorStyled>
      )}
    </React.Fragment>
  );
};

export default Input;
