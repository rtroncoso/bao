import React from 'react';
import AppStyled from './App.styles';
import './App.scss';

const App: React.FC<unknown> = ({ children }) => {
  return <AppStyled>{children}</AppStyled>;
};

export default App;
