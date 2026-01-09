import _ from 'lodash';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { UnitListElement } from './UnitList';
import { Unit } from '../types';
import { RootState, UnitsByUpdateCountState } from '../reducers/types';

interface UnitByUpdateCount {
  id: string;
  count: number;
}

function topUnits(
  n: number,
  units: Record<string, Unit>,
  unitsByUpdateCount: UnitsByUpdateCountState
): Unit[] {
  return _.reverse(
    _.map(
      _.sortBy(
        _.map(unitsByUpdateCount, (u, id) => ({
          id,
          count: u.count
        })),
        ['count']
      ),
      (u: UnitByUpdateCount) => {
        return units[u.id];
      }
    ).filter(unit => unit != null).slice(0, n)
  );
}

const DashBoard: React.FC = () => {
  const loading = useSelector((state: RootState) => state.data.loading.unit);
  const userLocation = useSelector((state: RootState) => state.userLocation);
  const unitData = useSelector((state: RootState) => state.data.unit);
  const unitsByDistance = useSelector((state: RootState) => state.data.unitsByDistance);
  const unitsByUpdateCount = useSelector((state: RootState) => state.unitsByUpdateCount);
  
  const nearest = useMemo(() => {
    if (_.keys(unitData).length > 0) {
      return _.map(unitsByDistance, (u) => {
        return unitData[u.id.toString()];
      });
    }
    return [];
  }, [unitData, unitsByDistance]);

  const frequent = useMemo(() => {
    if (_.keys(unitData).length > 0) {
      return topUnits(20, unitData, unitsByUpdateCount);
    }
    return [];
  }, [unitData, unitsByUpdateCount]);

  if (loading) {
    return <div>Ladataan...</div>;
  }

  const nearestElements = userLocation === null
    ? <span>Sijainti ei saatavilla.</span>
    : nearest.filter(u => u?.id).map(u => <UnitListElement key={u.id} unit={u} />);

  const frequentElements = frequent.map(u => <UnitListElement key={u.id} unit={u} />);

  return (
    <div className="row">
      <div className="col-xs-12">
        <h5>Lähimmät</h5>
        <div className="list-group facility-drilldown">{nearestElements}</div>
        <h5>Yleisimmät</h5>
        <div className="list-group facility-drilldown">{frequentElements}</div>
      </div>
    </div>
  );
};

export default DashBoard;