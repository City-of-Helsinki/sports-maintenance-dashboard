import 'core-js/internals/object-assign.js';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { compose, applyMiddleware, legacy_createStore as createStore } from 'redux';
import { Provider } from 'react-redux';
import promiseMiddleware from 'redux-promise';
import persistState from 'redux-localstorage';
import 'bootstrap-sass';

import queueHandler from './actions/queueHandler';

import rootReducer from './reducers/index';

import App from './components/Main';

import DashBoard from './components/DashBoard';
import GroupList from './components/GroupList';
import UnitList from './components/UnitList';
import UnitDetails from './components/UnitDetails';
import UpdateConfirmation from './components/UpdateConfirmation';
import DeleteConfirmation from './components/DeleteConfirmation';
import UpdateQueue from './components/UpdateQueue';
import LoginScreen from './components/LoginScreen';

import moment from 'moment';

import ES6Promise from 'es6-promise';
ES6Promise.polyfill();
import isomorphicFetch from 'isomorphic-fetch';
isomorphicFetch;
moment.locale('fi');

const stateToPersist = ['data', 'auth', 'updateQueue', 'unitsByUpdateTime', 'unitsByUpdateCount', 'serviceGroup'];

const finalCreateStore = compose(
  applyMiddleware(promiseMiddleware),
  persistState(stateToPersist))(createStore);

const enableReduxDevTools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();

const store = finalCreateStore(rootReducer, enableReduxDevTools);
window.store = store;

const rootElement = document.getElementById('app');
const root = createRoot(rootElement);

// Render the main component into the dom
root.render(
  <Provider store={store}>
    <BrowserRouter history={createMemoryHistory()}>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/" element={<App />}>
            <Route exact path="/" element={<DashBoard />} />
            <Route path="/group" element={<GroupList />} />
            <Route path="/group/:groupId" element={<UnitList />} />
            <Route path="/unit/:unitId" element={<UnitDetails />} />
            <Route path="/unit/:unitId/update/:propertyId/:valueId" element={<UpdateConfirmation />} />
            <Route path="/unit/:unitId/delete/:propertyId" element={<DeleteConfirmation />} />
            <Route path="/queue" element={<UpdateQueue />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </Provider>
);

const handler = queueHandler(store);
store.subscribe(handler);
handler({initial: true});
