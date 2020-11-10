import tw, { styled } from 'twin.macro';

const AppStyled = styled.div(() => [
  tw`bg-gradient-to-b from-indigo-700 to-gray-900`,
  tw`h-screen w-screen flex items-center justify-center`
]);

export default AppStyled;
