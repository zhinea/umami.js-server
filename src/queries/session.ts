import {prisma} from "../libs/prisma.ts";
import cache from "../libs/cache.ts";

export async function getSession(id: string) {
    return prisma.session.findUnique({
        where: {
            // @ts-ignore
            id,
        },
    });
}


export async function createSession(data: any) {
    const {
        id,
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
    } = data;

    return prisma.session
        .create({
            data: {
                id,
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
            },
        })
        .then(async data => {
            if (cache.enabled) {
                await cache.storeSession(data);
            }

            return data;
        });
}
