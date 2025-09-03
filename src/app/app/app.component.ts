import { Component, effect, inject, computed } from '@angular/core';
import { State } from '../state.store';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TrackHubsComponent } from './data-sources/track-hubs/track-hubs.component';
import { CustomUploadComponent } from './data-sources/custom-upload/custom-upload.component';
import { IgvComponent } from './genome-views/igv/igv.component';
import { GenesComponent } from './downstream-analyses/genes/genes.component';
import { DrugstOneComponent } from './downstream-analyses/drugst-one/drugst-one.component';
import { ElementOverviewComponent } from './elements/element-overview/element-overview.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';

@Component({
  selector: 'lib-app',
  standalone: true,
  imports: [
    SidebarComponent,
    TrackHubsComponent,
    IgvComponent,
    GenesComponent,
    DrugstOneComponent,
    CustomUploadComponent,
    ElementOverviewComponent,
    ToastContainerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  state = inject(State);
  page = this.state.page;
}
