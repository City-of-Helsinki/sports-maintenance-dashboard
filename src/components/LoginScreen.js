import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { selectServiceGroup, login } from '../actions/index';
import { withRouter } from '../hooks';
import * as constants from '../constants/index';
import PropTypes from 'prop-types';

class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {username: '', password: ''};
    this.handleChange = this.handleChange.bind(this);
    this.redirectIfLoggedIn(this.props.auth);
  }
  onSelectGroup(e) {
    this.props.selectServiceGroup(e.target.value);
  }
  onSubmit(e) {
    e.preventDefault();
    this.props.login(this.state.username, this.state.password);
  }
  redirectIfLoggedIn(auth) {
    if (auth?.token) {
      this.props.navigate('/');
    }
  }
  static getDerivedStateFromProps(nextProps) {
    if (nextProps?.auth?.token) {
      nextProps?.navigate('/');
    }
    return null;
 }
  handleChange(field) {
    return (event) => {
      this.setState(
        Object.assign(
          this.state,
          {[field]: event.target.value}
      ));
    };
  }
  render() {
    localStorage.clear();
    const error = this.props.authError;
    let errorMessage = null;
    if (error) {
      let msg = 'Kirjautuminen epäonnistui. Tarkista tunnus ja salasana';
      if (error.message !== undefined) {
        msg = error.message;
      }
      else if (error.non_field_errors && error.non_field_errors.length > 0) {
        msg = error.non_field_errors[0];
      }
      errorMessage = <div className="alert alert-danger">{ msg }</div>;
    }
    return (
      <div className="row">
          <div className="col-xs-10 col-xs-offset-1">
              <div className="panel panel-default login-panel">
                  <div className="panel-heading">
                      <img src="./img/pulkka-icon.png" className="app-icon"/>
                      <h3 className="form-login-heading">PULKKA</h3>
                  </div>
                  <div className="panel-body">
                      {errorMessage}
                      Kirjaudu sisään
                      <form className="form-login" onSubmit={_.bind(this.onSubmit, this)}>
                          <div className="input-group input-group-lg">
                              <input type="text" autoCapitalize="off" id="inputUsername" value={this.state.username} onChange={this.handleChange('username')} className="form-control" placeholder="käyttäjätunnus" required="" autoFocus=""/>
                              <input type="password" id="inputPassword" value={this.state.password} onChange={this.handleChange('password')} className="form-control" placeholder="salasana" required="" />
                          </div>
                          <div className="well">
                              <h5>Vastuualue</h5>
                              <div className="checkbox">
                                  <input id="ski" type="radio" value={constants.SERVICE_GROUPS.skiing.id} name="service" onChange={_.bind(this.onSelectGroup, this)} checked={this.props.serviceGroup === constants.SERVICE_GROUPS.skiing.id} />
                                  <label htmlFor="ski">
                                      {constants.SERVICE_GROUPS.skiing.title}
                                  </label>
                              </div>
                              <div className="checkbox">
                                  <input id="ice-skate" type="radio" value={constants.SERVICE_GROUPS.iceSkating.id} name="service" onChange={_.bind(this.onSelectGroup, this)} checked={this.props.serviceGroup === constants.SERVICE_GROUPS.iceSkating.id} />
                                  <label htmlFor="ice-skate">
                                      {constants.SERVICE_GROUPS.iceSkating.title}
                                  </label>
                              </div>
                              <div className="checkbox">
                                  <input id="swimming" type="radio" value={constants.SERVICE_GROUPS.swimming.id} name="service" onChange={_.bind(this.onSelectGroup, this)} checked={this.props.serviceGroup === constants.SERVICE_GROUPS.swimming.id} />
                                  <label htmlFor="swimming">
                                      {constants.SERVICE_GROUPS.swimming.title}
                                  </label>
                              </div>
                          </div>
                          <button className="btn btn-lg btn-primary btn-block" type="submit">Kirjaudu</button>
                      </form>
                  </div>
              </div>
          </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { serviceGroup: state.serviceGroup, auth: state.auth, authError: state.authError };
}

function mapDispatchToProps(dispatch) {
  return { selectServiceGroup: (group) => { dispatch(selectServiceGroup(group)); },
         login: (userName, password) => { dispatch(login(userName, password)); }};
}

LoginScreen.propTypes = {
  serviceGroup: PropTypes.string,
  auth: PropTypes.object,
  authError: PropTypes.object,
  navigate: PropTypes.func,
  selectServiceGroup: PropTypes.func,
  login: PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(LoginScreen));
