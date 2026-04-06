import { inject, Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/authService';
import { MessageService } from '../../services/messageService';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);
  private readonly messageService: MessageService = inject(MessageService);

  identity: any = null;
  showUserMenu = false;
  unreadMessages: number = 0;

  private identitySub!: Subscription;
  private unreadInterval: any;

  ngOnInit(): void {
    this.identitySub = this.authService.identity$.subscribe(user => {
      this.identity = user;
      if (user) {
        this.loadUnreadCount();
        this.unreadInterval = setInterval(() => this.loadUnreadCount(), 30000);
      } else {
        clearInterval(this.unreadInterval);
        this.unreadMessages = 0;
      }
    });
  }

  ngOnDestroy(): void {
    this.identitySub.unsubscribe();
    clearInterval(this.unreadInterval);
  }

  loadUnreadCount(): void {
    this.messageService.getUnreadCount().subscribe({
      next: (count: number) => {
        this.unreadMessages = count;
      },
      error: () => {}
    });
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
