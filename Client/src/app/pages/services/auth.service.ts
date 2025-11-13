import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginResponseModel } from '../models/login-response.model';
import { UserDetailsModel } from '../models/user-details.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000'; 
  private currentUserSubject = new BehaviorSubject<any>(null);
  public user$ = this.currentUserSubject.asObservable();


  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }


  register(formData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, formData); 
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
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }, { withCredentials: true })
      .pipe(
        tap((res) => {
          localStorage.setItem("accessToken", res.accessToken);
          this.setUser(res.user);
        })
      );
  }

  refresh() {
    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap(res => {
          localStorage.setItem("accessToken", res.accessToken);
          this.loadUserFromToken();
        })
      );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .subscribe(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        this.currentUserSubject.next(null);
      });
  }

  saveToken(token: string) {
    localStorage.setItem("token", token);
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken");
  }

  get userRole(): string | null {
    const token = localStorage.getItem('accessToken');
    if (!token || token.split('.').length !== 3) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  }
  setUser(user: any) {
    this.currentUserSubject.next(user);
    localStorage.setItem("user", JSON.stringify(user)); 
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }
 
  deleteUser(id: number) {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }
  activateUser(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/activate`, {});
  }

  loadUserFromToken() {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const payload: any = JSON.parse(atob(token.split('.')[1]));
    this.currentUserSubject.next({ id: payload.id, role: payload.role, email: payload.email });
  }

getUserDetails() {
  const token = localStorage.getItem('accessToken');
  return this.http.get<UserDetailsModel>("http://localhost:3000/get-user-details", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

updateProfile(data: any) {
  const token = localStorage.getItem("accessToken");

  return this.http.put("http://localhost:3000/update-user", data, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
}
