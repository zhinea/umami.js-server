import { v4, v5, validate } from 'uuid';
import {hash} from "../libs/crypto.ts";
import {Env} from "./env.ts";
import { startOfHour, startOfMonth } from 'date-fns';


export function isUuid(value: string) {
    return validate(value);
}

export function salt() {
    const ROTATING_SALT = hash(startOfMonth(new Date()).toUTCString());

    return hash(Env.secret(), ROTATING_SALT);
}

export function visitSalt() {
    const ROTATING_SALT = hash(startOfHour(new Date()).toUTCString());

    return hash(Env.secret(), ROTATING_SALT);
}

export function uuid(...args: any) {
    if (!args.length) return v4();

    return v5(hash(...args, salt()), v5.DNS);
}



export function safeDecodeURIComponent(s: string | undefined | null): string | undefined | null {
    if (s === undefined || s === null) {
        return s;
    }

    try {
        return decodeURIComponent(s);
    } catch (e) {
        return s;
    }
}

export function getQueryString(params: object = {}): string {
    return Object.keys(params)
        .reduce((arr: string[], key: string) => {
            // @ts-ignore
            if (params[key] !== undefined) {
                return arr.concat(`${key}=${encodeURIComponent(params[key])}`);
            }
            return arr;
        }, [])
        .join('&');
}
export function buildUrl(url: string, params: object = {}): string {
    const queryString = getQueryString(params);
    return `${url}${queryString && '?' + queryString}`;
}

export function safeDecodeURI(s: string | undefined | null): string | undefined | null {
    if (s === undefined || s === null) {
        return s;
    }

    try {
        return decodeURI(s);
    } catch (e) {
        return s;
    }
}