import {prisma} from "../libs/prisma.ts";
import cache from "../libs/cache.ts";
import type {DynamicData} from "../utils/types.ts";
import {flattenJSON, getStringValue} from "../libs/data.ts";
import {uuid} from "../utils/common.ts";
import {DATA_TYPE} from "../libs/constants.ts";

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

export async function saveSessionData(data: {
    websiteId: string;
    sessionId: string;
    sessionData: DynamicData;
}) {
    const { websiteId, sessionId, sessionData } = data;

    const jsonKeys = flattenJSON(sessionData);

    const flattenedData = jsonKeys.map(a => ({
        id: uuid(),
        websiteId,
        sessionId,
        key: a.key,
        stringValue: getStringValue(a.value, a.dataType),
        numberValue: a.dataType === DATA_TYPE.number ? a.value : null,
        dateValue: a.dataType === DATA_TYPE.date ? new Date(a.value) : null,
        dataType: a.dataType,
    }));

    return prisma.$transaction([
        prisma.sessionData.deleteMany({
            where: {
                sessionId,
            },
        }),
        prisma.sessionData.createMany({
            data: flattenedData as any,
        }),
    ]);
}