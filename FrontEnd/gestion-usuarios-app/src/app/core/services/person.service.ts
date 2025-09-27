import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../env/env';
import { ApiResponse } from './auth.service';

export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  personalMail: string;
  platformMail: string;
  identification: string;
  birthDate: string;
  createdAt: string;
  userName: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Person`;

  getAll(): Observable<ApiResponse<Person[]>> {
    return this.http.get<ApiResponse<Person[]>>(`${this.apiUrl}/all`);
  }

  /**
   * Obtiene la información de una persona específica por su ID.
   * @param id - El ID del usuario a buscar.
   * @returns Un Observable con la respuesta de la API.
   */
  getById(id: string): Observable<ApiResponse<Person>> { // <-- NUEVO MÉTODO
    return this.http.get<ApiResponse<Person>>(`${this.apiUrl}/person/${id}`);
  }
}