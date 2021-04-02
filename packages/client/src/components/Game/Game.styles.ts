import { TextStyle } from 'pixi.js';
import tw, { styled } from 'twin.macro';

export const defaultTextStyle = new TextStyle({
  fontFamily: 'Arial',
  fontWeight: 'bold',
  fontSize: 16,
  fill: ['#ffffff', '#00ff99'],
  align: 'center',
  stroke: '#4a1850',
});

export const styles = {
  canvasStyle: {
    width: '100%'
  },
};

export const GameStyled = styled.div(() => [
  tw`w-10/12`,
]);
