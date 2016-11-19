import React from 'react';

import { Link } from 'react-router';

export default function DashBoard () {
  return (
    <div className="row">
      <div className="col-xs-12">
        <h5>Lähimmät</h5>
        <div className="list-group facility-drilldown">
             <Link to="/unit/1" className="list-group-item">
              <span className="action-icon glyphicon glyphicon-pencil"></span>
              <span className="condition condition-nosnow fa fa-tint"></span>
              Paloheinä 1,8 km
            </Link>
             <Link to="/unit/1" className="list-group-item">
              <span className="action-icon glyphicon glyphicon-pencil">
              </span><span className="condition condition-ok fa fa-meh-o"></span>
              Paloheinä 3 km
            </Link>
             <Link to="/unit/1" className="list-group-item">
              <span className="action-icon glyphicon glyphicon-pencil"></span>
              <span className="condition condition-ok fa fa-meh-o"></span>
              Paloheinä 5 km
            </Link>
        </div>
        <h5>Viimeisimmät</h5>
        <div className="list-group facility-drilldown">
             <Link to="/unit/1" className="list-group-item">
              <span className="action-icon glyphicon glyphicon-pencil"></span>
              <span className="condition condition-ok fa fa-smile-o"></span>
              Paloheinä 1,8 km
            </Link>
             <Link to="/unit/1" className="list-group-item">
              <span className="action-icon glyphicon glyphicon-pencil">
              </span><span className="condition condition-ok fa fa-smile-o"></span>
              Paloheinä 3 km
            </Link>
             <Link to="/unit/1" className="list-group-item">
              <span className="action-icon glyphicon glyphicon-pencil"></span>
              <span className="condition condition-ok fa fa-smile-o"></span>
              Paloheinä 5 km
            </Link>
        </div>
      </div>
    </div>
  );
}
