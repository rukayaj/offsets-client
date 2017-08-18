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


@Component({
  templateUrl: '../offset-form.component.html',
  providers: [ QuestionControlService,  DevelopmentService]
})
export class OffsetFormComponent implements OnInit {
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
    this.form = this.qcs.toFormGroup(this.questions);
  }
  
  ngOnInit(): void {
    this.developmentService.getDevelopmentQuestions().then(questions => {
      this.questions = questions;
      this.form = this.qcs.toFormGroup(this.questions);
    });
  }
    
  goBack(): void {
    this.location.back();
  }
  
  onSubmit() {
    this.developmentService.create(this.form.value);
  }
  
  save(): void {
    //this.developmentService.update(this.development)
    //  .then(() => this.goBack());
  }
}

