import { Injectable } from "@angular/core";

/**
 * Caching service that uses {@link localStorage} to store data, so that it persists beyond the current session.
 */
@Injectable({ providedIn: 'root' })
export class CacheService {
    public getItem<T>(key: string, needsJSONParsing: boolean = true): T | null {
        const data = localStorage.getItem(key);

        if (data == null) {
            return null;
        }

        if (needsJSONParsing) {
            try {
                return JSON.parse(data);
            } catch (error) {
                console.error('Parsing error', error);
                return null;
            }
        } else {
            return data as T;
        }
    }

    public setItem(key: string, data: object | string): void {
        if (typeof data === 'string') {
            localStorage.setItem(key, data);
            return;
        }

        localStorage.setItem(key, JSON.stringify(data));
    }

    public removeItem(key: string): void {
        localStorage.removeItem(key);
    }

    public clear() {
        localStorage.clear();
    }
}