import tw, { styled } from 'twin.macro';

const AppStyled = styled.div(() => [
  tw`bg-gradient-to-b from-indigo-700 to-gray-900`,
  tw`flex items-center justify-center w-screen h-screen`
]);

export const containerStyles = [
  tw`flex flex-col items-center justify-center w-1/3 h-auto p-4 bg-gray-100 rounded-sm`
];

export const ContainerStyled = styled.div(() => [...containerStyles]);

export const FormStyled = styled.form(() => [...containerStyles]);

export const FormErrorStyled = styled.span(() => [
  tw`font-mono text-sm font-bold text-red-500`
]);

export const FormTitleStyled = styled.h2(() => [
  tw`pb-2 font-mono text-2xl text-center text-indigo-800`
]);

export const AlertStyled = styled.div(() => [
  tw`p-4 text-red-800 bg-red-200 border-l-4 border-red-800`
]);

export default AppStyled;
