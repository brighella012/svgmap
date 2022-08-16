import React from "react"
const Spinner = props => {
	return (
      props.enabled && 
      <div className="ep2018-spinner-wrapper">
         <div className="ep2018-map-spinner" />
         <div>...caricamento...</div>
      </div>
	);
};
export default Spinner;
