import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import UnitStatusSummary from './UnitStatusSummary';
import { withRouter } from '../hooks';

import * as actions from '../actions/index';

function ConfirmButton({unitId, clearObservation}) {
  const buttonClassName = 'btn btn-success btn-block';
  return (
        <Link to={`/unit/${unitId}`} className={buttonClassName} onClick={() => { clearObservation('notice', unitId); }}>
            <h5>Poista</h5>
        </Link>
  );
}

function TextualDescription({text}) {
  const lines = text.split('\n');
  return <div className="notice-large">{ _.map(lines, (l, idx) => { return <div key={`line-${idx}`} className="line">{l}</div>; })}</div>;
}

class UpdateConfirmation extends React.Component {
  render () {
    if (this.props.unit === undefined || this.props.allowedValue === null) {
      return <div>Ladataan...</div>;
    }
    let buttonRow, helpRow;
      buttonRow = (
        <div className="row">
            <div className="col-xs-12">
                <ConfirmButton unitId={this.props.unit.id} clearObservation={this.props.clearObservation} />
            </div>
        </div>);
      helpRow = null;
    const unitUrl = `/unit/${this.props.unit.id}`;
    return (
      <div className="facility-status">
          <UnitStatusSummary unit={this.props.unit} />
          <div className="panel panel-warning">
              <div className="panel-heading">
                  <h6>Oletko varma että haluat poistaa liikuntapaikalta seuraavan tekstitiedotteen?</h6>
              </div>
              <div className="panel-body">
                  <TextualDescription text={this.props.observation.value.fi}/>
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

function mapStateToProps(state, ownProps) {
  const unit = state.data.unit[ownProps.params.unitId];
  return {
    unit,
    property: ownProps.params.propertyId,
    observation: _.find(unit.observations, (o) => { return o.property === 'notice'; })
  };
}

function mapDispatchToProps(dispatch) {
  return {
    clearObservation: (property, unitId) => {
      dispatch(actions.enqueueObservation(property, null, unitId));
    }
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UpdateConfirmation));
