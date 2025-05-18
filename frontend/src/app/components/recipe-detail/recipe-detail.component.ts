import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecipeService, Recipe, NutritionInfo } from '../../services/recipe.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-recipe-detail',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './recipe-detail.component.html',
    styleUrls: ['./recipe-detail.component.scss']
})
export class RecipeDetailComponent implements OnInit {
    recipe: Recipe | null = null;
    nutritionInfo: NutritionInfo | null = null;
    loading = true;
    error: string | null = null;
    isAdmin = false;
    currentUserId: string | null = null;
    isFavorite = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private recipeService: RecipeService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        // Get user info
        this.authService.user$.subscribe(user => {
            this.isAdmin = user?.role === 'admin';
            this.currentUserId = user?.id || null;
        });

        // Get recipe ID from route
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.loadRecipe(id);
                this.loadNutrition(id);
            }
        });
    }

    loadRecipe(id: string): void {
        this.loading = true;
        this.error = null;

        this.recipeService.getRecipeById(id).subscribe({
            next: (recipe) => {
                this.recipe = recipe;
                this.loading = false;
                this.checkIfFavorite(id);
            },
            error: (err) => {
                this.error = 'Hiba történt a recept betöltése közben: ' + (err.error?.message || err.message || 'Ismeretlen hiba');
                this.loading = false;
            }
        });
    }

    loadNutrition(id: string): void {
        this.recipeService.getRecipeNutrition(id).subscribe({
            next: (nutrition) => {
                this.nutritionInfo = nutrition;
            },
            error: (err) => {
                console.error('Error loading nutrition info:', err);
            }
        });
    }

    checkIfFavorite(recipeId: string): void {
        this.recipeService.getFavoriteRecipes().subscribe({
            next: (favorites) => {
                this.isFavorite = favorites.some(recipe => recipe._id === recipeId);
            },
            error: (err) => {
                console.error('Error checking favorites:', err);
            }
        });
    }

    toggleFavorite(): void {
        if (!this.recipe) return;

        if (this.isFavorite) {
            this.recipeService.removeFromFavorites(this.recipe._id).subscribe({
                next: () => {
                    this.isFavorite = false;
                },
                error: (err) => {
                    console.error('Error removing from favorites:', err);
                }
            });
        } else {
            this.recipeService.addToFavorites(this.recipe._id).subscribe({
                next: () => {
                    this.isFavorite = true;
                },
                error: (err) => {
                    console.error('Error adding to favorites:', err);
                }
            });
        }
    }

    canEditRecipe(): boolean {
        if (!this.recipe || !this.currentUserId) return false;
        return this.isAdmin || this.recipe.author._id === this.currentUserId;
    }

    editRecipe(): void {
        if (!this.recipe) return;
        this.router.navigate(['/recipes/edit', this.recipe._id]);
    }

    deleteRecipe(): void {
        if (!this.recipe) return;

        if (confirm('Biztosan törölni szeretnéd ezt a receptet?')) {
            this.recipeService.deleteRecipe(this.recipe._id).subscribe({
                next: () => {
                    this.router.navigate(['/recipes']);
                },
                error: (err) => {
                    this.error = 'Hiba történt a recept törlése közben: ' + (err.error?.message || err.message || 'Ismeretlen hiba');
                }
            });
        }
    }

    // Helper methods for the template
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

    // Calculate macronutrient percentages for the pie chart
    getMacroPercentages(): { protein: number, carbs: number, fat: number } | null {
        if (!this.nutritionInfo) return null;

        const { protein, carbs, fat } = this.nutritionInfo.perServing;
        const proteinCalories = protein * 4;
        const carbsCalories = carbs * 4;
        const fatCalories = fat * 9;
        const totalCalories = proteinCalories + carbsCalories + fatCalories;

        if (totalCalories === 0) return null;

        return {
            protein: Math.round((proteinCalories / totalCalories) * 100),
            carbs: Math.round((carbsCalories / totalCalories) * 100),
            fat: Math.round((fatCalories / totalCalories) * 100)
        };
    }
}
