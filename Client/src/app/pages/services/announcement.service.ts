import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Configurare pentru injectare globală
})
export class AnnouncementService {
  private apiUrl = 'https://localhost:7041/api/Announcement'; // Înlocuiește cu URL-ul backend-ului

  constructor(private http: HttpClient) {
    console.log('AuthService initialized!');
  }

  addAnnouncement(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, formData);
  }

  getAnnouncements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/list`);
  }
}
