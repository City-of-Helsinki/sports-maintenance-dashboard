import React from 'react';
import moment from 'moment';

import { statusBarClassName, getQualityObservation } from './utils';

const SHORT_DESCRIPTIONS = {
  ski_trail_maintenance: 'Kunnostettu',
  ski_trail_condition: 'Kunto todettu'
};

function Observation (props) {
  const time = moment(props.time).format('dd l [klo] LTS');
  return <div className="unit-observation-text" ><small>{ SHORT_DESCRIPTIONS[props.property] } { time }</small></div>;
}

export default function UnitStatusSummary(props) {
  const observations = _.map(
    props.unit.observations,
    (obs) => { return <Observation key={obs.id} {...obs} />; }
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
                <a onClick={props.backLink} href="#!" className="list-group-item">
                    <span className="action-icon glyphicon glyphicon-chevron-left"></span>
                    Takaisin
                </a>
            </div>
            <div className="well">
                <h4>{ props.unit.name.fi }</h4>
                { qualityElement }
                <h5>
                    { observations }
                </h5>
            </div>
        </div>
    </div>);
}
