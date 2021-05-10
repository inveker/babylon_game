type double = 0 | 1;
type triple = 2 | 0 | 1;

interface Keyboard {
    _ws: triple,
    _ww: double,
    _ad: triple,
    _aa: double,
    _dd: double,
    _eq: triple,
    _shift: double,
    _space: double,
}

export function initInputs(): Keyboard {
    return {
        _ws: 0,
        _ww: 0,
        _ad: 0,
        _aa: 0,
        _dd: 0,
        _eq: 0,
        _shift: 0,
        _space: 0,
    }
}

export function isKeyboard(obj: any): obj is Keyboard {
    return (obj as Keyboard) !== undefined;
}