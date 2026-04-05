import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/authService';
import { PublicationService } from '../../services/publicationService';
import { UserCardComponent } from '../user-card/user-card';
import { Publication } from '../../common/interfaces/publication';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule, UserCardComponent, RouterLink],
  templateUrl: './timeline.html',
  styleUrl: './timeline.css'
})
export class TimelineComponent implements OnInit {

  identity: any;
  stats: any;

  publications: Publication[] = [];
  page: number = 1;
  totalPages: number = 1;
  loading: boolean = false;
  hasMore: boolean = true;

  publicationText: string = '';
  sending: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private publicationService: PublicationService
  ) {}

  ngOnInit(): void {
    this.identity = this.authService.getIdentity();

    const savedStats = localStorage.getItem('stats');
    if (savedStats) {
      this.stats = JSON.parse(savedStats);
    }

    this.getPublications();
  }

  getPublications(reset: boolean = false): void {
    if (this.loading || (!this.hasMore && !reset)) return;

    if (reset) {
      this.page = 1;
      this.publications = [];
      this.hasMore = true;
    }

    this.loading = true;

    this.publicationService.getFeed(this.page).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.publications = [...this.publications, ...response.publications];
          this.totalPages = response.totalPages;
          this.hasMore = this.page < response.totalPages;
          this.page++;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  savePublication(): void {
    if (!this.publicationText.trim()) {
      this.errorMessage = 'Escribe algo antes de publicar.';
      return;
    }

    this.sending = true;
    this.errorMessage = '';

    const data = {
      tipo: 'texto',
      text: this.publicationText.trim()
    };

    this.publicationService.savePublication(data).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.publicationText = '';
          this.getPublications(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        this.sending = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo publicar. Inténtalo de nuevo.';
        this.sending = false;
      }
    });
  }

  deletePublication(id: string): void {
    this.publicationService.deletePublication(id).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.publications = this.publications.filter(p => p._id !== id);
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

}
