const puppeteer = require('puppeteer');
const Login = require('./whatsapp_login_handler');
const Profile = require('./whatsapp_profile_opener')
const Track = require('./whatsapp_last_seen_checker');


class LastSeen {
    async init(mobile) {
        try {
            this.browser = await this.new_browser();
            this.page = await this.new_page();
            this.login = new Login(this.page);
            this.profile = new Profile(this.page);
            this.track = new Track(this.page);

            await this.login.init();
            console.log("[login] reached web.whatsapp.com")

            this.qr_code = await this.login.get_qr_code();
            console.log('[login] qr code successfully generated')

            await this.login.wait_for_login();
            console.log('[login] Successfully logged in')

            // delay for dom to be rendered
            await this.page.waitFor(2000)

            await this.profile.open(mobile)
            console.log("[Profile] successfully opened profile: " + mobile);

            this.track.start();
            console.log("[track] started tracking last seen for " + mobile)
        } catch (err) {
            throw new Error(err)
        }
    }

    new_browser() {
        return puppeteer.launch({ headless: false })
    }

    async new_page() {
        const page = await this.browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36")
        return page;
    }
}

module.exports = LastSeen