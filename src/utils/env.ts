import {hash} from "../libs/crypto.ts";

export const Env = {
    secret: () => {
        // @ts-ignore
        return hash(process.env.APP_SECRET || process.env.DATABASE_URL);
    }
}