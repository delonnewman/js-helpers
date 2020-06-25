// JavaScript Helpers
(function(_) {
    "use strict";

    // IO

    function p(x) {
        console.log.apply(console.log, arguments);
        return x;
    }

    function pt(tag, value) {
        if (arguments.length === 1) {
            return function() {
                var args = Array.prototype.slice.call(arguments);
                console.log.apply(console.log, [str(tag, ':')].concat(args));

                return value;
            };
        }
        else if (arguments.length > 1) {
            var args = Array.prototype.slice.call(arguments);
            console.log.apply(console.log, [str(tag, ':')].concat(args));
        }
        else {
            throw new Error(str('Wrong number of arguments expected 1 or more, got: ', arguments.length));
        }

        return value;
    }

    // Predicates

    function isBlank(x) {
        return x == null || x === '';
    }

    function isNil(x) {
        return x == null;
    }

    function isPresent(x) {
        return x != null && x !== '';
    }

    function isNumber(x) {
        return Object.prototype.toString.call(x) === '[object Number]';
    }

    function isString(x) {
        return Object.prototype.toString.call(x) === '[object String]';
    }

    function isBoolean(x) {
        return Object.prototype.toString.call(x) === '[object Boolean]';
    }

    function isFunction(x) {
        return Object.prototype.toString.call(x) === '[object Function]';
    }

    function isArguments(x) {
        return Object.prototype.toString.call(x) === '[object Arguments]';
    }

    function isDate(x) {
        return Object.prototype.toString.call(x) === '[object Date]';
    }

    function isRegExp(x) {
        return Object.prototype.toString.call(x) === '[object RegExp]';
    }

    function isObject(x) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    }

    function isUndefined(x) {
        return x === void(0);
    }

    function isNull(x) {
        return x === null;
    }

    function isArrayLike(x) {
        return x != null && isNumber(x.length);
    }

    function isArray(x) {
        return Object.prototype.toString.call(x) === '[object Array]';
    }

    function isEmpty(obj) {
        if (obj == null) return true;
        if (isArrayLike(obj) && (isArray(obj) || isString(obj) || isArguments(obj))) return obj.length === 0;

        return Object.keys(obj).length === 0;
    }

    function isElement(obj) {
        return !!(obj && obj.nodeType === 1);
    }

    // Type conversion

    function toArray(x) {
        if (x == null) return [];

        return Array.prototype.slice.call(x);
    }

    function str(x) {
        if (x == null) return '';

        return Array.prototype.slice.call(arguments).join('');
    }

    // Collections

    function assoc(obj) {
        var kvs    = Array.prototype.slice.call(arguments, 1);
        var newObj = Object.assign({}, obj);
        var i, key, value;
        for (i = 0; i < kvs.length; i += 2) {
            key   = kvs[i];
            value = kvs[i + 1];
            newObj[key] = value;
        }
        return newObj;
    }
    
    function merge(o1, o2) {
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

    function map(collection, iteratee, context) {
        if (collection == null) return [];
        if (iteratee == null) return collection;

        var result = [], i;
        if (isArrayLike(collection)) {
            for (i = 0; i < collection.length; i++) {
                result.push(iteratee.call(context, collection[i], i, collection));
            }
        }
        else {
            var keys = Object.keys(collection), key;
            for (i = 0; i < keys.length; i++) {
                key = keys[i];
                result.push(iteratee.call(context, collection[key], key, collection));
            }
        }
        return result;
    }

    function reduce(collection, iteratee, memo, context) {
        var keys = isArrayLike(collection) ? null : Object.keys(collection),
            length = (keys ? keys : collection).length,
            index = 0;

        if (memo == null) {
            memo = keys ? [keys[0], collection[keys[0]]] : collection[0];
            index++;
        }

        if (isEmpty(collection) || iteratee == null) {
            return memo;
        }

        var key;
        for (; index < length; index++) {
            key = keys ? keys[index] : index;
            memo = iteratee.call(context, memo, collection[key], key, collection);
        }
        return memo;
    }

    function filter(collection, predicate, context) {
        var keys = isArrayLike(collection) ? null : Object.keys(collection),
            length = (keys ? keys : collection).length,
            results = [];

        if (length === 0) return results;
        if (predicate == null) return collection;

        var i, key, val;
        for (i = 0; i < length; i++) {
            key = keys ? keys[i] : i;
            val = collection[key];
            if (predicate.call(context, val, key, collection)) {
                results.push(val);
            }
        }

        return results;
    }

    function plucker() {
        var keys = arguments;
        return function(object) {
            var vals = [];

            if (keys.length === 0) {
                return undefined;
            }

            if (keys.length === 1) {
                return object[keys[0]];
            }

            var i, key, val;
            for (i = 0; i < keys.length; i++) {
                key = keys[i];
                val = object[key];
                if (!isUndefined(val)) vals.push(val);
            }

            return vals;
        };
    }

    function pluck(collection) {
        var keys = Array.prototype.slice.call(arguments, 1);
        return map(collection, plucker.apply(undefined, keys));
    }

    // Testing

    function assert(value, msg) {
        var msg_ = msg ? str('Failed assertion: ', msg) : 'Failed assertion';
        if (value == null || value === false) {
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
        if (isObject(value) && !isArray(value) && !isFunction(value)) {
            return map(value, function(v, k) { return str(formatAttrName(name), '-', formatAttrName(k), '="', v, '"'); }).join(' ');
        }
        // {href: ['https://google.com', {q: 'Hello Everyone'}]} => 'href="https://google.com?q=Hello%20Everyone"'
        else if (name.match(/^href|src$/) !== null && isArray(value)) {
            if (value.length >= 2) {
                var paramStr = map(value[1], function(v, k) { return str(k, '=', encodeURI(v)); }).join('&');
                return str(name, '="', value[0], '?', paramStr, '"');
            }
            else {
                return str(name, '="', value[0], '"');
            }
        }
        // {class: ['btn', 'btn-secondary', 'btn-sm']} => 'class="btn btn-secondary btn-sm"'
        else if (isArray(value)) {
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
        assertEquals(renderAttrs({ href: 'https://example.com', class: ['btn btn-primary'], data: { method: 'post', remote: true } }),
            'href="https://example.com" class="btn btn-primary" data-method="post" data-remote="true"');
    }

    function isAttrs(x) {
        return isObject(x) && !isFunction(x) && !isArray(x);
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
        var obj = merge(attr1, attr2), i, prop;
        for (i = 0; i < props.length; i++) {
            prop = props[i];
            if (attr1[prop] && attr2[prop]) {
                if (isArray(attr1[prop])) {
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

        if (isAttrs(array[1]) || !isEmpty(attrs)) {
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
        if (!isUndefined(val)) {
            return val;
        }
        else {
            return form;
        }
    }

    function evalTaggedArray(form, env) {
        var val = lookupDefinition(form[0], env);
        if (!isUndefined(val)) {
            if (isFunction(val)) {
                return evalFunction(val, form.slice(1), env);
            }
            else if (isArray(val)) {
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
        else if (isString(form)) {
            return evalString(form, env_);
        }
        else if (isNumber(form) || isDate(form) || isRegExp(form)) {
            return str(form);
        }
        else if (isBoolean(form)) {
            return form ? 'Yes' : 'No';
        }
        else if (isArray(form)) {
            if (form[0] === 'define') {
                return evalDefinition(form, env_);
            }
            else if (isFunction(form[0])) {
                return evalFunction(form[0], form.slice(1), env_);
            }
            else if (isString(form[0])) {
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
        if (!isString(text) && text != null) {
            opts = text;
            text = '';
        }
        var klass = str('fa fa-', desc);
        var defaults = {class: klass};
        opts = opts || {};
        if (opts.class) defaults.class = str(defaults.class, ' ', opts.class);
        var attrs = merge(opts, defaults);
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

    function params() {
        return parseParamStr(window.location.search);
    }

    function elementData(obj, element) {
        var value = formValue(element);

        if (isPresent(value)) {
            return parseParamKey(element.name, value, obj);
        }

        return obj;
    }

    // Take a collection of elements and return an object of name / value pairs.
    function formData(elements) {
        var init = {};
        if (elements == null) return init;

        return reduce(elements, elementData, init);
    }

    function isSelected(e) {
        return e.selected === true;
    }

    // Return the value for a form element an analog to jQuery's .val method.
    function formValue(element) {
        if (element == null) return undefined;

        var selected;
        if (element.tagName === 'INPUT' && (element.type === 'checkbox' || element.type === 'radio') && element.checked === true) {
            return element.value;
        }
        else if (element.tagName === 'INPUT' && (element.type !== 'checkbox' && element.type !== 'radio' && element.type !== 'button' && element.type !== 'submit')) {
            return element.value;
        }
        else if (element.tagName === 'SELECT') {
            selected = pluck(filter(element.children, isSelected), 'innerText');
            return element.multiple === true ? selected : selected[0];
        }
        else if (element.tagName === 'TEXTAREA') {
            return element.innerText;
        }
        else {
            return undefined;
        }
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
        var root = obj == null ? {} : obj;
        var tokens = key.split('');
        
        // states
        var readObj = false, manyValues = false;

        var ch, i, keyBuff = [], key_, params = root;
        for (i = 0; i < tokens.length; i++) {
            ch = tokens[i];
            // start reading collection
            if (ch === '[' && tokens[i + 1] === ']') {
                manyValues = true;
            }
            // start reading object
            else if (ch === '[' && tokens[i + 1] !== ']') {
                key_ = null;
                readObj = true;
                if (keyBuff.length !== 0) {
                    key_ = keyBuff.join('');
                    keyBuff = [];
                    if (!isObject(params[key_])) {
                        params[key_] = params[key_] || {};
                    }
                    params = params[key_];
                }
            }
            // complete reading object
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
            // complete reading collection
            else if (ch === ']' && manyValues) {
                if (keyBuff.length !== 0) {
                    key_ = keyBuff.join('');
                    keyBuff = [];
                }
                if (key_ != null) {
                    if (!isArray(params[key_])) {
                        params[key_] = params[key_] || [];
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
            // read key
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
        if (string.length === 0) return params;

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
        var url_ = isArray(url) ? url.join('/') : url;
        return str(url_, '?', paramStr(params_));
    }

    function seconds(n) {
        return n * 1000;
    }

    function ago(n) {
        return new Date(n);
    }

    function fromNow(n) {
        return new Date(new Date().valueOf() - n);
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

    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    var helpers = {
        // io
        p: p,
        pt: pt,

        // time
        seconds:         seconds,
        inSeconds:       inSeconds,
        timestamp:       timestamp,
        milliseconds:    milliseconds,
        ago:             ago,
        fromNow:         fromNow,

        parseDateString: parseDateString,
        fmtDate:         fmtDate,
        fmtISODate:      fmtISODate,
        fmtISOTime:      fmtISOTime,
        fmtISODateTime:  fmtISODateTime,
        timeAgoInWords:  timeAgoInWords,

        // predicates
        isUndefined: isUndefined,
        isNull:      isNull,
        isNil:       isNil,
        isBlank:     isBlank,
        isPresent:   isPresent,
        isNumber:    isNumber,
        isString:    isString,
        isBoolean:   isBoolean,
        isFunction:  isFunction,
        isArguments: isArguments,
        isDate:      isDate,
        isRegExp:    isRegExp,
        isObject:    isObject,
        isArrayLike: isArrayLike,
        isArray:     isArray,
        isEmpty:     isEmpty,
        isElement:   isElement,
        
        // collections
        toArray: toArray,
        assoc:   assoc,
        merge:   merge,
        map:     map,
        collect: map,
        reduce:  reduce,
        inject:  reduce,
        filter:  filter,
        select:  filter,
        pluck:   pluck,

        // strings
        str:    str,
        escape: escape,
        repeat: repeat,
        pad:    pad,
        uuid:   uuid,

        // html
        html: html,
        icon: icon,

        // urls / params
        params:        params,
        parseParamStr: parseParamStr,
        parseParamKey: parseParamKey,
        path:          path,
        paramStr:      paramStr,

        // dom
        browserHasInputType: browserHasInputType,
        formData: formData,
        formValue: formValue,

        // testing
        runTests: runTests,
        assert: assert,
        assertEquals: assertEquals,
        tests: [
            testFormatAttrName,
            testFormatAttr,
            testRenderAttrs,
            testRenderTag,
            testParseTagName,
        ]
    };

    // mixin to underscore if present
    if (typeof _ !== 'undefined') _.mixin(helpers);

    // export
    this.helpers = helpers;

}).call(window, _);
