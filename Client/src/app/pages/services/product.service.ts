import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Configurare pentru injectare globală
})
export class ProductService {
  private apiUrl = 'http://localhost:3000'; // Înlocuiește cu URL-ul backend-ului

  constructor(private http: HttpClient) {
    console.log('AuthService initialized!');
  }

  createProduct(formData: FormData) {
    return this.http.post(`${this.apiUrl}/add-product`, formData);
  }

  getProductById(id: number) {
    return this.http.get<any>(`http://localhost:3000/products/${id}`);
  }

  updateProduct(id: number, data: FormData) {
    return this.http.put(`http://localhost:3000/products/${id}`, data);
  }

}
