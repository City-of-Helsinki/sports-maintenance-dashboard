import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="facility-status">
      <div className="list-group facility-return clearfix">
        <Link to="/" className="list-group-item">
          <span className="action-icon glyphicon glyphicon-chevron-left"></span>
          {' '}Takaisin
        </Link>
      </div>
      <h4>404 - Sivua ei löytynyt</h4>
    </div>
  );
};

export default NotFound;
