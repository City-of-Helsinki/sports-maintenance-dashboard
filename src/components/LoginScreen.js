import _ from 'lodash';

import React from 'react';

import { connect } from 'react-redux';

import { selectServiceGroup, login } from '../actions/index';

import { withRouter } from '../hooks';

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
      this.props.navigate('/');
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
                              </div>
                              <div className="checkbox">
                                  <input id="swimming" type="radio" value="swimming" name="service" onChange={_.bind(this.onSelectGroup, this)} checked={this.props.serviceGroup === 'swimming'} />
                                  <label htmlFor="swimming">
                                      Uimarannat
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(LoginScreen));
