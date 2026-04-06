import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { HomeComponent } from './components/home/home';
import { MyDataComponent } from './components/my-data/my-data';
import { authGuard } from './guards/auth-guard';
import { PeopleComponent } from './components/people/people';
import { TimelineComponent } from './components/timeline/timeline';
import { UserProfileComponent } from './components/user-profile/user-profile';
import { FollowsComponent } from './components/follows/follows';
import { MessagesComponent } from './components/messages/messages';
import { SendMessageComponent } from './components/send-message/send-message';
import { CreateRecipeComponent } from './components/create-recipe/create-recipe';



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

  { path: 'follows/:modo', component: FollowsComponent, canActivate: [authGuard] },
  { path: 'follows/:modo/:id', component: FollowsComponent, canActivate: [authGuard] },

  { path: 'messages', component: MessagesComponent, canActivate: [authGuard] },
  { path: 'messages/send/:id', component: SendMessageComponent, canActivate: [authGuard] },
  { path: 'create-recipe', component: CreateRecipeComponent, canActivate: [authGuard] },

  // PÚBLICA
  { path: 'people', component: PeopleComponent },
  { path: 'profile/:id', component: UserProfileComponent, canActivate: [authGuard] },

  { path: '**', redirectTo: '', pathMatch: 'full' }
];
