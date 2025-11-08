import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] // <- corect
})
export class NavbarComponent implements OnInit {
  user: any;
  cartCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cart: CartService            // <- injecție corectă
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(u => this.user = u);
    // ia valoarea curentă + actualizări
    this.cart.cartCount$.subscribe(count => (this.cartCount = count));
  }

  
  logout() {
    this.authService.logout();
    window.location.href = '/login'; // Sau router.navigate
  }

  goToAnnouncements() {

    this.router.navigate(['/announcement-list']); // fără queryParams
   
  }

 goToProfile() {
  const token = sessionStorage.getItem('token'); // sau localStorage

  if (!token) {
    this.router.navigate(['/login']);
    return;
  }

  try {
    const decoded: any = jwtDecode(token);
    // rolul e stocat sub cheia completă
    const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    console.log('Navigating based on role:', role);

    if (role === 'User') {
      this.router.navigate(['/profil-user']);
    } else {
      this.router.navigate(['/user-dashboard']);
    }

  } catch (error) {
    console.error('Invalid token:', error);
    this.router.navigate(['/login']);
  }
}


}

function jwtDecode(token: string): any {
  throw new Error('Function not implemented.');
}

