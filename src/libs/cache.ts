import redis from '@umami/redis-client';
import { getSession, getUser, getWebsite } from '../queries';
import type {Website} from "../utils/types.ts";

async function fetchWebsite(websiteId: string): Promise<Website> {
    return redis.client.getCache(`website:${websiteId}`, () => getWebsite(websiteId), 86400);
}

async function storeWebsite(data: { id: any }) {
    const { id } = data;
    const key = `website:${id}`;

    const obj = await redis.client.setCache(key, data);
    await redis.client.expire(key, 86400);

    return obj;
}

async function deleteWebsite(id: string) {
    return redis.client.deleteCache(`website:${id}`);
}

async function fetchUser(id: string) {
    return redis.client.getCache(`user:${id}`, () => getUser(id, { includePassword: true }), 86400);
}

async function storeUser(data: any) {
    const { id } = data;
    const key = `user:${id}`;

    const obj = await redis.client.setCache(key, data);
    await redis.client.expire(key, 86400);

    return obj;
}

async function deleteUser(id: string) {
    return redis.client.deleteCache(`user:${id}`);
}

async function fetchSession(id: string) {
    return redis.client.getCache(`session:${id}`, () => getSession(id), 86400);
}

async function storeSession(data: any) {
    const { id } = data;
    const key = `session:${id}`;

    const obj = await redis.client.setCache(key, data);
    await redis.client.expire(key, 86400);

    return obj;
}

async function deleteSession(id: string) {
    return redis.client.deleteCache(`session:${id}`);
}

async function fetchUserBlock(userId: string) {
    const key = `user:block:${userId}`;
    return redis.client.get(key);
}

async function incrementUserBlock(userId: string) {
    const key = `user:block:${userId}`;
    return redis.client.incr(key);
}

export default {
    fetchWebsite,
    storeWebsite,
    deleteWebsite,
    fetchUser,
    storeUser,
    deleteUser,
    fetchSession,
    storeSession,
    deleteSession,
    fetchUserBlock,
    incrementUserBlock,
    enabled: !!redis.enabled,
};
