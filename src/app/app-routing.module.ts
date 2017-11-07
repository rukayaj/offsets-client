import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent }   from './dashboard/dashboard.component';
import { DevelopmentDetailComponent }  from './development/development-detail.component';
import { DevelopmentFormComponent }  from './development/development-form.component';
import { StatisticsComponent }  from './statistics/statistics.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard',  component: DashboardComponent },
  { path: 'detail/:id', component: DevelopmentDetailComponent },
  { path: 'create', component: DevelopmentFormComponent },
  { path: 'statistics', component: StatisticsComponent },
  //{ path: 'developments',     component: DevelopmentsComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}