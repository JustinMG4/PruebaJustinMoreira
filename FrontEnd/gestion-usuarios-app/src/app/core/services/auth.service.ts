// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../env/env';
import { jwtDecode } from 'jwt-decode';


export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[]; 
  timestamp: string;
}


export interface LoginData {
  token: string;
  message: string;
  expiresIn: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  lastName: string;
  identification: string;
  birthDate: string;
  userName:string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/Account`;

  constructor(private http: HttpClient) { }

  /**
   * Envía las credenciales a la API para iniciar sesión.
   * @param credentials - Email y contraseña del usuario.
   * @returns Un Observable con la respuesta completa de la API.
   */
  login(credentials: LoginRequest): Observable<ApiResponse<LoginData>> {
    return this.http.post<ApiResponse<LoginData>>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data?.token) {
          localStorage.setItem('authToken', response.data.token);
        }
      })
    );
  }

  
   /**
   * Llama al endpoint de la API para cerrar la sesión y luego
   * elimina el token del localStorage.
   * @returns Un Observable que completa al cerrar la sesión.
   */
  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('authToken');
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

   /**
   * Decodifica el token JWT y extrae el rol del usuario.
   * @returns El rol como string (ej: 'Admin', 'User'), o null si no hay token.
   */
  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const roleClaim = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        return Array.isArray(roleClaim) ? roleClaim[0] : roleClaim;
      } catch (error) {
        console.error("Error decodificando el token", error);
        return null;
      }
    }
    return null;
  }

  /**
   * Envía los datos del nuevo usuario a la API para su registro.
   * @param payload - Datos del formulario de registro.
   */
  register(payload: RegisterRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/register`, payload);
  }

  forgotPassword(email: string): Observable<ApiResponse<any>> {
    const body = { email: email };
    
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/forgot-password`, body);
  }

}
