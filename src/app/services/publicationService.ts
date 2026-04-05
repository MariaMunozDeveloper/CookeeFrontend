import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {
  private apiUrl = 'http://localhost:3000/api/publication';

  constructor(private http: HttpClient) {}

  savePublication(publication: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/save`, publication);
  }

  getFeed(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/feed/${page}`);
  }

  deletePublication(id: string): Observable<any> {
      return this.http.delete(`${this.apiUrl}/remove/${id}`);
  }

  getPublicationsByUser(userId: string, page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}/${page}`);
  }
}
