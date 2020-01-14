const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({ data: [] })
    .write()

class Track {
    constructor(page) {
        this.page = page;
        this.stop = false;
    }

    async start() {
        if (this.stop) return;
        try {
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
        db.get('data')
            .push(state)
            .write();
        this.start()
    }

    listen() {
        const { page } = this;
        return new Promise((res, rej) => {
            page.waitForSelector('span[title~=online]', { timeout: 0 })
                .then(() => {
                    const online = new Date().toUTCString();
                    page.waitForFunction(() => !document.querySelector('span[title~=online]'), { polling: "mutation", timeout: 10e6 })
                        .then(() => {
                            const offline = new Date().toUTCString();
                            res({ online, offline })
                        })
                        .catch(rej)
                })
                .catch(rej)
        })
    }

}

module.exports = Track;

