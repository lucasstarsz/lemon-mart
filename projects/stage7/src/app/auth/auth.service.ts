import { inject } from '@angular/core';
import { Role } from './auth.enum';
import { BehaviorSubject, Observable, catchError, filter, map, mergeMap, pipe, tap, throwError } from 'rxjs';
import { IUser, User } from '../user/user/user';
import { transformError } from '../common/common';
import { CacheService } from '../common/cache.service';
import { jwtDecode as decode } from 'jwt-decode';

export const JwtTokenKey: string = 'jwt';

export abstract class AuthService implements IAuthService {

    private getAndUpdateUserIfAuthenticated = pipe(
        filter((status: IAuthStatus) => status.isAuthenticated),
        // flatMap is deprecated, renamed to mergeMap
        mergeMap(() => this.getCurrentUser()),
        map((user: IUser) => this.currentUser$.next(user)),
        catchError(transformError)
    );

    readonly authStatus$: BehaviorSubject<IAuthStatus> = new BehaviorSubject<IAuthStatus>(defaultAuthStatus);
    readonly currentUser$: BehaviorSubject<IUser> = new BehaviorSubject<IUser>(new User());

    protected readonly cache = inject(CacheService);
    protected readonly resumeCurrentUser$ = this.authStatus$.pipe(this.getAndUpdateUserIfAuthenticated);

    constructor() {
        if (this.hasExpiredToken()) {
            this.logout(true);
        } else {
            this.authStatus$.next(this.getAuthStatusFromToken());

            // To load user on browser refresh,
            // resume pipeline must activate on the next cycle
            // Which allows for all services to constructed properly
            setTimeout(() => this.resumeCurrentUser$.subscribe(), 0);
        }
    }

    login(email: string, password: string): Observable<void> {
        this.clearToken();

        const loginResponse$ = this.authProvider(email, password).pipe(
            map((authResponse) => {
                this.setToken(authResponse.accessToken);
                return this.getAuthStatusFromToken();
            }),
            tap((status) => this.authStatus$.next(status)),
            this.getAndUpdateUserIfAuthenticated
        );

        loginResponse$.subscribe({
            error: err => {
                this.logout();
                return throwError(() => err);
            }
        });

        return loginResponse$;
    }

    logout(clearToken?: boolean | undefined): void {
        if (clearToken) {
            this.clearToken();
        }

        // Delay before timeout is 0 to ensure this gets called almost immediately, without
        // directly requiring it to happen in sync with the program.
        // This also allows us to avoid timing issues for when code elements of the application
        // all change statuses at once.
        setTimeout(() => this.authStatus$.next(defaultAuthStatus), 0);
    }

    getToken(): string {
        return this.cache.getItem<string>(JwtTokenKey, false)!;
    }

    protected setToken(jwt: string) {
        this.cache.setItem(JwtTokenKey, jwt);
    }

    protected clearToken(): void {
        this.cache.removeItem(JwtTokenKey);
    }

    protected hasExpiredToken(): boolean {
        const jwt = this.getToken();

        if (jwt) {
            const payload = decode(jwt) as any;
            return Date.now() >= payload.exp * 1000;
        }

        return true;
    }

    protected getAuthStatusFromToken(): IAuthStatus {
        return this.transformJwtToken(decode(this.getToken()));
    }

    protected abstract authProvider(email: string, password: string): Observable<IServerAuthResponse>;
    protected abstract transformJwtToken(token: unknown): IAuthStatus;
    protected abstract getCurrentUser(): Observable<User>;
}

export interface IAuthStatus {
    isAuthenticated: boolean
    userRole: Role
    userId: string
}

export interface IServerAuthResponse {
    accessToken: string
}

export const defaultAuthStatus: IAuthStatus = {
    isAuthenticated: false,
    userRole: Role.None,
    userId: ''
}

export interface IAuthService {
    readonly authStatus$: BehaviorSubject<IAuthStatus>;
    readonly currentUser$: BehaviorSubject<IUser>;

    login(email: string, password: string): Observable<void>;
    logout(clearToken?: boolean): void;
    getToken(): string;
}