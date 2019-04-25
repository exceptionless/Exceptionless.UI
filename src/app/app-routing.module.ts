import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { StatusComponent } from "./components/status/status.component";
import { AuthGuardService as AuthGuard } from "./service/auth-guard.service";

const routes: Routes = [
    { path: "", loadChildren: "./components/layout/layout.module#LayoutModule", canActivate: [AuthGuard] },
    { path: "", loadChildren: "./components/auth/auth.module#AuthModule" },
    { path: "status", component: StatusComponent }
];

// TODO: We need to look over all routing and ensure we are dynamically loading typed project/org event routes.
@NgModule({
    imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: "reload"})],
    exports: [RouterModule]
})

export class AppRoutingModule {
}
