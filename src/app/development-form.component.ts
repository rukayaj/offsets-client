// Keep the Input import for now, you'll remove it later:
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location }                 from '@angular/common';
import 'rxjs/add/operator/switchMap';
//import * as L from 'leaflet';

import { Development } from './development';
import { DevelopmentService } from './development.service';


import { FormGroup }                 from '@angular/forms';
 
import { QuestionBase }              from './question-base';
import { QuestionControlService }    from './question-control.service';

import { DropdownQuestion } from './question-dropdown';
import { TextboxQuestion }  from './question-textbox';
import { GeoJsonQuestion }  from './question-geojson';


@Component({
  templateUrl: './development-form.component.html',
  providers: [ QuestionControlService,  DevelopmentService]
})
export class DevelopmentFormComponent implements OnInit {
  @Input() questions: QuestionBase<any>[] = [];
  
  form: FormGroup;
  payLoad = '';
  
  // I wonder what the @ symbol signifies?
  @Input() development: Development;
  types = [];
  
  // Leaflet properties
  //layers: L.Layer[];
	//layersControl: any;
	//options = {zoom: 7, center: [51.505, -0.09]};
  
  // The constructor which runs when this class is initialised
  constructor(
    private developmentService: DevelopmentService,
    private route: ActivatedRoute,
    private location: Location,
    private qcs: QuestionControlService
  ) {
    // Initialise leaflet with the openstreetmap baselayer
    //this.layers = [L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })];
    // this.questions = developmentService.getQuestions();
  }
  
  ngOnInit(): void {
    // Populate the form based on the metadata retrieved from OPTIONS request to API
    this.developmentService.getDevelopmentOptions().then(metadata => {
      let postMetadata = metadata['actions'].POST; 
      for(let md in postMetadata) {
        let item = postMetadata[md];
        let i = 0;
        if(!item['read_only']) {
          i++;
          
          // Beautifully the item returned from DRF can go straight into TextboxQuestion object with this one addition
          item['key'] = md; 
          switch(item['type']) {
            case 'integer': { this.questions.push(new TextboxQuestion(item)); break; }
            case 'choice':  { this.questions.push(new DropdownQuestion(item)); break; }
            case 'geojson': { this.questions.push(new GeoJsonQuestion(item)); break; }
          }
        }
      }
      this.form = this.qcs.toFormGroup(this.questions);
    });
    
    this.form = this.qcs.toFormGroup(this.questions);
    
    
    /*this.route.paramMap
      .switchMap((params: ParamMap) => this.developmentService.getDevelopment(+params.get('id')))
      .subscribe(development => { 
          console.log(this.developmentService.getDevelopmentOptions());
          let polygon = L.geoJSON(development); // This wouldn't be possible if development wasn't a valid geojson object 
          let centroid = polygon.getBounds().getCenter();
          this.layers.push(polygon);
          this.options['center'] = centroid;
          
          // Used to populate the form
          this.development = development; 
        });*/
  }
  
  goBack(): void {
    this.location.back();
  }
  
  onSubmit() {
    // TODO post this back to API
    console.log(JSON.stringify(this.form.value));
  }
  
  save(): void {
    this.developmentService.update(this.development)
      .then(() => this.goBack());
  }
}

