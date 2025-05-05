import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService, Recipe } from '../../services/recipe.service';
import { IngredientService } from '../../services/ingredient.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-recipe-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './recipe-form.component.html',
    styleUrls: ['./recipe-form.component.scss']
})
export class RecipeFormComponent implements OnInit {
    recipe: Partial<Recipe> = {
        title: '',
        description: '',
        prepTime: 15,
        cookTime: 30,
        servings: 4,
        difficulty: 'medium',
        ingredientQuantities: [],
        steps: [''],
        categories: [''],
        tags: [''],
        images: ['']
    };

    isEditing = false;
    recipeId: string | null = null;
    loading = false;
    error: string | null = null;
    ingredients: any[] = [];
    isAdmin = false;

    constructor(
        private recipeService: RecipeService,
        private ingredientService: IngredientService,
        private authService: AuthService,
        public router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        // Ellenőrizzük, hogy a felhasználó admin-e (csak információs célból)
        this.authService.user$.subscribe(user => {
            this.isAdmin = user?.role === 'admin';
            console.log('Is admin:', this.isAdmin);
        });

        // Betöltjük a hozzávalókat
        this.loadIngredients();

        // Ellenőrizzük, hogy szerkesztés vagy létrehozás
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.recipeId = params['id'];
                this.isEditing = true;
                this.loadRecipe(this.recipeId);
            }
        });
    }

    loadIngredients(): void {
        this.ingredientService.getIngredients().subscribe({
            next: (response) => {
                this.ingredients = response.ingredients;
            },
            error: (err) => {
                console.error('Error loading ingredients:', err);
                this.error = 'Hiba történt a hozzávalók betöltése közben.';
            }
        });
    }

    loadRecipe(id: string | null): void {
        if (!id) return;
        this.loading = true;

        this.recipeService.getRecipeById(id).subscribe({
            next: (recipe) => {
                this.recipe = { ...recipe };
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Hiba történt a recept betöltése közben.';
                this.loading = false;
                console.error(err);
            }
        });
    }

    // Hozzávaló hozzáadása
    addIngredient(): void {
        if (!this.recipe.ingredientQuantities) {
            this.recipe.ingredientQuantities = [];
        }

        this.recipe.ingredientQuantities.push({
            ingredientId: { _id: '', name: '', category: '', image: '' },
            quantity: 1,
            unit: 'g'
        });
    }

    // Hozzávaló eltávolítása
    removeIngredient(index: number): void {
        if (this.recipe.ingredientQuantities) {
            this.recipe.ingredientQuantities.splice(index, 1);
        }
    }

    // Lépés hozzáadása
    addStep(): void {
        if (!this.recipe.steps) {
            this.recipe.steps = [];
        }

        this.recipe.steps.push('');
    }

    // Lépés eltávolítása
    removeStep(index: number): void {
        if (this.recipe.steps && this.recipe.steps.length > 1) {
            this.recipe.steps.splice(index, 1);
        }
    }

    // Kategória hozzáadása
    addCategory(): void {
        if (!this.recipe.categories) {
            this.recipe.categories = [];
        }

        this.recipe.categories.push('');
    }

    // Kategória eltávolítása
    removeCategory(index: number): void {
        if (this.recipe.categories && this.recipe.categories.length > 1) {
            this.recipe.categories.splice(index, 1);
        }
    }

    // Tag hozzáadása
    addTag(): void {
        if (!this.recipe.tags) {
            this.recipe.tags = [];
        }

        this.recipe.tags.push('');
    }

    // Tag eltávolítása
    removeTag(index: number): void {
        if (this.recipe.tags && this.recipe.tags.length > 0) {
            this.recipe.tags.splice(index, 1);
        }
    }

    // Kép URL hozzáadása
    addImage(): void {
        if (!this.recipe.images) {
            this.recipe.images = [];
        }

        this.recipe.images.push('');
    }

    // Kép URL eltávolítása
    removeImage(index: number): void {
        if (this.recipe.images && this.recipe.images.length > 0) {
            this.recipe.images.splice(index, 1);
        }
    }

    // Űrlap beküldése
    onSubmit(): void {
        this.loading = true;
        this.error = null;

        // Ellenőrizzük, hogy minden kötelező mező ki van-e töltve
        if (!this.recipe.title || !this.recipe.description) {
            this.error = 'A cím és a leírás megadása kötelező!';
            this.loading = false;
            return;
        }

        // Szerkesztés vagy létrehozás
        if (this.isEditing && this.recipeId) {
            this.recipeService.updateRecipe(this.recipeId, this.recipe).subscribe({
                next: (response) => {
                    this.loading = false;
                    this.router.navigate(['/recipes', this.recipeId]);
                },
                error: (err) => {
                    if (err.status === 403) {
                        this.error = 'Nincs jogosultságod a recept szerkesztéséhez. Csak a recept tulajdonosa vagy admin felhasználók szerkeszthetik.';
                    } else {
                        this.error = 'Hiba történt a recept mentése közben: ' + (err.error?.message || err.message || 'Ismeretlen hiba');
                    }
                    this.loading = false;
                    console.error('Update recipe error:', err);
                }
            });
        } else {
            this.recipeService.createRecipe(this.recipe).subscribe({
                next: (response) => {
                    this.loading = false;
                    this.router.navigate(['/recipes', response.recipe._id]);
                },
                error: (err) => {
                    this.error = 'Hiba történt a recept létrehozása közben: ' + (err.error?.message || err.message || 'Ismeretlen hiba');
                    this.loading = false;
                    console.error('Create recipe error:', err);
                }
            });
        }
    }
}
