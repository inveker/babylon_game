export class Keyboard {
    protected pressed = {};
    addPress(code, action: CallableFunction, postAction?: CallableFunction) {
        let pressed = this.pressed;
        window.addEventListener('keydown', function (e) {
            if(e.code == code && !pressed[code]) {
                pressed[code] = 1;
                action();
            }
        });
        if(postAction) {
            window.addEventListener('keyup', function (e) {
                if(e.code == code) {
                    delete pressed[code];
                    postAction();
                }
            });
        }
    }
}
