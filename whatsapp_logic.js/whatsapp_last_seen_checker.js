const { is_profile_open } = require('./whatsapp_profile_opener');

class Track {
    constructor(page) {
        this.page = page;
        this.stop = false;
    }

    async start() {
        if (this.stop) return;
        try {
            await is_profile_open(this.page);
            debugger;
            this.listen().then(state => {
                this.push_data(state)
            })
                .catch(err => {
                    console.log(err);
                })
        } catch (err) {
            console.log(err);
        }
    }

    async stop() {
        this.stop = true;
    }

    push_data(state) {
        console.log(state);
        this.start()
    }

    listen() {
        const { page } = this;
        return new Promise((res, rej) => {
            let state = { online: null, offline: null };
            let i = 0;
            let interval = setInterval(async () => {
                let online = await page.evaluate(() => {
                    let isOnline = document.querySelector('span[title~=online]')
                    if (isOnline) return true
                    else return false;
                })

                if (online) state.online = new Date().toUTCString();

                if (state.online && !online) {
                    state.offline = new Date().toUTCString();
                    clearInterval(interval);
                    res(state);
                }

                // online for around 6 hrs
                // system might have crashed
                if (++i > 10000) {
                    clearInterval(interval);
                    rej('SYSTEM_UNRESPONSIVE');
                }
            }, 2000)
        })
    }

}

module.exports = Track;

