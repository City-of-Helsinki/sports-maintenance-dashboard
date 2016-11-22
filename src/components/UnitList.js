import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import _ from 'lodash';

import { getQualityObservation, COLORS, ICONS } from './utils';

function UnitListElement (props) {
  const url = `/unit/${props.id}`;
  const qualityObservation = getQualityObservation(props);
  const iconClass = ICONS[qualityObservation.value];
  let colorClass = COLORS[qualityObservation.quality];
  const condition = qualityObservation.quality;
  if (qualityObservation.value === 'snowless') {
    colorClass = 'info';
  }
  const className = `condition condition-${condition} fa text-${colorClass} fa-${iconClass}`;
  return (
    <Link to={url} className="list-group-item">
        <span className="action-icon glyphicon glyphicon-pencil" />
        <span className={className} />
        { props.name.fi }
    </Link>
  );
}

class UnitList extends React.Component {
  hasRequiredData(props) {
    console.log(props.units);
    return (props.units && Object.keys(props.units).length > 0);
  }
  render () {
    console.log(this.props);
    if (!this.hasRequiredData(this.props)) {
      return <div>loading...</div>;
    }
    const elements = _.map(_.sortBy(this.props.units, [(u) => { return u.name.fi }]), (unit) => {
      return <UnitListElement key={unit.id} {...unit} />;
    });
    return (
      <div className="row">
          <div className="col-xs-12">
              <div className="list-group facility-return">
                  <Link to="/group" className="list-group-item">
                      <span className="action-icon glyphicon glyphicon-chevron-left"></span>
                      Takaisin
                  </Link>
              </div>
              <h5>{this.props.name}</h5>
              <div className="list-group facility-drilldown">
                  { elements }
              </div>
          </div>
      </div>
    );
  }
}

function unitsForGroup(allUnits, group) {
  if (group === undefined) {
    return undefined;
  }
  return _.reduce(group.units, (obj, id) => {
    if (allUnits[id] === undefined) {
      return {};
    }
    obj[id] = allUnits[id];
    return obj;
  }, {});
}

function mapStateToProps(state, ownProps) {
  console.log('mapStateToProps');
  return {
    units: unitsForGroup(
      state.data.unit,
      state.data.group[ownProps.params.groupId])
  };
}

export default connect(mapStateToProps, null)(UnitList);
