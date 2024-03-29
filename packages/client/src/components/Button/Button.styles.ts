import tw, { styled } from 'twin.macro';

const ButtonStyled = styled.button(() => [
  tw`bg-purple-800 font-bold font-mono w-full p-4 mt-8 text-gray-100 uppercase`,
  tw`transition-opacity duration-75`,
  tw`disabled:opacity-75`
]);

export default ButtonStyled;
