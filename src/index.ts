import Elysia, { t } from "elysia";
import {isbot} from "isbot";
import {useSession} from "./utils/session.ts";
import {uuid, visitSalt} from "./utils/common.ts";
import {createToken} from "./libs/jwt.ts";
import {Env} from "./utils/env.ts";
import {createBatchEvents} from "./services/Umami.service.ts";
import debug from "debug";
import {setupApplication} from "./setup.ts";

let log = debug("ujs:events")

async function main(){
    return new Elysia()
        .use(setupApplication())
        .get('/', () => "Hello World!")
        .post(Env.request.path, async (req) => {
            let {set, headers, body} = req;

            if (!process.env.DISABLE_BOT_CHECK && isbot(headers['user-agent'])) {
                return "nope";
            }

            if ((<any>body)?.events?.length > Env.request.max_events) {
                set.headers['X-UJS_Err'] = "Max events exceeded";
                set.status = 400;
                return "events limit exceeded";
            }

            // TODO: Implement hasBlockedIp function
            //


            let [isError, session] = await useSession(req)

            if(isError){
                set.headers['X-UJS_Err'] = "session";
                set.status = 500;
                return session;
            }

            // expire visitId after 30 minutes
            session.visitId =
                !!session.iat && Math.floor(new Date().getTime() / 1000) - session.iat > 1800
                    ? uuid(session.id, visitSalt())
                    : session.visitId;

            session.iat = Math.floor(new Date().getTime() / 1000);

            createBatchEvents((<any>body)?.events || [], session).then(() => {
                log("Events created")
            }).catch(er => {
                log("Error creating events", er)
            })

            return createToken(session, Env.secret());

        }, {
            // TODO: FIX this VALIDATION issue
            // body: t.Object({
            //     events: t.Array(
            //         t.Object({
            //             payload: t.Object({
            //                 data: t.MaybeEmpty(t.Any()),
            //                 referrer: t.String(),
            //                 title: t.String(),
            //                 url: t.String(),
            //                 name: t.String({
            //                     maxLength: 50
            //                 }),
            //                 tag: t.MaybeEmpty(t.String({
            //                     maxLength: 50
            //                 })),
            //                 t: t.MaybeEmpty(t.String())
            //             }),
            //             type: t.String({
            //                 maxLength: 50,
            //                 pattern: /event|identify/i.source
            //             })
            //         })
            //     ),
            //     hostname: t.String({
            //         pattern: HOSTNAME_REGEX.source
            //     }),
            //     // ip: t.MaybeEmpty(t.String({
            //     //     pattern: IP_REGEX.source
            //     // })),
            //     language: t.MaybeEmpty(
            //         t.String({
            //             maxLength: 35
            //         })
            //     ),
            //     id: t.String(), //website id
            //     screen: t.String({
            //         maxLength: 11
            //     }),
            // })
        });
}

main()
    .then(app => {
        app.listen(3021)
        console.log("Server started on port 3021")
    })
    .catch(console.error);