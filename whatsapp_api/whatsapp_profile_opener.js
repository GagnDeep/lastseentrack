class Profile {
    constructor(page) {
        this.page = page
    }
    open(mobile) {
        return new Promise(async (res, rej) => {

            await this.page.evaluate(create_profile_link, mobile);

            try {
                await this.wait_until_opened(this.page);
                await this.is_profile_open(this.page);
                res("PROFILE_OPEN_SUCCESS")
            } catch (err) {
                rej(err);
            }

        })
    }

    async wait_until_opened() {
        return new Promise(async (res, rej) => {
            try {
                await this.wait_until_done(this.page);
                await this.isNumberInvalid(this.page)
                await this.is_profile_open(this.page);
                res('SUCCESS')
            } catch (err) {
                rej(err)
            }
        })
    }
    wait_until_done() {
        return new Promise(async (res, rej) => {
            let i = 0
            let interval = setInterval(async () => {
                let isProcessed = await this.page.evaluate(() => {
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
    isNumberInvalid() {
        return new Promise(async (res, rej) => {
            let isInvalid = await this.page.evaluate(() => {
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
    async is_profile_open() {
        return new Promise(async (res, rej) => {
            const isOpen = await this.page.$('div[contenteditable=true');
            if (isOpen) res('PROFILE_IS_OPEN')
            else rej("NO_PROFILE_OPEN")
        })
    }
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

module.exports = Profile;