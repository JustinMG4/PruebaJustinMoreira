import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../env/env';
import { ApiResponse } from './auth.service'; // Reutilizamos la interfaz genérica


export interface SessionStatistics {
  activeSessions: number;
  inactiveSessions: number;
  lockedUsers: number;
  totalSessions: number;
  timestamp: string;
}

export interface SessionHistory {
  sessionId: number;
  startDate: string;
  logoutDate: string | null;
  intents: number;
  sessionDuration: string | null;
  isActive: boolean;
  status: string;
}



export interface FailedAttemptUser {
  userId: string;
  userName: string;
  email: string;
  fullName: string;
  accessFailedCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private http = inject(HttpClient);
  private sessionApiUrl = `${environment.apiUrl}/Session`;

  /**
   * Obtiene las estadísticas generales de sesiones y usuarios.
   */
  getStatistics(): Observable<ApiResponse<SessionStatistics>> {
    return this.http.get<ApiResponse<SessionStatistics>>(`${this.sessionApiUrl}/statistics`);
  }

  /**
   * Obtiene la lista de usuarios con sus intentos de inicio de sesión fallidos.
   */
  getFailedAttempts(): Observable<ApiResponse<FailedAttemptUser[]>> {
    return this.http.get<ApiResponse<FailedAttemptUser[]>>(`${this.sessionApiUrl}/failed-attempts`);
  }

  /**
   * Obtiene el historial de sesiones del usuario actualmente logueado.
   */
  getMyHistory(): Observable<ApiResponse<SessionHistory[]>> {
    return this.http.get<ApiResponse<SessionHistory[]>>(`${this.sessionApiUrl}/my-history`);
  }

  /**
   * Obtiene el historial de sesiones de un usuario específico por su ID.
   * @param userId El ID del usuario.
   */
  getHistoryByUserId(userId: string): Observable<ApiResponse<SessionHistory[]>> {
    return this.http.get<ApiResponse<SessionHistory[]>>(`${this.sessionApiUrl}/history/${userId}`);
  }
}