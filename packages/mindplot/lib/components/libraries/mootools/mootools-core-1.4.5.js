/*
 ---
 MooTools: the javascript framework

 web build:
 - http://mootools.net/core/b28139f033891d55fabb70ffafd6813b

 packager build:
 - packager build Core/Core Core/Array Core/Class Core/Class.Extras

 copyrights:
 - [MooTools](http://mootools.net)

 licenses:
 - [MIT License](http://mootools.net/license.txt)
 ...
 */

(function () {
  this.MooTools = { version: '1.4.5', build: 'ab8ea8824dc3b24b6666867a2c4ed58ebb762cf0' }; const o = this.typeOf = function (i) {
    if (i == null) { return 'null'; } if (i.$family != null) {
      return i.$family();
    } if (i.nodeName) { if (i.nodeType == 1) { return 'element'; } if (i.nodeType == 3) { return (/\S/).test(i.nodeValue) ? 'textnode' : 'whitespace'; } } else if (typeof i.length === 'number') {
      if (i.callee) {
        return 'arguments';
      } if ('item' in i) { return 'collection'; }
    } return typeof i;
  }; const j = this.instanceOf = function (t, i) {
    if (t == null) { return false; } let s = t.$constructor || t.constructor;
    while (s) { if (s === i) { return true; }s = s.parent; } if (!t.hasOwnProperty) { return false; } return t instanceof i;
  }; const f = this.Function; let p = true; for (const k in { toString: 1 }) {
    p = null;
  } if (p) { p = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor']; }f.prototype.overloadSetter = function (s) {
    const i = this;
    return function (u, t) {
      if (u == null) { return this; } if (s || typeof u !== 'string') {
        for (var v in u) { i.call(this, v, u[v]); } if (p) {
          for (let w = p.length; w--;) {
            v = p[w]; if (u.hasOwnProperty(v)) {
              i.call(this, v, u[v]);
            }
          }
        }
      } else { i.call(this, u, t); } return this;
    };
  }; f.prototype.overloadGetter = function (s) {
    const i = this; return function (u) {
      let v; let t; if (typeof u !== 'string') { v = u; } else if (arguments.length > 1) {
        v = arguments;
      } else if (s) { v = [u]; } if (v) { t = {}; for (let w = 0; w < v.length; w++) { t[v[w]] = i.call(this, v[w]); } } else { t = i.call(this, u); } return t;
    };
  }; f.prototype.extend = function (i, s) {
    this[i] = s;
  }.overloadSetter(); f.prototype.implement = function (i, s) { this.prototype[i] = s; }.overloadSetter(); const n = Array.prototype.slice; f.from = function (i) {
    return (o(i) == 'function') ? i : function () {
      return i;
    };
  }; Array.from = function (i) { if (i == null) { return []; } return (a.isEnumerable(i) && typeof i !== 'string') ? (o(i) == 'array') ? i : n.call(i) : [i]; }; Number.from = function (s) {
    const i = parseFloat(s);
    return isFinite(i) ? i : null;
  }; String.from = function (i) { return `${i}`; }; f.implement({
    hide() { this.$hidden = true; return this; },
    protect() {
      this.$protected = true;
      return this;
    },
  }); var a = this.Type = function (u, t) {
    if (u) {
      const s = u.toLowerCase(); const i = function (v) { return (o(v) == s); }; a[`is${u}`] = i; if (t != null) {
        t.prototype.$family = (function () {
          return s;
        }).hide();
      }
    } if (t == null) { return null; }t.extend(this); t.$constructor = a; t.prototype.$constructor = t; return t;
  }; const e = Object.prototype.toString; a.isEnumerable = function (i) {
    return (i != null && typeof i.length === 'number' && e.call(i) != '[object Function]');
  }; const q = {}; const r = function (i) { const s = o(i.prototype); return q[s] || (q[s] = []); }; var b = function (t, x) {
    if (x && x.$hidden) { return; } const s = r(this); for (let u = 0; u < s.length;
      u++) { const w = s[u]; if (o(w) == 'type') { b.call(w, t, x); } else { w.call(this, t, x); } } const v = this.prototype[t]; if (v == null || !v.$protected) { this.prototype[t] = x; } if (this[t] == null && o(x) == 'function') {
      m.call(this, t, function (i) {
        return x.apply(i, n.call(arguments, 1));
      });
    }
  }; var m = function (i, t) { if (t && t.$hidden) { return; } const s = this[i]; if (s == null || !s.$protected) { this[i] = t; } }; a.implement({
    implement: b.overloadSetter(),
    extend: m.overloadSetter(),
    alias: function (i, s) {
      b.call(this, i, this.prototype[s]);
    }.overloadSetter(),
    mirror(i) { r(this).push(i); return this; },
  }); new a('Type', a); var d = function (s, x, v) {
    const u = (x != Object); const B = x.prototype; if (u) {
      x = new a(s, x);
    } for (let y = 0, w = v.length; y < w; y++) { const C = v[y]; const A = x[C]; const z = B[C]; if (A) { A.protect(); } if (u && z) { x.implement(C, z.protect()); } } if (u) {
      const t = B.propertyIsEnumerable(v[0]);
      x.forEachMethod = function (G) { if (!t) { for (let F = 0, D = v.length; F < D; F++) { G.call(B, B[v[F]], v[F]); } } for (const E in B) { G.call(B, B[E], E); } };
    } return d;
  }; d('String', String, ['charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'match', 'quote', 'replace', 'search', 'slice', 'split', 'substr', 'substring', 'trim', 'toLowerCase', 'toUpperCase'])('Array', Array, ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice', 'indexOf', 'lastIndexOf', 'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'])('Number', Number, ['toExponential', 'toFixed', 'toLocaleString', 'toPrecision'])('Function', f, ['apply', 'call', 'bind'])('RegExp', RegExp, ['exec', 'test'])('Object', Object, ['create', 'defineProperty', 'defineProperties', 'keys', 'getPrototypeOf', 'getOwnPropertyDescriptor', 'getOwnPropertyNames', 'preventExtensions', 'isExtensible', 'seal', 'isSealed', 'freeze', 'isFrozen'])('Date', Date, ['now']);
  Object.extend = m.overloadSetter(); Date.extend('now', () => +(new Date())); new a('Boolean', Boolean); Number.prototype.$family = function () {
    return isFinite(this) ? 'number' : 'null';
  }.hide(); Number.extend('random', (s, i) => Math.floor(Math.random() * (i - s + 1) + s)); const g = Object.prototype.hasOwnProperty; Object.extend('forEach', (i, t, u) => {
    for (const s in i) {
      if (g.call(i, s)) {
        t.call(u, i[s], s, i);
      }
    }
  }); Object.each = Object.forEach; Array.implement({
    forEach(u, v) { for (let t = 0, s = this.length; t < s; t++) { if (t in this) { u.call(v, this[t], t, this); } } },
    each(i, s) {
      Array.forEach(this, i, s);
      return this;
    },
  }); const l = function (i) { switch (o(i)) { case 'array': return i.clone(); case 'object': return Object.clone(i); default: return i; } }; Array.implement('clone', function () {
    let s = this.length; const t = new Array(s);
    while (s--) { t[s] = l(this[s]); } return t;
  }); const h = function (s, i, t) {
    switch (o(t)) {
      case 'object': if (o(s[i]) == 'object') { Object.merge(s[i], t); } else {
        s[i] = Object.clone(t);
      } break; case 'array': s[i] = t.clone(); break; default: s[i] = t;
    } return s;
  }; Object.extend({
    merge(z, u, t) {
      if (o(u) == 'string') { return h(z, u, t); } for (let y = 1, s = arguments.length;
        y < s; y++) { const w = arguments[y]; for (const x in w) { h(z, x, w[x]); } } return z;
    },
    clone(i) { const t = {}; for (const s in i) { t[s] = l(i[s]); } return t; },
    append(w) {
      for (let v = 1, t = arguments.length;
        v < t; v++) { const s = arguments[v] || {}; for (const u in s) { w[u] = s[u]; } } return w;
    },
  }); ['Object', 'WhiteSpace', 'TextNode', 'Collection', 'Arguments'].each((i) => {
    new a(i);
  }); let c = Date.now(); String.extend('uniqueID', () => (c++).toString(36));
}()); Array.implement({
  every(c, d) {
    for (let b = 0, a = this.length >>> 0;
      b < a; b++) { if ((b in this) && !c.call(d, this[b], b, this)) { return false; } } return true;
  },
  filter(d, f) {
    const c = []; for (var e, b = 0, a = this.length >>> 0; b < a; b++) {
      if (b in this) {
        e = this[b];
        if (d.call(f, e, b, this)) { c.push(e); }
      }
    } return c;
  },
  indexOf(c, d) {
    const b = this.length >>> 0; for (let a = (d < 0) ? Math.max(0, b + d) : d || 0; a < b; a++) {
      if (this[a] === c) {
        return a;
      }
    } return -1;
  },
  map(c, e) { const d = this.length >>> 0; const b = Array(d); for (let a = 0; a < d; a++) { if (a in this) { b[a] = c.call(e, this[a], a, this); } } return b; },
  some(c, d) {
    for (let b = 0, a = this.length >>> 0;
      b < a; b++) { if ((b in this) && c.call(d, this[b], b, this)) { return true; } } return false;
  },
  clean() { return this.filter((a) => a != null); },
  invoke(a) {
    const b = Array.slice(arguments, 1);
    return this.map((c) => c[a].apply(c, b));
  },
  associate(c) {
    const d = {}; const b = Math.min(this.length, c.length); for (let a = 0; a < b; a++) {
      d[c[a]] = this[a];
    } return d;
  },
  link(c) { const a = {}; for (let e = 0, b = this.length; e < b; e++) { for (const d in c) { if (c[d](this[e])) { a[d] = this[e]; delete c[d]; break; } } } return a; },
  contains(a, b) {
    return this.indexOf(a, b) != -1;
  },
  append(a) { this.push.apply(this, a); return this; },
  getLast() { return (this.length) ? this[this.length - 1] : null; },
  getRandom() {
    return (this.length) ? this[Number.random(0, this.length - 1)] : null;
  },
  include(a) { if (!this.contains(a)) { this.push(a); } return this; },
  combine(c) {
    for (let b = 0, a = c.length; b < a; b++) { this.include(c[b]); } return this;
  },
  erase(b) { for (let a = this.length; a--;) { if (this[a] === b) { this.splice(a, 1); } } return this; },
  empty() { this.length = 0; return this; },
  flatten() {
    let d = [];
    for (let b = 0, a = this.length; b < a; b++) {
      const c = typeOf(this[b]); if (c == 'null') { continue; }d = d.concat((c == 'array' || c == 'collection' || c == 'arguments' || instanceOf(this[b], Array)) ? Array.flatten(this[b]) : this[b]);
    } return d;
  },
  pick() { for (let b = 0, a = this.length; b < a; b++) { if (this[b] != null) { return this[b]; } } return null; },
  rgbToHex(d) {
    if (this.length < 3) { return null; } if (this.length == 4 && this[3] == 0 && !d) {
      return 'transparent';
    } const b = []; for (let a = 0; a < 3; a++) { const c = (this[a] - 0).toString(16); b.push((c.length == 1) ? `0${c}` : c); } return (d) ? b : `#${b.join('')}`;
  },
}); String.implement({
  test(a, b) {
    return ((typeOf(a) == 'regexp') ? a : new RegExp(`${a}`, b)).test(this);
  },
  contains(a, b) { return (b) ? (b + this + b).indexOf(b + a + b) > -1 : String(this).indexOf(a) > -1; },
  trim() {
    return String(this).replace(/^\s+|\s+$/g, '');
  },
  clean() { return String(this).replace(/\s+/g, ' ').trim(); },
  camelCase() {
    return String(this).replace(/-\D/g, (a) => a.charAt(1).toUpperCase());
  },
  hyphenate() { return String(this).replace(/[A-Z]/g, (a) => (`-${a.charAt(0).toLowerCase()}`)); },
  capitalize() {
    return String(this).replace(/\b[a-z]/g, (a) => a.toUpperCase());
  },
  escapeRegExp() { return String(this).replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1'); },
  rgbToHex(b) {
    const a = String(this).match(/\d{1,3}/g);
    return (a) ? a.rgbToHex(b) : null;
  },
  substitute(a, b) {
    return String(this).replace(b || (/\\?\{([^{}]+)\}/g), (d, c) => {
      if (d.charAt(0) == '\\') {
        return d.slice(1);
      } return (a[c] != null) ? a[c] : '';
    });
  },
});
Function.implement({ bind(e) { const a = this; const b = arguments.length > 1 ? Array.slice(arguments, 1) : null; const d = function () {}; var c = function () { let g = e; const h = arguments.length; if (this instanceof c) { d.prototype = a.prototype; g = new d(); } const f = (!b && !h) ? a.call(g) : a.apply(g, b && h ? b.concat(Array.slice(arguments)) : b || arguments); return g == e ? f : g; }; return c; }, pass(b, c) { const a = this; if (b != null) { b = Array.from(b); } return function () { return a.apply(c, b || arguments); }; }, delay(b, c, a) { return setTimeout(this.pass((a == null ? [] : a), c), b); } });
Number.alias('each', 'times'); (function (b) {
  const a = {}; b.each((c) => {
    if (!Number[c]) {
      a[c] = function () {
        return Math[c].apply(null, [this].concat(Array.from(arguments)));
      };
    }
  }); Number.implement(a);
}(['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'sin', 'sqrt', 'tan'])); (function () {
  var a = this.Class = new Type('Class', function (h) {
    if (instanceOf(h, Function)) {
      h = { initialize: h };
    } var g = function () {
      e(this); if (g.$prototyping) { return this; } this.$caller = null; const i = (this.initialize) ? this.initialize.apply(this, arguments) : this; this.$caller = this.caller = null;
      return i;
    }.extend(this).implement(h); g.$constructor = a; g.prototype.$constructor = g; g.prototype.parent = c; return g;
  }); var c = function () {
    if (!this.$caller) {
      throw new Error('The method "parent" cannot be called.');
    } const g = this.$caller.$name; const h = this.$caller.$owner.parent; const i = (h) ? h.prototype[g] : null; if (!i) { throw new Error(`The method "${g}" has no parent.`); } return i.apply(this, arguments);
  }; var e = function (g) {
    for (const h in g) {
      const j = g[h]; switch (typeOf(j)) {
        case 'object': var i = function () {}; i.prototype = j; g[h] = e(new i()); break; case 'array': g[h] = j.clone();
          break;
      }
    } return g;
  }; const b = function (g, h, j) {
    if (j.$origin) { j = j.$origin; } var i = function () {
      if (j.$protected && this.$caller == null) {
        throw new Error(`The method "${h}" cannot be called.`);
      } const l = this.caller; const m = this.$caller; this.caller = m; this.$caller = i; const k = j.apply(this, arguments); this.$caller = m; this.caller = l; return k;
    }.extend({ $owner: g, $origin: j, $name: h });
    return i;
  }; const f = function (h, i, g) {
    if (a.Mutators.hasOwnProperty(h)) { i = a.Mutators[h].call(this, i); if (i == null) { return this; } } if (typeOf(i) == 'function') {
      if (i.$hidden) {
        return this;
      } this.prototype[h] = (g) ? i : b(this, h, i);
    } else { Object.merge(this.prototype, h, i); } return this;
  }; const d = function (g) {
    g.$prototyping = true; const h = new g(); delete g.$prototyping;
    return h;
  }; a.implement('implement', f.overloadSetter()); a.Mutators = { Extends(g) { this.parent = g; this.prototype = d(g); }, Implements(g) { Array.from(g).each(function (j) { const h = new j(); for (const i in h) { f.call(this, i, h[i], true); } }, this); } };
}());
