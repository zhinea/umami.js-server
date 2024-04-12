import {parseToken} from "../libs/jwt.ts";
import {Env} from "./env.ts";
import {isUuid, uuid, visitSalt} from "./common.ts";
import {loadSession, loadWebsite} from "../libs/load.ts";
import cache from "../libs/cache.ts";
import {getClientInfo} from "../libs/detect.ts";
import {createSession} from "../queries";
import debug from 'debug';

const log = debug('ujs:session');

const returnError = (er: string, payload: any) => {
    payload.session.is_ok = false
    return er;
}

export const useSession = async (req: any) => {

    try {
        const session = await findSession(req);

        if (!session) {
            log('useSession: Session not found');
            return [true, 'Session not found.'];
        }

        return [false, session]
    } catch (e: any) {
        return [true, e.message];
    }
}


type Headers = {
    [key: string]: string
}

export const findSession = async(req: { headers: Headers, body: any }) => {
    const { headers, body } = req;

    const cacheToken = headers['x-umami-cache'];

    if(cacheToken){
        const result: any = parseToken(cacheToken, Env.secret())

        if (result) {
            await checkUserBlock(result?.ownerId);

            return result;
        }
    }

    const { id: websiteId, hostname, screen, language } = body;

    // Check the hostname value for legality to eliminate dirty data
    const validHostnameRegex = /^[\w-.]+$/;
    if (!validHostnameRegex.test(hostname)) {
        throw new Error('Invalid hostname.');
    }

    if (!isUuid(websiteId)) {
        throw new Error('Invalid website ID.');
    }


    // Find website
    const website = await loadWebsite(websiteId);

    if (!website) {
        throw new Error(`Website not found: ${websiteId}.`);
    }

    await checkUserBlock(website.userId);


    const { userAgent, browser, os, ip, country, subdivision1, subdivision2, city, device } =
        await getClientInfo(req, {
            screen
        });


    const sessionId = uuid(websiteId, hostname, ip, userAgent);
    const visitId = uuid(sessionId, visitSalt());

    // TODO: Implement ClickhouseDB


    let session = await loadSession(sessionId);

    // Create a session if not found
    if (!session) {
        try {
            session = await createSession({
                id: sessionId,
                websiteId,
                hostname,
                browser,
                os,
                device,
                screen,
                language,
                country,
                subdivision1,
                subdivision2,
                city,
            });
        } catch (e: any) {
            if (!e.message.toLowerCase().includes('unique constraint')) {
                throw e;
            }
        }
    }

    return { ...session, ownerId: website.userId, visitId: visitId };
}

async function checkUserBlock(userId: string) {
    if (process.env.ENABLE_BLOCKER && (await cache.fetchUserBlock(userId))) {
        await cache.incrementUserBlock(userId);

        throw new Error('Usage Limit.');
    }
}
