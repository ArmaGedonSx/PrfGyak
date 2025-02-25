import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, NavbarComponent],
    template: `
        <app-navbar></app-navbar>
        <main>
            <router-outlet></router-outlet>
        </main>
    `,
    styles: [`
        main {
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
    `]
})
export class AppComponent { }
