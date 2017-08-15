import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { Development } from './development';

import { QuestionBase }              from './question-base';
import { QuestionControlService }    from './question-control.service';

import { MultiDropdownQuestion } from './question-multidropdown';
import { DropdownQuestion } from './question-dropdown';
import { TextboxQuestion }  from './question-textbox';
import { GeoJsonQuestion }  from './question-geojson';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Rx';



@Injectable()
export class DevelopmentService {
  private apiUrl = 'http://127.0.0.1:8000'; 
  //private apiUrl = 'http://172.16.6.250:8000'; 
  private developmentUrl = this.apiUrl + '/developments'; 
  private headers = new Headers({'Content-Type': 'application/json'});
  developmentOptions = {};
  
  constructor(private http: Http) {
    this.getDevelopmentQuestions().then(result => this.developmentOptions = result);
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
  
  
  simpleGetQs(): Observable<QuestionBase<any>[]> {
    return this.http
      .options(this.developmentUrl)
      .map(response => { 
        let metadata = response.json();
        let postMetadata = metadata['actions'].POST; 
        var questions = []; 
        
        for(let md in postMetadata) {
          let item = postMetadata[md];
          
          if(!item['read_only']) {            
            item['key'] = md; 
            switch(item['type']) {
              case 'integer': { questions.push(new TextboxQuestion(item)); break; }
              case 'choice':  { questions.push(new DropdownQuestion(item)); break; }
              case 'geojson': { questions.push(new GeoJsonQuestion(item)); break; }
              case 'foreign key': { 
                this.getForeignKeyValues(item['endpoint']).then(values => {
                  item['choices'] = values['results'].map(function(obj) {
                    return {'value': obj['id'], 'display_name': obj['name']}
                  });
                  
                  questions.push(new DropdownQuestion(item));
                }).catch(this.handleError);
                break; 
              }
            }
          }
        }
        
        return questions;
      });
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
            item['is_multi'] = null;
            switch(item['type']) {
              case 'integer': { questions.push(new TextboxQuestion(item)); break; }
              case 'choice':  { questions.push(new DropdownQuestion(item)); break; }
              case 'geojson': { questions.push(new GeoJsonQuestion(item)); break; }
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
  
  create(development: object): Promise<Development> {
    return this.http
      .post(this.developmentUrl, development, {headers: this.headers})
      .toPromise()
      .then(res => res.json().data as Development)
      .catch(this.handleError); // TODO show server error back at the form
  }
}