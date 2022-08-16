import React from 'react'
import {render} from 'react-dom'
import App from './components/App';

render(<App 
   enableToggle={window.ep18MapConfig.enableToggle} 
   branch={window.ep18MapConfig.branch}
   path={window.ep18MapConfig.path}
   mapPath={window.ep18MapConfig.mapPath}
   logoPath={window.ep18MapConfig.logoPath}
   highlight={window.ep18MapConfig.highlight}
   />, 
   document.querySelector('#ep18InteractiveMap'))
