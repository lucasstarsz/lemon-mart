import { Injectable } from '@angular/core';
import { AuthService, IAuthStatus, IServerAuthResponse } from './auth.service';
import { Observable, of, throwError } from 'rxjs';
import { PhoneType, User } from '../user/user/user';
import { Role } from './auth.enum';
import { sign } from 'fake-jwt-sign';

@Injectable({ providedIn: 'root' })
export class InMemoryAuthService extends AuthService {

    constructor() {
        super();
        console.warn("You're using the InMemoryAuthService. Do not use this service in production.");
    }

    protected override authProvider(email: string, password: string): Observable<IServerAuthResponse> {
        email = email.toLowerCase();

        if (!email.endsWith('@test.com')) {
            return throwError(() => new Error('Failed to login! Email needs to end with @test.com.'));
        }

        const authStatus = {
            isAuthenticated: true,
            userId: this.defaultUser._id,
            userRole: email.includes('cashier')
                ? Role.Cashier
                : email.includes('clerk')
                    ? Role.Clerk
                    : email.includes('manager')
                        ? Role.Manager
                        : Role.None
        } as IAuthStatus;

        this.defaultUser.role = authStatus.userRole;

        const authResponse = {
            accessToken: sign(authStatus, 'secret', {
                expiresIn: '1h',
                algorithm: 'none'
            })
        } as IServerAuthResponse;

        return of(authResponse);
    }

    protected override transformJwtToken(token: unknown): IAuthStatus {
        return token as IAuthStatus;
    }

    protected override getCurrentUser(): Observable<User> {
        return of(this.defaultUser);
    }

    private defaultUser: User = User.Build({
        _id: '5da01751da27cc462d265913',
        email: 'duluca@gmail.com',
        name: { first: 'Doguhan', last: 'Uluca' },
        picture: 'https://secure.gravatar.com/avatar/7cbaa9afb5ca78d97f3c689f8ce6c985',
        role: Role.Manager,
        userStatus: true,
        dateOfBirth: new Date(1980, 1, 1),
        level: 2,
        address: {
            line1: '101 Sesame St',
            city: 'Bethesda',
            state: 'Maryland',
            zip: '20810'
        },
        phones: [
            {
                id: 0,
                type: PhoneType.Mobile,
                digits: '5555550717'
            }
        ]
    });
}
