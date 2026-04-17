import { inject, Component, signal, WritableSignal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PublicationService } from '../../services/publicationService';
import { AuthService } from '../../services/authService';
import { Publication } from '../../common/interfaces/publication';
import { AsAnyPipe } from '../../pipes/as-any.pipe';

interface HashtagSection {
  tag: string;
  icon: string;
  recipes: Publication[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, AsAnyPipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private readonly publicationService: PublicationService = inject(PublicationService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);

  trendingRecipes: WritableSignal<Publication[]> = signal<Publication[]>([]);
  heroImages: WritableSignal<string[]> = signal<string[]>([]);
  hashtagSections: WritableSignal<HashtagSection[]> = signal<HashtagSection[]>([]);
  loaded: WritableSignal<boolean> = signal<boolean>(false);

  isLoggedIn: boolean = !!this.authService.getToken();
  identity: any = this.authService.getIdentity();

  private readonly featuredHashtags: { tag: string; icon: string }[] = [
    { tag: 'tradicional', icon: 'icons/miton_one_color.svg' },
    { tag: 'saludable', icon: 'icons/ingredientes.svg' },
    { tag: 'rapido', icon: 'icons/reloj.svg' },
    { tag: 'postre', icon: 'icons/favorito.svg' },
    { tag: 'chocolate', icon: 'icons/corazon.svg' },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.publicationService.explore(1, 'likes', '').subscribe({
      next: (response) => {
        const recipes = response.publications.slice(0, 6);
        this.trendingRecipes.set(recipes);

        const images = recipes
          .map(r => this.getCover(r))
          .filter((img): img is string => img !== null)
          .slice(0, 3);
        this.heroImages.set(images);

        this.loaded.set(true);
      },
      error: () => {
        this.loaded.set(true);
      }
    });

    this.featuredHashtags.forEach(({ tag, icon }) => {
      this.publicationService.explore(1, 'likes', tag).subscribe({
        next: (response) => {
          const recipes = response.publications.slice(0, 5);
          if (recipes.length > 0) {
            this.hashtagSections.update(current => [
              ...current,
              { tag, icon, recipes }
            ]);
          }
        },
        error: () => {
        }
      });
    });
  }

  toggleLike(id: string, event: Event): void {
    event.stopPropagation();

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.publicationService.toggleLike(id).subscribe({
      next: (response: any) => {
        this.trendingRecipes.update(current =>
          current.map(p => p._id === id
            ? {
              ...p, likes: response.hasLike
                ? [...(p.likes || []), this.identity._id]
                : (p.likes || []).filter((l: string) => l !== this.identity._id)
            }
            : p
          )
        );

        this.hashtagSections.update(sections =>
          sections.map(section => ({
            ...section,
            recipes: section.recipes.map(p => p._id === id
              ? {
                ...p, likes: response.hasLike
                  ? [...(p.likes || []), this.identity._id]
                  : (p.likes || []).filter((l: string) => l !== this.identity._id)
              }
              : p
            )
          }))
        );
      },
      error: () => {
      }
    });
  }

  isLiked(publication: Publication): boolean {
    return (publication.likes || []).some((l: any) => l.toString() === this.identity?._id);
  }

  getCover(publication: Publication): string | null {
    return publication.images && publication.images.length > 0
      ? publication.images[0]
      : null;
  }

  getCommentsCount(publication: Publication): number {
    return (publication as any).commentsCount ?? 0;
  }

  getHeroImage(index: number): string | null {
    return this.heroImages()[index] ?? null;
  }
}
