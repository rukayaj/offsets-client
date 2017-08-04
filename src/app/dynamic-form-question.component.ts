import { Component, Input } from '@angular/core';
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
  //layers: L.Layer[];
  layers = [L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })];
	layersControl: any;
	options = {zoom: 7, center: [51.505, -0.09]};
  
  //this.layers = [L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })];
  
  @Input() question: QuestionBase<any>;
  @Input() form: FormGroup;
  //@Input() leafletOptions: Object;
  //@Input() leafletLayers: L.Layer[];
  get isValid() { return this.form.controls[this.question.key].valid; }
}