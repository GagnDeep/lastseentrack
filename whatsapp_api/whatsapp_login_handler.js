class Login {

    constructor(page) {
        this.page = page;
    }

    init() {
        return new Promise(async (res, rej) => {

            const response = await this.page.goto('https://web.whatsapp.com', { waitUntil: ['networkidle2'] });

            if (response.status() == 200)
                res(response)
            else
                rej('Error while reaching whatsapp web');
        })
    }

    get_qr_code() {
        return new Promise((res, rej) => {
            this.page.waitForSelector('img[alt="Scan me!"]', { visible: true })
                .then(async () => {
                    const code = await this.page.evaluate(() => {
                        const img = document.querySelector('img[alt="Scan me!"]');
                        return img && img.src;
                    })

                    if (code) res(code)
                    else rej('CODE_NOT_FOUND');
                })
                .catch(rej)
        })
    }
    wait_for_login() {
        return new Promise((res, rej) => {
            this.page.waitForSelector('input[type=text]', { visible: true })
                .then(res)
                .catch(rej)
        })
    }
}

module.exports = Login;