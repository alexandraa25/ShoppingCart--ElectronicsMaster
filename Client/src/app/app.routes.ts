import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(c => c.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(c => c.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(c => c.DashboardComponent) },
  { path: 'email-confirmation-register', loadComponent: () => import('./pages/email-confirmation-register/email-confirmation-register.component').then(c => c.EmailConfirmarionRegisterComponent) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })], // Adaugă `{ useHash: true }` dacă serverul nu suportă URL rewriting.
  exports: [RouterModule]
})
export class AppRoutingModule {}
