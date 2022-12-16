import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import { getQualityObservation, ICONS } from './utils';
import { withRouter } from '../hooks';

export function UnitListElement (props) {
  const url = `/unit/${props.id}`;
  let iconClassName, badgeClassName;
  const qualityObservation = getQualityObservation(props);
  if (qualityObservation) {
    const iconClass = ICONS[qualityObservation.value];
    const condition = qualityObservation.quality;
    iconClassName = `icon ${iconClass}`;
    badgeClassName = `condition condition-${condition}`;
  }
  else {
    iconClassName = 'icon icon-question';
    badgeClassName = 'condition condition-unknown';
  }

  return (
    <Link to={url} className="list-group-item">
      <div className="unit-list-item">
        <div className={badgeClassName}><span className={iconClassName} /></div>
        <div className="unit-name">
          { props.name.fi }
        </div>
        <span className="action-icon icon icon-pencil-square" />
      </div>
    </Link>
  );
}

class UnitList extends React.Component {
  hasRequiredData(props) {
    return (props.units && Object.keys(props.units).length > 0);
  }
  render () {
    if (!this.hasRequiredData(this.props)) {
      return <div>Ladataan...</div>;
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

function mapStateToProps(state, ownProps) {
  return {
    units: _.filter(state.data.unit, (u) => {
      return (u.extensions.maintenance_group
              === ownProps.params.groupId);
    })
  };
}

export default withRouter(connect(mapStateToProps, null)(UnitList));
