const LastSeen = require('./whatsapp_api');
const express = require('express');
const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server, {
    path: '/tracker_api'
});

(async function () {


    const ls = new LastSeen();
    await ls.init();

    let userIP = null;

    io.on('connection', function (socket) {

        socket.on('init', function () {
            ls.login
                .init()
                .then(() => socket.emit('init_success'))
                .catch(() => socket.emit('init_fail'))
        })

        socket.on('get_login_code', async function (data) {

            let stopListening = null;

            try {
                let code = await ls.login.get_qr_code()
                socket.emit('login_code', { code })

                stopListening = ls.login.listen_code_change((code) => socket.emit('login_code', { code }))

                await ls.login.wait_for_login();
                socket.emit('login_success')

                stopListening()

            } catch (err) {
                if (stopListening) {
                    stopListening()
                }
                console.log('[error] socket.on get_login_code')
            }

            socket.on('disconnect', function () {
                console.log('disconnected');
            })

        });

        socket.on('start_tracking', async ({ number }) => {
            try {
                console.log('to_start_track')
                await ls.profile.open(number)
                await ls.track.start()
                socket.emit('started_tracking')
                io.close(() => console.log('closed connection'))
            } catch (err) {
                console.log(err);
            }
        })


    });



    const port = process.env.PORT || 4000;
    server.listen(port);
    console.log('server listening on port ' + port);

})()