import { withPixiApp } from '@inlet/react-pixi';
import React from 'react';
import { connect } from 'react-redux';
import { loader, Point } from 'pixi.js';

import ProgressBar from 'client/components/PIXI/UI/ProgressBar';
import { loadingComplete, loadingStart } from 'store/asset/asset.state';
import { selectCanvasHeight, selectCanvasWidth, selectStageCenter } from 'store/render/render.selectors';

export class LoaderComponent extends React.Component {
  constructor(props) {
    super(props);
    this.loader = loader;
    this.state = {
      progress: 0,
    };
  }

  componentDidMount() {
    this.props.startLoader(this.loader);
    this.loader.onProgress.add(this.onUpdate.bind(this));
    this.loader.onComplete.add(this.onComplete.bind(this));
  }

  onUpdate(ldr) {
    this.setState({
      progress: ldr.progress / 100
    });
  }

  onComplete() {
    this.props.completeLoader(this.loader.resources);
  }

  render() {
    const { width, height } = this.props;
    const { progress } = this.state;
    const centerX = width / 2;
    const centerY = height / 2;
    return (
      <ProgressBar
        label="Loading Resources"
        backgroundFill={0x000000}
        foregroundFill={0xff0000}
        x={centerX - 100}
        y={centerY}
        progress={progress}
        width={200}
        height={5}
      />
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  width: selectCanvasWidth(state),
  height: selectCanvasHeight(state),
  center: selectStageCenter(state),
  ...ownProps,
});

const mapDispatchToProps = dispatch => ({
  completeLoader: payload => dispatch(loadingComplete(payload)),
  startLoader: payload => dispatch(loadingStart(payload)),
});

const LoaderContainer = connect(mapStateToProps, mapDispatchToProps)(LoaderComponent);
export default withPixiApp(LoaderContainer);
