import React, {Component} from "react"

import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import { center } from '@turf/turf'

mapboxgl.accessToken = 'pk.eyJ1Ijoic2FhZGlxbSIsImEiOiJjamJpMXcxa3AyMG9zMzNyNmdxNDlneGRvIn0.wjlI8r1S_-xxtq2d-W5qPA';

let hoveredStateId =  null;
let clickedStateId =  null;

class GtfsMap extends Component {

  constructor(props) {
    super(props);
    this.state = {
      lng: -114.0708,
      lat: 51.0486,
      zoom: 10.2,
      selected_bus: null
    };
  }

  setStateAsync(state) {
     return new Promise((resolve) => {
       this.setState(state, resolve)
     });
   }

  componentDidMount() {

    const {lng, lat, zoom } = this.state;
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/saadiqm/cju238axg1xac1fqi1xisuwwa',
      center: [lng, lat],
      zoom,
      maxZoom: 12,
      minZoom: 10.2,
    });
    this.map.on('load', () => {
      let geojson = 'https://data.calgary.ca/resource/hpnd-riq4.geojson?route_short_name='+this.state.selected_bus
      this.map.addSource('Bus Route', {
        type: 'geojson',
        data: geojson
      });
      this.map.addLayer({
          "id": "Bus Route",
          "type": "line",
          "source": 'Bus Route',
          "paint": {
              "line-color": "#FF0000",
              "line-width": 5,
              "line-opacity": 0.7
          },
          "layout": {
              "line-join": "round",
              "line-cap": "round"
          },
      });
      // let geojson = 'https://dax2h6sk92.execute-api.us-east-1.amazonaws.com/dev/'
      let geojson_points = 'http://localhost:3000/'
      this.map.addSource('Realtime Bus', {
        type: 'geojson',
        data: geojson_points
      });
      this.map.addLayer({
          "id": "Realtime Bus",
          "type": "circle",
          "source": 'Realtime Bus',
          "paint": {
              "circle-color": ["case",
                ["boolean", ["feature-state", "click"], false],
                '#f4cb42',
                '#ff0000'
              ],
              "circle-radius":["case",
                ["boolean", ["feature-state", "click_radius"], false],
                9,
                7
              ],
              "circle-opacity": ["case",
                ["boolean", ["feature-state", "hover"], false],
                1,
                0.5
              ]
          }
      });

      this.map.addLayer({
          "id": "symbols",
          "type": "symbol",
          "source": "Bus Route",
          "layout": {
            "icon-image": "bus",
            "icon-text-fit":'none',
            "icon-text-fit-padding":[3,3,3,3],
            "symbol-placement":  "line",
            'symbol-spacing':1000,
            'icon-rotation-alignment': 'viewport',
            'text-rotation-alignment':'viewport',
            "text-size": 12,
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-transform": "uppercase",
            "text-letter-spacing": 0.05,
            "text-offset": [0, 0]
          },
          "paint": {
              "text-color": "red"
          }
      });

      this.map.on("mousemove", "Realtime Bus", this.move.bind(this));
      this.map.on("mouseleave", "Realtime Bus", this.leave.bind(this));
      this.map.on("click", "Realtime Bus", this.click.bind(this));

      setInterval(() => {
          this.map.getSource('Realtime Bus').setData(geojson_points)
          console.log("update map")
        }, 45000);
    });
  }

  move(e){
    this.map.getCanvas().style.cursor = 'pointer';
    if (e.features.length > 0) {
      if (hoveredStateId) {
        this.map.setFeatureState({source: 'Realtime Bus', id: hoveredStateId}, { hover: false});
      }
      hoveredStateId = e.features[0].id;
      this.map.setFeatureState({source: 'Realtime Bus', id: hoveredStateId}, { hover: true});

    }
  }

  leave(e){
    this.map.getCanvas().style.cursor = '';
    if (hoveredStateId) {
      this.map.setFeatureState({source: 'Realtime Bus', id: hoveredStateId}, { hover: false});
    }
    if (clickedStateId) {
      this.map.setFeatureState({source: 'Realtime Bus', id: clickedStateId}, { hover: true});
    }
    hoveredStateId =  null;
  }

  async click(e){
    this.map.getCanvas().style.cursor = 'pointer';
    if (e.features.length > 0) {
      if (clickedStateId) {
        this.map.setFeatureState({source: 'Realtime Bus', id: clickedStateId}, { click: false});
        this.map.setFeatureState({source: 'Realtime Bus', id: clickedStateId}, { hover: false});
        this.map.setFeatureState({source: 'Realtime Bus', id: clickedStateId}, { click_radius: false});
      }
      clickedStateId = e.features[0].id;
      this.map.setFeatureState({source: 'Realtime Bus', id: clickedStateId}, { click: true});
      this.map.setFeatureState({source: 'Realtime Bus', id: clickedStateId}, { click_radius: true});

      let trip_select = parseInt(e.features[0].properties.trip_id)

      let trip_json = 'https://vkyer20d0m.execute-api.us-west-2.amazonaws.com/dev/trips/'+trip_select

      let trip_response = await fetch(trip_json);
      let trip_data = await trip_response.json();
      let trip_short_name = trip_data.route_short_name;

      if (trip_short_name) {
        await this.setStateAsync({selected_bus: trip_short_name});

        let geojson = 'https://data.calgary.ca/resource/hpnd-riq4.geojson?route_short_name='+this.state.selected_bus

        let response = await fetch(geojson);
        let data = await response.json();

        let turf_center = center(data); //find center of bus route using Turf
        let center_coord = turf_center.geometry.coordinates;

        this.map.flyTo({
         center: center_coord,
         zoom: 12
        });

        this.map.getSource('Bus Route').setData(geojson);
        this.map.setLayoutProperty('symbols', 'text-field', String(this.state.selected_bus))
      }
    }
  }

  render(){

    return(
        <div ref={el => this.mapContainer = el} style={{position: 'absolute',
          top: 0,
          bottom: 0,
          width: '100%',
          height: '100%'}} />
    );
  }
}

export default GtfsMap
