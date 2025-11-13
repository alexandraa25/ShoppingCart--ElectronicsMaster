import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar'
import { PopupMessageComponent } from '../popup-message/popup-message.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PopupMessageComponent],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  popupTitle: string = '';
  popupMessage: string = '';
  popupIsError: boolean = false;
  popupVisible: boolean = false;


  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService, private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.showPopup('', 'Vă rugăm să completați toate câmpurile.', true);
      return;
    }

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response: any) => {

        this.showPopup('', 'Autentificare reușită!', false);
        const role = this.authService.userRole;
        if (role === 'ADMIN') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/product-list']);
        }
      },
      error: () => {
        this.showPopup('', 'Email sau parolă incorecte!', true);
      }
    });
  }

  showPopup(title: string, message: string, isError: boolean): void {
    this.popupTitle = title;
    this.popupMessage = message;
    this.popupIsError = isError;
    this.popupVisible = true;
  }

  closePopup(): void {
    this.popupVisible = false;
  }
}
