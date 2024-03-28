import { provideHttpClient } from '@angular/common/http'
import { ApplicationConfig } from '@angular/core'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { provideRouter } from '@angular/router'

import { routes } from './app.routes'
import { AuthService } from './auth/auth.service'
import { InMemoryAuthService } from './auth/auth.in-memory.service'

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimationsAsync(),
        provideHttpClient(),
        provideRouter(routes),
        {
            provide: AuthService,
            useClass: InMemoryAuthService
        }
    ],
}
