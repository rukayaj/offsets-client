import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup }        from '@angular/forms';
import { QuestionBase }              from '../dynamic-form/question-base';
import { QuestionControlService }    from '../dynamic-form/question-control.service';

import { MultiDropdownQuestion } from '../dynamic-form/question-multidropdown';
import { DropdownQuestion } from '../dynamic-form/question-dropdown';
import { TextboxQuestion }  from '../dynamic-form/question-textbox';
import { GeoJsonQuestion }  from '../dynamic-form/question-geojson';

import { Development } from '../interfaces/development';
import { DevelopmentService } from '../services/development.service';

import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location }                 from '@angular/common';
import 'rxjs/add/operator/switchMap';
import * as L from 'leaflet';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { BGISService } from '../services/bgis.service';  
@Component({
  selector: 'dynamic-form',
  templateUrl: './dynamic-form-question.component.html',
  providers: [ QuestionControlService ],
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
  //questions: QuestionBase<any>[] = new Array();
  //@Input() questions: QuestionBase<any>[] = [];
  @Input() questions: QuestionBase<any>[] = [];
  addFormQuestions: QuestionBase<any>[] = new Array();
  form: FormGroup;
  addForm: FormGroup;
  showAddForm = false;
  payLoad = '';
  @Output() formSubmit = new EventEmitter<object>();
  
  additionalQuestions = {};
  
  
      
  layers = [L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })];
	layersControl: any;
	options = {zoom: 7, center: [51.505, -0.09]};
  center = [51.505, -0.09]; // This will get overwritten
  showLeaflet = false;
  
  
  // The constructor which runs when this class is initialised
  constructor(
    private developmentService: DevelopmentService,
    private route: ActivatedRoute,
    private location: Location,
    private qcs: QuestionControlService,
    private bgisService: BGISService
  ) {
    this.addForm = this.qcs.toFormGroup(this.addFormQuestions);
  }
  
  ngOnInit(): void {
    console.log(this.questions);
    this.form = this.qcs.toFormGroup(this.questions);
  }  
  
  // Called when the geojson file is loaded
  onChange(event): void {
    this.showLeaflet = true;
    var files = event.srcElement.files;
    var reader = new FileReader();
     
    reader.onloadend = function(e) { // Performed after file has been loaded
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
       
       this.addForm = this.qcs.toFormGroup(this.addFormQuestions);
      });
    }.bind(this);
    
    // Actually reading the file
    reader.readAsText(files[0]);
  }
  
  
  formSubmitF(event) {
    this.formSubmit.emit({'form': this.form.value, 'addForm': this.addForm.value, 'additionalQuestions': this.additionalQuestions});
  }
  
  get isValid() { 
    return true;
    //return this.form.controls[this.question.key].valid; 
  }
  
}