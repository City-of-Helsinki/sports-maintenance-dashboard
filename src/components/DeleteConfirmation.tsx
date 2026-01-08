import _ from 'lodash';
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import UnitStatusSummary from './UnitStatusSummary';
import { RootState } from '../reducers/types';

import * as actions from '../actions/index';

interface ConfirmButtonProps {
  unitId: number;
  clearObservation: (property: string, unitId: number) => void;
}

function ConfirmButton({ unitId, clearObservation }: ConfirmButtonProps): React.ReactElement {
  const buttonClassName = 'btn btn-success btn-block';
  return (
    <Link to={`/unit/${unitId}`} className={buttonClassName} onClick={() => { clearObservation('notice', unitId); }}>
      <h5>Poista</h5>
    </Link>
  );
}

interface TextualDescriptionProps {
  text: string;
}

function TextualDescription({ text }: TextualDescriptionProps): React.ReactElement {
  const lines = text.split('\n');
  return (
    <div className="notice-large">
      {_.map(lines, (l, idx) => {
        return <div key={`line-${idx}`} className="line">{l}</div>;
      })}
    </div>
  );
}

interface Params extends Record<string, string> {
  unitId: string;
  propertyId: string;
}

const DeleteConfirmation: React.FC = () => {
  const params = useParams<Params>();
  const dispatch = useDispatch();
  
  const unit = useSelector((state: RootState) =>
    params.unitId ? state.data.unit[Number(params.unitId)] : undefined
  );
  
  const isLoading = useSelector((state: RootState) => state.data.loading.unit === true);
  
  const observation = useMemo(() => {
    if (!unit || !unit.observations) return null;
    return _.find(unit.observations, (o) => { return o.property === 'notice'; }) || null;
  }, [unit]);

  const clearObservation = (property: string, unitId: number) => {
    dispatch((actions.enqueueObservation as any)(property, null, unitId));
  };

  if (isLoading) {
    return <div>Ladataan...</div>;
  }

  if (observation === null) {
    return <div>Tekstitiedotetta ei löydy</div>;
  }

  const buttonRow = (
    <div className="row">
      <div className="col-xs-12">
        <ConfirmButton unitId={unit.id} clearObservation={clearObservation} />
      </div>
    </div>
  );

  const unitUrl = `/unit/${unit.id}`;
  
  return (
    <div className="facility-status">
      <UnitStatusSummary unit={unit} />
      <div className="panel panel-warning">
        <div className="panel-heading">
          <h6>Oletko varma että haluat poistaa liikuntapaikalta seuraavan tekstitiedotteen?</h6>
        </div>
        <div className="panel-body">
          <TextualDescription text={observation.value.fi} />
          {buttonRow}
          <div className="row">
            <div className="col-xs-12">
              <br/>
              <Link to={unitUrl} className="btn btn-primary btn-block"><h5>Peruuta</h5></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;