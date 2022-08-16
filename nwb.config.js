
const path = require('path');
module.exports = {
   type: 'react-app',
   webpack:{
      extractText:false,
      extra:{
         entry: path.resolve(__dirname, "./src/index.js"),
         output: {
            //path: path.resolve(__dirname, "../../../dist/js/async/politiche2018/interactivemap/"),
            path: path.resolve(__dirname,"/wp-content/themes/ifq-2019/_build/elezioni/svgmap/public/mapdata/"),
            filename: "[name].js"
         }
      }
   }
}