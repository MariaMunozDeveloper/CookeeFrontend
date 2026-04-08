import { inject, Component, signal, WritableSignal } from '@angular/core';
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
export class HomeComponent {
  private readonly publicationService: PublicationService = inject(PublicationService);

  // recetas recientes para mostrar en la home sin estar logueado
  recetas: WritableSignal<Publication[]> = signal<Publication[]>([]);
  loaded: WritableSignal<boolean> = signal<boolean>(false);

  ngOnInit(): void {
    this.loadRecetas();
  }

  // cargamos las ultimas recetas publicas para el showcase
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

  // devuelve la portada de la receta si tiene imagen
  getCover(publication: Publication): string | null {
    return publication.images && publication.images.length > 0
      ? publication.images[0]
      : null;
  }


}
