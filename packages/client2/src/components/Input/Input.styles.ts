import tw, { theme, css, styled } from 'twin.macro';

import { InputProps } from './Input.component';

const InputStyled = styled.input(({ errors, touched }: InputProps) => [
  tw`w-full p-2 my-2 font-mono`,
  tw`border-2 border-transparent border-solid rounded shadow-sm hocus:shadow-md hocus:outline-none`,
  tw`transition-colors transition-shadow duration-200`,

  errors && touched && [
    css`box-shadow: 0 4px 6px -1px rgba(254, 215, 215, 0.8), 0 2px 4px -1px rgba(254, 215, 215, 0.06);`
  ]
]);

export default InputStyled;
