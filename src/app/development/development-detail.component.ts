// Keep the Input import for now, you'll remove it later:
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location }                 from '@angular/common';
import 'rxjs/add/operator/switchMap';
import * as L from 'leaflet';

import { Development, Offset } from '../interfaces/development';
import { DevelopmentService } from '../services/development.service';
import { BGISService } from '../services/bgis.service';

import { QuestionBase }              from '../dynamic-form/question-base';
import { QuestionControlService }    from '../dynamic-form/question-control.service';

import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'development-detail',
  templateUrl: './development-detail.component.html',
  //styleUrls: ['./../../node_modules/leaflet/dist/leaflet.css']
})
export class DevelopmentDetailComponent implements OnInit {
  // I wonder what the @ symbol signifies?
  @Input() development: Development;
  offsets: Object;
  objectKeys = Object.keys;
  private modalRef:NgbModalRef;
  
  questions: QuestionBase<any>[];// = [];

  
  // Leaflet properties
  offsetLayers: L.Layer[];
  layers: L.Layer[];
	layersControl: any;
	options = {zoom: 7};
  
  // The constructor which runs when this class is initialised
  constructor(
    private developmentService: DevelopmentService,
    private bgisService: BGISService,
    private route: ActivatedRoute,
    private location: Location,
    private modalService: NgbModal
  ) {
    // Initialise leaflet with the openstreetmap baselayer
    this.layers = [L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })];
    this.offsetLayers = [L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })];
    
    
    this.developmentService.getOffsetQuestions().then(questions => {
      
      this.questions = questions.sort((a, b) => a.order - b.order);
      //console.log(this.questions);
    });
  }
  
  ngOnInit(): void {
    this.route.paramMap
      .switchMap((params: ParamMap) => this.developmentService.getDevelopment(+params.get('id'))) // the + casts it to an int apparently
      .subscribe(development => { 
          var polygon = L.geoJSON(development); // This wouldn't be possible if development wasn't a valid geojson object 
          
          let centroid = polygon.getBounds().getCenter();
          this.layers.push(polygon); //- Can't do this, must do it below... 
          this.options['center'] = centroid;
          //console.log(centroid);
          
          this.developmentService.getForeignKeyValues('permits').then(values => {
            let permitOptions = [];
            for(var opt of values['results']) {
              //if(development['properties']['permits'].contains(opt['id'])) {
              if(development['properties']['permits'].indexOf(opt['id']) > -1) {
                //permitOptions[opt['id']] = opt['name'];
                permitOptions.push(opt['name']);
              }
            }
            development['properties']['permits_display'] = permitOptions;
          });
          
          // Used to populate the form
          this.development = development;
          console.log(development.properties);
          
          // I think we don't need this any more, it was just to display a protected area
          /*this.developmentService.getAreas().then( areas => {
            let features = areas['results']['features'];  
            let areaPolygon = L.geoJSON(features[4]); 
            //this.layers.push(areaPolygon); - Why can't one do this??? Screw you, Angular. 
            this.layers = [
              L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
              polygon, areaPolygon
            ];
          });*/
          
          this.developmentService.getOffsets(development['id']).then( offsets => {
            if(offsets['count'] > 0) {
              this.offsets = offsets['results'];
              console.log(this.offsets);
              //console.log(JSON.stringify(this.offsets));
              let offsetPolygons = L.geoJSON(JSON.parse(JSON.stringify(this.offsets)), {
                style: function(feature) {
                   return {
                      fillColor: '#FF0000',
                      weight: 2,
                      opacity: 1,
                      color: '#FF0000',
                      dashArray: '3',
                      fillOpacity: 0.7
                  };
                }
              });
              //this.layers.push(offsetPolygons);
              
              this.layers = [
                L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
                polygon, offsetPolygons
              ];
              
              let centroid = offsetPolygons.getBounds().getCenter();
              this.options['center'] = centroid;
            }
          });
        });
  }
  
  goBack(): void {
    this.location.back();
  }
  
  open(content) {
    this.modalRef = this.modalService.open(content, {'size': 'lg', windowClass: 'fade'});
    this.modalRef.result.then((result) => {
      //this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      //this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  save(): void {
    this.developmentService.update(this.development)
      .then(() => this.goBack());
  }
  
  
  onSubmitF(event) {
    // additionalQuestions contains all of the additional area qs retrieved from BGIS
    // Including status etc. We need to add area to this from what was entered on the form
    // Then delete the submitted form value and add the original additionalQuestions
    // A bit weird and hacky but I can't work out a better way to do this!
    // Oh and for some reason we can't just add the additional qs to the original form
    // Had to make a new form called addForm or else when you submit the original form the 
    // original values get lost. WTF is all I can say.
    //console.log(event);
    //console.log(event['form']);
    
    var submitValues = event['form'];
    submitValues['info'] = {}; // This should really come from the API... 
    for(let key in event['addForm']) {
      if(key.startsWith('json_')) {
        let newKey = key.substring(5);
        event.additionalQuestions[newKey]['area'] = event['addForm'][key];
        delete submitValues[key];
        submitValues['info'][newKey] = event.additionalQuestions[newKey];
      }
    }
    console.log(this.development);
    console.log(submitValues);
    submitValues['development'] = this.development.id;
    //console.log(submitValues);
    var newOffset = this.developmentService.createOffset(submitValues);
    console.log('created');
    console.log(newOffset);
    
    this.modalRef.close();
  }
}

