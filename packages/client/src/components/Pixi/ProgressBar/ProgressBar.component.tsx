import { Container, Text } from '@inlet/react-pixi';
import React from 'react';

import { Rectangle, RectangleProps } from '@bao/client/components/Pixi';

export interface ProgressBarProps extends Partial<RectangleProps> {
  backgroundColor?: number;
  foregroundColor?: number;
  height: number;
  label?: string;
  progress?: number;
  width: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  backgroundColor,
  foregroundColor,
  label,
  progress,
  ...props
}) => {
  return (
    <Container x={props.x} y={props.y}>
      <Rectangle
        anchor={[0.5, 0.5]}
        x={-props.width / 4}
        color={backgroundColor}
        width={props.width}
        height={props.height}
      />
      <Rectangle
        anchor={[0.5, 0.5]}
        x={-props.width / 4}
        color={foregroundColor}
        width={progress * props.width}
        height={props.height}
      />
      <Text
        anchor={[0.5, 0.5]}
        text={label}
        y={-20}
        style={{
          align: 'center',
          fontFamily: 'Arial',
          fontSize: 14,
          fontStyle: 'italic',
          fontWeight: 'bold',
          fill: '#ffffff'
        }}
      />
    </Container>
  );
};
