// Keep the Input import for now, you'll remove it later:
import { Component, Input, OnInit, ViewEncapsulation  } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location }                 from '@angular/common';
import 'rxjs/add/operator/switchMap';
import * as L from 'leaflet';

import { Development } from '../interfaces/development';
import { DevelopmentService } from '../services/development.service';

import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';


declare let d3: any;


@Component({
  selector: 'statistics',
  templateUrl: './statistics.component.html',
  styleUrls: [
    '../../../node_modules/nvd3/build/nv.d3.css',
    './statistics.component.css'
  ],
  encapsulation: ViewEncapsulation.None
})
export class StatisticsComponent implements OnInit {    
  options = Array();
  data;
  
  // The constructor which runs when this class is initialised
  constructor(
    private developmentService: DevelopmentService,
    private route: ActivatedRoute,
    private location: Location,
    private modalService: NgbModal
  ) {
  }
  
  getNewOptions() {
    return {
      chart: {
        type: 'discreteBarChart',
        height: 450,
        margin : {
          top: 20,
          right: 20,
          bottom: 70,
          left: 55
        },
        x: function(d){return d.label;},
        y: function(d){return d.value;},
        showValues: true,
        valueFormat: function(d){
          return d3.format('')(d);
        },
        duration: 500,
        xAxis: {
          axisLabel: 'REPLACE',
          axisLabelDistance: 20,
          tickFormat: function(d){
            if (typeof this != 'undefined') {
                 var el = d3.select(this);
                 var p = d3.select(this.parentNode);
                 p.append("foreignObject")
                        .attr('x', -50)
                        .attr("width", 100)
                        .attr("height", 200)
                        .append("xhtml:p")
                        .attr('style','font-size: 0.7em; word-wrap: break-word; text-align:center; line-height: 0.9em;')
                        .html(d);    

                    el.remove();
                    return d;
            }
          }  
        },
        yAxis: {
          axisLabel: 'REPLACE',
          axisLabelDistance: -10,
          tickFormat: function(d){
            return d3.format('')(d);
          },
          
        },
      }
    }
    
  }
  
  ngOnInit(): void {    
    //var baseOptions = 
  
  
    this.route.paramMap
      .switchMap((params: ParamMap) => this.developmentService.getStatistics())
      .subscribe(statistics => {  
          var array = Array();
          for(let key in statistics) {
            array.push([{key: key, values: statistics[key]['data']}])
            
            //let newOpts = Object.assign({}, baseOptions);
            let newOpts = this.getNewOptions();
            newOpts['chart']['xAxis']['axisLabel'] = statistics[key]['x_axis'];
            newOpts['chart']['yAxis']['axisLabel'] = statistics[key]['y_axis'];
            newOpts['wide_graph'] = statistics[key]['wide_graph'];
            
            if(newOpts['wide_graph']) {
              newOpts['chart']['type'] = 'multiBarHorizontalChart';
              newOpts['chart']['margin']['left'] = 200;
              newOpts['chart']['xAxis']['axisLabelDistance'] = 0;
              newOpts['chart']['xAxis']['tickFormat'] = function(d){
                return d;
              }
            }
            //console.log(newOpts['chart']['xAxis']['axisLabel']);
            this.options.push(newOpts);
          }
          this.data = array;
          //console.log(this.data);
          //console.log(this.options);
        });
        
    
    

  }
  
}

