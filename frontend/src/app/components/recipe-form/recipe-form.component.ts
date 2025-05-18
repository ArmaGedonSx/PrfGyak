import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService, Recipe } from '../../services/recipe.service';
import { IngredientService } from '../../services/ingredient.service';
import { AuthService } from '../../services/auth.service';

interface Ingredient {
    _id: string;
    name: string;
    category: string;
    image: string;
}

interface IngredientQuantity {
    ingredientId: {
        _id: string;
        name: string;
        category: string;
        image: string;
    };
    quantity: number;
    unit: string;
    _id?: string;
}

@Component({
    selector: 'app-recipe-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
    ],
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
    ingredients: Ingredient[] = [];
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
            next: (response: any) => {
                this.ingredients = response.ingredients;
            },
            error: (err: any) => {
                console.error('Error loading ingredients:', err);
                this.error = 'Hiba történt a hozzávalók betöltése közben.';
            }
        });
    }

    loadRecipe(id: string | null): void {
        if (!id) return;
        this.loading = true;

        this.recipeService.getRecipeById(id).subscribe({
            next: (recipe: any) => {
                // Mély másolatot készítünk a recept adatokról
                this.recipe = JSON.parse(JSON.stringify(recipe));

                // Biztosítjuk, hogy minden tömb inicializálva legyen
                if (!this.recipe.ingredientQuantities) this.recipe.ingredientQuantities = [];
                if (!this.recipe.steps || this.recipe.steps.length === 0) this.recipe.steps = [''];
                if (!this.recipe.categories || this.recipe.categories.length === 0) this.recipe.categories = [''];
                if (!this.recipe.tags) this.recipe.tags = [];
                if (!this.recipe.images) this.recipe.images = [];

                // Biztosítjuk, hogy minden hozzávaló teljes objektumként legyen tárolva
                this.recipe.ingredientQuantities = this.recipe.ingredientQuantities.map((iq: any) => {
                    // Ha a hozzávaló ID csak egy string, akkor keressük meg a teljes objektumot
                    if (typeof iq.ingredientId === 'string' || !iq.ingredientId.name) {
                        const ingredientId = typeof iq.ingredientId === 'string' ? iq.ingredientId : iq.ingredientId._id;
                        const foundIngredient = this.ingredients.find(ing => ing._id === ingredientId);

                        if (foundIngredient) {
                            return {
                                ...iq,
                                ingredientId: {
                                    _id: foundIngredient._id,
                                    name: foundIngredient.name,
                                    category: foundIngredient.category,
                                    image: foundIngredient.image
                                }
                            };
                        }
                    }
                    return iq;
                });

                console.log('Loaded recipe:', this.recipe);
                this.loading = false;
            },
            error: (err: any) => {
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

    // Hozzávaló frissítése a kiválasztott ID alapján
    updateIngredient(index: number, ingredientId: string): void {
        if (!this.recipe.ingredientQuantities) return;

        console.log(`Updating ingredient at index ${index} with ID: ${ingredientId}`);

        // Megkeressük a kiválasztott hozzávalót
        const selectedIngredient = this.ingredients.find(ing => ing._id === ingredientId);
        console.log('Selected ingredient:', selectedIngredient);

        if (selectedIngredient) {
            // Frissítjük a teljes ingredientId objektumot
            this.recipe.ingredientQuantities[index].ingredientId = {
                _id: selectedIngredient._id,
                name: selectedIngredient.name,
                category: selectedIngredient.category,
                image: selectedIngredient.image
            };
        } else {
            // Ha nincs kiválasztva hozzávaló, akkor üres objektumot állítunk be
            this.recipe.ingredientQuantities[index].ingredientId = {
                _id: '',
                name: '',
                category: '',
                image: ''
            };
        }

        // Kiírjuk a frissített hozzávalót
        console.log('Updated ingredient:', this.recipe.ingredientQuantities[index]);

        // Kényszerítjük a DOM frissítését
        setTimeout(() => {
            console.log('Ingredient quantities after update:', JSON.stringify(this.recipe.ingredientQuantities));
        }, 0);
    }

    // Segédfüggvény az ID-k összehasonlításához
    compareIngredientIds(ingredientId1: any, ingredientId2: any): boolean {
        // Kiírjuk az ID-ket debug célból
        console.log('Comparing IDs:', ingredientId1, ingredientId2);

        // Ha bármelyik null vagy undefined, akkor nem egyeznek
        if (!ingredientId1 || !ingredientId2) return false;

        // Ha mindkettő string, akkor egyszerű összehasonlítás
        if (typeof ingredientId1 === 'string' && typeof ingredientId2 === 'string') {
            return ingredientId1 === ingredientId2;
        }

        // Ha az egyik string, a másik objektum
        if (typeof ingredientId1 === 'string' && typeof ingredientId2 === 'object') {
            return ingredientId1 === ingredientId2._id;
        }

        if (typeof ingredientId1 === 'object' && typeof ingredientId2 === 'string') {
            return ingredientId1._id === ingredientId2;
        }

        // Ha mindkettő objektum
        if (typeof ingredientId1 === 'object' && typeof ingredientId2 === 'object') {
            return ingredientId1._id === ingredientId2._id;
        }

        return false;
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
                next: (response: any) => {
                    this.loading = false;
                    this.router.navigate(['/recipes', this.recipeId]);
                },
                error: (err: any) => {
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
                next: (response: any) => {
                    this.loading = false;
                    this.router.navigate(['/recipes', response.recipe._id]);
                },
                error: (err: any) => {
                    this.error = 'Hiba történt a recept létrehozása közben: ' + (err.error?.message || err.message || 'Ismeretlen hiba');
                    this.loading = false;
                    console.error('Create recipe error:', err);
                }
            });
        }
    }
}
