import Elysia, {t} from "elysia";
import {setupApplication} from "./setup.ts";
import {isbot} from "isbot";
import {HOSTNAME_REGEX, IP_REGEX} from "./libs/constants.ts";
import {useSession, usesession} from "./utils/session.ts";



async function main(){
    let app = new Elysia();

    await setupApplication(app);

    app.get('/', () => "Hello World!")


    app.post('/api/send', async ({headers, body}) => {

        if (!process.env.DISABLE_BOT_CHECK && isbot(headers['user-agent'])) {
            return "nope";
        }

        // TODO: Implement hasBlockedIp function
        //


        const session = await useSession({
            headers,
            body
        })


        return body;

    }, {
        // TODO: FIX this VALIDATION issue
        // body: t.Object({
        //     events: t.Array(
        //         t.Object({
        //             payload: t.Object({
        //                 data: t.MaybeEmpty(t.Any()),
        //                 hostname: t.String({
        //                     pattern: HOSTNAME_REGEX.source
        //                 }),
        //                 ip: t.String({
        //                     pattern: IP_REGEX.source
        //                 }),
        //                 language: t.String({
        //                     maxLength: 35
        //                 }),
        //                 referrer: t.String(),
        //                 screen: t.String({
        //                     maxLength: 11
        //                 }),
        //                 title: t.String(),
        //                 url: t.String(),
        //                 website: t.String(),
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
        //     )
        // })
    });

    return app;
}

main()
    .then(app => {
        app.listen(3021)
        console.log("Server started on port 3021")
    })
    .catch(console.error);