import React, { Component } from 'react';
import request from 'axios';
import Spinner from './Spinner';

class Tooltip extends Component {
   constructor(){
      super();
      this.state={
         loading:true,
         success:true,
         data:null
      }
   }
   componentWillMount(){
      this.getRemoteData();
   }
   componentWillReceiveProps(){
      this.getRemoteData();
   }
   getRemoteData(){
      this.setState({
         loading:true,
         success: true,
         data: null
      }, ()=>{
         
         const fakeReq = 'https://jsonplaceholder.typicode.com/posts/'+Math.ceil(Math.random()*100);
         request.get(fakeReq).then(res=>{
            this.setState({
               loading:false,
               success: true,
               data: res.data
            })
         }).catch(function(err) {
            this.setState({success: false})
         });
      })
   }
   showDetails(success){
      if(success){
         const tt = this.props;
         const remote = this.state.data || {};
         return(
            <table>
               <tbody>
                  <tr><td colSpan="2">{remote.title}</td></tr>
                  <tr><td colSpan="2">{remote.body}</td></tr>
                  <tr><th>Seggi Proporzionali</th><td>{tt.properties.SEGGI_PRO}</td></tr>
                  <tr><th>Seggi Uninominali</th><td>{tt.properties.SEGGI_UNI}</td></tr>
                  <tr><th>Popolazione</th><td>{tt.properties.POP_2011}</td></tr>
               </tbody>
            </table>
         )
      }else{
         return (
            <div>Si è verificato un problema, riprova in seguito</div>
         )
      }
   }
   render() {
      if(!this.props.visible || !this.props.label) return '';
      return (
         <div className="ttip">
            <h3>{this.props.label}</h3>
            {this.props.showDetails && 
               <div>
               <Spinner enabled={this.state.loading}/>
               {this.showDetails(this.state.success)}
               </div>
            }
         </div>
      );
   }
}

export default Tooltip;
