import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import { statusBarClassName, getQualityObservation } from './utils';
import ObservationItem from './ObservationItem';
import { Unit } from '../types';

interface UnitStatusSummaryProps {
  unit: Unit;
}

export default function UnitStatusSummary({ unit }: UnitStatusSummaryProps): React.ReactElement {
  const observations = _.map(
    unit.observations,
    (obs) => <ObservationItem key={obs.id} observation={obs} />
  );

  const qualityObservation = getQualityObservation(unit);
  
  return (
    <div className="row">
        <div className="col-xs-12">
            <div className="list-group facility-return clearfix">
                <Link to="/" className="list-group-item">
                    <span className="action-icon glyphicon glyphicon-chevron-left"></span>
                    Takaisin
                </Link>
            </div>
            <div className="well">
                <h4>{ unit.name.fi }</h4>
                {qualityObservation && (
                  <div className={statusBarClassName(qualityObservation)}> { qualityObservation.name.fi } </div>
                )}
                <h5>
                    { observations }
                </h5>
                <Link to={`/unit/${unit.id}/history`} className="btn btn-default">Näytä historia</Link>
            </div>
        </div>
    </div>);
}