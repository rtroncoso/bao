import { Container, Sprite } from '@inlet/react-pixi';
import React from 'react';
import _ from 'lodash';

import SOFT from './soft.jpg';

/**
 * Loads the adds the diagnostic image
 *
 * @exports Background
 * @extends Container
 */
class Background extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props, nextProps);
  }

  render() {
    const { children, ...props } = this.props;
    return (
      <Container {...props}>
        <Sprite image={SOFT} />
        {children}
      </Container>
    );
  }
}

export default Background;
