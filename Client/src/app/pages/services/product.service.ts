import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {
    console.log('AuthService initialized!');
  }

  createProduct(formData: FormData) {
    return this.http.post(`${this.apiUrl}/add-product`, formData);
  }
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/products`);
  }

  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products/${id}`);
  }

  updateProduct(id: number, formData: FormData) {
    return this.http.put(`${this.apiUrl}/products/${id}`, formData);
  }

  deleteProduct(id: number) {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }
}
