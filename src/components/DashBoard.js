import _ from 'lodash';
import React from 'react';

require('process');
const { SERVICES } = process.env;

import { Link } from 'react-router';
import { connect } from 'react-redux';

import { UnitListElement } from './UnitList';

class DashBoard extends React.Component {
  
  render() {
    if (this.props.nearest === undefined || this.props.frequent === undefined) {
      return <div>loading...</div>;
    }
    let nearest;
    if (this.props.userLocation === null) {
      nearest = <span>Sijainti ei saatavilla.</span>;
    }
    else {
      nearest = _.map(this.props.nearest, (u) => { return <UnitListElement key={u.id} {...u}/>; });
    }
    const frequent = _.map(this.props.frequent, (u) => { return <UnitListElement key={u.id} {...u}/>; });
    return (
      <div className="row">
          <div className="col-xs-12">
              <h5>Lähimmät</h5>
              <div className="list-group facility-drilldown">
                  { nearest }
              </div>
              <h5>Yleisimmät</h5>
              <div className="list-group facility-drilldown">
                  { frequent }
              </div>
          </div>
      </div>
    );
  }
}

function topUnits(n, units, unitsByUpdateCount) {
  return _.reverse(_.map(_.sortBy(unitsByUpdateCount, ['count']), (u) => {
    return units[u.id];
  }).slice(0, n));
}

function mapStateToProps(state) {
  if (_.keys(state.data.unit).length > 0) {
    return {
      nearest: _.map(state.data.unitsByDistance, (u) => {
        return state.data.unit[u.id];
      }),
      frequent: topUnits(20, state.data.unit, state.unitsByUpdateCount),
      userLocation: state.userLocation
    };
  }
  return {};
}

function mapDispatchToProps(dispatch) {
  return {};
}


export default connect(mapStateToProps, mapDispatchToProps)(DashBoard);
