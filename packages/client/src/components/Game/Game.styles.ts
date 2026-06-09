import tw, { css, styled } from 'twin.macro';

export const GamePageShell = styled.div(() => [
  tw`flex h-screen w-screen items-center justify-center bg-black`
]);

export interface GameStyledProps {
  width: number;
  height: number;
}

export const GameStyled = styled.div<GameStyledProps>(({ width, height }) => [
  tw`relative shrink-0 overflow-hidden`,
  css`
    width: ${width}px;
    height: ${height}px;
  `
]);
