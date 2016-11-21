import React from 'react';
import { Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';

import UnitStatusSummary from './UnitStatusSummary';
import { COLORS, ICONS, backLink } from './utils';
import { unitObservableProperties } from '../lib/municipal-services-client';

import * as actions from '../actions/index';

const ACTION_TYPE = {
  observed: 'Todettu',
  serviced: 'Kunnostettu'
};

const HELP_TEXTS = {
  observed: `Valitse "${ACTION_TYPE.observed}" jos liikuntapaikkaa ei ole juuri nyt kunnostettu, mutta haluat merkitä sen tilaksi`,
  serviced: `Valitse "${ACTION_TYPE.serviced}" jos liikuntapaikka on juuri kunnostettu, ja haluat samalla merkitä sen tilaksi`
};

function ConfirmButton({unitId, allowedValue, type, enqueueObservation}) {
  const iconClassName = `fa fa-${ICONS[allowedValue.identifier]} fa-lg`;
  const buttonClassName = `btn btn-${COLORS[allowedValue.quality]} btn-block`;
  console.log(allowedValue);
  return (
        <div className={buttonClassName} onClick={() => { enqueueObservation(allowedValue.property, allowedValue, unitId, (type=='serviced')); }}>
            <h5>{ ACTION_TYPE[type] }</h5>
            <span className={iconClassName}></span><br/>
            { allowedValue.name.fi }
        </div>
  );
};

class UpdateConfirmation extends React.Component {
  render () {
    if (this.props.unit === undefined || this.props.allowedValue === null) {
      return <div>loading...</div>;
    }
    const quality = this.props.allowedValue.quality;
    let buttonRow, helpRow;
    if (quality === 'good' || quality == 'satisfactory' || this.props.allowedValue.identifier == 'event') {
      buttonRow = (
        <div className="row">
            <div className="col-xs-6">
                <ConfirmButton type='observed' unitId={this.props.unit.id} allowedValue={this.props.allowedValue} enqueueObservation={this.props.enqueueObservation} />
            </div>
            <div className="col-xs-6">
                <ConfirmButton type='serviced' unitId={this.props.unit.id} allowedValue={this.props.allowedValue} enqueueObservation={this.props.enqueueObservation} />
            </div>
        </div>
      );
      helpRow = (
        <div className="row">
            <div className="col-xs-6">
                <p className="help-block"><small>{ HELP_TEXTS.observed } "{this.props.allowedValue.name.fi}".</small></p>
            </div>
            <div className="col-xs-6">
                <p className="help-block"><small>{ HELP_TEXTS.serviced } "{this.props.allowedValue.name.fi}".</small></p>
            </div>
        </div>
      );
    }
    else {
      buttonRow = (
        <div className="row">
            <div className="col-xs-12">
                <ConfirmButton type='observed' unitId={this.props.unit.id} allowedValue={this.props.allowedValue} enqueueObservation={this.props.enqueueObservation} />
            </div>
        </div>);
      helpRow = null;
    }
    const unitUrl = `/unit/${this.props.unit.id}`;
    return (
      <div className="facility-status">
          <UnitStatusSummary unit={this.props.unit} backLink={backLink(this)} />
          <div className="panel panel-warning">
              <div className="panel-heading">
                  <h6>Oletko varma että haluat päivittää paikan kuntotiedon?</h6>
              </div>
              <div className="panel-body">
                  { buttonRow }
                  <div className="row">
                      <div className="col-xs-12">
                          <br/>
                          <Link to={unitUrl} className="btn btn-primary btn-block"><h5>Peruuta</h5></Link>
                      </div>
                  </div>
                  { helpRow }
              </div>
          </div>
      </div>
    );
  }
}

function allowedValue(properties, {propertyId, valueId}) {
  if (properties.length == 0) {
    return null;
  }
  const property = _.find(properties, (p) => { return p.id == propertyId; });
  return _.find(property.allowed_values, (value) => {
    value.property = property.id;
    return (value.identifier == valueId);
  });
}

function mapStateToProps(state, ownProps) {
  const unit = state.data.unit[ownProps.params.unitId];
  return {
    unit,
    allowedValue:
    allowedValue(
      unitObservableProperties(unit, state.data.service), ownProps.params)
  };
}

function mapDispatchToProps(dispatch) {
  console.log(actions);
  return {
    enqueueObservation: (property, allowedValue, unitId, addServicedObservation) => {
      dispatch(actions.enqueueObservation(property, allowedValue, unitId, addServicedObservation));
      browserHistory.push(`/unit/${unitId}`);
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateConfirmation);
