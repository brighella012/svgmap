import React, { Component } from 'react';
import PropTypes from 'prop-types';
import request from 'axios';
import Spinner from './Spinner';

class ResultsProvider extends Component {
   constructor(props){
      super(props);
      this.state={
         loading:false,
         errorMsg:null,
         data:{
            camera:{},
            senato:{}
         }
      }
   }
   componentWillReceiveProps(newProps){
      if(   newProps.mapType && 
            !this.state.data[newProps.branch][newProps.mapType] &&
            !this.state.loading
      ){
         this.getResults(newProps.mapType, newProps.branch);
      }
   }
   getFilePath(mapType, branch){
      //const path = this.props.remotePath;
      const path = '../public/mapdata'
      
      switch(mapType){
         case 'plurinominale':
            var type = 'collegi-plurinominali';
         break;
         case 'uninominale':
            var type = 'collegi-uninominali';
         break;
         default:
            var type = mapType;
         break;
      }
      //return `${path}/${branch}/map_data/${type}.json`;
      return `${path}/${branch}/${type}.json`;

      
   }
   getResults(mapType, branch){
      if(this.state.data[branch][mapType]) return; // map already loaded
      this.setState({loading:true});
      const fileToLoad = this.getFilePath(mapType, branch);
      request.get(fileToLoad)
         .then((resp)=>{
         const resultsObj = {...this.state.data};
         resultsObj[branch][mapType] = resp.data;
         this.setState({
            loading: false,
            errorMsg:null,
            data: resultsObj
         })
      })
      .catch((error) => {
         const resultsObj={};
         resultsObj[branch][mapType] = error;
         this.setState({
            loading: false,
            errorMsg: error.toString(),
            data: resultsObj
         })
      });  
   }
   render() {
      return this.props.children(this.state)
   }
}
ResultsProvider.contextTypes = {
   lists: PropTypes.object
};
export default ResultsProvider;
