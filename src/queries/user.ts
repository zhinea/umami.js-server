import { Prisma } from '@prisma/client';
import {prisma} from "../libs/prisma.ts";
import type {User} from "../utils/types.ts";

export interface GetUserOptions {
    includePassword?: boolean;
    showDeleted?: boolean;
}

async function findUser(
    criteria: any,
    options: GetUserOptions = {},
) {
    const { includePassword = false, showDeleted = false } = options;

    return prisma.user.findUnique({
        ...criteria,
        where: {
            ...criteria.where,
            ...(showDeleted && { deletedAt: null }),
        },
        select: {
            id: true,
            username: true,
            password: includePassword,
            role: true,
            createdAt: true,
        },
    });
}

export async function getUser(userId: string, options: GetUserOptions = {}) {
    return findUser(
        {
            where: {
                id: userId,
            },
        },
        options,
    );
}
