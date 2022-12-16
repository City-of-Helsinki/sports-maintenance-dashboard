import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { retryImmediately } from '../actions/index';
import { UnitListElement } from './UnitList';

function LatestUpdates({units}) {
  const elements = _.map(units, (u) => {
    return <UnitListElement key={u.id} {...u} />;
  });
  return (
    <div className="row">
        <div className="col-xs-12">
            <h5>Onnistuneet päivitykset<br/>
            <small>Tässä listassa on viimeisimmät onnistuneesti päivitetyt paikat</small></h5>
            <div className="list-group facility-drilldown">
            { elements }
            </div>
        </div>
    </div>
  );
}

class UpdateQueue extends React.Component {
  logout() {
    if (window.confirm('Haluatko varmasti kirjautua ulos?')) {
      window.localStorage.clear();
      window.location = '/';
    }
  }
  render() {
    const items = _.map(this.props.items, (i) => {
      return (<Link className="list-group-item" to={`/unit/${i.unitId}`} key={i.unitId}>{ this.props.units[i.unitId].name.fi }</Link>);
    });
    return (
      <div>
          <div className="row">
              <div className="col-xs-12">
                  <p>Kirjautuminen <span className="text-muted">(ID: {this.props.loginId})</span></p>
                  <a href="#!" className="btn btn-default" onClick={this.logout}>Kirjaudu ulos</a>
              </div>
          </div>
          <hr />
          <div className="row">
              <div className="col-xs-12">
                  <h5>Verkkoyhteyttä odottavat päivitykset<br/>
                      <small>Näitä päivityksiä ei ole vielä julkaistu. Niitä yritetään julkaista uudestaan
                          automaattisesti 15 sekunnin välein sekä "Yritä uudelleen"-nappia painettaessa.</small>
                  </h5>
                  <div className="list-group facility-drilldown">
                      { items }

                      {/*
                        <span className="action-icon glyphicon glyphicon-pencil"></span>
                          <span className="condition condition-nosnow icon water"></span>
                            Paloheinä 1,8 km
                          */}

                  </div>
                  <a onClick={this.props.retryImmediately} href ="#" className="btn btn-default btn-block"><span className="glyphicon glyphicon-refresh"></span> Yritä uudelleen</a>
              </div>
          </div>
          <LatestUpdates units={this.props.latest} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    items: state.updateQueue,
    units: state.data.unit,
    latest: _.map(state.unitsByUpdateTime, (id) => {
      return state.data.unit[id];
    }),
    loginId: state.auth.login_id
  };
}

function mapDispatchToProps(dispatch) {
  return {
    retryImmediately: () => {
      const action = retryImmediately();
      dispatch(action);
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateQueue);
