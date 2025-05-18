import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
  profilePicture?: string;
  dietaryPreferences?: string[];
}

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss'
})
export class ProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  user: User | null = null;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  // Profilkép feltöltési mód
  imageUploadMode: 'local' | 'url' = 'url';

  // Étkezési preferenciák
  dietaryOptions = [
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free',
    'keto', 'paleo', 'low-carb', 'low-fat', 'none'
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      profilePicture: [''],
      dietaryPreferences: [[]]
    });
  }

  ngOnInit() {
    // Először feliratkozunk a user$ observable-re
    this.authService.user$.subscribe(user => {
      if (user) {
        this.user = user;
        this.profileForm.patchValue({
          username: user.username,
          profilePicture: user.profilePicture,
          dietaryPreferences: user.dietaryPreferences || []
        });
      }
    });

    // Majd manuálisan lekérjük a profil adatokat a szerverről
    // Ez frissíti a user$ observable-t is az AuthService-ben
    this.authService.getProfile().subscribe({
      next: (user) => {
        console.log('Profile loaded in ProfileEditComponent:', user);
      },
      error: (err) => {
        console.error('Error loading profile in ProfileEditComponent:', err);
        this.error = 'Nem sikerült betölteni a profil adatokat.';
      }
    });
  }

  // Lokális fájl feltöltés
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.profileForm.patchValue({ profilePicture: result });
      };

      reader.readAsDataURL(file);
    }
  }


  // Étkezési preferencia kiválasztása
  toggleDietaryPreference(preference: string) {
    const currentPreferences = [...(this.profileForm.get('dietaryPreferences')?.value || [])];
    const index = currentPreferences.indexOf(preference);

    if (index === -1) {
      currentPreferences.push(preference);
    } else {
      currentPreferences.splice(index, 1);
    }

    this.profileForm.patchValue({ dietaryPreferences: currentPreferences });
  }

  isDietaryPreferenceSelected(preference: string): boolean {
    const currentPreferences = this.profileForm.get('dietaryPreferences')?.value || [];
    return currentPreferences.includes(preference);
  }

  // Profil mentése
  saveProfile() {
    if (this.profileForm.invalid) {
      this.error = 'Please fill in all required fields correctly.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: (user) => {
        this.success = 'Profile updated successfully';
        this.loading = false;

        // Rövid késleltetés után átirányítás a főoldalra
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1500);
      },
      error: (err) => {
        this.error = 'Error updating profile: ' + (err.error?.message || err.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  // Visszalépés a főoldalra
  cancel() {
    this.router.navigate(['/home']);
  }
}
