const { is_logged_in } = require('./whatsapp_login_handler');

function open_profile(mobile, page) {
    return new Promise(async (res, rej) => {
        const logged_in = is_logged_in(page);

        if (!logged_in) rej('NOT_LOGGED_IN');

        await page.evaluate(create_profile_link, mobile);

        try {
            await wait_until_opened(page);
            await is_profile_open(page);
            res("PROFILE_OPEN_SUCCESS")
        } catch (err) {
            rej(err);
        }

    })
}

function wait_until_opened(page) {
    return new Promise(async (res, rej) => {
        try {
            await wait_until_done(page);
            await isNumberInvalid(page)
            await is_profile_open(page);
            res('SUCCESS')
        } catch (err) {
            rej(err)
        }
    })
}

function wait_until_done(page) {
    return new Promise(async (res, rej) => {
        let i = 0
        let interval = setInterval(async () => {
            let isProcessed = await page.evaluate(() => {
                let modal = document.querySelector('div[data-animate-modal-popup=true]');
                if (modal && modal.innerText === "Starting chat\nCANCEL") {
                    return false
                }
                return true;
            })
            if (isProcessed) {
                res('done processing');
                clearInterval(interval);
            }
            if (i > 30) {
                rej('error in network');
                clearInterval(interval)
            }
            i++;
        }, 1000)
    })
}

function isNumberInvalid(page) {
    return new Promise(async (res, rej) => {
        let isInvalid = await page.evaluate(() => {
            let modal = document.querySelector('div[data-animate-modal-popup=true]');
            if (modal && modal.innerText === "Phone number shared via url is invalid.\nOK") {
                let closeModal = document.querySelector('div[role=button]');
                if (closeModal) closeModal.click();
                return true;
            }
            return false;
        })
        if (isInvalid) rej('INVALID_NUMBER')
        else res('NOT_INVALID');
    })
}
async function create_profile_link(mobile) {

    async function delay(ms) {
        const promise = new Promise((res, rej) => setTimeout(() => res(), ms));
        await promise;
    }

    let link = document.querySelector('.profile_link');

    if (link) {
        link.href = `https://wa.me/${mobile}/`;
        link.click();
    }

    link = document.createElement('a')
    link.href = `https://wa.me/${mobile}`;
    link.classList.add('profile_link');
    document.querySelector('html').appendChild(link);
    await delay(500);
    link.click();
}

async function is_profile_open(page) {
    return new Promise(async (res, rej) => {
        const isOpen = await page.$('div[contenteditable=true');
        if (isOpen) res('PROFILE_IS_OPEN')
        else rej("NO_PROFILE_OPEN")
    })
}

async function delay(ms) {
    const promise = new Promise((res, rej) => setTimeout(() => res(), ms));
    await promise;
}

module.exports = {
    open_profile, is_profile_open
}