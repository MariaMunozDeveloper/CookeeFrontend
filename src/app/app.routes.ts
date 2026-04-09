import { LoginComponent } from './components/auth/login/login';
import { RegisterComponent } from './components/auth/register/register';
import { MyDataComponent } from './components/user/my-data/my-data';
import { PeopleComponent } from './components/user/people/people';
import { TimelineComponent } from './components/publication/timeline/timeline';
import { UserProfileComponent } from './components/user/user-profile/user-profile';
import { FollowsComponent } from './components/user/follows/follows';
import { MessagesComponent } from './components/message/messages/messages';
import { SendMessageComponent } from './components/message/send-message/send-message';
import { CreateRecipeComponent } from './components/publication/create-recipe/create-recipe';
import { ExploreComponent } from './components/publication/explore/explore';
import { EditRecipeComponent } from './components/publication/edit-recipe/edit-recipe';
import { PublicationDetailComponent } from './components/publication/publication-detail/publication-detail';
import { HomeComponent } from './components/home/home';
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'feed', component: TimelineComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'my-data', component: MyDataComponent, canActivate: [authGuard] },
  { path: 'explore', component: ExploreComponent },
  { path: 'publication/:id', component: PublicationDetailComponent },
  { path: 'edit-recipe/:id', component: EditRecipeComponent, canActivate: [authGuard] },
  { path: 'follows/:modo', component: FollowsComponent, canActivate: [authGuard] },
  { path: 'follows/:modo/:id', component: FollowsComponent, canActivate: [authGuard] },
  { path: 'messages', component: MessagesComponent, canActivate: [authGuard] },
  { path: 'messages/send/:id', component: SendMessageComponent, canActivate: [authGuard] },
  { path: 'create-recipe', component: CreateRecipeComponent, canActivate: [authGuard] },
  { path: 'people', component: PeopleComponent },
  { path: 'profile/:id', component: UserProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
