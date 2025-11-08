import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app.routes';
import { NgModule } from '@angular/core';
import { routes } from './app.routes';
import { RouterModule } from '@angular/router';
import { AuthService } from './pages/services/auth.service';

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    RouterModule.forRoot(routes)
  ]
})
export class AppModule {}
