import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { Router, RouterLink } from '@angular/router'
import { FlexModule } from '@ngbracket/ngx-layout/flex'
import { AuthService } from '../auth/auth.service'
import { combineLatest, filter, tap } from 'rxjs'

@Component({
    selector: 'app-home',
    styleUrl: './home.component.css',
    templateUrl: './home.component.html',
    standalone: true,
    imports: [FlexModule, MatButtonModule, RouterLink],
})
export class HomeComponent {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    public login(): void {
        this.authService.login('manager@test.com', '12345678');

        combineLatest([
            this.authService.authStatus$,
            this.authService.currentUser$
        ]).pipe(
            filter(([authStatus, user]) => authStatus.isAuthenticated && user?._id !== ''),
            tap((_) => this.router.navigate(['/manager']))
        ).subscribe();
    }

}
