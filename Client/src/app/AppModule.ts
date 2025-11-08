import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient() // Aici furnizăm HttpClient pentru întreaga aplicație
  ]
}).catch(err => console.error(err));
