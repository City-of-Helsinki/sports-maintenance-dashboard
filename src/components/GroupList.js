import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';
import { calculateGroups } from './utils';

function GroupListElement (props) {
  const url = `/group/${props.id}`;
  return (
    <Link to={url} className="list-group-item">
      <span className="action-icon glyphicon glyphicon-chevron-right"></span>
      {props.name}
    </Link>
  );
}

class GroupList extends React.Component {
  hasRequiredData(props) {
    return (props.groups && Object.keys(props.groups).length > 0);
  }
  render() {
    console.log(this.props.groups);
    if (!this.hasRequiredData(this.props)) {
      return <div>loading...</div>;
    }
    const elements = _.map(this.props.groups, (group, groupId) => {
      return <GroupListElement key={groupId} id={groupId} name={groupId} />;
    });
    return (
      <div className="row">
          <div className="col-xs-12">
              <h5>Alueet</h5>
              <div className="list-group facility-drilldown">
                  { elements }
              </div>
          </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    groups: calculateGroups(state.data.unit)
  };
};

export default connect(mapStateToProps, null)(GroupList);
