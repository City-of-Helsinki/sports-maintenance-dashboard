import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { retryImmediately } from '../actions/index';

class UpdateQueue extends React.Component {
  render() {
    const items = _.map(this.props.items, (i) => {
      const js = JSON.stringify(i);
      return (<Link className="list-group-item" to={`/unit/${i.unitId}`} key={i.unitId}>{ this.props.units[i.unitId].name.fi }</Link>);
    });
    console.log(this.props.retryImmediately);
    return (
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
                <span className="condition condition-nosnow fa fa-tint"></span>
                Paloheinä 1,8 km
*/}

          </div>
          <a onClick={this.props.retryImmediately} href ="#" className="btn btn-default btn-block"><span className="glyphicon glyphicon-refresh"></span> Yritä uudelleen</a>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    items: state.updateQueue,
    units: state.data.unit
  };
}

function mapDispatchToProps(dispatch) {
  return {
    retryImmediately: () => {
      const action = retryImmediately();
      console.log(action);
      dispatch(action);
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateQueue);
