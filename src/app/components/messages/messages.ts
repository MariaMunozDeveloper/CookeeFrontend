import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { MessageService } from '../../services/messageService';
import { AuthService } from '../../services/authService';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './messages.html',
  styleUrl: './messages.css'
})
export class MessagesComponent {
  activeTab: 'received' | 'sent' = 'received';
  messages: any[] = [];
  page: number = 1;
  totalPages: number = 1;
  loading: boolean = false;
  identity: any;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.identity = this.authService.getIdentity();
    this.loadMessages();
  }

  setTab(tab: 'received' | 'sent'): void {
    this.activeTab = tab;
    this.page = 1;
    this.messages = [];
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading = true;

    const request = this.activeTab === 'received'
      ? this.messageService.getReceived(this.page)
      : this.messageService.getSent(this.page);

    request.subscribe({
      next: (response: any) => {
        this.messages = response.messages || [];
        this.totalPages = response.totalPages || 1;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadMessages();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadMessages();
    }
  }

  getOtherUser(message: any): any {
    return this.activeTab === 'received' ? message.emitter : message.receiver;
  }

  getTimeAgo(date: string): string {
    if (!date) return '';
    const now = new Date();
    const created = new Date(date);
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000);
    if (diff < 60) return 'hace un momento';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    return created.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  }
}
