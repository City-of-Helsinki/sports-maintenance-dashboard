import _ from 'lodash';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { retryImmediately } from '../actions/index';
import { UnitListElement } from './UnitList';
import { Unit } from '../types';
import { RootState } from '../reducers/types';

interface LatestUpdatesProps {
  units: Unit[];
}

function LatestUpdates({ units }: Readonly<LatestUpdatesProps>) {
  const elements = _.map(units, (u, index) => {
    return <UnitListElement key={`${u.id}-${index}`} unit={u} />;
  });
  return (
    <div className="row">
      <div className="col-xs-12">
        <h5>Onnistuneet päivitykset<br/>
          <small>Tässä listassa on viimeisimmät onnistuneesti päivitetyt paikat</small></h5>
        <div className="list-group facility-drilldown">
          { elements }
        </div>
      </div>
    </div>
  );
}

const UpdateQueue: React.FC = () => {
  const dispatch = useDispatch();
  
  // Select individual pieces of state to avoid object creation in useSelector
  const items = useSelector((state: RootState) => state.updateQueue);
  const units = useSelector((state: RootState) => state.data.unit);
  const unitsByUpdateTime = useSelector((state: RootState) => state.unitsByUpdateTime);
  const loginId = useSelector((state: RootState) => state.auth.login_id);
  
  // Memoize the latest units array to prevent unnecessary re-renders
  const latest = useMemo(() => {
    return _.map(unitsByUpdateTime, (id) => units[id]);
  }, [unitsByUpdateTime, units]);

  const logout = () => {
    if (globalThis.confirm('Haluatko varmasti kirjautua ulos?')) {
      globalThis.localStorage.clear();
      globalThis.location.href = '/';
    }
  };

  const handleRetryImmediately = () => {
    const action = retryImmediately();
    dispatch(action as any);
  };

  const queueItems = _.map(items, (i, index) => {
    return (
      <Link className="list-group-item" to={`/unit/${i.unitId}`} key={`${i.unitId}-${index}`}>
        { units[i.unitId].name.fi }
      </Link>
    );
  });

  return (
    <div>
      <div className="row">
        <div className="col-xs-12">
          <p>Kirjautuminen <span className="text-muted">(ID: {loginId})</span></p>
          <button type="button" className="btn btn-default" onClick={logout}>Kirjaudu ulos</button>
        </div>
      </div>
      <hr />
      <div className="row">
        <div className="col-xs-12">
          <h5>Verkkoyhteyttä odottavat päivitykset<br/>
            <small>Näitä päivityksiä ei ole vielä julkaistu. Niitä yritetään julkaista uudestaan
                        automaattisesti 15 sekunnin välein sekä "Yritä uudelleen"-nappia painettaessa.</small>
          </h5>
          <div className="list-group facility-drilldown">
            { queueItems }

            {/*
                      <span className="action-icon glyphicon glyphicon-pencil"></span>
                        <span className="condition condition-nosnow icon water"></span>
                          Paloheinä 1,8 km
                        */}

          </div>
          <button type="button" onClick={handleRetryImmediately} className="btn btn-default btn-block"><span className="glyphicon glyphicon-refresh"></span> Yritä uudelleen</button>
        </div>
      </div>
      <LatestUpdates units={latest} />
    </div>
  );
};

export default UpdateQueue;