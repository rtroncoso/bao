import tw, { styled, css } from 'twin.macro';
import { MessageOptions } from '@bao/server/schema/MessageState';

export interface ChatStyledProps {
  focused?: boolean;
}

export interface ChatMessageStyledProps {
  options?: MessageOptions;
}

export const ChatStyled = styled.div<ChatStyledProps>(({ focused }) => [
  tw`absolute bottom-[2vh] left-[1vw] bg-black`,
  tw`opacity-40 w-[30vw] h-[20vh] px-2 py-1`,
  tw`flex flex-col`,
  focused && tw`opacity-80`
]);

export const ChatMessageListStyled = styled.ul(() => [
  tw`flex flex-row flex-wrap mb-8 overflow-y-auto break-words`
]);

export const ChatMessageStyled = styled.li<ChatMessageStyledProps>(
  ({ options }) => [
    tw`w-full text-xs text-white break-all`,
    css`
      color: ${options.color};
      font-weight: ${options.fontWeight};
      font-style: ${options.fontStyle};
    `
  ]
);

export const ChatInputStyled = styled.input(() => [
  tw`absolute w-full bottom-[0.2vh] left-0 text-xs px-2 py-1`
]);
