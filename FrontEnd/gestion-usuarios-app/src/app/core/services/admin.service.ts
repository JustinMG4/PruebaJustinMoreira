import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../env/env';
import { ApiResponse } from './auth.service';
import { RegisterRequest } from './auth.service'

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Account`;

  unlockUser(userId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/unlock-user/${userId}`, {});
  }

  lockUser(userId: string): Observable<ApiResponse<any>> {

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/lock-user/${userId}`, {});
  }

  updateUser(userId: string, payload: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/update?userId=${userId}`, payload);
  }

  /**
   * Envía un arreglo de usuarios para registro masivo.
   * @param users - Arreglo de objetos de usuario a registrar.
   */
  bulkRegister(users: RegisterRequest[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/register-bulk`, users);
  }
}
