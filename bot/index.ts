var WebSocketClient = require('websocket').client;


let count = 20;
// let one = 10;
// let now = 0;
// let bot = [];



// let int = setInterval(function () {
    for(let i = 0; i < count; i++) {
        let client = new WebSocketClient();
        client.on('connect', function (connection) {
            connection.on('message', function (message) {
                let msg = '1'+(Math.random() > 0.5 ? 1 : 0)+'0'+(Math.random() > 0.5 ? 1 : 2)+'00000';
                // connection.sendBytes(Buffer.from(Object.values(msg)));
                connection.send(msg);
            })
        });
        // Подключаемся к нужному ресурсу
        client.connect('ws://0.0.0.0:8077');
    }
//     now += one;
//     if(now >= count) {
//         clearInterval(int);
//     }
// }, 500)








// const ws = new WebSocket('ws://0.0.0.0:8077');
// if(!ws) throw new Error("no WS connection");

// ws.onopen = () => {
//     //Init user id
// console.log('open')
//     ws.onmessage = message => {
//         let data = JSON.parse(message.data);
//         console.log(data)
//         // Create first
//         if(data.type == 'new') {
//
//             //Update
//         } else {
//
//
//
//             // ws.send(JSON.stringify({
//             //     action: 'update',
//             //     input: input
//             // }));
//
//         }
//     };
//
//     //Leave handler
//     window.onbeforeunload = function() {
//         ws.send(JSON.stringify({action: 'leave'}));
//     };
//
//     //Error handler
//     ws.onerror = error => {
//         console.log(error)
//     };
// }
