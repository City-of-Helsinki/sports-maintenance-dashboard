import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';


export const withRouter = (Component) => {
  return (props) => {
    let location = useLocation();
    let navigate = useNavigate();
    let params = useParams();

    return <Component {...props} location={location} params={params} navigate={navigate} />
  };
};
