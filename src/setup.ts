import Elysia from "elysia";
import cors from "@elysiajs/cors"

export function setupApplication(){
    // setup's application
    return new Elysia()
        .use(cors({
            origin: "*"
        }))
}