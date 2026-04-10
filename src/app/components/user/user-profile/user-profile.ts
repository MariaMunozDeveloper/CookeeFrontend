import { inject, Component, signal, WritableSignal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../services/userService';
import { FollowService } from '../../../services/followService';
import { PublicationService } from '../../../services/publicationService';
import { AuthService } from '../../../services/authService';
import { Publication } from '../../../common/interfaces/publication';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [RouterLink, LoadingSpinner, ConfirmModalComponent],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})

export class UserProfileComponent implements OnInit {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly userService: UserService = inject(UserService);
  private readonly followService: FollowService = inject(FollowService);
  private readonly publicationService: PublicationService = inject(PublicationService);
  private readonly authService: AuthService = inject(AuthService);

  publicationToDelete: string = '';
  identity: any = this.authService.getIdentity();

  profileUser: any = null;
  counters: any = null;
  publicationsCount: number = 0;

  isFollowing: boolean = false;
  isOwnProfile: boolean = false;

  publications: WritableSignal<Publication[]> = signal<Publication[]>([]);
  showDeleteModal: WritableSignal<boolean> = signal<boolean>(false);
  loading: WritableSignal<boolean> = signal<boolean>(true);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loadProfile(params['id']);
    });
  }

  loadProfile(userId: string): void {
    this.loading.set(true);

    this.userService.getUserById(userId).subscribe({
      next: (response: any) => {
        this.profileUser = response.user;
        this.isOwnProfile = this.identity?._id === userId;
        this.isFollowing = response.following === true;

        this.userService.getCounters(userId).subscribe({
          next: (countersRes: any) => {
            this.counters = countersRes;
          }
        });

        this.publicationService.getPublicationCounters(userId).subscribe({
          next: (res: any) => {
            this.publicationsCount = res.total ?? 0;
          }
        });

        this.publicationService.getPublicationsByUser(userId).subscribe({
          next: (publications: Publication[]) => {
            this.publications.set(publications);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
          }
        });
      },
      error: () => {
        this.loading.set(false);
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
      }
    });
  }


  confirmDelete(id: string): void {
    this.publicationToDelete = id;
    this.showDeleteModal.set(true);
  }

  deletePublication(): void {
    this.showDeleteModal.set(false);
    this.publicationService.deletePublication(this.publicationToDelete).subscribe({
      next: () => {
        this.publications.update(current =>
          current.filter(p => p._id !== this.publicationToDelete)
        );
      },
      error: () => {}
    });
  }
}
