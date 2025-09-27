import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Services
import { AuthService } from '../../../core/services/auth.service';

// Angular Material
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  menuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.buildMenu();
  }

  buildMenu(): void {
    const role = this.authService.getUserRole();
    const commonItems: MenuItem[] = [
      { label: 'Home', icon: 'home', route: '/home' },
      { label: 'Perfil', icon: 'person', route: '/profile' },
      { label: 'Historial de Sesiones', icon: 'history', route: '/my-history' }
    ];

    if (role === 'Admin') {
      this.menuItems = [
        ...commonItems,
        { label: 'Dashboard', icon: 'dashboard', route: '/dashboard-admin' },
        { label: 'Mantenimiento de Usuarios', icon: 'group', route: '/user-maintenance' }
      ];
    } else { 
      this.menuItems = commonItems;
    }
  }

   logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('El logout en el servidor falló', err);
        localStorage.removeItem('authToken'); 
        this.router.navigate(['/login']);
      }
    });
  }
}