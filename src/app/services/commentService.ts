import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/comment`;

  getByPublication(publicationId: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/${publicationId}`).pipe(
      map(data => data.comments)
    );
  }

  save(publicationId: string, text: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${publicationId}`, { text });
  }

  remove(commentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${commentId}`);
  }
}
