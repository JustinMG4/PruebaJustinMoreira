import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

// Services & Interfaces
import { SessionHistory, SessionService } from '../../../core/services/session.service';
import { ApiResponse } from '../../../core/services/auth.service';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-session-history',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatProgressSpinnerModule, MatChipsModule, MatIconModule],
  templateUrl: './session-history.component.html',
  styleUrl: './session-history.component.scss'
})
export class SessionHistoryComponent implements OnInit {
  private sessionService = inject(SessionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoading = signal(true);
  title = signal('Mi Historial de Sesiones');
  historyDataSource = signal<SessionHistory[]>([]);
  displayedColumns: string[] = ['status', 'startDate', 'logoutDate', 'sessionDuration', 'intents'];

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    const navigationState = this.router.getCurrentNavigation()?.extras.state;

    let history$: Observable<ApiResponse<SessionHistory[]>>;

    if (userId) {
      const userName = navigationState?.['userName'] || `ID: ${userId}`;
      this.title.set(`Historial de Sesiones de: ${userName}`);
      history$ = this.sessionService.getHistoryByUserId(userId);
    } else {
      this.title.set('Mi Historial de Sesiones');
      history$ = this.sessionService.getMyHistory();
    }

    this.loadHistory(history$);
  }

  private loadHistory(history$: Observable<ApiResponse<SessionHistory[]>>): void {
    this.isLoading.set(true);
    history$.subscribe({
      next: (response) => {
        this.historyDataSource.set(response.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        Swal.fire('Error', 'No se pudo cargar el historial de sesiones.', 'error');
        console.error(err);
      }
    });
  }
}