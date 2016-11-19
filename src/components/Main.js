require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { fetchUnitsWithServices } from '../actions/index';

class AppComponent extends React.Component {
  componentWillMount() {
      this.props.fetchUnitsWithServices(
          [33483], {selected: ['id', 'name'], embedded: ['observations']});
  }
  render() {
    return (
      <div className="index">
        <nav className="navbar navbar-inverse navbar-fixed-top">
          <div className="container-fluid">
            <ul className="nav navbar-nav">
              <li><Link to="/"><div className="btn-lg"><span className="glyphicon glyphicon-home"></span></div></Link></li>
              <li><Link to="/group"><div className="btn-lg"><span className="glyphicon glyphicon-pencil"></span></div></Link></li>
              <li><Link to="/queue"><div className="btn-lg"><span className="glyphicon glyphicon-transfer"></span></div></Link></li>
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
  return { };
};

const mapDispatchToProps = (dispatch) => {
  return {
      fetchUnitsWithServices: (services, fieldSpecs) => {
          dispatch(fetchUnitsWithServices(services, fieldSpecs));
      }
  };
};

AppComponent.defaultProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(AppComponent);
