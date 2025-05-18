import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Ingredient {
    _id: string;
    name: string;
    category: string;
    nutritionalInfo: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
        sugar: number;
    };
    commonUnits: string[];
    image: string;
    allergens: string[];
    description: string;
}

export interface IngredientResponse {
    ingredients: Ingredient[];
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
export class IngredientService {
    private apiUrl = `${environment.apiUrl}/api/ingredients`;

    constructor(private http: HttpClient) { }

    // Get all ingredients with optional filters
    getIngredients(
        page: number = 1,
        limit: number = 50,
        search?: string,
        category?: string,
        sort: string = 'name',
        order: string = 'asc'
    ): Observable<IngredientResponse> {
        let url = `${this.apiUrl}?page=${page}&limit=${limit}&sort=${sort}&order=${order}`;

        if (search) {
            url += `&search=${search}`;
        }

        if (category) {
            url += `&category=${category}`;
        }

        return this.http.get<IngredientResponse>(url);
    }

    // Get ingredient by ID
    getIngredientById(id: string): Observable<Ingredient> {
        return this.http.get<Ingredient>(`${this.apiUrl}/${id}`);
    }

    // Create new ingredient (admin only)
    createIngredient(ingredient: Partial<Ingredient>): Observable<{ message: string; ingredient: Ingredient }> {
        return this.http.post<{ message: string; ingredient: Ingredient }>(this.apiUrl, ingredient);
    }

    // Update ingredient (admin only)
    updateIngredient(id: string, ingredient: Partial<Ingredient>): Observable<{ message: string; ingredient: Ingredient }> {
        return this.http.put<{ message: string; ingredient: Ingredient }>(`${this.apiUrl}/${id}`, ingredient);
    }

    // Delete ingredient (admin only)
    deleteIngredient(id: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
    }

    // Get ingredient categories
    getCategories(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/util/categories`);
    }

    // Search ingredients by name
    searchIngredients(query: string): Observable<Ingredient[]> {
        return this.http.get<Ingredient[]>(`${this.apiUrl}/search/${query}`);
    }
}
