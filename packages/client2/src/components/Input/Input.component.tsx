import React, { InputHTMLAttributes } from 'react';
import InputStyled from './Input.styles';

interface InputProps  extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  placeholder?: string;
}

const Input = ({
  label,
  ...props
}: InputProps) => {
  return (
    <React.Fragment>
      {label && (
        <label htmlFor={props.name}>{label}</label>
      )}
      <InputStyled {...props} />
    </React.Fragment>
  );
}

export default Input;
