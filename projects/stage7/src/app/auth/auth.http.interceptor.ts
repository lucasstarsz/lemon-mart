import { inject } from "@angular/core";
import { HttpHandlerFn, HttpRequest, HttpStatusCode } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { catchError, throwError } from "rxjs";
import { UiService } from "src/app/common/ui.service";

export function AuthHttpInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
    const authService = inject(AuthService);
    const router = inject(Router);
    const uiService = inject(UiService);

    const jwt = authService.getToken();
    const baseUrl = environment.baseUrl;

    // prevents us from accidentally leaking the jwt into unrelated requests, possibly
    // jeopardizing the security

    if (req.url!.startsWith(baseUrl)) {
        console.log(`nah bitch don't do this to ${JSON.stringify(req)}`);
        return next(req);
    }

    const authRequest = req.clone({
        setHeaders: {
            Authorization: `Bearer ${jwt}`
        }
    });

    return next(authRequest).pipe(
        catchError((err) => {
            uiService.showToast(err.error.message);

            if (err.status === HttpStatusCode.Unauthorized) {
                router.navigate(['/login'], {
                    queryParams: {
                        redirectUrl: router.routerState.snapshot.url
                    }
                });
            }

            return throwError(() => err);
        })
    );
}