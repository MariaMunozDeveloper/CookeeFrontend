import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/user';

  constructor(private http: HttpClient) {}

  getCounters(userId?: string): Observable<any> {
    if (userId) {
      return this.http.get(`${this.apiUrl}/counters/${userId}`);
    }

    return this.http.get(`${this.apiUrl}/counters`);
  }

  getStats(): any {
    const stats = localStorage.getItem('stats');

    if (stats && stats !== 'undefined') {
      return JSON.parse(stats);
    }

    return null;
  }

  updateUser(userData: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/update`, userData);
  }

  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post(`${this.apiUrl}/upload-avatar`, formData);
  }

  getUsers(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }
}
