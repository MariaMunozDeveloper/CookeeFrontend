import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../common/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // url del backend
  private apiUrl = 'http://localhost:3000/api/user';

  constructor(private http: HttpClient) {}

  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(user: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user);
  }

  getIdentity(): any {
    const user = localStorage.getItem('user');

    if (user && user !== 'undefined') {
      return JSON.parse(user);
    } else {
      return null;
    }
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');

    if (token && token !== 'undefined') {
      return token;
    } else {
      return null;
    }
  }

  logout(): void {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }


}
