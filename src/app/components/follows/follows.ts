import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FollowService } from '../../services/followService';

@Component({
  selector: 'app-follows',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './follows.html',
  styleUrl: './follows.css'
})
export class FollowsComponent {
modo: 'following' | 'followers' = 'following';
  userId: string = '';

  users: any[] = [];
  page: number = 1;
  totalPages: number = 1;
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private followService: FollowService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = params['id'] || '';
      this.modo = params['modo'] === 'followers' ? 'followers' : 'following';
      this.page = 1;
      this.users = [];
      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.loading = true;

    const request = this.modo === 'following'
      ? this.followService.getFollowing(this.userId || undefined, this.page)
      : this.followService.getFollowers(this.userId || undefined, this.page);

    request.subscribe({
      next: (response: any) => {
        // following devuelve el campo 'followed', followers devuelve 'user'
        this.users = response.follows.map((f: any) =>
          this.modo === 'following' ? f.followed : f.user
        );
        this.totalPages = response.pages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadUsers();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadUsers();
    }
  }

  get titulo(): string {
    return this.modo === 'following' ? 'Siguiendo' : 'Seguidores';
  }
}
