// JavaScript Helpers
var helpers = (function($, _) {
    var p = console.log.bind(console.log);

    function pt(tag, value) {
        p(tag, value);
    }

    function str() {
        return Array.prototype.slice.call(arguments).join('');
    }

    function assert(value, msg) {
        var msg_ = msg ? str('Failed assertion: ', msg) : 'Failed assertion';
        if (_.isNull(value) || _.isUndefined(value) || value === false) {
            throw new Error(msg_);
        }
    }

    function assertEquals(a, b, msg) {
        var msg_ = msg ? str('Failed assertion: ', msg) : 'Failed assertion';
        if (a !== b) {
            throw new Error(msg_);
        }
    }

    function runTests(tests) {
        var i, errors = [], nTests = 0, nFailed = 0, nSucceded = 0;
        for (i = 0; i < tests.length; i++) {
            nTests++;
            try {
                tests[i].call();
                nSucceded++;
            }
            catch (e) {
                errors.push([e, tests[i]]);
                nFailed++;
            }
        }

        console.log(str(nTests, ' tests run, ', nSucceded, ' passed, ', nFailed, ' failed.'));
        for (i = 0; i < errors.length; i++) {
            console.log(errors[i][1]);
            console.error(errors[i][0]);
        }
    }

    // convert camel case names to dash formatted names, e.g. 'dataId' will become 'data-id'.
    function formatAttrName(string) {
        var i, ch, buffer = [];
        for (i = 0; i < string.length; i++) {
            ch = string[i];
            if (ch.match(/^[A-Z]$/) !== null) {
                if (i !== 0) {
                    buffer.push('-');
                }
                buffer.push(ch.toLowerCase());
            }
            else if (ch === '_') {
                buffer.push('-');
            }
            else {
                buffer.push(ch);
            }
        }
        return buffer.join('');
    }

    function testFormatAttrName() {
        assertEquals(formatAttrName('dataId'), 'data-id');
        assertEquals(formatAttrName('ThisIsATest'), 'this-is-a-test');
        assertEquals(formatAttrName('thisIsATest'), 'this-is-a-test');
        assertEquals(formatAttrName('this-is-a-test'), 'this-is-a-test');
    }

    function formatAttr(name, value) {
        // {data: {entryId: 4, method: 'delete'}} => 'data-entry-id="4" data-method="delete"'
        if (_.isObject(value) && !_.isArray(value) && !_.isFunction(value)) {
            return _.map(value, function(v, k) { return str(formatAttrName(name), '-', formatAttrName(k), '="', v, '"') }).join(' ');
        }
        // {href: ['https://google.com', {q: 'Hello Everyone'}]} => 'href="https://google.com?q=Hello%20Everyone"'
        else if (name.match(/^href|src$/) !== null && _.isArray(value)) {
            if (value.length >= 2) {
                var paramStr = _.map(value[1], function(v, k) { return str(k, '=', encodeURI(v)) }).join('&');
                return str(name, '="', value[0], '?', paramStr, '"');
            }
            else {
                return str(name, '="', value[0], '"');
            }
        }
        // {class: ['btn', 'btn-secondary', 'btn-sm']} => 'class="btn btn-secondary btn-sm"'
        else if (_.isArray(value)) {
            return str(formatAttrName(name), '="', value.join(' '), '"');
        }
        else {
            return str(formatAttrName(name), '="', value, '"');
        }
    }

    function testFormatAttr() {
        assertEquals(formatAttr('data', { entryId: 4, method: 'delete' }), 'data-entry-id="4" data-method="delete"');
        assertEquals(formatAttr('class', ['btn', 'btn-secondary', 'btn-sm']), 'class="btn btn-secondary btn-sm"');
        assertEquals(formatAttr('href', 'http://example.com'), 'href="http://example.com"');
    }

    // generates an attribute string from an object literal
    function renderAttrs(obj) {
        var keys = Object.getOwnPropertyNames(obj),
            i, k, buffer = [];
        for (i = 0; i < keys.length; i++) {
            k = keys[i];
            buffer.push(formatAttr(k, obj[k]));
        }
        return buffer.join(' ');
    }

    function testRenderAttrs() {
        assertEquals(renderAttrs({href: 'https://example.com', class: ['btn btn-primary'], data: {method: 'post', remote: true}}),
            'href="https://example.com" class="btn btn-primary" data-method="post" data-remote="true"');
    }

    function isAttrs(x) {
        return _.isObject(x) && !_.isFunction(x) && !_.isArray(x);
    }

    function renderFormList(array, env) {
        if (array == null || array.length === 0) {
            return '';
        }
        var i, buffer = [];
        for (i = 0; i < array.length; i++) {
            buffer.push(html(array[i], env));
        }
        return buffer.join('');
    }

    function parseTagName(name) {
        var classes = [], ids = [], readClass = false, readId = false, buffer = [], name_, i, ch;
        for (i = 0; i < name.length; i++) {
            ch = name[i];
            if (ch === '.') {
                if (buffer.length !== 0) {
                    if (readClass === true) classes.push(buffer.join(''));
                    else if (readId === true) ids.push(buffer.join(''));
                    else {
                        name_ = buffer.join('');
                    }
                    buffer = [];
                }
                readClass = true;
                readId = false;
            }
            else if (ch === '#') {
                if (buffer.length !== 0) {
                    if (readClass === true) classes.push(buffer.join(''));
                    else if (readId === true) ids.push(buffer.join(''));
                    else {
                        name_ = buffer.join('');
                    }
                    buffer = [];
                }
                readId = true;
                readClass = false;
            }
            else {
                buffer.push(ch);
            }
        }
        if (buffer.length !== 0) {
            if (readClass === true) classes.push(buffer.join(''));
            else if (readId === true) ids.push(buffer.join(''));
            else {
                name_ = buffer.join('');
            }
            buffer = [];
        }
        return { name: name_, classes: classes, ids: ids };
    }

    function testParseTagName() {
        data = parseTagName('a');
        assertEquals(data.name, 'a');
        assert(data.classes.length === 0, 'no classes');
        assert(data.ids.length === 0, 'no ids');

        data = parseTagName('a.btn');
        assertEquals(data.name, 'a');
        assert(data.classes.length === 1, 'one class');
        assertEquals(data.classes[0], 'btn');
        assert(data.ids.length === 0, 'no ids');

        data = parseTagName('a.btn.btn-secondary.btn-sm');
        assertEquals(data.name, 'a');
        assert(data.classes.length === 3, '3 classes');
        assertEquals(data.classes[0], 'btn');
        assertEquals(data.classes[1], 'btn-secondary');
        assertEquals(data.classes[2], 'btn-sm');
        assert(data.ids.length === 0, 'no ids');

        data = parseTagName('a#header-link');
        assertEquals(data.name, 'a');
        assert(data.classes.length === 0, 'no classes');
        assert(data.ids.length === 1, 'one id');
        assertEquals(data.ids[0], 'header-link');

        data = parseTagName('a#header-link.btn.btn-secondary.btn-sm');
        assertEquals(data.name, 'a');
        assert(data.classes.length === 3, '3 classes');
        assertEquals(data.classes[0], 'btn');
        assertEquals(data.classes[1], 'btn-secondary');
        assertEquals(data.classes[2], 'btn-sm');
        assert(data.ids.length === 1, 'one id');
        assertEquals(data.ids[0], 'header-link');
    }

    function mergeProperties(attr1, attr2, props) {
        var obj = _.merge(attr1, attr2), i, prop;
        for (i = 0; i < props.length; i++) {
            prop = props[i];
            if (attr1[prop] && attr2[prop]) {
                if (_.isArray(attr1[prop])) {
                    obj[prop] = [].concat(attr1[prop], attr2[prop]);
                }
                else {
                    obj[prop] = [].concat(attr1[prop], [attr2[prop]]);
                }
            }
        }
        return obj;
    }

    function renderTag(array, env) {
        var name = array[0],
            nameParts = parseTagName(name),
            name_ = nameParts.name,
            attrs = {},
            attrs_;

        if (nameParts.classes.length !== 0) {
            attrs.class = nameParts.classes;
        }
        if (nameParts.ids.length !== 0) {
            attrs.id = nameParts.ids;
        }

        if (isAttrs(array[1]) || !_.isEmpty(attrs)) {
            attrs_ = mergeProperties(attrs, array[1], ['class', 'id']);
            return str('<', name_, ' ', renderAttrs(attrs_), '>', renderFormList(array.slice(2), env), '</', name_, '>');
        }
        else {
            return str('<', name_, '>', renderFormList(array.slice(1), env), '</', name_, '>');
        }
    }

    function testRenderTag() {
        assertEquals(renderTag(['a', {href: 'http://example.com'}, "This is a test"]), '<a href="http://example.com">This is a test</a>');
        assertEquals(renderTag(['strong', "Bold Text"]), '<strong>Bold Text</strong>');
        assertEquals(renderTag(['ul', ['li', "One"], ['li', "Two"], ['li', "Three"]]), '<ul><li>One</li><li>Two</li><li>Three</li></ul>');
        assertEquals(renderTag(['a.btn.btn-primary', {class: 'btn-sm', href: '#'}, "This is a link"]), '<a class="btn btn-primary btn-sm" href="#">This is a link</a>');
    }

    function evalDefinition(form, env) {
        if (form.length === 3) {
            var name = form[1], value = form[2];
            env[name] = value;
            return null;
        }
        else {
            throw new Error('Invalid form definitions should have exactly 3 elements');
        }
    }

    function lookupDefinition(name, env) {
        return env[name];
    }

    function evalString(form, env) {
        var val = lookupDefinition(form, env);
        if (!_.isUndefined(val)) {
            return val;
        }
        else {
            return form;
        }
    }

    function evalTaggedArray(form, env) {
        var val = lookupDefinition(form[0], env);
        if (!_.isUndefined(val)) {
            if (_.isFunction(val)) {
                return evalFunction(val, form.slice(1), env);
            }
            else if (_.isArray(val)) {
                return html(val, env);
            }
            throw new Error('Only strings and functions can be evaluated as tags');
        }
        else {
            return renderTag(form, env);
        }
    }

    function evalFunction(f, args, env) {
        return html(f.apply(null, args), env);
    }

    var htmlHelpers = {};

    function html(form, env) {
        var env_ = env || htmlHelpers;
        if (form == null) {
            return '';
        }
        else if (_.isString(form)) {
            return evalString(form, env_);
        }
        else if (_.isNumber(form) || _.isDate(form) || _.isRegExp(form)) {
            return str(form);
        }
        else if (_.isBoolean(form)) {
            return form ? 'Yes' : 'No';
        }
        else if (_.isArray(form)) {
            if (form[0] === 'define') {
                return evalDefinition(form, env_);
            }
            else if (_.isFunction(form[0])) {
                return evalFunction(form[0], form.slice(1), env_);
            }
            else if (_.isString(form[0])) {
                return evalTaggedArray(form, env_);
            }
            else {
                return renderFormList(form, env_);
            }
        }
        else {
            throw new Error(str('Unknown form: "', form, '"'));
        }
    }

    function icon(desc, text, opts) {
        if (desc == null) throw new Error('An icon descriptor is required');
        if (!_.isString(text) && text != null) {
            var opts = text;
            var text = '';
        }
        var klass = str('fa fa-', desc);
        var defaults = {class: klass};
        opts = opts || {};
        if (opts.class) defaults.class = str(defaults.class, ' ', opts.class);
        var attrs = _.merge(opts, defaults);
        var html = str('<i ', renderAttrs(attrs), ' aria-hidden="true"></i>');
        if (text != null) {
            return str(html, ' ', text);
        }
        return html;
    }

    function repeat(s, times) {
        var buff = [], i, max = 1000;
        for (i = 0; i < times && i < max; i++) {
            buff.push(s);
        }
        return buff.join('');
    }

    function pad(value, length, char) {
        var s = str(value);
        if (s.length >= length) {
            return s;
        }
        else {
            return str(repeat(char, length - s.length), value);
        }
    }

    htmlHelpers.repeat = repeat;
    htmlHelpers.icon = icon;
    htmlHelpers.pad = pad;
    htmlHelpers.escape = escape;

    // Underscore plugins
    // ==================

    _.mixin({
        p: function(x) {
            console.log(x);
            return x;
        },
        pt: function(x, tag) {
            return _.p(str(tag, ':'), x);
        },
        assoc: function(obj) {
            var kvs    = Array.prototype.slice.call(arguments, 1);
            var newObj = Object.assign({}, obj);
            var i, key, value;
            for (i = 0; i < kvs.length; i += 2) {
                key   = kvs[i];
                value = kvs[i + 1];
                newObj[key] = value;
            }
            return newObj;
        },
        merge: function(o1, o2) {
            var newO = {};
            var keys1 = Object.getOwnPropertyNames(o1);
            var i, k;
            for (i = 0; i < keys1.length; i++) {
                k = keys1[i];
                newO[k] = o1[k];
            }
            var keys2 = Object.getOwnPropertyNames(o2);
            for (i = 0; i < keys2.length; i++) {
                k = keys2[i];
                newO[k] = o2[k];
            }
            return newO;
        }
    });

    function fmtDate(date) {
        return str(pad(date.getMonth() + 1, 2, '0'), '/', pad(date.getDate(), 2, '0'), '/', date.getFullYear());
    }

    function parseDateString(str) {
        var parts = str.split('/'),
            month = parseInt(parts[0]),
            day   = parseInt(parts[1]),
            year  = parseInt(parts[2]);
        return new Date(year, month, day);
    }

    function fmtISODate(date) {
        return str(date.getFullYear(), '-', pad(date.getMonth() + 1, 2, '0'), '-', pad(date.getDate(), 2, '0'));
    }

    function fmtISOTime(date) {
        return str(pad(date.getHours(), 2, '0'), ':', pad(date.getMinutes(), 2, '0'));
    }

    function fmtISODateTime(date) {
        return str(fmtISODate(date), 'T', fmtISOTime(date));
    }

    function browserHasInputType(type) {
        var e = document.createElement('input');
        e.setAttribute('type', type);
        return e.type !== 'text';
    }

    function browserHasDateTimeInputType() {
        return browserHasInputType('datetime-local');
    }

    function clearForm(elem) {
        var $elem = $(elem);
        $elem.find('select, input, textarea').val('');
    }

    function params() {
        return parseParamStr(window.location.search);
    }

    function testParseParamKey() {
        var p0 = parseParamKey('a', 1);
        assertEquals(p0.a, 1);

        var p1 = parseParamKey('a[b]', 2);
        assertEquals(p1.a.b, 2);

        var p2 = parseParamKey('a[b][c]', 3);
        assertEquals(p2.a.b.c, 3);

        var p3 = parseParamKey('a[]', 4);
        assertEquals(p3.a[0], 4);

        var p4 = parseParamKey('a[b][]', 5);
        assertEquals(p4.a.b[0], 5);

        var p5 = {};
        parseParamKey('a[b]', 6, p5);
        parseParamKey('a[c]', 7, p5);
        assertEquals(p5.a.b, 6);
        assertEquals(p5.a.c, 7);
    }

    function printParams(params) {
        var buffer = arguments[1] || [];
        var i, key, val, keys = Object.keys(params);
        if (keys.length === 0) {
            return "";
        }
        else {
            for (i = 0; i < keys.length; i++) {
                key = keys[i];
                val = params[key];
            }
        }
    }

    function parseParamKey(key, value, obj) {
        var root = obj || {},
            tokens = key.split('');
        
        // states
        var readObj = false, manyValues = false;

        var ch, i, keyBuff = [], key_, params = root;
        for (i = 0; i < tokens.length; i++) {
            ch = tokens[i];
            if (ch === '[' && tokens[i + 1] === ']') {
                manyValues = true;
            }
            else if (ch === '[' && tokens[i + 1] !== ']') {
                key_ = null;
                readObj = true;
                if (keyBuff.length !== 0) {
                    key_ = keyBuff.join('');
                    keyBuff = [];
                    if (!_.isObject(params[key_])) {
                        params[key_] = {};
                    }
                    params = params[key_];
                }
            }
            else if (ch === ']' && readObj) {
                readObj = false;
                key_ = keyBuff.join('');
                keyBuff = [];
                if (i === tokens.length - 1) {
                    params[key_] = value;
                }
                else if (tokens[i + 1] !== '[' || tokens[i + 2] !== ']') {
                    params[key_] = params[key_] || {};
                    params = params[key_];
                }
            }
            else if (ch === ']' && manyValues) {
                if (keyBuff.length !== 0) {
                    key_ = keyBuff.join('');
                    keyBuff = [];
                }
                if (key_ != null) {
                    if (!_.isArray(params[key_])) {
                        params[key_] = [];
                    }
                    params[key_].push(value);
                }
                else {
                    throw new Error('Unexpeced "[]" a key is required');
                }
            }
            else if (ch === ']') {
                throw new Error('Unexpected "]" expecting key or "["');
            }
            else {
                keyBuff.push(ch);
            }
        }

        if (keyBuff.length !== 0) {
            key_ = keyBuff.join('');
            params[key_] = value;
        }

        return root;
    }

    function parseParamStr(string) {
        var params = {};
        if (string.length === 0) {
            return params;
        }
        return string.slice(1).split('&').reduce(function(params, kv) {
            var parts = kv.split('=');
            return parseParamKey(parts[0], parts[1], params);
        }, params);
    }

    function paramStr(params) {
        return Object.keys(params).map(function(param) { return str(param, '=', params[param]); }).join('&');
    }

    function path(url, params) {
        var params_ = params || {};
        var url_ = _.isArray(url) ? url.join('/') : url;
        return str(url_, '?', paramStr(params_));
    }

    function seconds(n) {
        return n * 1000;
    }

    function inSeconds(n) {
        return n / 1000;
    }

    function timestamp() {
        return new Date().valueOf();
    }

    function milliseconds(n) {
        return n;
    }

    function isBlank(value) {
        return value == null || value === '';
    }

    function toArray(value) {
        return Array.prototype.slice.call(value);
    }

    var UNITS = {
        second: 'seconds',
        minute: 'minutes',
        hour:   'hours',
        day:    'days',
        week:   'weeks',
        month:  'months',
        year:   'years'
    };

    function pluralizeUnit(unit, number) {
        if (number === 1) return str(number, ' ', unit);

        var plural = UNITS[unit];
        if (plural == null) {
            throw new Error(str('Invalid singular unit: "', unit, '"'));
        }
        else {
            return str(number, ' ', plural);
        }
    }

    function timeAgoInWords(time) {
        var now     = new Date(),
            years   = 1000 * 60 * 60 * 24 * 360,
            months  = 1000 * 60 * 60 * 24 * 30,
            weeks   = 1000 * 60 * 60 * 24 * 7,
            days    = 1000 * 60 * 60 * 24,
            hours   = 1000 * 60 * 60,
            minutes = 1000 * 60,
            seconds = 1000,
            diff    = time.valueOf() - now.valueOf(),
            suffix  = diff > 0 ? 'from now' : 'ago',
            diff_   = Math.abs(diff);

        if ( diff_ > years ) {
            return str(pluralizeUnit('year', Math.floor(diff_ / years)), ' ', suffix);
        }
        else if ( diff_ > months ) {
            return str(pluralizeUnit('month', Math.floor(diff_ / months)), ' ', suffix);
        }
        else if ( diff_ > weeks ) {
            return str(pluralizeUnit('week', Math.floor(diff_ / weeks)), ' ', suffix);
        }
        else if ( diff_ > days ) {
            return str(pluralizeUnit('day', Math.floor(diff_ / days)), ' ', suffix);
        }
        else if ( diff_ > hours ) {
            return str(pluralizeUnit('hour', Math.floor(diff_ / hours)), ' ', suffix);
        }
        else if ( diff_ > minutes ) {
            return str(pluralizeUnit('minute', Math.floor(diff_ / minutes)), ' ', suffix);
        }
        else if ( diff_ > seconds ) {
            return str(pluralizeUnit('second', Math.floor(diff_ / seconds)), ' ', suffix);
        }
        else {
            return 'just now';
        }
    }

    return {
        str: str,
        icon: icon,
        p: p,
        pt: pt,
        escape: escape,
        repeat: repeat,
        seconds: seconds,
        inSeconds: inSeconds,
        timestamp: timestamp,
        milliseconds: milliseconds,
        timeAgoInWords: timeAgoInWords,
        isBlank: isBlank,
        toArray: toArray,
        pad: pad,
        html: html,
        params: params,
        parseParamStr: parseParamStr,
        parseParamKey: parseParamKey,
        path: path,
        paramStr: paramStr,
        fmtDate: fmtDate,
        parseDateString: parseDateString,
        fmtISODate: fmtISODate,
        fmtISOTime: fmtISOTime,
        fmtISODateTime: fmtISODateTime,
        setDateTimePicker: setDateTimePicker,
        maybeSetDateTimePicker: maybeSetDateTimePicker,
        browserHasInputType: browserHasInputType,
        runTests: runTests,
        assert: assert,
        assertEquals: assertEquals,
        tests: [
            testFormatAttrName,
            testFormatAttr,
            testRenderAttrs,
            testRenderTag,
            testParseTagName,
            testParseParamKey
        ]
    };

})(jQuery, _);

