import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet],
    template: `
        <div class="container">
            <h1>Welcome to {{ title }}</h1>
            <p>This is a simple MEAN stack application.</p>
        </div>
    `,
    styles: [`
        .container {
            padding: 20px;
            text-align: center;
            font-family: Arial, sans-serif;
        }
        h1 {
            color: #333;
        }
    `]
})
export class AppComponent {
    title = 'MEAN Stack App';
}
