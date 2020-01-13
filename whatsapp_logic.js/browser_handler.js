const puppeteer = require('puppeteer');

// open a new browser instance
async function create_browser() {
    try {
        const browser = await puppeteer.launch({ headless: false });
        return browser;
    }
    catch (err) {
        console.log('error while initializing', err);
        return null
    }
}

async function create_page(browser) {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36")
    // await page.setRequestInterception(true);
    // page.on('request', (req) => {
    //     if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
    //         req.abort();
    //     }
    //     else {
    //         req.continue();
    //     }
    // });
    return page;
}

module.exports = {
    create_browser, create_page
}
