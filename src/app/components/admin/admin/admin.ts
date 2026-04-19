import { inject, Component, signal, WritableSignal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/adminService';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, FormsModule, ConfirmModalComponent, LoadingSpinner],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  private readonly adminService: AdminService = inject(AdminService);

  activeTab: 'dashboard' | 'users' = 'dashboard';

  stats: any = null;
  loadingStats: WritableSignal<boolean> = signal<boolean>(true);

  users: WritableSignal<any[]> = signal<any[]>([]);
  loadingUsers: WritableSignal<boolean> = signal<boolean>(false);
  page: number = 1;
  totalPages: number = 1;
  search: string = '';
  searchInput: string = '';

  selectedUser: any = null;
  selectedUserStats: any = null;
  loadingUserStats: WritableSignal<boolean> = signal<boolean>(false);
  showUserPanel: WritableSignal<boolean> = signal<boolean>(false);

  showDeleteModal: WritableSignal<boolean> = signal<boolean>(false);
  userToDelete: string = '';

  readonly roles = [
    { value: 'ROLE_USER', label: 'Usuario' },
    { value: 'ROLE_VERIFIED', label: 'Verificado' },
    { value: 'ROLE_ADMIN', label: 'Admin' }
  ];

  ngOnInit(): void {
    this.loadStats();
    this.loadUsers();
  }

  setTab(tab: 'dashboard' | 'users'): void {
    this.activeTab = tab;
  }

  loadStats(): void {
    this.loadingStats.set(true);
    this.adminService.getStats().subscribe({
      next: (response: any) => {
        this.stats = response.stats;
        this.loadingStats.set(false);
      },
      error: () => {
        this.loadingStats.set(false);
      }
    });
  }

  loadUsers(): void {
    this.loadingUsers.set(true);
    this.adminService.getUsers(this.page, this.search).subscribe({
      next: (response: any) => {
        this.users.set(response.users);
        this.totalPages = response.totalPages;
        this.loadingUsers.set(false);
      },
      error: () => {
        this.loadingUsers.set(false);
      }
    });
  }

  onSearch(): void {
    this.search = this.searchInput;
    this.page = 1;
    this.loadUsers();
  }

  clearSearch(): void {
    this.search = '';
    this.searchInput = '';
    this.page = 1;
    this.loadUsers();
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadUsers();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadUsers();
    }
  }

  openUserPanel(user: any): void {
    this.selectedUser = user;
    this.selectedUserStats = null;
    this.showUserPanel.set(true);
    this.loadingUserStats.set(true);

    this.adminService.getUserStats(user._id).subscribe({
      next: (response: any) => {
        this.selectedUserStats = response.stats;
        this.loadingUserStats.set(false);
      },
      error: () => {
        this.loadingUserStats.set(false);
      }
    });
  }

  closeUserPanel(): void {
    this.showUserPanel.set(false);
    this.selectedUser = null;
    this.selectedUserStats = null;
  }

  updateRole(userId: string, role: string): void {
    this.adminService.updateRole(userId, role).subscribe({
      next: (response: any) => {
        this.users.update(current =>
          current.map(u => u._id === userId ? { ...u, role } : u)
        );
        if (this.selectedUser?._id === userId) {
          this.selectedUser = { ...this.selectedUser, role };
        }
      },
      error: () => {
      }
    });
  }

  confirmDelete(userId: string): void {
    this.userToDelete = userId;
    this.showDeleteModal.set(true);
  }

  deleteUser(): void {
    this.showDeleteModal.set(false);
    this.adminService.deleteUser(this.userToDelete).subscribe({
      next: () => {
        this.users.update(current => current.filter(u => u._id !== this.userToDelete));
        if (this.selectedUser?._id === this.userToDelete) {
          this.closeUserPanel();
        }
      },
      error: () => {
      }
    });
  }

  getRoleLabel(role: string): string {
    return this.roles.find(r => r.value === role)?.label ?? role;
  }

  formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    return num?.toString() ?? '0';
  }
}
