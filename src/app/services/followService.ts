import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private apiUrl = 'http://localhost:3000/api/follow';

  constructor(private http: HttpClient) {}

  followUser(followedId: string): Observable<any> {
    return this.http.post(this.apiUrl, { followed: followedId });
  }

  unfollowUser(followedId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${followedId}`);
  }




}
