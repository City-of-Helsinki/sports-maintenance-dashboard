import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { enqueueObservation } from '../actions/index';

class UnitDescriptiveStatusForm extends React.Component {
  onSubmit(ev) {
    this.props.enqueueObservation('notice', this.textarea.value, this.props.unit.id);
    ev.preventDefault();
  }
  render() {
    const { unit } = this.props;

    const textualDescription = _.find(unit.observations, (o) => o.property == 'notice');

    let defaultValue = null;

    if (textualDescription !== undefined && textualDescription.value !== undefined) {
      defaultValue = textualDescription.value.fi;
    }

    let deleteButton = <Link to={`/unit/${this.props.unit.id}/delete/notice`} className="btn btn-danger btn-block">Poista kuvausteksti</Link>;

    if (textualDescription === undefined || textualDescription.value === null) {
      deleteButton = null;
    }

    return (
      <div className="panel panel-default">
        <div className="panel-heading">Päivitä paikan kuntokuvaus</div>
        <div className="panel-body">
          <form id="descriptive-status-form" key={defaultValue} onSubmit={_.bind(this.onSubmit, this)}>
            <textarea
              ref={(textarea) => this.textarea = textarea}
              id="notice-value-fi"
              className="form-control"
              defaultValue={defaultValue}
              rows="3"
              placeholder="Kirjoita tähän suomen kielellä kuvaus paikan tilanteesta.">
            </textarea>
            <button type="submit" id="description-submit" className="btn btn-primary btn-block">Julkaise kuvausteksti</button>
            {deleteButton}
          </form>
        </div>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    enqueueObservation: (property, allowedValue, unitId, addServicedObservation) => {
      dispatch(enqueueObservation(property, allowedValue, unitId, addServicedObservation));
    }
  };
}

export default connect(null, mapDispatchToProps)(UnitDescriptiveStatusForm);
