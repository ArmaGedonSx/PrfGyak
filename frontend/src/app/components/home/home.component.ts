import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RecipeListComponent } from '../recipe-list/recipe-list.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RecipeListComponent],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    userEmail: string = '';
    username: string = '';

    constructor(private authService: AuthService) {
        this.authService.user$.subscribe(user => {
            if (user) {
                this.userEmail = user.email;
                this.username = user.username || '';
            }
        });
    }
}
