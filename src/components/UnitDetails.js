import React from 'react';
import { Link } from 'react-router';

export default function UnitDetails (props) {
  return (
    <div className="facility-status">
      <div className="row">
        <div className="col-xs-12">
          <div className="list-group facility-return clearfix">
            <Link to="group/1" className="list-group-item">
              <span className="action-icon glyphicon glyphicon-chevron-left"></span>
              Takaisin
            </Link>
          </div>
          <div className="well">
            <h4>Lassila - Kannelmäki - Keskuspuisto</h4>
            <div className="unit-status unit-status--good">hyvä</div>
            <h5><small>Todettu 7.10.2016 11:23</small><br/><small>Viimeksi kunnostettu 1.10.2016 08:32</small></h5>
          </div>
        </div>
      </div>
      <div className="panel panel-default">
        <div className="panel-heading">Päivitä paikan kuntotieto</div>
        <div className="panel-body">
          <div className="row">
            <div className="col-xs-6">
              <Link to="/unit/1/update/good" className="btn btn-success btn-block"><span className="fa fa-smile-o fa-lg"></span><br/>Hyvä</Link>
              <Link to="/unit/1/update/good" className="btn btn-success btn-block"><span className="fa fa-meh-o fa-lg"></span><br/>Tyydyttävä</Link>
              <Link to="/unit/1/update/good" className="btn btn-warning btn-block"><span className="fa fa-frown-o fa-lg"></span><br/>Heikko</Link>
              <Link to="/unit/1/update/good" className="btn btn-warning btn-block"><span className="fa fa-road fa-lg"></span><br/>Pohjattu</Link>
              <Link to="/unit/1/update/good" className="btn btn-warning btn-block"><span className="fa fa-pagelines fa-lg"></span><br/>Roskainen</Link>
            </div>

            <div className="col-xs-6">
              <Link to="/unit/1/update/good" className="btn btn-danger btn-block"><span className="fa fa-times-circle fa-lg"></span><br/>Suljettu</Link>
              <Link to="/unit/1/update/good" className="btn btn-danger btn-block"><span className="fa fa-tint fa-lg"></span><br/>Lumenpuute</Link>
              <Link to="/unit/1/update/good" className="btn btn-danger btn-block"><span className="fa fa-trophy fa-lg"></span><br/>Kilpailut</Link>
              <Link to="/unit/1/update/good" className="btn btn-danger btn-block"><span className="fa fa-spinner fa-lg"></span><br/>Lumetus</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="panel panel-default">
        <div className="panel-heading">Päivitä paikan kuntokuvaus</div>
        <div className="panel-body">
          <textarea className="form-control" rows="3" placeholder="Varokaa metsätöitä.">
          </textarea>
          <Link to="/unit/1" className="btn btn-primary btn-block">Päivitä kuvaus</Link>
        </div>
      </div>
    </div>
  );
}
