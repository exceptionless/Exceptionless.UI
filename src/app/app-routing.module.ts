import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { StatusComponent } from "./components/status/status.component";
import { AuthGuardService as AuthGuard } from "./service/auth-guard.service";

const routes: Routes = [
    { path: "", loadChildren: () => import('./components/layout/layout.module').then(m => m.LayoutModule), canActivate: [AuthGuard] },
    { path: "", loadChildren: () => import('./components/auth/auth.module').then(m => m.AuthModule) },
    { path: "status", component: StatusComponent }
];

// TODO: We need to look over all routing and ensure we are dynamically loading typed project/org event routes.
@NgModule({
    imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: "reload"})],
    exports: [RouterModule]
})

export class AppRoutingModule {
}
