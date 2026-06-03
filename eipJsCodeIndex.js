/**
 * Z - EIP JS 工具库
 *
 * 引入：<script src="https://cdn.jsdelivr.net/gh/zzcToTuring/eipJsTag@master/index.js"></script>
 * 使用：Z('util.string').toUpper('hello')  → "HELLO"
 * 校验：Z.secure({id:"xxx"})  → true/false
 * 列表：Z.list()  → ['util.string', 'util.date', ..., 'ui.affix']
 *
 * util.* — 纯逻辑工具（Node/浏览器通用）
 * ui.*   — 浏览器UI组件（依赖document）
 *
 * 安全校验配置在下方 "====== 安全校验配置 ======" 区域，修改该区域即可，其余代码不用动
 *
 * 本文件为框架骨架，模块代码由 build.js 从 packages/ 目录自动拼接注入。
 * 根目录 index.js 是构建产物，勿手动编辑。
 */
var Z = (function () {
    var _m = {};

    // ====== 安全校验配置（修改此区域即可，无需改动其他代码）======
    var _SECURE_ENABLED = false;                             // 改为 false 关闭校验
    var _SECURE_FAIL_VALUE = 'xxxx';                         // 校验失败时函数返回值，可改为 null、'' 等
    var _SECURE_ERROR_MSG = 'Z框架：请先执行 Z.secure({id:"xxx"})'; // 未调用 Z.secure() 时的报错信息

    function _check(opts) {
        // Node 环境（无 document）
        if (typeof document === 'undefined') {
            return opts.id === 'node_test';
        }

        // ============ 浏览器环境：在下方编写校验逻辑 ============
        // 示例1：从页面隐藏域读取值对比
        // var el = document.getElementById('z-token');
        // return el && el.value === opts.id;

        // 示例2：校验域名
        // return /company\.com$/.test(location.hostname);

        // 示例3：校验 EIP 用户
        // var user = document.getElementById('currentUserId');
        // return user && user.value.length > 0;

        // 默认：不通过（请替换为你的校验逻辑）
        return false;
    }
    // ====== 安全校验配置结束 ======

    var _secureCalled = false;
    var _securePassed = false;

    function _wrapFail(mod) {
        try {
            return new Proxy(mod, {
                get: function (target, prop) {
                    if (typeof target[prop] === 'function') {
                        return function () { return _SECURE_FAIL_VALUE; };
                    }
                    return target[prop];
                }
            });
        } catch (e) {
            var wrapped = {};
            for (var k in mod) {
                if (typeof mod[k] === 'function') {
                    wrapped[k] = (function () { return function () { return _SECURE_FAIL_VALUE; }; })();
                } else {
                    wrapped[k] = mod[k];
                }
            }
            return wrapped;
        }
    }

    function define(name, factory) {
        _m[name] = typeof factory === 'function' ? factory() : factory;
    }

    function Z(name) {
        if (_SECURE_ENABLED) {
            if (!_secureCalled) throw new Error(_SECURE_ERROR_MSG);
            if (!_securePassed) return _wrapFail(_m[name] || {});
        }
        return _m[name] || null;
    }

    Z.secure = function (opts) {
        if (!_SECURE_ENABLED) return true;
        _secureCalled = true;
        _securePassed = _check(opts || {}) === true;
        return _securePassed;
    };

    Z.list = function () {
        if (_SECURE_ENABLED && !_secureCalled) throw new Error(_SECURE_ERROR_MSG);
        return Object.keys(_m);
    };


    // ==================== util.string ====================
    define('util.string', function () {
        function trim(s) { return s == null ? '' : String(s).replace(/^\s+|\s+$/g, ''); }
        function trimLeft(s) { return s == null ? '' : String(s).replace(/^\s+/, ''); }
        function trimRight(s) { return s == null ? '' : String(s).replace(/\s+$/, ''); }
        function removeAllSpace(s) { return s == null ? '' : String(s).replace(/\s+/g, ''); }
        function trimAll(s) { return removeAllSpace(s); }
        function capitalize(s) {
            if (s == null) return '';
            s = String(s);
            return s.charAt(0).toUpperCase() + s.slice(1);
        }
        function capitalizeWords(s) {
            if (s == null) return '';
            return String(s).replace(/\b([a-z])/g, function (m, c) { return c.toUpperCase(); });
        }
        function uncapitalize(s) {
            if (s == null) return '';
            s = String(s);
            return s.charAt(0).toLowerCase() + s.slice(1);
        }
        function toCamel(s) {
            if (s == null) return '';
            return String(s).replace(/[-_\s]+(.)?/g, function (m, c) { return c ? c.toUpperCase() : ''; });
        }
        function toUnderline(s) {
            if (s == null) return '';
            return String(s).replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
        }
        function toKebab(s) {
            if (s == null) return '';
            return String(s).replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
        }
        function snake2camel(s) {
            if (s == null) return '';
            return String(s).replace(/_+([a-zA-Z0-9])/g, function (m, c) { return c.toUpperCase(); });
        }
        function camel2snake(s) { return toUnderline(s); }
        function padStart(s, len, ch) {
            s = s == null ? '' : String(s);
            ch = ch == null ? ' ' : String(ch);
            while (s.length < len) s = ch + s;
            return s.length > len ? s.slice(s.length - len) : s;
        }
        function padEnd(s, len, ch) {
            s = s == null ? '' : String(s);
            ch = ch == null ? ' ' : String(ch);
            while (s.length < len) s = s + ch;
            return s.slice(0, len);
        }
        function repeat(s, n) {
            s = s == null ? '' : String(s);
            var r = '';
            for (var i = 0; i < n; i++) r += s;
            return r;
        }
        function startsWith(s, prefix) { return s != null && String(s).indexOf(prefix) === 0; }
        function endsWith(s, suffix) {
            if (s == null) return false;
            s = String(s); suffix = String(suffix);
            return s.length >= suffix.length && s.slice(s.length - suffix.length) === suffix;
        }
        function contains(s, sub) { return s != null && String(s).indexOf(sub) !== -1; }
        function escapeHtml(s) {
            if (s == null) return '';
            return String(s).replace(/[&<>"']/g, function (c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
            });
        }
        function unescapeHtml(s) {
            if (s == null) return '';
            return String(s).replace(/&(amp|lt|gt|quot|#39);/g, function (m, n) {
                return { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" }[n];
            });
        }
        function truncate(s, len, suffix) {
            if (s == null) return '';
            s = String(s); suffix = suffix == null ? '...' : suffix;
            return s.length > len ? s.slice(0, len) + suffix : s;
        }
        function reverse(s) {
            if (s == null) return '';
            return String(s).split('').reverse().join('');
        }
        function byteLength(s) {
            if (s == null) return 0;
            s = String(s);
            var n = 0;
            for (var i = 0; i < s.length; i++) n += s.charCodeAt(i) > 255 ? 2 : 1;
            return n;
        }
        function toCN(s) {
            if (s == null) return '';
            return String(s).replace(/[\uFF01-\uFF5E]/g, function (c) {
                return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
            }).replace(/\u3000/g, ' ');
        }

        // 生成随机十六进制颜色值，如 #a3f2c1
        function randomColor() {
            var hex = Math.floor(Math.random() * 0xFFFFFF).toString(16);
            return '#' + ('000000' + hex).slice(-6);
        }

        return {
            trim: trim, trimLeft: trimLeft, trimRight: trimRight,
            removeAllSpace: removeAllSpace, trimAll: trimAll,
            capitalize: capitalize, capitalizeWords: capitalizeWords, uncapitalize: uncapitalize,
            toCamel: toCamel, toUnderline: toUnderline, toKebab: toKebab,
            snake2camel: snake2camel, camel2snake: camel2snake,
            padStart: padStart, padEnd: padEnd, repeat: repeat,
            startsWith: startsWith, endsWith: endsWith, contains: contains,
            escapeHtml: escapeHtml, unescapeHtml: unescapeHtml,
            truncate: truncate, reverse: reverse, byteLength: byteLength, toCN: toCN,
            randomColor: randomColor
        };
    });


    // ==================== util.date ====================
    define('util.date', function () {
        function _dt(d) {
            if (d instanceof Date) return new Date(d.getTime());
            if (d == null) return new Date();
            if (typeof d === 'number') return new Date(d);
            if (typeof d === 'string') return new Date(d.replace(/-/g, '/'));
            return new Date(d);
        }
        function absFloor(n) { return n < 0 ? Math.ceil(n) || 0 : Math.floor(n); }
        function _unit(u) {
            if (!u) return 'ms';
            var map = {
                year: 'y', years: 'y', y: 'y',
                quarter: 'Q', quarters: 'Q', Q: 'Q',
                month: 'M', months: 'M', M: 'M',
                week: 'w', weeks: 'w', w: 'w',
                day: 'd', days: 'd', d: 'd',
                hour: 'h', hours: 'h', h: 'h',
                minute: 'm', minutes: 'm', m: 'm',
                second: 's', seconds: 's', s: 's',
                millisecond: 'ms', milliseconds: 'ms', ms: 'ms'
            };
            return map[u] || u;
        }
        function pad(n, w) { n = String(n); w = w || 2; while (n.length < w) n = '0' + n; return n; }
        function format(date, fmt) {
            var d = _dt(date);
            if (isNaN(d.getTime())) return '';
            fmt = fmt || 'YYYY-MM-DD HH:mm:ss';
            var Y = d.getFullYear(), M = d.getMonth() + 1, D = d.getDate();
            var H = d.getHours(), m = d.getMinutes(), s = d.getSeconds(), S = d.getMilliseconds();
            var Q = Math.floor((M - 1) / 3) + 1;
            return fmt
                .replace(/YYYY/g, Y)
                .replace(/YY/g, pad(Y % 100, 2))
                .replace(/MM/g, pad(M))
                .replace(/M/g, M)
                .replace(/DD/g, pad(D))
                .replace(/D/g, D)
                .replace(/HH/g, pad(H))
                .replace(/H/g, H)
                .replace(/mm/g, pad(m))
                .replace(/m/g, m)
                .replace(/ss/g, pad(s))
                .replace(/s/g, s)
                .replace(/SSS/g, pad(S, 3))
                .replace(/Q/g, Q);
        }
        function parse(str, fmt) {
            if (!str) return null;
            if (!fmt) { var d = _dt(str); return isNaN(d.getTime()) ? null : d; }
            var tokens = { YYYY: 0, MM: 1, DD: 2, HH: 3, mm: 4, ss: 5 };
            var idx = []; var re = '';
            fmt.replace(/(YYYY|MM|DD|HH|mm|ss)/g, function (m) { idx.push(tokens[m]); return m; });
            re = fmt.replace(/YYYY/, '(\d{4})').replace(/MM|DD|HH|mm|ss/g, '(\d{2})');
            var m2 = String(str).match(new RegExp('^' + re + '$'));
            if (!m2) return null;
            var p = [0, 0, 1, 0, 0, 0];
            for (var i = 0; i < idx.length; i++) p[idx[i]] = parseInt(m2[i + 1], 10);
            return new Date(p[0], p[1] - 1, p[2], p[3], p[4], p[5]);
        }
        function add(date, value, unit) {
            var d = _dt(date); var u = _unit(unit); value = Number(value) || 0;
            if (u === 'y') d.setFullYear(d.getFullYear() + value);
            else if (u === 'Q') d.setMonth(d.getMonth() + value * 3);
            else if (u === 'M') d.setMonth(d.getMonth() + value);
            else if (u === 'w') d.setDate(d.getDate() + value * 7);
            else if (u === 'd') d.setDate(d.getDate() + value);
            else if (u === 'h') d.setHours(d.getHours() + value);
            else if (u === 'm') d.setMinutes(d.getMinutes() + value);
            else if (u === 's') d.setSeconds(d.getSeconds() + value);
            else d.setMilliseconds(d.getMilliseconds() + value);
            return d;
        }
        function subtract(date, value, unit) { return add(date, -value, unit); }
        function _monthDiff(a, b) {
            var wholeMonth = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
            var anchor = new Date(a.getTime()); anchor.setMonth(anchor.getMonth() + wholeMonth);
            var anchor2IsBefore = b - anchor < 0;
            var prev = new Date(a.getFullYear(), a.getMonth() + (anchor2IsBefore ? -1 : 1), a.getDate(), a.getHours(), a.getMinutes(), a.getSeconds());
            var adjust = anchor2IsBefore ? (b - anchor) / (anchor - prev) : (b - anchor) / (prev - anchor);
            return -(wholeMonth + adjust) || 0;
        }
        function diff(d1, d2, unit, asFloat) {
            var a = _dt(d1), b = _dt(d2);
            var u = _unit(unit || 'ms');
            var ms = b - a;
            var v;
            if (u === 'y') v = -_monthDiff(a, b) / 12;
            else if (u === 'Q') v = -_monthDiff(a, b) / 3;
            else if (u === 'M') v = -_monthDiff(a, b);
            else if (u === 'w') v = ms / 6048e5;
            else if (u === 'd') v = ms / 864e5;
            else if (u === 'h') v = ms / 36e5;
            else if (u === 'm') v = ms / 6e4;
            else if (u === 's') v = ms / 1e3;
            else v = ms;
            return asFloat ? v : absFloor(v);
        }
        function startOf(date, unit) {
            var d = _dt(date), u = _unit(unit);
            if (u === 'y') { d.setMonth(0, 1); d.setHours(0, 0, 0, 0); }
            else if (u === 'Q') { var m = Math.floor(d.getMonth() / 3) * 3; d.setMonth(m, 1); d.setHours(0, 0, 0, 0); }
            else if (u === 'M') { d.setDate(1); d.setHours(0, 0, 0, 0); }
            else if (u === 'w') { var dow = d.getDay(); d.setDate(d.getDate() - dow); d.setHours(0, 0, 0, 0); }
            else if (u === 'd') d.setHours(0, 0, 0, 0);
            else if (u === 'h') d.setMinutes(0, 0, 0);
            else if (u === 'm') d.setSeconds(0, 0);
            else if (u === 's') d.setMilliseconds(0);
            return d;
        }
        function endOf(date, unit) {
            var d = _dt(date), u = _unit(unit);
            if (u === 'y') { d.setMonth(11, 31); d.setHours(23, 59, 59, 999); }
            else if (u === 'Q') { var m = Math.floor(d.getMonth() / 3) * 3 + 2; d.setMonth(m + 1, 0); d.setHours(23, 59, 59, 999); }
            else if (u === 'M') { d.setMonth(d.getMonth() + 1, 0); d.setHours(23, 59, 59, 999); }
            else if (u === 'w') { var dow = d.getDay(); d.setDate(d.getDate() + (6 - dow)); d.setHours(23, 59, 59, 999); }
            else if (u === 'd') d.setHours(23, 59, 59, 999);
            else if (u === 'h') d.setMinutes(59, 59, 999);
            else if (u === 'm') d.setSeconds(59, 999);
            else if (u === 's') d.setMilliseconds(999);
            return d;
        }
        function isAfter(d1, d2) { return _dt(d1).getTime() > _dt(d2).getTime(); }
        function isBefore(d1, d2) { return _dt(d1).getTime() < _dt(d2).getTime(); }
        function isSame(d1, d2, unit) {
            if (!unit) return _dt(d1).getTime() === _dt(d2).getTime();
            return startOf(d1, unit).getTime() === startOf(d2, unit).getTime();
        }
        function isBetween(d, start, end, inclusive) {
            var t = _dt(d).getTime(), a = _dt(start).getTime(), b = _dt(end).getTime();
            if (a > b) { var tmp = a; a = b; b = tmp; }
            return inclusive ? (t >= a && t <= b) : (t > a && t < b);
        }
        function isLeapYear(d) { var y = (typeof d === 'number' && d < 10000) ? d : _dt(d).getFullYear(); return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0); }
        function isToday(d) { return isSame(d, new Date(), 'd'); }
        function isYesterday(d) { return isSame(d, add(new Date(), -1, 'd'), 'd'); }
        function isTomorrow(d) { return isSame(d, add(new Date(), 1, 'd'), 'd'); }
        function isThisMonth(d) { return isSame(d, new Date(), 'M'); }
        function isThisYear(d) { return isSame(d, new Date(), 'y'); }
        function isWeekend(d) { var w = _dt(d).getDay(); return w === 0 || w === 6; }
        function get(date, unit) {
            var d = _dt(date), u = _unit(unit);
            if (u === 'y') return d.getFullYear();
            if (u === 'Q') return Math.floor(d.getMonth() / 3) + 1;
            if (u === 'M') return d.getMonth() + 1;
            if (u === 'd') return d.getDate();
            if (u === 'w') return d.getDay();
            if (u === 'h') return d.getHours();
            if (u === 'm') return d.getMinutes();
            if (u === 's') return d.getSeconds();
            if (u === 'ms') return d.getMilliseconds();
            return undefined;
        }
        function set(date, unit, value) {
            var d = _dt(date), u = _unit(unit); value = Number(value);
            if (u === 'y') d.setFullYear(value);
            else if (u === 'M') d.setMonth(value - 1);
            else if (u === 'd') d.setDate(value);
            else if (u === 'h') d.setHours(value);
            else if (u === 'm') d.setMinutes(value);
            else if (u === 's') d.setSeconds(value);
            else if (u === 'ms') d.setMilliseconds(value);
            return d;
        }
        function maxOf() {
            var arr = arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : Array.prototype.slice.call(arguments);
            if (!arr.length) return null;
            var best = _dt(arr[0]);
            for (var i = 1; i < arr.length; i++) { var t = _dt(arr[i]); if (t > best) best = t; }
            return best;
        }
        function minOf() {
            var arr = arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : Array.prototype.slice.call(arguments);
            if (!arr.length) return null;
            var best = _dt(arr[0]);
            for (var i = 1; i < arr.length; i++) { var t = _dt(arr[i]); if (t < best) best = t; }
            return best;
        }
        function toObject(date) {
            var d = _dt(date);
            return {
                years: d.getFullYear(), months: d.getMonth() + 1, date: d.getDate(),
                hours: d.getHours(), minutes: d.getMinutes(), seconds: d.getSeconds(), milliseconds: d.getMilliseconds()
            };
        }
        function toArray(date) {
            var d = _dt(date);
            return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()];
        }
        function getDaysInMonth(date) {
            var d = _dt(date);
            return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        }
        function getMonth(date) {
            var d = _dt(date);
            var first = new Date(d.getFullYear(), d.getMonth(), 1);
            var last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            return { first: first, last: last, days: last.getDate() };
        }
        function getWeek(date) {
            var d = _dt(date);
            var first = new Date(d.getTime()); first.setDate(d.getDate() - d.getDay()); first.setHours(0, 0, 0, 0);
            var last = new Date(first.getTime()); last.setDate(first.getDate() + 6); last.setHours(23, 59, 59, 999);
            return { first: first, last: last, dayOfWeek: d.getDay() };
        }
        function previewMonth(date) {
            var d = _dt(date);
            var first = new Date(d.getFullYear(), d.getMonth(), 1);
            var last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            var arr = [];
            for (var i = 0; i < first.getDay(); i++) arr.push(null);
            for (var j = 1; j <= last.getDate(); j++) arr.push(new Date(d.getFullYear(), d.getMonth(), j));
            return arr;
        }
        function previewWeek(date) {
            var d = _dt(date), arr = [];
            var first = new Date(d.getTime()); first.setDate(d.getDate() - d.getDay()); first.setHours(0, 0, 0, 0);
            for (var i = 0; i < 7; i++) {
                var t = new Date(first.getTime()); t.setDate(first.getDate() + i); arr.push(t);
            }
            return arr;
        }
        function relative(date, base) {
            var d = _dt(date), b = _dt(base || new Date());
            var ms = b - d, abs = Math.abs(ms), suffix = ms >= 0 ? '\u524d' : '\u540e';
            if (abs < 6e4) return '\u521a\u521a';
            if (abs < 36e5) return Math.floor(abs / 6e4) + '\u5206\u949f' + suffix;
            if (abs < 864e5) return Math.floor(abs / 36e5) + '\u5c0f\u65f6' + suffix;
            if (abs < 2592e6) return Math.floor(abs / 864e5) + '\u5929' + suffix;
            if (abs < 31536e6) return Math.floor(abs / 2592e6) + '\u6708' + suffix;
            return Math.floor(abs / 31536e6) + '\u5e74' + suffix;
        }
        function timestamp(date) { return _dt(date).getTime(); }
        function now() { return Date.now(); }
        return {
            format: format, parse: parse, add: add, subtract: subtract, diff: diff,
            startOf: startOf, endOf: endOf,
            isAfter: isAfter, isBefore: isBefore, isSame: isSame, isBetween: isBetween,
            isLeapYear: isLeapYear, isToday: isToday, isYesterday: isYesterday, isTomorrow: isTomorrow,
            isThisMonth: isThisMonth, isThisYear: isThisYear, isWeekend: isWeekend,
            get: get, set: set, maxOf: maxOf, minOf: minOf, toObject: toObject, toArray: toArray,
            getDaysInMonth: getDaysInMonth, getMonth: getMonth, getWeek: getWeek,
            previewMonth: previewMonth, previewWeek: previewWeek,
            relative: relative, timestamp: timestamp, now: now
        };
    });


    // ==================== util.array ====================
    define('util.array', function () {
        function unique(arr, key) {
            if (!Array.isArray(arr)) return [];
            var r = [], seen = key ? {} : null, set = key ? null : [];
            for (var i = 0; i < arr.length; i++) {
                var item = arr[i];
                if (key) {
                    var k = item && typeof item === 'object' ? item[key] : item;
                    var sk = String(k);
                    if (!seen[sk]) { seen[sk] = 1; r.push(item); }
                } else {
                    if (set.indexOf(item) === -1) { set.push(item); r.push(item); }
                }
            }
            return r;
        }
        function flatten(arr, depth) {
            if (!Array.isArray(arr)) return [];
            if (depth === undefined) depth = Infinity;
            var r = [];
            (function f(a, d) {
                for (var i = 0; i < a.length; i++) {
                    if (Array.isArray(a[i]) && d > 0) f(a[i], d - 1);
                    else r.push(a[i]);
                }
            })(arr, depth);
            return r;
        }
        function chunk(arr, size) {
            if (!Array.isArray(arr) || size <= 0) return [];
            var r = [];
            for (var i = 0; i < arr.length; i += size) r.push(arr.slice(i, i + size));
            return r;
        }
        function shuffle(arr) {
            if (!Array.isArray(arr)) return [];
            var a = arr.slice();
            for (var i = a.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var t = a[i]; a[i] = a[j]; a[j] = t;
            }
            return a;
        }
        function sample(arr, n) {
            if (!Array.isArray(arr) || arr.length === 0) return n ? [] : undefined;
            if (n == null) return arr[Math.floor(Math.random() * arr.length)];
            return shuffle(arr).slice(0, n);
        }
        function groupBy(arr, key) {
            var r = {};
            if (!Array.isArray(arr)) return r;
            var fn = typeof key === 'function' ? key : function (x) { return x && typeof x === 'object' ? x[key] : x; };
            for (var i = 0; i < arr.length; i++) {
                var k = fn(arr[i]);
                (r[k] = r[k] || []).push(arr[i]);
            }
            return r;
        }
        function sortBy(arr, key, desc) {
            if (!Array.isArray(arr)) return [];
            var fn = typeof key === 'function' ? key : function (x) { return x && typeof x === 'object' ? x[key] : x; };
            var a = arr.slice();
            a.sort(function (x, y) {
                var vx = fn(x), vy = fn(y);
                if (vx < vy) return desc ? 1 : -1;
                if (vx > vy) return desc ? -1 : 1;
                return 0;
            });
            return a;
        }
        function sum(arr, key) {
            if (!Array.isArray(arr)) return 0;
            var s = 0;
            for (var i = 0; i < arr.length; i++) {
                var v = key ? (arr[i] && arr[i][key]) : arr[i];
                v = Number(v); if (!isNaN(v)) s += v;
            }
            return s;
        }
        function avg(arr, key) {
            if (!Array.isArray(arr) || arr.length === 0) return 0;
            return sum(arr, key) / arr.length;
        }
        function max(arr, key) {
            if (!Array.isArray(arr) || arr.length === 0) return undefined;
            var fn = key ? function (x) { return x && typeof x === 'object' ? x[key] : x; } : function (x) { return x; };
            var best = arr[0], bv = fn(best);
            for (var i = 1; i < arr.length; i++) { var v = fn(arr[i]); if (v > bv) { bv = v; best = arr[i]; } }
            return best;
        }
        function min(arr, key) {
            if (!Array.isArray(arr) || arr.length === 0) return undefined;
            var fn = key ? function (x) { return x && typeof x === 'object' ? x[key] : x; } : function (x) { return x; };
            var best = arr[0], bv = fn(best);
            for (var i = 1; i < arr.length; i++) { var v = fn(arr[i]); if (v < bv) { bv = v; best = arr[i]; } }
            return best;
        }
        function range(start, stop, step) {
            if (stop === undefined) { stop = start; start = 0; }
            step = step || 1;
            var r = [];
            if (step > 0) for (var i = start; i < stop; i += step) r.push(i);
            else for (var j = start; j > stop; j += step) r.push(j);
            return r;
        }
        function fill(len, val) {
            var r = [];
            for (var i = 0; i < len; i++) r.push(typeof val === 'function' ? val(i) : val);
            return r;
        }
        function _keyOf(item, key) { return item && typeof item === 'object' && key ? item[key] : item; }
        function union(a, b, key) {
            a = Array.isArray(a) ? a : []; b = Array.isArray(b) ? b : [];
            return unique(a.concat(b), key);
        }
        function intersect(a, b, key) {
            a = Array.isArray(a) ? a : []; b = Array.isArray(b) ? b : [];
            var bs = {}; for (var i = 0; i < b.length; i++) bs[String(_keyOf(b[i], key))] = 1;
            var r = [], seen = {};
            for (var j = 0; j < a.length; j++) {
                var k = String(_keyOf(a[j], key));
                if (bs[k] && !seen[k]) { seen[k] = 1; r.push(a[j]); }
            }
            return r;
        }
        function diff(a, b, key) {
            a = Array.isArray(a) ? a : []; b = Array.isArray(b) ? b : [];
            var as = {}, bs = {};
            for (var i = 0; i < a.length; i++) as[String(_keyOf(a[i], key))] = a[i];
            for (var j = 0; j < b.length; j++) bs[String(_keyOf(b[j], key))] = b[j];
            var r = [];
            for (var ka in as) if (!bs[ka]) r.push(as[ka]);
            for (var kb in bs) if (!as[kb]) r.push(bs[kb]);
            return r;
        }
        function toObject(arr) {
            var r = {};
            if (!Array.isArray(arr)) return r;
            for (var i = 0; i < arr.length; i++) r[i] = arr[i];
            return r;
        }
        function rebuild(arr, k1, k2) {
            var r = {};
            if (!Array.isArray(arr)) return r;
            for (var i = 0; i < arr.length; i++) {
                var item = arr[i];
                if (!item || typeof item !== 'object') continue;
                var key = item[k1];
                r[key] = k2 === undefined ? item : item[k2];
            }
            return r;
        }
        function pickFields(arr, keys) {
            if (!Array.isArray(arr)) return [];
            keys = Array.isArray(keys) ? keys : [keys];
            var r = [];
            for (var i = 0; i < arr.length; i++) {
                var item = arr[i] || {}, o = {};
                for (var j = 0; j < keys.length; j++) o[keys[j]] = item[keys[j]];
                r.push(o);
            }
            return r;
        }

        // 统计数组中满足条件的元素个数
        function arrCount(arr, k, v) {
            if (!Array.isArray(arr)) return 0;
            return arr.reduce(function (count, item) {
                return count + ((v !== undefined ? item[k] === v : item === k) ? 1 : 0);
            }, 0);
        }

        // 交换数组中两个位置的元素
        function exchangePosition(arr, oldIndex, newIndex, isChangeOldArr) {
            if (!Array.isArray(arr)) return [];
            var a = isChangeOldArr ? arr : JSON.parse(JSON.stringify(arr));
            var tmp = a[oldIndex]; a[oldIndex] = a[newIndex]; a[newIndex] = tmp;
            return a;
        }

        // 将数组中某元素移动到指定位置（插入式，非交换）
        function insetPosition(arr, oldIndex, newIndex, isChangeOldArr) {
            if (!Array.isArray(arr)) return [];
            var a = isChangeOldArr ? arr : JSON.parse(JSON.stringify(arr));
            a.splice(newIndex, 0, a.splice(oldIndex, 1)[0]);
            return a;
        }

        // 返回数组中满足条件的所有元素下标列表
        function indexOfArr(arr, k, v) {
            if (!Array.isArray(arr)) return [];
            return arr.reduce(function (idxList, item, i) {
                if (v !== undefined ? item[k] === v : item === k) idxList.push(i);
                return idxList;
            }, []);
        }

        // 从数组删除满足条件的元素
        function del(arr, condition, isChangeOldArr) {
            if (!Array.isArray(arr)) return [];
            var a = isChangeOldArr ? arr : JSON.parse(JSON.stringify(arr));
            for (var i = a.length - 1; i >= 0; i--) {
                var item = a[i]; var shouldDel = false;
                if (typeof condition === 'function') { shouldDel = condition(item); }
                else if (Array.isArray(condition)) { shouldDel = condition.indexOf(item) > -1; }
                else if (condition !== null && typeof condition === 'object') {
                    for (var kk in condition) {
                        if (!Object.prototype.hasOwnProperty.call(condition, kk)) continue;
                        var cv = condition[kk];
                        shouldDel = Array.isArray(cv) ? cv.indexOf(item[kk]) > -1 : item[kk] === cv;
                        if (shouldDel) break;
                    }
                } else { shouldDel = item === condition; }
                if (shouldDel) a.splice(i, 1);
            }
            return a;
        }

        return {
            unique: unique, flatten: flatten, chunk: chunk, shuffle: shuffle, sample: sample,
            groupBy: groupBy, sortBy: sortBy, sum: sum, avg: avg, max: max, min: min,
            range: range, fill: fill, union: union, intersect: intersect, diff: diff,
            toObject: toObject, rebuild: rebuild, pickFields: pickFields,
            arrCount: arrCount, exchangePosition: exchangePosition, insetPosition: insetPosition,
            indexOfArr: indexOfArr, del: del
        };
    });


    // ==================== util.object ====================
    define('util.object', function () {
        var _toStr = Object.prototype.toString;
        function _type(v) { return _toStr.call(v).slice(8, -1); }

        function pick(obj, keys) {
            if (!obj || typeof obj !== 'object') return {};
            keys = Array.isArray(keys) ? keys : [keys];
            var r = {};
            for (var i = 0; i < keys.length; i++) {
                if (Object.prototype.hasOwnProperty.call(obj, keys[i])) r[keys[i]] = obj[keys[i]];
            }
            return r;
        }
        function omit(obj, keys) {
            if (!obj || typeof obj !== 'object') return {};
            keys = Array.isArray(keys) ? keys : [keys];
            var r = {};
            for (var k in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, k) && keys.indexOf(k) === -1) r[k] = obj[k];
            }
            return r;
        }
        function merge() {
            var r = {};
            for (var i = 0; i < arguments.length; i++) {
                var s = arguments[i];
                if (s && typeof s === 'object') {
                    for (var k in s) if (Object.prototype.hasOwnProperty.call(s, k)) r[k] = s[k];
                }
            }
            return r;
        }
        function deepClone(v) {
            if (v === null || typeof v !== 'object') return v;
            var t = _type(v);
            if (t === 'Date') return new Date(v.getTime());
            if (t === 'RegExp') return new RegExp(v.source, v.flags);
            if (t === 'Array') {
                var arr = [];
                for (var i = 0; i < v.length; i++) arr[i] = deepClone(v[i]);
                return arr;
            }
            if (t === 'Object') {
                var o = {};
                for (var k in v) if (Object.prototype.hasOwnProperty.call(v, k)) o[k] = deepClone(v[k]);
                return o;
            }
            return v;
        }
        function deepMerge() {
            var r = {};
            for (var i = 0; i < arguments.length; i++) {
                var s = arguments[i];
                if (!s || typeof s !== 'object') continue;
                for (var k in s) {
                    if (!Object.prototype.hasOwnProperty.call(s, k)) continue;
                    var sv = s[k];
                    if (sv && typeof sv === 'object' && _type(sv) === 'Object'
                        && r[k] && typeof r[k] === 'object' && _type(r[k]) === 'Object') {
                        r[k] = deepMerge(r[k], sv);
                    } else {
                        r[k] = deepClone(sv);
                    }
                }
            }
            return r;
        }
        function isEmpty(v) {
            if (v == null) return true;
            if (typeof v === 'string' || Array.isArray(v)) return v.length === 0;
            if (typeof v === 'object') { for (var k in v) if (Object.prototype.hasOwnProperty.call(v, k)) return false; return true; }
            return false;
        }
        function isEqual(a, b) { return a === b; }
        function isEquals(a, b) {
            if (a === b) return true;
            if (a == null || b == null) return a === b;
            var ta = _type(a), tb = _type(b);
            if (ta !== tb) return false;
            if (ta === 'Date') return a.getTime() === b.getTime();
            if (ta === 'RegExp') return a.toString() === b.toString();
            if (ta === 'Array') {
                if (a.length !== b.length) return false;
                for (var i = 0; i < a.length; i++) if (!isEquals(a[i], b[i])) return false;
                return true;
            }
            if (ta === 'Object') {
                var ka = Object.keys(a), kb = Object.keys(b);
                if (ka.length !== kb.length) return false;
                for (var j = 0; j < ka.length; j++) {
                    if (!Object.prototype.hasOwnProperty.call(b, ka[j])) return false;
                    if (!isEquals(a[ka[j]], b[ka[j]])) return false;
                }
                return true;
            }
            return a === b;
        }
        function hasValue(obj, key) {
            if (!obj || typeof obj !== 'object') return false;
            return Object.prototype.hasOwnProperty.call(obj, key) && obj[key] != null && obj[key] !== '';
        }
        function keys(obj) { return obj && typeof obj === 'object' ? Object.keys(obj) : []; }
        function values(obj) {
            if (!obj || typeof obj !== 'object') return [];
            var r = []; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) r.push(obj[k]); return r;
        }
        function forEach(obj, fn) {
            if (!obj || typeof obj !== 'object') return;
            for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) fn(obj[k], k, obj);
        }
        function filter(obj, fn) {
            var r = {};
            if (!obj || typeof obj !== 'object') return r;
            for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && fn(obj[k], k, obj)) r[k] = obj[k];
            return r;
        }
        function map(obj, fn) {
            var r = {};
            if (!obj || typeof obj !== 'object') return r;
            for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) r[k] = fn(obj[k], k, obj);
            return r;
        }
        function toQueryString(obj) {
            if (!obj || typeof obj !== 'object') return '';
            var r = [];
            for (var k in obj) {
                if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
                var v = obj[k];
                if (v == null) continue;
                r.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
            }
            return r.join('&');
        }
        function getNested(obj, path, def) {
            if (!obj || typeof obj !== 'object' || !path) return def;
            var parts = String(path).split('.'), cur = obj;
            for (var i = 0; i < parts.length; i++) {
                if (cur == null) return def;
                cur = cur[parts[i]];
            }
            return cur === undefined ? def : cur;
        }
        function renameKey(obj, oldKey, newKey, isDeep) {
            if (!obj || typeof obj !== 'object') return obj;
            if (Array.isArray(obj)) {
                var arr = [];
                for (var i = 0; i < obj.length; i++) arr.push(isDeep ? renameKey(obj[i], oldKey, newKey, isDeep) : obj[i]);
                // when deep-cloning array, also rename keys at this level for object items handled above
                return arr;
            }
            var r = {};
            for (var k in obj) {
                if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
                var nk = (k === oldKey) ? newKey : k;
                var v = obj[k];
                if (isDeep && v && typeof v === 'object') v = renameKey(v, oldKey, newKey, isDeep);
                r[nk] = v;
            }
            return r;
        }
        function findKeyByValue(obj, val) {
            if (!obj || typeof obj !== 'object') return undefined;
            for (var k in obj) {
                if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
                if (isEquals(obj[k], val)) return k;
            }
            return undefined;
        }

        return {
            pick: pick, omit: omit, merge: merge, deepMerge: deepMerge,
            deepClone: deepClone, isEmpty: isEmpty, isEqual: isEqual, isEquals: isEquals,
            hasValue: hasValue, keys: keys, values: values,
            forEach: forEach, filter: filter, map: map,
            toQueryString: toQueryString, getNested: getNested,
            renameKey: renameKey, findKeyByValue: findKeyByValue
        };
    });


    // ==================== util.number ====================
    define('util.number', function () {

        var chineseNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        var chineseUnits = ['', '十', '百', '千'];
        var chineseBigUnits = ['', '万', '亿'];

        return {

            // ==================== 格式化 ====================

            // 千分位格式化：1234567.89 → "1,234,567.89"
            formatMoney: function (num, decimals) {
                num = Number(num);
                if (isNaN(num)) return '0';
                if (decimals !== undefined) num = num.toFixed(decimals);
                var parts = String(num).split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                return parts.join('.');
            },

            // 保留小数位（返回数字）
            toFixed: function (num, decimals) {
                return Number(Number(num).toFixed(decimals || 0));
            },

            // 百分比：0.1234 → "12.34%"
            toPercent: function (num, decimals) {
                return (Number(num) * 100).toFixed(decimals || 2) + '%';
            },

            // ==================== 判断 ====================

            isNumber: function (val) { return typeof val === 'number' && !isNaN(val); },

            isInteger: function (val) { return Number.isInteger(val); },

            isPositive: function (val) { return Number(val) > 0; },

            // 是否在范围内
            inRange: function (val, min, max) { return Number(val) >= min && Number(val) <= max; },

            // ==================== 运算 ====================

            // 安全加法（避免浮点误差）
            add: function (a, b) {
                var r1, r2;
                try { r1 = String(a).split('.')[1].length; } catch (e) { r1 = 0; }
                try { r2 = String(b).split('.')[1].length; } catch (e) { r2 = 0; }
                var m = Math.pow(10, Math.max(r1, r2));
                return (a * m + b * m) / m;
            },

            // 安全减法
            sub: function (a, b) { return this.add(a, -b); },

            // 安全乘法
            mul: function (a, b) {
                var m = 0;
                try { m += String(a).split('.')[1].length; } catch (e) {}
                try { m += String(b).split('.')[1].length; } catch (e) {}
                return Number(String(a).replace('.', '')) * Number(String(b).replace('.', '')) / Math.pow(10, m);
            },

            // 安全除法
            div: function (a, b) {
                var t1 = 0, t2 = 0;
                try { t1 = String(a).split('.')[1].length; } catch (e) {}
                try { t2 = String(b).split('.')[1].length; } catch (e) {}
                var n1 = Number(String(a).replace('.', ''));
                var n2 = Number(String(b).replace('.', ''));
                return this.mul(n1 / n2, Math.pow(10, t2 - t1));
            },

            // ==================== 随机 ====================

            // 随机整数 [min, max]
            random: function (min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            },

            // ==================== 转换 ====================

            // 数字转中文：12345 → "一万二千三百四十五"
            toChinese: function (num) {
                if (num === 0) return chineseNums[0];
                if (num < 0) return '负' + this.toChinese(-num);
                var result = '';
                var str = String(Math.floor(num));
                var len = str.length;
                for (var i = 0; i < len; i++) {
                    var n = parseInt(str[i]);
                    var pos = len - 1 - i;
                    var unitPos = pos % 4;
                    var bigUnitPos = Math.floor(pos / 4);
                    if (n !== 0) {
                        result += chineseNums[n] + chineseUnits[unitPos];
                    } else {
                        if (result[result.length - 1] !== chineseNums[0]) result += chineseNums[0];
                    }
                    if (unitPos === 0 && bigUnitPos > 0) {
                        result = result.replace(new RegExp(chineseNums[0] + '+$'), '');
                        result += chineseBigUnits[bigUnitPos];
                    }
                }
                result = result.replace(new RegExp(chineseNums[0] + '+$'), '');
                return result;
            },

            // 数字转金额大写：1234.56 → "壹仟贰佰叁拾肆元伍角陆分"
            toChineseMoney: function (num) {
                var cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
                var cnIntRadice = ['', '拾', '佰', '仟'];
                var cnIntUnits = ['', '万', '亿'];
                var cnDecUnits = ['角', '分'];
                var cnInteger = '整';
                var cnIntLast = '元';
                num = Number(num);
                if (isNaN(num)) return '';
                if (num === 0) return cnNums[0] + cnIntLast + cnInteger;
                var integerNum = Math.floor(num);
                var decimalNum = Math.round((num - integerNum) * 100);
                var result = '';
                if (integerNum > 0) {
                    var zeroCount = 0;
                    var intStr = String(integerNum);
                    for (var i = 0; i < intStr.length; i++) {
                        var n = parseInt(intStr[i]);
                        var p = intStr.length - 1 - i;
                        var q = p % 4;
                        if (n === 0) { zeroCount++; } else {
                            if (zeroCount > 0) result += cnNums[0];
                            zeroCount = 0;
                            result += cnNums[n] + cnIntRadice[q];
                        }
                        if (q === 0 && zeroCount < 4) result += cnIntUnits[Math.floor(p / 4)];
                    }
                    result += cnIntLast;
                }
                if (decimalNum > 0) {
                    for (var j = 0; j < 2; j++) {
                        var d = Math.floor(decimalNum / Math.pow(10, 1 - j)) % 10;
                        if (d !== 0) result += cnNums[d] + cnDecUnits[j];
                    }
                } else {
                    result += cnInteger;
                }
                return result;
            },

            // ==================== 夹值 ====================

            // 限制在 [min, max] 范围内
            clamp: function (val, min, max) {
                return Math.min(Math.max(Number(val), min), max);
            }
        };
    });


    // ==================== util.type ====================
    define('util.type', function () {
        return {

            // ==================== 基础类型判断 ====================

            isString: function (val) { return typeof val === 'string'; },
            isNumber: function (val) { return typeof val === 'number' && !isNaN(val); },
            isBoolean: function (val) { return typeof val === 'boolean'; },
            isFunction: function (val) { return typeof val === 'function'; },
            isObject: function (val) { return val !== null && typeof val === 'object' && !Array.isArray(val); },
            isArray: function (val) { return Array.isArray(val); },
            isDate: function (val) { return val instanceof Date; },
            isRegExp: function (val) { return val instanceof RegExp; },
            isNull: function (val) { return val === null; },
            isUndefined: function (val) { return val === undefined; },
            isNil: function (val) { return val === null || val === undefined; },

            // ==================== 获取类型 ====================

            // 获取精确类型：null → "null", [] → "array", /\d/ → "regexp"
            getType: function (val) {
                if (val === null) return 'null';
                if (Array.isArray(val)) return 'array';
                return typeof val;
            },

            // ==================== 空值判断 ====================

            // 是否为空值（null、undefined、空字符串、空数组、空对象）
            isEmptyValue: function (val) {
                if (val === null || val === undefined) return true;
                if (typeof val === 'string' && val.trim() === '') return true;
                if (Array.isArray(val) && val.length === 0) return true;
                if (typeof val === 'object' && Object.keys(val).length === 0) return true;
                return false;
            },

            // 是否为非空值
            isNotEmptyValue: function (val) { return !this.isEmptyValue(val); },

            // ==================== 常用校验 ====================

            // 是否手机号
            isPhone: function (val) { return /^1[3-9]\d{9}$/.test(String(val)); },

            // 是否邮箱
            isEmail: function (val) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val)); },

            // 是否身份证号（简单校验）
            isIdCard: function (val) { return /^\d{17}[\dXx]$/.test(String(val)); },

            // 是否URL
            isUrl: function (val) { return /^https?:\/\/.+/.test(String(val)); },

            // 是否中文
            isChinese: function (val) { return /^[\u4e00-\u9fa5]+$/.test(String(val)); },

            // 是否纯数字字符串
            isNumeric: function (val) { return /^\d+$/.test(String(val)); },

            // 是否纯字母
            isAlpha: function (val) { return /^[a-zA-Z]+$/.test(String(val)); },

            // 是否字母+数字
            isAlphaNum: function (val) { return /^[a-zA-Z0-9]+$/.test(String(val)); },

            // ==================== 车牌号校验 ====================
            // 普通非新能源车牌（如 京A12345）
            isLicensePlateNER: function (val) {
                return /^[京沪津渝黑吉辽蒙冀新甘青陕宁豫鲁晋闽粤桂湘鄂赣州杞皖苏浙][A-Z][A-Z0-9]{5}$/.test(String(val));
            },

            // 新能源车牌（如 沪B1234D）
            isLicensePlateNNER: function (val) {
                return /^[京沪津渝黑吉辽蒙冀新甘青陕宁豫鲁晋闽粤桂湘鄂赣州杞皖苏浙][A-Z]([A-Z0-9]{4}[DF]|[DF][A-Z0-9]{4})$/.test(String(val));
            },

            // 车牌号通用校验（含新能源）
            isLicensePlate: function (val) {
                return this.isLicensePlateNER(val) || this.isLicensePlateNNER(val);
            },

            // ==================== 密码强度校验 ====================
            // 强密码：大小写字母+数字+特殊字符，至少8位
            isStrongPassword: function (val) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/.test(String(val));
            },

            // 中等密码：至少8位且包含3种及以上字符类型（大/小写字母、数字、特殊字符）
            isMediumPassword: function (val) {
                val = String(val);
                if (val.length < 8) return false;
                var types = 0;
                if (/[a-z]/.test(val)) types++;
                if (/[A-Z]/.test(val)) types++;
                if (/[0-9]/.test(val)) types++;
                if (/[^A-Za-z0-9]/.test(val)) types++;
                return types >= 3;
            },

            // ==================== 姓名校验 ====================
            // 中文姓名（2-20位汉字，支持中间点·）
            isChineseName: function (val) {
                return /^[一-龥·]{2,20}$/.test(String(val));
            },

            // 英文姓名（字母开头，支持空格、点、连字符、撇号）
            isEnglishName: function (val) {
                return /^[A-Za-z][A-Za-z .'-]{1,49}$/.test(String(val));
            }
        };
    });


    // ==================== util.id ====================
    define("util.id", function () {

        // ==================== 内部工具 ====================

        // 获取密码学安全随机字节
        function getRandomBytes(n) {
            if (typeof crypto !== "undefined" && crypto.getRandomValues) {
                return crypto.getRandomValues(new Uint8Array(n));
            }
            // 降级：Math.random（不推荐，但兼容无 crypto 环境）
            var bytes = new Uint8Array(n);
            for (var i = 0; i < n; i++) bytes[i] = Math.floor(Math.random() * 256);
            return bytes;
        }

        // 字节数组转十六进制字符串
        function bytesToHex(bytes) {
            var hex = "";
            for (var i = 0; i < bytes.length; i++) {
                hex += (bytes[i] >>> 4).toString(16) + (bytes[i] & 0x0f).toString(16);
            }
            return hex;
        }

        // ==================== 雪花ID 内部状态 ====================

        var _epoch = 1700000000000; // 自定义纪元：2023-11-14
        var _sequence = 0;
        var _lastTs = -1;
        var _workerId = getRandomBytes(2);
        var _workerIdNum = (_workerId[0] << 8 | _workerId[1]) & 0x3FF; // 10位 worker

        // 大数字符串加法
        function bigAdd(a, b) {
            a = String(a); b = String(b);
            var maxLen = Math.max(a.length, b.length);
            a = a.padStart(maxLen, "0"); b = b.padStart(maxLen, "0");
            var carry = 0, result = "";
            for (var i = maxLen - 1; i >= 0; i--) {
                var sum = parseInt(a[i]) + parseInt(b[i]) + carry;
                carry = Math.floor(sum / 10);
                result = (sum % 10) + result;
            }
            if (carry) result = carry + result;
            return result;
        }

        // 大数字符串乘法（数字串 × 小整数）
        function bigMul(a, b) {
            a = String(a);
            var carry = 0, result = "";
            for (var i = a.length - 1; i >= 0; i--) {
                var prod = parseInt(a[i]) * b + carry;
                carry = Math.floor(prod / 10);
                result = (prod % 10) + result;
            }
            while (carry > 0) { result = (carry % 10) + result; carry = Math.floor(carry / 10); }
            return result;
        }

        // 雪花ID拼接（使用字符串大数运算避免精度丢失）
        function buildSnowflake(ts, workerId, seq) {
            // id = ts * 2^22 + workerId * 2^12 + seq
            var tsStr = String(ts);
            // ts * 4194304 (2^22)
            var part1 = bigMul(tsStr, 4194304);
            // workerId * 4096 (2^12)
            var part2 = String(workerId * 4096);
            // 相加
            var result = bigAdd(part1, part2);
            result = bigAdd(result, String(seq));
            return result;
        }

        return {

            // ==================== hex32 ====================

            /**
             * 生成32位十六进制唯一ID（128bit crypto随机）
             * 碰撞概率：生成10亿个ID后碰撞概率约 10^-20（可视为不可能）
             */
            hex32: function () {
                return bytesToHex(getRandomBytes(16));
            },

            // ==================== UUID v4 ====================

            /**
             * 生成标准 UUID v4
             * 格式：xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
             */
            uuid: function () {
                var bytes = getRandomBytes(16);
                // 设置版本位（第7字节高4位 = 0100）
                bytes[6] = (bytes[6] & 0x0f) | 0x40;
                // 设置变体位（第9字节高2位 = 10）
                bytes[8] = (bytes[8] & 0x3f) | 0x80;
                var h = bytesToHex(bytes);
                return h.substring(0, 8) + "-" + h.substring(8, 12) + "-" + h.substring(12, 16) + "-" + h.substring(16, 20) + "-" + h.substring(20, 32);
            },

            // ==================== nanoid ====================

            /**
             * 生成 URL 安全的短ID
             * 字符集：A-Za-z0-9_-（64个字符）
             * 默认21位，碰撞概率与 UUID v4 相当
             */
            nanoid: function (size) {
                size = size || 21;
                var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
                var bytes = getRandomBytes(size);
                var id = "";
                for (var i = 0; i < size; i++) {
                    id += alphabet[bytes[i] & 63];
                }
                return id;
            },

            // ==================== snowflake ====================

            /**
             * 雪花ID（字符串形式，递增有序）
             * 结构：41位时间戳差值 + 10位随机workerId + 12位序列号
             * 单页面每毫秒可生成4096个不重复ID
             * 返回数字字符串（超出 Number.MAX_SAFE_INTEGER，用字符串保证精度）
             */
            snowflake: function () {
                var ts = Date.now() - _epoch;
                if (ts === _lastTs) {
                    _sequence = (_sequence + 1) & 0xFFF;
                    if (_sequence === 0) {
                        while (Date.now() - _epoch === _lastTs) {}
                        ts = Date.now() - _epoch;
                    }
                } else {
                    _sequence = 0;
                }
                _lastTs = ts;
                return buildSnowflake(ts, _workerIdNum, _sequence);
            }
        };
    });


    // ==================== http.request ====================
    define('http.request', function () {
        var _isBrowser = typeof window !== 'undefined';
        if (!_isBrowser) return {};


        function ajax(method, url, data, opts) {
            opts = opts || {};
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open(method, url, true);
                xhr.timeout = opts.timeout || 30000;

                // 设置请求头
                if (opts.headers) { for (var k in opts.headers) xhr.setRequestHeader(k, opts.headers[k]); }
                if (opts.contentType) xhr.setRequestHeader('Content-Type', opts.contentType);
                else if (method === 'POST' && !opts.headers) xhr.setRequestHeader('Content-Type', 'application/json');

                // 带凭证（Cookie）
                if (opts.withCredentials) xhr.withCredentials = true;

                xhr.onload = function () {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        var r = xhr.responseText;
                        if (opts.dataType === 'json') { try { r = JSON.parse(r); } catch (e) {} }
                        resolve(r);
                    } else {
                        reject(new Error('HTTP ' + xhr.status + ': ' + xhr.statusText));
                    }
                };
                xhr.onerror = function () { reject(new Error('请求失败: ' + url)); };
                xhr.ontimeout = function () { reject(new Error('请求超时: ' + url)); };

                // 处理请求体
                var body = data;
                if (data && typeof data === 'object' && method !== 'GET') {
                    var ct = opts.contentType || 'application/json';
                    body = ct.indexOf('json') > -1 ? JSON.stringify(data) : Object.keys(data).map(function (k) {
                        return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
                    }).join('&');
                }

                xhr.send(body || null);
            });
        }

        return {
            // GET 请求
            get: function (url, opts) { return ajax('GET', url, null, opts); },

            // POST 请求
            post: function (url, data, opts) { return ajax('POST', url, data, opts); },

            // PUT 请求
            put: function (url, data, opts) { return ajax('PUT', url, data, opts); },

            // DELETE 请求
            del: function (url, opts) { return ajax('DELETE', url, null, opts); },

            // GET 并解析 JSON
            getJSON: function (url, opts) { return ajax('GET', url, null, Object.assign({}, opts, { dataType: 'json' })); },

            // POST JSON
            postJSON: function (url, data, opts) { return ajax('POST', url, data, Object.assign({}, opts, { dataType: 'json', contentType: 'application/json' })); },

            // POST 表单（application/x-www-form-urlencoded）
            postForm: function (url, data, opts) { return ajax('POST', url, data, Object.assign({}, opts, { contentType: 'application/x-www-form-urlencoded' })); },

            // 并发请求
            all: function (promises) { return Promise.all(promises); },

            // 文件下载
            download: function (url, filename) {
                var a = document.createElement('a');
                a.href = url;
                a.download = filename || '';
                a.click();
            },

            // 上传文件（简单版）
            upload: function (url, file, opts) {
                opts = opts || {};
                return new Promise(function (resolve, reject) {
                    var fd = new FormData();
                    fd.append(opts.fieldName || 'file', file);
                    // 附加额外参数
                    if (opts.params) {
                        for (var k in opts.params) fd.append(k, opts.params[k]);
                    }
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', url, true);
                    if (opts.headers) { for (var h in opts.headers) xhr.setRequestHeader(h, opts.headers[h]); }
                    xhr.onload = function () {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            var r = xhr.responseText;
                            try { r = JSON.parse(r); } catch (e) {}
                            resolve(r);
                        } else { reject(new Error('上传失败: HTTP ' + xhr.status)); }
                    };
                    xhr.onerror = function () { reject(new Error('上传失败')); };
                    xhr.send(fd);
                });
            }
        };
    });


    // ==================== storage.local ====================
    define('storage.local', function () {
        var _isBrowser = typeof window !== 'undefined';
        if (!_isBrowser) return {};


        var S = window.localStorage;

        return {

            // 设置值（自动JSON序列化对象）
            set: function (key, val) {
                try { S.setItem(key, JSON.stringify(val)); } catch (e) { console.error('[storage.local] set失败:', e); }
            },

            // 获取值（自动JSON反序列化）
            get: function (key, defaultVal) {
                try {
                    var val = S.getItem(key);
                    if (val === null) return defaultVal !== undefined ? defaultVal : null;
                    return JSON.parse(val);
                } catch (e) { return val; }
            },

            // 删除
            remove: function (key) { S.removeItem(key); },

            // 清空所有
            clear: function () { S.clear(); },

            // 是否存在
            has: function (key) { return S.getItem(key) !== null; },

            // 获取所有key
            keys: function () {
                var result = [];
                for (var i = 0; i < S.length; i++) result.push(S.key(i));
                return result;
            },

            // 设置带过期时间的值（秒）
            setExpire: function (key, val, seconds) {
                var data = { _value: val, _expire: Date.now() + seconds * 1000 };
                this.set(key, data);
            },

            // 获取带过期时间的值（过期返回null）
            getExpire: function (key, defaultVal) {
                var data = this.get(key);
                if (!data || !data.hasOwnProperty('_expire')) return data;
                if (Date.now() > data._expire) { this.remove(key); return defaultVal !== undefined ? defaultVal : null; }
                return data._value;
            },

            // 获取存储大小（近似，单位KB）
            size: function () {
                var total = 0;
                for (var i = 0; i < S.length; i++) {
                    var key = S.key(i);
                    total += key.length + (S.getItem(key) || '').length;
                }
                return Math.round(total * 2 / 1024); // UTF-16 每字符2字节
            },

            // 读取后立即删除（一次性读取）
            getOnce: function (key, defaultVal) {
                var val = this.get(key, defaultVal);
                this.remove(key);
                return val;
            },

            // 批量写入：setMany({ key1: val1, key2: val2 })
            setMany: function (obj) {
                if (!obj || typeof obj !== 'object') return;
                for (var k in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, k)) this.set(k, obj[k]);
                }
            },

            // 批量读取：getMany(['key1','key2']) → { key1: val1, key2: val2 }
            getMany: function (keys) {
                if (!Array.isArray(keys)) return {};
                var result = {};
                for (var i = 0; i < keys.length; i++) result[keys[i]] = this.get(keys[i]);
                return result;
            },

            // 遍历所有存储项：each(fn(key, value))
            each: function (fn) {
                if (typeof fn !== 'function') return;
                var allKeys = [];
                for (var i = 0; i < S.length; i++) allKeys.push(S.key(i));
                for (var j = 0; j < allKeys.length; j++) fn(allKeys[j], this.get(allKeys[j]));
            },

            // 清除所有已过期的带TTL项（配合 set(key, val, expireMs) 使用）
            clearAllExpired: function () {
                var self = this;
                var allKeys = [];
                for (var i = 0; i < S.length; i++) allKeys.push(S.key(i));
                for (var j = 0; j < allKeys.length; j++) {
                    try {
                        var raw = S.getItem(allKeys[j]);
                        if (!raw) continue;
                        var data = JSON.parse(raw);
                        if (data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, '_expire')) {
                            if (Date.now() > data._expire) self.remove(allKeys[j]);
                        }
                    } catch (e) {}
                }
            }
        };
    });


    // ==================== storage.session ====================
    define('storage.session', function () {
        var _isBrowser = typeof window !== 'undefined';
        if (!_isBrowser) return {};


        var S = window.sessionStorage;

        return {

            set: function (key, val) {
                try { S.setItem(key, JSON.stringify(val)); } catch (e) { console.error('[storage.session] set失败:', e); }
            },

            get: function (key, defaultVal) {
                try {
                    var val = S.getItem(key);
                    if (val === null) return defaultVal !== undefined ? defaultVal : null;
                    return JSON.parse(val);
                } catch (e) { return val; }
            },

            remove: function (key) { S.removeItem(key); },

            clear: function () { S.clear(); },

            has: function (key) { return S.getItem(key) !== null; },

            keys: function () {
                var result = [];
                for (var i = 0; i < S.length; i++) result.push(S.key(i));
                return result;
            }
        };
    });


    // ==================== url.parse ====================
    define('url.parse', function () {
        var _isBrowser = typeof window !== 'undefined';

        // URL模板拼接：将 {key} 替换为参数值，多余参数追加为查询字符串
        // 示例：splicingUrl("https://api/{id}/detail", {id:1, page:2})
        //     → "https://api/1/detail?page=2"
        function splicingUrl(urlTmp, params) {
            params = params || {};
            var url = urlTmp.replace(/\{(\w+)\}/g, function (_, key) {
                if (Object.prototype.hasOwnProperty.call(params, key)) return params[key];
                return '{' + key + '}';
            });
            var remaining = {};
            for (var k in params) {
                if (!Object.prototype.hasOwnProperty.call(params, k)) continue;
                if (urlTmp.indexOf('{' + k + '}') === -1) remaining[k] = params[k];
            }
            var keys = Object.keys(remaining);
            if (!keys.length) return url;
            var qs = keys.map(function (k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(remaining[k] == null ? '' : remaining[k]);
            }).join('&');
            return url + (url.indexOf('?') > -1 ? '&' : '?') + qs;
        }
        if (!_isBrowser) return { splicingUrl: splicingUrl };
        return {

            // 获取当前URL指定查询参数
            getQueryParam: function (name) {
                var params = new URLSearchParams(window.location.search);
                return params.get(name);
            },

            // 获取当前URL所有查询参数（对象形式）
            getAllParams: function () {
                var result = {};
                var params = new URLSearchParams(window.location.search);
                params.forEach(function (val, key) { result[key] = val; });
                return result;
            },

            // 解析URL字符串
            parseUrl: function (url) {
                try {
                    var a = document.createElement('a');
                    a.href = url;
                    return {
                        protocol: a.protocol.replace(':', ''),
                        host: a.host,
                        hostname: a.hostname,
                        port: a.port,
                        path: a.pathname,
                        query: a.search.replace('?', ''),
                        hash: a.hash.replace('#', ''),
                        origin: a.origin
                    };
                } catch (e) { return null; }
            },

            // 构建URL（追加查询参数）
            buildUrl: function (baseUrl, params) {
                if (!params) return baseUrl;
                var qs = Object.keys(params).map(function (k) {
                    return encodeURIComponent(k) + '=' + encodeURIComponent(params[k] == null ? '' : params[k]);
                }).join('&');
                return baseUrl + (baseUrl.indexOf('?') > -1 ? '&' : '?') + qs;
            },

            // 修改当前URL的查询参数（不刷新页面）
            setQueryParam: function (key, value) {
                var url = new URL(window.location);
                url.searchParams.set(key, value);
                window.history.replaceState(null, '', url);
            },

            // 删除当前URL的查询参数（不刷新页面）
            removeQueryParam: function (key) {
                var url = new URL(window.location);
                url.searchParams.delete(key);
                window.history.replaceState(null, '', url);
            },

            // 判断是否包含指定查询参数
            hasQueryParam: function (name) {
                return new URLSearchParams(window.location.search).has(name);
            },

            // 获取URL的hash部分
            getHash: function () {
                return window.location.hash.replace('#', '');
            },

            // 获取当前完整URL
            current: function () {
                return window.location.href;
            },

            // URL模板拼接：将 {key} 替换为参数值，多余参数追加为查询字符串
            // 示例：splicingUrl("https://api/{id}/detail", {id:1, page:2})
            //     → "https://api/1/detail?page=2"
            splicingUrl: function (urlTmp, params) {
                params = params || {};
                var url = urlTmp.replace(/\{(\w+)\}/g, function (_, key) {
                    if (Object.prototype.hasOwnProperty.call(params, key)) return params[key];
                    return '{' + key + '}';
                });
                var remaining = {};
                for (var k in params) {
                    if (!Object.prototype.hasOwnProperty.call(params, k)) continue;
                    if (urlTmp.indexOf('{' + k + '}') === -1) remaining[k] = params[k];
                }
                var keys = Object.keys(remaining);
                if (!keys.length) return url;
                var qs = keys.map(function (k) {
                    return encodeURIComponent(k) + '=' + encodeURIComponent(remaining[k] == null ? '' : remaining[k]);
                }).join('&');
                return url + (url.indexOf('?') > -1 ? '&' : '?') + qs;
            },
            splicingUrl: splicingUrl
        };
    });


    // ==================== flow.approve ====================
    define('flow.approve', function () {

        // 获取蓝凌 EIP 表单对象（根据实际环境适配）
        function getFormContext() {
            // EIP 常见的全局对象
            if (typeof workflowForm !== 'undefined') return workflowForm;
            if (typeof WorkFlowForm !== 'undefined') return WorkFlowForm;
            if (typeof parent !== 'undefined' && parent.workflowForm) return parent.workflowForm;
            return null;
        }

        return {
            // 提交审批
            submit: function (comment) {
                var ctx = getFormContext();
                if (!ctx) {
                    console.warn('[flow.approve] 未找到 EIP 表单上下文');
                    return Promise.reject('未找到 EIP 表单上下文');
                }
                try {
                    if (comment) {
                        ctx.setComment(comment);
                    }
                    ctx.doSubmit();
                    return Promise.resolve({ success: true, action: 'submit', comment: comment });
                } catch (e) {
                    return Promise.reject(e.message || '审批提交失败');
                }
            },

            // 提交审批带意见
            submitWithComment: function (action, comment) {
                return this.submit(comment || action);
            },

            // 获取当前流程信息
            getFlowInfo: function () {
                var ctx = getFormContext();
                if (!ctx) return null;
                try {
                    return {
                        taskId: ctx.getTaskId ? ctx.getTaskId() : '',
                        processId: ctx.getProcessId ? ctx.getProcessId() : '',
                        currentNode: ctx.getCurrentNode ? ctx.getCurrentNode() : ''
                    };
                } catch (e) {
                    return null;
                }
            },

            // 判断是否在 EIP 流程环境中
            isEIPContext: function () {
                return !!getFormContext();
            }
        };
    });


    // ==================== form.validate ====================
    define('form.validate', function () {
        function _val(el) {
            if (el == null) return '';
            if (typeof el === 'string') {
                if (typeof window === 'undefined') return el;
                var dom = window.Z && window.Z.dom;
                if (dom && dom.getValue) return dom.getValue(el);
                if (typeof document !== 'undefined' && document.querySelector) {
                    var node = document.querySelector(el);
                    return node ? (node.value != null ? node.value : node.textContent) : '';
                }
                return el;
            }
            if (el && el.nodeType) return el.value != null ? el.value : el.textContent;
            return String(el);
        }

        /* ============ 纯正则测试集（test 子对象） ============ */
        var test = {
            integer: function (v) { return /^-?\d+$/.test(v); },
            decimal: function (v) { return /^-?\d+(\.\d+)?$/.test(v); },
            capital: function (v) { return /^[A-Z]+$/.test(v); },
            lowercase: function (v) { return /^[a-z]+$/.test(v); },
            numAndStr: function (v) { return /^[A-Za-z0-9]+$/.test(v); },
            numEnglishChinese: function (v) { return /^[A-Za-z0-9\u4e00-\u9fa5]+$/.test(v); },
            chineseAndNum: function (v) { return /^[\u4e00-\u9fa50-9]+$/.test(v); },
            noWord: function (v) { return /^[^A-Za-z]+$/.test(v); },
            repeatChar: function (v) { return /(.)\1+/.test(v); },
            chineseName: function (v) { return /^[\u4e00-\u9fa5·]{2,20}$/.test(v); },
            englishName: function (v) { return /^[A-Za-z][A-Za-z\s.'-]{1,49}$/.test(v); },
            email: function (v) { return /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(v); },
            emailStrict: function (v) { return /^[A-Za-z0-9]([\w.-]*[A-Za-z0-9])?@[A-Za-z0-9]([\w-]*[A-Za-z0-9])?(\.[A-Za-z]{2,})+$/.test(v); },
            phone: function (v) { return /^1[3-9]\d{9}$/.test(v); },
            phoneStrict: function (v) { return /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/.test(v); },
            time12: function (v) { return /^(0?[1-9]|1[0-2]):[0-5]\d(:[0-5]\d)?\s?(AM|PM|am|pm)$/.test(v); },
            time24: function (v) { return /^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(v); },
            province: function (v) {
                return /^(\u4eac|\u6caa|\u6d25|\u6e1d|\u9ed1|\u5409|\u8fbd|\u8499|\u5180|\u65b0|\u7518|\u9752|\u9655|\u5b81|\u8c6b|\u9c81|\u664b|\u95fd|\u7ca4|\u6842|\u6e58|\u9102|\u8d63|\u5dde|\u675e|\u7696|\u82cf|\u6d59|\u6e2f|\u6fb3|\u53f0|\u85cf|\u5ddd|\u4e91|\u743c)$/.test(v);
            },
            licensePlate: function (v) {
                return /^[\u4eac\u6caa\u6d25\u6e1d\u9ed1\u5409\u8fbd\u8499\u5180\u65b0\u7518\u9752\u9655\u5b81\u8c6b\u9c81\u664b\u95fd\u7ca4\u6842\u6e58\u9102\u8d63\u5dde\u675e\u7696\u82cf\u6d59][A-Z]([A-Z0-9]{5}|[A-Z0-9]{4}[\u6302\u5b66\u8b66\u6e2f\u6fb3])$/.test(v);
            },
            licensePlateOld: function (v) { return /^[\u4eac\u6caa\u6d25\u6e1d\u9ed1\u5409\u8fbd\u8499\u5180\u65b0\u7518\u9752\u9655\u5b81\u8c6b\u9c81\u664b\u95fd\u7ca4\u6842\u6e58\u9102\u8d63\u5dde\u675e\u7696\u82cf\u6d59][A-Z][A-Z0-9]{5}$/.test(v); },
            licensePlateNew: function (v) { return /^[\u4eac\u6caa\u6d25\u6e1d\u9ed1\u5409\u8fbd\u8499\u5180\u65b0\u7518\u9752\u9655\u5b81\u8c6b\u9c81\u664b\u95fd\u7ca4\u6842\u6e58\u9102\u8d63\u5dde\u675e\u7696\u82cf\u6d59][A-Z][A-Z0-9]{4}[\u6302\u5b66\u8b66\u6e2f\u6fb3]$/.test(v); },
            passwordStrong: function (v) { return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!-/:-@\[-`{-~]).{8,}$/.test(v); },
            passwordMedium: function (v) {
                if (typeof v !== 'string' || v.length < 8) return false;
                var t = 0;
                if (/[a-z]/.test(v)) t++;
                if (/[A-Z]/.test(v)) t++;
                if (/\d/.test(v)) t++;
                if (/[^A-Za-z0-9]/.test(v)) t++;
                return t >= 3;
            },
            idCard: function (v) { return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(v); },
            url: function (v) { return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v); },
            ipv4: function (v) { return /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/.test(v); }
        };

        /* ============ DOM 包装器（接受选择器或元素） ============ */
        function _wrap(testFn, defaultMsg) {
            return function (el, msg) {
                var v = _val(el);
                if (v === '' || v == null) return { ok: true };
                var ok = testFn(v);
                return { ok: ok, message: ok ? '' : (msg || defaultMsg) };
            };
        }

        function required(el, msg) {
            var v = _val(el);
            var ok = v != null && String(v).replace(/^\s+|\s+$/g, '') !== '';
            return { ok: ok, message: ok ? '' : (msg || '\u5fc5\u586b\u9879') };
        }
        function length(el, opts, msg) {
            opts = opts || {};
            var v = _val(el); var n = v == null ? 0 : String(v).length;
            var ok = (opts.min == null || n >= opts.min) && (opts.max == null || n <= opts.max);
            return { ok: ok, message: ok ? '' : (msg || ('\u957f\u5ea6\u9700\u4ecb\u4e8e ' + (opts.min || 0) + '~' + (opts.max || '\u221e'))) };
        }
        function number(el, opts, msg) {
            opts = opts || {};
            var v = _val(el); var n = Number(v);
            var ok = !isNaN(n) && (opts.min == null || n >= opts.min) && (opts.max == null || n <= opts.max);
            return { ok: ok, message: ok ? '' : (msg || '\u8bf7\u8f93\u5165\u5408\u6cd5\u6570\u5b57') };
        }

        var email = _wrap(test.email, '\u90ae\u7bb1\u683c\u5f0f\u4e0d\u6b63\u786e');
        var phone = _wrap(test.phone, '\u624b\u673a\u53f7\u683c\u5f0f\u4e0d\u6b63\u786e');
        var phoneStrict = _wrap(test.phoneStrict, '\u624b\u673a\u53f7\u683c\u5f0f\u4e0d\u6b63\u786e');
        var idCard = _wrap(test.idCard, '\u8eab\u4efd\u8bc1\u53f7\u683c\u5f0f\u4e0d\u6b63\u786e');
        var url = _wrap(test.url, 'URL \u683c\u5f0f\u4e0d\u6b63\u786e');
        var integer = _wrap(test.integer, '\u8bf7\u8f93\u5165\u6574\u6570');
        var decimal = _wrap(test.decimal, '\u8bf7\u8f93\u5165\u5c0f\u6570');
        var chineseName = _wrap(test.chineseName, '\u8bf7\u8f93\u5165\u4e2d\u6587\u59d3\u540d');
        var englishName = _wrap(test.englishName, '\u8bf7\u8f93\u5165\u82f1\u6587\u59d3\u540d');
        var licensePlate = _wrap(test.licensePlate, '\u8f66\u724c\u53f7\u683c\u5f0f\u4e0d\u6b63\u786e');
        var passwordStrong = _wrap(test.passwordStrong, '\u5bc6\u7801\u9700\u542b\u5927\u5c0f\u5199\u5b57\u6bcd\u3001\u6570\u5b57\u3001\u7279\u6b8a\u5b57\u7b26\u4e14\u4e0d\u5c11\u4e8e8\u4f4d');
        var passwordMedium = _wrap(test.passwordMedium, '\u5bc6\u7801\u9700\u542b\u4e09\u79cd\u4ee5\u4e0a\u5b57\u7b26\u7c7b\u578b\u4e14\u4e0d\u5c11\u4e8e8\u4f4d');

        function checkAll() {
            var rules = Array.prototype.slice.call(arguments);
            for (var i = 0; i < rules.length; i++) {
                var r = rules[i];
                if (r && r.ok === false) return r;
            }
            return { ok: true };
        }

        return {
            test: test,
            required: required, length: length, number: number,
            email: email, phone: phone, phoneStrict: phoneStrict,
            idCard: idCard, url: url, integer: integer, decimal: decimal,
            chineseName: chineseName, englishName: englishName,
            licensePlate: licensePlate,
            passwordStrong: passwordStrong, passwordMedium: passwordMedium,
            checkAll: checkAll
        };
    });


    // ==================== ui.dialog ====================
    define('ui.dialog', function () {
        var _isBrowser = typeof window !== 'undefined';
        if (!_isBrowser) return {};
        if (typeof document === 'undefined') return null;

        var _orig = { alert: window.alert, confirm: window.confirm, prompt: window.prompt };
        var _overlay = null;

        var _icons = {
            success: '<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#52c41a" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l2.5 2.5L16 9"/></svg>',
            error: '<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#ff4d4f" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
            warning: '<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#faad14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v5"/><circle cx="12" cy="16" r="1" fill="#faad14" stroke="none"/></svg>',
            info: '<svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#1677ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-5"/><circle cx="12" cy="8" r="1" fill="#1677ff" stroke="none"/></svg>'
        };

        function _css() {
            if (document.getElementById('z-dialog-css')) return;
            var s = document.createElement('style'); s.id = 'z-dialog-css';
            s.textContent =
                '.z-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.45);z-index:99999;display:flex;align-items:center;justify-content:center;animation:zFadeIn .2s}' +
                '.z-dialog{background:#fff;border-radius:8px;min-width:320px;max-width:520px;box-shadow:0 6px 30px rgba(0,0,0,.12);animation:zZoomIn .25s;overflow:hidden;position:relative}' +
                '.z-dialog-close{position:absolute;top:12px;right:16px;cursor:pointer;color:#999;font-size:20px;line-height:1;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:all .15s;z-index:1}' +
                '.z-dialog-close:hover{background:#f5f5f5;color:#333}' +
                '.z-dialog-head{padding:16px 44px 8px 20px;font-size:16px;font-weight:600;color:#1a1a1a}' +
                '.z-dialog-icon{text-align:center;padding:20px 20px 0}' +
                '.z-dialog-body{padding:8px 20px 16px;font-size:14px;color:#333;line-height:1.6;white-space:pre-wrap}' +
                '.z-dialog-body.center{text-align:center}' +
                '.z-dialog-foot{padding:8px 20px 16px;text-align:right}' +
                '.z-dialog-foot button{margin-left:8px;padding:7px 20px;border-radius:4px;border:1px solid #d9d9d9;cursor:pointer;font-size:14px;transition:all .15s;outline:none}' +
                '.z-btn-p{background:#1677ff;color:#fff;border-color:#1677ff!important}.z-btn-p:hover{background:#4096ff;border-color:#4096ff!important}' +
                '.z-btn-d{background:#fff;color:#333}.z-btn-d:hover{color:#1677ff;border-color:#1677ff!important}' +
                '.z-dialog-input{width:100%;padding:8px 10px;border:1px solid #d9d9d9;border-radius:4px;font-size:14px;box-sizing:border-box;outline:none;margin-top:8px;transition:border-color .2s}.z-dialog-input:focus{border-color:#1677ff;box-shadow:0 0 0 2px rgba(22,119,255,.1)}' +
                '@keyframes zFadeIn{from{opacity:0}to{opacity:1}}@keyframes zZoomIn{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}' +
                '@keyframes zZoomOut{from{transform:scale(1);opacity:1}to{transform:scale(.85);opacity:0}}';
            document.head.appendChild(s);
        }

        function _close() {
            if (_overlay) {
                var dg = _overlay.querySelector('.z-dialog');
                if (dg) { dg.style.animation = 'zZoomOut .2s forwards'; }
                _overlay.style.animation = 'none';
                _overlay.style.transition = 'opacity .2s';
                _overlay.style.opacity = '0';
                var ref = _overlay;
                setTimeout(function () { if (ref && ref.parentNode) ref.remove(); }, 200);
                _overlay = null;
            }
        }

        function _open(o) {
            _css(); _close();
            var ol = document.createElement('div'); ol.className = 'z-overlay';
            var dg = document.createElement('div'); dg.className = 'z-dialog';
            if (o.width) {
                var w = typeof o.width === 'number' ? o.width + 'px' : o.width;
                dg.style.minWidth = w; dg.style.maxWidth = w; dg.style.width = w;
            }
            // X close button
            var closable = o.closable !== false;
            if (closable) {
                var xBtn = document.createElement('span'); xBtn.className = 'z-dialog-close';
                xBtn.innerHTML = '&times;';
                xBtn.onclick = function () { _close(); if (o.onCancel) o.onCancel(); };
                dg.appendChild(xBtn);
            }
            // icon
            if (o.icon && _icons[o.icon]) {
                var iconDiv = document.createElement('div'); iconDiv.className = 'z-dialog-icon';
                iconDiv.innerHTML = _icons[o.icon]; dg.appendChild(iconDiv);
            }
            // title
            if (o.title) { var h = document.createElement('div'); h.className = 'z-dialog-head'; h.textContent = o.title; dg.appendChild(h); }
            // body
            var bd = document.createElement('div'); bd.className = 'z-dialog-body';
            if (o.icon) bd.classList.add('center');
            bd.textContent = o.message || '';
            var inp;
            if (o.type === 'prompt') {
                bd.classList.remove('center');
                inp = document.createElement('input'); inp.className = 'z-dialog-input'; inp.value = o.defaultVal || '';
                inp.onkeydown = function (e) { if (e.key === 'Enter') ok(); };
                bd.appendChild(inp);
            }
            dg.appendChild(bd);
            // footer
            var ft = document.createElement('div'); ft.className = 'z-dialog-foot';
            function ok() { _close(); if (o.onOk) o.onOk(o.type === 'prompt' && inp ? inp.value : undefined); }
            function cancel() { _close(); if (o.onCancel) o.onCancel(); }
            if (o.type !== 'alert') { var bc = document.createElement('button'); bc.className = 'z-btn-d'; bc.textContent = o.cancelText || '取消'; bc.onclick = cancel; ft.appendChild(bc); }
            var bok = document.createElement('button'); bok.className = 'z-btn-p'; bok.textContent = o.okText || '确定'; bok.onclick = ok; ft.appendChild(bok);
            dg.appendChild(ft); ol.appendChild(dg);
            ol.onclick = function (e) { if (e.target === ol && o.type !== 'alert') cancel(); };
            document.body.appendChild(ol); _overlay = ol;
            if (inp) setTimeout(function () { inp.focus(); }, 80);
            else setTimeout(function () { bok.focus(); }, 80);
        }

        return {
            alert: function (msg, o) { o = o || {}; _open({ type: 'alert', title: o.title || '提示', message: msg, icon: o.icon, width: o.width, closable: o.closable, okText: o.okText, onOk: o.onOk }); },
            confirm: function (msg, o) { o = o || {}; _open({ type: 'confirm', title: o.title || '确认', message: msg, icon: o.icon, width: o.width, closable: o.closable, okText: o.okText, cancelText: o.cancelText, onOk: o.onOk, onCancel: o.onCancel }); },
            prompt: function (msg, o) { o = o || {}; _open({ type: 'prompt', title: o.title || '输入', message: msg, icon: o.icon, width: o.width, closable: o.closable, defaultVal: o.defaultVal, okText: o.okText, cancelText: o.cancelText, onOk: o.onOk, onCancel: o.onCancel }); },
            override: function () { var self = this; window.alert = function (msg) { self.alert(msg); }; window.confirm = function (msg) { self.confirm(msg); return true; }; window.prompt = function (msg) { self.prompt(msg); return ''; }; },
            restore: function () { window.alert = _orig.alert; window.confirm = _orig.confirm; window.prompt = _orig.prompt; },
            close: _close
        };
    });


    // ==================== ui.log ====================
    define('ui.log', function () {
        var _isBrowser = typeof window !== 'undefined';
        if (!_isBrowser) return {};

        if (typeof document === 'undefined') return null;
        var _orig = { log: console.log, warn: console.warn, error: console.error, info: console.info };
        var _panel = null, _body = null, _dragBound = false;

        function _css() {
            if (document.getElementById('z-log-css')) return;
            var s = document.createElement('style'); s.id = 'z-log-css';
            s.textContent =
                '.z-log-panel{position:fixed;bottom:0;right:0;width:480px;height:300px;background:#1e1e1e;border-radius:8px 0 0 0;box-shadow:-2px -2px 10px rgba(0,0,0,.3);z-index:99998;display:flex;flex-direction:column;font-family:Consolas,"Courier New",monospace;font-size:13px;resize:both;overflow:hidden}' +
                '.z-log-head{padding:6px 12px;background:#333;color:#fff;cursor:move;display:flex;justify-content:space-between;align-items:center;user-select:none;flex-shrink:0}' +
                '.z-log-head span{font-size:12px}.z-log-head button{background:none;border:none;color:#aaa;cursor:pointer;font-size:12px;padding:2px 8px}.z-log-head button:hover{color:#fff}' +
                '.z-log-body{flex:1;overflow-y:auto;padding:4px 0}.z-log-item{padding:3px 12px;border-bottom:1px solid #2a2a2a;word-break:break-all;line-height:1.5}' +
                '.z-log-item.log{color:#d4d4d4}.z-log-item.warn{color:#dcdcaa;background:rgba(220,220,170,.05)}.z-log-item.error{color:#f44747;background:rgba(244,71,71,.05)}.z-log-item.info{color:#569cd6}' +
                '.z-log-panel::-webkit-scrollbar{width:6px}.z-log-body::-webkit-scrollbar{width:6px}.z-log-body::-webkit-scrollbar-thumb{background:#555;border-radius:3px}';
            document.head.appendChild(s);
        }

        function _ensurePanel() {
            if (_panel) return;
            _css();
            _panel = document.createElement('div'); _panel.className = 'z-log-panel';
            var hd = document.createElement('div'); hd.className = 'z-log-head';
            var sp = document.createElement('span'); sp.textContent = 'Z Log';
            var btns = document.createElement('div');
            var bClr = document.createElement('button'); bClr.textContent = '清空'; bClr.onclick = function () { _body.innerHTML = ''; };
            var bHide = document.createElement('button'); bHide.textContent = '隐藏'; bHide.onclick = function () { _panel.style.display = 'none'; };
            btns.appendChild(bClr); btns.appendChild(bHide);
            hd.appendChild(sp); hd.appendChild(btns);
            var dragging = false, ox = 0, oy = 0;
            hd.onmousedown = function (e) { dragging = true; ox = e.clientX - _panel.offsetLeft; oy = e.clientY - _panel.offsetTop; e.preventDefault(); };
            if (!_dragBound) {
                _dragBound = true;
                document.addEventListener('mousemove', function (e) { if (!dragging || !_panel) return; _panel.style.left = (e.clientX - ox) + 'px'; _panel.style.top = (e.clientY - oy) + 'px'; _panel.style.right = 'auto'; _panel.style.bottom = 'auto'; });
                document.addEventListener('mouseup', function () { dragging = false; });
            }
            _body = document.createElement('div'); _body.className = 'z-log-body';
            _panel.appendChild(hd); _panel.appendChild(_body);
            document.body.appendChild(_panel);
        }

        function _add(type, args) {
            _ensurePanel();
            var d = document.createElement('div'); d.className = 'z-log-item ' + type;
            d.textContent = Array.prototype.map.call(args, function (a) { return typeof a === 'object' ? JSON.stringify(a) : String(a); }).join(' ');
            _body.appendChild(d); _body.scrollTop = _body.scrollHeight;
        }

        return {
            log: function () { _orig.log.apply(console, arguments); _add('log', arguments); },
            warn: function () { _orig.warn.apply(console, arguments); _add('warn', arguments); },
            error: function () { _orig.error.apply(console, arguments); _add('error', arguments); },
            info: function () { _orig.info.apply(console, arguments); _add('info', arguments); },
            show: function () { _ensurePanel(); _panel.style.display = 'flex'; },
            hide: function () { if (_panel) _panel.style.display = 'none'; },
            clear: function () { if (_body) _body.innerHTML = ''; },
            override: function () {
                var self = this;
                console.log = function () { _orig.log.apply(console, arguments); self.log.apply(self, arguments); };
                console.warn = function () { _orig.warn.apply(console, arguments); self.warn.apply(self, arguments); };
                console.error = function () { _orig.error.apply(console, arguments); self.error.apply(self, arguments); };
                console.info = function () { _orig.info.apply(console, arguments); self.info.apply(self, arguments); };
            },
            restore: function () { console.log = _orig.log; console.warn = _orig.warn; console.error = _orig.error; console.info = _orig.info; }
        };
    });


    // ==================== ui.toast ====================
    define('ui.toast', function () {
        var _isBrowser = typeof window !== 'undefined';
        if (!_isBrowser) return {};

        if (typeof document === 'undefined') return null;
        var _box = null;

        function _css() {
            if (document.getElementById('z-toast-css')) return;
            var s = document.createElement('style'); s.id = 'z-toast-css';
            s.textContent =
                '.z-toast-box{position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:100000;display:flex;flex-direction:column;align-items:center;pointer-events:none}' +
                '.z-toast{padding:9px 16px;border-radius:6px;font-size:14px;color:#fff;margin-bottom:8px;animation:zToastIn .3s;pointer-events:auto;box-shadow:0 4px 12px rgba(0,0,0,.15);white-space:nowrap}' +
                '.z-toast.success{background:#52c41a}.z-toast.error{background:#ff4d4f}.z-toast.warning{background:#faad14;color:#333}.z-toast.info{background:#1677ff}' +
                '.z-toast.out{animation:zToastOut .3s forwards}' +
                '@keyframes zToastIn{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}' +
                '@keyframes zToastOut{to{opacity:0;transform:translateY(-20px)}}';
            document.head.appendChild(s);
        }

        function _show(msg, type, duration) {
            _css();
            if (!_box) { _box = document.createElement('div'); _box.className = 'z-toast-box'; document.body.appendChild(_box); }
            var t = document.createElement('div'); t.className = 'z-toast ' + (type || 'info'); t.textContent = msg;
            _box.appendChild(t);
            setTimeout(function () {
                t.classList.add('out');
                setTimeout(function () { t.remove(); if (_box && _box.children.length === 0) { _box.remove(); _box = null; } }, 300);
            }, duration || 3000);
        }

        return {
            show: _show,
            success: function (msg, d) { _show(msg, 'success', d); },
            error: function (msg, d) { _show(msg, 'error', d); },
            warning: function (msg, d) { _show(msg, 'warning', d); },
            info: function (msg, d) { _show(msg, 'info', d); }
        };
    });


    // ==================== ui.notify ====================
    define('ui.notify', function () {
        var _isBrowser = typeof window !== 'undefined';
        if (!_isBrowser) return {};

        if (typeof document === 'undefined') return null;
        var _box = null, _uid = 0;

        function _css() {
            if (document.getElementById('z-notify-css')) return;
            var s = document.createElement('style'); s.id = 'z-notify-css';
            s.textContent =
                '.z-notify-box{position:fixed;top:24px;right:24px;z-index:100001;display:flex;flex-direction:column;gap:12px;pointer-events:none}' +
                '.z-notify{width:340px;padding:16px 20px;border-radius:8px;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,.15);animation:zNotifyIn .3s;pointer-events:auto;position:relative;border-left:4px solid #1677ff}' +
                '.z-notify.success{border-left-color:#52c41a}.z-notify.error{border-left-color:#ff4d4f}.z-notify.warning{border-left-color:#faad14}.z-notify.info{border-left-color:#1677ff}' +
                '.z-notify-title{font-size:14px;font-weight:600;color:#1a1a1a;margin-bottom:4px;padding-right:20px}' +
                '.z-notify-msg{font-size:13px;color:#666;line-height:1.5}' +
                '.z-notify-close{position:absolute;top:8px;right:8px;cursor:pointer;color:#999;font-size:18px;line-height:1}.z-notify-close:hover{color:#333}' +
                '.z-notify.out{animation:zNotifyOut .3s forwards}' +
                '@keyframes zNotifyIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}' +
                '@keyframes zNotifyOut{to{opacity:0;transform:translateX(100%)}}';
            document.head.appendChild(s);
        }

        function _closeEl(n) {
            if (!n || !n.parentNode) return;
            n.classList.add('out');
            setTimeout(function () { n.remove(); }, 300);
        }

        function _show(opts) {
            _css();
            if (!_box) { _box = document.createElement('div'); _box.className = 'z-notify-box'; document.body.appendChild(_box); }
            var id = 'z-notify-' + (++_uid);
            var n = document.createElement('div'); n.className = 'z-notify ' + (opts.type || 'info'); n.id = id;
            var tl = document.createElement('div'); tl.className = 'z-notify-title'; tl.textContent = opts.title || '';
            var mg = document.createElement('div'); mg.className = 'z-notify-msg'; mg.textContent = opts.message || '';
            var cl = document.createElement('span'); cl.className = 'z-notify-close'; cl.innerHTML = '&times;'; cl.onclick = function () { _closeEl(n); };
            n.appendChild(tl); n.appendChild(mg); n.appendChild(cl);
            _box.appendChild(n);
            var dur = opts.duration !== undefined ? opts.duration : 4500;
            if (dur > 0) setTimeout(function () { _closeEl(n); }, dur);
            return id;
        }

        return {
            show: _show,
            success: function (t, m, d) { return _show({ title: t, message: m, type: 'success', duration: d }); },
            error: function (t, m, d) { return _show({ title: t, message: m, type: 'error', duration: d }); },
            warning: function (t, m, d) { return _show({ title: t, message: m, type: 'warning', duration: d }); },
            info: function (t, m, d) { return _show({ title: t, message: m, type: 'info', duration: d }); },
            close: function (id) { var el = document.getElementById(id); if (el) _closeEl(el); },
            closeAll: function () { if (_box) Array.prototype.forEach.call(_box.children, _closeEl); }
        };
    });


    // ==================== ui.affix ====================
    define('ui.affix', function () {
        var _isBrowser = typeof window !== 'undefined';
        if (!_isBrowser) return {};

        if (typeof document === 'undefined') return null;
        var _items = {}, _uid = 0;

        function _css() {
            if (document.getElementById('z-affix-css')) return;
            var s = document.createElement('style'); s.id = 'z-affix-css';
            s.textContent =
                '.z-affix{position:fixed;z-index:99990;padding:8px 16px;background:#fff;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,.15);font-size:14px;color:#333;cursor:pointer;display:inline-flex;align-items:center;gap:8px;animation:zAffixIn .25s;white-space:nowrap}' +
                '.z-affix:hover{box-shadow:0 4px 12px rgba(0,0,0,.2)}' +
                '.z-affix.tl{top:16px;left:16px}.z-affix.tr{top:16px;right:16px}.z-affix.bl{bottom:16px;left:16px}.z-affix.br{bottom:16px;right:16px}' +
                '.z-affix-close{cursor:pointer;color:#999;font-size:16px;line-height:1;margin-left:4px;user-select:none}.z-affix-close:hover{color:#333}' +
                '.z-affix.out{animation:zAffixOut .25s forwards}' +
                '@keyframes zAffixIn{from{opacity:0}to{opacity:1}}@keyframes zAffixOut{from{opacity:1}to{opacity:0}}';
            document.head.appendChild(s);
        }

        var _posMap = { 'top-left': 'tl', 'top-right': 'tr', 'bottom-left': 'bl', 'bottom-right': 'br' };

        function _show(opts) {
            _css();
            var id = 'z-affix-' + (++_uid);
            var el = document.createElement('div');
            el.className = 'z-affix ' + (_posMap[opts.position] || 'br');
            el.id = id;
            var span = document.createElement('span');
            if (opts.html) span.innerHTML = opts.content || ''; else span.textContent = opts.content || '';
            el.appendChild(span);
            var closable = opts.closable !== false;
            if (closable) {
                var cl = document.createElement('span'); cl.className = 'z-affix-close'; cl.innerHTML = '&times;';
                cl.onclick = function (e) { e.stopPropagation(); _hide(id); };
                el.appendChild(cl);
            }
            el.onclick = function (e) { if (e.target.className === 'z-affix-close') return; if (opts.onClick) opts.onClick(e); };
            if (opts.style) { for (var k in opts.style) { if (opts.style.hasOwnProperty(k)) el.style[k] = opts.style[k]; } }
            document.body.appendChild(el);
            _items[id] = el;
            return id;
        }

        function _hide(id) {
            if (id) {
                var el = _items[id] || document.getElementById(id);
                if (!el) return;
                el.classList.add('out');
                setTimeout(function () { el.remove(); delete _items[id]; }, 250);
            } else {
                var keys = Object.keys(_items);
                keys.forEach(function (k) { _hide(k); });
            }
        }

        function _update(id, opts) {
            var el = _items[id]; if (!el) return;
            var span = el.querySelector('span:not(.z-affix-close)');
            if (opts.content !== undefined && span) { if (opts.html) span.innerHTML = opts.content; else span.textContent = opts.content; }
            if (opts.position) { el.className = el.className.replace(/\b(tl|tr|bl|br)\b/, _posMap[opts.position] || 'br'); }
            if (opts.style) { for (var k in opts.style) { if (opts.style.hasOwnProperty(k)) el.style[k] = opts.style[k]; } }
        }

        return {
            show: _show,
            hide: _hide,
            update: _update,
            get: function (id) { return _items[id] || null; }
        };
    });


    // ==================== ui.loading ====================
    define('ui.loading', function () {
        var _isBrowser = typeof window !== 'undefined';
        if (!_isBrowser) return {};
        if (typeof document === 'undefined') return null;

        var _instances = {}, _uid = 0;

        function _css() {
            if (document.getElementById('z-loading-css')) return;
            var s = document.createElement('style'); s.id = 'z-loading-css';
            s.textContent =
                '.z-loading-mask{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99998;animation:zFadeIn .2s;transition:opacity .3s}' +
                '.z-loading-mask.fullscreen{position:fixed}' +
                '.z-loading-text{margin-top:12px;font-size:14px;color:#666}' +
                '.z-loading-spinner{display:inline-block}' +
                '.z-loading-spinner.small svg{width:28px;height:28px}' +
                '.z-loading-spinner.medium svg{width:40px;height:40px}' +
                '.z-loading-spinner.large svg{width:56px;height:56px}' +
                '.z-spin-rotate{animation:zSpinRotate 1s linear infinite}' +
                '.z-spin-dot{position:relative;display:inline-flex;align-items:center;justify-content:center}' +
                '.z-spin-dot i{width:8px;height:8px;background:#1677ff;border-radius:50%;display:inline-block;margin:0 3px;animation:zDotBounce .6s infinite alternate}' +
                '.z-spin-dot i:nth-child(2){animation-delay:.2s}.z-spin-dot i:nth-child(3){animation-delay:.4s}' +
                '.z-spin-bar{display:inline-flex;align-items:center;gap:3px;height:24px}' +
                '.z-spin-bar i{width:4px;height:16px;background:#1677ff;border-radius:2px;animation:zBarStretch .8s ease-in-out infinite}' +
                '.z-spin-bar i:nth-child(2){animation-delay:.1s}.z-spin-bar i:nth-child(3){animation-delay:.2s}.z-spin-bar i:nth-child(4){animation-delay:.3s}' +
                '@keyframes zFadeIn{from{opacity:0}to{opacity:1}}' +
                '@keyframes zSpinRotate{to{transform:rotate(360deg)}}' +
                '@keyframes zDotBounce{to{transform:translateY(-8px);opacity:.4}}' +
                '@keyframes zBarStretch{0%,100%{height:16px;opacity:.5}50%{height:24px;opacity:1}}';
            document.head.appendChild(s);
        }

        var _spinners = {
            default: '<svg class="z-spin-rotate" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" stroke="#1677ff" stroke-width="4" stroke-linecap="round" stroke-dasharray="90 150" stroke-dashoffset="0"/></svg>',
            dot: '<span class="z-spin-dot"><i></i><i></i><i></i></span>',
            bar: '<span class="z-spin-bar"><i></i><i></i><i></i><i></i></span>'
        };

        function _getTarget(target) {
            if (!target) return null;
            if (typeof target === 'string') return document.querySelector(target);
            if (target.nodeType) return target;
            return null;
        }

        function _show(opts) {
            _css();
            opts = opts || {};
            var id = 'z-loading-' + (++_uid);
            var targetEl = _getTarget(opts.target);
            var isFullscreen = !targetEl;

            var mask = document.createElement('div');
            mask.className = 'z-loading-mask' + (isFullscreen ? ' fullscreen' : '');
            mask.id = id;
            mask.style.background = opts.background || (isFullscreen ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.8)');

            var spinnerWrap = document.createElement('span');
            spinnerWrap.className = 'z-loading-spinner ' + (opts.size || 'medium');
            spinnerWrap.innerHTML = _spinners[opts.spinner] || _spinners['default'];
            mask.appendChild(spinnerWrap);

            if (opts.text) {
                var txt = document.createElement('span'); txt.className = 'z-loading-text';
                txt.textContent = opts.text; mask.appendChild(txt);
            }

            if (isFullscreen) {
                document.body.appendChild(mask);
            } else {
                var pos = window.getComputedStyle(targetEl).position;
                if (pos === 'static' || pos === '') targetEl.style.position = 'relative';
                targetEl.appendChild(mask);
            }

            _instances[id] = { mask: mask, target: targetEl, isFullscreen: isFullscreen };
            return id;
        }

        function _close(id) {
            var inst = _instances[id];
            if (!inst) return;
            inst.mask.style.opacity = '0';
            setTimeout(function () { if (inst.mask.parentNode) inst.mask.remove(); }, 300);
            delete _instances[id];
        }

        function _closeAll() {
            Object.keys(_instances).forEach(function (id) { _close(id); });
        }

        return {
            show: _show,
            close: _close,
            closeAll: _closeAll,
            fullscreen: function (text, opts) {
                opts = opts || {};
                opts.text = text || opts.text;
                return _show(opts);
            },
            service: function (target, text, opts) {
                opts = opts || {};
                opts.target = target;
                opts.text = text || opts.text;
                return _show(opts);
            }
        };
    });


    // ==================== ui.popconfirm ====================
    define('ui.popconfirm', function () {
        var _isBrowser = typeof window !== 'undefined';
        if (!_isBrowser) return {};
        if (typeof document === 'undefined') return null;

        var _instances = {}, _bindings = {}, _uid = 0;

        var _popIcons = {
            warning: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none"><circle cx="8" cy="8" r="7" stroke="#faad14" stroke-width="1.5"/><path d="M8 4.5v3.5M8 10.5h.01" stroke="#faad14" stroke-width="1.5" stroke-linecap="round"/></svg>',
            info: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none"><circle cx="8" cy="8" r="7" stroke="#1677ff" stroke-width="1.5"/><path d="M8 11v-3M8 5.5h.01" stroke="#1677ff" stroke-width="1.5" stroke-linecap="round"/></svg>',
            error: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none"><circle cx="8" cy="8" r="7" stroke="#ff4d4f" stroke-width="1.5"/><path d="M10 6l-4 4M6 6l4 4" stroke="#ff4d4f" stroke-width="1.5" stroke-linecap="round"/></svg>',
            success: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none"><circle cx="8" cy="8" r="7" stroke="#52c41a" stroke-width="1.5"/><path d="M5.5 8l1.5 1.5L10.5 6" stroke="#52c41a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        };

        function _css() {
            if (document.getElementById('z-popconfirm-css')) return;
            var s = document.createElement('style'); s.id = 'z-popconfirm-css';
            s.textContent =
                '.z-popconfirm{position:absolute;z-index:100002;background:#fff;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.12);padding:12px 16px;min-width:200px;animation:zPopIn .2s;font-size:14px}' +
                '.z-popconfirm-arrow{position:absolute;width:8px;height:8px;background:#fff;transform:rotate(45deg);box-shadow:-2px -2px 4px rgba(0,0,0,.04)}' +
                '.z-popconfirm.top .z-popconfirm-arrow{bottom:-4px;left:50%;margin-left:-4px;box-shadow:2px 2px 4px rgba(0,0,0,.04)}' +
                '.z-popconfirm.bottom .z-popconfirm-arrow{top:-4px;left:50%;margin-left:-4px}' +
                '.z-popconfirm.left .z-popconfirm-arrow{right:-4px;top:50%;margin-top:-4px;box-shadow:2px -2px 4px rgba(0,0,0,.04)}' +
                '.z-popconfirm.right .z-popconfirm-arrow{left:-4px;top:50%;margin-top:-4px;box-shadow:-2px 2px 4px rgba(0,0,0,.04)}' +
                '.z-popconfirm-content{display:flex;align-items:flex-start;gap:8px}' +
                '.z-popconfirm-icon{flex-shrink:0;margin-top:1px}' +
                '.z-popconfirm-title{color:#333;line-height:1.5}' +
                '.z-popconfirm-btns{margin-top:10px;text-align:right}' +
                '.z-popconfirm-btns button{padding:4px 12px;border-radius:4px;border:1px solid #d9d9d9;cursor:pointer;font-size:12px;margin-left:6px;transition:all .15s;outline:none}' +
                '.z-popconfirm-btns .z-pc-ok{background:#1677ff;color:#fff;border-color:#1677ff}.z-popconfirm-btns .z-pc-ok:hover{background:#4096ff}' +
                '.z-popconfirm-btns .z-pc-cancel{background:#fff;color:#333}.z-popconfirm-btns .z-pc-cancel:hover{color:#1677ff;border-color:#1677ff}' +
                '@keyframes zPopIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}';
            document.head.appendChild(s);
        }

        function _getEl(el) {
            if (typeof el === 'string') return document.querySelector(el);
            return el && el.nodeType ? el : null;
        }

        function _position(pop, targetEl, placement) {
            var rect = targetEl.getBoundingClientRect();
            var scrollX = window.pageXOffset || document.documentElement.scrollLeft;
            var scrollY = window.pageYOffset || document.documentElement.scrollTop;
            var pw = pop.offsetWidth, ph = pop.offsetHeight;
            var gap = 10;
            var top, left;

            switch (placement) {
                case 'bottom':
                    top = rect.bottom + scrollY + gap;
                    left = rect.left + scrollX + rect.width / 2 - pw / 2;
                    break;
                case 'left':
                    top = rect.top + scrollY + rect.height / 2 - ph / 2;
                    left = rect.left + scrollX - pw - gap;
                    break;
                case 'right':
                    top = rect.top + scrollY + rect.height / 2 - ph / 2;
                    left = rect.right + scrollX + gap;
                    break;
                default: // top
                    top = rect.top + scrollY - ph - gap;
                    left = rect.left + scrollX + rect.width / 2 - pw / 2;
            }
            // boundary check
            if (left < 4) left = 4;
            if (left + pw > document.documentElement.clientWidth - 4) left = document.documentElement.clientWidth - pw - 4;
            pop.style.top = top + 'px';
            pop.style.left = left + 'px';
        }

        function _show(targetEl, opts) {
            _css();
            targetEl = _getEl(targetEl);
            if (!targetEl) return null;
            opts = opts || {};
            var id = 'z-pc-' + (++_uid);
            var placement = opts.placement || 'top';

            var pop = document.createElement('div');
            pop.className = 'z-popconfirm ' + placement;
            pop.id = id;

            // arrow
            var arrow = document.createElement('div'); arrow.className = 'z-popconfirm-arrow';
            pop.appendChild(arrow);

            // content row
            var content = document.createElement('div'); content.className = 'z-popconfirm-content';
            var iconType = opts.icon || 'warning';
            if (_popIcons[iconType]) {
                var iconEl = document.createElement('span'); iconEl.className = 'z-popconfirm-icon';
                iconEl.innerHTML = _popIcons[iconType]; content.appendChild(iconEl);
            }
            var titleEl = document.createElement('span'); titleEl.className = 'z-popconfirm-title';
            titleEl.textContent = opts.title || '确定执行此操作吗？';
            content.appendChild(titleEl);
            pop.appendChild(content);

            // buttons
            var btns = document.createElement('div'); btns.className = 'z-popconfirm-btns';
            var cancelBtn = document.createElement('button'); cancelBtn.className = 'z-pc-cancel';
            cancelBtn.textContent = opts.cancelText || '取消';
            var okBtn = document.createElement('button'); okBtn.className = 'z-pc-ok';
            okBtn.textContent = opts.okText || '确定';

            function close() {
                pop.style.opacity = '0'; pop.style.transform = 'scale(.9)'; pop.style.transition = 'all .15s';
                setTimeout(function () { if (pop.parentNode) pop.remove(); }, 150);
                delete _instances[id];
                document.removeEventListener('mousedown', outsideHandler);
            }
            cancelBtn.onclick = function () { close(); if (opts.onCancel) opts.onCancel(); };
            okBtn.onclick = function () { close(); if (opts.onOk) opts.onOk(); };
            btns.appendChild(cancelBtn); btns.appendChild(okBtn);
            pop.appendChild(btns);

            document.body.appendChild(pop);
            _position(pop, targetEl, placement);
            _instances[id] = { pop: pop, target: targetEl };

            // click outside to close
            function outsideHandler(e) {
                if (!pop.contains(e.target) && e.target !== targetEl && !targetEl.contains(e.target)) {
                    close(); if (opts.onCancel) opts.onCancel();
                }
            }
            setTimeout(function () { document.addEventListener('mousedown', outsideHandler); }, 10);

            return id;
        }

        function _close(id) {
            var inst = _instances[id];
            if (!inst) return;
            inst.pop.style.opacity = '0'; inst.pop.style.transition = 'all .15s';
            setTimeout(function () { if (inst.pop.parentNode) inst.pop.remove(); }, 150);
            delete _instances[id];
        }

        function _closeAll() { Object.keys(_instances).forEach(function (id) { _close(id); }); }

        function _bind(el, opts) {
            var targetEl = _getEl(el);
            if (!targetEl) return;
            var key = targetEl.id || ('_zpc_' + (++_uid));
            if (!targetEl.id) targetEl.id = key;
            var handler = function (e) {
                e.stopPropagation();
                _closeAll();
                _show(targetEl, opts);
            };
            targetEl.addEventListener('click', handler);
            _bindings[key] = { el: targetEl, handler: handler };
        }

        function _unbind(el) {
            var targetEl = _getEl(el);
            if (!targetEl) return;
            var key = targetEl.id;
            if (key && _bindings[key]) {
                targetEl.removeEventListener('click', _bindings[key].handler);
                delete _bindings[key];
            }
        }

        return {
            show: _show,
            close: _close,
            closeAll: _closeAll,
            bind: _bind,
            unbind: _unbind
        };
    });



    return Z;
})();
