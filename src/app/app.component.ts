import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
   <h1>{{title}}</h1>
   <ul class="nav nav-tabs">
     <li class="nav-item"><a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Home</a></li>
     <li class="nav-item"><a class="nav-link" routerLink="/statistics" routerLinkActive="active">Statistics</a></li>
   </ul>
   <router-outlet></router-outlet>
 `,
})
export class AppComponent {
  title = 'SANBI offsets';
}



