import { inject, Component } from '@angular/core';
import { UserService } from '../../services/userService';
import { UserCardComponent } from '../user-card/user-card';
import { FollowService } from '../../services/followService';
import { RouterLink } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [UserCardComponent, RouterLink, LoadingSpinner],
  templateUrl: './people.html',
  styleUrl: './people.css'
})
export class PeopleComponent {
  private readonly userService: UserService = inject(UserService);
  private readonly followService: FollowService = inject(FollowService);

  users: WritableSignal<any[]> = signal<any[]>([]);
  loading: WritableSignal<boolean> = signal<boolean>(false);
  page: number = 1;
  totalPages: number = 1;
  following: string[] = [];
  followed: string[] = [];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);

    this.userService.getUsers(this.page).subscribe({
      next: (response: any) => {
        const identity = localStorage.getItem('user');
        const currentUser = identity ? JSON.parse(identity) : null;

        this.users.set(response.users.filter(
          (user: any) => user._id !== currentUser?._id
        ));

        this.totalPages = response.totalPages;
        this.following = response.following || [];
        this.followed = response.followed || [];
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
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

  isFollowing(userId: string): boolean {
    return this.following.includes(userId);
  }

  isFriend(userId: string): boolean {
    return this.following.includes(userId) && this.followed.includes(userId);
  }

  follow(userId: string): void {
    this.followService.followUser(userId).subscribe({
      next: () => {
        this.following.push(userId);
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  unfollow(userId: string): void {
    this.followService.unfollowUser(userId).subscribe({
      next: () => {
        this.following = this.following.filter(id => id !== userId);
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }
}
