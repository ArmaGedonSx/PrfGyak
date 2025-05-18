import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IngredientService, Ingredient } from '../../services/ingredient.service';

@Component({
    selector: 'app-ingredient-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './ingredient-form.component.html',
    styleUrls: ['./ingredient-form.component.scss']
})
export class IngredientFormComponent implements OnInit {
    ingredientForm: FormGroup;
    isEditMode = false;
    ingredientId: string | null = null;
    loading = false;
    error: string | null = null;
    success: string | null = null;

    categoryOptions = [
        { value: 'vegetables', label: 'Zöldségek' },
        { value: 'fruits', label: 'Gyümölcsök' },
        { value: 'grains', label: 'Gabonafélék' },
        { value: 'dairy', label: 'Tejtermékek' },
        { value: 'protein', label: 'Fehérjeforrások' },
        { value: 'nuts_seeds', label: 'Diófélék és magvak' },
        { value: 'herbs_spices', label: 'Fűszerek' },
        { value: 'oils_fats', label: 'Olajok és zsírok' },
        { value: 'sweeteners', label: 'Édesítőszerek' },
        { value: 'condiments', label: 'Ízesítők' },
        { value: 'beverages', label: 'Italok' },
        { value: 'other', label: 'Egyéb' }
    ];

    allergenOptions = [
        { value: 'gluten', label: 'Glutén' },
        { value: 'dairy', label: 'Tejtermék' },
        { value: 'nuts', label: 'Diófélék' },
        { value: 'eggs', label: 'Tojás' },
        { value: 'soy', label: 'Szója' },
        { value: 'fish', label: 'Hal' },
        { value: 'shellfish', label: 'Rákfélék' },
        { value: 'none', label: 'Nincs' }
    ];

    commonUnitOptions = [
        'g', 'kg', 'ml', 'l', 'db', 'csipet', 'teáskanál', 'evőkanál', 'csésze', 'szelet'
    ];

    constructor(
        private fb: FormBuilder,
        private ingredientService: IngredientService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.ingredientForm = this.createForm();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.isEditMode = true;
                this.ingredientId = id;
                this.loadIngredient(id);
            }
        });
    }

    createForm(): FormGroup {
        return this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            category: ['', Validators.required],
            nutritionalInfo: this.fb.group({
                calories: [0, [Validators.required, Validators.min(0)]],
                protein: [0, [Validators.required, Validators.min(0)]],
                carbs: [0, [Validators.required, Validators.min(0)]],
                fat: [0, [Validators.required, Validators.min(0)]],
                fiber: [0, [Validators.required, Validators.min(0)]],
                sugar: [0, [Validators.required, Validators.min(0)]]
            }),
            commonUnits: [[]],
            image: [''],
            allergens: [[]],
            description: ['']
        });
    }

    loadIngredient(id: string): void {
        this.loading = true;
        this.ingredientService.getIngredientById(id).subscribe({
            next: (ingredient) => {
                this.updateForm(ingredient);
                this.loading = false;
            },
            error: (err) => {
                this.error = err.message || 'Hiba történt a hozzávaló betöltése közben.';
                this.loading = false;
            }
        });
    }

    updateForm(ingredient: Ingredient): void {
        this.ingredientForm.patchValue({
            name: ingredient.name,
            category: ingredient.category,
            nutritionalInfo: {
                calories: ingredient.nutritionalInfo?.calories || 0,
                protein: ingredient.nutritionalInfo?.protein || 0,
                carbs: ingredient.nutritionalInfo?.carbs || 0,
                fat: ingredient.nutritionalInfo?.fat || 0,
                fiber: ingredient.nutritionalInfo?.fiber || 0,
                sugar: ingredient.nutritionalInfo?.sugar || 0
            },
            commonUnits: ingredient.commonUnits || [],
            image: ingredient.image || '',
            allergens: ingredient.allergens || [],
            description: ingredient.description || ''
        });
    }

    onSubmit(): void {
        if (this.ingredientForm.invalid) {
            this.markFormGroupTouched(this.ingredientForm);
            return;
        }

        this.loading = true;
        this.error = null;
        this.success = null;

        const ingredientData = this.ingredientForm.value;

        if (this.isEditMode && this.ingredientId) {
            this.ingredientService.updateIngredient(this.ingredientId, ingredientData).subscribe({
                next: (response) => {
                    this.success = 'Hozzávaló sikeresen frissítve!';
                    this.loading = false;
                    setTimeout(() => {
                        this.router.navigate(['/ingredients', this.ingredientId]);
                    }, 1500);
                },
                error: (err) => {
                    this.error = err.message || 'Hiba történt a hozzávaló frissítése közben.';
                    this.loading = false;
                }
            });
        } else {
            this.ingredientService.createIngredient(ingredientData).subscribe({
                next: (response) => {
                    this.success = 'Hozzávaló sikeresen létrehozva!';
                    this.loading = false;
                    setTimeout(() => {
                        this.router.navigate(['/ingredients', response.ingredient._id]);
                    }, 1500);
                },
                error: (err) => {
                    this.error = err.message || 'Hiba történt a hozzávaló létrehozása közben.';
                    this.loading = false;
                }
            });
        }
    }

    markFormGroupTouched(formGroup: FormGroup): void {
        Object.values(formGroup.controls).forEach(control => {
            control.markAsTouched();

            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }

    isFieldInvalid(controlName: string): boolean {
        const control = this.ingredientForm.get(controlName);
        return control ? control.invalid && (control.dirty || control.touched) : false;
    }

    isNutritionalFieldInvalid(fieldName: string): boolean {
        const control = this.ingredientForm.get(`nutritionalInfo.${fieldName}`);
        return control ? control.invalid && (control.dirty || control.touched) : false;
    }

    toggleCommonUnit(unit: string): void {
        const currentUnits = [...(this.ingredientForm.get('commonUnits')?.value || [])];

        if (currentUnits.includes(unit)) {
            const index = currentUnits.indexOf(unit);
            currentUnits.splice(index, 1);
        } else {
            currentUnits.push(unit);
        }

        this.ingredientForm.get('commonUnits')?.setValue(currentUnits);
    }

    isCommonUnitSelected(unit: string): boolean {
        const currentUnits = this.ingredientForm.get('commonUnits')?.value || [];
        return currentUnits.includes(unit);
    }

    toggleAllergen(allergen: string): void {
        const currentAllergens = [...(this.ingredientForm.get('allergens')?.value || [])];

        if (allergen === 'none') {
            // If 'none' is selected, clear all other allergens
            this.ingredientForm.get('allergens')?.setValue(['none']);
            return;
        }

        // If any other allergen is selected, remove 'none'
        const noneIndex = currentAllergens.indexOf('none');
        if (noneIndex !== -1) {
            currentAllergens.splice(noneIndex, 1);
        }

        if (currentAllergens.includes(allergen)) {
            const index = currentAllergens.indexOf(allergen);
            currentAllergens.splice(index, 1);
        } else {
            currentAllergens.push(allergen);
        }

        // If no allergens are selected, add 'none'
        if (currentAllergens.length === 0) {
            currentAllergens.push('none');
        }

        this.ingredientForm.get('allergens')?.setValue(currentAllergens);
    }

    isAllergenSelected(allergen: string): boolean {
        const currentAllergens = this.ingredientForm.get('allergens')?.value || [];
        return currentAllergens.includes(allergen);
    }

    cancel(): void {
        if (this.isEditMode && this.ingredientId) {
            this.router.navigate(['/ingredients', this.ingredientId]);
        } else {
            this.router.navigate(['/ingredients']);
        }
    }
}
