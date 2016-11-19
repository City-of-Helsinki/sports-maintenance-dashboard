import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import _ from 'lodash';


function styleClassFromObservations(observations) {
  // TODO move to utils
  return 'nosnow';
}

function UnitListElement (props) {
  const url = `/unit/${props.id}`;
  const {condition, color} = styleClassFromObservations(props.observations);
  const className = `condition condition-${condition} fa ${color} fa-tint`;
  return (
    <Link to={url} className="list-group-item">
        <span className="action-icon glyphicon glyphicon-pencil" />
        <span className={className} />
        { props.name.fi }
    </Link>
  );
}

class UnitList extends React.Component {
  render () {
    console.log(this.props);
    const elements = _.map(this.props.units, (unit) => {
      return <UnitListElement key={unit.id} {...unit} />;
    });
    return (
      <div className="row">
          <div className="col-xs-12">
              <div className="list-group facility-return">
                  <Link to="/group" className="list-group-item">
                      <span className="action-icon glyphicon glyphicon-chevron-left"></span>
                      Takaisin
                  </Link>
              </div>
              <h5>{this.props.name}</h5>
              <div className="list-group facility-drilldown">
                  { elements }
              </div>
          </div>
      </div>
    );
  }
}

function unitsForGroup(allUnits, group) {
  return _.reduce(group.units, (obj, id) => {
    obj[id] = allUnits[id];
    return obj;
  }, {});
}

function mapStateToProps(state, ownProps) {
  return {
    units: unitsForGroup(
      state.data.unit,
      state.data.group[ownProps.params.groupId])
  };
}

export default connect(mapStateToProps, null)(UnitList);
