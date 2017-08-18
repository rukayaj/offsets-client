import { Component, Input, OnInit } from '@angular/core';
import { FormGroup }        from '@angular/forms';

import { QuestionBase }     from './question-base';
import { QuestionControlService }    from '../dynamic-form/question-control.service';

import { MultiDropdownQuestion } from '../dynamic-form/question-multidropdown';
import { DropdownQuestion } from '../dynamic-form/question-dropdown';
import { TextboxQuestion }  from '../dynamic-form/question-textbox';
import { GeoJsonQuestion }  from '../dynamic-form/question-geojson';


import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location }                 from '@angular/common';
import 'rxjs/add/operator/switchMap';
import * as L from 'leaflet';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { BGISService } from '../services/bgis.service';  
@Component({
  selector: 'df-question',
  templateUrl: './dynamic-form-question.component.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({opacity:0}),
        animate(1000, style({opacity:1})) 
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(1000, style({opacity:0})) 
      ])
    ])
  ]
})
export class DynamicFormQuestionComponent {
  layers = [L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })];
	layersControl: any;
	options = {zoom: 7, center: [51.505, -0.09]};
  center = [51.505, -0.09]; // This will get overwritten
  showLeaflet = false;
  
  @Input() question: QuestionBase<any>;
  @Input() questions: QuestionBase<any>[];
  @Input() form: FormGroup;
  
  constructor(
    private bgisService: BGISService
  ) {
  }
  
  // Called when the geojson file is loaded
  onChange(event): void {
    this.showLeaflet = true;
    var files = event.srcElement.files;
    var reader = new FileReader();
     
    reader.onloadend = function(e){ // Performed after file has been loaded
      let geojson = reader.result;
      let polygonObj = JSON.parse(geojson);
      let polygon = L.geoJSON(polygonObj);
      var centroid = polygon.getBounds().getCenter();
      
      // For mysterious reasons it doesn't work if you do this.layers.push
      this.layers = [this.layers[0], polygon];
      this.center = centroid;
      
      //this.form.controls[this.question.key].setValue(polygonObj['features'][0]['geometry']['coordinates'][0]);
      //this.form.controls[this.question.key].setValue(polygon.toGeoJSON());
      let coords = polygonObj['features'][0]['geometry']['coordinates'][0];
      let wkt = "POLYGON((" + coords.map(function(x) { return x.join(" ") }).join(',') + "))";
      this.form.controls[this.question.key].setValue(wkt);
      
      // Get information about the area from the BGIS API
      this.bgisService.getVegTypes(coords).then(results => {
        console.log(results['results']);
        console.log(this.questions);
        
        var promises = []; 
        
        results['results'].forEach((item, index) => {
            let newItem = {
              'value': item.value,
              'key': 'json_' + index,
              'label': item.value + ' area in ha',
              'required': false,
              'help_text': item.value + ' (' + item.attributes.CHANGE_REF + ')'
            }
            //this.questions.push(new TextboxQuestion(newItem));
        });
      });
    }.bind(this);
    
    // Actually reading the file
    reader.readAsText(files[0]);
  }
  
  get isValid() { 
    return true;
    //return this.form.controls[this.question.key].valid; 
  }
}