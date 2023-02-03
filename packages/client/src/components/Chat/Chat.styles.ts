import tw, { styled } from 'twin.macro';

export interface ChatStyledProps {
  focused?: boolean;
}

export const ChatStyled = styled.div<ChatStyledProps>(({ focused }) => [
  tw`absolute bottom-[2vh] left-[1vw] bg-black`,
  tw`opacity-40 w-[30vw] h-[20vh] px-2 py-1`,
  tw`flex flex-col`,
  focused && tw`opacity-80`
]);

export const ChatMessageListStyled = styled.ul(() => [
  tw`flex flex-col mb-8 overflow-y-auto`
]);
export const ChatMessageStyled = styled.li(() => [tw`text-xs text-white`]);
export const ChatInputStyled = styled.input(() => [
  tw`absolute w-full bottom-[0.2vh] left-0 text-xs px-2 py-1`
]);
