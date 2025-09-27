// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../env/env';
import { ApiResponse } from './auth.service'; // Reutilizamos la interfaz genérica


export interface UserData {
  id: string;
  name: string;
  lastName: string;
  identification: string;
  platformMail: string;
  birthDate: string;
  userName: string;
  email: string;
  fechaRegistro: string;
  emailConfirmed: boolean;
  roles: string[];
}


export interface SessionStats {
  sessionId: number;
  startDate: string;
  logoutDate: string;
  intents: number;
}

export interface UpdateProfilePayload {
  userName: string;
  email: string;
  name: string; 
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private accountApiUrl = `${environment.apiUrl}/Account`;
  private sessionApiUrl = `${environment.apiUrl}/Session`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la información del perfil del usuario logueado.
   */
  getUserProfile(): Observable<ApiResponse<UserData>> {
    return this.http.get<ApiResponse<UserData>>(`${this.accountApiUrl}/me`);
  }

  /**
   * Obtiene las estadísticas de la última sesión del usuario.
   */
  getLastSessionStats(): Observable<ApiResponse<SessionStats>> {
    return this.http.get<ApiResponse<SessionStats>>(`${this.sessionApiUrl}/statistics-by-user`);
  }

  /**
   * Actualiza el perfil del usuario logueado.
   * @param payload - Los datos a actualizar.
   */
  updateUserProfile(payload: UpdateProfilePayload): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.accountApiUrl}/me/update`, payload);
  }
}
