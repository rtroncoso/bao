import { Container, withPixiApp } from '@inlet/react-pixi';
import { updateScreenScale } from 'store/render/render.state';
import { Point } from 'pixi.js';
import React from 'react';
import { connect } from 'react-redux';

import { checkScreen } from 'client/utils';
import {
  selectCanvasHeight,
  selectCanvasWidth,
  selectWindowHeight,
  selectWindowWidth,
} from 'store/render/render.selectors';

/**
 * ScaledContainer
 *
 * A DisplayObjectContainer which attempts to scale and best-fit into the
 * window size dispatched from the RendererStore
 *
 * @exports ScaledContainer
 */
class ScaledContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      position: {
        scale: 0,
        x: 0,
        y: 0,
      },
      windowSize: {
        w: 0,
        h: 0
      },
      currentSize: {
        w: 0,
        h: 0
      }
    };
  }

  componentDidMount() {
    this.props.app.ticker.add(this.tick, this);
  }

  componentWillUnmount() {
    this.props.app.ticker.remove(this.tick);
  }

  tick() {
    const {
      width,
      height,
      canvasWidth,
      canvasHeight
    } = this.props;
    const { w, h } = this.state.windowSize || {};
    const needsResize = checkScreen(width, height, w, h);

    if (needsResize) {
      this.setState({
        windowSize: {
          w: width,
          h: height
        }
      });

      this.resizeAspectFillHandler(width, height, canvasWidth, canvasHeight);
    }
  }

  /**
   * Scales and positions Container to best fill to target dimensions
   * @return {null}
   */
  resizeAspectFillHandler(rw, rh, tw = 1920, th = 1080) {
    const Xratio = rw / tw;
    const Yratio = rh / th;
    let scaleRatio = rw > rh ? Xratio : Yratio;
    let scale = new Point(scaleRatio, scaleRatio);
    let offsetX = rw / 2 - tw * scaleRatio / 2;
    let offsetY = rh / 2 - th * scaleRatio / 2;

    if (th * scaleRatio < rh) {
      scaleRatio = Yratio;
      scale = new Point(scaleRatio, scaleRatio);
      offsetX = rw / 2 - tw * scaleRatio / 2;
      offsetY = rh / 2 - th * scaleRatio / 2;
    }

    this.setState({
      currentSize: {
        w: tw * scaleRatio,
        h: th * scaleRatio,
      },
      position: {
        scale,
        x: offsetX,
        y: offsetY,
      }
    });
  }

  /**
   * Scales and positions Container to best fit to target dimensions
   * @return {null}
   */
  resizeAspectFitHandler(rw, rh, tw = 1920, th = 1080) {
    const xRatio = rw / tw;
    const yRatio = rh / th;
    let newWidth = tw / xRatio;
    let newHeight = th / yRatio;

    let scale;
    if (newHeight < newWidth) {
      newWidth = newHeight / yRatio * xRatio;
      scale = yRatio;
    } else if (newWidth < newHeight) {
      newHeight = newHeight / xRatio * yRatio;
      scale = xRatio;
    }

    const offsetX = 0;
    const offsetY = 0;
    this.setState({
      position: {
        scale,
        x: offsetX,
        y: offsetY,
      }
    });
  }

  render() {
    const { currentSize, position } = this.state;
    const { children } = this.props;

    return (
      <Container
        width={currentSize.w}
        height={currentSize.h}
        scale={position.scale}
        x={position.x}
        y={position.y}
      >
        {children}
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  width: selectWindowWidth(state),
  height: selectWindowHeight(state),
  canvasWidth: selectCanvasWidth(state),
  canvasHeight: selectCanvasHeight(state),
});

export const ConnectedScaledContainer = connect(mapStateToProps)(ScaledContainer);

export default withPixiApp(ConnectedScaledContainer);
