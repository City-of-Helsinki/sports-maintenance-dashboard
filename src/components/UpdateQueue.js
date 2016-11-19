import React from 'react';
import { Link } from 'react-router';

export default function UpdateQueue (props) {
  return (
    <div className="row">
      <div className="col-xs-12">
        <h5>Verkkoyhteyttä odottavat päivitykset<br/><small>Näitä päivityksiä ei ole vielä julkaistu.</small></h5>
        <div className="list-group facility-drilldown">
            <Link to="/unit/1" className="list-group-item">
              <span className="action-icon glyphicon glyphicon-pencil"></span>
              <span className="condition condition-nosnow fa fa-tint"></span>
              Paloheinä 1,8 km
            </Link>
        </div>
        <a href ="#" className="btn btn-default btn-block"><span className="glyphicon glyphicon-refresh"></span> Yritä uudelleen</a>
      </div>
    </div>
  );
}
