import { Component, OnInit } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { CartService } from '../services/cart-service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, DecimalPipe],  // ✅ ADĂUGAT
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  cart: any[] = [];
  total: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cart = this.cartService.getCart();
    this.total = this.cartService.getTotal();
  }

  updateQuantity(id: number, change: number) {
    this.cartService.updateQuantity(id, change);
    this.cart = this.cartService.getCart();
    this.total = this.cartService.getTotal();
  }

  removeItem(id: number) {
    this.cartService.removeFromCart(id);
    this.cart = this.cartService.getCart();
    this.total = this.cartService.getTotal();
  }

  clear() {
    this.cartService.clearCart();
    this.cart = [];
    this.total = 0;
  }
}
