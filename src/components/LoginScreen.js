import React from 'react';
import { Link } from 'react-router';

export default function LoginScreen (props) {
  return (
    <div className="row">
      <div className="col-xs-8 col-xs-offset-2">
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="form-login-heading">Kirjaudu sisään</h3>
          </div>
          <div className="panel-body">
            <form className="form-login">
              <input type="email" id="inputEmail" className="form-control input-lg" placeholder="käyttäjätunnus" required="" autofocus="" />
              <input type="password" id="inputPassword" className="form-control input-lg" placeholder="salasana" required="" />
              <div className="well">
                  <h5>Vastuualueet</h5>
                  <div className="checkbox">
                    <label>
                      <input type="checkbox" value="" />
                      Hiihtoladut
                    </label>
                  </div>
                  <div className="checkbox">
                    <label>
                      <input type="checkbox" value="" />
                      Luistelukentät
                    </label>
                  </div>
                  <div className="checkbox">
                    <label>
                      <input type="checkbox" value="" />
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
