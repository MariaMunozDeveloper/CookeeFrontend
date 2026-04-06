import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/authService';
import { Subscription } from 'rxjs';
import { MessageService } from '../../services/messageService'

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  identity: any = null;
  showUserMenu = false;
  unreadMessages: number = 0;
  private unreadInterval: any;
  private identitySub!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.identitySub = this.authService.identity$.subscribe(user => {
      this.identity = user;
      if (user) {
        this.loadUnreadCount();
        // comprueba cada 30 segundos
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

  loadUnreadCount(): void {
    this.messageService.getUnreadCount().subscribe({
      next: (response: any) => {
        this.unreadMessages = response.count || 0;
      },
      error: () => {}
    });
  }
}
