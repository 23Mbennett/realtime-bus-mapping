import React from "react"
import containerStyles from "./display.module.css"

export default props => (

  <div className={containerStyles.container}>
    <h1><span className={containerStyles.underline}>{props.busCount}</span> BUSES ON THE ROAD</h1>
    <h2>{props.routeShortName} - {props.routeLongName}</h2>
    <p>{props.busID}</p>
    <p>Calgary Transit realtime feed is updated every 45 seconds. This map is for visualization purposes only. For trip planning, visit calgarytransit.com</p>
    <p>&copy;2019 Saadiq Mohiuddin www.saadiqm.com</p>
  </div>

)
