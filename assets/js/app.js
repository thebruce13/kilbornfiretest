/**
 * what-input - A global utility for tracking the current input method (mouse, keyboard or touch).
 * @version v4.3.1
 * @link https://github.com/ten1seven/what-input
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("whatInput", [], factory);
	else if(typeof exports === 'object')
		exports["whatInput"] = factory();
	else
		root["whatInput"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
	  /*
	   * variables
	   */

	  // last used input type
	  var currentInput = 'initial';

	  // last used input intent
	  var currentIntent = null;

	  // cache document.documentElement
	  var doc = document.documentElement;

	  // form input types
	  var formInputs = ['input', 'select', 'textarea'];

	  var functionList = [];

	  // list of modifier keys commonly used with the mouse and
	  // can be safely ignored to prevent false keyboard detection
	  var ignoreMap = [16, // shift
	  17, // control
	  18, // alt
	  91, // Windows key / left Apple cmd
	  93 // Windows menu / right Apple cmd
	  ];

	  // list of keys for which we change intent even for form inputs
	  var changeIntentMap = [9 // tab
	  ];

	  // mapping of events to input types
	  var inputMap = {
	    keydown: 'keyboard',
	    keyup: 'keyboard',
	    mousedown: 'mouse',
	    mousemove: 'mouse',
	    MSPointerDown: 'pointer',
	    MSPointerMove: 'pointer',
	    pointerdown: 'pointer',
	    pointermove: 'pointer',
	    touchstart: 'touch'
	  };

	  // array of all used input types
	  var inputTypes = [];

	  // boolean: true if touch buffer is active
	  var isBuffering = false;

	  // boolean: true if the page is being scrolled
	  var isScrolling = false;

	  // store current mouse position
	  var mousePos = {
	    x: null,
	    y: null
	  };

	  // map of IE 10 pointer events
	  var pointerMap = {
	    2: 'touch',
	    3: 'touch', // treat pen like touch
	    4: 'mouse'
	  };

	  var supportsPassive = false;

	  try {
	    var opts = Object.defineProperty({}, 'passive', {
	      get: function get() {
	        supportsPassive = true;
	      }
	    });

	    window.addEventListener('test', null, opts);
	  } catch (e) {}

	  /*
	   * set up
	   */

	  var setUp = function setUp() {
	    // add correct mouse wheel event mapping to `inputMap`
	    inputMap[detectWheel()] = 'mouse';

	    addListeners();
	    setInput();
	  };

	  /*
	   * events
	   */

	  var addListeners = function addListeners() {
	    // `pointermove`, `MSPointerMove`, `mousemove` and mouse wheel event binding
	    // can only demonstrate potential, but not actual, interaction
	    // and are treated separately
	    var options = supportsPassive ? { passive: true } : false;

	    // pointer events (mouse, pen, touch)
	    if (window.PointerEvent) {
	      doc.addEventListener('pointerdown', updateInput);
	      doc.addEventListener('pointermove', setIntent);
	    } else if (window.MSPointerEvent) {
	      doc.addEventListener('MSPointerDown', updateInput);
	      doc.addEventListener('MSPointerMove', setIntent);
	    } else {
	      // mouse events
	      doc.addEventListener('mousedown', updateInput);
	      doc.addEventListener('mousemove', setIntent);

	      // touch events
	      if ('ontouchstart' in window) {
	        doc.addEventListener('touchstart', touchBuffer, options);
	        doc.addEventListener('touchend', touchBuffer);
	      }
	    }

	    // mouse wheel
	    doc.addEventListener(detectWheel(), setIntent, options);

	    // keyboard events
	    doc.addEventListener('keydown', updateInput);
	    doc.addEventListener('keyup', updateInput);
	  };

	  // checks conditions before updating new input
	  var updateInput = function updateInput(event) {
	    // only execute if the touch buffer timer isn't running
	    if (!isBuffering) {
	      var eventKey = event.which;
	      var value = inputMap[event.type];
	      if (value === 'pointer') value = pointerType(event);

	      if (currentInput !== value || currentIntent !== value) {
	        var activeElem = document.activeElement;
	        var activeInput = false;
	        var notFormInput = activeElem && activeElem.nodeName && formInputs.indexOf(activeElem.nodeName.toLowerCase()) === -1;

	        if (notFormInput || changeIntentMap.indexOf(eventKey) !== -1) {
	          activeInput = true;
	        }

	        if (value === 'touch' ||
	        // ignore mouse modifier keys
	        value === 'mouse' ||
	        // don't switch if the current element is a form input
	        value === 'keyboard' && eventKey && activeInput && ignoreMap.indexOf(eventKey) === -1) {
	          // set the current and catch-all variable
	          currentInput = currentIntent = value;

	          setInput();
	        }
	      }
	    }
	  };

	  // updates the doc and `inputTypes` array with new input
	  var setInput = function setInput() {
	    doc.setAttribute('data-whatinput', currentInput);
	    doc.setAttribute('data-whatintent', currentInput);

	    if (inputTypes.indexOf(currentInput) === -1) {
	      inputTypes.push(currentInput);
	      doc.className += ' whatinput-types-' + currentInput;
	    }

	    fireFunctions('input');
	  };

	  // updates input intent for `mousemove` and `pointermove`
	  var setIntent = function setIntent(event) {
	    // test to see if `mousemove` happened relative to the screen
	    // to detect scrolling versus mousemove
	    if (mousePos['x'] !== event.screenX || mousePos['y'] !== event.screenY) {
	      isScrolling = false;

	      mousePos['x'] = event.screenX;
	      mousePos['y'] = event.screenY;
	    } else {
	      isScrolling = true;
	    }

	    // only execute if the touch buffer timer isn't running
	    // or scrolling isn't happening
	    if (!isBuffering && !isScrolling) {
	      var value = inputMap[event.type];
	      if (value === 'pointer') value = pointerType(event);

	      if (currentIntent !== value) {
	        currentIntent = value;

	        doc.setAttribute('data-whatintent', currentIntent);

	        fireFunctions('intent');
	      }
	    }
	  };

	  // buffers touch events because they frequently also fire mouse events
	  var touchBuffer = function touchBuffer(event) {
	    if (event.type === 'touchstart') {
	      isBuffering = false;

	      // set the current input
	      updateInput(event);
	    } else {
	      isBuffering = true;
	    }
	  };

	  var fireFunctions = function fireFunctions(type) {
	    for (var i = 0, len = functionList.length; i < len; i++) {
	      if (functionList[i].type === type) {
	        functionList[i].fn.call(undefined, currentIntent);
	      }
	    }
	  };

	  /*
	   * utilities
	   */

	  var pointerType = function pointerType(event) {
	    if (typeof event.pointerType === 'number') {
	      return pointerMap[event.pointerType];
	    } else {
	      // treat pen like touch
	      return event.pointerType === 'pen' ? 'touch' : event.pointerType;
	    }
	  };

	  // detect version of mouse wheel event to use
	  // via https://developer.mozilla.org/en-US/docs/Web/Events/wheel
	  var detectWheel = function detectWheel() {
	    var wheelType = void 0;

	    // Modern browsers support "wheel"
	    if ('onwheel' in document.createElement('div')) {
	      wheelType = 'wheel';
	    } else {
	      // Webkit and IE support at least "mousewheel"
	      // or assume that remaining browsers are older Firefox
	      wheelType = document.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
	    }

	    return wheelType;
	  };

	  var objPos = function objPos(match) {
	    for (var i = 0, len = functionList.length; i < len; i++) {
	      if (functionList[i].fn === match) {
	        return i;
	      }
	    }
	  };

	  /*
	   * init
	   */

	  // don't start script unless browser cuts the mustard
	  // (also passes if polyfills are used)
	  if ('addEventListener' in window && Array.prototype.indexOf) {
	    setUp();
	  }

	  /*
	   * api
	   */

	  return {
	    // returns string: the current input type
	    // opt: 'loose'|'strict'
	    // 'strict' (default): returns the same value as the `data-whatinput` attribute
	    // 'loose': includes `data-whatintent` value if it's more current than `data-whatinput`
	    ask: function ask(opt) {
	      return opt === 'loose' ? currentIntent : currentInput;
	    },

	    // returns array: all the detected input types
	    types: function types() {
	      return inputTypes;
	    },

	    // overwrites ignored keys with provided array
	    ignoreKeys: function ignoreKeys(arr) {
	      ignoreMap = arr;
	    },

	    // attach functions to input and intent "events"
	    // funct: function to fire on change
	    // eventType: 'input'|'intent'
	    registerOnChange: function registerOnChange(fn, eventType) {
	      functionList.push({
	        fn: fn,
	        type: eventType || 'input'
	      });
	    },

	    unRegisterOnChange: function unRegisterOnChange(fn) {
	      var position = objPos(fn);

	      if (position) {
	        functionList.splice(position, 1);
	      }
	    }
	  };
	}();

/***/ }
/******/ ])
});
;
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*! lazysizes - v3.0.0 */
!function (a, b) {
  var c = b(a, a.document);a.lazySizes = c, "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports && (module.exports = c);
}(window, function (a, b) {
  "use strict";
  if (b.getElementsByClassName) {
    var c,
        d = b.documentElement,
        e = a.Date,
        f = a.HTMLPictureElement,
        g = "addEventListener",
        h = "getAttribute",
        i = a[g],
        j = a.setTimeout,
        k = a.requestAnimationFrame || j,
        l = a.requestIdleCallback,
        m = /^picture$/i,
        n = ["load", "error", "lazyincluded", "_lazyloaded"],
        o = {},
        p = Array.prototype.forEach,
        q = function q(a, b) {
      return o[b] || (o[b] = new RegExp("(\\s|^)" + b + "(\\s|$)")), o[b].test(a[h]("class") || "") && o[b];
    },
        r = function r(a, b) {
      q(a, b) || a.setAttribute("class", (a[h]("class") || "").trim() + " " + b);
    },
        s = function s(a, b) {
      var c;(c = q(a, b)) && a.setAttribute("class", (a[h]("class") || "").replace(c, " "));
    },
        t = function t(a, b, c) {
      var d = c ? g : "removeEventListener";c && t(a, b), n.forEach(function (c) {
        a[d](c, b);
      });
    },
        u = function u(a, c, d, e, f) {
      var g = b.createEvent("CustomEvent");return g.initCustomEvent(c, !e, !f, d || {}), a.dispatchEvent(g), g;
    },
        v = function v(b, d) {
      var e;!f && (e = a.picturefill || c.pf) ? e({ reevaluate: !0, elements: [b] }) : d && d.src && (b.src = d.src);
    },
        w = function w(a, b) {
      return (getComputedStyle(a, null) || {})[b];
    },
        x = function x(a, b, d) {
      for (d = d || a.offsetWidth; d < c.minSize && b && !a._lazysizesWidth;) {
        d = b.offsetWidth, b = b.parentNode;
      }return d;
    },
        y = function () {
      var a,
          c,
          d = [],
          e = [],
          f = d,
          g = function g() {
        var b = f;for (f = d.length ? e : d, a = !0, c = !1; b.length;) {
          b.shift()();
        }a = !1;
      },
          h = function h(d, e) {
        a && !e ? d.apply(this, arguments) : (f.push(d), c || (c = !0, (b.hidden ? j : k)(g)));
      };return h._lsFlush = g, h;
    }(),
        z = function z(a, b) {
      return b ? function () {
        y(a);
      } : function () {
        var b = this,
            c = arguments;y(function () {
          a.apply(b, c);
        });
      };
    },
        A = function A(a) {
      var b,
          c = 0,
          d = 125,
          f = 666,
          g = f,
          h = function h() {
        b = !1, c = e.now(), a();
      },
          i = l ? function () {
        l(h, { timeout: g }), g !== f && (g = f);
      } : z(function () {
        j(h);
      }, !0);return function (a) {
        var f;(a = a === !0) && (g = 44), b || (b = !0, f = d - (e.now() - c), 0 > f && (f = 0), a || 9 > f && l ? i() : j(i, f));
      };
    },
        B = function B(a) {
      var b,
          c,
          d = 99,
          f = function f() {
        b = null, a();
      },
          g = function g() {
        var a = e.now() - c;d > a ? j(g, d - a) : (l || f)(f);
      };return function () {
        c = e.now(), b || (b = j(g, d));
      };
    },
        C = function () {
      var f,
          k,
          l,
          n,
          o,
          x,
          C,
          E,
          F,
          G,
          H,
          I,
          J,
          K,
          L,
          M = /^img$/i,
          N = /^iframe$/i,
          O = "onscroll" in a && !/glebot/.test(navigator.userAgent),
          P = 0,
          Q = 0,
          R = 0,
          S = -1,
          T = function T(a) {
        R--, a && a.target && t(a.target, T), (!a || 0 > R || !a.target) && (R = 0);
      },
          U = function U(a, c) {
        var e,
            f = a,
            g = "hidden" == w(b.body, "visibility") || "hidden" != w(a, "visibility");for (F -= c, I += c, G -= c, H += c; g && (f = f.offsetParent) && f != b.body && f != d;) {
          g = (w(f, "opacity") || 1) > 0, g && "visible" != w(f, "overflow") && (e = f.getBoundingClientRect(), g = H > e.left && G < e.right && I > e.top - 1 && F < e.bottom + 1);
        }return g;
      },
          V = function V() {
        var a, e, g, i, j, m, n, p, q;if ((o = c.loadMode) && 8 > R && (a = f.length)) {
          e = 0, S++, null == K && ("expand" in c || (c.expand = d.clientHeight > 500 && d.clientWidth > 500 ? 500 : 370), J = c.expand, K = J * c.expFactor), K > Q && 1 > R && S > 2 && o > 2 && !b.hidden ? (Q = K, S = 0) : Q = o > 1 && S > 1 && 6 > R ? J : P;for (; a > e; e++) {
            if (f[e] && !f[e]._lazyRace) if (O) {
              if ((p = f[e][h]("data-expand")) && (m = 1 * p) || (m = Q), q !== m && (C = innerWidth + m * L, E = innerHeight + m, n = -1 * m, q = m), g = f[e].getBoundingClientRect(), (I = g.bottom) >= n && (F = g.top) <= E && (H = g.right) >= n * L && (G = g.left) <= C && (I || H || G || F) && (l && 3 > R && !p && (3 > o || 4 > S) || U(f[e], m))) {
                if (ba(f[e]), j = !0, R > 9) break;
              } else !j && l && !i && 4 > R && 4 > S && o > 2 && (k[0] || c.preloadAfterLoad) && (k[0] || !p && (I || H || G || F || "auto" != f[e][h](c.sizesAttr))) && (i = k[0] || f[e]);
            } else ba(f[e]);
          }i && !j && ba(i);
        }
      },
          W = A(V),
          X = function X(a) {
        r(a.target, c.loadedClass), s(a.target, c.loadingClass), t(a.target, Z);
      },
          Y = z(X),
          Z = function Z(a) {
        Y({ target: a.target });
      },
          $ = function $(a, b) {
        try {
          a.contentWindow.location.replace(b);
        } catch (c) {
          a.src = b;
        }
      },
          _ = function _(a) {
        var b,
            d,
            e = a[h](c.srcsetAttr);(b = c.customMedia[a[h]("data-media") || a[h]("media")]) && a.setAttribute("media", b), e && a.setAttribute("srcset", e), b && (d = a.parentNode, d.insertBefore(a.cloneNode(), a), d.removeChild(a));
      },
          aa = z(function (a, b, d, e, f) {
        var g, i, k, l, o, q;(o = u(a, "lazybeforeunveil", b)).defaultPrevented || (e && (d ? r(a, c.autosizesClass) : a.setAttribute("sizes", e)), i = a[h](c.srcsetAttr), g = a[h](c.srcAttr), f && (k = a.parentNode, l = k && m.test(k.nodeName || "")), q = b.firesLoad || "src" in a && (i || g || l), o = { target: a }, q && (t(a, T, !0), clearTimeout(n), n = j(T, 2500), r(a, c.loadingClass), t(a, Z, !0)), l && p.call(k.getElementsByTagName("source"), _), i ? a.setAttribute("srcset", i) : g && !l && (N.test(a.nodeName) ? $(a, g) : a.src = g), (i || l) && v(a, { src: g })), a._lazyRace && delete a._lazyRace, s(a, c.lazyClass), y(function () {
          (!q || a.complete && a.naturalWidth > 1) && (q ? T(o) : R--, X(o));
        }, !0);
      }),
          ba = function ba(a) {
        var b,
            d = M.test(a.nodeName),
            e = d && (a[h](c.sizesAttr) || a[h]("sizes")),
            f = "auto" == e;(!f && l || !d || !a.src && !a.srcset || a.complete || q(a, c.errorClass)) && (b = u(a, "lazyunveilread").detail, f && D.updateElem(a, !0, a.offsetWidth), a._lazyRace = !0, R++, aa(a, b, f, e, d));
      },
          ca = function ca() {
        if (!l) {
          if (e.now() - x < 999) return void j(ca, 999);var a = B(function () {
            c.loadMode = 3, W();
          });l = !0, c.loadMode = 3, W(), i("scroll", function () {
            3 == c.loadMode && (c.loadMode = 2), a();
          }, !0);
        }
      };return { _: function _() {
          x = e.now(), f = b.getElementsByClassName(c.lazyClass), k = b.getElementsByClassName(c.lazyClass + " " + c.preloadClass), L = c.hFac, i("scroll", W, !0), i("resize", W, !0), a.MutationObserver ? new MutationObserver(W).observe(d, { childList: !0, subtree: !0, attributes: !0 }) : (d[g]("DOMNodeInserted", W, !0), d[g]("DOMAttrModified", W, !0), setInterval(W, 999)), i("hashchange", W, !0), ["focus", "mouseover", "click", "load", "transitionend", "animationend", "webkitAnimationEnd"].forEach(function (a) {
            b[g](a, W, !0);
          }), /d$|^c/.test(b.readyState) ? ca() : (i("load", ca), b[g]("DOMContentLoaded", W), j(ca, 2e4)), f.length ? (V(), y._lsFlush()) : W();
        }, checkElems: W, unveil: ba };
    }(),
        D = function () {
      var a,
          d = z(function (a, b, c, d) {
        var e, f, g;if (a._lazysizesWidth = d, d += "px", a.setAttribute("sizes", d), m.test(b.nodeName || "")) for (e = b.getElementsByTagName("source"), f = 0, g = e.length; g > f; f++) {
          e[f].setAttribute("sizes", d);
        }c.detail.dataAttr || v(a, c.detail);
      }),
          e = function e(a, b, c) {
        var e,
            f = a.parentNode;f && (c = x(a, f, c), e = u(a, "lazybeforesizes", { width: c, dataAttr: !!b }), e.defaultPrevented || (c = e.detail.width, c && c !== a._lazysizesWidth && d(a, f, e, c)));
      },
          f = function f() {
        var b,
            c = a.length;if (c) for (b = 0; c > b; b++) {
          e(a[b]);
        }
      },
          g = B(f);return { _: function _() {
          a = b.getElementsByClassName(c.autosizesClass), i("resize", g);
        }, checkElems: g, updateElem: e };
    }(),
        E = function E() {
      E.i || (E.i = !0, D._(), C._());
    };return function () {
      var b,
          d = { lazyClass: "lazyload", loadedClass: "lazyloaded", loadingClass: "lazyloading", preloadClass: "lazypreload", errorClass: "lazyerror", autosizesClass: "lazyautosizes", srcAttr: "data-src", srcsetAttr: "data-srcset", sizesAttr: "data-sizes", minSize: 40, customMedia: {}, init: !0, expFactor: 1.5, hFac: .8, loadMode: 2 };c = a.lazySizesConfig || a.lazysizesConfig || {};for (b in d) {
        b in c || (c[b] = d[b]);
      }a.lazySizesConfig = c, j(function () {
        c.init && E();
      });
    }(), { cfg: c, autoSizer: D, loader: C, init: E, uP: v, aC: r, rC: s, hC: q, fire: u, gW: x, rAF: y };
  }
});
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/******/(function (modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/var installedModules = {};
  /******/
  /******/ // The require function
  /******/function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/if (installedModules[moduleId]) {
      /******/return installedModules[moduleId].exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/var module = installedModules[moduleId] = {
      /******/i: moduleId,
      /******/l: false,
      /******/exports: {}
      /******/ };
    /******/
    /******/ // Execute the module function
    /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ // Flag the module as loaded
    /******/module.l = true;
    /******/
    /******/ // Return the exports of the module
    /******/return module.exports;
    /******/
  }
  /******/
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/__webpack_require__.m = modules;
  /******/
  /******/ // expose the module cache
  /******/__webpack_require__.c = installedModules;
  /******/
  /******/ // identity function for calling harmony imports with the correct context
  /******/__webpack_require__.i = function (value) {
    return value;
  };
  /******/
  /******/ // define getter function for harmony exports
  /******/__webpack_require__.d = function (exports, name, getter) {
    /******/if (!__webpack_require__.o(exports, name)) {
      /******/Object.defineProperty(exports, name, {
        /******/configurable: false,
        /******/enumerable: true,
        /******/get: getter
        /******/ });
      /******/
    }
    /******/
  };
  /******/
  /******/ // getDefaultExport function for compatibility with non-harmony modules
  /******/__webpack_require__.n = function (module) {
    /******/var getter = module && module.__esModule ?
    /******/function getDefault() {
      return module['default'];
    } :
    /******/function getModuleExports() {
      return module;
    };
    /******/__webpack_require__.d(getter, 'a', getter);
    /******/return getter;
    /******/
  };
  /******/
  /******/ // Object.prototype.hasOwnProperty.call
  /******/__webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  /******/
  /******/ // __webpack_public_path__
  /******/__webpack_require__.p = "";
  /******/
  /******/ // Load entry module and return exports
  /******/return __webpack_require__(__webpack_require__.s = 6);
  /******/
})(
/************************************************************************/
/******/[
/* 0 */
/***/function (module, exports) {

  module.exports = jQuery;

  /***/
},
/* 1 */
/***/function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  /* harmony export (binding) */
  __webpack_require__.d(__webpack_exports__, "a", function () {
    return rtl;
  });
  /* harmony export (binding) */__webpack_require__.d(__webpack_exports__, "b", function () {
    return GetYoDigits;
  });
  /* harmony export (binding) */__webpack_require__.d(__webpack_exports__, "c", function () {
    return transitionend;
  });
  /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
  /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);

  // Core Foundation Utilities, utilized in a number of places.

  /**
   * Returns a boolean for RTL support
   */
  function rtl() {
    return __WEBPACK_IMPORTED_MODULE_0_jquery___default()('html').attr('dir') === 'rtl';
  }

  /**
   * returns a random base-36 uid with namespacing
   * @function
   * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
   * @param {String} namespace - name of plugin to be incorporated in uid, optional.
   * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
   * @returns {String} - unique id
   */
  function GetYoDigits(length, namespace) {
    length = length || 6;
    return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? '-' + namespace : '');
  }

  function transitionend($elem) {
    var transitions = {
      'transition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd',
      'MozTransition': 'transitionend',
      'OTransition': 'otransitionend'
    };
    var elem = document.createElement('div'),
        end;

    for (var t in transitions) {
      if (typeof elem.style[t] !== 'undefined') {
        end = transitions[t];
      }
    }
    if (end) {
      return end;
    } else {
      end = setTimeout(function () {
        $elem.triggerHandler('transitionend', [$elem]);
      }, 1);
      return 'transitionend';
    }
  }

  /***/
},
/* 2 */
/***/function (module, __webpack_exports__, __webpack_require__) {

  "use strict";

  Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
  /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
  /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
  /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_core__ = __webpack_require__(3);
  /* harmony import */var __WEBPACK_IMPORTED_MODULE_2__foundation_util_core__ = __webpack_require__(1);
  /* harmony import */var __WEBPACK_IMPORTED_MODULE_3__foundation_plugin__ = __webpack_require__(4);

  __WEBPACK_IMPORTED_MODULE_1__foundation_core__["a" /* Foundation */].addToJquery(__WEBPACK_IMPORTED_MODULE_0_jquery___default.a);

  // These are now separated out, but historically were a part of this module,
  // and since this is here for backwards compatibility we include them in
  // this entry.

  __WEBPACK_IMPORTED_MODULE_1__foundation_core__["a" /* Foundation */].rtl = __WEBPACK_IMPORTED_MODULE_2__foundation_util_core__["a" /* rtl */];
  __WEBPACK_IMPORTED_MODULE_1__foundation_core__["a" /* Foundation */].GetYoDigits = __WEBPACK_IMPORTED_MODULE_2__foundation_util_core__["b" /* GetYoDigits */];
  __WEBPACK_IMPORTED_MODULE_1__foundation_core__["a" /* Foundation */].transitionend = __WEBPACK_IMPORTED_MODULE_2__foundation_util_core__["c" /* transitionend */];

  // Every plugin depends on plugin now, we can include that on the core for the
  // script inclusion path.


  __WEBPACK_IMPORTED_MODULE_1__foundation_core__["a" /* Foundation */].Plugin = __WEBPACK_IMPORTED_MODULE_3__foundation_plugin__["a" /* Plugin */];

  window.Foundation = __WEBPACK_IMPORTED_MODULE_1__foundation_core__["a" /* Foundation */];

  /***/
},
/* 3 */
/***/function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  /* harmony export (binding) */
  __webpack_require__.d(__webpack_exports__, "a", function () {
    return Foundation;
  });
  /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
  /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
  /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_core__ = __webpack_require__(1);
  /* harmony import */var __WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__ = __webpack_require__(5);

  var FOUNDATION_VERSION = '6.4.3';

  // Global Foundation object
  // This is attached to the window, or used as a module for AMD/Browserify
  var Foundation = {
    version: FOUNDATION_VERSION,

    /**
     * Stores initialized plugins.
     */
    _plugins: {},

    /**
     * Stores generated unique ids for plugin instances
     */
    _uuids: [],

    /**
     * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
     * @param {Object} plugin - The constructor of the plugin.
     */
    plugin: function plugin(_plugin, name) {
      // Object key to use when adding to global Foundation object
      // Examples: Foundation.Reveal, Foundation.OffCanvas
      var className = name || functionName(_plugin);
      // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
      // Examples: data-reveal, data-off-canvas
      var attrName = hyphenate(className);

      // Add to the Foundation object and the plugins list (for reflowing)
      this._plugins[attrName] = this[className] = _plugin;
    },
    /**
     * @function
     * Populates the _uuids array with pointers to each individual plugin instance.
     * Adds the `zfPlugin` data-attribute to programmatically created plugins to allow use of $(selector).foundation(method) calls.
     * Also fires the initialization event for each plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @param {String} name - the name of the plugin, passed as a camelCased string.
     * @fires Plugin#init
     */
    registerPlugin: function registerPlugin(plugin, name) {
      var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
      plugin.uuid = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__foundation_util_core__["b" /* GetYoDigits */])(6, pluginName);

      if (!plugin.$element.attr('data-' + pluginName)) {
        plugin.$element.attr('data-' + pluginName, plugin.uuid);
      }
      if (!plugin.$element.data('zfPlugin')) {
        plugin.$element.data('zfPlugin', plugin);
      }
      /**
       * Fires when the plugin has initialized.
       * @event Plugin#init
       */
      plugin.$element.trigger('init.zf.' + pluginName);

      this._uuids.push(plugin.uuid);

      return;
    },
    /**
     * @function
     * Removes the plugins uuid from the _uuids array.
     * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
     * Also fires the destroyed event for the plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @fires Plugin#destroyed
     */
    unregisterPlugin: function unregisterPlugin(plugin) {
      var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

      this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
      plugin.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
      /**
       * Fires when the plugin has been destroyed.
       * @event Plugin#destroyed
       */
      .trigger('destroyed.zf.' + pluginName);
      for (var prop in plugin) {
        plugin[prop] = null; //clean up script to prep for garbage collection.
      }
      return;
    },

    /**
     * @function
     * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
     * @param {String} plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
     * @default If no argument is passed, reflow all currently active plugins.
     */
    reInit: function reInit(plugins) {
      var isJQ = plugins instanceof __WEBPACK_IMPORTED_MODULE_0_jquery___default.a;
      try {
        if (isJQ) {
          plugins.each(function () {
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).data('zfPlugin')._init();
          });
        } else {
          var type = typeof plugins === 'undefined' ? 'undefined' : _typeof(plugins),
              _this = this,
              fns = {
            'object': function object(plgs) {
              plgs.forEach(function (p) {
                p = hyphenate(p);
                __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-' + p + ']').foundation('_init');
              });
            },
            'string': function string() {
              plugins = hyphenate(plugins);
              __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-' + plugins + ']').foundation('_init');
            },
            'undefined': function undefined() {
              this['object'](Object.keys(_this._plugins));
            }
          };
          fns[type](plugins);
        }
      } catch (err) {
        console.error(err);
      } finally {
        return plugins;
      }
    },

    /**
     * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
     * @param {Object} elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
     * @param {String|Array} plugins - A list of plugins to initialize. Leave this out to initialize everything.
     */
    reflow: function reflow(elem, plugins) {

      // If plugins is undefined, just grab everything
      if (typeof plugins === 'undefined') {
        plugins = Object.keys(this._plugins);
      }
      // If plugins is a string, convert it to an array with one item
      else if (typeof plugins === 'string') {
          plugins = [plugins];
        }

      var _this = this;

      // Iterate through each plugin
      __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.each(plugins, function (i, name) {
        // Get the current plugin
        var plugin = _this._plugins[name];

        // Localize the search to all elements inside elem, as well as elem itself, unless elem === document
        var $elem = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');

        // For each plugin found, initialize it
        $elem.each(function () {
          var $el = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
              opts = {};
          // Don't double-dip on plugins
          if ($el.data('zfPlugin')) {
            console.warn("Tried to initialize " + name + " on an element that already has a Foundation plugin.");
            return;
          }

          if ($el.attr('data-options')) {
            var thing = $el.attr('data-options').split(';').forEach(function (e, i) {
              var opt = e.split(':').map(function (el) {
                return el.trim();
              });
              if (opt[0]) opts[opt[0]] = parseValue(opt[1]);
            });
          }
          try {
            $el.data('zfPlugin', new plugin(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this), opts));
          } catch (er) {
            console.error(er);
          } finally {
            return;
          }
        });
      });
    },
    getFnName: functionName,

    addToJquery: function addToJquery($) {
      // TODO: consider not making this a jQuery function
      // TODO: need way to reflow vs. re-initialize
      /**
       * The Foundation jQuery method.
       * @param {String|Array} method - An action to perform on the current jQuery object.
       */
      var foundation = function foundation(method) {
        var type = typeof method === 'undefined' ? 'undefined' : _typeof(method),
            $noJS = $('.no-js');

        if ($noJS.length) {
          $noJS.removeClass('no-js');
        }

        if (type === 'undefined') {
          //needs to initialize the Foundation object, or an individual plugin.
          __WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__["a" /* MediaQuery */]._init();
          Foundation.reflow(this);
        } else if (type === 'string') {
          //an individual method to invoke on a plugin or group of plugins
          var args = Array.prototype.slice.call(arguments, 1); //collect all the arguments, if necessary
          var plugClass = this.data('zfPlugin'); //determine the class of plugin

          if (plugClass !== undefined && plugClass[method] !== undefined) {
            //make sure both the class and method exist
            if (this.length === 1) {
              //if there's only one, call it directly.
              plugClass[method].apply(plugClass, args);
            } else {
              this.each(function (i, el) {
                //otherwise loop through the jQuery collection and invoke the method on each
                plugClass[method].apply($(el).data('zfPlugin'), args);
              });
            }
          } else {
            //error for no class or no method
            throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
          }
        } else {
          //error for invalid argument type
          throw new TypeError('We\'re sorry, ' + type + ' is not a valid parameter. You must use a string representing the method you wish to invoke.');
        }
        return this;
      };
      $.fn.foundation = foundation;
      return $;
    }
  };

  Foundation.util = {
    /**
     * Function for applying a debounce effect to a function call.
     * @function
     * @param {Function} func - Function to be called at end of timeout.
     * @param {Number} delay - Time in ms to delay the call of `func`.
     * @returns function
     */
    throttle: function throttle(func, delay) {
      var timer = null;

      return function () {
        var context = this,
            args = arguments;

        if (timer === null) {
          timer = setTimeout(function () {
            func.apply(context, args);
            timer = null;
          }, delay);
        }
      };
    }
  };

  window.Foundation = Foundation;

  // Polyfill for requestAnimationFrame
  (function () {
    if (!Date.now || !window.Date.now) window.Date.now = Date.now = function () {
      return new Date().getTime();
    };

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function (callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function () {
          callback(lastTime = nextTime);
        }, nextTime - now);
      };
      window.cancelAnimationFrame = clearTimeout;
    }
    /**
     * Polyfill for performance.now, required by rAF
     */
    if (!window.performance || !window.performance.now) {
      window.performance = {
        start: Date.now(),
        now: function now() {
          return Date.now() - this.start;
        }
      };
    }
  })();
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP = function fNOP() {},
          fBound = function fBound() {
        return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      if (this.prototype) {
        // native functions don't have a prototype
        fNOP.prototype = this.prototype;
      }
      fBound.prototype = new fNOP();

      return fBound;
    };
  }
  // Polyfill to get the name of a function in IE9
  function functionName(fn) {
    if (Function.prototype.name === undefined) {
      var funcNameRegex = /function\s([^(]{1,})\(/;
      var results = funcNameRegex.exec(fn.toString());
      return results && results.length > 1 ? results[1].trim() : "";
    } else if (fn.prototype === undefined) {
      return fn.constructor.name;
    } else {
      return fn.prototype.constructor.name;
    }
  }
  function parseValue(str) {
    if ('true' === str) return true;else if ('false' === str) return false;else if (!isNaN(str * 1)) return parseFloat(str);
    return str;
  }
  // Convert PascalCase to kebab-case
  // Thank you: http://stackoverflow.com/a/8955580
  function hyphenate(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /***/
},
/* 4 */
/***/function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  /* harmony export (binding) */
  __webpack_require__.d(__webpack_exports__, "a", function () {
    return Plugin;
  });
  /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
  /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
  /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_core__ = __webpack_require__(1);

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
      }
    }return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
  }();

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  // Abstract class for providing lifecycle hooks. Expect plugins to define AT LEAST
  // {function} _setup (replaces previous constructor),
  // {function} _destroy (replaces previous destroy)

  var Plugin = function () {
    function Plugin(element, options) {
      _classCallCheck(this, Plugin);

      this._setup(element, options);
      var pluginName = getPluginName(this);
      this.uuid = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__foundation_util_core__["b" /* GetYoDigits */])(6, pluginName);

      if (!this.$element.attr('data-' + pluginName)) {
        this.$element.attr('data-' + pluginName, this.uuid);
      }
      if (!this.$element.data('zfPlugin')) {
        this.$element.data('zfPlugin', this);
      }
      /**
       * Fires when the plugin has initialized.
       * @event Plugin#init
       */
      this.$element.trigger('init.zf.' + pluginName);
    }

    _createClass(Plugin, [{
      key: 'destroy',
      value: function destroy() {
        this._destroy();
        var pluginName = getPluginName(this);
        this.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
        /**
         * Fires when the plugin has been destroyed.
         * @event Plugin#destroyed
         */
        .trigger('destroyed.zf.' + pluginName);
        for (var prop in this) {
          this[prop] = null; //clean up script to prep for garbage collection.
        }
      }
    }]);

    return Plugin;
  }();

  // Convert PascalCase to kebab-case
  // Thank you: http://stackoverflow.com/a/8955580


  function hyphenate(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  function getPluginName(obj) {
    if (typeof obj.constructor.name !== 'undefined') {
      return hyphenate(obj.constructor.name);
    } else {
      return hyphenate(obj.className);
    }
  }

  /***/
},
/* 5 */
/***/function (module, __webpack_exports__, __webpack_require__) {

  "use strict";
  /* harmony export (binding) */
  __webpack_require__.d(__webpack_exports__, "a", function () {
    return MediaQuery;
  });
  /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
  /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);

  // Default set of media queries
  var defaultQueries = {
    'default': 'only screen',
    landscape: 'only screen and (orientation: landscape)',
    portrait: 'only screen and (orientation: portrait)',
    retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 'only screen and (min--moz-device-pixel-ratio: 2),' + 'only screen and (-o-min-device-pixel-ratio: 2/1),' + 'only screen and (min-device-pixel-ratio: 2),' + 'only screen and (min-resolution: 192dpi),' + 'only screen and (min-resolution: 2dppx)'
  };

  // matchMedia() polyfill - Test a CSS media type/query in JS.
  // Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
  var matchMedia = window.matchMedia || function () {
    'use strict';

    // For browsers that support matchMedium api such as IE 9 and webkit

    var styleMedia = window.styleMedia || window.media;

    // For those that don't support matchMedium
    if (!styleMedia) {
      var style = document.createElement('style'),
          script = document.getElementsByTagName('script')[0],
          info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      script && script.parentNode && script.parentNode.insertBefore(style, script);

      // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
      info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium: function matchMedium(media) {
          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

          // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
          if (style.styleSheet) {
            style.styleSheet.cssText = text;
          } else {
            style.textContent = text;
          }

          // Test if media query is true or false
          return info.width === '1px';
        }
      };
    }

    return function (media) {
      return {
        matches: styleMedia.matchMedium(media || 'all'),
        media: media || 'all'
      };
    };
  }();

  var MediaQuery = {
    queries: [],

    current: '',

    /**
     * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
     * @function
     * @private
     */
    _init: function _init() {
      var self = this;
      var $meta = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('meta.foundation-mq');
      if (!$meta.length) {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()('<meta class="foundation-mq">').appendTo(document.head);
      }

      var extractedStyles = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('.foundation-mq').css('font-family');
      var namedQueries;

      namedQueries = parseStyleToObject(extractedStyles);

      for (var key in namedQueries) {
        if (namedQueries.hasOwnProperty(key)) {
          self.queries.push({
            name: key,
            value: 'only screen and (min-width: ' + namedQueries[key] + ')'
          });
        }
      }

      this.current = this._getCurrentSize();

      this._watcher();
    },

    /**
     * Checks if the screen is at least as wide as a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
     */
    atLeast: function atLeast(size) {
      var query = this.get(size);

      if (query) {
        return matchMedia(query).matches;
      }

      return false;
    },

    /**
     * Checks if the screen matches to a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check, either 'small only' or 'small'. Omitting 'only' falls back to using atLeast() method.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it does not.
     */
    is: function is(size) {
      size = size.trim().split(' ');
      if (size.length > 1 && size[1] === 'only') {
        if (size[0] === this._getCurrentSize()) return true;
      } else {
        return this.atLeast(size[0]);
      }
      return false;
    },

    /**
     * Gets the media query of a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to get.
     * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
     */
    get: function get(size) {
      for (var i in this.queries) {
        if (this.queries.hasOwnProperty(i)) {
          var query = this.queries[i];
          if (size === query.name) return query.value;
        }
      }

      return null;
    },

    /**
     * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
     * @function
     * @private
     * @returns {String} Name of the current breakpoint.
     */
    _getCurrentSize: function _getCurrentSize() {
      var matched;

      for (var i = 0; i < this.queries.length; i++) {
        var query = this.queries[i];

        if (matchMedia(query.value).matches) {
          matched = query;
        }
      }

      if ((typeof matched === 'undefined' ? 'undefined' : _typeof(matched)) === 'object') {
        return matched.name;
      } else {
        return matched;
      }
    },

    /**
     * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
     * @function
     * @private
     */
    _watcher: function _watcher() {
      var _this = this;

      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off('resize.zf.mediaquery').on('resize.zf.mediaquery', function () {
        var newSize = _this._getCurrentSize(),
            currentSize = _this.current;

        if (newSize !== currentSize) {
          // Change the current media query
          _this.current = newSize;

          // Broadcast the media query change on the window
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).trigger('changed.zf.mediaquery', [newSize, currentSize]);
        }
      });
    }
  };

  // Thank you: https://github.com/sindresorhus/query-string
  function parseStyleToObject(str) {
    var styleObject = {};

    if (typeof str !== 'string') {
      return styleObject;
    }

    str = str.trim().slice(1, -1); // browsers re-quote string style values

    if (!str) {
      return styleObject;
    }

    styleObject = str.split('&').reduce(function (ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];
      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
      return ret;
    }, {});

    return styleObject;
  }

  /***/
},
/* 6 */
/***/function (module, exports, __webpack_require__) {

  module.exports = __webpack_require__(2);

  /***/
}]
/******/);
'use strict';

/******/(function (modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/var installedModules = {};
  /******/
  /******/ // The require function
  /******/function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/if (installedModules[moduleId]) {
      /******/return installedModules[moduleId].exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/var module = installedModules[moduleId] = {
      /******/i: moduleId,
      /******/l: false,
      /******/exports: {}
      /******/ };
    /******/
    /******/ // Execute the module function
    /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ // Flag the module as loaded
    /******/module.l = true;
    /******/
    /******/ // Return the exports of the module
    /******/return module.exports;
    /******/
  }
  /******/
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/__webpack_require__.m = modules;
  /******/
  /******/ // expose the module cache
  /******/__webpack_require__.c = installedModules;
  /******/
  /******/ // identity function for calling harmony imports with the correct context
  /******/__webpack_require__.i = function (value) {
    return value;
  };
  /******/
  /******/ // define getter function for harmony exports
  /******/__webpack_require__.d = function (exports, name, getter) {
    /******/if (!__webpack_require__.o(exports, name)) {
      /******/Object.defineProperty(exports, name, {
        /******/configurable: false,
        /******/enumerable: true,
        /******/get: getter
        /******/ });
      /******/
    }
    /******/
  };
  /******/
  /******/ // getDefaultExport function for compatibility with non-harmony modules
  /******/__webpack_require__.n = function (module) {
    /******/var getter = module && module.__esModule ?
    /******/function getDefault() {
      return module['default'];
    } :
    /******/function getModuleExports() {
      return module;
    };
    /******/__webpack_require__.d(getter, 'a', getter);
    /******/return getter;
    /******/
  };
  /******/
  /******/ // Object.prototype.hasOwnProperty.call
  /******/__webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  /******/
  /******/ // __webpack_public_path__
  /******/__webpack_require__.p = "";
  /******/
  /******/ // Load entry module and return exports
  /******/return __webpack_require__(__webpack_require__.s = 100);
  /******/
})(
/************************************************************************/
/******/{

  /***/1:
  /***/function _(module, exports) {

    module.exports = { Foundation: window.Foundation };

    /***/
  },

  /***/100:
  /***/function _(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(34);

    /***/
  },

  /***/3:
  /***/function _(module, exports) {

    module.exports = { rtl: window.Foundation.rtl, GetYoDigits: window.Foundation.GetYoDigits, transitionend: window.Foundation.transitionend };

    /***/
  },

  /***/34:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";

    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core__ = __webpack_require__(1);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__foundation_core__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_box__ = __webpack_require__(64);

    __WEBPACK_IMPORTED_MODULE_0__foundation_core__["Foundation"].Box = __WEBPACK_IMPORTED_MODULE_1__foundation_util_box__["a" /* Box */];

    /***/
  },

  /***/64:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";
    /* harmony export (binding) */
    __webpack_require__.d(__webpack_exports__, "a", function () {
      return Box;
    });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_util_core__ = __webpack_require__(3);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_util_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__foundation_util_core__);

    var Box = {
      ImNotTouchingYou: ImNotTouchingYou,
      OverlapArea: OverlapArea,
      GetDimensions: GetDimensions,
      GetOffsets: GetOffsets,
      GetExplicitOffsets: GetExplicitOffsets

      /**
       * Compares the dimensions of an element to a container and determines collision events with container.
       * @function
       * @param {jQuery} element - jQuery object to test for collisions.
       * @param {jQuery} parent - jQuery object to use as bounding container.
       * @param {Boolean} lrOnly - set to true to check left and right values only.
       * @param {Boolean} tbOnly - set to true to check top and bottom values only.
       * @default if no parent object passed, detects collisions with `window`.
       * @returns {Boolean} - true if collision free, false if a collision in any direction.
       */
    };function ImNotTouchingYou(element, parent, lrOnly, tbOnly, ignoreBottom) {
      return OverlapArea(element, parent, lrOnly, tbOnly, ignoreBottom) === 0;
    };

    function OverlapArea(element, parent, lrOnly, tbOnly, ignoreBottom) {
      var eleDims = GetDimensions(element),
          topOver,
          bottomOver,
          leftOver,
          rightOver;
      if (parent) {
        var parDims = GetDimensions(parent);

        bottomOver = parDims.height + parDims.offset.top - (eleDims.offset.top + eleDims.height);
        topOver = eleDims.offset.top - parDims.offset.top;
        leftOver = eleDims.offset.left - parDims.offset.left;
        rightOver = parDims.width + parDims.offset.left - (eleDims.offset.left + eleDims.width);
      } else {
        bottomOver = eleDims.windowDims.height + eleDims.windowDims.offset.top - (eleDims.offset.top + eleDims.height);
        topOver = eleDims.offset.top - eleDims.windowDims.offset.top;
        leftOver = eleDims.offset.left - eleDims.windowDims.offset.left;
        rightOver = eleDims.windowDims.width - (eleDims.offset.left + eleDims.width);
      }

      bottomOver = ignoreBottom ? 0 : Math.min(bottomOver, 0);
      topOver = Math.min(topOver, 0);
      leftOver = Math.min(leftOver, 0);
      rightOver = Math.min(rightOver, 0);

      if (lrOnly) {
        return leftOver + rightOver;
      }
      if (tbOnly) {
        return topOver + bottomOver;
      }

      // use sum of squares b/c we care about overlap area.
      return Math.sqrt(topOver * topOver + bottomOver * bottomOver + leftOver * leftOver + rightOver * rightOver);
    }

    /**
     * Uses native methods to return an object of dimension values.
     * @function
     * @param {jQuery || HTML} element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
     * @returns {Object} - nested object of integer pixel values
     * TODO - if element is window, return only those values.
     */
    function GetDimensions(elem) {
      elem = elem.length ? elem[0] : elem;

      if (elem === window || elem === document) {
        throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
      }

      var rect = elem.getBoundingClientRect(),
          parRect = elem.parentNode.getBoundingClientRect(),
          winRect = document.body.getBoundingClientRect(),
          winY = window.pageYOffset,
          winX = window.pageXOffset;

      return {
        width: rect.width,
        height: rect.height,
        offset: {
          top: rect.top + winY,
          left: rect.left + winX
        },
        parentDims: {
          width: parRect.width,
          height: parRect.height,
          offset: {
            top: parRect.top + winY,
            left: parRect.left + winX
          }
        },
        windowDims: {
          width: winRect.width,
          height: winRect.height,
          offset: {
            top: winY,
            left: winX
          }
        }
      };
    }

    /**
     * Returns an object of top and left integer pixel values for dynamically rendered elements,
     * such as: Tooltip, Reveal, and Dropdown. Maintained for backwards compatibility, and where
     * you don't know alignment, but generally from
     * 6.4 forward you should use GetExplicitOffsets, as GetOffsets conflates position and alignment.
     * @function
     * @param {jQuery} element - jQuery object for the element being positioned.
     * @param {jQuery} anchor - jQuery object for the element's anchor point.
     * @param {String} position - a string relating to the desired position of the element, relative to it's anchor
     * @param {Number} vOffset - integer pixel value of desired vertical separation between anchor and element.
     * @param {Number} hOffset - integer pixel value of desired horizontal separation between anchor and element.
     * @param {Boolean} isOverflow - if a collision event is detected, sets to true to default the element to full width - any desired offset.
     * TODO alter/rewrite to work with `em` values as well/instead of pixels
     */
    function GetOffsets(element, anchor, position, vOffset, hOffset, isOverflow) {
      console.log("NOTE: GetOffsets is deprecated in favor of GetExplicitOffsets and will be removed in 6.5");
      switch (position) {
        case 'top':
          return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__foundation_util_core__["rtl"])() ? GetExplicitOffsets(element, anchor, 'top', 'left', vOffset, hOffset, isOverflow) : GetExplicitOffsets(element, anchor, 'top', 'right', vOffset, hOffset, isOverflow);
        case 'bottom':
          return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__foundation_util_core__["rtl"])() ? GetExplicitOffsets(element, anchor, 'bottom', 'left', vOffset, hOffset, isOverflow) : GetExplicitOffsets(element, anchor, 'bottom', 'right', vOffset, hOffset, isOverflow);
        case 'center top':
          return GetExplicitOffsets(element, anchor, 'top', 'center', vOffset, hOffset, isOverflow);
        case 'center bottom':
          return GetExplicitOffsets(element, anchor, 'bottom', 'center', vOffset, hOffset, isOverflow);
        case 'center left':
          return GetExplicitOffsets(element, anchor, 'left', 'center', vOffset, hOffset, isOverflow);
        case 'center right':
          return GetExplicitOffsets(element, anchor, 'right', 'center', vOffset, hOffset, isOverflow);
        case 'left bottom':
          return GetExplicitOffsets(element, anchor, 'bottom', 'left', vOffset, hOffset, isOverflow);
        case 'right bottom':
          return GetExplicitOffsets(element, anchor, 'bottom', 'right', vOffset, hOffset, isOverflow);
        // Backwards compatibility... this along with the reveal and reveal full
        // classes are the only ones that didn't reference anchor
        case 'center':
          return {
            left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2 + hOffset,
            top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - ($eleDims.height / 2 + vOffset)
          };
        case 'reveal':
          return {
            left: ($eleDims.windowDims.width - $eleDims.width) / 2 + hOffset,
            top: $eleDims.windowDims.offset.top + vOffset
          };
        case 'reveal full':
          return {
            left: $eleDims.windowDims.offset.left,
            top: $eleDims.windowDims.offset.top
          };
          break;
        default:
          return {
            left: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__foundation_util_core__["rtl"])() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width - hOffset : $anchorDims.offset.left + hOffset,
            top: $anchorDims.offset.top + $anchorDims.height + vOffset
          };

      }
    }

    function GetExplicitOffsets(element, anchor, position, alignment, vOffset, hOffset, isOverflow) {
      var $eleDims = GetDimensions(element),
          $anchorDims = anchor ? GetDimensions(anchor) : null;

      var topVal, leftVal;

      // set position related attribute

      switch (position) {
        case 'top':
          topVal = $anchorDims.offset.top - ($eleDims.height + vOffset);
          break;
        case 'bottom':
          topVal = $anchorDims.offset.top + $anchorDims.height + vOffset;
          break;
        case 'left':
          leftVal = $anchorDims.offset.left - ($eleDims.width + hOffset);
          break;
        case 'right':
          leftVal = $anchorDims.offset.left + $anchorDims.width + hOffset;
          break;
      }

      // set alignment related attribute
      switch (position) {
        case 'top':
        case 'bottom':
          switch (alignment) {
            case 'left':
              leftVal = $anchorDims.offset.left + hOffset;
              break;
            case 'right':
              leftVal = $anchorDims.offset.left - $eleDims.width + $anchorDims.width - hOffset;
              break;
            case 'center':
              leftVal = isOverflow ? hOffset : $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2 + hOffset;
              break;
          }
          break;
        case 'right':
        case 'left':
          switch (alignment) {
            case 'bottom':
              topVal = $anchorDims.offset.top - vOffset + $anchorDims.height - $eleDims.height;
              break;
            case 'top':
              topVal = $anchorDims.offset.top + vOffset;
              break;
            case 'center':
              topVal = $anchorDims.offset.top + vOffset + $anchorDims.height / 2 - $eleDims.height / 2;
              break;
          }
          break;
      }
      return { top: topVal, left: leftVal };
    }

    /***/
  }

  /******/ });
"use strict";

!function (t) {
  function e(i) {
    if (o[i]) return o[i].exports;var n = o[i] = { i: i, l: !1, exports: {} };return t[i].call(n.exports, n, n.exports, e), n.l = !0, n.exports;
  }var o = {};e.m = t, e.c = o, e.i = function (t) {
    return t;
  }, e.d = function (t, o, i) {
    e.o(t, o) || Object.defineProperty(t, o, { configurable: !1, enumerable: !0, get: i });
  }, e.n = function (t) {
    var o = t && t.__esModule ? function () {
      return t.default;
    } : function () {
      return t;
    };return e.d(o, "a", o), o;
  }, e.o = function (t, e) {
    return Object.prototype.hasOwnProperty.call(t, e);
  }, e.p = "", e(e.s = 100);
}({ 1: function _(t, e) {
    t.exports = { Foundation: window.Foundation };
  }, 100: function _(t, e, o) {
    t.exports = o(34);
  }, 3: function _(t, e) {
    t.exports = { rtl: window.Foundation.rtl, GetYoDigits: window.Foundation.GetYoDigits, transitionend: window.Foundation.transitionend };
  }, 34: function _(t, e, o) {
    "use strict";
    Object.defineProperty(e, "__esModule", { value: !0 });var i = o(1),
        n = (o.n(i), o(64));i.Foundation.Box = n.a;
  }, 64: function _(t, e, o) {
    "use strict";
    function i(t, e, o, i, f) {
      return 0 === n(t, e, o, i, f);
    }function n(t, e, o, i, n) {
      var s,
          r,
          h,
          a,
          c = f(t);if (e) {
        var l = f(e);r = l.height + l.offset.top - (c.offset.top + c.height), s = c.offset.top - l.offset.top, h = c.offset.left - l.offset.left, a = l.width + l.offset.left - (c.offset.left + c.width);
      } else r = c.windowDims.height + c.windowDims.offset.top - (c.offset.top + c.height), s = c.offset.top - c.windowDims.offset.top, h = c.offset.left - c.windowDims.offset.left, a = c.windowDims.width - (c.offset.left + c.width);return r = n ? 0 : Math.min(r, 0), s = Math.min(s, 0), h = Math.min(h, 0), a = Math.min(a, 0), o ? h + a : i ? s + r : Math.sqrt(s * s + r * r + h * h + a * a);
    }function f(t) {
      if ((t = t.length ? t[0] : t) === window || t === document) throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");var e = t.getBoundingClientRect(),
          o = t.parentNode.getBoundingClientRect(),
          i = document.body.getBoundingClientRect(),
          n = window.pageYOffset,
          f = window.pageXOffset;return { width: e.width, height: e.height, offset: { top: e.top + n, left: e.left + f }, parentDims: { width: o.width, height: o.height, offset: { top: o.top + n, left: o.left + f } }, windowDims: { width: i.width, height: i.height, offset: { top: n, left: f } } };
    }function s(t, e, i, n, f, s) {
      switch (console.log("NOTE: GetOffsets is deprecated in favor of GetExplicitOffsets and will be removed in 6.5"), i) {case "top":
          return o.i(h.rtl)() ? r(t, e, "top", "left", n, f, s) : r(t, e, "top", "right", n, f, s);case "bottom":
          return o.i(h.rtl)() ? r(t, e, "bottom", "left", n, f, s) : r(t, e, "bottom", "right", n, f, s);case "center top":
          return r(t, e, "top", "center", n, f, s);case "center bottom":
          return r(t, e, "bottom", "center", n, f, s);case "center left":
          return r(t, e, "left", "center", n, f, s);case "center right":
          return r(t, e, "right", "center", n, f, s);case "left bottom":
          return r(t, e, "bottom", "left", n, f, s);case "right bottom":
          return r(t, e, "bottom", "right", n, f, s);case "center":
          return { left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2 + f, top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - ($eleDims.height / 2 + n) };case "reveal":
          return { left: ($eleDims.windowDims.width - $eleDims.width) / 2 + f, top: $eleDims.windowDims.offset.top + n };case "reveal full":
          return { left: $eleDims.windowDims.offset.left, top: $eleDims.windowDims.offset.top };default:
          return { left: o.i(h.rtl)() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width - f : $anchorDims.offset.left + f, top: $anchorDims.offset.top + $anchorDims.height + n };}
    }function r(t, e, o, i, n, s, r) {
      var h,
          a,
          c = f(t),
          l = e ? f(e) : null;switch (o) {case "top":
          h = l.offset.top - (c.height + n);break;case "bottom":
          h = l.offset.top + l.height + n;break;case "left":
          a = l.offset.left - (c.width + s);break;case "right":
          a = l.offset.left + l.width + s;}switch (o) {case "top":case "bottom":
          switch (i) {case "left":
              a = l.offset.left + s;break;case "right":
              a = l.offset.left - c.width + l.width - s;break;case "center":
              a = r ? s : l.offset.left + l.width / 2 - c.width / 2 + s;}break;case "right":case "left":
          switch (i) {case "bottom":
              h = l.offset.top - n + l.height - c.height;break;case "top":
              h = l.offset.top + n;break;case "center":
              h = l.offset.top + n + l.height / 2 - c.height / 2;}}return { top: h, left: a };
    }o.d(e, "a", function () {
      return a;
    });var h = o(3),
        a = (o.n(h), { ImNotTouchingYou: i, OverlapArea: n, GetDimensions: f, GetOffsets: s, GetExplicitOffsets: r });
  } });
'use strict';

/******/(function (modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/var installedModules = {};
  /******/
  /******/ // The require function
  /******/function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/if (installedModules[moduleId]) {
      /******/return installedModules[moduleId].exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/var module = installedModules[moduleId] = {
      /******/i: moduleId,
      /******/l: false,
      /******/exports: {}
      /******/ };
    /******/
    /******/ // Execute the module function
    /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ // Flag the module as loaded
    /******/module.l = true;
    /******/
    /******/ // Return the exports of the module
    /******/return module.exports;
    /******/
  }
  /******/
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/__webpack_require__.m = modules;
  /******/
  /******/ // expose the module cache
  /******/__webpack_require__.c = installedModules;
  /******/
  /******/ // identity function for calling harmony imports with the correct context
  /******/__webpack_require__.i = function (value) {
    return value;
  };
  /******/
  /******/ // define getter function for harmony exports
  /******/__webpack_require__.d = function (exports, name, getter) {
    /******/if (!__webpack_require__.o(exports, name)) {
      /******/Object.defineProperty(exports, name, {
        /******/configurable: false,
        /******/enumerable: true,
        /******/get: getter
        /******/ });
      /******/
    }
    /******/
  };
  /******/
  /******/ // getDefaultExport function for compatibility with non-harmony modules
  /******/__webpack_require__.n = function (module) {
    /******/var getter = module && module.__esModule ?
    /******/function getDefault() {
      return module['default'];
    } :
    /******/function getModuleExports() {
      return module;
    };
    /******/__webpack_require__.d(getter, 'a', getter);
    /******/return getter;
    /******/
  };
  /******/
  /******/ // Object.prototype.hasOwnProperty.call
  /******/__webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  /******/
  /******/ // __webpack_public_path__
  /******/__webpack_require__.p = "";
  /******/
  /******/ // Load entry module and return exports
  /******/return __webpack_require__(__webpack_require__.s = 101);
  /******/
})(
/************************************************************************/
/******/{

  /***/0:
  /***/function _(module, exports) {

    module.exports = jQuery;

    /***/
  },

  /***/1:
  /***/function _(module, exports) {

    module.exports = { Foundation: window.Foundation };

    /***/
  },

  /***/101:
  /***/function _(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(35);

    /***/
  },

  /***/35:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";

    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core__ = __webpack_require__(1);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__foundation_core__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_imageLoader__ = __webpack_require__(65);

    __WEBPACK_IMPORTED_MODULE_0__foundation_core__["Foundation"].onImagesLoaded = __WEBPACK_IMPORTED_MODULE_1__foundation_util_imageLoader__["a" /* onImagesLoaded */];

    /***/
  },

  /***/65:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";
    /* harmony export (binding) */
    __webpack_require__.d(__webpack_exports__, "a", function () {
      return onImagesLoaded;
    });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);

    /**
     * Runs a callback function when images are fully loaded.
     * @param {Object} images - Image(s) to check if loaded.
     * @param {Func} callback - Function to execute when image is fully loaded.
     */
    function onImagesLoaded(images, callback) {
      var self = this,
          unloaded = images.length;

      if (unloaded === 0) {
        callback();
      }

      images.each(function () {
        // Check if image is loaded
        if (this.complete && this.naturalWidth !== undefined) {
          singleImageLoaded();
        } else {
          // If the above check failed, simulate loading on detached element.
          var image = new Image();
          // Still count image as loaded if it finalizes with an error.
          var events = "load.zf.images error.zf.images";
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(image).one(events, function me(event) {
            // Unbind the event listeners. We're using 'one' but only one of the two events will have fired.
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).off(events, me);
            singleImageLoaded();
          });
          image.src = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).attr('src');
        }
      });

      function singleImageLoaded() {
        unloaded--;
        if (unloaded === 0) {
          callback();
        }
      }
    }

    /***/
  }

  /******/ });
"use strict";

!function (n) {
  function t(o) {
    if (e[o]) return e[o].exports;var r = e[o] = { i: o, l: !1, exports: {} };return n[o].call(r.exports, r, r.exports, t), r.l = !0, r.exports;
  }var e = {};t.m = n, t.c = e, t.i = function (n) {
    return n;
  }, t.d = function (n, e, o) {
    t.o(n, e) || Object.defineProperty(n, e, { configurable: !1, enumerable: !0, get: o });
  }, t.n = function (n) {
    var e = n && n.__esModule ? function () {
      return n.default;
    } : function () {
      return n;
    };return t.d(e, "a", e), e;
  }, t.o = function (n, t) {
    return Object.prototype.hasOwnProperty.call(n, t);
  }, t.p = "", t(t.s = 101);
}({ 0: function _(n, t) {
    n.exports = jQuery;
  }, 1: function _(n, t) {
    n.exports = { Foundation: window.Foundation };
  }, 101: function _(n, t, e) {
    n.exports = e(35);
  }, 35: function _(n, t, e) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 });var o = e(1),
        r = (e.n(o), e(65));o.Foundation.onImagesLoaded = r.a;
  }, 65: function _(n, t, e) {
    "use strict";
    function o(n, t) {
      function e() {
        0 === --o && t();
      }var o = n.length;0 === o && t(), n.each(function () {
        if (this.complete && void 0 !== this.naturalWidth) e();else {
          var n = new Image(),
              t = "load.zf.images error.zf.images";i()(n).one(t, function n(o) {
            i()(this).off(t, n), e();
          }), n.src = i()(this).attr("src");
        }
      });
    }e.d(t, "a", function () {
      return o;
    });var r = e(0),
        i = e.n(r);
  } });
'use strict';

/******/(function (modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/var installedModules = {};
  /******/
  /******/ // The require function
  /******/function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/if (installedModules[moduleId]) {
      /******/return installedModules[moduleId].exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/var module = installedModules[moduleId] = {
      /******/i: moduleId,
      /******/l: false,
      /******/exports: {}
      /******/ };
    /******/
    /******/ // Execute the module function
    /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ // Flag the module as loaded
    /******/module.l = true;
    /******/
    /******/ // Return the exports of the module
    /******/return module.exports;
    /******/
  }
  /******/
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/__webpack_require__.m = modules;
  /******/
  /******/ // expose the module cache
  /******/__webpack_require__.c = installedModules;
  /******/
  /******/ // identity function for calling harmony imports with the correct context
  /******/__webpack_require__.i = function (value) {
    return value;
  };
  /******/
  /******/ // define getter function for harmony exports
  /******/__webpack_require__.d = function (exports, name, getter) {
    /******/if (!__webpack_require__.o(exports, name)) {
      /******/Object.defineProperty(exports, name, {
        /******/configurable: false,
        /******/enumerable: true,
        /******/get: getter
        /******/ });
      /******/
    }
    /******/
  };
  /******/
  /******/ // getDefaultExport function for compatibility with non-harmony modules
  /******/__webpack_require__.n = function (module) {
    /******/var getter = module && module.__esModule ?
    /******/function getDefault() {
      return module['default'];
    } :
    /******/function getModuleExports() {
      return module;
    };
    /******/__webpack_require__.d(getter, 'a', getter);
    /******/return getter;
    /******/
  };
  /******/
  /******/ // Object.prototype.hasOwnProperty.call
  /******/__webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  /******/
  /******/ // __webpack_public_path__
  /******/__webpack_require__.p = "";
  /******/
  /******/ // Load entry module and return exports
  /******/return __webpack_require__(__webpack_require__.s = 102);
  /******/
})(
/************************************************************************/
/******/{

  /***/0:
  /***/function _(module, exports) {

    module.exports = jQuery;

    /***/
  },

  /***/1:
  /***/function _(module, exports) {

    module.exports = { Foundation: window.Foundation };

    /***/
  },

  /***/102:
  /***/function _(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(36);

    /***/
  },

  /***/3:
  /***/function _(module, exports) {

    module.exports = { rtl: window.Foundation.rtl, GetYoDigits: window.Foundation.GetYoDigits, transitionend: window.Foundation.transitionend };

    /***/
  },

  /***/36:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";

    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core__ = __webpack_require__(1);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__foundation_core__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__ = __webpack_require__(66);

    __WEBPACK_IMPORTED_MODULE_0__foundation_core__["Foundation"].Keyboard = __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */];

    /***/
  },

  /***/66:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";
    /* harmony export (binding) */
    __webpack_require__.d(__webpack_exports__, "a", function () {
      return Keyboard;
    });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_core__ = __webpack_require__(3);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__foundation_util_core__);
    /*******************************************
     *                                         *
     * This util was created by Marius Olbertz *
     * Please thank Marius on GitHub /owlbertz *
     * or the web http://www.mariusolbertz.de/ *
     *                                         *
     ******************************************/

    var keyCodes = {
      9: 'TAB',
      13: 'ENTER',
      27: 'ESCAPE',
      32: 'SPACE',
      35: 'END',
      36: 'HOME',
      37: 'ARROW_LEFT',
      38: 'ARROW_UP',
      39: 'ARROW_RIGHT',
      40: 'ARROW_DOWN'
    };

    var commands = {};

    // Functions pulled out to be referenceable from internals
    function findFocusable($element) {
      if (!$element) {
        return false;
      }
      return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function () {
        if (!__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).is(':visible') || __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).attr('tabindex') < 0) {
          return false;
        } //only have visible elements and those that have a tabindex greater or equal 0
        return true;
      });
    }

    function parseKey(event) {
      var key = keyCodes[event.which || event.keyCode] || String.fromCharCode(event.which).toUpperCase();

      // Remove un-printable characters, e.g. for `fromCharCode` calls for CTRL only events
      key = key.replace(/\W+/, '');

      if (event.shiftKey) key = 'SHIFT_' + key;
      if (event.ctrlKey) key = 'CTRL_' + key;
      if (event.altKey) key = 'ALT_' + key;

      // Remove trailing underscore, in case only modifiers were used (e.g. only `CTRL_ALT`)
      key = key.replace(/_$/, '');

      return key;
    }

    var Keyboard = {
      keys: getKeyCodes(keyCodes),

      /**
       * Parses the (keyboard) event and returns a String that represents its key
       * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
       * @param {Event} event - the event generated by the event handler
       * @return String key - String that represents the key pressed
       */
      parseKey: parseKey,

      /**
       * Handles the given (keyboard) event
       * @param {Event} event - the event generated by the event handler
       * @param {String} component - Foundation component's name, e.g. Slider or Reveal
       * @param {Objects} functions - collection of functions that are to be executed
       */
      handleKey: function handleKey(event, component, functions) {
        var commandList = commands[component],
            keyCode = this.parseKey(event),
            cmds,
            command,
            fn;

        if (!commandList) return console.warn('Component not defined!');

        if (typeof commandList.ltr === 'undefined') {
          // this component does not differentiate between ltr and rtl
          cmds = commandList; // use plain list
        } else {
          // merge ltr and rtl: if document is rtl, rtl overwrites ltr and vice versa
          if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__foundation_util_core__["rtl"])()) cmds = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({}, commandList.ltr, commandList.rtl);else cmds = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({}, commandList.rtl, commandList.ltr);
        }
        command = cmds[keyCode];

        fn = functions[command];
        if (fn && typeof fn === 'function') {
          // execute function  if exists
          var returnValue = fn.apply();
          if (functions.handled || typeof functions.handled === 'function') {
            // execute function when event was handled
            functions.handled(returnValue);
          }
        } else {
          if (functions.unhandled || typeof functions.unhandled === 'function') {
            // execute function when event was not handled
            functions.unhandled();
          }
        }
      },

      /**
       * Finds all focusable elements within the given `$element`
       * @param {jQuery} $element - jQuery object to search within
       * @return {jQuery} $focusable - all focusable elements within `$element`
       */

      findFocusable: findFocusable,

      /**
       * Returns the component name name
       * @param {Object} component - Foundation component, e.g. Slider or Reveal
       * @return String componentName
       */

      register: function register(componentName, cmds) {
        commands[componentName] = cmds;
      },

      // TODO9438: These references to Keyboard need to not require global. Will 'this' work in this context?
      //
      /**
       * Traps the focus in the given element.
       * @param  {jQuery} $element  jQuery object to trap the foucs into.
       */
      trapFocus: function trapFocus($element) {
        var $focusable = findFocusable($element),
            $firstFocusable = $focusable.eq(0),
            $lastFocusable = $focusable.eq(-1);

        $element.on('keydown.zf.trapfocus', function (event) {
          if (event.target === $lastFocusable[0] && parseKey(event) === 'TAB') {
            event.preventDefault();
            $firstFocusable.focus();
          } else if (event.target === $firstFocusable[0] && parseKey(event) === 'SHIFT_TAB') {
            event.preventDefault();
            $lastFocusable.focus();
          }
        });
      },

      /**
       * Releases the trapped focus from the given element.
       * @param  {jQuery} $element  jQuery object to release the focus for.
       */
      releaseFocus: function releaseFocus($element) {
        $element.off('keydown.zf.trapfocus');
      }
    };

    /*
     * Constants for easier comparing.
     * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
     */
    function getKeyCodes(kcs) {
      var k = {};
      for (var kc in kcs) {
        k[kcs[kc]] = kcs[kc];
      }return k;
    }

    /***/
  }

  /******/ });
"use strict";

!function (n) {
  function t(o) {
    if (e[o]) return e[o].exports;var r = e[o] = { i: o, l: !1, exports: {} };return n[o].call(r.exports, r, r.exports, t), r.l = !0, r.exports;
  }var e = {};t.m = n, t.c = e, t.i = function (n) {
    return n;
  }, t.d = function (n, e, o) {
    t.o(n, e) || Object.defineProperty(n, e, { configurable: !1, enumerable: !0, get: o });
  }, t.n = function (n) {
    var e = n && n.__esModule ? function () {
      return n.default;
    } : function () {
      return n;
    };return t.d(e, "a", e), e;
  }, t.o = function (n, t) {
    return Object.prototype.hasOwnProperty.call(n, t);
  }, t.p = "", t(t.s = 102);
}({ 0: function _(n, t) {
    n.exports = jQuery;
  }, 1: function _(n, t) {
    n.exports = { Foundation: window.Foundation };
  }, 102: function _(n, t, e) {
    n.exports = e(36);
  }, 3: function _(n, t) {
    n.exports = { rtl: window.Foundation.rtl, GetYoDigits: window.Foundation.GetYoDigits, transitionend: window.Foundation.transitionend };
  }, 36: function _(n, t, e) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 });var o = e(1),
        r = (e.n(o), e(66));o.Foundation.Keyboard = r.a;
  }, 66: function _(n, t, e) {
    "use strict";
    function o(n) {
      return !!n && n.find("a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]").filter(function () {
        return !(!a()(this).is(":visible") || a()(this).attr("tabindex") < 0);
      });
    }function r(n) {
      var t = d[n.which || n.keyCode] || String.fromCharCode(n.which).toUpperCase();return t = t.replace(/\W+/, ""), n.shiftKey && (t = "SHIFT_" + t), n.ctrlKey && (t = "CTRL_" + t), n.altKey && (t = "ALT_" + t), t = t.replace(/_$/, "");
    }e.d(t, "a", function () {
      return c;
    });var i = e(0),
        a = e.n(i),
        u = e(3),
        d = (e.n(u), { 9: "TAB", 13: "ENTER", 27: "ESCAPE", 32: "SPACE", 35: "END", 36: "HOME", 37: "ARROW_LEFT", 38: "ARROW_UP", 39: "ARROW_RIGHT", 40: "ARROW_DOWN" }),
        f = {},
        c = { keys: function (n) {
        var t = {};for (var e in n) {
          t[n[e]] = n[e];
        }return t;
      }(d), parseKey: r, handleKey: function handleKey(n, t, o) {
        var r,
            i,
            d,
            c = f[t],
            s = this.parseKey(n);if (!c) return console.warn("Component not defined!");if (r = void 0 === c.ltr ? c : e.i(u.rtl)() ? a.a.extend({}, c.ltr, c.rtl) : a.a.extend({}, c.rtl, c.ltr), i = r[s], (d = o[i]) && "function" == typeof d) {
          var l = d.apply();(o.handled || "function" == typeof o.handled) && o.handled(l);
        } else (o.unhandled || "function" == typeof o.unhandled) && o.unhandled();
      }, findFocusable: o, register: function register(n, t) {
        f[n] = t;
      }, trapFocus: function trapFocus(n) {
        var t = o(n),
            e = t.eq(0),
            i = t.eq(-1);n.on("keydown.zf.trapfocus", function (n) {
          n.target === i[0] && "TAB" === r(n) ? (n.preventDefault(), e.focus()) : n.target === e[0] && "SHIFT_TAB" === r(n) && (n.preventDefault(), i.focus());
        });
      }, releaseFocus: function releaseFocus(n) {
        n.off("keydown.zf.trapfocus");
      } };
  } });
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/******/(function (modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/var installedModules = {};
  /******/
  /******/ // The require function
  /******/function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/if (installedModules[moduleId]) {
      /******/return installedModules[moduleId].exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/var module = installedModules[moduleId] = {
      /******/i: moduleId,
      /******/l: false,
      /******/exports: {}
      /******/ };
    /******/
    /******/ // Execute the module function
    /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ // Flag the module as loaded
    /******/module.l = true;
    /******/
    /******/ // Return the exports of the module
    /******/return module.exports;
    /******/
  }
  /******/
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/__webpack_require__.m = modules;
  /******/
  /******/ // expose the module cache
  /******/__webpack_require__.c = installedModules;
  /******/
  /******/ // identity function for calling harmony imports with the correct context
  /******/__webpack_require__.i = function (value) {
    return value;
  };
  /******/
  /******/ // define getter function for harmony exports
  /******/__webpack_require__.d = function (exports, name, getter) {
    /******/if (!__webpack_require__.o(exports, name)) {
      /******/Object.defineProperty(exports, name, {
        /******/configurable: false,
        /******/enumerable: true,
        /******/get: getter
        /******/ });
      /******/
    }
    /******/
  };
  /******/
  /******/ // getDefaultExport function for compatibility with non-harmony modules
  /******/__webpack_require__.n = function (module) {
    /******/var getter = module && module.__esModule ?
    /******/function getDefault() {
      return module['default'];
    } :
    /******/function getModuleExports() {
      return module;
    };
    /******/__webpack_require__.d(getter, 'a', getter);
    /******/return getter;
    /******/
  };
  /******/
  /******/ // Object.prototype.hasOwnProperty.call
  /******/__webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  /******/
  /******/ // __webpack_public_path__
  /******/__webpack_require__.p = "";
  /******/
  /******/ // Load entry module and return exports
  /******/return __webpack_require__(__webpack_require__.s = 103);
  /******/
})(
/************************************************************************/
/******/{

  /***/0:
  /***/function _(module, exports) {

    module.exports = jQuery;

    /***/
  },

  /***/1:
  /***/function _(module, exports) {

    module.exports = { Foundation: window.Foundation };

    /***/
  },

  /***/103:
  /***/function _(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(37);

    /***/
  },

  /***/37:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";

    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core__ = __webpack_require__(1);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__foundation_core__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__ = __webpack_require__(67);

    __WEBPACK_IMPORTED_MODULE_0__foundation_core__["Foundation"].MediaQuery = __WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__["a" /* MediaQuery */];
    __WEBPACK_IMPORTED_MODULE_0__foundation_core__["Foundation"].MediaQuery._init();

    /***/
  },

  /***/67:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";
    /* harmony export (binding) */
    __webpack_require__.d(__webpack_exports__, "a", function () {
      return MediaQuery;
    });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);

    // Default set of media queries
    var defaultQueries = {
      'default': 'only screen',
      landscape: 'only screen and (orientation: landscape)',
      portrait: 'only screen and (orientation: portrait)',
      retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 'only screen and (min--moz-device-pixel-ratio: 2),' + 'only screen and (-o-min-device-pixel-ratio: 2/1),' + 'only screen and (min-device-pixel-ratio: 2),' + 'only screen and (min-resolution: 192dpi),' + 'only screen and (min-resolution: 2dppx)'
    };

    // matchMedia() polyfill - Test a CSS media type/query in JS.
    // Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
    var matchMedia = window.matchMedia || function () {
      'use strict';

      // For browsers that support matchMedium api such as IE 9 and webkit

      var styleMedia = window.styleMedia || window.media;

      // For those that don't support matchMedium
      if (!styleMedia) {
        var style = document.createElement('style'),
            script = document.getElementsByTagName('script')[0],
            info = null;

        style.type = 'text/css';
        style.id = 'matchmediajs-test';

        script && script.parentNode && script.parentNode.insertBefore(style, script);

        // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
        info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

        styleMedia = {
          matchMedium: function matchMedium(media) {
            var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

            // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
            if (style.styleSheet) {
              style.styleSheet.cssText = text;
            } else {
              style.textContent = text;
            }

            // Test if media query is true or false
            return info.width === '1px';
          }
        };
      }

      return function (media) {
        return {
          matches: styleMedia.matchMedium(media || 'all'),
          media: media || 'all'
        };
      };
    }();

    var MediaQuery = {
      queries: [],

      current: '',

      /**
       * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
       * @function
       * @private
       */
      _init: function _init() {
        var self = this;
        var $meta = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('meta.foundation-mq');
        if (!$meta.length) {
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()('<meta class="foundation-mq">').appendTo(document.head);
        }

        var extractedStyles = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('.foundation-mq').css('font-family');
        var namedQueries;

        namedQueries = parseStyleToObject(extractedStyles);

        for (var key in namedQueries) {
          if (namedQueries.hasOwnProperty(key)) {
            self.queries.push({
              name: key,
              value: 'only screen and (min-width: ' + namedQueries[key] + ')'
            });
          }
        }

        this.current = this._getCurrentSize();

        this._watcher();
      },

      /**
       * Checks if the screen is at least as wide as a breakpoint.
       * @function
       * @param {String} size - Name of the breakpoint to check.
       * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
       */
      atLeast: function atLeast(size) {
        var query = this.get(size);

        if (query) {
          return matchMedia(query).matches;
        }

        return false;
      },

      /**
       * Checks if the screen matches to a breakpoint.
       * @function
       * @param {String} size - Name of the breakpoint to check, either 'small only' or 'small'. Omitting 'only' falls back to using atLeast() method.
       * @returns {Boolean} `true` if the breakpoint matches, `false` if it does not.
       */
      is: function is(size) {
        size = size.trim().split(' ');
        if (size.length > 1 && size[1] === 'only') {
          if (size[0] === this._getCurrentSize()) return true;
        } else {
          return this.atLeast(size[0]);
        }
        return false;
      },

      /**
       * Gets the media query of a breakpoint.
       * @function
       * @param {String} size - Name of the breakpoint to get.
       * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
       */
      get: function get(size) {
        for (var i in this.queries) {
          if (this.queries.hasOwnProperty(i)) {
            var query = this.queries[i];
            if (size === query.name) return query.value;
          }
        }

        return null;
      },

      /**
       * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
       * @function
       * @private
       * @returns {String} Name of the current breakpoint.
       */
      _getCurrentSize: function _getCurrentSize() {
        var matched;

        for (var i = 0; i < this.queries.length; i++) {
          var query = this.queries[i];

          if (matchMedia(query.value).matches) {
            matched = query;
          }
        }

        if ((typeof matched === 'undefined' ? 'undefined' : _typeof(matched)) === 'object') {
          return matched.name;
        } else {
          return matched;
        }
      },

      /**
       * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
       * @function
       * @private
       */
      _watcher: function _watcher() {
        var _this = this;

        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off('resize.zf.mediaquery').on('resize.zf.mediaquery', function () {
          var newSize = _this._getCurrentSize(),
              currentSize = _this.current;

          if (newSize !== currentSize) {
            // Change the current media query
            _this.current = newSize;

            // Broadcast the media query change on the window
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).trigger('changed.zf.mediaquery', [newSize, currentSize]);
          }
        });
      }
    };

    // Thank you: https://github.com/sindresorhus/query-string
    function parseStyleToObject(str) {
      var styleObject = {};

      if (typeof str !== 'string') {
        return styleObject;
      }

      str = str.trim().slice(1, -1); // browsers re-quote string style values

      if (!str) {
        return styleObject;
      }

      styleObject = str.split('&').reduce(function (ret, param) {
        var parts = param.replace(/\+/g, ' ').split('=');
        var key = parts[0];
        var val = parts[1];
        key = decodeURIComponent(key);

        // missing `=` should be `null`:
        // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
        val = val === undefined ? null : decodeURIComponent(val);

        if (!ret.hasOwnProperty(key)) {
          ret[key] = val;
        } else if (Array.isArray(ret[key])) {
          ret[key].push(val);
        } else {
          ret[key] = [ret[key], val];
        }
        return ret;
      }, {});

      return styleObject;
    }

    /***/
  }

  /******/ });
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function (e) {
  function t(r) {
    if (n[r]) return n[r].exports;var i = n[r] = { i: r, l: !1, exports: {} };return e[r].call(i.exports, i, i.exports, t), i.l = !0, i.exports;
  }var n = {};t.m = e, t.c = n, t.i = function (e) {
    return e;
  }, t.d = function (e, n, r) {
    t.o(e, n) || Object.defineProperty(e, n, { configurable: !1, enumerable: !0, get: r });
  }, t.n = function (e) {
    var n = e && e.__esModule ? function () {
      return e.default;
    } : function () {
      return e;
    };return t.d(n, "a", n), n;
  }, t.o = function (e, t) {
    return Object.prototype.hasOwnProperty.call(e, t);
  }, t.p = "", t(t.s = 103);
}({ 0: function _(e, t) {
    e.exports = jQuery;
  }, 1: function _(e, t) {
    e.exports = { Foundation: window.Foundation };
  }, 103: function _(e, t, n) {
    e.exports = n(37);
  }, 37: function _(e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 });var r = n(1),
        i = (n.n(r), n(67));r.Foundation.MediaQuery = i.a, r.Foundation.MediaQuery._init();
  }, 67: function _(e, t, n) {
    "use strict";
    function r(e) {
      var t = {};return "string" != typeof e ? t : (e = e.trim().slice(1, -1)) ? t = e.split("&").reduce(function (e, t) {
        var n = t.replace(/\+/g, " ").split("="),
            r = n[0],
            i = n[1];return r = decodeURIComponent(r), i = void 0 === i ? null : decodeURIComponent(i), e.hasOwnProperty(r) ? Array.isArray(e[r]) ? e[r].push(i) : e[r] = [e[r], i] : e[r] = i, e;
      }, {}) : t;
    }n.d(t, "a", function () {
      return a;
    });var i = n(0),
        u = n.n(i),
        o = window.matchMedia || function () {
      var e = window.styleMedia || window.media;if (!e) {
        var t = document.createElement("style"),
            n = document.getElementsByTagName("script")[0],
            r = null;t.type = "text/css", t.id = "matchmediajs-test", n && n.parentNode && n.parentNode.insertBefore(t, n), r = "getComputedStyle" in window && window.getComputedStyle(t, null) || t.currentStyle, e = { matchMedium: function matchMedium(e) {
            var n = "@media " + e + "{ #matchmediajs-test { width: 1px; } }";return t.styleSheet ? t.styleSheet.cssText = n : t.textContent = n, "1px" === r.width;
          } };
      }return function (t) {
        return { matches: e.matchMedium(t || "all"), media: t || "all" };
      };
    }(),
        a = { queries: [], current: "", _init: function _init() {
        var e = this;u()("meta.foundation-mq").length || u()('<meta class="foundation-mq">').appendTo(document.head);var t,
            n = u()(".foundation-mq").css("font-family");t = r(n);for (var i in t) {
          t.hasOwnProperty(i) && e.queries.push({ name: i, value: "only screen and (min-width: " + t[i] + ")" });
        }this.current = this._getCurrentSize(), this._watcher();
      }, atLeast: function atLeast(e) {
        var t = this.get(e);return !!t && o(t).matches;
      }, is: function is(e) {
        return e = e.trim().split(" "), e.length > 1 && "only" === e[1] ? e[0] === this._getCurrentSize() : this.atLeast(e[0]);
      }, get: function get(e) {
        for (var t in this.queries) {
          if (this.queries.hasOwnProperty(t)) {
            var n = this.queries[t];if (e === n.name) return n.value;
          }
        }return null;
      }, _getCurrentSize: function _getCurrentSize() {
        for (var e, t = 0; t < this.queries.length; t++) {
          var n = this.queries[t];o(n.value).matches && (e = n);
        }return "object" == (typeof e === "undefined" ? "undefined" : _typeof(e)) ? e.name : e;
      }, _watcher: function _watcher() {
        var e = this;u()(window).off("resize.zf.mediaquery").on("resize.zf.mediaquery", function () {
          var t = e._getCurrentSize(),
              n = e.current;t !== n && (e.current = t, u()(window).trigger("changed.zf.mediaquery", [t, n]));
        });
      } };
  } });
'use strict';

/******/(function (modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/var installedModules = {};
  /******/
  /******/ // The require function
  /******/function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/if (installedModules[moduleId]) {
      /******/return installedModules[moduleId].exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/var module = installedModules[moduleId] = {
      /******/i: moduleId,
      /******/l: false,
      /******/exports: {}
      /******/ };
    /******/
    /******/ // Execute the module function
    /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ // Flag the module as loaded
    /******/module.l = true;
    /******/
    /******/ // Return the exports of the module
    /******/return module.exports;
    /******/
  }
  /******/
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/__webpack_require__.m = modules;
  /******/
  /******/ // expose the module cache
  /******/__webpack_require__.c = installedModules;
  /******/
  /******/ // identity function for calling harmony imports with the correct context
  /******/__webpack_require__.i = function (value) {
    return value;
  };
  /******/
  /******/ // define getter function for harmony exports
  /******/__webpack_require__.d = function (exports, name, getter) {
    /******/if (!__webpack_require__.o(exports, name)) {
      /******/Object.defineProperty(exports, name, {
        /******/configurable: false,
        /******/enumerable: true,
        /******/get: getter
        /******/ });
      /******/
    }
    /******/
  };
  /******/
  /******/ // getDefaultExport function for compatibility with non-harmony modules
  /******/__webpack_require__.n = function (module) {
    /******/var getter = module && module.__esModule ?
    /******/function getDefault() {
      return module['default'];
    } :
    /******/function getModuleExports() {
      return module;
    };
    /******/__webpack_require__.d(getter, 'a', getter);
    /******/return getter;
    /******/
  };
  /******/
  /******/ // Object.prototype.hasOwnProperty.call
  /******/__webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  /******/
  /******/ // __webpack_public_path__
  /******/__webpack_require__.p = "";
  /******/
  /******/ // Load entry module and return exports
  /******/return __webpack_require__(__webpack_require__.s = 104);
  /******/
})(
/************************************************************************/
/******/{

  /***/0:
  /***/function _(module, exports) {

    module.exports = jQuery;

    /***/
  },

  /***/1:
  /***/function _(module, exports) {

    module.exports = { Foundation: window.Foundation };

    /***/
  },

  /***/104:
  /***/function _(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(38);

    /***/
  },

  /***/3:
  /***/function _(module, exports) {

    module.exports = { rtl: window.Foundation.rtl, GetYoDigits: window.Foundation.GetYoDigits, transitionend: window.Foundation.transitionend };

    /***/
  },

  /***/38:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";

    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core__ = __webpack_require__(1);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__foundation_core__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_motion__ = __webpack_require__(68);

    __WEBPACK_IMPORTED_MODULE_0__foundation_core__["Foundation"].Motion = __WEBPACK_IMPORTED_MODULE_1__foundation_util_motion__["a" /* Motion */];
    __WEBPACK_IMPORTED_MODULE_0__foundation_core__["Foundation"].Move = __WEBPACK_IMPORTED_MODULE_1__foundation_util_motion__["b" /* Move */];

    /***/
  },

  /***/68:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";
    /* harmony export (binding) */
    __webpack_require__.d(__webpack_exports__, "b", function () {
      return Move;
    });
    /* harmony export (binding) */__webpack_require__.d(__webpack_exports__, "a", function () {
      return Motion;
    });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_core__ = __webpack_require__(3);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__foundation_util_core__);

    /**
     * Motion module.
     * @module foundation.motion
     */

    var initClasses = ['mui-enter', 'mui-leave'];
    var activeClasses = ['mui-enter-active', 'mui-leave-active'];

    var Motion = {
      animateIn: function animateIn(element, animation, cb) {
        animate(true, element, animation, cb);
      },

      animateOut: function animateOut(element, animation, cb) {
        animate(false, element, animation, cb);
      }
    };

    function Move(duration, elem, fn) {
      var anim,
          prog,
          start = null;
      // console.log('called');

      if (duration === 0) {
        fn.apply(elem);
        elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
        return;
      }

      function move(ts) {
        if (!start) start = ts;
        // console.log(start, ts);
        prog = ts - start;
        fn.apply(elem);

        if (prog < duration) {
          anim = window.requestAnimationFrame(move, elem);
        } else {
          window.cancelAnimationFrame(anim);
          elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
        }
      }
      anim = window.requestAnimationFrame(move);
    }

    /**
     * Animates an element in or out using a CSS transition class.
     * @function
     * @private
     * @param {Boolean} isIn - Defines if the animation is in or out.
     * @param {Object} element - jQuery or HTML object to animate.
     * @param {String} animation - CSS class to use.
     * @param {Function} cb - Callback to run when animation is finished.
     */
    function animate(isIn, element, animation, cb) {
      element = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(element).eq(0);

      if (!element.length) return;

      var initClass = isIn ? initClasses[0] : initClasses[1];
      var activeClass = isIn ? activeClasses[0] : activeClasses[1];

      // Set up the animation
      reset();

      element.addClass(animation).css('transition', 'none');

      requestAnimationFrame(function () {
        element.addClass(initClass);
        if (isIn) element.show();
      });

      // Start the animation
      requestAnimationFrame(function () {
        element[0].offsetWidth;
        element.css('transition', '').addClass(activeClass);
      });

      // Clean up the animation when it finishes
      element.one(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__foundation_util_core__["transitionend"])(element), finish);

      // Hides the element (for out animations), resets the element, and runs a callback
      function finish() {
        if (!isIn) element.hide();
        reset();
        if (cb) cb.apply(element);
      }

      // Resets transitions and removes motion-specific classes
      function reset() {
        element[0].style.transitionDuration = 0;
        element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
      }
    }

    /***/
  }

  /******/ });
"use strict";

!function (n) {
  function t(e) {
    if (i[e]) return i[e].exports;var o = i[e] = { i: e, l: !1, exports: {} };return n[e].call(o.exports, o, o.exports, t), o.l = !0, o.exports;
  }var i = {};t.m = n, t.c = i, t.i = function (n) {
    return n;
  }, t.d = function (n, i, e) {
    t.o(n, i) || Object.defineProperty(n, i, { configurable: !1, enumerable: !0, get: e });
  }, t.n = function (n) {
    var i = n && n.__esModule ? function () {
      return n.default;
    } : function () {
      return n;
    };return t.d(i, "a", i), i;
  }, t.o = function (n, t) {
    return Object.prototype.hasOwnProperty.call(n, t);
  }, t.p = "", t(t.s = 104);
}({ 0: function _(n, t) {
    n.exports = jQuery;
  }, 1: function _(n, t) {
    n.exports = { Foundation: window.Foundation };
  }, 104: function _(n, t, i) {
    n.exports = i(38);
  }, 3: function _(n, t) {
    n.exports = { rtl: window.Foundation.rtl, GetYoDigits: window.Foundation.GetYoDigits, transitionend: window.Foundation.transitionend };
  }, 38: function _(n, t, i) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 });var e = i(1),
        o = (i.n(e), i(68));e.Foundation.Motion = o.a, e.Foundation.Move = o.b;
  }, 68: function _(n, t, i) {
    "use strict";
    function e(n, t, i) {
      function e(u) {
        a || (a = u), r = u - a, i.apply(t), r < n ? o = window.requestAnimationFrame(e, t) : (window.cancelAnimationFrame(o), t.trigger("finished.zf.animate", [t]).triggerHandler("finished.zf.animate", [t]));
      }var o,
          r,
          a = null;if (0 === n) return i.apply(t), void t.trigger("finished.zf.animate", [t]).triggerHandler("finished.zf.animate", [t]);o = window.requestAnimationFrame(e);
    }function o(n, t, e, o) {
      function r() {
        n || t.hide(), d(), o && o.apply(t);
      }function d() {
        t[0].style.transitionDuration = 0, t.removeClass(c + " " + l + " " + e);
      }if (t = a()(t).eq(0), t.length) {
        var c = n ? s[0] : s[1],
            l = n ? f[0] : f[1];d(), t.addClass(e).css("transition", "none"), requestAnimationFrame(function () {
          t.addClass(c), n && t.show();
        }), requestAnimationFrame(function () {
          t[0].offsetWidth, t.css("transition", "").addClass(l);
        }), t.one(i.i(u.transitionend)(t), r);
      }
    }i.d(t, "b", function () {
      return e;
    }), i.d(t, "a", function () {
      return d;
    });var r = i(0),
        a = i.n(r),
        u = i(3),
        s = (i.n(u), ["mui-enter", "mui-leave"]),
        f = ["mui-enter-active", "mui-leave-active"],
        d = { animateIn: function animateIn(n, t, i) {
        o(!0, n, t, i);
      }, animateOut: function animateOut(n, t, i) {
        o(!1, n, t, i);
      } };
  } });
'use strict';

/******/(function (modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/var installedModules = {};
  /******/
  /******/ // The require function
  /******/function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/if (installedModules[moduleId]) {
      /******/return installedModules[moduleId].exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/var module = installedModules[moduleId] = {
      /******/i: moduleId,
      /******/l: false,
      /******/exports: {}
      /******/ };
    /******/
    /******/ // Execute the module function
    /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ // Flag the module as loaded
    /******/module.l = true;
    /******/
    /******/ // Return the exports of the module
    /******/return module.exports;
    /******/
  }
  /******/
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/__webpack_require__.m = modules;
  /******/
  /******/ // expose the module cache
  /******/__webpack_require__.c = installedModules;
  /******/
  /******/ // identity function for calling harmony imports with the correct context
  /******/__webpack_require__.i = function (value) {
    return value;
  };
  /******/
  /******/ // define getter function for harmony exports
  /******/__webpack_require__.d = function (exports, name, getter) {
    /******/if (!__webpack_require__.o(exports, name)) {
      /******/Object.defineProperty(exports, name, {
        /******/configurable: false,
        /******/enumerable: true,
        /******/get: getter
        /******/ });
      /******/
    }
    /******/
  };
  /******/
  /******/ // getDefaultExport function for compatibility with non-harmony modules
  /******/__webpack_require__.n = function (module) {
    /******/var getter = module && module.__esModule ?
    /******/function getDefault() {
      return module['default'];
    } :
    /******/function getModuleExports() {
      return module;
    };
    /******/__webpack_require__.d(getter, 'a', getter);
    /******/return getter;
    /******/
  };
  /******/
  /******/ // Object.prototype.hasOwnProperty.call
  /******/__webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  /******/
  /******/ // __webpack_public_path__
  /******/__webpack_require__.p = "";
  /******/
  /******/ // Load entry module and return exports
  /******/return __webpack_require__(__webpack_require__.s = 105);
  /******/
})(
/************************************************************************/
/******/{

  /***/0:
  /***/function _(module, exports) {

    module.exports = jQuery;

    /***/
  },

  /***/1:
  /***/function _(module, exports) {

    module.exports = { Foundation: window.Foundation };

    /***/
  },

  /***/105:
  /***/function _(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(39);

    /***/
  },

  /***/39:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";

    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core__ = __webpack_require__(1);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__foundation_core__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_nest__ = __webpack_require__(69);

    __WEBPACK_IMPORTED_MODULE_0__foundation_core__["Foundation"].Nest = __WEBPACK_IMPORTED_MODULE_1__foundation_util_nest__["a" /* Nest */];

    /***/
  },

  /***/69:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";
    /* harmony export (binding) */
    __webpack_require__.d(__webpack_exports__, "a", function () {
      return Nest;
    });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);

    var Nest = {
      Feather: function Feather(menu) {
        var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'zf';

        menu.attr('role', 'menubar');

        var items = menu.find('li').attr({ 'role': 'menuitem' }),
            subMenuClass = 'is-' + type + '-submenu',
            subItemClass = subMenuClass + '-item',
            hasSubClass = 'is-' + type + '-submenu-parent',
            applyAria = type !== 'accordion'; // Accordions handle their own ARIA attriutes.

        items.each(function () {
          var $item = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
              $sub = $item.children('ul');

          if ($sub.length) {
            $item.addClass(hasSubClass);
            $sub.addClass('submenu ' + subMenuClass).attr({ 'data-submenu': '' });
            if (applyAria) {
              $item.attr({
                'aria-haspopup': true,
                'aria-label': $item.children('a:first').text()
              });
              // Note:  Drilldowns behave differently in how they hide, and so need
              // additional attributes.  We should look if this possibly over-generalized
              // utility (Nest) is appropriate when we rework menus in 6.4
              if (type === 'drilldown') {
                $item.attr({ 'aria-expanded': false });
              }
            }
            $sub.addClass('submenu ' + subMenuClass).attr({
              'data-submenu': '',
              'role': 'menu'
            });
            if (type === 'drilldown') {
              $sub.attr({ 'aria-hidden': true });
            }
          }

          if ($item.parent('[data-submenu]').length) {
            $item.addClass('is-submenu-item ' + subItemClass);
          }
        });

        return;
      },
      Burn: function Burn(menu, type) {
        var //items = menu.find('li'),
        subMenuClass = 'is-' + type + '-submenu',
            subItemClass = subMenuClass + '-item',
            hasSubClass = 'is-' + type + '-submenu-parent';

        menu.find('>li, .menu, .menu > li').removeClass(subMenuClass + ' ' + subItemClass + ' ' + hasSubClass + ' is-submenu-item submenu is-active').removeAttr('data-submenu').css('display', '');
      }
    };

    /***/
  }

  /******/ });
"use strict";

!function (n) {
  function e(r) {
    if (t[r]) return t[r].exports;var u = t[r] = { i: r, l: !1, exports: {} };return n[r].call(u.exports, u, u.exports, e), u.l = !0, u.exports;
  }var t = {};e.m = n, e.c = t, e.i = function (n) {
    return n;
  }, e.d = function (n, t, r) {
    e.o(n, t) || Object.defineProperty(n, t, { configurable: !1, enumerable: !0, get: r });
  }, e.n = function (n) {
    var t = n && n.__esModule ? function () {
      return n.default;
    } : function () {
      return n;
    };return e.d(t, "a", t), t;
  }, e.o = function (n, e) {
    return Object.prototype.hasOwnProperty.call(n, e);
  }, e.p = "", e(e.s = 105);
}({ 0: function _(n, e) {
    n.exports = jQuery;
  }, 1: function _(n, e) {
    n.exports = { Foundation: window.Foundation };
  }, 105: function _(n, e, t) {
    n.exports = t(39);
  }, 39: function _(n, e, t) {
    "use strict";
    Object.defineProperty(e, "__esModule", { value: !0 });var r = t(1),
        u = (t.n(r), t(69));r.Foundation.Nest = u.a;
  }, 69: function _(n, e, t) {
    "use strict";
    t.d(e, "a", function () {
      return a;
    });var r = t(0),
        u = t.n(r),
        a = { Feather: function Feather(n) {
        var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "zf";n.attr("role", "menubar");var t = n.find("li").attr({ role: "menuitem" }),
            r = "is-" + e + "-submenu",
            a = r + "-item",
            i = "is-" + e + "-submenu-parent",
            o = "accordion" !== e;t.each(function () {
          var n = u()(this),
              t = n.children("ul");t.length && (n.addClass(i), t.addClass("submenu " + r).attr({ "data-submenu": "" }), o && (n.attr({ "aria-haspopup": !0, "aria-label": n.children("a:first").text() }), "drilldown" === e && n.attr({ "aria-expanded": !1 })), t.addClass("submenu " + r).attr({ "data-submenu": "", role: "menu" }), "drilldown" === e && t.attr({ "aria-hidden": !0 })), n.parent("[data-submenu]").length && n.addClass("is-submenu-item " + a);
        });
      }, Burn: function Burn(n, e) {
        var t = "is-" + e + "-submenu",
            r = t + "-item",
            u = "is-" + e + "-submenu-parent";n.find(">li, .menu, .menu > li").removeClass(t + " " + r + " " + u + " is-submenu-item submenu is-active").removeAttr("data-submenu").css("display", "");
      } };
  } });
'use strict';

/******/(function (modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/var installedModules = {};
  /******/
  /******/ // The require function
  /******/function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/if (installedModules[moduleId]) {
      /******/return installedModules[moduleId].exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/var module = installedModules[moduleId] = {
      /******/i: moduleId,
      /******/l: false,
      /******/exports: {}
      /******/ };
    /******/
    /******/ // Execute the module function
    /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ // Flag the module as loaded
    /******/module.l = true;
    /******/
    /******/ // Return the exports of the module
    /******/return module.exports;
    /******/
  }
  /******/
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/__webpack_require__.m = modules;
  /******/
  /******/ // expose the module cache
  /******/__webpack_require__.c = installedModules;
  /******/
  /******/ // identity function for calling harmony imports with the correct context
  /******/__webpack_require__.i = function (value) {
    return value;
  };
  /******/
  /******/ // define getter function for harmony exports
  /******/__webpack_require__.d = function (exports, name, getter) {
    /******/if (!__webpack_require__.o(exports, name)) {
      /******/Object.defineProperty(exports, name, {
        /******/configurable: false,
        /******/enumerable: true,
        /******/get: getter
        /******/ });
      /******/
    }
    /******/
  };
  /******/
  /******/ // getDefaultExport function for compatibility with non-harmony modules
  /******/__webpack_require__.n = function (module) {
    /******/var getter = module && module.__esModule ?
    /******/function getDefault() {
      return module['default'];
    } :
    /******/function getModuleExports() {
      return module;
    };
    /******/__webpack_require__.d(getter, 'a', getter);
    /******/return getter;
    /******/
  };
  /******/
  /******/ // Object.prototype.hasOwnProperty.call
  /******/__webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  /******/
  /******/ // __webpack_public_path__
  /******/__webpack_require__.p = "";
  /******/
  /******/ // Load entry module and return exports
  /******/return __webpack_require__(__webpack_require__.s = 106);
  /******/
})(
/************************************************************************/
/******/{

  /***/0:
  /***/function _(module, exports) {

    module.exports = jQuery;

    /***/
  },

  /***/1:
  /***/function _(module, exports) {

    module.exports = { Foundation: window.Foundation };

    /***/
  },

  /***/106:
  /***/function _(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(40);

    /***/
  },

  /***/40:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";

    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core__ = __webpack_require__(1);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__foundation_core__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_timer__ = __webpack_require__(70);

    __WEBPACK_IMPORTED_MODULE_0__foundation_core__["Foundation"].Timer = __WEBPACK_IMPORTED_MODULE_1__foundation_util_timer__["a" /* Timer */];

    /***/
  },

  /***/70:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";
    /* harmony export (binding) */
    __webpack_require__.d(__webpack_exports__, "a", function () {
      return Timer;
    });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);

    function Timer(elem, options, cb) {
      var _this = this,
          duration = options.duration,

      //options is an object for easily adding features later.
      nameSpace = Object.keys(elem.data())[0] || 'timer',
          remain = -1,
          start,
          timer;

      this.isPaused = false;

      this.restart = function () {
        remain = -1;
        clearTimeout(timer);
        this.start();
      };

      this.start = function () {
        this.isPaused = false;
        // if(!elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
        clearTimeout(timer);
        remain = remain <= 0 ? duration : remain;
        elem.data('paused', false);
        start = Date.now();
        timer = setTimeout(function () {
          if (options.infinite) {
            _this.restart(); //rerun the timer.
          }
          if (cb && typeof cb === 'function') {
            cb();
          }
        }, remain);
        elem.trigger('timerstart.zf.' + nameSpace);
      };

      this.pause = function () {
        this.isPaused = true;
        //if(elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
        clearTimeout(timer);
        elem.data('paused', true);
        var end = Date.now();
        remain = remain - (end - start);
        elem.trigger('timerpaused.zf.' + nameSpace);
      };
    }

    /***/
  }

  /******/ });
"use strict";

!function (t) {
  function e(r) {
    if (n[r]) return n[r].exports;var i = n[r] = { i: r, l: !1, exports: {} };return t[r].call(i.exports, i, i.exports, e), i.l = !0, i.exports;
  }var n = {};e.m = t, e.c = n, e.i = function (t) {
    return t;
  }, e.d = function (t, n, r) {
    e.o(t, n) || Object.defineProperty(t, n, { configurable: !1, enumerable: !0, get: r });
  }, e.n = function (t) {
    var n = t && t.__esModule ? function () {
      return t.default;
    } : function () {
      return t;
    };return e.d(n, "a", n), n;
  }, e.o = function (t, e) {
    return Object.prototype.hasOwnProperty.call(t, e);
  }, e.p = "", e(e.s = 106);
}({ 0: function _(t, e) {
    t.exports = jQuery;
  }, 1: function _(t, e) {
    t.exports = { Foundation: window.Foundation };
  }, 106: function _(t, e, n) {
    t.exports = n(40);
  }, 40: function _(t, e, n) {
    "use strict";
    Object.defineProperty(e, "__esModule", { value: !0 });var r = n(1),
        i = (n.n(r), n(70));r.Foundation.Timer = i.a;
  }, 70: function _(t, e, n) {
    "use strict";
    function r(t, e, n) {
      var r,
          i,
          o = this,
          u = e.duration,
          a = Object.keys(t.data())[0] || "timer",
          s = -1;this.isPaused = !1, this.restart = function () {
        s = -1, clearTimeout(i), this.start();
      }, this.start = function () {
        this.isPaused = !1, clearTimeout(i), s = s <= 0 ? u : s, t.data("paused", !1), r = Date.now(), i = setTimeout(function () {
          e.infinite && o.restart(), n && "function" == typeof n && n();
        }, s), t.trigger("timerstart.zf." + a);
      }, this.pause = function () {
        this.isPaused = !0, clearTimeout(i), t.data("paused", !0);var e = Date.now();s -= e - r, t.trigger("timerpaused.zf." + a);
      };
    }n.d(e, "a", function () {
      return r;
    });var i = n(0);n.n(i);
  } });
'use strict';

!function ($) {

  function Timer(elem, options, cb) {
    var _this = this,
        duration = options.duration,

    //options is an object for easily adding features later.
    nameSpace = Object.keys(elem.data())[0] || 'timer',
        remain = -1,
        start,
        timer;

    this.isPaused = false;

    this.restart = function () {
      remain = -1;
      clearTimeout(timer);
      this.start();
    };

    this.start = function () {
      this.isPaused = false;
      // if(!elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      remain = remain <= 0 ? duration : remain;
      elem.data('paused', false);
      start = Date.now();
      timer = setTimeout(function () {
        if (options.infinite) {
          _this.restart(); //rerun the timer.
        }
        if (cb && typeof cb === 'function') {
          cb();
        }
      }, remain);
      elem.trigger('timerstart.zf.' + nameSpace);
    };

    this.pause = function () {
      this.isPaused = true;
      //if(elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      elem.data('paused', true);
      var end = Date.now();
      remain = remain - (end - start);
      elem.trigger('timerpaused.zf.' + nameSpace);
    };
  }

  /**
   * Runs a callback function when images are fully loaded.
   * @param {Object} images - Image(s) to check if loaded.
   * @param {Func} callback - Function to execute when image is fully loaded.
   */
  function onImagesLoaded(images, callback) {
    var self = this,
        unloaded = images.length;

    if (unloaded === 0) {
      callback();
    }

    images.each(function () {
      // Check if image is loaded
      if (this.complete || this.readyState === 4 || this.readyState === 'complete') {
        singleImageLoaded();
      }
      // Force load the image
      else {
          // fix for IE. See https://css-tricks.com/snippets/jquery/fixing-load-in-ie-for-cached-images/
          var src = $(this).attr('src');
          $(this).attr('src', src + (src.indexOf('?') >= 0 ? '&' : '?') + new Date().getTime());
          $(this).one('load', function () {
            singleImageLoaded();
          });
        }
    });

    function singleImageLoaded() {
      unloaded--;
      if (unloaded === 0) {
        callback();
      }
    }
  }

  Foundation.Timer = Timer;
  Foundation.onImagesLoaded = onImagesLoaded;
}(jQuery);
"use strict";
!function (t) {
  function e(t, e, i) {
    var a,
        s,
        n = this,
        r = e.duration,
        o = Object.keys(t.data())[0] || "timer",
        u = -1;this.isPaused = !1, this.restart = function () {
      u = -1, clearTimeout(s), this.start();
    }, this.start = function () {
      this.isPaused = !1, clearTimeout(s), u = u <= 0 ? r : u, t.data("paused", !1), a = Date.now(), s = setTimeout(function () {
        e.infinite && n.restart(), i && "function" == typeof i && i();
      }, u), t.trigger("timerstart.zf." + o);
    }, this.pause = function () {
      this.isPaused = !0, clearTimeout(s), t.data("paused", !0);var e = Date.now();u -= e - a, t.trigger("timerpaused.zf." + o);
    };
  }function i(e, i) {
    function a() {
      s--, 0 === s && i();
    }var s = e.length;0 === s && i(), e.each(function () {
      if (this.complete || 4 === this.readyState || "complete" === this.readyState) a();else {
        var e = t(this).attr("src");t(this).attr("src", e + (e.indexOf("?") >= 0 ? "&" : "?") + new Date().getTime()), t(this).one("load", function () {
          a();
        });
      }
    });
  }Foundation.Timer = e, Foundation.onImagesLoaded = i;
}(jQuery);
'use strict';

/******/(function (modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/var installedModules = {};
  /******/
  /******/ // The require function
  /******/function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/if (installedModules[moduleId]) {
      /******/return installedModules[moduleId].exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/var module = installedModules[moduleId] = {
      /******/i: moduleId,
      /******/l: false,
      /******/exports: {}
      /******/ };
    /******/
    /******/ // Execute the module function
    /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ // Flag the module as loaded
    /******/module.l = true;
    /******/
    /******/ // Return the exports of the module
    /******/return module.exports;
    /******/
  }
  /******/
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/__webpack_require__.m = modules;
  /******/
  /******/ // expose the module cache
  /******/__webpack_require__.c = installedModules;
  /******/
  /******/ // identity function for calling harmony imports with the correct context
  /******/__webpack_require__.i = function (value) {
    return value;
  };
  /******/
  /******/ // define getter function for harmony exports
  /******/__webpack_require__.d = function (exports, name, getter) {
    /******/if (!__webpack_require__.o(exports, name)) {
      /******/Object.defineProperty(exports, name, {
        /******/configurable: false,
        /******/enumerable: true,
        /******/get: getter
        /******/ });
      /******/
    }
    /******/
  };
  /******/
  /******/ // getDefaultExport function for compatibility with non-harmony modules
  /******/__webpack_require__.n = function (module) {
    /******/var getter = module && module.__esModule ?
    /******/function getDefault() {
      return module['default'];
    } :
    /******/function getModuleExports() {
      return module;
    };
    /******/__webpack_require__.d(getter, 'a', getter);
    /******/return getter;
    /******/
  };
  /******/
  /******/ // Object.prototype.hasOwnProperty.call
  /******/__webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  /******/
  /******/ // __webpack_public_path__
  /******/__webpack_require__.p = "";
  /******/
  /******/ // Load entry module and return exports
  /******/return __webpack_require__(__webpack_require__.s = 107);
  /******/
})(
/************************************************************************/
/******/{

  /***/0:
  /***/function _(module, exports) {

    module.exports = jQuery;

    /***/
  },

  /***/107:
  /***/function _(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(41);

    /***/
  },

  /***/41:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";

    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_touch__ = __webpack_require__(71);

    __WEBPACK_IMPORTED_MODULE_1__foundation_util_touch__["a" /* Touch */].init(__WEBPACK_IMPORTED_MODULE_0_jquery___default.a);

    window.Foundation.Touch = __WEBPACK_IMPORTED_MODULE_1__foundation_util_touch__["a" /* Touch */];

    /***/
  },

  /***/71:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";
    /* harmony export (binding) */
    __webpack_require__.d(__webpack_exports__, "a", function () {
      return Touch;
    });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
    var _createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
      }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
      };
    }();

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    //**************************************************
    //**Work inspired by multiple jquery swipe plugins**
    //**Done by Yohai Ararat ***************************
    //**************************************************


    var Touch = {};

    var startPosX,
        startPosY,
        startTime,
        elapsedTime,
        isMoving = false;

    function onTouchEnd() {
      //  alert(this);
      this.removeEventListener('touchmove', onTouchMove);
      this.removeEventListener('touchend', onTouchEnd);
      isMoving = false;
    }

    function onTouchMove(e) {
      if (__WEBPACK_IMPORTED_MODULE_0_jquery___default.a.spotSwipe.preventDefault) {
        e.preventDefault();
      }
      if (isMoving) {
        var x = e.touches[0].pageX;
        var y = e.touches[0].pageY;
        var dx = startPosX - x;
        var dy = startPosY - y;
        var dir;
        elapsedTime = new Date().getTime() - startTime;
        if (Math.abs(dx) >= __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.spotSwipe.moveThreshold && elapsedTime <= __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.spotSwipe.timeThreshold) {
          dir = dx > 0 ? 'left' : 'right';
        }
        // else if(Math.abs(dy) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
        //   dir = dy > 0 ? 'down' : 'up';
        // }
        if (dir) {
          e.preventDefault();
          onTouchEnd.call(this);
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).trigger('swipe', dir).trigger('swipe' + dir);
        }
      }
    }

    function onTouchStart(e) {
      if (e.touches.length == 1) {
        startPosX = e.touches[0].pageX;
        startPosY = e.touches[0].pageY;
        isMoving = true;
        startTime = new Date().getTime();
        this.addEventListener('touchmove', onTouchMove, false);
        this.addEventListener('touchend', onTouchEnd, false);
      }
    }

    function init() {
      this.addEventListener && this.addEventListener('touchstart', onTouchStart, false);
    }

    function teardown() {
      this.removeEventListener('touchstart', onTouchStart);
    }

    var SpotSwipe = function () {
      function SpotSwipe($) {
        _classCallCheck(this, SpotSwipe);

        this.version = '1.0.0';
        this.enabled = 'ontouchstart' in document.documentElement;
        this.preventDefault = false;
        this.moveThreshold = 75;
        this.timeThreshold = 200;
        this.$ = $;
        this._init();
      }

      _createClass(SpotSwipe, [{
        key: '_init',
        value: function _init() {
          var $ = this.$;
          $.event.special.swipe = { setup: init };

          $.each(['left', 'up', 'down', 'right'], function () {
            $.event.special['swipe' + this] = { setup: function setup() {
                $(this).on('swipe', $.noop);
              } };
          });
        }
      }]);

      return SpotSwipe;
    }();

    /****************************************************
     * As far as I can tell, both setupSpotSwipe and    *
     * setupTouchHandler should be idempotent,          *
     * because they directly replace functions &        *
     * values, and do not add event handlers directly.  *
     ****************************************************/

    Touch.setupSpotSwipe = function ($) {
      $.spotSwipe = new SpotSwipe($);
    };

    /****************************************************
     * Method for adding pseudo drag events to elements *
     ***************************************************/
    Touch.setupTouchHandler = function ($) {
      $.fn.addTouch = function () {
        this.each(function (i, el) {
          $(el).bind('touchstart touchmove touchend touchcancel', function () {
            //we pass the original event object because the jQuery event
            //object is normalized to w3c specs and does not provide the TouchList
            handleTouch(event);
          });
        });

        var handleTouch = function handleTouch(event) {
          var touches = event.changedTouches,
              first = touches[0],
              eventTypes = {
            touchstart: 'mousedown',
            touchmove: 'mousemove',
            touchend: 'mouseup'
          },
              type = eventTypes[event.type],
              simulatedEvent;

          if ('MouseEvent' in window && typeof window.MouseEvent === 'function') {
            simulatedEvent = new window.MouseEvent(type, {
              'bubbles': true,
              'cancelable': true,
              'screenX': first.screenX,
              'screenY': first.screenY,
              'clientX': first.clientX,
              'clientY': first.clientY
            });
          } else {
            simulatedEvent = document.createEvent('MouseEvent');
            simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/, null);
          }
          first.target.dispatchEvent(simulatedEvent);
        };
      };
    };

    Touch.init = function ($) {
      if (typeof $.spotSwipe === 'undefined') {
        Touch.setupSpotSwipe($);
        Touch.setupTouchHandler($);
      }
    };

    /***/
  }

  /******/ });
"use strict";

!function (e) {
  function t(o) {
    if (n[o]) return n[o].exports;var i = n[o] = { i: o, l: !1, exports: {} };return e[o].call(i.exports, i, i.exports, t), i.l = !0, i.exports;
  }var n = {};t.m = e, t.c = n, t.i = function (e) {
    return e;
  }, t.d = function (e, n, o) {
    t.o(e, n) || Object.defineProperty(e, n, { configurable: !1, enumerable: !0, get: o });
  }, t.n = function (e) {
    var n = e && e.__esModule ? function () {
      return e.default;
    } : function () {
      return e;
    };return t.d(n, "a", n), n;
  }, t.o = function (e, t) {
    return Object.prototype.hasOwnProperty.call(e, t);
  }, t.p = "", t(t.s = 107);
}({ 0: function _(e, t) {
    e.exports = jQuery;
  }, 107: function _(e, t, n) {
    e.exports = n(41);
  }, 41: function _(e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 });var o = n(0),
        i = n.n(o),
        u = n(71);u.a.init(i.a), window.Foundation.Touch = u.a;
  }, 71: function _(e, t, n) {
    "use strict";
    function o(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }function i() {
      this.removeEventListener("touchmove", u), this.removeEventListener("touchend", i), w = !1;
    }function u(e) {
      if (l.a.spotSwipe.preventDefault && e.preventDefault(), w) {
        var t,
            n = e.touches[0].pageX,
            o = (e.touches[0].pageY, s - n);p = new Date().getTime() - h, Math.abs(o) >= l.a.spotSwipe.moveThreshold && p <= l.a.spotSwipe.timeThreshold && (t = o > 0 ? "left" : "right"), t && (e.preventDefault(), i.call(this), l()(this).trigger("swipe", t).trigger("swipe" + t));
      }
    }function r(e) {
      1 == e.touches.length && (s = e.touches[0].pageX, a = e.touches[0].pageY, w = !0, h = new Date().getTime(), this.addEventListener("touchmove", u, !1), this.addEventListener("touchend", i, !1));
    }function c() {
      this.addEventListener && this.addEventListener("touchstart", r, !1);
    }n.d(t, "a", function () {
      return v;
    });var s,
        a,
        h,
        p,
        f = n(0),
        l = n.n(f),
        d = function () {
      function e(e, t) {
        for (var n = 0; n < t.length; n++) {
          var o = t[n];o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
        }
      }return function (t, n, o) {
        return n && e(t.prototype, n), o && e(t, o), t;
      };
    }(),
        v = {},
        w = !1,
        m = function () {
      function e(t) {
        o(this, e), this.version = "1.0.0", this.enabled = "ontouchstart" in document.documentElement, this.preventDefault = !1, this.moveThreshold = 75, this.timeThreshold = 200, this.$ = t, this._init();
      }return d(e, [{ key: "_init", value: function value() {
          var e = this.$;e.event.special.swipe = { setup: c }, e.each(["left", "up", "down", "right"], function () {
            e.event.special["swipe" + this] = { setup: function setup() {
                e(this).on("swipe", e.noop);
              } };
          });
        } }]), e;
    }();v.setupSpotSwipe = function (e) {
      e.spotSwipe = new m(e);
    }, v.setupTouchHandler = function (e) {
      e.fn.addTouch = function () {
        this.each(function (n, o) {
          e(o).bind("touchstart touchmove touchend touchcancel", function () {
            t(event);
          });
        });var t = function t(e) {
          var t,
              n = e.changedTouches,
              o = n[0],
              i = { touchstart: "mousedown", touchmove: "mousemove", touchend: "mouseup" },
              u = i[e.type];"MouseEvent" in window && "function" == typeof window.MouseEvent ? t = new window.MouseEvent(u, { bubbles: !0, cancelable: !0, screenX: o.screenX, screenY: o.screenY, clientX: o.clientX, clientY: o.clientY }) : (t = document.createEvent("MouseEvent"), t.initMouseEvent(u, !0, !0, window, 1, o.screenX, o.screenY, o.clientX, o.clientY, !1, !1, !1, !1, 0, null)), o.target.dispatchEvent(t);
        };
      };
    }, v.init = function (e) {
      void 0 === e.spotSwipe && (v.setupSpotSwipe(e), v.setupTouchHandler(e));
    };
  } });
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/******/(function (modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/var installedModules = {};
  /******/
  /******/ // The require function
  /******/function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/if (installedModules[moduleId]) {
      /******/return installedModules[moduleId].exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/var module = installedModules[moduleId] = {
      /******/i: moduleId,
      /******/l: false,
      /******/exports: {}
      /******/ };
    /******/
    /******/ // Execute the module function
    /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ // Flag the module as loaded
    /******/module.l = true;
    /******/
    /******/ // Return the exports of the module
    /******/return module.exports;
    /******/
  }
  /******/
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/__webpack_require__.m = modules;
  /******/
  /******/ // expose the module cache
  /******/__webpack_require__.c = installedModules;
  /******/
  /******/ // identity function for calling harmony imports with the correct context
  /******/__webpack_require__.i = function (value) {
    return value;
  };
  /******/
  /******/ // define getter function for harmony exports
  /******/__webpack_require__.d = function (exports, name, getter) {
    /******/if (!__webpack_require__.o(exports, name)) {
      /******/Object.defineProperty(exports, name, {
        /******/configurable: false,
        /******/enumerable: true,
        /******/get: getter
        /******/ });
      /******/
    }
    /******/
  };
  /******/
  /******/ // getDefaultExport function for compatibility with non-harmony modules
  /******/__webpack_require__.n = function (module) {
    /******/var getter = module && module.__esModule ?
    /******/function getDefault() {
      return module['default'];
    } :
    /******/function getModuleExports() {
      return module;
    };
    /******/__webpack_require__.d(getter, 'a', getter);
    /******/return getter;
    /******/
  };
  /******/
  /******/ // Object.prototype.hasOwnProperty.call
  /******/__webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  /******/
  /******/ // __webpack_public_path__
  /******/__webpack_require__.p = "";
  /******/
  /******/ // Load entry module and return exports
  /******/return __webpack_require__(__webpack_require__.s = 108);
  /******/
})(
/************************************************************************/
/******/{

  /***/0:
  /***/function _(module, exports) {

    module.exports = jQuery;

    /***/
  },

  /***/1:
  /***/function _(module, exports) {

    module.exports = { Foundation: window.Foundation };

    /***/
  },

  /***/108:
  /***/function _(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(42);

    /***/
  },

  /***/4:
  /***/function _(module, exports) {

    module.exports = { Motion: window.Foundation.Motion, Move: window.Foundation.Move };

    /***/
  },

  /***/42:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";

    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core__ = __webpack_require__(1);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__foundation_core__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1_jquery__ = __webpack_require__(0);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_jquery__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_2__foundation_util_triggers__ = __webpack_require__(7);

    __WEBPACK_IMPORTED_MODULE_2__foundation_util_triggers__["a" /* Triggers */].init(__WEBPACK_IMPORTED_MODULE_1_jquery___default.a, __WEBPACK_IMPORTED_MODULE_0__foundation_core__["Foundation"]);

    /***/
  },

  /***/7:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";
    /* harmony export (binding) */
    __webpack_require__.d(__webpack_exports__, "a", function () {
      return Triggers;
    });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_motion__ = __webpack_require__(4);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_motion___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__foundation_util_motion__);

    var MutationObserver = function () {
      var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
      for (var i = 0; i < prefixes.length; i++) {
        if (prefixes[i] + 'MutationObserver' in window) {
          return window[prefixes[i] + 'MutationObserver'];
        }
      }
      return false;
    }();

    var triggers = function triggers(el, type) {
      el.data(type).split(' ').forEach(function (id) {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + id)[type === 'close' ? 'trigger' : 'triggerHandler'](type + '.zf.trigger', [el]);
      });
    };

    var Triggers = {
      Listeners: {
        Basic: {},
        Global: {}
      },
      Initializers: {}
    };

    Triggers.Listeners.Basic = {
      openListener: function openListener() {
        triggers(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this), 'open');
      },
      closeListener: function closeListener() {
        var id = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).data('close');
        if (id) {
          triggers(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this), 'close');
        } else {
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).trigger('close.zf.trigger');
        }
      },
      toggleListener: function toggleListener() {
        var id = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).data('toggle');
        if (id) {
          triggers(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this), 'toggle');
        } else {
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).trigger('toggle.zf.trigger');
        }
      },
      closeableListener: function closeableListener(e) {
        e.stopPropagation();
        var animation = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).data('closable');

        if (animation !== '') {
          __WEBPACK_IMPORTED_MODULE_1__foundation_util_motion__["Motion"].animateOut(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this), animation, function () {
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).trigger('closed.zf');
          });
        } else {
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).fadeOut().trigger('closed.zf');
        }
      },
      toggleFocusListener: function toggleFocusListener() {
        var id = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).data('toggle-focus');
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + id).triggerHandler('toggle.zf.trigger', [__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this)]);
      }
    };

    // Elements with [data-open] will reveal a plugin that supports it when clicked.
    Triggers.Initializers.addOpenListener = function ($elem) {
      $elem.off('click.zf.trigger', Triggers.Listeners.Basic.openListener);
      $elem.on('click.zf.trigger', '[data-open]', Triggers.Listeners.Basic.openListener);
    };

    // Elements with [data-close] will close a plugin that supports it when clicked.
    // If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
    Triggers.Initializers.addCloseListener = function ($elem) {
      $elem.off('click.zf.trigger', Triggers.Listeners.Basic.closeListener);
      $elem.on('click.zf.trigger', '[data-close]', Triggers.Listeners.Basic.closeListener);
    };

    // Elements with [data-toggle] will toggle a plugin that supports it when clicked.
    Triggers.Initializers.addToggleListener = function ($elem) {
      $elem.off('click.zf.trigger', Triggers.Listeners.Basic.toggleListener);
      $elem.on('click.zf.trigger', '[data-toggle]', Triggers.Listeners.Basic.toggleListener);
    };

    // Elements with [data-closable] will respond to close.zf.trigger events.
    Triggers.Initializers.addCloseableListener = function ($elem) {
      $elem.off('close.zf.trigger', Triggers.Listeners.Basic.closeableListener);
      $elem.on('close.zf.trigger', '[data-closeable], [data-closable]', Triggers.Listeners.Basic.closeableListener);
    };

    // Elements with [data-toggle-focus] will respond to coming in and out of focus
    Triggers.Initializers.addToggleFocusListener = function ($elem) {
      $elem.off('focus.zf.trigger blur.zf.trigger', Triggers.Listeners.Basic.toggleFocusListener);
      $elem.on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', Triggers.Listeners.Basic.toggleFocusListener);
    };

    // More Global/complex listeners and triggers
    Triggers.Listeners.Global = {
      resizeListener: function resizeListener($nodes) {
        if (!MutationObserver) {
          //fallback for IE 9
          $nodes.each(function () {
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).triggerHandler('resizeme.zf.trigger');
          });
        }
        //trigger all listening elements and signal a resize event
        $nodes.attr('data-events', "resize");
      },
      scrollListener: function scrollListener($nodes) {
        if (!MutationObserver) {
          //fallback for IE 9
          $nodes.each(function () {
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).triggerHandler('scrollme.zf.trigger');
          });
        }
        //trigger all listening elements and signal a scroll event
        $nodes.attr('data-events', "scroll");
      },
      closeMeListener: function closeMeListener(e, pluginId) {
        var plugin = e.namespace.split('.')[0];
        var plugins = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');

        plugins.each(function () {
          var _this = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this);
          _this.triggerHandler('close.zf.trigger', [_this]);
        });
      }

      // Global, parses whole document.
    };Triggers.Initializers.addClosemeListener = function (pluginName) {
      var yetiBoxes = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-yeti-box]'),
          plugNames = ['dropdown', 'tooltip', 'reveal'];

      if (pluginName) {
        if (typeof pluginName === 'string') {
          plugNames.push(pluginName);
        } else if ((typeof pluginName === 'undefined' ? 'undefined' : _typeof(pluginName)) === 'object' && typeof pluginName[0] === 'string') {
          plugNames.concat(pluginName);
        } else {
          console.error('Plugin names must be strings');
        }
      }
      if (yetiBoxes.length) {
        var listeners = plugNames.map(function (name) {
          return 'closeme.zf.' + name;
        }).join(' ');

        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off(listeners).on(listeners, Triggers.Listeners.Global.closeMeListener);
      }
    };

    function debounceGlobalListener(debounce, trigger, listener) {
      var timer = void 0,
          args = Array.prototype.slice.call(arguments, 3);
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off(trigger).on(trigger, function (e) {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(function () {
          listener.apply(null, args);
        }, debounce || 10); //default time to emit scroll event
      });
    }

    Triggers.Initializers.addResizeListener = function (debounce) {
      var $nodes = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-resize]');
      if ($nodes.length) {
        debounceGlobalListener(debounce, 'resize.zf.trigger', Triggers.Listeners.Global.resizeListener, $nodes);
      }
    };

    Triggers.Initializers.addScrollListener = function (debounce) {
      var $nodes = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-scroll]');
      if ($nodes.length) {
        debounceGlobalListener(debounce, 'scroll.zf.trigger', Triggers.Listeners.Global.scrollListener, $nodes);
      }
    };

    Triggers.Initializers.addMutationEventsListener = function ($elem) {
      if (!MutationObserver) {
        return false;
      }
      var $nodes = $elem.find('[data-resize], [data-scroll], [data-mutate]');

      //element callback
      var listeningElementsMutation = function listeningElementsMutation(mutationRecordsList) {
        var $target = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(mutationRecordsList[0].target);

        //trigger the event handler for the element depending on type
        switch (mutationRecordsList[0].type) {
          case "attributes":
            if ($target.attr("data-events") === "scroll" && mutationRecordsList[0].attributeName === "data-events") {
              $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
            }
            if ($target.attr("data-events") === "resize" && mutationRecordsList[0].attributeName === "data-events") {
              $target.triggerHandler('resizeme.zf.trigger', [$target]);
            }
            if (mutationRecordsList[0].attributeName === "style") {
              $target.closest("[data-mutate]").attr("data-events", "mutate");
              $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
            }
            break;

          case "childList":
            $target.closest("[data-mutate]").attr("data-events", "mutate");
            $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
            break;

          default:
            return false;
          //nothing
        }
      };

      if ($nodes.length) {
        //for each element that needs to listen for resizing, scrolling, or mutation add a single observer
        for (var i = 0; i <= $nodes.length - 1; i++) {
          var elementObserver = new MutationObserver(listeningElementsMutation);
          elementObserver.observe($nodes[i], { attributes: true, childList: true, characterData: false, subtree: true, attributeFilter: ["data-events", "style"] });
        }
      }
    };

    Triggers.Initializers.addSimpleListeners = function () {
      var $document = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(document);

      Triggers.Initializers.addOpenListener($document);
      Triggers.Initializers.addCloseListener($document);
      Triggers.Initializers.addToggleListener($document);
      Triggers.Initializers.addCloseableListener($document);
      Triggers.Initializers.addToggleFocusListener($document);
    };

    Triggers.Initializers.addGlobalListeners = function () {
      var $document = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(document);
      Triggers.Initializers.addMutationEventsListener($document);
      Triggers.Initializers.addResizeListener();
      Triggers.Initializers.addScrollListener();
      Triggers.Initializers.addClosemeListener();
    };

    Triggers.init = function ($, Foundation) {
      if (typeof $.triggersInitialized === 'undefined') {
        var $document = $(document);

        if (document.readyState === "complete") {
          Triggers.Initializers.addSimpleListeners();
          Triggers.Initializers.addGlobalListeners();
        } else {
          $(window).on('load', function () {
            Triggers.Initializers.addSimpleListeners();
            Triggers.Initializers.addGlobalListeners();
          });
        }

        $.triggersInitialized = true;
      }

      if (Foundation) {
        Foundation.Triggers = Triggers;
        // Legacy included to be backwards compatible for now.
        Foundation.IHearYou = Triggers.Initializers.addGlobalListeners;
      }
    };

    /***/
  }

  /******/ });
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function (e) {
  function t(r) {
    if (i[r]) return i[r].exports;var n = i[r] = { i: r, l: !1, exports: {} };return e[r].call(n.exports, n, n.exports, t), n.l = !0, n.exports;
  }var i = {};t.m = e, t.c = i, t.i = function (e) {
    return e;
  }, t.d = function (e, i, r) {
    t.o(e, i) || Object.defineProperty(e, i, { configurable: !1, enumerable: !0, get: r });
  }, t.n = function (e) {
    var i = e && e.__esModule ? function () {
      return e.default;
    } : function () {
      return e;
    };return t.d(i, "a", i), i;
  }, t.o = function (e, t) {
    return Object.prototype.hasOwnProperty.call(e, t);
  }, t.p = "", t(t.s = 108);
}({ 0: function _(e, t) {
    e.exports = jQuery;
  }, 1: function _(e, t) {
    e.exports = { Foundation: window.Foundation };
  }, 108: function _(e, t, i) {
    e.exports = i(42);
  }, 4: function _(e, t) {
    e.exports = { Motion: window.Foundation.Motion, Move: window.Foundation.Move };
  }, 42: function _(e, t, i) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 });var r = i(1),
        n = (i.n(r), i(0)),
        s = i.n(n);i(7).a.init(s.a, r.Foundation);
  }, 7: function _(e, t, i) {
    "use strict";
    function r(e, t, i) {
      var r = void 0,
          n = Array.prototype.slice.call(arguments, 3);s()(window).off(t).on(t, function (t) {
        r && clearTimeout(r), r = setTimeout(function () {
          i.apply(null, n);
        }, e || 10);
      });
    }i.d(t, "a", function () {
      return c;
    });var n = i(0),
        s = i.n(n),
        a = i(4),
        o = (i.n(a), function () {
      for (var e = ["WebKit", "Moz", "O", "Ms", ""], t = 0; t < e.length; t++) {
        if (e[t] + "MutationObserver" in window) return window[e[t] + "MutationObserver"];
      }return !1;
    }()),
        l = function l(e, t) {
      e.data(t).split(" ").forEach(function (i) {
        s()("#" + i)["close" === t ? "trigger" : "triggerHandler"](t + ".zf.trigger", [e]);
      });
    },
        c = { Listeners: { Basic: {}, Global: {} }, Initializers: {} };c.Listeners.Basic = { openListener: function openListener() {
        l(s()(this), "open");
      }, closeListener: function closeListener() {
        s()(this).data("close") ? l(s()(this), "close") : s()(this).trigger("close.zf.trigger");
      }, toggleListener: function toggleListener() {
        s()(this).data("toggle") ? l(s()(this), "toggle") : s()(this).trigger("toggle.zf.trigger");
      }, closeableListener: function closeableListener(e) {
        e.stopPropagation();var t = s()(this).data("closable");"" !== t ? a.Motion.animateOut(s()(this), t, function () {
          s()(this).trigger("closed.zf");
        }) : s()(this).fadeOut().trigger("closed.zf");
      }, toggleFocusListener: function toggleFocusListener() {
        var e = s()(this).data("toggle-focus");s()("#" + e).triggerHandler("toggle.zf.trigger", [s()(this)]);
      } }, c.Initializers.addOpenListener = function (e) {
      e.off("click.zf.trigger", c.Listeners.Basic.openListener), e.on("click.zf.trigger", "[data-open]", c.Listeners.Basic.openListener);
    }, c.Initializers.addCloseListener = function (e) {
      e.off("click.zf.trigger", c.Listeners.Basic.closeListener), e.on("click.zf.trigger", "[data-close]", c.Listeners.Basic.closeListener);
    }, c.Initializers.addToggleListener = function (e) {
      e.off("click.zf.trigger", c.Listeners.Basic.toggleListener), e.on("click.zf.trigger", "[data-toggle]", c.Listeners.Basic.toggleListener);
    }, c.Initializers.addCloseableListener = function (e) {
      e.off("close.zf.trigger", c.Listeners.Basic.closeableListener), e.on("close.zf.trigger", "[data-closeable], [data-closable]", c.Listeners.Basic.closeableListener);
    }, c.Initializers.addToggleFocusListener = function (e) {
      e.off("focus.zf.trigger blur.zf.trigger", c.Listeners.Basic.toggleFocusListener), e.on("focus.zf.trigger blur.zf.trigger", "[data-toggle-focus]", c.Listeners.Basic.toggleFocusListener);
    }, c.Listeners.Global = { resizeListener: function resizeListener(e) {
        o || e.each(function () {
          s()(this).triggerHandler("resizeme.zf.trigger");
        }), e.attr("data-events", "resize");
      }, scrollListener: function scrollListener(e) {
        o || e.each(function () {
          s()(this).triggerHandler("scrollme.zf.trigger");
        }), e.attr("data-events", "scroll");
      }, closeMeListener: function closeMeListener(e, t) {
        var i = e.namespace.split(".")[0];s()("[data-" + i + "]").not('[data-yeti-box="' + t + '"]').each(function () {
          var e = s()(this);e.triggerHandler("close.zf.trigger", [e]);
        });
      } }, c.Initializers.addClosemeListener = function (e) {
      var t = s()("[data-yeti-box]"),
          i = ["dropdown", "tooltip", "reveal"];if (e && ("string" == typeof e ? i.push(e) : "object" == (typeof e === "undefined" ? "undefined" : _typeof(e)) && "string" == typeof e[0] ? i.concat(e) : console.error("Plugin names must be strings")), t.length) {
        var r = i.map(function (e) {
          return "closeme.zf." + e;
        }).join(" ");s()(window).off(r).on(r, c.Listeners.Global.closeMeListener);
      }
    }, c.Initializers.addResizeListener = function (e) {
      var t = s()("[data-resize]");t.length && r(e, "resize.zf.trigger", c.Listeners.Global.resizeListener, t);
    }, c.Initializers.addScrollListener = function (e) {
      var t = s()("[data-scroll]");t.length && r(e, "scroll.zf.trigger", c.Listeners.Global.scrollListener, t);
    }, c.Initializers.addMutationEventsListener = function (e) {
      if (!o) return !1;var t = e.find("[data-resize], [data-scroll], [data-mutate]"),
          i = function i(e) {
        var t = s()(e[0].target);switch (e[0].type) {case "attributes":
            "scroll" === t.attr("data-events") && "data-events" === e[0].attributeName && t.triggerHandler("scrollme.zf.trigger", [t, window.pageYOffset]), "resize" === t.attr("data-events") && "data-events" === e[0].attributeName && t.triggerHandler("resizeme.zf.trigger", [t]), "style" === e[0].attributeName && (t.closest("[data-mutate]").attr("data-events", "mutate"), t.closest("[data-mutate]").triggerHandler("mutateme.zf.trigger", [t.closest("[data-mutate]")]));break;case "childList":
            t.closest("[data-mutate]").attr("data-events", "mutate"), t.closest("[data-mutate]").triggerHandler("mutateme.zf.trigger", [t.closest("[data-mutate]")]);break;default:
            return !1;}
      };if (t.length) for (var r = 0; r <= t.length - 1; r++) {
        var n = new o(i);n.observe(t[r], { attributes: !0, childList: !0, characterData: !1, subtree: !0, attributeFilter: ["data-events", "style"] });
      }
    }, c.Initializers.addSimpleListeners = function () {
      var e = s()(document);c.Initializers.addOpenListener(e), c.Initializers.addCloseListener(e), c.Initializers.addToggleListener(e), c.Initializers.addCloseableListener(e), c.Initializers.addToggleFocusListener(e);
    }, c.Initializers.addGlobalListeners = function () {
      var e = s()(document);c.Initializers.addMutationEventsListener(e), c.Initializers.addResizeListener(), c.Initializers.addScrollListener(), c.Initializers.addClosemeListener();
    }, c.init = function (e, t) {
      if (void 0 === e.triggersInitialized) {
        e(document);"complete" === document.readyState ? (c.Initializers.addSimpleListeners(), c.Initializers.addGlobalListeners()) : e(window).on("load", function () {
          c.Initializers.addSimpleListeners(), c.Initializers.addGlobalListeners();
        }), e.triggersInitialized = !0;
      }t && (t.Triggers = c, t.IHearYou = c.Initializers.addGlobalListeners);
    };
  } });
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/******/(function (modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/var installedModules = {};
  /******/
  /******/ // The require function
  /******/function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/if (installedModules[moduleId]) {
      /******/return installedModules[moduleId].exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/var module = installedModules[moduleId] = {
      /******/i: moduleId,
      /******/l: false,
      /******/exports: {}
      /******/ };
    /******/
    /******/ // Execute the module function
    /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ // Flag the module as loaded
    /******/module.l = true;
    /******/
    /******/ // Return the exports of the module
    /******/return module.exports;
    /******/
  }
  /******/
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/__webpack_require__.m = modules;
  /******/
  /******/ // expose the module cache
  /******/__webpack_require__.c = installedModules;
  /******/
  /******/ // identity function for calling harmony imports with the correct context
  /******/__webpack_require__.i = function (value) {
    return value;
  };
  /******/
  /******/ // define getter function for harmony exports
  /******/__webpack_require__.d = function (exports, name, getter) {
    /******/if (!__webpack_require__.o(exports, name)) {
      /******/Object.defineProperty(exports, name, {
        /******/configurable: false,
        /******/enumerable: true,
        /******/get: getter
        /******/ });
      /******/
    }
    /******/
  };
  /******/
  /******/ // getDefaultExport function for compatibility with non-harmony modules
  /******/__webpack_require__.n = function (module) {
    /******/var getter = module && module.__esModule ?
    /******/function getDefault() {
      return module['default'];
    } :
    /******/function getModuleExports() {
      return module;
    };
    /******/__webpack_require__.d(getter, 'a', getter);
    /******/return getter;
    /******/
  };
  /******/
  /******/ // Object.prototype.hasOwnProperty.call
  /******/__webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  /******/
  /******/ // __webpack_public_path__
  /******/__webpack_require__.p = "";
  /******/
  /******/ // Load entry module and return exports
  /******/return __webpack_require__(__webpack_require__.s = 84);
  /******/
})(
/************************************************************************/
/******/{

  /***/0:
  /***/function _(module, exports) {

    module.exports = jQuery;

    /***/
  },

  /***/1:
  /***/function _(module, exports) {

    module.exports = { Foundation: window.Foundation };

    /***/
  },

  /***/18:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";

    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core__ = __webpack_require__(1);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__foundation_core__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_dropdownMenu__ = __webpack_require__(48);

    __WEBPACK_IMPORTED_MODULE_0__foundation_core__["Foundation"].plugin(__WEBPACK_IMPORTED_MODULE_1__foundation_dropdownMenu__["a" /* DropdownMenu */], 'DropdownMenu');

    /***/
  },

  /***/2:
  /***/function _(module, exports) {

    module.exports = { Plugin: window.Foundation.Plugin };

    /***/
  },

  /***/3:
  /***/function _(module, exports) {

    module.exports = { rtl: window.Foundation.rtl, GetYoDigits: window.Foundation.GetYoDigits, transitionend: window.Foundation.transitionend };

    /***/
  },

  /***/48:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";
    /* harmony export (binding) */
    __webpack_require__.d(__webpack_exports__, "a", function () {
      return DropdownMenu;
    });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__ = __webpack_require__(5);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_2__foundation_util_nest__ = __webpack_require__(9);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_2__foundation_util_nest___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__foundation_util_nest__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_3__foundation_util_box__ = __webpack_require__(8);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_3__foundation_util_box___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__foundation_util_box__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_4__foundation_util_core__ = __webpack_require__(3);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_4__foundation_util_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__foundation_util_core__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_5__foundation_plugin__ = __webpack_require__(2);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_5__foundation_plugin___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__foundation_plugin__);

    var _createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
      }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
      };
    }();

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
      }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    /**
     * DropdownMenu module.
     * @module foundation.dropdown-menu
     * @requires foundation.util.keyboard
     * @requires foundation.util.box
     * @requires foundation.util.nest
     */

    var DropdownMenu = function (_Plugin) {
      _inherits(DropdownMenu, _Plugin);

      function DropdownMenu() {
        _classCallCheck(this, DropdownMenu);

        return _possibleConstructorReturn(this, (DropdownMenu.__proto__ || Object.getPrototypeOf(DropdownMenu)).apply(this, arguments));
      }

      _createClass(DropdownMenu, [{
        key: '_setup',

        /**
         * Creates a new instance of DropdownMenu.
         * @class
         * @name DropdownMenu
         * @fires DropdownMenu#init
         * @param {jQuery} element - jQuery object to make into a dropdown menu.
         * @param {Object} options - Overrides to the default plugin settings.
         */
        value: function _setup(element, options) {
          this.$element = element;
          this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({}, DropdownMenu.defaults, this.$element.data(), options);
          this.className = 'DropdownMenu'; // ie9 back compat

          this._init();

          __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["Keyboard"].register('DropdownMenu', {
            'ENTER': 'open',
            'SPACE': 'open',
            'ARROW_RIGHT': 'next',
            'ARROW_UP': 'up',
            'ARROW_DOWN': 'down',
            'ARROW_LEFT': 'previous',
            'ESCAPE': 'close'
          });
        }

        /**
         * Initializes the plugin, and calls _prepareMenu
         * @private
         * @function
         */

      }, {
        key: '_init',
        value: function _init() {
          __WEBPACK_IMPORTED_MODULE_2__foundation_util_nest__["Nest"].Feather(this.$element, 'dropdown');

          var subs = this.$element.find('li.is-dropdown-submenu-parent');
          this.$element.children('.is-dropdown-submenu-parent').children('.is-dropdown-submenu').addClass('first-sub');

          this.$menuItems = this.$element.find('[role="menuitem"]');
          this.$tabs = this.$element.children('[role="menuitem"]');
          this.$tabs.find('ul.is-dropdown-submenu').addClass(this.options.verticalClass);

          if (this.options.alignment === 'auto') {
            if (this.$element.hasClass(this.options.rightClass) || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__foundation_util_core__["rtl"])() || this.$element.parents('.top-bar-right').is('*')) {
              this.options.alignment = 'right';
              subs.addClass('opens-left');
            } else {
              this.options.alignment = 'left';
              subs.addClass('opens-right');
            }
          } else {
            if (this.options.alignment === 'right') {
              subs.addClass('opens-left');
            } else {
              subs.addClass('opens-right');
            }
          }
          this.changed = false;
          this._events();
        }
      }, {
        key: '_isVertical',
        value: function _isVertical() {
          return this.$tabs.css('display') === 'block' || this.$element.css('flex-direction') === 'column';
        }
      }, {
        key: '_isRtl',
        value: function _isRtl() {
          return this.$element.hasClass('align-right') || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__foundation_util_core__["rtl"])() && !this.$element.hasClass('align-left');
        }

        /**
         * Adds event listeners to elements within the menu
         * @private
         * @function
         */

      }, {
        key: '_events',
        value: function _events() {
          var _this = this,
              hasTouch = 'ontouchstart' in window || typeof window.ontouchstart !== 'undefined',
              parClass = 'is-dropdown-submenu-parent';

          // used for onClick and in the keyboard handlers
          var handleClickFn = function handleClickFn(e) {
            var $elem = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(e.target).parentsUntil('ul', '.' + parClass),
                hasSub = $elem.hasClass(parClass),
                hasClicked = $elem.attr('data-is-click') === 'true',
                $sub = $elem.children('.is-dropdown-submenu');

            if (hasSub) {
              if (hasClicked) {
                if (!_this.options.closeOnClick || !_this.options.clickOpen && !hasTouch || _this.options.forceFollow && hasTouch) {
                  return;
                } else {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                  _this._hide($elem);
                }
              } else {
                e.preventDefault();
                e.stopImmediatePropagation();
                _this._show($sub);
                $elem.add($elem.parentsUntil(_this.$element, '.' + parClass)).attr('data-is-click', true);
              }
            }
          };

          if (this.options.clickOpen || hasTouch) {
            this.$menuItems.on('click.zf.dropdownmenu touchstart.zf.dropdownmenu', handleClickFn);
          }

          // Handle Leaf element Clicks
          if (_this.options.closeOnClickInside) {
            this.$menuItems.on('click.zf.dropdownmenu', function (e) {
              var $elem = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
                  hasSub = $elem.hasClass(parClass);
              if (!hasSub) {
                _this._hide();
              }
            });
          }

          if (!this.options.disableHover) {
            this.$menuItems.on('mouseenter.zf.dropdownmenu', function (e) {
              var $elem = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
                  hasSub = $elem.hasClass(parClass);

              if (hasSub) {
                clearTimeout($elem.data('_delay'));
                $elem.data('_delay', setTimeout(function () {
                  _this._show($elem.children('.is-dropdown-submenu'));
                }, _this.options.hoverDelay));
              }
            }).on('mouseleave.zf.dropdownmenu', function (e) {
              var $elem = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
                  hasSub = $elem.hasClass(parClass);
              if (hasSub && _this.options.autoclose) {
                if ($elem.attr('data-is-click') === 'true' && _this.options.clickOpen) {
                  return false;
                }

                clearTimeout($elem.data('_delay'));
                $elem.data('_delay', setTimeout(function () {
                  _this._hide($elem);
                }, _this.options.closingTime));
              }
            });
          }
          this.$menuItems.on('keydown.zf.dropdownmenu', function (e) {
            var $element = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(e.target).parentsUntil('ul', '[role="menuitem"]'),
                isTab = _this.$tabs.index($element) > -1,
                $elements = isTab ? _this.$tabs : $element.siblings('li').add($element),
                $prevElement,
                $nextElement;

            $elements.each(function (i) {
              if (__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).is($element)) {
                $prevElement = $elements.eq(i - 1);
                $nextElement = $elements.eq(i + 1);
                return;
              }
            });

            var nextSibling = function nextSibling() {
              $nextElement.children('a:first').focus();
              e.preventDefault();
            },
                prevSibling = function prevSibling() {
              $prevElement.children('a:first').focus();
              e.preventDefault();
            },
                openSub = function openSub() {
              var $sub = $element.children('ul.is-dropdown-submenu');
              if ($sub.length) {
                _this._show($sub);
                $element.find('li > a:first').focus();
                e.preventDefault();
              } else {
                return;
              }
            },
                closeSub = function closeSub() {
              //if ($element.is(':first-child')) {
              var close = $element.parent('ul').parent('li');
              close.children('a:first').focus();
              _this._hide(close);
              e.preventDefault();
              //}
            };
            var functions = {
              open: openSub,
              close: function close() {
                _this._hide(_this.$element);
                _this.$menuItems.eq(0).children('a').focus(); // focus to first element
                e.preventDefault();
              },
              handled: function handled() {
                e.stopImmediatePropagation();
              }
            };

            if (isTab) {
              if (_this._isVertical()) {
                // vertical menu
                if (_this._isRtl()) {
                  // right aligned
                  __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend(functions, {
                    down: nextSibling,
                    up: prevSibling,
                    next: closeSub,
                    previous: openSub
                  });
                } else {
                  // left aligned
                  __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend(functions, {
                    down: nextSibling,
                    up: prevSibling,
                    next: openSub,
                    previous: closeSub
                  });
                }
              } else {
                // horizontal menu
                if (_this._isRtl()) {
                  // right aligned
                  __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend(functions, {
                    next: prevSibling,
                    previous: nextSibling,
                    down: openSub,
                    up: closeSub
                  });
                } else {
                  // left aligned
                  __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend(functions, {
                    next: nextSibling,
                    previous: prevSibling,
                    down: openSub,
                    up: closeSub
                  });
                }
              }
            } else {
              // not tabs -> one sub
              if (_this._isRtl()) {
                // right aligned
                __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend(functions, {
                  next: closeSub,
                  previous: openSub,
                  down: nextSibling,
                  up: prevSibling
                });
              } else {
                // left aligned
                __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend(functions, {
                  next: openSub,
                  previous: closeSub,
                  down: nextSibling,
                  up: prevSibling
                });
              }
            }
            __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["Keyboard"].handleKey(e, 'DropdownMenu', functions);
          });
        }

        /**
         * Adds an event handler to the body to close any dropdowns on a click.
         * @function
         * @private
         */

      }, {
        key: '_addBodyHandler',
        value: function _addBodyHandler() {
          var $body = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(document.body),
              _this = this;
          $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu').on('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu', function (e) {
            var $link = _this.$element.find(e.target);
            if ($link.length) {
              return;
            }

            _this._hide();
            $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu');
          });
        }

        /**
         * Opens a dropdown pane, and checks for collisions first.
         * @param {jQuery} $sub - ul element that is a submenu to show
         * @function
         * @private
         * @fires DropdownMenu#show
         */

      }, {
        key: '_show',
        value: function _show($sub) {
          var idx = this.$tabs.index(this.$tabs.filter(function (i, el) {
            return __WEBPACK_IMPORTED_MODULE_0_jquery___default()(el).find($sub).length > 0;
          }));
          var $sibs = $sub.parent('li.is-dropdown-submenu-parent').siblings('li.is-dropdown-submenu-parent');
          this._hide($sibs, idx);
          $sub.css('visibility', 'hidden').addClass('js-dropdown-active').parent('li.is-dropdown-submenu-parent').addClass('is-active');
          var clear = __WEBPACK_IMPORTED_MODULE_3__foundation_util_box__["Box"].ImNotTouchingYou($sub, null, true);
          if (!clear) {
            var oldClass = this.options.alignment === 'left' ? '-right' : '-left',
                $parentLi = $sub.parent('.is-dropdown-submenu-parent');
            $parentLi.removeClass('opens' + oldClass).addClass('opens-' + this.options.alignment);
            clear = __WEBPACK_IMPORTED_MODULE_3__foundation_util_box__["Box"].ImNotTouchingYou($sub, null, true);
            if (!clear) {
              $parentLi.removeClass('opens-' + this.options.alignment).addClass('opens-inner');
            }
            this.changed = true;
          }
          $sub.css('visibility', '');
          if (this.options.closeOnClick) {
            this._addBodyHandler();
          }
          /**
           * Fires when the new dropdown pane is visible.
           * @event DropdownMenu#show
           */
          this.$element.trigger('show.zf.dropdownmenu', [$sub]);
        }

        /**
         * Hides a single, currently open dropdown pane, if passed a parameter, otherwise, hides everything.
         * @function
         * @param {jQuery} $elem - element with a submenu to hide
         * @param {Number} idx - index of the $tabs collection to hide
         * @private
         */

      }, {
        key: '_hide',
        value: function _hide($elem, idx) {
          var $toClose;
          if ($elem && $elem.length) {
            $toClose = $elem;
          } else if (idx !== undefined) {
            $toClose = this.$tabs.not(function (i, el) {
              return i === idx;
            });
          } else {
            $toClose = this.$element;
          }
          var somethingToClose = $toClose.hasClass('is-active') || $toClose.find('.is-active').length > 0;

          if (somethingToClose) {
            $toClose.find('li.is-active').add($toClose).attr({
              'data-is-click': false
            }).removeClass('is-active');

            $toClose.find('ul.js-dropdown-active').removeClass('js-dropdown-active');

            if (this.changed || $toClose.find('opens-inner').length) {
              var oldClass = this.options.alignment === 'left' ? 'right' : 'left';
              $toClose.find('li.is-dropdown-submenu-parent').add($toClose).removeClass('opens-inner opens-' + this.options.alignment).addClass('opens-' + oldClass);
              this.changed = false;
            }
            /**
             * Fires when the open menus are closed.
             * @event DropdownMenu#hide
             */
            this.$element.trigger('hide.zf.dropdownmenu', [$toClose]);
          }
        }

        /**
         * Destroys the plugin.
         * @function
         */

      }, {
        key: '_destroy',
        value: function _destroy() {
          this.$menuItems.off('.zf.dropdownmenu').removeAttr('data-is-click').removeClass('is-right-arrow is-left-arrow is-down-arrow opens-right opens-left opens-inner');
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(document.body).off('.zf.dropdownmenu');
          __WEBPACK_IMPORTED_MODULE_2__foundation_util_nest__["Nest"].Burn(this.$element, 'dropdown');
        }
      }]);

      return DropdownMenu;
    }(__WEBPACK_IMPORTED_MODULE_5__foundation_plugin__["Plugin"]);

    /**
     * Default settings for plugin
     */

    DropdownMenu.defaults = {
      /**
       * Disallows hover events from opening submenus
       * @option
       * @type {boolean}
       * @default false
       */
      disableHover: false,
      /**
       * Allow a submenu to automatically close on a mouseleave event, if not clicked open.
       * @option
       * @type {boolean}
       * @default true
       */
      autoclose: true,
      /**
       * Amount of time to delay opening a submenu on hover event.
       * @option
       * @type {number}
       * @default 50
       */
      hoverDelay: 50,
      /**
       * Allow a submenu to open/remain open on parent click event. Allows cursor to move away from menu.
       * @option
       * @type {boolean}
       * @default false
       */
      clickOpen: false,
      /**
       * Amount of time to delay closing a submenu on a mouseleave event.
       * @option
       * @type {number}
       * @default 500
       */

      closingTime: 500,
      /**
       * Position of the menu relative to what direction the submenus should open. Handled by JS. Can be `'auto'`, `'left'` or `'right'`.
       * @option
       * @type {string}
       * @default 'auto'
       */
      alignment: 'auto',
      /**
       * Allow clicks on the body to close any open submenus.
       * @option
       * @type {boolean}
       * @default true
       */
      closeOnClick: true,
      /**
       * Allow clicks on leaf anchor links to close any open submenus.
       * @option
       * @type {boolean}
       * @default true
       */
      closeOnClickInside: true,
      /**
       * Class applied to vertical oriented menus, Foundation default is `vertical`. Update this if using your own class.
       * @option
       * @type {string}
       * @default 'vertical'
       */
      verticalClass: 'vertical',
      /**
       * Class applied to right-side oriented menus, Foundation default is `align-right`. Update this if using your own class.
       * @option
       * @type {string}
       * @default 'align-right'
       */
      rightClass: 'align-right',
      /**
       * Boolean to force overide the clicking of links to perform default action, on second touch event for mobile.
       * @option
       * @type {boolean}
       * @default true
       */
      forceFollow: true
    };

    /***/
  },

  /***/5:
  /***/function _(module, exports) {

    module.exports = { Keyboard: window.Foundation.Keyboard };

    /***/
  },

  /***/8:
  /***/function _(module, exports) {

    module.exports = { Box: window.Foundation.Box };

    /***/
  },

  /***/84:
  /***/function _(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(18);

    /***/
  },

  /***/9:
  /***/function _(module, exports) {

    module.exports = { Nest: window.Foundation.Nest };

    /***/
  }

  /******/ });
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/******/(function (modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/var installedModules = {};
  /******/
  /******/ // The require function
  /******/function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/if (installedModules[moduleId]) {
      /******/return installedModules[moduleId].exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/var module = installedModules[moduleId] = {
      /******/i: moduleId,
      /******/l: false,
      /******/exports: {}
      /******/ };
    /******/
    /******/ // Execute the module function
    /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ // Flag the module as loaded
    /******/module.l = true;
    /******/
    /******/ // Return the exports of the module
    /******/return module.exports;
    /******/
  }
  /******/
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/__webpack_require__.m = modules;
  /******/
  /******/ // expose the module cache
  /******/__webpack_require__.c = installedModules;
  /******/
  /******/ // identity function for calling harmony imports with the correct context
  /******/__webpack_require__.i = function (value) {
    return value;
  };
  /******/
  /******/ // define getter function for harmony exports
  /******/__webpack_require__.d = function (exports, name, getter) {
    /******/if (!__webpack_require__.o(exports, name)) {
      /******/Object.defineProperty(exports, name, {
        /******/configurable: false,
        /******/enumerable: true,
        /******/get: getter
        /******/ });
      /******/
    }
    /******/
  };
  /******/
  /******/ // getDefaultExport function for compatibility with non-harmony modules
  /******/__webpack_require__.n = function (module) {
    /******/var getter = module && module.__esModule ?
    /******/function getDefault() {
      return module['default'];
    } :
    /******/function getModuleExports() {
      return module;
    };
    /******/__webpack_require__.d(getter, 'a', getter);
    /******/return getter;
    /******/
  };
  /******/
  /******/ // Object.prototype.hasOwnProperty.call
  /******/__webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  /******/
  /******/ // __webpack_public_path__
  /******/__webpack_require__.p = "";
  /******/
  /******/ // Load entry module and return exports
  /******/return __webpack_require__(__webpack_require__.s = 88);
  /******/
})(
/************************************************************************/
/******/{

  /***/0:
  /***/function _(module, exports) {

    module.exports = jQuery;

    /***/
  },

  /***/1:
  /***/function _(module, exports) {

    module.exports = { Foundation: window.Foundation };

    /***/
  },

  /***/2:
  /***/function _(module, exports) {

    module.exports = { Plugin: window.Foundation.Plugin };

    /***/
  },

  /***/22:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";

    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core__ = __webpack_require__(1);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__foundation_core__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_offcanvas__ = __webpack_require__(52);

    __WEBPACK_IMPORTED_MODULE_0__foundation_core__["Foundation"].plugin(__WEBPACK_IMPORTED_MODULE_1__foundation_offcanvas__["a" /* OffCanvas */], 'OffCanvas');

    /***/
  },

  /***/3:
  /***/function _(module, exports) {

    module.exports = { rtl: window.Foundation.rtl, GetYoDigits: window.Foundation.GetYoDigits, transitionend: window.Foundation.transitionend };

    /***/
  },

  /***/4:
  /***/function _(module, exports) {

    module.exports = { Motion: window.Foundation.Motion, Move: window.Foundation.Move };

    /***/
  },

  /***/5:
  /***/function _(module, exports) {

    module.exports = { Keyboard: window.Foundation.Keyboard };

    /***/
  },

  /***/52:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";
    /* harmony export (binding) */
    __webpack_require__.d(__webpack_exports__, "a", function () {
      return OffCanvas;
    });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__ = __webpack_require__(5);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__ = __webpack_require__(6);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_3__foundation_util_core__ = __webpack_require__(3);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_3__foundation_util_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_4__foundation_plugin__ = __webpack_require__(2);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_4__foundation_plugin___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__foundation_plugin__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_5__foundation_util_triggers__ = __webpack_require__(7);

    var _createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
      }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
      };
    }();

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
      }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    /**
     * OffCanvas module.
     * @module foundation.offcanvas
     * @requires foundation.util.keyboard
     * @requires foundation.util.mediaQuery
     * @requires foundation.util.triggers
     */

    var OffCanvas = function (_Plugin) {
      _inherits(OffCanvas, _Plugin);

      function OffCanvas() {
        _classCallCheck(this, OffCanvas);

        return _possibleConstructorReturn(this, (OffCanvas.__proto__ || Object.getPrototypeOf(OffCanvas)).apply(this, arguments));
      }

      _createClass(OffCanvas, [{
        key: '_setup',

        /**
         * Creates a new instance of an off-canvas wrapper.
         * @class
         * @name OffCanvas
         * @fires OffCanvas#init
         * @param {Object} element - jQuery object to initialize.
         * @param {Object} options - Overrides to the default plugin settings.
         */
        value: function _setup(element, options) {
          var _this3 = this;

          this.className = 'OffCanvas'; // ie9 back compat
          this.$element = element;
          this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({}, OffCanvas.defaults, this.$element.data(), options);
          this.contentClasses = { base: [], reveal: [] };
          this.$lastTrigger = __WEBPACK_IMPORTED_MODULE_0_jquery___default()();
          this.$triggers = __WEBPACK_IMPORTED_MODULE_0_jquery___default()();
          this.position = 'left';
          this.$content = __WEBPACK_IMPORTED_MODULE_0_jquery___default()();
          this.nested = !!this.options.nested;

          // Defines the CSS transition/position classes of the off-canvas content container.
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(['push', 'overlap']).each(function (index, val) {
            _this3.contentClasses.base.push('has-transition-' + val);
          });
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(['left', 'right', 'top', 'bottom']).each(function (index, val) {
            _this3.contentClasses.base.push('has-position-' + val);
            _this3.contentClasses.reveal.push('has-reveal-' + val);
          });

          // Triggers init is idempotent, just need to make sure it is initialized
          __WEBPACK_IMPORTED_MODULE_5__foundation_util_triggers__["a" /* Triggers */].init(__WEBPACK_IMPORTED_MODULE_0_jquery___default.a);
          __WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__["MediaQuery"]._init();

          this._init();
          this._events();

          __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["Keyboard"].register('OffCanvas', {
            'ESCAPE': 'close'
          });
        }

        /**
         * Initializes the off-canvas wrapper by adding the exit overlay (if needed).
         * @function
         * @private
         */

      }, {
        key: '_init',
        value: function _init() {
          var id = this.$element.attr('id');

          this.$element.attr('aria-hidden', 'true');

          // Find off-canvas content, either by ID (if specified), by siblings or by closest selector (fallback)
          if (this.options.contentId) {
            this.$content = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + this.options.contentId);
          } else if (this.$element.siblings('[data-off-canvas-content]').length) {
            this.$content = this.$element.siblings('[data-off-canvas-content]').first();
          } else {
            this.$content = this.$element.closest('[data-off-canvas-content]').first();
          }

          if (!this.options.contentId) {
            // Assume that the off-canvas element is nested if it isn't a sibling of the content
            this.nested = this.$element.siblings('[data-off-canvas-content]').length === 0;
          } else if (this.options.contentId && this.options.nested === null) {
            // Warning if using content ID without setting the nested option
            // Once the element is nested it is required to work properly in this case
            console.warn('Remember to use the nested option if using the content ID option!');
          }

          if (this.nested === true) {
            // Force transition overlap if nested
            this.options.transition = 'overlap';
            // Remove appropriate classes if already assigned in markup
            this.$element.removeClass('is-transition-push');
          }

          this.$element.addClass('is-transition-' + this.options.transition + ' is-closed');

          // Find triggers that affect this element and add aria-expanded to them
          this.$triggers = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(document).find('[data-open="' + id + '"], [data-close="' + id + '"], [data-toggle="' + id + '"]').attr('aria-expanded', 'false').attr('aria-controls', id);

          // Get position by checking for related CSS class
          this.position = this.$element.is('.position-left, .position-top, .position-right, .position-bottom') ? this.$element.attr('class').match(/position\-(left|top|right|bottom)/)[1] : this.position;

          // Add an overlay over the content if necessary
          if (this.options.contentOverlay === true) {
            var overlay = document.createElement('div');
            var overlayPosition = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this.$element).css("position") === 'fixed' ? 'is-overlay-fixed' : 'is-overlay-absolute';
            overlay.setAttribute('class', 'js-off-canvas-overlay ' + overlayPosition);
            this.$overlay = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(overlay);
            if (overlayPosition === 'is-overlay-fixed') {
              __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this.$overlay).insertAfter(this.$element);
            } else {
              this.$content.append(this.$overlay);
            }
          }

          this.options.isRevealed = this.options.isRevealed || new RegExp(this.options.revealClass, 'g').test(this.$element[0].className);

          if (this.options.isRevealed === true) {
            this.options.revealOn = this.options.revealOn || this.$element[0].className.match(/(reveal-for-medium|reveal-for-large)/g)[0].split('-')[2];
            this._setMQChecker();
          }

          if (this.options.transitionTime) {
            this.$element.css('transition-duration', this.options.transitionTime);
          }

          // Initally remove all transition/position CSS classes from off-canvas content container.
          this._removeContentClasses();
        }

        /**
         * Adds event handlers to the off-canvas wrapper and the exit overlay.
         * @function
         * @private
         */

      }, {
        key: '_events',
        value: function _events() {
          this.$element.off('.zf.trigger .zf.offcanvas').on({
            'open.zf.trigger': this.open.bind(this),
            'close.zf.trigger': this.close.bind(this),
            'toggle.zf.trigger': this.toggle.bind(this),
            'keydown.zf.offcanvas': this._handleKeyboard.bind(this)
          });

          if (this.options.closeOnClick === true) {
            var $target = this.options.contentOverlay ? this.$overlay : this.$content;
            $target.on({ 'click.zf.offcanvas': this.close.bind(this) });
          }
        }

        /**
         * Applies event listener for elements that will reveal at certain breakpoints.
         * @private
         */

      }, {
        key: '_setMQChecker',
        value: function _setMQChecker() {
          var _this = this;

          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).on('changed.zf.mediaquery', function () {
            if (__WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__["MediaQuery"].atLeast(_this.options.revealOn)) {
              _this.reveal(true);
            } else {
              _this.reveal(false);
            }
          }).one('load.zf.offcanvas', function () {
            if (__WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__["MediaQuery"].atLeast(_this.options.revealOn)) {
              _this.reveal(true);
            }
          });
        }

        /**
         * Removes the CSS transition/position classes of the off-canvas content container.
         * Removing the classes is important when another off-canvas gets opened that uses the same content container.
         * @param {Boolean} hasReveal - true if related off-canvas element is revealed.
         * @private
         */

      }, {
        key: '_removeContentClasses',
        value: function _removeContentClasses(hasReveal) {
          if (typeof hasReveal !== 'boolean') {
            this.$content.removeClass(this.contentClasses.base.join(' '));
          } else if (hasReveal === false) {
            this.$content.removeClass('has-reveal-' + this.position);
          }
        }

        /**
         * Adds the CSS transition/position classes of the off-canvas content container, based on the opening off-canvas element.
         * Beforehand any transition/position class gets removed.
         * @param {Boolean} hasReveal - true if related off-canvas element is revealed.
         * @private
         */

      }, {
        key: '_addContentClasses',
        value: function _addContentClasses(hasReveal) {
          this._removeContentClasses(hasReveal);
          if (typeof hasReveal !== 'boolean') {
            this.$content.addClass('has-transition-' + this.options.transition + ' has-position-' + this.position);
          } else if (hasReveal === true) {
            this.$content.addClass('has-reveal-' + this.position);
          }
        }

        /**
         * Handles the revealing/hiding the off-canvas at breakpoints, not the same as open.
         * @param {Boolean} isRevealed - true if element should be revealed.
         * @function
         */

      }, {
        key: 'reveal',
        value: function reveal(isRevealed) {
          if (isRevealed) {
            this.close();
            this.isRevealed = true;
            this.$element.attr('aria-hidden', 'false');
            this.$element.off('open.zf.trigger toggle.zf.trigger');
            this.$element.removeClass('is-closed');
          } else {
            this.isRevealed = false;
            this.$element.attr('aria-hidden', 'true');
            this.$element.off('open.zf.trigger toggle.zf.trigger').on({
              'open.zf.trigger': this.open.bind(this),
              'toggle.zf.trigger': this.toggle.bind(this)
            });
            this.$element.addClass('is-closed');
          }
          this._addContentClasses(isRevealed);
        }

        /**
         * Stops scrolling of the body when offcanvas is open on mobile Safari and other troublesome browsers.
         * @private
         */

      }, {
        key: '_stopScrolling',
        value: function _stopScrolling(event) {
          return false;
        }

        // Taken and adapted from http://stackoverflow.com/questions/16889447/prevent-full-page-scrolling-ios
        // Only really works for y, not sure how to extend to x or if we need to.

      }, {
        key: '_recordScrollable',
        value: function _recordScrollable(event) {
          var elem = this; // called from event handler context with this as elem

          // If the element is scrollable (content overflows), then...
          if (elem.scrollHeight !== elem.clientHeight) {
            // If we're at the top, scroll down one pixel to allow scrolling up
            if (elem.scrollTop === 0) {
              elem.scrollTop = 1;
            }
            // If we're at the bottom, scroll up one pixel to allow scrolling down
            if (elem.scrollTop === elem.scrollHeight - elem.clientHeight) {
              elem.scrollTop = elem.scrollHeight - elem.clientHeight - 1;
            }
          }
          elem.allowUp = elem.scrollTop > 0;
          elem.allowDown = elem.scrollTop < elem.scrollHeight - elem.clientHeight;
          elem.lastY = event.originalEvent.pageY;
        }
      }, {
        key: '_stopScrollPropagation',
        value: function _stopScrollPropagation(event) {
          var elem = this; // called from event handler context with this as elem
          var up = event.pageY < elem.lastY;
          var down = !up;
          elem.lastY = event.pageY;

          if (up && elem.allowUp || down && elem.allowDown) {
            event.stopPropagation();
          } else {
            event.preventDefault();
          }
        }

        /**
         * Opens the off-canvas menu.
         * @function
         * @param {Object} event - Event object passed from listener.
         * @param {jQuery} trigger - element that triggered the off-canvas to open.
         * @fires OffCanvas#opened
         */

      }, {
        key: 'open',
        value: function open(event, trigger) {
          if (this.$element.hasClass('is-open') || this.isRevealed) {
            return;
          }
          var _this = this;

          if (trigger) {
            this.$lastTrigger = trigger;
          }

          if (this.options.forceTo === 'top') {
            window.scrollTo(0, 0);
          } else if (this.options.forceTo === 'bottom') {
            window.scrollTo(0, document.body.scrollHeight);
          }

          if (this.options.transitionTime && this.options.transition !== 'overlap') {
            this.$element.siblings('[data-off-canvas-content]').css('transition-duration', this.options.transitionTime);
          } else {
            this.$element.siblings('[data-off-canvas-content]').css('transition-duration', '');
          }

          /**
           * Fires when the off-canvas menu opens.
           * @event OffCanvas#opened
           */
          this.$element.addClass('is-open').removeClass('is-closed');

          this.$triggers.attr('aria-expanded', 'true');
          this.$element.attr('aria-hidden', 'false').trigger('opened.zf.offcanvas');

          this.$content.addClass('is-open-' + this.position);

          // If `contentScroll` is set to false, add class and disable scrolling on touch devices.
          if (this.options.contentScroll === false) {
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()('body').addClass('is-off-canvas-open').on('touchmove', this._stopScrolling);
            this.$element.on('touchstart', this._recordScrollable);
            this.$element.on('touchmove', this._stopScrollPropagation);
          }

          if (this.options.contentOverlay === true) {
            this.$overlay.addClass('is-visible');
          }

          if (this.options.closeOnClick === true && this.options.contentOverlay === true) {
            this.$overlay.addClass('is-closable');
          }

          if (this.options.autoFocus === true) {
            this.$element.one(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__["transitionend"])(this.$element), function () {
              if (!_this.$element.hasClass('is-open')) {
                return; // exit if prematurely closed
              }
              var canvasFocus = _this.$element.find('[data-autofocus]');
              if (canvasFocus.length) {
                canvasFocus.eq(0).focus();
              } else {
                _this.$element.find('a, button').eq(0).focus();
              }
            });
          }

          if (this.options.trapFocus === true) {
            this.$content.attr('tabindex', '-1');
            __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["Keyboard"].trapFocus(this.$element);
          }

          this._addContentClasses();
        }

        /**
         * Closes the off-canvas menu.
         * @function
         * @param {Function} cb - optional cb to fire after closure.
         * @fires OffCanvas#closed
         */

      }, {
        key: 'close',
        value: function close(cb) {
          if (!this.$element.hasClass('is-open') || this.isRevealed) {
            return;
          }

          var _this = this;

          this.$element.removeClass('is-open');

          this.$element.attr('aria-hidden', 'true')
          /**
           * Fires when the off-canvas menu opens.
           * @event OffCanvas#closed
           */
          .trigger('closed.zf.offcanvas');

          this.$content.removeClass('is-open-left is-open-top is-open-right is-open-bottom');

          // If `contentScroll` is set to false, remove class and re-enable scrolling on touch devices.
          if (this.options.contentScroll === false) {
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()('body').removeClass('is-off-canvas-open').off('touchmove', this._stopScrolling);
            this.$element.off('touchstart', this._recordScrollable);
            this.$element.off('touchmove', this._stopScrollPropagation);
          }

          if (this.options.contentOverlay === true) {
            this.$overlay.removeClass('is-visible');
          }

          if (this.options.closeOnClick === true && this.options.contentOverlay === true) {
            this.$overlay.removeClass('is-closable');
          }

          this.$triggers.attr('aria-expanded', 'false');

          if (this.options.trapFocus === true) {
            this.$content.removeAttr('tabindex');
            __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["Keyboard"].releaseFocus(this.$element);
          }

          // Listen to transitionEnd and add class when done.
          this.$element.one(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__["transitionend"])(this.$element), function (e) {
            _this.$element.addClass('is-closed');
            _this._removeContentClasses();
          });
        }

        /**
         * Toggles the off-canvas menu open or closed.
         * @function
         * @param {Object} event - Event object passed from listener.
         * @param {jQuery} trigger - element that triggered the off-canvas to open.
         */

      }, {
        key: 'toggle',
        value: function toggle(event, trigger) {
          if (this.$element.hasClass('is-open')) {
            this.close(event, trigger);
          } else {
            this.open(event, trigger);
          }
        }

        /**
         * Handles keyboard input when detected. When the escape key is pressed, the off-canvas menu closes, and focus is restored to the element that opened the menu.
         * @function
         * @private
         */

      }, {
        key: '_handleKeyboard',
        value: function _handleKeyboard(e) {
          var _this4 = this;

          __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["Keyboard"].handleKey(e, 'OffCanvas', {
            close: function close() {
              _this4.close();
              _this4.$lastTrigger.focus();
              return true;
            },
            handled: function handled() {
              e.stopPropagation();
              e.preventDefault();
            }
          });
        }

        /**
         * Destroys the offcanvas plugin.
         * @function
         */

      }, {
        key: '_destroy',
        value: function _destroy() {
          this.close();
          this.$element.off('.zf.trigger .zf.offcanvas');
          this.$overlay.off('.zf.offcanvas');
        }
      }]);

      return OffCanvas;
    }(__WEBPACK_IMPORTED_MODULE_4__foundation_plugin__["Plugin"]);

    OffCanvas.defaults = {
      /**
       * Allow the user to click outside of the menu to close it.
       * @option
       * @type {boolean}
       * @default true
       */
      closeOnClick: true,

      /**
       * Adds an overlay on top of `[data-off-canvas-content]`.
       * @option
       * @type {boolean}
       * @default true
       */
      contentOverlay: true,

      /**
       * Target an off-canvas content container by ID that may be placed anywhere. If null the closest content container will be taken.
       * @option
       * @type {?string}
       * @default null
       */
      contentId: null,

      /**
       * Define the off-canvas element is nested in an off-canvas content. This is required when using the contentId option for a nested element.
       * @option
       * @type {boolean}
       * @default null
       */
      nested: null,

      /**
       * Enable/disable scrolling of the main content when an off canvas panel is open.
       * @option
       * @type {boolean}
       * @default true
       */
      contentScroll: true,

      /**
       * Amount of time in ms the open and close transition requires. If none selected, pulls from body style.
       * @option
       * @type {number}
       * @default null
       */
      transitionTime: null,

      /**
       * Type of transition for the offcanvas menu. Options are 'push', 'detached' or 'slide'.
       * @option
       * @type {string}
       * @default push
       */
      transition: 'push',

      /**
       * Force the page to scroll to top or bottom on open.
       * @option
       * @type {?string}
       * @default null
       */
      forceTo: null,

      /**
       * Allow the offcanvas to remain open for certain breakpoints.
       * @option
       * @type {boolean}
       * @default false
       */
      isRevealed: false,

      /**
       * Breakpoint at which to reveal. JS will use a RegExp to target standard classes, if changing classnames, pass your class with the `revealClass` option.
       * @option
       * @type {?string}
       * @default null
       */
      revealOn: null,

      /**
       * Force focus to the offcanvas on open. If true, will focus the opening trigger on close.
       * @option
       * @type {boolean}
       * @default true
       */
      autoFocus: true,

      /**
       * Class used to force an offcanvas to remain open. Foundation defaults for this are `reveal-for-large` & `reveal-for-medium`.
       * @option
       * @type {string}
       * @default reveal-for-
       * @todo improve the regex testing for this.
       */
      revealClass: 'reveal-for-',

      /**
       * Triggers optional focus trapping when opening an offcanvas. Sets tabindex of [data-off-canvas-content] to -1 for accessibility purposes.
       * @option
       * @type {boolean}
       * @default false
       */
      trapFocus: false
    };

    /***/
  },

  /***/6:
  /***/function _(module, exports) {

    module.exports = { MediaQuery: window.Foundation.MediaQuery };

    /***/
  },

  /***/7:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";
    /* harmony export (binding) */
    __webpack_require__.d(__webpack_exports__, "a", function () {
      return Triggers;
    });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_motion__ = __webpack_require__(4);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_motion___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__foundation_util_motion__);

    var MutationObserver = function () {
      var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
      for (var i = 0; i < prefixes.length; i++) {
        if (prefixes[i] + 'MutationObserver' in window) {
          return window[prefixes[i] + 'MutationObserver'];
        }
      }
      return false;
    }();

    var triggers = function triggers(el, type) {
      el.data(type).split(' ').forEach(function (id) {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + id)[type === 'close' ? 'trigger' : 'triggerHandler'](type + '.zf.trigger', [el]);
      });
    };

    var Triggers = {
      Listeners: {
        Basic: {},
        Global: {}
      },
      Initializers: {}
    };

    Triggers.Listeners.Basic = {
      openListener: function openListener() {
        triggers(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this), 'open');
      },
      closeListener: function closeListener() {
        var id = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).data('close');
        if (id) {
          triggers(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this), 'close');
        } else {
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).trigger('close.zf.trigger');
        }
      },
      toggleListener: function toggleListener() {
        var id = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).data('toggle');
        if (id) {
          triggers(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this), 'toggle');
        } else {
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).trigger('toggle.zf.trigger');
        }
      },
      closeableListener: function closeableListener(e) {
        e.stopPropagation();
        var animation = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).data('closable');

        if (animation !== '') {
          __WEBPACK_IMPORTED_MODULE_1__foundation_util_motion__["Motion"].animateOut(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this), animation, function () {
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).trigger('closed.zf');
          });
        } else {
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).fadeOut().trigger('closed.zf');
        }
      },
      toggleFocusListener: function toggleFocusListener() {
        var id = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).data('toggle-focus');
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + id).triggerHandler('toggle.zf.trigger', [__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this)]);
      }
    };

    // Elements with [data-open] will reveal a plugin that supports it when clicked.
    Triggers.Initializers.addOpenListener = function ($elem) {
      $elem.off('click.zf.trigger', Triggers.Listeners.Basic.openListener);
      $elem.on('click.zf.trigger', '[data-open]', Triggers.Listeners.Basic.openListener);
    };

    // Elements with [data-close] will close a plugin that supports it when clicked.
    // If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
    Triggers.Initializers.addCloseListener = function ($elem) {
      $elem.off('click.zf.trigger', Triggers.Listeners.Basic.closeListener);
      $elem.on('click.zf.trigger', '[data-close]', Triggers.Listeners.Basic.closeListener);
    };

    // Elements with [data-toggle] will toggle a plugin that supports it when clicked.
    Triggers.Initializers.addToggleListener = function ($elem) {
      $elem.off('click.zf.trigger', Triggers.Listeners.Basic.toggleListener);
      $elem.on('click.zf.trigger', '[data-toggle]', Triggers.Listeners.Basic.toggleListener);
    };

    // Elements with [data-closable] will respond to close.zf.trigger events.
    Triggers.Initializers.addCloseableListener = function ($elem) {
      $elem.off('close.zf.trigger', Triggers.Listeners.Basic.closeableListener);
      $elem.on('close.zf.trigger', '[data-closeable], [data-closable]', Triggers.Listeners.Basic.closeableListener);
    };

    // Elements with [data-toggle-focus] will respond to coming in and out of focus
    Triggers.Initializers.addToggleFocusListener = function ($elem) {
      $elem.off('focus.zf.trigger blur.zf.trigger', Triggers.Listeners.Basic.toggleFocusListener);
      $elem.on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', Triggers.Listeners.Basic.toggleFocusListener);
    };

    // More Global/complex listeners and triggers
    Triggers.Listeners.Global = {
      resizeListener: function resizeListener($nodes) {
        if (!MutationObserver) {
          //fallback for IE 9
          $nodes.each(function () {
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).triggerHandler('resizeme.zf.trigger');
          });
        }
        //trigger all listening elements and signal a resize event
        $nodes.attr('data-events', "resize");
      },
      scrollListener: function scrollListener($nodes) {
        if (!MutationObserver) {
          //fallback for IE 9
          $nodes.each(function () {
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).triggerHandler('scrollme.zf.trigger');
          });
        }
        //trigger all listening elements and signal a scroll event
        $nodes.attr('data-events', "scroll");
      },
      closeMeListener: function closeMeListener(e, pluginId) {
        var plugin = e.namespace.split('.')[0];
        var plugins = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');

        plugins.each(function () {
          var _this = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this);
          _this.triggerHandler('close.zf.trigger', [_this]);
        });
      }

      // Global, parses whole document.
    };Triggers.Initializers.addClosemeListener = function (pluginName) {
      var yetiBoxes = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-yeti-box]'),
          plugNames = ['dropdown', 'tooltip', 'reveal'];

      if (pluginName) {
        if (typeof pluginName === 'string') {
          plugNames.push(pluginName);
        } else if ((typeof pluginName === 'undefined' ? 'undefined' : _typeof(pluginName)) === 'object' && typeof pluginName[0] === 'string') {
          plugNames.concat(pluginName);
        } else {
          console.error('Plugin names must be strings');
        }
      }
      if (yetiBoxes.length) {
        var listeners = plugNames.map(function (name) {
          return 'closeme.zf.' + name;
        }).join(' ');

        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off(listeners).on(listeners, Triggers.Listeners.Global.closeMeListener);
      }
    };

    function debounceGlobalListener(debounce, trigger, listener) {
      var timer = void 0,
          args = Array.prototype.slice.call(arguments, 3);
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off(trigger).on(trigger, function (e) {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(function () {
          listener.apply(null, args);
        }, debounce || 10); //default time to emit scroll event
      });
    }

    Triggers.Initializers.addResizeListener = function (debounce) {
      var $nodes = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-resize]');
      if ($nodes.length) {
        debounceGlobalListener(debounce, 'resize.zf.trigger', Triggers.Listeners.Global.resizeListener, $nodes);
      }
    };

    Triggers.Initializers.addScrollListener = function (debounce) {
      var $nodes = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-scroll]');
      if ($nodes.length) {
        debounceGlobalListener(debounce, 'scroll.zf.trigger', Triggers.Listeners.Global.scrollListener, $nodes);
      }
    };

    Triggers.Initializers.addMutationEventsListener = function ($elem) {
      if (!MutationObserver) {
        return false;
      }
      var $nodes = $elem.find('[data-resize], [data-scroll], [data-mutate]');

      //element callback
      var listeningElementsMutation = function listeningElementsMutation(mutationRecordsList) {
        var $target = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(mutationRecordsList[0].target);

        //trigger the event handler for the element depending on type
        switch (mutationRecordsList[0].type) {
          case "attributes":
            if ($target.attr("data-events") === "scroll" && mutationRecordsList[0].attributeName === "data-events") {
              $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
            }
            if ($target.attr("data-events") === "resize" && mutationRecordsList[0].attributeName === "data-events") {
              $target.triggerHandler('resizeme.zf.trigger', [$target]);
            }
            if (mutationRecordsList[0].attributeName === "style") {
              $target.closest("[data-mutate]").attr("data-events", "mutate");
              $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
            }
            break;

          case "childList":
            $target.closest("[data-mutate]").attr("data-events", "mutate");
            $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
            break;

          default:
            return false;
          //nothing
        }
      };

      if ($nodes.length) {
        //for each element that needs to listen for resizing, scrolling, or mutation add a single observer
        for (var i = 0; i <= $nodes.length - 1; i++) {
          var elementObserver = new MutationObserver(listeningElementsMutation);
          elementObserver.observe($nodes[i], { attributes: true, childList: true, characterData: false, subtree: true, attributeFilter: ["data-events", "style"] });
        }
      }
    };

    Triggers.Initializers.addSimpleListeners = function () {
      var $document = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(document);

      Triggers.Initializers.addOpenListener($document);
      Triggers.Initializers.addCloseListener($document);
      Triggers.Initializers.addToggleListener($document);
      Triggers.Initializers.addCloseableListener($document);
      Triggers.Initializers.addToggleFocusListener($document);
    };

    Triggers.Initializers.addGlobalListeners = function () {
      var $document = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(document);
      Triggers.Initializers.addMutationEventsListener($document);
      Triggers.Initializers.addResizeListener();
      Triggers.Initializers.addScrollListener();
      Triggers.Initializers.addClosemeListener();
    };

    Triggers.init = function ($, Foundation) {
      if (typeof $.triggersInitialized === 'undefined') {
        var $document = $(document);

        if (document.readyState === "complete") {
          Triggers.Initializers.addSimpleListeners();
          Triggers.Initializers.addGlobalListeners();
        } else {
          $(window).on('load', function () {
            Triggers.Initializers.addSimpleListeners();
            Triggers.Initializers.addGlobalListeners();
          });
        }

        $.triggersInitialized = true;
      }

      if (Foundation) {
        Foundation.Triggers = Triggers;
        // Legacy included to be backwards compatible for now.
        Foundation.IHearYou = Triggers.Initializers.addGlobalListeners;
      }
    };

    /***/
  },

  /***/88:
  /***/function _(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(22);

    /***/
  }

  /******/ });
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/******/(function (modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/var installedModules = {};
  /******/
  /******/ // The require function
  /******/function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/if (installedModules[moduleId]) {
      /******/return installedModules[moduleId].exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/var module = installedModules[moduleId] = {
      /******/i: moduleId,
      /******/l: false,
      /******/exports: {}
      /******/ };
    /******/
    /******/ // Execute the module function
    /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ // Flag the module as loaded
    /******/module.l = true;
    /******/
    /******/ // Return the exports of the module
    /******/return module.exports;
    /******/
  }
  /******/
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/__webpack_require__.m = modules;
  /******/
  /******/ // expose the module cache
  /******/__webpack_require__.c = installedModules;
  /******/
  /******/ // identity function for calling harmony imports with the correct context
  /******/__webpack_require__.i = function (value) {
    return value;
  };
  /******/
  /******/ // define getter function for harmony exports
  /******/__webpack_require__.d = function (exports, name, getter) {
    /******/if (!__webpack_require__.o(exports, name)) {
      /******/Object.defineProperty(exports, name, {
        /******/configurable: false,
        /******/enumerable: true,
        /******/get: getter
        /******/ });
      /******/
    }
    /******/
  };
  /******/
  /******/ // getDefaultExport function for compatibility with non-harmony modules
  /******/__webpack_require__.n = function (module) {
    /******/var getter = module && module.__esModule ?
    /******/function getDefault() {
      return module['default'];
    } :
    /******/function getModuleExports() {
      return module;
    };
    /******/__webpack_require__.d(getter, 'a', getter);
    /******/return getter;
    /******/
  };
  /******/
  /******/ // Object.prototype.hasOwnProperty.call
  /******/__webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  /******/
  /******/ // __webpack_public_path__
  /******/__webpack_require__.p = "";
  /******/
  /******/ // Load entry module and return exports
  /******/return __webpack_require__(__webpack_require__.s = 89);
  /******/
})(
/************************************************************************/
/******/{

  /***/0:
  /***/function _(module, exports) {

    module.exports = jQuery;

    /***/
  },

  /***/1:
  /***/function _(module, exports) {

    module.exports = { Foundation: window.Foundation };

    /***/
  },

  /***/10:
  /***/function _(module, exports) {

    module.exports = { onImagesLoaded: window.Foundation.onImagesLoaded };

    /***/
  },

  /***/12:
  /***/function _(module, exports) {

    module.exports = { Touch: window.Foundation.Touch };

    /***/
  },

  /***/2:
  /***/function _(module, exports) {

    module.exports = { Plugin: window.Foundation.Plugin };

    /***/
  },

  /***/23:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";

    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core__ = __webpack_require__(1);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__foundation_core__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_orbit__ = __webpack_require__(53);

    __WEBPACK_IMPORTED_MODULE_0__foundation_core__["Foundation"].plugin(__WEBPACK_IMPORTED_MODULE_1__foundation_orbit__["a" /* Orbit */], 'Orbit');

    /***/
  },

  /***/3:
  /***/function _(module, exports) {

    module.exports = { rtl: window.Foundation.rtl, GetYoDigits: window.Foundation.GetYoDigits, transitionend: window.Foundation.transitionend };

    /***/
  },

  /***/4:
  /***/function _(module, exports) {

    module.exports = { Motion: window.Foundation.Motion, Move: window.Foundation.Move };

    /***/
  },

  /***/5:
  /***/function _(module, exports) {

    module.exports = { Keyboard: window.Foundation.Keyboard };

    /***/
  },

  /***/53:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";
    /* harmony export (binding) */
    __webpack_require__.d(__webpack_exports__, "a", function () {
      return Orbit;
    });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__ = __webpack_require__(5);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_2__foundation_util_motion__ = __webpack_require__(4);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_2__foundation_util_motion___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__foundation_util_motion__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_3__foundation_util_timer__ = __webpack_require__(78);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_3__foundation_util_timer___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__foundation_util_timer__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_4__foundation_util_imageLoader__ = __webpack_require__(10);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_4__foundation_util_imageLoader___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__foundation_util_imageLoader__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_5__foundation_util_core__ = __webpack_require__(3);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_5__foundation_util_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__foundation_util_core__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_6__foundation_plugin__ = __webpack_require__(2);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_6__foundation_plugin___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__foundation_plugin__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_7__foundation_util_touch__ = __webpack_require__(12);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_7__foundation_util_touch___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__foundation_util_touch__);

    var _createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
      }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
      };
    }();

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
      }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    /**
     * Orbit module.
     * @module foundation.orbit
     * @requires foundation.util.keyboard
     * @requires foundation.util.motion
     * @requires foundation.util.timer
     * @requires foundation.util.imageLoader
     * @requires foundation.util.touch
     */

    var Orbit = function (_Plugin) {
      _inherits(Orbit, _Plugin);

      function Orbit() {
        _classCallCheck(this, Orbit);

        return _possibleConstructorReturn(this, (Orbit.__proto__ || Object.getPrototypeOf(Orbit)).apply(this, arguments));
      }

      _createClass(Orbit, [{
        key: '_setup',

        /**
        * Creates a new instance of an orbit carousel.
        * @class
        * @name Orbit
        * @param {jQuery} element - jQuery object to make into an Orbit Carousel.
        * @param {Object} options - Overrides to the default plugin settings.
        */
        value: function _setup(element, options) {
          this.$element = element;
          this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({}, Orbit.defaults, this.$element.data(), options);
          this.className = 'Orbit'; // ie9 back compat

          __WEBPACK_IMPORTED_MODULE_7__foundation_util_touch__["Touch"].init(__WEBPACK_IMPORTED_MODULE_0_jquery___default.a); // Touch init is idempotent, we just need to make sure it's initialied.

          this._init();

          __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["Keyboard"].register('Orbit', {
            'ltr': {
              'ARROW_RIGHT': 'next',
              'ARROW_LEFT': 'previous'
            },
            'rtl': {
              'ARROW_LEFT': 'next',
              'ARROW_RIGHT': 'previous'
            }
          });
        }

        /**
        * Initializes the plugin by creating jQuery collections, setting attributes, and starting the animation.
        * @function
        * @private
        */

      }, {
        key: '_init',
        value: function _init() {
          // @TODO: consider discussion on PR #9278 about DOM pollution by changeSlide
          this._reset();

          this.$wrapper = this.$element.find('.' + this.options.containerClass);
          this.$slides = this.$element.find('.' + this.options.slideClass);

          var $images = this.$element.find('img'),
              initActive = this.$slides.filter('.is-active'),
              id = this.$element[0].id || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__foundation_util_core__["GetYoDigits"])(6, 'orbit');

          this.$element.attr({
            'data-resize': id,
            'id': id
          });

          if (!initActive.length) {
            this.$slides.eq(0).addClass('is-active');
          }

          if (!this.options.useMUI) {
            this.$slides.addClass('no-motionui');
          }

          if ($images.length) {
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__foundation_util_imageLoader__["onImagesLoaded"])($images, this._prepareForOrbit.bind(this));
          } else {
            this._prepareForOrbit(); //hehe
          }

          if (this.options.bullets) {
            this._loadBullets();
          }

          this._events();

          if (this.options.autoPlay && this.$slides.length > 1) {
            this.geoSync();
          }

          if (this.options.accessible) {
            // allow wrapper to be focusable to enable arrow navigation
            this.$wrapper.attr('tabindex', 0);
          }
        }

        /**
        * Creates a jQuery collection of bullets, if they are being used.
        * @function
        * @private
        */

      }, {
        key: '_loadBullets',
        value: function _loadBullets() {
          this.$bullets = this.$element.find('.' + this.options.boxOfBullets).find('button');
        }

        /**
        * Sets a `timer` object on the orbit, and starts the counter for the next slide.
        * @function
        */

      }, {
        key: 'geoSync',
        value: function geoSync() {
          var _this = this;
          this.timer = new __WEBPACK_IMPORTED_MODULE_3__foundation_util_timer__["Timer"](this.$element, {
            duration: this.options.timerDelay,
            infinite: false
          }, function () {
            _this.changeSlide(true);
          });
          this.timer.start();
        }

        /**
        * Sets wrapper and slide heights for the orbit.
        * @function
        * @private
        */

      }, {
        key: '_prepareForOrbit',
        value: function _prepareForOrbit() {
          var _this = this;
          this._setWrapperHeight();
        }

        /**
        * Calulates the height of each slide in the collection, and uses the tallest one for the wrapper height.
        * @function
        * @private
        * @param {Function} cb - a callback function to fire when complete.
        */

      }, {
        key: '_setWrapperHeight',
        value: function _setWrapperHeight(cb) {
          //rewrite this to `for` loop
          var max = 0,
              temp,
              counter = 0,
              _this = this;

          this.$slides.each(function () {
            temp = this.getBoundingClientRect().height;
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).attr('data-slide', counter);

            if (!/mui/g.test(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this)[0].className) && _this.$slides.filter('.is-active')[0] !== _this.$slides.eq(counter)[0]) {
              //if not the active slide, set css position and display property
              __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).css({ 'position': 'relative', 'display': 'none' });
            }
            max = temp > max ? temp : max;
            counter++;
          });

          if (counter === this.$slides.length) {
            this.$wrapper.css({ 'height': max }); //only change the wrapper height property once.
            if (cb) {
              cb(max);
            } //fire callback with max height dimension.
          }
        }

        /**
        * Sets the max-height of each slide.
        * @function
        * @private
        */

      }, {
        key: '_setSlideHeight',
        value: function _setSlideHeight(height) {
          this.$slides.each(function () {
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).css('max-height', height);
          });
        }

        /**
        * Adds event listeners to basically everything within the element.
        * @function
        * @private
        */

      }, {
        key: '_events',
        value: function _events() {
          var _this = this;

          //***************************************
          //**Now using custom event - thanks to:**
          //**      Yohai Ararat of Toronto      **
          //***************************************
          //
          this.$element.off('.resizeme.zf.trigger').on({
            'resizeme.zf.trigger': this._prepareForOrbit.bind(this)
          });
          if (this.$slides.length > 1) {

            if (this.options.swipe) {
              this.$slides.off('swipeleft.zf.orbit swiperight.zf.orbit').on('swipeleft.zf.orbit', function (e) {
                e.preventDefault();
                _this.changeSlide(true);
              }).on('swiperight.zf.orbit', function (e) {
                e.preventDefault();
                _this.changeSlide(false);
              });
            }
            //***************************************

            if (this.options.autoPlay) {
              this.$slides.on('click.zf.orbit', function () {
                _this.$element.data('clickedOn', _this.$element.data('clickedOn') ? false : true);
                _this.timer[_this.$element.data('clickedOn') ? 'pause' : 'start']();
              });

              if (this.options.pauseOnHover) {
                this.$element.on('mouseenter.zf.orbit', function () {
                  _this.timer.pause();
                }).on('mouseleave.zf.orbit', function () {
                  if (!_this.$element.data('clickedOn')) {
                    _this.timer.start();
                  }
                });
              }
            }

            if (this.options.navButtons) {
              var $controls = this.$element.find('.' + this.options.nextClass + ', .' + this.options.prevClass);
              $controls.attr('tabindex', 0)
              //also need to handle enter/return and spacebar key presses
              .on('click.zf.orbit touchend.zf.orbit', function (e) {
                e.preventDefault();
                _this.changeSlide(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).hasClass(_this.options.nextClass));
              });
            }

            if (this.options.bullets) {
              this.$bullets.on('click.zf.orbit touchend.zf.orbit', function () {
                if (/is-active/g.test(this.className)) {
                  return false;
                } //if this is active, kick out of function.
                var idx = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).data('slide'),
                    ltr = idx > _this.$slides.filter('.is-active').data('slide'),
                    $slide = _this.$slides.eq(idx);

                _this.changeSlide(ltr, $slide, idx);
              });
            }

            if (this.options.accessible) {
              this.$wrapper.add(this.$bullets).on('keydown.zf.orbit', function (e) {
                // handle keyboard event with keyboard util
                __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["Keyboard"].handleKey(e, 'Orbit', {
                  next: function next() {
                    _this.changeSlide(true);
                  },
                  previous: function previous() {
                    _this.changeSlide(false);
                  },
                  handled: function handled() {
                    // if bullet is focused, make sure focus moves
                    if (__WEBPACK_IMPORTED_MODULE_0_jquery___default()(e.target).is(_this.$bullets)) {
                      _this.$bullets.filter('.is-active').focus();
                    }
                  }
                });
              });
            }
          }
        }

        /**
         * Resets Orbit so it can be reinitialized
         */

      }, {
        key: '_reset',
        value: function _reset() {
          // Don't do anything if there are no slides (first run)
          if (typeof this.$slides == 'undefined') {
            return;
          }

          if (this.$slides.length > 1) {
            // Remove old events
            this.$element.off('.zf.orbit').find('*').off('.zf.orbit');

            // Restart timer if autoPlay is enabled
            if (this.options.autoPlay) {
              this.timer.restart();
            }

            // Reset all sliddes
            this.$slides.each(function (el) {
              __WEBPACK_IMPORTED_MODULE_0_jquery___default()(el).removeClass('is-active is-active is-in').removeAttr('aria-live').hide();
            });

            // Show the first slide
            this.$slides.first().addClass('is-active').show();

            // Triggers when the slide has finished animating
            this.$element.trigger('slidechange.zf.orbit', [this.$slides.first()]);

            // Select first bullet if bullets are present
            if (this.options.bullets) {
              this._updateBullets(0);
            }
          }
        }

        /**
        * Changes the current slide to a new one.
        * @function
        * @param {Boolean} isLTR - flag if the slide should move left to right.
        * @param {jQuery} chosenSlide - the jQuery element of the slide to show next, if one is selected.
        * @param {Number} idx - the index of the new slide in its collection, if one chosen.
        * @fires Orbit#slidechange
        */

      }, {
        key: 'changeSlide',
        value: function changeSlide(isLTR, chosenSlide, idx) {
          if (!this.$slides) {
            return;
          } // Don't freak out if we're in the middle of cleanup
          var $curSlide = this.$slides.filter('.is-active').eq(0);

          if (/mui/g.test($curSlide[0].className)) {
            return false;
          } //if the slide is currently animating, kick out of the function

          var $firstSlide = this.$slides.first(),
              $lastSlide = this.$slides.last(),
              dirIn = isLTR ? 'Right' : 'Left',
              dirOut = isLTR ? 'Left' : 'Right',
              _this = this,
              $newSlide;

          if (!chosenSlide) {
            //most of the time, this will be auto played or clicked from the navButtons.
            $newSlide = isLTR ? //if wrapping enabled, check to see if there is a `next` or `prev` sibling, if not, select the first or last slide to fill in. if wrapping not enabled, attempt to select `next` or `prev`, if there's nothing there, the function will kick out on next step. CRAZY NESTED TERNARIES!!!!!
            this.options.infiniteWrap ? $curSlide.next('.' + this.options.slideClass).length ? $curSlide.next('.' + this.options.slideClass) : $firstSlide : $curSlide.next('.' + this.options.slideClass) : //pick next slide if moving left to right
            this.options.infiniteWrap ? $curSlide.prev('.' + this.options.slideClass).length ? $curSlide.prev('.' + this.options.slideClass) : $lastSlide : $curSlide.prev('.' + this.options.slideClass); //pick prev slide if moving right to left
          } else {
            $newSlide = chosenSlide;
          }

          if ($newSlide.length) {
            /**
            * Triggers before the next slide starts animating in and only if a next slide has been found.
            * @event Orbit#beforeslidechange
            */
            this.$element.trigger('beforeslidechange.zf.orbit', [$curSlide, $newSlide]);

            if (this.options.bullets) {
              idx = idx || this.$slides.index($newSlide); //grab index to update bullets
              this._updateBullets(idx);
            }

            if (this.options.useMUI && !this.$element.is(':hidden')) {
              __WEBPACK_IMPORTED_MODULE_2__foundation_util_motion__["Motion"].animateIn($newSlide.addClass('is-active').css({ 'position': 'absolute', 'top': 0 }), this.options['animInFrom' + dirIn], function () {
                $newSlide.css({ 'position': 'relative', 'display': 'block' }).attr('aria-live', 'polite');
              });

              __WEBPACK_IMPORTED_MODULE_2__foundation_util_motion__["Motion"].animateOut($curSlide.removeClass('is-active'), this.options['animOutTo' + dirOut], function () {
                $curSlide.removeAttr('aria-live');
                if (_this.options.autoPlay && !_this.timer.isPaused) {
                  _this.timer.restart();
                }
                //do stuff?
              });
            } else {
              $curSlide.removeClass('is-active is-in').removeAttr('aria-live').hide();
              $newSlide.addClass('is-active is-in').attr('aria-live', 'polite').show();
              if (this.options.autoPlay && !this.timer.isPaused) {
                this.timer.restart();
              }
            }
            /**
            * Triggers when the slide has finished animating in.
            * @event Orbit#slidechange
            */
            this.$element.trigger('slidechange.zf.orbit', [$newSlide]);
          }
        }

        /**
        * Updates the active state of the bullets, if displayed.
        * @function
        * @private
        * @param {Number} idx - the index of the current slide.
        */

      }, {
        key: '_updateBullets',
        value: function _updateBullets(idx) {
          var $oldBullet = this.$element.find('.' + this.options.boxOfBullets).find('.is-active').removeClass('is-active').blur(),
              span = $oldBullet.find('span:last').detach(),
              $newBullet = this.$bullets.eq(idx).addClass('is-active').append(span);
        }

        /**
        * Destroys the carousel and hides the element.
        * @function
        */

      }, {
        key: '_destroy',
        value: function _destroy() {
          this.$element.off('.zf.orbit').find('*').off('.zf.orbit').end().hide();
        }
      }]);

      return Orbit;
    }(__WEBPACK_IMPORTED_MODULE_6__foundation_plugin__["Plugin"]);

    Orbit.defaults = {
      /**
      * Tells the JS to look for and loadBullets.
      * @option
       * @type {boolean}
      * @default true
      */
      bullets: true,
      /**
      * Tells the JS to apply event listeners to nav buttons
      * @option
       * @type {boolean}
      * @default true
      */
      navButtons: true,
      /**
      * motion-ui animation class to apply
      * @option
       * @type {string}
      * @default 'slide-in-right'
      */
      animInFromRight: 'slide-in-right',
      /**
      * motion-ui animation class to apply
      * @option
       * @type {string}
      * @default 'slide-out-right'
      */
      animOutToRight: 'slide-out-right',
      /**
      * motion-ui animation class to apply
      * @option
       * @type {string}
      * @default 'slide-in-left'
      *
      */
      animInFromLeft: 'slide-in-left',
      /**
      * motion-ui animation class to apply
      * @option
       * @type {string}
      * @default 'slide-out-left'
      */
      animOutToLeft: 'slide-out-left',
      /**
      * Allows Orbit to automatically animate on page load.
      * @option
       * @type {boolean}
      * @default true
      */
      autoPlay: true,
      /**
      * Amount of time, in ms, between slide transitions
      * @option
       * @type {number}
      * @default 5000
      */
      timerDelay: 5000,
      /**
      * Allows Orbit to infinitely loop through the slides
      * @option
       * @type {boolean}
      * @default true
      */
      infiniteWrap: true,
      /**
      * Allows the Orbit slides to bind to swipe events for mobile, requires an additional util library
      * @option
       * @type {boolean}
      * @default true
      */
      swipe: true,
      /**
      * Allows the timing function to pause animation on hover.
      * @option
       * @type {boolean}
      * @default true
      */
      pauseOnHover: true,
      /**
      * Allows Orbit to bind keyboard events to the slider, to animate frames with arrow keys
      * @option
       * @type {boolean}
      * @default true
      */
      accessible: true,
      /**
      * Class applied to the container of Orbit
      * @option
       * @type {string}
      * @default 'orbit-container'
      */
      containerClass: 'orbit-container',
      /**
      * Class applied to individual slides.
      * @option
       * @type {string}
      * @default 'orbit-slide'
      */
      slideClass: 'orbit-slide',
      /**
      * Class applied to the bullet container. You're welcome.
      * @option
       * @type {string}
      * @default 'orbit-bullets'
      */
      boxOfBullets: 'orbit-bullets',
      /**
      * Class applied to the `next` navigation button.
      * @option
       * @type {string}
      * @default 'orbit-next'
      */
      nextClass: 'orbit-next',
      /**
      * Class applied to the `previous` navigation button.
      * @option
       * @type {string}
      * @default 'orbit-previous'
      */
      prevClass: 'orbit-previous',
      /**
      * Boolean to flag the js to use motion ui classes or not. Default to true for backwards compatability.
      * @option
       * @type {boolean}
      * @default true
      */
      useMUI: true
    };

    /***/
  },

  /***/78:
  /***/function _(module, exports) {

    module.exports = { Timer: window.Foundation.Timer };

    /***/
  },

  /***/89:
  /***/function _(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(23);

    /***/
  }

  /******/ });
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/******/(function (modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/var installedModules = {};
  /******/
  /******/ // The require function
  /******/function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/if (installedModules[moduleId]) {
      /******/return installedModules[moduleId].exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/var module = installedModules[moduleId] = {
      /******/i: moduleId,
      /******/l: false,
      /******/exports: {}
      /******/ };
    /******/
    /******/ // Execute the module function
    /******/modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ // Flag the module as loaded
    /******/module.l = true;
    /******/
    /******/ // Return the exports of the module
    /******/return module.exports;
    /******/
  }
  /******/
  /******/
  /******/ // expose the modules object (__webpack_modules__)
  /******/__webpack_require__.m = modules;
  /******/
  /******/ // expose the module cache
  /******/__webpack_require__.c = installedModules;
  /******/
  /******/ // identity function for calling harmony imports with the correct context
  /******/__webpack_require__.i = function (value) {
    return value;
  };
  /******/
  /******/ // define getter function for harmony exports
  /******/__webpack_require__.d = function (exports, name, getter) {
    /******/if (!__webpack_require__.o(exports, name)) {
      /******/Object.defineProperty(exports, name, {
        /******/configurable: false,
        /******/enumerable: true,
        /******/get: getter
        /******/ });
      /******/
    }
    /******/
  };
  /******/
  /******/ // getDefaultExport function for compatibility with non-harmony modules
  /******/__webpack_require__.n = function (module) {
    /******/var getter = module && module.__esModule ?
    /******/function getDefault() {
      return module['default'];
    } :
    /******/function getModuleExports() {
      return module;
    };
    /******/__webpack_require__.d(getter, 'a', getter);
    /******/return getter;
    /******/
  };
  /******/
  /******/ // Object.prototype.hasOwnProperty.call
  /******/__webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  /******/
  /******/ // __webpack_public_path__
  /******/__webpack_require__.p = "";
  /******/
  /******/ // Load entry module and return exports
  /******/return __webpack_require__(__webpack_require__.s = 91);
  /******/
})(
/************************************************************************/
/******/{

  /***/0:
  /***/function _(module, exports) {

    module.exports = jQuery;

    /***/
  },

  /***/1:
  /***/function _(module, exports) {

    module.exports = { Foundation: window.Foundation };

    /***/
  },

  /***/2:
  /***/function _(module, exports) {

    module.exports = { Plugin: window.Foundation.Plugin };

    /***/
  },

  /***/25:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";

    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core__ = __webpack_require__(1);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0__foundation_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__foundation_core__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_responsiveMenu__ = __webpack_require__(55);

    __WEBPACK_IMPORTED_MODULE_0__foundation_core__["Foundation"].plugin(__WEBPACK_IMPORTED_MODULE_1__foundation_responsiveMenu__["a" /* ResponsiveMenu */], 'ResponsiveMenu');

    /***/
  },

  /***/3:
  /***/function _(module, exports) {

    module.exports = { rtl: window.Foundation.rtl, GetYoDigits: window.Foundation.GetYoDigits, transitionend: window.Foundation.transitionend };

    /***/
  },

  /***/55:
  /***/function _(module, __webpack_exports__, __webpack_require__) {

    "use strict";
    /* harmony export (binding) */
    __webpack_require__.d(__webpack_exports__, "a", function () {
      return ResponsiveMenu;
    });
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__ = __webpack_require__(6);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_2__foundation_util_core__ = __webpack_require__(3);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_2__foundation_util_core___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__foundation_util_core__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_3__foundation_plugin__ = __webpack_require__(2);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_3__foundation_plugin___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__foundation_plugin__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_4__foundation_dropdownMenu__ = __webpack_require__(75);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_4__foundation_dropdownMenu___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__foundation_dropdownMenu__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_5__foundation_drilldown__ = __webpack_require__(74);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_5__foundation_drilldown___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__foundation_drilldown__);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_6__foundation_accordionMenu__ = __webpack_require__(73);
    /* harmony import */var __WEBPACK_IMPORTED_MODULE_6__foundation_accordionMenu___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__foundation_accordionMenu__);

    var _createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
      }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
      };
    }();

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }return call && ((typeof call === 'undefined' ? 'undefined' : _typeof(call)) === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === 'undefined' ? 'undefined' : _typeof(superClass)));
      }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    var MenuPlugins = {
      dropdown: {
        cssClass: 'dropdown',
        plugin: __WEBPACK_IMPORTED_MODULE_4__foundation_dropdownMenu__["DropdownMenu"]
      },
      drilldown: {
        cssClass: 'drilldown',
        plugin: __WEBPACK_IMPORTED_MODULE_5__foundation_drilldown__["Drilldown"]
      },
      accordion: {
        cssClass: 'accordion-menu',
        plugin: __WEBPACK_IMPORTED_MODULE_6__foundation_accordionMenu__["AccordionMenu"]
      }
    };

    // import "foundation.util.triggers.js";


    /**
     * ResponsiveMenu module.
     * @module foundation.responsiveMenu
     * @requires foundation.util.triggers
     * @requires foundation.util.mediaQuery
     */

    var ResponsiveMenu = function (_Plugin) {
      _inherits(ResponsiveMenu, _Plugin);

      function ResponsiveMenu() {
        _classCallCheck(this, ResponsiveMenu);

        return _possibleConstructorReturn(this, (ResponsiveMenu.__proto__ || Object.getPrototypeOf(ResponsiveMenu)).apply(this, arguments));
      }

      _createClass(ResponsiveMenu, [{
        key: '_setup',

        /**
         * Creates a new instance of a responsive menu.
         * @class
         * @name ResponsiveMenu
         * @fires ResponsiveMenu#init
         * @param {jQuery} element - jQuery object to make into a dropdown menu.
         * @param {Object} options - Overrides to the default plugin settings.
         */
        value: function _setup(element, options) {
          this.$element = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(element);
          this.rules = this.$element.data('responsive-menu');
          this.currentMq = null;
          this.currentPlugin = null;
          this.className = 'ResponsiveMenu'; // ie9 back compat

          this._init();
          this._events();
        }

        /**
         * Initializes the Menu by parsing the classes from the 'data-ResponsiveMenu' attribute on the element.
         * @function
         * @private
         */

      }, {
        key: '_init',
        value: function _init() {

          __WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__["MediaQuery"]._init();
          // The first time an Interchange plugin is initialized, this.rules is converted from a string of "classes" to an object of rules
          if (typeof this.rules === 'string') {
            var rulesTree = {};

            // Parse rules from "classes" pulled from data attribute
            var rules = this.rules.split(' ');

            // Iterate through every rule found
            for (var i = 0; i < rules.length; i++) {
              var rule = rules[i].split('-');
              var ruleSize = rule.length > 1 ? rule[0] : 'small';
              var rulePlugin = rule.length > 1 ? rule[1] : rule[0];

              if (MenuPlugins[rulePlugin] !== null) {
                rulesTree[ruleSize] = MenuPlugins[rulePlugin];
              }
            }

            this.rules = rulesTree;
          }

          if (!__WEBPACK_IMPORTED_MODULE_0_jquery___default.a.isEmptyObject(this.rules)) {
            this._checkMediaQueries();
          }
          // Add data-mutate since children may need it.
          this.$element.attr('data-mutate', this.$element.attr('data-mutate') || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__foundation_util_core__["GetYoDigits"])(6, 'responsive-menu'));
        }

        /**
         * Initializes events for the Menu.
         * @function
         * @private
         */

      }, {
        key: '_events',
        value: function _events() {
          var _this = this;

          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).on('changed.zf.mediaquery', function () {
            _this._checkMediaQueries();
          });
          // $(window).on('resize.zf.ResponsiveMenu', function() {
          //   _this._checkMediaQueries();
          // });
        }

        /**
         * Checks the current screen width against available media queries. If the media query has changed, and the plugin needed has changed, the plugins will swap out.
         * @function
         * @private
         */

      }, {
        key: '_checkMediaQueries',
        value: function _checkMediaQueries() {
          var matchedMq,
              _this = this;
          // Iterate through each rule and find the last matching rule
          __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.each(this.rules, function (key) {
            if (__WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__["MediaQuery"].atLeast(key)) {
              matchedMq = key;
            }
          });

          // No match? No dice
          if (!matchedMq) return;

          // Plugin already initialized? We good
          if (this.currentPlugin instanceof this.rules[matchedMq].plugin) return;

          // Remove existing plugin-specific CSS classes
          __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.each(MenuPlugins, function (key, value) {
            _this.$element.removeClass(value.cssClass);
          });

          // Add the CSS class for the new plugin
          this.$element.addClass(this.rules[matchedMq].cssClass);

          // Create an instance of the new plugin
          if (this.currentPlugin) this.currentPlugin.destroy();
          this.currentPlugin = new this.rules[matchedMq].plugin(this.$element, {});
        }

        /**
         * Destroys the instance of the current plugin on this element, as well as the window resize handler that switches the plugins out.
         * @function
         */

      }, {
        key: '_destroy',
        value: function _destroy() {
          this.currentPlugin.destroy();
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off('.zf.ResponsiveMenu');
        }
      }]);

      return ResponsiveMenu;
    }(__WEBPACK_IMPORTED_MODULE_3__foundation_plugin__["Plugin"]);

    ResponsiveMenu.defaults = {};

    /***/
  },

  /***/6:
  /***/function _(module, exports) {

    module.exports = { MediaQuery: window.Foundation.MediaQuery };

    /***/
  },

  /***/73:
  /***/function _(module, exports) {

    module.exports = { AccordionMenu: window.Foundation.AccordionMenu };

    /***/
  },

  /***/74:
  /***/function _(module, exports) {

    module.exports = { Drilldown: window.Foundation.Drilldown };

    /***/
  },

  /***/75:
  /***/function _(module, exports) {

    module.exports = { DropdownMenu: window.Foundation.DropdownMenu };

    /***/
  },

  /***/91:
  /***/function _(module, exports, __webpack_require__) {

    module.exports = __webpack_require__(25);

    /***/
  }

  /******/ });
"use strict";

(function ($) {
    $(document).foundation();
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJsYXp5c2l6ZXMubWluLmpzIiwiZm91bmRhdGlvbi5jb3JlLmpzIiwiZm91bmRhdGlvbi51dGlsLmJveC5qcyIsImZvdW5kYXRpb24udXRpbC5ib3gubWluLmpzIiwiZm91bmRhdGlvbi51dGlsLmltYWdlTG9hZGVyLmpzIiwiZm91bmRhdGlvbi51dGlsLmltYWdlTG9hZGVyLm1pbi5qcyIsImZvdW5kYXRpb24udXRpbC5rZXlib2FyZC5qcyIsImZvdW5kYXRpb24udXRpbC5rZXlib2FyZC5taW4uanMiLCJmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeS5qcyIsImZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5Lm1pbi5qcyIsImZvdW5kYXRpb24udXRpbC5tb3Rpb24uanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLm1pbi5qcyIsImZvdW5kYXRpb24udXRpbC5uZXN0LmpzIiwiZm91bmRhdGlvbi51dGlsLm5lc3QubWluLmpzIiwiZm91bmRhdGlvbi51dGlsLnRpbWVyLmpzIiwiZm91bmRhdGlvbi51dGlsLnRpbWVyLm1pbi5qcyIsImZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyLmpzIiwiZm91bmRhdGlvbi51dGlsLnRpbWVyQW5kSW1hZ2VMb2FkZXIubWluLmpzIiwiZm91bmRhdGlvbi51dGlsLnRvdWNoLmpzIiwiZm91bmRhdGlvbi51dGlsLnRvdWNoLm1pbi5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5taW4uanMiLCJmb3VuZGF0aW9uLmRyb3Bkb3duTWVudS5qcyIsImZvdW5kYXRpb24ub2ZmY2FudmFzLmpzIiwiZm91bmRhdGlvbi5vcmJpdC5qcyIsImZvdW5kYXRpb24ucmVzcG9uc2l2ZU1lbnUuanMiLCJhcHAuanMiXSwibmFtZXMiOlsiYSIsImIiLCJjIiwiZG9jdW1lbnQiLCJsYXp5U2l6ZXMiLCJtb2R1bGUiLCJleHBvcnRzIiwid2luZG93IiwiZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSIsImQiLCJkb2N1bWVudEVsZW1lbnQiLCJlIiwiRGF0ZSIsImYiLCJIVE1MUGljdHVyZUVsZW1lbnQiLCJnIiwiaCIsImkiLCJqIiwic2V0VGltZW91dCIsImsiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJsIiwicmVxdWVzdElkbGVDYWxsYmFjayIsIm0iLCJuIiwibyIsInAiLCJBcnJheSIsInByb3RvdHlwZSIsImZvckVhY2giLCJxIiwiUmVnRXhwIiwidGVzdCIsInIiLCJzZXRBdHRyaWJ1dGUiLCJ0cmltIiwicyIsInJlcGxhY2UiLCJ0IiwidSIsImNyZWF0ZUV2ZW50IiwiaW5pdEN1c3RvbUV2ZW50IiwiZGlzcGF0Y2hFdmVudCIsInYiLCJwaWN0dXJlZmlsbCIsInBmIiwicmVldmFsdWF0ZSIsImVsZW1lbnRzIiwic3JjIiwidyIsImdldENvbXB1dGVkU3R5bGUiLCJ4Iiwib2Zmc2V0V2lkdGgiLCJtaW5TaXplIiwiX2xhenlzaXplc1dpZHRoIiwicGFyZW50Tm9kZSIsInkiLCJsZW5ndGgiLCJzaGlmdCIsImFwcGx5IiwiYXJndW1lbnRzIiwicHVzaCIsImhpZGRlbiIsIl9sc0ZsdXNoIiwieiIsIkEiLCJub3ciLCJ0aW1lb3V0IiwiQiIsIkMiLCJFIiwiRiIsIkciLCJIIiwiSSIsIkoiLCJLIiwiTCIsIk0iLCJOIiwiTyIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsIlAiLCJRIiwiUiIsIlMiLCJUIiwidGFyZ2V0IiwiVSIsImJvZHkiLCJvZmZzZXRQYXJlbnQiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJsZWZ0IiwicmlnaHQiLCJ0b3AiLCJib3R0b20iLCJWIiwibG9hZE1vZGUiLCJleHBhbmQiLCJjbGllbnRIZWlnaHQiLCJjbGllbnRXaWR0aCIsImV4cEZhY3RvciIsIl9sYXp5UmFjZSIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsImJhIiwicHJlbG9hZEFmdGVyTG9hZCIsInNpemVzQXR0ciIsIlciLCJYIiwibG9hZGVkQ2xhc3MiLCJsb2FkaW5nQ2xhc3MiLCJaIiwiWSIsIiQiLCJjb250ZW50V2luZG93IiwibG9jYXRpb24iLCJfIiwic3Jjc2V0QXR0ciIsImN1c3RvbU1lZGlhIiwiaW5zZXJ0QmVmb3JlIiwiY2xvbmVOb2RlIiwicmVtb3ZlQ2hpbGQiLCJhYSIsImRlZmF1bHRQcmV2ZW50ZWQiLCJhdXRvc2l6ZXNDbGFzcyIsInNyY0F0dHIiLCJub2RlTmFtZSIsImZpcmVzTG9hZCIsImNsZWFyVGltZW91dCIsImNhbGwiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImxhenlDbGFzcyIsImNvbXBsZXRlIiwibmF0dXJhbFdpZHRoIiwic3Jjc2V0IiwiZXJyb3JDbGFzcyIsImRldGFpbCIsIkQiLCJ1cGRhdGVFbGVtIiwiY2EiLCJwcmVsb2FkQ2xhc3MiLCJoRmFjIiwiTXV0YXRpb25PYnNlcnZlciIsIm9ic2VydmUiLCJjaGlsZExpc3QiLCJzdWJ0cmVlIiwiYXR0cmlidXRlcyIsInNldEludGVydmFsIiwicmVhZHlTdGF0ZSIsImNoZWNrRWxlbXMiLCJ1bnZlaWwiLCJkYXRhQXR0ciIsIndpZHRoIiwiaW5pdCIsImxhenlTaXplc0NvbmZpZyIsImxhenlzaXplc0NvbmZpZyIsImNmZyIsImF1dG9TaXplciIsImxvYWRlciIsInVQIiwiYUMiLCJyQyIsImhDIiwiZmlyZSIsImdXIiwickFGIiwibW9kdWxlcyIsImluc3RhbGxlZE1vZHVsZXMiLCJfX3dlYnBhY2tfcmVxdWlyZV9fIiwibW9kdWxlSWQiLCJ2YWx1ZSIsIm5hbWUiLCJnZXR0ZXIiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImNvbmZpZ3VyYWJsZSIsImVudW1lcmFibGUiLCJnZXQiLCJfX2VzTW9kdWxlIiwiZ2V0RGVmYXVsdCIsImdldE1vZHVsZUV4cG9ydHMiLCJvYmplY3QiLCJwcm9wZXJ0eSIsImhhc093blByb3BlcnR5IiwialF1ZXJ5IiwiX193ZWJwYWNrX2V4cG9ydHNfXyIsInJ0bCIsIkdldFlvRGlnaXRzIiwidHJhbnNpdGlvbmVuZCIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfXyIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0IiwiYXR0ciIsIm5hbWVzcGFjZSIsIk1hdGgiLCJyb3VuZCIsInBvdyIsInJhbmRvbSIsInRvU3RyaW5nIiwic2xpY2UiLCIkZWxlbSIsInRyYW5zaXRpb25zIiwiZWxlbSIsImNyZWF0ZUVsZW1lbnQiLCJlbmQiLCJzdHlsZSIsInRyaWdnZXJIYW5kbGVyIiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX2NvcmVfXyIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMl9fZm91bmRhdGlvbl91dGlsX2NvcmVfXyIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfM19fZm91bmRhdGlvbl9wbHVnaW5fXyIsImFkZFRvSnF1ZXJ5IiwiUGx1Z2luIiwiRm91bmRhdGlvbiIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX2NvcmVfXyIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMl9fZm91bmRhdGlvbl91dGlsX21lZGlhUXVlcnlfXyIsIkZPVU5EQVRJT05fVkVSU0lPTiIsInZlcnNpb24iLCJfcGx1Z2lucyIsIl91dWlkcyIsInBsdWdpbiIsImNsYXNzTmFtZSIsImZ1bmN0aW9uTmFtZSIsImF0dHJOYW1lIiwiaHlwaGVuYXRlIiwicmVnaXN0ZXJQbHVnaW4iLCJwbHVnaW5OYW1lIiwiY29uc3RydWN0b3IiLCJ0b0xvd2VyQ2FzZSIsInV1aWQiLCIkZWxlbWVudCIsImRhdGEiLCJ0cmlnZ2VyIiwidW5yZWdpc3RlclBsdWdpbiIsInNwbGljZSIsImluZGV4T2YiLCJyZW1vdmVBdHRyIiwicmVtb3ZlRGF0YSIsInByb3AiLCJyZUluaXQiLCJwbHVnaW5zIiwiaXNKUSIsImVhY2giLCJfaW5pdCIsInR5cGUiLCJfdGhpcyIsImZucyIsInBsZ3MiLCJmb3VuZGF0aW9uIiwia2V5cyIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsInJlZmxvdyIsImZpbmQiLCJhZGRCYWNrIiwiJGVsIiwib3B0cyIsIndhcm4iLCJ0aGluZyIsInNwbGl0Iiwib3B0IiwibWFwIiwiZWwiLCJwYXJzZVZhbHVlIiwiZXIiLCJnZXRGbk5hbWUiLCJtZXRob2QiLCIkbm9KUyIsInJlbW92ZUNsYXNzIiwiYXJncyIsInBsdWdDbGFzcyIsInVuZGVmaW5lZCIsIlJlZmVyZW5jZUVycm9yIiwiVHlwZUVycm9yIiwiZm4iLCJ1dGlsIiwidGhyb3R0bGUiLCJmdW5jIiwiZGVsYXkiLCJ0aW1lciIsImNvbnRleHQiLCJnZXRUaW1lIiwidmVuZG9ycyIsInZwIiwiY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJsYXN0VGltZSIsImNhbGxiYWNrIiwibmV4dFRpbWUiLCJtYXgiLCJwZXJmb3JtYW5jZSIsInN0YXJ0IiwiRnVuY3Rpb24iLCJiaW5kIiwib1RoaXMiLCJhQXJncyIsImZUb0JpbmQiLCJmTk9QIiwiZkJvdW5kIiwiY29uY2F0IiwiZnVuY05hbWVSZWdleCIsInJlc3VsdHMiLCJleGVjIiwic3RyIiwiaXNOYU4iLCJwYXJzZUZsb2F0IiwiX2NyZWF0ZUNsYXNzIiwiZGVmaW5lUHJvcGVydGllcyIsInByb3BzIiwiZGVzY3JpcHRvciIsIndyaXRhYmxlIiwia2V5IiwiQ29uc3RydWN0b3IiLCJwcm90b1Byb3BzIiwic3RhdGljUHJvcHMiLCJfY2xhc3NDYWxsQ2hlY2siLCJpbnN0YW5jZSIsImVsZW1lbnQiLCJvcHRpb25zIiwiX3NldHVwIiwiZ2V0UGx1Z2luTmFtZSIsImRlc3Ryb3kiLCJfZGVzdHJveSIsIm9iaiIsIk1lZGlhUXVlcnkiLCJkZWZhdWx0UXVlcmllcyIsImxhbmRzY2FwZSIsInBvcnRyYWl0IiwicmV0aW5hIiwibWF0Y2hNZWRpYSIsInN0eWxlTWVkaWEiLCJtZWRpYSIsInNjcmlwdCIsImluZm8iLCJpZCIsImN1cnJlbnRTdHlsZSIsIm1hdGNoTWVkaXVtIiwidGV4dCIsInN0eWxlU2hlZXQiLCJjc3NUZXh0IiwidGV4dENvbnRlbnQiLCJtYXRjaGVzIiwicXVlcmllcyIsImN1cnJlbnQiLCJzZWxmIiwiJG1ldGEiLCJhcHBlbmRUbyIsImhlYWQiLCJleHRyYWN0ZWRTdHlsZXMiLCJjc3MiLCJuYW1lZFF1ZXJpZXMiLCJwYXJzZVN0eWxlVG9PYmplY3QiLCJfZ2V0Q3VycmVudFNpemUiLCJfd2F0Y2hlciIsImF0TGVhc3QiLCJzaXplIiwicXVlcnkiLCJpcyIsIm1hdGNoZWQiLCJvZmYiLCJvbiIsIm5ld1NpemUiLCJjdXJyZW50U2l6ZSIsInN0eWxlT2JqZWN0IiwicmVkdWNlIiwicmV0IiwicGFyYW0iLCJwYXJ0cyIsInZhbCIsImRlY29kZVVSSUNvbXBvbmVudCIsImlzQXJyYXkiLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fIiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX2NvcmVfX19kZWZhdWx0IiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfYm94X18iLCJCb3giLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fdXRpbF9jb3JlX18iLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fdXRpbF9jb3JlX19fZGVmYXVsdCIsIkltTm90VG91Y2hpbmdZb3UiLCJPdmVybGFwQXJlYSIsIkdldERpbWVuc2lvbnMiLCJHZXRPZmZzZXRzIiwiR2V0RXhwbGljaXRPZmZzZXRzIiwicGFyZW50IiwibHJPbmx5IiwidGJPbmx5IiwiaWdub3JlQm90dG9tIiwiZWxlRGltcyIsInRvcE92ZXIiLCJib3R0b21PdmVyIiwibGVmdE92ZXIiLCJyaWdodE92ZXIiLCJwYXJEaW1zIiwiaGVpZ2h0Iiwib2Zmc2V0Iiwid2luZG93RGltcyIsIm1pbiIsInNxcnQiLCJFcnJvciIsInJlY3QiLCJwYXJSZWN0Iiwid2luUmVjdCIsIndpblkiLCJwYWdlWU9mZnNldCIsIndpblgiLCJwYWdlWE9mZnNldCIsInBhcmVudERpbXMiLCJhbmNob3IiLCJwb3NpdGlvbiIsInZPZmZzZXQiLCJoT2Zmc2V0IiwiaXNPdmVyZmxvdyIsImxvZyIsIiRlbGVEaW1zIiwiJGFuY2hvckRpbXMiLCJhbGlnbm1lbnQiLCJ0b3BWYWwiLCJsZWZ0VmFsIiwiZGVmYXVsdCIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX2ltYWdlTG9hZGVyX18iLCJvbkltYWdlc0xvYWRlZCIsImltYWdlcyIsInVubG9hZGVkIiwic2luZ2xlSW1hZ2VMb2FkZWQiLCJpbWFnZSIsIkltYWdlIiwiZXZlbnRzIiwib25lIiwibWUiLCJldmVudCIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX2tleWJvYXJkX18iLCJLZXlib2FyZCIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX2NvcmVfX19kZWZhdWx0Iiwia2V5Q29kZXMiLCJjb21tYW5kcyIsImZpbmRGb2N1c2FibGUiLCJmaWx0ZXIiLCJwYXJzZUtleSIsIndoaWNoIiwia2V5Q29kZSIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsInRvVXBwZXJDYXNlIiwic2hpZnRLZXkiLCJjdHJsS2V5IiwiYWx0S2V5IiwiZ2V0S2V5Q29kZXMiLCJoYW5kbGVLZXkiLCJjb21wb25lbnQiLCJmdW5jdGlvbnMiLCJjb21tYW5kTGlzdCIsImNtZHMiLCJjb21tYW5kIiwibHRyIiwiZXh0ZW5kIiwicmV0dXJuVmFsdWUiLCJoYW5kbGVkIiwidW5oYW5kbGVkIiwicmVnaXN0ZXIiLCJjb21wb25lbnROYW1lIiwidHJhcEZvY3VzIiwiJGZvY3VzYWJsZSIsIiRmaXJzdEZvY3VzYWJsZSIsImVxIiwiJGxhc3RGb2N1c2FibGUiLCJwcmV2ZW50RGVmYXVsdCIsImZvY3VzIiwicmVsZWFzZUZvY3VzIiwia2NzIiwia2MiLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fdXRpbF9tZWRpYVF1ZXJ5X18iLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fdXRpbF9tb3Rpb25fXyIsIk1vdGlvbiIsIk1vdmUiLCJpbml0Q2xhc3NlcyIsImFjdGl2ZUNsYXNzZXMiLCJhbmltYXRlSW4iLCJhbmltYXRpb24iLCJjYiIsImFuaW1hdGUiLCJhbmltYXRlT3V0IiwiZHVyYXRpb24iLCJhbmltIiwicHJvZyIsIm1vdmUiLCJ0cyIsImlzSW4iLCJpbml0Q2xhc3MiLCJhY3RpdmVDbGFzcyIsInJlc2V0IiwiYWRkQ2xhc3MiLCJzaG93IiwiZmluaXNoIiwiaGlkZSIsInRyYW5zaXRpb25EdXJhdGlvbiIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX25lc3RfXyIsIk5lc3QiLCJGZWF0aGVyIiwibWVudSIsIml0ZW1zIiwic3ViTWVudUNsYXNzIiwic3ViSXRlbUNsYXNzIiwiaGFzU3ViQ2xhc3MiLCJhcHBseUFyaWEiLCIkaXRlbSIsIiRzdWIiLCJjaGlsZHJlbiIsIkJ1cm4iLCJyb2xlIiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfdGltZXJfXyIsIlRpbWVyIiwibmFtZVNwYWNlIiwicmVtYWluIiwiaXNQYXVzZWQiLCJyZXN0YXJ0IiwiaW5maW5pdGUiLCJwYXVzZSIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX3RvdWNoX18iLCJUb3VjaCIsInN0YXJ0UG9zWCIsInN0YXJ0UG9zWSIsInN0YXJ0VGltZSIsImVsYXBzZWRUaW1lIiwiaXNNb3ZpbmciLCJvblRvdWNoRW5kIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIm9uVG91Y2hNb3ZlIiwic3BvdFN3aXBlIiwidG91Y2hlcyIsInBhZ2VYIiwicGFnZVkiLCJkeCIsImR5IiwiZGlyIiwiYWJzIiwibW92ZVRocmVzaG9sZCIsInRpbWVUaHJlc2hvbGQiLCJvblRvdWNoU3RhcnQiLCJhZGRFdmVudExpc3RlbmVyIiwidGVhcmRvd24iLCJTcG90U3dpcGUiLCJlbmFibGVkIiwic3BlY2lhbCIsInN3aXBlIiwic2V0dXAiLCJub29wIiwic2V0dXBTcG90U3dpcGUiLCJzZXR1cFRvdWNoSGFuZGxlciIsImFkZFRvdWNoIiwiaGFuZGxlVG91Y2giLCJjaGFuZ2VkVG91Y2hlcyIsImZpcnN0IiwiZXZlbnRUeXBlcyIsInRvdWNoc3RhcnQiLCJ0b3VjaG1vdmUiLCJ0b3VjaGVuZCIsInNpbXVsYXRlZEV2ZW50IiwiTW91c2VFdmVudCIsInNjcmVlblgiLCJzY3JlZW5ZIiwiY2xpZW50WCIsImNsaWVudFkiLCJpbml0TW91c2VFdmVudCIsImJ1YmJsZXMiLCJjYW5jZWxhYmxlIiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX2pxdWVyeV9fIiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX2pxdWVyeV9fX2RlZmF1bHQiLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzJfX2ZvdW5kYXRpb25fdXRpbF90cmlnZ2Vyc19fIiwiVHJpZ2dlcnMiLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fdXRpbF9tb3Rpb25fX19kZWZhdWx0IiwicHJlZml4ZXMiLCJ0cmlnZ2VycyIsIkxpc3RlbmVycyIsIkJhc2ljIiwiR2xvYmFsIiwiSW5pdGlhbGl6ZXJzIiwib3Blbkxpc3RlbmVyIiwiY2xvc2VMaXN0ZW5lciIsInRvZ2dsZUxpc3RlbmVyIiwiY2xvc2VhYmxlTGlzdGVuZXIiLCJzdG9wUHJvcGFnYXRpb24iLCJmYWRlT3V0IiwidG9nZ2xlRm9jdXNMaXN0ZW5lciIsImFkZE9wZW5MaXN0ZW5lciIsImFkZENsb3NlTGlzdGVuZXIiLCJhZGRUb2dnbGVMaXN0ZW5lciIsImFkZENsb3NlYWJsZUxpc3RlbmVyIiwiYWRkVG9nZ2xlRm9jdXNMaXN0ZW5lciIsInJlc2l6ZUxpc3RlbmVyIiwiJG5vZGVzIiwic2Nyb2xsTGlzdGVuZXIiLCJjbG9zZU1lTGlzdGVuZXIiLCJwbHVnaW5JZCIsIm5vdCIsImFkZENsb3NlbWVMaXN0ZW5lciIsInlldGlCb3hlcyIsInBsdWdOYW1lcyIsImxpc3RlbmVycyIsImpvaW4iLCJkZWJvdW5jZUdsb2JhbExpc3RlbmVyIiwiZGVib3VuY2UiLCJsaXN0ZW5lciIsImFkZFJlc2l6ZUxpc3RlbmVyIiwiYWRkU2Nyb2xsTGlzdGVuZXIiLCJhZGRNdXRhdGlvbkV2ZW50c0xpc3RlbmVyIiwibGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbiIsIm11dGF0aW9uUmVjb3Jkc0xpc3QiLCIkdGFyZ2V0IiwiYXR0cmlidXRlTmFtZSIsImNsb3Nlc3QiLCJlbGVtZW50T2JzZXJ2ZXIiLCJjaGFyYWN0ZXJEYXRhIiwiYXR0cmlidXRlRmlsdGVyIiwiYWRkU2ltcGxlTGlzdGVuZXJzIiwiJGRvY3VtZW50IiwiYWRkR2xvYmFsTGlzdGVuZXJzIiwidHJpZ2dlcnNJbml0aWFsaXplZCIsIklIZWFyWW91IiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX2Ryb3Bkb3duTWVudV9fIiwiRHJvcGRvd25NZW51IiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfa2V5Ym9hcmRfX19kZWZhdWx0IiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8yX19mb3VuZGF0aW9uX3V0aWxfbmVzdF9fIiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8yX19mb3VuZGF0aW9uX3V0aWxfbmVzdF9fX2RlZmF1bHQiLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzNfX2ZvdW5kYXRpb25fdXRpbF9ib3hfXyIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfM19fZm91bmRhdGlvbl91dGlsX2JveF9fX2RlZmF1bHQiLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzRfX2ZvdW5kYXRpb25fdXRpbF9jb3JlX18iLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzRfX2ZvdW5kYXRpb25fdXRpbF9jb3JlX19fZGVmYXVsdCIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNV9fZm91bmRhdGlvbl9wbHVnaW5fXyIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNV9fZm91bmRhdGlvbl9wbHVnaW5fX19kZWZhdWx0IiwiX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4iLCJfaW5oZXJpdHMiLCJzdWJDbGFzcyIsInN1cGVyQ2xhc3MiLCJjcmVhdGUiLCJzZXRQcm90b3R5cGVPZiIsIl9fcHJvdG9fXyIsIl9QbHVnaW4iLCJnZXRQcm90b3R5cGVPZiIsImRlZmF1bHRzIiwic3VicyIsIiRtZW51SXRlbXMiLCIkdGFicyIsInZlcnRpY2FsQ2xhc3MiLCJoYXNDbGFzcyIsInJpZ2h0Q2xhc3MiLCJwYXJlbnRzIiwiY2hhbmdlZCIsIl9ldmVudHMiLCJfaXNWZXJ0aWNhbCIsIl9pc1J0bCIsImhhc1RvdWNoIiwib250b3VjaHN0YXJ0IiwicGFyQ2xhc3MiLCJoYW5kbGVDbGlja0ZuIiwicGFyZW50c1VudGlsIiwiaGFzU3ViIiwiaGFzQ2xpY2tlZCIsImNsb3NlT25DbGljayIsImNsaWNrT3BlbiIsImZvcmNlRm9sbG93Iiwic3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uIiwiX2hpZGUiLCJfc2hvdyIsImFkZCIsImNsb3NlT25DbGlja0luc2lkZSIsImRpc2FibGVIb3ZlciIsImhvdmVyRGVsYXkiLCJhdXRvY2xvc2UiLCJjbG9zaW5nVGltZSIsImlzVGFiIiwiaW5kZXgiLCIkZWxlbWVudHMiLCJzaWJsaW5ncyIsIiRwcmV2RWxlbWVudCIsIiRuZXh0RWxlbWVudCIsIm5leHRTaWJsaW5nIiwicHJldlNpYmxpbmciLCJvcGVuU3ViIiwiY2xvc2VTdWIiLCJjbG9zZSIsIm9wZW4iLCJkb3duIiwidXAiLCJuZXh0IiwicHJldmlvdXMiLCJfYWRkQm9keUhhbmRsZXIiLCIkYm9keSIsIiRsaW5rIiwiaWR4IiwiJHNpYnMiLCJjbGVhciIsIm9sZENsYXNzIiwiJHBhcmVudExpIiwiJHRvQ2xvc2UiLCJzb21ldGhpbmdUb0Nsb3NlIiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX29mZmNhbnZhc19fIiwiT2ZmQ2FudmFzIiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8yX19mb3VuZGF0aW9uX3V0aWxfbWVkaWFRdWVyeV9fX2RlZmF1bHQiLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzNfX2ZvdW5kYXRpb25fdXRpbF9jb3JlX18iLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzNfX2ZvdW5kYXRpb25fdXRpbF9jb3JlX19fZGVmYXVsdCIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNF9fZm91bmRhdGlvbl9wbHVnaW5fXyIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNF9fZm91bmRhdGlvbl9wbHVnaW5fX19kZWZhdWx0IiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV81X19mb3VuZGF0aW9uX3V0aWxfdHJpZ2dlcnNfXyIsIl90aGlzMyIsImNvbnRlbnRDbGFzc2VzIiwiYmFzZSIsInJldmVhbCIsIiRsYXN0VHJpZ2dlciIsIiR0cmlnZ2VycyIsIiRjb250ZW50IiwibmVzdGVkIiwiY29udGVudElkIiwidHJhbnNpdGlvbiIsIm1hdGNoIiwiY29udGVudE92ZXJsYXkiLCJvdmVybGF5Iiwib3ZlcmxheVBvc2l0aW9uIiwiJG92ZXJsYXkiLCJpbnNlcnRBZnRlciIsImFwcGVuZCIsImlzUmV2ZWFsZWQiLCJyZXZlYWxDbGFzcyIsInJldmVhbE9uIiwiX3NldE1RQ2hlY2tlciIsInRyYW5zaXRpb25UaW1lIiwiX3JlbW92ZUNvbnRlbnRDbGFzc2VzIiwidG9nZ2xlIiwiX2hhbmRsZUtleWJvYXJkIiwiaGFzUmV2ZWFsIiwiX2FkZENvbnRlbnRDbGFzc2VzIiwiX3N0b3BTY3JvbGxpbmciLCJfcmVjb3JkU2Nyb2xsYWJsZSIsInNjcm9sbEhlaWdodCIsInNjcm9sbFRvcCIsImFsbG93VXAiLCJhbGxvd0Rvd24iLCJsYXN0WSIsIm9yaWdpbmFsRXZlbnQiLCJfc3RvcFNjcm9sbFByb3BhZ2F0aW9uIiwiZm9yY2VUbyIsInNjcm9sbFRvIiwiY29udGVudFNjcm9sbCIsImF1dG9Gb2N1cyIsImNhbnZhc0ZvY3VzIiwiX3RoaXM0IiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX29yYml0X18iLCJPcmJpdCIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMl9fZm91bmRhdGlvbl91dGlsX21vdGlvbl9fIiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8yX19mb3VuZGF0aW9uX3V0aWxfbW90aW9uX19fZGVmYXVsdCIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfM19fZm91bmRhdGlvbl91dGlsX3RpbWVyX18iLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzNfX2ZvdW5kYXRpb25fdXRpbF90aW1lcl9fX2RlZmF1bHQiLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzRfX2ZvdW5kYXRpb25fdXRpbF9pbWFnZUxvYWRlcl9fIiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV80X19mb3VuZGF0aW9uX3V0aWxfaW1hZ2VMb2FkZXJfX19kZWZhdWx0IiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV81X19mb3VuZGF0aW9uX3V0aWxfY29yZV9fIiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV81X19mb3VuZGF0aW9uX3V0aWxfY29yZV9fX2RlZmF1bHQiLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzZfX2ZvdW5kYXRpb25fcGx1Z2luX18iLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzZfX2ZvdW5kYXRpb25fcGx1Z2luX19fZGVmYXVsdCIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfN19fZm91bmRhdGlvbl91dGlsX3RvdWNoX18iLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzdfX2ZvdW5kYXRpb25fdXRpbF90b3VjaF9fX2RlZmF1bHQiLCJfcmVzZXQiLCIkd3JhcHBlciIsImNvbnRhaW5lckNsYXNzIiwiJHNsaWRlcyIsInNsaWRlQ2xhc3MiLCIkaW1hZ2VzIiwiaW5pdEFjdGl2ZSIsInVzZU1VSSIsIl9wcmVwYXJlRm9yT3JiaXQiLCJidWxsZXRzIiwiX2xvYWRCdWxsZXRzIiwiYXV0b1BsYXkiLCJnZW9TeW5jIiwiYWNjZXNzaWJsZSIsIiRidWxsZXRzIiwiYm94T2ZCdWxsZXRzIiwidGltZXJEZWxheSIsImNoYW5nZVNsaWRlIiwiX3NldFdyYXBwZXJIZWlnaHQiLCJ0ZW1wIiwiY291bnRlciIsIl9zZXRTbGlkZUhlaWdodCIsInBhdXNlT25Ib3ZlciIsIm5hdkJ1dHRvbnMiLCIkY29udHJvbHMiLCJuZXh0Q2xhc3MiLCJwcmV2Q2xhc3MiLCIkc2xpZGUiLCJfdXBkYXRlQnVsbGV0cyIsImlzTFRSIiwiY2hvc2VuU2xpZGUiLCIkY3VyU2xpZGUiLCIkZmlyc3RTbGlkZSIsIiRsYXN0U2xpZGUiLCJsYXN0IiwiZGlySW4iLCJkaXJPdXQiLCIkbmV3U2xpZGUiLCJpbmZpbml0ZVdyYXAiLCJwcmV2IiwiJG9sZEJ1bGxldCIsImJsdXIiLCJzcGFuIiwiZGV0YWNoIiwiJG5ld0J1bGxldCIsImFuaW1JbkZyb21SaWdodCIsImFuaW1PdXRUb1JpZ2h0IiwiYW5pbUluRnJvbUxlZnQiLCJhbmltT3V0VG9MZWZ0IiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3Jlc3BvbnNpdmVNZW51X18iLCJSZXNwb25zaXZlTWVudSIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX21lZGlhUXVlcnlfX19kZWZhdWx0IiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8yX19mb3VuZGF0aW9uX3V0aWxfY29yZV9fX2RlZmF1bHQiLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzNfX2ZvdW5kYXRpb25fcGx1Z2luX19fZGVmYXVsdCIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNF9fZm91bmRhdGlvbl9kcm9wZG93bk1lbnVfXyIsIl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNF9fZm91bmRhdGlvbl9kcm9wZG93bk1lbnVfX19kZWZhdWx0IiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV81X19mb3VuZGF0aW9uX2RyaWxsZG93bl9fIiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV81X19mb3VuZGF0aW9uX2RyaWxsZG93bl9fX2RlZmF1bHQiLCJfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzZfX2ZvdW5kYXRpb25fYWNjb3JkaW9uTWVudV9fIiwiX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV82X19mb3VuZGF0aW9uX2FjY29yZGlvbk1lbnVfX19kZWZhdWx0IiwiTWVudVBsdWdpbnMiLCJkcm9wZG93biIsImNzc0NsYXNzIiwiZHJpbGxkb3duIiwiYWNjb3JkaW9uIiwicnVsZXMiLCJjdXJyZW50TXEiLCJjdXJyZW50UGx1Z2luIiwicnVsZXNUcmVlIiwicnVsZSIsInJ1bGVTaXplIiwicnVsZVBsdWdpbiIsImlzRW1wdHlPYmplY3QiLCJfY2hlY2tNZWRpYVF1ZXJpZXMiLCJtYXRjaGVkTXEiLCJBY2NvcmRpb25NZW51IiwiRHJpbGxkb3duIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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T0MsT0FBUCxHQUFpQixFQUFDNnpCLFdBQVc1ekIsT0FBTytNLFVBQVAsQ0FBa0I2bUIsU0FBOUIsRUFBakI7O0FBRUE7QUFBTyxHQXBSRzs7QUFzUlYsT0FBTTtBQUNOLE9BQU8sV0FBUzl6QixNQUFULEVBQWlCQyxPQUFqQixFQUEwQjs7QUFFakNELFdBQU9DLE9BQVAsR0FBaUIsRUFBQ3FtQixjQUFjcG1CLE9BQU8rTSxVQUFQLENBQWtCcVosWUFBakMsRUFBakI7O0FBRUE7QUFBTyxHQTNSRzs7QUE2UlYsT0FBTTtBQUNOLE9BQU8sV0FBU3RtQixNQUFULEVBQWlCQyxPQUFqQixFQUEwQnFLLG1CQUExQixFQUErQzs7QUFFdER0SyxXQUFPQyxPQUFQLEdBQWlCcUssb0JBQW9CLEVBQXBCLENBQWpCOztBQUdBO0FBQU87O0FBRVAsVUFyU1UsRUFwRUQ7OztBQ0FULENBQUMsVUFBU3ZELENBQVQsRUFBWTtBQUNUQSxNQUFFakgsUUFBRixFQUFZc1AsVUFBWjtBQUNILENBRkQsRUFFRzlELE1BRkgiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiB3aGF0LWlucHV0IC0gQSBnbG9iYWwgdXRpbGl0eSBmb3IgdHJhY2tpbmcgdGhlIGN1cnJlbnQgaW5wdXQgbWV0aG9kIChtb3VzZSwga2V5Ym9hcmQgb3IgdG91Y2gpLlxuICogQHZlcnNpb24gdjQuMy4xXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vdGVuMXNldmVuL3doYXQtaW5wdXRcbiAqIEBsaWNlbnNlIE1JVFxuICovXG4oZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShcIndoYXRJbnB1dFwiLCBbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJ3aGF0SW5wdXRcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wid2hhdElucHV0XCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gLyoqKioqKi8gKGZ1bmN0aW9uKG1vZHVsZXMpIHsgLy8gd2VicGFja0Jvb3RzdHJhcFxuLyoqKioqKi8gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4vKioqKioqLyBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0ZXhwb3J0czoge30sXG4vKioqKioqLyBcdFx0XHRpZDogbW9kdWxlSWQsXG4vKioqKioqLyBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4vKioqKioqLyBcdFx0fTtcblxuLyoqKioqKi8gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuLyoqKioqKi8gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4vKioqKioqLyBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuLyoqKioqKi8gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4vKioqKioqLyBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbi8qKioqKiovIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdH1cblxuXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuLyoqKioqKi8gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4vKioqKioqLyBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbi8qKioqKiovIH0pXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gKFtcbi8qIDAgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5cdCd1c2Ugc3RyaWN0JztcblxuXHRtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblx0ICAvKlxuXHQgICAqIHZhcmlhYmxlc1xuXHQgICAqL1xuXG5cdCAgLy8gbGFzdCB1c2VkIGlucHV0IHR5cGVcblx0ICB2YXIgY3VycmVudElucHV0ID0gJ2luaXRpYWwnO1xuXG5cdCAgLy8gbGFzdCB1c2VkIGlucHV0IGludGVudFxuXHQgIHZhciBjdXJyZW50SW50ZW50ID0gbnVsbDtcblxuXHQgIC8vIGNhY2hlIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudFxuXHQgIHZhciBkb2MgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cblx0ICAvLyBmb3JtIGlucHV0IHR5cGVzXG5cdCAgdmFyIGZvcm1JbnB1dHMgPSBbJ2lucHV0JywgJ3NlbGVjdCcsICd0ZXh0YXJlYSddO1xuXG5cdCAgdmFyIGZ1bmN0aW9uTGlzdCA9IFtdO1xuXG5cdCAgLy8gbGlzdCBvZiBtb2RpZmllciBrZXlzIGNvbW1vbmx5IHVzZWQgd2l0aCB0aGUgbW91c2UgYW5kXG5cdCAgLy8gY2FuIGJlIHNhZmVseSBpZ25vcmVkIHRvIHByZXZlbnQgZmFsc2Uga2V5Ym9hcmQgZGV0ZWN0aW9uXG5cdCAgdmFyIGlnbm9yZU1hcCA9IFsxNiwgLy8gc2hpZnRcblx0ICAxNywgLy8gY29udHJvbFxuXHQgIDE4LCAvLyBhbHRcblx0ICA5MSwgLy8gV2luZG93cyBrZXkgLyBsZWZ0IEFwcGxlIGNtZFxuXHQgIDkzIC8vIFdpbmRvd3MgbWVudSAvIHJpZ2h0IEFwcGxlIGNtZFxuXHQgIF07XG5cblx0ICAvLyBsaXN0IG9mIGtleXMgZm9yIHdoaWNoIHdlIGNoYW5nZSBpbnRlbnQgZXZlbiBmb3IgZm9ybSBpbnB1dHNcblx0ICB2YXIgY2hhbmdlSW50ZW50TWFwID0gWzkgLy8gdGFiXG5cdCAgXTtcblxuXHQgIC8vIG1hcHBpbmcgb2YgZXZlbnRzIHRvIGlucHV0IHR5cGVzXG5cdCAgdmFyIGlucHV0TWFwID0ge1xuXHQgICAga2V5ZG93bjogJ2tleWJvYXJkJyxcblx0ICAgIGtleXVwOiAna2V5Ym9hcmQnLFxuXHQgICAgbW91c2Vkb3duOiAnbW91c2UnLFxuXHQgICAgbW91c2Vtb3ZlOiAnbW91c2UnLFxuXHQgICAgTVNQb2ludGVyRG93bjogJ3BvaW50ZXInLFxuXHQgICAgTVNQb2ludGVyTW92ZTogJ3BvaW50ZXInLFxuXHQgICAgcG9pbnRlcmRvd246ICdwb2ludGVyJyxcblx0ICAgIHBvaW50ZXJtb3ZlOiAncG9pbnRlcicsXG5cdCAgICB0b3VjaHN0YXJ0OiAndG91Y2gnXG5cdCAgfTtcblxuXHQgIC8vIGFycmF5IG9mIGFsbCB1c2VkIGlucHV0IHR5cGVzXG5cdCAgdmFyIGlucHV0VHlwZXMgPSBbXTtcblxuXHQgIC8vIGJvb2xlYW46IHRydWUgaWYgdG91Y2ggYnVmZmVyIGlzIGFjdGl2ZVxuXHQgIHZhciBpc0J1ZmZlcmluZyA9IGZhbHNlO1xuXG5cdCAgLy8gYm9vbGVhbjogdHJ1ZSBpZiB0aGUgcGFnZSBpcyBiZWluZyBzY3JvbGxlZFxuXHQgIHZhciBpc1Njcm9sbGluZyA9IGZhbHNlO1xuXG5cdCAgLy8gc3RvcmUgY3VycmVudCBtb3VzZSBwb3NpdGlvblxuXHQgIHZhciBtb3VzZVBvcyA9IHtcblx0ICAgIHg6IG51bGwsXG5cdCAgICB5OiBudWxsXG5cdCAgfTtcblxuXHQgIC8vIG1hcCBvZiBJRSAxMCBwb2ludGVyIGV2ZW50c1xuXHQgIHZhciBwb2ludGVyTWFwID0ge1xuXHQgICAgMjogJ3RvdWNoJyxcblx0ICAgIDM6ICd0b3VjaCcsIC8vIHRyZWF0IHBlbiBsaWtlIHRvdWNoXG5cdCAgICA0OiAnbW91c2UnXG5cdCAgfTtcblxuXHQgIHZhciBzdXBwb3J0c1Bhc3NpdmUgPSBmYWxzZTtcblxuXHQgIHRyeSB7XG5cdCAgICB2YXIgb3B0cyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ3Bhc3NpdmUnLCB7XG5cdCAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuXHQgICAgICAgIHN1cHBvcnRzUGFzc2l2ZSA9IHRydWU7XG5cdCAgICAgIH1cblx0ICAgIH0pO1xuXG5cdCAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndGVzdCcsIG51bGwsIG9wdHMpO1xuXHQgIH0gY2F0Y2ggKGUpIHt9XG5cblx0ICAvKlxuXHQgICAqIHNldCB1cFxuXHQgICAqL1xuXG5cdCAgdmFyIHNldFVwID0gZnVuY3Rpb24gc2V0VXAoKSB7XG5cdCAgICAvLyBhZGQgY29ycmVjdCBtb3VzZSB3aGVlbCBldmVudCBtYXBwaW5nIHRvIGBpbnB1dE1hcGBcblx0ICAgIGlucHV0TWFwW2RldGVjdFdoZWVsKCldID0gJ21vdXNlJztcblxuXHQgICAgYWRkTGlzdGVuZXJzKCk7XG5cdCAgICBzZXRJbnB1dCgpO1xuXHQgIH07XG5cblx0ICAvKlxuXHQgICAqIGV2ZW50c1xuXHQgICAqL1xuXG5cdCAgdmFyIGFkZExpc3RlbmVycyA9IGZ1bmN0aW9uIGFkZExpc3RlbmVycygpIHtcblx0ICAgIC8vIGBwb2ludGVybW92ZWAsIGBNU1BvaW50ZXJNb3ZlYCwgYG1vdXNlbW92ZWAgYW5kIG1vdXNlIHdoZWVsIGV2ZW50IGJpbmRpbmdcblx0ICAgIC8vIGNhbiBvbmx5IGRlbW9uc3RyYXRlIHBvdGVudGlhbCwgYnV0IG5vdCBhY3R1YWwsIGludGVyYWN0aW9uXG5cdCAgICAvLyBhbmQgYXJlIHRyZWF0ZWQgc2VwYXJhdGVseVxuXHQgICAgdmFyIG9wdGlvbnMgPSBzdXBwb3J0c1Bhc3NpdmUgPyB7IHBhc3NpdmU6IHRydWUgfSA6IGZhbHNlO1xuXG5cdCAgICAvLyBwb2ludGVyIGV2ZW50cyAobW91c2UsIHBlbiwgdG91Y2gpXG5cdCAgICBpZiAod2luZG93LlBvaW50ZXJFdmVudCkge1xuXHQgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHNldEludGVudCk7XG5cdCAgICB9IGVsc2UgaWYgKHdpbmRvdy5NU1BvaW50ZXJFdmVudCkge1xuXHQgICAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyRG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ01TUG9pbnRlck1vdmUnLCBzZXRJbnRlbnQpO1xuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgLy8gbW91c2UgZXZlbnRzXG5cdCAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBzZXRJbnRlbnQpO1xuXG5cdCAgICAgIC8vIHRvdWNoIGV2ZW50c1xuXHQgICAgICBpZiAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSB7XG5cdCAgICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0b3VjaEJ1ZmZlciwgb3B0aW9ucyk7XG5cdCAgICAgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdG91Y2hCdWZmZXIpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cblx0ICAgIC8vIG1vdXNlIHdoZWVsXG5cdCAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcihkZXRlY3RXaGVlbCgpLCBzZXRJbnRlbnQsIG9wdGlvbnMpO1xuXG5cdCAgICAvLyBrZXlib2FyZCBldmVudHNcblx0ICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdXBkYXRlSW5wdXQpO1xuXHQgIH07XG5cblx0ICAvLyBjaGVja3MgY29uZGl0aW9ucyBiZWZvcmUgdXBkYXRpbmcgbmV3IGlucHV0XG5cdCAgdmFyIHVwZGF0ZUlucHV0ID0gZnVuY3Rpb24gdXBkYXRlSW5wdXQoZXZlbnQpIHtcblx0ICAgIC8vIG9ubHkgZXhlY3V0ZSBpZiB0aGUgdG91Y2ggYnVmZmVyIHRpbWVyIGlzbid0IHJ1bm5pbmdcblx0ICAgIGlmICghaXNCdWZmZXJpbmcpIHtcblx0ICAgICAgdmFyIGV2ZW50S2V5ID0gZXZlbnQud2hpY2g7XG5cdCAgICAgIHZhciB2YWx1ZSA9IGlucHV0TWFwW2V2ZW50LnR5cGVdO1xuXHQgICAgICBpZiAodmFsdWUgPT09ICdwb2ludGVyJykgdmFsdWUgPSBwb2ludGVyVHlwZShldmVudCk7XG5cblx0ICAgICAgaWYgKGN1cnJlbnRJbnB1dCAhPT0gdmFsdWUgfHwgY3VycmVudEludGVudCAhPT0gdmFsdWUpIHtcblx0ICAgICAgICB2YXIgYWN0aXZlRWxlbSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cdCAgICAgICAgdmFyIGFjdGl2ZUlucHV0ID0gZmFsc2U7XG5cdCAgICAgICAgdmFyIG5vdEZvcm1JbnB1dCA9IGFjdGl2ZUVsZW0gJiYgYWN0aXZlRWxlbS5ub2RlTmFtZSAmJiBmb3JtSW5wdXRzLmluZGV4T2YoYWN0aXZlRWxlbS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKSA9PT0gLTE7XG5cblx0ICAgICAgICBpZiAobm90Rm9ybUlucHV0IHx8IGNoYW5nZUludGVudE1hcC5pbmRleE9mKGV2ZW50S2V5KSAhPT0gLTEpIHtcblx0ICAgICAgICAgIGFjdGl2ZUlucHV0ID0gdHJ1ZTtcblx0ICAgICAgICB9XG5cblx0ICAgICAgICBpZiAodmFsdWUgPT09ICd0b3VjaCcgfHxcblx0ICAgICAgICAvLyBpZ25vcmUgbW91c2UgbW9kaWZpZXIga2V5c1xuXHQgICAgICAgIHZhbHVlID09PSAnbW91c2UnIHx8XG5cdCAgICAgICAgLy8gZG9uJ3Qgc3dpdGNoIGlmIHRoZSBjdXJyZW50IGVsZW1lbnQgaXMgYSBmb3JtIGlucHV0XG5cdCAgICAgICAgdmFsdWUgPT09ICdrZXlib2FyZCcgJiYgZXZlbnRLZXkgJiYgYWN0aXZlSW5wdXQgJiYgaWdub3JlTWFwLmluZGV4T2YoZXZlbnRLZXkpID09PSAtMSkge1xuXHQgICAgICAgICAgLy8gc2V0IHRoZSBjdXJyZW50IGFuZCBjYXRjaC1hbGwgdmFyaWFibGVcblx0ICAgICAgICAgIGN1cnJlbnRJbnB1dCA9IGN1cnJlbnRJbnRlbnQgPSB2YWx1ZTtcblxuXHQgICAgICAgICAgc2V0SW5wdXQoKTtcblx0ICAgICAgICB9XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLy8gdXBkYXRlcyB0aGUgZG9jIGFuZCBgaW5wdXRUeXBlc2AgYXJyYXkgd2l0aCBuZXcgaW5wdXRcblx0ICB2YXIgc2V0SW5wdXQgPSBmdW5jdGlvbiBzZXRJbnB1dCgpIHtcblx0ICAgIGRvYy5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdGlucHV0JywgY3VycmVudElucHV0KTtcblx0ICAgIGRvYy5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdGludGVudCcsIGN1cnJlbnRJbnB1dCk7XG5cblx0ICAgIGlmIChpbnB1dFR5cGVzLmluZGV4T2YoY3VycmVudElucHV0KSA9PT0gLTEpIHtcblx0ICAgICAgaW5wdXRUeXBlcy5wdXNoKGN1cnJlbnRJbnB1dCk7XG5cdCAgICAgIGRvYy5jbGFzc05hbWUgKz0gJyB3aGF0aW5wdXQtdHlwZXMtJyArIGN1cnJlbnRJbnB1dDtcblx0ICAgIH1cblxuXHQgICAgZmlyZUZ1bmN0aW9ucygnaW5wdXQnKTtcblx0ICB9O1xuXG5cdCAgLy8gdXBkYXRlcyBpbnB1dCBpbnRlbnQgZm9yIGBtb3VzZW1vdmVgIGFuZCBgcG9pbnRlcm1vdmVgXG5cdCAgdmFyIHNldEludGVudCA9IGZ1bmN0aW9uIHNldEludGVudChldmVudCkge1xuXHQgICAgLy8gdGVzdCB0byBzZWUgaWYgYG1vdXNlbW92ZWAgaGFwcGVuZWQgcmVsYXRpdmUgdG8gdGhlIHNjcmVlblxuXHQgICAgLy8gdG8gZGV0ZWN0IHNjcm9sbGluZyB2ZXJzdXMgbW91c2Vtb3ZlXG5cdCAgICBpZiAobW91c2VQb3NbJ3gnXSAhPT0gZXZlbnQuc2NyZWVuWCB8fCBtb3VzZVBvc1sneSddICE9PSBldmVudC5zY3JlZW5ZKSB7XG5cdCAgICAgIGlzU2Nyb2xsaW5nID0gZmFsc2U7XG5cblx0ICAgICAgbW91c2VQb3NbJ3gnXSA9IGV2ZW50LnNjcmVlblg7XG5cdCAgICAgIG1vdXNlUG9zWyd5J10gPSBldmVudC5zY3JlZW5ZO1xuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgaXNTY3JvbGxpbmcgPSB0cnVlO1xuXHQgICAgfVxuXG5cdCAgICAvLyBvbmx5IGV4ZWN1dGUgaWYgdGhlIHRvdWNoIGJ1ZmZlciB0aW1lciBpc24ndCBydW5uaW5nXG5cdCAgICAvLyBvciBzY3JvbGxpbmcgaXNuJ3QgaGFwcGVuaW5nXG5cdCAgICBpZiAoIWlzQnVmZmVyaW5nICYmICFpc1Njcm9sbGluZykge1xuXHQgICAgICB2YXIgdmFsdWUgPSBpbnB1dE1hcFtldmVudC50eXBlXTtcblx0ICAgICAgaWYgKHZhbHVlID09PSAncG9pbnRlcicpIHZhbHVlID0gcG9pbnRlclR5cGUoZXZlbnQpO1xuXG5cdCAgICAgIGlmIChjdXJyZW50SW50ZW50ICE9PSB2YWx1ZSkge1xuXHQgICAgICAgIGN1cnJlbnRJbnRlbnQgPSB2YWx1ZTtcblxuXHQgICAgICAgIGRvYy5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdGludGVudCcsIGN1cnJlbnRJbnRlbnQpO1xuXG5cdCAgICAgICAgZmlyZUZ1bmN0aW9ucygnaW50ZW50Jyk7XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLy8gYnVmZmVycyB0b3VjaCBldmVudHMgYmVjYXVzZSB0aGV5IGZyZXF1ZW50bHkgYWxzbyBmaXJlIG1vdXNlIGV2ZW50c1xuXHQgIHZhciB0b3VjaEJ1ZmZlciA9IGZ1bmN0aW9uIHRvdWNoQnVmZmVyKGV2ZW50KSB7XG5cdCAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ3RvdWNoc3RhcnQnKSB7XG5cdCAgICAgIGlzQnVmZmVyaW5nID0gZmFsc2U7XG5cblx0ICAgICAgLy8gc2V0IHRoZSBjdXJyZW50IGlucHV0XG5cdCAgICAgIHVwZGF0ZUlucHV0KGV2ZW50KTtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIGlzQnVmZmVyaW5nID0gdHJ1ZTtcblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgdmFyIGZpcmVGdW5jdGlvbnMgPSBmdW5jdGlvbiBmaXJlRnVuY3Rpb25zKHR5cGUpIHtcblx0ICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBmdW5jdGlvbkxpc3QubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0ICAgICAgaWYgKGZ1bmN0aW9uTGlzdFtpXS50eXBlID09PSB0eXBlKSB7XG5cdCAgICAgICAgZnVuY3Rpb25MaXN0W2ldLmZuLmNhbGwodW5kZWZpbmVkLCBjdXJyZW50SW50ZW50KTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvKlxuXHQgICAqIHV0aWxpdGllc1xuXHQgICAqL1xuXG5cdCAgdmFyIHBvaW50ZXJUeXBlID0gZnVuY3Rpb24gcG9pbnRlclR5cGUoZXZlbnQpIHtcblx0ICAgIGlmICh0eXBlb2YgZXZlbnQucG9pbnRlclR5cGUgPT09ICdudW1iZXInKSB7XG5cdCAgICAgIHJldHVybiBwb2ludGVyTWFwW2V2ZW50LnBvaW50ZXJUeXBlXTtcblx0ICAgIH0gZWxzZSB7XG5cdCAgICAgIC8vIHRyZWF0IHBlbiBsaWtlIHRvdWNoXG5cdCAgICAgIHJldHVybiBldmVudC5wb2ludGVyVHlwZSA9PT0gJ3BlbicgPyAndG91Y2gnIDogZXZlbnQucG9pbnRlclR5cGU7XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIGRldGVjdCB2ZXJzaW9uIG9mIG1vdXNlIHdoZWVsIGV2ZW50IHRvIHVzZVxuXHQgIC8vIHZpYSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9FdmVudHMvd2hlZWxcblx0ICB2YXIgZGV0ZWN0V2hlZWwgPSBmdW5jdGlvbiBkZXRlY3RXaGVlbCgpIHtcblx0ICAgIHZhciB3aGVlbFR5cGUgPSB2b2lkIDA7XG5cblx0ICAgIC8vIE1vZGVybiBicm93c2VycyBzdXBwb3J0IFwid2hlZWxcIlxuXHQgICAgaWYgKCdvbndoZWVsJyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSkge1xuXHQgICAgICB3aGVlbFR5cGUgPSAnd2hlZWwnO1xuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgLy8gV2Via2l0IGFuZCBJRSBzdXBwb3J0IGF0IGxlYXN0IFwibW91c2V3aGVlbFwiXG5cdCAgICAgIC8vIG9yIGFzc3VtZSB0aGF0IHJlbWFpbmluZyBicm93c2VycyBhcmUgb2xkZXIgRmlyZWZveFxuXHQgICAgICB3aGVlbFR5cGUgPSBkb2N1bWVudC5vbm1vdXNld2hlZWwgIT09IHVuZGVmaW5lZCA/ICdtb3VzZXdoZWVsJyA6ICdET01Nb3VzZVNjcm9sbCc7XG5cdCAgICB9XG5cblx0ICAgIHJldHVybiB3aGVlbFR5cGU7XG5cdCAgfTtcblxuXHQgIHZhciBvYmpQb3MgPSBmdW5jdGlvbiBvYmpQb3MobWF0Y2gpIHtcblx0ICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBmdW5jdGlvbkxpc3QubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcblx0ICAgICAgaWYgKGZ1bmN0aW9uTGlzdFtpXS5mbiA9PT0gbWF0Y2gpIHtcblx0ICAgICAgICByZXR1cm4gaTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvKlxuXHQgICAqIGluaXRcblx0ICAgKi9cblxuXHQgIC8vIGRvbid0IHN0YXJ0IHNjcmlwdCB1bmxlc3MgYnJvd3NlciBjdXRzIHRoZSBtdXN0YXJkXG5cdCAgLy8gKGFsc28gcGFzc2VzIGlmIHBvbHlmaWxscyBhcmUgdXNlZClcblx0ICBpZiAoJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbmRvdyAmJiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xuXHQgICAgc2V0VXAoKTtcblx0ICB9XG5cblx0ICAvKlxuXHQgICAqIGFwaVxuXHQgICAqL1xuXG5cdCAgcmV0dXJuIHtcblx0ICAgIC8vIHJldHVybnMgc3RyaW5nOiB0aGUgY3VycmVudCBpbnB1dCB0eXBlXG5cdCAgICAvLyBvcHQ6ICdsb29zZSd8J3N0cmljdCdcblx0ICAgIC8vICdzdHJpY3QnIChkZWZhdWx0KTogcmV0dXJucyB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgYGRhdGEtd2hhdGlucHV0YCBhdHRyaWJ1dGVcblx0ICAgIC8vICdsb29zZSc6IGluY2x1ZGVzIGBkYXRhLXdoYXRpbnRlbnRgIHZhbHVlIGlmIGl0J3MgbW9yZSBjdXJyZW50IHRoYW4gYGRhdGEtd2hhdGlucHV0YFxuXHQgICAgYXNrOiBmdW5jdGlvbiBhc2sob3B0KSB7XG5cdCAgICAgIHJldHVybiBvcHQgPT09ICdsb29zZScgPyBjdXJyZW50SW50ZW50IDogY3VycmVudElucHV0O1xuXHQgICAgfSxcblxuXHQgICAgLy8gcmV0dXJucyBhcnJheTogYWxsIHRoZSBkZXRlY3RlZCBpbnB1dCB0eXBlc1xuXHQgICAgdHlwZXM6IGZ1bmN0aW9uIHR5cGVzKCkge1xuXHQgICAgICByZXR1cm4gaW5wdXRUeXBlcztcblx0ICAgIH0sXG5cblx0ICAgIC8vIG92ZXJ3cml0ZXMgaWdub3JlZCBrZXlzIHdpdGggcHJvdmlkZWQgYXJyYXlcblx0ICAgIGlnbm9yZUtleXM6IGZ1bmN0aW9uIGlnbm9yZUtleXMoYXJyKSB7XG5cdCAgICAgIGlnbm9yZU1hcCA9IGFycjtcblx0ICAgIH0sXG5cblx0ICAgIC8vIGF0dGFjaCBmdW5jdGlvbnMgdG8gaW5wdXQgYW5kIGludGVudCBcImV2ZW50c1wiXG5cdCAgICAvLyBmdW5jdDogZnVuY3Rpb24gdG8gZmlyZSBvbiBjaGFuZ2Vcblx0ICAgIC8vIGV2ZW50VHlwZTogJ2lucHV0J3wnaW50ZW50J1xuXHQgICAgcmVnaXN0ZXJPbkNoYW5nZTogZnVuY3Rpb24gcmVnaXN0ZXJPbkNoYW5nZShmbiwgZXZlbnRUeXBlKSB7XG5cdCAgICAgIGZ1bmN0aW9uTGlzdC5wdXNoKHtcblx0ICAgICAgICBmbjogZm4sXG5cdCAgICAgICAgdHlwZTogZXZlbnRUeXBlIHx8ICdpbnB1dCdcblx0ICAgICAgfSk7XG5cdCAgICB9LFxuXG5cdCAgICB1blJlZ2lzdGVyT25DaGFuZ2U6IGZ1bmN0aW9uIHVuUmVnaXN0ZXJPbkNoYW5nZShmbikge1xuXHQgICAgICB2YXIgcG9zaXRpb24gPSBvYmpQb3MoZm4pO1xuXG5cdCAgICAgIGlmIChwb3NpdGlvbikge1xuXHQgICAgICAgIGZ1bmN0aW9uTGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblx0fSgpO1xuXG4vKioqLyB9XG4vKioqKioqLyBdKVxufSk7XG47IiwiLyohIGxhenlzaXplcyAtIHYzLjAuMCAqL1xuIWZ1bmN0aW9uKGEsYil7dmFyIGM9YihhLGEuZG9jdW1lbnQpO2EubGF6eVNpemVzPWMsXCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHMmJihtb2R1bGUuZXhwb3J0cz1jKX0od2luZG93LGZ1bmN0aW9uKGEsYil7XCJ1c2Ugc3RyaWN0XCI7aWYoYi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKXt2YXIgYyxkPWIuZG9jdW1lbnRFbGVtZW50LGU9YS5EYXRlLGY9YS5IVE1MUGljdHVyZUVsZW1lbnQsZz1cImFkZEV2ZW50TGlzdGVuZXJcIixoPVwiZ2V0QXR0cmlidXRlXCIsaT1hW2ddLGo9YS5zZXRUaW1lb3V0LGs9YS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fGosbD1hLnJlcXVlc3RJZGxlQ2FsbGJhY2ssbT0vXnBpY3R1cmUkL2ksbj1bXCJsb2FkXCIsXCJlcnJvclwiLFwibGF6eWluY2x1ZGVkXCIsXCJfbGF6eWxvYWRlZFwiXSxvPXt9LHA9QXJyYXkucHJvdG90eXBlLmZvckVhY2gscT1mdW5jdGlvbihhLGIpe3JldHVybiBvW2JdfHwob1tiXT1uZXcgUmVnRXhwKFwiKFxcXFxzfF4pXCIrYitcIihcXFxcc3wkKVwiKSksb1tiXS50ZXN0KGFbaF0oXCJjbGFzc1wiKXx8XCJcIikmJm9bYl19LHI9ZnVuY3Rpb24oYSxiKXtxKGEsYil8fGEuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwoYVtoXShcImNsYXNzXCIpfHxcIlwiKS50cmltKCkrXCIgXCIrYil9LHM9ZnVuY3Rpb24oYSxiKXt2YXIgYzsoYz1xKGEsYikpJiZhLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsKGFbaF0oXCJjbGFzc1wiKXx8XCJcIikucmVwbGFjZShjLFwiIFwiKSl9LHQ9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPWM/ZzpcInJlbW92ZUV2ZW50TGlzdGVuZXJcIjtjJiZ0KGEsYiksbi5mb3JFYWNoKGZ1bmN0aW9uKGMpe2FbZF0oYyxiKX0pfSx1PWZ1bmN0aW9uKGEsYyxkLGUsZil7dmFyIGc9Yi5jcmVhdGVFdmVudChcIkN1c3RvbUV2ZW50XCIpO3JldHVybiBnLmluaXRDdXN0b21FdmVudChjLCFlLCFmLGR8fHt9KSxhLmRpc3BhdGNoRXZlbnQoZyksZ30sdj1mdW5jdGlvbihiLGQpe3ZhciBlOyFmJiYoZT1hLnBpY3R1cmVmaWxsfHxjLnBmKT9lKHtyZWV2YWx1YXRlOiEwLGVsZW1lbnRzOltiXX0pOmQmJmQuc3JjJiYoYi5zcmM9ZC5zcmMpfSx3PWZ1bmN0aW9uKGEsYil7cmV0dXJuKGdldENvbXB1dGVkU3R5bGUoYSxudWxsKXx8e30pW2JdfSx4PWZ1bmN0aW9uKGEsYixkKXtmb3IoZD1kfHxhLm9mZnNldFdpZHRoO2Q8Yy5taW5TaXplJiZiJiYhYS5fbGF6eXNpemVzV2lkdGg7KWQ9Yi5vZmZzZXRXaWR0aCxiPWIucGFyZW50Tm9kZTtyZXR1cm4gZH0seT1mdW5jdGlvbigpe3ZhciBhLGMsZD1bXSxlPVtdLGY9ZCxnPWZ1bmN0aW9uKCl7dmFyIGI9Zjtmb3IoZj1kLmxlbmd0aD9lOmQsYT0hMCxjPSExO2IubGVuZ3RoOyliLnNoaWZ0KCkoKTthPSExfSxoPWZ1bmN0aW9uKGQsZSl7YSYmIWU/ZC5hcHBseSh0aGlzLGFyZ3VtZW50cyk6KGYucHVzaChkKSxjfHwoYz0hMCwoYi5oaWRkZW4/ajprKShnKSkpfTtyZXR1cm4gaC5fbHNGbHVzaD1nLGh9KCksej1mdW5jdGlvbihhLGIpe3JldHVybiBiP2Z1bmN0aW9uKCl7eShhKX06ZnVuY3Rpb24oKXt2YXIgYj10aGlzLGM9YXJndW1lbnRzO3koZnVuY3Rpb24oKXthLmFwcGx5KGIsYyl9KX19LEE9ZnVuY3Rpb24oYSl7dmFyIGIsYz0wLGQ9MTI1LGY9NjY2LGc9ZixoPWZ1bmN0aW9uKCl7Yj0hMSxjPWUubm93KCksYSgpfSxpPWw/ZnVuY3Rpb24oKXtsKGgse3RpbWVvdXQ6Z30pLGchPT1mJiYoZz1mKX06eihmdW5jdGlvbigpe2ooaCl9LCEwKTtyZXR1cm4gZnVuY3Rpb24oYSl7dmFyIGY7KGE9YT09PSEwKSYmKGc9NDQpLGJ8fChiPSEwLGY9ZC0oZS5ub3coKS1jKSwwPmYmJihmPTApLGF8fDk+ZiYmbD9pKCk6aihpLGYpKX19LEI9ZnVuY3Rpb24oYSl7dmFyIGIsYyxkPTk5LGY9ZnVuY3Rpb24oKXtiPW51bGwsYSgpfSxnPWZ1bmN0aW9uKCl7dmFyIGE9ZS5ub3coKS1jO2Q+YT9qKGcsZC1hKToobHx8ZikoZil9O3JldHVybiBmdW5jdGlvbigpe2M9ZS5ub3coKSxifHwoYj1qKGcsZCkpfX0sQz1mdW5jdGlvbigpe3ZhciBmLGssbCxuLG8seCxDLEUsRixHLEgsSSxKLEssTCxNPS9eaW1nJC9pLE49L15pZnJhbWUkL2ksTz1cIm9uc2Nyb2xsXCJpbiBhJiYhL2dsZWJvdC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSxQPTAsUT0wLFI9MCxTPS0xLFQ9ZnVuY3Rpb24oYSl7Ui0tLGEmJmEudGFyZ2V0JiZ0KGEudGFyZ2V0LFQpLCghYXx8MD5SfHwhYS50YXJnZXQpJiYoUj0wKX0sVT1mdW5jdGlvbihhLGMpe3ZhciBlLGY9YSxnPVwiaGlkZGVuXCI9PXcoYi5ib2R5LFwidmlzaWJpbGl0eVwiKXx8XCJoaWRkZW5cIiE9dyhhLFwidmlzaWJpbGl0eVwiKTtmb3IoRi09YyxJKz1jLEctPWMsSCs9YztnJiYoZj1mLm9mZnNldFBhcmVudCkmJmYhPWIuYm9keSYmZiE9ZDspZz0odyhmLFwib3BhY2l0eVwiKXx8MSk+MCxnJiZcInZpc2libGVcIiE9dyhmLFwib3ZlcmZsb3dcIikmJihlPWYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksZz1IPmUubGVmdCYmRzxlLnJpZ2h0JiZJPmUudG9wLTEmJkY8ZS5ib3R0b20rMSk7cmV0dXJuIGd9LFY9ZnVuY3Rpb24oKXt2YXIgYSxlLGcsaSxqLG0sbixwLHE7aWYoKG89Yy5sb2FkTW9kZSkmJjg+UiYmKGE9Zi5sZW5ndGgpKXtlPTAsUysrLG51bGw9PUsmJihcImV4cGFuZFwiaW4gY3x8KGMuZXhwYW5kPWQuY2xpZW50SGVpZ2h0PjUwMCYmZC5jbGllbnRXaWR0aD41MDA/NTAwOjM3MCksSj1jLmV4cGFuZCxLPUoqYy5leHBGYWN0b3IpLEs+USYmMT5SJiZTPjImJm8+MiYmIWIuaGlkZGVuPyhRPUssUz0wKTpRPW8+MSYmUz4xJiY2PlI/SjpQO2Zvcig7YT5lO2UrKylpZihmW2VdJiYhZltlXS5fbGF6eVJhY2UpaWYoTylpZigocD1mW2VdW2hdKFwiZGF0YS1leHBhbmRcIikpJiYobT0xKnApfHwobT1RKSxxIT09bSYmKEM9aW5uZXJXaWR0aCttKkwsRT1pbm5lckhlaWdodCttLG49LTEqbSxxPW0pLGc9ZltlXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwoST1nLmJvdHRvbSk+PW4mJihGPWcudG9wKTw9RSYmKEg9Zy5yaWdodCk+PW4qTCYmKEc9Zy5sZWZ0KTw9QyYmKEl8fEh8fEd8fEYpJiYobCYmMz5SJiYhcCYmKDM+b3x8ND5TKXx8VShmW2VdLG0pKSl7aWYoYmEoZltlXSksaj0hMCxSPjkpYnJlYWt9ZWxzZSFqJiZsJiYhaSYmND5SJiY0PlMmJm8+MiYmKGtbMF18fGMucHJlbG9hZEFmdGVyTG9hZCkmJihrWzBdfHwhcCYmKEl8fEh8fEd8fEZ8fFwiYXV0b1wiIT1mW2VdW2hdKGMuc2l6ZXNBdHRyKSkpJiYoaT1rWzBdfHxmW2VdKTtlbHNlIGJhKGZbZV0pO2kmJiFqJiZiYShpKX19LFc9QShWKSxYPWZ1bmN0aW9uKGEpe3IoYS50YXJnZXQsYy5sb2FkZWRDbGFzcykscyhhLnRhcmdldCxjLmxvYWRpbmdDbGFzcyksdChhLnRhcmdldCxaKX0sWT16KFgpLFo9ZnVuY3Rpb24oYSl7WSh7dGFyZ2V0OmEudGFyZ2V0fSl9LCQ9ZnVuY3Rpb24oYSxiKXt0cnl7YS5jb250ZW50V2luZG93LmxvY2F0aW9uLnJlcGxhY2UoYil9Y2F0Y2goYyl7YS5zcmM9Yn19LF89ZnVuY3Rpb24oYSl7dmFyIGIsZCxlPWFbaF0oYy5zcmNzZXRBdHRyKTsoYj1jLmN1c3RvbU1lZGlhW2FbaF0oXCJkYXRhLW1lZGlhXCIpfHxhW2hdKFwibWVkaWFcIildKSYmYS5zZXRBdHRyaWJ1dGUoXCJtZWRpYVwiLGIpLGUmJmEuc2V0QXR0cmlidXRlKFwic3Jjc2V0XCIsZSksYiYmKGQ9YS5wYXJlbnROb2RlLGQuaW5zZXJ0QmVmb3JlKGEuY2xvbmVOb2RlKCksYSksZC5yZW1vdmVDaGlsZChhKSl9LGFhPXooZnVuY3Rpb24oYSxiLGQsZSxmKXt2YXIgZyxpLGssbCxvLHE7KG89dShhLFwibGF6eWJlZm9yZXVudmVpbFwiLGIpKS5kZWZhdWx0UHJldmVudGVkfHwoZSYmKGQ/cihhLGMuYXV0b3NpemVzQ2xhc3MpOmEuc2V0QXR0cmlidXRlKFwic2l6ZXNcIixlKSksaT1hW2hdKGMuc3Jjc2V0QXR0ciksZz1hW2hdKGMuc3JjQXR0ciksZiYmKGs9YS5wYXJlbnROb2RlLGw9ayYmbS50ZXN0KGsubm9kZU5hbWV8fFwiXCIpKSxxPWIuZmlyZXNMb2FkfHxcInNyY1wiaW4gYSYmKGl8fGd8fGwpLG89e3RhcmdldDphfSxxJiYodChhLFQsITApLGNsZWFyVGltZW91dChuKSxuPWooVCwyNTAwKSxyKGEsYy5sb2FkaW5nQ2xhc3MpLHQoYSxaLCEwKSksbCYmcC5jYWxsKGsuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzb3VyY2VcIiksXyksaT9hLnNldEF0dHJpYnV0ZShcInNyY3NldFwiLGkpOmcmJiFsJiYoTi50ZXN0KGEubm9kZU5hbWUpPyQoYSxnKTphLnNyYz1nKSwoaXx8bCkmJnYoYSx7c3JjOmd9KSksYS5fbGF6eVJhY2UmJmRlbGV0ZSBhLl9sYXp5UmFjZSxzKGEsYy5sYXp5Q2xhc3MpLHkoZnVuY3Rpb24oKXsoIXF8fGEuY29tcGxldGUmJmEubmF0dXJhbFdpZHRoPjEpJiYocT9UKG8pOlItLSxYKG8pKX0sITApfSksYmE9ZnVuY3Rpb24oYSl7dmFyIGIsZD1NLnRlc3QoYS5ub2RlTmFtZSksZT1kJiYoYVtoXShjLnNpemVzQXR0cil8fGFbaF0oXCJzaXplc1wiKSksZj1cImF1dG9cIj09ZTsoIWYmJmx8fCFkfHwhYS5zcmMmJiFhLnNyY3NldHx8YS5jb21wbGV0ZXx8cShhLGMuZXJyb3JDbGFzcykpJiYoYj11KGEsXCJsYXp5dW52ZWlscmVhZFwiKS5kZXRhaWwsZiYmRC51cGRhdGVFbGVtKGEsITAsYS5vZmZzZXRXaWR0aCksYS5fbGF6eVJhY2U9ITAsUisrLGFhKGEsYixmLGUsZCkpfSxjYT1mdW5jdGlvbigpe2lmKCFsKXtpZihlLm5vdygpLXg8OTk5KXJldHVybiB2b2lkIGooY2EsOTk5KTt2YXIgYT1CKGZ1bmN0aW9uKCl7Yy5sb2FkTW9kZT0zLFcoKX0pO2w9ITAsYy5sb2FkTW9kZT0zLFcoKSxpKFwic2Nyb2xsXCIsZnVuY3Rpb24oKXszPT1jLmxvYWRNb2RlJiYoYy5sb2FkTW9kZT0yKSxhKCl9LCEwKX19O3JldHVybntfOmZ1bmN0aW9uKCl7eD1lLm5vdygpLGY9Yi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGMubGF6eUNsYXNzKSxrPWIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShjLmxhenlDbGFzcytcIiBcIitjLnByZWxvYWRDbGFzcyksTD1jLmhGYWMsaShcInNjcm9sbFwiLFcsITApLGkoXCJyZXNpemVcIixXLCEwKSxhLk11dGF0aW9uT2JzZXJ2ZXI/bmV3IE11dGF0aW9uT2JzZXJ2ZXIoVykub2JzZXJ2ZShkLHtjaGlsZExpc3Q6ITAsc3VidHJlZTohMCxhdHRyaWJ1dGVzOiEwfSk6KGRbZ10oXCJET01Ob2RlSW5zZXJ0ZWRcIixXLCEwKSxkW2ddKFwiRE9NQXR0ck1vZGlmaWVkXCIsVywhMCksc2V0SW50ZXJ2YWwoVyw5OTkpKSxpKFwiaGFzaGNoYW5nZVwiLFcsITApLFtcImZvY3VzXCIsXCJtb3VzZW92ZXJcIixcImNsaWNrXCIsXCJsb2FkXCIsXCJ0cmFuc2l0aW9uZW5kXCIsXCJhbmltYXRpb25lbmRcIixcIndlYmtpdEFuaW1hdGlvbkVuZFwiXS5mb3JFYWNoKGZ1bmN0aW9uKGEpe2JbZ10oYSxXLCEwKX0pLC9kJHxeYy8udGVzdChiLnJlYWR5U3RhdGUpP2NhKCk6KGkoXCJsb2FkXCIsY2EpLGJbZ10oXCJET01Db250ZW50TG9hZGVkXCIsVyksaihjYSwyZTQpKSxmLmxlbmd0aD8oVigpLHkuX2xzRmx1c2goKSk6VygpfSxjaGVja0VsZW1zOlcsdW52ZWlsOmJhfX0oKSxEPWZ1bmN0aW9uKCl7dmFyIGEsZD16KGZ1bmN0aW9uKGEsYixjLGQpe3ZhciBlLGYsZztpZihhLl9sYXp5c2l6ZXNXaWR0aD1kLGQrPVwicHhcIixhLnNldEF0dHJpYnV0ZShcInNpemVzXCIsZCksbS50ZXN0KGIubm9kZU5hbWV8fFwiXCIpKWZvcihlPWIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzb3VyY2VcIiksZj0wLGc9ZS5sZW5ndGg7Zz5mO2YrKyllW2ZdLnNldEF0dHJpYnV0ZShcInNpemVzXCIsZCk7Yy5kZXRhaWwuZGF0YUF0dHJ8fHYoYSxjLmRldGFpbCl9KSxlPWZ1bmN0aW9uKGEsYixjKXt2YXIgZSxmPWEucGFyZW50Tm9kZTtmJiYoYz14KGEsZixjKSxlPXUoYSxcImxhenliZWZvcmVzaXplc1wiLHt3aWR0aDpjLGRhdGFBdHRyOiEhYn0pLGUuZGVmYXVsdFByZXZlbnRlZHx8KGM9ZS5kZXRhaWwud2lkdGgsYyYmYyE9PWEuX2xhenlzaXplc1dpZHRoJiZkKGEsZixlLGMpKSl9LGY9ZnVuY3Rpb24oKXt2YXIgYixjPWEubGVuZ3RoO2lmKGMpZm9yKGI9MDtjPmI7YisrKWUoYVtiXSl9LGc9QihmKTtyZXR1cm57XzpmdW5jdGlvbigpe2E9Yi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGMuYXV0b3NpemVzQ2xhc3MpLGkoXCJyZXNpemVcIixnKX0sY2hlY2tFbGVtczpnLHVwZGF0ZUVsZW06ZX19KCksRT1mdW5jdGlvbigpe0UuaXx8KEUuaT0hMCxELl8oKSxDLl8oKSl9O3JldHVybiBmdW5jdGlvbigpe3ZhciBiLGQ9e2xhenlDbGFzczpcImxhenlsb2FkXCIsbG9hZGVkQ2xhc3M6XCJsYXp5bG9hZGVkXCIsbG9hZGluZ0NsYXNzOlwibGF6eWxvYWRpbmdcIixwcmVsb2FkQ2xhc3M6XCJsYXp5cHJlbG9hZFwiLGVycm9yQ2xhc3M6XCJsYXp5ZXJyb3JcIixhdXRvc2l6ZXNDbGFzczpcImxhenlhdXRvc2l6ZXNcIixzcmNBdHRyOlwiZGF0YS1zcmNcIixzcmNzZXRBdHRyOlwiZGF0YS1zcmNzZXRcIixzaXplc0F0dHI6XCJkYXRhLXNpemVzXCIsbWluU2l6ZTo0MCxjdXN0b21NZWRpYTp7fSxpbml0OiEwLGV4cEZhY3RvcjoxLjUsaEZhYzouOCxsb2FkTW9kZToyfTtjPWEubGF6eVNpemVzQ29uZmlnfHxhLmxhenlzaXplc0NvbmZpZ3x8e307Zm9yKGIgaW4gZCliIGluIGN8fChjW2JdPWRbYl0pO2EubGF6eVNpemVzQ29uZmlnPWMsaihmdW5jdGlvbigpe2MuaW5pdCYmRSgpfSl9KCkse2NmZzpjLGF1dG9TaXplcjpELGxvYWRlcjpDLGluaXQ6RSx1UDp2LGFDOnIsckM6cyxoQzpxLGZpcmU6dSxnVzp4LHJBRjp5fX19KTsiLCIvKioqKioqLyAoZnVuY3Rpb24obW9kdWxlcykgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbi8qKioqKiovIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuLyoqKioqKi8gXHRcdH1cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdGk6IG1vZHVsZUlkLFxuLyoqKioqKi8gXHRcdFx0bDogZmFsc2UsXG4vKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fVxuLyoqKioqKi8gXHRcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuLyoqKioqKi8gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4vKioqKioqLyBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbi8qKioqKiovIFx0fVxuLyoqKioqKi9cbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9ueSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4vKioqKioqLyBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuLyoqKioqKi8gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbi8qKioqKiovIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbi8qKioqKiovIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbi8qKioqKiovIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbi8qKioqKiovIFx0XHRcdH0pO1xuLyoqKioqKi8gXHRcdH1cbi8qKioqKiovIFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuLyoqKioqKi8gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuLyoqKioqKi8gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbi8qKioqKiovIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4vKioqKioqLyBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuLyoqKioqKi8gXHRcdHJldHVybiBnZXR0ZXI7XG4vKioqKioqLyBcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA2KTtcbi8qKioqKiovIH0pXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gKFtcbi8qIDAgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSBqUXVlcnk7XG5cbi8qKiovIH0pLFxuLyogMSAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgX193ZWJwYWNrX2V4cG9ydHNfXywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcbi8qIGhhcm1vbnkgZXhwb3J0IChiaW5kaW5nKSAqLyBfX3dlYnBhY2tfcmVxdWlyZV9fLmQoX193ZWJwYWNrX2V4cG9ydHNfXywgXCJhXCIsIGZ1bmN0aW9uKCkgeyByZXR1cm4gcnRsOyB9KTtcbi8qIGhhcm1vbnkgZXhwb3J0IChiaW5kaW5nKSAqLyBfX3dlYnBhY2tfcmVxdWlyZV9fLmQoX193ZWJwYWNrX2V4cG9ydHNfXywgXCJiXCIsIGZ1bmN0aW9uKCkgeyByZXR1cm4gR2V0WW9EaWdpdHM7IH0pO1xuLyogaGFybW9ueSBleHBvcnQgKGJpbmRpbmcpICovIF9fd2VicGFja19yZXF1aXJlX18uZChfX3dlYnBhY2tfZXhwb3J0c19fLCBcImNcIiwgZnVuY3Rpb24oKSB7IHJldHVybiB0cmFuc2l0aW9uZW5kOyB9KTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfXyk7XG5cblxuXG5cbi8vIENvcmUgRm91bmRhdGlvbiBVdGlsaXRpZXMsIHV0aWxpemVkIGluIGEgbnVtYmVyIG9mIHBsYWNlcy5cblxuLyoqXG4gKiBSZXR1cm5zIGEgYm9vbGVhbiBmb3IgUlRMIHN1cHBvcnRcbiAqL1xuZnVuY3Rpb24gcnRsKCkge1xuICByZXR1cm4gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSgnaHRtbCcpLmF0dHIoJ2RpcicpID09PSAncnRsJztcbn1cblxuLyoqXG4gKiByZXR1cm5zIGEgcmFuZG9tIGJhc2UtMzYgdWlkIHdpdGggbmFtZXNwYWNpbmdcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aCAtIG51bWJlciBvZiByYW5kb20gYmFzZS0zNiBkaWdpdHMgZGVzaXJlZC4gSW5jcmVhc2UgZm9yIG1vcmUgcmFuZG9tIHN0cmluZ3MuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlIC0gbmFtZSBvZiBwbHVnaW4gdG8gYmUgaW5jb3Jwb3JhdGVkIGluIHVpZCwgb3B0aW9uYWwuXG4gKiBAZGVmYXVsdCB7U3RyaW5nfSAnJyAtIGlmIG5vIHBsdWdpbiBuYW1lIGlzIHByb3ZpZGVkLCBub3RoaW5nIGlzIGFwcGVuZGVkIHRvIHRoZSB1aWQuXG4gKiBAcmV0dXJucyB7U3RyaW5nfSAtIHVuaXF1ZSBpZFxuICovXG5mdW5jdGlvbiBHZXRZb0RpZ2l0cyhsZW5ndGgsIG5hbWVzcGFjZSkge1xuICBsZW5ndGggPSBsZW5ndGggfHwgNjtcbiAgcmV0dXJuIE1hdGgucm91bmQoTWF0aC5wb3coMzYsIGxlbmd0aCArIDEpIC0gTWF0aC5yYW5kb20oKSAqIE1hdGgucG93KDM2LCBsZW5ndGgpKS50b1N0cmluZygzNikuc2xpY2UoMSkgKyAobmFtZXNwYWNlID8gJy0nICsgbmFtZXNwYWNlIDogJycpO1xufVxuXG5mdW5jdGlvbiB0cmFuc2l0aW9uZW5kKCRlbGVtKSB7XG4gIHZhciB0cmFuc2l0aW9ucyA9IHtcbiAgICAndHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAnV2Via2l0VHJhbnNpdGlvbic6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAnTW96VHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAnT1RyYW5zaXRpb24nOiAnb3RyYW5zaXRpb25lbmQnXG4gIH07XG4gIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICBlbmQ7XG5cbiAgZm9yICh2YXIgdCBpbiB0cmFuc2l0aW9ucykge1xuICAgIGlmICh0eXBlb2YgZWxlbS5zdHlsZVt0XSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGVuZCA9IHRyYW5zaXRpb25zW3RdO1xuICAgIH1cbiAgfVxuICBpZiAoZW5kKSB7XG4gICAgcmV0dXJuIGVuZDtcbiAgfSBlbHNlIHtcbiAgICBlbmQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICRlbGVtLnRyaWdnZXJIYW5kbGVyKCd0cmFuc2l0aW9uZW5kJywgWyRlbGVtXSk7XG4gICAgfSwgMSk7XG4gICAgcmV0dXJuICd0cmFuc2l0aW9uZW5kJztcbiAgfVxufVxuXG5cblxuLyoqKi8gfSksXG4vKiAyICovXG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBfX3dlYnBhY2tfZXhwb3J0c19fLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KF9fd2VicGFja19leHBvcnRzX18sIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfXyA9IF9fd2VicGFja19yZXF1aXJlX18oMCk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLm4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fY29yZV9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygzKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzJfX2ZvdW5kYXRpb25fdXRpbF9jb3JlX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfM19fZm91bmRhdGlvbl9wbHVnaW5fXyA9IF9fd2VicGFja19yZXF1aXJlX18oNCk7XG5cblxuXG5fX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fY29yZV9fW1wiYVwiIC8qIEZvdW5kYXRpb24gKi9dLmFkZFRvSnF1ZXJ5KF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0LmEpO1xuXG4vLyBUaGVzZSBhcmUgbm93IHNlcGFyYXRlZCBvdXQsIGJ1dCBoaXN0b3JpY2FsbHkgd2VyZSBhIHBhcnQgb2YgdGhpcyBtb2R1bGUsXG4vLyBhbmQgc2luY2UgdGhpcyBpcyBoZXJlIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSB3ZSBpbmNsdWRlIHRoZW0gaW5cbi8vIHRoaXMgZW50cnkuXG5cbl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl9jb3JlX19bXCJhXCIgLyogRm91bmRhdGlvbiAqL10ucnRsID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8yX19mb3VuZGF0aW9uX3V0aWxfY29yZV9fW1wiYVwiIC8qIHJ0bCAqL107XG5fX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fY29yZV9fW1wiYVwiIC8qIEZvdW5kYXRpb24gKi9dLkdldFlvRGlnaXRzID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8yX19mb3VuZGF0aW9uX3V0aWxfY29yZV9fW1wiYlwiIC8qIEdldFlvRGlnaXRzICovXTtcbl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl9jb3JlX19bXCJhXCIgLyogRm91bmRhdGlvbiAqL10udHJhbnNpdGlvbmVuZCA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMl9fZm91bmRhdGlvbl91dGlsX2NvcmVfX1tcImNcIiAvKiB0cmFuc2l0aW9uZW5kICovXTtcblxuLy8gRXZlcnkgcGx1Z2luIGRlcGVuZHMgb24gcGx1Z2luIG5vdywgd2UgY2FuIGluY2x1ZGUgdGhhdCBvbiB0aGUgY29yZSBmb3IgdGhlXG4vLyBzY3JpcHQgaW5jbHVzaW9uIHBhdGguXG5cblxuX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX2NvcmVfX1tcImFcIiAvKiBGb3VuZGF0aW9uICovXS5QbHVnaW4gPSBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzNfX2ZvdW5kYXRpb25fcGx1Z2luX19bXCJhXCIgLyogUGx1Z2luICovXTtcblxud2luZG93LkZvdW5kYXRpb24gPSBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fY29yZV9fW1wiYVwiIC8qIEZvdW5kYXRpb24gKi9dO1xuXG4vKioqLyB9KSxcbi8qIDMgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIF9fd2VicGFja19leHBvcnRzX18sIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG4vKiBoYXJtb255IGV4cG9ydCAoYmluZGluZykgKi8gX193ZWJwYWNrX3JlcXVpcmVfXy5kKF9fd2VicGFja19leHBvcnRzX18sIFwiYVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIEZvdW5kYXRpb247IH0pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfXyA9IF9fd2VicGFja19yZXF1aXJlX18oMCk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLm4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fdXRpbF9jb3JlX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMl9fZm91bmRhdGlvbl91dGlsX21lZGlhUXVlcnlfXyA9IF9fd2VicGFja19yZXF1aXJlX18oNSk7XG5cblxuXG5cblxuXG52YXIgRk9VTkRBVElPTl9WRVJTSU9OID0gJzYuNC4zJztcblxuLy8gR2xvYmFsIEZvdW5kYXRpb24gb2JqZWN0XG4vLyBUaGlzIGlzIGF0dGFjaGVkIHRvIHRoZSB3aW5kb3csIG9yIHVzZWQgYXMgYSBtb2R1bGUgZm9yIEFNRC9Ccm93c2VyaWZ5XG52YXIgRm91bmRhdGlvbiA9IHtcbiAgdmVyc2lvbjogRk9VTkRBVElPTl9WRVJTSU9OLFxuXG4gIC8qKlxuICAgKiBTdG9yZXMgaW5pdGlhbGl6ZWQgcGx1Z2lucy5cbiAgICovXG4gIF9wbHVnaW5zOiB7fSxcblxuICAvKipcbiAgICogU3RvcmVzIGdlbmVyYXRlZCB1bmlxdWUgaWRzIGZvciBwbHVnaW4gaW5zdGFuY2VzXG4gICAqL1xuICBfdXVpZHM6IFtdLFxuXG4gIC8qKlxuICAgKiBEZWZpbmVzIGEgRm91bmRhdGlvbiBwbHVnaW4sIGFkZGluZyBpdCB0byB0aGUgYEZvdW5kYXRpb25gIG5hbWVzcGFjZSBhbmQgdGhlIGxpc3Qgb2YgcGx1Z2lucyB0byBpbml0aWFsaXplIHdoZW4gcmVmbG93aW5nLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gVGhlIGNvbnN0cnVjdG9yIG9mIHRoZSBwbHVnaW4uXG4gICAqL1xuICBwbHVnaW46IGZ1bmN0aW9uIChwbHVnaW4sIG5hbWUpIHtcbiAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIGFkZGluZyB0byBnbG9iYWwgRm91bmRhdGlvbiBvYmplY3RcbiAgICAvLyBFeGFtcGxlczogRm91bmRhdGlvbi5SZXZlYWwsIEZvdW5kYXRpb24uT2ZmQ2FudmFzXG4gICAgdmFyIGNsYXNzTmFtZSA9IG5hbWUgfHwgZnVuY3Rpb25OYW1lKHBsdWdpbik7XG4gICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBzdG9yaW5nIHRoZSBwbHVnaW4sIGFsc28gdXNlZCB0byBjcmVhdGUgdGhlIGlkZW50aWZ5aW5nIGRhdGEgYXR0cmlidXRlIGZvciB0aGUgcGx1Z2luXG4gICAgLy8gRXhhbXBsZXM6IGRhdGEtcmV2ZWFsLCBkYXRhLW9mZi1jYW52YXNcbiAgICB2YXIgYXR0ck5hbWUgPSBoeXBoZW5hdGUoY2xhc3NOYW1lKTtcblxuICAgIC8vIEFkZCB0byB0aGUgRm91bmRhdGlvbiBvYmplY3QgYW5kIHRoZSBwbHVnaW5zIGxpc3QgKGZvciByZWZsb3dpbmcpXG4gICAgdGhpcy5fcGx1Z2luc1thdHRyTmFtZV0gPSB0aGlzW2NsYXNzTmFtZV0gPSBwbHVnaW47XG4gIH0sXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogUG9wdWxhdGVzIHRoZSBfdXVpZHMgYXJyYXkgd2l0aCBwb2ludGVycyB0byBlYWNoIGluZGl2aWR1YWwgcGx1Z2luIGluc3RhbmNlLlxuICAgKiBBZGRzIHRoZSBgemZQbHVnaW5gIGRhdGEtYXR0cmlidXRlIHRvIHByb2dyYW1tYXRpY2FsbHkgY3JlYXRlZCBwbHVnaW5zIHRvIGFsbG93IHVzZSBvZiAkKHNlbGVjdG9yKS5mb3VuZGF0aW9uKG1ldGhvZCkgY2FsbHMuXG4gICAqIEFsc28gZmlyZXMgdGhlIGluaXRpYWxpemF0aW9uIGV2ZW50IGZvciBlYWNoIHBsdWdpbiwgY29uc29saWRhdGluZyByZXBldGl0aXZlIGNvZGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSB0aGUgbmFtZSBvZiB0aGUgcGx1Z2luLCBwYXNzZWQgYXMgYSBjYW1lbENhc2VkIHN0cmluZy5cbiAgICogQGZpcmVzIFBsdWdpbiNpbml0XG4gICAqL1xuICByZWdpc3RlclBsdWdpbjogZnVuY3Rpb24gKHBsdWdpbiwgbmFtZSkge1xuICAgIHZhciBwbHVnaW5OYW1lID0gbmFtZSA/IGh5cGhlbmF0ZShuYW1lKSA6IGZ1bmN0aW9uTmFtZShwbHVnaW4uY29uc3RydWN0b3IpLnRvTG93ZXJDYXNlKCk7XG4gICAgcGx1Z2luLnV1aWQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmkoX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfY29yZV9fW1wiYlwiIC8qIEdldFlvRGlnaXRzICovXSkoNiwgcGx1Z2luTmFtZSk7XG5cbiAgICBpZiAoIXBsdWdpbi4kZWxlbWVudC5hdHRyKCdkYXRhLScgKyBwbHVnaW5OYW1lKSkge1xuICAgICAgcGx1Z2luLiRlbGVtZW50LmF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUsIHBsdWdpbi51dWlkKTtcbiAgICB9XG4gICAgaWYgKCFwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nKSkge1xuICAgICAgcGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJywgcGx1Z2luKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBpbml0aWFsaXplZC5cbiAgICAgKiBAZXZlbnQgUGx1Z2luI2luaXRcbiAgICAgKi9cbiAgICBwbHVnaW4uJGVsZW1lbnQudHJpZ2dlcignaW5pdC56Zi4nICsgcGx1Z2luTmFtZSk7XG5cbiAgICB0aGlzLl91dWlkcy5wdXNoKHBsdWdpbi51dWlkKTtcblxuICAgIHJldHVybjtcbiAgfSxcbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBSZW1vdmVzIHRoZSBwbHVnaW5zIHV1aWQgZnJvbSB0aGUgX3V1aWRzIGFycmF5LlxuICAgKiBSZW1vdmVzIHRoZSB6ZlBsdWdpbiBkYXRhIGF0dHJpYnV0ZSwgYXMgd2VsbCBhcyB0aGUgZGF0YS1wbHVnaW4tbmFtZSBhdHRyaWJ1dGUuXG4gICAqIEFsc28gZmlyZXMgdGhlIGRlc3Ryb3llZCBldmVudCBmb3IgdGhlIHBsdWdpbiwgY29uc29saWRhdGluZyByZXBldGl0aXZlIGNvZGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cbiAgICogQGZpcmVzIFBsdWdpbiNkZXN0cm95ZWRcbiAgICovXG4gIHVucmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICB2YXIgcGx1Z2luTmFtZSA9IGh5cGhlbmF0ZShmdW5jdGlvbk5hbWUocGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJykuY29uc3RydWN0b3IpKTtcblxuICAgIHRoaXMuX3V1aWRzLnNwbGljZSh0aGlzLl91dWlkcy5pbmRleE9mKHBsdWdpbi51dWlkKSwgMSk7XG4gICAgcGx1Z2luLiRlbGVtZW50LnJlbW92ZUF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUpLnJlbW92ZURhdGEoJ3pmUGx1Z2luJylcbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGJlZW4gZGVzdHJveWVkLlxuICAgICAqIEBldmVudCBQbHVnaW4jZGVzdHJveWVkXG4gICAgICovXG4gICAgLnRyaWdnZXIoJ2Rlc3Ryb3llZC56Zi4nICsgcGx1Z2luTmFtZSk7XG4gICAgZm9yICh2YXIgcHJvcCBpbiBwbHVnaW4pIHtcbiAgICAgIHBsdWdpbltwcm9wXSA9IG51bGw7IC8vY2xlYW4gdXAgc2NyaXB0IHRvIHByZXAgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cbiAgICB9XG4gICAgcmV0dXJuO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQ2F1c2VzIG9uZSBvciBtb3JlIGFjdGl2ZSBwbHVnaW5zIHRvIHJlLWluaXRpYWxpemUsIHJlc2V0dGluZyBldmVudCBsaXN0ZW5lcnMsIHJlY2FsY3VsYXRpbmcgcG9zaXRpb25zLCBldGMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwbHVnaW5zIC0gb3B0aW9uYWwgc3RyaW5nIG9mIGFuIGluZGl2aWR1YWwgcGx1Z2luIGtleSwgYXR0YWluZWQgYnkgY2FsbGluZyBgJChlbGVtZW50KS5kYXRhKCdwbHVnaW5OYW1lJylgLCBvciBzdHJpbmcgb2YgYSBwbHVnaW4gY2xhc3MgaS5lLiBgJ2Ryb3Bkb3duJ2BcbiAgICogQGRlZmF1bHQgSWYgbm8gYXJndW1lbnQgaXMgcGFzc2VkLCByZWZsb3cgYWxsIGN1cnJlbnRseSBhY3RpdmUgcGx1Z2lucy5cbiAgICovXG4gIHJlSW5pdDogZnVuY3Rpb24gKHBsdWdpbnMpIHtcbiAgICB2YXIgaXNKUSA9IHBsdWdpbnMgaW5zdGFuY2VvZiBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdC5hO1xuICAgIHRyeSB7XG4gICAgICBpZiAoaXNKUSkge1xuICAgICAgICBwbHVnaW5zLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcykuZGF0YSgnemZQbHVnaW4nKS5faW5pdCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHBsdWdpbnMsXG4gICAgICAgICAgICBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgICBmbnMgPSB7XG4gICAgICAgICAgJ29iamVjdCc6IGZ1bmN0aW9uIChwbGdzKSB7XG4gICAgICAgICAgICBwbGdzLmZvckVhY2goZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgcCA9IGh5cGhlbmF0ZShwKTtcbiAgICAgICAgICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSgnW2RhdGEtJyArIHAgKyAnXScpLmZvdW5kYXRpb24oJ19pbml0Jyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgICdzdHJpbmcnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBwbHVnaW5zID0gaHlwaGVuYXRlKHBsdWdpbnMpO1xuICAgICAgICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSgnW2RhdGEtJyArIHBsdWdpbnMgKyAnXScpLmZvdW5kYXRpb24oJ19pbml0Jyk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICAndW5kZWZpbmVkJzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpc1snb2JqZWN0J10oT2JqZWN0LmtleXMoX3RoaXMuX3BsdWdpbnMpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGZuc1t0eXBlXShwbHVnaW5zKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgcmV0dXJuIHBsdWdpbnM7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHBsdWdpbnMgb24gYW55IGVsZW1lbnRzIHdpdGhpbiBgZWxlbWAgKGFuZCBgZWxlbWAgaXRzZWxmKSB0aGF0IGFyZW4ndCBhbHJlYWR5IGluaXRpYWxpemVkLlxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbSAtIGpRdWVyeSBvYmplY3QgY29udGFpbmluZyB0aGUgZWxlbWVudCB0byBjaGVjayBpbnNpZGUuIEFsc28gY2hlY2tzIHRoZSBlbGVtZW50IGl0c2VsZiwgdW5sZXNzIGl0J3MgdGhlIGBkb2N1bWVudGAgb2JqZWN0LlxuICAgKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gcGx1Z2lucyAtIEEgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUuIExlYXZlIHRoaXMgb3V0IHRvIGluaXRpYWxpemUgZXZlcnl0aGluZy5cbiAgICovXG4gIHJlZmxvdzogZnVuY3Rpb24gKGVsZW0sIHBsdWdpbnMpIHtcblxuICAgIC8vIElmIHBsdWdpbnMgaXMgdW5kZWZpbmVkLCBqdXN0IGdyYWIgZXZlcnl0aGluZ1xuICAgIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHBsdWdpbnMgPSBPYmplY3Qua2V5cyh0aGlzLl9wbHVnaW5zKTtcbiAgICB9XG4gICAgLy8gSWYgcGx1Z2lucyBpcyBhIHN0cmluZywgY29udmVydCBpdCB0byBhbiBhcnJheSB3aXRoIG9uZSBpdGVtXG4gICAgZWxzZSBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHBsdWdpbnMgPSBbcGx1Z2luc107XG4gICAgICB9XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggcGx1Z2luXG4gICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQuYS5lYWNoKHBsdWdpbnMsIGZ1bmN0aW9uIChpLCBuYW1lKSB7XG4gICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgcGx1Z2luXG4gICAgICB2YXIgcGx1Z2luID0gX3RoaXMuX3BsdWdpbnNbbmFtZV07XG5cbiAgICAgIC8vIExvY2FsaXplIHRoZSBzZWFyY2ggdG8gYWxsIGVsZW1lbnRzIGluc2lkZSBlbGVtLCBhcyB3ZWxsIGFzIGVsZW0gaXRzZWxmLCB1bmxlc3MgZWxlbSA9PT0gZG9jdW1lbnRcbiAgICAgIHZhciAkZWxlbSA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkoZWxlbSkuZmluZCgnW2RhdGEtJyArIG5hbWUgKyAnXScpLmFkZEJhY2soJ1tkYXRhLScgKyBuYW1lICsgJ10nKTtcblxuICAgICAgLy8gRm9yIGVhY2ggcGx1Z2luIGZvdW5kLCBpbml0aWFsaXplIGl0XG4gICAgICAkZWxlbS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyICRlbCA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcyksXG4gICAgICAgICAgICBvcHRzID0ge307XG4gICAgICAgIC8vIERvbid0IGRvdWJsZS1kaXAgb24gcGx1Z2luc1xuICAgICAgICBpZiAoJGVsLmRhdGEoJ3pmUGx1Z2luJykpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJUcmllZCB0byBpbml0aWFsaXplIFwiICsgbmFtZSArIFwiIG9uIGFuIGVsZW1lbnQgdGhhdCBhbHJlYWR5IGhhcyBhIEZvdW5kYXRpb24gcGx1Z2luLlwiKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJGVsLmF0dHIoJ2RhdGEtb3B0aW9ucycpKSB7XG4gICAgICAgICAgdmFyIHRoaW5nID0gJGVsLmF0dHIoJ2RhdGEtb3B0aW9ucycpLnNwbGl0KCc7JykuZm9yRWFjaChmdW5jdGlvbiAoZSwgaSkge1xuICAgICAgICAgICAgdmFyIG9wdCA9IGUuc3BsaXQoJzonKS5tYXAoZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgIHJldHVybiBlbC50cmltKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChvcHRbMF0pIG9wdHNbb3B0WzBdXSA9IHBhcnNlVmFsdWUob3B0WzFdKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICRlbC5kYXRhKCd6ZlBsdWdpbicsIG5ldyBwbHVnaW4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh0aGlzKSwgb3B0cykpO1xuICAgICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXIpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG4gIGdldEZuTmFtZTogZnVuY3Rpb25OYW1lLFxuXG4gIGFkZFRvSnF1ZXJ5OiBmdW5jdGlvbiAoJCkge1xuICAgIC8vIFRPRE86IGNvbnNpZGVyIG5vdCBtYWtpbmcgdGhpcyBhIGpRdWVyeSBmdW5jdGlvblxuICAgIC8vIFRPRE86IG5lZWQgd2F5IHRvIHJlZmxvdyB2cy4gcmUtaW5pdGlhbGl6ZVxuICAgIC8qKlxuICAgICAqIFRoZSBGb3VuZGF0aW9uIGpRdWVyeSBtZXRob2QuXG4gICAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IG1ldGhvZCAtIEFuIGFjdGlvbiB0byBwZXJmb3JtIG9uIHRoZSBjdXJyZW50IGpRdWVyeSBvYmplY3QuXG4gICAgICovXG4gICAgdmFyIGZvdW5kYXRpb24gPSBmdW5jdGlvbiAobWV0aG9kKSB7XG4gICAgICB2YXIgdHlwZSA9IHR5cGVvZiBtZXRob2QsXG4gICAgICAgICAgJG5vSlMgPSAkKCcubm8tanMnKTtcblxuICAgICAgaWYgKCRub0pTLmxlbmd0aCkge1xuICAgICAgICAkbm9KUy5yZW1vdmVDbGFzcygnbm8tanMnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIC8vbmVlZHMgdG8gaW5pdGlhbGl6ZSB0aGUgRm91bmRhdGlvbiBvYmplY3QsIG9yIGFuIGluZGl2aWR1YWwgcGx1Z2luLlxuICAgICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzJfX2ZvdW5kYXRpb25fdXRpbF9tZWRpYVF1ZXJ5X19bXCJhXCIgLyogTWVkaWFRdWVyeSAqL10uX2luaXQoKTtcbiAgICAgICAgRm91bmRhdGlvbi5yZWZsb3codGhpcyk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIC8vYW4gaW5kaXZpZHVhbCBtZXRob2QgdG8gaW52b2tlIG9uIGEgcGx1Z2luIG9yIGdyb3VwIG9mIHBsdWdpbnNcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpOyAvL2NvbGxlY3QgYWxsIHRoZSBhcmd1bWVudHMsIGlmIG5lY2Vzc2FyeVxuICAgICAgICB2YXIgcGx1Z0NsYXNzID0gdGhpcy5kYXRhKCd6ZlBsdWdpbicpOyAvL2RldGVybWluZSB0aGUgY2xhc3Mgb2YgcGx1Z2luXG5cbiAgICAgICAgaWYgKHBsdWdDbGFzcyAhPT0gdW5kZWZpbmVkICYmIHBsdWdDbGFzc1ttZXRob2RdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvL21ha2Ugc3VyZSBib3RoIHRoZSBjbGFzcyBhbmQgbWV0aG9kIGV4aXN0XG4gICAgICAgICAgaWYgKHRoaXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAvL2lmIHRoZXJlJ3Mgb25seSBvbmUsIGNhbGwgaXQgZGlyZWN0bHkuXG4gICAgICAgICAgICBwbHVnQ2xhc3NbbWV0aG9kXS5hcHBseShwbHVnQ2xhc3MsIGFyZ3MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24gKGksIGVsKSB7XG4gICAgICAgICAgICAgIC8vb3RoZXJ3aXNlIGxvb3AgdGhyb3VnaCB0aGUgalF1ZXJ5IGNvbGxlY3Rpb24gYW5kIGludm9rZSB0aGUgbWV0aG9kIG9uIGVhY2hcbiAgICAgICAgICAgICAgcGx1Z0NsYXNzW21ldGhvZF0uYXBwbHkoJChlbCkuZGF0YSgnemZQbHVnaW4nKSwgYXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy9lcnJvciBmb3Igbm8gY2xhc3Mgb3Igbm8gbWV0aG9kXG4gICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiV2UncmUgc29ycnksICdcIiArIG1ldGhvZCArIFwiJyBpcyBub3QgYW4gYXZhaWxhYmxlIG1ldGhvZCBmb3IgXCIgKyAocGx1Z0NsYXNzID8gZnVuY3Rpb25OYW1lKHBsdWdDbGFzcykgOiAndGhpcyBlbGVtZW50JykgKyAnLicpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL2Vycm9yIGZvciBpbnZhbGlkIGFyZ3VtZW50IHR5cGVcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignV2VcXCdyZSBzb3JyeSwgJyArIHR5cGUgKyAnIGlzIG5vdCBhIHZhbGlkIHBhcmFtZXRlci4gWW91IG11c3QgdXNlIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgbWV0aG9kIHlvdSB3aXNoIHRvIGludm9rZS4nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgJC5mbi5mb3VuZGF0aW9uID0gZm91bmRhdGlvbjtcbiAgICByZXR1cm4gJDtcbiAgfVxufTtcblxuRm91bmRhdGlvbi51dGlsID0ge1xuICAvKipcbiAgICogRnVuY3Rpb24gZm9yIGFwcGx5aW5nIGEgZGVib3VuY2UgZWZmZWN0IHRvIGEgZnVuY3Rpb24gY2FsbC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgLSBGdW5jdGlvbiB0byBiZSBjYWxsZWQgYXQgZW5kIG9mIHRpbWVvdXQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkZWxheSAtIFRpbWUgaW4gbXMgdG8gZGVsYXkgdGhlIGNhbGwgb2YgYGZ1bmNgLlxuICAgKiBAcmV0dXJucyBmdW5jdGlvblxuICAgKi9cbiAgdGhyb3R0bGU6IGZ1bmN0aW9uIChmdW5jLCBkZWxheSkge1xuICAgIHZhciB0aW1lciA9IG51bGw7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLFxuICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgIGlmICh0aW1lciA9PT0gbnVsbCkge1xuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgdGltZXIgPSBudWxsO1xuICAgICAgICB9LCBkZWxheSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcblxud2luZG93LkZvdW5kYXRpb24gPSBGb3VuZGF0aW9uO1xuXG4vLyBQb2x5ZmlsbCBmb3IgcmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4oZnVuY3Rpb24gKCkge1xuICBpZiAoIURhdGUubm93IHx8ICF3aW5kb3cuRGF0ZS5ub3cpIHdpbmRvdy5EYXRlLm5vdyA9IERhdGUubm93ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfTtcblxuICB2YXIgdmVuZG9ycyA9IFsnd2Via2l0JywgJ21veiddO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK2kpIHtcbiAgICB2YXIgdnAgPSB2ZW5kb3JzW2ldO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdnAgKyAnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZwICsgJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ10gfHwgd2luZG93W3ZwICsgJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICB9XG4gIGlmICgvaVAoYWR8aG9uZXxvZCkuKk9TIDYvLnRlc3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpIHx8ICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8ICF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHtcbiAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgdmFyIG5leHRUaW1lID0gTWF0aC5tYXgobGFzdFRpbWUgKyAxNiwgbm93KTtcbiAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2FsbGJhY2sobGFzdFRpbWUgPSBuZXh0VGltZSk7XG4gICAgICB9LCBuZXh0VGltZSAtIG5vdyk7XG4gICAgfTtcbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBjbGVhclRpbWVvdXQ7XG4gIH1cbiAgLyoqXG4gICAqIFBvbHlmaWxsIGZvciBwZXJmb3JtYW5jZS5ub3csIHJlcXVpcmVkIGJ5IHJBRlxuICAgKi9cbiAgaWYgKCF3aW5kb3cucGVyZm9ybWFuY2UgfHwgIXdpbmRvdy5wZXJmb3JtYW5jZS5ub3cpIHtcbiAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7XG4gICAgICBzdGFydDogRGF0ZS5ub3coKSxcbiAgICAgIG5vdzogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIHRoaXMuc3RhcnQ7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoKTtcbmlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcbiAgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAob1RoaXMpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIGNsb3Nlc3QgdGhpbmcgcG9zc2libGUgdG8gdGhlIEVDTUFTY3JpcHQgNVxuICAgICAgLy8gaW50ZXJuYWwgSXNDYWxsYWJsZSBmdW5jdGlvblxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgLSB3aGF0IGlzIHRyeWluZyB0byBiZSBib3VuZCBpcyBub3QgY2FsbGFibGUnKTtcbiAgICB9XG5cbiAgICB2YXIgYUFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxuICAgICAgICBmVG9CaW5kID0gdGhpcyxcbiAgICAgICAgZk5PUCA9IGZ1bmN0aW9uICgpIHt9LFxuICAgICAgICBmQm91bmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZlRvQmluZC5hcHBseSh0aGlzIGluc3RhbmNlb2YgZk5PUCA/IHRoaXMgOiBvVGhpcywgYUFyZ3MuY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMucHJvdG90eXBlKSB7XG4gICAgICAvLyBuYXRpdmUgZnVuY3Rpb25zIGRvbid0IGhhdmUgYSBwcm90b3R5cGVcbiAgICAgIGZOT1AucHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XG4gICAgfVxuICAgIGZCb3VuZC5wcm90b3R5cGUgPSBuZXcgZk5PUCgpO1xuXG4gICAgcmV0dXJuIGZCb3VuZDtcbiAgfTtcbn1cbi8vIFBvbHlmaWxsIHRvIGdldCB0aGUgbmFtZSBvZiBhIGZ1bmN0aW9uIGluIElFOVxuZnVuY3Rpb24gZnVuY3Rpb25OYW1lKGZuKSB7XG4gIGlmIChGdW5jdGlvbi5wcm90b3R5cGUubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIGZ1bmNOYW1lUmVnZXggPSAvZnVuY3Rpb25cXHMoW14oXXsxLH0pXFwoLztcbiAgICB2YXIgcmVzdWx0cyA9IGZ1bmNOYW1lUmVnZXguZXhlYyhmbi50b1N0cmluZygpKTtcbiAgICByZXR1cm4gcmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDEgPyByZXN1bHRzWzFdLnRyaW0oKSA6IFwiXCI7XG4gIH0gZWxzZSBpZiAoZm4ucHJvdG90eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZm4uY29uc3RydWN0b3IubmFtZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZm4ucHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWU7XG4gIH1cbn1cbmZ1bmN0aW9uIHBhcnNlVmFsdWUoc3RyKSB7XG4gIGlmICgndHJ1ZScgPT09IHN0cikgcmV0dXJuIHRydWU7ZWxzZSBpZiAoJ2ZhbHNlJyA9PT0gc3RyKSByZXR1cm4gZmFsc2U7ZWxzZSBpZiAoIWlzTmFOKHN0ciAqIDEpKSByZXR1cm4gcGFyc2VGbG9hdChzdHIpO1xuICByZXR1cm4gc3RyO1xufVxuLy8gQ29udmVydCBQYXNjYWxDYXNlIHRvIGtlYmFiLWNhc2Vcbi8vIFRoYW5rIHlvdTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvODk1NTU4MFxuZnVuY3Rpb24gaHlwaGVuYXRlKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG59XG5cblxuXG4vKioqLyB9KSxcbi8qIDQgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIF9fd2VicGFja19leHBvcnRzX18sIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG4vKiBoYXJtb255IGV4cG9ydCAoYmluZGluZykgKi8gX193ZWJwYWNrX3JlcXVpcmVfXy5kKF9fd2VicGFja19leHBvcnRzX18sIFwiYVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIFBsdWdpbjsgfSk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X18pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX2NvcmVfXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSk7XG5cblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuXG5cblxuLy8gQWJzdHJhY3QgY2xhc3MgZm9yIHByb3ZpZGluZyBsaWZlY3ljbGUgaG9va3MuIEV4cGVjdCBwbHVnaW5zIHRvIGRlZmluZSBBVCBMRUFTVFxuLy8ge2Z1bmN0aW9ufSBfc2V0dXAgKHJlcGxhY2VzIHByZXZpb3VzIGNvbnN0cnVjdG9yKSxcbi8vIHtmdW5jdGlvbn0gX2Rlc3Ryb3kgKHJlcGxhY2VzIHByZXZpb3VzIGRlc3Ryb3kpXG5cbnZhciBQbHVnaW4gPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFBsdWdpbihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFBsdWdpbik7XG5cbiAgICB0aGlzLl9zZXR1cChlbGVtZW50LCBvcHRpb25zKTtcbiAgICB2YXIgcGx1Z2luTmFtZSA9IGdldFBsdWdpbk5hbWUodGhpcyk7XG4gICAgdGhpcy51dWlkID0gX193ZWJwYWNrX3JlcXVpcmVfXy5pKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX2NvcmVfX1tcImJcIiAvKiBHZXRZb0RpZ2l0cyAqL10pKDYsIHBsdWdpbk5hbWUpO1xuXG4gICAgaWYgKCF0aGlzLiRlbGVtZW50LmF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUpKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUsIHRoaXMudXVpZCk7XG4gICAgfVxuICAgIGlmICghdGhpcy4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicpKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJywgdGhpcyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgaW5pdGlhbGl6ZWQuXG4gICAgICogQGV2ZW50IFBsdWdpbiNpbml0XG4gICAgICovXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdpbml0LnpmLicgKyBwbHVnaW5OYW1lKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhQbHVnaW4sIFt7XG4gICAga2V5OiAnZGVzdHJveScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICB0aGlzLl9kZXN0cm95KCk7XG4gICAgICB2YXIgcGx1Z2luTmFtZSA9IGdldFBsdWdpbk5hbWUodGhpcyk7XG4gICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUF0dHIoJ2RhdGEtJyArIHBsdWdpbk5hbWUpLnJlbW92ZURhdGEoJ3pmUGx1Z2luJylcbiAgICAgIC8qKlxuICAgICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBiZWVuIGRlc3Ryb3llZC5cbiAgICAgICAqIEBldmVudCBQbHVnaW4jZGVzdHJveWVkXG4gICAgICAgKi9cbiAgICAgIC50cmlnZ2VyKCdkZXN0cm95ZWQuemYuJyArIHBsdWdpbk5hbWUpO1xuICAgICAgZm9yICh2YXIgcHJvcCBpbiB0aGlzKSB7XG4gICAgICAgIHRoaXNbcHJvcF0gPSBudWxsOyAvL2NsZWFuIHVwIHNjcmlwdCB0byBwcmVwIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG4gICAgICB9XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFBsdWdpbjtcbn0oKTtcblxuLy8gQ29udmVydCBQYXNjYWxDYXNlIHRvIGtlYmFiLWNhc2Vcbi8vIFRoYW5rIHlvdTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvODk1NTU4MFxuXG5cbmZ1bmN0aW9uIGh5cGhlbmF0ZShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xufVxuXG5mdW5jdGlvbiBnZXRQbHVnaW5OYW1lKG9iaikge1xuICBpZiAodHlwZW9mIG9iai5jb25zdHJ1Y3Rvci5uYW1lICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBoeXBoZW5hdGUob2JqLmNvbnN0cnVjdG9yLm5hbWUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBoeXBoZW5hdGUob2JqLmNsYXNzTmFtZSk7XG4gIH1cbn1cblxuXG5cbi8qKiovIH0pLFxuLyogNSAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgX193ZWJwYWNrX2V4cG9ydHNfXywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcbi8qIGhhcm1vbnkgZXhwb3J0IChiaW5kaW5nKSAqLyBfX3dlYnBhY2tfcmVxdWlyZV9fLmQoX193ZWJwYWNrX2V4cG9ydHNfXywgXCJhXCIsIGZ1bmN0aW9uKCkgeyByZXR1cm4gTWVkaWFRdWVyeTsgfSk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X18pO1xuXG5cblxuXG4vLyBEZWZhdWx0IHNldCBvZiBtZWRpYSBxdWVyaWVzXG52YXIgZGVmYXVsdFF1ZXJpZXMgPSB7XG4gICdkZWZhdWx0JzogJ29ubHkgc2NyZWVuJyxcbiAgbGFuZHNjYXBlOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKScsXG4gIHBvcnRyYWl0OiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpJyxcbiAgcmV0aW5hOiAnb25seSBzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgKyAnb25seSBzY3JlZW4gYW5kIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgKyAnb25seSBzY3JlZW4gYW5kICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyLzEpLCcgKyAnb25seSBzY3JlZW4gYW5kIChtaW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICsgJ29ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDE5MmRwaSksJyArICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAyZHBweCknXG59O1xuXG4vLyBtYXRjaE1lZGlhKCkgcG9seWZpbGwgLSBUZXN0IGEgQ1NTIG1lZGlhIHR5cGUvcXVlcnkgaW4gSlMuXG4vLyBBdXRob3JzICYgY29weXJpZ2h0IChjKSAyMDEyOiBTY290dCBKZWhsLCBQYXVsIElyaXNoLCBOaWNob2xhcyBaYWthcywgRGF2aWQgS25pZ2h0LiBEdWFsIE1JVC9CU0QgbGljZW5zZVxudmFyIG1hdGNoTWVkaWEgPSB3aW5kb3cubWF0Y2hNZWRpYSB8fCBmdW5jdGlvbiAoKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBGb3IgYnJvd3NlcnMgdGhhdCBzdXBwb3J0IG1hdGNoTWVkaXVtIGFwaSBzdWNoIGFzIElFIDkgYW5kIHdlYmtpdFxuXG4gIHZhciBzdHlsZU1lZGlhID0gd2luZG93LnN0eWxlTWVkaWEgfHwgd2luZG93Lm1lZGlhO1xuXG4gIC8vIEZvciB0aG9zZSB0aGF0IGRvbid0IHN1cHBvcnQgbWF0Y2hNZWRpdW1cbiAgaWYgKCFzdHlsZU1lZGlhKSB7XG4gICAgdmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICAgICAgc2NyaXB0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdLFxuICAgICAgICBpbmZvID0gbnVsbDtcblxuICAgIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnO1xuICAgIHN0eWxlLmlkID0gJ21hdGNobWVkaWFqcy10ZXN0JztcblxuICAgIHNjcmlwdCAmJiBzY3JpcHQucGFyZW50Tm9kZSAmJiBzY3JpcHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc3R5bGUsIHNjcmlwdCk7XG5cbiAgICAvLyAnc3R5bGUuY3VycmVudFN0eWxlJyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICd3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZScgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgIGluZm8gPSAnZ2V0Q29tcHV0ZWRTdHlsZScgaW4gd2luZG93ICYmIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHN0eWxlLCBudWxsKSB8fCBzdHlsZS5jdXJyZW50U3R5bGU7XG5cbiAgICBzdHlsZU1lZGlhID0ge1xuICAgICAgbWF0Y2hNZWRpdW06IGZ1bmN0aW9uIChtZWRpYSkge1xuICAgICAgICB2YXIgdGV4dCA9ICdAbWVkaWEgJyArIG1lZGlhICsgJ3sgI21hdGNobWVkaWFqcy10ZXN0IHsgd2lkdGg6IDFweDsgfSB9JztcblxuICAgICAgICAvLyAnc3R5bGUuc3R5bGVTaGVldCcgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnc3R5bGUudGV4dENvbnRlbnQnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICAgICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSB0ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRlc3QgaWYgbWVkaWEgcXVlcnkgaXMgdHJ1ZSBvciBmYWxzZVxuICAgICAgICByZXR1cm4gaW5mby53aWR0aCA9PT0gJzFweCc7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAobWVkaWEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWF0Y2hlczogc3R5bGVNZWRpYS5tYXRjaE1lZGl1bShtZWRpYSB8fCAnYWxsJyksXG4gICAgICBtZWRpYTogbWVkaWEgfHwgJ2FsbCdcbiAgICB9O1xuICB9O1xufSgpO1xuXG52YXIgTWVkaWFRdWVyeSA9IHtcbiAgcXVlcmllczogW10sXG5cbiAgY3VycmVudDogJycsXG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBtZWRpYSBxdWVyeSBoZWxwZXIsIGJ5IGV4dHJhY3RpbmcgdGhlIGJyZWFrcG9pbnQgbGlzdCBmcm9tIHRoZSBDU1MgYW5kIGFjdGl2YXRpbmcgdGhlIGJyZWFrcG9pbnQgd2F0Y2hlci5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgJG1ldGEgPSBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKCdtZXRhLmZvdW5kYXRpb24tbXEnKTtcbiAgICBpZiAoISRtZXRhLmxlbmd0aCkge1xuICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSgnPG1ldGEgY2xhc3M9XCJmb3VuZGF0aW9uLW1xXCI+JykuYXBwZW5kVG8oZG9jdW1lbnQuaGVhZCk7XG4gICAgfVxuXG4gICAgdmFyIGV4dHJhY3RlZFN0eWxlcyA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkoJy5mb3VuZGF0aW9uLW1xJykuY3NzKCdmb250LWZhbWlseScpO1xuICAgIHZhciBuYW1lZFF1ZXJpZXM7XG5cbiAgICBuYW1lZFF1ZXJpZXMgPSBwYXJzZVN0eWxlVG9PYmplY3QoZXh0cmFjdGVkU3R5bGVzKTtcblxuICAgIGZvciAodmFyIGtleSBpbiBuYW1lZFF1ZXJpZXMpIHtcbiAgICAgIGlmIChuYW1lZFF1ZXJpZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBzZWxmLnF1ZXJpZXMucHVzaCh7XG4gICAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAgIHZhbHVlOiAnb25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6ICcgKyBuYW1lZFF1ZXJpZXNba2V5XSArICcpJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpO1xuXG4gICAgdGhpcy5fd2F0Y2hlcigpO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIGlzIGF0IGxlYXN0IGFzIHdpZGUgYXMgYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBicmVha3BvaW50IG1hdGNoZXMsIGBmYWxzZWAgaWYgaXQncyBzbWFsbGVyLlxuICAgKi9cbiAgYXRMZWFzdDogZnVuY3Rpb24gKHNpemUpIHtcbiAgICB2YXIgcXVlcnkgPSB0aGlzLmdldChzaXplKTtcblxuICAgIGlmIChxdWVyeSkge1xuICAgICAgcmV0dXJuIG1hdGNoTWVkaWEocXVlcnkpLm1hdGNoZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIG1hdGNoZXMgdG8gYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLCBlaXRoZXIgJ3NtYWxsIG9ubHknIG9yICdzbWFsbCcuIE9taXR0aW5nICdvbmx5JyBmYWxscyBiYWNrIHRvIHVzaW5nIGF0TGVhc3QoKSBtZXRob2QuXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCBkb2VzIG5vdC5cbiAgICovXG4gIGlzOiBmdW5jdGlvbiAoc2l6ZSkge1xuICAgIHNpemUgPSBzaXplLnRyaW0oKS5zcGxpdCgnICcpO1xuICAgIGlmIChzaXplLmxlbmd0aCA+IDEgJiYgc2l6ZVsxXSA9PT0gJ29ubHknKSB7XG4gICAgICBpZiAoc2l6ZVswXSA9PT0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKSkgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmF0TGVhc3Qoc2l6ZVswXSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtZWRpYSBxdWVyeSBvZiBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gZ2V0LlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfG51bGx9IC0gVGhlIG1lZGlhIHF1ZXJ5IG9mIHRoZSBicmVha3BvaW50LCBvciBgbnVsbGAgaWYgdGhlIGJyZWFrcG9pbnQgZG9lc24ndCBleGlzdC5cbiAgICovXG4gIGdldDogZnVuY3Rpb24gKHNpemUpIHtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMucXVlcmllcykge1xuICAgICAgaWYgKHRoaXMucXVlcmllcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICAgIGlmIChzaXplID09PSBxdWVyeS5uYW1lKSByZXR1cm4gcXVlcnkudmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cblxuICAvKipcbiAgICogR2V0cyB0aGUgY3VycmVudCBicmVha3BvaW50IG5hbWUgYnkgdGVzdGluZyBldmVyeSBicmVha3BvaW50IGFuZCByZXR1cm5pbmcgdGhlIGxhc3Qgb25lIHRvIG1hdGNoICh0aGUgYmlnZ2VzdCBvbmUpLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybnMge1N0cmluZ30gTmFtZSBvZiB0aGUgY3VycmVudCBicmVha3BvaW50LlxuICAgKi9cbiAgX2dldEN1cnJlbnRTaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG1hdGNoZWQ7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW2ldO1xuXG4gICAgICBpZiAobWF0Y2hNZWRpYShxdWVyeS52YWx1ZSkubWF0Y2hlcykge1xuICAgICAgICBtYXRjaGVkID0gcXVlcnk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBtYXRjaGVkID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIG1hdGNoZWQubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1hdGNoZWQ7XG4gICAgfVxuICB9LFxuXG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlcyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLCB3aGljaCBmaXJlcyBhbiBldmVudCBvbiB0aGUgd2luZG93IHdoZW5ldmVyIHRoZSBicmVha3BvaW50IGNoYW5nZXMuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3dhdGNoZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh3aW5kb3cpLm9mZigncmVzaXplLnpmLm1lZGlhcXVlcnknKS5vbigncmVzaXplLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbmV3U2l6ZSA9IF90aGlzLl9nZXRDdXJyZW50U2l6ZSgpLFxuICAgICAgICAgIGN1cnJlbnRTaXplID0gX3RoaXMuY3VycmVudDtcblxuICAgICAgaWYgKG5ld1NpemUgIT09IGN1cnJlbnRTaXplKSB7XG4gICAgICAgIC8vIENoYW5nZSB0aGUgY3VycmVudCBtZWRpYSBxdWVyeVxuICAgICAgICBfdGhpcy5jdXJyZW50ID0gbmV3U2l6ZTtcblxuICAgICAgICAvLyBCcm9hZGNhc3QgdGhlIG1lZGlhIHF1ZXJ5IGNoYW5nZSBvbiB0aGUgd2luZG93XG4gICAgICAgIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkod2luZG93KS50cmlnZ2VyKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBbbmV3U2l6ZSwgY3VycmVudFNpemVdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuLy8gVGhhbmsgeW91OiBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3F1ZXJ5LXN0cmluZ1xuZnVuY3Rpb24gcGFyc2VTdHlsZVRvT2JqZWN0KHN0cikge1xuICB2YXIgc3R5bGVPYmplY3QgPSB7fTtcblxuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gIH1cblxuICBzdHIgPSBzdHIudHJpbSgpLnNsaWNlKDEsIC0xKTsgLy8gYnJvd3NlcnMgcmUtcXVvdGUgc3RyaW5nIHN0eWxlIHZhbHVlc1xuXG4gIGlmICghc3RyKSB7XG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgc3R5bGVPYmplY3QgPSBzdHIuc3BsaXQoJyYnKS5yZWR1Y2UoZnVuY3Rpb24gKHJldCwgcGFyYW0pIHtcbiAgICB2YXIgcGFydHMgPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuICAgIHZhciBrZXkgPSBwYXJ0c1swXTtcbiAgICB2YXIgdmFsID0gcGFydHNbMV07XG4gICAga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleSk7XG5cbiAgICAvLyBtaXNzaW5nIGA9YCBzaG91bGQgYmUgYG51bGxgOlxuICAgIC8vIGh0dHA6Ly93My5vcmcvVFIvMjAxMi9XRC11cmwtMjAxMjA1MjQvI2NvbGxlY3QtdXJsLXBhcmFtZXRlcnNcbiAgICB2YWwgPSB2YWwgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkZWNvZGVVUklDb21wb25lbnQodmFsKTtcblxuICAgIGlmICghcmV0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldFtrZXldID0gdmFsO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXRba2V5XSkpIHtcbiAgICAgIHJldFtrZXldLnB1c2godmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0W2tleV0gPSBbcmV0W2tleV0sIHZhbF07XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH0sIHt9KTtcblxuICByZXR1cm4gc3R5bGVPYmplY3Q7XG59XG5cblxuXG4vKioqLyB9KSxcbi8qIDYgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxubW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDIpO1xuXG5cbi8qKiovIH0pXG4vKioqKioqLyBdKTsiLCIvKioqKioqLyAoZnVuY3Rpb24obW9kdWxlcykgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbi8qKioqKiovIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuLyoqKioqKi8gXHRcdH1cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdGk6IG1vZHVsZUlkLFxuLyoqKioqKi8gXHRcdFx0bDogZmFsc2UsXG4vKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fVxuLyoqKioqKi8gXHRcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuLyoqKioqKi8gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4vKioqKioqLyBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbi8qKioqKiovIFx0fVxuLyoqKioqKi9cbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9ueSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4vKioqKioqLyBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuLyoqKioqKi8gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbi8qKioqKiovIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbi8qKioqKiovIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbi8qKioqKiovIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbi8qKioqKiovIFx0XHRcdH0pO1xuLyoqKioqKi8gXHRcdH1cbi8qKioqKiovIFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuLyoqKioqKi8gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuLyoqKioqKi8gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbi8qKioqKiovIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4vKioqKioqLyBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuLyoqKioqKi8gXHRcdHJldHVybiBnZXR0ZXI7XG4vKioqKioqLyBcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAxMDApO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoe1xuXG4vKioqLyAxOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtGb3VuZGF0aW9uOiB3aW5kb3cuRm91bmRhdGlvbn07XG5cbi8qKiovIH0pLFxuXG4vKioqLyAxMDA6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3JlcXVpcmVfXygzNCk7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDM6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0ge3J0bDogd2luZG93LkZvdW5kYXRpb24ucnRsLCBHZXRZb0RpZ2l0czogd2luZG93LkZvdW5kYXRpb24uR2V0WW9EaWdpdHMsIHRyYW5zaXRpb25lbmQ6IHdpbmRvdy5Gb3VuZGF0aW9uLnRyYW5zaXRpb25lbmR9O1xuXG4vKioqLyB9KSxcblxuLyoqKi8gMzQ6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBfX3dlYnBhY2tfZXhwb3J0c19fLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KF9fd2VicGFja19leHBvcnRzX18sIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fZm91bmRhdGlvbl9jb3JlX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fZm91bmRhdGlvbl9jb3JlX19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fdXRpbF9ib3hfXyA9IF9fd2VicGFja19yZXF1aXJlX18oNjQpO1xuXG5cblxuX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX2NvcmVfX1tcIkZvdW5kYXRpb25cIl0uQm94ID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfYm94X19bXCJhXCIgLyogQm94ICovXTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDY0OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgX193ZWJwYWNrX2V4cG9ydHNfXywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcbi8qIGhhcm1vbnkgZXhwb3J0IChiaW5kaW5nKSAqLyBfX3dlYnBhY2tfcmVxdWlyZV9fLmQoX193ZWJwYWNrX2V4cG9ydHNfXywgXCJhXCIsIGZ1bmN0aW9uKCkgeyByZXR1cm4gQm94OyB9KTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fdXRpbF9jb3JlX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDMpO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fZm91bmRhdGlvbl91dGlsX2NvcmVfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fZm91bmRhdGlvbl91dGlsX2NvcmVfXyk7XG5cblxuXG5cbnZhciBCb3ggPSB7XG4gIEltTm90VG91Y2hpbmdZb3U6IEltTm90VG91Y2hpbmdZb3UsXG4gIE92ZXJsYXBBcmVhOiBPdmVybGFwQXJlYSxcbiAgR2V0RGltZW5zaW9uczogR2V0RGltZW5zaW9ucyxcbiAgR2V0T2Zmc2V0czogR2V0T2Zmc2V0cyxcbiAgR2V0RXhwbGljaXRPZmZzZXRzOiBHZXRFeHBsaWNpdE9mZnNldHNcblxuICAvKipcbiAgICogQ29tcGFyZXMgdGhlIGRpbWVuc2lvbnMgb2YgYW4gZWxlbWVudCB0byBhIGNvbnRhaW5lciBhbmQgZGV0ZXJtaW5lcyBjb2xsaXNpb24gZXZlbnRzIHdpdGggY29udGFpbmVyLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHRlc3QgZm9yIGNvbGxpc2lvbnMuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBwYXJlbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHVzZSBhcyBib3VuZGluZyBjb250YWluZXIuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gbHJPbmx5IC0gc2V0IHRvIHRydWUgdG8gY2hlY2sgbGVmdCBhbmQgcmlnaHQgdmFsdWVzIG9ubHkuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gdGJPbmx5IC0gc2V0IHRvIHRydWUgdG8gY2hlY2sgdG9wIGFuZCBib3R0b20gdmFsdWVzIG9ubHkuXG4gICAqIEBkZWZhdWx0IGlmIG5vIHBhcmVudCBvYmplY3QgcGFzc2VkLCBkZXRlY3RzIGNvbGxpc2lvbnMgd2l0aCBgd2luZG93YC5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IC0gdHJ1ZSBpZiBjb2xsaXNpb24gZnJlZSwgZmFsc2UgaWYgYSBjb2xsaXNpb24gaW4gYW55IGRpcmVjdGlvbi5cbiAgICovXG59O2Z1bmN0aW9uIEltTm90VG91Y2hpbmdZb3UoZWxlbWVudCwgcGFyZW50LCBsck9ubHksIHRiT25seSwgaWdub3JlQm90dG9tKSB7XG4gIHJldHVybiBPdmVybGFwQXJlYShlbGVtZW50LCBwYXJlbnQsIGxyT25seSwgdGJPbmx5LCBpZ25vcmVCb3R0b20pID09PSAwO1xufTtcblxuZnVuY3Rpb24gT3ZlcmxhcEFyZWEoZWxlbWVudCwgcGFyZW50LCBsck9ubHksIHRiT25seSwgaWdub3JlQm90dG9tKSB7XG4gIHZhciBlbGVEaW1zID0gR2V0RGltZW5zaW9ucyhlbGVtZW50KSxcbiAgICAgIHRvcE92ZXIsXG4gICAgICBib3R0b21PdmVyLFxuICAgICAgbGVmdE92ZXIsXG4gICAgICByaWdodE92ZXI7XG4gIGlmIChwYXJlbnQpIHtcbiAgICB2YXIgcGFyRGltcyA9IEdldERpbWVuc2lvbnMocGFyZW50KTtcblxuICAgIGJvdHRvbU92ZXIgPSBwYXJEaW1zLmhlaWdodCArIHBhckRpbXMub2Zmc2V0LnRvcCAtIChlbGVEaW1zLm9mZnNldC50b3AgKyBlbGVEaW1zLmhlaWdodCk7XG4gICAgdG9wT3ZlciA9IGVsZURpbXMub2Zmc2V0LnRvcCAtIHBhckRpbXMub2Zmc2V0LnRvcDtcbiAgICBsZWZ0T3ZlciA9IGVsZURpbXMub2Zmc2V0LmxlZnQgLSBwYXJEaW1zLm9mZnNldC5sZWZ0O1xuICAgIHJpZ2h0T3ZlciA9IHBhckRpbXMud2lkdGggKyBwYXJEaW1zLm9mZnNldC5sZWZ0IC0gKGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoKTtcbiAgfSBlbHNlIHtcbiAgICBib3R0b21PdmVyID0gZWxlRGltcy53aW5kb3dEaW1zLmhlaWdodCArIGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wIC0gKGVsZURpbXMub2Zmc2V0LnRvcCArIGVsZURpbXMuaGVpZ2h0KTtcbiAgICB0b3BPdmVyID0gZWxlRGltcy5vZmZzZXQudG9wIC0gZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3A7XG4gICAgbGVmdE92ZXIgPSBlbGVEaW1zLm9mZnNldC5sZWZ0IC0gZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0O1xuICAgIHJpZ2h0T3ZlciA9IGVsZURpbXMud2luZG93RGltcy53aWR0aCAtIChlbGVEaW1zLm9mZnNldC5sZWZ0ICsgZWxlRGltcy53aWR0aCk7XG4gIH1cblxuICBib3R0b21PdmVyID0gaWdub3JlQm90dG9tID8gMCA6IE1hdGgubWluKGJvdHRvbU92ZXIsIDApO1xuICB0b3BPdmVyID0gTWF0aC5taW4odG9wT3ZlciwgMCk7XG4gIGxlZnRPdmVyID0gTWF0aC5taW4obGVmdE92ZXIsIDApO1xuICByaWdodE92ZXIgPSBNYXRoLm1pbihyaWdodE92ZXIsIDApO1xuXG4gIGlmIChsck9ubHkpIHtcbiAgICByZXR1cm4gbGVmdE92ZXIgKyByaWdodE92ZXI7XG4gIH1cbiAgaWYgKHRiT25seSkge1xuICAgIHJldHVybiB0b3BPdmVyICsgYm90dG9tT3ZlcjtcbiAgfVxuXG4gIC8vIHVzZSBzdW0gb2Ygc3F1YXJlcyBiL2Mgd2UgY2FyZSBhYm91dCBvdmVybGFwIGFyZWEuXG4gIHJldHVybiBNYXRoLnNxcnQodG9wT3ZlciAqIHRvcE92ZXIgKyBib3R0b21PdmVyICogYm90dG9tT3ZlciArIGxlZnRPdmVyICogbGVmdE92ZXIgKyByaWdodE92ZXIgKiByaWdodE92ZXIpO1xufVxuXG4vKipcbiAqIFVzZXMgbmF0aXZlIG1ldGhvZHMgdG8gcmV0dXJuIGFuIG9iamVjdCBvZiBkaW1lbnNpb24gdmFsdWVzLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2pRdWVyeSB8fCBIVE1MfSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCBvciBET00gZWxlbWVudCBmb3Igd2hpY2ggdG8gZ2V0IHRoZSBkaW1lbnNpb25zLiBDYW4gYmUgYW55IGVsZW1lbnQgb3RoZXIgdGhhdCBkb2N1bWVudCBvciB3aW5kb3cuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSAtIG5lc3RlZCBvYmplY3Qgb2YgaW50ZWdlciBwaXhlbCB2YWx1ZXNcbiAqIFRPRE8gLSBpZiBlbGVtZW50IGlzIHdpbmRvdywgcmV0dXJuIG9ubHkgdGhvc2UgdmFsdWVzLlxuICovXG5mdW5jdGlvbiBHZXREaW1lbnNpb25zKGVsZW0pIHtcbiAgZWxlbSA9IGVsZW0ubGVuZ3RoID8gZWxlbVswXSA6IGVsZW07XG5cbiAgaWYgKGVsZW0gPT09IHdpbmRvdyB8fCBlbGVtID09PSBkb2N1bWVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkknbSBzb3JyeSwgRGF2ZS4gSSdtIGFmcmFpZCBJIGNhbid0IGRvIHRoYXQuXCIpO1xuICB9XG5cbiAgdmFyIHJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgcGFyUmVjdCA9IGVsZW0ucGFyZW50Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHdpblJlY3QgPSBkb2N1bWVudC5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgd2luWSA9IHdpbmRvdy5wYWdlWU9mZnNldCxcbiAgICAgIHdpblggPSB3aW5kb3cucGFnZVhPZmZzZXQ7XG5cbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogcmVjdC53aWR0aCxcbiAgICBoZWlnaHQ6IHJlY3QuaGVpZ2h0LFxuICAgIG9mZnNldDoge1xuICAgICAgdG9wOiByZWN0LnRvcCArIHdpblksXG4gICAgICBsZWZ0OiByZWN0LmxlZnQgKyB3aW5YXG4gICAgfSxcbiAgICBwYXJlbnREaW1zOiB7XG4gICAgICB3aWR0aDogcGFyUmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogcGFyUmVjdC5oZWlnaHQsXG4gICAgICBvZmZzZXQ6IHtcbiAgICAgICAgdG9wOiBwYXJSZWN0LnRvcCArIHdpblksXG4gICAgICAgIGxlZnQ6IHBhclJlY3QubGVmdCArIHdpblhcbiAgICAgIH1cbiAgICB9LFxuICAgIHdpbmRvd0RpbXM6IHtcbiAgICAgIHdpZHRoOiB3aW5SZWN0LndpZHRoLFxuICAgICAgaGVpZ2h0OiB3aW5SZWN0LmhlaWdodCxcbiAgICAgIG9mZnNldDoge1xuICAgICAgICB0b3A6IHdpblksXG4gICAgICAgIGxlZnQ6IHdpblhcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3Qgb2YgdG9wIGFuZCBsZWZ0IGludGVnZXIgcGl4ZWwgdmFsdWVzIGZvciBkeW5hbWljYWxseSByZW5kZXJlZCBlbGVtZW50cyxcbiAqIHN1Y2ggYXM6IFRvb2x0aXAsIFJldmVhbCwgYW5kIERyb3Bkb3duLiBNYWludGFpbmVkIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSwgYW5kIHdoZXJlXG4gKiB5b3UgZG9uJ3Qga25vdyBhbGlnbm1lbnQsIGJ1dCBnZW5lcmFsbHkgZnJvbVxuICogNi40IGZvcndhcmQgeW91IHNob3VsZCB1c2UgR2V0RXhwbGljaXRPZmZzZXRzLCBhcyBHZXRPZmZzZXRzIGNvbmZsYXRlcyBwb3NpdGlvbiBhbmQgYWxpZ25tZW50LlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBlbGVtZW50IGJlaW5nIHBvc2l0aW9uZWQuXG4gKiBAcGFyYW0ge2pRdWVyeX0gYW5jaG9yIC0galF1ZXJ5IG9iamVjdCBmb3IgdGhlIGVsZW1lbnQncyBhbmNob3IgcG9pbnQuXG4gKiBAcGFyYW0ge1N0cmluZ30gcG9zaXRpb24gLSBhIHN0cmluZyByZWxhdGluZyB0byB0aGUgZGVzaXJlZCBwb3NpdGlvbiBvZiB0aGUgZWxlbWVudCwgcmVsYXRpdmUgdG8gaXQncyBhbmNob3JcbiAqIEBwYXJhbSB7TnVtYmVyfSB2T2Zmc2V0IC0gaW50ZWdlciBwaXhlbCB2YWx1ZSBvZiBkZXNpcmVkIHZlcnRpY2FsIHNlcGFyYXRpb24gYmV0d2VlbiBhbmNob3IgYW5kIGVsZW1lbnQuXG4gKiBAcGFyYW0ge051bWJlcn0gaE9mZnNldCAtIGludGVnZXIgcGl4ZWwgdmFsdWUgb2YgZGVzaXJlZCBob3Jpem9udGFsIHNlcGFyYXRpb24gYmV0d2VlbiBhbmNob3IgYW5kIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzT3ZlcmZsb3cgLSBpZiBhIGNvbGxpc2lvbiBldmVudCBpcyBkZXRlY3RlZCwgc2V0cyB0byB0cnVlIHRvIGRlZmF1bHQgdGhlIGVsZW1lbnQgdG8gZnVsbCB3aWR0aCAtIGFueSBkZXNpcmVkIG9mZnNldC5cbiAqIFRPRE8gYWx0ZXIvcmV3cml0ZSB0byB3b3JrIHdpdGggYGVtYCB2YWx1ZXMgYXMgd2VsbC9pbnN0ZWFkIG9mIHBpeGVsc1xuICovXG5mdW5jdGlvbiBHZXRPZmZzZXRzKGVsZW1lbnQsIGFuY2hvciwgcG9zaXRpb24sIHZPZmZzZXQsIGhPZmZzZXQsIGlzT3ZlcmZsb3cpIHtcbiAgY29uc29sZS5sb2coXCJOT1RFOiBHZXRPZmZzZXRzIGlzIGRlcHJlY2F0ZWQgaW4gZmF2b3Igb2YgR2V0RXhwbGljaXRPZmZzZXRzIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gNi41XCIpO1xuICBzd2l0Y2ggKHBvc2l0aW9uKSB7XG4gICAgY2FzZSAndG9wJzpcbiAgICAgIHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLmkoX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX3V0aWxfY29yZV9fW1wicnRsXCJdKSgpID8gR2V0RXhwbGljaXRPZmZzZXRzKGVsZW1lbnQsIGFuY2hvciwgJ3RvcCcsICdsZWZ0Jywgdk9mZnNldCwgaE9mZnNldCwgaXNPdmVyZmxvdykgOiBHZXRFeHBsaWNpdE9mZnNldHMoZWxlbWVudCwgYW5jaG9yLCAndG9wJywgJ3JpZ2h0Jywgdk9mZnNldCwgaE9mZnNldCwgaXNPdmVyZmxvdyk7XG4gICAgY2FzZSAnYm90dG9tJzpcbiAgICAgIHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLmkoX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX3V0aWxfY29yZV9fW1wicnRsXCJdKSgpID8gR2V0RXhwbGljaXRPZmZzZXRzKGVsZW1lbnQsIGFuY2hvciwgJ2JvdHRvbScsICdsZWZ0Jywgdk9mZnNldCwgaE9mZnNldCwgaXNPdmVyZmxvdykgOiBHZXRFeHBsaWNpdE9mZnNldHMoZWxlbWVudCwgYW5jaG9yLCAnYm90dG9tJywgJ3JpZ2h0Jywgdk9mZnNldCwgaE9mZnNldCwgaXNPdmVyZmxvdyk7XG4gICAgY2FzZSAnY2VudGVyIHRvcCc6XG4gICAgICByZXR1cm4gR2V0RXhwbGljaXRPZmZzZXRzKGVsZW1lbnQsIGFuY2hvciwgJ3RvcCcsICdjZW50ZXInLCB2T2Zmc2V0LCBoT2Zmc2V0LCBpc092ZXJmbG93KTtcbiAgICBjYXNlICdjZW50ZXIgYm90dG9tJzpcbiAgICAgIHJldHVybiBHZXRFeHBsaWNpdE9mZnNldHMoZWxlbWVudCwgYW5jaG9yLCAnYm90dG9tJywgJ2NlbnRlcicsIHZPZmZzZXQsIGhPZmZzZXQsIGlzT3ZlcmZsb3cpO1xuICAgIGNhc2UgJ2NlbnRlciBsZWZ0JzpcbiAgICAgIHJldHVybiBHZXRFeHBsaWNpdE9mZnNldHMoZWxlbWVudCwgYW5jaG9yLCAnbGVmdCcsICdjZW50ZXInLCB2T2Zmc2V0LCBoT2Zmc2V0LCBpc092ZXJmbG93KTtcbiAgICBjYXNlICdjZW50ZXIgcmlnaHQnOlxuICAgICAgcmV0dXJuIEdldEV4cGxpY2l0T2Zmc2V0cyhlbGVtZW50LCBhbmNob3IsICdyaWdodCcsICdjZW50ZXInLCB2T2Zmc2V0LCBoT2Zmc2V0LCBpc092ZXJmbG93KTtcbiAgICBjYXNlICdsZWZ0IGJvdHRvbSc6XG4gICAgICByZXR1cm4gR2V0RXhwbGljaXRPZmZzZXRzKGVsZW1lbnQsIGFuY2hvciwgJ2JvdHRvbScsICdsZWZ0Jywgdk9mZnNldCwgaE9mZnNldCwgaXNPdmVyZmxvdyk7XG4gICAgY2FzZSAncmlnaHQgYm90dG9tJzpcbiAgICAgIHJldHVybiBHZXRFeHBsaWNpdE9mZnNldHMoZWxlbWVudCwgYW5jaG9yLCAnYm90dG9tJywgJ3JpZ2h0Jywgdk9mZnNldCwgaE9mZnNldCwgaXNPdmVyZmxvdyk7XG4gICAgLy8gQmFja3dhcmRzIGNvbXBhdGliaWxpdHkuLi4gdGhpcyBhbG9uZyB3aXRoIHRoZSByZXZlYWwgYW5kIHJldmVhbCBmdWxsXG4gICAgLy8gY2xhc3NlcyBhcmUgdGhlIG9ubHkgb25lcyB0aGF0IGRpZG4ndCByZWZlcmVuY2UgYW5jaG9yXG4gICAgY2FzZSAnY2VudGVyJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQgKyAkZWxlRGltcy53aW5kb3dEaW1zLndpZHRoIC8gMiAtICRlbGVEaW1zLndpZHRoIC8gMiArIGhPZmZzZXQsXG4gICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgJGVsZURpbXMud2luZG93RGltcy5oZWlnaHQgLyAyIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIgKyB2T2Zmc2V0KVxuICAgICAgfTtcbiAgICBjYXNlICdyZXZlYWwnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGggLSAkZWxlRGltcy53aWR0aCkgLyAyICsgaE9mZnNldCxcbiAgICAgICAgdG9wOiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3AgKyB2T2Zmc2V0XG4gICAgICB9O1xuICAgIGNhc2UgJ3JldmVhbCBmdWxsJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wXG4gICAgICB9O1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IF9fd2VicGFja19yZXF1aXJlX18uaShfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fdXRpbF9jb3JlX19bXCJydGxcIl0pKCkgPyAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICRlbGVEaW1zLndpZHRoICsgJGFuY2hvckRpbXMud2lkdGggLSBoT2Zmc2V0IDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyBoT2Zmc2V0LFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICB9O1xuXG4gIH1cbn1cblxuZnVuY3Rpb24gR2V0RXhwbGljaXRPZmZzZXRzKGVsZW1lbnQsIGFuY2hvciwgcG9zaXRpb24sIGFsaWdubWVudCwgdk9mZnNldCwgaE9mZnNldCwgaXNPdmVyZmxvdykge1xuICB2YXIgJGVsZURpbXMgPSBHZXREaW1lbnNpb25zKGVsZW1lbnQpLFxuICAgICAgJGFuY2hvckRpbXMgPSBhbmNob3IgPyBHZXREaW1lbnNpb25zKGFuY2hvcikgOiBudWxsO1xuXG4gIHZhciB0b3BWYWwsIGxlZnRWYWw7XG5cbiAgLy8gc2V0IHBvc2l0aW9uIHJlbGF0ZWQgYXR0cmlidXRlXG5cbiAgc3dpdGNoIChwb3NpdGlvbikge1xuICAgIGNhc2UgJ3RvcCc6XG4gICAgICB0b3BWYWwgPSAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYm90dG9tJzpcbiAgICAgIHRvcFZhbCA9ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbGVmdCc6XG4gICAgICBsZWZ0VmFsID0gJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAoJGVsZURpbXMud2lkdGggKyBoT2Zmc2V0KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgIGxlZnRWYWwgPSAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldDtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgLy8gc2V0IGFsaWdubWVudCByZWxhdGVkIGF0dHJpYnV0ZVxuICBzd2l0Y2ggKHBvc2l0aW9uKSB7XG4gICAgY2FzZSAndG9wJzpcbiAgICBjYXNlICdib3R0b20nOlxuICAgICAgc3dpdGNoIChhbGlnbm1lbnQpIHtcbiAgICAgICAgY2FzZSAnbGVmdCc6XG4gICAgICAgICAgbGVmdFZhbCA9ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgaE9mZnNldDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncmlnaHQnOlxuICAgICAgICAgIGxlZnRWYWwgPSAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICRlbGVEaW1zLndpZHRoICsgJGFuY2hvckRpbXMud2lkdGggLSBoT2Zmc2V0O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjZW50ZXInOlxuICAgICAgICAgIGxlZnRWYWwgPSBpc092ZXJmbG93ID8gaE9mZnNldCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggLyAyIC0gJGVsZURpbXMud2lkdGggLyAyICsgaE9mZnNldDtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIHN3aXRjaCAoYWxpZ25tZW50KSB7XG4gICAgICAgIGNhc2UgJ2JvdHRvbSc6XG4gICAgICAgICAgdG9wVmFsID0gJGFuY2hvckRpbXMub2Zmc2V0LnRvcCAtIHZPZmZzZXQgKyAkYW5jaG9yRGltcy5oZWlnaHQgLSAkZWxlRGltcy5oZWlnaHQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3RvcCc6XG4gICAgICAgICAgdG9wVmFsID0gJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArIHZPZmZzZXQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NlbnRlcic6XG4gICAgICAgICAgdG9wVmFsID0gJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArIHZPZmZzZXQgKyAkYW5jaG9yRGltcy5oZWlnaHQgLyAyIC0gJGVsZURpbXMuaGVpZ2h0IC8gMjtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiB7IHRvcDogdG9wVmFsLCBsZWZ0OiBsZWZ0VmFsIH07XG59XG5cblxuXG4vKioqLyB9KVxuXG4vKioqKioqLyB9KTsiLCIhZnVuY3Rpb24odCl7ZnVuY3Rpb24gZShpKXtpZihvW2ldKXJldHVybiBvW2ldLmV4cG9ydHM7dmFyIG49b1tpXT17aTppLGw6ITEsZXhwb3J0czp7fX07cmV0dXJuIHRbaV0uY2FsbChuLmV4cG9ydHMsbixuLmV4cG9ydHMsZSksbi5sPSEwLG4uZXhwb3J0c312YXIgbz17fTtlLm09dCxlLmM9byxlLmk9ZnVuY3Rpb24odCl7cmV0dXJuIHR9LGUuZD1mdW5jdGlvbih0LG8saSl7ZS5vKHQsbyl8fE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LG8se2NvbmZpZ3VyYWJsZTohMSxlbnVtZXJhYmxlOiEwLGdldDppfSl9LGUubj1mdW5jdGlvbih0KXt2YXIgbz10JiZ0Ll9fZXNNb2R1bGU/ZnVuY3Rpb24oKXtyZXR1cm4gdC5kZWZhdWx0fTpmdW5jdGlvbigpe3JldHVybiB0fTtyZXR1cm4gZS5kKG8sXCJhXCIsbyksb30sZS5vPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0LGUpfSxlLnA9XCJcIixlKGUucz0xMDApfSh7MTpmdW5jdGlvbih0LGUpe3QuZXhwb3J0cz17Rm91bmRhdGlvbjp3aW5kb3cuRm91bmRhdGlvbn19LDEwMDpmdW5jdGlvbih0LGUsbyl7dC5leHBvcnRzPW8oMzQpfSwzOmZ1bmN0aW9uKHQsZSl7dC5leHBvcnRzPXtydGw6d2luZG93LkZvdW5kYXRpb24ucnRsLEdldFlvRGlnaXRzOndpbmRvdy5Gb3VuZGF0aW9uLkdldFlvRGlnaXRzLHRyYW5zaXRpb25lbmQ6d2luZG93LkZvdW5kYXRpb24udHJhbnNpdGlvbmVuZH19LDM0OmZ1bmN0aW9uKHQsZSxvKXtcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgaT1vKDEpLG49KG8ubihpKSxvKDY0KSk7aS5Gb3VuZGF0aW9uLkJveD1uLmF9LDY0OmZ1bmN0aW9uKHQsZSxvKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBpKHQsZSxvLGksZil7cmV0dXJuIDA9PT1uKHQsZSxvLGksZil9ZnVuY3Rpb24gbih0LGUsbyxpLG4pe3ZhciBzLHIsaCxhLGM9Zih0KTtpZihlKXt2YXIgbD1mKGUpO3I9bC5oZWlnaHQrbC5vZmZzZXQudG9wLShjLm9mZnNldC50b3ArYy5oZWlnaHQpLHM9Yy5vZmZzZXQudG9wLWwub2Zmc2V0LnRvcCxoPWMub2Zmc2V0LmxlZnQtbC5vZmZzZXQubGVmdCxhPWwud2lkdGgrbC5vZmZzZXQubGVmdC0oYy5vZmZzZXQubGVmdCtjLndpZHRoKX1lbHNlIHI9Yy53aW5kb3dEaW1zLmhlaWdodCtjLndpbmRvd0RpbXMub2Zmc2V0LnRvcC0oYy5vZmZzZXQudG9wK2MuaGVpZ2h0KSxzPWMub2Zmc2V0LnRvcC1jLndpbmRvd0RpbXMub2Zmc2V0LnRvcCxoPWMub2Zmc2V0LmxlZnQtYy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0LGE9Yy53aW5kb3dEaW1zLndpZHRoLShjLm9mZnNldC5sZWZ0K2Mud2lkdGgpO3JldHVybiByPW4/MDpNYXRoLm1pbihyLDApLHM9TWF0aC5taW4ocywwKSxoPU1hdGgubWluKGgsMCksYT1NYXRoLm1pbihhLDApLG8/aCthOmk/cytyOk1hdGguc3FydChzKnMrcipyK2gqaCthKmEpfWZ1bmN0aW9uIGYodCl7aWYoKHQ9dC5sZW5ndGg/dFswXTp0KT09PXdpbmRvd3x8dD09PWRvY3VtZW50KXRocm93IG5ldyBFcnJvcihcIkknbSBzb3JyeSwgRGF2ZS4gSSdtIGFmcmFpZCBJIGNhbid0IGRvIHRoYXQuXCIpO3ZhciBlPXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksbz10LnBhcmVudE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksaT1kb2N1bWVudC5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLG49d2luZG93LnBhZ2VZT2Zmc2V0LGY9d2luZG93LnBhZ2VYT2Zmc2V0O3JldHVybnt3aWR0aDplLndpZHRoLGhlaWdodDplLmhlaWdodCxvZmZzZXQ6e3RvcDplLnRvcCtuLGxlZnQ6ZS5sZWZ0K2Z9LHBhcmVudERpbXM6e3dpZHRoOm8ud2lkdGgsaGVpZ2h0Om8uaGVpZ2h0LG9mZnNldDp7dG9wOm8udG9wK24sbGVmdDpvLmxlZnQrZn19LHdpbmRvd0RpbXM6e3dpZHRoOmkud2lkdGgsaGVpZ2h0OmkuaGVpZ2h0LG9mZnNldDp7dG9wOm4sbGVmdDpmfX19fWZ1bmN0aW9uIHModCxlLGksbixmLHMpe3N3aXRjaChjb25zb2xlLmxvZyhcIk5PVEU6IEdldE9mZnNldHMgaXMgZGVwcmVjYXRlZCBpbiBmYXZvciBvZiBHZXRFeHBsaWNpdE9mZnNldHMgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiA2LjVcIiksaSl7Y2FzZVwidG9wXCI6cmV0dXJuIG8uaShoLnJ0bCkoKT9yKHQsZSxcInRvcFwiLFwibGVmdFwiLG4sZixzKTpyKHQsZSxcInRvcFwiLFwicmlnaHRcIixuLGYscyk7Y2FzZVwiYm90dG9tXCI6cmV0dXJuIG8uaShoLnJ0bCkoKT9yKHQsZSxcImJvdHRvbVwiLFwibGVmdFwiLG4sZixzKTpyKHQsZSxcImJvdHRvbVwiLFwicmlnaHRcIixuLGYscyk7Y2FzZVwiY2VudGVyIHRvcFwiOnJldHVybiByKHQsZSxcInRvcFwiLFwiY2VudGVyXCIsbixmLHMpO2Nhc2VcImNlbnRlciBib3R0b21cIjpyZXR1cm4gcih0LGUsXCJib3R0b21cIixcImNlbnRlclwiLG4sZixzKTtjYXNlXCJjZW50ZXIgbGVmdFwiOnJldHVybiByKHQsZSxcImxlZnRcIixcImNlbnRlclwiLG4sZixzKTtjYXNlXCJjZW50ZXIgcmlnaHRcIjpyZXR1cm4gcih0LGUsXCJyaWdodFwiLFwiY2VudGVyXCIsbixmLHMpO2Nhc2VcImxlZnQgYm90dG9tXCI6cmV0dXJuIHIodCxlLFwiYm90dG9tXCIsXCJsZWZ0XCIsbixmLHMpO2Nhc2VcInJpZ2h0IGJvdHRvbVwiOnJldHVybiByKHQsZSxcImJvdHRvbVwiLFwicmlnaHRcIixuLGYscyk7Y2FzZVwiY2VudGVyXCI6cmV0dXJue2xlZnQ6JGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCskZWxlRGltcy53aW5kb3dEaW1zLndpZHRoLzItJGVsZURpbXMud2lkdGgvMitmLHRvcDokZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3ArJGVsZURpbXMud2luZG93RGltcy5oZWlnaHQvMi0oJGVsZURpbXMuaGVpZ2h0LzIrbil9O2Nhc2VcInJldmVhbFwiOnJldHVybntsZWZ0OigkZWxlRGltcy53aW5kb3dEaW1zLndpZHRoLSRlbGVEaW1zLndpZHRoKS8yK2YsdG9wOiRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCtufTtjYXNlXCJyZXZlYWwgZnVsbFwiOnJldHVybntsZWZ0OiRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQsdG9wOiRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcH07ZGVmYXVsdDpyZXR1cm57bGVmdDpvLmkoaC5ydGwpKCk/JGFuY2hvckRpbXMub2Zmc2V0LmxlZnQtJGVsZURpbXMud2lkdGgrJGFuY2hvckRpbXMud2lkdGgtZjokYW5jaG9yRGltcy5vZmZzZXQubGVmdCtmLHRvcDokYW5jaG9yRGltcy5vZmZzZXQudG9wKyRhbmNob3JEaW1zLmhlaWdodCtufX19ZnVuY3Rpb24gcih0LGUsbyxpLG4scyxyKXt2YXIgaCxhLGM9Zih0KSxsPWU/ZihlKTpudWxsO3N3aXRjaChvKXtjYXNlXCJ0b3BcIjpoPWwub2Zmc2V0LnRvcC0oYy5oZWlnaHQrbik7YnJlYWs7Y2FzZVwiYm90dG9tXCI6aD1sLm9mZnNldC50b3ArbC5oZWlnaHQrbjticmVhaztjYXNlXCJsZWZ0XCI6YT1sLm9mZnNldC5sZWZ0LShjLndpZHRoK3MpO2JyZWFrO2Nhc2VcInJpZ2h0XCI6YT1sLm9mZnNldC5sZWZ0K2wud2lkdGgrc31zd2l0Y2gobyl7Y2FzZVwidG9wXCI6Y2FzZVwiYm90dG9tXCI6c3dpdGNoKGkpe2Nhc2VcImxlZnRcIjphPWwub2Zmc2V0LmxlZnQrczticmVhaztjYXNlXCJyaWdodFwiOmE9bC5vZmZzZXQubGVmdC1jLndpZHRoK2wud2lkdGgtczticmVhaztjYXNlXCJjZW50ZXJcIjphPXI/czpsLm9mZnNldC5sZWZ0K2wud2lkdGgvMi1jLndpZHRoLzIrc31icmVhaztjYXNlXCJyaWdodFwiOmNhc2VcImxlZnRcIjpzd2l0Y2goaSl7Y2FzZVwiYm90dG9tXCI6aD1sLm9mZnNldC50b3AtbitsLmhlaWdodC1jLmhlaWdodDticmVhaztjYXNlXCJ0b3BcIjpoPWwub2Zmc2V0LnRvcCtuO2JyZWFrO2Nhc2VcImNlbnRlclwiOmg9bC5vZmZzZXQudG9wK24rbC5oZWlnaHQvMi1jLmhlaWdodC8yfX1yZXR1cm57dG9wOmgsbGVmdDphfX1vLmQoZSxcImFcIixmdW5jdGlvbigpe3JldHVybiBhfSk7dmFyIGg9bygzKSxhPShvLm4oaCkse0ltTm90VG91Y2hpbmdZb3U6aSxPdmVybGFwQXJlYTpuLEdldERpbWVuc2lvbnM6ZixHZXRPZmZzZXRzOnMsR2V0RXhwbGljaXRPZmZzZXRzOnJ9KX19KTsiLCIvKioqKioqLyAoZnVuY3Rpb24obW9kdWxlcykgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbi8qKioqKiovIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuLyoqKioqKi8gXHRcdH1cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdGk6IG1vZHVsZUlkLFxuLyoqKioqKi8gXHRcdFx0bDogZmFsc2UsXG4vKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fVxuLyoqKioqKi8gXHRcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuLyoqKioqKi8gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4vKioqKioqLyBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbi8qKioqKiovIFx0fVxuLyoqKioqKi9cbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9ueSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4vKioqKioqLyBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuLyoqKioqKi8gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbi8qKioqKiovIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbi8qKioqKiovIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbi8qKioqKiovIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbi8qKioqKiovIFx0XHRcdH0pO1xuLyoqKioqKi8gXHRcdH1cbi8qKioqKiovIFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuLyoqKioqKi8gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuLyoqKioqKi8gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbi8qKioqKiovIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4vKioqKioqLyBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuLyoqKioqKi8gXHRcdHJldHVybiBnZXR0ZXI7XG4vKioqKioqLyBcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAxMDEpO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoe1xuXG4vKioqLyAwOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IGpRdWVyeTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDE6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0ge0ZvdW5kYXRpb246IHdpbmRvdy5Gb3VuZGF0aW9ufTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDEwMTpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxubW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDM1KTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gMzU6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBfX3dlYnBhY2tfZXhwb3J0c19fLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KF9fd2VicGFja19leHBvcnRzX18sIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fZm91bmRhdGlvbl9jb3JlX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fZm91bmRhdGlvbl9jb3JlX19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fdXRpbF9pbWFnZUxvYWRlcl9fID0gX193ZWJwYWNrX3JlcXVpcmVfXyg2NSk7XG5cblxuXG5cbl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fZm91bmRhdGlvbl9jb3JlX19bXCJGb3VuZGF0aW9uXCJdLm9uSW1hZ2VzTG9hZGVkID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfaW1hZ2VMb2FkZXJfX1tcImFcIiAvKiBvbkltYWdlc0xvYWRlZCAqL107XG5cbi8qKiovIH0pLFxuXG4vKioqLyA2NTpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIF9fd2VicGFja19leHBvcnRzX18sIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG4vKiBoYXJtb255IGV4cG9ydCAoYmluZGluZykgKi8gX193ZWJwYWNrX3JlcXVpcmVfXy5kKF9fd2VicGFja19leHBvcnRzX18sIFwiYVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIG9uSW1hZ2VzTG9hZGVkOyB9KTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfXyk7XG5cblxuXG5cbi8qKlxuICogUnVucyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gaW1hZ2VzIGFyZSBmdWxseSBsb2FkZWQuXG4gKiBAcGFyYW0ge09iamVjdH0gaW1hZ2VzIC0gSW1hZ2UocykgdG8gY2hlY2sgaWYgbG9hZGVkLlxuICogQHBhcmFtIHtGdW5jfSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBpbWFnZSBpcyBmdWxseSBsb2FkZWQuXG4gKi9cbmZ1bmN0aW9uIG9uSW1hZ2VzTG9hZGVkKGltYWdlcywgY2FsbGJhY2spIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgdW5sb2FkZWQgPSBpbWFnZXMubGVuZ3RoO1xuXG4gIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cblxuICBpbWFnZXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgLy8gQ2hlY2sgaWYgaW1hZ2UgaXMgbG9hZGVkXG4gICAgaWYgKHRoaXMuY29tcGxldGUgJiYgdGhpcy5uYXR1cmFsV2lkdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgdGhlIGFib3ZlIGNoZWNrIGZhaWxlZCwgc2ltdWxhdGUgbG9hZGluZyBvbiBkZXRhY2hlZCBlbGVtZW50LlxuICAgICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICAvLyBTdGlsbCBjb3VudCBpbWFnZSBhcyBsb2FkZWQgaWYgaXQgZmluYWxpemVzIHdpdGggYW4gZXJyb3IuXG4gICAgICB2YXIgZXZlbnRzID0gXCJsb2FkLnpmLmltYWdlcyBlcnJvci56Zi5pbWFnZXNcIjtcbiAgICAgIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkoaW1hZ2UpLm9uZShldmVudHMsIGZ1bmN0aW9uIG1lKGV2ZW50KSB7XG4gICAgICAgIC8vIFVuYmluZCB0aGUgZXZlbnQgbGlzdGVuZXJzLiBXZSdyZSB1c2luZyAnb25lJyBidXQgb25seSBvbmUgb2YgdGhlIHR3byBldmVudHMgd2lsbCBoYXZlIGZpcmVkLlxuICAgICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHRoaXMpLm9mZihldmVudHMsIG1lKTtcbiAgICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICAgIH0pO1xuICAgICAgaW1hZ2Uuc3JjID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh0aGlzKS5hdHRyKCdzcmMnKTtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHNpbmdsZUltYWdlTG9hZGVkKCkge1xuICAgIHVubG9hZGVkLS07XG4gICAgaWYgKHVubG9hZGVkID09PSAwKSB7XG4gICAgICBjYWxsYmFjaygpO1xuICAgIH1cbiAgfVxufVxuXG5cblxuLyoqKi8gfSlcblxuLyoqKioqKi8gfSk7IiwiIWZ1bmN0aW9uKG4pe2Z1bmN0aW9uIHQobyl7aWYoZVtvXSlyZXR1cm4gZVtvXS5leHBvcnRzO3ZhciByPWVbb109e2k6byxsOiExLGV4cG9ydHM6e319O3JldHVybiBuW29dLmNhbGwoci5leHBvcnRzLHIsci5leHBvcnRzLHQpLHIubD0hMCxyLmV4cG9ydHN9dmFyIGU9e307dC5tPW4sdC5jPWUsdC5pPWZ1bmN0aW9uKG4pe3JldHVybiBufSx0LmQ9ZnVuY3Rpb24obixlLG8pe3QubyhuLGUpfHxPYmplY3QuZGVmaW5lUHJvcGVydHkobixlLHtjb25maWd1cmFibGU6ITEsZW51bWVyYWJsZTohMCxnZXQ6b30pfSx0Lm49ZnVuY3Rpb24obil7dmFyIGU9biYmbi5fX2VzTW9kdWxlP2Z1bmN0aW9uKCl7cmV0dXJuIG4uZGVmYXVsdH06ZnVuY3Rpb24oKXtyZXR1cm4gbn07cmV0dXJuIHQuZChlLFwiYVwiLGUpLGV9LHQubz1mdW5jdGlvbihuLHQpe3JldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobix0KX0sdC5wPVwiXCIsdCh0LnM9MTAxKX0oezA6ZnVuY3Rpb24obix0KXtuLmV4cG9ydHM9alF1ZXJ5fSwxOmZ1bmN0aW9uKG4sdCl7bi5leHBvcnRzPXtGb3VuZGF0aW9uOndpbmRvdy5Gb3VuZGF0aW9ufX0sMTAxOmZ1bmN0aW9uKG4sdCxlKXtuLmV4cG9ydHM9ZSgzNSl9LDM1OmZ1bmN0aW9uKG4sdCxlKXtcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgbz1lKDEpLHI9KGUubihvKSxlKDY1KSk7by5Gb3VuZGF0aW9uLm9uSW1hZ2VzTG9hZGVkPXIuYX0sNjU6ZnVuY3Rpb24obix0LGUpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG8obix0KXtmdW5jdGlvbiBlKCl7MD09PS0tbyYmdCgpfXZhciBvPW4ubGVuZ3RoOzA9PT1vJiZ0KCksbi5lYWNoKGZ1bmN0aW9uKCl7aWYodGhpcy5jb21wbGV0ZSYmdm9pZCAwIT09dGhpcy5uYXR1cmFsV2lkdGgpZSgpO2Vsc2V7dmFyIG49bmV3IEltYWdlLHQ9XCJsb2FkLnpmLmltYWdlcyBlcnJvci56Zi5pbWFnZXNcIjtpKCkobikub25lKHQsZnVuY3Rpb24gbihvKXtpKCkodGhpcykub2ZmKHQsbiksZSgpfSksbi5zcmM9aSgpKHRoaXMpLmF0dHIoXCJzcmNcIil9fSl9ZS5kKHQsXCJhXCIsZnVuY3Rpb24oKXtyZXR1cm4gb30pO3ZhciByPWUoMCksaT1lLm4ocil9fSk7IiwiLyoqKioqKi8gKGZ1bmN0aW9uKG1vZHVsZXMpIHsgLy8gd2VicGFja0Jvb3RzdHJhcFxuLyoqKioqKi8gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuLyoqKioqKi8gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4vKioqKioqLyBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbi8qKioqKiovIFx0XHR9XG4vKioqKioqLyBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbi8qKioqKiovIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHRpOiBtb2R1bGVJZCxcbi8qKioqKiovIFx0XHRcdGw6IGZhbHNlLFxuLyoqKioqKi8gXHRcdFx0ZXhwb3J0czoge31cbi8qKioqKiovIFx0XHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuLyoqKioqKi8gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbi8qKioqKiovIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdH1cbi8qKioqKiovXG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGlkZW50aXR5IGZ1bmN0aW9uIGZvciBjYWxsaW5nIGhhcm1vbnkgaW1wb3J0cyB3aXRoIHRoZSBjb3JyZWN0IGNvbnRleHRcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuLyoqKioqKi8gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbi8qKioqKiovIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4vKioqKioqLyBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4vKioqKioqLyBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4vKioqKioqLyBcdFx0XHRcdGdldDogZ2V0dGVyXG4vKioqKioqLyBcdFx0XHR9KTtcbi8qKioqKiovIFx0XHR9XG4vKioqKioqLyBcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbi8qKioqKiovIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbi8qKioqKiovIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4vKioqKioqLyBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbi8qKioqKiovIFx0XHRyZXR1cm4gZ2V0dGVyO1xuLyoqKioqKi8gXHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8qKioqKiovIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMTAyKTtcbi8qKioqKiovIH0pXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gKHtcblxuLyoqKi8gMDpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSBqUXVlcnk7XG5cbi8qKiovIH0pLFxuXG4vKioqLyAxOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtGb3VuZGF0aW9uOiB3aW5kb3cuRm91bmRhdGlvbn07XG5cbi8qKiovIH0pLFxuXG4vKioqLyAxMDI6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3JlcXVpcmVfXygzNik7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDM6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0ge3J0bDogd2luZG93LkZvdW5kYXRpb24ucnRsLCBHZXRZb0RpZ2l0czogd2luZG93LkZvdW5kYXRpb24uR2V0WW9EaWdpdHMsIHRyYW5zaXRpb25lbmQ6IHdpbmRvdy5Gb3VuZGF0aW9uLnRyYW5zaXRpb25lbmR9O1xuXG4vKioqLyB9KSxcblxuLyoqKi8gMzY6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBfX3dlYnBhY2tfZXhwb3J0c19fLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KF9fd2VicGFja19leHBvcnRzX18sIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fZm91bmRhdGlvbl9jb3JlX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fZm91bmRhdGlvbl9jb3JlX19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fdXRpbF9rZXlib2FyZF9fID0gX193ZWJwYWNrX3JlcXVpcmVfXyg2Nik7XG5cblxuXG5fX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fW1wiRm91bmRhdGlvblwiXS5LZXlib2FyZCA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX2tleWJvYXJkX19bXCJhXCIgLyogS2V5Ym9hcmQgKi9dO1xuXG4vKioqLyB9KSxcblxuLyoqKi8gNjY6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBfX3dlYnBhY2tfZXhwb3J0c19fLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuLyogaGFybW9ueSBleHBvcnQgKGJpbmRpbmcpICovIF9fd2VicGFja19yZXF1aXJlX18uZChfX3dlYnBhY2tfZXhwb3J0c19fLCBcImFcIiwgZnVuY3Rpb24oKSB7IHJldHVybiBLZXlib2FyZDsgfSk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X18pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX2NvcmVfXyA9IF9fd2VicGFja19yZXF1aXJlX18oMyk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfY29yZV9fX2RlZmF1bHQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLm4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfY29yZV9fKTtcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICogVGhpcyB1dGlsIHdhcyBjcmVhdGVkIGJ5IE1hcml1cyBPbGJlcnR6ICpcbiAqIFBsZWFzZSB0aGFuayBNYXJpdXMgb24gR2l0SHViIC9vd2xiZXJ0eiAqXG4gKiBvciB0aGUgd2ViIGh0dHA6Ly93d3cubWFyaXVzb2xiZXJ0ei5kZS8gKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuXG5cblxuXG52YXIga2V5Q29kZXMgPSB7XG4gIDk6ICdUQUInLFxuICAxMzogJ0VOVEVSJyxcbiAgMjc6ICdFU0NBUEUnLFxuICAzMjogJ1NQQUNFJyxcbiAgMzU6ICdFTkQnLFxuICAzNjogJ0hPTUUnLFxuICAzNzogJ0FSUk9XX0xFRlQnLFxuICAzODogJ0FSUk9XX1VQJyxcbiAgMzk6ICdBUlJPV19SSUdIVCcsXG4gIDQwOiAnQVJST1dfRE9XTidcbn07XG5cbnZhciBjb21tYW5kcyA9IHt9O1xuXG4vLyBGdW5jdGlvbnMgcHVsbGVkIG91dCB0byBiZSByZWZlcmVuY2VhYmxlIGZyb20gaW50ZXJuYWxzXG5mdW5jdGlvbiBmaW5kRm9jdXNhYmxlKCRlbGVtZW50KSB7XG4gIGlmICghJGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuICRlbGVtZW50LmZpbmQoJ2FbaHJlZl0sIGFyZWFbaHJlZl0sIGlucHV0Om5vdChbZGlzYWJsZWRdKSwgc2VsZWN0Om5vdChbZGlzYWJsZWRdKSwgdGV4dGFyZWE6bm90KFtkaXNhYmxlZF0pLCBidXR0b246bm90KFtkaXNhYmxlZF0pLCBpZnJhbWUsIG9iamVjdCwgZW1iZWQsICpbdGFiaW5kZXhdLCAqW2NvbnRlbnRlZGl0YWJsZV0nKS5maWx0ZXIoZnVuY3Rpb24gKCkge1xuICAgIGlmICghX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh0aGlzKS5pcygnOnZpc2libGUnKSB8fCBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHRoaXMpLmF0dHIoJ3RhYmluZGV4JykgPCAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSAvL29ubHkgaGF2ZSB2aXNpYmxlIGVsZW1lbnRzIGFuZCB0aG9zZSB0aGF0IGhhdmUgYSB0YWJpbmRleCBncmVhdGVyIG9yIGVxdWFsIDBcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlS2V5KGV2ZW50KSB7XG4gIHZhciBrZXkgPSBrZXlDb2Rlc1tldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlXSB8fCBTdHJpbmcuZnJvbUNoYXJDb2RlKGV2ZW50LndoaWNoKS50b1VwcGVyQ2FzZSgpO1xuXG4gIC8vIFJlbW92ZSB1bi1wcmludGFibGUgY2hhcmFjdGVycywgZS5nLiBmb3IgYGZyb21DaGFyQ29kZWAgY2FsbHMgZm9yIENUUkwgb25seSBldmVudHNcbiAga2V5ID0ga2V5LnJlcGxhY2UoL1xcVysvLCAnJyk7XG5cbiAgaWYgKGV2ZW50LnNoaWZ0S2V5KSBrZXkgPSAnU0hJRlRfJyArIGtleTtcbiAgaWYgKGV2ZW50LmN0cmxLZXkpIGtleSA9ICdDVFJMXycgKyBrZXk7XG4gIGlmIChldmVudC5hbHRLZXkpIGtleSA9ICdBTFRfJyArIGtleTtcblxuICAvLyBSZW1vdmUgdHJhaWxpbmcgdW5kZXJzY29yZSwgaW4gY2FzZSBvbmx5IG1vZGlmaWVycyB3ZXJlIHVzZWQgKGUuZy4gb25seSBgQ1RSTF9BTFRgKVxuICBrZXkgPSBrZXkucmVwbGFjZSgvXyQvLCAnJyk7XG5cbiAgcmV0dXJuIGtleTtcbn1cblxudmFyIEtleWJvYXJkID0ge1xuICBrZXlzOiBnZXRLZXlDb2RlcyhrZXlDb2RlcyksXG5cbiAgLyoqXG4gICAqIFBhcnNlcyB0aGUgKGtleWJvYXJkKSBldmVudCBhbmQgcmV0dXJucyBhIFN0cmluZyB0aGF0IHJlcHJlc2VudHMgaXRzIGtleVxuICAgKiBDYW4gYmUgdXNlZCBsaWtlIEZvdW5kYXRpb24ucGFyc2VLZXkoZXZlbnQpID09PSBGb3VuZGF0aW9uLmtleXMuU1BBQ0VcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSB0aGUgZXZlbnQgZ2VuZXJhdGVkIGJ5IHRoZSBldmVudCBoYW5kbGVyXG4gICAqIEByZXR1cm4gU3RyaW5nIGtleSAtIFN0cmluZyB0aGF0IHJlcHJlc2VudHMgdGhlIGtleSBwcmVzc2VkXG4gICAqL1xuICBwYXJzZUtleTogcGFyc2VLZXksXG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIGdpdmVuIChrZXlib2FyZCkgZXZlbnRcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSB0aGUgZXZlbnQgZ2VuZXJhdGVkIGJ5IHRoZSBldmVudCBoYW5kbGVyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjb21wb25lbnQgLSBGb3VuZGF0aW9uIGNvbXBvbmVudCdzIG5hbWUsIGUuZy4gU2xpZGVyIG9yIFJldmVhbFxuICAgKiBAcGFyYW0ge09iamVjdHN9IGZ1bmN0aW9ucyAtIGNvbGxlY3Rpb24gb2YgZnVuY3Rpb25zIHRoYXQgYXJlIHRvIGJlIGV4ZWN1dGVkXG4gICAqL1xuICBoYW5kbGVLZXk6IGZ1bmN0aW9uIChldmVudCwgY29tcG9uZW50LCBmdW5jdGlvbnMpIHtcbiAgICB2YXIgY29tbWFuZExpc3QgPSBjb21tYW5kc1tjb21wb25lbnRdLFxuICAgICAgICBrZXlDb2RlID0gdGhpcy5wYXJzZUtleShldmVudCksXG4gICAgICAgIGNtZHMsXG4gICAgICAgIGNvbW1hbmQsXG4gICAgICAgIGZuO1xuXG4gICAgaWYgKCFjb21tYW5kTGlzdCkgcmV0dXJuIGNvbnNvbGUud2FybignQ29tcG9uZW50IG5vdCBkZWZpbmVkIScpO1xuXG4gICAgaWYgKHR5cGVvZiBjb21tYW5kTGlzdC5sdHIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyB0aGlzIGNvbXBvbmVudCBkb2VzIG5vdCBkaWZmZXJlbnRpYXRlIGJldHdlZW4gbHRyIGFuZCBydGxcbiAgICAgIGNtZHMgPSBjb21tYW5kTGlzdDsgLy8gdXNlIHBsYWluIGxpc3RcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbWVyZ2UgbHRyIGFuZCBydGw6IGlmIGRvY3VtZW50IGlzIHJ0bCwgcnRsIG92ZXJ3cml0ZXMgbHRyIGFuZCB2aWNlIHZlcnNhXG4gICAgICBpZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5pKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX2NvcmVfX1tcInJ0bFwiXSkoKSkgY21kcyA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0LmEuZXh0ZW5kKHt9LCBjb21tYW5kTGlzdC5sdHIsIGNvbW1hbmRMaXN0LnJ0bCk7ZWxzZSBjbWRzID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQuYS5leHRlbmQoe30sIGNvbW1hbmRMaXN0LnJ0bCwgY29tbWFuZExpc3QubHRyKTtcbiAgICB9XG4gICAgY29tbWFuZCA9IGNtZHNba2V5Q29kZV07XG5cbiAgICBmbiA9IGZ1bmN0aW9uc1tjb21tYW5kXTtcbiAgICBpZiAoZm4gJiYgdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBleGVjdXRlIGZ1bmN0aW9uICBpZiBleGlzdHNcbiAgICAgIHZhciByZXR1cm5WYWx1ZSA9IGZuLmFwcGx5KCk7XG4gICAgICBpZiAoZnVuY3Rpb25zLmhhbmRsZWQgfHwgdHlwZW9mIGZ1bmN0aW9ucy5oYW5kbGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIGV4ZWN1dGUgZnVuY3Rpb24gd2hlbiBldmVudCB3YXMgaGFuZGxlZFxuICAgICAgICBmdW5jdGlvbnMuaGFuZGxlZChyZXR1cm5WYWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChmdW5jdGlvbnMudW5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMudW5oYW5kbGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIGV4ZWN1dGUgZnVuY3Rpb24gd2hlbiBldmVudCB3YXMgbm90IGhhbmRsZWRcbiAgICAgICAgZnVuY3Rpb25zLnVuaGFuZGxlZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuXG4gIC8qKlxuICAgKiBGaW5kcyBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzIHdpdGhpbiB0aGUgZ2l2ZW4gYCRlbGVtZW50YFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHNlYXJjaCB3aXRoaW5cbiAgICogQHJldHVybiB7alF1ZXJ5fSAkZm9jdXNhYmxlIC0gYWxsIGZvY3VzYWJsZSBlbGVtZW50cyB3aXRoaW4gYCRlbGVtZW50YFxuICAgKi9cblxuICBmaW5kRm9jdXNhYmxlOiBmaW5kRm9jdXNhYmxlLFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjb21wb25lbnQgbmFtZSBuYW1lXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb21wb25lbnQgLSBGb3VuZGF0aW9uIGNvbXBvbmVudCwgZS5nLiBTbGlkZXIgb3IgUmV2ZWFsXG4gICAqIEByZXR1cm4gU3RyaW5nIGNvbXBvbmVudE5hbWVcbiAgICovXG5cbiAgcmVnaXN0ZXI6IGZ1bmN0aW9uIChjb21wb25lbnROYW1lLCBjbWRzKSB7XG4gICAgY29tbWFuZHNbY29tcG9uZW50TmFtZV0gPSBjbWRzO1xuICB9LFxuXG5cbiAgLy8gVE9ETzk0Mzg6IFRoZXNlIHJlZmVyZW5jZXMgdG8gS2V5Ym9hcmQgbmVlZCB0byBub3QgcmVxdWlyZSBnbG9iYWwuIFdpbGwgJ3RoaXMnIHdvcmsgaW4gdGhpcyBjb250ZXh0P1xuICAvL1xuICAvKipcbiAgICogVHJhcHMgdGhlIGZvY3VzIGluIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgKiBAcGFyYW0gIHtqUXVlcnl9ICRlbGVtZW50ICBqUXVlcnkgb2JqZWN0IHRvIHRyYXAgdGhlIGZvdWNzIGludG8uXG4gICAqL1xuICB0cmFwRm9jdXM6IGZ1bmN0aW9uICgkZWxlbWVudCkge1xuICAgIHZhciAkZm9jdXNhYmxlID0gZmluZEZvY3VzYWJsZSgkZWxlbWVudCksXG4gICAgICAgICRmaXJzdEZvY3VzYWJsZSA9ICRmb2N1c2FibGUuZXEoMCksXG4gICAgICAgICRsYXN0Rm9jdXNhYmxlID0gJGZvY3VzYWJsZS5lcSgtMSk7XG5cbiAgICAkZWxlbWVudC5vbigna2V5ZG93bi56Zi50cmFwZm9jdXMnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC50YXJnZXQgPT09ICRsYXN0Rm9jdXNhYmxlWzBdICYmIHBhcnNlS2V5KGV2ZW50KSA9PT0gJ1RBQicpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJGZpcnN0Rm9jdXNhYmxlLmZvY3VzKCk7XG4gICAgICB9IGVsc2UgaWYgKGV2ZW50LnRhcmdldCA9PT0gJGZpcnN0Rm9jdXNhYmxlWzBdICYmIHBhcnNlS2V5KGV2ZW50KSA9PT0gJ1NISUZUX1RBQicpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJGxhc3RGb2N1c2FibGUuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogUmVsZWFzZXMgdGhlIHRyYXBwZWQgZm9jdXMgZnJvbSB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICogQHBhcmFtICB7alF1ZXJ5fSAkZWxlbWVudCAgalF1ZXJ5IG9iamVjdCB0byByZWxlYXNlIHRoZSBmb2N1cyBmb3IuXG4gICAqL1xuICByZWxlYXNlRm9jdXM6IGZ1bmN0aW9uICgkZWxlbWVudCkge1xuICAgICRlbGVtZW50Lm9mZigna2V5ZG93bi56Zi50cmFwZm9jdXMnKTtcbiAgfVxufTtcblxuLypcbiAqIENvbnN0YW50cyBmb3IgZWFzaWVyIGNvbXBhcmluZy5cbiAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxuICovXG5mdW5jdGlvbiBnZXRLZXlDb2RlcyhrY3MpIHtcbiAgdmFyIGsgPSB7fTtcbiAgZm9yICh2YXIga2MgaW4ga2NzKSB7XG4gICAga1trY3Nba2NdXSA9IGtjc1trY107XG4gIH1yZXR1cm4gaztcbn1cblxuXG5cbi8qKiovIH0pXG5cbi8qKioqKiovIH0pOyIsIiFmdW5jdGlvbihuKXtmdW5jdGlvbiB0KG8pe2lmKGVbb10pcmV0dXJuIGVbb10uZXhwb3J0czt2YXIgcj1lW29dPXtpOm8sbDohMSxleHBvcnRzOnt9fTtyZXR1cm4gbltvXS5jYWxsKHIuZXhwb3J0cyxyLHIuZXhwb3J0cyx0KSxyLmw9ITAsci5leHBvcnRzfXZhciBlPXt9O3QubT1uLHQuYz1lLHQuaT1mdW5jdGlvbihuKXtyZXR1cm4gbn0sdC5kPWZ1bmN0aW9uKG4sZSxvKXt0Lm8obixlKXx8T2JqZWN0LmRlZmluZVByb3BlcnR5KG4sZSx7Y29uZmlndXJhYmxlOiExLGVudW1lcmFibGU6ITAsZ2V0Om99KX0sdC5uPWZ1bmN0aW9uKG4pe3ZhciBlPW4mJm4uX19lc01vZHVsZT9mdW5jdGlvbigpe3JldHVybiBuLmRlZmF1bHR9OmZ1bmN0aW9uKCl7cmV0dXJuIG59O3JldHVybiB0LmQoZSxcImFcIixlKSxlfSx0Lm89ZnVuY3Rpb24obix0KXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG4sdCl9LHQucD1cIlwiLHQodC5zPTEwMil9KHswOmZ1bmN0aW9uKG4sdCl7bi5leHBvcnRzPWpRdWVyeX0sMTpmdW5jdGlvbihuLHQpe24uZXhwb3J0cz17Rm91bmRhdGlvbjp3aW5kb3cuRm91bmRhdGlvbn19LDEwMjpmdW5jdGlvbihuLHQsZSl7bi5leHBvcnRzPWUoMzYpfSwzOmZ1bmN0aW9uKG4sdCl7bi5leHBvcnRzPXtydGw6d2luZG93LkZvdW5kYXRpb24ucnRsLEdldFlvRGlnaXRzOndpbmRvdy5Gb3VuZGF0aW9uLkdldFlvRGlnaXRzLHRyYW5zaXRpb25lbmQ6d2luZG93LkZvdW5kYXRpb24udHJhbnNpdGlvbmVuZH19LDM2OmZ1bmN0aW9uKG4sdCxlKXtcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KTt2YXIgbz1lKDEpLHI9KGUubihvKSxlKDY2KSk7by5Gb3VuZGF0aW9uLktleWJvYXJkPXIuYX0sNjY6ZnVuY3Rpb24obix0LGUpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG8obil7cmV0dXJuISFuJiZuLmZpbmQoXCJhW2hyZWZdLCBhcmVhW2hyZWZdLCBpbnB1dDpub3QoW2Rpc2FibGVkXSksIHNlbGVjdDpub3QoW2Rpc2FibGVkXSksIHRleHRhcmVhOm5vdChbZGlzYWJsZWRdKSwgYnV0dG9uOm5vdChbZGlzYWJsZWRdKSwgaWZyYW1lLCBvYmplY3QsIGVtYmVkLCAqW3RhYmluZGV4XSwgKltjb250ZW50ZWRpdGFibGVdXCIpLmZpbHRlcihmdW5jdGlvbigpe3JldHVybiEoIWEoKSh0aGlzKS5pcyhcIjp2aXNpYmxlXCIpfHxhKCkodGhpcykuYXR0cihcInRhYmluZGV4XCIpPDApfSl9ZnVuY3Rpb24gcihuKXt2YXIgdD1kW24ud2hpY2h8fG4ua2V5Q29kZV18fFN0cmluZy5mcm9tQ2hhckNvZGUobi53aGljaCkudG9VcHBlckNhc2UoKTtyZXR1cm4gdD10LnJlcGxhY2UoL1xcVysvLFwiXCIpLG4uc2hpZnRLZXkmJih0PVwiU0hJRlRfXCIrdCksbi5jdHJsS2V5JiYodD1cIkNUUkxfXCIrdCksbi5hbHRLZXkmJih0PVwiQUxUX1wiK3QpLHQ9dC5yZXBsYWNlKC9fJC8sXCJcIil9ZS5kKHQsXCJhXCIsZnVuY3Rpb24oKXtyZXR1cm4gY30pO3ZhciBpPWUoMCksYT1lLm4oaSksdT1lKDMpLGQ9KGUubih1KSx7OTpcIlRBQlwiLDEzOlwiRU5URVJcIiwyNzpcIkVTQ0FQRVwiLDMyOlwiU1BBQ0VcIiwzNTpcIkVORFwiLDM2OlwiSE9NRVwiLDM3OlwiQVJST1dfTEVGVFwiLDM4OlwiQVJST1dfVVBcIiwzOTpcIkFSUk9XX1JJR0hUXCIsNDA6XCJBUlJPV19ET1dOXCJ9KSxmPXt9LGM9e2tleXM6ZnVuY3Rpb24obil7dmFyIHQ9e307Zm9yKHZhciBlIGluIG4pdFtuW2VdXT1uW2VdO3JldHVybiB0fShkKSxwYXJzZUtleTpyLGhhbmRsZUtleTpmdW5jdGlvbihuLHQsbyl7dmFyIHIsaSxkLGM9Zlt0XSxzPXRoaXMucGFyc2VLZXkobik7aWYoIWMpcmV0dXJuIGNvbnNvbGUud2FybihcIkNvbXBvbmVudCBub3QgZGVmaW5lZCFcIik7aWYocj12b2lkIDA9PT1jLmx0cj9jOmUuaSh1LnJ0bCkoKT9hLmEuZXh0ZW5kKHt9LGMubHRyLGMucnRsKTphLmEuZXh0ZW5kKHt9LGMucnRsLGMubHRyKSxpPXJbc10sKGQ9b1tpXSkmJlwiZnVuY3Rpb25cIj09dHlwZW9mIGQpe3ZhciBsPWQuYXBwbHkoKTsoby5oYW5kbGVkfHxcImZ1bmN0aW9uXCI9PXR5cGVvZiBvLmhhbmRsZWQpJiZvLmhhbmRsZWQobCl9ZWxzZShvLnVuaGFuZGxlZHx8XCJmdW5jdGlvblwiPT10eXBlb2Ygby51bmhhbmRsZWQpJiZvLnVuaGFuZGxlZCgpfSxmaW5kRm9jdXNhYmxlOm8scmVnaXN0ZXI6ZnVuY3Rpb24obix0KXtmW25dPXR9LHRyYXBGb2N1czpmdW5jdGlvbihuKXt2YXIgdD1vKG4pLGU9dC5lcSgwKSxpPXQuZXEoLTEpO24ub24oXCJrZXlkb3duLnpmLnRyYXBmb2N1c1wiLGZ1bmN0aW9uKG4pe24udGFyZ2V0PT09aVswXSYmXCJUQUJcIj09PXIobik/KG4ucHJldmVudERlZmF1bHQoKSxlLmZvY3VzKCkpOm4udGFyZ2V0PT09ZVswXSYmXCJTSElGVF9UQUJcIj09PXIobikmJihuLnByZXZlbnREZWZhdWx0KCksaS5mb2N1cygpKX0pfSxyZWxlYXNlRm9jdXM6ZnVuY3Rpb24obil7bi5vZmYoXCJrZXlkb3duLnpmLnRyYXBmb2N1c1wiKX19fX0pOyIsIi8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0aTogbW9kdWxlSWQsXG4vKioqKioqLyBcdFx0XHRsOiBmYWxzZSxcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbi8qKioqKiovIFx0XHRtb2R1bGUubCA9IHRydWU7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG4vKioqKioqL1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uaSA9IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbi8qKioqKiovIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4vKioqKioqLyBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuLyoqKioqKi8gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuLyoqKioqKi8gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuLyoqKioqKi8gXHRcdFx0XHRnZXQ6IGdldHRlclxuLyoqKioqKi8gXHRcdFx0fSk7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4vKioqKioqLyBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4vKioqKioqLyBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuLyoqKioqKi8gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4vKioqKioqLyBcdFx0cmV0dXJuIGdldHRlcjtcbi8qKioqKiovIFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDEwMyk7XG4vKioqKioqLyB9KVxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovICh7XG5cbi8qKiovIDA6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0galF1ZXJ5O1xuXG4vKioqLyB9KSxcblxuLyoqKi8gMTpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSB7Rm91bmRhdGlvbjogd2luZG93LkZvdW5kYXRpb259O1xuXG4vKioqLyB9KSxcblxuLyoqKi8gMTAzOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19yZXF1aXJlX18oMzcpO1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyAzNzpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIF9fd2VicGFja19leHBvcnRzX18sIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoX193ZWJwYWNrX2V4cG9ydHNfXywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX2NvcmVfXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX2NvcmVfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fZm91bmRhdGlvbl9jb3JlX18pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX21lZGlhUXVlcnlfXyA9IF9fd2VicGFja19yZXF1aXJlX18oNjcpO1xuXG5cblxuX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX2NvcmVfX1tcIkZvdW5kYXRpb25cIl0uTWVkaWFRdWVyeSA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX21lZGlhUXVlcnlfX1tcImFcIiAvKiBNZWRpYVF1ZXJ5ICovXTtcbl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fZm91bmRhdGlvbl9jb3JlX19bXCJGb3VuZGF0aW9uXCJdLk1lZGlhUXVlcnkuX2luaXQoKTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDY3OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgX193ZWJwYWNrX2V4cG9ydHNfXywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcbi8qIGhhcm1vbnkgZXhwb3J0IChiaW5kaW5nKSAqLyBfX3dlYnBhY2tfcmVxdWlyZV9fLmQoX193ZWJwYWNrX2V4cG9ydHNfXywgXCJhXCIsIGZ1bmN0aW9uKCkgeyByZXR1cm4gTWVkaWFRdWVyeTsgfSk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X18pO1xuXG5cblxuXG4vLyBEZWZhdWx0IHNldCBvZiBtZWRpYSBxdWVyaWVzXG52YXIgZGVmYXVsdFF1ZXJpZXMgPSB7XG4gICdkZWZhdWx0JzogJ29ubHkgc2NyZWVuJyxcbiAgbGFuZHNjYXBlOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKScsXG4gIHBvcnRyYWl0OiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpJyxcbiAgcmV0aW5hOiAnb25seSBzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgKyAnb25seSBzY3JlZW4gYW5kIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgKyAnb25seSBzY3JlZW4gYW5kICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyLzEpLCcgKyAnb25seSBzY3JlZW4gYW5kIChtaW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICsgJ29ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDE5MmRwaSksJyArICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAyZHBweCknXG59O1xuXG4vLyBtYXRjaE1lZGlhKCkgcG9seWZpbGwgLSBUZXN0IGEgQ1NTIG1lZGlhIHR5cGUvcXVlcnkgaW4gSlMuXG4vLyBBdXRob3JzICYgY29weXJpZ2h0IChjKSAyMDEyOiBTY290dCBKZWhsLCBQYXVsIElyaXNoLCBOaWNob2xhcyBaYWthcywgRGF2aWQgS25pZ2h0LiBEdWFsIE1JVC9CU0QgbGljZW5zZVxudmFyIG1hdGNoTWVkaWEgPSB3aW5kb3cubWF0Y2hNZWRpYSB8fCBmdW5jdGlvbiAoKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBGb3IgYnJvd3NlcnMgdGhhdCBzdXBwb3J0IG1hdGNoTWVkaXVtIGFwaSBzdWNoIGFzIElFIDkgYW5kIHdlYmtpdFxuXG4gIHZhciBzdHlsZU1lZGlhID0gd2luZG93LnN0eWxlTWVkaWEgfHwgd2luZG93Lm1lZGlhO1xuXG4gIC8vIEZvciB0aG9zZSB0aGF0IGRvbid0IHN1cHBvcnQgbWF0Y2hNZWRpdW1cbiAgaWYgKCFzdHlsZU1lZGlhKSB7XG4gICAgdmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICAgICAgc2NyaXB0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdLFxuICAgICAgICBpbmZvID0gbnVsbDtcblxuICAgIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnO1xuICAgIHN0eWxlLmlkID0gJ21hdGNobWVkaWFqcy10ZXN0JztcblxuICAgIHNjcmlwdCAmJiBzY3JpcHQucGFyZW50Tm9kZSAmJiBzY3JpcHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc3R5bGUsIHNjcmlwdCk7XG5cbiAgICAvLyAnc3R5bGUuY3VycmVudFN0eWxlJyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICd3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZScgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgIGluZm8gPSAnZ2V0Q29tcHV0ZWRTdHlsZScgaW4gd2luZG93ICYmIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHN0eWxlLCBudWxsKSB8fCBzdHlsZS5jdXJyZW50U3R5bGU7XG5cbiAgICBzdHlsZU1lZGlhID0ge1xuICAgICAgbWF0Y2hNZWRpdW06IGZ1bmN0aW9uIChtZWRpYSkge1xuICAgICAgICB2YXIgdGV4dCA9ICdAbWVkaWEgJyArIG1lZGlhICsgJ3sgI21hdGNobWVkaWFqcy10ZXN0IHsgd2lkdGg6IDFweDsgfSB9JztcblxuICAgICAgICAvLyAnc3R5bGUuc3R5bGVTaGVldCcgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnc3R5bGUudGV4dENvbnRlbnQnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICAgICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSB0ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRlc3QgaWYgbWVkaWEgcXVlcnkgaXMgdHJ1ZSBvciBmYWxzZVxuICAgICAgICByZXR1cm4gaW5mby53aWR0aCA9PT0gJzFweCc7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAobWVkaWEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWF0Y2hlczogc3R5bGVNZWRpYS5tYXRjaE1lZGl1bShtZWRpYSB8fCAnYWxsJyksXG4gICAgICBtZWRpYTogbWVkaWEgfHwgJ2FsbCdcbiAgICB9O1xuICB9O1xufSgpO1xuXG52YXIgTWVkaWFRdWVyeSA9IHtcbiAgcXVlcmllczogW10sXG5cbiAgY3VycmVudDogJycsXG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBtZWRpYSBxdWVyeSBoZWxwZXIsIGJ5IGV4dHJhY3RpbmcgdGhlIGJyZWFrcG9pbnQgbGlzdCBmcm9tIHRoZSBDU1MgYW5kIGFjdGl2YXRpbmcgdGhlIGJyZWFrcG9pbnQgd2F0Y2hlci5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgJG1ldGEgPSBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKCdtZXRhLmZvdW5kYXRpb24tbXEnKTtcbiAgICBpZiAoISRtZXRhLmxlbmd0aCkge1xuICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSgnPG1ldGEgY2xhc3M9XCJmb3VuZGF0aW9uLW1xXCI+JykuYXBwZW5kVG8oZG9jdW1lbnQuaGVhZCk7XG4gICAgfVxuXG4gICAgdmFyIGV4dHJhY3RlZFN0eWxlcyA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkoJy5mb3VuZGF0aW9uLW1xJykuY3NzKCdmb250LWZhbWlseScpO1xuICAgIHZhciBuYW1lZFF1ZXJpZXM7XG5cbiAgICBuYW1lZFF1ZXJpZXMgPSBwYXJzZVN0eWxlVG9PYmplY3QoZXh0cmFjdGVkU3R5bGVzKTtcblxuICAgIGZvciAodmFyIGtleSBpbiBuYW1lZFF1ZXJpZXMpIHtcbiAgICAgIGlmIChuYW1lZFF1ZXJpZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBzZWxmLnF1ZXJpZXMucHVzaCh7XG4gICAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAgIHZhbHVlOiAnb25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6ICcgKyBuYW1lZFF1ZXJpZXNba2V5XSArICcpJ1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpO1xuXG4gICAgdGhpcy5fd2F0Y2hlcigpO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIGlzIGF0IGxlYXN0IGFzIHdpZGUgYXMgYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBicmVha3BvaW50IG1hdGNoZXMsIGBmYWxzZWAgaWYgaXQncyBzbWFsbGVyLlxuICAgKi9cbiAgYXRMZWFzdDogZnVuY3Rpb24gKHNpemUpIHtcbiAgICB2YXIgcXVlcnkgPSB0aGlzLmdldChzaXplKTtcblxuICAgIGlmIChxdWVyeSkge1xuICAgICAgcmV0dXJuIG1hdGNoTWVkaWEocXVlcnkpLm1hdGNoZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIG1hdGNoZXMgdG8gYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLCBlaXRoZXIgJ3NtYWxsIG9ubHknIG9yICdzbWFsbCcuIE9taXR0aW5nICdvbmx5JyBmYWxscyBiYWNrIHRvIHVzaW5nIGF0TGVhc3QoKSBtZXRob2QuXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCBkb2VzIG5vdC5cbiAgICovXG4gIGlzOiBmdW5jdGlvbiAoc2l6ZSkge1xuICAgIHNpemUgPSBzaXplLnRyaW0oKS5zcGxpdCgnICcpO1xuICAgIGlmIChzaXplLmxlbmd0aCA+IDEgJiYgc2l6ZVsxXSA9PT0gJ29ubHknKSB7XG4gICAgICBpZiAoc2l6ZVswXSA9PT0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKSkgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmF0TGVhc3Qoc2l6ZVswXSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtZWRpYSBxdWVyeSBvZiBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gZ2V0LlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfG51bGx9IC0gVGhlIG1lZGlhIHF1ZXJ5IG9mIHRoZSBicmVha3BvaW50LCBvciBgbnVsbGAgaWYgdGhlIGJyZWFrcG9pbnQgZG9lc24ndCBleGlzdC5cbiAgICovXG4gIGdldDogZnVuY3Rpb24gKHNpemUpIHtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMucXVlcmllcykge1xuICAgICAgaWYgKHRoaXMucXVlcmllcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICAgIGlmIChzaXplID09PSBxdWVyeS5uYW1lKSByZXR1cm4gcXVlcnkudmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cblxuICAvKipcbiAgICogR2V0cyB0aGUgY3VycmVudCBicmVha3BvaW50IG5hbWUgYnkgdGVzdGluZyBldmVyeSBicmVha3BvaW50IGFuZCByZXR1cm5pbmcgdGhlIGxhc3Qgb25lIHRvIG1hdGNoICh0aGUgYmlnZ2VzdCBvbmUpLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybnMge1N0cmluZ30gTmFtZSBvZiB0aGUgY3VycmVudCBicmVha3BvaW50LlxuICAgKi9cbiAgX2dldEN1cnJlbnRTaXplOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG1hdGNoZWQ7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW2ldO1xuXG4gICAgICBpZiAobWF0Y2hNZWRpYShxdWVyeS52YWx1ZSkubWF0Y2hlcykge1xuICAgICAgICBtYXRjaGVkID0gcXVlcnk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBtYXRjaGVkID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIG1hdGNoZWQubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1hdGNoZWQ7XG4gICAgfVxuICB9LFxuXG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlcyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLCB3aGljaCBmaXJlcyBhbiBldmVudCBvbiB0aGUgd2luZG93IHdoZW5ldmVyIHRoZSBicmVha3BvaW50IGNoYW5nZXMuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3dhdGNoZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh3aW5kb3cpLm9mZigncmVzaXplLnpmLm1lZGlhcXVlcnknKS5vbigncmVzaXplLnpmLm1lZGlhcXVlcnknLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbmV3U2l6ZSA9IF90aGlzLl9nZXRDdXJyZW50U2l6ZSgpLFxuICAgICAgICAgIGN1cnJlbnRTaXplID0gX3RoaXMuY3VycmVudDtcblxuICAgICAgaWYgKG5ld1NpemUgIT09IGN1cnJlbnRTaXplKSB7XG4gICAgICAgIC8vIENoYW5nZSB0aGUgY3VycmVudCBtZWRpYSBxdWVyeVxuICAgICAgICBfdGhpcy5jdXJyZW50ID0gbmV3U2l6ZTtcblxuICAgICAgICAvLyBCcm9hZGNhc3QgdGhlIG1lZGlhIHF1ZXJ5IGNoYW5nZSBvbiB0aGUgd2luZG93XG4gICAgICAgIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkod2luZG93KS50cmlnZ2VyKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBbbmV3U2l6ZSwgY3VycmVudFNpemVdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuLy8gVGhhbmsgeW91OiBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3F1ZXJ5LXN0cmluZ1xuZnVuY3Rpb24gcGFyc2VTdHlsZVRvT2JqZWN0KHN0cikge1xuICB2YXIgc3R5bGVPYmplY3QgPSB7fTtcblxuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gIH1cblxuICBzdHIgPSBzdHIudHJpbSgpLnNsaWNlKDEsIC0xKTsgLy8gYnJvd3NlcnMgcmUtcXVvdGUgc3RyaW5nIHN0eWxlIHZhbHVlc1xuXG4gIGlmICghc3RyKSB7XG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgc3R5bGVPYmplY3QgPSBzdHIuc3BsaXQoJyYnKS5yZWR1Y2UoZnVuY3Rpb24gKHJldCwgcGFyYW0pIHtcbiAgICB2YXIgcGFydHMgPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuICAgIHZhciBrZXkgPSBwYXJ0c1swXTtcbiAgICB2YXIgdmFsID0gcGFydHNbMV07XG4gICAga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleSk7XG5cbiAgICAvLyBtaXNzaW5nIGA9YCBzaG91bGQgYmUgYG51bGxgOlxuICAgIC8vIGh0dHA6Ly93My5vcmcvVFIvMjAxMi9XRC11cmwtMjAxMjA1MjQvI2NvbGxlY3QtdXJsLXBhcmFtZXRlcnNcbiAgICB2YWwgPSB2YWwgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkZWNvZGVVUklDb21wb25lbnQodmFsKTtcblxuICAgIGlmICghcmV0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldFtrZXldID0gdmFsO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXRba2V5XSkpIHtcbiAgICAgIHJldFtrZXldLnB1c2godmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0W2tleV0gPSBbcmV0W2tleV0sIHZhbF07XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH0sIHt9KTtcblxuICByZXR1cm4gc3R5bGVPYmplY3Q7XG59XG5cblxuXG4vKioqLyB9KVxuXG4vKioqKioqLyB9KTsiLCIhZnVuY3Rpb24oZSl7ZnVuY3Rpb24gdChyKXtpZihuW3JdKXJldHVybiBuW3JdLmV4cG9ydHM7dmFyIGk9bltyXT17aTpyLGw6ITEsZXhwb3J0czp7fX07cmV0dXJuIGVbcl0uY2FsbChpLmV4cG9ydHMsaSxpLmV4cG9ydHMsdCksaS5sPSEwLGkuZXhwb3J0c312YXIgbj17fTt0Lm09ZSx0LmM9bix0Lmk9ZnVuY3Rpb24oZSl7cmV0dXJuIGV9LHQuZD1mdW5jdGlvbihlLG4scil7dC5vKGUsbil8fE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLG4se2NvbmZpZ3VyYWJsZTohMSxlbnVtZXJhYmxlOiEwLGdldDpyfSl9LHQubj1mdW5jdGlvbihlKXt2YXIgbj1lJiZlLl9fZXNNb2R1bGU/ZnVuY3Rpb24oKXtyZXR1cm4gZS5kZWZhdWx0fTpmdW5jdGlvbigpe3JldHVybiBlfTtyZXR1cm4gdC5kKG4sXCJhXCIsbiksbn0sdC5vPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlLHQpfSx0LnA9XCJcIix0KHQucz0xMDMpfSh7MDpmdW5jdGlvbihlLHQpe2UuZXhwb3J0cz1qUXVlcnl9LDE6ZnVuY3Rpb24oZSx0KXtlLmV4cG9ydHM9e0ZvdW5kYXRpb246d2luZG93LkZvdW5kYXRpb259fSwxMDM6ZnVuY3Rpb24oZSx0LG4pe2UuZXhwb3J0cz1uKDM3KX0sMzc6ZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciByPW4oMSksaT0obi5uKHIpLG4oNjcpKTtyLkZvdW5kYXRpb24uTWVkaWFRdWVyeT1pLmEsci5Gb3VuZGF0aW9uLk1lZGlhUXVlcnkuX2luaXQoKX0sNjc6ZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSl7dmFyIHQ9e307cmV0dXJuXCJzdHJpbmdcIiE9dHlwZW9mIGU/dDooZT1lLnRyaW0oKS5zbGljZSgxLC0xKSk/dD1lLnNwbGl0KFwiJlwiKS5yZWR1Y2UoZnVuY3Rpb24oZSx0KXt2YXIgbj10LnJlcGxhY2UoL1xcKy9nLFwiIFwiKS5zcGxpdChcIj1cIikscj1uWzBdLGk9blsxXTtyZXR1cm4gcj1kZWNvZGVVUklDb21wb25lbnQociksaT12b2lkIDA9PT1pP251bGw6ZGVjb2RlVVJJQ29tcG9uZW50KGkpLGUuaGFzT3duUHJvcGVydHkocik/QXJyYXkuaXNBcnJheShlW3JdKT9lW3JdLnB1c2goaSk6ZVtyXT1bZVtyXSxpXTplW3JdPWksZX0se30pOnR9bi5kKHQsXCJhXCIsZnVuY3Rpb24oKXtyZXR1cm4gYX0pO3ZhciBpPW4oMCksdT1uLm4oaSksbz13aW5kb3cubWF0Y2hNZWRpYXx8ZnVuY3Rpb24oKXt2YXIgZT13aW5kb3cuc3R5bGVNZWRpYXx8d2luZG93Lm1lZGlhO2lmKCFlKXt2YXIgdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIiksbj1kb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKVswXSxyPW51bGw7dC50eXBlPVwidGV4dC9jc3NcIix0LmlkPVwibWF0Y2htZWRpYWpzLXRlc3RcIixuJiZuLnBhcmVudE5vZGUmJm4ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodCxuKSxyPVwiZ2V0Q29tcHV0ZWRTdHlsZVwiaW4gd2luZG93JiZ3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0LG51bGwpfHx0LmN1cnJlbnRTdHlsZSxlPXttYXRjaE1lZGl1bTpmdW5jdGlvbihlKXt2YXIgbj1cIkBtZWRpYSBcIitlK1wieyAjbWF0Y2htZWRpYWpzLXRlc3QgeyB3aWR0aDogMXB4OyB9IH1cIjtyZXR1cm4gdC5zdHlsZVNoZWV0P3Quc3R5bGVTaGVldC5jc3NUZXh0PW46dC50ZXh0Q29udGVudD1uLFwiMXB4XCI9PT1yLndpZHRofX19cmV0dXJuIGZ1bmN0aW9uKHQpe3JldHVybnttYXRjaGVzOmUubWF0Y2hNZWRpdW0odHx8XCJhbGxcIiksbWVkaWE6dHx8XCJhbGxcIn19fSgpLGE9e3F1ZXJpZXM6W10sY3VycmVudDpcIlwiLF9pbml0OmZ1bmN0aW9uKCl7dmFyIGU9dGhpczt1KCkoXCJtZXRhLmZvdW5kYXRpb24tbXFcIikubGVuZ3RofHx1KCkoJzxtZXRhIGNsYXNzPVwiZm91bmRhdGlvbi1tcVwiPicpLmFwcGVuZFRvKGRvY3VtZW50LmhlYWQpO3ZhciB0LG49dSgpKFwiLmZvdW5kYXRpb24tbXFcIikuY3NzKFwiZm9udC1mYW1pbHlcIik7dD1yKG4pO2Zvcih2YXIgaSBpbiB0KXQuaGFzT3duUHJvcGVydHkoaSkmJmUucXVlcmllcy5wdXNoKHtuYW1lOmksdmFsdWU6XCJvbmx5IHNjcmVlbiBhbmQgKG1pbi13aWR0aDogXCIrdFtpXStcIilcIn0pO3RoaXMuY3VycmVudD10aGlzLl9nZXRDdXJyZW50U2l6ZSgpLHRoaXMuX3dhdGNoZXIoKX0sYXRMZWFzdDpmdW5jdGlvbihlKXt2YXIgdD10aGlzLmdldChlKTtyZXR1cm4hIXQmJm8odCkubWF0Y2hlc30saXM6ZnVuY3Rpb24oZSl7cmV0dXJuIGU9ZS50cmltKCkuc3BsaXQoXCIgXCIpLGUubGVuZ3RoPjEmJlwib25seVwiPT09ZVsxXT9lWzBdPT09dGhpcy5fZ2V0Q3VycmVudFNpemUoKTp0aGlzLmF0TGVhc3QoZVswXSl9LGdldDpmdW5jdGlvbihlKXtmb3IodmFyIHQgaW4gdGhpcy5xdWVyaWVzKWlmKHRoaXMucXVlcmllcy5oYXNPd25Qcm9wZXJ0eSh0KSl7dmFyIG49dGhpcy5xdWVyaWVzW3RdO2lmKGU9PT1uLm5hbWUpcmV0dXJuIG4udmFsdWV9cmV0dXJuIG51bGx9LF9nZXRDdXJyZW50U2l6ZTpmdW5jdGlvbigpe2Zvcih2YXIgZSx0PTA7dDx0aGlzLnF1ZXJpZXMubGVuZ3RoO3QrKyl7dmFyIG49dGhpcy5xdWVyaWVzW3RdO28obi52YWx1ZSkubWF0Y2hlcyYmKGU9bil9cmV0dXJuXCJvYmplY3RcIj09dHlwZW9mIGU/ZS5uYW1lOmV9LF93YXRjaGVyOmZ1bmN0aW9uKCl7dmFyIGU9dGhpczt1KCkod2luZG93KS5vZmYoXCJyZXNpemUuemYubWVkaWFxdWVyeVwiKS5vbihcInJlc2l6ZS56Zi5tZWRpYXF1ZXJ5XCIsZnVuY3Rpb24oKXt2YXIgdD1lLl9nZXRDdXJyZW50U2l6ZSgpLG49ZS5jdXJyZW50O3QhPT1uJiYoZS5jdXJyZW50PXQsdSgpKHdpbmRvdykudHJpZ2dlcihcImNoYW5nZWQuemYubWVkaWFxdWVyeVwiLFt0LG5dKSl9KX19fX0pOyIsIi8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0aTogbW9kdWxlSWQsXG4vKioqKioqLyBcdFx0XHRsOiBmYWxzZSxcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbi8qKioqKiovIFx0XHRtb2R1bGUubCA9IHRydWU7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG4vKioqKioqL1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uaSA9IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbi8qKioqKiovIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4vKioqKioqLyBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuLyoqKioqKi8gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuLyoqKioqKi8gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuLyoqKioqKi8gXHRcdFx0XHRnZXQ6IGdldHRlclxuLyoqKioqKi8gXHRcdFx0fSk7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4vKioqKioqLyBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4vKioqKioqLyBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuLyoqKioqKi8gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4vKioqKioqLyBcdFx0cmV0dXJuIGdldHRlcjtcbi8qKioqKiovIFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDEwNCk7XG4vKioqKioqLyB9KVxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovICh7XG5cbi8qKiovIDA6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0galF1ZXJ5O1xuXG4vKioqLyB9KSxcblxuLyoqKi8gMTpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSB7Rm91bmRhdGlvbjogd2luZG93LkZvdW5kYXRpb259O1xuXG4vKioqLyB9KSxcblxuLyoqKi8gMTA0OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19yZXF1aXJlX18oMzgpO1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyAzOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtydGw6IHdpbmRvdy5Gb3VuZGF0aW9uLnJ0bCwgR2V0WW9EaWdpdHM6IHdpbmRvdy5Gb3VuZGF0aW9uLkdldFlvRGlnaXRzLCB0cmFuc2l0aW9uZW5kOiB3aW5kb3cuRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kfTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDM4OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgX193ZWJwYWNrX2V4cG9ydHNfXywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShfX3dlYnBhY2tfZXhwb3J0c19fLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fX2RlZmF1bHQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLm4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX2NvcmVfXyk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfbW90aW9uX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDY4KTtcblxuXG5cbl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fZm91bmRhdGlvbl9jb3JlX19bXCJGb3VuZGF0aW9uXCJdLk1vdGlvbiA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX21vdGlvbl9fW1wiYVwiIC8qIE1vdGlvbiAqL107XG5fX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fW1wiRm91bmRhdGlvblwiXS5Nb3ZlID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfbW90aW9uX19bXCJiXCIgLyogTW92ZSAqL107XG5cbi8qKiovIH0pLFxuXG4vKioqLyA2ODpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIF9fd2VicGFja19leHBvcnRzX18sIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG4vKiBoYXJtb255IGV4cG9ydCAoYmluZGluZykgKi8gX193ZWJwYWNrX3JlcXVpcmVfXy5kKF9fd2VicGFja19leHBvcnRzX18sIFwiYlwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIE1vdmU7IH0pO1xuLyogaGFybW9ueSBleHBvcnQgKGJpbmRpbmcpICovIF9fd2VicGFja19yZXF1aXJlX18uZChfX3dlYnBhY2tfZXhwb3J0c19fLCBcImFcIiwgZnVuY3Rpb24oKSB7IHJldHVybiBNb3Rpb247IH0pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfXyA9IF9fd2VicGFja19yZXF1aXJlX18oMCk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLm4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fdXRpbF9jb3JlX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDMpO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX2NvcmVfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX2NvcmVfXyk7XG5cblxuXG5cblxuLyoqXG4gKiBNb3Rpb24gbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLm1vdGlvblxuICovXG5cbnZhciBpbml0Q2xhc3NlcyA9IFsnbXVpLWVudGVyJywgJ211aS1sZWF2ZSddO1xudmFyIGFjdGl2ZUNsYXNzZXMgPSBbJ211aS1lbnRlci1hY3RpdmUnLCAnbXVpLWxlYXZlLWFjdGl2ZSddO1xuXG52YXIgTW90aW9uID0ge1xuICBhbmltYXRlSW46IGZ1bmN0aW9uIChlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgYW5pbWF0ZSh0cnVlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcbiAgfSxcblxuICBhbmltYXRlT3V0OiBmdW5jdGlvbiAoZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgIGFuaW1hdGUoZmFsc2UsIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBNb3ZlKGR1cmF0aW9uLCBlbGVtLCBmbikge1xuICB2YXIgYW5pbSxcbiAgICAgIHByb2csXG4gICAgICBzdGFydCA9IG51bGw7XG4gIC8vIGNvbnNvbGUubG9nKCdjYWxsZWQnKTtcblxuICBpZiAoZHVyYXRpb24gPT09IDApIHtcbiAgICBmbi5hcHBseShlbGVtKTtcbiAgICBlbGVtLnRyaWdnZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pLnRyaWdnZXJIYW5kbGVyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBmdW5jdGlvbiBtb3ZlKHRzKSB7XG4gICAgaWYgKCFzdGFydCkgc3RhcnQgPSB0cztcbiAgICAvLyBjb25zb2xlLmxvZyhzdGFydCwgdHMpO1xuICAgIHByb2cgPSB0cyAtIHN0YXJ0O1xuICAgIGZuLmFwcGx5KGVsZW0pO1xuXG4gICAgaWYgKHByb2cgPCBkdXJhdGlvbikge1xuICAgICAgYW5pbSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZSwgZWxlbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShhbmltKTtcbiAgICAgIGVsZW0udHJpZ2dlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSkudHJpZ2dlckhhbmRsZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pO1xuICAgIH1cbiAgfVxuICBhbmltID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlKTtcbn1cblxuLyoqXG4gKiBBbmltYXRlcyBhbiBlbGVtZW50IGluIG9yIG91dCB1c2luZyBhIENTUyB0cmFuc2l0aW9uIGNsYXNzLlxuICogQGZ1bmN0aW9uXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtCb29sZWFufSBpc0luIC0gRGVmaW5lcyBpZiB0aGUgYW5pbWF0aW9uIGlzIGluIG9yIG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9yIEhUTUwgb2JqZWN0IHRvIGFuaW1hdGUuXG4gKiBAcGFyYW0ge1N0cmluZ30gYW5pbWF0aW9uIC0gQ1NTIGNsYXNzIHRvIHVzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gQ2FsbGJhY2sgdG8gcnVuIHdoZW4gYW5pbWF0aW9uIGlzIGZpbmlzaGVkLlxuICovXG5mdW5jdGlvbiBhbmltYXRlKGlzSW4sIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgZWxlbWVudCA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkoZWxlbWVudCkuZXEoMCk7XG5cbiAgaWYgKCFlbGVtZW50Lmxlbmd0aCkgcmV0dXJuO1xuXG4gIHZhciBpbml0Q2xhc3MgPSBpc0luID8gaW5pdENsYXNzZXNbMF0gOiBpbml0Q2xhc3Nlc1sxXTtcbiAgdmFyIGFjdGl2ZUNsYXNzID0gaXNJbiA/IGFjdGl2ZUNsYXNzZXNbMF0gOiBhY3RpdmVDbGFzc2VzWzFdO1xuXG4gIC8vIFNldCB1cCB0aGUgYW5pbWF0aW9uXG4gIHJlc2V0KCk7XG5cbiAgZWxlbWVudC5hZGRDbGFzcyhhbmltYXRpb24pLmNzcygndHJhbnNpdGlvbicsICdub25lJyk7XG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICBlbGVtZW50LmFkZENsYXNzKGluaXRDbGFzcyk7XG4gICAgaWYgKGlzSW4pIGVsZW1lbnQuc2hvdygpO1xuICB9KTtcblxuICAvLyBTdGFydCB0aGUgYW5pbWF0aW9uXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbiAoKSB7XG4gICAgZWxlbWVudFswXS5vZmZzZXRXaWR0aDtcbiAgICBlbGVtZW50LmNzcygndHJhbnNpdGlvbicsICcnKS5hZGRDbGFzcyhhY3RpdmVDbGFzcyk7XG4gIH0pO1xuXG4gIC8vIENsZWFuIHVwIHRoZSBhbmltYXRpb24gd2hlbiBpdCBmaW5pc2hlc1xuICBlbGVtZW50Lm9uZShfX3dlYnBhY2tfcmVxdWlyZV9fLmkoX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfY29yZV9fW1widHJhbnNpdGlvbmVuZFwiXSkoZWxlbWVudCksIGZpbmlzaCk7XG5cbiAgLy8gSGlkZXMgdGhlIGVsZW1lbnQgKGZvciBvdXQgYW5pbWF0aW9ucyksIHJlc2V0cyB0aGUgZWxlbWVudCwgYW5kIHJ1bnMgYSBjYWxsYmFja1xuICBmdW5jdGlvbiBmaW5pc2goKSB7XG4gICAgaWYgKCFpc0luKSBlbGVtZW50LmhpZGUoKTtcbiAgICByZXNldCgpO1xuICAgIGlmIChjYikgY2IuYXBwbHkoZWxlbWVudCk7XG4gIH1cblxuICAvLyBSZXNldHMgdHJhbnNpdGlvbnMgYW5kIHJlbW92ZXMgbW90aW9uLXNwZWNpZmljIGNsYXNzZXNcbiAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgZWxlbWVudFswXS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAwO1xuICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoaW5pdENsYXNzICsgJyAnICsgYWN0aXZlQ2xhc3MgKyAnICcgKyBhbmltYXRpb24pO1xuICB9XG59XG5cblxuXG4vKioqLyB9KVxuXG4vKioqKioqLyB9KTsiLCIhZnVuY3Rpb24obil7ZnVuY3Rpb24gdChlKXtpZihpW2VdKXJldHVybiBpW2VdLmV4cG9ydHM7dmFyIG89aVtlXT17aTplLGw6ITEsZXhwb3J0czp7fX07cmV0dXJuIG5bZV0uY2FsbChvLmV4cG9ydHMsbyxvLmV4cG9ydHMsdCksby5sPSEwLG8uZXhwb3J0c312YXIgaT17fTt0Lm09bix0LmM9aSx0Lmk9ZnVuY3Rpb24obil7cmV0dXJuIG59LHQuZD1mdW5jdGlvbihuLGksZSl7dC5vKG4saSl8fE9iamVjdC5kZWZpbmVQcm9wZXJ0eShuLGkse2NvbmZpZ3VyYWJsZTohMSxlbnVtZXJhYmxlOiEwLGdldDplfSl9LHQubj1mdW5jdGlvbihuKXt2YXIgaT1uJiZuLl9fZXNNb2R1bGU/ZnVuY3Rpb24oKXtyZXR1cm4gbi5kZWZhdWx0fTpmdW5jdGlvbigpe3JldHVybiBufTtyZXR1cm4gdC5kKGksXCJhXCIsaSksaX0sdC5vPWZ1bmN0aW9uKG4sdCl7cmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChuLHQpfSx0LnA9XCJcIix0KHQucz0xMDQpfSh7MDpmdW5jdGlvbihuLHQpe24uZXhwb3J0cz1qUXVlcnl9LDE6ZnVuY3Rpb24obix0KXtuLmV4cG9ydHM9e0ZvdW5kYXRpb246d2luZG93LkZvdW5kYXRpb259fSwxMDQ6ZnVuY3Rpb24obix0LGkpe24uZXhwb3J0cz1pKDM4KX0sMzpmdW5jdGlvbihuLHQpe24uZXhwb3J0cz17cnRsOndpbmRvdy5Gb3VuZGF0aW9uLnJ0bCxHZXRZb0RpZ2l0czp3aW5kb3cuRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyx0cmFuc2l0aW9uZW5kOndpbmRvdy5Gb3VuZGF0aW9uLnRyYW5zaXRpb25lbmR9fSwzODpmdW5jdGlvbihuLHQsaSl7XCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIGU9aSgxKSxvPShpLm4oZSksaSg2OCkpO2UuRm91bmRhdGlvbi5Nb3Rpb249by5hLGUuRm91bmRhdGlvbi5Nb3ZlPW8uYn0sNjg6ZnVuY3Rpb24obix0LGkpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIGUobix0LGkpe2Z1bmN0aW9uIGUodSl7YXx8KGE9dSkscj11LWEsaS5hcHBseSh0KSxyPG4/bz13aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGUsdCk6KHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShvKSx0LnRyaWdnZXIoXCJmaW5pc2hlZC56Zi5hbmltYXRlXCIsW3RdKS50cmlnZ2VySGFuZGxlcihcImZpbmlzaGVkLnpmLmFuaW1hdGVcIixbdF0pKX12YXIgbyxyLGE9bnVsbDtpZigwPT09bilyZXR1cm4gaS5hcHBseSh0KSx2b2lkIHQudHJpZ2dlcihcImZpbmlzaGVkLnpmLmFuaW1hdGVcIixbdF0pLnRyaWdnZXJIYW5kbGVyKFwiZmluaXNoZWQuemYuYW5pbWF0ZVwiLFt0XSk7bz13aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGUpfWZ1bmN0aW9uIG8obix0LGUsbyl7ZnVuY3Rpb24gcigpe258fHQuaGlkZSgpLGQoKSxvJiZvLmFwcGx5KHQpfWZ1bmN0aW9uIGQoKXt0WzBdLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbj0wLHQucmVtb3ZlQ2xhc3MoYytcIiBcIitsK1wiIFwiK2UpfWlmKHQ9YSgpKHQpLmVxKDApLHQubGVuZ3RoKXt2YXIgYz1uP3NbMF06c1sxXSxsPW4/ZlswXTpmWzFdO2QoKSx0LmFkZENsYXNzKGUpLmNzcyhcInRyYW5zaXRpb25cIixcIm5vbmVcIikscmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCl7dC5hZGRDbGFzcyhjKSxuJiZ0LnNob3coKX0pLHJlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe3RbMF0ub2Zmc2V0V2lkdGgsdC5jc3MoXCJ0cmFuc2l0aW9uXCIsXCJcIikuYWRkQ2xhc3MobCl9KSx0Lm9uZShpLmkodS50cmFuc2l0aW9uZW5kKSh0KSxyKX19aS5kKHQsXCJiXCIsZnVuY3Rpb24oKXtyZXR1cm4gZX0pLGkuZCh0LFwiYVwiLGZ1bmN0aW9uKCl7cmV0dXJuIGR9KTt2YXIgcj1pKDApLGE9aS5uKHIpLHU9aSgzKSxzPShpLm4odSksW1wibXVpLWVudGVyXCIsXCJtdWktbGVhdmVcIl0pLGY9W1wibXVpLWVudGVyLWFjdGl2ZVwiLFwibXVpLWxlYXZlLWFjdGl2ZVwiXSxkPXthbmltYXRlSW46ZnVuY3Rpb24obix0LGkpe28oITAsbix0LGkpfSxhbmltYXRlT3V0OmZ1bmN0aW9uKG4sdCxpKXtvKCExLG4sdCxpKX19fX0pOyIsIi8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0aTogbW9kdWxlSWQsXG4vKioqKioqLyBcdFx0XHRsOiBmYWxzZSxcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbi8qKioqKiovIFx0XHRtb2R1bGUubCA9IHRydWU7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG4vKioqKioqL1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uaSA9IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbi8qKioqKiovIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4vKioqKioqLyBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuLyoqKioqKi8gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuLyoqKioqKi8gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuLyoqKioqKi8gXHRcdFx0XHRnZXQ6IGdldHRlclxuLyoqKioqKi8gXHRcdFx0fSk7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4vKioqKioqLyBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4vKioqKioqLyBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuLyoqKioqKi8gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4vKioqKioqLyBcdFx0cmV0dXJuIGdldHRlcjtcbi8qKioqKiovIFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDEwNSk7XG4vKioqKioqLyB9KVxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovICh7XG5cbi8qKiovIDA6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0galF1ZXJ5O1xuXG4vKioqLyB9KSxcblxuLyoqKi8gMTpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSB7Rm91bmRhdGlvbjogd2luZG93LkZvdW5kYXRpb259O1xuXG4vKioqLyB9KSxcblxuLyoqKi8gMTA1OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19yZXF1aXJlX18oMzkpO1xuXG5cbi8qKiovIH0pLFxuXG4vKioqLyAzOTpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIF9fd2VicGFja19leHBvcnRzX18sIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoX193ZWJwYWNrX2V4cG9ydHNfXywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX2NvcmVfXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX2NvcmVfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fZm91bmRhdGlvbl9jb3JlX18pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX25lc3RfXyA9IF9fd2VicGFja19yZXF1aXJlX18oNjkpO1xuXG5cblxuXG5fX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fW1wiRm91bmRhdGlvblwiXS5OZXN0ID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfbmVzdF9fW1wiYVwiIC8qIE5lc3QgKi9dO1xuXG4vKioqLyB9KSxcblxuLyoqKi8gNjk6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBfX3dlYnBhY2tfZXhwb3J0c19fLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuLyogaGFybW9ueSBleHBvcnQgKGJpbmRpbmcpICovIF9fd2VicGFja19yZXF1aXJlX18uZChfX3dlYnBhY2tfZXhwb3J0c19fLCBcImFcIiwgZnVuY3Rpb24oKSB7IHJldHVybiBOZXN0OyB9KTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfXyk7XG5cblxuXG5cbnZhciBOZXN0ID0ge1xuICBGZWF0aGVyOiBmdW5jdGlvbiAobWVudSkge1xuICAgIHZhciB0eXBlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAnemYnO1xuXG4gICAgbWVudS5hdHRyKCdyb2xlJywgJ21lbnViYXInKTtcblxuICAgIHZhciBpdGVtcyA9IG1lbnUuZmluZCgnbGknKS5hdHRyKHsgJ3JvbGUnOiAnbWVudWl0ZW0nIH0pLFxuICAgICAgICBzdWJNZW51Q2xhc3MgPSAnaXMtJyArIHR5cGUgKyAnLXN1Ym1lbnUnLFxuICAgICAgICBzdWJJdGVtQ2xhc3MgPSBzdWJNZW51Q2xhc3MgKyAnLWl0ZW0nLFxuICAgICAgICBoYXNTdWJDbGFzcyA9ICdpcy0nICsgdHlwZSArICctc3VibWVudS1wYXJlbnQnLFxuICAgICAgICBhcHBseUFyaWEgPSB0eXBlICE9PSAnYWNjb3JkaW9uJzsgLy8gQWNjb3JkaW9ucyBoYW5kbGUgdGhlaXIgb3duIEFSSUEgYXR0cml1dGVzLlxuXG4gICAgaXRlbXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJGl0ZW0gPSBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHRoaXMpLFxuICAgICAgICAgICRzdWIgPSAkaXRlbS5jaGlsZHJlbigndWwnKTtcblxuICAgICAgaWYgKCRzdWIubGVuZ3RoKSB7XG4gICAgICAgICRpdGVtLmFkZENsYXNzKGhhc1N1YkNsYXNzKTtcbiAgICAgICAgJHN1Yi5hZGRDbGFzcygnc3VibWVudSAnICsgc3ViTWVudUNsYXNzKS5hdHRyKHsgJ2RhdGEtc3VibWVudSc6ICcnIH0pO1xuICAgICAgICBpZiAoYXBwbHlBcmlhKSB7XG4gICAgICAgICAgJGl0ZW0uYXR0cih7XG4gICAgICAgICAgICAnYXJpYS1oYXNwb3B1cCc6IHRydWUsXG4gICAgICAgICAgICAnYXJpYS1sYWJlbCc6ICRpdGVtLmNoaWxkcmVuKCdhOmZpcnN0JykudGV4dCgpXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gTm90ZTogIERyaWxsZG93bnMgYmVoYXZlIGRpZmZlcmVudGx5IGluIGhvdyB0aGV5IGhpZGUsIGFuZCBzbyBuZWVkXG4gICAgICAgICAgLy8gYWRkaXRpb25hbCBhdHRyaWJ1dGVzLiAgV2Ugc2hvdWxkIGxvb2sgaWYgdGhpcyBwb3NzaWJseSBvdmVyLWdlbmVyYWxpemVkXG4gICAgICAgICAgLy8gdXRpbGl0eSAoTmVzdCkgaXMgYXBwcm9wcmlhdGUgd2hlbiB3ZSByZXdvcmsgbWVudXMgaW4gNi40XG4gICAgICAgICAgaWYgKHR5cGUgPT09ICdkcmlsbGRvd24nKSB7XG4gICAgICAgICAgICAkaXRlbS5hdHRyKHsgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgJHN1Yi5hZGRDbGFzcygnc3VibWVudSAnICsgc3ViTWVudUNsYXNzKS5hdHRyKHtcbiAgICAgICAgICAnZGF0YS1zdWJtZW51JzogJycsXG4gICAgICAgICAgJ3JvbGUnOiAnbWVudSdcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0eXBlID09PSAnZHJpbGxkb3duJykge1xuICAgICAgICAgICRzdWIuYXR0cih7ICdhcmlhLWhpZGRlbic6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCRpdGVtLnBhcmVudCgnW2RhdGEtc3VibWVudV0nKS5sZW5ndGgpIHtcbiAgICAgICAgJGl0ZW0uYWRkQ2xhc3MoJ2lzLXN1Ym1lbnUtaXRlbSAnICsgc3ViSXRlbUNsYXNzKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybjtcbiAgfSxcbiAgQnVybjogZnVuY3Rpb24gKG1lbnUsIHR5cGUpIHtcbiAgICB2YXIgLy9pdGVtcyA9IG1lbnUuZmluZCgnbGknKSxcbiAgICBzdWJNZW51Q2xhc3MgPSAnaXMtJyArIHR5cGUgKyAnLXN1Ym1lbnUnLFxuICAgICAgICBzdWJJdGVtQ2xhc3MgPSBzdWJNZW51Q2xhc3MgKyAnLWl0ZW0nLFxuICAgICAgICBoYXNTdWJDbGFzcyA9ICdpcy0nICsgdHlwZSArICctc3VibWVudS1wYXJlbnQnO1xuXG4gICAgbWVudS5maW5kKCc+bGksIC5tZW51LCAubWVudSA+IGxpJykucmVtb3ZlQ2xhc3Moc3ViTWVudUNsYXNzICsgJyAnICsgc3ViSXRlbUNsYXNzICsgJyAnICsgaGFzU3ViQ2xhc3MgKyAnIGlzLXN1Ym1lbnUtaXRlbSBzdWJtZW51IGlzLWFjdGl2ZScpLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpLmNzcygnZGlzcGxheScsICcnKTtcbiAgfVxufTtcblxuXG5cbi8qKiovIH0pXG5cbi8qKioqKiovIH0pOyIsIiFmdW5jdGlvbihuKXtmdW5jdGlvbiBlKHIpe2lmKHRbcl0pcmV0dXJuIHRbcl0uZXhwb3J0czt2YXIgdT10W3JdPXtpOnIsbDohMSxleHBvcnRzOnt9fTtyZXR1cm4gbltyXS5jYWxsKHUuZXhwb3J0cyx1LHUuZXhwb3J0cyxlKSx1Lmw9ITAsdS5leHBvcnRzfXZhciB0PXt9O2UubT1uLGUuYz10LGUuaT1mdW5jdGlvbihuKXtyZXR1cm4gbn0sZS5kPWZ1bmN0aW9uKG4sdCxyKXtlLm8obix0KXx8T2JqZWN0LmRlZmluZVByb3BlcnR5KG4sdCx7Y29uZmlndXJhYmxlOiExLGVudW1lcmFibGU6ITAsZ2V0OnJ9KX0sZS5uPWZ1bmN0aW9uKG4pe3ZhciB0PW4mJm4uX19lc01vZHVsZT9mdW5jdGlvbigpe3JldHVybiBuLmRlZmF1bHR9OmZ1bmN0aW9uKCl7cmV0dXJuIG59O3JldHVybiBlLmQodCxcImFcIix0KSx0fSxlLm89ZnVuY3Rpb24obixlKXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG4sZSl9LGUucD1cIlwiLGUoZS5zPTEwNSl9KHswOmZ1bmN0aW9uKG4sZSl7bi5leHBvcnRzPWpRdWVyeX0sMTpmdW5jdGlvbihuLGUpe24uZXhwb3J0cz17Rm91bmRhdGlvbjp3aW5kb3cuRm91bmRhdGlvbn19LDEwNTpmdW5jdGlvbihuLGUsdCl7bi5leHBvcnRzPXQoMzkpfSwzOTpmdW5jdGlvbihuLGUsdCl7XCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIHI9dCgxKSx1PSh0Lm4ociksdCg2OSkpO3IuRm91bmRhdGlvbi5OZXN0PXUuYX0sNjk6ZnVuY3Rpb24obixlLHQpe1widXNlIHN0cmljdFwiO3QuZChlLFwiYVwiLGZ1bmN0aW9uKCl7cmV0dXJuIGF9KTt2YXIgcj10KDApLHU9dC5uKHIpLGE9e0ZlYXRoZXI6ZnVuY3Rpb24obil7dmFyIGU9YXJndW1lbnRzLmxlbmd0aD4xJiZ2b2lkIDAhPT1hcmd1bWVudHNbMV0/YXJndW1lbnRzWzFdOlwiemZcIjtuLmF0dHIoXCJyb2xlXCIsXCJtZW51YmFyXCIpO3ZhciB0PW4uZmluZChcImxpXCIpLmF0dHIoe3JvbGU6XCJtZW51aXRlbVwifSkscj1cImlzLVwiK2UrXCItc3VibWVudVwiLGE9citcIi1pdGVtXCIsaT1cImlzLVwiK2UrXCItc3VibWVudS1wYXJlbnRcIixvPVwiYWNjb3JkaW9uXCIhPT1lO3QuZWFjaChmdW5jdGlvbigpe3ZhciBuPXUoKSh0aGlzKSx0PW4uY2hpbGRyZW4oXCJ1bFwiKTt0Lmxlbmd0aCYmKG4uYWRkQ2xhc3MoaSksdC5hZGRDbGFzcyhcInN1Ym1lbnUgXCIrcikuYXR0cih7XCJkYXRhLXN1Ym1lbnVcIjpcIlwifSksbyYmKG4uYXR0cih7XCJhcmlhLWhhc3BvcHVwXCI6ITAsXCJhcmlhLWxhYmVsXCI6bi5jaGlsZHJlbihcImE6Zmlyc3RcIikudGV4dCgpfSksXCJkcmlsbGRvd25cIj09PWUmJm4uYXR0cih7XCJhcmlhLWV4cGFuZGVkXCI6ITF9KSksdC5hZGRDbGFzcyhcInN1Ym1lbnUgXCIrcikuYXR0cih7XCJkYXRhLXN1Ym1lbnVcIjpcIlwiLHJvbGU6XCJtZW51XCJ9KSxcImRyaWxsZG93blwiPT09ZSYmdC5hdHRyKHtcImFyaWEtaGlkZGVuXCI6ITB9KSksbi5wYXJlbnQoXCJbZGF0YS1zdWJtZW51XVwiKS5sZW5ndGgmJm4uYWRkQ2xhc3MoXCJpcy1zdWJtZW51LWl0ZW0gXCIrYSl9KX0sQnVybjpmdW5jdGlvbihuLGUpe3ZhciB0PVwiaXMtXCIrZStcIi1zdWJtZW51XCIscj10K1wiLWl0ZW1cIix1PVwiaXMtXCIrZStcIi1zdWJtZW51LXBhcmVudFwiO24uZmluZChcIj5saSwgLm1lbnUsIC5tZW51ID4gbGlcIikucmVtb3ZlQ2xhc3ModCtcIiBcIityK1wiIFwiK3UrXCIgaXMtc3VibWVudS1pdGVtIHN1Ym1lbnUgaXMtYWN0aXZlXCIpLnJlbW92ZUF0dHIoXCJkYXRhLXN1Ym1lbnVcIikuY3NzKFwiZGlzcGxheVwiLFwiXCIpfX19fSk7IiwiLyoqKioqKi8gKGZ1bmN0aW9uKG1vZHVsZXMpIHsgLy8gd2VicGFja0Jvb3RzdHJhcFxuLyoqKioqKi8gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuLyoqKioqKi8gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4vKioqKioqLyBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbi8qKioqKiovIFx0XHR9XG4vKioqKioqLyBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbi8qKioqKiovIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHRpOiBtb2R1bGVJZCxcbi8qKioqKiovIFx0XHRcdGw6IGZhbHNlLFxuLyoqKioqKi8gXHRcdFx0ZXhwb3J0czoge31cbi8qKioqKiovIFx0XHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuLyoqKioqKi8gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbi8qKioqKiovIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdH1cbi8qKioqKiovXG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGlkZW50aXR5IGZ1bmN0aW9uIGZvciBjYWxsaW5nIGhhcm1vbnkgaW1wb3J0cyB3aXRoIHRoZSBjb3JyZWN0IGNvbnRleHRcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuLyoqKioqKi8gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbi8qKioqKiovIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4vKioqKioqLyBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4vKioqKioqLyBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4vKioqKioqLyBcdFx0XHRcdGdldDogZ2V0dGVyXG4vKioqKioqLyBcdFx0XHR9KTtcbi8qKioqKiovIFx0XHR9XG4vKioqKioqLyBcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbi8qKioqKiovIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbi8qKioqKiovIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4vKioqKioqLyBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbi8qKioqKiovIFx0XHRyZXR1cm4gZ2V0dGVyO1xuLyoqKioqKi8gXHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8qKioqKiovIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMTA2KTtcbi8qKioqKiovIH0pXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gKHtcblxuLyoqKi8gMDpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSBqUXVlcnk7XG5cbi8qKiovIH0pLFxuXG4vKioqLyAxOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtGb3VuZGF0aW9uOiB3aW5kb3cuRm91bmRhdGlvbn07XG5cbi8qKiovIH0pLFxuXG4vKioqLyAxMDY6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0MCk7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDQwOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgX193ZWJwYWNrX2V4cG9ydHNfXywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShfX3dlYnBhY2tfZXhwb3J0c19fLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fX2RlZmF1bHQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLm4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX2NvcmVfXyk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfdGltZXJfXyA9IF9fd2VicGFja19yZXF1aXJlX18oNzApO1xuXG5cblxuXG5fX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fW1wiRm91bmRhdGlvblwiXS5UaW1lciA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX3RpbWVyX19bXCJhXCIgLyogVGltZXIgKi9dO1xuXG4vKioqLyB9KSxcblxuLyoqKi8gNzA6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBfX3dlYnBhY2tfZXhwb3J0c19fLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuLyogaGFybW9ueSBleHBvcnQgKGJpbmRpbmcpICovIF9fd2VicGFja19yZXF1aXJlX18uZChfX3dlYnBhY2tfZXhwb3J0c19fLCBcImFcIiwgZnVuY3Rpb24oKSB7IHJldHVybiBUaW1lcjsgfSk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X18pO1xuXG5cblxuXG5mdW5jdGlvbiBUaW1lcihlbGVtLCBvcHRpb25zLCBjYikge1xuICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uLFxuICAgICAgLy9vcHRpb25zIGlzIGFuIG9iamVjdCBmb3IgZWFzaWx5IGFkZGluZyBmZWF0dXJlcyBsYXRlci5cbiAgbmFtZVNwYWNlID0gT2JqZWN0LmtleXMoZWxlbS5kYXRhKCkpWzBdIHx8ICd0aW1lcicsXG4gICAgICByZW1haW4gPSAtMSxcbiAgICAgIHN0YXJ0LFxuICAgICAgdGltZXI7XG5cbiAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuXG4gIHRoaXMucmVzdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZW1haW4gPSAtMTtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHRoaXMuc3RhcnQoKTtcbiAgfTtcblxuICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcbiAgICAvLyBpZighZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHJlbWFpbiA9IHJlbWFpbiA8PSAwID8gZHVyYXRpb24gOiByZW1haW47XG4gICAgZWxlbS5kYXRhKCdwYXVzZWQnLCBmYWxzZSk7XG4gICAgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAob3B0aW9ucy5pbmZpbml0ZSkge1xuICAgICAgICBfdGhpcy5yZXN0YXJ0KCk7IC8vcmVydW4gdGhlIHRpbWVyLlxuICAgICAgfVxuICAgICAgaWYgKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjYigpO1xuICAgICAgfVxuICAgIH0sIHJlbWFpbik7XG4gICAgZWxlbS50cmlnZ2VyKCd0aW1lcnN0YXJ0LnpmLicgKyBuYW1lU3BhY2UpO1xuICB9O1xuXG4gIHRoaXMucGF1c2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pc1BhdXNlZCA9IHRydWU7XG4gICAgLy9pZihlbGVtLmRhdGEoJ3BhdXNlZCcpKXsgcmV0dXJuIGZhbHNlOyB9Ly9tYXliZSBpbXBsZW1lbnQgdGhpcyBzYW5pdHkgY2hlY2sgaWYgdXNlZCBmb3Igb3RoZXIgdGhpbmdzLlxuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgZWxlbS5kYXRhKCdwYXVzZWQnLCB0cnVlKTtcbiAgICB2YXIgZW5kID0gRGF0ZS5ub3coKTtcbiAgICByZW1haW4gPSByZW1haW4gLSAoZW5kIC0gc3RhcnQpO1xuICAgIGVsZW0udHJpZ2dlcigndGltZXJwYXVzZWQuemYuJyArIG5hbWVTcGFjZSk7XG4gIH07XG59XG5cblxuXG4vKioqLyB9KVxuXG4vKioqKioqLyB9KTsiLCIhZnVuY3Rpb24odCl7ZnVuY3Rpb24gZShyKXtpZihuW3JdKXJldHVybiBuW3JdLmV4cG9ydHM7dmFyIGk9bltyXT17aTpyLGw6ITEsZXhwb3J0czp7fX07cmV0dXJuIHRbcl0uY2FsbChpLmV4cG9ydHMsaSxpLmV4cG9ydHMsZSksaS5sPSEwLGkuZXhwb3J0c312YXIgbj17fTtlLm09dCxlLmM9bixlLmk9ZnVuY3Rpb24odCl7cmV0dXJuIHR9LGUuZD1mdW5jdGlvbih0LG4scil7ZS5vKHQsbil8fE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LG4se2NvbmZpZ3VyYWJsZTohMSxlbnVtZXJhYmxlOiEwLGdldDpyfSl9LGUubj1mdW5jdGlvbih0KXt2YXIgbj10JiZ0Ll9fZXNNb2R1bGU/ZnVuY3Rpb24oKXtyZXR1cm4gdC5kZWZhdWx0fTpmdW5jdGlvbigpe3JldHVybiB0fTtyZXR1cm4gZS5kKG4sXCJhXCIsbiksbn0sZS5vPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0LGUpfSxlLnA9XCJcIixlKGUucz0xMDYpfSh7MDpmdW5jdGlvbih0LGUpe3QuZXhwb3J0cz1qUXVlcnl9LDE6ZnVuY3Rpb24odCxlKXt0LmV4cG9ydHM9e0ZvdW5kYXRpb246d2luZG93LkZvdW5kYXRpb259fSwxMDY6ZnVuY3Rpb24odCxlLG4pe3QuZXhwb3J0cz1uKDQwKX0sNDA6ZnVuY3Rpb24odCxlLG4pe1widXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciByPW4oMSksaT0obi5uKHIpLG4oNzApKTtyLkZvdW5kYXRpb24uVGltZXI9aS5hfSw3MDpmdW5jdGlvbih0LGUsbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcih0LGUsbil7dmFyIHIsaSxvPXRoaXMsdT1lLmR1cmF0aW9uLGE9T2JqZWN0LmtleXModC5kYXRhKCkpWzBdfHxcInRpbWVyXCIscz0tMTt0aGlzLmlzUGF1c2VkPSExLHRoaXMucmVzdGFydD1mdW5jdGlvbigpe3M9LTEsY2xlYXJUaW1lb3V0KGkpLHRoaXMuc3RhcnQoKX0sdGhpcy5zdGFydD1mdW5jdGlvbigpe3RoaXMuaXNQYXVzZWQ9ITEsY2xlYXJUaW1lb3V0KGkpLHM9czw9MD91OnMsdC5kYXRhKFwicGF1c2VkXCIsITEpLHI9RGF0ZS5ub3coKSxpPXNldFRpbWVvdXQoZnVuY3Rpb24oKXtlLmluZmluaXRlJiZvLnJlc3RhcnQoKSxuJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBuJiZuKCl9LHMpLHQudHJpZ2dlcihcInRpbWVyc3RhcnQuemYuXCIrYSl9LHRoaXMucGF1c2U9ZnVuY3Rpb24oKXt0aGlzLmlzUGF1c2VkPSEwLGNsZWFyVGltZW91dChpKSx0LmRhdGEoXCJwYXVzZWRcIiwhMCk7dmFyIGU9RGF0ZS5ub3coKTtzLT1lLXIsdC50cmlnZ2VyKFwidGltZXJwYXVzZWQuemYuXCIrYSl9fW4uZChlLFwiYVwiLGZ1bmN0aW9uKCl7cmV0dXJuIHJ9KTt2YXIgaT1uKDApO24ubihpKX19KTsiLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbiAoJCkge1xuXG4gIGZ1bmN0aW9uIFRpbWVyKGVsZW0sIG9wdGlvbnMsIGNiKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uLFxuICAgICAgICAvL29wdGlvbnMgaXMgYW4gb2JqZWN0IGZvciBlYXNpbHkgYWRkaW5nIGZlYXR1cmVzIGxhdGVyLlxuICAgIG5hbWVTcGFjZSA9IE9iamVjdC5rZXlzKGVsZW0uZGF0YSgpKVswXSB8fCAndGltZXInLFxuICAgICAgICByZW1haW4gPSAtMSxcbiAgICAgICAgc3RhcnQsXG4gICAgICAgIHRpbWVyO1xuXG4gICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5yZXN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmVtYWluID0gLTE7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgdGhpcy5zdGFydCgpO1xuICAgIH07XG5cbiAgICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuICAgICAgLy8gaWYoIWVsZW0uZGF0YSgncGF1c2VkJykpeyByZXR1cm4gZmFsc2U7IH0vL21heWJlIGltcGxlbWVudCB0aGlzIHNhbml0eSBjaGVjayBpZiB1c2VkIGZvciBvdGhlciB0aGluZ3MuXG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgcmVtYWluID0gcmVtYWluIDw9IDAgPyBkdXJhdGlvbiA6IHJlbWFpbjtcbiAgICAgIGVsZW0uZGF0YSgncGF1c2VkJywgZmFsc2UpO1xuICAgICAgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuaW5maW5pdGUpIHtcbiAgICAgICAgICBfdGhpcy5yZXN0YXJ0KCk7IC8vcmVydW4gdGhlIHRpbWVyLlxuICAgICAgICB9XG4gICAgICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjYigpO1xuICAgICAgICB9XG4gICAgICB9LCByZW1haW4pO1xuICAgICAgZWxlbS50cmlnZ2VyKCd0aW1lcnN0YXJ0LnpmLicgKyBuYW1lU3BhY2UpO1xuICAgIH07XG5cbiAgICB0aGlzLnBhdXNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5pc1BhdXNlZCA9IHRydWU7XG4gICAgICAvL2lmKGVsZW0uZGF0YSgncGF1c2VkJykpeyByZXR1cm4gZmFsc2U7IH0vL21heWJlIGltcGxlbWVudCB0aGlzIHNhbml0eSBjaGVjayBpZiB1c2VkIGZvciBvdGhlciB0aGluZ3MuXG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgZWxlbS5kYXRhKCdwYXVzZWQnLCB0cnVlKTtcbiAgICAgIHZhciBlbmQgPSBEYXRlLm5vdygpO1xuICAgICAgcmVtYWluID0gcmVtYWluIC0gKGVuZCAtIHN0YXJ0KTtcbiAgICAgIGVsZW0udHJpZ2dlcigndGltZXJwYXVzZWQuemYuJyArIG5hbWVTcGFjZSk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW5zIGEgY2FsbGJhY2sgZnVuY3Rpb24gd2hlbiBpbWFnZXMgYXJlIGZ1bGx5IGxvYWRlZC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGltYWdlcyAtIEltYWdlKHMpIHRvIGNoZWNrIGlmIGxvYWRlZC5cbiAgICogQHBhcmFtIHtGdW5jfSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBpbWFnZSBpcyBmdWxseSBsb2FkZWQuXG4gICAqL1xuICBmdW5jdGlvbiBvbkltYWdlc0xvYWRlZChpbWFnZXMsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICB1bmxvYWRlZCA9IGltYWdlcy5sZW5ndGg7XG5cbiAgICBpZiAodW5sb2FkZWQgPT09IDApIHtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgaW1hZ2VzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgLy8gQ2hlY2sgaWYgaW1hZ2UgaXMgbG9hZGVkXG4gICAgICBpZiAodGhpcy5jb21wbGV0ZSB8fCB0aGlzLnJlYWR5U3RhdGUgPT09IDQgfHwgdGhpcy5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XG4gICAgICAgIHNpbmdsZUltYWdlTG9hZGVkKCk7XG4gICAgICB9XG4gICAgICAvLyBGb3JjZSBsb2FkIHRoZSBpbWFnZVxuICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gZml4IGZvciBJRS4gU2VlIGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vc25pcHBldHMvanF1ZXJ5L2ZpeGluZy1sb2FkLWluLWllLWZvci1jYWNoZWQtaW1hZ2VzL1xuICAgICAgICAgIHZhciBzcmMgPSAkKHRoaXMpLmF0dHIoJ3NyYycpO1xuICAgICAgICAgICQodGhpcykuYXR0cignc3JjJywgc3JjICsgKHNyYy5pbmRleE9mKCc/JykgPj0gMCA/ICcmJyA6ICc/JykgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XG4gICAgICAgICAgJCh0aGlzKS5vbmUoJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBzaW5nbGVJbWFnZUxvYWRlZCgpIHtcbiAgICAgIHVubG9hZGVkLS07XG4gICAgICBpZiAodW5sb2FkZWQgPT09IDApIHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBGb3VuZGF0aW9uLlRpbWVyID0gVGltZXI7XG4gIEZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQgPSBvbkltYWdlc0xvYWRlZDtcbn0oalF1ZXJ5KTsiLCJcInVzZSBzdHJpY3RcIjshZnVuY3Rpb24odCl7ZnVuY3Rpb24gZSh0LGUsaSl7dmFyIGEscyxuPXRoaXMscj1lLmR1cmF0aW9uLG89T2JqZWN0LmtleXModC5kYXRhKCkpWzBdfHxcInRpbWVyXCIsdT0tMTt0aGlzLmlzUGF1c2VkPSExLHRoaXMucmVzdGFydD1mdW5jdGlvbigpe3U9LTEsY2xlYXJUaW1lb3V0KHMpLHRoaXMuc3RhcnQoKX0sdGhpcy5zdGFydD1mdW5jdGlvbigpe3RoaXMuaXNQYXVzZWQ9ITEsY2xlYXJUaW1lb3V0KHMpLHU9dTw9MD9yOnUsdC5kYXRhKFwicGF1c2VkXCIsITEpLGE9RGF0ZS5ub3coKSxzPXNldFRpbWVvdXQoZnVuY3Rpb24oKXtlLmluZmluaXRlJiZuLnJlc3RhcnQoKSxpJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBpJiZpKCl9LHUpLHQudHJpZ2dlcihcInRpbWVyc3RhcnQuemYuXCIrbyl9LHRoaXMucGF1c2U9ZnVuY3Rpb24oKXt0aGlzLmlzUGF1c2VkPSEwLGNsZWFyVGltZW91dChzKSx0LmRhdGEoXCJwYXVzZWRcIiwhMCk7dmFyIGU9RGF0ZS5ub3coKTt1LT1lLWEsdC50cmlnZ2VyKFwidGltZXJwYXVzZWQuemYuXCIrbyl9fWZ1bmN0aW9uIGkoZSxpKXtmdW5jdGlvbiBhKCl7cy0tLDA9PT1zJiZpKCl9dmFyIHM9ZS5sZW5ndGg7MD09PXMmJmkoKSxlLmVhY2goZnVuY3Rpb24oKXtpZih0aGlzLmNvbXBsZXRlfHw0PT09dGhpcy5yZWFkeVN0YXRlfHxcImNvbXBsZXRlXCI9PT10aGlzLnJlYWR5U3RhdGUpYSgpO2Vsc2V7dmFyIGU9dCh0aGlzKS5hdHRyKFwic3JjXCIpO3QodGhpcykuYXR0cihcInNyY1wiLGUrKGUuaW5kZXhPZihcIj9cIik+PTA/XCImXCI6XCI/XCIpKyhuZXcgRGF0ZSkuZ2V0VGltZSgpKSx0KHRoaXMpLm9uZShcImxvYWRcIixmdW5jdGlvbigpe2EoKX0pfX0pfUZvdW5kYXRpb24uVGltZXI9ZSxGb3VuZGF0aW9uLm9uSW1hZ2VzTG9hZGVkPWl9KGpRdWVyeSk7IiwiLyoqKioqKi8gKGZ1bmN0aW9uKG1vZHVsZXMpIHsgLy8gd2VicGFja0Jvb3RzdHJhcFxuLyoqKioqKi8gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuLyoqKioqKi8gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4vKioqKioqLyBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbi8qKioqKiovIFx0XHR9XG4vKioqKioqLyBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbi8qKioqKiovIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHRpOiBtb2R1bGVJZCxcbi8qKioqKiovIFx0XHRcdGw6IGZhbHNlLFxuLyoqKioqKi8gXHRcdFx0ZXhwb3J0czoge31cbi8qKioqKiovIFx0XHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuLyoqKioqKi8gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbi8qKioqKiovIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdH1cbi8qKioqKiovXG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGlkZW50aXR5IGZ1bmN0aW9uIGZvciBjYWxsaW5nIGhhcm1vbnkgaW1wb3J0cyB3aXRoIHRoZSBjb3JyZWN0IGNvbnRleHRcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuLyoqKioqKi8gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbi8qKioqKiovIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4vKioqKioqLyBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4vKioqKioqLyBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4vKioqKioqLyBcdFx0XHRcdGdldDogZ2V0dGVyXG4vKioqKioqLyBcdFx0XHR9KTtcbi8qKioqKiovIFx0XHR9XG4vKioqKioqLyBcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbi8qKioqKiovIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbi8qKioqKiovIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4vKioqKioqLyBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbi8qKioqKiovIFx0XHRyZXR1cm4gZ2V0dGVyO1xuLyoqKioqKi8gXHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8qKioqKiovIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMTA3KTtcbi8qKioqKiovIH0pXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gKHtcblxuLyoqKi8gMDpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSBqUXVlcnk7XG5cbi8qKiovIH0pLFxuXG4vKioqLyAxMDc6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cbm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0MSk7XG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDQxOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgX193ZWJwYWNrX2V4cG9ydHNfXywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShfX3dlYnBhY2tfZXhwb3J0c19fLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfXyk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfdG91Y2hfXyA9IF9fd2VicGFja19yZXF1aXJlX18oNzEpO1xuXG5cblxuXG5fX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fdXRpbF90b3VjaF9fW1wiYVwiIC8qIFRvdWNoICovXS5pbml0KF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0LmEpO1xuXG53aW5kb3cuRm91bmRhdGlvbi5Ub3VjaCA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX3RvdWNoX19bXCJhXCIgLyogVG91Y2ggKi9dO1xuXG4vKioqLyB9KSxcblxuLyoqKi8gNzE6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBfX3dlYnBhY2tfZXhwb3J0c19fLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuLyogaGFybW9ueSBleHBvcnQgKGJpbmRpbmcpICovIF9fd2VicGFja19yZXF1aXJlX18uZChfX3dlYnBhY2tfZXhwb3J0c19fLCBcImFcIiwgZnVuY3Rpb24oKSB7IHJldHVybiBUb3VjaDsgfSk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X18pO1xudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKldvcmsgaW5zcGlyZWQgYnkgbXVsdGlwbGUganF1ZXJ5IHN3aXBlIHBsdWdpbnMqKlxuLy8qKkRvbmUgYnkgWW9oYWkgQXJhcmF0ICoqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG5cblxudmFyIFRvdWNoID0ge307XG5cbnZhciBzdGFydFBvc1gsXG4gICAgc3RhcnRQb3NZLFxuICAgIHN0YXJ0VGltZSxcbiAgICBlbGFwc2VkVGltZSxcbiAgICBpc01vdmluZyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBvblRvdWNoRW5kKCkge1xuICAvLyAgYWxlcnQodGhpcyk7XG4gIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUpO1xuICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCk7XG4gIGlzTW92aW5nID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIG9uVG91Y2hNb3ZlKGUpIHtcbiAgaWYgKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0LmEuc3BvdFN3aXBlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG4gIGlmIChpc01vdmluZykge1xuICAgIHZhciB4ID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuICAgIHZhciB5ID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xuICAgIHZhciBkeCA9IHN0YXJ0UG9zWCAtIHg7XG4gICAgdmFyIGR5ID0gc3RhcnRQb3NZIC0geTtcbiAgICB2YXIgZGlyO1xuICAgIGVsYXBzZWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBzdGFydFRpbWU7XG4gICAgaWYgKE1hdGguYWJzKGR4KSA+PSBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdC5hLnNwb3RTd2lwZS5tb3ZlVGhyZXNob2xkICYmIGVsYXBzZWRUaW1lIDw9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0LmEuc3BvdFN3aXBlLnRpbWVUaHJlc2hvbGQpIHtcbiAgICAgIGRpciA9IGR4ID4gMCA/ICdsZWZ0JyA6ICdyaWdodCc7XG4gICAgfVxuICAgIC8vIGVsc2UgaWYoTWF0aC5hYnMoZHkpID49ICQuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQgJiYgZWxhcHNlZFRpbWUgPD0gJC5zcG90U3dpcGUudGltZVRocmVzaG9sZCkge1xuICAgIC8vICAgZGlyID0gZHkgPiAwID8gJ2Rvd24nIDogJ3VwJztcbiAgICAvLyB9XG4gICAgaWYgKGRpcikge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgb25Ub3VjaEVuZC5jYWxsKHRoaXMpO1xuICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh0aGlzKS50cmlnZ2VyKCdzd2lwZScsIGRpcikudHJpZ2dlcignc3dpcGUnICsgZGlyKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KGUpIHtcbiAgaWYgKGUudG91Y2hlcy5sZW5ndGggPT0gMSkge1xuICAgIHN0YXJ0UG9zWCA9IGUudG91Y2hlc1swXS5wYWdlWDtcbiAgICBzdGFydFBvc1kgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgaXNNb3ZpbmcgPSB0cnVlO1xuICAgIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIGZhbHNlKTtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCwgZmFsc2UpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gIHRoaXMuYWRkRXZlbnRMaXN0ZW5lciAmJiB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQsIGZhbHNlKTtcbn1cblxuZnVuY3Rpb24gdGVhcmRvd24oKSB7XG4gIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uVG91Y2hTdGFydCk7XG59XG5cbnZhciBTcG90U3dpcGUgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFNwb3RTd2lwZSgkKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNwb3RTd2lwZSk7XG5cbiAgICB0aGlzLnZlcnNpb24gPSAnMS4wLjAnO1xuICAgIHRoaXMuZW5hYmxlZCA9ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICB0aGlzLnByZXZlbnREZWZhdWx0ID0gZmFsc2U7XG4gICAgdGhpcy5tb3ZlVGhyZXNob2xkID0gNzU7XG4gICAgdGhpcy50aW1lVGhyZXNob2xkID0gMjAwO1xuICAgIHRoaXMuJCA9ICQ7XG4gICAgdGhpcy5faW5pdCgpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFNwb3RTd2lwZSwgW3tcbiAgICBrZXk6ICdfaW5pdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9pbml0KCkge1xuICAgICAgdmFyICQgPSB0aGlzLiQ7XG4gICAgICAkLmV2ZW50LnNwZWNpYWwuc3dpcGUgPSB7IHNldHVwOiBpbml0IH07XG5cbiAgICAgICQuZWFjaChbJ2xlZnQnLCAndXAnLCAnZG93bicsICdyaWdodCddLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQuZXZlbnQuc3BlY2lhbFsnc3dpcGUnICsgdGhpc10gPSB7IHNldHVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkKHRoaXMpLm9uKCdzd2lwZScsICQubm9vcCk7XG4gICAgICAgICAgfSB9O1xuICAgICAgfSk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFNwb3RTd2lwZTtcbn0oKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIEFzIGZhciBhcyBJIGNhbiB0ZWxsLCBib3RoIHNldHVwU3BvdFN3aXBlIGFuZCAgICAqXG4gKiBzZXR1cFRvdWNoSGFuZGxlciBzaG91bGQgYmUgaWRlbXBvdGVudCwgICAgICAgICAgKlxuICogYmVjYXVzZSB0aGV5IGRpcmVjdGx5IHJlcGxhY2UgZnVuY3Rpb25zICYgICAgICAgICpcbiAqIHZhbHVlcywgYW5kIGRvIG5vdCBhZGQgZXZlbnQgaGFuZGxlcnMgZGlyZWN0bHkuICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuVG91Y2guc2V0dXBTcG90U3dpcGUgPSBmdW5jdGlvbiAoJCkge1xuICAkLnNwb3RTd2lwZSA9IG5ldyBTcG90U3dpcGUoJCk7XG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTWV0aG9kIGZvciBhZGRpbmcgcHNldWRvIGRyYWcgZXZlbnRzIHRvIGVsZW1lbnRzICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5Ub3VjaC5zZXR1cFRvdWNoSGFuZGxlciA9IGZ1bmN0aW9uICgkKSB7XG4gICQuZm4uYWRkVG91Y2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgJChlbCkuYmluZCgndG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgdG91Y2hjYW5jZWwnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vd2UgcGFzcyB0aGUgb3JpZ2luYWwgZXZlbnQgb2JqZWN0IGJlY2F1c2UgdGhlIGpRdWVyeSBldmVudFxuICAgICAgICAvL29iamVjdCBpcyBub3JtYWxpemVkIHRvIHczYyBzcGVjcyBhbmQgZG9lcyBub3QgcHJvdmlkZSB0aGUgVG91Y2hMaXN0XG4gICAgICAgIGhhbmRsZVRvdWNoKGV2ZW50KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdmFyIGhhbmRsZVRvdWNoID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICB2YXIgdG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzLFxuICAgICAgICAgIGZpcnN0ID0gdG91Y2hlc1swXSxcbiAgICAgICAgICBldmVudFR5cGVzID0ge1xuICAgICAgICB0b3VjaHN0YXJ0OiAnbW91c2Vkb3duJyxcbiAgICAgICAgdG91Y2htb3ZlOiAnbW91c2Vtb3ZlJyxcbiAgICAgICAgdG91Y2hlbmQ6ICdtb3VzZXVwJ1xuICAgICAgfSxcbiAgICAgICAgICB0eXBlID0gZXZlbnRUeXBlc1tldmVudC50eXBlXSxcbiAgICAgICAgICBzaW11bGF0ZWRFdmVudDtcblxuICAgICAgaWYgKCdNb3VzZUV2ZW50JyBpbiB3aW5kb3cgJiYgdHlwZW9mIHdpbmRvdy5Nb3VzZUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gbmV3IHdpbmRvdy5Nb3VzZUV2ZW50KHR5cGUsIHtcbiAgICAgICAgICAnYnViYmxlcyc6IHRydWUsXG4gICAgICAgICAgJ2NhbmNlbGFibGUnOiB0cnVlLFxuICAgICAgICAgICdzY3JlZW5YJzogZmlyc3Quc2NyZWVuWCxcbiAgICAgICAgICAnc2NyZWVuWSc6IGZpcnN0LnNjcmVlblksXG4gICAgICAgICAgJ2NsaWVudFgnOiBmaXJzdC5jbGllbnRYLFxuICAgICAgICAgICdjbGllbnRZJzogZmlyc3QuY2xpZW50WVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnQnKTtcbiAgICAgICAgc2ltdWxhdGVkRXZlbnQuaW5pdE1vdXNlRXZlbnQodHlwZSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAxLCBmaXJzdC5zY3JlZW5YLCBmaXJzdC5zY3JlZW5ZLCBmaXJzdC5jbGllbnRYLCBmaXJzdC5jbGllbnRZLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgMCAvKmxlZnQqLywgbnVsbCk7XG4gICAgICB9XG4gICAgICBmaXJzdC50YXJnZXQuZGlzcGF0Y2hFdmVudChzaW11bGF0ZWRFdmVudCk7XG4gICAgfTtcbiAgfTtcbn07XG5cblRvdWNoLmluaXQgPSBmdW5jdGlvbiAoJCkge1xuICBpZiAodHlwZW9mICQuc3BvdFN3aXBlID09PSAndW5kZWZpbmVkJykge1xuICAgIFRvdWNoLnNldHVwU3BvdFN3aXBlKCQpO1xuICAgIFRvdWNoLnNldHVwVG91Y2hIYW5kbGVyKCQpO1xuICB9XG59O1xuXG5cblxuLyoqKi8gfSlcblxuLyoqKioqKi8gfSk7IiwiIWZ1bmN0aW9uKGUpe2Z1bmN0aW9uIHQobyl7aWYobltvXSlyZXR1cm4gbltvXS5leHBvcnRzO3ZhciBpPW5bb109e2k6byxsOiExLGV4cG9ydHM6e319O3JldHVybiBlW29dLmNhbGwoaS5leHBvcnRzLGksaS5leHBvcnRzLHQpLGkubD0hMCxpLmV4cG9ydHN9dmFyIG49e307dC5tPWUsdC5jPW4sdC5pPWZ1bmN0aW9uKGUpe3JldHVybiBlfSx0LmQ9ZnVuY3Rpb24oZSxuLG8pe3QubyhlLG4pfHxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxuLHtjb25maWd1cmFibGU6ITEsZW51bWVyYWJsZTohMCxnZXQ6b30pfSx0Lm49ZnVuY3Rpb24oZSl7dmFyIG49ZSYmZS5fX2VzTW9kdWxlP2Z1bmN0aW9uKCl7cmV0dXJuIGUuZGVmYXVsdH06ZnVuY3Rpb24oKXtyZXR1cm4gZX07cmV0dXJuIHQuZChuLFwiYVwiLG4pLG59LHQubz1mdW5jdGlvbihlLHQpe3JldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZSx0KX0sdC5wPVwiXCIsdCh0LnM9MTA3KX0oezA6ZnVuY3Rpb24oZSx0KXtlLmV4cG9ydHM9alF1ZXJ5fSwxMDc6ZnVuY3Rpb24oZSx0LG4pe2UuZXhwb3J0cz1uKDQxKX0sNDE6ZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO09iamVjdC5kZWZpbmVQcm9wZXJ0eSh0LFwiX19lc01vZHVsZVwiLHt2YWx1ZTohMH0pO3ZhciBvPW4oMCksaT1uLm4obyksdT1uKDcxKTt1LmEuaW5pdChpLmEpLHdpbmRvdy5Gb3VuZGF0aW9uLlRvdWNoPXUuYX0sNzE6ZnVuY3Rpb24oZSx0LG4pe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG8oZSx0KXtpZighKGUgaW5zdGFuY2VvZiB0KSl0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpfWZ1bmN0aW9uIGkoKXt0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIix1KSx0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLGkpLHc9ITF9ZnVuY3Rpb24gdShlKXtpZihsLmEuc3BvdFN3aXBlLnByZXZlbnREZWZhdWx0JiZlLnByZXZlbnREZWZhdWx0KCksdyl7dmFyIHQsbj1lLnRvdWNoZXNbMF0ucGFnZVgsbz0oZS50b3VjaGVzWzBdLnBhZ2VZLHMtbik7cD0obmV3IERhdGUpLmdldFRpbWUoKS1oLE1hdGguYWJzKG8pPj1sLmEuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQmJnA8PWwuYS5zcG90U3dpcGUudGltZVRocmVzaG9sZCYmKHQ9bz4wP1wibGVmdFwiOlwicmlnaHRcIiksdCYmKGUucHJldmVudERlZmF1bHQoKSxpLmNhbGwodGhpcyksbCgpKHRoaXMpLnRyaWdnZXIoXCJzd2lwZVwiLHQpLnRyaWdnZXIoXCJzd2lwZVwiK3QpKX19ZnVuY3Rpb24gcihlKXsxPT1lLnRvdWNoZXMubGVuZ3RoJiYocz1lLnRvdWNoZXNbMF0ucGFnZVgsYT1lLnRvdWNoZXNbMF0ucGFnZVksdz0hMCxoPShuZXcgRGF0ZSkuZ2V0VGltZSgpLHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLHUsITEpLHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsaSwhMSkpfWZ1bmN0aW9uIGMoKXt0aGlzLmFkZEV2ZW50TGlzdGVuZXImJnRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoc3RhcnRcIixyLCExKX1uLmQodCxcImFcIixmdW5jdGlvbigpe3JldHVybiB2fSk7dmFyIHMsYSxoLHAsZj1uKDApLGw9bi5uKGYpLGQ9ZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUsdCl7Zm9yKHZhciBuPTA7bjx0Lmxlbmd0aDtuKyspe3ZhciBvPXRbbl07by5lbnVtZXJhYmxlPW8uZW51bWVyYWJsZXx8ITEsby5jb25maWd1cmFibGU9ITAsXCJ2YWx1ZVwiaW4gbyYmKG8ud3JpdGFibGU9ITApLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLG8ua2V5LG8pfX1yZXR1cm4gZnVuY3Rpb24odCxuLG8pe3JldHVybiBuJiZlKHQucHJvdG90eXBlLG4pLG8mJmUodCxvKSx0fX0oKSx2PXt9LHc9ITEsbT1mdW5jdGlvbigpe2Z1bmN0aW9uIGUodCl7byh0aGlzLGUpLHRoaXMudmVyc2lvbj1cIjEuMC4wXCIsdGhpcy5lbmFibGVkPVwib250b3VjaHN0YXJ0XCJpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsdGhpcy5wcmV2ZW50RGVmYXVsdD0hMSx0aGlzLm1vdmVUaHJlc2hvbGQ9NzUsdGhpcy50aW1lVGhyZXNob2xkPTIwMCx0aGlzLiQ9dCx0aGlzLl9pbml0KCl9cmV0dXJuIGQoZSxbe2tleTpcIl9pbml0XCIsdmFsdWU6ZnVuY3Rpb24oKXt2YXIgZT10aGlzLiQ7ZS5ldmVudC5zcGVjaWFsLnN3aXBlPXtzZXR1cDpjfSxlLmVhY2goW1wibGVmdFwiLFwidXBcIixcImRvd25cIixcInJpZ2h0XCJdLGZ1bmN0aW9uKCl7ZS5ldmVudC5zcGVjaWFsW1wic3dpcGVcIit0aGlzXT17c2V0dXA6ZnVuY3Rpb24oKXtlKHRoaXMpLm9uKFwic3dpcGVcIixlLm5vb3ApfX19KX19XSksZX0oKTt2LnNldHVwU3BvdFN3aXBlPWZ1bmN0aW9uKGUpe2Uuc3BvdFN3aXBlPW5ldyBtKGUpfSx2LnNldHVwVG91Y2hIYW5kbGVyPWZ1bmN0aW9uKGUpe2UuZm4uYWRkVG91Y2g9ZnVuY3Rpb24oKXt0aGlzLmVhY2goZnVuY3Rpb24obixvKXtlKG8pLmJpbmQoXCJ0b3VjaHN0YXJ0IHRvdWNobW92ZSB0b3VjaGVuZCB0b3VjaGNhbmNlbFwiLGZ1bmN0aW9uKCl7dChldmVudCl9KX0pO3ZhciB0PWZ1bmN0aW9uKGUpe3ZhciB0LG49ZS5jaGFuZ2VkVG91Y2hlcyxvPW5bMF0saT17dG91Y2hzdGFydDpcIm1vdXNlZG93blwiLHRvdWNobW92ZTpcIm1vdXNlbW92ZVwiLHRvdWNoZW5kOlwibW91c2V1cFwifSx1PWlbZS50eXBlXTtcIk1vdXNlRXZlbnRcImluIHdpbmRvdyYmXCJmdW5jdGlvblwiPT10eXBlb2Ygd2luZG93Lk1vdXNlRXZlbnQ/dD1uZXcgd2luZG93Lk1vdXNlRXZlbnQodSx7YnViYmxlczohMCxjYW5jZWxhYmxlOiEwLHNjcmVlblg6by5zY3JlZW5YLHNjcmVlblk6by5zY3JlZW5ZLGNsaWVudFg6by5jbGllbnRYLGNsaWVudFk6by5jbGllbnRZfSk6KHQ9ZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJNb3VzZUV2ZW50XCIpLHQuaW5pdE1vdXNlRXZlbnQodSwhMCwhMCx3aW5kb3csMSxvLnNjcmVlblgsby5zY3JlZW5ZLG8uY2xpZW50WCxvLmNsaWVudFksITEsITEsITEsITEsMCxudWxsKSksby50YXJnZXQuZGlzcGF0Y2hFdmVudCh0KX19fSx2LmluaXQ9ZnVuY3Rpb24oZSl7dm9pZCAwPT09ZS5zcG90U3dpcGUmJih2LnNldHVwU3BvdFN3aXBlKGUpLHYuc2V0dXBUb3VjaEhhbmRsZXIoZSkpfX19KTsiLCIvKioqKioqLyAoZnVuY3Rpb24obW9kdWxlcykgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbi8qKioqKiovIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuLyoqKioqKi8gXHRcdH1cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdGk6IG1vZHVsZUlkLFxuLyoqKioqKi8gXHRcdFx0bDogZmFsc2UsXG4vKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fVxuLyoqKioqKi8gXHRcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuLyoqKioqKi8gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4vKioqKioqLyBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbi8qKioqKiovIFx0fVxuLyoqKioqKi9cbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9ueSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4vKioqKioqLyBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuLyoqKioqKi8gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbi8qKioqKiovIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbi8qKioqKiovIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbi8qKioqKiovIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbi8qKioqKiovIFx0XHRcdH0pO1xuLyoqKioqKi8gXHRcdH1cbi8qKioqKiovIFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuLyoqKioqKi8gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuLyoqKioqKi8gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbi8qKioqKiovIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4vKioqKioqLyBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuLyoqKioqKi8gXHRcdHJldHVybiBnZXR0ZXI7XG4vKioqKioqLyBcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAxMDgpO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoe1xuXG4vKioqLyAwOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IGpRdWVyeTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDE6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0ge0ZvdW5kYXRpb246IHdpbmRvdy5Gb3VuZGF0aW9ufTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDEwODpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxubW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQyKTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gNDpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSB7TW90aW9uOiB3aW5kb3cuRm91bmRhdGlvbi5Nb3Rpb24sIE1vdmU6IHdpbmRvdy5Gb3VuZGF0aW9uLk1vdmV9O1xuXG4vKioqLyB9KSxcblxuLyoqKi8gNDI6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBfX3dlYnBhY2tfZXhwb3J0c19fLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KF9fd2VicGFja19leHBvcnRzX18sIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fZm91bmRhdGlvbl9jb3JlX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDEpO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fZm91bmRhdGlvbl9jb3JlX19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfanF1ZXJ5X18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9qcXVlcnlfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9qcXVlcnlfXyk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8yX19mb3VuZGF0aW9uX3V0aWxfdHJpZ2dlcnNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oNyk7XG5cblxuXG5cbl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMl9fZm91bmRhdGlvbl91dGlsX3RyaWdnZXJzX19bXCJhXCIgLyogVHJpZ2dlcnMgKi9dLmluaXQoX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX2pxdWVyeV9fX2RlZmF1bHQuYSwgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX2NvcmVfX1tcIkZvdW5kYXRpb25cIl0pO1xuXG4vKioqLyB9KSxcblxuLyoqKi8gNzpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIF9fd2VicGFja19leHBvcnRzX18sIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG4vKiBoYXJtb255IGV4cG9ydCAoYmluZGluZykgKi8gX193ZWJwYWNrX3JlcXVpcmVfXy5kKF9fd2VicGFja19leHBvcnRzX18sIFwiYVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIFRyaWdnZXJzOyB9KTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfXyk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfbW90aW9uX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDQpO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX21vdGlvbl9fX2RlZmF1bHQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLm4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfbW90aW9uX18pO1xuXG5cblxuXG5cbnZhciBNdXRhdGlvbk9ic2VydmVyID0gZnVuY3Rpb24gKCkge1xuICB2YXIgcHJlZml4ZXMgPSBbJ1dlYktpdCcsICdNb3onLCAnTycsICdNcycsICcnXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChwcmVmaXhlc1tpXSArICdNdXRhdGlvbk9ic2VydmVyJyBpbiB3aW5kb3cpIHtcbiAgICAgIHJldHVybiB3aW5kb3dbcHJlZml4ZXNbaV0gKyAnTXV0YXRpb25PYnNlcnZlciddO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59KCk7XG5cbnZhciB0cmlnZ2VycyA9IGZ1bmN0aW9uIChlbCwgdHlwZSkge1xuICBlbC5kYXRhKHR5cGUpLnNwbGl0KCcgJykuZm9yRWFjaChmdW5jdGlvbiAoaWQpIHtcbiAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKCcjJyArIGlkKVt0eXBlID09PSAnY2xvc2UnID8gJ3RyaWdnZXInIDogJ3RyaWdnZXJIYW5kbGVyJ10odHlwZSArICcuemYudHJpZ2dlcicsIFtlbF0pO1xuICB9KTtcbn07XG5cbnZhciBUcmlnZ2VycyA9IHtcbiAgTGlzdGVuZXJzOiB7XG4gICAgQmFzaWM6IHt9LFxuICAgIEdsb2JhbDoge31cbiAgfSxcbiAgSW5pdGlhbGl6ZXJzOiB7fVxufTtcblxuVHJpZ2dlcnMuTGlzdGVuZXJzLkJhc2ljID0ge1xuICBvcGVuTGlzdGVuZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB0cmlnZ2VycyhfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHRoaXMpLCAnb3BlbicpO1xuICB9LFxuICBjbG9zZUxpc3RlbmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGlkID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh0aGlzKS5kYXRhKCdjbG9zZScpO1xuICAgIGlmIChpZCkge1xuICAgICAgdHJpZ2dlcnMoX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh0aGlzKSwgJ2Nsb3NlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcykudHJpZ2dlcignY2xvc2UuemYudHJpZ2dlcicpO1xuICAgIH1cbiAgfSxcbiAgdG9nZ2xlTGlzdGVuZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaWQgPSBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHRoaXMpLmRhdGEoJ3RvZ2dsZScpO1xuICAgIGlmIChpZCkge1xuICAgICAgdHJpZ2dlcnMoX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh0aGlzKSwgJ3RvZ2dsZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHRoaXMpLnRyaWdnZXIoJ3RvZ2dsZS56Zi50cmlnZ2VyJyk7XG4gICAgfVxuICB9LFxuICBjbG9zZWFibGVMaXN0ZW5lcjogZnVuY3Rpb24gKGUpIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIHZhciBhbmltYXRpb24gPSBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHRoaXMpLmRhdGEoJ2Nsb3NhYmxlJyk7XG5cbiAgICBpZiAoYW5pbWF0aW9uICE9PSAnJykge1xuICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfbW90aW9uX19bXCJNb3Rpb25cIl0uYW5pbWF0ZU91dChfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHRoaXMpLCBhbmltYXRpb24sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh0aGlzKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHRoaXMpLmZhZGVPdXQoKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgICB9XG4gIH0sXG4gIHRvZ2dsZUZvY3VzTGlzdGVuZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaWQgPSBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHRoaXMpLmRhdGEoJ3RvZ2dsZS1mb2N1cycpO1xuICAgIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkoJyMnICsgaWQpLnRyaWdnZXJIYW5kbGVyKCd0b2dnbGUuemYudHJpZ2dlcicsIFtfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHRoaXMpXSk7XG4gIH1cbn07XG5cbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtb3Blbl0gd2lsbCByZXZlYWwgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG5UcmlnZ2Vycy5Jbml0aWFsaXplcnMuYWRkT3Blbkxpc3RlbmVyID0gZnVuY3Rpb24gKCRlbGVtKSB7XG4gICRlbGVtLm9mZignY2xpY2suemYudHJpZ2dlcicsIFRyaWdnZXJzLkxpc3RlbmVycy5CYXNpYy5vcGVuTGlzdGVuZXIpO1xuICAkZWxlbS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS1vcGVuXScsIFRyaWdnZXJzLkxpc3RlbmVycy5CYXNpYy5vcGVuTGlzdGVuZXIpO1xufTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1jbG9zZV0gd2lsbCBjbG9zZSBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbi8vIElmIHVzZWQgd2l0aG91dCBhIHZhbHVlIG9uIFtkYXRhLWNsb3NlXSwgdGhlIGV2ZW50IHdpbGwgYnViYmxlLCBhbGxvd2luZyBpdCB0byBjbG9zZSBhIHBhcmVudCBjb21wb25lbnQuXG5UcmlnZ2Vycy5Jbml0aWFsaXplcnMuYWRkQ2xvc2VMaXN0ZW5lciA9IGZ1bmN0aW9uICgkZWxlbSkge1xuICAkZWxlbS5vZmYoJ2NsaWNrLnpmLnRyaWdnZXInLCBUcmlnZ2Vycy5MaXN0ZW5lcnMuQmFzaWMuY2xvc2VMaXN0ZW5lcik7XG4gICRlbGVtLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLWNsb3NlXScsIFRyaWdnZXJzLkxpc3RlbmVycy5CYXNpYy5jbG9zZUxpc3RlbmVyKTtcbn07XG5cbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtdG9nZ2xlXSB3aWxsIHRvZ2dsZSBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cblRyaWdnZXJzLkluaXRpYWxpemVycy5hZGRUb2dnbGVMaXN0ZW5lciA9IGZ1bmN0aW9uICgkZWxlbSkge1xuICAkZWxlbS5vZmYoJ2NsaWNrLnpmLnRyaWdnZXInLCBUcmlnZ2Vycy5MaXN0ZW5lcnMuQmFzaWMudG9nZ2xlTGlzdGVuZXIpO1xuICAkZWxlbS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGVdJywgVHJpZ2dlcnMuTGlzdGVuZXJzLkJhc2ljLnRvZ2dsZUxpc3RlbmVyKTtcbn07XG5cbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtY2xvc2FibGVdIHdpbGwgcmVzcG9uZCB0byBjbG9zZS56Zi50cmlnZ2VyIGV2ZW50cy5cblRyaWdnZXJzLkluaXRpYWxpemVycy5hZGRDbG9zZWFibGVMaXN0ZW5lciA9IGZ1bmN0aW9uICgkZWxlbSkge1xuICAkZWxlbS5vZmYoJ2Nsb3NlLnpmLnRyaWdnZXInLCBUcmlnZ2Vycy5MaXN0ZW5lcnMuQmFzaWMuY2xvc2VhYmxlTGlzdGVuZXIpO1xuICAkZWxlbS5vbignY2xvc2UuemYudHJpZ2dlcicsICdbZGF0YS1jbG9zZWFibGVdLCBbZGF0YS1jbG9zYWJsZV0nLCBUcmlnZ2Vycy5MaXN0ZW5lcnMuQmFzaWMuY2xvc2VhYmxlTGlzdGVuZXIpO1xufTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS10b2dnbGUtZm9jdXNdIHdpbGwgcmVzcG9uZCB0byBjb21pbmcgaW4gYW5kIG91dCBvZiBmb2N1c1xuVHJpZ2dlcnMuSW5pdGlhbGl6ZXJzLmFkZFRvZ2dsZUZvY3VzTGlzdGVuZXIgPSBmdW5jdGlvbiAoJGVsZW0pIHtcbiAgJGVsZW0ub2ZmKCdmb2N1cy56Zi50cmlnZ2VyIGJsdXIuemYudHJpZ2dlcicsIFRyaWdnZXJzLkxpc3RlbmVycy5CYXNpYy50b2dnbGVGb2N1c0xpc3RlbmVyKTtcbiAgJGVsZW0ub24oJ2ZvY3VzLnpmLnRyaWdnZXIgYmx1ci56Zi50cmlnZ2VyJywgJ1tkYXRhLXRvZ2dsZS1mb2N1c10nLCBUcmlnZ2Vycy5MaXN0ZW5lcnMuQmFzaWMudG9nZ2xlRm9jdXNMaXN0ZW5lcik7XG59O1xuXG4vLyBNb3JlIEdsb2JhbC9jb21wbGV4IGxpc3RlbmVycyBhbmQgdHJpZ2dlcnNcblRyaWdnZXJzLkxpc3RlbmVycy5HbG9iYWwgPSB7XG4gIHJlc2l6ZUxpc3RlbmVyOiBmdW5jdGlvbiAoJG5vZGVzKSB7XG4gICAgaWYgKCFNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAkbm9kZXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgcmVzaXplIGV2ZW50XG4gICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJyZXNpemVcIik7XG4gIH0sXG4gIHNjcm9sbExpc3RlbmVyOiBmdW5jdGlvbiAoJG5vZGVzKSB7XG4gICAgaWYgKCFNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAkbm9kZXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Njcm9sbG1lLnpmLnRyaWdnZXInKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgc2Nyb2xsIGV2ZW50XG4gICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJzY3JvbGxcIik7XG4gIH0sXG4gIGNsb3NlTWVMaXN0ZW5lcjogZnVuY3Rpb24gKGUsIHBsdWdpbklkKSB7XG4gICAgdmFyIHBsdWdpbiA9IGUubmFtZXNwYWNlLnNwbGl0KCcuJylbMF07XG4gICAgdmFyIHBsdWdpbnMgPSBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKCdbZGF0YS0nICsgcGx1Z2luICsgJ10nKS5ub3QoJ1tkYXRhLXlldGktYm94PVwiJyArIHBsdWdpbklkICsgJ1wiXScpO1xuXG4gICAgcGx1Z2lucy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBfdGhpcyA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcyk7XG4gICAgICBfdGhpcy50cmlnZ2VySGFuZGxlcignY2xvc2UuemYudHJpZ2dlcicsIFtfdGhpc10pO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gR2xvYmFsLCBwYXJzZXMgd2hvbGUgZG9jdW1lbnQuXG59O1RyaWdnZXJzLkluaXRpYWxpemVycy5hZGRDbG9zZW1lTGlzdGVuZXIgPSBmdW5jdGlvbiAocGx1Z2luTmFtZSkge1xuICB2YXIgeWV0aUJveGVzID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSgnW2RhdGEteWV0aS1ib3hdJyksXG4gICAgICBwbHVnTmFtZXMgPSBbJ2Ryb3Bkb3duJywgJ3Rvb2x0aXAnLCAncmV2ZWFsJ107XG5cbiAgaWYgKHBsdWdpbk5hbWUpIHtcbiAgICBpZiAodHlwZW9mIHBsdWdpbk5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwbHVnTmFtZXMucHVzaChwbHVnaW5OYW1lKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwbHVnaW5OYW1lID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcGx1Z2luTmFtZVswXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHBsdWdOYW1lcy5jb25jYXQocGx1Z2luTmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1BsdWdpbiBuYW1lcyBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9XG4gIH1cbiAgaWYgKHlldGlCb3hlcy5sZW5ndGgpIHtcbiAgICB2YXIgbGlzdGVuZXJzID0gcGx1Z05hbWVzLm1hcChmdW5jdGlvbiAobmFtZSkge1xuICAgICAgcmV0dXJuICdjbG9zZW1lLnpmLicgKyBuYW1lO1xuICAgIH0pLmpvaW4oJyAnKTtcblxuICAgIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkod2luZG93KS5vZmYobGlzdGVuZXJzKS5vbihsaXN0ZW5lcnMsIFRyaWdnZXJzLkxpc3RlbmVycy5HbG9iYWwuY2xvc2VNZUxpc3RlbmVyKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZGVib3VuY2VHbG9iYWxMaXN0ZW5lcihkZWJvdW5jZSwgdHJpZ2dlciwgbGlzdGVuZXIpIHtcbiAgdmFyIHRpbWVyID0gdm9pZCAwLFxuICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMyk7XG4gIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkod2luZG93KS5vZmYodHJpZ2dlcikub24odHJpZ2dlciwgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAodGltZXIpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgfVxuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBsaXN0ZW5lci5hcHBseShudWxsLCBhcmdzKTtcbiAgICB9LCBkZWJvdW5jZSB8fCAxMCk7IC8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgc2Nyb2xsIGV2ZW50XG4gIH0pO1xufVxuXG5UcmlnZ2Vycy5Jbml0aWFsaXplcnMuYWRkUmVzaXplTGlzdGVuZXIgPSBmdW5jdGlvbiAoZGVib3VuY2UpIHtcbiAgdmFyICRub2RlcyA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkoJ1tkYXRhLXJlc2l6ZV0nKTtcbiAgaWYgKCRub2Rlcy5sZW5ndGgpIHtcbiAgICBkZWJvdW5jZUdsb2JhbExpc3RlbmVyKGRlYm91bmNlLCAncmVzaXplLnpmLnRyaWdnZXInLCBUcmlnZ2Vycy5MaXN0ZW5lcnMuR2xvYmFsLnJlc2l6ZUxpc3RlbmVyLCAkbm9kZXMpO1xuICB9XG59O1xuXG5UcmlnZ2Vycy5Jbml0aWFsaXplcnMuYWRkU2Nyb2xsTGlzdGVuZXIgPSBmdW5jdGlvbiAoZGVib3VuY2UpIHtcbiAgdmFyICRub2RlcyA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkoJ1tkYXRhLXNjcm9sbF0nKTtcbiAgaWYgKCRub2Rlcy5sZW5ndGgpIHtcbiAgICBkZWJvdW5jZUdsb2JhbExpc3RlbmVyKGRlYm91bmNlLCAnc2Nyb2xsLnpmLnRyaWdnZXInLCBUcmlnZ2Vycy5MaXN0ZW5lcnMuR2xvYmFsLnNjcm9sbExpc3RlbmVyLCAkbm9kZXMpO1xuICB9XG59O1xuXG5UcmlnZ2Vycy5Jbml0aWFsaXplcnMuYWRkTXV0YXRpb25FdmVudHNMaXN0ZW5lciA9IGZ1bmN0aW9uICgkZWxlbSkge1xuICBpZiAoIU11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyICRub2RlcyA9ICRlbGVtLmZpbmQoJ1tkYXRhLXJlc2l6ZV0sIFtkYXRhLXNjcm9sbF0sIFtkYXRhLW11dGF0ZV0nKTtcblxuICAvL2VsZW1lbnQgY2FsbGJhY2tcbiAgdmFyIGxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24gPSBmdW5jdGlvbiAobXV0YXRpb25SZWNvcmRzTGlzdCkge1xuICAgIHZhciAkdGFyZ2V0ID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKShtdXRhdGlvblJlY29yZHNMaXN0WzBdLnRhcmdldCk7XG5cbiAgICAvL3RyaWdnZXIgdGhlIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBlbGVtZW50IGRlcGVuZGluZyBvbiB0eXBlXG4gICAgc3dpdGNoIChtdXRhdGlvblJlY29yZHNMaXN0WzBdLnR5cGUpIHtcbiAgICAgIGNhc2UgXCJhdHRyaWJ1dGVzXCI6XG4gICAgICAgIGlmICgkdGFyZ2V0LmF0dHIoXCJkYXRhLWV2ZW50c1wiKSA9PT0gXCJzY3JvbGxcIiAmJiBtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwiZGF0YS1ldmVudHNcIikge1xuICAgICAgICAgICR0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3Njcm9sbG1lLnpmLnRyaWdnZXInLCBbJHRhcmdldCwgd2luZG93LnBhZ2VZT2Zmc2V0XSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCR0YXJnZXQuYXR0cihcImRhdGEtZXZlbnRzXCIpID09PSBcInJlc2l6ZVwiICYmIG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJkYXRhLWV2ZW50c1wiKSB7XG4gICAgICAgICAgJHRhcmdldC50cmlnZ2VySGFuZGxlcigncmVzaXplbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0XSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJzdHlsZVwiKSB7XG4gICAgICAgICAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIiwgXCJtdXRhdGVcIik7XG4gICAgICAgICAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpXSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJjaGlsZExpc3RcIjpcbiAgICAgICAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIiwgXCJtdXRhdGVcIik7XG4gICAgICAgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgLy9ub3RoaW5nXG4gICAgfVxuICB9O1xuXG4gIGlmICgkbm9kZXMubGVuZ3RoKSB7XG4gICAgLy9mb3IgZWFjaCBlbGVtZW50IHRoYXQgbmVlZHMgdG8gbGlzdGVuIGZvciByZXNpemluZywgc2Nyb2xsaW5nLCBvciBtdXRhdGlvbiBhZGQgYSBzaW5nbGUgb2JzZXJ2ZXJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8PSAkbm9kZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICB2YXIgZWxlbWVudE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIobGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbik7XG4gICAgICBlbGVtZW50T2JzZXJ2ZXIub2JzZXJ2ZSgkbm9kZXNbaV0sIHsgYXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiBmYWxzZSwgc3VidHJlZTogdHJ1ZSwgYXR0cmlidXRlRmlsdGVyOiBbXCJkYXRhLWV2ZW50c1wiLCBcInN0eWxlXCJdIH0pO1xuICAgIH1cbiAgfVxufTtcblxuVHJpZ2dlcnMuSW5pdGlhbGl6ZXJzLmFkZFNpbXBsZUxpc3RlbmVycyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyICRkb2N1bWVudCA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkoZG9jdW1lbnQpO1xuXG4gIFRyaWdnZXJzLkluaXRpYWxpemVycy5hZGRPcGVuTGlzdGVuZXIoJGRvY3VtZW50KTtcbiAgVHJpZ2dlcnMuSW5pdGlhbGl6ZXJzLmFkZENsb3NlTGlzdGVuZXIoJGRvY3VtZW50KTtcbiAgVHJpZ2dlcnMuSW5pdGlhbGl6ZXJzLmFkZFRvZ2dsZUxpc3RlbmVyKCRkb2N1bWVudCk7XG4gIFRyaWdnZXJzLkluaXRpYWxpemVycy5hZGRDbG9zZWFibGVMaXN0ZW5lcigkZG9jdW1lbnQpO1xuICBUcmlnZ2Vycy5Jbml0aWFsaXplcnMuYWRkVG9nZ2xlRm9jdXNMaXN0ZW5lcigkZG9jdW1lbnQpO1xufTtcblxuVHJpZ2dlcnMuSW5pdGlhbGl6ZXJzLmFkZEdsb2JhbExpc3RlbmVycyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyICRkb2N1bWVudCA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkoZG9jdW1lbnQpO1xuICBUcmlnZ2Vycy5Jbml0aWFsaXplcnMuYWRkTXV0YXRpb25FdmVudHNMaXN0ZW5lcigkZG9jdW1lbnQpO1xuICBUcmlnZ2Vycy5Jbml0aWFsaXplcnMuYWRkUmVzaXplTGlzdGVuZXIoKTtcbiAgVHJpZ2dlcnMuSW5pdGlhbGl6ZXJzLmFkZFNjcm9sbExpc3RlbmVyKCk7XG4gIFRyaWdnZXJzLkluaXRpYWxpemVycy5hZGRDbG9zZW1lTGlzdGVuZXIoKTtcbn07XG5cblRyaWdnZXJzLmluaXQgPSBmdW5jdGlvbiAoJCwgRm91bmRhdGlvbikge1xuICBpZiAodHlwZW9mICQudHJpZ2dlcnNJbml0aWFsaXplZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgJGRvY3VtZW50ID0gJChkb2N1bWVudCk7XG5cbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICBUcmlnZ2Vycy5Jbml0aWFsaXplcnMuYWRkU2ltcGxlTGlzdGVuZXJzKCk7XG4gICAgICBUcmlnZ2Vycy5Jbml0aWFsaXplcnMuYWRkR2xvYmFsTGlzdGVuZXJzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQod2luZG93KS5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgVHJpZ2dlcnMuSW5pdGlhbGl6ZXJzLmFkZFNpbXBsZUxpc3RlbmVycygpO1xuICAgICAgICBUcmlnZ2Vycy5Jbml0aWFsaXplcnMuYWRkR2xvYmFsTGlzdGVuZXJzKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAkLnRyaWdnZXJzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICB9XG5cbiAgaWYgKEZvdW5kYXRpb24pIHtcbiAgICBGb3VuZGF0aW9uLlRyaWdnZXJzID0gVHJpZ2dlcnM7XG4gICAgLy8gTGVnYWN5IGluY2x1ZGVkIHRvIGJlIGJhY2t3YXJkcyBjb21wYXRpYmxlIGZvciBub3cuXG4gICAgRm91bmRhdGlvbi5JSGVhcllvdSA9IFRyaWdnZXJzLkluaXRpYWxpemVycy5hZGRHbG9iYWxMaXN0ZW5lcnM7XG4gIH1cbn07XG5cblxuXG4vKioqLyB9KVxuXG4vKioqKioqLyB9KTsiLCIhZnVuY3Rpb24oZSl7ZnVuY3Rpb24gdChyKXtpZihpW3JdKXJldHVybiBpW3JdLmV4cG9ydHM7dmFyIG49aVtyXT17aTpyLGw6ITEsZXhwb3J0czp7fX07cmV0dXJuIGVbcl0uY2FsbChuLmV4cG9ydHMsbixuLmV4cG9ydHMsdCksbi5sPSEwLG4uZXhwb3J0c312YXIgaT17fTt0Lm09ZSx0LmM9aSx0Lmk9ZnVuY3Rpb24oZSl7cmV0dXJuIGV9LHQuZD1mdW5jdGlvbihlLGkscil7dC5vKGUsaSl8fE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLGkse2NvbmZpZ3VyYWJsZTohMSxlbnVtZXJhYmxlOiEwLGdldDpyfSl9LHQubj1mdW5jdGlvbihlKXt2YXIgaT1lJiZlLl9fZXNNb2R1bGU/ZnVuY3Rpb24oKXtyZXR1cm4gZS5kZWZhdWx0fTpmdW5jdGlvbigpe3JldHVybiBlfTtyZXR1cm4gdC5kKGksXCJhXCIsaSksaX0sdC5vPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlLHQpfSx0LnA9XCJcIix0KHQucz0xMDgpfSh7MDpmdW5jdGlvbihlLHQpe2UuZXhwb3J0cz1qUXVlcnl9LDE6ZnVuY3Rpb24oZSx0KXtlLmV4cG9ydHM9e0ZvdW5kYXRpb246d2luZG93LkZvdW5kYXRpb259fSwxMDg6ZnVuY3Rpb24oZSx0LGkpe2UuZXhwb3J0cz1pKDQyKX0sNDpmdW5jdGlvbihlLHQpe2UuZXhwb3J0cz17TW90aW9uOndpbmRvdy5Gb3VuZGF0aW9uLk1vdGlvbixNb3ZlOndpbmRvdy5Gb3VuZGF0aW9uLk1vdmV9fSw0MjpmdW5jdGlvbihlLHQsaSl7XCJ1c2Ugc3RyaWN0XCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KHQsXCJfX2VzTW9kdWxlXCIse3ZhbHVlOiEwfSk7dmFyIHI9aSgxKSxuPShpLm4ociksaSgwKSkscz1pLm4obik7aSg3KS5hLmluaXQocy5hLHIuRm91bmRhdGlvbil9LDc6ZnVuY3Rpb24oZSx0LGkpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHIoZSx0LGkpe3ZhciByPXZvaWQgMCxuPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywzKTtzKCkod2luZG93KS5vZmYodCkub24odCxmdW5jdGlvbih0KXtyJiZjbGVhclRpbWVvdXQocikscj1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7aS5hcHBseShudWxsLG4pfSxlfHwxMCl9KX1pLmQodCxcImFcIixmdW5jdGlvbigpe3JldHVybiBjfSk7dmFyIG49aSgwKSxzPWkubihuKSxhPWkoNCksbz0oaS5uKGEpLGZ1bmN0aW9uKCl7Zm9yKHZhciBlPVtcIldlYktpdFwiLFwiTW96XCIsXCJPXCIsXCJNc1wiLFwiXCJdLHQ9MDt0PGUubGVuZ3RoO3QrKylpZihlW3RdK1wiTXV0YXRpb25PYnNlcnZlclwiaW4gd2luZG93KXJldHVybiB3aW5kb3dbZVt0XStcIk11dGF0aW9uT2JzZXJ2ZXJcIl07cmV0dXJuITF9KCkpLGw9ZnVuY3Rpb24oZSx0KXtlLmRhdGEodCkuc3BsaXQoXCIgXCIpLmZvckVhY2goZnVuY3Rpb24oaSl7cygpKFwiI1wiK2kpW1wiY2xvc2VcIj09PXQ/XCJ0cmlnZ2VyXCI6XCJ0cmlnZ2VySGFuZGxlclwiXSh0K1wiLnpmLnRyaWdnZXJcIixbZV0pfSl9LGM9e0xpc3RlbmVyczp7QmFzaWM6e30sR2xvYmFsOnt9fSxJbml0aWFsaXplcnM6e319O2MuTGlzdGVuZXJzLkJhc2ljPXtvcGVuTGlzdGVuZXI6ZnVuY3Rpb24oKXtsKHMoKSh0aGlzKSxcIm9wZW5cIil9LGNsb3NlTGlzdGVuZXI6ZnVuY3Rpb24oKXtzKCkodGhpcykuZGF0YShcImNsb3NlXCIpP2wocygpKHRoaXMpLFwiY2xvc2VcIik6cygpKHRoaXMpLnRyaWdnZXIoXCJjbG9zZS56Zi50cmlnZ2VyXCIpfSx0b2dnbGVMaXN0ZW5lcjpmdW5jdGlvbigpe3MoKSh0aGlzKS5kYXRhKFwidG9nZ2xlXCIpP2wocygpKHRoaXMpLFwidG9nZ2xlXCIpOnMoKSh0aGlzKS50cmlnZ2VyKFwidG9nZ2xlLnpmLnRyaWdnZXJcIil9LGNsb3NlYWJsZUxpc3RlbmVyOmZ1bmN0aW9uKGUpe2Uuc3RvcFByb3BhZ2F0aW9uKCk7dmFyIHQ9cygpKHRoaXMpLmRhdGEoXCJjbG9zYWJsZVwiKTtcIlwiIT09dD9hLk1vdGlvbi5hbmltYXRlT3V0KHMoKSh0aGlzKSx0LGZ1bmN0aW9uKCl7cygpKHRoaXMpLnRyaWdnZXIoXCJjbG9zZWQuemZcIil9KTpzKCkodGhpcykuZmFkZU91dCgpLnRyaWdnZXIoXCJjbG9zZWQuemZcIil9LHRvZ2dsZUZvY3VzTGlzdGVuZXI6ZnVuY3Rpb24oKXt2YXIgZT1zKCkodGhpcykuZGF0YShcInRvZ2dsZS1mb2N1c1wiKTtzKCkoXCIjXCIrZSkudHJpZ2dlckhhbmRsZXIoXCJ0b2dnbGUuemYudHJpZ2dlclwiLFtzKCkodGhpcyldKX19LGMuSW5pdGlhbGl6ZXJzLmFkZE9wZW5MaXN0ZW5lcj1mdW5jdGlvbihlKXtlLm9mZihcImNsaWNrLnpmLnRyaWdnZXJcIixjLkxpc3RlbmVycy5CYXNpYy5vcGVuTGlzdGVuZXIpLGUub24oXCJjbGljay56Zi50cmlnZ2VyXCIsXCJbZGF0YS1vcGVuXVwiLGMuTGlzdGVuZXJzLkJhc2ljLm9wZW5MaXN0ZW5lcil9LGMuSW5pdGlhbGl6ZXJzLmFkZENsb3NlTGlzdGVuZXI9ZnVuY3Rpb24oZSl7ZS5vZmYoXCJjbGljay56Zi50cmlnZ2VyXCIsYy5MaXN0ZW5lcnMuQmFzaWMuY2xvc2VMaXN0ZW5lciksZS5vbihcImNsaWNrLnpmLnRyaWdnZXJcIixcIltkYXRhLWNsb3NlXVwiLGMuTGlzdGVuZXJzLkJhc2ljLmNsb3NlTGlzdGVuZXIpfSxjLkluaXRpYWxpemVycy5hZGRUb2dnbGVMaXN0ZW5lcj1mdW5jdGlvbihlKXtlLm9mZihcImNsaWNrLnpmLnRyaWdnZXJcIixjLkxpc3RlbmVycy5CYXNpYy50b2dnbGVMaXN0ZW5lciksZS5vbihcImNsaWNrLnpmLnRyaWdnZXJcIixcIltkYXRhLXRvZ2dsZV1cIixjLkxpc3RlbmVycy5CYXNpYy50b2dnbGVMaXN0ZW5lcil9LGMuSW5pdGlhbGl6ZXJzLmFkZENsb3NlYWJsZUxpc3RlbmVyPWZ1bmN0aW9uKGUpe2Uub2ZmKFwiY2xvc2UuemYudHJpZ2dlclwiLGMuTGlzdGVuZXJzLkJhc2ljLmNsb3NlYWJsZUxpc3RlbmVyKSxlLm9uKFwiY2xvc2UuemYudHJpZ2dlclwiLFwiW2RhdGEtY2xvc2VhYmxlXSwgW2RhdGEtY2xvc2FibGVdXCIsYy5MaXN0ZW5lcnMuQmFzaWMuY2xvc2VhYmxlTGlzdGVuZXIpfSxjLkluaXRpYWxpemVycy5hZGRUb2dnbGVGb2N1c0xpc3RlbmVyPWZ1bmN0aW9uKGUpe2Uub2ZmKFwiZm9jdXMuemYudHJpZ2dlciBibHVyLnpmLnRyaWdnZXJcIixjLkxpc3RlbmVycy5CYXNpYy50b2dnbGVGb2N1c0xpc3RlbmVyKSxlLm9uKFwiZm9jdXMuemYudHJpZ2dlciBibHVyLnpmLnRyaWdnZXJcIixcIltkYXRhLXRvZ2dsZS1mb2N1c11cIixjLkxpc3RlbmVycy5CYXNpYy50b2dnbGVGb2N1c0xpc3RlbmVyKX0sYy5MaXN0ZW5lcnMuR2xvYmFsPXtyZXNpemVMaXN0ZW5lcjpmdW5jdGlvbihlKXtvfHxlLmVhY2goZnVuY3Rpb24oKXtzKCkodGhpcykudHJpZ2dlckhhbmRsZXIoXCJyZXNpemVtZS56Zi50cmlnZ2VyXCIpfSksZS5hdHRyKFwiZGF0YS1ldmVudHNcIixcInJlc2l6ZVwiKX0sc2Nyb2xsTGlzdGVuZXI6ZnVuY3Rpb24oZSl7b3x8ZS5lYWNoKGZ1bmN0aW9uKCl7cygpKHRoaXMpLnRyaWdnZXJIYW5kbGVyKFwic2Nyb2xsbWUuemYudHJpZ2dlclwiKX0pLGUuYXR0cihcImRhdGEtZXZlbnRzXCIsXCJzY3JvbGxcIil9LGNsb3NlTWVMaXN0ZW5lcjpmdW5jdGlvbihlLHQpe3ZhciBpPWUubmFtZXNwYWNlLnNwbGl0KFwiLlwiKVswXTtzKCkoXCJbZGF0YS1cIitpK1wiXVwiKS5ub3QoJ1tkYXRhLXlldGktYm94PVwiJyt0KydcIl0nKS5lYWNoKGZ1bmN0aW9uKCl7dmFyIGU9cygpKHRoaXMpO2UudHJpZ2dlckhhbmRsZXIoXCJjbG9zZS56Zi50cmlnZ2VyXCIsW2VdKX0pfX0sYy5Jbml0aWFsaXplcnMuYWRkQ2xvc2VtZUxpc3RlbmVyPWZ1bmN0aW9uKGUpe3ZhciB0PXMoKShcIltkYXRhLXlldGktYm94XVwiKSxpPVtcImRyb3Bkb3duXCIsXCJ0b29sdGlwXCIsXCJyZXZlYWxcIl07aWYoZSYmKFwic3RyaW5nXCI9PXR5cGVvZiBlP2kucHVzaChlKTpcIm9iamVjdFwiPT10eXBlb2YgZSYmXCJzdHJpbmdcIj09dHlwZW9mIGVbMF0/aS5jb25jYXQoZSk6Y29uc29sZS5lcnJvcihcIlBsdWdpbiBuYW1lcyBtdXN0IGJlIHN0cmluZ3NcIikpLHQubGVuZ3RoKXt2YXIgcj1pLm1hcChmdW5jdGlvbihlKXtyZXR1cm5cImNsb3NlbWUuemYuXCIrZX0pLmpvaW4oXCIgXCIpO3MoKSh3aW5kb3cpLm9mZihyKS5vbihyLGMuTGlzdGVuZXJzLkdsb2JhbC5jbG9zZU1lTGlzdGVuZXIpfX0sYy5Jbml0aWFsaXplcnMuYWRkUmVzaXplTGlzdGVuZXI9ZnVuY3Rpb24oZSl7dmFyIHQ9cygpKFwiW2RhdGEtcmVzaXplXVwiKTt0Lmxlbmd0aCYmcihlLFwicmVzaXplLnpmLnRyaWdnZXJcIixjLkxpc3RlbmVycy5HbG9iYWwucmVzaXplTGlzdGVuZXIsdCl9LGMuSW5pdGlhbGl6ZXJzLmFkZFNjcm9sbExpc3RlbmVyPWZ1bmN0aW9uKGUpe3ZhciB0PXMoKShcIltkYXRhLXNjcm9sbF1cIik7dC5sZW5ndGgmJnIoZSxcInNjcm9sbC56Zi50cmlnZ2VyXCIsYy5MaXN0ZW5lcnMuR2xvYmFsLnNjcm9sbExpc3RlbmVyLHQpfSxjLkluaXRpYWxpemVycy5hZGRNdXRhdGlvbkV2ZW50c0xpc3RlbmVyPWZ1bmN0aW9uKGUpe2lmKCFvKXJldHVybiExO3ZhciB0PWUuZmluZChcIltkYXRhLXJlc2l6ZV0sIFtkYXRhLXNjcm9sbF0sIFtkYXRhLW11dGF0ZV1cIiksaT1mdW5jdGlvbihlKXt2YXIgdD1zKCkoZVswXS50YXJnZXQpO3N3aXRjaChlWzBdLnR5cGUpe2Nhc2VcImF0dHJpYnV0ZXNcIjpcInNjcm9sbFwiPT09dC5hdHRyKFwiZGF0YS1ldmVudHNcIikmJlwiZGF0YS1ldmVudHNcIj09PWVbMF0uYXR0cmlidXRlTmFtZSYmdC50cmlnZ2VySGFuZGxlcihcInNjcm9sbG1lLnpmLnRyaWdnZXJcIixbdCx3aW5kb3cucGFnZVlPZmZzZXRdKSxcInJlc2l6ZVwiPT09dC5hdHRyKFwiZGF0YS1ldmVudHNcIikmJlwiZGF0YS1ldmVudHNcIj09PWVbMF0uYXR0cmlidXRlTmFtZSYmdC50cmlnZ2VySGFuZGxlcihcInJlc2l6ZW1lLnpmLnRyaWdnZXJcIixbdF0pLFwic3R5bGVcIj09PWVbMF0uYXR0cmlidXRlTmFtZSYmKHQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikuYXR0cihcImRhdGEtZXZlbnRzXCIsXCJtdXRhdGVcIiksdC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcihcIm11dGF0ZW1lLnpmLnRyaWdnZXJcIixbdC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pKTticmVhaztjYXNlXCJjaGlsZExpc3RcIjp0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLFwibXV0YXRlXCIpLHQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoXCJtdXRhdGVtZS56Zi50cmlnZ2VyXCIsW3QuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIildKTticmVhaztkZWZhdWx0OnJldHVybiExfX07aWYodC5sZW5ndGgpZm9yKHZhciByPTA7cjw9dC5sZW5ndGgtMTtyKyspe3ZhciBuPW5ldyBvKGkpO24ub2JzZXJ2ZSh0W3JdLHthdHRyaWJ1dGVzOiEwLGNoaWxkTGlzdDohMCxjaGFyYWN0ZXJEYXRhOiExLHN1YnRyZWU6ITAsYXR0cmlidXRlRmlsdGVyOltcImRhdGEtZXZlbnRzXCIsXCJzdHlsZVwiXX0pfX0sYy5Jbml0aWFsaXplcnMuYWRkU2ltcGxlTGlzdGVuZXJzPWZ1bmN0aW9uKCl7dmFyIGU9cygpKGRvY3VtZW50KTtjLkluaXRpYWxpemVycy5hZGRPcGVuTGlzdGVuZXIoZSksYy5Jbml0aWFsaXplcnMuYWRkQ2xvc2VMaXN0ZW5lcihlKSxjLkluaXRpYWxpemVycy5hZGRUb2dnbGVMaXN0ZW5lcihlKSxjLkluaXRpYWxpemVycy5hZGRDbG9zZWFibGVMaXN0ZW5lcihlKSxjLkluaXRpYWxpemVycy5hZGRUb2dnbGVGb2N1c0xpc3RlbmVyKGUpfSxjLkluaXRpYWxpemVycy5hZGRHbG9iYWxMaXN0ZW5lcnM9ZnVuY3Rpb24oKXt2YXIgZT1zKCkoZG9jdW1lbnQpO2MuSW5pdGlhbGl6ZXJzLmFkZE11dGF0aW9uRXZlbnRzTGlzdGVuZXIoZSksYy5Jbml0aWFsaXplcnMuYWRkUmVzaXplTGlzdGVuZXIoKSxjLkluaXRpYWxpemVycy5hZGRTY3JvbGxMaXN0ZW5lcigpLGMuSW5pdGlhbGl6ZXJzLmFkZENsb3NlbWVMaXN0ZW5lcigpfSxjLmluaXQ9ZnVuY3Rpb24oZSx0KXtpZih2b2lkIDA9PT1lLnRyaWdnZXJzSW5pdGlhbGl6ZWQpe2UoZG9jdW1lbnQpO1wiY29tcGxldGVcIj09PWRvY3VtZW50LnJlYWR5U3RhdGU/KGMuSW5pdGlhbGl6ZXJzLmFkZFNpbXBsZUxpc3RlbmVycygpLGMuSW5pdGlhbGl6ZXJzLmFkZEdsb2JhbExpc3RlbmVycygpKTplKHdpbmRvdykub24oXCJsb2FkXCIsZnVuY3Rpb24oKXtjLkluaXRpYWxpemVycy5hZGRTaW1wbGVMaXN0ZW5lcnMoKSxjLkluaXRpYWxpemVycy5hZGRHbG9iYWxMaXN0ZW5lcnMoKX0pLGUudHJpZ2dlcnNJbml0aWFsaXplZD0hMH10JiYodC5UcmlnZ2Vycz1jLHQuSUhlYXJZb3U9Yy5Jbml0aWFsaXplcnMuYWRkR2xvYmFsTGlzdGVuZXJzKX19fSk7IiwiLyoqKioqKi8gKGZ1bmN0aW9uKG1vZHVsZXMpIHsgLy8gd2VicGFja0Jvb3RzdHJhcFxuLyoqKioqKi8gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuLyoqKioqKi8gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4vKioqKioqLyBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbi8qKioqKiovIFx0XHR9XG4vKioqKioqLyBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbi8qKioqKiovIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHRpOiBtb2R1bGVJZCxcbi8qKioqKiovIFx0XHRcdGw6IGZhbHNlLFxuLyoqKioqKi8gXHRcdFx0ZXhwb3J0czoge31cbi8qKioqKiovIFx0XHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuLyoqKioqKi8gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbi8qKioqKiovIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdH1cbi8qKioqKiovXG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGlkZW50aXR5IGZ1bmN0aW9uIGZvciBjYWxsaW5nIGhhcm1vbnkgaW1wb3J0cyB3aXRoIHRoZSBjb3JyZWN0IGNvbnRleHRcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuLyoqKioqKi8gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbi8qKioqKiovIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4vKioqKioqLyBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4vKioqKioqLyBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4vKioqKioqLyBcdFx0XHRcdGdldDogZ2V0dGVyXG4vKioqKioqLyBcdFx0XHR9KTtcbi8qKioqKiovIFx0XHR9XG4vKioqKioqLyBcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbi8qKioqKiovIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbi8qKioqKiovIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4vKioqKioqLyBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuLyoqKioqKi8gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbi8qKioqKiovIFx0XHRyZXR1cm4gZ2V0dGVyO1xuLyoqKioqKi8gXHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8qKioqKiovIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gODQpO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoe1xuXG4vKioqLyAwOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IGpRdWVyeTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDE6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0ge0ZvdW5kYXRpb246IHdpbmRvdy5Gb3VuZGF0aW9ufTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDE4OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgX193ZWJwYWNrX2V4cG9ydHNfXywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShfX3dlYnBhY2tfZXhwb3J0c19fLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fX2RlZmF1bHQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLm4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX2NvcmVfXyk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX2Ryb3Bkb3duTWVudV9fID0gX193ZWJwYWNrX3JlcXVpcmVfXyg0OCk7XG5cblxuXG5fX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fW1wiRm91bmRhdGlvblwiXS5wbHVnaW4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX2Ryb3Bkb3duTWVudV9fW1wiYVwiIC8qIERyb3Bkb3duTWVudSAqL10sICdEcm9wZG93bk1lbnUnKTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDI6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0ge1BsdWdpbjogd2luZG93LkZvdW5kYXRpb24uUGx1Z2lufTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDM6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0ge3J0bDogd2luZG93LkZvdW5kYXRpb24ucnRsLCBHZXRZb0RpZ2l0czogd2luZG93LkZvdW5kYXRpb24uR2V0WW9EaWdpdHMsIHRyYW5zaXRpb25lbmQ6IHdpbmRvdy5Gb3VuZGF0aW9uLnRyYW5zaXRpb25lbmR9O1xuXG4vKioqLyB9KSxcblxuLyoqKi8gNDg6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBfX3dlYnBhY2tfZXhwb3J0c19fLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuLyogaGFybW9ueSBleHBvcnQgKGJpbmRpbmcpICovIF9fd2VicGFja19yZXF1aXJlX18uZChfX3dlYnBhY2tfZXhwb3J0c19fLCBcImFcIiwgZnVuY3Rpb24oKSB7IHJldHVybiBEcm9wZG93bk1lbnU7IH0pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfXyA9IF9fd2VicGFja19yZXF1aXJlX18oMCk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLm4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fdXRpbF9rZXlib2FyZF9fID0gX193ZWJwYWNrX3JlcXVpcmVfXyg1KTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fdXRpbF9rZXlib2FyZF9fX2RlZmF1bHQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLm4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfa2V5Ym9hcmRfXyk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8yX19mb3VuZGF0aW9uX3V0aWxfbmVzdF9fID0gX193ZWJwYWNrX3JlcXVpcmVfXyg5KTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzJfX2ZvdW5kYXRpb25fdXRpbF9uZXN0X19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzJfX2ZvdW5kYXRpb25fdXRpbF9uZXN0X18pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfM19fZm91bmRhdGlvbl91dGlsX2JveF9fID0gX193ZWJwYWNrX3JlcXVpcmVfXyg4KTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzNfX2ZvdW5kYXRpb25fdXRpbF9ib3hfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfM19fZm91bmRhdGlvbl91dGlsX2JveF9fKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzRfX2ZvdW5kYXRpb25fdXRpbF9jb3JlX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDMpO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNF9fZm91bmRhdGlvbl91dGlsX2NvcmVfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNF9fZm91bmRhdGlvbl91dGlsX2NvcmVfXyk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV81X19mb3VuZGF0aW9uX3BsdWdpbl9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygyKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzVfX2ZvdW5kYXRpb25fcGx1Z2luX19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzVfX2ZvdW5kYXRpb25fcGx1Z2luX18pO1xuXG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxuXG5cblxuXG5cblxuXG4vKipcbiAqIERyb3Bkb3duTWVudSBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uZHJvcGRvd24tbWVudVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5ib3hcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubmVzdFxuICovXG5cbnZhciBEcm9wZG93bk1lbnUgPSBmdW5jdGlvbiAoX1BsdWdpbikge1xuICBfaW5oZXJpdHMoRHJvcGRvd25NZW51LCBfUGx1Z2luKTtcblxuICBmdW5jdGlvbiBEcm9wZG93bk1lbnUoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIERyb3Bkb3duTWVudSk7XG5cbiAgICByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgKERyb3Bkb3duTWVudS5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKERyb3Bkb3duTWVudSkpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKERyb3Bkb3duTWVudSwgW3tcbiAgICBrZXk6ICdfc2V0dXAnLFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEcm9wZG93bk1lbnUuXG4gICAgICogQGNsYXNzXG4gICAgICogQG5hbWUgRHJvcGRvd25NZW51XG4gICAgICogQGZpcmVzIERyb3Bkb3duTWVudSNpbml0XG4gICAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhIGRyb3Bkb3duIG1lbnUuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgICAqL1xuICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0dXAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICB0aGlzLm9wdGlvbnMgPSBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdC5hLmV4dGVuZCh7fSwgRHJvcGRvd25NZW51LmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG4gICAgICB0aGlzLmNsYXNzTmFtZSA9ICdEcm9wZG93bk1lbnUnOyAvLyBpZTkgYmFjayBjb21wYXRcblxuICAgICAgdGhpcy5faW5pdCgpO1xuXG4gICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fdXRpbF9rZXlib2FyZF9fW1wiS2V5Ym9hcmRcIl0ucmVnaXN0ZXIoJ0Ryb3Bkb3duTWVudScsIHtcbiAgICAgICAgJ0VOVEVSJzogJ29wZW4nLFxuICAgICAgICAnU1BBQ0UnOiAnb3BlbicsXG4gICAgICAgICdBUlJPV19SSUdIVCc6ICduZXh0JyxcbiAgICAgICAgJ0FSUk9XX1VQJzogJ3VwJyxcbiAgICAgICAgJ0FSUk9XX0RPV04nOiAnZG93bicsXG4gICAgICAgICdBUlJPV19MRUZUJzogJ3ByZXZpb3VzJyxcbiAgICAgICAgJ0VTQ0FQRSc6ICdjbG9zZSdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBwbHVnaW4sIGFuZCBjYWxscyBfcHJlcGFyZU1lbnVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdfaW5pdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9pbml0KCkge1xuICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8yX19mb3VuZGF0aW9uX3V0aWxfbmVzdF9fW1wiTmVzdFwiXS5GZWF0aGVyKHRoaXMuJGVsZW1lbnQsICdkcm9wZG93bicpO1xuXG4gICAgICB2YXIgc3VicyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJy5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpLmNoaWxkcmVuKCcuaXMtZHJvcGRvd24tc3VibWVudScpLmFkZENsYXNzKCdmaXJzdC1zdWInKTtcblxuICAgICAgdGhpcy4kbWVudUl0ZW1zID0gdGhpcy4kZWxlbWVudC5maW5kKCdbcm9sZT1cIm1lbnVpdGVtXCJdJyk7XG4gICAgICB0aGlzLiR0YWJzID0gdGhpcy4kZWxlbWVudC5jaGlsZHJlbignW3JvbGU9XCJtZW51aXRlbVwiXScpO1xuICAgICAgdGhpcy4kdGFicy5maW5kKCd1bC5pcy1kcm9wZG93bi1zdWJtZW51JykuYWRkQ2xhc3ModGhpcy5vcHRpb25zLnZlcnRpY2FsQ2xhc3MpO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmFsaWdubWVudCA9PT0gJ2F1dG8nKSB7XG4gICAgICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKHRoaXMub3B0aW9ucy5yaWdodENsYXNzKSB8fCBfX3dlYnBhY2tfcmVxdWlyZV9fLmkoX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV80X19mb3VuZGF0aW9uX3V0aWxfY29yZV9fW1wicnRsXCJdKSgpIHx8IHRoaXMuJGVsZW1lbnQucGFyZW50cygnLnRvcC1iYXItcmlnaHQnKS5pcygnKicpKSB7XG4gICAgICAgICAgdGhpcy5vcHRpb25zLmFsaWdubWVudCA9ICdyaWdodCc7XG4gICAgICAgICAgc3Vicy5hZGRDbGFzcygnb3BlbnMtbGVmdCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPSAnbGVmdCc7XG4gICAgICAgICAgc3Vicy5hZGRDbGFzcygnb3BlbnMtcmlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPT09ICdyaWdodCcpIHtcbiAgICAgICAgICBzdWJzLmFkZENsYXNzKCdvcGVucy1sZWZ0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3Vicy5hZGRDbGFzcygnb3BlbnMtcmlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5jaGFuZ2VkID0gZmFsc2U7XG4gICAgICB0aGlzLl9ldmVudHMoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdfaXNWZXJ0aWNhbCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9pc1ZlcnRpY2FsKCkge1xuICAgICAgcmV0dXJuIHRoaXMuJHRhYnMuY3NzKCdkaXNwbGF5JykgPT09ICdibG9jaycgfHwgdGhpcy4kZWxlbWVudC5jc3MoJ2ZsZXgtZGlyZWN0aW9uJykgPT09ICdjb2x1bW4nO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ19pc1J0bCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9pc1J0bCgpIHtcbiAgICAgIHJldHVybiB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdhbGlnbi1yaWdodCcpIHx8IF9fd2VicGFja19yZXF1aXJlX18uaShfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzRfX2ZvdW5kYXRpb25fdXRpbF9jb3JlX19bXCJydGxcIl0pKCkgJiYgIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2FsaWduLWxlZnQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyB0byBlbGVtZW50cyB3aXRoaW4gdGhlIG1lbnVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdfZXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2V2ZW50cygpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgaGFzVG91Y2ggPSAnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cgfHwgdHlwZW9mIHdpbmRvdy5vbnRvdWNoc3RhcnQgIT09ICd1bmRlZmluZWQnLFxuICAgICAgICAgIHBhckNsYXNzID0gJ2lzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50JztcblxuICAgICAgLy8gdXNlZCBmb3Igb25DbGljayBhbmQgaW4gdGhlIGtleWJvYXJkIGhhbmRsZXJzXG4gICAgICB2YXIgaGFuZGxlQ2xpY2tGbiA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciAkZWxlbSA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkoZS50YXJnZXQpLnBhcmVudHNVbnRpbCgndWwnLCAnLicgKyBwYXJDbGFzcyksXG4gICAgICAgICAgICBoYXNTdWIgPSAkZWxlbS5oYXNDbGFzcyhwYXJDbGFzcyksXG4gICAgICAgICAgICBoYXNDbGlja2VkID0gJGVsZW0uYXR0cignZGF0YS1pcy1jbGljaycpID09PSAndHJ1ZScsXG4gICAgICAgICAgICAkc3ViID0gJGVsZW0uY2hpbGRyZW4oJy5pcy1kcm9wZG93bi1zdWJtZW51Jyk7XG5cbiAgICAgICAgaWYgKGhhc1N1Yikge1xuICAgICAgICAgIGlmIChoYXNDbGlja2VkKSB7XG4gICAgICAgICAgICBpZiAoIV90aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrIHx8ICFfdGhpcy5vcHRpb25zLmNsaWNrT3BlbiAmJiAhaGFzVG91Y2ggfHwgX3RoaXMub3B0aW9ucy5mb3JjZUZvbGxvdyAmJiBoYXNUb3VjaCkge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIF90aGlzLl9oaWRlKCRlbGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIF90aGlzLl9zaG93KCRzdWIpO1xuICAgICAgICAgICAgJGVsZW0uYWRkKCRlbGVtLnBhcmVudHNVbnRpbChfdGhpcy4kZWxlbWVudCwgJy4nICsgcGFyQ2xhc3MpKS5hdHRyKCdkYXRhLWlzLWNsaWNrJywgdHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmNsaWNrT3BlbiB8fCBoYXNUb3VjaCkge1xuICAgICAgICB0aGlzLiRtZW51SXRlbXMub24oJ2NsaWNrLnpmLmRyb3Bkb3dubWVudSB0b3VjaHN0YXJ0LnpmLmRyb3Bkb3dubWVudScsIGhhbmRsZUNsaWNrRm4pO1xuICAgICAgfVxuXG4gICAgICAvLyBIYW5kbGUgTGVhZiBlbGVtZW50IENsaWNrc1xuICAgICAgaWYgKF90aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrSW5zaWRlKSB7XG4gICAgICAgIHRoaXMuJG1lbnVJdGVtcy5vbignY2xpY2suemYuZHJvcGRvd25tZW51JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICB2YXIgJGVsZW0gPSBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHRoaXMpLFxuICAgICAgICAgICAgICBoYXNTdWIgPSAkZWxlbS5oYXNDbGFzcyhwYXJDbGFzcyk7XG4gICAgICAgICAgaWYgKCFoYXNTdWIpIHtcbiAgICAgICAgICAgIF90aGlzLl9oaWRlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZGlzYWJsZUhvdmVyKSB7XG4gICAgICAgIHRoaXMuJG1lbnVJdGVtcy5vbignbW91c2VlbnRlci56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIHZhciAkZWxlbSA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcyksXG4gICAgICAgICAgICAgIGhhc1N1YiA9ICRlbGVtLmhhc0NsYXNzKHBhckNsYXNzKTtcblxuICAgICAgICAgIGlmIChoYXNTdWIpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCgkZWxlbS5kYXRhKCdfZGVsYXknKSk7XG4gICAgICAgICAgICAkZWxlbS5kYXRhKCdfZGVsYXknLCBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgX3RoaXMuX3Nob3coJGVsZW0uY2hpbGRyZW4oJy5pcy1kcm9wZG93bi1zdWJtZW51JykpO1xuICAgICAgICAgICAgfSwgX3RoaXMub3B0aW9ucy5ob3ZlckRlbGF5KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5vbignbW91c2VsZWF2ZS56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIHZhciAkZWxlbSA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcyksXG4gICAgICAgICAgICAgIGhhc1N1YiA9ICRlbGVtLmhhc0NsYXNzKHBhckNsYXNzKTtcbiAgICAgICAgICBpZiAoaGFzU3ViICYmIF90aGlzLm9wdGlvbnMuYXV0b2Nsb3NlKSB7XG4gICAgICAgICAgICBpZiAoJGVsZW0uYXR0cignZGF0YS1pcy1jbGljaycpID09PSAndHJ1ZScgJiYgX3RoaXMub3B0aW9ucy5jbGlja09wZW4pIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoJGVsZW0uZGF0YSgnX2RlbGF5JykpO1xuICAgICAgICAgICAgJGVsZW0uZGF0YSgnX2RlbGF5Jywgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIF90aGlzLl9oaWRlKCRlbGVtKTtcbiAgICAgICAgICAgIH0sIF90aGlzLm9wdGlvbnMuY2xvc2luZ1RpbWUpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdGhpcy4kbWVudUl0ZW1zLm9uKCdrZXlkb3duLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciAkZWxlbWVudCA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkoZS50YXJnZXQpLnBhcmVudHNVbnRpbCgndWwnLCAnW3JvbGU9XCJtZW51aXRlbVwiXScpLFxuICAgICAgICAgICAgaXNUYWIgPSBfdGhpcy4kdGFicy5pbmRleCgkZWxlbWVudCkgPiAtMSxcbiAgICAgICAgICAgICRlbGVtZW50cyA9IGlzVGFiID8gX3RoaXMuJHRhYnMgOiAkZWxlbWVudC5zaWJsaW5ncygnbGknKS5hZGQoJGVsZW1lbnQpLFxuICAgICAgICAgICAgJHByZXZFbGVtZW50LFxuICAgICAgICAgICAgJG5leHRFbGVtZW50O1xuXG4gICAgICAgICRlbGVtZW50cy5lYWNoKGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgaWYgKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcykuaXMoJGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAkcHJldkVsZW1lbnQgPSAkZWxlbWVudHMuZXEoaSAtIDEpO1xuICAgICAgICAgICAgJG5leHRFbGVtZW50ID0gJGVsZW1lbnRzLmVxKGkgKyAxKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBuZXh0U2libGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkbmV4dEVsZW1lbnQuY2hpbGRyZW4oJ2E6Zmlyc3QnKS5mb2N1cygpO1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgICAgIHByZXZTaWJsaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRwcmV2RWxlbWVudC5jaGlsZHJlbignYTpmaXJzdCcpLmZvY3VzKCk7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9LFxuICAgICAgICAgICAgb3BlblN1YiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgJHN1YiA9ICRlbGVtZW50LmNoaWxkcmVuKCd1bC5pcy1kcm9wZG93bi1zdWJtZW51Jyk7XG4gICAgICAgICAgaWYgKCRzdWIubGVuZ3RoKSB7XG4gICAgICAgICAgICBfdGhpcy5fc2hvdygkc3ViKTtcbiAgICAgICAgICAgICRlbGVtZW50LmZpbmQoJ2xpID4gYTpmaXJzdCcpLmZvY3VzKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgICAgICBjbG9zZVN1YiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvL2lmICgkZWxlbWVudC5pcygnOmZpcnN0LWNoaWxkJykpIHtcbiAgICAgICAgICB2YXIgY2xvc2UgPSAkZWxlbWVudC5wYXJlbnQoJ3VsJykucGFyZW50KCdsaScpO1xuICAgICAgICAgIGNsb3NlLmNoaWxkcmVuKCdhOmZpcnN0JykuZm9jdXMoKTtcbiAgICAgICAgICBfdGhpcy5faGlkZShjbG9zZSk7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIC8vfVxuICAgICAgICB9O1xuICAgICAgICB2YXIgZnVuY3Rpb25zID0ge1xuICAgICAgICAgIG9wZW46IG9wZW5TdWIsXG4gICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLl9oaWRlKF90aGlzLiRlbGVtZW50KTtcbiAgICAgICAgICAgIF90aGlzLiRtZW51SXRlbXMuZXEoMCkuY2hpbGRyZW4oJ2EnKS5mb2N1cygpOyAvLyBmb2N1cyB0byBmaXJzdCBlbGVtZW50XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoaXNUYWIpIHtcbiAgICAgICAgICBpZiAoX3RoaXMuX2lzVmVydGljYWwoKSkge1xuICAgICAgICAgICAgLy8gdmVydGljYWwgbWVudVxuICAgICAgICAgICAgaWYgKF90aGlzLl9pc1J0bCgpKSB7XG4gICAgICAgICAgICAgIC8vIHJpZ2h0IGFsaWduZWRcbiAgICAgICAgICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQuYS5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgICAgZG93bjogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgICAgdXA6IHByZXZTaWJsaW5nLFxuICAgICAgICAgICAgICAgIG5leHQ6IGNsb3NlU3ViLFxuICAgICAgICAgICAgICAgIHByZXZpb3VzOiBvcGVuU3ViXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gbGVmdCBhbGlnbmVkXG4gICAgICAgICAgICAgIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0LmEuZXh0ZW5kKGZ1bmN0aW9ucywge1xuICAgICAgICAgICAgICAgIGRvd246IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICAgIHVwOiBwcmV2U2libGluZyxcbiAgICAgICAgICAgICAgICBuZXh0OiBvcGVuU3ViLFxuICAgICAgICAgICAgICAgIHByZXZpb3VzOiBjbG9zZVN1YlxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaG9yaXpvbnRhbCBtZW51XG4gICAgICAgICAgICBpZiAoX3RoaXMuX2lzUnRsKCkpIHtcbiAgICAgICAgICAgICAgLy8gcmlnaHQgYWxpZ25lZFxuICAgICAgICAgICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdC5hLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgICBuZXh0OiBwcmV2U2libGluZyxcbiAgICAgICAgICAgICAgICBwcmV2aW91czogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgICAgZG93bjogb3BlblN1YixcbiAgICAgICAgICAgICAgICB1cDogY2xvc2VTdWJcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBsZWZ0IGFsaWduZWRcbiAgICAgICAgICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQuYS5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgICAgbmV4dDogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgICAgcHJldmlvdXM6IHByZXZTaWJsaW5nLFxuICAgICAgICAgICAgICAgIGRvd246IG9wZW5TdWIsXG4gICAgICAgICAgICAgICAgdXA6IGNsb3NlU3ViXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBub3QgdGFicyAtPiBvbmUgc3ViXG4gICAgICAgICAgaWYgKF90aGlzLl9pc1J0bCgpKSB7XG4gICAgICAgICAgICAvLyByaWdodCBhbGlnbmVkXG4gICAgICAgICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdC5hLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgbmV4dDogY2xvc2VTdWIsXG4gICAgICAgICAgICAgIHByZXZpb3VzOiBvcGVuU3ViLFxuICAgICAgICAgICAgICBkb3duOiBuZXh0U2libGluZyxcbiAgICAgICAgICAgICAgdXA6IHByZXZTaWJsaW5nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gbGVmdCBhbGlnbmVkXG4gICAgICAgICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdC5hLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgbmV4dDogb3BlblN1YixcbiAgICAgICAgICAgICAgcHJldmlvdXM6IGNsb3NlU3ViLFxuICAgICAgICAgICAgICBkb3duOiBuZXh0U2libGluZyxcbiAgICAgICAgICAgICAgdXA6IHByZXZTaWJsaW5nXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfa2V5Ym9hcmRfX1tcIktleWJvYXJkXCJdLmhhbmRsZUtleShlLCAnRHJvcGRvd25NZW51JywgZnVuY3Rpb25zKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gZXZlbnQgaGFuZGxlciB0byB0aGUgYm9keSB0byBjbG9zZSBhbnkgZHJvcGRvd25zIG9uIGEgY2xpY2suXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnX2FkZEJvZHlIYW5kbGVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2FkZEJvZHlIYW5kbGVyKCkge1xuICAgICAgdmFyICRib2R5ID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKShkb2N1bWVudC5ib2R5KSxcbiAgICAgICAgICBfdGhpcyA9IHRoaXM7XG4gICAgICAkYm9keS5vZmYoJ21vdXNldXAuemYuZHJvcGRvd25tZW51IHRvdWNoZW5kLnpmLmRyb3Bkb3dubWVudScpLm9uKCdtb3VzZXVwLnpmLmRyb3Bkb3dubWVudSB0b3VjaGVuZC56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgJGxpbmsgPSBfdGhpcy4kZWxlbWVudC5maW5kKGUudGFyZ2V0KTtcbiAgICAgICAgaWYgKCRsaW5rLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIF90aGlzLl9oaWRlKCk7XG4gICAgICAgICRib2R5Lm9mZignbW91c2V1cC56Zi5kcm9wZG93bm1lbnUgdG91Y2hlbmQuemYuZHJvcGRvd25tZW51Jyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPcGVucyBhIGRyb3Bkb3duIHBhbmUsIGFuZCBjaGVja3MgZm9yIGNvbGxpc2lvbnMgZmlyc3QuXG4gICAgICogQHBhcmFtIHtqUXVlcnl9ICRzdWIgLSB1bCBlbGVtZW50IHRoYXQgaXMgYSBzdWJtZW51IHRvIHNob3dcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBmaXJlcyBEcm9wZG93bk1lbnUjc2hvd1xuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdfc2hvdycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9zaG93KCRzdWIpIHtcbiAgICAgIHZhciBpZHggPSB0aGlzLiR0YWJzLmluZGV4KHRoaXMuJHRhYnMuZmlsdGVyKGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICByZXR1cm4gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKShlbCkuZmluZCgkc3ViKS5sZW5ndGggPiAwO1xuICAgICAgfSkpO1xuICAgICAgdmFyICRzaWJzID0gJHN1Yi5wYXJlbnQoJ2xpLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50Jykuc2libGluZ3MoJ2xpLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50Jyk7XG4gICAgICB0aGlzLl9oaWRlKCRzaWJzLCBpZHgpO1xuICAgICAgJHN1Yi5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJykuYWRkQ2xhc3MoJ2pzLWRyb3Bkb3duLWFjdGl2ZScpLnBhcmVudCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICB2YXIgY2xlYXIgPSBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzNfX2ZvdW5kYXRpb25fdXRpbF9ib3hfX1tcIkJveFwiXS5JbU5vdFRvdWNoaW5nWW91KCRzdWIsIG51bGwsIHRydWUpO1xuICAgICAgaWYgKCFjbGVhcikge1xuICAgICAgICB2YXIgb2xkQ2xhc3MgPSB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID09PSAnbGVmdCcgPyAnLXJpZ2h0JyA6ICctbGVmdCcsXG4gICAgICAgICAgICAkcGFyZW50TGkgPSAkc3ViLnBhcmVudCgnLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50Jyk7XG4gICAgICAgICRwYXJlbnRMaS5yZW1vdmVDbGFzcygnb3BlbnMnICsgb2xkQ2xhc3MpLmFkZENsYXNzKCdvcGVucy0nICsgdGhpcy5vcHRpb25zLmFsaWdubWVudCk7XG4gICAgICAgIGNsZWFyID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8zX19mb3VuZGF0aW9uX3V0aWxfYm94X19bXCJCb3hcIl0uSW1Ob3RUb3VjaGluZ1lvdSgkc3ViLCBudWxsLCB0cnVlKTtcbiAgICAgICAgaWYgKCFjbGVhcikge1xuICAgICAgICAgICRwYXJlbnRMaS5yZW1vdmVDbGFzcygnb3BlbnMtJyArIHRoaXMub3B0aW9ucy5hbGlnbm1lbnQpLmFkZENsYXNzKCdvcGVucy1pbm5lcicpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hhbmdlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICAkc3ViLmNzcygndmlzaWJpbGl0eScsICcnKTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrKSB7XG4gICAgICAgIHRoaXMuX2FkZEJvZHlIYW5kbGVyKCk7XG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG5ldyBkcm9wZG93biBwYW5lIGlzIHZpc2libGUuXG4gICAgICAgKiBAZXZlbnQgRHJvcGRvd25NZW51I3Nob3dcbiAgICAgICAqL1xuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdzaG93LnpmLmRyb3Bkb3dubWVudScsIFskc3ViXSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGlkZXMgYSBzaW5nbGUsIGN1cnJlbnRseSBvcGVuIGRyb3Bkb3duIHBhbmUsIGlmIHBhc3NlZCBhIHBhcmFtZXRlciwgb3RoZXJ3aXNlLCBoaWRlcyBldmVyeXRoaW5nLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbSAtIGVsZW1lbnQgd2l0aCBhIHN1Ym1lbnUgdG8gaGlkZVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpZHggLSBpbmRleCBvZiB0aGUgJHRhYnMgY29sbGVjdGlvbiB0byBoaWRlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnX2hpZGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfaGlkZSgkZWxlbSwgaWR4KSB7XG4gICAgICB2YXIgJHRvQ2xvc2U7XG4gICAgICBpZiAoJGVsZW0gJiYgJGVsZW0ubGVuZ3RoKSB7XG4gICAgICAgICR0b0Nsb3NlID0gJGVsZW07XG4gICAgICB9IGVsc2UgaWYgKGlkeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICR0b0Nsb3NlID0gdGhpcy4kdGFicy5ub3QoZnVuY3Rpb24gKGksIGVsKSB7XG4gICAgICAgICAgcmV0dXJuIGkgPT09IGlkeDtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkdG9DbG9zZSA9IHRoaXMuJGVsZW1lbnQ7XG4gICAgICB9XG4gICAgICB2YXIgc29tZXRoaW5nVG9DbG9zZSA9ICR0b0Nsb3NlLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSB8fCAkdG9DbG9zZS5maW5kKCcuaXMtYWN0aXZlJykubGVuZ3RoID4gMDtcblxuICAgICAgaWYgKHNvbWV0aGluZ1RvQ2xvc2UpIHtcbiAgICAgICAgJHRvQ2xvc2UuZmluZCgnbGkuaXMtYWN0aXZlJykuYWRkKCR0b0Nsb3NlKS5hdHRyKHtcbiAgICAgICAgICAnZGF0YS1pcy1jbGljayc6IGZhbHNlXG4gICAgICAgIH0pLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcblxuICAgICAgICAkdG9DbG9zZS5maW5kKCd1bC5qcy1kcm9wZG93bi1hY3RpdmUnKS5yZW1vdmVDbGFzcygnanMtZHJvcGRvd24tYWN0aXZlJyk7XG5cbiAgICAgICAgaWYgKHRoaXMuY2hhbmdlZCB8fCAkdG9DbG9zZS5maW5kKCdvcGVucy1pbm5lcicpLmxlbmd0aCkge1xuICAgICAgICAgIHZhciBvbGRDbGFzcyA9IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPT09ICdsZWZ0JyA/ICdyaWdodCcgOiAnbGVmdCc7XG4gICAgICAgICAgJHRvQ2xvc2UuZmluZCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5hZGQoJHRvQ2xvc2UpLnJlbW92ZUNsYXNzKCdvcGVucy1pbm5lciBvcGVucy0nICsgdGhpcy5vcHRpb25zLmFsaWdubWVudCkuYWRkQ2xhc3MoJ29wZW5zLScgKyBvbGRDbGFzcyk7XG4gICAgICAgICAgdGhpcy5jaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG9wZW4gbWVudXMgYXJlIGNsb3NlZC5cbiAgICAgICAgICogQGV2ZW50IERyb3Bkb3duTWVudSNoaWRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2hpZGUuemYuZHJvcGRvd25tZW51JywgWyR0b0Nsb3NlXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVzdHJveXMgdGhlIHBsdWdpbi5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnX2Rlc3Ryb3knLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZGVzdHJveSgpIHtcbiAgICAgIHRoaXMuJG1lbnVJdGVtcy5vZmYoJy56Zi5kcm9wZG93bm1lbnUnKS5yZW1vdmVBdHRyKCdkYXRhLWlzLWNsaWNrJykucmVtb3ZlQ2xhc3MoJ2lzLXJpZ2h0LWFycm93IGlzLWxlZnQtYXJyb3cgaXMtZG93bi1hcnJvdyBvcGVucy1yaWdodCBvcGVucy1sZWZ0IG9wZW5zLWlubmVyJyk7XG4gICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKGRvY3VtZW50LmJvZHkpLm9mZignLnpmLmRyb3Bkb3dubWVudScpO1xuICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8yX19mb3VuZGF0aW9uX3V0aWxfbmVzdF9fW1wiTmVzdFwiXS5CdXJuKHRoaXMuJGVsZW1lbnQsICdkcm9wZG93bicpO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBEcm9wZG93bk1lbnU7XG59KF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNV9fZm91bmRhdGlvbl9wbHVnaW5fX1tcIlBsdWdpblwiXSk7XG5cbi8qKlxuICogRGVmYXVsdCBzZXR0aW5ncyBmb3IgcGx1Z2luXG4gKi9cblxuXG5Ecm9wZG93bk1lbnUuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBEaXNhbGxvd3MgaG92ZXIgZXZlbnRzIGZyb20gb3BlbmluZyBzdWJtZW51c1xuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgZGlzYWJsZUhvdmVyOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFsbG93IGEgc3VibWVudSB0byBhdXRvbWF0aWNhbGx5IGNsb3NlIG9uIGEgbW91c2VsZWF2ZSBldmVudCwgaWYgbm90IGNsaWNrZWQgb3Blbi5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgYXV0b2Nsb3NlOiB0cnVlLFxuICAvKipcbiAgICogQW1vdW50IG9mIHRpbWUgdG8gZGVsYXkgb3BlbmluZyBhIHN1Ym1lbnUgb24gaG92ZXIgZXZlbnQuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGRlZmF1bHQgNTBcbiAgICovXG4gIGhvdmVyRGVsYXk6IDUwLFxuICAvKipcbiAgICogQWxsb3cgYSBzdWJtZW51IHRvIG9wZW4vcmVtYWluIG9wZW4gb24gcGFyZW50IGNsaWNrIGV2ZW50LiBBbGxvd3MgY3Vyc29yIHRvIG1vdmUgYXdheSBmcm9tIG1lbnUuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBjbGlja09wZW46IGZhbHNlLFxuICAvKipcbiAgICogQW1vdW50IG9mIHRpbWUgdG8gZGVsYXkgY2xvc2luZyBhIHN1Ym1lbnUgb24gYSBtb3VzZWxlYXZlIGV2ZW50LlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDUwMFxuICAgKi9cblxuICBjbG9zaW5nVGltZTogNTAwLFxuICAvKipcbiAgICogUG9zaXRpb24gb2YgdGhlIG1lbnUgcmVsYXRpdmUgdG8gd2hhdCBkaXJlY3Rpb24gdGhlIHN1Ym1lbnVzIHNob3VsZCBvcGVuLiBIYW5kbGVkIGJ5IEpTLiBDYW4gYmUgYCdhdXRvJ2AsIGAnbGVmdCdgIG9yIGAncmlnaHQnYC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAnYXV0bydcbiAgICovXG4gIGFsaWdubWVudDogJ2F1dG8nLFxuICAvKipcbiAgICogQWxsb3cgY2xpY2tzIG9uIHRoZSBib2R5IHRvIGNsb3NlIGFueSBvcGVuIHN1Ym1lbnVzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBjbG9zZU9uQ2xpY2s6IHRydWUsXG4gIC8qKlxuICAgKiBBbGxvdyBjbGlja3Mgb24gbGVhZiBhbmNob3IgbGlua3MgdG8gY2xvc2UgYW55IG9wZW4gc3VibWVudXMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGNsb3NlT25DbGlja0luc2lkZTogdHJ1ZSxcbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gdmVydGljYWwgb3JpZW50ZWQgbWVudXMsIEZvdW5kYXRpb24gZGVmYXVsdCBpcyBgdmVydGljYWxgLiBVcGRhdGUgdGhpcyBpZiB1c2luZyB5b3VyIG93biBjbGFzcy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAndmVydGljYWwnXG4gICAqL1xuICB2ZXJ0aWNhbENsYXNzOiAndmVydGljYWwnLFxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byByaWdodC1zaWRlIG9yaWVudGVkIG1lbnVzLCBGb3VuZGF0aW9uIGRlZmF1bHQgaXMgYGFsaWduLXJpZ2h0YC4gVXBkYXRlIHRoaXMgaWYgdXNpbmcgeW91ciBvd24gY2xhc3MuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJ2FsaWduLXJpZ2h0J1xuICAgKi9cbiAgcmlnaHRDbGFzczogJ2FsaWduLXJpZ2h0JyxcbiAgLyoqXG4gICAqIEJvb2xlYW4gdG8gZm9yY2Ugb3ZlcmlkZSB0aGUgY2xpY2tpbmcgb2YgbGlua3MgdG8gcGVyZm9ybSBkZWZhdWx0IGFjdGlvbiwgb24gc2Vjb25kIHRvdWNoIGV2ZW50IGZvciBtb2JpbGUuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGZvcmNlRm9sbG93OiB0cnVlXG59O1xuXG5cblxuLyoqKi8gfSksXG5cbi8qKiovIDU6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0ge0tleWJvYXJkOiB3aW5kb3cuRm91bmRhdGlvbi5LZXlib2FyZH07XG5cbi8qKiovIH0pLFxuXG4vKioqLyA4OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtCb3g6IHdpbmRvdy5Gb3VuZGF0aW9uLkJveH07XG5cbi8qKiovIH0pLFxuXG4vKioqLyA4NDpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxubW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDE4KTtcblxuXG4vKioqLyB9KSxcblxuLyoqKi8gOTpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSB7TmVzdDogd2luZG93LkZvdW5kYXRpb24uTmVzdH07XG5cbi8qKiovIH0pXG5cbi8qKioqKiovIH0pOyIsIi8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0aTogbW9kdWxlSWQsXG4vKioqKioqLyBcdFx0XHRsOiBmYWxzZSxcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbi8qKioqKiovIFx0XHRtb2R1bGUubCA9IHRydWU7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG4vKioqKioqL1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uaSA9IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbi8qKioqKiovIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4vKioqKioqLyBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuLyoqKioqKi8gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuLyoqKioqKi8gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuLyoqKioqKi8gXHRcdFx0XHRnZXQ6IGdldHRlclxuLyoqKioqKi8gXHRcdFx0fSk7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4vKioqKioqLyBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4vKioqKioqLyBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuLyoqKioqKi8gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4vKioqKioqLyBcdFx0cmV0dXJuIGdldHRlcjtcbi8qKioqKiovIFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDg4KTtcbi8qKioqKiovIH0pXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gKHtcblxuLyoqKi8gMDpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSBqUXVlcnk7XG5cbi8qKiovIH0pLFxuXG4vKioqLyAxOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtGb3VuZGF0aW9uOiB3aW5kb3cuRm91bmRhdGlvbn07XG5cbi8qKiovIH0pLFxuXG4vKioqLyAyOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtQbHVnaW46IHdpbmRvdy5Gb3VuZGF0aW9uLlBsdWdpbn07XG5cbi8qKiovIH0pLFxuXG4vKioqLyAyMjpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIF9fd2VicGFja19leHBvcnRzX18sIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoX193ZWJwYWNrX2V4cG9ydHNfXywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX2NvcmVfXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX2NvcmVfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fZm91bmRhdGlvbl9jb3JlX18pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl9vZmZjYW52YXNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oNTIpO1xuXG5cblxuX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX2NvcmVfX1tcIkZvdW5kYXRpb25cIl0ucGx1Z2luKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl9vZmZjYW52YXNfX1tcImFcIiAvKiBPZmZDYW52YXMgKi9dLCAnT2ZmQ2FudmFzJyk7XG5cbi8qKiovIH0pLFxuXG4vKioqLyAzOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtydGw6IHdpbmRvdy5Gb3VuZGF0aW9uLnJ0bCwgR2V0WW9EaWdpdHM6IHdpbmRvdy5Gb3VuZGF0aW9uLkdldFlvRGlnaXRzLCB0cmFuc2l0aW9uZW5kOiB3aW5kb3cuRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kfTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDQ6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0ge01vdGlvbjogd2luZG93LkZvdW5kYXRpb24uTW90aW9uLCBNb3ZlOiB3aW5kb3cuRm91bmRhdGlvbi5Nb3ZlfTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDU6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0ge0tleWJvYXJkOiB3aW5kb3cuRm91bmRhdGlvbi5LZXlib2FyZH07XG5cbi8qKiovIH0pLFxuXG4vKioqLyA1Mjpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIF9fd2VicGFja19leHBvcnRzX18sIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG4vKiBoYXJtb255IGV4cG9ydCAoYmluZGluZykgKi8gX193ZWJwYWNrX3JlcXVpcmVfXy5kKF9fd2VicGFja19leHBvcnRzX18sIFwiYVwiLCBmdW5jdGlvbigpIHsgcmV0dXJuIE9mZkNhbnZhczsgfSk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X18pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX2tleWJvYXJkX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDUpO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX2tleWJvYXJkX19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fdXRpbF9rZXlib2FyZF9fKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzJfX2ZvdW5kYXRpb25fdXRpbF9tZWRpYVF1ZXJ5X18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDYpO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMl9fZm91bmRhdGlvbl91dGlsX21lZGlhUXVlcnlfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMl9fZm91bmRhdGlvbl91dGlsX21lZGlhUXVlcnlfXyk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8zX19mb3VuZGF0aW9uX3V0aWxfY29yZV9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygzKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzNfX2ZvdW5kYXRpb25fdXRpbF9jb3JlX19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzNfX2ZvdW5kYXRpb25fdXRpbF9jb3JlX18pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNF9fZm91bmRhdGlvbl9wbHVnaW5fXyA9IF9fd2VicGFja19yZXF1aXJlX18oMik7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV80X19mb3VuZGF0aW9uX3BsdWdpbl9fX2RlZmF1bHQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLm4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV80X19mb3VuZGF0aW9uX3BsdWdpbl9fKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzVfX2ZvdW5kYXRpb25fdXRpbF90cmlnZ2Vyc19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyg3KTtcblxuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cblxuXG5cblxuXG5cblxuXG4vKipcbiAqIE9mZkNhbnZhcyBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ub2ZmY2FudmFzXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnlcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcbiAqL1xuXG52YXIgT2ZmQ2FudmFzID0gZnVuY3Rpb24gKF9QbHVnaW4pIHtcbiAgX2luaGVyaXRzKE9mZkNhbnZhcywgX1BsdWdpbik7XG5cbiAgZnVuY3Rpb24gT2ZmQ2FudmFzKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBPZmZDYW52YXMpO1xuXG4gICAgcmV0dXJuIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChPZmZDYW52YXMuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihPZmZDYW52YXMpKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhPZmZDYW52YXMsIFt7XG4gICAga2V5OiAnX3NldHVwJyxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gb2ZmLWNhbnZhcyB3cmFwcGVyLlxuICAgICAqIEBjbGFzc1xuICAgICAqIEBuYW1lIE9mZkNhbnZhc1xuICAgICAqIEBmaXJlcyBPZmZDYW52YXMjaW5pdFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBpbml0aWFsaXplLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICAgKi9cbiAgICB2YWx1ZTogZnVuY3Rpb24gX3NldHVwKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICB0aGlzLmNsYXNzTmFtZSA9ICdPZmZDYW52YXMnOyAvLyBpZTkgYmFjayBjb21wYXRcbiAgICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgdGhpcy5vcHRpb25zID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQuYS5leHRlbmQoe30sIE9mZkNhbnZhcy5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuICAgICAgdGhpcy5jb250ZW50Q2xhc3NlcyA9IHsgYmFzZTogW10sIHJldmVhbDogW10gfTtcbiAgICAgIHRoaXMuJGxhc3RUcmlnZ2VyID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSgpO1xuICAgICAgdGhpcy4kdHJpZ2dlcnMgPSBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKCk7XG4gICAgICB0aGlzLnBvc2l0aW9uID0gJ2xlZnQnO1xuICAgICAgdGhpcy4kY29udGVudCA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkoKTtcbiAgICAgIHRoaXMubmVzdGVkID0gISF0aGlzLm9wdGlvbnMubmVzdGVkO1xuXG4gICAgICAvLyBEZWZpbmVzIHRoZSBDU1MgdHJhbnNpdGlvbi9wb3NpdGlvbiBjbGFzc2VzIG9mIHRoZSBvZmYtY2FudmFzIGNvbnRlbnQgY29udGFpbmVyLlxuICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKShbJ3B1c2gnLCAnb3ZlcmxhcCddKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgdmFsKSB7XG4gICAgICAgIF90aGlzMy5jb250ZW50Q2xhc3Nlcy5iYXNlLnB1c2goJ2hhcy10cmFuc2l0aW9uLScgKyB2YWwpO1xuICAgICAgfSk7XG4gICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKFsnbGVmdCcsICdyaWdodCcsICd0b3AnLCAnYm90dG9tJ10pLmVhY2goZnVuY3Rpb24gKGluZGV4LCB2YWwpIHtcbiAgICAgICAgX3RoaXMzLmNvbnRlbnRDbGFzc2VzLmJhc2UucHVzaCgnaGFzLXBvc2l0aW9uLScgKyB2YWwpO1xuICAgICAgICBfdGhpczMuY29udGVudENsYXNzZXMucmV2ZWFsLnB1c2goJ2hhcy1yZXZlYWwtJyArIHZhbCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gVHJpZ2dlcnMgaW5pdCBpcyBpZGVtcG90ZW50LCBqdXN0IG5lZWQgdG8gbWFrZSBzdXJlIGl0IGlzIGluaXRpYWxpemVkXG4gICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzVfX2ZvdW5kYXRpb25fdXRpbF90cmlnZ2Vyc19fW1wiYVwiIC8qIFRyaWdnZXJzICovXS5pbml0KF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0LmEpO1xuICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8yX19mb3VuZGF0aW9uX3V0aWxfbWVkaWFRdWVyeV9fW1wiTWVkaWFRdWVyeVwiXS5faW5pdCgpO1xuXG4gICAgICB0aGlzLl9pbml0KCk7XG4gICAgICB0aGlzLl9ldmVudHMoKTtcblxuICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfa2V5Ym9hcmRfX1tcIktleWJvYXJkXCJdLnJlZ2lzdGVyKCdPZmZDYW52YXMnLCB7XG4gICAgICAgICdFU0NBUEUnOiAnY2xvc2UnXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgb2ZmLWNhbnZhcyB3cmFwcGVyIGJ5IGFkZGluZyB0aGUgZXhpdCBvdmVybGF5IChpZiBuZWVkZWQpLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ19pbml0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2luaXQoKSB7XG4gICAgICB2YXIgaWQgPSB0aGlzLiRlbGVtZW50LmF0dHIoJ2lkJyk7XG5cbiAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuXG4gICAgICAvLyBGaW5kIG9mZi1jYW52YXMgY29udGVudCwgZWl0aGVyIGJ5IElEIChpZiBzcGVjaWZpZWQpLCBieSBzaWJsaW5ncyBvciBieSBjbG9zZXN0IHNlbGVjdG9yIChmYWxsYmFjaylcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudElkKSB7XG4gICAgICAgIHRoaXMuJGNvbnRlbnQgPSBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKCcjJyArIHRoaXMub3B0aW9ucy5jb250ZW50SWQpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLiRlbGVtZW50LnNpYmxpbmdzKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuJGNvbnRlbnQgPSB0aGlzLiRlbGVtZW50LnNpYmxpbmdzKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykuZmlyc3QoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuJGNvbnRlbnQgPSB0aGlzLiRlbGVtZW50LmNsb3Nlc3QoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKS5maXJzdCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5jb250ZW50SWQpIHtcbiAgICAgICAgLy8gQXNzdW1lIHRoYXQgdGhlIG9mZi1jYW52YXMgZWxlbWVudCBpcyBuZXN0ZWQgaWYgaXQgaXNuJ3QgYSBzaWJsaW5nIG9mIHRoZSBjb250ZW50XG4gICAgICAgIHRoaXMubmVzdGVkID0gdGhpcy4kZWxlbWVudC5zaWJsaW5ncygnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpLmxlbmd0aCA9PT0gMDtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRJZCAmJiB0aGlzLm9wdGlvbnMubmVzdGVkID09PSBudWxsKSB7XG4gICAgICAgIC8vIFdhcm5pbmcgaWYgdXNpbmcgY29udGVudCBJRCB3aXRob3V0IHNldHRpbmcgdGhlIG5lc3RlZCBvcHRpb25cbiAgICAgICAgLy8gT25jZSB0aGUgZWxlbWVudCBpcyBuZXN0ZWQgaXQgaXMgcmVxdWlyZWQgdG8gd29yayBwcm9wZXJseSBpbiB0aGlzIGNhc2VcbiAgICAgICAgY29uc29sZS53YXJuKCdSZW1lbWJlciB0byB1c2UgdGhlIG5lc3RlZCBvcHRpb24gaWYgdXNpbmcgdGhlIGNvbnRlbnQgSUQgb3B0aW9uIScpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5uZXN0ZWQgPT09IHRydWUpIHtcbiAgICAgICAgLy8gRm9yY2UgdHJhbnNpdGlvbiBvdmVybGFwIGlmIG5lc3RlZFxuICAgICAgICB0aGlzLm9wdGlvbnMudHJhbnNpdGlvbiA9ICdvdmVybGFwJztcbiAgICAgICAgLy8gUmVtb3ZlIGFwcHJvcHJpYXRlIGNsYXNzZXMgaWYgYWxyZWFkeSBhc3NpZ25lZCBpbiBtYXJrdXBcbiAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnaXMtdHJhbnNpdGlvbi1wdXNoJyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2lzLXRyYW5zaXRpb24tJyArIHRoaXMub3B0aW9ucy50cmFuc2l0aW9uICsgJyBpcy1jbG9zZWQnKTtcblxuICAgICAgLy8gRmluZCB0cmlnZ2VycyB0aGF0IGFmZmVjdCB0aGlzIGVsZW1lbnQgYW5kIGFkZCBhcmlhLWV4cGFuZGVkIHRvIHRoZW1cbiAgICAgIHRoaXMuJHRyaWdnZXJzID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKShkb2N1bWVudCkuZmluZCgnW2RhdGEtb3Blbj1cIicgKyBpZCArICdcIl0sIFtkYXRhLWNsb3NlPVwiJyArIGlkICsgJ1wiXSwgW2RhdGEtdG9nZ2xlPVwiJyArIGlkICsgJ1wiXScpLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKS5hdHRyKCdhcmlhLWNvbnRyb2xzJywgaWQpO1xuXG4gICAgICAvLyBHZXQgcG9zaXRpb24gYnkgY2hlY2tpbmcgZm9yIHJlbGF0ZWQgQ1NTIGNsYXNzXG4gICAgICB0aGlzLnBvc2l0aW9uID0gdGhpcy4kZWxlbWVudC5pcygnLnBvc2l0aW9uLWxlZnQsIC5wb3NpdGlvbi10b3AsIC5wb3NpdGlvbi1yaWdodCwgLnBvc2l0aW9uLWJvdHRvbScpID8gdGhpcy4kZWxlbWVudC5hdHRyKCdjbGFzcycpLm1hdGNoKC9wb3NpdGlvblxcLShsZWZ0fHRvcHxyaWdodHxib3R0b20pLylbMV0gOiB0aGlzLnBvc2l0aW9uO1xuXG4gICAgICAvLyBBZGQgYW4gb3ZlcmxheSBvdmVyIHRoZSBjb250ZW50IGlmIG5lY2Vzc2FyeVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgICB2YXIgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB2YXIgb3ZlcmxheVBvc2l0aW9uID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh0aGlzLiRlbGVtZW50KS5jc3MoXCJwb3NpdGlvblwiKSA9PT0gJ2ZpeGVkJyA/ICdpcy1vdmVybGF5LWZpeGVkJyA6ICdpcy1vdmVybGF5LWFic29sdXRlJztcbiAgICAgICAgb3ZlcmxheS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2pzLW9mZi1jYW52YXMtb3ZlcmxheSAnICsgb3ZlcmxheVBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy4kb3ZlcmxheSA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkob3ZlcmxheSk7XG4gICAgICAgIGlmIChvdmVybGF5UG9zaXRpb24gPT09ICdpcy1vdmVybGF5LWZpeGVkJykge1xuICAgICAgICAgIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcy4kb3ZlcmxheSkuaW5zZXJ0QWZ0ZXIodGhpcy4kZWxlbWVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy4kY29udGVudC5hcHBlbmQodGhpcy4kb3ZlcmxheSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5vcHRpb25zLmlzUmV2ZWFsZWQgPSB0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCB8fCBuZXcgUmVnRXhwKHRoaXMub3B0aW9ucy5yZXZlYWxDbGFzcywgJ2cnKS50ZXN0KHRoaXMuJGVsZW1lbnRbMF0uY2xhc3NOYW1lKTtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5pc1JldmVhbGVkID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5yZXZlYWxPbiA9IHRoaXMub3B0aW9ucy5yZXZlYWxPbiB8fCB0aGlzLiRlbGVtZW50WzBdLmNsYXNzTmFtZS5tYXRjaCgvKHJldmVhbC1mb3ItbWVkaXVtfHJldmVhbC1mb3ItbGFyZ2UpL2cpWzBdLnNwbGl0KCctJylbMl07XG4gICAgICAgIHRoaXMuX3NldE1RQ2hlY2tlcigpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuY3NzKCd0cmFuc2l0aW9uLWR1cmF0aW9uJywgdGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lKTtcbiAgICAgIH1cblxuICAgICAgLy8gSW5pdGFsbHkgcmVtb3ZlIGFsbCB0cmFuc2l0aW9uL3Bvc2l0aW9uIENTUyBjbGFzc2VzIGZyb20gb2ZmLWNhbnZhcyBjb250ZW50IGNvbnRhaW5lci5cbiAgICAgIHRoaXMuX3JlbW92ZUNvbnRlbnRDbGFzc2VzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBldmVudCBoYW5kbGVycyB0byB0aGUgb2ZmLWNhbnZhcyB3cmFwcGVyIGFuZCB0aGUgZXhpdCBvdmVybGF5LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ19ldmVudHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZXZlbnRzKCkge1xuICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJy56Zi50cmlnZ2VyIC56Zi5vZmZjYW52YXMnKS5vbih7XG4gICAgICAgICdvcGVuLnpmLnRyaWdnZXInOiB0aGlzLm9wZW4uYmluZCh0aGlzKSxcbiAgICAgICAgJ2Nsb3NlLnpmLnRyaWdnZXInOiB0aGlzLmNsb3NlLmJpbmQodGhpcyksXG4gICAgICAgICd0b2dnbGUuemYudHJpZ2dlcic6IHRoaXMudG9nZ2xlLmJpbmQodGhpcyksXG4gICAgICAgICdrZXlkb3duLnpmLm9mZmNhbnZhcyc6IHRoaXMuX2hhbmRsZUtleWJvYXJkLmJpbmQodGhpcylcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayA9PT0gdHJ1ZSkge1xuICAgICAgICB2YXIgJHRhcmdldCA9IHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA/IHRoaXMuJG92ZXJsYXkgOiB0aGlzLiRjb250ZW50O1xuICAgICAgICAkdGFyZ2V0Lm9uKHsgJ2NsaWNrLnpmLm9mZmNhbnZhcyc6IHRoaXMuY2xvc2UuYmluZCh0aGlzKSB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcHBsaWVzIGV2ZW50IGxpc3RlbmVyIGZvciBlbGVtZW50cyB0aGF0IHdpbGwgcmV2ZWFsIGF0IGNlcnRhaW4gYnJlYWtwb2ludHMuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnX3NldE1RQ2hlY2tlcicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXRNUUNoZWNrZXIoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMl9fZm91bmRhdGlvbl91dGlsX21lZGlhUXVlcnlfX1tcIk1lZGlhUXVlcnlcIl0uYXRMZWFzdChfdGhpcy5vcHRpb25zLnJldmVhbE9uKSkge1xuICAgICAgICAgIF90aGlzLnJldmVhbCh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfdGhpcy5yZXZlYWwoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9KS5vbmUoJ2xvYWQuemYub2ZmY2FudmFzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8yX19mb3VuZGF0aW9uX3V0aWxfbWVkaWFRdWVyeV9fW1wiTWVkaWFRdWVyeVwiXS5hdExlYXN0KF90aGlzLm9wdGlvbnMucmV2ZWFsT24pKSB7XG4gICAgICAgICAgX3RoaXMucmV2ZWFsKHRydWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBDU1MgdHJhbnNpdGlvbi9wb3NpdGlvbiBjbGFzc2VzIG9mIHRoZSBvZmYtY2FudmFzIGNvbnRlbnQgY29udGFpbmVyLlxuICAgICAqIFJlbW92aW5nIHRoZSBjbGFzc2VzIGlzIGltcG9ydGFudCB3aGVuIGFub3RoZXIgb2ZmLWNhbnZhcyBnZXRzIG9wZW5lZCB0aGF0IHVzZXMgdGhlIHNhbWUgY29udGVudCBjb250YWluZXIuXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBoYXNSZXZlYWwgLSB0cnVlIGlmIHJlbGF0ZWQgb2ZmLWNhbnZhcyBlbGVtZW50IGlzIHJldmVhbGVkLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ19yZW1vdmVDb250ZW50Q2xhc3NlcycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9yZW1vdmVDb250ZW50Q2xhc3NlcyhoYXNSZXZlYWwpIHtcbiAgICAgIGlmICh0eXBlb2YgaGFzUmV2ZWFsICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgdGhpcy4kY29udGVudC5yZW1vdmVDbGFzcyh0aGlzLmNvbnRlbnRDbGFzc2VzLmJhc2Uuam9pbignICcpKTtcbiAgICAgIH0gZWxzZSBpZiAoaGFzUmV2ZWFsID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzLiRjb250ZW50LnJlbW92ZUNsYXNzKCdoYXMtcmV2ZWFsLScgKyB0aGlzLnBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIHRoZSBDU1MgdHJhbnNpdGlvbi9wb3NpdGlvbiBjbGFzc2VzIG9mIHRoZSBvZmYtY2FudmFzIGNvbnRlbnQgY29udGFpbmVyLCBiYXNlZCBvbiB0aGUgb3BlbmluZyBvZmYtY2FudmFzIGVsZW1lbnQuXG4gICAgICogQmVmb3JlaGFuZCBhbnkgdHJhbnNpdGlvbi9wb3NpdGlvbiBjbGFzcyBnZXRzIHJlbW92ZWQuXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBoYXNSZXZlYWwgLSB0cnVlIGlmIHJlbGF0ZWQgb2ZmLWNhbnZhcyBlbGVtZW50IGlzIHJldmVhbGVkLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ19hZGRDb250ZW50Q2xhc3NlcycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9hZGRDb250ZW50Q2xhc3NlcyhoYXNSZXZlYWwpIHtcbiAgICAgIHRoaXMuX3JlbW92ZUNvbnRlbnRDbGFzc2VzKGhhc1JldmVhbCk7XG4gICAgICBpZiAodHlwZW9mIGhhc1JldmVhbCAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIHRoaXMuJGNvbnRlbnQuYWRkQ2xhc3MoJ2hhcy10cmFuc2l0aW9uLScgKyB0aGlzLm9wdGlvbnMudHJhbnNpdGlvbiArICcgaGFzLXBvc2l0aW9uLScgKyB0aGlzLnBvc2l0aW9uKTtcbiAgICAgIH0gZWxzZSBpZiAoaGFzUmV2ZWFsID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuJGNvbnRlbnQuYWRkQ2xhc3MoJ2hhcy1yZXZlYWwtJyArIHRoaXMucG9zaXRpb24pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXMgdGhlIHJldmVhbGluZy9oaWRpbmcgdGhlIG9mZi1jYW52YXMgYXQgYnJlYWtwb2ludHMsIG5vdCB0aGUgc2FtZSBhcyBvcGVuLlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNSZXZlYWxlZCAtIHRydWUgaWYgZWxlbWVudCBzaG91bGQgYmUgcmV2ZWFsZWQuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ3JldmVhbCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJldmVhbChpc1JldmVhbGVkKSB7XG4gICAgICBpZiAoaXNSZXZlYWxlZCkge1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIHRoaXMuaXNSZXZlYWxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ29wZW4uemYudHJpZ2dlciB0b2dnbGUuemYudHJpZ2dlcicpO1xuICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCdpcy1jbG9zZWQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaXNSZXZlYWxlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ29wZW4uemYudHJpZ2dlciB0b2dnbGUuemYudHJpZ2dlcicpLm9uKHtcbiAgICAgICAgICAnb3Blbi56Zi50cmlnZ2VyJzogdGhpcy5vcGVuLmJpbmQodGhpcyksXG4gICAgICAgICAgJ3RvZ2dsZS56Zi50cmlnZ2VyJzogdGhpcy50b2dnbGUuYmluZCh0aGlzKVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnaXMtY2xvc2VkJyk7XG4gICAgICB9XG4gICAgICB0aGlzLl9hZGRDb250ZW50Q2xhc3Nlcyhpc1JldmVhbGVkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdG9wcyBzY3JvbGxpbmcgb2YgdGhlIGJvZHkgd2hlbiBvZmZjYW52YXMgaXMgb3BlbiBvbiBtb2JpbGUgU2FmYXJpIGFuZCBvdGhlciB0cm91Ymxlc29tZSBicm93c2Vycy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdfc3RvcFNjcm9sbGluZycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9zdG9wU2Nyb2xsaW5nKGV2ZW50KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gVGFrZW4gYW5kIGFkYXB0ZWQgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE2ODg5NDQ3L3ByZXZlbnQtZnVsbC1wYWdlLXNjcm9sbGluZy1pb3NcbiAgICAvLyBPbmx5IHJlYWxseSB3b3JrcyBmb3IgeSwgbm90IHN1cmUgaG93IHRvIGV4dGVuZCB0byB4IG9yIGlmIHdlIG5lZWQgdG8uXG5cbiAgfSwge1xuICAgIGtleTogJ19yZWNvcmRTY3JvbGxhYmxlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3JlY29yZFNjcm9sbGFibGUoZXZlbnQpIHtcbiAgICAgIHZhciBlbGVtID0gdGhpczsgLy8gY2FsbGVkIGZyb20gZXZlbnQgaGFuZGxlciBjb250ZXh0IHdpdGggdGhpcyBhcyBlbGVtXG5cbiAgICAgIC8vIElmIHRoZSBlbGVtZW50IGlzIHNjcm9sbGFibGUgKGNvbnRlbnQgb3ZlcmZsb3dzKSwgdGhlbi4uLlxuICAgICAgaWYgKGVsZW0uc2Nyb2xsSGVpZ2h0ICE9PSBlbGVtLmNsaWVudEhlaWdodCkge1xuICAgICAgICAvLyBJZiB3ZSdyZSBhdCB0aGUgdG9wLCBzY3JvbGwgZG93biBvbmUgcGl4ZWwgdG8gYWxsb3cgc2Nyb2xsaW5nIHVwXG4gICAgICAgIGlmIChlbGVtLnNjcm9sbFRvcCA9PT0gMCkge1xuICAgICAgICAgIGVsZW0uc2Nyb2xsVG9wID0gMTtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB3ZSdyZSBhdCB0aGUgYm90dG9tLCBzY3JvbGwgdXAgb25lIHBpeGVsIHRvIGFsbG93IHNjcm9sbGluZyBkb3duXG4gICAgICAgIGlmIChlbGVtLnNjcm9sbFRvcCA9PT0gZWxlbS5zY3JvbGxIZWlnaHQgLSBlbGVtLmNsaWVudEhlaWdodCkge1xuICAgICAgICAgIGVsZW0uc2Nyb2xsVG9wID0gZWxlbS5zY3JvbGxIZWlnaHQgLSBlbGVtLmNsaWVudEhlaWdodCAtIDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsZW0uYWxsb3dVcCA9IGVsZW0uc2Nyb2xsVG9wID4gMDtcbiAgICAgIGVsZW0uYWxsb3dEb3duID0gZWxlbS5zY3JvbGxUb3AgPCBlbGVtLnNjcm9sbEhlaWdodCAtIGVsZW0uY2xpZW50SGVpZ2h0O1xuICAgICAgZWxlbS5sYXN0WSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQucGFnZVk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnX3N0b3BTY3JvbGxQcm9wYWdhdGlvbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9zdG9wU2Nyb2xsUHJvcGFnYXRpb24oZXZlbnQpIHtcbiAgICAgIHZhciBlbGVtID0gdGhpczsgLy8gY2FsbGVkIGZyb20gZXZlbnQgaGFuZGxlciBjb250ZXh0IHdpdGggdGhpcyBhcyBlbGVtXG4gICAgICB2YXIgdXAgPSBldmVudC5wYWdlWSA8IGVsZW0ubGFzdFk7XG4gICAgICB2YXIgZG93biA9ICF1cDtcbiAgICAgIGVsZW0ubGFzdFkgPSBldmVudC5wYWdlWTtcblxuICAgICAgaWYgKHVwICYmIGVsZW0uYWxsb3dVcCB8fCBkb3duICYmIGVsZW0uYWxsb3dEb3duKSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPcGVucyB0aGUgb2ZmLWNhbnZhcyBtZW51LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIEV2ZW50IG9iamVjdCBwYXNzZWQgZnJvbSBsaXN0ZW5lci5cbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gdHJpZ2dlciAtIGVsZW1lbnQgdGhhdCB0cmlnZ2VyZWQgdGhlIG9mZi1jYW52YXMgdG8gb3Blbi5cbiAgICAgKiBAZmlyZXMgT2ZmQ2FudmFzI29wZW5lZFxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdvcGVuJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gb3BlbihldmVudCwgdHJpZ2dlcikge1xuICAgICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSB8fCB0aGlzLmlzUmV2ZWFsZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgaWYgKHRyaWdnZXIpIHtcbiAgICAgICAgdGhpcy4kbGFzdFRyaWdnZXIgPSB0cmlnZ2VyO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmZvcmNlVG8gPT09ICd0b3AnKSB7XG4gICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmZvcmNlVG8gPT09ICdib3R0b20nKSB7XG4gICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCBkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudHJhbnNpdGlvblRpbWUgJiYgdGhpcy5vcHRpb25zLnRyYW5zaXRpb24gIT09ICdvdmVybGFwJykge1xuICAgICAgICB0aGlzLiRlbGVtZW50LnNpYmxpbmdzKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJykuY3NzKCd0cmFuc2l0aW9uLWR1cmF0aW9uJywgdGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuc2libGluZ3MoJ1tkYXRhLW9mZi1jYW52YXMtY29udGVudF0nKS5jc3MoJ3RyYW5zaXRpb24tZHVyYXRpb24nLCAnJyk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogRmlyZXMgd2hlbiB0aGUgb2ZmLWNhbnZhcyBtZW51IG9wZW5zLlxuICAgICAgICogQGV2ZW50IE9mZkNhbnZhcyNvcGVuZWRcbiAgICAgICAqL1xuICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnaXMtb3BlbicpLnJlbW92ZUNsYXNzKCdpcy1jbG9zZWQnKTtcblxuICAgICAgdGhpcy4kdHJpZ2dlcnMuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJykudHJpZ2dlcignb3BlbmVkLnpmLm9mZmNhbnZhcycpO1xuXG4gICAgICB0aGlzLiRjb250ZW50LmFkZENsYXNzKCdpcy1vcGVuLScgKyB0aGlzLnBvc2l0aW9uKTtcblxuICAgICAgLy8gSWYgYGNvbnRlbnRTY3JvbGxgIGlzIHNldCB0byBmYWxzZSwgYWRkIGNsYXNzIGFuZCBkaXNhYmxlIHNjcm9sbGluZyBvbiB0b3VjaCBkZXZpY2VzLlxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50U2Nyb2xsID09PSBmYWxzZSkge1xuICAgICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKCdib2R5JykuYWRkQ2xhc3MoJ2lzLW9mZi1jYW52YXMtb3BlbicpLm9uKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsaW5nKTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vbigndG91Y2hzdGFydCcsIHRoaXMuX3JlY29yZFNjcm9sbGFibGUpO1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsUHJvcGFnYXRpb24pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuJG92ZXJsYXkuYWRkQ2xhc3MoJ2lzLXZpc2libGUnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2sgPT09IHRydWUgJiYgdGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuJG92ZXJsYXkuYWRkQ2xhc3MoJ2lzLWNsb3NhYmxlJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b0ZvY3VzID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub25lKF9fd2VicGFja19yZXF1aXJlX18uaShfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzNfX2ZvdW5kYXRpb25fdXRpbF9jb3JlX19bXCJ0cmFuc2l0aW9uZW5kXCJdKSh0aGlzLiRlbGVtZW50KSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmICghX3RoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBleGl0IGlmIHByZW1hdHVyZWx5IGNsb3NlZFxuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgY2FudmFzRm9jdXMgPSBfdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1hdXRvZm9jdXNdJyk7XG4gICAgICAgICAgaWYgKGNhbnZhc0ZvY3VzLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FudmFzRm9jdXMuZXEoMCkuZm9jdXMoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3RoaXMuJGVsZW1lbnQuZmluZCgnYSwgYnV0dG9uJykuZXEoMCkuZm9jdXMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnRyYXBGb2N1cyA9PT0gdHJ1ZSkge1xuICAgICAgICB0aGlzLiRjb250ZW50LmF0dHIoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICAgIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX2tleWJvYXJkX19bXCJLZXlib2FyZFwiXS50cmFwRm9jdXModGhpcy4kZWxlbWVudCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2FkZENvbnRlbnRDbGFzc2VzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvc2VzIHRoZSBvZmYtY2FudmFzIG1lbnUuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSBvcHRpb25hbCBjYiB0byBmaXJlIGFmdGVyIGNsb3N1cmUuXG4gICAgICogQGZpcmVzIE9mZkNhbnZhcyNjbG9zZWRcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnY2xvc2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjbG9zZShjYikge1xuICAgICAgaWYgKCF0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpcy1vcGVuJykgfHwgdGhpcy5pc1JldmVhbGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnaXMtb3BlbicpO1xuXG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKVxuICAgICAgLyoqXG4gICAgICAgKiBGaXJlcyB3aGVuIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbnMuXG4gICAgICAgKiBAZXZlbnQgT2ZmQ2FudmFzI2Nsb3NlZFxuICAgICAgICovXG4gICAgICAudHJpZ2dlcignY2xvc2VkLnpmLm9mZmNhbnZhcycpO1xuXG4gICAgICB0aGlzLiRjb250ZW50LnJlbW92ZUNsYXNzKCdpcy1vcGVuLWxlZnQgaXMtb3Blbi10b3AgaXMtb3Blbi1yaWdodCBpcy1vcGVuLWJvdHRvbScpO1xuXG4gICAgICAvLyBJZiBgY29udGVudFNjcm9sbGAgaXMgc2V0IHRvIGZhbHNlLCByZW1vdmUgY2xhc3MgYW5kIHJlLWVuYWJsZSBzY3JvbGxpbmcgb24gdG91Y2ggZGV2aWNlcy5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudFNjcm9sbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSgnYm9keScpLnJlbW92ZUNsYXNzKCdpcy1vZmYtY2FudmFzLW9wZW4nKS5vZmYoJ3RvdWNobW92ZScsIHRoaXMuX3N0b3BTY3JvbGxpbmcpO1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZigndG91Y2hzdGFydCcsIHRoaXMuX3JlY29yZFNjcm9sbGFibGUpO1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9mZigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbFByb3BhZ2F0aW9uKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgICB0aGlzLiRvdmVybGF5LnJlbW92ZUNsYXNzKCdpcy12aXNpYmxlJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrID09PSB0cnVlICYmIHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgICB0aGlzLiRvdmVybGF5LnJlbW92ZUNsYXNzKCdpcy1jbG9zYWJsZScpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiR0cmlnZ2Vycy5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyk7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudHJhcEZvY3VzID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuJGNvbnRlbnQucmVtb3ZlQXR0cigndGFiaW5kZXgnKTtcbiAgICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfa2V5Ym9hcmRfX1tcIktleWJvYXJkXCJdLnJlbGVhc2VGb2N1cyh0aGlzLiRlbGVtZW50KTtcbiAgICAgIH1cblxuICAgICAgLy8gTGlzdGVuIHRvIHRyYW5zaXRpb25FbmQgYW5kIGFkZCBjbGFzcyB3aGVuIGRvbmUuXG4gICAgICB0aGlzLiRlbGVtZW50Lm9uZShfX3dlYnBhY2tfcmVxdWlyZV9fLmkoX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8zX19mb3VuZGF0aW9uX3V0aWxfY29yZV9fW1widHJhbnNpdGlvbmVuZFwiXSkodGhpcy4kZWxlbWVudCksIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIF90aGlzLiRlbGVtZW50LmFkZENsYXNzKCdpcy1jbG9zZWQnKTtcbiAgICAgICAgX3RoaXMuX3JlbW92ZUNvbnRlbnRDbGFzc2VzKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGVzIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbiBvciBjbG9zZWQuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gRXZlbnQgb2JqZWN0IHBhc3NlZCBmcm9tIGxpc3RlbmVyLlxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSB0cmlnZ2VyIC0gZWxlbWVudCB0aGF0IHRyaWdnZXJlZCB0aGUgb2ZmLWNhbnZhcyB0byBvcGVuLlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICd0b2dnbGUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0b2dnbGUoZXZlbnQsIHRyaWdnZXIpIHtcbiAgICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpcy1vcGVuJykpIHtcbiAgICAgICAgdGhpcy5jbG9zZShldmVudCwgdHJpZ2dlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm9wZW4oZXZlbnQsIHRyaWdnZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXMga2V5Ym9hcmQgaW5wdXQgd2hlbiBkZXRlY3RlZC4gV2hlbiB0aGUgZXNjYXBlIGtleSBpcyBwcmVzc2VkLCB0aGUgb2ZmLWNhbnZhcyBtZW51IGNsb3NlcywgYW5kIGZvY3VzIGlzIHJlc3RvcmVkIHRvIHRoZSBlbGVtZW50IHRoYXQgb3BlbmVkIHRoZSBtZW51LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ19oYW5kbGVLZXlib2FyZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVLZXlib2FyZChlKSB7XG4gICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfa2V5Ym9hcmRfX1tcIktleWJvYXJkXCJdLmhhbmRsZUtleShlLCAnT2ZmQ2FudmFzJywge1xuICAgICAgICBjbG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIF90aGlzNC5jbG9zZSgpO1xuICAgICAgICAgIF90aGlzNC4kbGFzdFRyaWdnZXIuZm9jdXMoKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXN0cm95cyB0aGUgb2ZmY2FudmFzIHBsdWdpbi5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnX2Rlc3Ryb3knLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZGVzdHJveSgpIHtcbiAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYudHJpZ2dlciAuemYub2ZmY2FudmFzJyk7XG4gICAgICB0aGlzLiRvdmVybGF5Lm9mZignLnpmLm9mZmNhbnZhcycpO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBPZmZDYW52YXM7XG59KF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNF9fZm91bmRhdGlvbl9wbHVnaW5fX1tcIlBsdWdpblwiXSk7XG5cbk9mZkNhbnZhcy5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIEFsbG93IHRoZSB1c2VyIHRvIGNsaWNrIG91dHNpZGUgb2YgdGhlIG1lbnUgdG8gY2xvc2UgaXQuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGNsb3NlT25DbGljazogdHJ1ZSxcblxuICAvKipcbiAgICogQWRkcyBhbiBvdmVybGF5IG9uIHRvcCBvZiBgW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XWAuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGNvbnRlbnRPdmVybGF5OiB0cnVlLFxuXG4gIC8qKlxuICAgKiBUYXJnZXQgYW4gb2ZmLWNhbnZhcyBjb250ZW50IGNvbnRhaW5lciBieSBJRCB0aGF0IG1heSBiZSBwbGFjZWQgYW55d2hlcmUuIElmIG51bGwgdGhlIGNsb3Nlc3QgY29udGVudCBjb250YWluZXIgd2lsbCBiZSB0YWtlbi5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7P3N0cmluZ31cbiAgICogQGRlZmF1bHQgbnVsbFxuICAgKi9cbiAgY29udGVudElkOiBudWxsLFxuXG4gIC8qKlxuICAgKiBEZWZpbmUgdGhlIG9mZi1jYW52YXMgZWxlbWVudCBpcyBuZXN0ZWQgaW4gYW4gb2ZmLWNhbnZhcyBjb250ZW50LiBUaGlzIGlzIHJlcXVpcmVkIHdoZW4gdXNpbmcgdGhlIGNvbnRlbnRJZCBvcHRpb24gZm9yIGEgbmVzdGVkIGVsZW1lbnQuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IG51bGxcbiAgICovXG4gIG5lc3RlZDogbnVsbCxcblxuICAvKipcbiAgICogRW5hYmxlL2Rpc2FibGUgc2Nyb2xsaW5nIG9mIHRoZSBtYWluIGNvbnRlbnQgd2hlbiBhbiBvZmYgY2FudmFzIHBhbmVsIGlzIG9wZW4uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGNvbnRlbnRTY3JvbGw6IHRydWUsXG5cbiAgLyoqXG4gICAqIEFtb3VudCBvZiB0aW1lIGluIG1zIHRoZSBvcGVuIGFuZCBjbG9zZSB0cmFuc2l0aW9uIHJlcXVpcmVzLiBJZiBub25lIHNlbGVjdGVkLCBwdWxscyBmcm9tIGJvZHkgc3R5bGUuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGRlZmF1bHQgbnVsbFxuICAgKi9cbiAgdHJhbnNpdGlvblRpbWU6IG51bGwsXG5cbiAgLyoqXG4gICAqIFR5cGUgb2YgdHJhbnNpdGlvbiBmb3IgdGhlIG9mZmNhbnZhcyBtZW51LiBPcHRpb25zIGFyZSAncHVzaCcsICdkZXRhY2hlZCcgb3IgJ3NsaWRlJy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCBwdXNoXG4gICAqL1xuICB0cmFuc2l0aW9uOiAncHVzaCcsXG5cbiAgLyoqXG4gICAqIEZvcmNlIHRoZSBwYWdlIHRvIHNjcm9sbCB0byB0b3Agb3IgYm90dG9tIG9uIG9wZW4uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUgez9zdHJpbmd9XG4gICAqIEBkZWZhdWx0IG51bGxcbiAgICovXG4gIGZvcmNlVG86IG51bGwsXG5cbiAgLyoqXG4gICAqIEFsbG93IHRoZSBvZmZjYW52YXMgdG8gcmVtYWluIG9wZW4gZm9yIGNlcnRhaW4gYnJlYWtwb2ludHMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBpc1JldmVhbGVkOiBmYWxzZSxcblxuICAvKipcbiAgICogQnJlYWtwb2ludCBhdCB3aGljaCB0byByZXZlYWwuIEpTIHdpbGwgdXNlIGEgUmVnRXhwIHRvIHRhcmdldCBzdGFuZGFyZCBjbGFzc2VzLCBpZiBjaGFuZ2luZyBjbGFzc25hbWVzLCBwYXNzIHlvdXIgY2xhc3Mgd2l0aCB0aGUgYHJldmVhbENsYXNzYCBvcHRpb24uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUgez9zdHJpbmd9XG4gICAqIEBkZWZhdWx0IG51bGxcbiAgICovXG4gIHJldmVhbE9uOiBudWxsLFxuXG4gIC8qKlxuICAgKiBGb3JjZSBmb2N1cyB0byB0aGUgb2ZmY2FudmFzIG9uIG9wZW4uIElmIHRydWUsIHdpbGwgZm9jdXMgdGhlIG9wZW5pbmcgdHJpZ2dlciBvbiBjbG9zZS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgYXV0b0ZvY3VzOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBDbGFzcyB1c2VkIHRvIGZvcmNlIGFuIG9mZmNhbnZhcyB0byByZW1haW4gb3Blbi4gRm91bmRhdGlvbiBkZWZhdWx0cyBmb3IgdGhpcyBhcmUgYHJldmVhbC1mb3ItbGFyZ2VgICYgYHJldmVhbC1mb3ItbWVkaXVtYC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCByZXZlYWwtZm9yLVxuICAgKiBAdG9kbyBpbXByb3ZlIHRoZSByZWdleCB0ZXN0aW5nIGZvciB0aGlzLlxuICAgKi9cbiAgcmV2ZWFsQ2xhc3M6ICdyZXZlYWwtZm9yLScsXG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIG9wdGlvbmFsIGZvY3VzIHRyYXBwaW5nIHdoZW4gb3BlbmluZyBhbiBvZmZjYW52YXMuIFNldHMgdGFiaW5kZXggb2YgW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XSB0byAtMSBmb3IgYWNjZXNzaWJpbGl0eSBwdXJwb3Nlcy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHRyYXBGb2N1czogZmFsc2Vcbn07XG5cblxuXG4vKioqLyB9KSxcblxuLyoqKi8gNjpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSB7TWVkaWFRdWVyeTogd2luZG93LkZvdW5kYXRpb24uTWVkaWFRdWVyeX07XG5cbi8qKiovIH0pLFxuXG4vKioqLyA3OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgX193ZWJwYWNrX2V4cG9ydHNfXywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcbi8qIGhhcm1vbnkgZXhwb3J0IChiaW5kaW5nKSAqLyBfX3dlYnBhY2tfcmVxdWlyZV9fLmQoX193ZWJwYWNrX2V4cG9ydHNfXywgXCJhXCIsIGZ1bmN0aW9uKCkgeyByZXR1cm4gVHJpZ2dlcnM7IH0pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfXyA9IF9fd2VicGFja19yZXF1aXJlX18oMCk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLm4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fdXRpbF9tb3Rpb25fXyA9IF9fd2VicGFja19yZXF1aXJlX18oNCk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfbW90aW9uX19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fdXRpbF9tb3Rpb25fXyk7XG5cblxuXG5cblxudmFyIE11dGF0aW9uT2JzZXJ2ZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBwcmVmaXhlcyA9IFsnV2ViS2l0JywgJ01veicsICdPJywgJ01zJywgJyddO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHByZWZpeGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHByZWZpeGVzW2ldICsgJ011dGF0aW9uT2JzZXJ2ZXInIGluIHdpbmRvdykge1xuICAgICAgcmV0dXJuIHdpbmRvd1twcmVmaXhlc1tpXSArICdNdXRhdGlvbk9ic2VydmVyJ107XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn0oKTtcblxudmFyIHRyaWdnZXJzID0gZnVuY3Rpb24gKGVsLCB0eXBlKSB7XG4gIGVsLmRhdGEodHlwZSkuc3BsaXQoJyAnKS5mb3JFYWNoKGZ1bmN0aW9uIChpZCkge1xuICAgIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkoJyMnICsgaWQpW3R5cGUgPT09ICdjbG9zZScgPyAndHJpZ2dlcicgOiAndHJpZ2dlckhhbmRsZXInXSh0eXBlICsgJy56Zi50cmlnZ2VyJywgW2VsXSk7XG4gIH0pO1xufTtcblxudmFyIFRyaWdnZXJzID0ge1xuICBMaXN0ZW5lcnM6IHtcbiAgICBCYXNpYzoge30sXG4gICAgR2xvYmFsOiB7fVxuICB9LFxuICBJbml0aWFsaXplcnM6IHt9XG59O1xuXG5UcmlnZ2Vycy5MaXN0ZW5lcnMuQmFzaWMgPSB7XG4gIG9wZW5MaXN0ZW5lcjogZnVuY3Rpb24gKCkge1xuICAgIHRyaWdnZXJzKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcyksICdvcGVuJyk7XG4gIH0sXG4gIGNsb3NlTGlzdGVuZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaWQgPSBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHRoaXMpLmRhdGEoJ2Nsb3NlJyk7XG4gICAgaWYgKGlkKSB7XG4gICAgICB0cmlnZ2VycyhfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHRoaXMpLCAnY2xvc2UnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh0aGlzKS50cmlnZ2VyKCdjbG9zZS56Zi50cmlnZ2VyJyk7XG4gICAgfVxuICB9LFxuICB0b2dnbGVMaXN0ZW5lcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBpZCA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcykuZGF0YSgndG9nZ2xlJyk7XG4gICAgaWYgKGlkKSB7XG4gICAgICB0cmlnZ2VycyhfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHRoaXMpLCAndG9nZ2xlJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcykudHJpZ2dlcigndG9nZ2xlLnpmLnRyaWdnZXInKTtcbiAgICB9XG4gIH0sXG4gIGNsb3NlYWJsZUxpc3RlbmVyOiBmdW5jdGlvbiAoZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgdmFyIGFuaW1hdGlvbiA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcykuZGF0YSgnY2xvc2FibGUnKTtcblxuICAgIGlmIChhbmltYXRpb24gIT09ICcnKSB7XG4gICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fdXRpbF9tb3Rpb25fX1tcIk1vdGlvblwiXS5hbmltYXRlT3V0KF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcyksIGFuaW1hdGlvbiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHRoaXMpLnRyaWdnZXIoJ2Nsb3NlZC56ZicpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcykuZmFkZU91dCgpLnRyaWdnZXIoJ2Nsb3NlZC56ZicpO1xuICAgIH1cbiAgfSxcbiAgdG9nZ2xlRm9jdXNMaXN0ZW5lcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBpZCA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcykuZGF0YSgndG9nZ2xlLWZvY3VzJyk7XG4gICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSgnIycgKyBpZCkudHJpZ2dlckhhbmRsZXIoJ3RvZ2dsZS56Zi50cmlnZ2VyJywgW19fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcyldKTtcbiAgfVxufTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1vcGVuXSB3aWxsIHJldmVhbCBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cblRyaWdnZXJzLkluaXRpYWxpemVycy5hZGRPcGVuTGlzdGVuZXIgPSBmdW5jdGlvbiAoJGVsZW0pIHtcbiAgJGVsZW0ub2ZmKCdjbGljay56Zi50cmlnZ2VyJywgVHJpZ2dlcnMuTGlzdGVuZXJzLkJhc2ljLm9wZW5MaXN0ZW5lcik7XG4gICRlbGVtLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLW9wZW5dJywgVHJpZ2dlcnMuTGlzdGVuZXJzLkJhc2ljLm9wZW5MaXN0ZW5lcik7XG59O1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLWNsb3NlXSB3aWxsIGNsb3NlIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuLy8gSWYgdXNlZCB3aXRob3V0IGEgdmFsdWUgb24gW2RhdGEtY2xvc2VdLCB0aGUgZXZlbnQgd2lsbCBidWJibGUsIGFsbG93aW5nIGl0IHRvIGNsb3NlIGEgcGFyZW50IGNvbXBvbmVudC5cblRyaWdnZXJzLkluaXRpYWxpemVycy5hZGRDbG9zZUxpc3RlbmVyID0gZnVuY3Rpb24gKCRlbGVtKSB7XG4gICRlbGVtLm9mZignY2xpY2suemYudHJpZ2dlcicsIFRyaWdnZXJzLkxpc3RlbmVycy5CYXNpYy5jbG9zZUxpc3RlbmVyKTtcbiAgJGVsZW0ub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtY2xvc2VdJywgVHJpZ2dlcnMuTGlzdGVuZXJzLkJhc2ljLmNsb3NlTGlzdGVuZXIpO1xufTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS10b2dnbGVdIHdpbGwgdG9nZ2xlIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuVHJpZ2dlcnMuSW5pdGlhbGl6ZXJzLmFkZFRvZ2dsZUxpc3RlbmVyID0gZnVuY3Rpb24gKCRlbGVtKSB7XG4gICRlbGVtLm9mZignY2xpY2suemYudHJpZ2dlcicsIFRyaWdnZXJzLkxpc3RlbmVycy5CYXNpYy50b2dnbGVMaXN0ZW5lcik7XG4gICRlbGVtLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLXRvZ2dsZV0nLCBUcmlnZ2Vycy5MaXN0ZW5lcnMuQmFzaWMudG9nZ2xlTGlzdGVuZXIpO1xufTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1jbG9zYWJsZV0gd2lsbCByZXNwb25kIHRvIGNsb3NlLnpmLnRyaWdnZXIgZXZlbnRzLlxuVHJpZ2dlcnMuSW5pdGlhbGl6ZXJzLmFkZENsb3NlYWJsZUxpc3RlbmVyID0gZnVuY3Rpb24gKCRlbGVtKSB7XG4gICRlbGVtLm9mZignY2xvc2UuemYudHJpZ2dlcicsIFRyaWdnZXJzLkxpc3RlbmVycy5CYXNpYy5jbG9zZWFibGVMaXN0ZW5lcik7XG4gICRlbGVtLm9uKCdjbG9zZS56Zi50cmlnZ2VyJywgJ1tkYXRhLWNsb3NlYWJsZV0sIFtkYXRhLWNsb3NhYmxlXScsIFRyaWdnZXJzLkxpc3RlbmVycy5CYXNpYy5jbG9zZWFibGVMaXN0ZW5lcik7XG59O1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLXRvZ2dsZS1mb2N1c10gd2lsbCByZXNwb25kIHRvIGNvbWluZyBpbiBhbmQgb3V0IG9mIGZvY3VzXG5UcmlnZ2Vycy5Jbml0aWFsaXplcnMuYWRkVG9nZ2xlRm9jdXNMaXN0ZW5lciA9IGZ1bmN0aW9uICgkZWxlbSkge1xuICAkZWxlbS5vZmYoJ2ZvY3VzLnpmLnRyaWdnZXIgYmx1ci56Zi50cmlnZ2VyJywgVHJpZ2dlcnMuTGlzdGVuZXJzLkJhc2ljLnRvZ2dsZUZvY3VzTGlzdGVuZXIpO1xuICAkZWxlbS5vbignZm9jdXMuemYudHJpZ2dlciBibHVyLnpmLnRyaWdnZXInLCAnW2RhdGEtdG9nZ2xlLWZvY3VzXScsIFRyaWdnZXJzLkxpc3RlbmVycy5CYXNpYy50b2dnbGVGb2N1c0xpc3RlbmVyKTtcbn07XG5cbi8vIE1vcmUgR2xvYmFsL2NvbXBsZXggbGlzdGVuZXJzIGFuZCB0cmlnZ2Vyc1xuVHJpZ2dlcnMuTGlzdGVuZXJzLkdsb2JhbCA9IHtcbiAgcmVzaXplTGlzdGVuZXI6IGZ1bmN0aW9uICgkbm9kZXMpIHtcbiAgICBpZiAoIU11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgIC8vZmFsbGJhY2sgZm9yIElFIDlcbiAgICAgICRub2Rlcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh0aGlzKS50cmlnZ2VySGFuZGxlcigncmVzaXplbWUuemYudHJpZ2dlcicpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSByZXNpemUgZXZlbnRcbiAgICAkbm9kZXMuYXR0cignZGF0YS1ldmVudHMnLCBcInJlc2l6ZVwiKTtcbiAgfSxcbiAgc2Nyb2xsTGlzdGVuZXI6IGZ1bmN0aW9uICgkbm9kZXMpIHtcbiAgICBpZiAoIU11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgIC8vZmFsbGJhY2sgZm9yIElFIDlcbiAgICAgICRub2Rlcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh0aGlzKS50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSBzY3JvbGwgZXZlbnRcbiAgICAkbm9kZXMuYXR0cignZGF0YS1ldmVudHMnLCBcInNjcm9sbFwiKTtcbiAgfSxcbiAgY2xvc2VNZUxpc3RlbmVyOiBmdW5jdGlvbiAoZSwgcGx1Z2luSWQpIHtcbiAgICB2YXIgcGx1Z2luID0gZS5uYW1lc3BhY2Uuc3BsaXQoJy4nKVswXTtcbiAgICB2YXIgcGx1Z2lucyA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkoJ1tkYXRhLScgKyBwbHVnaW4gKyAnXScpLm5vdCgnW2RhdGEteWV0aS1ib3g9XCInICsgcGx1Z2luSWQgKyAnXCJdJyk7XG5cbiAgICBwbHVnaW5zLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF90aGlzID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh0aGlzKTtcbiAgICAgIF90aGlzLnRyaWdnZXJIYW5kbGVyKCdjbG9zZS56Zi50cmlnZ2VyJywgW190aGlzXSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBHbG9iYWwsIHBhcnNlcyB3aG9sZSBkb2N1bWVudC5cbn07VHJpZ2dlcnMuSW5pdGlhbGl6ZXJzLmFkZENsb3NlbWVMaXN0ZW5lciA9IGZ1bmN0aW9uIChwbHVnaW5OYW1lKSB7XG4gIHZhciB5ZXRpQm94ZXMgPSBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKCdbZGF0YS15ZXRpLWJveF0nKSxcbiAgICAgIHBsdWdOYW1lcyA9IFsnZHJvcGRvd24nLCAndG9vbHRpcCcsICdyZXZlYWwnXTtcblxuICBpZiAocGx1Z2luTmFtZSkge1xuICAgIGlmICh0eXBlb2YgcGx1Z2luTmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHBsdWdOYW1lcy5wdXNoKHBsdWdpbk5hbWUpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHBsdWdpbk5hbWUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwbHVnaW5OYW1lWzBdID09PSAnc3RyaW5nJykge1xuICAgICAgcGx1Z05hbWVzLmNvbmNhdChwbHVnaW5OYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcignUGx1Z2luIG5hbWVzIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH1cbiAgfVxuICBpZiAoeWV0aUJveGVzLmxlbmd0aCkge1xuICAgIHZhciBsaXN0ZW5lcnMgPSBwbHVnTmFtZXMubWFwKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICByZXR1cm4gJ2Nsb3NlbWUuemYuJyArIG5hbWU7XG4gICAgfSkuam9pbignICcpO1xuXG4gICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh3aW5kb3cpLm9mZihsaXN0ZW5lcnMpLm9uKGxpc3RlbmVycywgVHJpZ2dlcnMuTGlzdGVuZXJzLkdsb2JhbC5jbG9zZU1lTGlzdGVuZXIpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBkZWJvdW5jZUdsb2JhbExpc3RlbmVyKGRlYm91bmNlLCB0cmlnZ2VyLCBsaXN0ZW5lcikge1xuICB2YXIgdGltZXIgPSB2b2lkIDAsXG4gICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAzKTtcbiAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh3aW5kb3cpLm9mZih0cmlnZ2VyKS5vbih0cmlnZ2VyLCBmdW5jdGlvbiAoZSkge1xuICAgIGlmICh0aW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB9XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH0sIGRlYm91bmNlIHx8IDEwKTsgLy9kZWZhdWx0IHRpbWUgdG8gZW1pdCBzY3JvbGwgZXZlbnRcbiAgfSk7XG59XG5cblRyaWdnZXJzLkluaXRpYWxpemVycy5hZGRSZXNpemVMaXN0ZW5lciA9IGZ1bmN0aW9uIChkZWJvdW5jZSkge1xuICB2YXIgJG5vZGVzID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSgnW2RhdGEtcmVzaXplXScpO1xuICBpZiAoJG5vZGVzLmxlbmd0aCkge1xuICAgIGRlYm91bmNlR2xvYmFsTGlzdGVuZXIoZGVib3VuY2UsICdyZXNpemUuemYudHJpZ2dlcicsIFRyaWdnZXJzLkxpc3RlbmVycy5HbG9iYWwucmVzaXplTGlzdGVuZXIsICRub2Rlcyk7XG4gIH1cbn07XG5cblRyaWdnZXJzLkluaXRpYWxpemVycy5hZGRTY3JvbGxMaXN0ZW5lciA9IGZ1bmN0aW9uIChkZWJvdW5jZSkge1xuICB2YXIgJG5vZGVzID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSgnW2RhdGEtc2Nyb2xsXScpO1xuICBpZiAoJG5vZGVzLmxlbmd0aCkge1xuICAgIGRlYm91bmNlR2xvYmFsTGlzdGVuZXIoZGVib3VuY2UsICdzY3JvbGwuemYudHJpZ2dlcicsIFRyaWdnZXJzLkxpc3RlbmVycy5HbG9iYWwuc2Nyb2xsTGlzdGVuZXIsICRub2Rlcyk7XG4gIH1cbn07XG5cblRyaWdnZXJzLkluaXRpYWxpemVycy5hZGRNdXRhdGlvbkV2ZW50c0xpc3RlbmVyID0gZnVuY3Rpb24gKCRlbGVtKSB7XG4gIGlmICghTXV0YXRpb25PYnNlcnZlcikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgJG5vZGVzID0gJGVsZW0uZmluZCgnW2RhdGEtcmVzaXplXSwgW2RhdGEtc2Nyb2xsXSwgW2RhdGEtbXV0YXRlXScpO1xuXG4gIC8vZWxlbWVudCBjYWxsYmFja1xuICB2YXIgbGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbiA9IGZ1bmN0aW9uIChtdXRhdGlvblJlY29yZHNMaXN0KSB7XG4gICAgdmFyICR0YXJnZXQgPSBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0udGFyZ2V0KTtcblxuICAgIC8vdHJpZ2dlciB0aGUgZXZlbnQgaGFuZGxlciBmb3IgdGhlIGVsZW1lbnQgZGVwZW5kaW5nIG9uIHR5cGVcbiAgICBzd2l0Y2ggKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0udHlwZSkge1xuICAgICAgY2FzZSBcImF0dHJpYnV0ZXNcIjpcbiAgICAgICAgaWYgKCR0YXJnZXQuYXR0cihcImRhdGEtZXZlbnRzXCIpID09PSBcInNjcm9sbFwiICYmIG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJkYXRhLWV2ZW50c1wiKSB7XG4gICAgICAgICAgJHRhcmdldC50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LCB3aW5kb3cucGFnZVlPZmZzZXRdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoJHRhcmdldC5hdHRyKFwiZGF0YS1ldmVudHNcIikgPT09IFwicmVzaXplXCIgJiYgbXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcImRhdGEtZXZlbnRzXCIpIHtcbiAgICAgICAgICAkdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCdyZXNpemVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXRdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcInN0eWxlXCIpIHtcbiAgICAgICAgICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLCBcIm11dGF0ZVwiKTtcbiAgICAgICAgICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXJIYW5kbGVyKCdtdXRhdGVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIildKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImNoaWxkTGlzdFwiOlxuICAgICAgICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLCBcIm11dGF0ZVwiKTtcbiAgICAgICAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpXSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAvL25vdGhpbmdcbiAgICB9XG4gIH07XG5cbiAgaWYgKCRub2Rlcy5sZW5ndGgpIHtcbiAgICAvL2ZvciBlYWNoIGVsZW1lbnQgdGhhdCBuZWVkcyB0byBsaXN0ZW4gZm9yIHJlc2l6aW5nLCBzY3JvbGxpbmcsIG9yIG11dGF0aW9uIGFkZCBhIHNpbmdsZSBvYnNlcnZlclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDw9ICRub2Rlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgIHZhciBlbGVtZW50T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uKTtcbiAgICAgIGVsZW1lbnRPYnNlcnZlci5vYnNlcnZlKCRub2Rlc1tpXSwgeyBhdHRyaWJ1dGVzOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUsIGNoYXJhY3RlckRhdGE6IGZhbHNlLCBzdWJ0cmVlOiB0cnVlLCBhdHRyaWJ1dGVGaWx0ZXI6IFtcImRhdGEtZXZlbnRzXCIsIFwic3R5bGVcIl0gfSk7XG4gICAgfVxuICB9XG59O1xuXG5UcmlnZ2Vycy5Jbml0aWFsaXplcnMuYWRkU2ltcGxlTGlzdGVuZXJzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgJGRvY3VtZW50ID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKShkb2N1bWVudCk7XG5cbiAgVHJpZ2dlcnMuSW5pdGlhbGl6ZXJzLmFkZE9wZW5MaXN0ZW5lcigkZG9jdW1lbnQpO1xuICBUcmlnZ2Vycy5Jbml0aWFsaXplcnMuYWRkQ2xvc2VMaXN0ZW5lcigkZG9jdW1lbnQpO1xuICBUcmlnZ2Vycy5Jbml0aWFsaXplcnMuYWRkVG9nZ2xlTGlzdGVuZXIoJGRvY3VtZW50KTtcbiAgVHJpZ2dlcnMuSW5pdGlhbGl6ZXJzLmFkZENsb3NlYWJsZUxpc3RlbmVyKCRkb2N1bWVudCk7XG4gIFRyaWdnZXJzLkluaXRpYWxpemVycy5hZGRUb2dnbGVGb2N1c0xpc3RlbmVyKCRkb2N1bWVudCk7XG59O1xuXG5UcmlnZ2Vycy5Jbml0aWFsaXplcnMuYWRkR2xvYmFsTGlzdGVuZXJzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgJGRvY3VtZW50ID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKShkb2N1bWVudCk7XG4gIFRyaWdnZXJzLkluaXRpYWxpemVycy5hZGRNdXRhdGlvbkV2ZW50c0xpc3RlbmVyKCRkb2N1bWVudCk7XG4gIFRyaWdnZXJzLkluaXRpYWxpemVycy5hZGRSZXNpemVMaXN0ZW5lcigpO1xuICBUcmlnZ2Vycy5Jbml0aWFsaXplcnMuYWRkU2Nyb2xsTGlzdGVuZXIoKTtcbiAgVHJpZ2dlcnMuSW5pdGlhbGl6ZXJzLmFkZENsb3NlbWVMaXN0ZW5lcigpO1xufTtcblxuVHJpZ2dlcnMuaW5pdCA9IGZ1bmN0aW9uICgkLCBGb3VuZGF0aW9uKSB7XG4gIGlmICh0eXBlb2YgJC50cmlnZ2Vyc0luaXRpYWxpemVkID09PSAndW5kZWZpbmVkJykge1xuICAgIHZhciAkZG9jdW1lbnQgPSAkKGRvY3VtZW50KTtcblxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIpIHtcbiAgICAgIFRyaWdnZXJzLkluaXRpYWxpemVycy5hZGRTaW1wbGVMaXN0ZW5lcnMoKTtcbiAgICAgIFRyaWdnZXJzLkluaXRpYWxpemVycy5hZGRHbG9iYWxMaXN0ZW5lcnMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJCh3aW5kb3cpLm9uKCdsb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBUcmlnZ2Vycy5Jbml0aWFsaXplcnMuYWRkU2ltcGxlTGlzdGVuZXJzKCk7XG4gICAgICAgIFRyaWdnZXJzLkluaXRpYWxpemVycy5hZGRHbG9iYWxMaXN0ZW5lcnMoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgICQudHJpZ2dlcnNJbml0aWFsaXplZCA9IHRydWU7XG4gIH1cblxuICBpZiAoRm91bmRhdGlvbikge1xuICAgIEZvdW5kYXRpb24uVHJpZ2dlcnMgPSBUcmlnZ2VycztcbiAgICAvLyBMZWdhY3kgaW5jbHVkZWQgdG8gYmUgYmFja3dhcmRzIGNvbXBhdGlibGUgZm9yIG5vdy5cbiAgICBGb3VuZGF0aW9uLklIZWFyWW91ID0gVHJpZ2dlcnMuSW5pdGlhbGl6ZXJzLmFkZEdsb2JhbExpc3RlbmVycztcbiAgfVxufTtcblxuXG5cbi8qKiovIH0pLFxuXG4vKioqLyA4ODpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxubW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDIyKTtcblxuXG4vKioqLyB9KVxuXG4vKioqKioqLyB9KTsiLCIvKioqKioqLyAoZnVuY3Rpb24obW9kdWxlcykgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbi8qKioqKiovIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuLyoqKioqKi8gXHRcdH1cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdGk6IG1vZHVsZUlkLFxuLyoqKioqKi8gXHRcdFx0bDogZmFsc2UsXG4vKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fVxuLyoqKioqKi8gXHRcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuLyoqKioqKi8gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4vKioqKioqLyBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbi8qKioqKiovIFx0fVxuLyoqKioqKi9cbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9ueSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4vKioqKioqLyBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuLyoqKioqKi8gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbi8qKioqKiovIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbi8qKioqKiovIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbi8qKioqKiovIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbi8qKioqKiovIFx0XHRcdH0pO1xuLyoqKioqKi8gXHRcdH1cbi8qKioqKiovIFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuLyoqKioqKi8gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuLyoqKioqKi8gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbi8qKioqKiovIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4vKioqKioqLyBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuLyoqKioqKi8gXHRcdHJldHVybiBnZXR0ZXI7XG4vKioqKioqLyBcdH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA4OSk7XG4vKioqKioqLyB9KVxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovICh7XG5cbi8qKiovIDA6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0galF1ZXJ5O1xuXG4vKioqLyB9KSxcblxuLyoqKi8gMTpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSB7Rm91bmRhdGlvbjogd2luZG93LkZvdW5kYXRpb259O1xuXG4vKioqLyB9KSxcblxuLyoqKi8gMTA6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0ge29uSW1hZ2VzTG9hZGVkOiB3aW5kb3cuRm91bmRhdGlvbi5vbkltYWdlc0xvYWRlZH07XG5cbi8qKiovIH0pLFxuXG4vKioqLyAxMjpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSB7VG91Y2g6IHdpbmRvdy5Gb3VuZGF0aW9uLlRvdWNofTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDI6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0ge1BsdWdpbjogd2luZG93LkZvdW5kYXRpb24uUGx1Z2lufTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDIzOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgX193ZWJwYWNrX2V4cG9ydHNfXywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShfX3dlYnBhY2tfZXhwb3J0c19fLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fX2RlZmF1bHQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLm4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX2NvcmVfXyk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX29yYml0X18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDUzKTtcblxuXG5cbl9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fZm91bmRhdGlvbl9jb3JlX19bXCJGb3VuZGF0aW9uXCJdLnBsdWdpbihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fb3JiaXRfX1tcImFcIiAvKiBPcmJpdCAqL10sICdPcmJpdCcpO1xuXG4vKioqLyB9KSxcblxuLyoqKi8gMzpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSB7cnRsOiB3aW5kb3cuRm91bmRhdGlvbi5ydGwsIEdldFlvRGlnaXRzOiB3aW5kb3cuRm91bmRhdGlvbi5HZXRZb0RpZ2l0cywgdHJhbnNpdGlvbmVuZDogd2luZG93LkZvdW5kYXRpb24udHJhbnNpdGlvbmVuZH07XG5cbi8qKiovIH0pLFxuXG4vKioqLyA0OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtNb3Rpb246IHdpbmRvdy5Gb3VuZGF0aW9uLk1vdGlvbiwgTW92ZTogd2luZG93LkZvdW5kYXRpb24uTW92ZX07XG5cbi8qKiovIH0pLFxuXG4vKioqLyA1OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtLZXlib2FyZDogd2luZG93LkZvdW5kYXRpb24uS2V5Ym9hcmR9O1xuXG4vKioqLyB9KSxcblxuLyoqKi8gNTM6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBfX3dlYnBhY2tfZXhwb3J0c19fLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuLyogaGFybW9ueSBleHBvcnQgKGJpbmRpbmcpICovIF9fd2VicGFja19yZXF1aXJlX18uZChfX3dlYnBhY2tfZXhwb3J0c19fLCBcImFcIiwgZnVuY3Rpb24oKSB7IHJldHVybiBPcmJpdDsgfSk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X18pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX2tleWJvYXJkX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDUpO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX2tleWJvYXJkX19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fdXRpbF9rZXlib2FyZF9fKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzJfX2ZvdW5kYXRpb25fdXRpbF9tb3Rpb25fXyA9IF9fd2VicGFja19yZXF1aXJlX18oNCk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8yX19mb3VuZGF0aW9uX3V0aWxfbW90aW9uX19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzJfX2ZvdW5kYXRpb25fdXRpbF9tb3Rpb25fXyk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8zX19mb3VuZGF0aW9uX3V0aWxfdGltZXJfXyA9IF9fd2VicGFja19yZXF1aXJlX18oNzgpO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfM19fZm91bmRhdGlvbl91dGlsX3RpbWVyX19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzNfX2ZvdW5kYXRpb25fdXRpbF90aW1lcl9fKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzRfX2ZvdW5kYXRpb25fdXRpbF9pbWFnZUxvYWRlcl9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygxMCk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV80X19mb3VuZGF0aW9uX3V0aWxfaW1hZ2VMb2FkZXJfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNF9fZm91bmRhdGlvbl91dGlsX2ltYWdlTG9hZGVyX18pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNV9fZm91bmRhdGlvbl91dGlsX2NvcmVfXyA9IF9fd2VicGFja19yZXF1aXJlX18oMyk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV81X19mb3VuZGF0aW9uX3V0aWxfY29yZV9fX2RlZmF1bHQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLm4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV81X19mb3VuZGF0aW9uX3V0aWxfY29yZV9fKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzZfX2ZvdW5kYXRpb25fcGx1Z2luX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDIpO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNl9fZm91bmRhdGlvbl9wbHVnaW5fX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNl9fZm91bmRhdGlvbl9wbHVnaW5fXyk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV83X19mb3VuZGF0aW9uX3V0aWxfdG91Y2hfXyA9IF9fd2VicGFja19yZXF1aXJlX18oMTIpO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfN19fZm91bmRhdGlvbl91dGlsX3RvdWNoX19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzdfX2ZvdW5kYXRpb25fdXRpbF90b3VjaF9fKTtcblxuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cblxuXG5cblxuXG5cblxuXG5cbi8qKlxuICogT3JiaXQgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLm9yYml0XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvblxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50aW1lclxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5pbWFnZUxvYWRlclxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50b3VjaFxuICovXG5cbnZhciBPcmJpdCA9IGZ1bmN0aW9uIChfUGx1Z2luKSB7XG4gIF9pbmhlcml0cyhPcmJpdCwgX1BsdWdpbik7XG5cbiAgZnVuY3Rpb24gT3JiaXQoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIE9yYml0KTtcblxuICAgIHJldHVybiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoT3JiaXQuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihPcmJpdCkpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE9yYml0LCBbe1xuICAgIGtleTogJ19zZXR1cCcsXG5cbiAgICAvKipcbiAgICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gb3JiaXQgY2Fyb3VzZWwuXG4gICAgKiBAY2xhc3NcbiAgICAqIEBuYW1lIE9yYml0XG4gICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGFuIE9yYml0IENhcm91c2VsLlxuICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXR1cChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICAgIHRoaXMub3B0aW9ucyA9IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0LmEuZXh0ZW5kKHt9LCBPcmJpdC5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuICAgICAgdGhpcy5jbGFzc05hbWUgPSAnT3JiaXQnOyAvLyBpZTkgYmFjayBjb21wYXRcblxuICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV83X19mb3VuZGF0aW9uX3V0aWxfdG91Y2hfX1tcIlRvdWNoXCJdLmluaXQoX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQuYSk7IC8vIFRvdWNoIGluaXQgaXMgaWRlbXBvdGVudCwgd2UganVzdCBuZWVkIHRvIG1ha2Ugc3VyZSBpdCdzIGluaXRpYWxpZWQuXG5cbiAgICAgIHRoaXMuX2luaXQoKTtcblxuICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfa2V5Ym9hcmRfX1tcIktleWJvYXJkXCJdLnJlZ2lzdGVyKCdPcmJpdCcsIHtcbiAgICAgICAgJ2x0cic6IHtcbiAgICAgICAgICAnQVJST1dfUklHSFQnOiAnbmV4dCcsXG4gICAgICAgICAgJ0FSUk9XX0xFRlQnOiAncHJldmlvdXMnXG4gICAgICAgIH0sXG4gICAgICAgICdydGwnOiB7XG4gICAgICAgICAgJ0FSUk9XX0xFRlQnOiAnbmV4dCcsXG4gICAgICAgICAgJ0FSUk9XX1JJR0hUJzogJ3ByZXZpb3VzJ1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAqIEluaXRpYWxpemVzIHRoZSBwbHVnaW4gYnkgY3JlYXRpbmcgalF1ZXJ5IGNvbGxlY3Rpb25zLCBzZXR0aW5nIGF0dHJpYnV0ZXMsIGFuZCBzdGFydGluZyB0aGUgYW5pbWF0aW9uLlxuICAgICogQGZ1bmN0aW9uXG4gICAgKiBAcHJpdmF0ZVxuICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ19pbml0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2luaXQoKSB7XG4gICAgICAvLyBAVE9ETzogY29uc2lkZXIgZGlzY3Vzc2lvbiBvbiBQUiAjOTI3OCBhYm91dCBET00gcG9sbHV0aW9uIGJ5IGNoYW5nZVNsaWRlXG4gICAgICB0aGlzLl9yZXNldCgpO1xuXG4gICAgICB0aGlzLiR3cmFwcGVyID0gdGhpcy4kZWxlbWVudC5maW5kKCcuJyArIHRoaXMub3B0aW9ucy5jb250YWluZXJDbGFzcyk7XG4gICAgICB0aGlzLiRzbGlkZXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy4nICsgdGhpcy5vcHRpb25zLnNsaWRlQ2xhc3MpO1xuXG4gICAgICB2YXIgJGltYWdlcyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnaW1nJyksXG4gICAgICAgICAgaW5pdEFjdGl2ZSA9IHRoaXMuJHNsaWRlcy5maWx0ZXIoJy5pcy1hY3RpdmUnKSxcbiAgICAgICAgICBpZCA9IHRoaXMuJGVsZW1lbnRbMF0uaWQgfHwgX193ZWJwYWNrX3JlcXVpcmVfXy5pKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNV9fZm91bmRhdGlvbl91dGlsX2NvcmVfX1tcIkdldFlvRGlnaXRzXCJdKSg2LCAnb3JiaXQnKTtcblxuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKHtcbiAgICAgICAgJ2RhdGEtcmVzaXplJzogaWQsXG4gICAgICAgICdpZCc6IGlkXG4gICAgICB9KTtcblxuICAgICAgaWYgKCFpbml0QWN0aXZlLmxlbmd0aCkge1xuICAgICAgICB0aGlzLiRzbGlkZXMuZXEoMCkuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy51c2VNVUkpIHtcbiAgICAgICAgdGhpcy4kc2xpZGVzLmFkZENsYXNzKCduby1tb3Rpb251aScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoJGltYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgX193ZWJwYWNrX3JlcXVpcmVfXy5pKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNF9fZm91bmRhdGlvbl91dGlsX2ltYWdlTG9hZGVyX19bXCJvbkltYWdlc0xvYWRlZFwiXSkoJGltYWdlcywgdGhpcy5fcHJlcGFyZUZvck9yYml0LmJpbmQodGhpcykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcHJlcGFyZUZvck9yYml0KCk7IC8vaGVoZVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmJ1bGxldHMpIHtcbiAgICAgICAgdGhpcy5fbG9hZEJ1bGxldHMoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZXZlbnRzKCk7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b1BsYXkgJiYgdGhpcy4kc2xpZGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhpcy5nZW9TeW5jKCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYWNjZXNzaWJsZSkge1xuICAgICAgICAvLyBhbGxvdyB3cmFwcGVyIHRvIGJlIGZvY3VzYWJsZSB0byBlbmFibGUgYXJyb3cgbmF2aWdhdGlvblxuICAgICAgICB0aGlzLiR3cmFwcGVyLmF0dHIoJ3RhYmluZGV4JywgMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgKiBDcmVhdGVzIGEgalF1ZXJ5IGNvbGxlY3Rpb24gb2YgYnVsbGV0cywgaWYgdGhleSBhcmUgYmVpbmcgdXNlZC5cbiAgICAqIEBmdW5jdGlvblxuICAgICogQHByaXZhdGVcbiAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdfbG9hZEJ1bGxldHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfbG9hZEJ1bGxldHMoKSB7XG4gICAgICB0aGlzLiRidWxsZXRzID0gdGhpcy4kZWxlbWVudC5maW5kKCcuJyArIHRoaXMub3B0aW9ucy5ib3hPZkJ1bGxldHMpLmZpbmQoJ2J1dHRvbicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICogU2V0cyBhIGB0aW1lcmAgb2JqZWN0IG9uIHRoZSBvcmJpdCwgYW5kIHN0YXJ0cyB0aGUgY291bnRlciBmb3IgdGhlIG5leHQgc2xpZGUuXG4gICAgKiBAZnVuY3Rpb25cbiAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdnZW9TeW5jJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2VvU3luYygpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICB0aGlzLnRpbWVyID0gbmV3IF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfM19fZm91bmRhdGlvbl91dGlsX3RpbWVyX19bXCJUaW1lclwiXSh0aGlzLiRlbGVtZW50LCB7XG4gICAgICAgIGR1cmF0aW9uOiB0aGlzLm9wdGlvbnMudGltZXJEZWxheSxcbiAgICAgICAgaW5maW5pdGU6IGZhbHNlXG4gICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIF90aGlzLmNoYW5nZVNsaWRlKHRydWUpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLnRpbWVyLnN0YXJ0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgKiBTZXRzIHdyYXBwZXIgYW5kIHNsaWRlIGhlaWdodHMgZm9yIHRoZSBvcmJpdC5cbiAgICAqIEBmdW5jdGlvblxuICAgICogQHByaXZhdGVcbiAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdfcHJlcGFyZUZvck9yYml0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3ByZXBhcmVGb3JPcmJpdCgpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICB0aGlzLl9zZXRXcmFwcGVySGVpZ2h0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgKiBDYWx1bGF0ZXMgdGhlIGhlaWdodCBvZiBlYWNoIHNsaWRlIGluIHRoZSBjb2xsZWN0aW9uLCBhbmQgdXNlcyB0aGUgdGFsbGVzdCBvbmUgZm9yIHRoZSB3cmFwcGVyIGhlaWdodC5cbiAgICAqIEBmdW5jdGlvblxuICAgICogQHByaXZhdGVcbiAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gYSBjYWxsYmFjayBmdW5jdGlvbiB0byBmaXJlIHdoZW4gY29tcGxldGUuXG4gICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnX3NldFdyYXBwZXJIZWlnaHQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfc2V0V3JhcHBlckhlaWdodChjYikge1xuICAgICAgLy9yZXdyaXRlIHRoaXMgdG8gYGZvcmAgbG9vcFxuICAgICAgdmFyIG1heCA9IDAsXG4gICAgICAgICAgdGVtcCxcbiAgICAgICAgICBjb3VudGVyID0gMCxcbiAgICAgICAgICBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHRoaXMuJHNsaWRlcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGVtcCA9IHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHRoaXMpLmF0dHIoJ2RhdGEtc2xpZGUnLCBjb3VudGVyKTtcblxuICAgICAgICBpZiAoIS9tdWkvZy50ZXN0KF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcylbMF0uY2xhc3NOYW1lKSAmJiBfdGhpcy4kc2xpZGVzLmZpbHRlcignLmlzLWFjdGl2ZScpWzBdICE9PSBfdGhpcy4kc2xpZGVzLmVxKGNvdW50ZXIpWzBdKSB7XG4gICAgICAgICAgLy9pZiBub3QgdGhlIGFjdGl2ZSBzbGlkZSwgc2V0IGNzcyBwb3NpdGlvbiBhbmQgZGlzcGxheSBwcm9wZXJ0eVxuICAgICAgICAgIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkodGhpcykuY3NzKHsgJ3Bvc2l0aW9uJzogJ3JlbGF0aXZlJywgJ2Rpc3BsYXknOiAnbm9uZScgfSk7XG4gICAgICAgIH1cbiAgICAgICAgbWF4ID0gdGVtcCA+IG1heCA/IHRlbXAgOiBtYXg7XG4gICAgICAgIGNvdW50ZXIrKztcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoY291bnRlciA9PT0gdGhpcy4kc2xpZGVzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLiR3cmFwcGVyLmNzcyh7ICdoZWlnaHQnOiBtYXggfSk7IC8vb25seSBjaGFuZ2UgdGhlIHdyYXBwZXIgaGVpZ2h0IHByb3BlcnR5IG9uY2UuXG4gICAgICAgIGlmIChjYikge1xuICAgICAgICAgIGNiKG1heCk7XG4gICAgICAgIH0gLy9maXJlIGNhbGxiYWNrIHdpdGggbWF4IGhlaWdodCBkaW1lbnNpb24uXG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgKiBTZXRzIHRoZSBtYXgtaGVpZ2h0IG9mIGVhY2ggc2xpZGUuXG4gICAgKiBAZnVuY3Rpb25cbiAgICAqIEBwcml2YXRlXG4gICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnX3NldFNsaWRlSGVpZ2h0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3NldFNsaWRlSGVpZ2h0KGhlaWdodCkge1xuICAgICAgdGhpcy4kc2xpZGVzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHRoaXMpLmNzcygnbWF4LWhlaWdodCcsIGhlaWdodCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIGJhc2ljYWxseSBldmVyeXRoaW5nIHdpdGhpbiB0aGUgZWxlbWVudC5cbiAgICAqIEBmdW5jdGlvblxuICAgICogQHByaXZhdGVcbiAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdfZXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2V2ZW50cygpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIC8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyoqTm93IHVzaW5nIGN1c3RvbSBldmVudCAtIHRoYW5rcyB0bzoqKlxuICAgICAgLy8qKiAgICAgIFlvaGFpIEFyYXJhdCBvZiBUb3JvbnRvICAgICAgKipcbiAgICAgIC8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvL1xuICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJy5yZXNpemVtZS56Zi50cmlnZ2VyJykub24oe1xuICAgICAgICAncmVzaXplbWUuemYudHJpZ2dlcic6IHRoaXMuX3ByZXBhcmVGb3JPcmJpdC5iaW5kKHRoaXMpXG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLiRzbGlkZXMubGVuZ3RoID4gMSkge1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3dpcGUpIHtcbiAgICAgICAgICB0aGlzLiRzbGlkZXMub2ZmKCdzd2lwZWxlZnQuemYub3JiaXQgc3dpcGVyaWdodC56Zi5vcmJpdCcpLm9uKCdzd2lwZWxlZnQuemYub3JiaXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgX3RoaXMuY2hhbmdlU2xpZGUodHJ1ZSk7XG4gICAgICAgICAgfSkub24oJ3N3aXBlcmlnaHQuemYub3JiaXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgX3RoaXMuY2hhbmdlU2xpZGUoZmFsc2UpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvUGxheSkge1xuICAgICAgICAgIHRoaXMuJHNsaWRlcy5vbignY2xpY2suemYub3JiaXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy4kZWxlbWVudC5kYXRhKCdjbGlja2VkT24nLCBfdGhpcy4kZWxlbWVudC5kYXRhKCdjbGlja2VkT24nKSA/IGZhbHNlIDogdHJ1ZSk7XG4gICAgICAgICAgICBfdGhpcy50aW1lcltfdGhpcy4kZWxlbWVudC5kYXRhKCdjbGlja2VkT24nKSA/ICdwYXVzZScgOiAnc3RhcnQnXSgpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wYXVzZU9uSG92ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQub24oJ21vdXNlZW50ZXIuemYub3JiaXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIF90aGlzLnRpbWVyLnBhdXNlKCk7XG4gICAgICAgICAgICB9KS5vbignbW91c2VsZWF2ZS56Zi5vcmJpdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgaWYgKCFfdGhpcy4kZWxlbWVudC5kYXRhKCdjbGlja2VkT24nKSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnRpbWVyLnN0YXJ0KCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMubmF2QnV0dG9ucykge1xuICAgICAgICAgIHZhciAkY29udHJvbHMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy4nICsgdGhpcy5vcHRpb25zLm5leHRDbGFzcyArICcsIC4nICsgdGhpcy5vcHRpb25zLnByZXZDbGFzcyk7XG4gICAgICAgICAgJGNvbnRyb2xzLmF0dHIoJ3RhYmluZGV4JywgMClcbiAgICAgICAgICAvL2Fsc28gbmVlZCB0byBoYW5kbGUgZW50ZXIvcmV0dXJuIGFuZCBzcGFjZWJhciBrZXkgcHJlc3Nlc1xuICAgICAgICAgIC5vbignY2xpY2suemYub3JiaXQgdG91Y2hlbmQuemYub3JiaXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgX3RoaXMuY2hhbmdlU2xpZGUoX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh0aGlzKS5oYXNDbGFzcyhfdGhpcy5vcHRpb25zLm5leHRDbGFzcykpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5idWxsZXRzKSB7XG4gICAgICAgICAgdGhpcy4kYnVsbGV0cy5vbignY2xpY2suemYub3JiaXQgdG91Y2hlbmQuemYub3JiaXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoL2lzLWFjdGl2ZS9nLnRlc3QodGhpcy5jbGFzc05hbWUpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0gLy9pZiB0aGlzIGlzIGFjdGl2ZSwga2ljayBvdXQgb2YgZnVuY3Rpb24uXG4gICAgICAgICAgICB2YXIgaWR4ID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKSh0aGlzKS5kYXRhKCdzbGlkZScpLFxuICAgICAgICAgICAgICAgIGx0ciA9IGlkeCA+IF90aGlzLiRzbGlkZXMuZmlsdGVyKCcuaXMtYWN0aXZlJykuZGF0YSgnc2xpZGUnKSxcbiAgICAgICAgICAgICAgICAkc2xpZGUgPSBfdGhpcy4kc2xpZGVzLmVxKGlkeCk7XG5cbiAgICAgICAgICAgIF90aGlzLmNoYW5nZVNsaWRlKGx0ciwgJHNsaWRlLCBpZHgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hY2Nlc3NpYmxlKSB7XG4gICAgICAgICAgdGhpcy4kd3JhcHBlci5hZGQodGhpcy4kYnVsbGV0cykub24oJ2tleWRvd24uemYub3JiaXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgLy8gaGFuZGxlIGtleWJvYXJkIGV2ZW50IHdpdGgga2V5Ym9hcmQgdXRpbFxuICAgICAgICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfa2V5Ym9hcmRfX1tcIktleWJvYXJkXCJdLmhhbmRsZUtleShlLCAnT3JiaXQnLCB7XG4gICAgICAgICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5jaGFuZ2VTbGlkZSh0cnVlKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcHJldmlvdXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5jaGFuZ2VTbGlkZShmYWxzZSk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiBidWxsZXQgaXMgZm9jdXNlZCwgbWFrZSBzdXJlIGZvY3VzIG1vdmVzXG4gICAgICAgICAgICAgICAgaWYgKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkoZS50YXJnZXQpLmlzKF90aGlzLiRidWxsZXRzKSkge1xuICAgICAgICAgICAgICAgICAgX3RoaXMuJGJ1bGxldHMuZmlsdGVyKCcuaXMtYWN0aXZlJykuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVzZXRzIE9yYml0IHNvIGl0IGNhbiBiZSByZWluaXRpYWxpemVkXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ19yZXNldCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9yZXNldCgpIHtcbiAgICAgIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIHRoZXJlIGFyZSBubyBzbGlkZXMgKGZpcnN0IHJ1bilcbiAgICAgIGlmICh0eXBlb2YgdGhpcy4kc2xpZGVzID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuJHNsaWRlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgIC8vIFJlbW92ZSBvbGQgZXZlbnRzXG4gICAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYub3JiaXQnKS5maW5kKCcqJykub2ZmKCcuemYub3JiaXQnKTtcblxuICAgICAgICAvLyBSZXN0YXJ0IHRpbWVyIGlmIGF1dG9QbGF5IGlzIGVuYWJsZWRcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvUGxheSkge1xuICAgICAgICAgIHRoaXMudGltZXIucmVzdGFydCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzZXQgYWxsIHNsaWRkZXNcbiAgICAgICAgdGhpcy4kc2xpZGVzLmVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKShlbCkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1hY3RpdmUgaXMtaW4nKS5yZW1vdmVBdHRyKCdhcmlhLWxpdmUnKS5oaWRlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFNob3cgdGhlIGZpcnN0IHNsaWRlXG4gICAgICAgIHRoaXMuJHNsaWRlcy5maXJzdCgpLmFkZENsYXNzKCdpcy1hY3RpdmUnKS5zaG93KCk7XG5cbiAgICAgICAgLy8gVHJpZ2dlcnMgd2hlbiB0aGUgc2xpZGUgaGFzIGZpbmlzaGVkIGFuaW1hdGluZ1xuICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3NsaWRlY2hhbmdlLnpmLm9yYml0JywgW3RoaXMuJHNsaWRlcy5maXJzdCgpXSk7XG5cbiAgICAgICAgLy8gU2VsZWN0IGZpcnN0IGJ1bGxldCBpZiBidWxsZXRzIGFyZSBwcmVzZW50XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYnVsbGV0cykge1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZUJ1bGxldHMoMCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAqIENoYW5nZXMgdGhlIGN1cnJlbnQgc2xpZGUgdG8gYSBuZXcgb25lLlxuICAgICogQGZ1bmN0aW9uXG4gICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzTFRSIC0gZmxhZyBpZiB0aGUgc2xpZGUgc2hvdWxkIG1vdmUgbGVmdCB0byByaWdodC5cbiAgICAqIEBwYXJhbSB7alF1ZXJ5fSBjaG9zZW5TbGlkZSAtIHRoZSBqUXVlcnkgZWxlbWVudCBvZiB0aGUgc2xpZGUgdG8gc2hvdyBuZXh0LCBpZiBvbmUgaXMgc2VsZWN0ZWQuXG4gICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gdGhlIGluZGV4IG9mIHRoZSBuZXcgc2xpZGUgaW4gaXRzIGNvbGxlY3Rpb24sIGlmIG9uZSBjaG9zZW4uXG4gICAgKiBAZmlyZXMgT3JiaXQjc2xpZGVjaGFuZ2VcbiAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdjaGFuZ2VTbGlkZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNoYW5nZVNsaWRlKGlzTFRSLCBjaG9zZW5TbGlkZSwgaWR4KSB7XG4gICAgICBpZiAoIXRoaXMuJHNsaWRlcykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9IC8vIERvbid0IGZyZWFrIG91dCBpZiB3ZSdyZSBpbiB0aGUgbWlkZGxlIG9mIGNsZWFudXBcbiAgICAgIHZhciAkY3VyU2xpZGUgPSB0aGlzLiRzbGlkZXMuZmlsdGVyKCcuaXMtYWN0aXZlJykuZXEoMCk7XG5cbiAgICAgIGlmICgvbXVpL2cudGVzdCgkY3VyU2xpZGVbMF0uY2xhc3NOYW1lKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IC8vaWYgdGhlIHNsaWRlIGlzIGN1cnJlbnRseSBhbmltYXRpbmcsIGtpY2sgb3V0IG9mIHRoZSBmdW5jdGlvblxuXG4gICAgICB2YXIgJGZpcnN0U2xpZGUgPSB0aGlzLiRzbGlkZXMuZmlyc3QoKSxcbiAgICAgICAgICAkbGFzdFNsaWRlID0gdGhpcy4kc2xpZGVzLmxhc3QoKSxcbiAgICAgICAgICBkaXJJbiA9IGlzTFRSID8gJ1JpZ2h0JyA6ICdMZWZ0JyxcbiAgICAgICAgICBkaXJPdXQgPSBpc0xUUiA/ICdMZWZ0JyA6ICdSaWdodCcsXG4gICAgICAgICAgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgICRuZXdTbGlkZTtcblxuICAgICAgaWYgKCFjaG9zZW5TbGlkZSkge1xuICAgICAgICAvL21vc3Qgb2YgdGhlIHRpbWUsIHRoaXMgd2lsbCBiZSBhdXRvIHBsYXllZCBvciBjbGlja2VkIGZyb20gdGhlIG5hdkJ1dHRvbnMuXG4gICAgICAgICRuZXdTbGlkZSA9IGlzTFRSID8gLy9pZiB3cmFwcGluZyBlbmFibGVkLCBjaGVjayB0byBzZWUgaWYgdGhlcmUgaXMgYSBgbmV4dGAgb3IgYHByZXZgIHNpYmxpbmcsIGlmIG5vdCwgc2VsZWN0IHRoZSBmaXJzdCBvciBsYXN0IHNsaWRlIHRvIGZpbGwgaW4uIGlmIHdyYXBwaW5nIG5vdCBlbmFibGVkLCBhdHRlbXB0IHRvIHNlbGVjdCBgbmV4dGAgb3IgYHByZXZgLCBpZiB0aGVyZSdzIG5vdGhpbmcgdGhlcmUsIHRoZSBmdW5jdGlvbiB3aWxsIGtpY2sgb3V0IG9uIG5leHQgc3RlcC4gQ1JBWlkgTkVTVEVEIFRFUk5BUklFUyEhISEhXG4gICAgICAgIHRoaXMub3B0aW9ucy5pbmZpbml0ZVdyYXAgPyAkY3VyU2xpZGUubmV4dCgnLicgKyB0aGlzLm9wdGlvbnMuc2xpZGVDbGFzcykubGVuZ3RoID8gJGN1clNsaWRlLm5leHQoJy4nICsgdGhpcy5vcHRpb25zLnNsaWRlQ2xhc3MpIDogJGZpcnN0U2xpZGUgOiAkY3VyU2xpZGUubmV4dCgnLicgKyB0aGlzLm9wdGlvbnMuc2xpZGVDbGFzcykgOiAvL3BpY2sgbmV4dCBzbGlkZSBpZiBtb3ZpbmcgbGVmdCB0byByaWdodFxuICAgICAgICB0aGlzLm9wdGlvbnMuaW5maW5pdGVXcmFwID8gJGN1clNsaWRlLnByZXYoJy4nICsgdGhpcy5vcHRpb25zLnNsaWRlQ2xhc3MpLmxlbmd0aCA/ICRjdXJTbGlkZS5wcmV2KCcuJyArIHRoaXMub3B0aW9ucy5zbGlkZUNsYXNzKSA6ICRsYXN0U2xpZGUgOiAkY3VyU2xpZGUucHJldignLicgKyB0aGlzLm9wdGlvbnMuc2xpZGVDbGFzcyk7IC8vcGljayBwcmV2IHNsaWRlIGlmIG1vdmluZyByaWdodCB0byBsZWZ0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkbmV3U2xpZGUgPSBjaG9zZW5TbGlkZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCRuZXdTbGlkZS5sZW5ndGgpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICogVHJpZ2dlcnMgYmVmb3JlIHRoZSBuZXh0IHNsaWRlIHN0YXJ0cyBhbmltYXRpbmcgaW4gYW5kIG9ubHkgaWYgYSBuZXh0IHNsaWRlIGhhcyBiZWVuIGZvdW5kLlxuICAgICAgICAqIEBldmVudCBPcmJpdCNiZWZvcmVzbGlkZWNoYW5nZVxuICAgICAgICAqL1xuICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2JlZm9yZXNsaWRlY2hhbmdlLnpmLm9yYml0JywgWyRjdXJTbGlkZSwgJG5ld1NsaWRlXSk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5idWxsZXRzKSB7XG4gICAgICAgICAgaWR4ID0gaWR4IHx8IHRoaXMuJHNsaWRlcy5pbmRleCgkbmV3U2xpZGUpOyAvL2dyYWIgaW5kZXggdG8gdXBkYXRlIGJ1bGxldHNcbiAgICAgICAgICB0aGlzLl91cGRhdGVCdWxsZXRzKGlkeCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnVzZU1VSSAmJiAhdGhpcy4kZWxlbWVudC5pcygnOmhpZGRlbicpKSB7XG4gICAgICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8yX19mb3VuZGF0aW9uX3V0aWxfbW90aW9uX19bXCJNb3Rpb25cIl0uYW5pbWF0ZUluKCRuZXdTbGlkZS5hZGRDbGFzcygnaXMtYWN0aXZlJykuY3NzKHsgJ3Bvc2l0aW9uJzogJ2Fic29sdXRlJywgJ3RvcCc6IDAgfSksIHRoaXMub3B0aW9uc1snYW5pbUluRnJvbScgKyBkaXJJbl0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRuZXdTbGlkZS5jc3MoeyAncG9zaXRpb24nOiAncmVsYXRpdmUnLCAnZGlzcGxheSc6ICdibG9jaycgfSkuYXR0cignYXJpYS1saXZlJywgJ3BvbGl0ZScpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8yX19mb3VuZGF0aW9uX3V0aWxfbW90aW9uX19bXCJNb3Rpb25cIl0uYW5pbWF0ZU91dCgkY3VyU2xpZGUucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpLCB0aGlzLm9wdGlvbnNbJ2FuaW1PdXRUbycgKyBkaXJPdXRdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkY3VyU2xpZGUucmVtb3ZlQXR0cignYXJpYS1saXZlJyk7XG4gICAgICAgICAgICBpZiAoX3RoaXMub3B0aW9ucy5hdXRvUGxheSAmJiAhX3RoaXMudGltZXIuaXNQYXVzZWQpIHtcbiAgICAgICAgICAgICAgX3RoaXMudGltZXIucmVzdGFydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9kbyBzdHVmZj9cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkY3VyU2xpZGUucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1pbicpLnJlbW92ZUF0dHIoJ2FyaWEtbGl2ZScpLmhpZGUoKTtcbiAgICAgICAgICAkbmV3U2xpZGUuYWRkQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1pbicpLmF0dHIoJ2FyaWEtbGl2ZScsICdwb2xpdGUnKS5zaG93KCk7XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvUGxheSAmJiAhdGhpcy50aW1lci5pc1BhdXNlZCkge1xuICAgICAgICAgICAgdGhpcy50aW1lci5yZXN0YXJ0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAqIFRyaWdnZXJzIHdoZW4gdGhlIHNsaWRlIGhhcyBmaW5pc2hlZCBhbmltYXRpbmcgaW4uXG4gICAgICAgICogQGV2ZW50IE9yYml0I3NsaWRlY2hhbmdlXG4gICAgICAgICovXG4gICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignc2xpZGVjaGFuZ2UuemYub3JiaXQnLCBbJG5ld1NsaWRlXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgKiBVcGRhdGVzIHRoZSBhY3RpdmUgc3RhdGUgb2YgdGhlIGJ1bGxldHMsIGlmIGRpc3BsYXllZC5cbiAgICAqIEBmdW5jdGlvblxuICAgICogQHByaXZhdGVcbiAgICAqIEBwYXJhbSB7TnVtYmVyfSBpZHggLSB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnQgc2xpZGUuXG4gICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnX3VwZGF0ZUJ1bGxldHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfdXBkYXRlQnVsbGV0cyhpZHgpIHtcbiAgICAgIHZhciAkb2xkQnVsbGV0ID0gdGhpcy4kZWxlbWVudC5maW5kKCcuJyArIHRoaXMub3B0aW9ucy5ib3hPZkJ1bGxldHMpLmZpbmQoJy5pcy1hY3RpdmUnKS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJykuYmx1cigpLFxuICAgICAgICAgIHNwYW4gPSAkb2xkQnVsbGV0LmZpbmQoJ3NwYW46bGFzdCcpLmRldGFjaCgpLFxuICAgICAgICAgICRuZXdCdWxsZXQgPSB0aGlzLiRidWxsZXRzLmVxKGlkeCkuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpLmFwcGVuZChzcGFuKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAqIERlc3Ryb3lzIHRoZSBjYXJvdXNlbCBhbmQgaGlkZXMgdGhlIGVsZW1lbnQuXG4gICAgKiBAZnVuY3Rpb25cbiAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdfZGVzdHJveScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9kZXN0cm95KCkge1xuICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJy56Zi5vcmJpdCcpLmZpbmQoJyonKS5vZmYoJy56Zi5vcmJpdCcpLmVuZCgpLmhpZGUoKTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gT3JiaXQ7XG59KF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNl9fZm91bmRhdGlvbl9wbHVnaW5fX1tcIlBsdWdpblwiXSk7XG5cbk9yYml0LmRlZmF1bHRzID0ge1xuICAvKipcbiAgKiBUZWxscyB0aGUgSlMgdG8gbG9vayBmb3IgYW5kIGxvYWRCdWxsZXRzLlxuICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICogQGRlZmF1bHQgdHJ1ZVxuICAqL1xuICBidWxsZXRzOiB0cnVlLFxuICAvKipcbiAgKiBUZWxscyB0aGUgSlMgdG8gYXBwbHkgZXZlbnQgbGlzdGVuZXJzIHRvIG5hdiBidXR0b25zXG4gICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgKiBAZGVmYXVsdCB0cnVlXG4gICovXG4gIG5hdkJ1dHRvbnM6IHRydWUsXG4gIC8qKlxuICAqIG1vdGlvbi11aSBhbmltYXRpb24gY2xhc3MgdG8gYXBwbHlcbiAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICogQGRlZmF1bHQgJ3NsaWRlLWluLXJpZ2h0J1xuICAqL1xuICBhbmltSW5Gcm9tUmlnaHQ6ICdzbGlkZS1pbi1yaWdodCcsXG4gIC8qKlxuICAqIG1vdGlvbi11aSBhbmltYXRpb24gY2xhc3MgdG8gYXBwbHlcbiAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICogQGRlZmF1bHQgJ3NsaWRlLW91dC1yaWdodCdcbiAgKi9cbiAgYW5pbU91dFRvUmlnaHQ6ICdzbGlkZS1vdXQtcmlnaHQnLFxuICAvKipcbiAgKiBtb3Rpb24tdWkgYW5pbWF0aW9uIGNsYXNzIHRvIGFwcGx5XG4gICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAqIEBkZWZhdWx0ICdzbGlkZS1pbi1sZWZ0J1xuICAqXG4gICovXG4gIGFuaW1JbkZyb21MZWZ0OiAnc2xpZGUtaW4tbGVmdCcsXG4gIC8qKlxuICAqIG1vdGlvbi11aSBhbmltYXRpb24gY2xhc3MgdG8gYXBwbHlcbiAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICogQGRlZmF1bHQgJ3NsaWRlLW91dC1sZWZ0J1xuICAqL1xuICBhbmltT3V0VG9MZWZ0OiAnc2xpZGUtb3V0LWxlZnQnLFxuICAvKipcbiAgKiBBbGxvd3MgT3JiaXQgdG8gYXV0b21hdGljYWxseSBhbmltYXRlIG9uIHBhZ2UgbG9hZC5cbiAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAqIEBkZWZhdWx0IHRydWVcbiAgKi9cbiAgYXV0b1BsYXk6IHRydWUsXG4gIC8qKlxuICAqIEFtb3VudCBvZiB0aW1lLCBpbiBtcywgYmV0d2VlbiBzbGlkZSB0cmFuc2l0aW9uc1xuICAqIEBvcHRpb25cbiAgICogQHR5cGUge251bWJlcn1cbiAgKiBAZGVmYXVsdCA1MDAwXG4gICovXG4gIHRpbWVyRGVsYXk6IDUwMDAsXG4gIC8qKlxuICAqIEFsbG93cyBPcmJpdCB0byBpbmZpbml0ZWx5IGxvb3AgdGhyb3VnaCB0aGUgc2xpZGVzXG4gICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgKiBAZGVmYXVsdCB0cnVlXG4gICovXG4gIGluZmluaXRlV3JhcDogdHJ1ZSxcbiAgLyoqXG4gICogQWxsb3dzIHRoZSBPcmJpdCBzbGlkZXMgdG8gYmluZCB0byBzd2lwZSBldmVudHMgZm9yIG1vYmlsZSwgcmVxdWlyZXMgYW4gYWRkaXRpb25hbCB1dGlsIGxpYnJhcnlcbiAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAqIEBkZWZhdWx0IHRydWVcbiAgKi9cbiAgc3dpcGU6IHRydWUsXG4gIC8qKlxuICAqIEFsbG93cyB0aGUgdGltaW5nIGZ1bmN0aW9uIHRvIHBhdXNlIGFuaW1hdGlvbiBvbiBob3Zlci5cbiAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAqIEBkZWZhdWx0IHRydWVcbiAgKi9cbiAgcGF1c2VPbkhvdmVyOiB0cnVlLFxuICAvKipcbiAgKiBBbGxvd3MgT3JiaXQgdG8gYmluZCBrZXlib2FyZCBldmVudHMgdG8gdGhlIHNsaWRlciwgdG8gYW5pbWF0ZSBmcmFtZXMgd2l0aCBhcnJvdyBrZXlzXG4gICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgKiBAZGVmYXVsdCB0cnVlXG4gICovXG4gIGFjY2Vzc2libGU6IHRydWUsXG4gIC8qKlxuICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGNvbnRhaW5lciBvZiBPcmJpdFxuICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgKiBAZGVmYXVsdCAnb3JiaXQtY29udGFpbmVyJ1xuICAqL1xuICBjb250YWluZXJDbGFzczogJ29yYml0LWNvbnRhaW5lcicsXG4gIC8qKlxuICAqIENsYXNzIGFwcGxpZWQgdG8gaW5kaXZpZHVhbCBzbGlkZXMuXG4gICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAqIEBkZWZhdWx0ICdvcmJpdC1zbGlkZSdcbiAgKi9cbiAgc2xpZGVDbGFzczogJ29yYml0LXNsaWRlJyxcbiAgLyoqXG4gICogQ2xhc3MgYXBwbGllZCB0byB0aGUgYnVsbGV0IGNvbnRhaW5lci4gWW91J3JlIHdlbGNvbWUuXG4gICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAqIEBkZWZhdWx0ICdvcmJpdC1idWxsZXRzJ1xuICAqL1xuICBib3hPZkJ1bGxldHM6ICdvcmJpdC1idWxsZXRzJyxcbiAgLyoqXG4gICogQ2xhc3MgYXBwbGllZCB0byB0aGUgYG5leHRgIG5hdmlnYXRpb24gYnV0dG9uLlxuICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgKiBAZGVmYXVsdCAnb3JiaXQtbmV4dCdcbiAgKi9cbiAgbmV4dENsYXNzOiAnb3JiaXQtbmV4dCcsXG4gIC8qKlxuICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGBwcmV2aW91c2AgbmF2aWdhdGlvbiBidXR0b24uXG4gICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAqIEBkZWZhdWx0ICdvcmJpdC1wcmV2aW91cydcbiAgKi9cbiAgcHJldkNsYXNzOiAnb3JiaXQtcHJldmlvdXMnLFxuICAvKipcbiAgKiBCb29sZWFuIHRvIGZsYWcgdGhlIGpzIHRvIHVzZSBtb3Rpb24gdWkgY2xhc3NlcyBvciBub3QuIERlZmF1bHQgdG8gdHJ1ZSBmb3IgYmFja3dhcmRzIGNvbXBhdGFiaWxpdHkuXG4gICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgKiBAZGVmYXVsdCB0cnVlXG4gICovXG4gIHVzZU1VSTogdHJ1ZVxufTtcblxuXG5cbi8qKiovIH0pLFxuXG4vKioqLyA3ODpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSB7VGltZXI6IHdpbmRvdy5Gb3VuZGF0aW9uLlRpbWVyfTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDg5OlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19yZXF1aXJlX18oMjMpO1xuXG5cbi8qKiovIH0pXG5cbi8qKioqKiovIH0pOyIsIi8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0aTogbW9kdWxlSWQsXG4vKioqKioqLyBcdFx0XHRsOiBmYWxzZSxcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9XG4vKioqKioqLyBcdFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbi8qKioqKiovIFx0XHRtb2R1bGUubCA9IHRydWU7XG4vKioqKioqL1xuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG4vKioqKioqL1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uaSA9IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbi8qKioqKiovIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4vKioqKioqLyBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuLyoqKioqKi8gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuLyoqKioqKi8gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuLyoqKioqKi8gXHRcdFx0XHRnZXQ6IGdldHRlclxuLyoqKioqKi8gXHRcdFx0fSk7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4vKioqKioqLyBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4vKioqKioqLyBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuLyoqKioqKi8gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4vKioqKioqLyBcdFx0cmV0dXJuIGdldHRlcjtcbi8qKioqKiovIFx0fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDkxKTtcbi8qKioqKiovIH0pXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gKHtcblxuLyoqKi8gMDpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSBqUXVlcnk7XG5cbi8qKiovIH0pLFxuXG4vKioqLyAxOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtGb3VuZGF0aW9uOiB3aW5kb3cuRm91bmRhdGlvbn07XG5cbi8qKiovIH0pLFxuXG4vKioqLyAyOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtQbHVnaW46IHdpbmRvdy5Gb3VuZGF0aW9uLlBsdWdpbn07XG5cbi8qKiovIH0pLFxuXG4vKioqLyAyNTpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIF9fd2VicGFja19leHBvcnRzX18sIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoX193ZWJwYWNrX2V4cG9ydHNfXywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX2NvcmVfXyA9IF9fd2VicGFja19yZXF1aXJlX18oMSk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX19mb3VuZGF0aW9uX2NvcmVfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9fZm91bmRhdGlvbl9jb3JlX18pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl9yZXNwb25zaXZlTWVudV9fID0gX193ZWJwYWNrX3JlcXVpcmVfXyg1NSk7XG5cblxuXG5fX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfX2ZvdW5kYXRpb25fY29yZV9fW1wiRm91bmRhdGlvblwiXS5wbHVnaW4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3Jlc3BvbnNpdmVNZW51X19bXCJhXCIgLyogUmVzcG9uc2l2ZU1lbnUgKi9dLCAnUmVzcG9uc2l2ZU1lbnUnKTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDM6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0ge3J0bDogd2luZG93LkZvdW5kYXRpb24ucnRsLCBHZXRZb0RpZ2l0czogd2luZG93LkZvdW5kYXRpb24uR2V0WW9EaWdpdHMsIHRyYW5zaXRpb25lbmQ6IHdpbmRvdy5Gb3VuZGF0aW9uLnRyYW5zaXRpb25lbmR9O1xuXG4vKioqLyB9KSxcblxuLyoqKi8gNTU6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBfX3dlYnBhY2tfZXhwb3J0c19fLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblwidXNlIHN0cmljdFwiO1xuLyogaGFybW9ueSBleHBvcnQgKGJpbmRpbmcpICovIF9fd2VicGFja19yZXF1aXJlX18uZChfX3dlYnBhY2tfZXhwb3J0c19fLCBcImFcIiwgZnVuY3Rpb24oKSB7IHJldHVybiBSZXNwb25zaXZlTWVudTsgfSk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X18pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMV9fZm91bmRhdGlvbl91dGlsX21lZGlhUXVlcnlfXyA9IF9fd2VicGFja19yZXF1aXJlX18oNik7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfbWVkaWFRdWVyeV9fX2RlZmF1bHQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLm4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfbWVkaWFRdWVyeV9fKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzJfX2ZvdW5kYXRpb25fdXRpbF9jb3JlX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDMpO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMl9fZm91bmRhdGlvbl91dGlsX2NvcmVfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMl9fZm91bmRhdGlvbl91dGlsX2NvcmVfXyk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8zX19mb3VuZGF0aW9uX3BsdWdpbl9fID0gX193ZWJwYWNrX3JlcXVpcmVfXygyKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzNfX2ZvdW5kYXRpb25fcGx1Z2luX19fZGVmYXVsdCA9IF9fd2VicGFja19yZXF1aXJlX18ubihfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzNfX2ZvdW5kYXRpb25fcGx1Z2luX18pO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNF9fZm91bmRhdGlvbl9kcm9wZG93bk1lbnVfXyA9IF9fd2VicGFja19yZXF1aXJlX18oNzUpO1xuLyogaGFybW9ueSBpbXBvcnQgKi8gdmFyIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNF9fZm91bmRhdGlvbl9kcm9wZG93bk1lbnVfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNF9fZm91bmRhdGlvbl9kcm9wZG93bk1lbnVfXyk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV81X19mb3VuZGF0aW9uX2RyaWxsZG93bl9fID0gX193ZWJwYWNrX3JlcXVpcmVfXyg3NCk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV81X19mb3VuZGF0aW9uX2RyaWxsZG93bl9fX2RlZmF1bHQgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLm4oX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV81X19mb3VuZGF0aW9uX2RyaWxsZG93bl9fKTtcbi8qIGhhcm1vbnkgaW1wb3J0ICovIHZhciBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzZfX2ZvdW5kYXRpb25fYWNjb3JkaW9uTWVudV9fID0gX193ZWJwYWNrX3JlcXVpcmVfXyg3Myk7XG4vKiBoYXJtb255IGltcG9ydCAqLyB2YXIgX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV82X19mb3VuZGF0aW9uX2FjY29yZGlvbk1lbnVfX19kZWZhdWx0ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5uKF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfNl9fZm91bmRhdGlvbl9hY2NvcmRpb25NZW51X18pO1xuXG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxuXG5cblxuXG5cblxuXG5cblxuXG52YXIgTWVudVBsdWdpbnMgPSB7XG4gIGRyb3Bkb3duOiB7XG4gICAgY3NzQ2xhc3M6ICdkcm9wZG93bicsXG4gICAgcGx1Z2luOiBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzRfX2ZvdW5kYXRpb25fZHJvcGRvd25NZW51X19bXCJEcm9wZG93bk1lbnVcIl1cbiAgfSxcbiAgZHJpbGxkb3duOiB7XG4gICAgY3NzQ2xhc3M6ICdkcmlsbGRvd24nLFxuICAgIHBsdWdpbjogX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV81X19mb3VuZGF0aW9uX2RyaWxsZG93bl9fW1wiRHJpbGxkb3duXCJdXG4gIH0sXG4gIGFjY29yZGlvbjoge1xuICAgIGNzc0NsYXNzOiAnYWNjb3JkaW9uLW1lbnUnLFxuICAgIHBsdWdpbjogX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV82X19mb3VuZGF0aW9uX2FjY29yZGlvbk1lbnVfX1tcIkFjY29yZGlvbk1lbnVcIl1cbiAgfVxufTtcblxuLy8gaW1wb3J0IFwiZm91bmRhdGlvbi51dGlsLnRyaWdnZXJzLmpzXCI7XG5cblxuLyoqXG4gKiBSZXNwb25zaXZlTWVudSBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ucmVzcG9uc2l2ZU1lbnVcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeVxuICovXG5cbnZhciBSZXNwb25zaXZlTWVudSA9IGZ1bmN0aW9uIChfUGx1Z2luKSB7XG4gIF9pbmhlcml0cyhSZXNwb25zaXZlTWVudSwgX1BsdWdpbik7XG5cbiAgZnVuY3Rpb24gUmVzcG9uc2l2ZU1lbnUoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFJlc3BvbnNpdmVNZW51KTtcblxuICAgIHJldHVybiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCAoUmVzcG9uc2l2ZU1lbnUuX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihSZXNwb25zaXZlTWVudSkpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKFJlc3BvbnNpdmVNZW51LCBbe1xuICAgIGtleTogJ19zZXR1cCcsXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGEgcmVzcG9uc2l2ZSBtZW51LlxuICAgICAqIEBjbGFzc1xuICAgICAqIEBuYW1lIFJlc3BvbnNpdmVNZW51XG4gICAgICogQGZpcmVzIFJlc3BvbnNpdmVNZW51I2luaXRcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGEgZHJvcGRvd24gbWVudS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAgICovXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9zZXR1cChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgICB0aGlzLiRlbGVtZW50ID0gX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8wX2pxdWVyeV9fX2RlZmF1bHQoKShlbGVtZW50KTtcbiAgICAgIHRoaXMucnVsZXMgPSB0aGlzLiRlbGVtZW50LmRhdGEoJ3Jlc3BvbnNpdmUtbWVudScpO1xuICAgICAgdGhpcy5jdXJyZW50TXEgPSBudWxsO1xuICAgICAgdGhpcy5jdXJyZW50UGx1Z2luID0gbnVsbDtcbiAgICAgIHRoaXMuY2xhc3NOYW1lID0gJ1Jlc3BvbnNpdmVNZW51JzsgLy8gaWU5IGJhY2sgY29tcGF0XG5cbiAgICAgIHRoaXMuX2luaXQoKTtcbiAgICAgIHRoaXMuX2V2ZW50cygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBNZW51IGJ5IHBhcnNpbmcgdGhlIGNsYXNzZXMgZnJvbSB0aGUgJ2RhdGEtUmVzcG9uc2l2ZU1lbnUnIGF0dHJpYnV0ZSBvbiB0aGUgZWxlbWVudC5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdfaW5pdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9pbml0KCkge1xuXG4gICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzFfX2ZvdW5kYXRpb25fdXRpbF9tZWRpYVF1ZXJ5X19bXCJNZWRpYVF1ZXJ5XCJdLl9pbml0KCk7XG4gICAgICAvLyBUaGUgZmlyc3QgdGltZSBhbiBJbnRlcmNoYW5nZSBwbHVnaW4gaXMgaW5pdGlhbGl6ZWQsIHRoaXMucnVsZXMgaXMgY29udmVydGVkIGZyb20gYSBzdHJpbmcgb2YgXCJjbGFzc2VzXCIgdG8gYW4gb2JqZWN0IG9mIHJ1bGVzXG4gICAgICBpZiAodHlwZW9mIHRoaXMucnVsZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHZhciBydWxlc1RyZWUgPSB7fTtcblxuICAgICAgICAvLyBQYXJzZSBydWxlcyBmcm9tIFwiY2xhc3Nlc1wiIHB1bGxlZCBmcm9tIGRhdGEgYXR0cmlidXRlXG4gICAgICAgIHZhciBydWxlcyA9IHRoaXMucnVsZXMuc3BsaXQoJyAnKTtcblxuICAgICAgICAvLyBJdGVyYXRlIHRocm91Z2ggZXZlcnkgcnVsZSBmb3VuZFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIHJ1bGUgPSBydWxlc1tpXS5zcGxpdCgnLScpO1xuICAgICAgICAgIHZhciBydWxlU2l6ZSA9IHJ1bGUubGVuZ3RoID4gMSA/IHJ1bGVbMF0gOiAnc21hbGwnO1xuICAgICAgICAgIHZhciBydWxlUGx1Z2luID0gcnVsZS5sZW5ndGggPiAxID8gcnVsZVsxXSA6IHJ1bGVbMF07XG5cbiAgICAgICAgICBpZiAoTWVudVBsdWdpbnNbcnVsZVBsdWdpbl0gIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJ1bGVzVHJlZVtydWxlU2l6ZV0gPSBNZW51UGx1Z2luc1tydWxlUGx1Z2luXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJ1bGVzID0gcnVsZXNUcmVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIV9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0LmEuaXNFbXB0eU9iamVjdCh0aGlzLnJ1bGVzKSkge1xuICAgICAgICB0aGlzLl9jaGVja01lZGlhUXVlcmllcygpO1xuICAgICAgfVxuICAgICAgLy8gQWRkIGRhdGEtbXV0YXRlIHNpbmNlIGNoaWxkcmVuIG1heSBuZWVkIGl0LlxuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdkYXRhLW11dGF0ZScsIHRoaXMuJGVsZW1lbnQuYXR0cignZGF0YS1tdXRhdGUnKSB8fCBfX3dlYnBhY2tfcmVxdWlyZV9fLmkoX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8yX19mb3VuZGF0aW9uX3V0aWxfY29yZV9fW1wiR2V0WW9EaWdpdHNcIl0pKDYsICdyZXNwb25zaXZlLW1lbnUnKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgZXZlbnRzIGZvciB0aGUgTWVudS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdfZXZlbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2V2ZW50cygpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0KCkod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgZnVuY3Rpb24gKCkge1xuICAgICAgICBfdGhpcy5fY2hlY2tNZWRpYVF1ZXJpZXMoKTtcbiAgICAgIH0pO1xuICAgICAgLy8gJCh3aW5kb3cpLm9uKCdyZXNpemUuemYuUmVzcG9uc2l2ZU1lbnUnLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vICAgX3RoaXMuX2NoZWNrTWVkaWFRdWVyaWVzKCk7XG4gICAgICAvLyB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgdGhlIGN1cnJlbnQgc2NyZWVuIHdpZHRoIGFnYWluc3QgYXZhaWxhYmxlIG1lZGlhIHF1ZXJpZXMuIElmIHRoZSBtZWRpYSBxdWVyeSBoYXMgY2hhbmdlZCwgYW5kIHRoZSBwbHVnaW4gbmVlZGVkIGhhcyBjaGFuZ2VkLCB0aGUgcGx1Z2lucyB3aWxsIHN3YXAgb3V0LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ19jaGVja01lZGlhUXVlcmllcycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9jaGVja01lZGlhUXVlcmllcygpIHtcbiAgICAgIHZhciBtYXRjaGVkTXEsXG4gICAgICAgICAgX3RoaXMgPSB0aGlzO1xuICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggcnVsZSBhbmQgZmluZCB0aGUgbGFzdCBtYXRjaGluZyBydWxlXG4gICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdC5hLmVhY2godGhpcy5ydWxlcywgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpZiAoX19XRUJQQUNLX0lNUE9SVEVEX01PRFVMRV8xX19mb3VuZGF0aW9uX3V0aWxfbWVkaWFRdWVyeV9fW1wiTWVkaWFRdWVyeVwiXS5hdExlYXN0KGtleSkpIHtcbiAgICAgICAgICBtYXRjaGVkTXEgPSBrZXk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBObyBtYXRjaD8gTm8gZGljZVxuICAgICAgaWYgKCFtYXRjaGVkTXEpIHJldHVybjtcblxuICAgICAgLy8gUGx1Z2luIGFscmVhZHkgaW5pdGlhbGl6ZWQ/IFdlIGdvb2RcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRQbHVnaW4gaW5zdGFuY2VvZiB0aGlzLnJ1bGVzW21hdGNoZWRNcV0ucGx1Z2luKSByZXR1cm47XG5cbiAgICAgIC8vIFJlbW92ZSBleGlzdGluZyBwbHVnaW4tc3BlY2lmaWMgQ1NTIGNsYXNzZXNcbiAgICAgIF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfMF9qcXVlcnlfX19kZWZhdWx0LmEuZWFjaChNZW51UGx1Z2lucywgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgX3RoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3ModmFsdWUuY3NzQ2xhc3MpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEFkZCB0aGUgQ1NTIGNsYXNzIGZvciB0aGUgbmV3IHBsdWdpblxuICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcyh0aGlzLnJ1bGVzW21hdGNoZWRNcV0uY3NzQ2xhc3MpO1xuXG4gICAgICAvLyBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgdGhlIG5ldyBwbHVnaW5cbiAgICAgIGlmICh0aGlzLmN1cnJlbnRQbHVnaW4pIHRoaXMuY3VycmVudFBsdWdpbi5kZXN0cm95KCk7XG4gICAgICB0aGlzLmN1cnJlbnRQbHVnaW4gPSBuZXcgdGhpcy5ydWxlc1ttYXRjaGVkTXFdLnBsdWdpbih0aGlzLiRlbGVtZW50LCB7fSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVzdHJveXMgdGhlIGluc3RhbmNlIG9mIHRoZSBjdXJyZW50IHBsdWdpbiBvbiB0aGlzIGVsZW1lbnQsIGFzIHdlbGwgYXMgdGhlIHdpbmRvdyByZXNpemUgaGFuZGxlciB0aGF0IHN3aXRjaGVzIHRoZSBwbHVnaW5zIG91dC5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnX2Rlc3Ryb3knLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZGVzdHJveSgpIHtcbiAgICAgIHRoaXMuY3VycmVudFBsdWdpbi5kZXN0cm95KCk7XG4gICAgICBfX1dFQlBBQ0tfSU1QT1JURURfTU9EVUxFXzBfanF1ZXJ5X19fZGVmYXVsdCgpKHdpbmRvdykub2ZmKCcuemYuUmVzcG9uc2l2ZU1lbnUnKTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gUmVzcG9uc2l2ZU1lbnU7XG59KF9fV0VCUEFDS19JTVBPUlRFRF9NT0RVTEVfM19fZm91bmRhdGlvbl9wbHVnaW5fX1tcIlBsdWdpblwiXSk7XG5cblJlc3BvbnNpdmVNZW51LmRlZmF1bHRzID0ge307XG5cblxuXG4vKioqLyB9KSxcblxuLyoqKi8gNjpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSB7TWVkaWFRdWVyeTogd2luZG93LkZvdW5kYXRpb24uTWVkaWFRdWVyeX07XG5cbi8qKiovIH0pLFxuXG4vKioqLyA3Mzpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSB7QWNjb3JkaW9uTWVudTogd2luZG93LkZvdW5kYXRpb24uQWNjb3JkaW9uTWVudX07XG5cbi8qKiovIH0pLFxuXG4vKioqLyA3NDpcbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxubW9kdWxlLmV4cG9ydHMgPSB7RHJpbGxkb3duOiB3aW5kb3cuRm91bmRhdGlvbi5EcmlsbGRvd259O1xuXG4vKioqLyB9KSxcblxuLyoqKi8gNzU6XG4vKioqLyAoZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cbm1vZHVsZS5leHBvcnRzID0ge0Ryb3Bkb3duTWVudTogd2luZG93LkZvdW5kYXRpb24uRHJvcGRvd25NZW51fTtcblxuLyoqKi8gfSksXG5cbi8qKiovIDkxOlxuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5tb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19yZXF1aXJlX18oMjUpO1xuXG5cbi8qKiovIH0pXG5cbi8qKioqKiovIH0pOyIsIihmdW5jdGlvbigkKSB7XG4gICAgJChkb2N1bWVudCkuZm91bmRhdGlvbigpO1xufSkoalF1ZXJ5KTtcbiJdfQ==
