import { Routes } from '@angular/router';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
    { path: '', component: AccueilComponent },
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
    
    { path: '**', redirectTo: '' }
];