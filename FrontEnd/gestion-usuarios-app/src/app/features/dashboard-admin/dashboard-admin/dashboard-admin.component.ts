import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

// Services & Interfaces
import { SessionService, SessionStatistics, FailedAttemptUser } from '../../../core/services/session.service';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.scss'
})
export class DashboardAdminComponent implements OnInit {
  private sessionService = inject(SessionService);

  isLoading = signal(true);
  stats = signal<SessionStatistics | null>(null);
  
  failedAttemptsUsers = signal<FailedAttemptUser[]>([]);
  displayedColumns: string[] = ['fullName', 'userName', 'email', 'accessFailedCount'];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);

    forkJoin({
      statistics: this.sessionService.getStatistics(),
      failedAttempts: this.sessionService.getFailedAttempts()
    }).subscribe({
      next: ({ statistics, failedAttempts }) => {
        if (statistics.success) {
          this.stats.set(statistics.data);
        }
        if (failedAttempts.success) {
          this.failedAttemptsUsers.set(failedAttempts.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        Swal.fire('Error', 'No se pudieron cargar los datos del dashboard.', 'error');
        console.error(err);
      }
    });
  }
}
