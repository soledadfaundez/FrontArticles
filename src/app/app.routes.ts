import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { FavoritesComponent } from './pages/favorites/favorites.component';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CorsInterceptor } from './interceptors/CorsInterceptor';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'favorites', component: FavoritesComponent },
    { path: 'about', component: AboutComponent },
    { path: 'contact', component: ContactComponent },
  ];

@NgModule({
imports: [
    MatToolbarModule,
    MatButtonModule,    
    RouterModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    RouterModule.forRoot(routes)
],
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: CorsInterceptor, multi: true },
],
exports: [RouterModule]
})

export class AppRoutingModule { }