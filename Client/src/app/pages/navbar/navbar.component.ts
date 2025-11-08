import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})

export class NavbarComponent implements OnInit {
  user: any;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.user = user;
      
      console.log('User from Navbar:', this.user);
    });
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

