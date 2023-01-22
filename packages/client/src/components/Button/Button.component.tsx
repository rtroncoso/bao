import React, { ButtonHTMLAttributes } from 'react';
import ButtonStyled from './Button.styles';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ children, ...props }: ButtonProps) => {
  return <ButtonStyled {...props}>{children}</ButtonStyled>;
};

export default Button;
