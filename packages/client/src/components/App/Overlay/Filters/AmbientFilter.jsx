import { selectFilterColor, selectFilterEnabled } from 'store/app/app.selectors';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { updateFilterColor, updateFilterIsOn } from 'store/app/app.state';
import styles from './AmbientFilter.scss';

const AmbientFilter = (props) => {
  const defaultColor = '#9C0A3C';
  const colorChange = e => props.updateColor(e.target.value);
  const checkboxChange = e => props.updateEnabled(e.target.checked);

  return (
    <div className="filter" style={styles.filter}>
      <input type="checkbox" value={props.enabled} onChange={checkboxChange} />
      <input type="color" value={props.color || defaultColor} onChange={colorChange} />
      <span>GLSL Color Mod</span>
    </div>
  );
};

export const mapStateToProps = state => ({
  color: selectFilterColor(state),
  enabled: selectFilterEnabled(state),
});

export const mapDispatchToProps = dispatch => ({
  updateColor: payload => dispatch(updateFilterColor(payload)),
  updateEnabled: payload => dispatch(updateFilterIsOn(payload))
});

export const GLSLFilterContainer = connect(mapStateToProps, mapDispatchToProps);
export default GLSLFilterContainer(AmbientFilter);
