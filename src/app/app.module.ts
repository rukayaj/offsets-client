import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { RouterModule }   from '@angular/router';

import { AppComponent }        from './app.component';
import { DashboardComponent }  from './dashboard.component';
import { DevelopmentDetailComponent } from './development-detail.component';
//import { DevelopmentsComponent }     from './developments.component';
import { DevelopmentService }         from './development.service';

import { AppRoutingModule }     from './app-routing.module';
import { HttpModule } from "@angular/http";

import { Component, PlatformRef } from '@angular/core';
import { platformBrowserDynamic }           from '@angular/platform-browser-dynamic';

import { LeafletModule } from '@asymmetrik/angular2-leaflet';

import { DataTableModule } from 'angular-4-data-table-bootstrap-4';

const platform: PlatformRef = platformBrowserDynamic();

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpModule,
    LeafletModule,
    NgbModule.forRoot(),
    DataTableModule
  ],
  declarations: [
    AppComponent,
    DashboardComponent,
    DevelopmentDetailComponent,
    //HeroesComponent
  ],
  providers: [DevelopmentService],
  bootstrap: [AppComponent]
})
export class AppModule {
}

document.addEventListener('DOMContentLoaded', () => {
    platform.bootstrapModule(AppModule);
});