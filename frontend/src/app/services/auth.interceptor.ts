import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const token = authService.getToken();

    // Skip interceptor for login and register requests
    if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register')) {
        return next(req);
    }

    if (token) {
        try {
            // Decode token to check expiration
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);

            // Check if token is expired
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            if (Date.now() >= expirationTime) {
                console.log('Token expired, redirecting to login');
                authService.logout();
                router.navigate(['/login']);
                return next(req);
            }

            // Token is valid, add it to the request
            const cloned = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${token}`)
            });

            return next(cloned).pipe(
                catchError((error: HttpErrorResponse) => {
                    if (error.status === 401) {
                        // Unauthorized, token might be invalid
                        console.log('Unauthorized request, redirecting to login');
                        authService.logout();
                        router.navigate(['/login']);
                    }
                    return throwError(() => error);
                })
            );
        } catch (e) {
            console.error('Error processing token:', e);
            // Token is invalid, remove it and redirect to login
            authService.logout();
            router.navigate(['/login']);
            return next(req);
        }
    }

    return next(req);
};
