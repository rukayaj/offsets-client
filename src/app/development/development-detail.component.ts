// Keep the Input import for now, you'll remove it later:
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location }                 from '@angular/common';
import 'rxjs/add/operator/switchMap';
import * as L from 'leaflet';

import { Development, Offset } from '../interfaces/development';
import { DevelopmentService } from '../services/development.service';
import { BGISService } from '../services/bgis.service';



@Component({
  selector: 'development-detail',
  templateUrl: './development-detail.component.html',
  //styleUrls: ['./../../node_modules/leaflet/dist/leaflet.css']
})
export class DevelopmentDetailComponent implements OnInit {
  // I wonder what the @ symbol signifies?
  @Input() development: Development;
  offsets: Object;
  objectKeys = Object.keys;

  
  // Leaflet properties
  offsetLayers: L.Layer[];
  layers: L.Layer[];
	layersControl: any;
	options = {zoom: 7};
  
  // The constructor which runs when this class is initialised
  constructor(
    private developmentService: DevelopmentService,
    private bgisService: BGISService,
    private route: ActivatedRoute,
    private location: Location
  ) {
    // Initialise leaflet with the openstreetmap baselayer
    this.layers = [L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })];
    this.offsetLayers = [L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })];
  }
  
  ngOnInit(): void {
    this.route.paramMap
      .switchMap((params: ParamMap) => this.developmentService.getDevelopment(+params.get('id')))
      .subscribe(development => { 
          var polygon = L.geoJSON(development); // This wouldn't be possible if development wasn't a valid geojson object 
          let centroid = polygon.getBounds().getCenter();
          this.layers.push(polygon); //- Can't do this, must do it below... 
          this.options['center'] = centroid;
          console.log(centroid);
          
          this.developmentService.getForeignKeyValues('permits').then(values => {
            let permitOptions = [];
            for(var opt of values['results']) {
              //if(development['properties']['permits'].contains(opt['id'])) {
              if(development['properties']['permits'].indexOf(opt['id']) > -1) {
                //permitOptions[opt['id']] = opt['name'];
                permitOptions.push(opt['name']);
              }
            }
            development['properties']['permits_display'] = permitOptions;
          });
          
          // Used to populate the form
          this.development = development;
          
          //console.log(development.properties.info);
          
          // I think we don't need this any more, it was just to display a protected area
          /*this.developmentService.getAreas().then( areas => {
            let features = areas['results']['features'];  
            let areaPolygon = L.geoJSON(features[4]); 
            //this.layers.push(areaPolygon); - Why can't one do this??? Screw you, Angular. 
            this.layers = [
              L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
              polygon, areaPolygon
            ];
          });*/
          
          this.developmentService.getOffsets(development['id']).then( offsets => {
            if(offsets['count'] > 0) {
              this.offsets = offsets['results'];
              //console.log(this.offsets);
              console.log(JSON.stringify(this.offsets));
              let offsetPolygons = L.geoJSON(JSON.parse(JSON.stringify(this.offsets)), {
                style: function(feature) {
                   return {
                      fillColor: '#FF0000',
                      weight: 2,
                      opacity: 1,
                      color: '#FF0000',
                      dashArray: '3',
                      fillOpacity: 0.7
                  };
                }
              });
              //this.layers.push(offsetPolygons);
              
              this.layers = [
                L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
                polygon, offsetPolygons
              ];
              
              let centroid = offsetPolygons.getBounds().getCenter();
              console.log(centroid);
              //this.layers.push(polygon); //- Can't do this, must do it below... 
              this.options['center'] = centroid;
              console.log(this.layers);
              
            }
          });
        });
  }
  
  goBack(): void {
    this.location.back();
  }
  
  save(): void {
    this.developmentService.update(this.development)
      .then(() => this.goBack());
  }
}

