const commonStyle={
   fill:'rgba(230,230,230,0.1)', // transparent
   stroke:'#dcdcdc',
   strokeWidth: 0.5,
   outline: "none"
}
const mapStyle = {
   // ----------------------------------------
   circoscrizioni:{
      normal:{
         default:{...commonStyle},
         hover:{...commonStyle, fill:'rgba(230,230,230,0.5)' },
         pressed:{...commonStyle}
      },
      active:{
         default:{...commonStyle},
         hover:{...commonStyle},
         pressed:{...commonStyle}
      }
   },
   // ----------------------------------------
   plurinominale:{
      normal:{
         default:{...commonStyle, strokeWidth:0.3},
         hover:{...commonStyle, strokeWidth:0.3, fill:'rgba(230,230,230,0.5)' },
         pressed:{...commonStyle, strokeWidth:0.3}
      },
      active:{
         default:{...commonStyle},
         hover:{...commonStyle},
         pressed:{...commonStyle}
      }
   },
   // ----------------------------------------
   uninominale:{
      normal:{
         default:{...commonStyle, strokeWidth:0.2},
         hover:{...commonStyle, strokeWidth:0.2, fill:'rgba(230,230,230,0.5)' },
         pressed:{...commonStyle, strokeWidth:0.2}
      },
      active:{
         default:{...commonStyle},
         hover:{...commonStyle},
         pressed:{...commonStyle}
      }
   }
}

export default mapStyle;
