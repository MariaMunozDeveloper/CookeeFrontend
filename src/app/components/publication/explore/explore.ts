import { inject, Component, signal, WritableSignal, OnInit, HostListener } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicationService } from '../../../services/publicationService';
import { Publication } from '../../../common/interfaces/publication';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { UpperCasePipe } from '@angular/common';
import { FavoriteService } from '../../../services/favoriteService';
import { AuthService } from '../../../services/authService';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [RouterLink, FormsModule, LoadingSpinner, UpperCasePipe],
  templateUrl: './explore.html',
  styleUrl: './explore.css'
})
export class ExploreComponent implements OnInit {
  private readonly publicationService: PublicationService = inject(PublicationService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly authService: AuthService = inject(AuthService);
  readonly favoriteService: FavoriteService = inject(FavoriteService);

  publications: WritableSignal<Publication[]> = signal<Publication[]>([]);
  loading: WritableSignal<boolean> = signal<boolean>(false);

  page: number = 1;
  totalPages: number = 1;
  hasMore: boolean = true;
  isLoggedIn: boolean = !!this.authService.getToken();

  sortBy: string = 'recent';
  searchHashtag: string = '';
  hashtagInput: string = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['hashtag']) {
        this.searchHashtag = params['hashtag'];
        this.hashtagInput = params['hashtag'];
      }
      this.loadRecetas(true);
    });
  }

  loadRecetas(reset: boolean = false): void {
    if (this.loading() || (!this.hasMore && !reset)) return;

    if (reset) {
      this.page = 1;
      this.publications.set([]);
      this.hasMore = true;
    }

    this.loading.set(true);

    this.publicationService.explore(this.page, this.sortBy, this.searchHashtag).subscribe({
      next: (response) => {
        this.publications.update(current => [...current, ...response.publications]);
        this.totalPages = response.totalPages;
        this.hasMore = this.page < response.totalPages;
        this.page++;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  setSort(sort: string): void {
    this.sortBy = sort;
    this.loadRecetas(true);
  }

  buscarHashtag(): void {
    this.searchHashtag = this.hashtagInput.trim().toLowerCase();
    this.router.navigate([], {
      queryParams: this.searchHashtag ? { hashtag: this.searchHashtag } : {},
      queryParamsHandling: 'replace'
    });
    this.loadRecetas(true);
  }

  clearHashtag(): void {
    this.searchHashtag = '';
    this.hashtagInput = '';
    this.router.navigate([], { queryParams: {} });
    this.loadRecetas(true);
  }

  getCover(publication: Publication): string | null {
    return publication.images?.length > 0 ? publication.images[0] : null;
  }

  getAuthor(publication: Publication): any {
    return publication.user as any;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.hasMore || this.loading()) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= docHeight - 500) {
      this.loadRecetas();
    }
  }
}
