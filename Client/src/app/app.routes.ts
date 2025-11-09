import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminDashboardComponent } from './pages/dashboard/dashboard.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from './components/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(c => c.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(c => c.RegisterComponent) },
  { path: 'product-form', loadComponent: () => import('./pages/product-form/product-form.component').then(c => c.ProductFormComponent), canActivate: [AuthGuard] },
  { path: 'product-list', loadComponent: () => import('./pages/product-list/product-list.component').then(c => c.productListComponent) },
  { path: 'product-detail', loadComponent: () => import('./pages/product-detail/product-detail.component').then(c => c.ProductDetailComponent)},
  { path: 'cart', loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent), canActivate: [AuthGuard] },
  { path: 'admin-dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [AuthGuard] },
  { path: 'profil-user', loadComponent: () => import('./pages/profil-user/profil-user.component').then(m => m.ProfilUserComponent), canActivate: [AuthGuard] },
  { path: 'checkout', loadComponent: () => import('./pages/order-checkout/order-checkout.component').then(c => c.OrderCheckoutComponent), canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })], // Adaugă `{ useHash: true }` dacă serverul nu suportă URL rewriting.
  exports: [RouterModule]
})
export class AppRoutingModule {}
