class Login {

    constructor(page) {
        this.page = page;
        this.qr_code = null;
    }

    init() {
        this.qr_code = null;
        this.loggedIn = false;

        return new Promise(async (res, rej) => {

            console.log('[login] init - reaching url')
            const response = await this.page.goto('https://web.whatsapp.com', { waitUntil: ['networkidle2'] });

            console.log('[login] init - reached url')

            if (response.status() == 200)
                res(response)
            else
                rej('Error while reaching whatsapp web');
        })
    }

    async get_qr_code() {
        try {
            await this.page.waitForSelector('canvas', { visible: true });
            console.log('[login] get_qr_code - extracting qr code')
            const code = await this.extract_qr_code()

            return code;

        } catch (err) {
            console.log("[error] get_qr_code - login")
            throw err;
        }
    }

    listen_code_change(callback) {
        let intervalId = setInterval(async () => {
            const code = await this.extract_qr_code()

            if (this.qr_code !== code) {
                callback(code);
            }
        }, 2000)
        return () => clearInterval(intervalId)
    }


    async extract_qr_code() {
        if (this.loggedIn) {
            throw new Error('already logged in')
        }

        try {
            this.qr_code = await this.page.evaluate(() => {
                const canvas = document.querySelector('canvas');
                return canvas && canvas.toDataURL();
            })
            return this.qr_code;

        } catch (err) {
            console.log("[error] extract_qr_code - login")
            throw err;
        }
    }
    async wait_for_login() {
        try {
            console.log('[login] wait_for_login - waiting for login process to finish')
            await this.page.waitForSelector('input[type=text]', { visible: true, timeout: 0 })
            await this.page.waitFor(2000);
        } catch (err) {
            console.log('[error] wait_for_login - login')
            console.log(err)
            throw err;
        }
    }
}

module.exports = Login;