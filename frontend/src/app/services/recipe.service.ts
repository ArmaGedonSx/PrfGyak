import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Recipe {
    _id: string;
    title: string;
    description: string;
    author: {
        _id: string;
        username: string;
        profilePicture: string;
    };
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: string;
    ingredientQuantities: Array<{
        ingredientId: {
            _id: string;
            name: string;
            category: string;
            image: string;
        };
        quantity: number;
        unit: string;
    }>;
    steps: string[];
    categories: string[];
    tags: string[];
    images: string[];
    ratings: Array<{
        userId: string;
        rating: number;
        comment: string;
        date: Date;
    }>;
    averageRating: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface RecipeResponse {
    recipes: Recipe[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class RecipeService {
    private apiUrl = `${environment.apiUrl}/api/recipes`;

    constructor(private http: HttpClient) { }

    // Get all recipes with optional filters
    getRecipes(
        page: number = 1,
        limit: number = 10,
        search?: string,
        category?: string,
        difficulty?: string,
        sort: string = 'createdAt',
        order: string = 'desc'
    ): Observable<RecipeResponse> {
        let url = `${this.apiUrl}?page=${page}&limit=${limit}&sort=${sort}&order=${order}`;

        if (search) {
            url += `&search=${search}`;
        }

        if (category) {
            url += `&category=${category}`;
        }

        if (difficulty) {
            url += `&difficulty=${difficulty}`;
        }

        return this.http.get<RecipeResponse>(url);
    }

    // Get recipe by ID
    getRecipeById(id: string): Observable<Recipe> {
        return this.http.get<Recipe>(`${this.apiUrl}/${id}`);
    }

    // Create new recipe
    createRecipe(recipe: Partial<Recipe>): Observable<{ message: string; recipe: Recipe }> {
        return this.http.post<{ message: string; recipe: Recipe }>(this.apiUrl, recipe);
    }

    // Update recipe
    updateRecipe(id: string, recipe: Partial<Recipe>): Observable<{ message: string; recipe: Recipe }> {
        return this.http.put<{ message: string; recipe: Recipe }>(`${this.apiUrl}/${id}`, recipe);
    }

    // Delete recipe
    deleteRecipe(id: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
    }

    // Rate recipe
    rateRecipe(id: string, rating: number, comment?: string): Observable<{ message: string; recipe: Recipe }> {
        return this.http.post<{ message: string; recipe: Recipe }>(`${this.apiUrl}/${id}/rate`, { rating, comment });
    }

    // Add recipe to favorites
    addToFavorites(id: string): Observable<{ message: string; favoriteRecipes: string[] }> {
        return this.http.post<{ message: string; favoriteRecipes: string[] }>(`${this.apiUrl}/${id}/favorite`, {});
    }

    // Remove recipe from favorites
    removeFromFavorites(id: string): Observable<{ message: string; favoriteRecipes: string[] }> {
        return this.http.delete<{ message: string; favoriteRecipes: string[] }>(`${this.apiUrl}/${id}/favorite`);
    }

    // Get user's favorite recipes
    getFavoriteRecipes(): Observable<Recipe[]> {
        return this.http.get<Recipe[]>(`${this.apiUrl}/user/favorites`);
    }
}
