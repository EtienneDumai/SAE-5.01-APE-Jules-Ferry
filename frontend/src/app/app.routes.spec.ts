import { routes } from './app.routes';
import { guestGuard } from './guards/guest.guard';
import { adminGuard } from './guards/admin.guard';
import { userGuard } from './guards/user.guard';
import { managerGuard } from './guards/manager.guard';

describe('app routes', () => {
  it('Devrait déclarer les routes protégées attendues', () => {
    expect(routes.find(route => route.path === 'login')?.canActivate).toEqual([guestGuard]);
    expect(routes.find(route => route.path === 'register')?.canActivate).toEqual([guestGuard]);
    expect(routes.find(route => route.path === 'actualites/creer')?.canActivate).toEqual([adminGuard]);
    expect(routes.find(route => route.path === 'actualites/:id/edit')?.canActivate).toEqual([adminGuard]);
    expect(routes.find(route => route.path === 'compte')?.canMatch).toEqual([userGuard]);
    expect(routes.find(route => route.path === 'evenements/:id/edit')?.canActivate).toEqual([managerGuard]);
  });

  it('Devrait déclarer les routes lazy-loaded principales', () => {
    expect(routes.find(route => route.path === '')?.loadComponent).toEqual(jasmine.any(Function));
    expect(routes.find(route => route.path === 'verification-lien')?.loadComponent).toEqual(jasmine.any(Function));
    expect(routes.find(route => route.path === 'set-password')?.loadComponent).toEqual(jasmine.any(Function));
    expect(routes.find(route => route.path === 'actualites')?.loadComponent).toEqual(jasmine.any(Function));
    expect(routes.find(route => route.path === 'evenements')?.loadComponent).toEqual(jasmine.any(Function));
    expect(routes.find(route => route.path === 'admin/utilisateurs')?.loadComponent).toEqual(jasmine.any(Function));
  });

  it('Devrait contenir le nombre de routes attendu', () => {
    expect(routes.length).toBe(18);
  });
});
