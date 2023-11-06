import { provideHttpClient, withInterceptors } from '@angular/common/http'
import {
  ApplicationConfig,
  importProvidersFrom,
  makeEnvironmentProviders,
} from '@angular/core'
import { provideFirebaseApp } from '@angular/fire/app'
import { getAuth, provideAuth } from '@angular/fire/auth'
import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { provideEntityData } from '@ngrx/data'
import { provideEffects } from '@ngrx/effects'
import { provideStore } from '@ngrx/store'
import { provideStoreDevtools } from '@ngrx/store-devtools'
import { initializeApp } from 'firebase/app'
import { environment } from 'src/environments/environment'

import { routes } from './app.routes'
import { AuthMode } from './auth/auth.enum'
import { authFactory } from './auth/auth.factory'
import { AuthHttpInterceptor } from './auth/auth.http.interceptor'
import { AuthService } from './auth/auth.service'
import { provideUiService } from './common/ui.service'
import { entityConfig } from './entity-metadata'
import { provideGraphQL } from './provideGraphQL'

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptors([AuthHttpInterceptor])),
    provideRouter(routes),
    provideStore(),
    provideEffects(),
    provideEntityData(entityConfig),
    provideStoreDevtools({ maxAge: 25, logOnly: environment.production }),
    {
      provide: AuthService,
      useFactory: authFactory,
    },
    provideUiService(),
    provideGraphQL(),
    provideFirebase(),
  ],
}

function provideFirebase() {
  if (environment.authMode !== AuthMode.Firebase) {
    return []
  }
  return makeEnvironmentProviders([
    importProvidersFrom(
      provideFirebaseApp(() =>
        initializeApp({
          apiKey: 'AIzaSyA_39OnkusNS7WeMqTuhRosonMV20WntcA',
          authDomain: 'lemon-mart-007.firebaseapp.com',
          databaseURL: 'https://lemon-mart-007.firebaseio.com',
          projectId: 'lemon-mart-007',
          storageBucket: 'lemon-mart-007.appspot.com',
          messagingSenderId: '416892066612',
          appId: '1:416892066612:web:ec2f404c18fd4bd8',
          measurementId: 'G-2L4VLZEFWX',
        })
      ),
      provideAuth(() => getAuth())
    ),
  ])
}