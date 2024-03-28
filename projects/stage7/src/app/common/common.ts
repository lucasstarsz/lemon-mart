import { HttpErrorResponse } from "@angular/common/http";
import { of, throwError } from "rxjs";

export const UNKNOWN_ERROR: string = 'An unknown error has occurred.';

export function transformError(error: HttpErrorResponse | string) {
    let errorMessage: string = UNKNOWN_ERROR;

    if (typeof error === 'string') {
        errorMessage = error;
    } else if (error.error instanceof ErrorEvent) {
        errorMessage = `Error has occurred: ${error.error.message}`;
    } else if (error.status) {
        errorMessage = `Request failed with ${error.status}: ${error.statusText}`;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
}