/**
 * NVUI核心
 */
var nvui = (function(document, undefined) {
	var readyRE = /complete|loaded|interactive/;
	var idSelectorRE = /^#([\w-]+)$/;
	var classSelectorRE = /^\.([\w-]+)$/;
	var tagSelectorRE = /^[\w-]+$/;
	var translateRE = /translate(?:3d)?\((.+?)\)/;
	var translateMatrixRE = /matrix(3d)?\((.+?)\)/;

	var $ = function(selector, context) {
		context = context || document;
		if (!selector)
			return wrap();
		if (typeof selector === 'object')
			return wrap([selector], null);
		if (typeof selector === 'function')
			return $.ready(selector);
		if (typeof selector === 'string') {
			try {
				selector = selector.trim();
				if (idSelectorRE.test(selector)) {
					var found = document.getElementById(RegExp.$1);
					return wrap(found ? [found] : []);
				}
				return wrap($.qsa(selector, context), selector);
			} catch (e) {}
		}
		return wrap();
	};

	var wrap = function(dom, selector) {
		dom = dom || [];
		Object.setPrototypeOf(dom, $.fn);
		dom.selector = selector || '';

		return dom;
	};

	$.uuid = 0;

	$.data = {};

	/**
	 * from JQuery2
	 */
	$.extend = function() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		if (typeof target === "boolean") {
			deep = target;

			target = arguments[i] || {};
			i++;
		}

		if (typeof target !== "object" && !$.isFunction(target)) {
			target = {};
		}

		if (i === length) {
			target = this;
			i--;
		}

		for (; i < length; i++) {
			if ((options = arguments[i]) != null) {
				for (name in options) {
					src = target[name];
					copy = options[name];

					if (target === copy) {
						continue;
					}

					if (deep && copy && ($.isPlainObject(copy) || (copyIsArray = $.isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && $.isArray(src) ? src : [];

						} else {
							clone = src && $.isPlainObject(src) ? src : {};
						}

						target[name] = $.extend(deep, clone, copy);

					} else if (copy !== undefined) {
						target[name] = copy;
					}
				}
			}
		}

		return target;
	};
	/**
	 * nvui noop(function)
	 */
	$.noop = function() {};
	/**
	 * nvui slice(array)
	 */
	$.slice = [].slice;
	/**
	 * nvui filter(array)
	 */
	$.filter = [].filter;

	$.type = function(obj) {
		return obj == null ? String(obj) : class2type[{}.toString.call(obj)] || "object";
	};
	/**
	 * nvui isArray
	 */
	$.isArray = Array.isArray ||
		function(object) {
			return object instanceof Array;
		};
	/**
	 * nvui isWindow(需考虑obj为undefined的情况)
	 */
	$.isWindow = function(obj) {
		return obj != null && obj === obj.window;
	};
	/**
	 * nvui isObject
	 */
	$.isObject = function(obj) {
		return $.type(obj) === "object";
	};
	/**
	 * nvui isPlainObject
	 */
	$.isPlainObject = function(obj) {
		return $.isObject(obj) && !$.isWindow(obj) && Object.getPrototypeOf(obj) === Object.prototype;
	};
	/**
	 * nvui isEmptyObject
	 * @param {Object} o
	 */
	$.isEmptyObject = function(o) {
		for (var p in o) {
			if (p !== undefined) {
				return false;
			}
		}
		return true;
	};
	/**
	 * nvui isFunction
	 */
	$.isFunction = function(value) {
		return $.type(value) === "function";
	};
	/**
	 * nvui querySelectorAll
	 * @param {type} selector
	 * @param {type} context
	 * @returns {Array}
	 */
	$.qsa = function(selector, context) {
		context = context || document;
		return $.slice.call(classSelectorRE.test(selector) ? context.getElementsByClassName(RegExp.$1) : tagSelectorRE.test(selector) ? context.getElementsByTagName(selector) : context.querySelectorAll(selector));
	};
	/**
	 * ready(DOMContentLoaded)
	 * @param {type} callback
	 * @returns $
	 */
	$.ready = function(callback) {
		if (readyRE.test(document.readyState)) {
			callback($);
		} else {
			document.addEventListener('DOMContentLoaded', function() {
				callback($);
			}, false);
		}
		return this;
	};
	/**
	 * map
	 */
	$.map = function(elements, callback) {
		var value, values = [],
			i, key;
		if (typeof elements.length === 'number') { //TODO 此处逻辑不严谨，可能会有Object:{a:'b',length:1}的情况未处理
			for (i = 0, len = elements.length; i < len; i++) {
				value = callback(elements[i], i);
				if (value != null) values.push(value);
			}
		} else {
			for (key in elements) {
				value = callback(elements[key], key);
				if (value != null) values.push(value);
			}
		}
		return values.length > 0 ? [].concat.apply([], values) : values;
	};
	/**
	 * each
	 * @param {type} elements
	 * @param {type} callback
	 * @returns {$}
	 */
	$.each = function(elements, callback, hasOwnProperty) {
		if (!elements) {
			return this;
		}
		if (typeof elements.length === 'number') {
			[].every.call(elements, function(el, idx) {
				return callback.call(el, idx, el) !== false;
			});
		} else {
			for (var key in elements) {
				if (hasOwnProperty) {
					if (elements.hasOwnProperty(key)) {
						if (callback.call(elements[key], key, elements[key]) === false) return elements;
					}
				} else {
					if (callback.call(elements[key], key, elements[key]) === false) return elements;
				}
			}
		}
		return this;
	};
	$.focus = function(element) {
		if ($.os.ios) {
			setTimeout(function() {
				element.focus();
			}, 10);
		} else {
			element.focus();
		}
	};
	/**
	 * trigger event
	 * @param {type} element
	 * @param {type} eventType
	 * @param {type} eventData
	 * @returns {_L8.$}
	 */
	$.trigger = function(element, eventType, eventData) {
		element.dispatchEvent(new CustomEvent(eventType, {
			detail: eventData,
			bubbles: true,
			cancelable: true
		}));
		return this;
	};
	/**
	 * getStyles
	 * @param {type} element
	 * @param {type} property
	 * @returns {styles}
	 */
	$.getStyles = function(element, property) {
		var styles = element.ownerDocument.defaultView.getComputedStyle(element, null);
		if (property) {
			return styles.getPropertyValue(property) || styles[property];
		}
		return styles;
	};
	/**
	 * parseTranslate
	 * @param {type} translateString
	 * @param {type} position
	 * @returns {Object}
	 */
	$.parseTranslate = function(translateString, position) {
		var result = translateString.match(translateRE || '');
		if (!result || !result[1]) {
			result = ['', '0,0,0'];
		}
		result = result[1].split(",");
		result = {
			x: parseFloat(result[0]),
			y: parseFloat(result[1]),
			z: parseFloat(result[2])
		};
		if (position && result.hasOwnProperty(position)) {
			return result[position];
		}
		return result;
	};
	/**
	 * parseTranslateMatrix
	 * @param {type} translateString
	 * @param {type} position
	 * @returns {Object}
	 */
	$.parseTranslateMatrix = function(translateString, position) {
		var matrix = translateString.match(translateMatrixRE);
		var is3D = matrix && matrix[1];
		if (matrix) {
			matrix = matrix[2].split(",");
			if (is3D === "3d")
				matrix = matrix.slice(12, 15);
			else {
				matrix.push(0);
				matrix = matrix.slice(4, 7);
			}
		} else {
			matrix = [0, 0, 0];
		}
		var result = {
			x: parseFloat(matrix[0]),
			y: parseFloat(matrix[1]),
			z: parseFloat(matrix[2])
		};
		if (position && result.hasOwnProperty(position)) {
			return result[position];
		}
		return result;
	};

	$.registerHandler = function(type, handler) {
		var handlers = $[type];
		if (!handlers) {
			handlers = [];
		}
		handler.index = handler.index || 1000;
		handlers.push(handler);
		handlers.sort(function(a, b) {
			return a.index - b.index;
		});
		$[type] = handlers;
		return $[type];
	};
	/**
	 * setTimeout封装
	 * @param {Object} fn
	 * @param {Object} when
	 * @param {Object} context
	 * @param {Object} data
	 */
	$.later = function(fn, when, context, data) {
		when = when || 0;
		var m = fn;
		var d = data;
		var f;
		var r;

		if (typeof fn === 'string') {
			m = context[fn];
		}

		f = function() {
			m.apply(context, $.isArray(d) ? d : [d]);
		};

		r = setTimeout(f, when);

		return {
			id: r,
			cancel: function() {
				clearTimeout(r);
			}
		};
	};
	$.now = Date.now || function() {
		return +new Date();
	};
	var class2type = {};
	$.each(['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error'], function(i, name) {
		class2type["[object " + name + "]"] = name.toLowerCase();
	});
	if (window.JSON) {
		$.parseJSON = JSON.parse;
	}
	/**
	 * $.fn
	 */
	$.fn = {
		each: function(callback) {
			[].every.call(this, function(el, idx) {
				return callback.call(el, idx, el) !== false;
			});
			return this;
		}
	};

	return $;
})(document);

window.$ = nvui;
/**
 * 修复一些原型支持缺少
 */
(function(undefined) {
	if (String.prototype.trim === undefined) {
		String.prototype.trim = function() {
			return this.replace(/^\s+|\s+$/g, '');
		};
	}
	Object.setPrototypeOf = Object.setPrototypeOf || function(obj, proto) {
		obj['__proto__'] = proto;
		return obj;
	};
})();

/**
 * $.os
 * @param {type} $
 * @returns {undefined}
 */
(function($, window) {
	function detect(ua) {
		this.os = {};
		var funcs = [
			function() { //wechat
				var wechat = ua.match(/(MicroMessenger)\/([\d\.]+)/i);
				if (wechat) { //wechat
					this.os.wechat = {
						version: wechat[2].replace(/_/g, '.')
					};
				}
				return false;
			},
			function() { //android
				var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
				if (android) {
					this.os.android = true;
					this.os.version = android[2];

					this.os.isBadAndroid = !(/Chrome\/\d/.test(window.navigator.appVersion));
				}
				return this.os.android === true;
			},
			function() { //ios
				var iphone = ua.match(/(iPhone\sOS)\s([\d_]+)/);
				if (iphone) { //iphone
					this.os.ios = this.os.iphone = true;
					this.os.version = iphone[2].replace(/_/g, '.');
				} else {
					var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
					if (ipad) { //ipad
						this.os.ios = this.os.ipad = true;
						this.os.version = ipad[2].replace(/_/g, '.');
					}
				}
				return this.os.ios === true;
			}
		];
		[].every.call(funcs, function(func) {
			return !func.call($);
		});
	}
	detect.call($, navigator.userAgent);
})(nvui, window);
/**
 * $.os相关
 */
(function($, document) {
	function detect(ua) {
		this.os = this.os || {};
		var plus = ua.match(/Html5Plus/i); //TODO 5\+Browser?
		if (plus) {
			this.os.plus = true;
			$(function() {
				document.body.classList.add('nvui-plus');
			});
			if (ua.match(/StreamApp/i)) {
				this.os.stream = true;
			}
			$(function() {
				document.body.classList.add('nvui-plus-stream');
			});
		}
	}
	detect.call($, navigator.userAgent);
})(nvui, document);

// /**
//  * nvui target(action>popover>modal>tab>toggle)
//  */
// (function($, window, document) {
// 	/**
// 	 * targets
// 	 */
// 	$.targets = {};
// 	/**
// 	 * target handles
// 	 */
// 	$.targetHandles = [];
// 	/**
// 	 * register target
// 	 * @param {type} target
// 	 * @returns {$.targets}
// 	 */
// 	$.registerTarget = function(target) {
// 		target.index = target.index || 1000;
// 		$.targetHandles.push(target);

// 		$.targetHandles.sort(function(a, b) {
// 			return a.index - b.index;
// 		});

// 		return $.targetHandles;
// 	};
// 	window.addEventListener('touchstart', function(event) {
// 		var target = event.target;
// 		var founds = {};
// 		for (; target && target !== document; target = target.parentNode) {
// 			var isFound = false;
// 			$.each($.targetHandles, function(index, targetHandle) {
// 				var name = targetHandle.name;
// 				if (!isFound && !founds[name] && targetHandle.hasOwnProperty('handle')) {
// 					$.targets[name] = targetHandle.handle(event, target);
// 					if ($.targets[name]) {
// 						founds[name] = true;
// 						if (targetHandle.isContinue !== true) {
// 							isFound = true;
// 						}
// 					}
// 				} else {
// 					if (!founds[name]) {
// 						if (targetHandle.isReset !== false)
// 							$.targets[name] = false;
// 					}
// 				}
// 			});
// 			if (isFound) {
// 				break;
// 			}
// 		}

// 	});
// })(nvui, window, document);

/**
 * fixed CustomEvent
 */
(function() {
	if (typeof window.CustomEvent === 'undefined') {
		function CustomEvent(event, params) {
			params = params || {
				bubbles: false,
				cancelable: false,
				detail: undefined
			};
			var evt = document.createEvent('Events');
			var bubbles = true;
			for (var name in params) {
				(name === 'bubbles') ? (bubbles = !!params[name]) : (evt[name] = params[name]);
			}
			evt.initEvent(event, bubbles, true);
			return evt;
		};
		CustomEvent.prototype = window.Event.prototype;
		window.CustomEvent = CustomEvent;
	}
})();

