import tw, { styled } from 'twin.macro';

export const TitleStyled = styled.h1(() => [
  tw`font-mono text-2xl font-bold text-center text-indigo-800`,
]);

export const SubTitleStyled = styled.h2(() => [
  tw`text-lg text-center text-indigo-800`,
]);

export const CharacterListStyled = styled.ul(() => [
  tw`w-full h-full mt-6`,
]);

export const CharacterListItemStyled = styled.li(({ isActive }: { isActive: boolean }) => [
  tw`mt-4 text-lg font-bold text-center text-gray-300 bg-indigo-600 rounded cursor-pointer`,
  tw`hover:bg-indigo-700 hover:text-gray-400 first:mt-0`,
  tw`transition-colors duration-200`,

  isActive && [
    tw`shadow-outline`,
  ],
]);
