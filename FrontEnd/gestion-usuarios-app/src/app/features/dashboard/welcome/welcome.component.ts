// src/app/features/dashboard/welcome/welcome.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

// Servicios
import { UserService, UserData, SessionStats } from '../../../core/services/user.service';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

// Interfaz para la tabla de sesión
interface SessionTableData {
  concept: string;
  value: string | number;
  icon: string;
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent implements OnInit {
  private userService = inject(UserService);

  isLoading = signal(true);
  user = signal<UserData | null>(null);

  sessionDataSource: SessionTableData[] = [];
  displayedColumns: string[] = ['icon', 'concept', 'value'];

  ngOnInit(): void {
    this.loadWelcomeData();
  }

  loadWelcomeData(): void {
    this.isLoading.set(true);

    forkJoin({
      userProfile: this.userService.getUserProfile(),
      sessionStats: this.userService.getLastSessionStats()
    }).subscribe({
      next: ({ userProfile, sessionStats }) => {
        if (userProfile.success) {
          this.user.set(userProfile.data);
        }
        if (sessionStats.success) {
          this.prepareSessionTable(sessionStats.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar la información del dashboard.',
          icon: 'error'
        });
        console.error(err);
      }
    });
  }

  private prepareSessionTable(stats: SessionStats): void {
    this.sessionDataSource = [
      { concept: 'Hora de Inicio', value: new Date(stats.startDate).toLocaleString(), icon: 'login' },
      { concept: 'Hora de Cierre', value: new Date(stats.logoutDate).toLocaleString(), icon: 'logout' },
      { concept: 'Intentos Fallidos Previos', value: stats.intents, icon: 'warning' }
    ];
  }

  get formattedFechaRegistro(): string {
  const fecha = this.user()?.fechaRegistro;
  return fecha ? new Date(fecha).toLocaleDateString() : '';
}
}