import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent }   from './dashboard.component';
import { DevelopmentDetailComponent }  from './development-detail.component';
import { DevelopmentFormComponent }  from './development-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard',  component: DashboardComponent },
  { path: 'detail/:id', component: DevelopmentDetailComponent },
  { path: 'create', component: DevelopmentFormComponent },
  //{ path: 'developments',     component: DevelopmentsComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}