import 'core-js/internals/object-assign.js';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { compose, applyMiddleware, legacy_createStore as createStore, Store, StoreEnhancer } from 'redux';
import { Provider } from 'react-redux';
import promiseMiddleware from 'redux-promise';
import { persistStore, persistReducer, Persistor, PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import { PersistGate } from 'redux-persist/integration/react';
import 'bootstrap-sass';

import queueHandler from './actions/queueHandler';

import rootReducer from './reducers/index';

import App from './components/Main';

import DashBoard from './components/DashBoard';
import GroupList from './components/GroupList';
import UnitList from './components/UnitList';
import UnitDetails from './components/UnitDetails';
import UnitHistory from './components/UnitHistory';
import UpdateConfirmation from './components/UpdateConfirmation';
import DeleteConfirmation from './components/DeleteConfirmation';
import UpdateQueue from './components/UpdateQueue';
import LoginScreen from './components/LoginScreen';
import NotFound from './components/NotFound';
import UnitMassEdit from './components/UnitMassEdit';
import UnitMassEditPropertySelect from './components/UnitMassEditPropertySelect';

import moment from 'moment';

// Extend Window interface for Redux DevTools
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: () => StoreEnhancer;
    store: Store;
  }
}

moment.locale('fi');

// Type for the root state - this should match your actual reducer state shape
type RootState = ReturnType<typeof rootReducer>;

const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  storage,
  whitelist: ['auth', 'updateQueue', 'unitsByUpdateTime', 'unitsByUpdateCount', 'serviceGroup'], // Only persist these
  transforms: [
    // Transform to exclude loading from data if we include data
    {
      in: (state: any, key: string) => {
        if (key === 'data' && state) {
          // eslint-disable-next-line no-unused-vars
          const { loading, ...stateWithoutLoading } = state;
          return stateWithoutLoading;
        }
        return state;
      },
      // eslint-disable-next-line no-unused-vars
      out: (state: any, key: string) => state
    }
  ]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Fix for minification issues: When Redux DevTools Extension is not available,
// the && operator returns undefined which gets passed to compose(). 
// When minified, this becomes 'b(...args)' where 'b' is undefined, causing "b is not a function" error.
// This approach conditionally adds enhancers to avoid passing undefined to compose().
const enhancers: StoreEnhancer[] = [applyMiddleware(promiseMiddleware)];

if (globalThis.__REDUX_DEVTOOLS_EXTENSION__) {
  enhancers.push(globalThis.__REDUX_DEVTOOLS_EXTENSION__());
}

const store: Store = createStore(
  persistedReducer,
  compose(...enhancers)
);

const persistor: Persistor = persistStore(store);
globalThis.store = store;

const rootElement: HTMLElement | null = document.getElementById('app');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root: Root = createRoot(rootElement);

// Render the main component into the dom
root.render(
  <Provider store={store}>
    <PersistGate loading={<div>Ladataan...</div>} persistor={persistor}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/" element={<App />}>
            <Route path="/" element={<DashBoard />} />
            <Route path="/group" element={<GroupList />} />
            <Route path="/group/:groupId" element={<UnitList />} />
            <Route path="/group/:groupId/mass-edit" element={<UnitMassEditPropertySelect />} />
            <Route path="/group/:groupId/mass-edit/:propertyId" element={<UnitMassEdit />} />
            <Route path="/unit/:unitId" element={<UnitDetails />} />
            <Route path="/unit/:unitId/history" element={<UnitHistory />} />
            <Route path="/unit/:unitId/update/:propertyId/:valueId" element={<UpdateConfirmation />} />
            <Route path="/unit/:unitId/delete/:propertyId" element={<DeleteConfirmation />} />
            <Route path="/queue" element={<UpdateQueue />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PersistGate>
  </Provider>
);

const handler = queueHandler(store);
store.subscribe(handler);
handler({initial: true});