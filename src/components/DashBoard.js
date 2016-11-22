import React from 'react';

import { Link } from 'react-router';
import { connect } from 'react-redux';

import { UnitListElement } from './UnitList';

class DashBoard extends React.Component {
  
  render() {
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
  return {
    // TODO repla
    nearest: [
      state.data.unit[2147483616],
      state.data.unit[2147483637],
      state.data.unit[2147483612]],
    latest: [
      state.data.unit[2147483623],
      state.data.unit[2147483639],
      state.data.unit[2147483620]]
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}


export default connect(mapStateToProps, mapDispatchToProps)(DashBoard);
