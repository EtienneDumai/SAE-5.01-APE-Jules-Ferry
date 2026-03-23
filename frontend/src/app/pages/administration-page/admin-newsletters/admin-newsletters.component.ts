import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, Validators } from '@angular/forms';
import { NewsletterService } from '../../../services/Newsletter/newsletter.service';
import { NewsletterSubscriber } from '../../../models/Newsletter/newsletter.model';
import { ToastService } from '../../../services/Toast/toast.service';
import { TypeErreurToast } from '../../../enums/TypeErreurToast/type-erreur-toast';
import { ExportExcelService } from '../../../services/ExportExcel/export-excel.service';
import { SpinnerComponent } from '../../../components/spinner/spinner.component';
import { ExportModalComponent } from '../../../components/export-modal/export-modal.component';
import { PasswordConfirmModalComponent } from '../../../components/password-confirm-modal/password-confirm-modal.component';

@Component({
  selector: 'app-admin-newsletters',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent, ExportModalComponent, PasswordConfirmModalComponent],
  templateUrl: './admin-newsletters.component.html',
  styleUrl: './admin-newsletters.component.css'
})
export class AdminNewslettersComponent implements OnInit {
  private readonly newsletterService = inject(NewsletterService);
  private readonly toastService = inject(ToastService);
  private readonly exportExcelService = inject(ExportExcelService);

  abonnes: NewsletterSubscriber[] = [];
  chargementEnCours = true;
  suppressionEnCoursId: number | null = null;
  idAbonneASupprimer: number | null = null;
  emailAAjouter = '';
  texteRecherche = '';
  showExportModal = false;
  showPasswordModal = false;
  showAddForm = false;
  pendingAction: 'CREATE' | 'DELETE' | null = null;
  exportColumnsNewsletters = [
    { key: 'email', label: 'E-mail', selected: true },
    { key: 'statut', label: 'Statut', selected: true },
    { key: 'created_at', label: 'Date d\'inscription', selected: true }
  ];

  ngOnInit(): void {
    this.chargerAbonnes();
  }

  chargerAbonnes(): void {
    this.chargementEnCours = true;

    this.newsletterService.getAllSubscribers().subscribe({
      next: (abonnes) => {
        this.abonnes = abonnes;
        this.chargementEnCours = false;
      },
      error: () => {
        this.toastService.showWithTimeout('Erreur chargement newsletters', TypeErreurToast.ERROR);
        this.chargementEnCours = false;
      }
    });
  }

  get abonnesFiltres(): NewsletterSubscriber[] {
    if (!this.texteRecherche.trim()) {
      return this.abonnes;
    }

    const recherche = this.texteRecherche.toLowerCase();

    return this.abonnes.filter((abonne) =>
      abonne.email.toLowerCase().includes(recherche)
    );
  }

  demanderSuppression(abonne: NewsletterSubscriber): void {
    this.idAbonneASupprimer = abonne.id_abonne;
    this.pendingAction = 'DELETE';
    this.showPasswordModal = true;
  }

  onPasswordConfirmed(password: string): void {
    if (this.pendingAction === 'CREATE') {
      this.executerAjout(password);
      return;
    }

    if (this.idAbonneASupprimer === null) {
      return;
    }

    this.suppressionEnCoursId = this.idAbonneASupprimer;

    this.newsletterService.deleteSubscriber(this.idAbonneASupprimer, password).subscribe({
      next: (response) => {
        this.abonnes = this.abonnes.filter(({ id_abonne }) => id_abonne !== this.idAbonneASupprimer);
        this.toastService.showWithTimeout(response.message, TypeErreurToast.SUCCESS);
        this.suppressionEnCoursId = null;
        this.closePasswordModal();
      },
      error: (err) => {
        if (err.status === 403) {
          this.toastService.showWithTimeout('Mot de passe administrateur incorrect', TypeErreurToast.ERROR);
        } else {
          this.toastService.showWithTimeout('Erreur suppression abonné', TypeErreurToast.ERROR);
          this.idAbonneASupprimer = null;
        }
        this.suppressionEnCoursId = null;
      }
    });
  }

  ouvrirAjout(): void {
    this.showAddForm = true;
  }

  annulerAjout(): void {
    this.showAddForm = false;
    this.emailAAjouter = '';
  }

  demanderAjout(): void {
    const email = this.emailAAjouter.trim();

    if (!this.isEmailValid(email)) {
      this.toastService.showWithTimeout('Veuillez saisir un email valide.', TypeErreurToast.ERROR);
      return;
    }

    this.emailAAjouter = email;
    this.pendingAction = 'CREATE';
    this.showPasswordModal = true;
  }

  private executerAjout(password: string): void {
    this.newsletterService.addSubscriber({
      email: this.emailAAjouter,
      admin_password: password
    }).subscribe({
      next: (response) => {
        this.toastService.showWithTimeout(response.message, TypeErreurToast.SUCCESS);
        this.annulerAjout();
        this.chargerAbonnes();
        this.closePasswordModal();
      },
      error: (err) => {
        if (err.status === 403) {
          this.toastService.showWithTimeout('Mot de passe administrateur incorrect', TypeErreurToast.ERROR);
          return;
        }

        const message =
          err.error?.errors?.email?.[0] ??
          err.error?.errors?.admin_password?.[0] ??
          'Erreur ajout abonné';

        this.toastService.showWithTimeout(message, TypeErreurToast.ERROR);
      }
    });
  }

  private isEmailValid(email: string): boolean {
    return !Validators.email({ value: email } as never) && email.length <= 100;
  }

  exporterExcel(selectedKeys: string[]): void {
    const donnees = this.abonnesFiltres.map((abonne) => ({
      ...(selectedKeys.includes('email') ? { 'E-mail': abonne.email } : {}),
      ...(selectedKeys.includes('statut') ? { 'Statut': abonne.statut } : {}),
      ...(selectedKeys.includes('created_at') ? { 'Date d\'inscription': this.formaterDate(abonne.created_at) } : {}),
    }));

    this.exportExcelService.exportAsExcelFile(donnees, 'Newsletters');
    this.showExportModal = false;
  }

  private formaterDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.pendingAction = null;
    this.idAbonneASupprimer = null;
  }
}
