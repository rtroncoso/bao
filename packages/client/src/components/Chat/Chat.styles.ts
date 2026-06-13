import tw, { css, styled } from 'twin.macro';
import { MessageOptions } from '@bao/server/schema/MessageState';

export interface ChatMessageStyledProps {
  options?: MessageOptions;
}

export const ChatMessageStyled = styled.li<ChatMessageStyledProps>(
  ({ options }) => [
    tw`w-full break-all text-xs text-white`,
    css`
      color: ${options?.color ?? 'inherit'};
      font-weight: ${options?.fontWeight ?? 'inherit'};
      font-style: ${options?.fontStyle ?? 'inherit'};
    `
  ]
);
