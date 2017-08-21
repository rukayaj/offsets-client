// Keep the Input import for now, you'll remove it later:
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location }                 from '@angular/common';
import 'rxjs/add/operator/switchMap';
//import * as L from 'leaflet';

import { Development } from '../interfaces/development';
import { DevelopmentService } from '../services/development.service';


import { FormGroup }                 from '@angular/forms';
 
import { QuestionBase }              from '../dynamic-form/question-base';
import { QuestionControlService }    from '../dynamic-form/question-control.service';

import { DropdownQuestion } from '../dynamic-form/question-dropdown';
import { TextboxQuestion }  from '../dynamic-form/question-textbox';
import { GeoJsonQuestion }  from '../dynamic-form/question-geojson';

import { trigger, state, style, animate, transition } from '@angular/animations';

import { BGISService } from '../services/bgis.service';  

@Component({
  templateUrl: './development-form.component.html',
  providers: [ QuestionControlService,  DevelopmentService],
  
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
export class DevelopmentFormComponent implements OnInit {
  questions: QuestionBase<any>[] = new Array();
  addFormQuestions: QuestionBase<any>[] = new Array();
  form: FormGroup;
  addForm: FormGroup;
  showAddForm = false;
  payLoad = '';
  
  // I wonder what the @ symbol signifies?
  @Input() development: Development;
  types = [];
  additionalQuestions = {};
  
  
  // The constructor which runs when this class is initialised
  constructor(
    private developmentService: DevelopmentService,
    private route: ActivatedRoute,
    private location: Location,
    private qcs: QuestionControlService,
    private bgisService: BGISService
  ) {
    this.form = this.qcs.toFormGroup(this.questions);
    this.addForm = this.qcs.toFormGroup(this.questions);
  }
  
  ngOnInit(): void {
    this.developmentService.getDevelopmentQuestions().then(questions => {
      this.questions = questions.sort((a, b) => a.order - b.order);
      this.form = this.qcs.toFormGroup(this.questions);
    });
  }
    
  goBack(): void {
    this.location.back();
  }
  
  onSubmit() {
    // additionalQuestions contains all of the additional area qs retrieved from BGIS
    // Including status etc. We need to add area to this from what was entered on the form
    // Then delete the submitted form value and add the original additionalQuestions
    // A bit weird and hacky but I can't work out a better way to do this!
    // Oh and for some reason we can't just add the additional qs to the original form
    // Had to make a new form called addForm or else when you submit the original form the 
    // original values get lost. WTF is all I can say.
    console.log(this.form.value);
    console.log(this.addForm.value);
    
    //let submitValues = this.form.value;
    this.form.value['info'] = {}; // This should really come from the API... 
    for(let key in this.addForm.value) {
      if(key.startsWith('json_')) {
        let newKey = key.substring(5);
        this.additionalQuestions[newKey]['area'] = this.addForm.value[key];
        //delete submitValues[key];
        this.form.value['info'][newKey] = this.additionalQuestions[newKey];
      }
    }
    
    console.log(this.form.value);
    //console.log(submitValues);
    this.developmentService.create(this.form.value);
  }
  
  save(): void {
    //this.developmentService.update(this.development)
    //  .then(() => this.goBack());
  }
  
  
  
  
  
  
  
  layers = [L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })];
	layersControl: any;
	options = {zoom: 7, center: [51.505, -0.09]};
  center = [51.505, -0.09]; // This will get overwritten
  showLeaflet = false;
  
  
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
      let coords = polygonObj['features'][0]['geometry']['coordinates'][0];
      let wkt = "POLYGON((" + coords.map(function(x) { return x.join(" ") }).join(',') + "))";
      this.form.controls[event.target.id].setValue(wkt);
      
      // Get information about the area from the BGIS API
      this.bgisService.getVegTypes(coords).then(results => {        
        results['results'].forEach((item, index) => {
          this.additionalQuestions[item.value] = {
            'type': item.attributes.CHANGE_REF,
            'status': 'to be retrieved'
          }
        });
        
        //let addQs = []
        for(let key in this.additionalQuestions) {
          let item = this.additionalQuestions[key];
          let newItem = {
            'value': '',
            'key': 'json_' + key,
            'label': key + ' area in ha',
            'required': false,
            'help_text': key + ' (' + item.type + ')'
          }
          this.addFormQuestions.push(new TextboxQuestion(newItem));
        };
        
       console.log(this.questions);
       console.log(this.addFormQuestions);
       
       this.addForm = this.qcs.toFormGroup(this.addFormQuestions);
       //this.questions = this.questions.concat(addQs);
       //this.form = this.qcs.toFormGroup(this.questions);
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

