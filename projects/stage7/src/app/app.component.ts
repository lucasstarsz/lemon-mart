import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule, MatIconRegistry } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'
import { DomSanitizer } from '@angular/platform-browser'
import { RouterLink, RouterOutlet } from '@angular/router'
import { FlexModule } from '@ngbracket/ngx-layout/flex'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styles: ``,
    standalone: true,
    imports: [
        FlexModule,
        RouterLink,
        RouterOutlet,
        MatIconModule,
        MatToolbarModule,
        MatButtonModule,
    ],
})
export class AppComponent {
    constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
        iconRegistry.addSvgIcon(
            'lemon',
            sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/lemon.svg')
        )
    }
}
