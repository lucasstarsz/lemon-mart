import { Injectable, inject } from '@angular/core';
import { Role } from './auth.enum';
import { BehaviorSubject, Observable, catchError, filter, map, mergeMap, tap, throwError } from 'rxjs';
import { IUser, User } from '../user/user/user';
import { transformError } from '../common/common';
import { CacheService } from '../common/cache.service';
import { jwtDecode as decode } from 'jwt-decode';

export const JwtTokenKey: string = 'jwt';

@Injectable({
    providedIn: 'root'
})
export abstract class AuthService implements IAuthService {
    protected readonly cache = inject(CacheService);

    readonly authStatus$: BehaviorSubject<IAuthStatus> = new BehaviorSubject<IAuthStatus>(defaultAuthStatus);
    readonly currentUser$: BehaviorSubject<IUser> = new BehaviorSubject<IUser>(new User());

    constructor() { }

    login(email: string, password: string): Observable<void> {
        this.clearToken();

        const loginResponse$ = this.authProvider(email, password).pipe(
            map((authResponse) => {
                this.setToken(authResponse.accessToken);
                const token = decode(authResponse.accessToken);
                return this.transformJwtToken(token);
            }),
            tap((status) => this.authStatus$.next(status)),
            filter((status: IAuthStatus) => status.isAuthenticated),
            // flatMap is deprecated, renamed to mergeMap
            mergeMap(() => this.getCurrentUser()),
            map(user => this.currentUser$.next(user)),
            catchError(transformError)
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
        return this.cache.getItem(JwtTokenKey)!;
    }

    protected setToken(jwt: string) {
        this.cache.setItem(JwtTokenKey, jwt);
    }

    protected clearToken(): void {
        this.cache.removeItem(JwtTokenKey);
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