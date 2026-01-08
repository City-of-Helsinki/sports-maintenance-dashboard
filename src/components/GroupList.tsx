import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import { calculateGroups } from './utils';
import { RootState } from '../reducers/types';

interface GroupListElementProps {
  id: string;
  name: string;
}

function GroupListElement({ id, name }: GroupListElementProps): React.ReactElement {
  const url = `/group/${id}`;
  return (
    <Link to={url} className="list-group-item">
      <span className="action-icon glyphicon glyphicon-chevron-right"></span>
      {name}
    </Link>
  );
}

interface Groups {
  [groupId: string]: any;
}

const GroupList: React.FC = () => {
  const groups = useSelector((state: RootState): Groups =>
    calculateGroups(state.data.unit, state.auth.maintenance_organization)
  );

  const hasRequiredData = (groups: Groups): boolean => {
    return (groups && Object.keys(groups).length > 0);
  };

  if (!hasRequiredData(groups)) {
    return <div>Ladataan...</div>;
  }

  const elements = _.map(groups, (group, groupId) => {
    return <GroupListElement key={groupId} id={groupId} name={groupId} />;
  });

  return (
    <div className="row">
      <div className="col-xs-12">
        <h5>Alueet</h5>
        <div className="list-group facility-drilldown">
          {elements}
        </div>
      </div>
    </div>
  );
};

export default GroupList;