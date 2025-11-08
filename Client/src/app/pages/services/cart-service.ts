import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private storageKey = 'shopping_cart';
cartCount$ = new BehaviorSubject<number>(0);

  constructor() { 
    this.updateCount();
  }

  private updateCount() {
    const cart = this.getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCount$.next(count);
  }
  getCart(): any[] {
    const cart = localStorage.getItem(this.storageKey);
    return cart ? JSON.parse(cart) : [];
  }

  private saveCart(cart: any[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
  }

addToCart(product: any, quantity: number = 1): void {
  let cart = this.getCart();

  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  this.saveCart(cart);
}

  removeFromCart(productId: number): void {
    let cart = this.getCart();
    cart = cart.filter(item => item.id !== productId);
    this.saveCart(cart);
  }

  clearCart(): void {
    localStorage.removeItem(this.storageKey);
  }

  getTotal(): number {
    return this.getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  updateQuantity(productId: number, change: number): void {
    let cart = this.getCart();
    const item = cart.find(p => p.id === productId);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
      cart = cart.filter(p => p.id !== productId);
    }

    this.saveCart(cart);
  }
  
}
