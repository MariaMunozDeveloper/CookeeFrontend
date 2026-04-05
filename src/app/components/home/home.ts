import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserCardComponent } from '../user-card/user-card';
import { LoginComponent } from '../login/login';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [UserCardComponent, LoginComponent, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {

}
