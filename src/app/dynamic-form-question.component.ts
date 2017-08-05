import { Component, Input, OnInit } from '@angular/core';
import { FormGroup }        from '@angular/forms';

import { QuestionBase }     from './question-base';


import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location }                 from '@angular/common';
import 'rxjs/add/operator/switchMap';
import * as L from 'leaflet';

@Component({
  selector: 'df-question',
  templateUrl: './dynamic-form-question.component.html',
  providers: []
})
export class DynamicFormQuestionComponent {
  layers = [L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })];
	layersControl: any;
	options = {zoom: 7, center: [51.505, -0.09]};
  center = [51.505, -0.09];
  
  @Input() question: QuestionBase<any>;
  @Input() form: FormGroup;
  
  // Called when the geojson file is loaded
  onChange(event): void {
    var files = event.srcElement.files;
    var reader = new FileReader();
     
    reader.onloadend = function(e){ // Performed after file has been loaded
      let geojson = reader.result;
      let polygonObj = JSON.parse(geojson);
      //loadGeoJSON(polygon);
        
      let polygon = L.geoJSON(polygonObj);
      console.log(polygon);
      var centroid = polygon.getBounds().getCenter();
      //console.log(this.layers);
      //this.layers.push(polygon);
      this.layers = [this.layers[0], polygon];
      this.center = centroid;
      console.log(this.center);
      console.log('done');
    }.bind(this);
    
      console.log(this.center);
    reader.readAsText(files[0]);
  }
  
  get isValid() { return this.form.controls[this.question.key].valid; }
}