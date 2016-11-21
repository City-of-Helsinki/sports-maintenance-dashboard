import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import UnitStatusSummary from './UnitStatusSummary';

class UpdateConfirmation extends React.Component {
  render () {
    return (
      <div className="facility-status">
          <UnitStatusSummary unit={this.props.unit} />
          <div className="panel panel-warning">
              <div className="panel-heading">
                  <h6>Oletko varma että haluat päivittää paikan kuntotiedon?</h6>
              </div>
              <div className="panel-body">
                  <div className="row">
                      <div className="col-xs-6">
                          <Link to="/unit/1" className="btn btn-warning btn-block"><h5>Todettu</h5><span className="fa fa-frown-o fa-lg"></span><br/>Heikko</Link>
                      </div>
                      <div className="col-xs-6">
                          <Link to="/unit/1" className="btn btn-warning btn-block"><h5>Kunnostettu</h5><span className="fa fa-frown-o fa-lg"></span><br/>Heikko</Link>
                      </div>
                      <div className="col-xs-12">
                          <br/>
                          <Link to="/unit/1" className="btn btn-primary btn-block"><h5>Peruuta</h5></Link>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return { unit: state.data.unit[ownProps.params.unitId] };
}

function mapDispatchToProps(state) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateConfirmation);
