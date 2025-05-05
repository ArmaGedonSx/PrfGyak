import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecipeService, Recipe, RecipeResponse } from '../../services/recipe.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-recipe-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './recipe-list.component.html',
    styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit {
    recipes: Recipe[] = [];
    loading = true;
    error: string | null = null;
    pagination: RecipeResponse['pagination'] | null = null;
    currentPage = 1;
    isAdmin = false;
    currentUserId: string | null = null;

    constructor(
        private recipeService: RecipeService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadRecipes();

        // Ellenőrizzük, hogy a felhasználó admin-e és eltároljuk a user ID-t
        this.authService.user$.subscribe(user => {
            this.isAdmin = user?.role === 'admin';
            this.currentUserId = user?.id || null;
        });
    }

    loadRecipes(): void {
        this.loading = true;
        this.error = null;

        this.recipeService.getRecipes(this.currentPage)
            .subscribe({
                next: (response) => {
                    this.recipes = response.recipes;
                    this.pagination = response.pagination;
                    this.loading = false;
                },
                error: (err) => {
                    this.error = err.message || 'Hiba történt a receptek betöltése közben.';
                    this.loading = false;
                }
            });
    }

    changePage(page: number): void {
        this.currentPage = page;
        this.loadRecipes();
    }

    getDifficultyText(difficulty: string): string {
        const difficultyMap: { [key: string]: string } = {
            'easy': 'Könnyű',
            'medium': 'Közepes',
            'hard': 'Nehéz'
        };

        return difficultyMap[difficulty] || difficulty;
    }

    getStars(rating: number): number[] {
        return Array(Math.round(rating)).fill(0);
    }

    // Ellenőrzi, hogy a felhasználó szerkesztheti-e a receptet
    canEditRecipe(recipe: Recipe): boolean {
        if (!this.currentUserId) return false;
        return this.isAdmin || recipe.author._id === this.currentUserId;
    }

    // Recept szerkesztése
    editRecipe(recipeId: string, event: Event): void {
        event.stopPropagation(); // Megakadályozza a kártyára való kattintást
        this.router.navigate(['/recipes/edit', recipeId]);
    }

    // Recept törlése
    deleteRecipe(recipeId: string, event: Event): void {
        event.stopPropagation(); // Megakadályozza a kártyára való kattintást

        if (confirm('Biztosan törölni szeretnéd ezt a receptet?')) {
            this.loading = true;
            this.recipeService.deleteRecipe(recipeId).subscribe({
                next: () => {
                    // Sikeres törlés után frissítjük a listát
                    this.loadRecipes();
                },
                error: (err) => {
                    this.error = err.message || 'Hiba történt a recept törlése közben.';
                    this.loading = false;
                }
            });
        }
    }
}
