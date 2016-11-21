import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';

import { unitObservableProperties } from '../lib/municipal-services-client';

// Todettu - Viimeksi kunnostettu

const SHORT_DESCRIPTIONS = {
  ski_trail_maintenance: 'Kunnostettu',
  ski_trail_condition: 'Kunto todettu'
};

const QUALITIES = [
  'good', 'satisfactory', 'unusable'
];

const COLORS = {
  satisfactory: 'warning',
  unusable: 'danger',
  good: 'success'
};

const ICONS = {
  good: 'smile-o',
  satisfactory: 'meh-o',
  poor: 'frown-o',
  groomed: 'road',
  littered: 'pagelines',
  closed: 'times-circle',
  snowless: 'tint',
  event: 'trophy',
  snowmaking: 'spinner'
};

function Observation (props) {
  const observationOrAction = "Todettu";
  const time = moment(props.time).format('dd l [klo] LTS');
  return <div className="unit-observation-text" ><small>{ SHORT_DESCRIPTIONS[props.property] } { time }</small></div>;
}

function ObservableProperty ({quality, property, identifier, name, unitId}) {
  const url = `/unit/${unitId}/update/${property}/${identifier}`;
  const color = COLORS[quality];
  const icon = ICONS[identifier];
  const buttonClassName = `btn btn-${color} btn-block`;
  const iconClassName = `fa fa-lg fa-${icon}`;
  return <Link to={url} className={buttonClassName}><span className={iconClassName}></span><br/>{name.fi}</Link>;
}

class UnitDetails extends React.Component {
  hasRequiredData(props) {
    return (props.unit !== undefined &&
            props.observableProperties.length > 0 &&
            props.observedQuality !== undefined);
  }
  statusBarClassName(observation) {
    // TODO is label- class usage ok for non-label
    return `unit-status unit-status--${observation.quality} label-${COLORS[observation.quality]}`;
  }
  backLink() {
    return () => {
      this.props.history.goBack();
    };
  }
  render() {
    if (!this.hasRequiredData(this.props)) {
      return <div>Loading...</div>;
    }
    console.log(this.props);
    const observations = _.map(
      this.props.unit.observations,
      (obs) => { return <Observation key={obs.id} {...obs} />; }
    );
    let allowedValues = { };
    _.each (QUALITIES, (quality) => {
      allowedValues[quality] = _.map(this.props.allowedValues[quality], (v) => {
        return <ObservableProperty key={v.identifier} {...v} unitId={this.props.unit.id} />;
      });});
    return (
      <div className="facility-status">
        <div className="row">
          <div className="col-xs-12">
            <div className="list-group facility-return clearfix">
              <a onClick={this.backLink()} href="#!" className="list-group-item">
                <span className="action-icon glyphicon glyphicon-chevron-left"></span>
                Takaisin
              </a>
            </div>
            <div className="well">
              <h4>{ this.props.unit.name.fi }</h4>
              <div className={this.statusBarClassName(this.props.observedQuality)}> { this.props.observedQuality.name.fi } </div>
              <h5>
                  { observations }
              </h5>
            </div>
          </div>
        </div>
        <div className="panel panel-default">
          <div className="panel-heading">Päivitä paikan kuntotieto</div>
          <div className="panel-body">
            <div className="row">
              <div className="col-xs-6">
                { allowedValues.good }
                { allowedValues.satisfactory }
              </div>
              <div className="col-xs-6">
                { allowedValues.unusable }
              </div>
            </div>
          </div>
        </div>
        <div className="panel panel-default">
          <div className="panel-heading">Päivitä paikan kuntokuvaus</div>
          <div className="panel-body">
            <textarea className="form-control" rows="3" placeholder="Varokaa metsätöitä.">
            </textarea>
            <Link to="/unit/1" className="btn btn-primary btn-block">Päivitä kuvaus</Link>
          </div>
        </div>
      </div>
    );
  }
}

function getQualityObservation(unit) {
  if (unit === undefined) {
    return undefined;
  }
  const observations = unit.observations;
  return _.find(observations, (obs) => {
    console.log(obs);
    return (obs.quality !== null && obs.quality !== undefined && obs.quality !== 'unknown');
  });
}

function allowedValuesByQuality(observableProperties) {
  let result = {};
  _.each(observableProperties, (property) => {
    _.each(property.allowed_values, (value) => {
      value.property = property.id;
      result[value.quality] = result[value.quality] || [];
      result[value.quality].push(value);
    });
  });
  return result;
}

function mapStateToProps(state, ownProps) {
  console.log('MAPSTATETOPROPS UNIT');
  const unit = state.data.unit[ownProps.params.unitId];
  const observableProperties = unitObservableProperties(unit, state.data.service);
  return {
    unit,
    observableProperties,
    observedQuality: getQualityObservation(unit),
    allowedValues: allowedValuesByQuality(observableProperties)
  };
}

export default connect(mapStateToProps, null)(UnitDetails);
