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
          <hr/>
            <h5>Lassila - Kannelmäki - Keskuspuisto<br/><small>Päivitetty 7.10.2016 11:23</small></h5>
          <hr/>
        </div>
      </div>
      <div className="row">
        <div className="col-xs-12">
          <h6>Oletko varma että haluat muuttaa ladun statuksen?</h6>
        </div>
        <div className="col-xs-6">
          <Link to="/unit/1" className="btn btn-success btn-block active"><span className="fa fa-smile-o fa-lg"></span><br/>Hyvä</Link>
        </div>

        <div className="col-xs-6">
          <Link to="/unit/1" className="btn btn-warning btn-block"><span className="fa fa-frown-o fa-lg"></span><br/>Heikko</Link>
        </div>
      </div>
    </div>
  );
}
