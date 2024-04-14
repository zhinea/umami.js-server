import Elysia from "elysia";
import cors from "@elysiajs/cors"
import staticPlugin from "@elysiajs/static";

export function setupApplication(){
    // setup's application
    return new Elysia()
        .use(cors({
            origin: "*"
        }))
        .use(staticPlugin({
            noCache: false,
            headers: {
                'Cache-Control': 'public, max-age=3600000'
            }
        }))
}