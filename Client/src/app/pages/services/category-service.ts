import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient) {
    console.log('AuthService initialized!');
  }

  getCategories() {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }
}
