const puppeteer = require('puppeteer');

// initiates the browser and creates a new page in the browser
// returns the page instance
async function newBrowser() {
    try {
        const browser = await puppeteer.launch({ headless: false });
        return browser;
    }
    catch (err) {
        console.log('error while initializing', err);
        return null
    }
}

async function newPage(browser) {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36")
    return page;
}

// takes the page instance to the url
async function goToUrl(page, url = "https://web.whatsapp.com") {
    try {
        const hasReachedURL = await page.goto(url);
        console.log('successfully reached url ' + url);
        return hasReachedURL || null;
    }
    catch (err) {
        console.log('error while reaching the ' + url, err)
        return false;
    }
}

// login method for whatsapp website
async function getWhatsappLoginCode(page) {

    // todo add the error checking 
    // to check whether whatsapp has be loaded or not

    const code = await page.evaluate(() => {
        const img = document.querySelector('img[alt="Scan me!"]');
        return img && img.src;
    })

    if (code) {
        return code;
    } else {
        await delay(500);
        return await getWhatsappLoginCode(page)
    }
}

async function delay(ms) {
    const promise = new Promise((res, rej) => setTimeout(() => res(), ms));
    await promise;
}

async function test() {
    let page = await init_browser();
    console.log("dome")
    await getToUrl(page, "https://web.whatsapp.com");
    let code = await getWhatsappLoginCode(page);

    console.log(code);
}

async function checkForLogin(page) {

    let isLoggedIn = await page.$('input[type=text]')

    return isLoggedIn ? true : false;
}


module.exports = {
    delay,
    newBrowser,
    getWhatsappLoginCode,
    goToUrl,
    newPage,
    checkForLogin
}