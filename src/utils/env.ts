import {hash} from "../libs/crypto.ts";

export const Env = {
    secret: () => {
        // @ts-ignore
        return hash(process.env.APP_SECRET || process.env.DATABASE_URL);
    },
    request: {
        path: process.env.ANALYTICS_SERVER_PATH || '/api/send',
        max_events: process.env.MAX_EVENTS_PER_REQUEST || 10
    },
}