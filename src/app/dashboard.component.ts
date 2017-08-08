// Keep the Input import for now, you'll remove it later:
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location }                 from '@angular/common';
import 'rxjs/add/operator/switchMap';
import * as L from 'leaflet';

import { Development } from './development';
import { DevelopmentService } from './development.service';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {  
  developments: Development[];
  
  // datatables
  developmentsCount = 0;
  

  // Leaflet properties
  layers: L.Layer[];
	layersControl: any;
	options = {zoom: 5};
  
  // The constructor which runs when this class is initialised
  constructor(
    private developmentService: DevelopmentService,
    private route: ActivatedRoute,
    private location: Location
  ) {
    // Initialise leaflet with the openstreetmap baselayer
    this.layers = [L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })];
  }
  
  ngOnInit(): void {    
    this.route.paramMap
      .switchMap((params: ParamMap) => this.developmentService.getDevelopments())
      .subscribe(developments => { 
          this.developmentsCount = developments['count'];
          let polygons = L.geoJSON(developments['results']); // This wouldn't be possible if development wasn't a valid geojson object 
          let centroid = polygons.getBounds().getCenter();          
          this.layers.push(polygons);
          this.options['center'] = centroid;          
          this.developments = developments['results']['features']; 
          console.log(this.developments);
        });
  }
}

