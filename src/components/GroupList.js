import React from 'react';
import { Link } from 'react-router';

export default function GroupList (props) {
  return (
      <div className="row">
        <div className="col-xs-12">
          <h5>Alueet</h5>
          <div className="list-group facility-drilldown">
            <Link to="/group/1" className="list-group-item">
              <span className="action-icon glyphicon glyphicon-chevron-right"></span>
              Itä
            </Link>
            <Link to="/group/1" className="list-group-item">
              <span className="action-icon glyphicon glyphicon-chevron-right"></span>
              Länsi
            </Link>
            <Link to="/group/1" className="list-group-item">
              <span className="action-icon glyphicon glyphicon-chevron-right"></span>
              Salmi
            </Link>
            <Link to="/group/1" className="list-group-item">
              <span className="action-icon glyphicon glyphicon-chevron-right"></span>
              Luukki
            </Link>
            <Link to="/group/1" className="list-group-item">
              <span className="action-icon glyphicon glyphicon-chevron-right"></span>
              Pirttimäki
            </Link>
          </div>
        </div>
      </div>
  );
}
