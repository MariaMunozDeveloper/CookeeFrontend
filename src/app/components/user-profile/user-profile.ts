// src/app/components/user-profile/user-profile.ts
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/userService';
import { FollowService } from '../../services/followService';
import { PublicationService } from '../../services/publicationService';
import { AuthService } from '../../services/authService';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfileComponent {
  profileUser: any = null;
  counters: any = null;
  publications: any[] = [];
  identity: any = null;

  isFollowing: boolean = false;
  isFriend: boolean = false;
  isOwnProfile: boolean = false;

  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private followService: FollowService,
    private publicationService: PublicationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.identity = this.authService.getIdentity();

    this.route.params.subscribe(params => {
      const userId = params['id'];
      this.loadProfile(userId);
    });
  }

  loadProfile(userId: string): void {
    this.loading = true;

    this.userService.getUserById(userId).subscribe({
      next: (response: any) => {
        this.profileUser = response.user;
        this.isOwnProfile = this.identity?._id === userId;

        // following/followed son los del usuario logueado
        this.isFollowing = response.following === true;
        this.isFriend = response.following === true && response.followed === true;

        this.userService.getCounters(userId).subscribe({
          next: (countersRes: any) => {
            this.counters = countersRes;
          }
        });

        this.publicationService.getPublicationsByUser(userId).subscribe({
          next: (pubRes: any) => {
            this.publications = pubRes.publications || [];
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      },
      error: (err: any) => {
        console.error('Error cargando perfil', err);
        this.loading = false;
      }
    });
  }

  follow(): void {
    this.followService.followUser(this.profileUser._id).subscribe({
      next: () => {
        this.isFollowing = true;
      }
    });
  }

  unfollow(): void {
    this.followService.unfollowUser(this.profileUser._id).subscribe({
      next: () => {
        this.isFollowing = false;
        this.isFriend = false;
      }
    });
  }

  getTimeAgo(date: string | undefined): string {
    if (!date) return '';
    const now = new Date();
    const created = new Date(date);
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (diff < 60) return 'hace un momento';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `hace ${Math.floor(diff / 86400)} días`;
    return created.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  }
}
