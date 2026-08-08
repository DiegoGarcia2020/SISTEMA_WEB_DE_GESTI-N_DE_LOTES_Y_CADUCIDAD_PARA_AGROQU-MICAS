import 'zone.js';

// Polyfill para 'global' requerido por sockjs-client y @stomp/stompjs en el navegador
(window as any).global = window;
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
