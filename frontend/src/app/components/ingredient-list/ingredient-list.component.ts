import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IngredientService, Ingredient } from '../../services/ingredient.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-ingredient-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './ingredient-list.component.html',
    styleUrls: ['./ingredient-list.component.scss']
})
export class IngredientListComponent implements OnInit {
    ingredients: Ingredient[] = [];
    categories: string[] = [];
    loading = true;
    error: string | null = null;
    pagination: any = null;
    currentPage = 1;
    searchTerm = '';
    selectedCategory = '';
    isAdmin = false;

    constructor(
        private ingredientService: IngredientService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadIngredients();
        this.loadCategories();
        this.checkAdminStatus();
    }

    checkAdminStatus(): void {
        this.authService.user$.subscribe(user => {
            this.isAdmin = user?.role === 'admin';
        });
    }

    loadIngredients(): void {
        this.loading = true;
        this.error = null;

        this.ingredientService.getIngredients(
            this.currentPage,
            10,
            this.searchTerm,
            this.selectedCategory
        ).subscribe({
            next: (response) => {
                this.ingredients = response.ingredients;
                this.pagination = response.pagination;
                this.loading = false;
            },
            error: (err) => {
                this.error = err.message || 'Hiba történt a hozzávalók betöltése közben.';
                this.loading = false;
            }
        });
    }

    loadCategories(): void {
        this.ingredientService.getCategories().subscribe({
            next: (categories) => {
                this.categories = categories;
            },
            error: (err) => {
                console.error('Error loading categories:', err);
            }
        });
    }

    onSearch(): void {
        this.currentPage = 1;
        this.loadIngredients();
    }

    onCategoryChange(): void {
        this.currentPage = 1;
        this.loadIngredients();
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.selectedCategory = '';
        this.currentPage = 1;
        this.loadIngredients();
    }

    changePage(page: number): void {
        this.currentPage = page;
        this.loadIngredients();
    }

    editIngredient(id: string, event: Event): void {
        event.stopPropagation();
        this.router.navigate(['/ingredients/edit', id]);
    }

    deleteIngredient(id: string, event: Event): void {
        event.stopPropagation();

        if (confirm('Biztosan törölni szeretnéd ezt a hozzávalót?')) {
            this.loading = true;
            this.ingredientService.deleteIngredient(id).subscribe({
                next: () => {
                    this.loadIngredients();
                },
                error: (err) => {
                    this.error = err.message || 'Hiba történt a hozzávaló törlése közben.';
                    this.loading = false;
                }
            });
        }
    }

    viewIngredient(id: string): void {
        this.router.navigate(['/ingredients', id]);
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
