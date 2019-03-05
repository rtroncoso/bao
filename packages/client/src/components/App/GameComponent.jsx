import { Stage } from '@inlet/react-pixi';
import React from 'react';
import { connect } from 'react-redux';

import ScaledContainer from 'client/components/PIXI/Containers/ScaledContainer';

import ColorFilter from 'client/filters/color/color';
import { selectLoadingState } from 'store/asset/asset.selectors';
import { selectFilterColor, selectFilterEnabled } from 'store/app/app.selectors';
import { selectWindowHeight, selectWindowWidth } from 'store/render/render.selectors';

class GameComponent extends React.Component {
  constructor(props) {
    super(props);
    this.colorFilter = new ColorFilter();
  }

  componentDidMount() {
    if (this.props.enabled) {
      this.colorFilter.color = this.props.color;
    }
  }

  componentDidUpdate() {
    if (this.props.enabled) {
      this.colorFilter.color = this.props.color;
    }
  }

  render() {
    const { width, height, enabled } = this.props;
    const { colorFilter } = this;

    return (
      <Stage width={width} height={height} options={{ antialias: false, legacy: true }}>
        <ScaledContainer filters={[enabled && colorFilter]}>
          {this.props.children}
        </ScaledContainer>
      </Stage>
    );
  }
}

const mapStateToProps = state => ({
  isLoading: selectLoadingState(state),
  width: selectWindowWidth(state),
  height: selectWindowHeight(state),
  color: selectFilterColor(state),
  enabled: selectFilterEnabled(state),
});

export default connect(mapStateToProps)(GameComponent);
