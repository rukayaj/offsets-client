import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { Development } from './development';

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
  
  create(name: string): Promise<Development> {
    return this.http
      .post(this.developmentUrl, JSON.stringify({name: name}), {headers: this.headers})
      .toPromise()
      .then(res => res.json().data as Development)
      .catch(this.handleError);
  }
}