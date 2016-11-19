import React from 'react';
import { Link } from 'react-router';

export default function UpdateConfirmation (props) {
  return (
    <div className="facility-status">
      <div className="row">
        <div className="col-xs-12">
          <div className="list-group facility-return clearfix">
            <Link href="/group/1" className="list-group-item">
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
