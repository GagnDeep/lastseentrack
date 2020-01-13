async function login_init(page) {
    // visit web.whatsapp.com
    const response = await page.goto('https://web.whatsapp.com', { waitUntil: ['networkidle2'] });
    // check if successfully loaded
    if (response.status() !== 200) {
        return null;
    }

    // get qr code
    const qr_code = await get_qr_code(page)
    // return qr code

    return qr_code;
}

function get_qr_code(page) {
    // get qr code from the page
    const code = await page.evaluate(() => {
        const img = document.querySelector('img[alt="Scan me!"]');
        return img && img.src;
    })

    // if found code then return code
    if (code) {
        return code;
    } else {
        // else wait for 500 ms and try getting code again
        await delay(500);
        return await get_qr_code(page)
    }
}

async function delay(ms) {
    const promise = new Promise((res, rej) => setTimeout(() => res(), ms));
    await promise;
}

function wait_until_loggedIn(page) {
    let i = 0;
    console.log('done-loggedin')
    // debugger;
    // return page.waitFor(() => !!document.querySelector('input[type=text]'));
    return new Promise((res, rej) => {
        let interval = setInterval(async () => {
            // check if logged in
            let isLoggedIn = await is_logged_in(page)

            // if yes then resolve promise and clear interval
            if (isLoggedIn) {
                res()
                clearInterval(interval)
            }

            // if not loggedin for too much time
            // reject promise and clear interval
            if (i > 1000) {
                rej();
                clearInterval(interval);
            }
            i++;
        }, 500)
    })
}

async function is_logged_in(page) {

    let isLoggedIn = await page.$('input[type=text]')

    return isLoggedIn ? true : false;
}

module.exports = {
    login_init, wait_until_loggedIn, is_logged_in
}