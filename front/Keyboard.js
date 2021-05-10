"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keyboard = void 0;
class Keyboard {
    constructor() {
        this.pressed = {};
    }
    addPress(code, action, postAction) {
        let pressed = this.pressed;
        window.addEventListener('keydown', function (e) {
            if (e.code == code && !pressed[code]) {
                pressed[code] = 1;
                action();
            }
        });
        if (postAction) {
            window.addEventListener('keyup', function (e) {
                if (e.code == code) {
                    delete pressed[code];
                    postAction();
                }
            });
        }
    }
}
exports.Keyboard = Keyboard;
//# sourceMappingURL=Keyboard.js.map