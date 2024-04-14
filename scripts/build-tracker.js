import path from "path";
import fs from 'fs'

const result = await Bun.build({
    entrypoints: [
        path.join(process.cwd(), 'src/tracker/web.js')
    ],
    minify: true
});

for (const res of result.outputs) {
    let resText = await res.text();

    resText = resText.replaceAll('__COLLECT_API_HOST__', process.env.COLLECT_API_HOST || '');
    resText = resText.replaceAll('__COLLECT_API_ENDPOINT__', process.env.ANALYTICS_SERVER_PATH || '/api/send');

    // check if folder exists
    if (!fs.existsSync(path.join(process.cwd(), 'public/build'))) {
        fs.mkdirSync(path.join(process.cwd(), 'public/build'));
    }

    await Bun.write (path.join(process.cwd(), 'public/build/web.js'), resText)
}