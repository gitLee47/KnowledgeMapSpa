import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ErrorPageComponent } from './common/error-page/error-page.component';

const routes: Routes = [
    { path:  '', redirectTo:  '/map', pathMatch:  'full' },
    { path:  '**', component:  ErrorPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }