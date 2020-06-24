function nat(max) {
    return Math.floor(Math.random() * Math.floor(max || 10000));
}

function bool() {
    return nat(2) === 1 ? true : false;
}

function inputType() {
    var n = nat(4);
    switch(n) {
        case 1:
            return 'checkbox';
        case 2:
            return 'radio';
        case 3:
            return 'text';
        default:
            return 'text';
    }
}

function falsy() {
    var n = nat(5);
    switch(n) {
        case 1:
            return false;
        case 2:
            return null;
        case 3:
            return void(0);
        case 4:
            return '';
        default:
            return false;
    }
}

function blank() {
    var n = nat(4);
    switch(n) {
        case 1:
            return '';
        case 2:
            return null;
        case 3:
            return void(0);
        default:
            return null;
    }
}

function string(max) {
    var length = nat(max);
    var chars = [];
    for (var i = 0; i <= length; i++) {
        chars.push(nat(65535));
    }
    return String.fromCharCode.apply(String, chars);
}

function arrayOf(max, func) {
    var i, a = [];
    for (i = 0; i < max; i++) {
        a.push(func.call(null, i, max));
    }
    return a;
}

function element(allClear) {
    var allClear = allClear == null ? false : allClear;

    var type = inputType();
    var name = ['entry[', sample(fieldNames), ']'].join('');
    if (type === 'checkbox' || type === 'radio') {
        var checked = allClear ? false : bool();
        return { type: type, name: name, checked: checked };
    }
    else {
        var value = allClear ? blank() : string(32);
        return { type: type, name: name, value: value };
    }
}

describe('str', function() {
    it('should concatenate any number of strings', function() {
        var s = string(64);
        expect(helpers.str.apply(null, s.split(''))).toEqual(s);
    });

    it('should return an empty strings when no arguments are given', function() {
        expect(helpers.str()).toEqual('');
    });
});
