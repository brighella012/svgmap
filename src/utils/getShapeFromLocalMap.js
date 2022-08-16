const getShapeFromLocalMap = (branch, zoomLevel, targetId)=>{
   let mapToGet;
   switch(zoomLevel){
      case 2: mapToGet = 'plurinominale'; break;
      case 3: mapToGet = 'uninominale'; break;
      default: mapToGet = 'circoscrizioni'; break;
   }
   const mapRecords = JSON.parse(localStorage.getItem(`ep18-${mapToGet}-${branch}`));
   const out = mapRecords.mapData.filter((el)=>el.shapeId == targetId)[0];
   return out ? out : null
}
export default getShapeFromLocalMap;
