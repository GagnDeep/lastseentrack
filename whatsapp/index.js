
const axios = require('axios')


async function introDelay(ms) {
    let promise = new Promise((res, rej) => setTimeout(() => res(), ms));
    await promise
}


async function start_tracking(page, mobile) {


    let onlineStatus = await page.$('html');
    let alreadyOnline = false;

    let obj = {}

    let i = setInterval(async () => {

        let onlineText = "offline";
        try {
            onlineText = await onlineStatus.$eval('span._315-i', node => node && node.textContent);
            let online = onlineText === 'online' ? true : false;

            if (online && !alreadyOnline) {
                alreadyOnline = true;
                obj = { online: new Date() }
            }
        } catch (err) {
            if (alreadyOnline) {
                alreadyOnline = false
                obj.offline = new Date();
                try {
                    let res = await axios.post("https://online-57da3.firebaseio.com/online.json", obj);
                }
                catch (err) {
                    console.log('error while posting object', err)
                }
            }
        }
    }, 2000)
}


async function sendMessage(message, page) {
    await page.keyboard.type(message)
    await page.keyboard.press('Enter');
}


async function open_profile(page, mobile) {
    try {
        //clicking on search bar
        await page.click('input[type=text]')

        // searhing for that mobile number
        await page.keyboard.type(mobile)
        const isLoaded = await isSearched(page);

        if (!isLoaded) return false;

        await page.keyboard.press('Enter')

        // check if person exists
        try {
            if (await page.$('div._3dwyT')) {
                throw new Error("Person not found")
            } else {
                return true
            }
        }
        catch (err) {
            console.log(err);
            return false
        }


    } catch (err) {
        console.log("Failed on clicking on search", err)
        return false;
    }
}

async function isSearched(page, tries = 0) {
    if (tries > 60) return false;

    let isLoaded = page.$('span[data-icon=x-alt]')

    if (isLoaded) return true;

    await introDelay(500);
    await isSearched(page, tries + 1)
}

module.exports = { start_tracking, open_profile }
// startStalking("6479018872")