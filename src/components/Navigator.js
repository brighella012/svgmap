import React, { Component } from 'react';

class Navigator extends Component {
   constructor(){
      super();
   }
   componentWillReceiveProps(){
      this.setNavigationPosition();
   }
   setNavigationPosition(){
      // on mobile check if horizontal navigation overflows the screen
      // and reposition accordingly
      const screenWidth = this.navbar.clientWidth;
      const navWidth = this.navbar.scrollWidth;
      const overflow = this.navbar.scrollWidth - this.navbar.clientWidth;
      try{
         this.navbar.scrollBy(overflow, 0);
      }catch(e){}
   }
   render() {
      const {navBack, navigator, zoomLevel} = this.props;
      return(
         <div className="ep18-map-navigator" ref={(el)=>this.navbar=el}>
         {navigator.circoscrizione && 
         <span className='clickable' onClick={()=>navBack(0, navigator.circoscrizione)}> Circoscrizioni </span>
         }
         {navigator.circoscrizione && 
         <span> &rarr;&nbsp;
            <span 
               className={navigator.plurinominale && 'clickable'}  
               onClick={()=>navBack(zoomLevel === 1 ? 0 : zoomLevel-1, navigator.circoscrizione)}>
               {navigator.circoscrizione} 
            </span>
         </span>
         }
         {navigator.plurinominale && 
         <span> &rarr;&nbsp;  
            <span 
               className={navigator.uninominale && 'clickable'} 
               onClick={()=>navBack(zoomLevel === 2 ? 0 : zoomLevel-1, navigator.plurinominale)}>
               {navigator.plurinominale} 
            </span>
         </span>}
         {navigator.uninominale && 
         <span> &rarr;&nbsp;  
            <span onClick={()=>navBack(0, null)}>
               {navigator.uninominale} 
            </span>
         </span>
         }
      </div>
      )
   }
}

export default Navigator;
