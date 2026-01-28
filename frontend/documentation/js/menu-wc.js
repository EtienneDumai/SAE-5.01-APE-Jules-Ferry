'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">frontend documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/TemplatePlaygroundModule.html" data-type="entity-link" >TemplatePlaygroundModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' : 'data-bs-target="#xs-components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' :
                                            'id="xs-components-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                            <li class="link">
                                                <a href="components/TemplatePlaygroundComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TemplatePlaygroundComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' : 'data-bs-target="#xs-injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' :
                                        'id="xs-injectables-links-module-TemplatePlaygroundModule-a48e698b66bad8be9ff3b78b5db8e15ee6bb54bd2575fdb1bb61a34e76437cc54b2e161854c3d6c97b4c751d05ff3a43b70b87ceffd46d3c5bf53f6f161e3044"' }>
                                        <li class="link">
                                            <a href="injectables/HbsRenderService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HbsRenderService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TemplateEditorService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TemplateEditorService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ZipExportService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ZipExportService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AccueilComponent.html" data-type="entity-link" >AccueilComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ActualiteCardComponent.html" data-type="entity-link" >ActualiteCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ActualiteCreerComponent.html" data-type="entity-link" >ActualiteCreerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ActualiteDetailComponent.html" data-type="entity-link" >ActualiteDetailComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ActualitePageComponent.html" data-type="entity-link" >ActualitePageComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminGestionUtilisateursComponent.html" data-type="entity-link" >AdminGestionUtilisateursComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AlertComponent.html" data-type="entity-link" >AlertComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AppComponent.html" data-type="entity-link" >AppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CalendrierComponent.html" data-type="entity-link" >CalendrierComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CompteUtilisateurComponent.html" data-type="entity-link" >CompteUtilisateurComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EvenementCardComponent.html" data-type="entity-link" >EvenementCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EvenementDetailComponent.html" data-type="entity-link" >EvenementDetailComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EvenementEditComponent.html" data-type="entity-link" >EvenementEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EvenementPageComponent.html" data-type="entity-link" >EvenementPageComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FooterComponent.html" data-type="entity-link" >FooterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FormInscriptionEvenementComponent.html" data-type="entity-link" >FormInscriptionEvenementComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FormModifierPasswordComponent.html" data-type="entity-link" >FormModifierPasswordComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FormulaireEditComponent.html" data-type="entity-link" >FormulaireEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeaderComponent.html" data-type="entity-link" >HeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/InscriptionEvenementComponent.html" data-type="entity-link" >InscriptionEvenementComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginComponent.html" data-type="entity-link" >LoginComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NewsletterPageComponent.html" data-type="entity-link" >NewsletterPageComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RegisterComponent.html" data-type="entity-link" >RegisterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SpinnerComponent.html" data-type="entity-link" >SpinnerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ToastComponent.html" data-type="entity-link" >ToastComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UserFormComponent.html" data-type="entity-link" >UserFormComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/ActualiteService.html" data-type="entity-link" >ActualiteService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CreneauService.html" data-type="entity-link" >CreneauService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EvenementService.html" data-type="entity-link" >EvenementService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FormulaireService.html" data-type="entity-link" >FormulaireService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/InscriptionService.html" data-type="entity-link" >InscriptionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NewsletterService.html" data-type="entity-link" >NewsletterService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TacheService.html" data-type="entity-link" >TacheService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ToastService.html" data-type="entity-link" >ToastService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TokenService.html" data-type="entity-link" >TokenService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UtilisateurService.html" data-type="entity-link" >UtilisateurService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Actualite.html" data-type="entity-link" >Actualite</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthResponse.html" data-type="entity-link" >AuthResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompoDocConfig.html" data-type="entity-link" >CompoDocConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Creneau.html" data-type="entity-link" >Creneau</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Evenement.html" data-type="entity-link" >Evenement</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Formulaire.html" data-type="entity-link" >Formulaire</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Inscription.html" data-type="entity-link" >Inscription</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InscriptionSubmitPayload.html" data-type="entity-link" >InscriptionSubmitPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoginCredentials.html" data-type="entity-link" >LoginCredentials</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NewsletterResponse.html" data-type="entity-link" >NewsletterResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NewsletterSubscription.html" data-type="entity-link" >NewsletterSubscription</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RegisterData.html" data-type="entity-link" >RegisterData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Session.html" data-type="entity-link" >Session</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Tache.html" data-type="entity-link" >Tache</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Template.html" data-type="entity-link" >Template</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TypeToast.html" data-type="entity-link" >TypeToast</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Utilisateur.html" data-type="entity-link" >Utilisateur</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});