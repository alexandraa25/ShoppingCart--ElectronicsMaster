import { Component, OnChanges, OnInit, SimpleChanges, input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { PopupMessageComponent } from '../popup-message/popup-message.component';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, ReactiveFormsModule, PopupMessageComponent]
})
export class RegisterComponent implements OnInit, OnChanges {
  readonly userData = input<any>();
  registerForm!: FormGroup;
  selectedFile: File | null = null;

  popupTitle: string = '';
  popupMessage: string = '';
  popupIsError: boolean = false;
  popupVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      emailAddress: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern( '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'),
        ],
      ],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: [''],
      phoneNumber: ['', Validators.pattern('^[0-9]*$')],
      roleId: [2, Validators.required]
    });
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
      this.selectedFile = file;
      this.registerForm.get('profileImage')?.setValue(file);
    }
  }

  onSubmit(): void {

    if (this.registerForm.invalid) {
      console.log('xx');
      this.showPopup('Eroare', 'Formular invalid. Te rugăm să verifici câmpurile.', true);
      return;
    }

    const email = this.registerForm.get('emailAddress')?.value;
    const phoneNumber = this.registerForm.get('phoneNumber')?.value;

    this.authService.checkUserExistence(email, phoneNumber).subscribe(
      (response) => {
        if (response.exists) {
          this.showPopup('Eroare', response.message, true);
        } else {
          this.processRegistration();
        }
      },
      (error) => {
        this.showPopup('Eroare', 'Eroare la verificarea utilizatorului.', true);
        return;
      }
    );
  }

  processRegistration(): void {

    const userData = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.emailAddress,
      password: this.registerForm.value.password,
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      address: this.registerForm.value.address,
      phoneNumber: this.registerForm.value.phoneNumber,
      roleId: this.registerForm.value.roleId
    };

    this.authService.register(userData).subscribe(
      (response) => {
        this.showPopup('Succes', 'Utilizator înregistrat cu succes!', true),
          this.registerForm.reset();
        this.selectedFile = null;
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Eroare la înregistrare:', error);
        this.showPopup('Eroare', 'Înregistrarea a eșuat. Te rugăm să încerci din nou', true);
        return;
      }
    );
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
