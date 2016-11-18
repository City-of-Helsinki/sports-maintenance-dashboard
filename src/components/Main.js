require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { fetchUser, fetchUsers } from '../actions/index';

class AppComponent extends React.Component {
  componentWillMount() {
  }
  render() {
    return (
      <div>
      <nav className="navbar navbar-inverse navbar-fixed-top">
        <div className="container-fluid">
          <div className="navbar-header">
            tähän navi-ikonit
          </div>
          <div>
          <Link to="/group">selaa...</Link>
          </div>
        </div>
      </nav>
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-7 hours-panel">
            {this.props.children}
          </div>
          <div className="col-sm-5 tasks-panel">
          </div>
        </div>
      </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return { };
};

const mapDispatchToProps = (dispatch) => {
  return {
  };
};

AppComponent.defaultProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(AppComponent);
