import { Container, withPixiApp } from '@inlet/react-pixi';
import { Point } from 'pixi.js';
import React from 'react';

import Thingie from './Thingie';

class ThingiesList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mouse: new Point(0, 0)
    };
  }

  componentDidMount() {
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
  }

  componentWillUnmount() {
    this.mouseMoveHandler = this.mouseMoveHandler.unbind();
  }

  mouseMoveHandler(event) {
    this.setState({
      mouse: {
        x: event.data.global.x,
        y: event.data.global.y
      }
    });
  }

  render() {
    const { mouse } = this.state;
    const { thingies } = this.props;
    return (
      <Container interactive mousemove={this.mouseMoveHandler}>
        {thingies.map(t => (
          <Thingie
            mouse={mouse}
            body={t.body}
            weapon={t.weapon}
            shield={t.shield}
            helmet={t.helmet}
            head={t.head}
            key={t.index}
            x={t.position.x}
            y={t.position.y}
          />
        ))}
      </Container>
    );
  }
}

export default withPixiApp(ThingiesList);
