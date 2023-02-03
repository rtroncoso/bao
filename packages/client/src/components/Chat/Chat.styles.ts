import tw, { styled } from 'twin.macro';

export interface ChatStyledProps {
  focused?: boolean;
}

export const ChatStyled = styled.div<ChatStyledProps>(({ focused }) => [
  tw`absolute bottom-[2vh] left-[1vw] bg-black opacity-40 w-[30vw] h-[20vh] px-2 py-1`,
  focused && tw`opacity-80`
]);

export const ChatMessageStyled = styled.span(() => [tw`text-xs text-white`]);
export const ChatInputStyled = styled.input(() => [
  tw`absolute w-full bottom-[0.2vh] left-0 text-xs`
]);
