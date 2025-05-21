import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    email: string = '';
    password: string = '';
    error: string = '';
    showPassword: boolean = false;

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    onSubmit() {
        this.authService.login(this.email, this.password).subscribe({
            next: () => {
                this.router.navigate(['/home']);
            },
            error: (err) => {
                this.error = 'Hibás email vagy jelszó!';
                console.error('Login error:', err);
            }
        });
    }
}
