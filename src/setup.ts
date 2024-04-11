import type Elysia from "elysia";
import cors from "@elysiajs/cors"

export async function setupApplication(elysia: Elysia){
    // setup's application

    elysia.use(cors({
        origin: "*"
    }))
}