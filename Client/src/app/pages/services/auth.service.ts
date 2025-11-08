import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginResponseModel } from '../models/login-response.model';

@Injectable({
  providedIn: 'root', // Configurare pentru injectare globală
})
export class AuthService {
  private apiUrl = 'http://localhost:3000'; // Înlocuiește cu URL-ul backend-ului
  private currentUserSubject = new BehaviorSubject<any>(null);
  public user$ = this.currentUserSubject.asObservable();


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

  login(email: string, password: string) {
    return this.http.post<LoginResponseModel>(`${this.apiUrl}/login`, { email, password });
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('token'); // ✅ corect
  }

  saveToken(token: string) {
    localStorage.setItem("token", token);
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  }
  
  get userRole(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.role ?? null;
}


}
