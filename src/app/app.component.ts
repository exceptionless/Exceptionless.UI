import { Component } from '@angular/core';
import { AuthService } from 'ng2-ui-auth';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})

export class AppComponent {
    isSideNavCollapsed = false;
    constructor(
        private auth: AuthService
    ) {}

    isLogged() {
        return this.auth.isAuthenticated();
    }

    onToggleSideNavCollapsed(): void {
        this.isSideNavCollapsed = !this.isSideNavCollapsed;
    }
}
