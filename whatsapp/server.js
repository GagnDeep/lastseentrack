const express = require('express');
// const bodyParser = require('body-parser')
const path = require('path');
const app = express();


var server = require('http').Server(app);
var io = require('socket.io')(server);



const { start_tracking, open_profile } = require('./index.js')

const { checkForLogin, goToUrl, getWhatsappLoginCode, newBrowser, newPage } = require('./login_handler')
// app.use(express.static(path.join(__dirname, 'build')));


let browser, page;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


app.get('/api/get_login_code', async function (req, res) {

    browser = await newBrowser()

    page = await newPage(browser);

    await goToUrl(page, "https://web.whatsapp.com");

    let code = await getWhatsappLoginCode(page);
    res.send(`<img src=${code}>`);
    checkForLogin(page)
});

app.get('/close', async (req, res) => {
    await browser.close();

    res.send('closed browser');
    console.log('closed')
})

app.get('/api /', function (req, res) {
    console.log('done')
})

io.on('connection', function (socket) {

    socket.on('init', async function () {
        browser = await newBrowser()
        page = await newPage(browser);
        await goToUrl(page, "https://web.whatsapp.com");

        socket.emit('init_success')
    })

    socket.on('start_tracking', async ({ mobile }) => {
        let isFound = await open_profile(page, mobile);

        if (isFound) {
            start_tracking(page)
            socket.emit('started_tracking')
            io.close(() => console.log('closed connection'))
        } else {
            socket.emit('person_not_found')
        }
        start_tracking(page, mobile);
    })


    socket.on('get_login_code', async function (data) {

        let code = await getWhatsappLoginCode(page);
        socket.emit('login_code', { code })

        let interval = setInterval(async () => {

            let isLoggedIn = await checkForLogin(page);

            if (isLoggedIn) {
                console.log("Successfully logged in")
                clearInterval(interval)
                socket.emit('login_success')
            }
            let temp = await getWhatsappLoginCode(page);
            if (temp !== code) {
                code = temp;
                socket.emit('login_code', { code });
            }
        }, 1000)
    });
});



server.listen(8080)