import _ from 'lodash';
import React from 'react';

require('process');
const { SERVICES } = process.env;

import { Link } from 'react-router';
import { connect } from 'react-redux';

import { UnitListElement } from './UnitList';

class DashBoard extends React.Component {
  
  render() {
    if (this.props.nearest === undefined || this.props.latest === undefined) {
      return <div>loading...</div>;
    }
    const nearest = _.map(this.props.nearest, (u) => { return <UnitListElement key={u.id} {...u}/>; });
    const latest = _.map(this.props.latest, (u) => { return <UnitListElement key={u.id} {...u}/>; });
    return (
      <div className="row">
          <div className="col-xs-12">
              <h5>Lähimmät</h5>
              <div className="list-group facility-drilldown">
                  { nearest }
              </div>
              <h5>Viimeisimmät</h5>
              <div className="list-group facility-drilldown">
                  { latest }
              </div>
          </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  if (_.keys(state.data.unit).length > 0) {
    return {
      nearest: _.map(state.data.unitsByDistance, (u) => {
        return state.data.unit[u.id];
      }),
      latest: [
        state.data.unit[2147483623],
        state.data.unit[2147483639],
        state.data.unit[2147483620]]
    };
  }
  return {};
}

function mapDispatchToProps(dispatch) {
  return {};
}


export default connect(mapStateToProps, mapDispatchToProps)(DashBoard);
