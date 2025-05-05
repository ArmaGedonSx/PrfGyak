import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { RecipeListComponent } from './components/recipe-list/recipe-list.component';
import { RecipeFormComponent } from './components/recipe-form/recipe-form.component';
import { ProfileEditComponent } from './components/profile-edit/profile-edit.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'home', component: HomeComponent, canActivate: [authGuard] },
    { path: 'recipes', component: RecipeListComponent, canActivate: [authGuard] },
    { path: 'recipes/new', component: RecipeFormComponent, canActivate: [authGuard] },
    { path: 'recipes/edit/:id', component: RecipeFormComponent, canActivate: [authGuard] },
    { path: 'profile/edit', component: ProfileEditComponent, canActivate: [authGuard] },
    { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard, adminGuard] },
    { path: '**', redirectTo: '/home' }
];
