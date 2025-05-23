import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AdminService, User } from '../../services/admin.service';
import { Recipe, RecipeService } from '../../services/recipe.service';
import { Ingredient, IngredientService } from '../../services/ingredient.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  // Statisztikák
  userCount: number | null = null;
  recipeCount: number | null = null;
  ingredientCount: number | null = null;

  // Adatok
  users: User[] = [];
  recipes: Recipe[] = [];
  ingredients: Ingredient[] = [];

  // Aktív tab
  activeTab = 'users';

  // Állapotok
  loadingStats = false;
  loadingUsers = false;
  loadingRecipes = false;
  loadingIngredients = false;

  // Hibaüzenetek
  statsError: string | null = null;
  usersError: string | null = null;
  recipesError: string | null = null;
  ingredientsError: string | null = null;

  constructor(
    private adminService: AdminService,
    private recipeService: RecipeService,
    private ingredientService: IngredientService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadStats();
    this.loadUsers();
    this.loadRecipes();
    this.loadIngredients();
  }

  // Statisztikák betöltése
  loadStats(): void {
    this.loadingStats = true;
    this.statsError = null;

    this.adminService.getStats().subscribe({
      next: (stats) => {
        this.userCount = stats.userCount;
        this.recipeCount = stats.recipeCount;
        this.ingredientCount = stats.ingredientCount;
        this.loadingStats = false;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.statsError = 'Nem sikerült betölteni a statisztikákat.';
        this.loadingStats = false;
      }
    });
  }

  // Felhasználók betöltése
  loadUsers(): void {
    this.loadingUsers = true;
    this.usersError = null;

    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loadingUsers = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.usersError = 'Nem sikerült betölteni a felhasználókat.';
        this.loadingUsers = false;
      }
    });
  }

  // Receptek betöltése
  loadRecipes(): void {
    this.loadingRecipes = true;
    this.recipesError = null;

    this.adminService.getRecipes().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.recipeCount = recipes.length;
        this.loadingRecipes = false;
      },
      error: (err) => {
        console.error('Error loading recipes:', err);
        this.recipesError = 'Nem sikerült betölteni a recepteket.';
        this.loadingRecipes = false;
      }
    });
  }

  // Hozzávalók betöltése
  loadIngredients(): void {
    this.loadingIngredients = true;
    this.ingredientsError = null;

    this.adminService.getIngredients().subscribe({
      next: (ingredients) => {
        this.ingredients = ingredients;
        this.ingredientCount = ingredients.length;
        this.loadingIngredients = false;
      },
      error: (err) => {
        console.error('Error loading ingredients:', err);
        this.ingredientsError = 'Nem sikerült betölteni a hozzávalókat.';
        this.loadingIngredients = false;
      }
    });
  }

  // Felhasználó szerepkörének módosítása
  toggleUserRole(user: User): void {
    const newRole = user.role === 'admin' ? 'user' : 'admin';

    // Használjuk a user._id-t a user.id helyett, mivel a backend _id-t vár
    const userId = user._id || user.id;

    if (!userId) {
      console.error('User ID is undefined or null');
      this.usersError = 'Hiányzó felhasználó azonosító.';
      return;
    }

    this.adminService.updateUserRole(userId, newRole).subscribe({
      next: (updatedUser) => {
        // Frissítjük a felhasználót a listában
        // Használjuk a _id-t vagy id-t, amelyik elérhető
        const userId = updatedUser._id || updatedUser.id;
        const index = this.users.findIndex(u => u._id === userId || u.id === userId);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
      },
      error: (err) => {
        console.error('Error updating user role:', err);
        this.usersError = 'Nem sikerült módosítani a felhasználó szerepkörét.';
      }
    });
  }

  // Recept szerkesztése
  editRecipe(recipeId: string): void {
    this.router.navigate(['/recipes/edit', recipeId]);
  }

  // Recept törlése
  deleteRecipe(recipeId: string): void {
    if (confirm('Biztosan törölni szeretnéd ezt a receptet?')) {
      this.loadingRecipes = true;
      this.recipesError = null;

      // Ellenőrizzük, hogy a recipeId nem undefined
      if (!recipeId) {
        console.error('Recipe ID is undefined or null');
        this.recipesError = 'Hiányzó recept azonosító.';
        this.loadingRecipes = false;
        return;
      }

      this.recipeService.deleteRecipe(recipeId).subscribe({
        next: () => {
          // Sikeres törlés után frissítjük a listát
          this.loadRecipes();
        },
        error: (err) => {
          console.error('Error deleting recipe:', err);
          this.recipesError = 'Nem sikerült törölni a receptet.';
          this.loadingRecipes = false;
        }
      });
    }
  }

  // Kategória fordítása
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

  // Új hozzávaló hozzáadása
  addNewIngredient(): void {
    this.router.navigate(['/ingredients/new']);
  }

  // Összes hozzávaló megtekintése
  viewAllIngredients(): void {
    this.router.navigate(['/ingredients']);
  }

  // Hozzávaló szerkesztése
  editIngredient(ingredientId: string): void {
    this.router.navigate(['/ingredients/edit', ingredientId]);
  }

  // Hozzávaló törlése
  deleteIngredient(ingredientId: string): void {
    if (confirm('Biztosan törölni szeretnéd ezt a hozzávalót?')) {
      this.loadingIngredients = true;
      this.ingredientsError = null;

      // Ellenőrizzük, hogy az ingredientId nem undefined
      if (!ingredientId) {
        console.error('Ingredient ID is undefined or null');
        this.ingredientsError = 'Hiányzó hozzávaló azonosító.';
        this.loadingIngredients = false;
        return;
      }

      this.ingredientService.deleteIngredient(ingredientId).subscribe({
        next: () => {
          // Sikeres törlés után frissítjük a listát
          this.loadIngredients();
        },
        error: (err) => {
          console.error('Error deleting ingredient:', err);
          this.ingredientsError = 'Nem sikerült törölni a hozzávalót.';
          this.loadingIngredients = false;
        }
      });
    }
  }
}
