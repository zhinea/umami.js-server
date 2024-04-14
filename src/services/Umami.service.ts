import {safeDecodeURI} from "../utils/common.ts";
import {COLLECTION_TYPE} from "../libs/constants.ts";
import {saveEvent} from "../queries/event.ts";
import {saveSessionData} from "../queries";
import type {Session} from "@prisma/client";

interface ISession extends Session {
    visitId: string;
}

export async function createBatchEvents(events: any, session: ISession){
    for (const ev of events) {

        let { url, referrer, t } = ev.payload
        const pageTitle = safeDecodeURI(ev.title);

        if (ev.type === COLLECTION_TYPE.event) {
            // eslint-disable-next-line prefer-const
            let [urlPath, urlQuery] = safeDecodeURI(url)?.split('?') || [];
            let [referrerPath, referrerQuery] = safeDecodeURI(referrer)?.split('?') || [];
            let referrerDomain = '';

            if (!urlPath) {
                urlPath = '/';
            }

            if (referrerPath?.startsWith('http')) {
                const refUrl = new URL(referrer);
                referrerPath = refUrl.pathname;
                referrerQuery = refUrl.search.substring(1);
                referrerDomain = refUrl.hostname.replace(/www\./, '');
            }

            if (process.env.REMOVE_TRAILING_SLASH) {
                urlPath = urlPath.replace(/(.+)\/$/, '$1');
            }

            await saveEvent({
                urlPath,
                urlQuery,
                referrerPath,
                referrerQuery,
                referrerDomain,
                pageTitle,
                eventName: ev.payload.name,
                eventData: ev.payload.data,
                ...session,
                sessionId: session.id,
                visitId: session.visitId,
                t
            });
        }

        if (ev.type === COLLECTION_TYPE.identify) {
            if (!ev.payload.data) {
                return 'Data required.'
            }

            await saveSessionData({
                websiteId: session.websiteId,
                sessionId: session.id,
                sessionData: ev.payload.data,
            });
        }
    }
}