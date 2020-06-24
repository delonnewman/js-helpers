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

function anyOf() {
    var fns = arguments;
    var i   = nat(fns.length);
    return function() {
        return fns[i].call(this);
    };
}

function notBlank() {
    var n = nat(4);
    switch(n) {
        case 0:
            return nat(32);
        case 1:
            return string(32);
        case 2:
            return bool();
        case 3:
            return arrayOf(32, anyOf(_.partial(nat, 32), _.partial(string, 32), bool));
    }
}

var theEmptyString = _.constant('');
var theNull        = _.constant(null);
var theUndefined   = _.constant(undefined);
var nil            = anyOf(theNull, theUndefined);
var blank          = anyOf(theNull, theUndefined, theEmptyString);
var nonNumeric     = anyOf(theNull, theUndefined, _.partial(string, 32), _.partial(arrayOf, 32, any));

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

describe('isBlank', function() {
    it("should return true if the value is null, undefined, or ''", function() {
        expect(helpers.isBlank(null)).toBe(true);
        expect(helpers.isBlank(undefined)).toBe(true);
        expect(helpers.isBlank('')).toBe(true);
    });

    it("should return false if the value is not null, undefined, or ''", function() {
        var x = notBlank();
        expect(helpers.isBlank(x)).toBe(false);
    });
});

describe('isPresent', function() {
    it("should return false if the value is null, undefined, or ''", function() {
        expect(helpers.isPresent(null)).toBe(false);
        expect(helpers.isPresent(undefined)).toBe(false);
        expect(helpers.isPresent('')).toBe(false);
    });

    it("should return true if the value is not null, undefined, or ''", function() {
        var x = notBlank();
        expect(helpers.isPresent(x)).toBe(true);
    });
});
