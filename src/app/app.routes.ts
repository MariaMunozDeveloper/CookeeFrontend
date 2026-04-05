import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { HomeComponent } from './components/home/home';
import { MyDataComponent } from './components/my-data/my-data';
import { authGuard } from './guards/auth-guard';
import { PeopleComponent } from './components/people/people';
import { TimelineComponent } from './components/timeline/timeline';
import { UserProfileComponent } from './components/user-profile/user-profile';


export const routes: Routes = [
  // PÚBLICA
  { path: '', component: HomeComponent },

  // FEED PRIVADO
  { path: 'feed', component: TimelineComponent, canActivate: [authGuard] },

  // AUTH
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // PRIVADAS
  { path: 'my-data', component: MyDataComponent, canActivate: [authGuard] },

  // PÚBLICA
  { path: 'people', component: PeopleComponent },
  { path: 'profile/:id', component: UserProfileComponent, canActivate: [authGuard] },

  { path: '**', redirectTo: '', pathMatch: 'full' }
];
