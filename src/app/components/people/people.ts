import { Component } from '@angular/core';
import { UserService } from '../../services/userService';
import { UserCardComponent } from '../user-card/user-card';
import { FollowService } from '../../services/followService';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [UserCardComponent, RouterLink],
  templateUrl: './people.html',
  styleUrl: './people.css'
})
export class PeopleComponent {
  users: any[] = [];
  page: number = 1;
  totalPages: number = 1;
  loading: boolean = false;

  following: string[] = [];
  followed: string[] = [];

  constructor(private userService: UserService, private followService: FollowService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;

    this.userService.getUsers(this.page).subscribe({
      next: (response: any) => {
        const identity = localStorage.getItem('user');
        const currentUser = identity ? JSON.parse(identity) : null;

        this.users = response.users.filter(
          (user: any) => user._id !== currentUser?._id
        );

        this.totalPages = response.totalPages;
        this.following = response.following || [];
        this.followed = response.followed || [];
        this.loading = false;

        console.log(response);
      },
      error: (error: any) => {
        this.loading = false;
        console.error(error);
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
      next: (response: any) => {
        this.following.push(userId);
        console.log(response);
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  unfollow(userId: string): void {
    this.followService.unfollowUser(userId).subscribe({
      next: (response: any) => {
        this.following = this.following.filter(id => id !== userId);
        console.log(response);
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }
}
