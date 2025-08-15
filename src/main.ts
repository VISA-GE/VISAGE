import { createApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { ApplicationRef } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { AppComponent } from './app/app.component';

(async () => {
  const app: ApplicationRef = await createApplication(appConfig);

  // Define Web Components
  const visageComponent = createCustomElement(AppComponent, {
    injector: app.injector,
  });
  customElements.define('visa-ge', visageComponent);
})();
