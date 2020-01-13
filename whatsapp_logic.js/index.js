const { create_browser, create_page } = require('./browser_handler');
const { login_init, wait_until_loggedIn } = require('./whatsapp_login_handler');
const { open_profile } = require('./whatsapp_profile_opener');
const Track = require('./whatsapp_last_seen_checker');

async function init() {
    const browser = await create_browser();
    const page = await create_page(browser);
    debugger;
    await login_init(page);
    await wait_until_loggedIn(page);
    await delay(2000)
    try {
        await open_profile('918968044978', page);
        const tracker = new Track(page);
        await tracker.start();
    } catch (err) {
        console.log(err);
    }
    console.log('true')
}
async function delay(ms) {
    const promise = new Promise((res, rej) => setTimeout(() => res(), ms));
    await promise;
}

init();