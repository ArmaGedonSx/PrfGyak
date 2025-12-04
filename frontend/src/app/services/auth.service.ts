import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface User {
    id: string;
    username: string;
    email: string;
    role?: string;
    profilePicture?: string;
    dietaryPreferences?: string[];
}

interface AuthResponse {
    token: string;
    user: User;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/api/auth`;
    private tokenKey = 'auth_token';
    private userSubject = new BehaviorSubject<User | null>(null);
    public user$ = this.userSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.loadUser();
    }

    private loadUser() {
        const token = localStorage.getItem(this.tokenKey);
        if (token) {
            try {
                // Decode token to get user info
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);

                // Check if token is expired
                const expirationTime = payload.exp * 1000; // Convert to milliseconds
                if (Date.now() >= expirationTime) {
                    console.log('Token expired, logging out');
                    localStorage.removeItem(this.tokenKey);
                    this.userSubject.next(null);
                    return;
                }

                // Ha a token érvényes, beállítjuk a felhasználót a payload alapján
                const user = {
                    id: payload.userId,
                    username: payload.username,
                    email: payload.email,
                    role: payload.role || 'user', // Alapértelmezett érték, ha nincs role
                    profilePicture: payload.profilePicture
                };
                this.userSubject.next(user);

            } catch (e) {
                console.error('Error decoding token:', e);
                // Don't remove token on error, just log it
            }
        }
    }

    register(username: string, email: string, password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, { username, email, password });
    }

    login(email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
            .pipe(
                tap(response => {
                    localStorage.setItem(this.tokenKey, response.token);
                    this.userSubject.next(response.user);
                })
            );
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        this.userSubject.next(null);
        this.router.navigate(['/login']);
    }

    getProfile(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
            tap(user => {
                console.log('Profile loaded:', user);
                // Frissítsük a userSubject-et a kapott adatokkal
                this.userSubject.next(user);
            })
        );
    }

    updateProfile(userData: {
        username?: string;
        profilePicture?: string;
        dietaryPreferences?: string[];
    }): Observable<User> {
        return this.http.put<{ message: string, user: User }>(`${this.apiUrl}/profile`, userData)
            .pipe(
                map(response => response.user),
                tap(user => {
                    console.log('Profile updated:', user);
                    this.userSubject.next(user);
                })
            );
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
}
