"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inputs_1 = require("../common/inputs");
const WebSocket = require("ws");
// import * as WebSocket from 'ws';
console.log(Object.keys(WebSocket));
const wss = new WebSocket.Server({ port: 8077 });
let users = {};
let ID = 0;
wss.on('connection', ws => {
    let id = ID++;
    ws['id'] = id;
    ws['status'] = 'new';
    console.log('connection');
    users[id] = {
        id: id,
        position: {
            x: 5 * id,
            y: 9,
            z: 0 //Math.random() * 5,
        },
        rotation: {
            x: 0,
            y: 0,
            z: 0,
        },
        speed: 5,
        eatSpeed: 10,
        color: { r: Math.random(), g: Math.random(), b: Math.random(), },
        state: {},
    };
    let user = users[id];
    ws.on('message', message => {
        let msg = JSON.parse(message);
        switch (msg.action) {
            case 'update':
                if (user) {
                    if (msg.input instanceof inputs_1.Keyboard) {
                        let { _ws, _ww, _ad, _aa, _dd, _q, _e, _shift, _space } = msg.input;
                        if (_ad) {
                            user.rotation.y += Math.PI * 0.05 * Math.sign(_ad);
                        }
                        if (_ws) {
                            let distance = user.speed * Math.sign(+_ws);
                            if (_space)
                                distance += user.eatSpeed * +!!_space;
                            if (_shift)
                                distance *= Math.sign(+_shift);
                            user.position.x -= Math.cos(user.rotation.y) * distance;
                            user.position.z += Math.sin(user.rotation.y) * distance;
                        }
                    }
                }
                break;
            case 'leave':
                delete users[id];
                break;
        }
    });
});
setInterval(function () {
    wss.clients.forEach(function (client) {
        // console.log(client.status)
        if (client['status'] == 'new') {
            client['status'] = 'update';
            client.send(JSON.stringify({
                type: 'new',
                id: client['id'],
                user: users[client['id']]
            }));
        }
        else {
            client.send(JSON.stringify({
                id: client['id'],
                users: users
            }));
        }
    });
}, 100);
//# sourceMappingURL=index.js.map