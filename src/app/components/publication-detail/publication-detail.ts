import { inject, Component, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PublicationService } from '../../services/publicationService';
import { AuthService } from '../../services/authService';
import { Publication } from '../../common/interfaces/publication';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';
import { AsAnyPipe } from '../../pipes/as-any.pipe';
import { CommentService } from '../../services/commentService';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-publication-detail',
  standalone: true,
  imports: [RouterLink, LoadingSpinner, AsAnyPipe, FormsModule],
  templateUrl: './publication-detail.html',
  styleUrl: './publication-detail.css'
})
export class PublicationDetailComponent {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly publicationService: PublicationService = inject(PublicationService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly commentService: CommentService = inject(CommentService);

  // datos del usuario logueado
  identity: any = this.authService.getIdentity();
  isLoggedIn: boolean = !!this.authService.getToken();

  // receta actual
  publication: WritableSignal<Publication | null> = signal<Publication | null>(null);
  loading: WritableSignal<boolean> = signal<boolean>(true);

  // estado del like
  hasLike: WritableSignal<boolean> = signal<boolean>(false);
  likesCount: WritableSignal<number> = signal<number>(0);

  comments: WritableSignal<any[]> = signal<any[]>([]);
  commentText: string = '';
  sendingComment: boolean = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loadPublication(params['id']);
    });
  }

  // cargamos el detalle de la receta
private loadPublication(id: string): void {
  this.loading.set(true);

  this.publicationService.getPublicationById(id).subscribe({
    next: (publication: Publication) => {
      this.publication.set(publication);
      this.likesCount.set((publication as any).likes?.length ?? 0);

      const likes = (publication as any).likes || [];
      this.hasLike.set(likes.some((l: any) => l.toString() === this.identity?._id));

      this.loading.set(false);
      this.loadComments(id);
    },
    error: () => {
      this.loading.set(false);
    }
  });
}

  // dar o quitar like a la receta
  toggleLike(): void {
    const pub = this.publication();
    if (!pub) return;

    this.publicationService.toggleLike(pub._id).subscribe({
      next: (response: any) => {
        this.likesCount.set(response.likes);
        this.hasLike.set(response.hasLike);
      },
      error: () => {}
    });
  }

  // comprobamos si es nuestra receta
  isMyPublication(): boolean {
    const pub = this.publication();
    if (!pub) return false;
    const author = pub.user as any;
    return author?._id === this.identity?._id || author === this.identity?._id;
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

  private loadComments(publicationId: string): void {
    this.commentService.getByPublication(publicationId).subscribe({
      next: (comments: any[]) => this.comments.set(comments),
      error: () => {}
    });
  }

  saveComment(): void {
    if (!this.commentText.trim()) return;
    this.sendingComment = true;

    this.commentService.save(this.publication()!._id, this.commentText.trim()).subscribe({
      next: (response: any) => {
        this.comments.update(current => [response.comment, ...current]);
        this.commentText = '';
        this.sendingComment = false;
      },
      error: () => { this.sendingComment = false; }
    });
  }

  deleteComment(commentId: string): void {
    this.commentService.remove(commentId).subscribe({
      next: () => {
        this.comments.update(current => current.filter(c => c._id !== commentId));
      },
      error: () => {}
    });
  }

  isMyComment(comment: any): boolean {
    return comment.user?._id === this.identity?._id;
  }

  getTimeAgoComment(date: string): string {
    return this.getTimeAgo(date);
  }
}
