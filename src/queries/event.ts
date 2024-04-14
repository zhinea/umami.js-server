import {PRISMA, runQuery} from "../libs/db.ts";
import {uuid} from "../utils/common.ts";
import {prisma} from "../libs/prisma.ts";
import {EVENT_NAME_LENGTH, EVENT_TYPE, PAGE_TITLE_LENGTH, URL_LENGTH} from "../libs/constants.ts";
import {saveEventData} from "./eventData.ts";
import type {GetResult} from "@prisma/client/runtime/library";

export async function saveEvent(args: GetResult<{
    id: string;
    websiteId: string;
    hostname: string | null;
    browser: string | null;
    os: string | null;
    device: string | null;
    screen: string | null;
    language: string | null;
    country: string | null;
    subdivision1: string | null;
    subdivision2: string | null;
    city: string | null;
    createdAt: Date | null
}, any> & UnwrapPayload<{}> & {
    eventData: any;
    visitId: any;
    pageTitle: string | undefined | null;
    referrerQuery: any;
    referrerDomain: string;
    eventName: any;
    sessionId: string;
    urlPath: any;
    urlQuery: any;
    referrerPath: any,
    t: any
}) {
    return runQuery({
        [PRISMA]: () => relationalQuery(args),
        // [CLICKHOUSE]: () => clickhouseQuery(args),
    });
}


async function relationalQuery(data: {
    websiteId: string;
    sessionId: string;
    visitId: string;
    urlPath: string;
    urlQuery?: string;
    referrerPath?: string;
    referrerQuery?: string;
    referrerDomain?: string;
    pageTitle?: string;
    eventName?: string;
    eventData?: any;
    t?: any;
}) {
    const {
        websiteId,
        sessionId,
        visitId,
        urlPath,
        urlQuery,
        referrerPath,
        referrerQuery,
        referrerDomain,
        eventName,
        eventData,
        pageTitle,
        t,
    } = data;
    const websiteEventId = uuid();

    const websiteEvent = prisma.websiteEvent.create({
        data: {
            id: websiteEventId,
            websiteId,
            sessionId,
            visitId,
            urlPath: urlPath?.substring(0, URL_LENGTH),
            urlQuery: urlQuery?.substring(0, URL_LENGTH),
            referrerPath: referrerPath?.substring(0, URL_LENGTH),
            referrerQuery: referrerQuery?.substring(0, URL_LENGTH),
            referrerDomain: referrerDomain?.substring(0, URL_LENGTH),
            pageTitle: pageTitle?.substring(0, PAGE_TITLE_LENGTH),
            eventType: eventName ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
            eventName: eventName ? eventName?.substring(0, EVENT_NAME_LENGTH) : null,
            createdAt: data?.t ? new Date(t) : new Date(),
        },
    });

    if (eventData) {
        await saveEventData({
            websiteId,
            sessionId,
            eventId: websiteEventId,
            urlPath: urlPath?.substring(0, URL_LENGTH),
            eventName: eventName?.substring(0, EVENT_NAME_LENGTH),
            eventData,
            t,
        });
    }

    return websiteEvent;
}
// TODO: Implement Clickhouse query
// async function clickhouseQuery(data: {
//     websiteId: string;
//     sessionId: string;
//     visitId: string;
//     urlPath: string;
//     urlQuery?: string;
//     referrerPath?: string;
//     referrerQuery?: string;
//     referrerDomain?: string;
//     pageTitle?: string;
//     eventName?: string;
//     eventData?: any;
//     hostname?: string;
//     browser?: string;
//     os?: string;
//     device?: string;
//     screen?: string;
//     language?: string;
//     country?: string;
//     subdivision1?: string;
//     subdivision2?: string;
//     city?: string;
// }) {
//     const {
//         websiteId,
//         sessionId,
//         visitId,
//         urlPath,
//         urlQuery,
//         referrerPath,
//         referrerQuery,
//         referrerDomain,
//         pageTitle,
//         eventName,
//         eventData,
//         country,
//         subdivision1,
//         subdivision2,
//         city,
//         ...args
//     } = data;
//     const { getDateFormat, sendMessage } = kafka;
//     const eventId = uuid();
//     const createdAt = getDateFormat(new Date());
//
//     const message = {
//         ...args,
//         website_id: websiteId,
//         session_id: sessionId,
//         visit_id: visitId,
//         event_id: uuid(),
//         country: country,
//         subdivision1:
//             country && subdivision1
//                 ? subdivision1.includes('-')
//                     ? subdivision1
//                     : `${country}-${subdivision1}`
//                 : null,
//         subdivision2: subdivision2,
//         city: city,
//         url_path: urlPath?.substring(0, URL_LENGTH),
//         url_query: urlQuery?.substring(0, URL_LENGTH),
//         referrer_path: referrerPath?.substring(0, URL_LENGTH),
//         referrer_query: referrerQuery?.substring(0, URL_LENGTH),
//         referrer_domain: referrerDomain?.substring(0, URL_LENGTH),
//         page_title: pageTitle?.substring(0, PAGE_TITLE_LENGTH),
//         event_type: eventName ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
//         event_name: eventName ? eventName?.substring(0, EVENT_NAME_LENGTH) : null,
//         created_at: createdAt,
//     };
//
//     await sendMessage(message, 'event');
//
//     if (eventData) {
//         await saveEventData({
//             websiteId,
//             sessionId,
//             eventId,
//             urlPath: urlPath?.substring(0, URL_LENGTH),
//             eventName: eventName?.substring(0, EVENT_NAME_LENGTH),
//             eventData,
//             createdAt,
//         });
//     }
//
//     return data;
// }
