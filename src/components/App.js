import '../interactiveMap.css'
import React, { Component } from "react"
import PropTypes from 'prop-types'
import request from "axios"   
import Maps from './Maps';
import {Ep2018ListConfig} from '../../public/ep2018_listconfig.js';
class App extends Component {
   constructor(props){
      super(props);
      this.branches = [
         {id:'camera', title:'Camera dei Deputati', tabLabel:'Camera'},
         {id:'senato', title:'Senato della Repubblica', tabLabel:'Senato'}
      ]
      this.state={
         activeBranch:null,
         title:'',
         enableToggle:false,
         width: window.innerWidth
      }
   }
   getChildContext() {
      return {
         lists: Ep2018ListConfig
      };
   }
   componentWillMount() {
      window.addEventListener('resize', this.handleWindowSizeChange);
   }
   componentWillUnmount() {
      window.removeEventListener('resize', this.handleWindowSizeChange);
   }
   componentDidMount(){
      // setup app wrapper
      const title = this.props.branch === 'senato' ? this.branches[1].title : this.branches[0].title;
      const enableToggle = this.props.enableToggle ? true : false;
      this.setState({
         activeBranch: this.props.branch || 'camera',
         title,
         enableToggle
      })
   }
   toggleBranch(isTabActive){
      if(!isTabActive){
         this.setState(()=>{
            const isCamera = this.state.activeBranch === 'camera'; 
            return {
               activeBranch : isCamera ? this.branches[1].id : this.branches[0].id,
               title : isCamera ? this.branches[1].title : this.branches[0].title
            }
         })
      }
   }
   renderToggle(){
      if(this.state.enableToggle){
         const {activeBranch, title} = this.state;
         return (
            <div className="toogleBranch">
               {this.branches.map( branch => {
                  const isTabActive = activeBranch === branch.id;
                  return(
                     <span 
                     key={branch.id} 
                     className={isTabActive ? 'toggleTab active' : 'toggleTab'}
                     onClick={()=>this.toggleBranch(isTabActive)}>
                     {branch.title}
                     </span>
                  )}
               )}
            </div>
         )
      }else{
         return <h2>{this.state.title}</h2>
      }
   }
   handleWindowSizeChange = () => {
      this.setState({ width: window.innerWidth });
   };
   render() {
      return (
         <div className="ep2018-interactive-map ep18im">
            {this.renderToggle()}
            {this.state.activeBranch && 
            <Maps 
               branch={this.state.activeBranch}
               remotePath={this.props.path}
               mapPath={this.props.mapPath}
               logoPath={this.props.logoPath}
               isNarrowWidth={this.state.width<=700}
            />
            }
         </div>
      );
   }
}
App.childContextTypes = {
   lists: PropTypes.object
};
export default App;
