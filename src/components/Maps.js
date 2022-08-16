import React, { Component } from "react"
import request from "axios"
import { geoMercator, geoPath, geoCentroid } from "d3-geo"
import { geoTimes } from "d3-geo-projection"
import { feature } from "topojson-client"
import {Motion, spring} from 'react-motion'
import DistrictDetails from './DistrictDetails';
import Navigator from './Navigator';
import Spinner from './Spinner';
import SvgMap from './SvgMap';
import ResultsProvider from './ResultsProvider';
import getShapeFromLocalMap from '../utils/getShapeFromLocalMap';
class Maps extends Component {
   constructor(props){
      super(props);
      this.changeType = this.changeType.bind(this);
      // mapsToLoad order is important, from innermost to outermost!
      this.mapsToLoad = ['circoscrizioni', 'plurinominale', 'uninominale'];
      this.defaultCoords = [12.338021942602374,41.84718933156246];
      //this.parentConfigPath = props.remotePath+'/static/json';
      //this.parentConfigPath = '/wp-content/themes/ifq-2019/_build/elezioni/svgmap/public/mapdata/';
      this.parentConfigPath = props.remotePath+'/public/mapdata/';
      this.maxZoomLevel = 2;
      this.initConfig={
         loading:true,
         zoomLevel:0,
         zoomDetail:1,
         zoomCoords:this.defaultCoords,
         mapsToRender:[],
         navigator:{},
         geo:null,
         errorMsg:null
      }
      this.state=this.initConfig;
   }
   componentDidMount(){
      this.appInit(this.props.branch);
   }
   componentWillReceiveProps(newProps){
      // reset everything to initial state and re-init app
      if(newProps.branch !== this.props.branch){
         this.setState(this.initConfig);
         this.appInit(newProps.branch);
      }
   }
   appInit(branch){
      let mapData = [];
      // get all maps as promises, either via localstorage if present or via ajax
      this.mapsToLoad.forEach((map, index)=>{
         const storageKey = `ep18-${map}-${branch}`;
         const isMapInLocalstorage = localStorage.getItem(storageKey);
         let mapPromise = isMapInLocalstorage ? 
            this.getMapFromLocalStorage(storageKey) : 
            this.getMapViaAjax(branch, map, storageKey, index);
         mapData.push(mapPromise);
      })
      Promise.all(mapData).then(mapDataArray=>{
         // cant be sure about ordering of returning array 
         // so sort by order property to show map from innermost to outermost
         // in our render function 
         const mapsToRender = mapDataArray.sort((a, b) => b.order - a.order);
         // all maps retrieved and formatted, so save to state and let's go ...
         this.setState({mapsToRender});
         this.hideSpinner();
         this.notificateAmpIframe();
      })
   }
   getMapFromLocalStorage(key){
      // retrieve formatted map data from localstorage as promise
      return new Promise((resolve, reject)=>{
         const mapInLocalStorage = localStorage.getItem(key);
         resolve(JSON.parse(mapInLocalStorage));
      })
   }
   getMapViaAjax(branch, map, storageKey, index){
      // load config files with parent id for every shape (not for circoscrizioni. They dont have parents!)
      let fileName;
      if(map === 'plurinominale') fileName = 'pluri_to_circoscrizione';
      if(map === 'uninominale') fileName = 'uni_to_pluri';
      //let configPath = `${this.parentConfigPath}/${fileName}_${branch}.json`;
      let configPath = `${this.parentConfigPath}/${branch}/${fileName}.json`;
      // resolve promise with formatted map data and save in localstorage for repeated views
      return new Promise((resolve, reject)=>{
         //const getMap = ()=> request.get(this.props.mapPath+'/'+map+'_'+branch+'.json');
         const getMap = ()=> request.get(this.props.mapPath +'/'+branch+'/'+map+'.json');
         const getShapeParents = ()=> map!=='circoscrizioni' ? request.get(configPath): {data:''};
         request.all([getMap(), getShapeParents()]).then(request.spread((resp, parents)=>{
            const formattedData = this.formatMapData(resp.data, parents.data, branch);
            const mapObj = {
               order: index,
               mapType : map,
               mapData : formattedData
            }
            const storageItem = JSON.stringify(mapObj);
            localStorage.setItem(storageKey, storageItem);
            resolve(mapObj);
         }))
      })
   }
   formatMapData(rawData, parentsData, branch){
      // preprocess raw map data before saving
      const mapType=Object.keys(rawData.objects)[0];
      const features = feature(rawData, rawData.objects[Object.keys(rawData.objects)[0]]).features;
      const shapes = features.map(feat=>{
         // get shape center coordinates
         feat.shapeCenterCoords= geoCentroid(feat);
         switch(mapType){
            case 'circoscrizioni_camera':
               // additional clean circ. camera xx_abc... --> abc...
               feat.shapeId=feat.properties.CIRCO17_C;
               feat.label=feat.properties.CIRCO17_D.replace(/^\d{1,2}_/g, '');
               feat.navigator={
                  circoscrizione:feat.properties.CIRCO17_D.replace(/^\d{1,2}_/g, ''),
                  plurinominale:null,
                  uninominale:null
               }
            break;
            case 'circoscrizioni_senato':
               feat.shapeId=feat.properties.COD_REG;
               feat.label=feat.properties.REGIONE;
               feat.navigator={
                  circoscrizione:feat.properties.REGIONE,
                  plurinominale:null,
                  uninominale:null
               }
            break;
            case 'plurinominale_camera':
               feat.shapeId=feat.properties.CAM17P_COD;
               feat.label=feat.properties.CAM17P_DEN;
               feat.navigator={
                  circoscrizione:feat.properties.CAM17P_DEN.replace(/\s{0,1}-\s{0,1}(\d{1,2})/g, ''),
                  plurinominale:feat.properties.CAM17P_DEN,
                  uninominale:null
               }
            break;
            case 'plurinominale_senato':
               feat.shapeId=feat.properties.SEN17P_COD;
               feat.label=feat.properties.SEN17P_DEN;
               feat.navigator={
                  circoscrizione:feat.properties.SEN17P_DEN.replace(/\s{0,1}-\s{0,1}(\d{1,2})/g, ''),
                  plurinominale:feat.properties.SEN17P_DEN
               }
            break;
            case 'uninominale_camera':
               feat.shapeId=feat.properties.CAM17U_COD;
               const pluriCamera = getShapeFromLocalMap('camera', 2, parentsData[feat.shapeId]);
               feat.label=`${feat.properties.CAM17U_DEN} ${feat.properties.CAM17U_NOM}`;
               feat.navigator={
                  circoscrizione:feat.properties.CAM17U_DEN.replace(/\s{0,1}-\s{0,1}(\d{1,2})/g, ''),
                  plurinominale: pluriCamera? pluriCamera.label : '', //feat.properties.CAM17U_DEN,
                  uninominale:`${feat.properties.CAM17U_DEN} ${feat.properties.CAM17U_NOM}`
               }  
            break;
            case 'uninominale_senato':
               feat.shapeId=feat.properties.SEN17U_COD;
               const pluriSenato = getShapeFromLocalMap('senato', 2, parentsData[feat.shapeId]);
               feat.label=`${feat.properties.SEN17U_DEN} ${feat.properties.SEN17U_NOM}`;
               feat.navigator={
                  circoscrizione:feat.properties.SEN17U_DEN.replace(/\s{0,1}-\s{0,1}(\d{1,2})/g, ''),
                  plurinominale: pluriSenato? pluriSenato.label : '', //feat.properties.SEN17U_DEN,
                  uninominale:`${feat.properties.SEN17U_DEN} ${feat.properties.SEN17U_NOM}`
               }
            break;
         }
         // add parent reference to every shape
         feat.parent = parentsData[feat.shapeId] ? parentsData[feat.shapeId] : null;
         return feat
      });
      return shapes;
   }
   zoomIn(shape){
      const zoomLevel = this.state.zoomLevel >=3 ? 3 : this.state.zoomLevel+1;
      if(zoomLevel > 0){
         this.handleZoom(shape, zoomLevel, shape.shapeCenterCoords, shape.navigator);
      }
   }
   changeCoords(shape, coords, navigator){
      this.handleZoom(shape, this.state.zoomLevel, coords, navigator);
   }
   navBack(level, parent){
      const circoscrizione = level <=0 ? null : this.state.navigator.circoscrizione;
      const plurinominale = level <=1 ? null : this.state.navigator.plurinominale;
      const uninominale = level <= 2 ? null : this.state.navigator.uninominale;
      const navigator = {circoscrizione, plurinominale, uninominale};
      const coords = level === 0 ? this.defaultCoords : this.state.zoomCoords;
      const shape = parent ? getShapeFromLocalMap(this.props.branch, level, this.state.geo.parent) : null;
      this.handleZoom(shape, level, coords, navigator);
   }
   handleZoom(geo, zoomLevel, zoomCoords, navigator){
      let zoomDetail;
      switch(zoomLevel){
         case 0:  zoomDetail = 1;            break;
         case 3:  zoomDetail = 10;           break;
         default: zoomDetail = zoomLevel*3;  break;
      }
      // split setState in 2 tranches to allow smooth zoom out animation
      this.setState({
         geo,
         zoomLevel, 
         navigator
      }, function(){
         // wrap in setTimeout 0 to avoid map misplacements
         setTimeout(()=>{
            this.setState({
               zoomCoords, 
               zoomDetail
            })
            this.notificateAmpIframe();
         }, 0)
      });
   }
   changeType(evt){
      // toogle map second level on select
      this.showSpinner();
      const secondLevel =  evt.target.value;
      // load map if needed or get from cache
      this.getMapData(this.props.branch, evt.target.value, (currentMap)=>{
         if(this.state.zoomLevel > 1){
            // we are already viewing map detail, so change currentMap too
            this.setState({currentMap, mapType: secondLevel, secondLevel});
         }else{
            // map has been cached, just save reference to second level map to show
            this.setState({secondLevel});
         }
         this.hideSpinner();
      });
   }
   setTitle(){
      const branch = this.props.branch ==='camera' ? 'Camera dei Deputati' : 'Senato della Repubblica';
      switch(this.state.mapType){
         case 'uninominale':
         var type = 'Collegi Uninominali';
         break;
         case 'plurinominale':
         var type = 'Collegi Plurinominali';
         break;
         default:
         var type = 'Circoscrizioni Elettorali';
         break;
      }
      return `${branch} - ${type}`
   }
   showSpinner(){
      this.setState({loading:true})
   }
   hideSpinner(){
      this.setState({loading:false})
   }
   notificateAmpIframe(){
      // AMP IFRAME RESIZE (change iframe height on mobile)
      console.warn('amp iframe resize ', document.body.scrollHeight);
      window.parent.postMessage({
         sentinel: 'amp',
         type: 'embed-size',
         height: document.body.scrollHeight
      }, '*');
   }
   render() {
      const {
         loading, 
         zoomLevel, 
         zoomDetail, 
         zoomCoords, 
         mapsToRender, 
         navigator,
         geo
      } = this.state;
      return (
         <div className="mapWrapper">
         <Navigator
               zoomLevel = {this.state.zoomLevel}
               navBack = {this.navBack.bind(this)}
               navigator = {this.state.navigator}
            />
            <div className="ep18-svg-container">
               <ResultsProvider 
                  mapType={this.mapsToLoad[this.state.zoomLevel]}
                  remotePath={this.props.remotePath}
                  branch = {this.props.branch}
               >
               {(results) =>(
                  <React.Fragment>
                     <div className="absoluteMap">
                        {mapsToRender.map(map => {
                           if(zoomLevel<=map.order || map.order===2){
                              return(
                                 <SvgMap 
                                    key={map.order}
                                    order={map.order}
                                    mapData={map.mapData} 
                                    mapType={map.mapType}
                                    zoomLevel = {zoomLevel}
                                    zoomIn={this.zoomIn.bind(this)}
                                    changeCoords={this.changeCoords.bind(this)}
                                    zoomCoords={zoomCoords}
                                    zoomDetail={zoomDetail}
                                    maxZoomLevel={this.maxZoomLevel}
                                    navigator = {navigator}
                                    branch= {this.props.branch}
                                    currentShape = {geo ? geo.shapeId : null}
                                    isNarrowWidth = {this.props.isNarrowWidth}
                                    results = {results.data[this.props.branch][map.mapType]}
                                 />
                              )
                           }
                        })}
                     </div>
                     <div className="mapDetails">
                        <DistrictDetails 
                        {...geo} 
                        mapsToLoad={this.mapsToLoad}
                        zoomLevel = {this.state.zoomLevel}
                        branch = {this.props.branch}
                        results={results}
                        logoPath={this.props.logoPath}
                        visible={geo ? true : false}
                        />
                     </div>
                  </React.Fragment>
               )}
               </ResultsProvider>
            </div>
            <Spinner enabled={loading} />
         </div>
      );
   }
}
export default Maps;
