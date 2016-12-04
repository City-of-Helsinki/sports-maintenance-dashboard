require('normalize.css/normalize.css');
require('styles/App.scss');

import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { fetchUnitsWithServices, fetchResource } from '../actions/index';

require('process');
const { SERVICES } = process.env;

class AppComponent extends React.Component {
  componentWillMount() {
    this.props.fetchResource(
      'service', { id: SERVICES },
      ['id', 'name'], ['observable_properties']
    );
    this.props.fetchUnitsWithServices(
      [SERVICES], {
        selected: ['id', 'name', 'services', 'location', 'extensions'],
        embedded: ['observations']});
  }
  render() {
    let queueClassName = `glyphicon glyphicon-transfer`;
    if (this.props.unsentUpdateCount > 0) {
      queueClassName += ' has-notifications';
    }
    return (
      <div className="index">
        <nav className="navbar navbar-inverse navbar-fixed-top">
          <div className="container-fluid">
            <ul className="nav navbar-nav">
              <li><Link to="/"><div className="btn-lg"><span className="glyphicon glyphicon-home"></span></div></Link></li>
              <li><Link to="/group"><div className="btn-lg"><span className="glyphicon glyphicon-pencil"></span></div></Link></li>
              <li>
                  <Link to="/queue">
                      <div className="btn-lg">
                          <span className={queueClassName}>
                              <span className="notification-count">{this.props.unsentUpdateCount}</span>
                          </span>
                      </div>
                  </Link>
              </li>
            </ul>
          </div>
        </nav>
          <div className="view-content container-fluid">
              {this.props.children}
          </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    unsentUpdateCount: _.size(state.updateQueue)
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchUnitsWithServices: (services, fieldSpecs) => {
      dispatch(fetchUnitsWithServices(services, fieldSpecs));
    },
    fetchResource: (resourceType, filters, selected, embedded) => {
      dispatch(fetchResource(resourceType, filters, selected, embedded));
    }
  };
};

AppComponent.defaultProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(AppComponent);
