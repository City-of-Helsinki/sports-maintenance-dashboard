import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Link } from 'react-router';

import { statusBarClassName, getQualityObservation } from './utils';

const SHORT_DESCRIPTIONS = {
  ski_trail_maintenance: 'Kunnostettu',
  ski_trail_condition: 'Kunto todettu',
  swimming_water_temperature: 'Lämpötila todettu',
  swimming_water_algae: 'Levätilanne todettu',
  live_swimming_water_temperature: 'Automaattinen lämpötilamittaus'
};

function Observation (props) {
  const time = moment(props.time).format('dd l [klo] LTS');
  if (props.property == 'notice') {
    return (<div className="unit-observation-text">
            <small>Tekstitiedote julkaistu { time }</small><br/>
            <div className="notice-small"><small>"{ props.value.fi }"</small></div>
            </div>);
  }
  return <div className="unit-observation-text" ><small>{ SHORT_DESCRIPTIONS[props.property] }  <strong>{props.name ? props.name.fi : props.value.fi}</strong> { time }</small></div>;
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
            </div>
        </div>
    </div>);
}