/**
 * nvui fixed classList
 * @param {type} document
 * @returns {undefined}
 */
(function(document) {
	if (!("classList" in document.documentElement) && Object.defineProperty && typeof HTMLElement !== 'undefined') {
		Object.defineProperty(HTMLElement.prototype, 'classList', {
			get: function() {
				var self = this;

				function update(fn) {
					return function(value) {
						var classes = self.className.split(/\s+/),
							index = classes.indexOf(value);

						fn(classes, index, value);
						self.className = classes.join(" ");
					};
				}

				var ret = {
					add: update(function(classes, index, value) {
						~index || classes.push(value);
					}),
					remove: update(function(classes, index) {
						~index && classes.splice(index, 1);
					}),
					toggle: update(function(classes, index, value) {
						~index ? classes.splice(index, 1) : classes.push(value);
					}),
					contains: function(value) {
						return !!~self.className.split(/\s+/).indexOf(value);
					},
					item: function(i) {
						return self.className.split(/\s+/)[i] || null;
					}
				};

				Object.defineProperty(ret, 'length', {
					get: function() {
						return self.className.split(/\s+/).length;
					}
				});

				return ret;
			}
		});
	}
})(document);

/**
 * mui fixed requestAnimationFrame
 * @param {type} window
 * @returns {undefined}
 */
