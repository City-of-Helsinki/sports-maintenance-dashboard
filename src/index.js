import 'core-js/fn/object/assign';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory, IndexRoute, applyRouterMiddleware } from 'react-router';
import { useScroll } from 'react-router-scroll';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import promiseMiddleware from 'redux-promise';
import 'bootstrap-sass';

import * as clientLib from './lib/municipal-services-client';
window.clientLib = clientLib;

import rootReducer from './reducers/index';

import App from './components/Main';

import DashBoard from './components/DashBoard';
import GroupList from './components/GroupList';
import UnitList from './components/UnitList'; 
import UnitDetails from './components/UnitDetails'; 
import UpdateConfirmation from './components/UpdateConfirmation'; 
import UpdateQueue from './components/UpdateQueue'; 

import moment from 'moment';

moment.locale('fi');

let store = createStore(rootReducer, applyMiddleware(promiseMiddleware));
window.store = store;

// Render the main component into the dom
ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}
            render={applyRouterMiddleware(useScroll())}>
        <Route path="/" component={App} >
            <IndexRoute component={DashBoard} />
            <Route path="/group" component={GroupList} />
            <Route path="/group/:groupId" component={UnitList} />
            <Route path="/unit/:unitId" component={UnitDetails} />
            <Route path="/unit/:unitId/update/:value" component={UpdateConfirmation} />
            <Route path="/queue" component={UpdateQueue} />
        </Route>
    </Router>
  </Provider>, document.getElementById('app')
);
