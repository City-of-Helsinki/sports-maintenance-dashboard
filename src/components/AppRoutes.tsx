import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import LoginScreen from './LoginScreen';
import App from './Main';
import DashBoard from './DashBoard';

const GroupList = lazy(() => import('./GroupList'));
const UnitList = lazy(() => import('./UnitList'));
const UnitMassEditPropertySelect = lazy(() => import('./UnitMassEditPropertySelect'));
const UnitMassEdit = lazy(() => import('./UnitMassEdit'));
const UnitDetails = lazy(() => import('./UnitDetails'));
const UnitHistory = lazy(() => import('./UnitHistory'));
const UpdateConfirmation = lazy(() => import('./UpdateConfirmation'));
const DeleteConfirmation = lazy(() => import('./DeleteConfirmation'));
const UpdateQueue = lazy(() => import('./UpdateQueue'));
const NotFound = lazy(() => import('./NotFound'));

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<div>Ladataan...</div>}>
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
    </Suspense>
  );
};

export default AppRoutes;