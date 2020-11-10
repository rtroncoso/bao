import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Provider as ReduxQueryProvider } from 'redux-query-react';
import { GlobalStyles } from 'twin.macro';
import reportWebVitals from './reportWebVitals';

import '@mob/client/assets/main.css';
import { AppContainer } from '@mob/client/components/App';
import store, { getQueries } from '@mob/client/store';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ReduxQueryProvider queriesSelector={getQueries}>
        <GlobalStyles />
        <AppContainer />
      </ReduxQueryProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
