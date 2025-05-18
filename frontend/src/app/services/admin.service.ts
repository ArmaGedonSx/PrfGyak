import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RecipeService, Recipe } from './recipe.service';
import { IngredientService, Ingredient } from './ingredient.service';

export interface User {
    id: string;
    username: string;
    email: string;
    role?: string;
    profilePicture?: string;
    dietaryPreferences?: string[];
}

export interface Stats {
    userCount: number;
    recipeCount: number;
    ingredientCount: number;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = 'http://localhost:3000/api';

    constructor(
        private http: HttpClient,
        private recipeService: RecipeService,
        private ingredientService: IngredientService
    ) { }

    // Felhasználók lekérdezése
    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/admin/users`);
    }

    // Felhasználó szerepkörének módosítása
    updateUserRole(userId: string, role: string): Observable<User> {
        return this.http.patch<User>(`${this.apiUrl}/admin/users/${userId}/role`, { role });
    }

    // Statisztikák lekérdezése
    getStats(): Observable<Stats> {
        return this.http.get<Stats>(`${this.apiUrl}/admin/stats`);
    }

    // Receptek lekérdezése
    getRecipes(): Observable<Recipe[]> {
        return this.recipeService.getRecipes(1, 100).pipe(
            map(response => response.recipes)
        );
    }

    // Hozzávalók lekérdezése
    getIngredients(): Observable<Ingredient[]> {
        return this.ingredientService.getIngredients(1, 100).pipe(
            map(response => response.ingredients)
        );
    }
}
