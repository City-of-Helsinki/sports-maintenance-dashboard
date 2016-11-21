import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { unitObservableProperties } from '../lib/municipal-services-client';
import UnitStatusSummary from './UnitStatusSummary';

// Todettu - Viimeksi kunnostettu

import { COLORS, ICONS, QUALITIES, backLink } from './utils';

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
            props.observableProperties.length > 0);
  }
  render() {
    if (!this.hasRequiredData(this.props)) {
      return <div>Loading...</div>;
    }
    console.log(this.props);
    let allowedValues = { };
    _.each (QUALITIES, (quality) => {
      allowedValues[quality] = _.map(this.props.allowedValues[quality], (v) => {
        return <ObservableProperty key={v.identifier} {...v} unitId={this.props.unit.id} />;
      });});
    return (
      <div className="facility-status">
        <UnitStatusSummary unit={this.props.unit} backLink={backLink(this)} />
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
    allowedValues: allowedValuesByQuality(observableProperties)
  };
}

export default connect(mapStateToProps, null)(UnitDetails);
