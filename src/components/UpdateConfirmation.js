import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import UnitStatusSummary from './UnitStatusSummary';
import { COLORS, ICONS } from './utils';
import { unitObservableProperties } from '../lib/municipal-services-client';
import { withRouter } from '../hooks';

import * as actions from '../actions/index';

export const ACTION_TYPE = {
  observed: 'Todettu',
  serviced: 'Kunnostettu'
};

export const HELP_TEXTS = {
  observed: `Valitse "${ACTION_TYPE.observed}" jos liikuntapaikkaa ei ole juuri nyt kunnostettu, mutta haluat merkitä sen tilaksi`,
  serviced: `Valitse "${ACTION_TYPE.serviced}" jos liikuntapaikka on juuri kunnostettu, ja haluat samalla merkitä sen tilaksi`
};

function ConfirmButton({unitId, allowedValue, type, enqueueObservation}) {
  const iconClassName = `icon ${ICONS[allowedValue.identifier]}`;
  const buttonClassName = `btn btn-${COLORS[allowedValue.quality] || 'primary'} btn-block btn__confirmation`;
  return (
        <Link to={`/unit/${unitId}`} className={buttonClassName} onClick={() => { enqueueObservation(allowedValue.property, allowedValue, unitId, (type=='serviced')); }}>
            <h6>{ ACTION_TYPE[type] }</h6>
            <span className={iconClassName}></span><br/>
            { allowedValue.name.fi }
        </Link>
  );
}

export function canPropertyBeMaintained(property) {
  return property !== 'swimming_water_cyanobacteria';
}

class UpdateConfirmation extends React.Component {
  render () {
    if (this.props.unit === undefined || this.props.allowedValue === null) {
      return <div>Ladataan...</div>;
    }
    const quality = this.props.allowedValue.quality;
    let buttonRow, helpRow;
    if (canPropertyBeMaintained(this.props.allowedValue.property) &&
        (quality === 'good' ||
         quality == 'satisfactory' ||
         this.props.allowedValue.identifier == 'event')) {
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
          <UnitStatusSummary unit={this.props.unit} />
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
  return {
    enqueueObservation: (property, allowedValue, unitId, addServicedObservation) => {
      dispatch(actions.enqueueObservation(property, allowedValue, unitId, addServicedObservation));
    }
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UpdateConfirmation));
