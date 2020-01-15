const LastSeen = require('./whatsapp_api');
const express = require('express');
const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

(async function () {

    const ls = new LastSeen();
    await ls.init();

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/index.html');
    });

    io.on('connection', function (socket) {

        socket.on('init', function () {
            ls.login
                .init()
                .then(() => socket.emit('init_success'))
                .catch(() => socket.emit('init_fail'))
        })

        socket.on('start_tracking', async ({ mobile }) => {
            try {
                await ls.profile.open(mobile)
                await ls.track.start()
                socket.emit('started_tracking')
                io.close(() => console.log('closed connection'))
            } catch (err) {
                console.log(err);
            }
        })


        socket.on('get_login_code', async function (data) {

            let code = await ls.login.get_qr_code()
            socket.emit('login_code', { code })

            let interval = setInterval(async () => {
                let temp = await ls.login.extract_qr_code();
                if (temp !== code) {
                    code = temp;
                    socket.emit('login_code', { code });
                }
            }, 1000)

            ls.login.wait_for_login()
                .then(() => {
                    console.log('done login')
                    socket.emit('login_success')
                    clearInterval(interval)
                })
                .catch(err => clearInterval(interval))

        });
    });



    const port = process.env.PORT || 8080
    server.listen(port);
    console.log('server listening on port ' + port);

})()