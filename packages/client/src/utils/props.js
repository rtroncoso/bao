export const childrenToArray = (props) => {
  if (props && props.children && props.children.length >= 1) {
    return props.children;
  }

  if (props && props.children && !props.children.length) {
    return [props.children];
  }

  return [];
};

export default null;
