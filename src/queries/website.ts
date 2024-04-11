import {prisma} from "../libs/prisma.ts";

async function findWebsite(criteria: any) {
    return prisma.website.findUnique(criteria);
}


export async function getWebsite(websiteId: string) {
    return findWebsite({
        where: {
            id: websiteId,
        },
    });
}
