import { Component, OnChanges, OnInit, SimpleChanges, input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { CheckUserModel } from '../models/check-user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class RegisterComponent implements OnInit, OnChanges {
  readonly userData = input<any>();
  registerForm!: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      emailAddress: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
          ),
        ],
      ],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: [''],
      phoneNumber: ['', Validators.pattern('^[0-9]*$')],
      roleId: [2, Validators.required] ,// Setăm valoarea implicită 2,
      profileImage: [null], // Adăugat controlul profileImage
    });

    console.log("RegisterForm" + this.registerForm.controls); // Log pentru a verifica controlul
  }

  get isFormValid(): boolean {
    return this.registerForm.valid;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userData']) {
      this.updateFormWithUserData(changes['userData'].currentValue);
    }
  }

  updateFormWithUserData(userData: any): void {
    if (userData) {
      this.registerForm.patchValue({
        username: userData.username || '',
        emailAddress: userData.emailAddress || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        address: userData.address || '',
        phoneNumber: userData.phoneNumber || '',
        roleId: userData.roleId || '',
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log("Fișier selectat:", file);
      this.selectedFile = file;
      this.registerForm.get('profileImage')?.setValue(file);
    }
  }

  onSubmit(): void {

    console.log('RegisterForme = ' + this.registerForm);

    // if (this.registerForm.invalid) {
    //   alert('Formular invalid. Te rugăm să verifici câmpurile.');
    //   return;
    // }

    const email = this.registerForm.get('emailAddress')?.value;
    const phoneNumber = this.registerForm.get('phoneNumber')?.value;
    console.log('Email = ', email);
    console.log('PhoneNumber = ', phoneNumber);
    const checkUserModel = new CheckUserModel(email, phoneNumber);

    // Verificăm dacă utilizatorul există înainte de a continua
    this.authService.checkUserExistence(email, phoneNumber).subscribe(
      (response) => {
        console.log('exist =', response.exist);
        if (response.exists) {
          console.log('Mesaj= ' + response.message);
          alert(response.message); // Mesaj primit de la backend
        } else {
          this.processRegistration();
        }
      },
      (error) => {
        console.error('Eroare la verificarea utilizatorului:', error);
        alert('A apărut o eroare. Te rugăm să încerci din nou.');
      }
    );
  }
    

  processRegistration(): void {

    const formData = new FormData();
    formData.append('Username', this.registerForm.get('username')?.value);
    formData.append('EmailAddress', this.registerForm.get('emailAddress')?.value);
    formData.append('Password', this.registerForm.get('password')?.value);
    formData.append('FirstName', this.registerForm.get('firstName')?.value);
    formData.append('LastName', this.registerForm.get('lastName')?.value);
    formData.append('Address', this.registerForm.get('address')?.value);
    formData.append('PhoneNumber', this.registerForm.get('phoneNumber')?.value);
    formData.append('RoleId', this.registerForm.get('roleId')?.value);

    if (this.selectedFile) {
      formData.append('ProfileImage', this.registerForm.get('profileImage')?.value);
    }

    this.authService.register(formData).subscribe(
      (response) => {
        alert('Utilizator înregistrat cu succes!');
        this.registerForm.reset();
        this.selectedFile = null;
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Eroare la înregistrare:', error);
        alert('Înregistrarea a eșuat. Te rugăm să încerci din nou.');
      }
    );
  }
}
