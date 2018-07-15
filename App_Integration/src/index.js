import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { unregister } from './registerServiceWorker';

import store from './store/store';
import AppRouter from './routers/AppRouter';

import './index.css';

ReactDOM.render(
  <Provider store={store}>
    <AppRouter />
  </Provider>,
  document.getElementById('root'),
);

unregister();
