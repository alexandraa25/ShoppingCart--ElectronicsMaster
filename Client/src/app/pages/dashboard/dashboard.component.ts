import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ProductFormComponent } from '../product-form/product-form.component';
import { AuthService } from '../services/auth.service';
import { PopupMessageComponent } from '../popup-message/popup-message.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatTabsModule, ProductFormComponent, PopupMessageComponent, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];
  paginatedUsers: any[] = [];

  searchUserName: string = "";
  itemsPerPage = 10;
  currentUserPage = 1;

  popupVisible = false;
  popupTitle = '';
  popupMessage = '';
  popupIsError = false;
  popupConfirmMode = false;

 userAction: 'delete' | 'suspend' | 'activate' | null = null;
  userTargetId: number | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = [...data];
        this.paginateUsers();
      },
      error: () => this.showPopup("Eroare", "Nu am putut încărca utilizatorii.", true)
    });
  }

  filterUsers(): void {
    const search = this.searchUserName.toLowerCase();
    this.filteredUsers = this.users.filter(u => u.name.toLowerCase().includes(search));
    this.currentUserPage = 1;
    this.paginateUsers();
  }

  paginateUsers(): void {
    const start = (this.currentUserPage - 1) * this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(start, start + this.itemsPerPage);
  }

  get totalUserPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  previousUserPage(): void {
    if (this.currentUserPage > 1) this.currentUserPage--;
    this.paginateUsers();
  }

  nextUserPage(): void {
    if (this.currentUserPage < this.totalUserPages) this.currentUserPage++;
    this.paginateUsers();
  }

  // ✅ Open popup to suspend
  confirmSuspendUser(id: number): void {
    this.popupTitle = "Suspendare Utilizator";
    this.popupMessage = "Sigur vrei să suspendezi acest utilizator?";
    this.popupConfirmMode = true;
    this.userAction = "suspend";
    this.userTargetId = id;
    this.popupVisible = true;
  }

  // ✅ Open popup to delete
  confirmDeleteUser(id: number): void {
    this.popupTitle = "Ștergere Utilizator";
    this.popupMessage = "Ești sigur că vrei să ștergi definitiv acest utilizator?";
    this.popupConfirmMode = true;
    this.userAction = "delete";
    this.userTargetId = id;
    this.popupVisible = true;
  }
  confirmActivateUser(id: number): void {
  this.popupTitle = "Activare Utilizator";
  this.popupMessage = "Ești sigur că vrei să reactivezi acest utilizator?";
  this.popupConfirmMode = true;
  this.userAction = "activate";
  this.userTargetId = id;
  this.popupVisible = true;
}

  // ✅ Executes suspend/delete after confirm
handleConfirm(): void {
  if (!this.userTargetId || !this.userAction) return;

  if (this.userAction === "suspend") {
    this.authService.suspendUser(this.userTargetId).subscribe(() => {
      this.showPopup("Succes", "Utilizator suspendat.");
      this.loadUsers();
    });
  }

  if (this.userAction === "delete") {
    this.authService.deleteUser(this.userTargetId).subscribe(() => {
      this.showPopup("Succes", "Utilizator șters.");
      this.loadUsers();
    });
  }

  if (this.userAction === "activate") {
    this.authService.activateUser(this.userTargetId).subscribe(() => {
      this.showPopup("Succes", "Utilizator reactivat.");
      this.loadUsers();
    });
  }
}

  showPopup(title: string, message: string, isError: boolean = false): void {
    this.popupTitle = title;
    this.popupMessage = message;
    this.popupIsError = isError;
    this.popupConfirmMode = false;
    this.popupVisible = true;
  }

  closePopup(): void {
    this.popupVisible = false;
  }
}
