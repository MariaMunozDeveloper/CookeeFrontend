import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user-card.html',
  styleUrl: './user-card.css'
})
export class UserCardComponent {

  @Input() user: any;
  @Input() stats: any;

  @Input() showEmail: boolean = false;
  @Input() showStats: boolean = false;

  @Input() buttonText: string = '';
  @Input() buttonLink: string = '';

}
