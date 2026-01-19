import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { adminGuard } from './guards/admin.guard';
import { guestGuard } from './guards/guest.guard';
import { managerGuard } from './guards/manager.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [guestGuard]
    },
    {
        path: 'register',
        component: RegisterComponent,
        canActivate: [guestGuard]
    },

    { path: '', loadComponent: () => import('./pages/accueil/accueil.component').then(m => m.AccueilComponent) },
    { path: 'actualites', loadComponent: () => import('./pages/actualite-page/actualite-page.component').then(m => m.ActualitePageComponent) },
    { path: 'actualites/:id', loadComponent: () => import('./pages/actualite-detail/actualite-detail.component').then(m => m.ActualiteDetailComponent) },
    { path: 'evenements', loadComponent: () => import('./pages/evenement-page/evenement-page.component').then(m => m.EvenementPageComponent) },
    { path: 'evenements/:id', loadComponent: () => import('./pages/evenement-detail/evenement-detail.component').then(m => m.EvenementDetailComponent) },
    
    { 
        path: 'evenements/:id/edit', 
        loadComponent: () => import('./pages/evenement-edit/evenement-edit.component').then(m => m.EvenementEditComponent),
        canActivate: [managerGuard] 
    },

    { 
        path: 'admin/formulaires/new', 
        loadComponent: () => import('./components/formulaire-edit/formulaire-edit.component').then(m => m.FormulaireEditComponent),
        canActivate: [managerGuard]
    },
    { 
        path: 'admin/formulaires/:id/edit', 
        loadComponent: () => import('./components/formulaire-edit/formulaire-edit.component').then(m => m.FormulaireEditComponent),
        canActivate: [managerGuard]
    },
    
    { 
        path: 'admin/utilisateurs', 
        loadComponent: () => import('./pages/admin-utilisateurs/admin-utilisateurs.component').then(m => m.AdminGestionUtilisateursComponent), 
        canActivate: [adminGuard]
    },
];