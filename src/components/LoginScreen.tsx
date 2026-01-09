/// <reference lib="dom" />
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { selectServiceGroup, login } from '../actions/index';
import * as constants from '../constants/index';
import { RootState, AuthState } from '../reducers/types';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  
  const serviceGroup = useSelector((state: RootState) => state.serviceGroup);
  const auth = useSelector((state: RootState) => state.auth);
  const authError = useSelector((state: RootState) => state.authError);

  const redirectIfLoggedIn = (auth: AuthState): void => {
    if (auth?.token) {
      navigate('/');
    }
  };

  useEffect(() => {
    redirectIfLoggedIn(auth);
  }, [auth, navigate]);

  const onSelectGroup = (e: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(selectServiceGroup(e.target.value));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    dispatch(login(username, password));
  };

  const handleChange = (field: 'username' | 'password') => {
    return (event: React.ChangeEvent<HTMLInputElement>): void => {
      const value = event.target.value;
      if (field === 'username') {
        setUsername(value);
      } else {
        setPassword(value);
      }
    };
  };

  localStorage.clear();
  const error = authError;
  let errorMessage: React.ReactElement | null = null;
    
  if (error) {
    let msg = 'Kirjautuminen epäonnistui. Tarkista tunnus ja salasana';
    if (error.message !== undefined) {
      msg = error.message;
    }
    else if (error.non_field_errors && error.non_field_errors.length > 0) {
      msg = error.non_field_errors[0];
    }
    errorMessage = <div className="alert alert-danger">{msg}</div>;
  }

  return (
    <div className="row">
      <div className="col-xs-10 col-xs-offset-1">
        <div className="panel panel-default login-panel">
          <div className="panel-heading">
            <img src="./img/pulkka-icon.png" className="app-icon" alt="Pulkka icon" />
            <h3 className="form-login-heading">PULKKA</h3>
          </div>
          <div className="panel-body">
            {errorMessage}
              Kirjaudu sisään
            <form className="form-login" onSubmit={onSubmit}>
              <div className="input-group input-group-lg">
                <input
                  type="text"
                  autoCapitalize="off"
                  id="inputUsername"
                  value={username}
                  onChange={handleChange('username')}
                  className="form-control"
                  placeholder="käyttäjätunnus"
                  required
                  autoFocus
                />
                <input
                  type="password"
                  id="inputPassword"
                  value={password}
                  onChange={handleChange('password')}
                  className="form-control"
                  placeholder="salasana"
                  required
                />
              </div>
              <div className="well">
                <h5>Vastuualue</h5>
                <div className="checkbox">
                  <input
                    id="ski"
                    type="radio"
                    value={constants.SERVICE_GROUPS.skiing.id}
                    name="service"
                    onChange={onSelectGroup}
                    checked={serviceGroup === constants.SERVICE_GROUPS.skiing.id}
                  />
                  <label htmlFor="ski">
                    {constants.SERVICE_GROUPS.skiing.title}
                  </label>
                </div>
                <div className="checkbox">
                  <input
                    id="ice-skate"
                    type="radio"
                    value={constants.SERVICE_GROUPS.iceSkating.id}
                    name="service"
                    onChange={onSelectGroup}
                    checked={serviceGroup === constants.SERVICE_GROUPS.iceSkating.id}
                  />
                  <label htmlFor="ice-skate">
                    {constants.SERVICE_GROUPS.iceSkating.title}
                  </label>
                </div>
                <div className="checkbox">
                  <input
                    id="swimming"
                    type="radio"
                    value={constants.SERVICE_GROUPS.swimming.id}
                    name="service"
                    onChange={onSelectGroup}
                    checked={serviceGroup === constants.SERVICE_GROUPS.swimming.id}
                  />
                  <label htmlFor="swimming">
                    {constants.SERVICE_GROUPS.swimming.title}
                  </label>
                </div>
                <div className="checkbox">
                  <input
                    id="sledding"
                    type="radio"
                    value={constants.SERVICE_GROUPS.sledding.id}
                    name="service"
                    onChange={onSelectGroup}
                    checked={serviceGroup === constants.SERVICE_GROUPS.sledding.id}
                  />
                  <label htmlFor="sledding">
                    {constants.SERVICE_GROUPS.sledding.title}
                  </label>
                </div>
              </div>
              <button className="btn btn-lg btn-primary btn-block" type="submit">
                  Kirjaudu
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;