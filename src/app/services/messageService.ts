import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/message`;

  constructor(private http: HttpClient) {}

  sendMessage(receiverId: string, text: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, { receiver: receiverId, text });
  }

  getSent(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/sent/${page}`);
  }

  getReceived(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/received/${page}`);
  }

  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/unread-count`);
  }
}
