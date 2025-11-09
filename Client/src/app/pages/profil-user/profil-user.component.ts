import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profil-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profil-user.component.html',
  styleUrl: './profil-user.component.css'
})
export class ProfilUserComponent {

  user: any;
  editMode = false;
  profileForm!: FormGroup;

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {

    this.profileForm = this.fb.group({
      id: [''],
      firstName: [''],
      lastName: [''],
      name: [''],
      email: [''],
      phoneNumber: [''],
      address: ['']
    });

    this.auth.getUserDetails().subscribe({
      next: (data: any) => {
        this.user = data;
        this.profileForm.patchValue({
          id: data.id || data.Id,                   // <-- aici reparăm
          firstName: data.firstName || data.FirstName,
          lastName: data.lastName || data.LastName,
          name: data.name || data.Name,
          email: data.email || data.Email,
          phoneNumber: data.phoneNumber || data.PhoneNumber,
          address: data.address || data.Address
        });
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  enableEdit() {
    this.editMode = true;
  }

  cancelEdit() {
    this.editMode = false;
  }

  saveProfile() {
    this.auth.updateProfile(this.profileForm.value).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.editMode = false;
      },
      error: () => alert("Eroare la salvare!")
    });
  }

}
