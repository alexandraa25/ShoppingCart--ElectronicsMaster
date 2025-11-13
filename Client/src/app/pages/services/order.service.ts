import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrderModel } from '../models/order-model';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) { }

    private authHeaders() {
        const token = localStorage.getItem('accessToken');
        return {
            headers: new HttpHeaders({
                Authorization: `Bearer ${token}`
            })
        };
    }

    // 🔥 1. Creare comandă

    createOrder(order: any) {
        const token = localStorage.getItem("accessToken");
        return this.http.post(`${this.apiUrl}/create-order`, order, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    // 📦 2. Comenzile utilizatorului
    getMyOrders() {
        return this.http.get(`${this.apiUrl}/my-orders`, this.authHeaders());
    }

    // 🔍 3. Detalii comandă
    getOrderById(orderId: number) {
        return this.http.get(`${this.apiUrl}/orders/${orderId}`, this.authHeaders());
    }

    getUserOrders() {
  const token = localStorage.getItem("accessToken");
  return this.http.get(`${this.apiUrl}/orders`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
getAllOrders() {
  const token = localStorage.getItem("accessToken") ?? '';
  return this.http.get<any[]>(`${this.apiUrl}/admin/orders`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
}
