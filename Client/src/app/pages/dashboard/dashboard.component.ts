import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ProductFormComponent } from '../product-form/product-form.component';
import { AuthService } from '../services/auth.service';
import { PopupMessageComponent } from '../popup-message/popup-message.component';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../services/order.service';

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
  orders: any[] = [];

  searchUserName = "";
  itemsPerPage = 10;
  currentUserPage = 1;

  popupVisible = false;
  popupTitle = '';
  popupMessage = '';
  popupIsError = false;
  popupConfirmMode = false;

  userTargetId: number | null = null;

  constructor(private authService: AuthService, private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadOrders();
  }

  loadUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = [...data];
        this.paginateUsers();
      }
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

  confirmDeleteUser(id: number): void {
    this.popupTitle = "Ștergere utilizator";
    this.popupMessage = "Ești sigur că vrei să ștergi acest utilizator?";
    this.popupConfirmMode = true;
    this.userTargetId = id;
    this.popupVisible = true;
  }

  handleConfirm(): void {
    if (!this.userTargetId) return;

    this.authService.deleteUser(this.userTargetId).subscribe(() => {
      this.showPopup("Succes", "Utilizator șters.");
      this.loadUsers();
    });
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

  loadOrders() {
    this.orderService.getAllOrders().subscribe({
      next: (data: any[]) => {
        this.orders = data;
      },
      error: (err) => {
        console.log("❌ Eroare la încărcare comenzi:", err);
      }
    });
  }
}
