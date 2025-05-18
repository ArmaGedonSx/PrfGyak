import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { RecipeService, Recipe, RecipeResponse } from '../../services/recipe.service';
import { AuthService } from '../../services/auth.service';
import { RecipeFilterComponent } from '../recipe-filter/recipe-filter.component';

@Component({
    selector: 'app-recipe-list',
    standalone: true,
    imports: [CommonModule, RouterModule, RecipeFilterComponent],
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

    // Szűrési paraméterek
    filters: any = {
        search: '',
        category: '',
        difficulty: '',
        minTime: null,
        maxTime: null
    };

    constructor(
        private recipeService: RecipeService,
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        // URL paraméterek figyelése
        this.route.queryParams.subscribe(params => {
            this.currentPage = params['page'] ? parseInt(params['page']) : 1;

            // Szűrők beállítása az URL paraméterek alapján
            this.filters = {
                search: params['search'] || '',
                category: params['category'] || '',
                difficulty: params['difficulty'] || '',
                minTime: params['minTime'] ? parseInt(params['minTime']) : null,
                maxTime: params['maxTime'] ? parseInt(params['maxTime']) : null
            };

            this.loadRecipes();
        });

        // Ellenőrizzük, hogy a felhasználó admin-e és eltároljuk a user ID-t
        this.authService.user$.subscribe(user => {
            this.isAdmin = user?.role === 'admin';
            this.currentUserId = user?.id || null;
        });
    }

    loadRecipes(): void {
        this.loading = true;
        this.error = null;

        this.recipeService.getRecipes(
            this.currentPage,
            10,
            this.filters.search,
            this.filters.category,
            this.filters.difficulty,
            this.filters.minTime,
            this.filters.maxTime
        ).subscribe({
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

    // Szűrők alkalmazása
    applyFilters(filters: any): void {
        // URL paraméterek frissítése
        const queryParams: any = {};

        if (filters.search) queryParams.search = filters.search;
        if (filters.category) queryParams.category = filters.category;
        if (filters.difficulty) queryParams.difficulty = filters.difficulty;
        if (filters.minTime) queryParams.minTime = filters.minTime;
        if (filters.maxTime) queryParams.maxTime = filters.maxTime;

        // Navigálás az új paraméterekkel
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: queryParams
        });
    }

    changePage(page: number): void {
        // Navigálás az új oldal paraméterrel, megtartva a szűrőket
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                page,
                ...this.filters.search ? { search: this.filters.search } : {},
                ...this.filters.category ? { category: this.filters.category } : {},
                ...this.filters.difficulty ? { difficulty: this.filters.difficulty } : {},
                ...this.filters.minTime ? { minTime: this.filters.minTime } : {},
                ...this.filters.maxTime ? { maxTime: this.filters.maxTime } : {}
            }
        });
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
