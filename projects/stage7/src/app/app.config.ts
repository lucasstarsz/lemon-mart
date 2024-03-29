import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { ApplicationConfig, Provider } from '@angular/core'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { provideRouter } from '@angular/router'

import { routes } from './app.routes'
import { AuthService } from './auth/auth.service'
import { InMemoryAuthService } from './auth/auth.in-memory.service'
import { AuthHttpInterceptor } from './auth/auth.http.interceptor'

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimationsAsync(),
        provideHttpClient(
            withInterceptors([AuthHttpInterceptor])
        ),
        provideRouter(routes),
        {
            provide: AuthService,
            useClass: InMemoryAuthService
        } as Provider
    ],
}
