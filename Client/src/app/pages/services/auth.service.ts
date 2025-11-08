import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { CheckUserModel } from '../models/check-user.model';

@Injectable({
  providedIn: 'root', // Configurare pentru injectare globală
})
export class AuthService {
  private apiUrl = 'https://localhost:7041/api/Register'; // Înlocuiește cu URL-ul backend-ului

  constructor(private http: HttpClient) {
    console.log('AuthService initialized!');
  }

  register(formData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, formData); // Cerere POST către backend
  }

  confirmMail(token: string) {

    const url = `${this.apiUrl}/confirm-email?token=${encodeURIComponent(token)}}`;
    console.log('URL:', url); 
    return this.http.get<any>(url);
  }

  checkUserExistence(email: string, phoneNumber: string): Observable<any> {
    const url = `${this.apiUrl}/check-user-existence`;
    const params = new HttpParams()
      .set('email', email)
      .set('phoneNumber', phoneNumber);
  
    return this.http.get<any>(url, { params });
  }

  login(email: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/login`;
    const params = new HttpParams()
      .set('email', email)
      .set('password', password);
  
    return this.http.get<any>(url, { params }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Login error:', error.message);
        return throwError(() => new Error('Login failed'));
      })
    );
  }

}
