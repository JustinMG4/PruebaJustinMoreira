import { Component, OnInit, inject, ViewChild, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

// Services & Interfaces
import { Person, PersonService } from '../../../core/services/person.service';
import { AdminService } from '../../../core/services/admin.service';

// Angular Material
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import * as XLSX from 'xlsx'; // <-- Importa la librería xlsx
import { RegisterRequest } from '../../../core/services/auth.service';

import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import moment from 'moment';

@Component({
  selector: 'app-user-maintenance',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatTableModule, MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatIconModule, MatButtonModule, MatMenuModule, MatPaginatorModule,
    MatCardModule, MatDividerModule
  ],
  templateUrl: './user-maintenance.component.html',
  styleUrl: './user-maintenance.component.scss'
  
})
export class UserMaintenanceComponent implements OnInit, AfterViewInit {
  private personService = inject(PersonService);
  private adminService = inject(AdminService);
  private router = inject(Router);

  fileName = signal('');
  isUploading = signal(false);
  parsedData = signal<RegisterRequest[]>([]);
  previewColumns: string[] = ['name', 'lastName', 'email', 'userName'];
  

  isLoading = true;
  displayedColumns: string[] = ['fullName', 'userName', 'email', 'emailPlatform', 'birthDate', 'identification', 'actions'];
  dataSource = new MatTableDataSource<Person>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.personService.getAll().subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        Swal.fire('Error', 'No se pudo cargar la lista de usuarios.', 'error');
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  editUser(user: Person): void {
    this.router.navigate(['/user-edit', user.id], { state: { user } });
  }

 viewHistory(user: Person): void {
    this.router.navigate(['/user-history', user.id], { state: { userName: user.userName } });
  }

  /**
   * Se ejecuta cuando el usuario selecciona un archivo.
   */
  onFileChange(event: any): void {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      Swal.fire('Error', 'Solo puedes seleccionar un archivo a la vez.', 'error');
      return;
    }

    this.fileName.set(target.files[0].name);
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      // 1. Leer el archivo
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      // 2. Obtener la primera hoja
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      // 3. Convertir la hoja a JSON
      // Se añade { header: 1 } para que nos dé un arreglo de arreglos
      const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      // 4. Mapear los datos al formato que nuestra API necesita
      this.mapDataToRequest(data);
    };

    reader.readAsBinaryString(target.files[0]);
  }

  /**
   * Transforma los datos del Excel al formato de RegisterRequest.
   * Asume que la primera fila es el encabezado.
   */
private mapDataToRequest(data: any[][]): void {
    const [header, ...rows] = data;
    const lowerCaseHeader = header.map(h => typeof h === 'string' ? h.toLowerCase().trim() : '');

    const nameIndex = lowerCaseHeader.indexOf('name');
    const lastNameIndex = lowerCaseHeader.indexOf('lastname');
    const emailIndex = lowerCaseHeader.indexOf('email');
    const userNameIndex = lowerCaseHeader.indexOf('username');
    const identificationIndex = lowerCaseHeader.indexOf('identification');
    const passwordIndex = lowerCaseHeader.indexOf('password');
    const birthDateIndex = lowerCaseHeader.indexOf('birthdate');
    
    if (emailIndex === -1 || userNameIndex === -1 || passwordIndex === -1) {
        Swal.fire('Error en el archivo', 'El archivo Excel debe contener, como mínimo, las columnas: email, userName, y password.', 'error');
        this.resetUploadState();
        return;
    }

    const mappedUsers = rows.map(row => {
        let birthDateValue: any = row[birthDateIndex];
        let finalBirthDate: string = '';

        if (typeof birthDateValue === 'number') {
            const decodedDate = XLSX.SSF.parse_date_code(birthDateValue);
            const jsDate = new Date(decodedDate.y, decodedDate.m - 1, decodedDate.d);
            finalBirthDate = moment(jsDate).toISOString();
        } else if (typeof birthDateValue === 'string' && birthDateValue.trim() !== '') {
            const parsedDate = moment(birthDateValue, ['DD/MM/YYYY', 'MM/DD/YYYY', moment.ISO_8601], true);
            if (parsedDate.isValid()) {
                finalBirthDate = parsedDate.toISOString();
            }
        }
        
        return {
          name: row[nameIndex] || '',
          lastName: row[lastNameIndex] || '',
          email: row[emailIndex] || '',
          userName: row[userNameIndex] || '',
          identification: row[identificationIndex] || '',
          password: String(row[passwordIndex] || ''), 
          birthDate: finalBirthDate,
        };
    }).filter(user => user.email && user.userName);

    this.parsedData.set(mappedUsers);
}

  /**
   * Envía los datos parseados al servidor.
   */
  uploadData(): void {
    if (this.parsedData().length === 0) {
      Swal.fire('Atención', 'No hay datos válidos para cargar.', 'info');
      return;
    }

    this.isUploading.set(true);
    this.adminService.bulkRegister(this.parsedData()).subscribe({
      next: (response) => {
        this.isUploading.set(false);
        Swal.fire('¡Éxito!', response.message || 'Usuarios cargados correctamente.', 'success');
        this.resetUploadState();
        this.loadUsers(); // Recarga la tabla principal de usuarios
      },
      error: (err) => {
        this.isUploading.set(false);
        Swal.fire('Error', err.error?.message || 'Ocurrió un error al cargar los usuarios.', 'error');
        console.error(err);
      }
    });
  }

  /**
   * Limpia el estado de la carga de archivos.
   */
  resetUploadState(): void {
    this.fileName.set('');
    this.parsedData.set([]);
    // Resetea el input de archivo
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }


  changeUserStatus(userId: string, action: 'lock' | 'unlock'): void {
    const actionText = action === 'lock' ? 'bloquear' : 'desbloquear';
    const serviceCall = action === 'lock' ? this.adminService.lockUser(userId) : this.adminService.unlockUser(userId);

    Swal.fire({
      title: `¿Estás seguro?`,
      text: `Se va a ${actionText} a este usuario.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        serviceCall.subscribe({
          next: () => {
            Swal.fire('¡Éxito!', `El usuario ha sido ${actionText}do.`, 'success');
            this.loadUsers();
          },
          error: (err) => {
            const errorMessage = err.error?.message || `No se pudo ${actionText} al usuario.`;
            Swal.fire('Error', errorMessage, 'error');
            console.error(err);
          }
        });
      }
    });
  }
}