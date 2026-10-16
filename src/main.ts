import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { VentasService } from './app/services/ventas.service';
import { StorageService } from './app/services/storage.service';

bootstrapApplication(AppComponent, appConfig)
  .then(ref => {
    (window as any).appRef = ref;
    (window as any).ventasService = ref.injector.get(VentasService);
    (window as any).storageService = ref.injector.get(StorageService);
  })
  .catch((err) => console.error(err));
