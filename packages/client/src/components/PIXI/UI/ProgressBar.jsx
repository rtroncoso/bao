import { Container, Text } from '@inlet/react-pixi';
import React from 'react';
import _ from 'lodash';

import Rectangle from './shapes/Rectangle';

export default class ProgressBar extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props, nextProps);
  }

  render() {
    const { label, progress, backgroundFill, foregroundFill, ...props } = this.props;
    return (
      <Container>
        <Rectangle {...props} fill={backgroundFill} />
        <Rectangle {...props} width={progress * this.props.width} fill={foregroundFill} />
        <Text
          style={{
            fontFamily: 'Arial',
            fontSize: 12,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: '#ffffff',
          }}
          x={props.x + 45}
          y={props.y - 20}
          text={label}
        />
      </Container>
    );
  }
}
