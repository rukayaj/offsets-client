import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { Development } from './development';

import { QuestionBase }              from './question-base';
import { QuestionControlService }    from './question-control.service';

import { DropdownQuestion } from './question-dropdown';
import { TextboxQuestion }  from './question-textbox';
import { GeoJsonQuestion }  from './question-geojson';
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Rx';



@Injectable()
export class DevelopmentService {
  private apiUrl = 'http://127.0.0.1:8000'; 
  private developmentUrl = this.apiUrl + '/developments'; 
  private headers = new Headers({'Content-Type': 'application/json'});
  
  constructor(private http: Http) { }

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
        /*
        let questions: QuestionBase<any>[] = [
          new DropdownQuestion({
            key: 'brave',
            label: 'Bravery Rating',
            options: [
              {key: 'solid',  value: 'Solid'},
              {key: 'great',  value: 'Great'},
              {key: 'good',   value: 'Good'},
              {key: 'unproven', value: 'Unproven'}
            ],
            order: 3
          }),
     
          new TextboxQuestion({
            key: 'firstName',
            label: 'First name',
            value: 'Bombasto',
            required: true,
            order: 1
          }),
        ];
        return questions;
        */
        let metadata = response.json();
        let postMetadata = metadata['actions'].POST; 
        var questions = []; 
        
        for(let md in postMetadata) {
          let item = postMetadata[md];
          let i = 0;
          if(!item['read_only']) {
            i++;
            
            
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
      }).catch(this.handleError);
  }
  
  create(name: string): Promise<Development> {
    return this.http
      .post(this.developmentUrl, JSON.stringify({name: name}), {headers: this.headers})
      .toPromise()
      .then(res => res.json().data as Development)
      .catch(this.handleError);
  }
}