import { Routes } from '@angular/router';
import { AccueilComponent } from './pages/accueil/accueil.component';
import { ActualiteDetailComponent } from './pages/actualite-detail/actualite-detail.component';
import { ActualitePageComponent } from './pages/actualite-page/actualite-page.component';
import { EvennementPageComponent } from './pages/evennement-page/evennement-page.component';
import { EvennementDetailComponent } from './pages/evennement-detail/evennement-detail.component';
import { InscriptionEvenementComponent } from './pages/inscription-evenement/inscription-evenement.component';

export const routes: Routes = [
    { path: '', component: AccueilComponent },
    { path:'actualites', component: ActualitePageComponent },
    { path: 'actualites/:id', component: ActualiteDetailComponent },
    { path: 'evennements', component: EvennementPageComponent },
    { path: 'evennements/:id', component: EvennementDetailComponent },
    { path: 'inscription-evenement/:id', component: InscriptionEvenementComponent }
];