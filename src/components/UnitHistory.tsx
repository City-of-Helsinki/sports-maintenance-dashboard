import React, { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import * as actions from '../actions/index';
import ObservationItem from './ObservationItem';
import { UnitObservation } from '../types';
import { RootState } from '../reducers/types';

interface Params {
  unitId: string;
}

const UnitHistory: React.FC = () => {
  const params = useParams<Params>();
  const dispatch = useDispatch();
  
  const unitId = useMemo(() => Number(params.unitId), [params.unitId]);
  
  const unit = useSelector((state: RootState) => state.data.unit[unitId]);
  const observationData = useSelector((state: RootState) => state.data.observation);
  const isLoading = useSelector((state: RootState) => state.data.loading[`unit-${unitId}`] || state.data.loading[`observation-${unitId}`]);
  
  const observations = useMemo(() => {
    if (!observationData) return [];
    return Object.values(observationData).filter(obs => obs.unit === unitId);
  }, [observationData, unitId]);

  useEffect(() => {
    if (params.unitId) {
      dispatch(actions.fetchUnitObservations(params.unitId));
    }
  }, [dispatch, params.unitId]);

  const renderObservations = (observations: UnitObservation[]) => {
    return observations.map(obs => (
      <div key={obs.id} className="list-group-item">
        <ObservationItem observation={obs} />
      </div>
    ));
  };

  if (isLoading) {
    return <div>Ladataan...</div>;
  }

  if (unit === undefined) {
    return <div>Yksikköä ei löytynyt</div>;
  }

  return (
    <div className="row">
      <div className="col-xs-12">
        <div className="list-group facility-return clearfix">
          <Link to={`/unit/${unit.id}`} className="list-group-item">
            <span className="action-icon glyphicon glyphicon-chevron-left"></span>
            {' '}Takaisin
          </Link>
        </div>
        <div className="well">
          <h4>{ unit.name.fi }</h4>
        </div>
        <div className="unit-observations">
          <h4>Historia</h4>
          {observations && observations.length > 0 ? (
            <div className="list-group">
              {renderObservations(observations)}
            </div>
          ) : (
            <p>Ei historiatietoja</p>
          )}
        </div>
      </div>
    </div>);
};

export default UnitHistory;