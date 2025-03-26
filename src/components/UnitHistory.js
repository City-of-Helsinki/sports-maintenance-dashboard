import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { withRouter } from '../hooks';
import * as actions from '../actions/index';
import ObservationItem from './ObservationItem';

class UnitHistory extends React.Component {
  componentDidMount() {
    const { fetchUnitObservations, params } = this.props;
    const unitId = params.unitId;

    if (unitId) {
      fetchUnitObservations(unitId);
    }
  }

  renderObservations(observations) {
    return observations.map(obs => (
      <div key={obs.id} className="list-group-item">
        <ObservationItem observation={obs} />
      </div>
    ));
  }

  render() {
    const { unit, observations } = this.props;

    if (unit === undefined) {
      return <div>Ladataan...</div>;
    }

    return (
      <div className="row">
        <div className="col-xs-12">
            <div className="list-group facility-return clearfix">
                <Link to={`/unit/${unit.id}`} className="list-group-item">
                    <span className="action-icon glyphicon glyphicon-chevron-left"></span>
                    Takaisin
                </Link>
            </div>
            <div className="well">
                <h4>{ unit.name.fi }</h4>
            </div>
            <div className="unit-observations">
              <h4>Historia</h4>
              {observations && observations.length > 0 ? (
                <div className="list-group">
                  {this.renderObservations(observations)}
                </div>
              ) : (
                <p>Ei historiatietoja</p>
              )}
            </div>
        </div>
    </div>);
  }
}

function mapStateToProps({ data }, { params }) {
  const unitId = Number(params.unitId);
  const unit = data.unit[unitId];
  const observations = data.observation
    ? Object.values(data.observation).filter(obs => obs.unit === unitId)
    : [];

  return { unit, observations, params };
}

const mapDispatchToProps = {
  fetchUnitObservations: actions.fetchUnitObservations
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UnitHistory));
