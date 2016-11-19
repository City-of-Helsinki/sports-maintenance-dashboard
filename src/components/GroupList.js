import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

function GroupListElement (props) {
  console.log(props);
  const url = `/group/${props.id}`;
  return (
    <Link to={url} className="list-group-item">
      <span className="action-icon glyphicon glyphicon-chevron-right"></span>
      {props.name}
    </Link>
  );
}

class GroupList extends React.Component {
  render() {
    console.log(this.props.groups);
    const elements = _.map(this.props.groups, (group) => {
      return <GroupListElement key={group.id} {...group} />;
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
    groups: state.data.group
  };
};

export default connect(mapStateToProps, null)(GroupList);