(function(window) {
	if (!window.requestAnimationFrame) {
		var lastTime = 0;
		window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
				var id = window.setTimeout(function() {
					callback(currTime + timeToCall);
				}, timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		window.cancelAnimationFrame = window.webkitCancelAnimationFrame ||
			window.mozCancelRequestAnimationFrame ||
			window.mskitCancelRequestAnimationFrame ||
			function(id) {
				clearTimeout(id);
			};
	};
}(window));

// /**
//  * fastclick(only for radio,checkbox)
//  */
// (function($, window, name) {
// 	if (window.FastClick) {
// 		return;
// 	}

// 	var handle = function(event, target) {
// 		if (target.tagName === 'LABEL') {
// 			if (target.parentNode) {
// 				target = target.parentNode.querySelector('input');
// 			}
// 		}
// 		if (target && (target.type === 'radio' || target.type === 'checkbox')) {
// 			if (!target.disabled) { //disabled
// 				return target;
// 			}
// 		}
// 		return false;
// 	};

// 	$.registerTarget({
// 		name: name,
// 		index: 40,
// 		handle: handle,
// 		target: false
// 	});
// 	var dispatchEvent = function(event) {
// 		var targetElement = $.targets.click;
// 		if (targetElement) {
// 			var clickEvent, touch;
// 			// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect
// 			if (document.activeElement && document.activeElement !== targetElement) {
// 				document.activeElement.blur();
// 			}
// 			touch = event.detail.gesture.changedTouches[0];
// 			// Synthesise a click event, with an extra attribute so it can be tracked
// 			clickEvent = document.createEvent('MouseEvents');
// 			clickEvent.initMouseEvent('click', true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
// 			clickEvent.forwardedTouchEvent = true;
// 			targetElement.dispatchEvent(clickEvent);
// 			event.detail && event.detail.gesture.preventDefault();
// 		}
// 	};
// 	window.addEventListener('tap', dispatchEvent);
// 	window.addEventListener('doubletap', dispatchEvent);
// 	//捕获
// 	window.addEventListener('click', function(event) {
// 		if ($.targets.click) {
// 			if (!event.forwardedTouchEvent) { //stop click
// 				if (event.stopImmediatePropagation) {
// 					event.stopImmediatePropagation();
// 				} else {
// 					// Part of the hack for browsers that don't support Event#stopImmediatePropagation
// 					event.propagationStopped = true;
// 				}
// 				event.stopPropagation();
// 				event.preventDefault();
// 				return false;
// 			}
// 		}
// 	}, true);

// })(mui, window, 'click');

// (function($, document) {
// 	$(function() {
// 		if (!$.os.ios) {
// 			return;
// 		}
// 		var CLASS_FOCUSIN = 'mui-focusin';
// 		var CLASS_BAR_TAB = 'mui-bar-tab';
// 		var CLASS_BAR_FOOTER = 'mui-bar-footer';
// 		var CLASS_BAR_FOOTER_SECONDARY = 'mui-bar-footer-secondary';
// 		var CLASS_BAR_FOOTER_SECONDARY_TAB = 'mui-bar-footer-secondary-tab';
// 		// var content = document.querySelector('.' + CLASS_CONTENT);
// 		// if (content) {
// 		// 	document.body.insertBefore(content, document.body.firstElementChild);
// 		// }
// 		document.addEventListener('focusin', function(e) {
// 			if ($.os.plus) { //在父webview里边不fix
// 				if (window.plus) {
// 					if (plus.webview.currentWebview().children().length > 0) {
// 						return;
// 					}
// 				}
// 			}
// 			var target = e.target;
// 			if (target.tagName && target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'search' || target.type === 'number')) {
// 				if (target.disabled || target.readOnly) {
// 					return;
// 				}
// 				document.body.classList.add(CLASS_FOCUSIN);
// 				var isFooter = false;
// 				for (; target && target !== document; target = target.parentNode) {
// 					var classList = target.classList;
// 					if (classList && classList.contains(CLASS_BAR_TAB) || classList.contains(CLASS_BAR_FOOTER) || classList.contains(CLASS_BAR_FOOTER_SECONDARY) || classList.contains(CLASS_BAR_FOOTER_SECONDARY_TAB)) {
// 						isFooter = true;
// 						break;
// 					}
// 				}
// 				if (isFooter) {
// 					var scrollTop = document.body.scrollHeight;
// 					var scrollLeft = document.body.scrollLeft;
// 					setTimeout(function() {
// 						window.scrollTo(scrollLeft, scrollTop);
// 					}, 20);
// 				}
// 			}
// 		});
// 		document.addEventListener('focusout', function(e) {
// 			var classList = document.body.classList;
// 			if (classList.contains(CLASS_FOCUSIN)) {
// 				classList.remove(CLASS_FOCUSIN);
// 				setTimeout(function() {
// 					window.scrollTo(document.body.scrollLeft, document.body.scrollTop);
// 				}, 20);
// 			}
// 		});
// 	});
// })(mui, document);

// /**
//  * mui namespace(optimization)
//  * @param {type} $
//  * @returns {undefined}
//  */
// (function($) {
// 	$.namespace = 'nvui';
// 	$.classNamePrefix = $.namespace + '-';
// 	$.classSelectorPrefix = '.' + $.classNamePrefix;
// 	/**
// 	 * 返回正确的className
// 	 * @param {type} className
// 	 * @returns {String}
// 	 */
// 	$.className = function(className) {
// 		return $.classNamePrefix + className;
// 	};
// 	*
// 	 * 返回正确的classSelector
// 	 * @param {type} classSelector
// 	 * @returns {String}
//	 */
// 	$.classSelector = function(classSelector) {
// 		return classSelector.replace(/\./g, $.classSelectorPrefix);
// 	};
// 	/**
// 	 * 返回正确的eventName
// 	 * @param {type} event
// 	 * @param {type} module
// 	 * @returns {String}
// 	 */
// 	$.eventName = function(event, module) {
// 		return event + ($.namespace ? ('.' + $.namespace) : '') + (module ? ('.' + module) : '');
// 	};
// })(nvui);
// /**
//  * 仅提供简单的on，off(仅支持事件委托，不支持当前元素绑定，当前元素绑定请直接使用addEventListener,removeEventListener)
//  * @param {Object} $
//  */
// (function($) {

// 	var _mid = 1;
// 	var delegates = {};
// 	//需要wrap的函数
// 	var eventMethods = {
// 		preventDefault: 'isDefaultPrevented',
// 		stopImmediatePropagation: 'isImmediatePropagationStopped',
// 		stopPropagation: 'isPropagationStopped'
// 	};
// 	//默认true返回函数
// 	var returnTrue = function() {
// 		return true
// 	};
// 	//默认false返回函数
// 	var returnFalse = function() {
// 		return false
// 	};
// 	//wrap浏览器事件
// 	var compatible = function(event, target) {
// 		if (!event.detail) {
// 			event.detail = {
// 				currentTarget: target
// 			};
// 		} else {
// 			event.detail.currentTarget = target;
// 		}
// 		$.each(eventMethods, function(name, predicate) {
// 			var sourceMethod = event[name];
// 			event[name] = function() {
// 				this[predicate] = returnTrue;
// 				return sourceMethod && sourceMethod.apply(event, arguments)
// 			}
// 			event[predicate] = returnFalse;
// 		}, true);
// 		return event;
// 	};
// 	//简单的wrap对象_mid
// 	var mid = function(obj) {
// 		return obj && (obj._mid || (obj._mid = _mid++));
// 	};
// 	//事件委托对象绑定的事件回调列表
// 	var delegateFns = {};
// 	//返回事件委托的wrap事件回调
// 	var delegateFn = function(element, event, selector, callback) {
// 		return function(e) {
// 			//same event
// 			var callbackObjs = delegates[element._mid][event];
// 			var handlerQueue = [];
// 			var target = e.target;
// 			var selectorAlls = {};
// 			for (; target && target !== document; target = target.parentNode) {
// 				if (target === element) {
// 					break;
// 				}
// 				if (~['click', 'tap', 'doubletap', 'longtap', 'hold'].indexOf(event) && (target.disabled || target.classList.contains('mui-disabled'))) {
// 					break;
// 				}
// 				var matches = {};
// 				$.each(callbackObjs, function(selector, callbacks) { //same selector
// 					selectorAlls[selector] || (selectorAlls[selector] = $.qsa(selector, element));
// 					if (selectorAlls[selector] && ~(selectorAlls[selector]).indexOf(target)) {
// 						if (!matches[selector]) {
// 							matches[selector] = callbacks;
// 						}
// 					}
// 				}, true);
// 				if (!$.isEmptyObject(matches)) {
// 					handlerQueue.push({
// 						element: target,
// 						handlers: matches
// 					});
// 				}
// 			}
// 			selectorAlls = null;
// 			e = compatible(e); //compatible event
// 			$.each(handlerQueue, function(index, handler) {
// 				target = handler.element;
// 				var tagName = target.tagName;
// 				if (event === 'tap' && (tagName !== 'INPUT' && tagName !== 'TEXTAREA' && tagName !== 'SELECT')) {
// 					e.preventDefault();
// 					e.detail && e.detail.gesture && e.detail.gesture.preventDefault();
// 				}
// 				$.each(handler.handlers, function(index, handler) {
// 					$.each(handler, function(index, callback) {
// 						if (callback.call(target, e) === false) {
// 							e.preventDefault();
// 							e.stopPropagation();
// 						}
// 					}, true);
// 				}, true)
// 				if (e.isPropagationStopped()) {
// 					return false;
// 				}
// 			}, true);
// 		};
// 	};
// 	var preventDefaultException = /^(INPUT|TEXTAREA|BUTTON|SELECT)$/;
// 	/**
// 	 * mui delegate events
// 	 * @param {type} event
// 	 * @param {type} selector
// 	 * @param {type} callback
// 	 * @returns {undefined}
// 	 */
// 	$.fn.on = function(event, selector, callback) { //仅支持简单的事件委托,主要是tap事件使用，类似mouse,focus之类暂不封装支持
// 		return this.each(function() {
// 			var element = this;
// 			mid(element);
// 			mid(callback);
// 			var isAddEventListener = false;
// 			var delegateEvents = delegates[element._mid] || (delegates[element._mid] = {});
// 			var delegateCallbackObjs = delegateEvents[event] || ((delegateEvents[event] = {}));
// 			if ($.isEmptyObject(delegateCallbackObjs)) {
// 				isAddEventListener = true;
// 			}
// 			var delegateCallbacks = delegateCallbackObjs[selector] || (delegateCallbackObjs[selector] = []);
// 			delegateCallbacks.push(callback);
// 			if (isAddEventListener) {
// 				delegateFns[mid(element)] = delegateFn(element, event, selector, callback);
// 				element.addEventListener(event, delegateFns[mid(element)]);
// 				if (event === 'tap') { //TODO 需要找个更好的解决方案
// 					element.addEventListener('click', function(e) {
// 						if (e.target) {
// 							var tagName = e.target.tagName;
// 							if (!preventDefaultException.test(tagName)) {
// 								if (tagName === 'A') {
// 									var href = e.target.href;
// 									if (!(href && ~href.indexOf('tel:'))) {
// 										e.preventDefault();
// 									}
// 								} else {
// 									e.preventDefault();
// 								}
// 							}
// 						}
// 					});
// 				}
// 			}
// 		});
// 	};
// 	$.fn.off = function(event, selector, callback) {
// 		return this.each(function() {
// 			var _mid = mid(this);
// 			if (!callback) {
// 				if (delegates[_mid] && delegates[_mid][event]) {
// 					delete delegates[_mid][event][selector];
// 				}
// 			} else {
// 				var delegateCallbacks = delegates[_mid] && delegates[_mid][event] && delegates[_mid][event][selector];
// 				$.each(delegateCallbacks, function(index, delegateCallback) {
// 					if (mid(delegateCallback) === mid(callback)) {
// 						delegateCallbacks.splice(index, 1);
// 						return false;
// 					}
// 				}, true);
// 			}
// 			//如果off掉了所有当前element的指定的event事件，则remove掉当前element的delegate回调
// 			if (delegates[_mid] && $.isEmptyObject(delegates[_mid][event])) {
// 				this.removeEventListener(event, delegateFns[_mid]);
// 				delete delegateFns[_mid];
// 			}
// 		})
// 	};
// })(mui);
// /**
//  * mui gestures
//  * @param {type} $
//  * @param {type} window
//  * @returns {undefined}
//  */
// (function($, window) {
// 	$.EVENT_START = 'touchstart';
// 	$.EVENT_MOVE = 'touchmove';
// 	$.EVENT_END = 'touchend';
// 	$.EVENT_CANCEL = 'touchcancel';
// 	$.EVENT_CLICK = 'click';
// 	/**
// 	 * Gesture preventDefault
// 	 * @param {type} e
// 	 * @returns {undefined}
// 	 */
// 	$.preventDefault = function(e) {
// 		e.preventDefault();
// 	};
// 	/**
// 	 * Gesture stopPropagation
// 	 * @param {type} e
// 	 * @returns {undefined}
// 	 */
// 	$.stopPropagation = function(e) {
// 		e.stopPropagation();
// 	};

// 	/**
// 	 * register gesture
// 	 * @param {type} gesture
// 	 * @returns {$.gestures}
// 	 */
// 	$.registerGesture = function(gesture) {
// 		return $.registerHandler('gestures', gesture);

// 	};

// 	var round = Math.round;
// 	var abs = Math.abs;
// 	var sqrt = Math.sqrt;
// 	var atan = Math.atan;
// 	var atan2 = Math.atan2;
// 	/**
// 	 * distance
// 	 * @param {type} p1
// 	 * @param {type} p2
// 	 * @returns {Number}
// 	 */
// 	var getDistance = function(p1, p2, props) {
// 		if (!props) {
// 			props = ['x', 'y'];
// 		}
// 		var x = p2[props[0]] - p1[props[0]];
// 		var y = p2[props[1]] - p1[props[1]];
// 		return sqrt((x * x) + (y * y));
// 	};
// 	/**
// 	 * scale
// 	 * @param {Object} starts
// 	 * @param {Object} moves
// 	 */
// 	var getScale = function(starts, moves) {
// 		if (starts.length >= 2 && moves.length >= 2) {
// 			var props = ['pageX', 'pageY'];
// 			return getDistance(moves[1], moves[0], props) / getDistance(starts[1], starts[0], props);
// 		}
// 		return 1;
// 	};
// 	/**
// 	 * angle
// 	 * @param {type} p1
// 	 * @param {type} p2
// 	 * @returns {Number}
// 	 */
// 	var getAngle = function(p1, p2, props) {
// 		if (!props) {
// 			props = ['x', 'y'];
// 		}
// 		var x = p2[props[0]] - p1[props[0]];
// 		var y = p2[props[1]] - p1[props[1]];
// 		return atan2(y, x) * 180 / Math.PI;
// 	};
// 	/**
// 	 * direction
// 	 * @param {Object} x
// 	 * @param {Object} y
// 	 */
// 	var getDirection = function(x, y) {
// 		if (x === y) {
// 			return '';
// 		}
// 		if (abs(x) >= abs(y)) {
// 			return x > 0 ? 'left' : 'right';
// 		}
// 		return y > 0 ? 'up' : 'down';
// 	};

// 	var getRotation = function(start, end) {
// 		var props = ['pageX', 'pageY'];
// 		return getAngle(end[1], end[0], props) - getAngle(start[1], start[0], props);
// 	};
// 	/**
// 	 * detect gestures
// 	 * @param {type} event
// 	 * @param {type} touch
// 	 * @returns {undefined}
// 	 */
// 	var detect = function(event, touch) {
// 		if ($.gestures.stoped) {
// 			return;
// 		}
// 		$.each($.gestures, function(index, gesture) {
// 			if (!$.gestures.stoped) {
// 				if ($.options.gestureConfig[gesture.name] !== false) {
// 					gesture.handle(event, touch);
// 				}
// 			}
// 		});
// 	};
// 	/**
// 	 * px per ms
// 	 * @param {Object} deltaTime
// 	 * @param {Object} x
// 	 * @param {Object} y
// 	 */
// 	var getVelocity = function(deltaTime, x, y) {
// 		return {
// 			x: x / deltaTime || 0,
// 			y: y / deltaTime || 0
// 		};
// 	};
// 	var hasParent = function(node, parent) {
// 		while (node) {
// 			if (node == parent) {
// 				return true;
// 			}
// 			node = node.parentNode;
// 		}
// 		return false;
// 	};

// 	var uniqueArray = function(src, key, sort) {
// 		var results = [];
// 		var values = [];
// 		var i = 0;

// 		while (i < src.length) {
// 			var val = key ? src[i][key] : src[i];
// 			if (values.indexOf(val) < 0) {
// 				results.push(src[i]);
// 			}
// 			values[i] = val;
// 			i++;
// 		}

// 		if (sort) {
// 			if (!key) {
// 				results = results.sort();
// 			} else {
// 				results = results.sort(function sortUniqueArray(a, b) {
// 					return a[key] > b[key];
// 				});
// 			}
// 		}

// 		return results;
// 	};
// 	var getMultiCenter = function(touches) {
// 		var touchesLength = touches.length;
// 		if (touchesLength === 1) {
// 			return {
// 				x: round(touches[0].pageX),
// 				y: round(touches[0].pageY)
// 			};
// 		}

// 		var x = 0;
// 		var y = 0;
// 		var i = 0;
// 		while (i < touchesLength) {
// 			x += touches[i].pageX;
// 			y += touches[i].pageY;
// 			i++;
// 		}

// 		return {
// 			x: round(x / touchesLength),
// 			y: round(y / touchesLength)
// 		};
// 	};
// 	var multiTouch = function() {
// 		return $.options.gestureConfig.pinch;
// 	};
// 	var copySimpleTouchData = function(touch) {
// 		var touches = [];
// 		var i = 0;
// 		while (i < touch.touches.length) {
// 			touches[i] = {
// 				pageX: round(touch.touches[i].pageX),
// 				pageY: round(touch.touches[i].pageY)
// 			};
// 			i++;
// 		}
// 		return {
// 			timestamp: $.now(),
// 			gesture: touch.gesture,
// 			touches: touches,
// 			center: getMultiCenter(touch.touches),
// 			deltaX: touch.deltaX,
// 			deltaY: touch.deltaY
// 		};
// 	};

// 	var calDelta = function(touch) {
// 		var session = $.gestures.session;
// 		var center = touch.center;
// 		var offset = session.offsetDelta || {};
// 		var prevDelta = session.prevDelta || {};
// 		var prevTouch = session.prevTouch || {};

// 		if (touch.gesture.type === $.EVENT_START || touch.gesture.type === $.EVENT_END) {
// 			prevDelta = session.prevDelta = {
// 				x: prevTouch.deltaX || 0,
// 				y: prevTouch.deltaY || 0
// 			};

// 			offset = session.offsetDelta = {
// 				x: center.x,
// 				y: center.y
// 			};
// 		}
// 		touch.deltaX = prevDelta.x + (center.x - offset.x);
// 		touch.deltaY = prevDelta.y + (center.y - offset.y);
// 	};
// 	var calTouchData = function(touch) {
// 		var session = $.gestures.session;
// 		var touches = touch.touches;
// 		var touchesLength = touches.length;

// 		if (!session.firstTouch) {
// 			session.firstTouch = copySimpleTouchData(touch);
// 		}

// 		if (multiTouch() && touchesLength > 1 && !session.firstMultiTouch) {
// 			session.firstMultiTouch = copySimpleTouchData(touch);
// 		} else if (touchesLength === 1) {
// 			session.firstMultiTouch = false;
// 		}

// 		var firstTouch = session.firstTouch;
// 		var firstMultiTouch = session.firstMultiTouch;
// 		var offsetCenter = firstMultiTouch ? firstMultiTouch.center : firstTouch.center;

// 		var center = touch.center = getMultiCenter(touches);
// 		touch.timestamp = $.now();
// 		touch.deltaTime = touch.timestamp - firstTouch.timestamp;

// 		touch.angle = getAngle(offsetCenter, center);
// 		touch.distance = getDistance(offsetCenter, center);

// 		calDelta(touch);

// 		touch.offsetDirection = getDirection(touch.deltaX, touch.deltaY);

// 		touch.scale = firstMultiTouch ? getScale(firstMultiTouch.touches, touches) : 1;
// 		touch.rotation = firstMultiTouch ? getRotation(firstMultiTouch.touches, touches) : 0;

// 		calIntervalTouchData(touch);

// 	};
// 	var CAL_INTERVAL = 25;
// 	var calIntervalTouchData = function(touch) {
// 		var session = $.gestures.session;
// 		var last = session.lastInterval || touch;
// 		var deltaTime = touch.timestamp - last.timestamp;
// 		var velocity;
// 		var velocityX;
// 		var velocityY;
// 		var direction;

// 		if (touch.gesture.type != $.EVENT_CANCEL && (deltaTime > CAL_INTERVAL || last.velocity === undefined)) {
// 			var deltaX = last.deltaX - touch.deltaX;
// 			var deltaY = last.deltaY - touch.deltaY;

// 			var v = getVelocity(deltaTime, deltaX, deltaY);
// 			velocityX = v.x;
// 			velocityY = v.y;
// 			velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
// 			direction = getDirection(deltaX, deltaY);

// 			session.lastInterval = touch;
// 		} else {
// 			velocity = last.velocity;
// 			velocityX = last.velocityX;
// 			velocityY = last.velocityY;
// 			direction = last.direction;
// 		}

// 		touch.velocity = velocity;
// 		touch.velocityX = velocityX;
// 		touch.velocityY = velocityY;
// 		touch.direction = direction;
// 	};
// 	var getTouches = function(event, touch) {
// 		var allTouches = $.slice.call(event.touches);

// 		var type = event.type;

// 		var targetTouches = [];
// 		var changedTargetTouches = [];
// 		$.gestures.session || ($.gestures.session = {
// 			targetIds: {}
// 		});
// 		if ((type === $.EVENT_START || type === $.EVENT_MOVE) && allTouches.length === 1) {
// 			if (type === $.EVENT_START) { //first
// 				touch.isFirst = true;
// 				$.gestures.touch = $.gestures.session = {
// 					firstTarget: event.target,
// 					targetIds: {}
// 				};
// 			}
// 			var targetIds = $.gestures.session.targetIds;
// 			targetIds[allTouches[0].identifier] = true;
// 			targetTouches = allTouches;
// 			changedTargetTouches = allTouches;
// 			touch.target = event.target;
// 		} else {
// 			var i = 0;
// 			var targetTouches = [];
// 			var changedTargetTouches = [];
// 			var targetIds = $.gestures.session.targetIds;
// 			var changedTouches = $.slice.call(event.changedTouches);

// 			touch.target = event.target;

// 			targetTouches = allTouches.filter(function(touch) {
// 				return true; //return hasParent(touch.target, touch.firstTarget);
// 			});

// 			if (type === $.EVENT_START) {
// 				i = 0;
// 				while (i < targetTouches.length) {
// 					targetIds[targetTouches[i].identifier] = true;
// 					i++;
// 				}
// 			}

// 			i = 0;
// 			while (i < changedTouches.length) {
// 				if (targetIds[changedTouches[i].identifier]) {
// 					changedTargetTouches.push(changedTouches[i]);
// 				}
// 				if (type === $.EVENT_END || type === $.EVENT_CANCEL) {
// 					delete targetIds[changedTouches[i].identifier];
// 				}
// 				i++;
// 			}

// 			if (!changedTargetTouches.length) {
// 				return false;
// 			}
// 		}
// 		targetTouches = uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true);
// 		var touchesLength = targetTouches.length;
// 		var changedTouchesLength = changedTargetTouches.length;

// 		touch.isFinal = ((type === $.EVENT_END || type === $.EVENT_CANCEL) && (touchesLength - changedTouchesLength === 0));

// 		touch.touches = targetTouches;
// 		touch.changedTouches = changedTargetTouches;
// 		return true;

// 	};
// 	var handleTouchEvent = function(event) {
// 		var touch = {
// 			gesture: event
// 		};
// 		var touches = getTouches(event, touch);
// 		if (!touches) {
// 			return;
// 		}
// 		calTouchData(touch);
// 		detect(event, touch);
// 		$.gestures.session.prevTouch = touch;
// 	};
// 	window.addEventListener($.EVENT_START, handleTouchEvent);
// 	window.addEventListener($.EVENT_MOVE, handleTouchEvent);
// 	window.addEventListener($.EVENT_END, handleTouchEvent);
// 	window.addEventListener($.EVENT_CANCEL, handleTouchEvent);
// 	//fixed hashchange(android)
// 	window.addEventListener($.EVENT_CLICK, function(e) {
// 		//TODO 应该判断当前target是不是在targets.popover内部，而不是非要相等
// 		if (($.targets.popover && e.target === $.targets.popover) || ($.targets.tab) || $.targets.offcanvas || $.targets.modal) {
// 			e.preventDefault();
// 		}
// 	}, true);


// 	//增加原生滚动识别
// 	$.isScrolling = false;
// 	var scrollingTimeout = null;
// 	window.addEventListener('scroll', function() {
// 		$.isScrolling = true;
// 		scrollingTimeout && clearTimeout(scrollingTimeout);
// 		scrollingTimeout = setTimeout(function() {
// 			$.isScrolling = false;
// 		}, 250);
// 	});
// })(mui, window);
// /**
//  * mui gesture flick[left|right|up|down]
//  * @param {type} $
//  * @param {type} name
//  * @returns {undefined}
//  */
// (function($, name) {
// 	var flickStartTime = 0;
// 	var handle = function(event, touch) {
// 		var session = $.gestures.session;
// 		var options = this.options;
// 		var now = $.now();
// 		switch (event.type) {
// 			case $.EVENT_MOVE:
// 				if (now - flickStartTime > 300) {
// 					flickStartTime = now;
// 					session.flickStart = touch.center;
// 				}
// 				break;
// 			case $.EVENT_END:
// 			case $.EVENT_CANCEL:
// 				if (session.flickStart && options.flickMaxTime > (now - flickStartTime) && touch.distance > options.flickMinDistince) {
// 					touch.flick = true;
// 					touch.flickTime = now - flickStartTime;
// 					touch.flickDistanceX = touch.center.x - session.flickStart.x;
// 					touch.flickDistanceY = touch.center.y - session.flickStart.y;
// 					$.trigger(event.target, name, touch);
// 					$.trigger(event.target, name + touch.direction, touch);
// 				}
// 				break;
// 		}

// 	};
// 	/**
// 	 * mui gesture flick
// 	 */
// 	$.registerGesture({
// 		name: name,
// 		index: 5,
// 		handle: handle,
// 		options: {
// 			flickMaxTime: 200,
// 			flickMinDistince: 10
// 		}
// 	});
// })(mui, 'flick');
// /**
//  * mui gesture swipe[left|right|up|down]
//  * @param {type} $
//  * @param {type} name
//  * @returns {undefined}
//  */
// (function($, name) {
// 	var handle = function(event, touch) {
// 		if (event.type === $.EVENT_END || event.type === $.EVENT_CANCEL) {
// 			var options = this.options;
// 			if (touch.direction && options.swipeMaxTime > touch.deltaTime && touch.distance > options.swipeMinDistince) {
// 				touch.swipe = true;
// 				$.trigger(event.target, name, touch);
// 				$.trigger(event.target, name + touch.direction, touch);
// 			}
// 		}
// 	};
// 	/**
// 	 * mui gesture swipe
// 	 */
// 	$.registerGesture({
// 		name: name,
// 		index: 10,
// 		handle: handle,
// 		options: {
// 			swipeMaxTime: 300,
// 			swipeMinDistince: 18
// 		}
// 	});
// })(mui, 'swipe');
// /**
//  * mui gesture drag[start|left|right|up|down|end]
//  * @param {type} $
//  * @param {type} name
//  * @returns {undefined}
//  */
// (function($, name) {
// 	var handle = function(event, touch) {
// 		var session = $.gestures.session;
// 		switch (event.type) {
// 			case $.EVENT_START:
// 				break;
// 			case $.EVENT_MOVE:
// 				if (!touch.direction) {
// 					return;
// 				}
// 				//修正direction,可在session期间自行锁定拖拽方向，方便开发scroll类不同方向拖拽插件嵌套
// 				if (session.lockDirection && session.startDirection) {
// 					if (session.startDirection && session.startDirection !== touch.direction) {
// 						if (session.startDirection === 'up' || session.startDirection === 'down') {
// 							touch.direction = touch.deltaY < 0 ? 'up' : 'down';
// 						} else {
// 							touch.direction = touch.deltaX < 0 ? 'left' : 'right';
// 						}
// 					}
// 				}

// 				if (!session.drag) {
// 					session.drag = true;
// 					$.trigger(event.target, name + 'start', touch);
// 				}
// 				$.trigger(event.target, name, touch);
// 				$.trigger(event.target, name + touch.direction, touch);
// 				break;
// 			case $.EVENT_END:
// 			case $.EVENT_CANCEL:
// 				if (session.drag && touch.isFinal) {
// 					$.trigger(event.target, name + 'end', touch);
// 				}
// 				break;
// 		}
// 	};
// 	/**
// 	 * mui gesture drag
// 	 */
// 	$.registerGesture({
// 		name: name,
// 		index: 20,
// 		handle: handle,
// 		options: {
// 			fingers: 1
// 		}
// 	});
// })(mui, 'drag');
// /**
//  * mui gesture tap and doubleTap
//  * @param {type} $
//  * @param {type} name
//  * @returns {undefined}
//  */
// (function($, name) {
// 	var lastTarget;
// 	var lastTapTime;
// 	var handle = function(event, touch) {
// 		var options = this.options;
// 		switch (event.type) {
// 			case $.EVENT_END:
// 				if (!touch.isFinal) {
// 					return;
// 				}
// 				var target = event.target;
// 				if (!target || (target.disabled || target.classList.contains('mui-disabled'))) {
// 					return;
// 				}
// 				if (touch.distance < options.tapMaxDistance && touch.deltaTime < options.tapMaxTime) {
// 					if ($.options.gestureConfig.doubletap && lastTarget && (lastTarget === target)) { //same target
// 						if (lastTapTime && (touch.timestamp - lastTapTime) < options.tapMaxInterval) {
// 							$.trigger(target, 'doubletap', touch);
// 							lastTapTime = $.now();
// 							lastTarget = target;
// 							return;
// 						}
// 					}
// 					$.trigger(target, name, touch);
// 					lastTapTime = $.now();
// 					lastTarget = event.target;
// 				}
// 				break;
// 		}
// 	};
// 	/**
// 	 * mui gesture tap
// 	 */
// 	$.registerGesture({
// 		name: name,
// 		index: 30,
// 		handle: handle,
// 		options: {
// 			fingers: 1,
// 			tapMaxInterval: 300,
// 			tapMaxDistance: 5,
// 			tapMaxTime: 250
// 		}
// 	});
// })(mui, 'tap');
// /**
//  * mui gesture longtap
//  * @param {type} $
//  * @param {type} name
//  * @returns {undefined}
//  */
// (function($, name) {
// 	var timer;
// 	var handle = function(event, touch) {
// 		var options = this.options;
// 		switch (event.type) {
// 			case $.EVENT_START:
// 				clearTimeout(timer);
// 				timer = setTimeout(function() {
// 					$.trigger(event.target, name, touch);
// 				}, options.holdTimeout);
// 				break;
// 			case $.EVENT_MOVE:
// 				if (touch.distance > options.holdThreshold) {
// 					clearTimeout(timer);
// 				}
// 				break;
// 			case $.EVENT_END:
// 			case $.EVENT_CANCEL:
// 				clearTimeout(timer);
// 				break;
// 		}
// 	};
// 	/**
// 	 * mui gesture longtap
// 	 */
// 	$.registerGesture({
// 		name: name,
// 		index: 10,
// 		handle: handle,
// 		options: {
// 			fingers: 1,
// 			holdTimeout: 500,
// 			holdThreshold: 2
// 		}
// 	});
// })(mui, 'longtap');
// /**
//  * mui gesture hold
//  * @param {type} $
//  * @param {type} name
//  * @returns {undefined}
//  */
// (function($, name) {
// 	var timer;
// 	var handle = function(event, touch) {
// 		var options = this.options;
// 		switch (event.type) {
// 			case $.EVENT_START:
// 				if ($.options.gestureConfig.hold) {
// 					timer && clearTimeout(timer);
// 					timer = setTimeout(function() {
// 						touch.hold = true;
// 						$.trigger(event.target, name, touch);
// 					}, options.holdTimeout);
// 				}
// 				break;
// 			case $.EVENT_MOVE:
// 				break;
// 			case $.EVENT_END:
// 			case $.EVENT_CANCEL:
// 				if (timer) {
// 					clearTimeout(timer) && (timer = null);
// 					$.trigger(event.target, 'release', touch);
// 				}
// 				break;
// 		}
// 	};
// 	/**
// 	 * mui gesture hold
// 	 */
// 	$.registerGesture({
// 		name: name,
// 		index: 10,
// 		handle: handle,
// 		options: {
// 			fingers: 1,
// 			holdTimeout: 0
// 		}
// 	});
// })(mui, 'hold');
// /**
//  * mui gesture pinch
//  * @param {type} $
//  * @param {type} name
//  * @returns {undefined}
//  */
// (function($, name) {
// 	var handle = function(event, touch) {
// 		var options = this.options;
// 		var session = $.gestures.session;
// 		switch (event.type) {
// 			case $.EVENT_START:
// 				break;
// 			case $.EVENT_MOVE:
// 				if ($.options.gestureConfig.pinch) {
// 					if (touch.touches.length < 2) {
// 						return;
// 					}
// 					if (!session.pinch) { //start
// 						session.pinch = true;
// 						$.trigger(event.target, name + 'start', touch);
// 					}
// 					$.trigger(event.target, name, touch);
// 					var scale = touch.scale;
// 					var rotation = touch.rotation;
// 					var lastScale = typeof touch.lastScale === 'undefined' ? 1 : touch.lastScale;
// 					var scaleDiff = 0.000000000001; //防止scale与lastScale相等，不触发事件的情况。
// 					if (scale > lastScale) { //out
// 						lastScale = scale - scaleDiff;
// 						$.trigger(event.target, name + 'out', touch);
// 					} //in
// 					else if (scale < lastScale) {
// 						lastScale = scale + scaleDiff;
// 						$.trigger(event.target, name + 'in', touch);
// 					}
// 					if (Math.abs(rotation) > options.minRotationAngle) {
// 						$.trigger(event.target, 'rotate', touch);
// 					}
// 				}
// 				break;
// 			case $.EVENT_END:
// 			case $.EVENT_CANCEL:
// 				if ($.options.gestureConfig.pinch && session.pinch && touch.touches.length === 2) {
// 					$.trigger(event.target, name + 'end', touch);
// 				}
// 				break;
// 		}
// 	};
// 	/**
// 	 * mui gesture pinch
// 	 */
// 	$.registerGesture({
// 		name: name,
// 		index: 10,
// 		handle: handle,
// 		options: {
// 			minRotationAngle: 0
// 		}
// 	});
// })(mui, 'pinch');

/**
 * nvui.init
 * @param {type} $
 * @returns {undefined}
 */
// (function($) {
// 	$.global = $.options = {
// 		gestureConfig: {
// 			tap: true,
// 			doubletap: false,
// 			longtap: false,
// 			hold: false,
// 			flick: true,
// 			swipe: true,
// 			drag: true,
// 			pinch: false
// 		}
// 	};
// 	/**
// 	 *
// 	 * @param {type} options
// 	 * @returns {undefined}
// 	 */
// 	$.initGlobal = function(options) {
// 		$.options = $.extend(true, $.global, options);
// 		return this;
// 	};
// 	var inits = {};

// 	var isInitialized = false;
// 	//TODO 自动调用init?因为用户自己调用init的时机可能不确定，如果晚于自动init，则会有潜在问题
// 	//	$.ready(function() {
// 	//		setTimeout(function() {
// 	//			if (!isInitialized) {
// 	//				$.init();
// 	//			}
// 	//		}, 300);
// 	//	});
// 	/**
// 	 * 单页配置 初始化
// 	 * @param {object} options
// 	 */
// 	$.init = function(options) {
// 		isInitialized = true;
// 		$.options = $.extend(true, $.global, options || {});
// 		$.ready(function() {
// 			$.each($.inits, function(index, init) {
// 				var isInit = !!(!inits[init.name] || init.repeat);
// 				if (isInit) {
// 					init.handle.call($);
// 					inits[init.name] = true;
// 				}
// 			});
// 		});
// 		return this;
// 	};

// 	/**
// 	 * 增加初始化执行流程
// 	 * @param {function} init
// 	 */
// 	$.registerInit = function(init) {
// 		return $.registerHandler('inits', init);
// 	};
// 	$(function() {
// 		var classList = document.body.classList;
// 		var os = [];
// 		if ($.os.ios) {
// 			os.push({
// 				os: 'ios',
// 				version: $.os.version
// 			});
// 			classList.add('mui-ios');
// 		} else if ($.os.android) {
// 			os.push({
// 				os: 'android',
// 				version: $.os.version
// 			});
// 			classList.add('mui-android');
// 		}
// 		if ($.os.wechat) {
// 			os.push({
// 				os: 'wechat',
// 				version: $.os.wechat.version
// 			});
// 			classList.add('mui-wechat');
// 		}
// 		if (os.length) {
// 			$.each(os, function(index, osObj) {
// 				var version = '';
// 				var classArray = [];
// 				if (osObj.version) {
// 					$.each(osObj.version.split('.'), function(i, v) {
// 						version = version + (version ? '-' : '') + v;
// 						classList.add($.className(osObj.os + '-' + version));
// 					});
// 				}
// 			});
// 		}
// 	});
// })(nvui);
// /**
//  * mui.init 5+
//  * @param {type} $
//  * @returns {undefined}
//  */
// (function($) {
// 	var defaultOptions = {
// 		swipeBack: false,
// 		preloadPages: [], //5+ lazyLoad webview
// 		preloadLimit: 10, //预加载窗口的数量限制(一旦超出，先进先出)
// 		keyEventBind: {
// 			backbutton: true,
// 			menubutton: true
// 		}
// 	};

// 	//默认页面动画
// 	var defaultShow = {
// 		autoShow: true,
// 		duration: $.os.ios ? 200 : 100,
// 		aniShow: 'slide-in-right'
// 	};
// 	//若执行了显示动画初始化操作，则要覆盖默认配置
// 	if ($.options.show) {
// 		defaultShow = $.extend(true, defaultShow, $.options.show);
// 	}

// 	$.currentWebview = null;
// 	$.isHomePage = false;

// 	$.extend(true, $.global, defaultOptions);
// 	$.extend(true, $.options, defaultOptions);
// 	/**
// 	 * 等待动画配置
// 	 * @param {type} options
// 	 * @returns {Object}
// 	 */
// 	$.waitingOptions = function(options) {
// 		return $.extend({
// 			autoShow: true,
// 			title: ''
// 		}, options);
// 	};
// 	/**
// 	 * 窗口显示配置
// 	 * @param {type} options
// 	 * @returns {Object}
// 	 */
// 	$.showOptions = function(options) {
// 		return $.extend(defaultShow, options);
// 	};
// 	/**
// 	 * 窗口默认配置
// 	 * @param {type} options
// 	 * @returns {Object}
// 	 */
// 	$.windowOptions = function(options) {
// 		return $.extend({
// 			scalable: false,
// 			bounce: "" //vertical
// 		}, options);
// 	};
// 	/**
// 	 * plusReady
// 	 * @param {type} callback
// 	 * @returns {_L6.$}
// 	 */
// 	$.plusReady = function(callback) {
// 		if (window.plus) {
// 			setTimeout(function() { //解决callback与plusready事件的执行时机问题(典型案例:showWaiting,closeWaiting)
// 				callback();
// 			}, 0);
// 		} else {
// 			document.addEventListener("plusready", function() {
// 				callback();
// 			}, false);
// 		}
// 		return this;
// 	};
// 	/**
// 	 * 5+ event(5+没提供之前我自己实现)
// 	 * @param {type} webview
// 	 * @param {type} eventType
// 	 * @param {type} data
// 	 * @returns {undefined}
// 	 */
// 	$.fire = function(webview, eventType, data) {
// 		if (webview) {
// 			webview.evalJS("typeof mui!=='undefined'&&mui.receive('" + eventType + "','" + JSON.stringify(data || {}).replace(/\'/g, "\\u0027").replace(/\\/g, "\\u005c") + "')");
// 		}
// 	};
// 	/**
// 	 * 5+ event(5+没提供之前我自己实现)
// 	 * @param {type} eventType
// 	 * @param {type} data
// 	 * @returns {undefined}
// 	 */
// 	$.receive = function(eventType, data) {
// 		if (eventType) {
// 			data = JSON.parse(data);
// 			$.trigger(document, eventType, data);
// 		}
// 	};
// 	var triggerPreload = function(webview) {
// 		if (!webview.preloaded) {
// 			$.fire(webview, 'preload');
// 			var list = webview.children();
// 			for (var i = 0; i < list.length; i++) {
// 				$.fire(list[i], 'preload');
// 			}
// 			webview.preloaded = true;
// 		}
// 	};
// 	var trigger = function(webview, eventType, timeChecked) {
// 		if (timeChecked) {
// 			if (!webview[eventType + 'ed']) {
// 				$.fire(webview, eventType);
// 				var list = webview.children();
// 				for (var i = 0; i < list.length; i++) {
// 					$.fire(list[i], eventType);
// 				}
// 				webview[eventType + 'ed'] = true;
// 			}
// 		} else {
// 			$.fire(webview, eventType);
// 			var list = webview.children();
// 			for (var i = 0; i < list.length; i++) {
// 				$.fire(list[i], eventType);
// 			}
// 		}

// 	};
// 	/**
// 	 * 打开新窗口
// 	 * @param {string} url 要打开的页面地址
// 	 * @param {string} id 指定页面ID
// 	 * @param {object} options 可选:参数,等待,窗口,显示配置{params:{},waiting:{},styles:{},show:{}}
// 	 */
// 	$.openWindow = function(url, id, options) {

// 		if (!window.plus) {
// 			return;
// 		}
// 		if (typeof url === 'object') {
// 			options = url;
// 			url = options.url;
// 			id = options.id || url;
// 		} else {
// 			if (typeof id === 'object') {
// 				options = id;
// 				id = url;
// 			} else {
// 				id = id || url;
// 			}
// 		}
// 		options = options || {};
// 		var params = options.params || {};
// 		var webview, nShow, nWaiting;
// 		if ($.webviews[id]) { //已缓存
// 			var webviewCache = $.webviews[id];
// 			webview = webviewCache.webview;
// 			//需要处理用户手动关闭窗口的情况，此时webview应该是空的；
// 			if (!webview || !webview.getURL()) {
// 				//再次新建一个webview；
// 				options = $.extend(options, {
// 					id: id,
// 					url: url,
// 					preload: true
// 				}, true);
// 				webview = $.createWindow(options);
// 			}
// 			//每次show都需要传递动画参数；
// 			//预加载的动画参数优先级：openWindow配置>preloadPages配置>mui默认配置；
// 			nShow = webviewCache.show;
// 			nShow = options.show ? $.extend(nShow, options.show) : nShow;
// 			webview.show(nShow.aniShow, nShow.duration, function() {
// 				triggerPreload(webview);
// 				trigger(webview, 'pagebeforeshow', false);
// 			});

// 			webviewCache.afterShowMethodName && webview.evalJS(webviewCache.afterShowMethodName + '(\'' + JSON.stringify(params) + '\')');
// 			return webview;
// 		} else { //新窗口
// 			if (options.createNew !== true) {
// 				webview = plus.webview.getWebviewById(id);
// 				if (webview) { //如果已存在
// 					nShow = $.showOptions(options.show);
// 					webview.show(nShow.aniShow, nShow.duration, function() {
// 						triggerPreload(webview);
// 						trigger(webview, 'pagebeforeshow', false);
// 					});
// 					return webview;
// 				}
// 			}
// 			//显示waiting
// 			var waitingConfig = $.waitingOptions(options.waiting);
// 			if (waitingConfig.autoShow) {
// 				nWaiting = plus.nativeUI.showWaiting(waitingConfig.title, waitingConfig.options);
// 			}
// 			//创建页面
// 			options = $.extend(options, {
// 				id: id,
// 				url: url
// 			});

// 			webview = $.createWindow(options);
// 			//显示
// 			nShow = $.showOptions(options.show);
// 			if (nShow.autoShow) {
// 				webview.addEventListener("loaded", function() {
// 					//关闭等待框
// 					if (nWaiting) {
// 						nWaiting.close();
// 					}
// 					//显示页面
// 					webview.show(nShow.aniShow, nShow.duration, function() {
// 						triggerPreload(webview);
// 						trigger(webview, 'pagebeforeshow', false);
// 					});
// 					webview.showed = true;
// 					options.afterShowMethodName && webview.evalJS(options.afterShowMethodName + '(\'' + JSON.stringify(params) + '\')');
// 				}, false);
// 			}
// 		}
// 		return webview;
// 	};
// 	/**
// 	 * 根据配置信息创建一个webview
// 	 * @param {type} options
// 	 * @param {type} isCreate
// 	 * @returns {webview}
// 	 */
// 	$.createWindow = function(options, isCreate) {
// 		if (!window.plus) {
// 			return;
// 		}
// 		var id = options.id || options.url;
// 		var webview;
// 		if (options.preload) {
// 			if ($.webviews[id] && $.webviews[id].webview.getURL()) { //已经cache
// 				webview = $.webviews[id].webview;
// 			} else { //新增预加载窗口
// 				//preload
// 				//判断是否携带createNew参数，默认为false
// 				if (options.createNew !== true) {
// 					webview = plus.webview.getWebviewById(id);
// 				}

// 				//之前没有，那就新创建	
// 				if(!webview){
// 					webview = plus.webview.create(options.url, id, $.windowOptions(options.styles), $.extend({
// 						preload: true
// 					}, options.extras));
// 					if (options.subpages) {
// 						$.each(options.subpages, function(index, subpage) {
// 							//TODO 子窗口也可能已经创建，比如公用模板的情况；
// 							var subWebview = plus.webview.create(subpage.url, subpage.id || subpage.url, $.windowOptions(subpage.styles), $.extend({
// 								preload: true
// 							}, subpage.extras));
// 							webview.append(subWebview);
// 						});
// 					}
// 				}
// 			}

// 			//TODO 理论上，子webview也应该计算到预加载队列中，但这样就麻烦了，要退必须退整体，否则可能出现问题；
// 			$.webviews[id] = {
// 				webview: webview, //目前仅preload的缓存webview
// 				preload: true,
// 				show: $.showOptions(options.show),
// 				afterShowMethodName: options.afterShowMethodName //就不应该用evalJS。应该是通过事件消息通讯
// 			};
// 			//索引该预加载窗口
// 			var preloads = $.data.preloads;
// 			var index = preloads.indexOf(id);
// 			if (~index) { //删除已存在的(变相调整插入位置)
// 				preloads.splice(index, 1);
// 			}
// 			preloads.push(id);
// 			if (preloads.length > $.options.preloadLimit) {
// 				//先进先出
// 				var first = $.data.preloads.shift();
// 				var webviewCache = $.webviews[first];
// 				if (webviewCache && webviewCache.webview) {
// 					//需要将自己打开的所有页面，全部close；
// 					//关闭该预加载webview	
// 					$.closeAll(webviewCache.webview);
// 				}
// 				//删除缓存
// 				delete $.webviews[first];
// 			}
// 		} else {
// 			if (isCreate !== false) { //直接创建非预加载窗口
// 				webview = plus.webview.create(options.url, id, $.windowOptions(options.styles), options.extras);
// 				if (options.subpages) {
// 					$.each(options.subpages, function(index, subpage) {
// 						var subWebview = plus.webview.create(subpage.url, subpage.id || subpage.url, $.windowOptions(subpage.styles), subpage.extras);
// 						webview.append(subWebview);
// 					});
// 				}
// 			}
// 		}
// 		return webview;
// 	};

// 	/**
// 	 * 预加载
// 	 */
// 	$.preload = function(options) {
// 		//调用预加载函数，不管是否传递preload参数，强制变为true
// 		if (!options.preload) {
// 			options.preload = true;
// 		}
// 		return $.createWindow(options);
// 	};

// 	/**
// 	 *关闭当前webview打开的所有webview；
// 	 */
// 	$.closeOpened = function(webview) {
// 		var opened = webview.opened();
// 		if (opened) {
// 			for (var i = 0, len = opened.length; i < len; i++) {
// 				var openedWebview = opened[i];
// 				var open_open = openedWebview.opened();
// 				if (open_open && open_open.length > 0) {
// 					$.closeOpened(openedWebview);
// 				} else {
// 					//如果直接孩子节点，就不用关闭了，因为父关闭的时候，会自动关闭子；
// 					if (openedWebview.parent() !== webview) {
// 						openedWebview.close('none');
// 					}
// 				}
// 			}
// 		}
// 	};
// 	$.closeAll = function(webview, aniShow) {
// 		$.closeOpened(webview);
// 		if (aniShow) {
// 			webview.close(aniShow);
// 		} else {
// 			webview.close();
// 		}
// 	};

// 	/**
// 	 * 批量创建webview
// 	 * @param {type} options
// 	 * @returns {undefined}
// 	 */
// 	$.createWindows = function(options) {
// 		$.each(options, function(index, option) {
// 			//初始化预加载窗口(创建)和非预加载窗口(仅配置，不创建)
// 			$.createWindow(option, false);
// 		});
// 	};
// 	/**
// 	 * 创建当前页面的子webview
// 	 * @param {type} options
// 	 * @returns {webview}
// 	 */
// 	$.appendWebview = function(options) {
// 		if (!window.plus) {
// 			return;
// 		}
// 		var id = options.id || options.url;
// 		var webview;
// 		if (!$.webviews[id]) { //保证执行一遍
// 			//TODO 这里也有隐患，比如某个webview不是作为subpage创建的，而是作为target webview的话；
// 			webview = plus.webview.create(options.url, id, options.styles, options.extras);
// 			//之前的实现方案：子窗口loaded之后再append到父窗口中；
// 			//问题：部分子窗口loaded事件发生较晚，此时执行父窗口的children方法会返回空，导致父子通讯失败；
// 			//     比如父页面执行完preload事件后，需触发子页面的preload事件，此时未append的话，就无法触发；
// 			//修改方式：不再监控loaded事件，直接append
// 			//by chb@20150521
// 			// webview.addEventListener('loaded', function() {
// 			plus.webview.currentWebview().append(webview);
// 			// });
// 			$.webviews[id] = options;
// 		}
// 		return webview;
// 	};

// 	//全局webviews
// 	$.webviews = {};
// 	//预加载窗口索引
// 	$.data.preloads = [];
// 	//$.currentWebview
// 	$.plusReady(function() {
// 		$.currentWebview = plus.webview.currentWebview();
// 	});
// 	$.registerInit({
// 		name: '5+',
// 		index: 100,
// 		handle: function() {
// 			var options = $.options;
// 			var subpages = options.subpages || [];
// 			if ($.os.plus) {
// 				$.plusReady(function() {
// 					//TODO  这里需要判断一下，最好等子窗口加载完毕后，再调用主窗口的show方法；
// 					//或者：在openwindow方法中，监听实现；
// 					$.each(subpages, function(index, subpage) {
// 						$.appendWebview(subpage);
// 					});
// 					//判断是否首页
// 					if (plus.webview.currentWebview() === plus.webview.getWebviewById(plus.runtime.appid)) {
// 						$.isHomePage = true;
// 						//首页需要自己激活预加载；
// 						//timeout因为子页面loaded之后才append的，防止子页面尚未append、从而导致其preload未触发的问题；
// 						setTimeout(function() {
// 							triggerPreload(plus.webview.currentWebview());
// 						}, 300);
// 					}
// 					//设置ios顶部状态栏颜色；
// 					if ($.os.ios && $.options.statusBarBackground) {
// 						plus.navigator.setStatusBarBackground($.options.statusBarBackground);
// 					}
// 					if ($.os.android && parseFloat($.os.version) < 4.4) {
// 						//解决Android平台4.4版本以下，resume后，父窗体标题延迟渲染的问题；
// 						if (plus.webview.currentWebview().parent() == null) {
// 							document.addEventListener("resume", function() {
// 								var body = document.body;
// 								body.style.display = 'none';
// 								setTimeout(function() {
// 									body.style.display = '';
// 								}, 10);
// 							});
// 						}
// 					}
// 				});
// 			} else {
// 				if (subpages.length > 0) {
// 					var err = document.createElement('div');
// 					err.className = 'mui-error';
// 					//文字描述
// 					var span = document.createElement('span');
// 					span.innerHTML = '在该浏览器下，不支持创建子页面，具体参考';
// 					err.appendChild(span);
// 					var a = document.createElement('a');
// 					a.innerHTML = '"mui框架适用场景"';
// 					a.href = 'http://ask.dcloud.net.cn/article/113';
// 					err.appendChild(a);
// 					document.body.appendChild(err);
// 					console.log('在该浏览器下，不支持创建子页面');
// 				}

// 			}

// 		}
// 	});
// 	window.addEventListener('preload', function() {
// 		//处理预加载部分
// 		var webviews = $.options.preloadPages || [];
// 		$.plusReady(function() {
// 			$.each(webviews, function(index, webview) {
// 				$.createWindow($.extend(webview, {
// 					preload: true
// 				}));
// 			});

// 		});
// 	});
// })(nvui);
// /**
//  * mui back
//  * @param {type} $
//  * @param {type} window
//  * @returns {undefined}
//  */
// (function($, window) {
// 	/**
// 	 * register back
// 	 * @param {type} back
// 	 * @returns {$.gestures}
// 	 */
// 	$.registerBack = function(back) {
// 		return $.registerHandler('backs', back);
// 	};
// 	/**
// 	 * default
// 	 */
// 	$.registerBack({
// 		name: 'browser',
// 		index: 100,
// 		handle: function() {
// 			if (window.history.length > 1) {
// 				window.history.back();
// 				return true;
// 			}
// 			return false;
// 		}
// 	});
// 	/**
// 	 * 后退
// 	 */
// 	$.back = function() {
// 		if (typeof $.options.beforeback === 'function') {
// 			if ($.options.beforeback() === false) {
// 				return;
// 			}
// 		}
// 		$.each($.backs, function(index, back) {
// 			return !back.handle();
// 		});
// 	};
// 	window.addEventListener('tap', function(e) {
// 		var action = $.targets.action;
// 		if (action && action.classList.contains('mui-action-back')) {
// 			$.back();
// 		}
// 	});
// 	window.addEventListener('swiperight', function(e) {
// 		var detail = e.detail;
// 		if ($.options.swipeBack === true && Math.abs(detail.angle) < 3) {
// 			$.back();
// 		}
// 	});
// })(nvui, window);
// /**
//  * mui back 5+
//  * @param {type} $
//  * @param {type} window
//  * @returns {undefined}
//  */
// (function($, window) {
// 	if ($.os.plus && $.os.android) {
// 		$.registerBack({
// 			name: 'mui',
// 			index: 5,
// 			handle: function() {
// 				//popover
// 				if ($.targets._popover && $.targets._popover.classList.contains('mui-active')) {
// 					$($.targets._popover).popover('hide');
// 					return true;
// 				}
// 				//offcanvas
// 				var offCanvas = document.querySelector('.mui-off-canvas-wrap.mui-active');
// 				if (offCanvas) {
// 					$(offCanvas).offCanvas('close');
// 					return true;
// 				}
// 				var previewImage = $.isFunction($.getPreviewImage) && $.getPreviewImage();
// 				if (previewImage && previewImage.isShown()) {
// 					previewImage.close();
// 					return true;
// 				}
// 			}
// 		});
// 	}
// 	/**
// 	 * 5+ back
// 	 */
// 	$.registerBack({
// 		name: '5+',
// 		index: 10,
// 		handle: function() {
// 			if (!window.plus) {
// 				return false;
// 			}
// 			var wobj = plus.webview.currentWebview();
// 			var parent = wobj.parent();
// 			if (parent) {
// 				parent.evalJS('mui&&mui.back();');
// 			} else {
// 				wobj.canBack(function(e) {
// 					//by chb 暂时注释，在碰到类似popover之类的锚点的时候，需多次点击才能返回；
// 					if (e.canBack) { //webview history back
// 						window.history.back();
// 					} else { //webview close or hide
// 						//fixed by fxy 此处不应该用opener判断，因为用户有可能自己close掉当前窗口的opener。这样的话。opener就为空了，导致不能执行close
// 						if (wobj.id === plus.runtime.appid) { //首页
// 							//首页不存在opener的情况下，后退实际上应该是退出应用；
// 							//这个交给项目具体实现，框架暂不处理；
// 							//plus.runtime.quit();	
// 						} else { //其他页面，
// 							if (wobj.preload) {
// 								wobj.hide("auto");
// 							} else {
// 								//关闭页面时，需要将其打开的所有子页面全部关闭；
// 								$.closeAll(wobj);
// 							}
// 						}
// 					}
// 				});
// 			}
// 			return true;
// 		}
// 	});


// 	$.menu = function() {
// 		var menu = document.querySelector('.mui-action-menu');
// 		if (menu) {
// 			$.trigger(menu, 'touchstart'); //临时处理menu无touchstart的话，找不到当前targets的问题
// 			$.trigger(menu, 'tap');
// 		} else { //执行父窗口的menu
// 			if (window.plus) {
// 				var wobj = $.currentWebview;
// 				var parent = wobj.parent();
// 				if (parent) { //又得evalJS
// 					parent.evalJS('mui&&mui.menu();');
// 				}
// 			}
// 		}
// 	};
// 	var __back = function() {
// 		$.back();
// 	};
// 	var __menu = function() {
// 		$.menu();
// 	};
// 	//默认监听
// 	$.plusReady(function() {
// 		if ($.options.keyEventBind.backbutton) {
// 			plus.key.addEventListener('backbutton', __back, false);
// 		}
// 		if ($.options.keyEventBind.menubutton) {
// 			plus.key.addEventListener('menubutton', __menu, false);
// 		}
// 	});
// 	//处理按键监听事件
// 	$.registerInit({
// 		name: 'keyEventBind',
// 		index: 1000,
// 		handle: function() {
// 			$.plusReady(function() {
// 				//如果不为true，则移除默认监听
// 				if (!$.options.keyEventBind.backbutton) {
// 					plus.key.removeEventListener('backbutton', __back);
// 				}
// 				if (!$.options.keyEventBind.menubutton) {
// 					plus.key.removeEventListener('menubutton', __menu);
// 				}
// 			});
// 		}
// 	});
// })(nvui, window);
// /**
//  * mui.init pulldownRefresh
//  * @param {type} $
//  * @returns {undefined}
//  */
// (function($) {
// 	$.registerInit({
// 		name: 'pullrefresh',
// 		index: 1000,
// 		handle: function() {
// 			var options = $.options;
// 			var pullRefreshOptions = options.pullRefresh || {};
// 			var hasPulldown = pullRefreshOptions.down && pullRefreshOptions.down.hasOwnProperty('callback');
// 			var hasPullup = pullRefreshOptions.up && pullRefreshOptions.up.hasOwnProperty('callback');
// 			if (hasPulldown || hasPullup) {
// 				var container = pullRefreshOptions.container;
// 				if (container) {
// 					var $container = $(container);
// 					if ($container.length === 1) {
// 						if ($.os.plus && $.os.android) { //android 5+
// 							$.plusReady(function() {
// 								var webview = plus.webview.currentWebview();
// 								if (hasPullup) {
// 									//当前页面初始化pullup
// 									var upOptions = {};
// 									upOptions.up = pullRefreshOptions.up;
// 									upOptions.webviewId = webview.id || webview.getURL();
// 									$container.pullRefresh(upOptions);
// 								}
// 								if (hasPulldown) {
// 									var parent = webview.parent();
// 									var id = webview.id || webview.getURL();
// 									if (parent) {
// 										if (!hasPullup) { //如果没有上拉加载，需要手动初始化一个默认的pullRefresh，以便当前页面容器可以调用endPulldownToRefresh等方法
// 											$container.pullRefresh({
// 												webviewId: id
// 											});
// 										}
// 										var downOptions = {
// 											webviewId: id
// 										};
// 										downOptions.down = $.extend({}, pullRefreshOptions.down);
// 										downOptions.down.callback = '_CALLBACK';
// 										//父页面初始化pulldown
// 										parent.evalJS("mui&&mui(document.querySelector('.mui-content')).pullRefresh('" + JSON.stringify(downOptions) + "')");
// 									}
// 								}
// 							});
// 						} else {
// 							$container.pullRefresh(pullRefreshOptions);
// 						}
// 					}
// 				}
// 			}
// 		}
// 	});
// })(nvui);
// $.param = function(obj, traditional) {
// 	var params = [];
// 	params.add = function(k, v) {
// 		this.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
// 	};
// 	serialize(params, obj, traditional);
// 	return params.join('&').replace(/%20/g, '+');
// };
/**
 * nvui layout(offset[,position,width,height...])
 * @param {type} $
 * @param {type} window
 * @param {type} undefined
 * @returns {undefined}
 */
(function($, window, undefined) {
	$.offset = function(element) {
		var box = {
			top: 0,
			left: 0
		};
		if (typeof element.getBoundingClientRect !== undefined) {
			box = element.getBoundingClientRect();
		}
		return {
			top: box.top + window.pageYOffset - element.clientTop,
			left: box.left + window.pageXOffset - element.clientLeft
		};
	};
})(nvui, window);
/**
 * nvui animation
 */
(function($, window) {
	/**
	 * scrollTo
	 */
	$.scrollTo = function(scrollTop, duration, callback) {
		duration = duration || 1000;
		var scroll = function(duration) {
			if (duration <= 0) {
				window.scrollTo(0, scrollTop);
				callback && callback();
				return;
			}
			var distaince = scrollTop - window.scrollY;
			setTimeout(function() {
				window.scrollTo(0, window.scrollY + distaince / duration * 10);
				scroll(duration - 10);
			}, 16.7);
		};
		scroll(duration);
	};
	$.animationFrame = function(cb) {
		var args, isQueued, context;
		return function() {
			args = arguments;
			context = this;
			if (!isQueued) {
				isQueued = true;
				requestAnimationFrame(function() {
					cb.apply(context, args);
					isQueued = false;
				});
			}
		};
	};
})(nvui, window);

(function($) {
	var initializing = false,
		fnTest = /xyz/.test(function() {
			xyz;
		}) ? /\b_super\b/ : /.*/;

	var Class = function() {};
	Class.extend = function(prop) {
		var _super = this.prototype;
		initializing = true;
		var prototype = new this();
		initializing = false;
		for (var name in prop) {
			prototype[name] = typeof prop[name] == "function" &&
				typeof _super[name] == "function" && fnTest.test(prop[name]) ?
				(function(name, fn) {
					return function() {
						var tmp = this._super;

						this._super = _super[name];

						var ret = fn.apply(this, arguments);
						this._super = tmp;

						return ret;
					};
				})(name, prop[name]) :
				prop[name];
		}

		function Class() {
			if (!initializing && this.init)
				this.init.apply(this, arguments);
		}
		Class.prototype = prototype;
		Class.prototype.constructor = Class;
		Class.extend = arguments.callee;
		return Class;
	};
	$.Class = Class;
})(nvui);

// /**
//  * Popovers
//  * @param {type} $
//  * @param {type} window
//  * @param {type} document
//  * @param {type} name
//  * @param {type} undefined
//  * @returns {undefined}
//  */
// (function($, window, document, name) {

// 	var CLASS_POPOVER = 'mui-popover';
// 	var CLASS_POPOVER_ARROW = 'mui-popover-arrow';
// 	var CLASS_ACTION_POPOVER = 'mui-popover-action';
// 	var CLASS_BACKDROP = 'mui-backdrop';
// 	var CLASS_BAR_POPOVER = 'mui-bar-popover';
// 	var CLASS_BAR_BACKDROP = 'mui-bar-backdrop';
// 	var CLASS_ACTION_BACKDROP = 'mui-backdrop-action';
// 	var CLASS_ACTIVE = 'mui-active';
// 	var CLASS_BOTTOM = 'mui-bottom';



// 	var handle = function(event, target) {
// 		if (target.tagName === 'A' && target.hash) {
// 			$.targets._popover = document.getElementById(target.hash.replace('#', ''));
// 			if ($.targets._popover && $.targets._popover.classList.contains(CLASS_POPOVER)) {
// 				return target;
// 			} else {
// 				$.targets._popover = null;
// 			}
// 		}
// 		return false;
// 	};

// 	$.registerTarget({
// 		name: name,
// 		index: 60,
// 		handle: handle,
// 		target: false,
// 		isReset: false,
// 		isContinue: true
// 	});

// 	var fixedPopoverScroll = function(isPopoverScroll) {
// 		//		if (isPopoverScroll) {
// 		//			document.body.setAttribute('style', 'overflow:hidden;');
// 		//		} else {
// 		//			document.body.setAttribute('style', '');
// 		//		}
// 	};
// 	var onPopoverShown = function(e) {
// 		this.removeEventListener('webkitTransitionEnd', onPopoverShown);
// 		this.addEventListener('touchmove', $.preventDefault);
// 		$.trigger(this, 'shown', this);
// 	}
// 	var onPopoverHidden = function(e) {
// 		setStyle(this, 'none');
// 		this.removeEventListener('webkitTransitionEnd', onPopoverHidden);
// 		this.removeEventListener('touchmove', $.preventDefault);
// 		fixedPopoverScroll(false);
// 		$.trigger(this, 'hidden', this);
// 	};

// 	var backdrop = (function() {
// 		var element = document.createElement('div');
// 		element.classList.add(CLASS_BACKDROP);
// 		element.addEventListener('touchmove', $.preventDefault);
// 		element.addEventListener('tap', function(e) {
// 			var popover = $.targets._popover;
// 			if (popover) {
// 				popover.addEventListener('webkitTransitionEnd', onPopoverHidden);
// 				popover.classList.remove(CLASS_ACTIVE);
// 				removeBackdrop(popover);
// 				document.body.setAttribute('style', ''); //webkitTransitionEnd有时候不触发？
// 			}
// 		});

// 		return element;
// 	}());
// 	var removeBackdrop = function(popover) {
// 		backdrop.setAttribute('style', 'opacity:0');
// 		$.targets.popover = $.targets._popover = null; //reset
// 		setTimeout(function() {
// 			if (!popover.classList.contains(CLASS_ACTIVE) && backdrop.parentNode && backdrop.parentNode === document.body) {
// 				document.body.removeChild(backdrop);
// 			}
// 		}, 350);
// 	};
// 	window.addEventListener('tap', function(e) {
// 		if (!$.targets.popover) {
// 			return;
// 		}
// 		var toggle = false;
// 		var target = e.target;
// 		for (; target && target !== document; target = target.parentNode) {
// 			if (target === $.targets.popover) {
// 				toggle = true;
// 			}
// 		}
// 		if (toggle) {
// 			e.detail.gesture.preventDefault(); //fixed hashchange
// 			togglePopover($.targets._popover, $.targets.popover);
// 		}

// 	});

// 	var togglePopover = function(popover, anchor) {
// 		//remove一遍，以免来回快速切换，导致webkitTransitionEnd不触发，无法remove
// 		popover.removeEventListener('webkitTransitionEnd', onPopoverShown);
// 		popover.removeEventListener('webkitTransitionEnd', onPopoverHidden);
// 		backdrop.classList.remove(CLASS_BAR_BACKDROP);
// 		backdrop.classList.remove(CLASS_ACTION_BACKDROP);
// 		var _popover = document.querySelector('.mui-popover.mui-active');
// 		if (_popover) {
// 			//			_popover.setAttribute('style', '');
// 			_popover.addEventListener('webkitTransitionEnd', onPopoverHidden);
// 			_popover.classList.remove(CLASS_ACTIVE);
// 			//			_popover.removeEventListener('webkitTransitionEnd', onPopoverHidden);
// 			//			fixedPopoverScroll(false);
// 			//同一个弹出则直接返回，解决同一个popover的toggle
// 			if (popover === _popover) {
// 				removeBackdrop(_popover);
// 				return;
// 			}
// 		}
// 		var isActionSheet = false;
// 		if (popover.classList.contains(CLASS_BAR_POPOVER) || popover.classList.contains(CLASS_ACTION_POPOVER)) { //navBar
// 			if (popover.classList.contains(CLASS_ACTION_POPOVER)) { //action sheet popover
// 				isActionSheet = true;
// 				backdrop.classList.add(CLASS_ACTION_BACKDROP);
// 			} else { //bar popover
// 				backdrop.classList.add(CLASS_BAR_BACKDROP);
// 				//				if (anchor) {
// 				//					if (anchor.parentNode) {
// 				//						var offsetWidth = anchor.offsetWidth;
// 				//						var offsetLeft = anchor.offsetLeft;
// 				//						var innerWidth = window.innerWidth;
// 				//						popover.style.left = (Math.min(Math.max(offsetLeft, defaultPadding), innerWidth - offsetWidth - defaultPadding)) + "px";
// 				//					} else {
// 				//						//TODO anchor is position:{left,top,bottom,right}
// 				//					}
// 				//				}
// 			}
// 		}
// 		setStyle(popover, 'block'); //actionsheet transform
// 		popover.offsetHeight;
// 		popover.classList.add(CLASS_ACTIVE);
// 		backdrop.setAttribute('style', '');
// 		document.body.appendChild(backdrop);
// 		fixedPopoverScroll(true);
// 		calPosition(popover, anchor, isActionSheet); //position
// 		backdrop.classList.add(CLASS_ACTIVE);
// 		popover.addEventListener('webkitTransitionEnd', onPopoverShown);
// 	};
// 	var setStyle = function(popover, display, top, left) {
// 		var style = popover.style;
// 		if (typeof display !== 'undefined')
// 			style.display = display;
// 		if (typeof top !== 'undefined')
// 			style.top = top + 'px';
// 		if (typeof left !== 'undefined')
// 			style.left = left + 'px';
// 	};
// 	var calPosition = function(popover, anchor, isActionSheet) {
// 		if (!popover || !anchor) {
// 			return;
// 		}

// 		if (isActionSheet) { //actionsheet
// 			setStyle(popover, 'block')
// 			return;
// 		}

// 		var wWidth = window.innerWidth;
// 		var wHeight = window.innerHeight;

// 		var pWidth = popover.offsetWidth;
// 		var pHeight = popover.offsetHeight;

// 		var aWidth = anchor.offsetWidth;
// 		var aHeight = anchor.offsetHeight;
// 		var offset = $.offset(anchor);

// 		var arrow = popover.querySelector('.' + CLASS_POPOVER_ARROW);
// 		if (!arrow) {
// 			arrow = document.createElement('div');
// 			arrow.className = CLASS_POPOVER_ARROW;
// 			popover.appendChild(arrow);
// 		}
// 		var arrowSize = arrow && arrow.offsetWidth / 2 || 0;



// 		var pTop = 0;
// 		var pLeft = 0;
// 		var diff = 0;
// 		var arrowLeft = 0;
// 		var defaultPadding = popover.classList.contains(CLASS_ACTION_POPOVER) ? 0 : 5;

// 		var position = 'top';
// 		if ((pHeight + arrowSize) < (offset.top - window.pageYOffset)) { //top
// 			pTop = offset.top - pHeight - arrowSize;
// 		} else if ((pHeight + arrowSize) < (wHeight - (offset.top - window.pageYOffset) - aHeight)) { //bottom
// 			position = 'bottom';
// 			pTop = offset.top + aHeight + arrowSize;
// 		} else { //middle
// 			position = 'middle';
// 			pTop = Math.max((wHeight - pHeight) / 2 + window.pageYOffset, 0);
// 			pLeft = Math.max((wWidth - pWidth) / 2 + window.pageXOffset, 0);
// 		}
// 		if (position === 'top' || position === 'bottom') {
// 			pLeft = aWidth / 2 + offset.left - pWidth / 2;
// 			diff = pLeft;
// 			if (pLeft < defaultPadding) pLeft = defaultPadding;
// 			if (pLeft + pWidth > wWidth) pLeft = wWidth - pWidth - defaultPadding;

// 			if (arrow) {
// 				if (position === 'top') {
// 					arrow.classList.add(CLASS_BOTTOM);
// 				} else {
// 					arrow.classList.remove(CLASS_BOTTOM);
// 				}
// 				diff = diff - pLeft;
// 				arrowLeft = (pWidth / 2 - arrowSize / 2 + diff);
// 				arrowLeft = Math.max(Math.min(arrowLeft, pWidth - arrowSize * 2 - 6), 6);
// 				arrow.setAttribute('style', 'left:' + arrowLeft + 'px');
// 			}
// 		} else if (position === 'middle') {
// 			arrow.setAttribute('style', 'display:none');
// 		}
// 		setStyle(popover, 'block', pTop, pLeft);
// 	};

// 	$.createMask = function(callback) {
// 		var element = document.createElement('div');
// 		element.classList.add(CLASS_BACKDROP);
// 		element.addEventListener('touchmove', $.preventDefault);
// 		element.addEventListener('tap', function() {
// 			mask.close();
// 		});
// 		var mask = [element];
// 		mask._show = false;
// 		mask.show = function() {
// 			mask._show = true;
// 			element.setAttribute('style', 'opacity:1');
// 			document.body.appendChild(element);
// 			return mask;
// 		};
// 		mask._remove = function() {
// 			if (mask._show) {
// 				mask._show = false;
// 				element.setAttribute('style', 'opacity:0');
// 				$.later(function() {
// 					var body = document.body;
// 					element.parentNode === body && body.removeChild(element);
// 				}, 350);
// 			}
// 			return mask;
// 		};
// 		mask.close = function() {
// 			if (callback) {
// 				if (callback() !== false) {
// 					mask._remove();
// 				}
// 			} else {
// 				mask._remove();
// 			}
// 		};
// 		return mask;
// 	};
// 	$.fn.popover = function() {
// 		var args = arguments;
// 		this.each(function() {
// 			$.targets._popover = this;
// 			if (args[0] === 'show' || args[0] === 'hide' || args[0] === 'toggle') {
// 				togglePopover(this, args[1]);
// 			}
// 		});
// 	};

// })(nvui, window, document, 'popover');
(function($, window) {
	/**
	 * 警告消息框
	 */
	$.alert = function(message, title, btnValue, callback) {
		if ($.os.plus) {
			if (typeof message === undefined) {
				return;
			} else {
				if (typeof title === 'function') {
					callback = title;
					title = null;
					btnValue = '确定';
				} else if (typeof btnValue === 'function') {
					callback = btnValue;
					btnValue = null;
				}
				plus.nativeUI.alert(message, callback, title, btnValue);
			}

		} else {
			//TODO H5版本
			window.alert(message);
		}
	};

})(nvui, window);
(function($, window) {
	/**
	 * 确认消息框
	 */
	$.confirm = function(message, title, btnArray, callback) {
		if ($.os.plus) {
			if (typeof message === undefined) {
				return;
			} else {
				if (typeof title === 'function') {
					callback = title;
					title = null;
					btnArray = null;
				} else if (typeof btnArray === 'function') {
					callback = btnArray;
					btnArray = null;
				}
				plus.nativeUI.confirm(message, callback, title, btnArray);
			}

		} else {
			//H5版本，0为确认，1为取消
			if (window.confirm(message)) {
				callback({
					index: 0
				});
			} else {
				callback({
					index: 1
				});
			}
		}
	};

})(nvui, window);
(function($, window) {
	/**
	 * 输入对话框
	 */
	$.prompt = function(text, defaultText, title, btnArray, callback) {
		if ($.os.plus) {
			if (typeof message === undefined) {
				return;
			} else {

				if (typeof defaultText === 'function') {
					callback = defaultText;
					defaultText = null;
					title = null;
					btnArray = null;
				} else if (typeof title === 'function') {
					callback = title;
					title = null;
					btnArray = null;
				} else if (typeof btnArray === 'function') {
					callback = btnArray;
					btnArray = null;
				}
				plus.nativeUI.prompt(text, callback, title, defaultText, btnArray);
			}

		} else {
			//H5版本(确认index为0，取消index为1)
			var result = window.prompt(text);
			if (result) {
				callback({
					index: 0,
					value: result
				});
			} else {
				callback({
					index: 1,
					value: ''
				});
			}
		}
	};

})(nvui, window);
(function($, window) {
	/**
	 * 自动消失提示框
	 */
	$.toast = function(message) {
		if ($.os.plus) {
			//默认显示在底部；
			plus.nativeUI.toast(message, {
				verticalAlign: 'bottom'
			});
		} else {
			var toast = document.createElement('div');
			toast.classList.add('nvui-toast-container');
			toast.innerHTML = '<div class="' + 'nvui-toast-message' + '">' + message + '</div>';
			document.body.appendChild(toast);
			setTimeout(function() {
				document.body.removeChild(toast);
			}, 2000);
		}
	};
})(nvui, window);
/**
 * Input(TODO resize)
 * @param {type} $
 * @param {type} window
 * @param {type} document
 * @returns {undefined}
 */
(function($, window, document) {
	var CLASS_ICON = 'nvui-icon';
	var CLASS_ICON_CLEAR = 'nvui-icon-clear';
	var CLASS_ICON_SPEECH = 'nvui-icon-speech';
	var CLASS_ICON_SEARCH = 'nvui-icon-search';
	var CLASS_INPUT_ROW = 'nvui-input-row';
	var CLASS_PLACEHOLDER = 'nvui-placeholder';
	var CLASS_TOOLTIP = 'nvui-tooltip';
	var CLASS_HIDDEN = 'nvui-hidden';
	var CLASS_FOCUSIN = 'nvui-focusin';
	var SELECTOR_ICON_CLOSE = '.' + CLASS_ICON_CLEAR;
	var SELECTOR_ICON_SPEECH = '.' + CLASS_ICON_SPEECH;
	var SELECTOR_PLACEHOLDER = '.' + CLASS_PLACEHOLDER;
	var SELECTOR_TOOLTIP = '.' + CLASS_TOOLTIP;

	var findRow = function(target) {
		for (; target && target !== document; target = target.parentNode) {
			if (target.classList && target.classList.contains(CLASS_INPUT_ROW)) {
				return target;
			}
		}
		return null;
	};
	var Input = function(element, options) {
		this.element = element;
		this.options = options || {
			actions: 'clear'
		};
		if (~this.options.actions.indexOf('slider')) { //slider
			this.sliderActionClass = CLASS_TOOLTIP + ' ' + CLASS_HIDDEN;
			this.sliderActionSelector = SELECTOR_TOOLTIP;
		} else { //clear,speech,search
			if (~this.options.actions.indexOf('clear')) {
				this.clearActionClass = CLASS_ICON + ' ' + CLASS_ICON_CLEAR +' '+ CLASS_HIDDEN;
				this.clearActionSelector = SELECTOR_ICON_CLOSE;
			}
			if (~this.options.actions.indexOf('speech')) { //only for 5+
				this.speechActionClass = CLASS_ICON + ' ' + CLASS_ICON_SPEECH;
				this.speechActionSelector = SELECTOR_ICON_SPEECH;
			}
			if (~this.options.actions.indexOf('search')) {
				this.searchActionClass = CLASS_PLACEHOLDER;
				this.searchActionSelector = SELECTOR_PLACEHOLDER;
			}
		}
		this.init();
	};
	Input.prototype.init = function() {
		this.initAction();
		this.initElementEvent();
	};
	Input.prototype.initAction = function() {
		var self = this;

		var row = self.element.parentNode;
		if (row) {
			if (self.sliderActionClass) {
				self.sliderAction = self.createAction(row, self.sliderActionClass, self.sliderActionSelector);
			} else {
				if (self.searchActionClass) {
					self.searchAction = self.createAction(row, self.searchActionClass, self.searchActionSelector);
					self.searchAction.addEventListener('tap', function(e) {
						$.focus(self.element);
						e.stopPropagation();
					});
				}
				if (self.speechActionClass) {
					self.speechAction = self.createAction(row, self.speechActionClass, self.speechActionSelector);
					self.speechAction.addEventListener('click', $.stopPropagation);
					self.speechAction.addEventListener('tap', function(event) {
						self.speechActionClick(event);
					});
				}
				if (self.clearActionClass) {
					self.clearAction = self.createAction(row, self.clearActionClass, self.clearActionSelector);
					self.clearAction.addEventListener('tap', function(event) {
						self.clearActionClick(event);
					});

				}
			}
		}
	};
	Input.prototype.createAction = function(row, actionClass, actionSelector) {
		var action = row.querySelector(actionSelector);
		if (!action) {
			var action = document.createElement('span');
			action.className = actionClass;
			if (actionClass === this.searchActionClass) {
				action.innerHTML = '<span class="' + CLASS_ICON + ' ' + CLASS_ICON_SEARCH + '"></span><span>' + this.element.getAttribute('placeholder') + '</span>';
				this.element.setAttribute('placeholder', '');
				if (this.element.value.trim()) {
					row.classList.add('nvui-active');
				}
			}
			row.insertBefore(action, this.element.nextSibling);
		}
		return action;
	};
	Input.prototype.initElementEvent = function() {
		var element = this.element;

		if (this.sliderActionClass) {
			var tooltip = this.sliderAction;
			//TODO resize
			var offsetLeft = element.offsetLeft;
			var width = element.offsetWidth - 28;
			var tooltipWidth = tooltip.offsetWidth;
			var distince = Math.abs(element.max - element.min);

			var timer = null;
			var showTip = function() {
				tooltip.classList.remove(CLASS_HIDDEN);
				tooltipWidth = tooltipWidth || tooltip.offsetWidth;
				var scaleWidth = Math.abs(element.value) / distince * width;
				tooltip.style.left = (14 + offsetLeft + scaleWidth - tooltipWidth / 2) + 'px';
				tooltip.innerText = element.value;
				if (timer) {
					clearTimeout(timer);
				}
				timer = setTimeout(function() {
					tooltip.classList.add(CLASS_HIDDEN);
				}, 1000);
			};
			element.addEventListener('input', showTip);
			element.addEventListener('tap', showTip);
			element.addEventListener('touchmove', function(e) {
				e.stopPropagation();
			});
		} else {
			if (this.clearActionClass) {
				var action = this.clearAction;
				if (!action) {
					return;
				}
				$.each(['keyup', 'change', 'input', 'focus', 'cut', 'paste'], function(index, type) {
					(function(type) {
						element.addEventListener(type, function() {
							action.classList[element.value.trim() ? 'remove' : 'add'](CLASS_HIDDEN);
						});
					})(type);
				});
				element.addEventListener('blur', function() {
					action.classList.add(CLASS_HIDDEN);
				});
			}
			if (this.searchActionClass) {
				element.addEventListener('focus', function() {
					element.parentNode.classList.add('nvui-active');
				});
				element.addEventListener('blur', function() {
					if (!element.value.trim()) {
						element.parentNode.classList.remove('nvui-active');
					}
				});
			}
		}
	};
	Input.prototype.setPlaceholder = function(text) {
		if (this.searchActionClass) {
			var placeholder = this.element.parentNode.querySelector(SELECTOR_PLACEHOLDER);
			placeholder && (placeholder.getElementsByTagName('span')[1].innerText = text);
		} else {
			this.element.setAttribute('placeholder', text);
		}
	};
	Input.prototype.clearActionClick = function(event) {
		var self = this;
		self.element.value = '';
		$.focus(self.element);
		self.clearAction.classList.add(CLASS_HIDDEN);
		event.preventDefault();
	};
	Input.prototype.speechActionClick = function(event) {
		if (window.plus) {
			var self = this;
			var oldValue = self.element.value;
			self.element.value = '';
			document.body.classList.add(CLASS_FOCUSIN);
			plus.speech.startRecognize({
				engine: 'iFly'
			}, function(s) {
				self.element.value += s;
				$.focus(self.element);
				plus.speech.stopRecognize();
				$.trigger(self.element, 'recognized', {
					value: self.element.value
				});
				if (oldValue !== self.element.value) {
					$.trigger(self.element, 'change');
					$.trigger(self.element, 'input');
				}
				// document.body.classList.remove(CLASS_FOCUSIN);
			}, function(e) {
				document.body.classList.remove(CLASS_FOCUSIN);
			});
		} else {
			alert('only for 5+');
		}
		event.preventDefault();
	};
	$.fn.input = function(options) {
		var inputApis = [];
		this.each(function() {
			var inputApi = null;
			var actions = [];
			var row = findRow(this.parentNode);
			if (this.type === 'range' && row.classList.contains('nvui-input-range')) {
				actions.push('slider');
			} else {
				var classList = this.classList;
				if (classList.contains('nvui-input-clear')) {
					actions.push('clear');
				}
				if (classList.contains('nvui-input-speech')) {
					actions.push('speech');
				}
				if (this.type === 'search' && row.classList.contains('nvui-search')) {
					actions.push('search');
				}
			}
			var id = this.getAttribute('data-input-' + actions[0]);
			if (!id) {
				id = ++$.uuid;
				inputApi = $.data[id] = new Input(this, {
					actions: actions.join(',')
				});
				for (var i = 0, len = actions.length; i < len; i++) {
					this.setAttribute('data-input-' + actions[i], id);
				}
			} else {
				inputApi = $.data[id];
			}
			inputApis.push(inputApi);
		});
		return inputApis.length === 1 ? inputApis[0] : inputApis;
	};
	$.ready(function() {
		$('.nvui-input-row input').input();
	});
})(nvui, window, document);
// /**
//  * 数字输入框
//  * varstion 1.0.1
//  * by Houfeng
//  * Houfeng@DCloud.io
//  */

// (function($) {

// 	var touchSupport = ('ontouchstart' in document);
// 	var tapEventName = touchSupport ? 'tap' : 'click';
// 	var changeEventName = 'change';
// 	var holderClassName = 'mui-numbox';
// 	var plusClassName = 'mui-numbox-btn-plus';
// 	var minusClassName = 'mui-numbox-btn-minus';
// 	var inputClassName = 'mui-numbox-input';

// 	var Numbox = $.Numbox = $.Class.extend({
// 		init: function(holder, options) {
// 			var self = this;
// 			if (!holder) {
// 				throw "构造 numbox 时缺少容器元素";
// 			}
// 			self.holder = holder;
// 			//避免重复初始化开始
// 			if (self.holder.__numbox_inited) return;
// 			self.holder.__numbox_inited = true;
// 			//避免重复初始化结束
// 			options = options || {};
// 			options.step = parseInt(options.step || 1);
// 			self.options = options;
// 			self.input = $.qsa('.' + inputClassName, self.holder)[0];
// 			self.plus = $.qsa('.' + plusClassName, self.holder)[0];
// 			self.minus = $.qsa('.' + minusClassName, self.holder)[0];
// 			self.checkValue();
// 			self.initEvent();
// 		},
// 		initEvent: function() {
// 			var self = this;
// 			self.plus.addEventListener(tapEventName, function(event) {
// 				var val = parseInt(self.input.value) + self.options.step;
// 				self.input.value = val.toString();
// 				$.trigger(self.input, changeEventName, null);
// 			});
// 			self.minus.addEventListener(tapEventName, function(event) {
// 				var val = parseInt(self.input.value) - self.options.step;
// 				self.input.value = val.toString();
// 				$.trigger(self.input, changeEventName, null);
// 			});
// 			self.input.addEventListener(changeEventName, function(event) {
// 				self.checkValue();
// 			});
// 		},
// 		checkValue: function() {
// 			var self = this;
// 			var val = self.input.value;
// 			if (val == null || val == '' || isNaN(val)) {
// 				self.input.value = self.options.min || 0;
// 				self.minus.disabled = self.options.min != null;
// 			} else {
// 				var val = parseInt(val);
// 				if (self.options.max != null && !isNaN(self.options.max) && val >= parseInt(self.options.max)) {
// 					val = self.options.max;
// 					self.plus.disabled = true;
// 				} else {
// 					self.plus.disabled = false;
// 				}
// 				if (self.options.min != null && !isNaN(self.options.min) && val <= parseInt(self.options.min)) {
// 					val = self.options.min;
// 					self.minus.disabled = true;
// 				} else {
// 					self.minus.disabled = false;
// 				}
// 				self.input.value = val;
// 			}
// 		}
// 	});

// 	$.fn.numbox = function(options) {
// 		//遍历选择的元素
// 		this.each(function(i, element) {
// 			if (options) {
// 				new Numbox(element, options);
// 			} else {
// 				var optionsText = element.getAttribute('data-numbox-options');
// 				var options = optionsText ? JSON.parse(optionsText) : {};
// 				options.step = element.getAttribute('data-numbox-step') || options.step;
// 				options.min = element.getAttribute('data-numbox-min') || options.min;
// 				options.max = element.getAttribute('data-numbox-max') || options.max;
// 				new Numbox(element, options);
// 			}
// 		});
// 		return this;
// 	}

// 	//自动处理 class='mui-locker' 的 dom
// 	$.ready(function() {
// 		$('.' + holderClassName).numbox();
// 	});
// }(nvui))