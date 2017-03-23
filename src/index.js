import 'core-js/fn/object/assign';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, createMemoryHistory, IndexRoute, applyRouterMiddleware } from 'react-router';
import { useScroll } from 'react-router-scroll';
import { compose, createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import promiseMiddleware from 'redux-promise';
import persistState from 'redux-localstorage';
import 'bootstrap-sass';


import * as clientLib from './lib/municipal-services-client';
import * as constants from './constants/index';
import queueHandler from './actions/queueHandler';

import { setUserLocation, getNearestUnits } from './actions/index';

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

moment.locale('fi');

const finalCreateStore = compose(
  applyMiddleware(promiseMiddleware),
  persistState(['data', 'auth', 'updateQueue', 'unitsByUpdateTime', 'unitsByUpdateCount', 'serviceGroup']))(createStore);

const store = finalCreateStore(rootReducer);
window.store = store;

function hasAuth(state) {
  const { token } = state.auth;
  return !(token === null || token === undefined);
}

function requireAuth(nextState, replace) {
  if (!hasAuth(store.getState())) {
    return replace('/login');
  }
  return true;
}

// Render the main component into the dom
ReactDOM.render(
  <Provider store={store}>
    <Router history={createMemoryHistory()}
            render={applyRouterMiddleware(useScroll())}>
        <Route path="/login" component={LoginScreen} />
        <Route path="/" component={App} onEnter={requireAuth}>
            <IndexRoute component={DashBoard} />
            <Route path="/group" component={GroupList} />
            <Route path="/group/:groupId" component={UnitList} />
            <Route path="/unit/:unitId" component={UnitDetails} />
            <Route path="/unit/:unitId/update/:propertyId/:valueId" component={UpdateConfirmation} />
            <Route path="/unit/:unitId/delete/:propertyId" component={DeleteConfirmation} />
            <Route path="/queue" component={UpdateQueue} />
        </Route>
    </Router>
  </Provider>, document.getElementById('app')
);

const handler = queueHandler(store);
store.subscribe(handler);
handler({initial: true});

