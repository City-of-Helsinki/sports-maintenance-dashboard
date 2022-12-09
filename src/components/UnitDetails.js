import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import UnitStatusSummary from './UnitStatusSummary';
import UnitDescriptiveStatusForm from './UnitDescriptiveStatusForm';
import { unitObservableProperties } from '../lib/municipal-services-client';
import { withRouter } from '../hooks';

import { COLORS, ICONS, QUALITIES } from './utils';

function ObservableProperty ({quality, property, identifier, name, unitId}) {
  const url = `/unit/${unitId}/update/${property}/${identifier}`;
  const color = COLORS[quality] || 'primary';
  const icon = ICONS[identifier];
  const buttonClassName = `btn btn-${color} btn-block btn__newstatus`;
  const iconClassName = `icon ${icon}`;
  return <Link to={url} className={buttonClassName}><span className={iconClassName}></span><br />{name.fi}</Link>;
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
  render() {
    const { allowedValues, observableProperties, unit } = this.props;

    if (unit === undefined) {
      return <div>Ladataan...</div>;
    }

    const panels = _.map(observableProperties, (property) => {
      let values = [];
      _.each (QUALITIES, (quality) => {
        values = values.concat(_.map(allowedValues[property.id][quality], (v) => {
          return <ObservableProperty key={v.identifier} {...v} unitId={unit.id} />;
        }));
      });
      const header = property.name ? property.name.fi : 'Kuntotilanne';
      return <ObservablePropertyPanel key={property.id} allowedValues={values} header={header}/>;
    });

    return (
      <div className="facility-status">
        <UnitStatusSummary unit={unit} />
        {observableProperties.length > 0 && panels}
        <UnitDescriptiveStatusForm unit={unit} />
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

function mapStateToProps(state, ownProps) {
  const unit = state.data.unit[ownProps.params.unitId];
  const onlyQualityProperties = state.serviceGroup !== 'swimming';
  const observableProperties = unitObservableProperties(unit, state.data.service, onlyQualityProperties);
  return {
    unit,
    observableProperties,
    allowedValues: _.fromPairs(_.map(observableProperties, (p) => { return [p.id, allowedValuesByQuality(p)]; }))
  };
}

export default withRouter(connect(mapStateToProps, null)(UnitDetails));
