import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../services/cart-service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { UserDetailsModel } from '../models/user-details.model';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-order-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-checkout.component.html',
  styleUrls: ['./order-checkout.component.css']
})
export class OrderCheckoutComponent implements OnInit {

  cart: any[] = [];
  total = 0;
  checkoutForm!: FormGroup;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private auth: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    this.cart = this.cartService.getCart();
    this.total = this.cartService.getTotal();

    this.checkoutForm = this.fb.group({
      // Facturare
      billingName: [''],
      billingCUI: [''],
      billingAddress: [''],

      // Livrare
      deliveryAddress: [''],

      // Contact
      contactName: [''],
      contactPhone: ['']
    });

    this.auth.getUserDetails().subscribe((data: UserDetailsModel) => {
      this.checkoutForm.patchValue({
        contactName: `${data.firstName} ${data.lastName}`,
        contactPhone: data.phoneNumber,
        deliveryAddress: data.address,
        billingName: `${data.firstName} ${data.lastName}`
      });
    });
  }


placeOrder() {
  let token = localStorage.getItem('accessToken');

  if (!token) {
    this.router.navigate(['/login']);
    return;
  }

  const order = {
    items: this.cart.map(i => ({
      productId: i.id,
      quantity: i.quantity,
      price: i.price
    })),
    total: this.total,
    ...this.checkoutForm.value
  };

  this.orderService.createOrder(order, token).subscribe({
    next: () => {
      this.cartService.clearCart();
      this.router.navigate(['/profil-user']);
      alert("✅ Comanda ta a fost plasată cu succes!");
    },
    error: (err) => {

      // 💡 Dacă token-ul este expirat → reîmprospătăm automat
      if (err.status === 401) {

        this.auth.refresh().subscribe({
          next: (res) => {
            const newToken = res.accessToken;

            // retrimitem comanda cu token nou
            this.orderService.createOrder(order, newToken).subscribe({
              next: () => {
                this.cartService.clearCart();
                this.router.navigate(['/profil-user']);
                alert("✅ Comanda ta a fost plasată!");
              },
              error: () => alert("❌ Eroare chiar și după refresh.")
            });
          },
          error: () => {
            alert("⚠️ Sesiunea a expirat. Te rugăm să te autentifici.");
            this.router.navigate(['/login']);
          }
        });

      } else {
        alert("❌ A apărut o eroare la trimiterea comenzii.");
      }
    }
  });
}


}
