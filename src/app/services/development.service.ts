import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { Development, Area, Offset } from '../interfaces/development';

import { QuestionBase }              from '../dynamic-form/question-base';
import { QuestionControlService }    from '../dynamic-form/question-control.service';

import { MultiDropdownQuestion } from '../dynamic-form/question-multidropdown';
import { DropdownQuestion } from '../dynamic-form/question-dropdown';
import { TextboxQuestion }  from '../dynamic-form/question-textbox';
import { GeoJsonQuestion }  from '../dynamic-form/question-geojson';
import { DateQuestion }  from '../dynamic-form/question-date';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Rx';



@Injectable()
export class DevelopmentService {
  private apiUrl = 'http://127.0.0.1:8000'; 
  //private apiUrl = 'http://172.16.6.250:8000'; 
  private developmentUrl = this.apiUrl + '/developments'; 
  private offsetUrl = this.apiUrl + '/offsets'
  private headers = new Headers({'Content-Type': 'application/json'});
  developmentOptions = {};
  
  constructor(private http: Http) {
    this.getDevelopmentQuestions().then(result => this.developmentOptions = result);
  }
  
  getStatistics(): Promise<Object> {
    return this.http.get(this.apiUrl + '/statistics')
           .toPromise()
           .then(response => response.json())
           .catch(this.handleError);
  }
        
  getOffsets(devID?: number): Promise<Object> {
    let url = this.offsetUrl
    if(devID) {
      url += '?development=' + devID;
    }
    
    return this.http.get(url)
           .toPromise()
           .then(response => response.json())
           //.then(function(response) { console.log(response); return JSON.stringify(response.json(); })
           .catch(this.handleError);
  }
  
  getAreas(): Promise<Area[]> {
    return this.http.get('http://127.0.0.1:8000/geospatial-biodiversity/areas')
           .toPromise()
           .then(response => response.json())
           //.then(function(response) { console.log(response); return JSON.stringify(response.json(); })
           .catch(this.handleError);
  }

  getDevelopments(): Promise<Development[]> {
    return this.http.get(this.developmentUrl)
           .toPromise()
           .then(response => response.json())
           .catch(this.handleError);
  }
 
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
    
  getDevelopment(id: number): Promise<Development> {
    const url = `${this.developmentUrl}/${id}`;
    return this.http.get(url)
           .toPromise()
           .then(response => response.json()) // as Development? 
           .catch(this.handleError);
    //return this.getDevelopments()
    //           .then(developments => developments.find(development => development.properties.id === id));
  }
  
  update(development: Development): Promise<Development> {
    const url = `${this.developmentUrl}/${development.id}`;
    return this.http
      .put(url, JSON.stringify(development), {headers: this.headers})
      .toPromise()
      .then(() => development)
      .catch(this.handleError);
  }
  
  getForeignKeyValues(endpoint: String): Promise<Object[]> {
    const url = `${this.apiUrl}/${endpoint}`;
    return this.http
      .get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }
  
  getDevelopmentOptions(): Promise<Object> {
    return this.http
      .options(this.developmentUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }
  
  getOffsetQuestions(): Promise<QuestionBase<any>[]> {    
    return this.http
      .options(this.offsetUrl)
      .toPromise()
      .then(response => { 
        let metadata = response.json();
        let postMetadata = metadata['actions'].POST; 
        var questions = []; 
        var promises = []; 
        for(let md in postMetadata) {
          let item = postMetadata[md];
          if(!item['read_only']) {  
            item['key'] = md; 
            item['order'] = 0;
            item['is_multi'] = null;
                        
            switch(item['type']) {
              case 'integer': { questions.push(new TextboxQuestion(item)); break; }
              case 'choice':  { questions.push(new DropdownQuestion(item)); break; }
              case 'geojson': { 
                item['order'] = 1;
                questions.push(new GeoJsonQuestion(item)); 
                break; 
              }
              case 'foreign key - multi': { 
                let newPromise = this.getForeignKeyValues(item['endpoint']).then(values => {
                  item['is_multi'] = true;
                  item['choices'] = values['results'].map(function(obj) {
                    return {'value': obj['id'], 'display_name': obj['name']}
                  });
                  
                  questions.push(new MultiDropdownQuestion(item));
                  return questions;
                }).catch(this.handleError);
                
                promises.push(newPromise); // A promise to be resolved before returning
                break; 
              }
            }
          }
        }
        
        // Will this actually work for forms with more than one foreign key?
        return Promise.all(promises).then(results => results[results.length - 1]);
      })
  }
  
  getDevelopmentQuestions(): Promise<QuestionBase<any>[]> {    
    return this.http
      .options(this.developmentUrl)
      .toPromise()
      .then(response => { 
        let metadata = response.json();
        let postMetadata = metadata['actions'].POST; 
        var questions = []; 
        var promises = []; 

        for(let md in postMetadata) { 
          let item = postMetadata[md];
          if(!item['read_only']) {  
            item['key'] = md; 
            item['order'] = 0;
            item['is_multi'] = null;
                        
            switch(item['type']) {
              case 'string': { questions.push(new TextboxQuestion(item)); break; }
              case 'integer': { questions.push(new TextboxQuestion(item)); break; }
              case 'date': { questions.push(new DateQuestion(item)); break; }
              case 'choice':  { questions.push(new DropdownQuestion(item)); break; }
              case 'geojson': { 
                item['order'] = 1;
                questions.push(new GeoJsonQuestion(item)); 
                break; 
              }
              case 'foreign key - multi': { 
                let newPromise = this.getForeignKeyValues(item['endpoint']).then(values => {
                  item['is_multi'] = true;
                  item['choices'] = values['results'].map(function(obj) {
                    return {'value': obj['id'], 'display_name': obj['name']}
                  });
                  
                  questions.push(new MultiDropdownQuestion(item));
                  return questions;
                }).catch(this.handleError);
                
                promises.push(newPromise); // A promise to be resolved before returning
                break; 
              }
            }
          }
        }
        
        // Will this actually work for forms with more than one foreign key?
        return Promise.all(promises).then(results => results[results.length - 1]);
      })
  }
  
  createOffset(offset: object): Promise<Object> {
    return this.http
      .post(this.offsetUrl, offset, {headers: this.headers})
      .toPromise()
      .then(res => res.json().data)
      .catch(this.handleError); // TODO show server error back at the form
  }
  
  create(development: object): Promise<Development> {
    return this.http
      .post(this.developmentUrl, development, {headers: this.headers})
      .toPromise()
      .then(res => res.json().data as Development)
      .catch(this.handleError); // TODO show server error back at the form
  }
  
  delete(id: number): Promise<void> {
    const url = `${this.developmentUrl}/${id}`;
    return this.http.delete(url, {headers: this.headers})
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }
}