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
var nonNumeric     = anyOf(theNull, theUndefined, _.partial(string, 32), _.partial(arrayOf, 32, notBlank));

var FIELD_NAME_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789_';

function string(max, pad) {
    var length = nat(max);

    var chars = [], i;
    if (pad == null) {
        for (i = 0; i <= length; i++) {
            chars.push(nat(65535));
        }
        return String.fromCharCode.apply(String, chars);
    }

    for (i = 0; i <= length; i++) {
        var n = nat(pad.length);
        chars.push(pad[n]);
    }

    return chars.join('');
}



function arrayOf(max, func) {
    var i, a = [];
    for (i = 0; i < max; i++) {
        a.push(func.call(null, i, max));
    }
    return a;
}

function element(allClear, names) {
    allClear = allClear == null ? false : allClear;
    names    = names == null ? [] : names;

    var type = inputType();
    var name = ['entry[', string(15, FIELD_NAME_CHARS), ']'].join('');

    if (type === 'checkbox' || type === 'radio') {
        var checked = allClear ? false : bool();
        return { tagName: 'input', type: type, name: name, value: string(32), checked: checked };
    }
    else {
        var value = allClear ? blank() : string(32);
        return { tagName: 'input', type: type, name: name, value: value };
    }
}

function ensureNotClear(element) {
    if (element.type === 'checkbox' || element.type === 'radio') {
        element.checked = true;
    }
    else {
        element.value = string(32);
    }
    return element;
}

function elements(max, allClear) {
    var count    = nat(max);
    var isArray  = bool();
    var elements = isArray ? [] : {};
    var names    = [];
    for (var i = 0; i <= count; i++) {
        elements[i] = element(allClear, names);
    }
    if (allClear !== true) ensureNotClear(elements[0]);
    if (!isArray) elements.length = count;
    return elements;
}

function sample(array) {
    return array[nat(array.length)];
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

describe('map', function() {
    it('should return and array of the return values of the function', function() {
        var nums = _.range(10);
        expect(helpers.map(nums, _.identity)).toEqual(nums);
    });
});

describe('pluck', function() {
    it('should return and array of the return values of keys given', function() {
        var elems = elements(20);

        var names = helpers.map(elems, function(e) { return e.name; });
        expect(helpers.pluck(elems, 'name')).toEqual(names);

        var namesAndValues = helpers.map(elems, function(e) { return [e.name, e.value]; });
        expect(helpers.pluck(elems, 'name', 'value')).toEqual(namesAndValues);
    });
});

describe('filter', function() {
    it('should return and array of the return values that match the predicate', function() {
        var nums = _.range(20);
        expect(helpers.filter(nums, function(n) { return n < 10; })).toEqual(_.range(10));
    });
});

describe('reduce', function() {
    it('should return and array of the return values that match the predicate', function() {
        var nums = _.range(10);
        expect(helpers.reduce(nums, function(a, b) { return a + b; })).toEqual(0 + 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9);
        expect(helpers.reduce(nums, function(a, b) { return a + b; }, 10)).toEqual(10 + 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9);
    });
});

describe('parseParamKey', function() {
    var parseParamKey = helpers.parseParamKey;

    it('should return a parsed object', function() {
        var p0 = parseParamKey('a', 1);
        expect(p0.a).toBe(1);

        var p1 = parseParamKey('a[b]', 2);
        expect(p1.a.b).toBe(2);

        var p2 = parseParamKey('a[b][c]', 3);
        expect(p2.a.b.c).toBe(3);

        var p3 = parseParamKey('a[]', 4);
        expect(p3.a[0]).toBe(4);

        var p4 = parseParamKey('a[b][]', 5);
        expect(p4.a.b[0]).toBe(5);

        var p5 = {};
        parseParamKey('a[b]', 6, p5);
        parseParamKey('a[c]', 7, p5);
        expect(p5.a.b).toBe(6);
        expect(p5.a.c).toBe(7);
    });
});

describe('formValue', function() {
    it('should return an appropriate value depending on the form element type', function() {
        var checkTypes = ['checkbox', 'radio'];
        var otherInputTypes = ['text'];

        var e0 = { tagName: 'input', type: sample(checkTypes), checked: true, value: string(32) };
        expect(helpers.formValue(e0)).toBe(e0.value);

        var e1 = { tagName: 'input', type: sample(checkTypes), checked: false, value: string(32) };
        expect(helpers.formValue(e1)).toBeUndefined();

        var e2 = { tagName: 'input', type: sample(otherInputTypes), value: string(32) };
        expect(helpers.formValue(e2)).toBe(e2.value);

        var e3 = { tagName: 'input', type: sample(otherInputTypes) };
        expect(helpers.formValue(e3)).toBeUndefined();

        var e4 = { tagName: 'textarea', innerText: string(32) };
        expect(helpers.formValue(e4)).toBe(e4.innerText);

        var e5 = { tagName: 'select', children: arrayOf(10, function() { return { isSelected: bool(), innerText: string(32) }; }) };
        var values = _.pluck(_.filter(e5.children, function(e) { return e.selected === true; }), 'innerText');
        expect(helpers.formValue(e5)).toEqual(values[0]);

        var e6 = { tagName: 'select', multiple: true, children: arrayOf(10, function() { return { isSelected: bool(), innerText: string(32) }; }) };
        values = _.pluck(_.filter(e6.children, function(e) { return e.selected === true; }), 'innerText');
        expect(helpers.formValue(e6)).toEqual(values);
    });
});

describe('formData', function() {
    it('should return an object of form data', function() {
        var elems = helpers.toArray(elements(20));
        elems.push({ tagName: 'input', type: 'hidden', name: 'entry[user_id]', value: nat(20) });
        elems.push({ tagName: 'input', type: 'hidden', name: 'entry[unit_id]', value: nat(20) });
        var data  = helpers.formData(elems);

        expect(data.entry.unit_id).toBeDefined();
        expect(data.entry.user_id).toBeDefined();

        var filtered = _.filter(elems, function(e) { return helpers.isPresent(helpers.formValue(e)); });
        expect(Object.keys(data.entry).length).toBe(filtered.length);
    });

    it('should return an empty object if the element list is empty or all elements are clear', function() {
        expect(_.isEmpty(helpers.formData([]))).toBe(true);
        expect(_.isEmpty(helpers.formData(elements(20, true)))).toBe(true);
    });
});
