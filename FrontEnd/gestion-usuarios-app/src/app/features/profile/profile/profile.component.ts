import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

// Services & Interfaces
import { UserService, UserData } from '../../../core/services/user.service';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  // Signals para manejar el estado
  isLoading = signal(true);
  isEditMode = signal(false);
  isSaving = signal(false);
  
  private originalUserData: UserData | null = null;
  profileForm: FormGroup;

  constructor() {
    this.profileForm = this.fb.group({
      // Campos editables
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      // Campos solo de lectura
      identification: [''],
      platformMail: [''],
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading.set(true);
    this.userService.getUserProfile().subscribe({
      next: (response) => {
        if (response.success) {
          this.originalUserData = response.data;
          this.profileForm.patchValue({
            ...response.data,
            name: response.data.name 
          });
          this.profileForm.disable();
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        Swal.fire('Error', 'No se pudo cargar la información del perfil.', 'error');
        console.error(err);
      }
    });
  }

  toggleEditMode(enable: boolean): void {
    this.isEditMode.set(enable);
    if (enable) {
      this.profileForm.get('name')?.enable();
      this.profileForm.get('userName')?.enable();
      this.profileForm.get('email')?.enable();
    } else {
      this.profileForm.disable();
    }
  }

  cancelEdit(): void {
    this.profileForm.reset(this.originalUserData!);
    this.toggleEditMode(false);
  }

  saveChanges(): void {
    if (this.profileForm.invalid) {
      return;
    }
    this.isSaving.set(true);

    const payload = {
      name: this.profileForm.get('name')?.value,
      userName: this.profileForm.get('userName')?.value,
      email: this.profileForm.get('email')?.value,
    };

    this.userService.updateUserProfile(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.originalUserData = { ...this.originalUserData!, ...this.profileForm.value };
        this.toggleEditMode(false);
        Swal.fire('¡Éxito!', 'Tu perfil ha sido actualizado.', 'success');
      },
      error: (err) => {
         this.isSaving.set(false);
        const errorResponse = err.error;
        let errorTitle = 'Error';
        let errorHtml = 'No se pudo actualizar tu perfil.';

        if (errorResponse) {
          errorTitle = errorResponse.message && typeof errorResponse.message === 'string' 
                     ? errorResponse.message 
                     : 'Error en la solicitud';

          if (errorResponse.errors && Array.isArray(errorResponse.errors) && errorResponse.errors.length > 0) {
            errorHtml = errorResponse.errors.join('<br>');
          } else if (errorResponse.message && typeof errorResponse.message === 'string') {
            errorHtml = errorResponse.message;
          }
        }

        Swal.fire({
          icon: 'error',
          title: errorTitle,
          html: errorHtml,
        });
        console.error(err);
      }
    });
  }
}