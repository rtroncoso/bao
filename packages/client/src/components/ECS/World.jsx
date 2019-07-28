import React, { useContext } from 'react';
import ecs from 'nano-ecs';

export const Context = React.createContext(null);
export const WorldProvider = Context.Provider;
export const WorldConsumer = Context.Consumer;

export const useWorld = () => useContext(Context);
export const withWorld = (BaseComponent) => {
  const wrapper = React.forwardRef((props, ref) => (
    <WorldConsumer>{value => <BaseComponent {...props} ref={ref} world={value} />}</WorldConsumer>
  ));
  wrapper.displayName = `withWorld(${BaseComponent.displayName || BaseComponent.name})`;
  return wrapper;
};

const world = ecs();
const World = props => (
  <WorldProvider value={world}>
    {props.children}
  </WorldProvider>
);

export default World;
