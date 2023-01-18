import React from 'react';
import AppStyled from './App.styles';

const App: React.FC<unknown> = ({ children }) => {
  return <AppStyled>{children}</AppStyled>;
};

export default App;
