import React from 'react';
import { Routes, Route } from 'react-router-dom';

import LoginScreen from './LoginScreen';
import App from './Main';
import DashBoard from './DashBoard';
import GroupList from './GroupList';
import UnitList from './UnitList';
import UnitMassEditPropertySelect from './UnitMassEditPropertySelect';
import UnitMassEdit from './UnitMassEdit';
import UnitDetails from './UnitDetails';
import UnitHistory from './UnitHistory';
import UpdateConfirmation from './UpdateConfirmation';
import DeleteConfirmation from './DeleteConfirmation';
import UpdateQueue from './UpdateQueue';
import NotFound from './NotFound';

const AppRoutes: React.FC = () => {
  return (
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
  );
};

export default AppRoutes;