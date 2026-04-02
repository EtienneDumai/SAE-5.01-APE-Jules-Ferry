/**
 * Fichier : frontend/src/app/app.routes.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier centralise les routes principales du frontend.
 * Il associe chaque URL aux pages accessibles et aux gardes de navigation.
 */

import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { adminGuard } from './guards/admin.guard';
import { guestGuard } from './guards/guest.guard';
import { userGuard } from './guards/user.guard';
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
    { 
        path: 'verification-lien', 
        loadComponent: () => import('./components/Auth/magic-link-verify/magic-link-verify.component').then(m => m.MagicLinkVerifyComponent),
        canActivate: [guestGuard]
    },
    { 
        path: 'set-password', 
        loadComponent: () => import('./pages/set-password/set-password.component').then(m => m.SetPasswordComponent),
    },
    
    { path: '', loadComponent: () => import('./pages/accueil/accueil.component').then(m => m.AccueilComponent) },

    { path: 'mentions-legales', loadComponent: () => import('./pages/mentions-legales/mentions-legales.component').then(m => m.MentionsLegalesComponent) },
    { path: 'politique-confidentialite', loadComponent: () => import('./pages/politique-confidentialite/politique-confidentialite.component').then(m => m.PolitiqueConfidentialiteComponent) },

    { 
        path: 'newsletter/desinscription', 
        loadComponent: () => import('./pages/newsletter-unsubscribe/newsletter-unsubscribe.component').then(m => m.NewsletterUnsubscribeComponent),
        title: 'Désinscription Newsletter - APE Jules Ferry'
    },

    { path: 'actualites', loadComponent: () => import('./pages/actualite-page/actualite-page.component').then(m => m.ActualitePageComponent) },
    {
        path: 'actualites/creer',
        loadComponent: () => import('./pages/actualite-creer/actualite-creer.component').then(m => m.ActualiteCreerComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'actualites/:id/edit',
        loadComponent: () => import('./pages/actualite-creer/actualite-creer.component').then(m => m.ActualiteCreerComponent),
        canActivate: [adminGuard]
    },
    { path: 'actualites/:id', loadComponent: () => import('./pages/actualite-detail/actualite-detail.component').then(m => m.ActualiteDetailComponent) },
    { path: 'evenements', loadComponent: () => import('./pages/evenement-page/evenement-page.component').then(m => m.EvenementPageComponent) },
    { path: 'evenements/:id', loadComponent: () => import('./pages/evenement-detail/evenement-detail.component').then(m => m.EvenementDetailComponent) },
    { path: 'compte', loadComponent: () => import('./pages/compte-utilisateur/compte-utilisateur.component').then(m => m.CompteUtilisateurComponent), canMatch: [userGuard] },
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
        loadComponent: () => import('./pages/administration-page/administration-page.component').then(m => m.AdministrationPageComponent),
        canActivate: [adminGuard]
    },

    {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
        title: 'Page introuvable - APE Jules Ferry'
    },
];