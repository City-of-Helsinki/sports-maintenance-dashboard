import React from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import { statusBarClassName, getQualityObservation } from './utils';
import ObservationItem from './ObservationItem';


export function Observation(props) {
  return <ObservationItem observation={props} />;
}

export default function UnitStatusSummary(props) {
  const observations = _.map(
    props.unit.observations,
    (obs) => <Observation key={obs.id} {...obs} />
  );
  const qualityObservation = getQualityObservation(props.unit);
  let qualityElement = null;
  if (qualityObservation) {
    qualityElement = <div className={statusBarClassName(qualityObservation)}> { qualityObservation.name.fi } </div>;
  }
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
                <h4>{ props.unit.name.fi }</h4>
                { qualityElement }
                <h5>
                    { observations }
                </h5>
                <Link to={`/unit/${props.unit.id}/history`} className="btn btn-default">Näytä historia</Link>
            </div>
        </div>
    </div>);
}
