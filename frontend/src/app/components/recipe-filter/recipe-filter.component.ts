import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { debounceTime, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
    selector: 'app-recipe-filter',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './recipe-filter.component.html',
    styleUrls: ['./recipe-filter.component.scss']
})
export class RecipeFilterComponent implements OnInit, OnChanges {
    @Output() filtersChanged = new EventEmitter<any>();
    @Input() initialFilters: any = {};

    filterForm = new FormGroup({
        search: new FormControl(''),
        category: new FormControl(''),
        difficulty: new FormControl(''),
        minTime: new FormControl(null),
        maxTime: new FormControl(null)
    });

    categories: string[] = [];
    difficulties = [
        { value: 'easy', label: 'Könnyű' },
        { value: 'medium', label: 'Közepes' },
        { value: 'hard', label: 'Nehéz' }
    ];

    loading = false;
    error: string | null = null;

    constructor(private recipeService: RecipeService) { }

    ngOnInit() {
        this.loadCategories();

        // Szűrők változásának figyelése
        this.filterForm.valueChanges
            .pipe(debounceTime(300))
            .subscribe(filters => {
                this.filtersChanged.emit(filters);
            });

        // Kezdeti értékek beállítása
        this.setInitialValues();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['initialFilters']) {
            this.setInitialValues();
        }
    }

    setInitialValues() {
        if (this.initialFilters) {
            this.filterForm.patchValue({
                search: this.initialFilters.search || '',
                category: this.initialFilters.category || '',
                difficulty: this.initialFilters.difficulty || '',
                minTime: this.initialFilters.minTime || null,
                maxTime: this.initialFilters.maxTime || null
            }, { emitEvent: false });
        }
    }

    loadCategories() {
        this.loading = true;
        this.error = null;
        console.log('Loading categories...');

        this.recipeService.getCategories().subscribe({
            next: (categories) => {
                this.categories = categories;
                this.loading = false;
                console.log('Categories loaded successfully:', categories);
            },
            error: (err) => {
                const errorMessage = err.message || 'Ismeretlen hiba történt';
                this.error = `Hiba történt a kategóriák betöltése közben: ${errorMessage}`;
                this.loading = false;

                // Részletes hibaüzenet a fejlesztői konzolra
                console.error('Category loading error:', err);
                if (err.status) {
                    console.error(`HTTP Status: ${err.status}, Status Text: ${err.statusText}`);
                }
                if (err.error) {
                    console.error('Error details:', err.error);
                }

                // Hibaüzenet megjelenítése, de a form továbbra is használható
                this.filterForm.enable();
            }
        });
    }

    resetFilters() {
        this.filterForm.reset({
            search: '',
            category: '',
            difficulty: '',
            minTime: null,
            maxTime: null
        });
    }
}
