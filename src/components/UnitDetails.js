import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import UnitStatusSummary from './UnitStatusSummary';
import { unitObservableProperties } from '../lib/municipal-services-client';
import { withRouter } from '../hooks';
import { enqueueObservation } from '../actions/index';

// Todettu - Viimeksi kunnostettu

import { COLORS, ICONS, QUALITIES } from './utils';

function ObservableProperty ({quality, property, identifier, name, unitId}) {
  const url = `/unit/${unitId}/update/${property}/${identifier}`;
  const color = COLORS[quality] || 'primary';
  const icon = ICONS[identifier];
  const buttonClassName = `btn btn-${color} btn-block btn__newstatus`;
  const iconClassName = `icon ${icon}`;
  return <Link to={url} className={buttonClassName}><span className={iconClassName}></span><br/>{name.fi}</Link>;
}

class DescriptiveStatusForm extends React.Component {
  onSubmit(ev) {
    this.props.enqueueObservation('notice', this.textarea.value, this.props.unitId);
    ev.preventDefault();
  }
  render() {
    let textualDescription = null;
    if (this.props.textualDescription !== undefined &&
        this.props.textualDescription.value !== undefined) {
      textualDescription = this.props.textualDescription.value.fi;
    }
    let deleteButton = <Link to={`/unit/${this.props.unitId}/delete/notice`} className="btn btn-danger btn-block">Poista kuvausteksti</Link>;
    if (this.props.textualDescription === undefined ||
        this.props.textualDescription.value === null) {
      deleteButton = null;
    }

    return (
      <div className="panel panel-default">
          <div className="panel-heading">Päivitä paikan kuntokuvaus</div>
          <div className="panel-body">
              <form id="descriptive-status-form" key={textualDescription} onSubmit={_.bind(this.onSubmit, this)}>
              <textarea
                   ref={(textarea) => this.textarea = textarea}
                   id="notice-value-fi"
                   className="form-control"
                   defaultValue={textualDescription}
                   rows="3"
                   placeholder="Kirjoita tähän suomen kielellä kuvaus paikan tilanteesta.">
              </textarea>
              <button type="submit" id="description-submit" className="btn btn-primary btn-block">Julkaise kuvausteksti</button>
              { deleteButton }
              </form>
          </div>
      </div>
    );
  }
}

function ObservablePropertyPanel({allowedValues, header}) {
  const amountOfValues = allowedValues.length;
  const cutPoint = (amountOfValues / 2) + (amountOfValues % 2);
  const left = allowedValues.slice(0, cutPoint);
  const right = allowedValues.slice(cutPoint, amountOfValues);
  return (
    <div className="panel panel-default">
        <div className="panel-heading">{ header }</div>
        <div className="panel-body">
            <div className="row">
                <div className="col-xs-6">
                    { left }
                </div>
                <div className="col-xs-6">
                    { right }
                </div>
            </div>
        </div>
    </div>
  );
}

class UnitDetails extends React.Component {
  hasRequiredData(props) {
    return (props.unit !== undefined);
  }
  render() {
    if (!this.hasRequiredData(this.props)) {
      return <div>Ladataan...</div>;
    }

    const panels = _.map(this.props.observableProperties, (property) => {
      let allowedValues = [];
      _.each (QUALITIES, (quality) => {
        allowedValues = allowedValues.concat(_.map(this.props.allowedValues[property.id][quality], (v) => {
          return <ObservableProperty key={v.identifier} {...v} unitId={this.props.unit.id} />;
        }));
      });
      const header = property.name ? property.name.fi : 'Kuntotilanne';
      return <ObservablePropertyPanel key={property.id} allowedValues={allowedValues} header={header}/>;
    });

    return (
      <div className="facility-status">
        <UnitStatusSummary unit={this.props.unit} />
        {this.props.observableProperties.length > 0 && panels}
        <DescriptiveStatusForm enqueueObservation={this.props.enqueueObservation} unitId={this.props.unit.id} textualDescription={this.props.textualDescription} />
      </div>
    );
  }
}

function allowedValuesByQuality(property) {
  let result = {};
  _.each(property.allowed_values, (value) => {
    value.property = property.id;
    result[value.quality] = result[value.quality] || [];
    result[value.quality].push(value);
  });
  return result;
}

function mapDispatchToProps(dispatch) {
  return {
    enqueueObservation: (property, allowedValue, unitId, addServicedObservation) => {
      dispatch(enqueueObservation(property, allowedValue, unitId, addServicedObservation));
    }
  };
}

function mapStateToProps(state, ownProps) {
  const unit = state.data.unit[ownProps.params.unitId];
  const onlyQualityProperties = state.serviceGroup !== 'swimming';
  const observableProperties = unitObservableProperties(unit, state.data.service, onlyQualityProperties);
  return {
    unit,
    observableProperties,
    allowedValues: _.fromPairs(_.map(observableProperties, (p) => { return [p.id, allowedValuesByQuality(p)]; })),
    textualDescription: _.find(unit.observations, (o) => { return o.property == 'notice'; })
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UnitDetails));
