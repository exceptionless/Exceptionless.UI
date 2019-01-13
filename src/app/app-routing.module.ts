import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { StatusComponent } from './components/status/status.component';

const routes: Routes = [
    { path: '', loadChildren: './components/auth/auth.module#AuthModule' },
    { path: '', loadChildren: './components/layout/layout.module#LayoutModule' },
    { path: 'status', component: StatusComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
    exports: [RouterModule]
})

export class AppRoutingModule {
}
