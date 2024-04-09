import Elysia, {t} from "elysia";
import {setupApplication} from "./setup.ts";
import {isbot} from "isbot";


async function main(){
    let app = new Elysia();

    await setupApplication(app);

    app.get('/', () => "Hello World!")


    app.post('/api/send', ({headers}) => {

        if (!process.env.DISABLE_BOT_CHECK && isbot(headers['user-agent'])) {
            return "nope";
        }





    }, {
        body: t.Object({
            
        })
    });

    return app;
}

main()
    .then(app => {
        app.listen(3000)
        console.log("Server started on port 3000")
    })
    .catch(console.error);