import cache from "./cache.ts";
import {getSession, getWebsite} from "../queries";


export const loadWebsite = async (websiteId: string) => {
    let website: any;

    if (cache.enabled) {
        website = await cache.fetchWebsite(websiteId);
    } else {
        website = await getWebsite(websiteId);
    }

    if (!website || website.deletedAt) {
        return null;
    }

    return website;
}



export async function loadSession(sessionId: string) {
    let session;

    if (cache.enabled) {
        session = await cache.fetchSession(sessionId);
    } else {
        session = await getSession(sessionId);
    }

    if (!session) {
        return null;
    }

    return session;
}
