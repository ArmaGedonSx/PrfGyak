import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    userEmail: string = '';

    constructor(private authService: AuthService) {
        this.authService.user$.subscribe(user => {
            if (user) {
                this.userEmail = user.email;
            }
        });
    }
}
