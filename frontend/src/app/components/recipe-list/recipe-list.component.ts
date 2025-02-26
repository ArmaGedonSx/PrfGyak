import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeService, Recipe, RecipeResponse } from '../../services/recipe.service';

@Component({
    selector: 'app-recipe-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './recipe-list.component.html',
    styleUrls: ['./recipe-list.component.scss']
})
export class RecipeListComponent implements OnInit {
    recipes: Recipe[] = [];
    loading = true;
    error: string | null = null;
    pagination: RecipeResponse['pagination'] | null = null;
    currentPage = 1;

    constructor(private recipeService: RecipeService) { }

    ngOnInit(): void {
        this.loadRecipes();
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
}
