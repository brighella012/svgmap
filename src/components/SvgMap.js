import React, { Component } from "react"
import ReactDOM from "react-dom"
import PropTypes from 'prop-types';
import { geoTimes } from "d3-geo-projection"
import { feature } from "topojson-client"
import {Motion, spring} from 'react-motion'
import request from 'axios'
import ReactTooltip from 'react-tooltip'
import mapStyle from '../utils/colorsConfig'
import TooltipLabel from './TooltipLabel'
import getShapeFromLocalMap from '../utils/getShapeFromLocalMap'
import hexToRGB from '../utils/hexToRGB'

import {
   ComposableMap,
   ZoomableGroup,
   Geographies,
   Geography,
} from "react-simple-maps"

class SvgMap extends Component {
   constructor(props) {
      super(props);
      this.resultsPath='/fakeresults/';
      this.state={
         label:'',
         loading:false,
         errorMsg:null,
         results:null,
         mapData:null,
         disableOptimization: false
      }
   }
   componentWillMount(){
      // add default style colors to shapes on mount
      const basicMap = this.props.mapData.map(shape=>{
         shape.shapeStyle = this.setBasicStyle(shape); 
         return shape;
      });
      this.setState({mapData : basicMap});
   }
   componentWillReceiveProps(nextProps){
      // on receiving updated results color shapes on map
      if(nextProps.results){
         // we have results data, so use them to color map!
         const coloredMap = this.state.mapData.map(shape=>{
            shape.shapeStyle = this.addColorToShape(shape, nextProps.results, nextProps.currentShape);
            shape.winner = this.getWinningList(shape, nextProps.results);
            return shape;
         })
         // save to state to re-render
         // we set disableOptimization to false to avoid wasteful repaint
            // but only after first colored render has occurred
            // see docs on https://github.com/zcreativelabs/react-simple-maps
         this.setState({disableOptimization:true},()=>{
            this.setState({mapData : coloredMap}, ()=>{
               this.setState({disableOptimization : false})
            })
         })
      }
      // reset tooltips on map zoom change
      ReactTooltip.hide();
      setTimeout(function(){
         ReactTooltip.rebuild();
      }, 0)
   }
   handleClick = shape => () => {
      // if valle d'aosta redirect to detail page
      if(shape.shapeId == 201 || 
         shape.shapeId == 2 || 
         shape.shapeId == '99999999' || 
         shape.shapeId == 'CU021_01' || 
         shape.shapeId == 'SU021_01'){
         location.href="https://www.ilfattoquotidiano.it/elezioni-politiche-2018/risultati/"+this.props.branch+"/circoscrizione/valle-daosta.html";
         return;
      }
      if(this.props.zoomLevel > 3) return; // we reached bottom
      // zoom only if current parent is different from actual parent
      const doZoom = !shape.parent || this.props.zoomLevel === 3 || shape.parent == this.props.currentShape;
      if(doZoom){
         this.props.zoomIn(shape);
      }else{
         const target = getShapeFromLocalMap(this.props.branch, this.props.zoomLevel, shape.parent);
         this.props.changeCoords(target, target.shapeCenterCoords, target.navigator)
      }
   }
   setBasicStyle(shape){
      var shapeState = this.checkIfShapeIsActive(shape) ? 'active' : 'normal';
      const style = mapStyle[this.props.mapType][shapeState];
      const styleObj = JSON.parse(JSON.stringify(style));
      return styleObj; 
   }
   addColorToShape(shape, results, parentId){
      const basicStyle = this.setBasicStyle(shape);
      const isDataAvailable = results[shape.shapeId] && results[shape.shapeId].risultati.length > 0;
      const isFirstResultUndefined = isDataAvailable ? isNaN(parseInt(results[shape.shapeId].risultati[0].perc)) : false;
      // if(this.props.mapType ==='circoscrizioni') return basicStyle;
      // color every shape with same parent or last clicked shape
      const doColor = isDataAvailable && (parentId == shape.parent || parentId == shape.shapeId ); // || !parentId
      this.setState({
         disableOptimization:true
      })
      if(doColor){ // && this.props.mapType==='uninominale'){
         // do not color if results are not yet defined
         if(isFirstResultUndefined) return basicStyle;
         const winner = results[shape.shapeId].risultati[0].id_coalizione;
         const winnerColor = hexToRGB(this.context.lists[winner].color, 0.9);
         basicStyle.default.fill=winnerColor;
         basicStyle.hover.fill=winnerColor;
         basicStyle.pressed.fill=winnerColor;
      }
      // light color inactive shapes
      else if(results[shape.shapeId]){
         // do not color if results are not yet defined
         if(!isDataAvailable) return basicStyle; 
         if(isFirstResultUndefined) return basicStyle
         const other = results[shape.shapeId].risultati[0].id_coalizione;
         const otherColor = hexToRGB(this.context.lists[other].color, 0.15);
         basicStyle.default.fill=otherColor;
         basicStyle.hover.fill=otherColor;
         basicStyle.pressed.fill=otherColor;
      }
      return basicStyle;
   }
   getWinningList(shape, results){
      return results[shape.shapeId] && results[shape.shapeId].risultati.length > 0 ? results[shape.shapeId].risultati[0].id_coalizione : null;
   }
   checkIfShapeIsActive(shape){
      const {zoomLevel, navigator} = this.props;
      // on zoom level 1 check for circoscrizioni
      if(zoomLevel === 1) return navigator.circoscrizione === shape.navigator.circoscrizione;
      // otherwise always return false
      return false;
   }
   setTooltipLabel(geo){
      this.setState({
         label: geo.label,
         winner: geo.winner
      })
   }
   isTooltipVisible(){
      // show tooltip if zoomlevel == map order (ie. we are seeing uppermost map)
      // or if zoom level >3 (always show tooltip on innermost map)
      return this.props.zoomLevel >= 3 || this.props.zoomLevel === this.props.order;
   }
   render() {
      return (
         <div className='svgWrapper'>
            <Motion style={{
               zoom: spring(this.props.zoomDetail),
               x: spring(this.props.zoomCoords[0]),
               y: spring(this.props.zoomCoords[1]),
            }}>
            {({zoom,x,y}) => ( 
            <ComposableMap width={600} height={700} projectionConfig={{scale:3600}}>
               <ZoomableGroup zoom={zoom} center={[x, y]} 
                  disablePanning={true}>
                  <Geographies geography={this.state.mapData} disableOptimization={this.state.disableOptimization}>
                  {(geos, proj) =>{
                     return(
                        geos.map((geo, i) => {
                           const isActive = this.checkIfShapeIsActive(geo);
                           return(
                              <Geography
                              isactive={isActive.toString()}
                              key={geo.shapeId}
                              cacheId={geo.shapeId}
                              geography={geo}
                              projection={proj}
                              onClick={this.handleClick(geo)}
                              onMouseEnter={()=>this.setTooltipLabel(geo)}
                              style={geo.shapeStyle}
                              data-tip
                              data-for='tooltipComponent'
                              />
                           )
                        })
                     )}
                  }
                  </Geographies>
               </ZoomableGroup>
            </ComposableMap>
            )}
            </Motion>
            {!this.props.isNarrowWidth && 
               // show tooltip on desktop only
               <ReactTooltip id="tooltipComponent" type="light" className="mapTooltip">
                  <TooltipLabel label={this.state.label} winner={this.state.winner} visible={this.isTooltipVisible()} />
               </ReactTooltip>
            }
         </div>
      )
   }
}
SvgMap.contextTypes = {
   lists: PropTypes.object
};
export default SvgMap;
