import React, { ButtonHTMLAttributes } from 'react';
import ButtonStyled from './Button.styles';

interface ButtonProps  extends ButtonHTMLAttributes<HTMLButtonElement> {
}

const Button = ({
  children,
  ...props
}: ButtonProps) => {
  return (
    <ButtonStyled {...props}>
      {children}
    </ButtonStyled>
  );
}

export default Button;
