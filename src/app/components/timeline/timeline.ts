import { inject, Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/authService';
import { PublicationService } from '../../services/publicationService';
import { UserCardComponent } from '../user-card/user-card';
import { Publication } from '../../common/interfaces/publication';
import { RouterLink } from '@angular/router';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule, UserCardComponent, RouterLink, LoadingSpinner],
  templateUrl: './timeline.html',
  styleUrl: './timeline.css'
})
export class TimelineComponent implements OnInit {
  private readonly authService: AuthService = inject(AuthService);
  private readonly publicationService: PublicationService = inject(PublicationService);

  identity: any = this.authService.getIdentity();
  stats: any = JSON.parse(localStorage.getItem('stats') || 'null');

  publications: WritableSignal<Publication[]> = signal<Publication[]>([]);
  loading: WritableSignal<boolean> = signal<boolean>(false);

  page: number = 1;
  totalPages: number = 1;
  hasMore: boolean = true;

  publicationText: string = '';
  sending: boolean = false;
  errorMessage: string = '';

  selectedImage: File | null = null;
  imagePreview: string | null = null;
  publicationVisibility: 'public' | 'friends' | 'private' = 'public';

  ngOnInit(): void {
    this.getPublications();
  }

  getPublications(reset: boolean = false): void {
    if (this.loading() || (!this.hasMore && !reset)) return;

    if (reset) {
      this.page = 1;
      this.publications.set([]);
      this.hasMore = true;
    }

    this.loading.set(true);

    this.publicationService.getFeed(this.page).subscribe({
      next: (publications: Publication[]) => {
        this.publications.update(current => [...current, ...publications]);
        this.hasMore = this.page < this.totalPages;
        this.page++;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  savePublication(): void {
    if (!this.publicationText.trim() && !this.selectedImage) {
      this.errorMessage = 'Escribe algo o adjunta una imagen antes de publicar.';
      return;
    }

    this.sending = true;
    this.errorMessage = '';

    const data = {
      tipo: 'texto',
      text: this.publicationText.trim(),
      visibility: this.publicationVisibility
    };

    this.publicationService.savePublication(data).subscribe({
      next: (response: any) => {
        if (response.status) {
          const publicationId = response.publication._id;

          if (this.selectedImage) {
            this.publicationService.uploadImage(publicationId, this.selectedImage).subscribe({
              next: () => {
                this.resetForm();
                this.getPublications(true);
                this.sending = false;
              },
              error: () => {
                this.errorMessage = 'Publicado pero no se pudo subir la imagen.';
                this.getPublications(true);
                this.sending = false;
              }
            });
          } else {
            this.resetForm();
            this.getPublications(true);
            this.sending = false;
          }

          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },
      error: () => {
        this.errorMessage = 'No se pudo publicar. Inténtalo de nuevo.';
        this.sending = false;
      }
    });
  }

  private resetForm(): void {
    this.publicationText = '';
    this.imagePreview = null;
    this.selectedImage = null;
    this.publicationVisibility = 'public';
  }

  deletePublication(id: string): void {
    this.publicationService.deletePublication(id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.publications.update(current => current.filter(p => p._id !== id));
        }
      },
      error: () => {}
    });
  }

  isMyPublication(publication: Publication): boolean {
    const author = publication.user as any;
    return author?._id === this.identity?._id || author === this.identity?._id;
  }

  getAuthor(publication: Publication): any {
    return publication.user as any;
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

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  removeSelectedImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  toggleVisibility(): void {
    if (this.publicationVisibility === 'public') {
      this.publicationVisibility = 'friends';
    } else if (this.publicationVisibility === 'friends') {
      this.publicationVisibility = 'private';
    } else {
      this.publicationVisibility = 'public';
    }
  }
}
