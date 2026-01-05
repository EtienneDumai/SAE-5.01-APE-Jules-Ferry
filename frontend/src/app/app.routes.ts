import { Routes } from '@angular/router';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { ActualiteDetailComponent } from './pages/actualite-detail/actualite-detail.component';
import { ActualitePageComponent } from './pages/actualite-page/actualite-page.component';
import { EvennementPageComponent } from './pages/evennement-page/evennement-page.component';
import { EvennementDetailComponent } from './pages/evennement-detail/evennement-detail.component';
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
    
    { path: '**', redirectTo: '' },
    { path:'actualites', component: ActualitePageComponent },
    { path: 'actualites/:id', component: ActualiteDetailComponent },
    { path: 'evennements', component: EvennementPageComponent },
    { path: 'evennements/:id', component: EvennementDetailComponent }
];