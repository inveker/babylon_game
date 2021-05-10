export const ws = new WebSocket('ws://0.0.0.0:8077');
if(!ws) throw new Error("no WS connection");

let onMessageCall = [];
export function addOnMsg(action: CallableFunction) {
    onMessageCall.push(action);
}
export let initMsg: any = {};
export function getInitMsg() {
    return initMsg;
}
ws.onopen = () => {
    //Init user id

    // let ping = performance.now();
    ws.onmessage = async message => {
        // console.log('ping: ', performance.now() - ping)
        // ping = performance.now()
        let tmp = await message.data.text();
        let data = JSON.parse(tmp);
        if(data.type == 'new')
            initMsg = data;
        onMessageCall.forEach(action => action(data));
    };

    //Leave handler
    window.onbeforeunload = function() {
        ws.send(JSON.stringify({action: 'leave'}));
    };

    //Error handler
    ws.onerror = error => {
        console.log(error)
    };
}
