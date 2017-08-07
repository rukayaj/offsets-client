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
  questions: QuestionBase<any>[] = new Array();
  form: FormGroup;
  payLoad = '';
  
  // I wonder what the @ symbol signifies?
  @Input() development: Development;
  types = [];
  
  
  // The constructor which runs when this class is initialised
  constructor(
    private developmentService: DevelopmentService,
    private route: ActivatedRoute,
    private location: Location,
    private qcs: QuestionControlService
  ) {
    //this.questions = developmentService.simpleGetQs();
    //developmentService.simpleGetQs().subscribe((questions) => { this.questions = questions; this.form = this.qcs.toFormGroup(this.questions); });
    let temp = new Array();
    this.form = this.qcs.toFormGroup(temp);
    console.log('called once');
    //developmentService.simpleGetQs().subscribe(questions => { this.questions = questions; this.form = this.qcs.toFormGroup(this.questions); });
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
            case 'foreign key': { 
              this.developmentService.getForeignKeyValues(item['endpoint']).then(values => {
                item['choices'] = values['results'].map(function(obj) {
                  return {'value': obj['id'], 'display_name': obj['name']}
                });
                
                this.questions.push(new DropdownQuestion(item));
                this.form = this.qcs.toFormGroup(this.questions);
              });
              break; 
            }
          }
        }
      }
      
  }).then(() => { this.form = this.qcs.toFormGroup(this.questions); });
    
    this.form = this.qcs.toFormGroup(this.questions);
    
  }
  
  /*
  ngOnInit(): void {
    
    this.developmentService.getDevelopmentQuestions().then(questions => {
      let temp = questions;
      this.questions = temp;
      console.log(temp);
      this.form = this.qcs.toFormGroup(this.questions);
    });
    //this.developmentService.simpleGetQs().subscribe((questions) => { 
      //console.log(questions); this.questions = questions; 
      //this.form = this.qcs.toFormGroup(questions); 
    //});
  }*/
  
  goBack(): void {
    this.location.back();
  }
  
  onSubmit() {
    // TODO post this back to API
    //console.log(JSON.stringify(this.form.value));
  }
  
  save(): void {
    //this.developmentService.update(this.development)
    //  .then(() => this.goBack());
  }
}

