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

const COLORS = {
  satisfactory: 'warning'
};

function Observation (props) {
  const observationOrAction = "Todettu";
  const time = moment(props.time).format('dd l [klo] LTS');
  return <div className="unit-observation-text" ><small>{ SHORT_DESCRIPTIONS[props.property] } { time }</small></div>;
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
                <Link to="/unit/1/update/good" className="btn btn-success btn-block"><span className="fa fa-smile-o fa-lg"></span><br/>Hyvä</Link>
                <Link to="/unit/1/update/good" className="btn btn-success btn-block"><span className="fa fa-meh-o fa-lg"></span><br/>Tyydyttävä</Link>
                <Link to="/unit/1/update/good" className="btn btn-warning btn-block"><span className="fa fa-frown-o fa-lg"></span><br/>Heikko</Link>
                <Link to="/unit/1/update/good" className="btn btn-warning btn-block"><span className="fa fa-road fa-lg"></span><br/>Pohjattu</Link>
                <Link to="/unit/1/update/good" className="btn btn-warning btn-block"><span className="fa fa-pagelines fa-lg"></span><br/>Roskainen</Link>
              </div>

              <div className="col-xs-6">
                <Link to="/unit/1/update/good" className="btn btn-danger btn-block"><span className="fa fa-times-circle fa-lg"></span><br/>Suljettu</Link>
                <Link to="/unit/1/update/good" className="btn btn-danger btn-block"><span className="fa fa-tint fa-lg"></span><br/>Lumenpuute</Link>
                <Link to="/unit/1/update/good" className="btn btn-danger btn-block"><span className="fa fa-trophy fa-lg"></span><br/>Kilpailut</Link>
                <Link to="/unit/1/update/good" className="btn btn-danger btn-block"><span className="fa fa-spinner fa-lg"></span><br/>Lumetus</Link>
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

function mapStateToProps(state, ownProps) {
  console.log('MAPSTATETOPROPS UNIT');
  const unit = state.data.unit[ownProps.params.unitId];
  const observableProperties = unitObservableProperties(unit, state.data.service);
  return {
    unit,
    observableProperties,
    observedQuality: getQualityObservation(unit)
  };
}

export default connect(mapStateToProps, null)(UnitDetails);
