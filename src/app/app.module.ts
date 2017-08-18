import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { RouterModule }   from '@angular/router';

import { AppComponent }        from './app.component';
import { DashboardComponent }  from './dashboard/dashboard.component';
import { DevelopmentDetailComponent } from './development/development-detail.component';
import { DevelopmentFormComponent } from './development/development-form.component';
import { DynamicFormQuestionComponent } from './dynamic-form/dynamic-form-question.component';
//import { DynamicFormComponent } from './dynamic-form.component';
import { DevelopmentService }         from './services/development.service';
import { BGISService }         from './services/bgis.service';

import { AppRoutingModule }     from './app-routing.module';
import { HttpModule } from "@angular/http";

import { Component, PlatformRef } from '@angular/core';
import { platformBrowserDynamic }           from '@angular/platform-browser-dynamic';

import { LeafletModule } from '@asymmetrik/angular2-leaflet';

const platform: PlatformRef = platformBrowserDynamic();

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpModule,
    LeafletModule,
    NgbModule.forRoot(), 
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  declarations: [
    AppComponent,
    DashboardComponent,
    DevelopmentDetailComponent,
    DevelopmentFormComponent,
    DynamicFormQuestionComponent,
    //DynamicFormComponent
  ],
  providers: [DevelopmentService, BGISService],
  bootstrap: [AppComponent]
})
export class AppModule {
}

document.addEventListener('DOMContentLoaded', () => {
    platform.bootstrapModule(AppModule);
});