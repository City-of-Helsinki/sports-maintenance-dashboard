import React from 'react';

import { Link } from 'react-router';

export default function UnitList (props) {
return (
  <div className="row">
    <div className="col-xs-12">
      <div className="list-group facility-return">
        <Link to="/group" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-chevron-left"></span>
          Takaisin
        </Link>
      </div>
      <h5>Länsi</h5>
      <div className="list-group facility-drilldown">
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-nosnow fa fa-tint"></span>
          Paloheinä 1,8 km
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil">
          </span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Paloheinä 3 km
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Paloheinä 5 km
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-nosnow fa fa-tint"></span>
          Paloheinä 7,5 km
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Paloheinä peltolatu
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Paloheinä metsälatu
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Paloheinä vetokoiralatu
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Hakuninmaa rullasuksirata
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Pitkäkoski – Niskala
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Tuomarinkylän peltolatu
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Lassila – Kannelmäki – Keskuspuisto
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Pirkkola
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Pirkkola - Laakso
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Pirkkola – Pitkäkoski
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Tali
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Tali – Haaga – Pirkkola
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Maunulan kuntorata
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Taivaskallio – Tuomarinkartano - Paloheinä</Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Pukinmäki peltolatu
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Pitäjänmäki kuntorata
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Kannelmäki peltolatu
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Oulunkylä kuntorata
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Malminkartano
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Kaikki Keskuspuiston ladut
        </Link>
        <Link to="/unit/1" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-pencil"></span>
          <span className="condition condition-ok fa fa-meh-o"></span>
          Kaikki Paloheinän ladut (1.8, 3, 5, 7.5 km)
        </Link>
      </div>
    </div>
  </div>
  );
}
