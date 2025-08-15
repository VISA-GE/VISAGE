import { Component, ViewEncapsulation } from '@angular/core';
import { NgxIgvComponent } from '../../projects/ngx-igv/src/public-api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgxIgvComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class AppComponent {}
