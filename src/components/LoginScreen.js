import _ from 'lodash';

import React from 'react';
import { Link, withRouter } from 'react-router';

import { connect } from 'react-redux';

import { selectServiceGroup, login } from '../actions/index';

class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {username: '', password: ''};
    this.handleChange = this.handleChange.bind(this);
  }
  onSelectGroup(e) {
    this.props.selectServiceGroup(e.target.value);
  }
  onSubmit(e) {
    e.preventDefault();
    this.props.login(this.state.username, this.state.password);
  }
  redirectIfLoggedIn(auth) {
    if (auth.token !== null && auth.token !== undefined) {
      this.props.router.push('/');
    }
  }
  componentWillMount() {
    this.redirectIfLoggedIn(this.props.auth);
  }
  componentWillReceiveProps(props) {
    this.redirectIfLoggedIn(props.auth);
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
    const { error } = this.props.auth;
    let errorMessage = null;
    if (error) {
      errorMessage = <span className="label label-danger">{ error.non_field_errors[0] }</span>;
    }
    return (
          <div className="row">
              <div className="col-xs-8 col-xs-offset-2">
                  <div className="panel panel-default">
                      <div className="panel-heading">
                          <h3 className="form-login-heading">Kirjaudu sisään</h3>
                      </div>
                      <div className="panel-body">
                          {errorMessage}
                          <form className="form-login" onSubmit={_.bind(this.onSubmit, this)}>
                              <input type="text" id="inputUsername" value={this.state.username} onChange={this.handleChange('username')} className="form-control input-lg" placeholder="käyttäjätunnus" required="" autoFocus="" />
                              <input type="password" id="inputPassword" value={this.state.password} onChange={this.handleChange('password')} className="form-control input-lg" placeholder="salasana" required="" />
                              {
                                  <div className="well">
                                        <h5>Vastuualue</h5>
                                          <div className="checkbox">
                                                <input id="ski" type="radio" value="skiing" name="service" onChange={_.bind(this.onSelectGroup, this)} checked={this.props.serviceGroup === 'skiing'} />
                                                  <label htmlFor="ski">
                                                        Hiihtoladut
                                                    </label>
                                            </div>
                                            <div className="checkbox">
                                                  <input id="ice-skate" type="radio" value="iceSkating" name="service" onChange={_.bind(this.onSelectGroup, this)} checked={this.props.serviceGroup === 'iceSkating'} />
                                                    <label htmlFor="ice-skate">
                                                          Luistelukentät
                                                      </label>
                                              </div>{/*
                                              <div className="checkbox">
                                                    <input id="swimming" type="radio" value="swimming" name="service" onChange={_.bind(this.onSelectGroup, this)} checked={this.props.serviceGroup === 'swimming'} />
                                                      <label htmlFor="swimming">
                                                            Uimarannat
                                                      </label>
                                              </div>*/}
                                    </div>
                                  }
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
  return { serviceGroup: state.serviceGroup, auth: state.auth };
}

function mapDispatchToProps(dispatch) {
  return { selectServiceGroup: (group) => { dispatch(selectServiceGroup(group)); },
         login: (userName, password) => { dispatch(login(userName, password)); }};
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(LoginScreen));
