import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IngredientService, Ingredient } from '../../services/ingredient.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-ingredient-detail',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './ingredient-detail.component.html',
    styleUrls: ['./ingredient-detail.component.scss']
})
export class IngredientDetailComponent implements OnInit {
    ingredient: Ingredient | null = null;
    loading = true;
    error: string | null = null;
    isAdmin = false;

    // For nutrition chart
    macroNutrients = {
        protein: 0,
        carbs: 0,
        fat: 0
    };

    totalMacros = 0;

    constructor(
        private ingredientService: IngredientService,
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.checkAdminStatus();

        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadIngredient(id);
            } else {
                this.error = 'Hiányzó azonosító.';
                this.loading = false;
            }
        });
    }

    checkAdminStatus(): void {
        this.authService.user$.subscribe(user => {
            this.isAdmin = user?.role === 'admin';
        });
    }

    loadIngredient(id: string): void {
        this.loading = true;
        this.error = null;

        this.ingredientService.getIngredientById(id).subscribe({
            next: (ingredient) => {
                this.ingredient = ingredient;
                this.calculateMacroNutrients();
                this.loading = false;
            },
            error: (err) => {
                this.error = err.message || 'Hiba történt a hozzávaló betöltése közben.';
                this.loading = false;
            }
        });
    }

    calculateMacroNutrients(): void {
        if (this.ingredient && this.ingredient.nutritionalInfo) {
            this.macroNutrients.protein = this.ingredient.nutritionalInfo.protein || 0;
            this.macroNutrients.carbs = this.ingredient.nutritionalInfo.carbs || 0;
            this.macroNutrients.fat = this.ingredient.nutritionalInfo.fat || 0;

            this.totalMacros = this.macroNutrients.protein + this.macroNutrients.carbs + this.macroNutrients.fat;
        }
    }

    getProteinPercentage(): number {
        return this.totalMacros > 0 ? (this.macroNutrients.protein / this.totalMacros) * 100 : 0;
    }

    getCarbsPercentage(): number {
        return this.totalMacros > 0 ? (this.macroNutrients.carbs / this.totalMacros) * 100 : 0;
    }

    getFatPercentage(): number {
        return this.totalMacros > 0 ? (this.macroNutrients.fat / this.totalMacros) * 100 : 0;
    }

    editIngredient(): void {
        if (this.ingredient) {
            this.router.navigate(['/ingredients/edit', this.ingredient._id]);
        }
    }

    deleteIngredient(): void {
        if (this.ingredient && confirm('Biztosan törölni szeretnéd ezt a hozzávalót?')) {
            this.loading = true;
            this.ingredientService.deleteIngredient(this.ingredient._id).subscribe({
                next: () => {
                    this.router.navigate(['/ingredients']);
                },
                error: (err) => {
                    this.error = err.message || 'Hiba történt a hozzávaló törlése közben.';
                    this.loading = false;
                }
            });
        }
    }

    goBack(): void {
        this.router.navigate(['/ingredients']);
    }

    getCategoryTranslation(category: string): string {
        const categoryMap: { [key: string]: string } = {
            'vegetables': 'Zöldségek',
            'fruits': 'Gyümölcsök',
            'grains': 'Gabonafélék',
            'dairy': 'Tejtermékek',
            'protein': 'Fehérjeforrások',
            'nuts_seeds': 'Diófélék és magvak',
            'herbs_spices': 'Fűszerek',
            'oils_fats': 'Olajok és zsírok',
            'sweeteners': 'Édesítőszerek',
            'condiments': 'Ízesítők',
            'beverages': 'Italok',
            'other': 'Egyéb'
        };

        return categoryMap[category] || category;
    }

    getAllergenTranslation(allergen: string): string {
        const allergenMap: { [key: string]: string } = {
            'gluten': 'Glutén',
            'dairy': 'Tejtermék',
            'nuts': 'Diófélék',
            'eggs': 'Tojás',
            'soy': 'Szója',
            'fish': 'Hal',
            'shellfish': 'Rákfélék',
            'none': 'Nincs'
        };

        return allergenMap[allergen] || allergen;
    }
}
