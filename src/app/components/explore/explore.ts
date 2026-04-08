import { inject, Component, signal, WritableSignal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicationService } from '../../services/publicationService';
import { Publication } from '../../common/interfaces/publication';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';
import { AsAnyPipe } from '../../pipes/as-any.pipe';
import { UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [RouterLink, FormsModule, LoadingSpinner, AsAnyPipe, UpperCasePipe],
  templateUrl: './explore.html',
  styleUrl: './explore.css'
})
export class ExploreComponent {
  private readonly publicationService: PublicationService = inject(PublicationService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  publications: WritableSignal<Publication[]> = signal<Publication[]>([]);
  loading: WritableSignal<boolean> = signal<boolean>(false);

  page: number = 1;
  totalPages: number = 1;
  hasMore: boolean = true;

  // filtros
  sortBy: string = 'recent';
  searchHashtag: string = '';
  hashtagInput: string = '';

  ngOnInit(): void {
    // leemos hashtag de la url si viene
    this.route.queryParams.subscribe(params => {
      if (params['hashtag']) {
        this.searchHashtag = params['hashtag'];
        this.hashtagInput = params['hashtag'];
      }
      this.loadRecetas(true);
    });
  }

  // cargamos recetas con los filtros actuales
  loadRecetas(reset: boolean = false): void {
    if (this.loading()) return;

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
      error: () => { this.loading.set(false); }
    });
  }

  // cambiamos el orden
  setSort(sort: string): void {
    this.sortBy = sort;
    this.loadRecetas(true);
  }

  // buscamos por hashtag
  buscarHashtag(): void {
    this.searchHashtag = this.hashtagInput.trim().toLowerCase();
    this.router.navigate([], {
      queryParams: this.searchHashtag ? { hashtag: this.searchHashtag } : {},
      queryParamsHandling: 'replace'
    });
    this.loadRecetas(true);
  }

  // limpiamos el filtro de hashtag
  clearHashtag(): void {
    this.searchHashtag = '';
    this.hashtagInput = '';
    this.router.navigate([], { queryParams: {} });
    this.loadRecetas(true);
  }

  // devuelve la portada de la receta
  getCover(publication: Publication): string | null {
    return publication.images?.length > 0 ? publication.images[0] : null;
  }

  // devuelve el autor como objeto
  getAuthor(publication: Publication): any {
    return publication.user as any;
  }
}
