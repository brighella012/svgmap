import React, { Component } from 'react';
import PropTypes from 'prop-types';
import request from 'axios';
import Spinner from './Spinner';
import NumberFormat from 'react-number-format';

class DistrictDetails extends Component {
   constructor(props){
      super(props);
      this.state={
         dataToRender:null,
         errorMsg: null
      }
   }
   componentWillReceiveProps(newProps){
      if(newProps.shapeId && newProps.shapeId !== this.props.shapeId){
         this.setState({dataToRender:null, errorMsg:null}); // clear data rendered
         const zoomLevel = newProps.zoomLevel-1;
         const mapType = this.props.mapsToLoad[zoomLevel]
         this.renderResults(newProps.shapeId, newProps.branch, mapType)
      }
   }
   renderResults(shapeId, branch, type){
      if(!this.props.results.data[branch][type]) return;
      const dataToShow = this.props.results.data[branch][type];
      if(dataToShow && dataToShow[shapeId]){
         // raw data loaded and shape results present
         const dataToRender = dataToShow[shapeId];
         this.setState({dataToRender, errorMsg: null})
      }else{
         // raw data loaded but shape results are missing
         this.setState({
            dataToRender: null,
            errorMsg : 'Riprova in seguito'
         })
      }
   }
   formatDate(date){
      var d = date+''; // convert number to string
      var Y = d.slice(0,4);
      var M = d.slice(4,6);
      var D = d.slice(6,8);
      var h = d.slice(8,10);
      var s = d.slice(10,12);
      return `${D}/${M}/${Y} ${h}:${s}`
   }
   render() {
      if(!this.props.visible) return '';
      return (
         <div className="district-details">
            <div className="district-header">
               <h3>{this.props.label}</h3>
               <div className="statistics">
                  <span>Pop. <strong>{this.props.properties.POP_2011}</strong></span>
                  {this.props.properties.SEGGI_PRO && 
                  <span> Seggi Proporzionali <strong>{this.props.properties.SEGGI_PRO}</strong></span>
                  }
                  {this.props.properties.SEGGI_UNI && 
                  <span>Seggi Uninominali <strong>{this.props.properties.SEGGI_UNI}</strong> </span>
                  }
               </div>
            </div>
            <div className="district-content">
            {this.state.dataToRender &&
               <div className="detailsContent">
                  {this.state.dataToRender.risultati.map((el, index)=>{
                     const listConfig = this.context.lists[el.id_coalizione];
                     // merge list config + actual results
                     const list = {...listConfig, ...el};
                     let picture = list.type==='lista' ? this.props.logoPath+list.liste[0].logo+'.png' : '';
                     return(
                        <table cellPadding="0" cellSpacing="0" key={el.id_coalizione+index} style={{backgroundColor: (index % 2 !== 0) ? '#f9f9f9' : '#fff'}}>
                           <tbody>
                           <tr className="candidate">
                              <td width="1%" className="list-logo">
                                 <div className="logo-wrapper" style={
                                    {'backgroundColor':`${list.color}`, 
                                    'backgroundImage': `url(${picture})`}}></div>
                              </td>
                              <td>
                                 {list.candidato_cognome &&(
                                    <span>
                                       <strong>{list.candidato_cognome}</strong>&nbsp;
                                       <small>{list.candidato_nome}</small><br />
                                    </span>  
                                 )}
                                 <small><strong>{list.label}</strong></small>
                              </td>
                              <td width="1%" className="percent"><strong>
                              
                              <NumberFormat value={list.perc} decimalSeparator={','} displayType={'text'} />
                              %</strong></td>
                              <td width="1%" className="votes">
                              <NumberFormat value={list.num_voti} decimalSeparator={','} thousandSeparator={'.'} displayType={'text'} />
                              </td>
                           </tr>
                           {list.type==='coalizione' &&
                           <React.Fragment>   
                              {list.liste.map((el, index)=>{
                                 const listConfig = this.context.lists[el.id_lista];
                                 const list = {...listConfig, ...el};
                                 
                                 return(
                                    <tr key={el.id_lista+index} className="innerTable">
                                       <td width="1%">
                                       </td>
                                       <td>
                                          {list.label}
                                       </td>
                                       <td width="1%" className="percent">
                                       <NumberFormat value={list.perc} decimalSeparator={','} displayType={'text'} />%
                                       </td>
                                       <td width="1%" className="votes">
                                       <NumberFormat value={list.num_voti} decimalSeparator={','} thousandSeparator={'.'} displayType={'text'} />
                                       </td>
                                    </tr>
                                 )
                              })}
                           </React.Fragment>  
                           }
                           </tbody>
                        </table>
                     )
                  })}
                  
               </div>
            }
            {this.state.errorMsg &&
               <div className="errorMsg">
                  <p><strong>Nessun dato disponibile</strong></p>
                  <small>{this.state.errorMsg}</small>
               </div>
            }
            </div>
            <div className="district-footer">
            {this.state.dataToRender &&
               <div className="footer">Ultimo aggiornamento:{this.formatDate(this.state.dataToRender.ultimo_aggiornamento)}</div>
            }
            </div>
         </div>
      );
   }
}
DistrictDetails.contextTypes = {
   lists: PropTypes.object
};
export default DistrictDetails;
