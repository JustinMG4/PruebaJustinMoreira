// src/app/features/admin/user-edit/user-edit.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

// Services & Interfaces
import { AdminService } from '../../../core/services/admin.service';
import { Person, PersonService } from '../../../core/services/person.service'; // Importamos PersonService

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatProgressSpinnerModule
  ],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.scss'
})
export class UserEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private personService = inject(PersonService); 

  userForm: FormGroup;
  userId: string | null = null;
  isLoading = false;
  isFetchingData = true;

  constructor() {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const userFromState = navigation?.extras?.state?.['user'] as Person;

    if (userFromState) {
      this.populateForm(userFromState);
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.userId = id;
        this.loadUserById(id);
      } else {
        Swal.fire('Error', 'No se encontró el ID del usuario en la URL.', 'error');
        this.router.navigate(['/user-maintenance']);
      }
    }
  }
  
  loadUserById(id: string): void {
    this.isFetchingData = true;
    this.personService.getById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.populateForm(response.data);
        } else {
          Swal.fire('Error', 'No se pudieron cargar los datos del usuario.', 'error');
          this.router.navigate(['/user-maintenance']);
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Ocurrió un problema al buscar al usuario.', 'error');
        this.router.navigate(['/user-maintenance']);
      }
    });
  }
  
  populateForm(user: Person): void {
    this.userId = user.id.toString();
    this.userForm.patchValue(user);
    this.isFetchingData = false;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    this.isLoading = true;
    const formValue = this.userForm.value;
    const payload: any = {};
    for (const key in formValue) {
      payload[key] = formValue[key] === '' ? null : formValue[key];
    }
    
    this.adminService.updateUser(this.userId!, payload).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire('¡Éxito!', 'El usuario ha sido actualizado.', 'success').then(() => {
          this.router.navigate(['/user-maintenance']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err.error?.message || 'No se pudo actualizar el usuario.';
        Swal.fire('Error', errorMessage, 'error');
        console.error(err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/user-maintenance']);
  }
}