import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { Development } from './development';

import { DropdownQuestion } from './question-dropdown';
import { QuestionBase }     from './question-base';
import { TextboxQuestion }  from './question-textbox';

@Injectable()
export class DevelopmentService {
  private developmentUrl = 'http://172.16.6.250:8000/developments'; 
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
  
  getDevelopmentOptions(): Promise<Object> {
    return this.http
      .options(this.developmentUrl)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }
  
  create(name: string): Promise<Development> {
    return this.http
      .post(this.developmentUrl, JSON.stringify({name: name}), {headers: this.headers})
      .toPromise()
      .then(res => res.json().data as Development)
      .catch(this.handleError);
  }
  
  getQuestions(): Promise<QuestionBase<any>[]> {
    return this.http
      .options(this.developmentUrl)
      .toPromise()
      .then(response => {
        // Iterate over the metadata and return a questionbase[]
        let questions: QuestionBase<any>[];
        let postMetadata = response.json()['actions'].POST; 
        for(let metadata in postMetadata) {
          let item = postMetadata[metadata];
          let i = 0;
          if(!item['read_only']) {
            i++;
            
            switch(item['type']) {
              case 'integer': {
                questions.push(new TextboxQuestion({
                  key: metadata,
                  label: item['label'],
                  value: '',
                  required: item['required'],
                  order: i
                }));
                break;
              }
              case 'choice': {                      
                questions.push(new DropdownQuestion({
                  key: metadata,
                  label: item['label'],
                  options: item['choices'],
                  order: i
                }));
                break;
              }
            }
          }
        }
        return questions;
      })
      .catch(this.handleError);
      
  }  
}