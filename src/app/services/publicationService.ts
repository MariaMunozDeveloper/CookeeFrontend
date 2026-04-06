import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {
  private apiUrl = `${environment.apiUrl}/publication`;

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

  uploadImage(publicationId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file0', file);
    return this.http.post(`${this.apiUrl}/upload/${publicationId}`, formData);
  }

  getPublicationCounters(userId?: string): Observable<any> {
    if (userId) {
      return this.http.get(`${this.apiUrl}/count/${userId}`);
    }
    return this.http.get(`${this.apiUrl}/count`);
  }
}
