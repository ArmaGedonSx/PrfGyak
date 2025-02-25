import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
    email: string = '';
    password: string = '';
    confirmPassword: string = '';
    error: string = '';
    showPassword: boolean = false;
    showConfirmPassword: boolean = false;

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    togglePasswordVisibility(field: 'password' | 'confirmPassword') {
        if (field === 'password') {
            this.showPassword = !this.showPassword;
        } else {
            this.showConfirmPassword = !this.showConfirmPassword;
        }
    }

    onSubmit() {
        if (this.password !== this.confirmPassword) {
            this.error = 'A jelszavak nem egyeznek!';
            return;
        }

        this.authService.register(this.email, this.password).subscribe({
            next: () => {
                this.router.navigate(['/login']);
            },
            error: (err) => {
                this.error = 'Hiba történt a regisztráció során!';
                console.error('Registration error:', err);
            }
        });
    }
}
