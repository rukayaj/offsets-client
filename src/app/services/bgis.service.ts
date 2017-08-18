import { Injectable } from '@angular/core';
import { Headers, Http, URLSearchParams } from '@angular/http';


import 'rxjs/add/operator/toPromise';

import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Rx';


@Injectable()
export class BGISService {
  private apiUrl = 'http://bgismaps.sanbi.org/arcgis/rest/services'; 
  private vegmapUrl = this.apiUrl + '/2012VegMap/MapServer/identify'; 
  private headers = new Headers({'Content-Type': 'application/json'});
  developmentOptions = {};
  
  constructor(private http: Http) {
    
  }
  
  
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
  
  getVegTypes(coordinates): Promise<Object> {
    let postObj = {
      'geometry': {"rings": [ coordinates ]},
      'geometryType': 'esriGeometryPolygon',
      'tolerance': 0,
      'mapExtent': '-104,35.6,-94.32,41',
      'imageDisplay': '600,550,96',
      'returnGeometry': false,
      'returnZ': false,
      'returnM': false,
      'f': 'json'
    };
    
    //let headers = new Headers();
    //headers.append('Content-Type', 'application/x-www-form-urlencoded');
    //let options = new RequestOptions({ headers: headers });
    
    //this.headers.append('Content-Type', 'text/plain');
    //let params = new HttpParams(postObj);
    //params = params.append("page", 1);
    let params: URLSearchParams = new URLSearchParams();
    params.set('geometry', JSON.stringify({"rings": [ coordinates ]}));
    params.set('geometryType', 'esriGeometryPolygon');
    params.set('tolerance', '0');
    params.set('mapExtent', '-104,35.6,-94.32,41');
    params.set('imageDisplay', '600,550,96');
    params.set('returnGeometry', 'false');
    params.set('returnZ', 'false');
    params.set('returnM', 'false');
    params.set('f', 'json');
    
  

    /*return this.http
      .post(this.vegmapUrl, {params: params})
      .toPromise()
      .then(res => res.json().data)
      .catch(this.handleError); // TODO show server error back at the form*/
    return this.http
      //.get(this.vegmapUrl, {params: postObj})
      .get(this.vegmapUrl, {search: params})
      .toPromise()
      .then(res => res.json())
      .catch(this.handleError); // TODO show server error back at the form
  }
}