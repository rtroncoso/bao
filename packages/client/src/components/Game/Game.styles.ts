import tw, { css, styled, theme } from 'twin.macro';

import { CHARACTER_ROLE_STYLES, roles } from '@bao/core/constants';

export const defaultTextStyle = CHARACTER_ROLE_STYLES[roles.admin];

export interface GameStyledProps {
  width: number;
  height: number;
}
export const GameStyled = styled.div<GameStyledProps>(({ width, height }) => [
  tw`relative max-h-screen`,
  css`
    width: ${width}px;
    height: ${height}px;
  `,
  css`
    box-shadow: 0 4px 6px -1px ${theme('colors.indigo.800')},
      0 2px 4px -1px rgba(254, 215, 215, 0.06);
  `
]);
