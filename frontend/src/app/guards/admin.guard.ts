import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.user$.pipe(
        take(1),
        map(user => {
            // Ellenőrizzük, hogy a felhasználó be van-e jelentkezve és admin-e
            if (user && user.role === 'admin') {
                return true;
            }

            // Ha be van jelentkezve, de nem admin, akkor a főoldalra irányítjuk
            if (user) {
                router.navigate(['/home']);
                return false;
            }

            // Ha nincs bejelentkezve, akkor a bejelentkezési oldalra irányítjuk
            router.navigate(['/login']);
            return false;
        })
    );
};
