import { inject, Component, OnInit, signal, WritableSignal, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/authService';
import { PublicationService } from '../../../services/publicationService';
import { UserCardComponent } from '../../shared/user-card/user-card';
import { Publication } from '../../../common/interfaces/publication';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [UserCardComponent, RouterLink, LoadingSpinner, ConfirmModalComponent],
  templateUrl: './timeline.html',
  styleUrl: './timeline.css'
})
export class TimelineComponent implements OnInit {
  private readonly authService: AuthService = inject(AuthService);
  private readonly publicationService: PublicationService = inject(PublicationService);
  // datos del usuario logueado
  identity: any = this.authService.getIdentity();
  stats: any = JSON.parse(localStorage.getItem('stats') || 'null');

// lista de recetas del feed
  publications: WritableSignal<Publication[]> = signal<Publication[]>([]);
  loading: WritableSignal<boolean> = signal<boolean>(false);

  page: number = 1;
  totalPages: number = 1;
  hasMore: boolean = true;

// menu de opciones y modal
  activeMenu: WritableSignal<string | null> = signal<string | null>(null);
  showDeleteModal: WritableSignal<boolean> = signal<boolean>(false);
  publicationToDelete: string = '';

  ngOnInit(): void {
    this.getPublications();
  }

  // cargamos las recetas del feed paginadas
  getPublications(reset: boolean = false): void {
    if (this.loading() || (!this.hasMore && !reset)) return;

    if (reset) {
      this.page = 1;
      this.publications.set([]);
      this.hasMore = true;
    }

    this.loading.set(true);

    this.publicationService.getFeed(this.page).subscribe({
      next: (response) => {
        this.publications.update(current => [...current, ...response.publications]);
        this.totalPages = response.totalPages;
        this.page++;
        this.hasMore = this.page <= response.totalPages;
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); }
    });
  }

  // comprobamos si la receta es del usuario logueado
  isMyPublication(publication: Publication): boolean {
    const author = publication.user as any;
    return author?._id === this.identity?._id || author === this.identity?._id;
  }

  // devuelve el autor de la publicacion como objeto
  getAuthor(publication: Publication): any {
    return publication.user as any;
  }

  // devuelve la portada de la receta si tiene imagenes
  getCover(publication: Publication): string | null {
    return publication.images && publication.images.length > 0
      ? publication.images[0]
      : null;
  }

  //formatea la fecha en tiempo relativo
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

  // dar o quitar like a una receta desde el feed
  toggleLike(id: string, event: Event): void {
    event.stopPropagation();
    this.publicationService.toggleLike(id).subscribe({
      next: (response: any) => {
        // actualizamos el like en la lista sin recargar
        this.publications.update(current =>
          current.map(p => p._id === id
            ? { ...p, likes: response.hasLike
                ? [...(p.likes || []), this.identity._id]
                : (p.likes || []).filter((l: string) => l !== this.identity._id)
              }
            : p
          )
        );
      },
      error: () => {}
    });
  }

  // comprobamos si el usuario logueado ya dio like
  isLiked(publication: Publication): boolean {
    return (publication.likes || []).some((l: any) => l.toString() === this.identity?._id);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    // cuando estás a 200px del final cargamos más
    if (scrollTop + windowHeight >= docHeight - 200) {
      this.getPublications();
    }
  }

  // abrimos o cerramos el menu de opciones
  toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.activeMenu.set(this.activeMenu() === id ? null : id);
  }

  // cerramos el menu al hacer click fuera
  @HostListener('document:click')
  closeMenu(): void {
    this.activeMenu.set(null);
  }

  // mostramos el modal de confirmacion
  confirmDelete(id: string, event: Event): void {
    event.stopPropagation();
    this.publicationToDelete = id;
    this.activeMenu.set(null);
    this.showDeleteModal.set(true);
  }

  // eliminamos la receta tras confirmar
  deletePublication(): void {
    this.showDeleteModal.set(false);
    this.publicationService.deletePublication(this.publicationToDelete).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.publications.update(current =>
            current.filter(p => p._id !== this.publicationToDelete)
          );
        }
      },
      error: () => {}
    });
  }
}
