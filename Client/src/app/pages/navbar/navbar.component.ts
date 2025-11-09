import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart-service';
import { jwtDecode } from 'jwt-decode';

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
  ) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(u => this.user = u);
    // ia valoarea curentă + actualizări
    this.cart.cartCount$.subscribe(count => (this.cartCount = count));
    this.authService.user$.subscribe(u => this.user = u);
  }


  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToAnnouncements() {
    this.router.navigate(['/announcement-list']); // fără queryParams
  }

  goToProfile() {
    const token = localStorage.getItem('accessToken'); // sau localStorage


    console.log('Token retrieved from sessionStorage:', token); 
    
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    try {


      const decoded: any = jwtDecode(token);

      console.log('Decoded token:', decoded);
      const role = decoded["role"];

      console.log('Navigating based on role:', role);

      if (role === 'User') {
        this.router.navigate(['/profil-user']);
      } else {
        this.router.navigate(['/admin-dashboard']);
      }

    } catch (error) {
      console.error('Invalid token:', error);
      this.router.navigate(['/login']);
    }
  }

}



