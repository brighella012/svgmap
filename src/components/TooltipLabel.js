import React, { Component } from 'react';
import Spinner from './Spinner';

const TooltipLabel = (props)=>{
   if(!props.visible || !props.label) return '';
   return (
      <div className="ttip">
         <h3>{props.label}</h3>  
         {/* {props.winner && <div><small>{props.winner}</small></div>}</h3> */}
      </div>
   )
}
export default TooltipLabel;
