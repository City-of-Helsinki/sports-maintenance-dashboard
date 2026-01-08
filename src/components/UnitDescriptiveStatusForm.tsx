import _ from 'lodash';
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { enqueueObservation } from '../actions/index';
import { Unit, UnitObservation } from '../reducers/types';

interface UnitDescriptiveStatusFormProps {
  unit: Unit;
}

const UnitDescriptiveStatusForm: React.FC<UnitDescriptiveStatusFormProps> = ({ unit }) => {
  const dispatch = useDispatch();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onSubmit = (ev: React.FormEvent<HTMLFormElement>): void => {
    if (textareaRef.current) {
      dispatch(enqueueObservation('notice', textareaRef.current.value, unit.id) as any);
    }
    ev.preventDefault();
  };

  const textualDescription: UnitObservation | undefined = _.find(unit.observations, (o: UnitObservation) => o.property === 'notice');

  const defaultValue = textualDescription?.value?.fi ?? null;

  const deleteButton = textualDescription?.value ? (
    <Link to={`/unit/${unit.id}/delete/notice`} className="btn btn-danger btn-block">Poista kuvausteksti</Link>
  ) : null;

  return (
    <div className="panel panel-default">
      <div className="panel-heading">Päivitä paikan kuntokuvaus</div>
      <div className="panel-body">
        <form id="descriptive-status-form" key={defaultValue} onSubmit={onSubmit}>
          <textarea
            ref={textareaRef}
            id="notice-value-fi"
            className="form-control"
            defaultValue={defaultValue || ''}
            rows={3}
            placeholder="Kirjoita tähän suomen kielellä kuvaus paikan tilanteesta."
          />
          <button type="submit" id="description-submit" className="btn btn-primary btn-block">Julkaise kuvausteksti</button>
          {deleteButton}
        </form>
      </div>
    </div>
  );
};

export default UnitDescriptiveStatusForm;