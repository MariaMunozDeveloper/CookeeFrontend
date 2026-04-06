import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Message } from '../common/interfaces/message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/message`;

  sendMessage(receiverId: string, text: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, { receiver: receiverId, text });
  }

  getSent(page: number = 1): Observable<Message[]> {
    return this.http.get<any>(`${this.apiUrl}/sent/${page}`).pipe(
      map(data => data.messages)
    );
  }

  getReceived(page: number = 1): Observable<Message[]> {
    return this.http.get<any>(`${this.apiUrl}/received/${page}`).pipe(
      map(data => data.messages)
    );
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<any>(`${this.apiUrl}/unread-count`).pipe(
      map(data => data.count)
    );
  }
}
