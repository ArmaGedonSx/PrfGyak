import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PinterestService {
    // Mivel a Pinterest API használatához regisztráció és API kulcs szükséges,
    // egyszerűsítésként használhatunk egy mock adatot vagy egy nyilvános API-t
    private mockImages = [
        'https://i.pinimg.com/564x/e8/d3/9c/e8d39c4b6d1a6a90e3f63a357a8d952b.jpg',
        'https://i.pinimg.com/564x/a5/b0/7d/a5b07d2c3e7a7b1e8e8e8e8e8e8e8e8.jpg',
        'https://i.pinimg.com/564x/b5/c0/8e/b5c08e2c4e8e8e8e8e8e8e8e8e8e8e8.jpg',
        'https://i.pinimg.com/564x/c5/d0/9f/c5d09f3c5e9e9e9e9e9e9e9e9e9e9e9.jpg',
        'https://i.pinimg.com/564x/d5/e0/af/d5e0af4d6f6f6f6f6f6f6f6f6f6f6f6.jpg',
        'https://i.pinimg.com/564x/e5/f0/bf/e5f0bf5g7g7g7g7g7g7g7g7g7g7g7g.jpg',
    ];

    constructor(private http: HttpClient) { }

    // Keresés a Pinterest-en (mock implementáció)
    searchImages(query: string): Observable<string[]> {
        // Valós implementációban itt hívnánk meg a Pinterest API-t
        // Példa: return this.http.get<{results: any[]}>(`/api/pinterest/search?q=${query}`)
        //    .pipe(map(response => response.results.map(item => item.imageUrl)));

        // Mock implementáció: véletlenszerűen kiválasztunk néhány képet a mockImages tömbből
        const randomCount = Math.floor(Math.random() * 4) + 2; // 2-5 kép
        const shuffled = [...this.mockImages].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, randomCount);

        // Késleltetés hozzáadása a valós API hívás szimulálásához
        return of(selected).pipe(
            catchError(error => {
                console.error('Error searching Pinterest images:', error);
                return of([]);
            })
        );
    }
}
