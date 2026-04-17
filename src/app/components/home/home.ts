import { inject, Component, signal, WritableSignal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublicationService } from '../../services/publicationService';
import { Publication } from '../../common/interfaces/publication';
import { AsAnyPipe } from '../../pipes/as-any.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, AsAnyPipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private readonly publicationService: PublicationService = inject(PublicationService);

  recetas: WritableSignal<Publication[]> = signal<Publication[]>([]);
  loaded: WritableSignal<boolean> = signal<boolean>(false);

  ngOnInit(): void {
    this.loadRecetas();
  }

  private loadRecetas(): void {
    this.publicationService.explore(1, 'recent', '').subscribe({
      next: (response) => {
        this.recetas.set(response.publications.slice(0, 4));
        this.loaded.set(true);
      },
      error: () => {
        this.loaded.set(true);
      }
    });
  }

  getCover(publication: Publication): string | null {
    return publication.images && publication.images.length > 0
      ? publication.images[0]
      : null;
  }

}
