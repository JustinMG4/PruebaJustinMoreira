// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
    },
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: 'home', // La pantalla de bienvenida
                loadComponent: () => import('./features/dashboard/welcome/welcome.component').then(m => m.WelcomeComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/profile/profile/profile.component').then(m => m.ProfileComponent)
            },
            {
                path: 'dashboard-admin',
                loadComponent: () => import('./features/dashboard-admin/dashboard-admin/dashboard-admin.component').then(m => m.DashboardAdminComponent)
            },
            {
                path: 'user-maintenance',
                loadComponent: () => import('./features/admin/user-maintenance/user-maintenance.component').then(m => m.UserMaintenanceComponent)
            },
            {
                path: 'user-edit/:id',
                loadComponent: () => import('./features/admin/user-edit/user-edit.component').then(m => m.UserEditComponent)
            },
            {
                path: 'my-history',
                loadComponent: () => import('./features/sessions/session-history/session-history.component').then(m => m.SessionHistoryComponent)
            },
            {
                path: 'user-history/:userId',
                loadComponent: () => import('./features/sessions/session-history/session-history.component').then(m => m.SessionHistoryComponent)
            },
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            }
        ]
    },

    {
        path: '**',
        redirectTo: 'login'
    }
];