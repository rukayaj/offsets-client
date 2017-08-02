// Keep the Input import for now, you'll remove it later:
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location }                 from '@angular/common';
import 'rxjs/add/operator/switchMap';
import * as L from 'leaflet';

import { Development } from './development';
import { DevelopmentService } from './development.service';

@Component({
  selector: 'development-detail',
  templateUrl: './development-detail.component.html',
  //styleUrls: ['./../../node_modules/leaflet/dist/leaflet.css']
})
export class DevelopmentDetailComponent implements OnInit {
  // I wonder what the @ symbol signifies?
  @Input() development: Development;
  
  // Leaflet properties
  layers: L.Layer[];
	layersControl: any;
	options = {zoom: 7};
  
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
      .switchMap((params: ParamMap) => this.developmentService.getDevelopment(+params.get('id')))
      .subscribe(development => { 
          let polygon = L.geoJSON(development); // This wouldn't be possible if development wasn't a valid geojson object 
          let centroid = polygon.getBounds().getCenter();
          this.layers.push(polygon);
          this.options['center'] = centroid;
          
          // Used to populate the form
          this.development = development; 
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

