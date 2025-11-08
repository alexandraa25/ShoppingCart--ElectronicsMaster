import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-email-confirmation-register',
  standalone: true,
  imports: [],
  templateUrl: './email-confirmation-register.component.html',
  styleUrl: './email-confirmation-register.component.css'
})
export class EmailConfirmarionRegisterComponent {

  message: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.authService.confirmMail(token).subscribe(
        (confirmResponse) => {
          console.log('Email confirmat cu succes:', confirmResponse);
          alert('Email confirmation sent successfully!');
          // Resetăm formularul și navigăm către pagina de login
        },
        (confirmError) => {
          console.error('Eroare la confirmarea email-ului:', confirmError);
          alert('Email confirmation failed. Please check your email and try again.');
        }
      );
    } else {
      this.message = 'Link invalid.';
    }
  }

}
