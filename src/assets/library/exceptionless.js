// TODO: There should be nothing in this assets folder.. This should be pulled from NPM.
/**
 * https://github.com/csnover/TraceKit
 * @license MIT
 * @namespace TraceKit
 */
(function(window, undefined) {
if (!window) {
    return;
}

var TraceKit = {};
var _oldTraceKit = window.TraceKit;

// global reference to slice
var _slice = [].slice;
var UNKNOWN_FUNCTION = '?';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Error_types
var ERROR_TYPES_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/;

/**
 * A better form of hasOwnProperty<br/>
 * Example: `_has(MainHostObject, property) === true/false`
 *
 * @param {Object} object to check property
 * @param {string} key to check
 * @return {Boolean} true if the object has the key and it is not inherited
 */
function _has(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
}

/**
 * Returns true if the parameter is undefined<br/>
 * Example: `_isUndefined(val) === true/false`
 *
 * @param {*} what Value to check
 * @return {Boolean} true if undefined and false otherwise
 */
function _isUndefined(what) {
    return typeof what === 'undefined';
}

/**
 * Export TraceKit out to another variable<br/>
 * Example: `var TK = TraceKit.noConflict()`
 * @return {Object} The TraceKit object
 * @memberof TraceKit
 */
TraceKit.noConflict = function noConflict() {
    window.TraceKit = _oldTraceKit;
    return TraceKit;
};

/**
 * Wrap any function in a TraceKit reporter<br/>
 * Example: `func = TraceKit.wrap(func);`
 *
 * @param {Function} func Function to be wrapped
 * @return {Function} The wrapped func
 * @memberof TraceKit
 */
TraceKit.wrap = function traceKitWrapper(func) {
    function wrapped() {
        try {
            return func.apply(this, arguments);
        } catch (e) {
            TraceKit.report(e);
            throw e;
        }
    }
    return wrapped;
};

/**
 * Cross-browser processing of unhandled exceptions
 *
 * Syntax:
 * ```js
 *   TraceKit.report.subscribe(function(stackInfo) { ... })
 *   TraceKit.report.unsubscribe(function(stackInfo) { ... })
 *   TraceKit.report(exception)
 *   try { ...code... } catch(ex) { TraceKit.report(ex); }
 * ```
 *
 * Supports:
 *   - Firefox: full stack trace with line numbers, plus column number
 *     on top frame; column number is not guaranteed
 *   - Opera: full stack trace with line and column numbers
 *   - Chrome: full stack trace with line and column numbers
 *   - Safari: line and column number for the top frame only; some frames
 *     may be missing, and column number is not guaranteed
 *   - IE: line and column number for the top frame only; some frames
 *     may be missing, and column number is not guaranteed
 *
 * In theory, TraceKit should work on all of the following versions:
 *   - IE5.5+ (only 8.0 tested)
 *   - Firefox 0.9+ (only 3.5+ tested)
 *   - Opera 7+ (only 10.50 tested; versions 9 and earlier may require
 *     Exceptions Have Stacktrace to be enabled in opera:config)
 *   - Safari 3+ (only 4+ tested)
 *   - Chrome 1+ (only 5+ tested)
 *   - Konqueror 3.5+ (untested)
 *
 * Requires TraceKit.computeStackTrace.
 *
 * Tries to catch all unhandled exceptions and report them to the
 * subscribed handlers. Please note that TraceKit.report will rethrow the
 * exception. This is REQUIRED in order to get a useful stack trace in IE.
 * If the exception does not reach the top of the browser, you will only
 * get a stack trace from the point where TraceKit.report was called.
 *
 * Handlers receive a TraceKit.StackTrace object as described in the
 * TraceKit.computeStackTrace docs.
 *
 * @memberof TraceKit
 * @namespace
 */
TraceKit.report = (function reportModuleWrapper() {
    var handlers = [],
        lastException = null,
        lastExceptionStack = null;

    /**
     * Add a crash handler.
     * @param {Function} handler
     * @memberof TraceKit.report
     */
    function subscribe(handler) {
        installGlobalHandler();
        handlers.push(handler);
    }

    /**
     * Remove a crash handler.
     * @param {Function} handler
     * @memberof TraceKit.report
     */
    function unsubscribe(handler) {
        for (var i = handlers.length - 1; i >= 0; --i) {
            if (handlers[i] === handler) {
                handlers.splice(i, 1);
            }
        }

        if (handlers.length === 0) {
            window.onerror = _oldOnerrorHandler;
            _onErrorHandlerInstalled = false;
        }
    }

    /**
     * Dispatch stack information to all handlers.
     * @param {TraceKit.StackTrace} stack
     * @param {boolean} isWindowError Is this a top-level window error?
     * @param {Error=} error The error that's being handled (if available, null otherwise)
     * @memberof TraceKit.report
     * @throws An exception if an error occurs while calling an handler.
     */
    function notifyHandlers(stack, isWindowError, error) {
        var exception = null;
        if (isWindowError && !TraceKit.collectWindowErrors) {
          return;
        }
        for (var i in handlers) {
            if (_has(handlers, i)) {
                try {
                    handlers[i](stack, isWindowError, error);
                } catch (inner) {
                    exception = inner;
                }
            }
        }

        if (exception) {
            throw exception;
        }
    }

    var _oldOnerrorHandler, _onErrorHandlerInstalled;

    /**
     * Ensures all global unhandled exceptions are recorded.
     * Supported by Gecko and IE.
     * @param {string} message Error message.
     * @param {string} url URL of script that generated the exception.
     * @param {(number|string)} lineNo The line number at which the error occurred.
     * @param {(number|string)=} columnNo The column number at which the error occurred.
     * @param {Error=} errorObj The actual Error object.
     * @memberof TraceKit.report
     */
    function traceKitWindowOnError(message, url, lineNo, columnNo, errorObj) {
        var stack = null;

        if (lastExceptionStack) {
            TraceKit.computeStackTrace.augmentStackTraceWithInitialElement(lastExceptionStack, url, lineNo, message);
    	    processLastException();
        } else if (errorObj) {
            stack = TraceKit.computeStackTrace(errorObj);
            notifyHandlers(stack, true, errorObj);
        } else {
            var location = {
              'url': url,
              'line': lineNo,
              'column': columnNo
            };

            var name;
            var msg = message; // must be new var or will modify original `arguments`
            if ({}.toString.call(message) === '[object String]') {
                var groups = message.match(ERROR_TYPES_RE);
                if (groups) {
                    name = groups[1];
                    msg = groups[2];
                }
            }

            location.func = TraceKit.computeStackTrace.guessFunctionName(location.url, location.line);
            location.context = TraceKit.computeStackTrace.gatherContext(location.url, location.line);
            stack = {
                'name': name,
                'message': msg,
                'mode': 'onerror',
                'stack': [location]
            };

            notifyHandlers(stack, true, null);
        }

        if (_oldOnerrorHandler) {
            return _oldOnerrorHandler.apply(this, arguments);
        }

        return false;
    }

    /**
     * Install a global onerror handler
     * @memberof TraceKit.report
     */
    function installGlobalHandler() {
        if (_onErrorHandlerInstalled === true) {
            return;
        }

        _oldOnerrorHandler = window.onerror;
        window.onerror = traceKitWindowOnError;
        _onErrorHandlerInstalled = true;
    }

    /**
     * Process the most recent exception
     * @memberof TraceKit.report
     */
    function processLastException() {
        var _lastExceptionStack = lastExceptionStack,
            _lastException = lastException;
        lastExceptionStack = null;
        lastException = null;
        notifyHandlers(_lastExceptionStack, false, _lastException);
    }

    /**
     * Reports an unhandled Error to TraceKit.
     * @param {Error} ex
     * @memberof TraceKit.report
     * @throws An exception if an incomplete stack trace is detected (old IE browsers).
     */
    function report(ex) {
        if (lastExceptionStack) {
            if (lastException === ex) {
                return; // already caught by an inner catch block, ignore
            } else {
              processLastException();
            }
        }

        var stack = TraceKit.computeStackTrace(ex);
        lastExceptionStack = stack;
        lastException = ex;

        // If the stack trace is incomplete, wait for 2 seconds for
        // slow slow IE to see if onerror occurs or not before reporting
        // this exception; otherwise, we will end up with an incomplete
        // stack trace
        setTimeout(function () {
            if (lastException === ex) {
                processLastException();
            }
        }, (stack.incomplete ? 2000 : 0));

        throw ex; // re-throw to propagate to the top level (and cause window.onerror)
    }

    report.subscribe = subscribe;
    report.unsubscribe = unsubscribe;
    return report;
}());

/**
 * An object representing a single stack frame.
 * @typedef {Object} StackFrame
 * @property {string} url The JavaScript or HTML file URL.
 * @property {string} func The function name, or empty for anonymous functions (if guessing did not work).
 * @property {string[]?} args The arguments passed to the function, if known.
 * @property {number=} line The line number, if known.
 * @property {number=} column The column number, if known.
 * @property {string[]} context An array of source code lines; the middle element corresponds to the correct line#.
 * @memberof TraceKit
 */

/**
 * An object representing a JavaScript stack trace.
 * @typedef {Object} StackTrace
 * @property {string} name The name of the thrown exception.
 * @property {string} message The exception error message.
 * @property {TraceKit.StackFrame[]} stack An array of stack frames.
 * @property {string} mode 'stack', 'stacktrace', 'multiline', 'callers', 'onerror', or 'failed' -- method used to collect the stack trace.
 * @memberof TraceKit
 */

/**
 * TraceKit.computeStackTrace: cross-browser stack traces in JavaScript
 *
 * Syntax:
 *   ```js
 *   s = TraceKit.computeStackTrace.ofCaller([depth])
 *   s = TraceKit.computeStackTrace(exception) // consider using TraceKit.report instead (see below)
 *   ```
 *
 * Supports:
 *   - Firefox:  full stack trace with line numbers and unreliable column
 *               number on top frame
 *   - Opera 10: full stack trace with line and column numbers
 *   - Opera 9-: full stack trace with line numbers
 *   - Chrome:   full stack trace with line and column numbers
 *   - Safari:   line and column number for the topmost stacktrace element
 *               only
 *   - IE:       no line numbers whatsoever
 *
 * Tries to guess names of anonymous functions by looking for assignments
 * in the source code. In IE and Safari, we have to guess source file names
 * by searching for function bodies inside all page scripts. This will not
 * work for scripts that are loaded cross-domain.
 * Here be dragons: some function names may be guessed incorrectly, and
 * duplicate functions may be mismatched.
 *
 * TraceKit.computeStackTrace should only be used for tracing purposes.
 * Logging of unhandled exceptions should be done with TraceKit.report,
 * which builds on top of TraceKit.computeStackTrace and provides better
 * IE support by utilizing the window.onerror event to retrieve information
 * about the top of the stack.
 *
 * Note: In IE and Safari, no stack trace is recorded on the Error object,
 * so computeStackTrace instead walks its *own* chain of callers.
 * This means that:
 *  * in Safari, some methods may be missing from the stack trace;
 *  * in IE, the topmost function in the stack trace will always be the
 *    caller of computeStackTrace.
 *
 * This is okay for tracing (because you are likely to be calling
 * computeStackTrace from the function you want to be the topmost element
 * of the stack trace anyway), but not okay for logging unhandled
 * exceptions (because your catch block will likely be far away from the
 * inner function that actually caused the exception).
 *
 * Tracing example:
 *  ```js
 *     function trace(message) {
 *         var stackInfo = TraceKit.computeStackTrace.ofCaller();
 *         var data = message + "\n";
 *         for(var i in stackInfo.stack) {
 *             var item = stackInfo.stack[i];
 *             data += (item.func || '[anonymous]') + "() in " + item.url + ":" + (item.line || '0') + "\n";
 *         }
 *         if (window.console)
 *             console.info(data);
 *         else
 *             alert(data);
 *     }
 * ```
 * @memberof TraceKit
 * @namespace
 */
TraceKit.computeStackTrace = (function computeStackTraceWrapper() {
    var debug = false,
        sourceCache = {};

    /**
     * Attempts to retrieve source code via XMLHttpRequest, which is used
     * to look up anonymous function names.
     * @param {string} url URL of source code.
     * @return {string} Source contents.
     * @memberof TraceKit.computeStackTrace
     */
    function loadSource(url) {
        if (!TraceKit.remoteFetching) { //Only attempt request if remoteFetching is on.
            return '';
        }
        try {
            var getXHR = function() {
                try {
                    return new window.XMLHttpRequest();
                } catch (e) {
                    // explicitly bubble up the exception if not found
                    return new window.ActiveXObject('Microsoft.XMLHTTP');
                }
            };

            var request = getXHR();
            request.open('GET', url, false);
            request.send('');
            return request.responseText;
        } catch (e) {
            return '';
        }
    }

    /**
     * Retrieves source code from the source code cache.
     * @param {string} url URL of source code.
     * @return {Array.<string>} Source contents.
     * @memberof TraceKit.computeStackTrace
     */
    function getSource(url) {
        if (typeof url !== 'string') {
            return [];
        }

        if (!_has(sourceCache, url)) {
            // URL needs to be able to fetched within the acceptable domain.  Otherwise,
            // cross-domain errors will be triggered.
            /*
                Regex matches:
                0 - Full Url
                1 - Protocol
                2 - Domain
                3 - Port (Useful for internal applications)
                4 - Path
            */
            var source = '';
            var domain = '';
            try { domain = window.document.domain; } catch (e) { }
            var match = /(.*)\:\/\/([^:\/]+)([:\d]*)\/{0,1}([\s\S]*)/.exec(url);
            if (match && match[2] === domain) {
                source = loadSource(url);
            }
            sourceCache[url] = source ? source.split('\n') : [];
        }

        return sourceCache[url];
    }

    /**
     * Tries to use an externally loaded copy of source code to determine
     * the name of a function by looking at the name of the variable it was
     * assigned to, if any.
     * @param {string} url URL of source code.
     * @param {(string|number)} lineNo Line number in source code.
     * @return {string} The function name, if discoverable.
     * @memberof TraceKit.computeStackTrace
     */
    function guessFunctionName(url, lineNo) {
        var reFunctionArgNames = /function ([^(]*)\(([^)]*)\)/,
            reGuessFunction = /['"]?([0-9A-Za-z$_]+)['"]?\s*[:=]\s*(function|eval|new Function)/,
            line = '',
            maxLines = 10,
            source = getSource(url),
            m;

        if (!source.length) {
            return UNKNOWN_FUNCTION;
        }

        // Walk backwards from the first line in the function until we find the line which
        // matches the pattern above, which is the function definition
        for (var i = 0; i < maxLines; ++i) {
            line = source[lineNo - i] + line;

            if (!_isUndefined(line)) {
                if ((m = reGuessFunction.exec(line))) {
                    return m[1];
                } else if ((m = reFunctionArgNames.exec(line))) {
                    return m[1];
                }
            }
        }

        return UNKNOWN_FUNCTION;
    }

    /**
     * Retrieves the surrounding lines from where an exception occurred.
     * @param {string} url URL of source code.
     * @param {(string|number)} line Line number in source code to center around for context.
     * @return {?Array.<string>} Lines of source code.
     * @memberof TraceKit.computeStackTrace
     */
    function gatherContext(url, line) {
        var source = getSource(url);

        if (!source.length) {
            return null;
        }

        var context = [],
            // linesBefore & linesAfter are inclusive with the offending line.
            // if linesOfContext is even, there will be one extra line
            //   *before* the offending line.
            linesBefore = Math.floor(TraceKit.linesOfContext / 2),
            // Add one extra line if linesOfContext is odd
            linesAfter = linesBefore + (TraceKit.linesOfContext % 2),
            start = Math.max(0, line - linesBefore - 1),
            end = Math.min(source.length, line + linesAfter - 1);

        line -= 1; // convert to 0-based index

        for (var i = start; i < end; ++i) {
            if (!_isUndefined(source[i])) {
                context.push(source[i]);
            }
        }

        return context.length > 0 ? context : null;
    }

    /**
     * Escapes special characters, except for whitespace, in a string to be
     * used inside a regular expression as a string literal.
     * @param {string} text The string.
     * @return {string} The escaped string literal.
     * @memberof TraceKit.computeStackTrace
     */
    function escapeRegExp(text) {
        return text.replace(/[\-\[\]{}()*+?.,\\\^$|#]/g, '\\$&');
    }

    /**
     * Escapes special characters in a string to be used inside a regular
     * expression as a string literal. Also ensures that HTML entities will
     * be matched the same as their literal friends.
     * @param {string} body The string.
     * @return {string} The escaped string.
     * @memberof TraceKit.computeStackTrace
     */
    function escapeCodeAsRegExpForMatchingInsideHTML(body) {
        return escapeRegExp(body).replace('<', '(?:<|&lt;)').replace('>', '(?:>|&gt;)').replace('&', '(?:&|&amp;)').replace('"', '(?:"|&quot;)').replace(/\s+/g, '\\s+');
    }

    /**
     * Determines where a code fragment occurs in the source code.
     * @param {RegExp} re The function definition.
     * @param {Array.<string>} urls A list of URLs to search.
     * @return {?Object.<string, (string|number)>} An object containing
     * the url, line, and column number of the defined function.
     * @memberof TraceKit.computeStackTrace
     */
    function findSourceInUrls(re, urls) {
        var source, m;
        for (var i = 0, j = urls.length; i < j; ++i) {
            if ((source = getSource(urls[i])).length) {
                source = source.join('\n');
                if ((m = re.exec(source))) {

                    return {
                        'url': urls[i],
                        'line': source.substring(0, m.index).split('\n').length,
                        'column': m.index - source.lastIndexOf('\n', m.index) - 1
                    };
                }
            }
        }

        return null;
    }

    /**
     * Determines at which column a code fragment occurs on a line of the
     * source code.
     * @param {string} fragment The code fragment.
     * @param {string} url The URL to search.
     * @param {(string|number)} line The line number to examine.
     * @return {?number} The column number.
     * @memberof TraceKit.computeStackTrace
     */
    function findSourceInLine(fragment, url, line) {
        var source = getSource(url),
            re = new RegExp('\\b' + escapeRegExp(fragment) + '\\b'),
            m;

        line -= 1;

        if (source && source.length > line && (m = re.exec(source[line]))) {
            return m.index;
        }

        return null;
    }

    /**
     * Determines where a function was defined within the source code.
     * @param {(Function|string)} func A function reference or serialized
     * function definition.
     * @return {?Object.<string, (string|number)>} An object containing
     * the url, line, and column number of the defined function.
     * @memberof TraceKit.computeStackTrace
     */
    function findSourceByFunctionBody(func) {
        if (_isUndefined(window && window.document)) {
            return;
        }

        var urls = [window.location.href],
            scripts = window.document.getElementsByTagName('script'),
            body,
            code = '' + func,
            codeRE = /^function(?:\s+([\w$]+))?\s*\(([\w\s,]*)\)\s*\{\s*(\S[\s\S]*\S)\s*\}\s*$/,
            eventRE = /^function on([\w$]+)\s*\(event\)\s*\{\s*(\S[\s\S]*\S)\s*\}\s*$/,
            re,
            parts,
            result;

        for (var i = 0; i < scripts.length; ++i) {
            var script = scripts[i];
            if (script.src) {
                urls.push(script.src);
            }
        }

        if (!(parts = codeRE.exec(code))) {
            re = new RegExp(escapeRegExp(code).replace(/\s+/g, '\\s+'));
        }

        // not sure if this is really necessary, but I don’t have a test
        // corpus large enough to confirm that and it was in the original.
        else {
            var name = parts[1] ? '\\s+' + parts[1] : '',
                args = parts[2].split(',').join('\\s*,\\s*');

            body = escapeRegExp(parts[3]).replace(/;$/, ';?'); // semicolon is inserted if the function ends with a comment.replace(/\s+/g, '\\s+');
            re = new RegExp('function' + name + '\\s*\\(\\s*' + args + '\\s*\\)\\s*{\\s*' + body + '\\s*}');
        }

        // look for a normal function definition
        if ((result = findSourceInUrls(re, urls))) {
            return result;
        }

        // look for an old-school event handler function
        if ((parts = eventRE.exec(code))) {
            var event = parts[1];
            body = escapeCodeAsRegExpForMatchingInsideHTML(parts[2]);

            // look for a function defined in HTML as an onXXX handler
            re = new RegExp('on' + event + '=[\\\'"]\\s*' + body + '\\s*[\\\'"]', 'i');

            if ((result = findSourceInUrls(re, urls[0]))) {
                return result;
            }

            // look for ???
            re = new RegExp(body);

            if ((result = findSourceInUrls(re, urls))) {
                return result;
            }
        }

        return null;
    }

    // Contents of Exception in various browsers.
    //
    // SAFARI:
    // ex.message = Can't find variable: qq
    // ex.line = 59
    // ex.sourceId = 580238192
    // ex.sourceURL = http://...
    // ex.expressionBeginOffset = 96
    // ex.expressionCaretOffset = 98
    // ex.expressionEndOffset = 98
    // ex.name = ReferenceError
    //
    // FIREFOX:
    // ex.message = qq is not defined
    // ex.fileName = http://...
    // ex.lineNumber = 59
    // ex.columnNumber = 69
    // ex.stack = ...stack trace... (see the example below)
    // ex.name = ReferenceError
    //
    // CHROME:
    // ex.message = qq is not defined
    // ex.name = ReferenceError
    // ex.type = not_defined
    // ex.arguments = ['aa']
    // ex.stack = ...stack trace...
    //
    // INTERNET EXPLORER:
    // ex.message = ...
    // ex.name = ReferenceError
    //
    // OPERA:
    // ex.message = ...message... (see the example below)
    // ex.name = ReferenceError
    // ex.opera#sourceloc = 11  (pretty much useless, duplicates the info in ex.message)
    // ex.stacktrace = n/a; see 'opera:config#UserPrefs|Exceptions Have Stacktrace'

    /**
     * Computes stack trace information from the stack property.
     * Chrome and Gecko use this property.
     * @param {Error} ex
     * @return {?TraceKit.StackTrace} Stack trace information.
     * @memberof TraceKit.computeStackTrace
     */
    function computeStackTraceFromStackProp(ex) {
        if (!ex.stack) {
            return null;
        }

        var chrome = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,
            gecko = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i,
            winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i,

            // Used to additionally parse URL/line/column from eval frames
            isEval,
            geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i,
            chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/,

            lines = ex.stack.split('\n'),
            stack = [],
            submatch,
            parts,
            element,
            reference = /^(.*) is undefined$/.exec(ex.message);

        for (var i = 0, j = lines.length; i < j; ++i) {
            if ((parts = chrome.exec(lines[i]))) {
                var isNative = parts[2] && parts[2].indexOf('native') === 0; // start of line
                isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
                if (isEval && (submatch = chromeEval.exec(parts[2]))) {
                    // throw out eval line/column and use top-most line/column number
                    parts[2] = submatch[1]; // url
                    parts[3] = submatch[2]; // line
                    parts[4] = submatch[3]; // column
                }
                element = {
                    'url': !isNative ? parts[2] : null,
                    'func': parts[1] || UNKNOWN_FUNCTION,
                    'args': isNative ? [parts[2]] : [],
                    'line': parts[3] ? +parts[3] : null,
                    'column': parts[4] ? +parts[4] : null
                };
            } else if ( parts = winjs.exec(lines[i]) ) {
                element = {
                    'url': parts[2],
                    'func': parts[1] || UNKNOWN_FUNCTION,
                    'args': [],
                    'line': +parts[3],
                    'column': parts[4] ? +parts[4] : null
                };
            } else if ((parts = gecko.exec(lines[i]))) {
                isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
                if (isEval && (submatch = geckoEval.exec(parts[3]))) {
                    // throw out eval line/column and use top-most line number
                    parts[3] = submatch[1];
                    parts[4] = submatch[2];
                    parts[5] = null; // no column when eval
                } else if (i === 0 && !parts[5] && !_isUndefined(ex.columnNumber)) {
                    // FireFox uses this awesome columnNumber property for its top frame
                    // Also note, Firefox's column number is 0-based and everything else expects 1-based,
                    // so adding 1
                    // NOTE: this hack doesn't work if top-most frame is eval
                    stack[0].column = ex.columnNumber + 1;
                }
                element = {
                    'url': parts[3],
                    'func': parts[1] || UNKNOWN_FUNCTION,
                    'args': parts[2] ? parts[2].split(',') : [],
                    'line': parts[4] ? +parts[4] : null,
                    'column': parts[5] ? +parts[5] : null
                };
            } else {
                continue;
            }

            if (!element.func && element.line) {
                element.func = guessFunctionName(element.url, element.line);
            }

            element.context = element.line ? gatherContext(element.url, element.line) : null;
            stack.push(element);
        }

        if (!stack.length) {
            return null;
        }

        if (stack[0] && stack[0].line && !stack[0].column && reference) {
            stack[0].column = findSourceInLine(reference[1], stack[0].url, stack[0].line);
        }

        return {
            'mode': 'stack',
            'name': ex.name,
            'message': ex.message,
            'stack': stack
        };
    }

    /**
     * Computes stack trace information from the stacktrace property.
     * Opera 10+ uses this property.
     * @param {Error} ex
     * @return {?TraceKit.StackTrace} Stack trace information.
     * @memberof TraceKit.computeStackTrace
     */
    function computeStackTraceFromStacktraceProp(ex) {
        // Access and store the stacktrace property before doing ANYTHING
        // else to it because Opera is not very good at providing it
        // reliably in other circumstances.
        var stacktrace = ex.stacktrace;
        if (!stacktrace) {
            return;
        }

        var opera10Regex = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i,
            opera11Regex = / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^\)]+))\((.*)\))? in (.*):\s*$/i,
            lines = stacktrace.split('\n'),
            stack = [],
            parts;

        for (var line = 0; line < lines.length; line += 2) {
            var element = null;
            if ((parts = opera10Regex.exec(lines[line]))) {
                element = {
                    'url': parts[2],
                    'line': +parts[1],
                    'column': null,
                    'func': parts[3],
                    'args':[]
                };
            } else if ((parts = opera11Regex.exec(lines[line]))) {
                element = {
                    'url': parts[6],
                    'line': +parts[1],
                    'column': +parts[2],
                    'func': parts[3] || parts[4],
                    'args': parts[5] ? parts[5].split(',') : []
                };
            }

            if (element) {
                if (!element.func && element.line) {
                    element.func = guessFunctionName(element.url, element.line);
                }
                if (element.line) {
                    try {
                        element.context = gatherContext(element.url, element.line);
                    } catch (exc) {}
                }

                if (!element.context) {
                    element.context = [lines[line + 1]];
                }

                stack.push(element);
            }
        }

        if (!stack.length) {
            return null;
        }

        return {
            'mode': 'stacktrace',
            'name': ex.name,
            'message': ex.message,
            'stack': stack
        };
    }

    /**
     * NOT TESTED.
     * Computes stack trace information from an error message that includes
     * the stack trace.
     * Opera 9 and earlier use this method if the option to show stack
     * traces is turned on in opera:config.
     * @param {Error} ex
     * @return {?TraceKit.StackTrace} Stack information.
     * @memberof TraceKit.computeStackTrace
     */
    function computeStackTraceFromOperaMultiLineMessage(ex) {
        // TODO: Clean this function up
        // Opera includes a stack trace into the exception message. An example is:
        //
        // Statement on line 3: Undefined variable: undefinedFunc
        // Backtrace:
        //   Line 3 of linked script file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.js: In function zzz
        //         undefinedFunc(a);
        //   Line 7 of inline#1 script in file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.html: In function yyy
        //           zzz(x, y, z);
        //   Line 3 of inline#1 script in file://localhost/Users/andreyvit/Projects/TraceKit/javascript-client/sample.html: In function xxx
        //           yyy(a, a, a);
        //   Line 1 of function script
        //     try { xxx('hi'); return false; } catch(ex) { TraceKit.report(ex); }
        //   ...

        var lines = ex.message.split('\n');
        if (lines.length < 4) {
            return null;
        }

        var lineRE1 = /^\s*Line (\d+) of linked script ((?:file|https?|blob)\S+)(?:: in function (\S+))?\s*$/i,
            lineRE2 = /^\s*Line (\d+) of inline#(\d+) script in ((?:file|https?|blob)\S+)(?:: in function (\S+))?\s*$/i,
            lineRE3 = /^\s*Line (\d+) of function script\s*$/i,
            stack = [],
            scripts = (window && window.document && window.document.getElementsByTagName('script')),
            inlineScriptBlocks = [],
            parts;

        for (var s in scripts) {
            if (_has(scripts, s) && !scripts[s].src) {
                inlineScriptBlocks.push(scripts[s]);
            }
        }

        for (var line = 2; line < lines.length; line += 2) {
            var item = null;
            if ((parts = lineRE1.exec(lines[line]))) {
                item = {
                    'url': parts[2],
                    'func': parts[3],
                    'args': [],
                    'line': +parts[1],
                    'column': null
                };
            } else if ((parts = lineRE2.exec(lines[line]))) {
                item = {
                    'url': parts[3],
                    'func': parts[4],
                    'args': [],
                    'line': +parts[1],
                    'column': null // TODO: Check to see if inline#1 (+parts[2]) points to the script number or column number.
                };
                var relativeLine = (+parts[1]); // relative to the start of the <SCRIPT> block
                var script = inlineScriptBlocks[parts[2] - 1];
                if (script) {
                    var source = getSource(item.url);
                    if (source) {
                        source = source.join('\n');
                        var pos = source.indexOf(script.innerText);
                        if (pos >= 0) {
                            item.line = relativeLine + source.substring(0, pos).split('\n').length;
                        }
                    }
                }
            } else if ((parts = lineRE3.exec(lines[line]))) {
                var url = window.location.href.replace(/#.*$/, '');
                var re = new RegExp(escapeCodeAsRegExpForMatchingInsideHTML(lines[line + 1]));
                var src = findSourceInUrls(re, [url]);
                item = {
                    'url': url,
                    'func': '',
                    'args': [],
                    'line': src ? src.line : parts[1],
                    'column': null
                };
            }

            if (item) {
                if (!item.func) {
                    item.func = guessFunctionName(item.url, item.line);
                }
                var context = gatherContext(item.url, item.line);
                var midline = (context ? context[Math.floor(context.length / 2)] : null);
                if (context && midline.replace(/^\s*/, '') === lines[line + 1].replace(/^\s*/, '')) {
                    item.context = context;
                } else {
                    // if (context) alert("Context mismatch. Correct midline:\n" + lines[i+1] + "\n\nMidline:\n" + midline + "\n\nContext:\n" + context.join("\n") + "\n\nURL:\n" + item.url);
                    item.context = [lines[line + 1]];
                }
                stack.push(item);
            }
        }
        if (!stack.length) {
            return null; // could not parse multiline exception message as Opera stack trace
        }

        return {
            'mode': 'multiline',
            'name': ex.name,
            'message': lines[0],
            'stack': stack
        };
    }

    /**
     * Adds information about the first frame to incomplete stack traces.
     * Safari and IE require this to get complete data on the first frame.
     * @param {TraceKit.StackTrace} stackInfo Stack trace information from
     * one of the compute* methods.
     * @param {string} url The URL of the script that caused an error.
     * @param {(number|string)} lineNo The line number of the script that
     * caused an error.
     * @param {string=} message The error generated by the browser, which
     * hopefully contains the name of the object that caused the error.
     * @return {boolean} Whether or not the stack information was
     * augmented.
     * @memberof TraceKit.computeStackTrace
     */
    function augmentStackTraceWithInitialElement(stackInfo, url, lineNo, message) {
        var initial = {
            'url': url,
            'line': lineNo
        };

        if (initial.url && initial.line) {
            stackInfo.incomplete = false;

            if (!initial.func) {
                initial.func = guessFunctionName(initial.url, initial.line);
            }

            if (!initial.context) {
                initial.context = gatherContext(initial.url, initial.line);
            }

            var reference = / '([^']+)' /.exec(message);
            if (reference) {
                initial.column = findSourceInLine(reference[1], initial.url, initial.line);
            }

            if (stackInfo.stack.length > 0) {
                if (stackInfo.stack[0].url === initial.url) {
                    if (stackInfo.stack[0].line === initial.line) {
                        return false; // already in stack trace
                    } else if (!stackInfo.stack[0].line && stackInfo.stack[0].func === initial.func) {
                        stackInfo.stack[0].line = initial.line;
                        stackInfo.stack[0].context = initial.context;
                        return false;
                    }
                }
            }

            stackInfo.stack.unshift(initial);
            stackInfo.partial = true;
            return true;
        } else {
            stackInfo.incomplete = true;
        }

        return false;
    }

    /**
     * Computes stack trace information by walking the arguments.caller
     * chain at the time the exception occurred. This will cause earlier
     * frames to be missed but is the only way to get any stack trace in
     * Safari and IE. The top frame is restored by
     * {@link augmentStackTraceWithInitialElement}.
     * @param {Error} ex
     * @return {TraceKit.StackTrace=} Stack trace information.
     * @memberof TraceKit.computeStackTrace
     */
    function computeStackTraceByWalkingCallerChain(ex, depth) {
        var functionName = /function\s+([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)?\s*\(/i,
            stack = [],
            funcs = {},
            recursion = false,
            parts,
            item,
            source;

        for (var curr = computeStackTraceByWalkingCallerChain.caller; curr && !recursion; curr = curr.caller) {
            if (curr === computeStackTrace || curr === TraceKit.report) {
                continue;
            }

            item = {
                'url': null,
                'func': UNKNOWN_FUNCTION,
                'args': [],
                'line': null,
                'column': null
            };

            if (curr.name) {
                item.func = curr.name;
            } else if ((parts = functionName.exec(curr.toString()))) {
                item.func = parts[1];
            }

            if (typeof item.func === 'undefined') {
              try {
                item.func = parts.input.substring(0, parts.input.indexOf('{'));
              } catch (e) { }
            }

            if ((source = findSourceByFunctionBody(curr))) {
                item.url = source.url;
                item.line = source.line;

                if (item.func === UNKNOWN_FUNCTION) {
                    item.func = guessFunctionName(item.url, item.line);
                }

                var reference = / '([^']+)' /.exec(ex.message || ex.description);
                if (reference) {
                    item.column = findSourceInLine(reference[1], source.url, source.line);
                }
            }

            if (funcs['' + curr]) {
                recursion = true;
            }else{
                funcs['' + curr] = true;
            }

            stack.push(item);
        }

        if (depth) {
            stack.splice(0, depth);
        }

        var result = {
            'mode': 'callers',
            'name': ex.name,
            'message': ex.message,
            'stack': stack
        };
        augmentStackTraceWithInitialElement(result, ex.sourceURL || ex.fileName, ex.line || ex.lineNumber, ex.message || ex.description);
        return result;
    }

    /**
     * Computes a stack trace for an exception.
     * @param {Error} ex
     * @param {(string|number)=} depth
     * @memberof TraceKit.computeStackTrace
     */
    function computeStackTrace(ex, depth) {
        var stack = null;
        depth = (depth == null ? 0 : +depth);

        try {
            // This must be tried first because Opera 10 *destroys*
            // its stacktrace property if you try to access the stack
            // property first!!
            stack = computeStackTraceFromStacktraceProp(ex);
            if (stack) {
                return stack;
            }
        } catch (e) {
            if (debug) {
                throw e;
            }
        }

        try {
            stack = computeStackTraceFromStackProp(ex);
            if (stack) {
                return stack;
            }
        } catch (e) {
            if (debug) {
                throw e;
            }
        }

        try {
            stack = computeStackTraceFromOperaMultiLineMessage(ex);
            if (stack) {
                return stack;
            }
        } catch (e) {
            if (debug) {
                throw e;
            }
        }

        try {
            stack = computeStackTraceByWalkingCallerChain(ex, depth + 1);
            if (stack) {
                return stack;
            }
        } catch (e) {
            if (debug) {
                throw e;
            }
        }

        return {
            'name': ex.name,
            'message': ex.message,
            'mode': 'failed'
        };
    }

    /**
     * Logs a stacktrace starting from the previous call and working down.
     * @param {(number|string)=} depth How many frames deep to trace.
     * @return {TraceKit.StackTrace} Stack trace information.
     * @memberof TraceKit.computeStackTrace
     */
    function computeStackTraceOfCaller(depth) {
        depth = (depth == null ? 0 : +depth) + 1; // "+ 1" because "ofCaller" should drop one frame
        try {
            throw new Error();
        } catch (ex) {
            return computeStackTrace(ex, depth + 1);
        }
    }

    computeStackTrace.augmentStackTraceWithInitialElement = augmentStackTraceWithInitialElement;
    computeStackTrace.computeStackTraceFromStackProp = computeStackTraceFromStackProp;
    computeStackTrace.guessFunctionName = guessFunctionName;
    computeStackTrace.gatherContext = gatherContext;
    computeStackTrace.ofCaller = computeStackTraceOfCaller;
    computeStackTrace.getSource = getSource;

    return computeStackTrace;
}());

/**
 * Extends support for global error handling for asynchronous browser
 * functions. Adopted from Closure Library's errorhandler.js
 * @memberof TraceKit
 */
TraceKit.extendToAsynchronousCallbacks = function () {
    var _helper = function _helper(fnName) {
        var originalFn = window[fnName];
        window[fnName] = function traceKitAsyncExtension() {
            // Make a copy of the arguments
            var args = _slice.call(arguments);
            var originalCallback = args[0];
            if (typeof (originalCallback) === 'function') {
                args[0] = TraceKit.wrap(originalCallback);
            }
            // IE < 9 doesn't support .call/.apply on setInterval/setTimeout, but it
            // also only supports 2 argument and doesn't care what "this" is, so we
            // can just call the original function directly.
            if (originalFn.apply) {
                return originalFn.apply(this, args);
            } else {
                return originalFn(args[0], args[1]);
            }
        };
    };

    _helper('setTimeout');
    _helper('setInterval');
};

//Default options:
if (!TraceKit.remoteFetching) {
    TraceKit.remoteFetching = true;
}
if (!TraceKit.collectWindowErrors) {
    TraceKit.collectWindowErrors = true;
}
if (!TraceKit.linesOfContext || TraceKit.linesOfContext < 1) {
    // 5 lines before, the offending line, 5 lines after
    TraceKit.linesOfContext = 11;
}

// UMD export
if (typeof define === 'function' && define.amd) {
    define('TraceKit', [], TraceKit);
} else if (typeof module !== 'undefined' && module.exports && window.module !== module) {
    module.exports = TraceKit;
} else {
    window.TraceKit = TraceKit;
}

}(typeof window !== 'undefined' ? window : global));


var exports, require;
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('exceptionless', ["require","exports","TraceKit"], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require, exports, require('TraceKit'));
  } else {
    root.exceptionless = factory(require, exports, root.TraceKit);
  }
}(this, function(require, exports, TraceKit) {
if (!exports) { var exports = {}; }

"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var DefaultLastReferenceIdManager = (function () {
    function DefaultLastReferenceIdManager() {
        this._lastReferenceId = null;
    }
    DefaultLastReferenceIdManager.prototype.getLast = function () {
        return this._lastReferenceId;
    };
    DefaultLastReferenceIdManager.prototype.clearLast = function () {
        this._lastReferenceId = null;
    };
    DefaultLastReferenceIdManager.prototype.setLast = function (eventId) {
        this._lastReferenceId = eventId;
    };
    return DefaultLastReferenceIdManager;
}());
exports.DefaultLastReferenceIdManager = DefaultLastReferenceIdManager;
var ConsoleLog = (function () {
    function ConsoleLog() {
    }
    ConsoleLog.prototype.trace = function (message) {
        this.log('debug', message);
    };
    ConsoleLog.prototype.info = function (message) {
        this.log('info', message);
    };
    ConsoleLog.prototype.warn = function (message) {
        this.log('warn', message);
    };
    ConsoleLog.prototype.error = function (message) {
        this.log('error', message);
    };
    ConsoleLog.prototype.log = function (level, message) {
        if (console) {
            var msg = "[" + level + "] Exceptionless: " + message;
            if (console[level]) {
                console[level](msg);
            }
            else if (console.log) {
                console["log"](msg);
            }
        }
    };
    return ConsoleLog;
}());
exports.ConsoleLog = ConsoleLog;
var NullLog = (function () {
    function NullLog() {
    }
    NullLog.prototype.trace = function (message) { };
    NullLog.prototype.info = function (message) { };
    NullLog.prototype.warn = function (message) { };
    NullLog.prototype.error = function (message) { };
    return NullLog;
}());
exports.NullLog = NullLog;
var HeartbeatPlugin = (function () {
    function HeartbeatPlugin(heartbeatInterval) {
        if (heartbeatInterval === void 0) { heartbeatInterval = 30000; }
        this.priority = 100;
        this.name = 'HeartbeatPlugin';
        this._interval = heartbeatInterval >= 30000 ? heartbeatInterval : 60000;
    }
    HeartbeatPlugin.prototype.run = function (context, next) {
        clearInterval(this._intervalId);
        var user = context.event.data['@user'];
        if (user && user.identity) {
            this._intervalId = setInterval(function () { return context.client.submitSessionHeartbeat(user.identity); }, this._interval);
        }
        next && next();
    };
    return HeartbeatPlugin;
}());
exports.HeartbeatPlugin = HeartbeatPlugin;
var ReferenceIdPlugin = (function () {
    function ReferenceIdPlugin() {
        this.priority = 20;
        this.name = 'ReferenceIdPlugin';
    }
    ReferenceIdPlugin.prototype.run = function (context, next) {
        if ((!context.event.reference_id || context.event.reference_id.length === 0) && context.event.type === 'error') {
            context.event.reference_id = Utils.guid().replace('-', '').substring(0, 10);
        }
        next && next();
    };
    return ReferenceIdPlugin;
}());
exports.ReferenceIdPlugin = ReferenceIdPlugin;
var EventPluginContext = (function () {
    function EventPluginContext(client, event, contextData) {
        this.client = client;
        this.event = event;
        this.contextData = contextData ? contextData : new ContextData();
    }
    Object.defineProperty(EventPluginContext.prototype, "log", {
        get: function () {
            return this.client.config.log;
        },
        enumerable: true,
        configurable: true
    });
    return EventPluginContext;
}());
exports.EventPluginContext = EventPluginContext;
var EventPluginManager = (function () {
    function EventPluginManager() {
    }
    EventPluginManager.run = function (context, callback) {
        var wrap = function (plugin, next) {
            return function () {
                try {
                    if (!context.cancelled) {
                        plugin.run(context, next);
                    }
                }
                catch (ex) {
                    context.cancelled = true;
                    context.log.error("Error running plugin '" + plugin.name + "': " + ex.message + ". Discarding Event.");
                }
                if (context.cancelled && !!callback) {
                    callback(context);
                }
            };
        };
        var plugins = context.client.config.plugins;
        var wrappedPlugins = [];
        if (!!callback) {
            wrappedPlugins[plugins.length] = wrap({ name: 'cb', priority: 9007199254740992, run: callback }, null);
        }
        for (var index = plugins.length - 1; index > -1; index--) {
            wrappedPlugins[index] = wrap(plugins[index], !!callback || (index < plugins.length - 1) ? wrappedPlugins[index + 1] : null);
        }
        wrappedPlugins[0]();
    };
    EventPluginManager.addDefaultPlugins = function (config) {
        config.addPlugin(new ConfigurationDefaultsPlugin());
        config.addPlugin(new ErrorPlugin());
        config.addPlugin(new DuplicateCheckerPlugin());
        config.addPlugin(new EventExclusionPlugin());
        config.addPlugin(new ModuleInfoPlugin());
        config.addPlugin(new RequestInfoPlugin());
        config.addPlugin(new EnvironmentInfoPlugin());
        config.addPlugin(new SubmissionMethodPlugin());
    };
    return EventPluginManager;
}());
exports.EventPluginManager = EventPluginManager;
var DefaultEventQueue = (function () {
    function DefaultEventQueue(config) {
        this._handlers = [];
        this._processingQueue = false;
        this._config = config;
    }
    DefaultEventQueue.prototype.enqueue = function (event) {
        var eventWillNotBeQueued = 'The event will not be queued.';
        var config = this._config;
        var log = config.log;
        if (!config.enabled) {
            log.info("Configuration is disabled. " + eventWillNotBeQueued);
            return;
        }
        if (!config.isValid) {
            log.info("Invalid Api Key. " + eventWillNotBeQueued);
            return;
        }
        if (this.areQueuedItemsDiscarded()) {
            log.info("Queue items are currently being discarded. " + eventWillNotBeQueued);
            return;
        }
        this.ensureQueueTimer();
        var timestamp = config.storage.queue.save(event);
        var logText = "type=" + event.type + " " + (!!event.reference_id ? 'refid=' + event.reference_id : '');
        if (timestamp) {
            log.info("Enqueuing event: " + timestamp + " " + logText);
        }
        else {
            log.error("Could not enqueue event " + logText);
        }
    };
    DefaultEventQueue.prototype.process = function (isAppExiting) {
        var _this = this;
        var queueNotProcessed = 'The queue will not be processed.';
        var config = this._config;
        var log = config.log;
        if (this._processingQueue) {
            return;
        }
        log.info('Processing queue...');
        if (!config.enabled) {
            log.info("Configuration is disabled. " + queueNotProcessed);
            return;
        }
        if (!config.isValid) {
            log.info("Invalid Api Key. " + queueNotProcessed);
            return;
        }
        this._processingQueue = true;
        this.ensureQueueTimer();
        try {
            var events_1 = config.storage.queue.get(config.submissionBatchSize);
            if (!events_1 || events_1.length === 0) {
                this._processingQueue = false;
                return;
            }
            log.info("Sending " + events_1.length + " events to " + config.serverUrl + ".");
            config.submissionClient.postEvents(events_1.map(function (e) { return e.value; }), config, function (response) {
                _this.processSubmissionResponse(response, events_1);
                _this.eventsPosted(events_1.map(function (e) { return e.value; }), response);
                log.info('Finished processing queue.');
                _this._processingQueue = false;
            }, isAppExiting);
        }
        catch (ex) {
            log.error("Error processing queue: " + ex);
            this.suspendProcessing();
            this._processingQueue = false;
        }
    };
    DefaultEventQueue.prototype.suspendProcessing = function (durationInMinutes, discardFutureQueuedItems, clearQueue) {
        var config = this._config;
        if (!durationInMinutes || durationInMinutes <= 0) {
            durationInMinutes = 5;
        }
        config.log.info("Suspending processing for " + durationInMinutes + " minutes.");
        this._suspendProcessingUntil = new Date(new Date().getTime() + (durationInMinutes * 60000));
        if (discardFutureQueuedItems) {
            this._discardQueuedItemsUntil = this._suspendProcessingUntil;
        }
        if (clearQueue) {
            config.storage.queue.clear();
        }
    };
    DefaultEventQueue.prototype.onEventsPosted = function (handler) {
        !!handler && this._handlers.push(handler);
    };
    DefaultEventQueue.prototype.eventsPosted = function (events, response) {
        var handlers = this._handlers;
        for (var _i = 0, handlers_1 = handlers; _i < handlers_1.length; _i++) {
            var handler = handlers_1[_i];
            try {
                handler(events, response);
            }
            catch (ex) {
                this._config.log.error("Error calling onEventsPosted handler: " + ex);
            }
        }
    };
    DefaultEventQueue.prototype.areQueuedItemsDiscarded = function () {
        return this._discardQueuedItemsUntil && this._discardQueuedItemsUntil > new Date();
    };
    DefaultEventQueue.prototype.ensureQueueTimer = function () {
        var _this = this;
        if (!this._queueTimer) {
            this._queueTimer = setInterval(function () { return _this.onProcessQueue(); }, 10000);
        }
    };
    DefaultEventQueue.prototype.isQueueProcessingSuspended = function () {
        return this._suspendProcessingUntil && this._suspendProcessingUntil > new Date();
    };
    DefaultEventQueue.prototype.onProcessQueue = function () {
        if (!this.isQueueProcessingSuspended() && !this._processingQueue) {
            this.process();
        }
    };
    DefaultEventQueue.prototype.processSubmissionResponse = function (response, events) {
        var noSubmission = 'The event will not be submitted.';
        var config = this._config;
        var log = config.log;
        if (response.success) {
            log.info("Sent " + events.length + " events.");
            this.removeEvents(events);
            return;
        }
        if (response.serviceUnavailable) {
            log.error('Server returned service unavailable.');
            this.suspendProcessing();
            return;
        }
        if (response.paymentRequired) {
            log.info('Too many events have been submitted, please upgrade your plan.');
            this.suspendProcessing(null, true, true);
            return;
        }
        if (response.unableToAuthenticate) {
            log.info("Unable to authenticate, please check your configuration. " + noSubmission);
            this.suspendProcessing(15);
            this.removeEvents(events);
            return;
        }
        if (response.notFound || response.badRequest) {
            log.error("Error while trying to submit data: " + response.message);
            this.suspendProcessing(60 * 4);
            this.removeEvents(events);
            return;
        }
        if (response.requestEntityTooLarge) {
            var message = 'Event submission discarded for being too large.';
            if (config.submissionBatchSize > 1) {
                log.error(message + " Retrying with smaller batch size.");
                config.submissionBatchSize = Math.max(1, Math.round(config.submissionBatchSize / 1.5));
            }
            else {
                log.error(message + " " + noSubmission);
                this.removeEvents(events);
            }
            return;
        }
        if (!response.success) {
            log.error("Error submitting events: " + (response.message || 'Please check the network tab for more info.'));
            this.suspendProcessing();
        }
    };
    DefaultEventQueue.prototype.removeEvents = function (events) {
        for (var index = 0; index < (events || []).length; index++) {
            this._config.storage.queue.remove(events[index].timestamp);
        }
    };
    return DefaultEventQueue;
}());
exports.DefaultEventQueue = DefaultEventQueue;
var InMemoryStorageProvider = (function () {
    function InMemoryStorageProvider(maxQueueItems) {
        if (maxQueueItems === void 0) { maxQueueItems = 250; }
        this.queue = new InMemoryStorage(maxQueueItems);
        this.settings = new InMemoryStorage(1);
    }
    return InMemoryStorageProvider;
}());
exports.InMemoryStorageProvider = InMemoryStorageProvider;
var DefaultSubmissionClient = (function () {
    function DefaultSubmissionClient() {
        this.configurationVersionHeader = 'x-exceptionless-configversion';
    }
    DefaultSubmissionClient.prototype.postEvents = function (events, config, callback, isAppExiting) {
        var data = JSON.stringify(events);
        var request = this.createRequest(config, 'POST', config.serverUrl + "/api/v2/events", data);
        var cb = this.createSubmissionCallback(config, callback);
        return config.submissionAdapter.sendRequest(request, cb, isAppExiting);
    };
    DefaultSubmissionClient.prototype.postUserDescription = function (referenceId, description, config, callback) {
        var path = config.serverUrl + "/api/v2/events/by-ref/" + encodeURIComponent(referenceId) + "/user-description";
        var data = JSON.stringify(description);
        var request = this.createRequest(config, 'POST', path, data);
        var cb = this.createSubmissionCallback(config, callback);
        return config.submissionAdapter.sendRequest(request, cb);
    };
    DefaultSubmissionClient.prototype.getSettings = function (config, version, callback) {
        var request = this.createRequest(config, 'GET', config.configServerUrl + "/api/v2/projects/config?v=" + version);
        var cb = function (status, message, data, headers) {
            if (status !== 200) {
                return callback(new SettingsResponse(false, null, -1, null, message));
            }
            var settings;
            try {
                settings = JSON.parse(data);
            }
            catch (e) {
                config.log.error("Unable to parse settings: '" + data + "'");
            }
            if (!settings || isNaN(settings.version)) {
                return callback(new SettingsResponse(false, null, -1, null, 'Invalid configuration settings.'));
            }
            callback(new SettingsResponse(true, settings.settings || {}, settings.version));
        };
        return config.submissionAdapter.sendRequest(request, cb);
    };
    DefaultSubmissionClient.prototype.sendHeartbeat = function (sessionIdOrUserId, closeSession, config) {
        var request = this.createRequest(config, 'GET', config.heartbeatServerUrl + "/api/v2/events/session/heartbeat?id=" + sessionIdOrUserId + "&close=" + closeSession);
        config.submissionAdapter.sendRequest(request);
    };
    DefaultSubmissionClient.prototype.createRequest = function (config, method, url, data) {
        if (data === void 0) { data = null; }
        return {
            method: method,
            url: url,
            data: data,
            apiKey: config.apiKey,
            userAgent: config.userAgent
        };
    };
    DefaultSubmissionClient.prototype.createSubmissionCallback = function (config, callback) {
        var _this = this;
        return function (status, message, data, headers) {
            var settingsVersion = headers && parseInt(headers[_this.configurationVersionHeader], 10);
            if (!isNaN(settingsVersion)) {
                SettingsManager.checkVersion(settingsVersion, config);
            }
            else {
                config.log.error('No config version header was returned.');
            }
            callback(new SubmissionResponse(status, message));
        };
    };
    return DefaultSubmissionClient;
}());
exports.DefaultSubmissionClient = DefaultSubmissionClient;
var Utils = (function () {
    function Utils() {
    }
    Utils.addRange = function (target) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        if (!target) {
            target = [];
        }
        if (!values || values.length === 0) {
            return target;
        }
        for (var _a = 0, values_1 = values; _a < values_1.length; _a++) {
            var value = values_1[_a];
            if (value && target.indexOf(value) < 0) {
                target.push(value);
            }
        }
        return target;
    };
    Utils.getHashCode = function (source) {
        if (!source || source.length === 0) {
            return 0;
        }
        var hash = 0;
        for (var index = 0; index < source.length; index++) {
            var character = source.charCodeAt(index);
            hash = ((hash << 5) - hash) + character;
            hash |= 0;
        }
        return hash;
    };
    Utils.getCookies = function (cookies, exclusions) {
        var result = {};
        var parts = (cookies || '').split('; ');
        for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
            var part = parts_1[_i];
            var cookie = part.split('=');
            if (!Utils.isMatch(cookie[0], exclusions)) {
                result[cookie[0]] = cookie[1];
            }
        }
        return !Utils.isEmpty(result) ? result : null;
    };
    Utils.guid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };
    Utils.merge = function (defaultValues, values) {
        var result = {};
        for (var key in defaultValues || {}) {
            if (defaultValues[key] !== undefined && defaultValues[key] !== null) {
                result[key] = defaultValues[key];
            }
        }
        for (var key in values || {}) {
            if (values[key] !== undefined && values[key] !== null) {
                result[key] = values[key];
            }
        }
        return result;
    };
    Utils.parseVersion = function (source) {
        if (!source) {
            return null;
        }
        var versionRegex = /(v?((\d+)\.(\d+)(\.(\d+))?)(?:-([\dA-Za-z\-]+(?:\.[\dA-Za-z\-]+)*))?(?:\+([\dA-Za-z\-]+(?:\.[\dA-Za-z\-]+)*))?)/;
        var matches = versionRegex.exec(source);
        if (matches && matches.length > 0) {
            return matches[0];
        }
        return null;
    };
    Utils.parseQueryString = function (query, exclusions) {
        if (!query || query.length === 0) {
            return null;
        }
        var pairs = query.split('&');
        if (pairs.length === 0) {
            return null;
        }
        var result = {};
        for (var _i = 0, pairs_1 = pairs; _i < pairs_1.length; _i++) {
            var pair = pairs_1[_i];
            var parts = pair.split('=');
            if (!Utils.isMatch(parts[0], exclusions)) {
                result[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
            }
        }
        return !Utils.isEmpty(result) ? result : null;
    };
    Utils.randomNumber = function () {
        return Math.floor(Math.random() * 9007199254740992);
    };
    Utils.isMatch = function (input, patterns, ignoreCase) {
        if (ignoreCase === void 0) { ignoreCase = true; }
        if (!input || typeof input !== 'string') {
            return false;
        }
        var trim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        input = (ignoreCase ? input.toLowerCase() : input).replace(trim, '');
        return (patterns || []).some(function (pattern) {
            if (typeof pattern !== 'string') {
                return false;
            }
            pattern = (ignoreCase ? pattern.toLowerCase() : pattern).replace(trim, '');
            if (pattern.length <= 0) {
                return false;
            }
            var startsWithWildcard = pattern[0] === '*';
            if (startsWithWildcard) {
                pattern = pattern.slice(1);
            }
            var endsWithWildcard = pattern[pattern.length - 1] === '*';
            if (endsWithWildcard) {
                pattern = pattern.substring(0, pattern.length - 1);
            }
            if (startsWithWildcard && endsWithWildcard) {
                return pattern.length <= input.length && input.indexOf(pattern, 0) !== -1;
            }
            if (startsWithWildcard) {
                return Utils.endsWith(input, pattern);
            }
            if (endsWithWildcard) {
                return Utils.startsWith(input, pattern);
            }
            return input === pattern;
        });
    };
    Utils.isEmpty = function (input) {
        return input === null || (typeof (input) === 'object' && Object.keys(input).length === 0);
    };
    Utils.startsWith = function (input, prefix) {
        return input.substring(0, prefix.length) === prefix;
    };
    Utils.endsWith = function (input, suffix) {
        return input.indexOf(suffix, input.length - suffix.length) !== -1;
    };
    Utils.stringify = function (data, exclusions, maxDepth) {
        function stringifyImpl(obj, excludedKeys) {
            var cache = [];
            return JSON.stringify(obj, function (key, value) {
                if (Utils.isMatch(key, excludedKeys)) {
                    return;
                }
                if (typeof value === 'object' && !!value) {
                    if (cache.indexOf(value) !== -1) {
                        return;
                    }
                    cache.push(value);
                }
                return value;
            });
        }
        if (({}).toString.call(data) === '[object Object]') {
            var flattened = {};
            for (var prop in data) {
                var value = data[prop];
                if (value === data) {
                    continue;
                }
                flattened[prop] = data[prop];
            }
            return stringifyImpl(flattened, exclusions);
        }
        if (({}).toString.call(data) === '[object Array]') {
            var result = [];
            for (var index = 0; index < data.length; index++) {
                result[index] = JSON.parse(stringifyImpl(data[index], exclusions));
            }
            return JSON.stringify(result);
        }
        return stringifyImpl(data, exclusions);
    };
    Utils.toBoolean = function (input, defaultValue) {
        if (defaultValue === void 0) { defaultValue = false; }
        if (typeof input === 'boolean') {
            return input;
        }
        if (input === null || typeof input !== 'number' && typeof input !== 'string') {
            return defaultValue;
        }
        switch ((input + '').toLowerCase().trim()) {
            case 'true':
            case 'yes':
            case '1': return true;
            case 'false':
            case 'no':
            case '0':
            case null: return false;
        }
        return defaultValue;
    };
    return Utils;
}());
exports.Utils = Utils;
var SettingsManager = (function () {
    function SettingsManager() {
    }
    SettingsManager.onChanged = function (handler) {
        !!handler && this._handlers.push(handler);
    };
    SettingsManager.applySavedServerSettings = function (config) {
        if (!config || !config.isValid) {
            return;
        }
        var savedSettings = this.getSavedServerSettings(config);
        config.log.info("Applying saved settings: v" + savedSettings.version);
        config.settings = Utils.merge(config.settings, savedSettings.settings);
        this.changed(config);
    };
    SettingsManager.getVersion = function (config) {
        if (!config || !config.isValid) {
            return 0;
        }
        var savedSettings = this.getSavedServerSettings(config);
        return savedSettings.version || 0;
    };
    SettingsManager.checkVersion = function (version, config) {
        var currentVersion = this.getVersion(config);
        if (version <= currentVersion) {
            return;
        }
        config.log.info("Updating settings from v" + currentVersion + " to v" + version);
        this.updateSettings(config, currentVersion);
    };
    SettingsManager.updateSettings = function (config, version) {
        var _this = this;
        if (!config || !config.enabled || this._isUpdatingSettings) {
            return;
        }
        var unableToUpdateMessage = 'Unable to update settings';
        if (!config.isValid) {
            config.log.error(unableToUpdateMessage + ": ApiKey is not set.");
            return;
        }
        if (!version || version < 0) {
            version = this.getVersion(config);
        }
        config.log.info("Checking for updated settings from: v" + version + ".");
        this._isUpdatingSettings = true;
        config.submissionClient.getSettings(config, version, function (response) {
            try {
                if (!config || !response || !response.success || !response.settings) {
                    config.log.warn(unableToUpdateMessage + ": " + response.message);
                    return;
                }
                config.settings = Utils.merge(config.settings, response.settings);
                var savedServerSettings = SettingsManager.getSavedServerSettings(config);
                for (var key in savedServerSettings) {
                    if (response.settings[key]) {
                        continue;
                    }
                    delete config.settings[key];
                }
                var newSettings = {
                    version: response.settingsVersion,
                    settings: response.settings
                };
                config.storage.settings.save(newSettings);
                config.log.info("Updated settings: v" + newSettings.version);
                _this.changed(config);
            }
            finally {
                _this._isUpdatingSettings = false;
            }
        });
    };
    SettingsManager.changed = function (config) {
        var handlers = this._handlers;
        for (var _i = 0, handlers_2 = handlers; _i < handlers_2.length; _i++) {
            var handler = handlers_2[_i];
            try {
                handler(config);
            }
            catch (ex) {
                config.log.error("Error calling onChanged handler: " + ex);
            }
        }
    };
    SettingsManager.getSavedServerSettings = function (config) {
        var item = config.storage.settings.get()[0];
        if (item && item.value && item.value.version && item.value.settings) {
            return item.value;
        }
        return { version: 0, settings: {} };
    };
    return SettingsManager;
}());
SettingsManager._isUpdatingSettings = false;
SettingsManager._handlers = [];
exports.SettingsManager = SettingsManager;
var SubmissionResponse = (function () {
    function SubmissionResponse(statusCode, message) {
        this.success = false;
        this.badRequest = false;
        this.serviceUnavailable = false;
        this.paymentRequired = false;
        this.unableToAuthenticate = false;
        this.notFound = false;
        this.requestEntityTooLarge = false;
        this.statusCode = statusCode;
        this.message = message;
        this.success = statusCode >= 200 && statusCode <= 299;
        this.badRequest = statusCode === 400;
        this.serviceUnavailable = statusCode === 503;
        this.paymentRequired = statusCode === 402;
        this.unableToAuthenticate = statusCode === 401 || statusCode === 403;
        this.notFound = statusCode === 404;
        this.requestEntityTooLarge = statusCode === 413;
    }
    return SubmissionResponse;
}());
exports.SubmissionResponse = SubmissionResponse;
var ExceptionlessClient = (function () {
    function ExceptionlessClient(settingsOrApiKey, serverUrl) {
        var _this = this;
        this.config = typeof settingsOrApiKey === 'object'
            ? new Configuration(settingsOrApiKey)
            : new Configuration({ apiKey: settingsOrApiKey, serverUrl: serverUrl });
        this.updateSettingsTimer(5000);
        this.config.onChanged(function (config) { return _this.updateSettingsTimer(_this._timeoutId > 0 ? 5000 : 0); });
        this.config.queue.onEventsPosted(function (events, response) { return _this.updateSettingsTimer(); });
    }
    ExceptionlessClient.prototype.createException = function (exception) {
        var pluginContextData = new ContextData();
        pluginContextData.setException(exception);
        return this.createEvent(pluginContextData).setType('error');
    };
    ExceptionlessClient.prototype.submitException = function (exception, callback) {
        this.createException(exception).submit(callback);
    };
    ExceptionlessClient.prototype.createUnhandledException = function (exception, submissionMethod) {
        var builder = this.createException(exception);
        builder.pluginContextData.markAsUnhandledError();
        builder.pluginContextData.setSubmissionMethod(submissionMethod);
        return builder;
    };
    ExceptionlessClient.prototype.submitUnhandledException = function (exception, submissionMethod, callback) {
        this.createUnhandledException(exception, submissionMethod).submit(callback);
    };
    ExceptionlessClient.prototype.createFeatureUsage = function (feature) {
        return this.createEvent().setType('usage').setSource(feature);
    };
    ExceptionlessClient.prototype.submitFeatureUsage = function (feature, callback) {
        this.createFeatureUsage(feature).submit(callback);
    };
    ExceptionlessClient.prototype.createLog = function (sourceOrMessage, message, level) {
        var builder = this.createEvent().setType('log');
        if (level) {
            builder = builder.setSource(sourceOrMessage).setMessage(message).setProperty('@level', level);
        }
        else if (message) {
            builder = builder.setSource(sourceOrMessage).setMessage(message);
        }
        else {
            builder = builder.setMessage(sourceOrMessage);
            try {
                var caller = this.createLog.caller;
                builder = builder.setSource(caller && caller.caller && caller.caller.name);
            }
            catch (e) {
                this.config.log.trace('Unable to resolve log source: ' + e.message);
            }
        }
        return builder;
    };
    ExceptionlessClient.prototype.submitLog = function (sourceOrMessage, message, level, callback) {
        this.createLog(sourceOrMessage, message, level).submit(callback);
    };
    ExceptionlessClient.prototype.createNotFound = function (resource) {
        return this.createEvent().setType('404').setSource(resource);
    };
    ExceptionlessClient.prototype.submitNotFound = function (resource, callback) {
        this.createNotFound(resource).submit(callback);
    };
    ExceptionlessClient.prototype.createSessionStart = function () {
        return this.createEvent().setType('session');
    };
    ExceptionlessClient.prototype.submitSessionStart = function (callback) {
        this.createSessionStart().submit(callback);
    };
    ExceptionlessClient.prototype.submitSessionEnd = function (sessionIdOrUserId) {
        if (sessionIdOrUserId) {
            this.config.log.info("Submitting session end: " + sessionIdOrUserId);
            this.config.submissionClient.sendHeartbeat(sessionIdOrUserId, true, this.config);
        }
    };
    ExceptionlessClient.prototype.submitSessionHeartbeat = function (sessionIdOrUserId) {
        if (sessionIdOrUserId) {
            this.config.log.info("Submitting session heartbeat: " + sessionIdOrUserId);
            this.config.submissionClient.sendHeartbeat(sessionIdOrUserId, false, this.config);
        }
    };
    ExceptionlessClient.prototype.createEvent = function (pluginContextData) {
        return new EventBuilder({ date: new Date() }, this, pluginContextData);
    };
    ExceptionlessClient.prototype.submitEvent = function (event, pluginContextData, callback) {
        function cancelled(eventPluginContext) {
            if (!!eventPluginContext) {
                eventPluginContext.cancelled = true;
            }
            return !!callback && callback(eventPluginContext);
        }
        var context = new EventPluginContext(this, event, pluginContextData);
        if (!event) {
            return cancelled(context);
        }
        if (!this.config.enabled) {
            this.config.log.info('Event submission is currently disabled.');
            return cancelled(context);
        }
        if (!event.data) {
            event.data = {};
        }
        if (!event.tags || !event.tags.length) {
            event.tags = [];
        }
        EventPluginManager.run(context, function (ctx) {
            var config = ctx.client.config;
            var ev = ctx.event;
            if (!ctx.cancelled) {
                if (!ev.type || ev.type.length === 0) {
                    ev.type = 'log';
                }
                if (!ev.date) {
                    ev.date = new Date();
                }
                config.queue.enqueue(ev);
                if (ev.reference_id && ev.reference_id.length > 0) {
                    ctx.log.info("Setting last reference id '" + ev.reference_id + "'");
                    config.lastReferenceIdManager.setLast(ev.reference_id);
                }
            }
            !!callback && callback(ctx);
        });
    };
    ExceptionlessClient.prototype.updateUserEmailAndDescription = function (referenceId, email, description, callback) {
        var _this = this;
        if (!referenceId || !email || !description || !this.config.enabled) {
            return !!callback && callback(new SubmissionResponse(500, 'cancelled'));
        }
        var userDescription = { email_address: email, description: description };
        this.config.submissionClient.postUserDescription(referenceId, userDescription, this.config, function (response) {
            if (!response.success) {
                _this.config.log.error("Failed to submit user email and description for event '" + referenceId + "': " + response.statusCode + " " + response.message);
            }
            !!callback && callback(response);
        });
    };
    ExceptionlessClient.prototype.getLastReferenceId = function () {
        return this.config.lastReferenceIdManager.getLast();
    };
    ExceptionlessClient.prototype.updateSettingsTimer = function (initialDelay) {
        var _this = this;
        this.config.log.info("Updating settings timer with delay: " + initialDelay);
        this._timeoutId = clearTimeout(this._timeoutId);
        this._timeoutId = clearInterval(this._intervalId);
        var interval = this.config.updateSettingsWhenIdleInterval;
        if (interval > 0) {
            var updateSettings = function () { return SettingsManager.updateSettings(_this.config); };
            if (initialDelay > 0) {
                this._timeoutId = setTimeout(updateSettings, initialDelay);
            }
            this._intervalId = setInterval(updateSettings, interval);
        }
    };
    Object.defineProperty(ExceptionlessClient, "default", {
        get: function () {
            if (ExceptionlessClient._instance === null) {
                ExceptionlessClient._instance = new ExceptionlessClient(null);
            }
            return ExceptionlessClient._instance;
        },
        enumerable: true,
        configurable: true
    });
    return ExceptionlessClient;
}());
ExceptionlessClient._instance = null;
exports.ExceptionlessClient = ExceptionlessClient;
var ContextData = (function () {
    function ContextData() {
    }
    ContextData.prototype.setException = function (exception) {
        if (exception) {
            this['@@_Exception'] = exception;
        }
    };
    Object.defineProperty(ContextData.prototype, "hasException", {
        get: function () {
            return !!this['@@_Exception'];
        },
        enumerable: true,
        configurable: true
    });
    ContextData.prototype.getException = function () {
        return this['@@_Exception'] || null;
    };
    ContextData.prototype.markAsUnhandledError = function () {
        this['@@_IsUnhandledError'] = true;
    };
    Object.defineProperty(ContextData.prototype, "isUnhandledError", {
        get: function () {
            return !!this['@@_IsUnhandledError'];
        },
        enumerable: true,
        configurable: true
    });
    ContextData.prototype.setSubmissionMethod = function (method) {
        if (method) {
            this['@@_SubmissionMethod'] = method;
        }
    };
    ContextData.prototype.getSubmissionMethod = function () {
        return this['@@_SubmissionMethod'] || null;
    };
    return ContextData;
}());
exports.ContextData = ContextData;
var Configuration = (function () {
    function Configuration(configSettings) {
        this.defaultTags = [];
        this.defaultData = {};
        this.enabled = true;
        this.lastReferenceIdManager = new DefaultLastReferenceIdManager();
        this.settings = {};
        this._serverUrl = 'https://collector.exceptionless.io';
        this._configServerUrl = 'https://config.exceptionless.io';
        this._heartbeatServerUrl = 'https://heartbeat.exceptionless.io';
        this._updateSettingsWhenIdleInterval = 120000;
        this._dataExclusions = [];
        this._userAgentBotPatterns = [];
        this._plugins = [];
        this._handlers = [];
        function inject(fn) {
            return typeof fn === 'function' ? fn(this) : fn;
        }
        configSettings = Utils.merge(Configuration.defaults, configSettings);
        this.log = inject(configSettings.log) || new NullLog();
        this.apiKey = configSettings.apiKey;
        this.serverUrl = configSettings.serverUrl;
        this.configServerUrl = configSettings.configServerUrl;
        this.heartbeatServerUrl = configSettings.heartbeatServerUrl;
        this.updateSettingsWhenIdleInterval = configSettings.updateSettingsWhenIdleInterval;
        this.includePrivateInformation = configSettings.includePrivateInformation;
        this.environmentInfoCollector = inject(configSettings.environmentInfoCollector);
        this.errorParser = inject(configSettings.errorParser);
        this.lastReferenceIdManager = inject(configSettings.lastReferenceIdManager) || new DefaultLastReferenceIdManager();
        this.moduleCollector = inject(configSettings.moduleCollector);
        this.requestInfoCollector = inject(configSettings.requestInfoCollector);
        this.submissionBatchSize = inject(configSettings.submissionBatchSize) || 50;
        this.submissionAdapter = inject(configSettings.submissionAdapter);
        this.submissionClient = inject(configSettings.submissionClient) || new DefaultSubmissionClient();
        this.storage = inject(configSettings.storage) || new InMemoryStorageProvider();
        this.queue = inject(configSettings.queue) || new DefaultEventQueue(this);
        SettingsManager.applySavedServerSettings(this);
        EventPluginManager.addDefaultPlugins(this);
    }
    Object.defineProperty(Configuration.prototype, "apiKey", {
        get: function () {
            return this._apiKey;
        },
        set: function (value) {
            this._apiKey = value || null;
            this.log.info("apiKey: " + this._apiKey);
            this.changed();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "isValid", {
        get: function () {
            return !!this.apiKey && this.apiKey.length >= 10;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "serverUrl", {
        get: function () {
            return this._serverUrl;
        },
        set: function (value) {
            if (!!value) {
                this._serverUrl = value;
                this._configServerUrl = value;
                this._heartbeatServerUrl = value;
                this.log.info("serverUrl: " + value);
                this.changed();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "configServerUrl", {
        get: function () {
            return this._configServerUrl;
        },
        set: function (value) {
            if (!!value) {
                this._configServerUrl = value;
                this.log.info("configServerUrl: " + value);
                this.changed();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "heartbeatServerUrl", {
        get: function () {
            return this._heartbeatServerUrl;
        },
        set: function (value) {
            if (!!value) {
                this._heartbeatServerUrl = value;
                this.log.info("heartbeatServerUrl: " + value);
                this.changed();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "updateSettingsWhenIdleInterval", {
        get: function () {
            return this._updateSettingsWhenIdleInterval;
        },
        set: function (value) {
            if (typeof value !== 'number') {
                return;
            }
            if (value <= 0) {
                value = -1;
            }
            else if (value > 0 && value < 120000) {
                value = 120000;
            }
            this._updateSettingsWhenIdleInterval = value;
            this.log.info("updateSettingsWhenIdleInterval: " + value);
            this.changed();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "dataExclusions", {
        get: function () {
            var exclusions = this.settings['@@DataExclusions'];
            return this._dataExclusions.concat(exclusions && exclusions.split(',') || []);
        },
        enumerable: true,
        configurable: true
    });
    Configuration.prototype.addDataExclusions = function () {
        var exclusions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            exclusions[_i] = arguments[_i];
        }
        this._dataExclusions = Utils.addRange.apply(Utils, [this._dataExclusions].concat(exclusions));
    };
    Object.defineProperty(Configuration.prototype, "includePrivateInformation", {
        get: function () {
            return this._includePrivateInformation;
        },
        set: function (value) {
            var val = value || false;
            this._includePrivateInformation = val;
            this._includeUserName = val;
            this._includeMachineName = val;
            this._includeIpAddress = val;
            this._includeCookies = val;
            this._includePostData = val;
            this._includeQueryString = val;
            this.log.info("includePrivateInformation: " + val);
            this.changed();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "includeUserName", {
        get: function () {
            return this._includeUserName;
        },
        set: function (value) {
            this._includeUserName = value || false;
            this.changed();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "includeMachineName", {
        get: function () {
            return this._includeMachineName;
        },
        set: function (value) {
            this._includeMachineName = value || false;
            this.changed();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "includeIpAddress", {
        get: function () {
            return this._includeIpAddress;
        },
        set: function (value) {
            this._includeIpAddress = value || false;
            this.changed();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "includeCookies", {
        get: function () {
            return this._includeCookies;
        },
        set: function (value) {
            this._includeCookies = value || false;
            this.changed();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "includePostData", {
        get: function () {
            return this._includePostData;
        },
        set: function (value) {
            this._includePostData = value || false;
            this.changed();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "includeQueryString", {
        get: function () {
            return this._includeQueryString;
        },
        set: function (value) {
            this._includeQueryString = value || false;
            this.changed();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Configuration.prototype, "userAgentBotPatterns", {
        get: function () {
            var patterns = this.settings['@@UserAgentBotPatterns'];
            return this._userAgentBotPatterns.concat(patterns && patterns.split(',') || []);
        },
        enumerable: true,
        configurable: true
    });
    Configuration.prototype.addUserAgentBotPatterns = function () {
        var userAgentBotPatterns = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            userAgentBotPatterns[_i] = arguments[_i];
        }
        this._userAgentBotPatterns = Utils.addRange.apply(Utils, [this._userAgentBotPatterns].concat(userAgentBotPatterns));
    };
    Object.defineProperty(Configuration.prototype, "plugins", {
        get: function () {
            return this._plugins.sort(function (p1, p2) {
                return (p1.priority < p2.priority) ? -1 : (p1.priority > p2.priority) ? 1 : 0;
            });
        },
        enumerable: true,
        configurable: true
    });
    Configuration.prototype.addPlugin = function (pluginOrName, priority, pluginAction) {
        var plugin = !!pluginAction ? { name: pluginOrName, priority: priority, run: pluginAction } : pluginOrName;
        if (!plugin || !plugin.run) {
            this.log.error('Add plugin failed: Run method not defined');
            return;
        }
        if (!plugin.name) {
            plugin.name = Utils.guid();
        }
        if (!plugin.priority) {
            plugin.priority = 0;
        }
        var pluginExists = false;
        var plugins = this._plugins;
        for (var _i = 0, plugins_1 = plugins; _i < plugins_1.length; _i++) {
            var p = plugins_1[_i];
            if (p.name === plugin.name) {
                pluginExists = true;
                break;
            }
        }
        if (!pluginExists) {
            plugins.push(plugin);
        }
    };
    Configuration.prototype.removePlugin = function (pluginOrName) {
        var name = typeof pluginOrName === 'string' ? pluginOrName : pluginOrName.name;
        if (!name) {
            this.log.error('Remove plugin failed: Plugin name not defined');
            return;
        }
        var plugins = this._plugins;
        for (var index = 0; index < plugins.length; index++) {
            if (plugins[index].name === name) {
                plugins.splice(index, 1);
                break;
            }
        }
    };
    Configuration.prototype.setVersion = function (version) {
        if (!!version) {
            this.defaultData['@version'] = version;
        }
    };
    Configuration.prototype.setUserIdentity = function (userInfoOrIdentity, name) {
        var USER_KEY = '@user';
        var userInfo = typeof userInfoOrIdentity !== 'string' ? userInfoOrIdentity : { identity: userInfoOrIdentity, name: name };
        var shouldRemove = !userInfo || (!userInfo.identity && !userInfo.name);
        if (shouldRemove) {
            delete this.defaultData[USER_KEY];
        }
        else {
            this.defaultData[USER_KEY] = userInfo;
        }
        this.log.info("user identity: " + (shouldRemove ? 'null' : userInfo.identity));
    };
    Object.defineProperty(Configuration.prototype, "userAgent", {
        get: function () {
            return 'exceptionless-js/1.6.0';
        },
        enumerable: true,
        configurable: true
    });
    Configuration.prototype.useSessions = function (sendHeartbeats, heartbeatInterval) {
        if (sendHeartbeats === void 0) { sendHeartbeats = true; }
        if (heartbeatInterval === void 0) { heartbeatInterval = 30000; }
        if (sendHeartbeats) {
            this.addPlugin(new HeartbeatPlugin(heartbeatInterval));
        }
    };
    Configuration.prototype.useReferenceIds = function () {
        this.addPlugin(new ReferenceIdPlugin());
    };
    Configuration.prototype.useLocalStorage = function () {
    };
    Configuration.prototype.useDebugLogger = function () {
        this.log = new ConsoleLog();
    };
    Configuration.prototype.onChanged = function (handler) {
        !!handler && this._handlers.push(handler);
    };
    Configuration.prototype.changed = function () {
        var handlers = this._handlers;
        for (var _i = 0, handlers_3 = handlers; _i < handlers_3.length; _i++) {
            var handler = handlers_3[_i];
            try {
                handler(this);
            }
            catch (ex) {
                this.log.error("Error calling onChanged handler: " + ex);
            }
        }
    };
    Object.defineProperty(Configuration, "defaults", {
        get: function () {
            if (Configuration._defaultSettings === null) {
                Configuration._defaultSettings = { includePrivateInformation: true };
            }
            return Configuration._defaultSettings;
        },
        enumerable: true,
        configurable: true
    });
    return Configuration;
}());
Configuration._defaultSettings = null;
exports.Configuration = Configuration;
var SettingsResponse = (function () {
    function SettingsResponse(success, settings, settingsVersion, exception, message) {
        if (settingsVersion === void 0) { settingsVersion = -1; }
        if (exception === void 0) { exception = null; }
        if (message === void 0) { message = null; }
        this.success = false;
        this.settingsVersion = -1;
        this.success = success;
        this.settings = settings;
        this.settingsVersion = settingsVersion;
        this.exception = exception;
        this.message = message;
    }
    return SettingsResponse;
}());
exports.SettingsResponse = SettingsResponse;
var EventBuilder = (function () {
    function EventBuilder(event, client, pluginContextData) {
        this._validIdentifierErrorMessage = 'must contain between 8 and 100 alphanumeric or \'-\' characters.';
        this.target = event;
        this.client = client;
        this.pluginContextData = pluginContextData || new ContextData();
    }
    EventBuilder.prototype.setType = function (type) {
        if (!!type) {
            this.target.type = type;
        }
        return this;
    };
    EventBuilder.prototype.setSource = function (source) {
        if (!!source) {
            this.target.source = source;
        }
        return this;
    };
    EventBuilder.prototype.setReferenceId = function (referenceId) {
        if (!this.isValidIdentifier(referenceId)) {
            throw new Error("ReferenceId " + this._validIdentifierErrorMessage);
        }
        this.target.reference_id = referenceId;
        return this;
    };
    EventBuilder.prototype.setEventReference = function (name, id) {
        if (!name) {
            throw new Error('Invalid name');
        }
        if (!id || !this.isValidIdentifier(id)) {
            throw new Error("Id " + this._validIdentifierErrorMessage);
        }
        this.setProperty('@ref:' + name, id);
        return this;
    };
    EventBuilder.prototype.setMessage = function (message) {
        if (!!message) {
            this.target.message = message;
        }
        return this;
    };
    EventBuilder.prototype.setGeo = function (latitude, longitude) {
        if (latitude < -90.0 || latitude > 90.0) {
            throw new Error('Must be a valid latitude value between -90.0 and 90.0.');
        }
        if (longitude < -180.0 || longitude > 180.0) {
            throw new Error('Must be a valid longitude value between -180.0 and 180.0.');
        }
        this.target.geo = latitude + "," + longitude;
        return this;
    };
    EventBuilder.prototype.setUserIdentity = function (userInfoOrIdentity, name) {
        var userInfo = typeof userInfoOrIdentity !== 'string' ? userInfoOrIdentity : { identity: userInfoOrIdentity, name: name };
        if (!userInfo || (!userInfo.identity && !userInfo.name)) {
            return this;
        }
        this.setProperty('@user', userInfo);
        return this;
    };
    EventBuilder.prototype.setUserDescription = function (emailAddress, description) {
        if (emailAddress && description) {
            this.setProperty('@user_description', { email_address: emailAddress, description: description });
        }
        return this;
    };
    EventBuilder.prototype.setManualStackingInfo = function (signatureData, title) {
        if (signatureData) {
            var stack = { signature_data: signatureData };
            if (title) {
                stack.title = title;
            }
            this.setProperty('@stack', stack);
        }
        return this;
    };
    EventBuilder.prototype.setManualStackingKey = function (manualStackingKey, title) {
        if (manualStackingKey) {
            var data = { ManualStackingKey: manualStackingKey };
            this.setManualStackingInfo(data, title);
        }
        return this;
    };
    EventBuilder.prototype.setValue = function (value) {
        if (!!value) {
            this.target.value = value;
        }
        return this;
    };
    EventBuilder.prototype.addTags = function () {
        var tags = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tags[_i] = arguments[_i];
        }
        this.target.tags = Utils.addRange.apply(Utils, [this.target.tags].concat(tags));
        return this;
    };
    EventBuilder.prototype.setProperty = function (name, value, maxDepth, excludedPropertyNames) {
        if (!name || (value === undefined || value == null)) {
            return this;
        }
        if (!this.target.data) {
            this.target.data = {};
        }
        var result = JSON.parse(Utils.stringify(value, this.client.config.dataExclusions.concat(excludedPropertyNames || []), maxDepth));
        if (!Utils.isEmpty(result)) {
            this.target.data[name] = result;
        }
        return this;
    };
    EventBuilder.prototype.markAsCritical = function (critical) {
        if (critical) {
            this.addTags('Critical');
        }
        return this;
    };
    EventBuilder.prototype.addRequestInfo = function (request) {
        if (!!request) {
            this.pluginContextData['@request'] = request;
        }
        return this;
    };
    EventBuilder.prototype.submit = function (callback) {
        this.client.submitEvent(this.target, this.pluginContextData, callback);
    };
    EventBuilder.prototype.isValidIdentifier = function (value) {
        if (!value) {
            return true;
        }
        if (value.length < 8 || value.length > 100) {
            return false;
        }
        for (var index = 0; index < value.length; index++) {
            var code = value.charCodeAt(index);
            var isDigit = (code >= 48) && (code <= 57);
            var isLetter = ((code >= 65) && (code <= 90)) || ((code >= 97) && (code <= 122));
            var isMinus = code === 45;
            if (!(isDigit || isLetter) && !isMinus) {
                return false;
            }
        }
        return true;
    };
    return EventBuilder;
}());
exports.EventBuilder = EventBuilder;
var ConfigurationDefaultsPlugin = (function () {
    function ConfigurationDefaultsPlugin() {
        this.priority = 10;
        this.name = 'ConfigurationDefaultsPlugin';
    }
    ConfigurationDefaultsPlugin.prototype.run = function (context, next) {
        var config = context.client.config;
        var defaultTags = config.defaultTags || [];
        for (var _i = 0, defaultTags_1 = defaultTags; _i < defaultTags_1.length; _i++) {
            var tag = defaultTags_1[_i];
            if (!!tag && context.event.tags.indexOf(tag) < 0) {
                context.event.tags.push(tag);
            }
        }
        var defaultData = config.defaultData || {};
        for (var key in defaultData) {
            if (!!defaultData[key]) {
                var result = JSON.parse(Utils.stringify(defaultData[key], config.dataExclusions));
                if (!Utils.isEmpty(result)) {
                    context.event.data[key] = result;
                }
            }
        }
        next && next();
    };
    return ConfigurationDefaultsPlugin;
}());
exports.ConfigurationDefaultsPlugin = ConfigurationDefaultsPlugin;
var DuplicateCheckerPlugin = (function () {
    function DuplicateCheckerPlugin(getCurrentTime, interval) {
        if (getCurrentTime === void 0) { getCurrentTime = function () { return Date.now(); }; }
        if (interval === void 0) { interval = 30000; }
        var _this = this;
        this.priority = 1010;
        this.name = 'DuplicateCheckerPlugin';
        this._mergedEvents = [];
        this._processedHashcodes = [];
        this._getCurrentTime = getCurrentTime;
        this._interval = interval;
        setInterval(function () {
            while (_this._mergedEvents.length > 0) {
                _this._mergedEvents.shift().resubmit();
            }
        }, interval);
    }
    DuplicateCheckerPlugin.prototype.run = function (context, next) {
        var _this = this;
        function getHashCode(e) {
            var hash = 0;
            while (e) {
                if (e.message && e.message.length) {
                    hash += (hash * 397) ^ Utils.getHashCode(e.message);
                }
                if (e.stack_trace && e.stack_trace.length) {
                    hash += (hash * 397) ^ Utils.getHashCode(JSON.stringify(e.stack_trace));
                }
                e = e.inner;
            }
            return hash;
        }
        var error = context.event.data['@error'];
        var hashCode = getHashCode(error);
        if (hashCode) {
            var count = context.event.count || 1;
            var now_1 = this._getCurrentTime();
            var merged = this._mergedEvents.filter(function (s) { return s.hashCode === hashCode; })[0];
            if (merged) {
                merged.incrementCount(count);
                merged.updateDate(context.event.date);
                context.log.info('Ignoring duplicate event with hash: ' + hashCode);
                context.cancelled = true;
            }
            if (!context.cancelled && this._processedHashcodes.some(function (h) { return h.hash === hashCode && h.timestamp >= (now_1 - _this._interval); })) {
                context.log.trace('Adding event with hash: ' + hashCode);
                this._mergedEvents.push(new MergedEvent(hashCode, context, count));
                context.cancelled = true;
            }
            if (!context.cancelled) {
                context.log.trace('Enqueueing event with hash: ' + hashCode + 'to cache.');
                this._processedHashcodes.push({ hash: hashCode, timestamp: now_1 });
                while (this._processedHashcodes.length > 50) {
                    this._processedHashcodes.shift();
                }
            }
        }
        next && next();
    };
    return DuplicateCheckerPlugin;
}());
exports.DuplicateCheckerPlugin = DuplicateCheckerPlugin;
var MergedEvent = (function () {
    function MergedEvent(hashCode, context, count) {
        this.hashCode = hashCode;
        this._context = context;
        this._count = count;
    }
    MergedEvent.prototype.incrementCount = function (count) {
        this._count += count;
    };
    MergedEvent.prototype.resubmit = function () {
        this._context.event.count = this._count;
        this._context.client.config.queue.enqueue(this._context.event);
    };
    MergedEvent.prototype.updateDate = function (date) {
        if (date > this._context.event.date) {
            this._context.event.date = date;
        }
    };
    return MergedEvent;
}());
var EnvironmentInfoPlugin = (function () {
    function EnvironmentInfoPlugin() {
        this.priority = 80;
        this.name = 'EnvironmentInfoPlugin';
    }
    EnvironmentInfoPlugin.prototype.run = function (context, next) {
        var ENVIRONMENT_KEY = '@environment';
        var collector = context.client.config.environmentInfoCollector;
        if (!context.event.data[ENVIRONMENT_KEY] && collector) {
            var environmentInfo = collector.getEnvironmentInfo(context);
            if (!!environmentInfo) {
                context.event.data[ENVIRONMENT_KEY] = environmentInfo;
            }
        }
        next && next();
    };
    return EnvironmentInfoPlugin;
}());
exports.EnvironmentInfoPlugin = EnvironmentInfoPlugin;
var ErrorPlugin = (function () {
    function ErrorPlugin() {
        this.priority = 30;
        this.name = 'ErrorPlugin';
    }
    ErrorPlugin.prototype.run = function (context, next) {
        var ERROR_KEY = '@error';
        var ignoredProperties = [
            'arguments',
            'column',
            'columnNumber',
            'description',
            'fileName',
            'message',
            'name',
            'number',
            'line',
            'lineNumber',
            'opera#sourceloc',
            'sourceId',
            'sourceURL',
            'stack',
            'stackArray',
            'stacktrace'
        ];
        var exception = context.contextData.getException();
        if (!!exception) {
            context.event.type = 'error';
            if (!context.event.data[ERROR_KEY]) {
                var config = context.client.config;
                var parser = config.errorParser;
                if (!parser) {
                    throw new Error('No error parser was defined.');
                }
                var result = parser.parse(context, exception);
                if (!!result) {
                    var additionalData = JSON.parse(Utils.stringify(exception, config.dataExclusions.concat(ignoredProperties)));
                    if (!Utils.isEmpty(additionalData)) {
                        if (!result.data) {
                            result.data = {};
                        }
                        result.data['@ext'] = additionalData;
                    }
                    context.event.data[ERROR_KEY] = result;
                }
            }
        }
        next && next();
    };
    return ErrorPlugin;
}());
exports.ErrorPlugin = ErrorPlugin;
var EventExclusionPlugin = (function () {
    function EventExclusionPlugin() {
        this.priority = 45;
        this.name = 'EventExclusionPlugin';
    }
    EventExclusionPlugin.prototype.run = function (context, next) {
        function getLogLevel(level) {
            switch ((level || '').toLowerCase().trim()) {
                case 'trace':
                case 'true':
                case '1':
                case 'yes':
                    return 0;
                case 'debug':
                    return 1;
                case 'info':
                    return 2;
                case 'warn':
                    return 3;
                case 'error':
                    return 4;
                case 'fatal':
                    return 5;
                case 'off':
                case 'false':
                case '0':
                case 'no':
                    return 6;
                default:
                    return -1;
            }
        }
        function getMinLogLevel(configSettings, loggerName) {
            if (loggerName === void 0) { loggerName = '*'; }
            return getLogLevel(getTypeAndSourceSetting(configSettings, 'log', loggerName, 'Trace') + '');
        }
        function getTypeAndSourceSetting(configSettings, type, source, defaultValue) {
            if (configSettings === void 0) { configSettings = {}; }
            if (!type) {
                return defaultValue;
            }
            var isLog = type === 'log';
            var sourcePrefix = "@@" + type + ":";
            var value = configSettings[sourcePrefix + source];
            if (value) {
                return !isLog ? Utils.toBoolean(value) : value;
            }
            for (var key in configSettings) {
                if (Utils.startsWith(key.toLowerCase(), sourcePrefix.toLowerCase()) && Utils.isMatch(source, [key.substring(sourcePrefix.length)])) {
                    return !isLog ? Utils.toBoolean(configSettings[key]) : configSettings[key];
                }
            }
            return defaultValue;
        }
        var ev = context.event;
        var log = context.log;
        var settings = context.client.config.settings;
        if (ev.type === 'log') {
            var minLogLevel = getMinLogLevel(settings, ev.source);
            var logLevel = getLogLevel(ev.data['@level']);
            if (logLevel >= 0 && (logLevel > 5 || logLevel < minLogLevel)) {
                log.info('Cancelling log event due to minimum log level.');
                context.cancelled = true;
            }
        }
        else if (ev.type === 'error') {
            var error = ev.data['@error'];
            while (!context.cancelled && error) {
                if (getTypeAndSourceSetting(settings, ev.type, error.type, true) === false) {
                    log.info("Cancelling error from excluded exception type: " + error.type);
                    context.cancelled = true;
                }
                error = error.inner;
            }
        }
        else if (getTypeAndSourceSetting(settings, ev.type, ev.source, true) === false) {
            log.info("Cancelling event from excluded type: " + ev.type + " and source: " + ev.source);
            context.cancelled = true;
        }
        next && next();
    };
    return EventExclusionPlugin;
}());
exports.EventExclusionPlugin = EventExclusionPlugin;
var ModuleInfoPlugin = (function () {
    function ModuleInfoPlugin() {
        this.priority = 50;
        this.name = 'ModuleInfoPlugin';
    }
    ModuleInfoPlugin.prototype.run = function (context, next) {
        var ERROR_KEY = '@error';
        var collector = context.client.config.moduleCollector;
        if (context.event.data[ERROR_KEY] && !context.event.data['@error'].modules && !!collector) {
            var modules = collector.getModules(context);
            if (modules && modules.length > 0) {
                context.event.data[ERROR_KEY].modules = modules;
            }
        }
        next && next();
    };
    return ModuleInfoPlugin;
}());
exports.ModuleInfoPlugin = ModuleInfoPlugin;
var RequestInfoPlugin = (function () {
    function RequestInfoPlugin() {
        this.priority = 70;
        this.name = 'RequestInfoPlugin';
    }
    RequestInfoPlugin.prototype.run = function (context, next) {
        var REQUEST_KEY = '@request';
        var config = context.client.config;
        var collector = config.requestInfoCollector;
        if (!context.event.data[REQUEST_KEY] && !!collector) {
            var requestInfo = collector.getRequestInfo(context);
            if (!!requestInfo) {
                if (Utils.isMatch(requestInfo.user_agent, config.userAgentBotPatterns)) {
                    context.log.info('Cancelling event as the request user agent matches a known bot pattern');
                    context.cancelled = true;
                }
                else {
                    context.event.data[REQUEST_KEY] = requestInfo;
                }
            }
        }
        next && next();
    };
    return RequestInfoPlugin;
}());
exports.RequestInfoPlugin = RequestInfoPlugin;
var SubmissionMethodPlugin = (function () {
    function SubmissionMethodPlugin() {
        this.priority = 100;
        this.name = 'SubmissionMethodPlugin';
    }
    SubmissionMethodPlugin.prototype.run = function (context, next) {
        var submissionMethod = context.contextData.getSubmissionMethod();
        if (!!submissionMethod) {
            context.event.data['@submission_method'] = submissionMethod;
        }
        next && next();
    };
    return SubmissionMethodPlugin;
}());
exports.SubmissionMethodPlugin = SubmissionMethodPlugin;
var InMemoryStorage = (function () {
    function InMemoryStorage(maxItems) {
        this.items = [];
        this.lastTimestamp = 0;
        this.maxItems = maxItems;
    }
    InMemoryStorage.prototype.save = function (value) {
        if (!value) {
            return null;
        }
        var items = this.items;
        var timestamp = Math.max(Date.now(), this.lastTimestamp + 1);
        var item = { timestamp: timestamp, value: value };
        if (items.push(item) > this.maxItems) {
            items.shift();
        }
        this.lastTimestamp = timestamp;
        return item.timestamp;
    };
    InMemoryStorage.prototype.get = function (limit) {
        return this.items.slice(0, limit);
    };
    InMemoryStorage.prototype.remove = function (timestamp) {
        var items = this.items;
        for (var i = 0; i < items.length; i++) {
            if (items[i].timestamp === timestamp) {
                items.splice(i, 1);
                return;
            }
        }
    };
    InMemoryStorage.prototype.clear = function () {
        this.items = [];
    };
    return InMemoryStorage;
}());
exports.InMemoryStorage = InMemoryStorage;
var KeyValueStorageBase = (function () {
    function KeyValueStorageBase(maxItems) {
        this.lastTimestamp = 0;
        this.maxItems = maxItems;
    }
    KeyValueStorageBase.prototype.save = function (value, single) {
        if (!value) {
            return null;
        }
        this.ensureIndex();
        var items = this.items;
        var timestamp = Math.max(Date.now(), this.lastTimestamp + 1);
        var key = this.getKey(timestamp);
        var json = JSON.stringify(value);
        try {
            this.write(key, json);
            this.lastTimestamp = timestamp;
            if (items.push(timestamp) > this.maxItems) {
                this.delete(this.getKey(items.shift()));
            }
        }
        catch (e) {
            return null;
        }
        return timestamp;
    };
    KeyValueStorageBase.prototype.get = function (limit) {
        var _this = this;
        this.ensureIndex();
        return this.items.slice(0, limit)
            .map(function (timestamp) {
            var key = _this.getKey(timestamp);
            try {
                var json = _this.read(key);
                var value = JSON.parse(json, parseDate);
                return { timestamp: timestamp, value: value };
            }
            catch (error) {
                _this.safeDelete(key);
                return null;
            }
        })
            .filter(function (item) { return item != null; });
    };
    KeyValueStorageBase.prototype.remove = function (timestamp) {
        this.ensureIndex();
        var items = this.items;
        var index = items.indexOf(timestamp);
        if (index >= 0) {
            var key = this.getKey(timestamp);
            this.safeDelete(key);
            items.splice(index, 1);
        }
    };
    KeyValueStorageBase.prototype.clear = function () {
        var _this = this;
        this.items.forEach(function (item) { return _this.safeDelete(_this.getKey(item)); });
        this.items = [];
    };
    KeyValueStorageBase.prototype.ensureIndex = function () {
        if (!this.items) {
            this.items = this.createIndex();
            this.lastTimestamp = Math.max.apply(Math, [0].concat(this.items)) + 1;
        }
    };
    KeyValueStorageBase.prototype.safeDelete = function (key) {
        try {
            this.delete(key);
        }
        catch (error) {
        }
    };
    KeyValueStorageBase.prototype.createIndex = function () {
        var _this = this;
        try {
            var keys = this.readAllKeys();
            return keys.map(function (key) {
                try {
                    var timestamp = _this.getTimestamp(key);
                    if (!timestamp) {
                        _this.safeDelete(key);
                        return null;
                    }
                    return timestamp;
                }
                catch (error) {
                    _this.safeDelete(key);
                    return null;
                }
            }).filter(function (timestamp) { return timestamp != null; })
                .sort(function (a, b) { return a - b; });
        }
        catch (error) {
            return [];
        }
    };
    return KeyValueStorageBase;
}());
exports.KeyValueStorageBase = KeyValueStorageBase;
function parseDate(key, value) {
    var dateRegx = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/g;
    if (typeof value === 'string') {
        var a = dateRegx.exec(value);
        if (a) {
            return new Date(value);
        }
    }
    return value;
}
var BrowserStorage = (function (_super) {
    __extends(BrowserStorage, _super);
    function BrowserStorage(namespace, prefix, maxItems) {
        if (prefix === void 0) { prefix = 'com.exceptionless.'; }
        if (maxItems === void 0) { maxItems = 20; }
        var _this = _super.call(this, maxItems) || this;
        _this.prefix = prefix + namespace + '-';
        return _this;
    }
    BrowserStorage.isAvailable = function () {
        try {
            var storage = window.localStorage;
            var x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    BrowserStorage.prototype.write = function (key, value) {
        window.localStorage.setItem(key, value);
    };
    BrowserStorage.prototype.read = function (key) {
        return window.localStorage.getItem(key);
    };
    BrowserStorage.prototype.readAllKeys = function () {
        var _this = this;
        return Object.keys(window.localStorage)
            .filter(function (key) { return key.indexOf(_this.prefix) === 0; });
    };
    BrowserStorage.prototype.delete = function (key) {
        window.localStorage.removeItem(key);
    };
    BrowserStorage.prototype.getKey = function (timestamp) {
        return this.prefix + timestamp;
    };
    BrowserStorage.prototype.getTimestamp = function (key) {
        return parseInt(key.substr(this.prefix.length), 10);
    };
    return BrowserStorage;
}(KeyValueStorageBase));
exports.BrowserStorage = BrowserStorage;
var DefaultErrorParser = (function () {
    function DefaultErrorParser() {
    }
    DefaultErrorParser.prototype.parse = function (context, exception) {
        function getParameters(parameters) {
            var params = (typeof parameters === 'string' ? [parameters] : parameters) || [];
            var result = [];
            for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
                var param = params_1[_i];
                result.push({ name: param });
            }
            return result;
        }
        function getStackFrames(stackFrames) {
            var ANONYMOUS = '<anonymous>';
            var frames = [];
            for (var _i = 0, stackFrames_1 = stackFrames; _i < stackFrames_1.length; _i++) {
                var frame = stackFrames_1[_i];
                frames.push({
                    name: (frame.func || ANONYMOUS).replace('?', ANONYMOUS),
                    parameters: getParameters(frame.args),
                    file_name: frame.url,
                    line_number: frame.line || 0,
                    column: frame.column || 0
                });
            }
            return frames;
        }
        var TRACEKIT_STACK_TRACE_KEY = '@@_TraceKit.StackTrace';
        var stackTrace = !!context.contextData[TRACEKIT_STACK_TRACE_KEY]
            ? context.contextData[TRACEKIT_STACK_TRACE_KEY]
            : TraceKit.computeStackTrace(exception, 25);
        if (!stackTrace) {
            throw new Error('Unable to parse the exceptions stack trace.');
        }
        var message = typeof (exception) === 'string' ? exception : undefined;
        return {
            type: stackTrace.name || 'Error',
            message: stackTrace.message || exception.message || message,
            stack_trace: getStackFrames(stackTrace.stack || [])
        };
    };
    return DefaultErrorParser;
}());
exports.DefaultErrorParser = DefaultErrorParser;
var DefaultModuleCollector = (function () {
    function DefaultModuleCollector() {
    }
    DefaultModuleCollector.prototype.getModules = function (context) {
        if (!document || !document.getElementsByTagName) {
            return null;
        }
        var modules = [];
        var scripts = document.getElementsByTagName('script');
        if (scripts && scripts.length > 0) {
            for (var index = 0; index < scripts.length; index++) {
                if (scripts[index].src) {
                    modules.push({
                        module_id: index,
                        name: scripts[index].src.split('?')[0],
                        version: Utils.parseVersion(scripts[index].src)
                    });
                }
                else if (!!scripts[index].innerHTML) {
                    modules.push({
                        module_id: index,
                        name: 'Script Tag',
                        version: Utils.getHashCode(scripts[index].innerHTML).toString()
                    });
                }
            }
        }
        return modules;
    };
    return DefaultModuleCollector;
}());
exports.DefaultModuleCollector = DefaultModuleCollector;
var DefaultRequestInfoCollector = (function () {
    function DefaultRequestInfoCollector() {
    }
    DefaultRequestInfoCollector.prototype.getRequestInfo = function (context) {
        if (!document || !navigator || !location) {
            return null;
        }
        var config = context.client.config;
        var exclusions = config.dataExclusions;
        var requestInfo = {
            user_agent: navigator.userAgent,
            is_secure: location.protocol === 'https:',
            host: location.hostname,
            port: location.port && location.port !== '' ? parseInt(location.port, 10) : 80,
            path: location.pathname
        };
        if (config.includeCookies) {
            requestInfo.cookies = Utils.getCookies(document.cookie, exclusions);
        }
        if (config.includeQueryString) {
            requestInfo.query_string = Utils.parseQueryString(location.search.substring(1), exclusions);
        }
        if (document.referrer && document.referrer !== '') {
            requestInfo.referrer = document.referrer;
        }
        return requestInfo;
    };
    return DefaultRequestInfoCollector;
}());
exports.DefaultRequestInfoCollector = DefaultRequestInfoCollector;
var BrowserStorageProvider = (function () {
    function BrowserStorageProvider(prefix, maxQueueItems) {
        if (maxQueueItems === void 0) { maxQueueItems = 250; }
        this.queue = new BrowserStorage('q', prefix, maxQueueItems);
        this.settings = new BrowserStorage('settings', prefix, 1);
    }
    return BrowserStorageProvider;
}());
exports.BrowserStorageProvider = BrowserStorageProvider;
var DefaultSubmissionAdapter = (function () {
    function DefaultSubmissionAdapter() {
    }
    DefaultSubmissionAdapter.prototype.sendRequest = function (request, callback, isAppExiting) {
        var TIMEOUT = 'timeout';
        var LOADED = 'loaded';
        var WITH_CREDENTIALS = 'withCredentials';
        var isCompleted = false;
        var useSetTimeout = false;
        function complete(mode, xhrRequest) {
            function parseResponseHeaders(headerStr) {
                function trim(value) {
                    return value.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
                }
                var headers = {};
                var headerPairs = (headerStr || '').split('\u000d\u000a');
                for (var _i = 0, headerPairs_1 = headerPairs; _i < headerPairs_1.length; _i++) {
                    var headerPair = headerPairs_1[_i];
                    var separator = headerPair.indexOf('\u003a\u0020');
                    if (separator > 0) {
                        headers[trim(headerPair.substring(0, separator).toLowerCase())] = headerPair.substring(separator + 2);
                    }
                }
                return headers;
            }
            if (isCompleted) {
                return;
            }
            isCompleted = true;
            var message = xhrRequest.statusText;
            var responseText = xhrRequest.responseText;
            var status = xhrRequest.status;
            if (mode === TIMEOUT || status === 0) {
                message = 'Unable to connect to server.';
                status = 0;
            }
            else if (mode === LOADED && !status) {
                status = request.method === 'POST' ? 202 : 200;
            }
            else if (status < 200 || status > 299) {
                var responseBody = xhrRequest.responseBody;
                if (!!responseBody && !!responseBody.message) {
                    message = responseBody.message;
                }
                else if (!!responseText && responseText.indexOf('message') !== -1) {
                    try {
                        message = JSON.parse(responseText).message;
                    }
                    catch (e) {
                        message = responseText;
                    }
                }
            }
            callback && callback(status || 500, message || '', responseText, parseResponseHeaders(xhrRequest.getAllResponseHeaders && xhrRequest.getAllResponseHeaders()));
        }
        function createRequest(userAgent, method, uri) {
            var xmlRequest = new XMLHttpRequest();
            if (WITH_CREDENTIALS in xmlRequest) {
                xmlRequest.open(method, uri, true);
                xmlRequest.setRequestHeader('X-Exceptionless-Client', userAgent);
                if (method === 'POST') {
                    xmlRequest.setRequestHeader('Content-Type', 'application/json');
                }
            }
            else if (typeof XDomainRequest !== 'undefined') {
                useSetTimeout = true;
                xmlRequest = new XDomainRequest();
                xmlRequest.open(method, location.protocol === 'http:' ? uri.replace('https:', 'http:') : uri);
            }
            else {
                xmlRequest = null;
            }
            if (xmlRequest) {
                xmlRequest.timeout = 10000;
            }
            return xmlRequest;
        }
        var url = "" + request.url + (request.url.indexOf('?') === -1 ? '?' : '&') + "access_token=" + encodeURIComponent(request.apiKey);
        var xhr = createRequest(request.userAgent, request.method || 'POST', url);
        if (!xhr) {
            return (callback && callback(503, 'CORS not supported.'));
        }
        if (WITH_CREDENTIALS in xhr) {
            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4) {
                    return;
                }
                complete(LOADED, xhr);
            };
        }
        xhr.onprogress = function () { };
        xhr.ontimeout = function () { return complete(TIMEOUT, xhr); };
        xhr.onerror = function () { return complete('error', xhr); };
        xhr.onload = function () { return complete(LOADED, xhr); };
        if (useSetTimeout) {
            setTimeout(function () { return xhr.send(request.data); }, 500);
        }
        else {
            xhr.send(request.data);
        }
    };
    return DefaultSubmissionAdapter;
}());
exports.DefaultSubmissionAdapter = DefaultSubmissionAdapter;
(function init() {
    function getDefaultsSettingsFromScriptTag() {
        if (!document || !document.getElementsByTagName) {
            return null;
        }
        var scripts = document.getElementsByTagName('script');
        for (var index = 0; index < scripts.length; index++) {
            if (scripts[index].src && scripts[index].src.indexOf('/exceptionless') > -1) {
                return Utils.parseQueryString(scripts[index].src.split('?').pop());
            }
        }
        return null;
    }
    function processUnhandledException(stackTrace, options) {
        var builder = ExceptionlessClient.default.createUnhandledException(new Error(stackTrace.message || (options || {}).status || 'Script error'), 'onerror');
        builder.pluginContextData['@@_TraceKit.StackTrace'] = stackTrace;
        builder.submit();
    }
    if (typeof document === 'undefined') {
        return;
    }
    Configuration.prototype.useLocalStorage = function () {
        if (BrowserStorage.isAvailable()) {
            this.storage = new BrowserStorageProvider();
            SettingsManager.applySavedServerSettings(this);
            this.changed();
        }
    };
    var defaults = Configuration.defaults;
    var settings = getDefaultsSettingsFromScriptTag();
    if (settings) {
        if (settings.apiKey) {
            defaults.apiKey = settings.apiKey;
        }
        if (settings.serverUrl) {
            defaults.serverUrl = settings.serverUrl;
        }
        if (typeof settings.includePrivateInformation === 'string') {
            defaults.includePrivateInformation = settings.includePrivateInformation === 'false' ? false : true;
        }
    }
    defaults.errorParser = new DefaultErrorParser();
    defaults.moduleCollector = new DefaultModuleCollector();
    defaults.requestInfoCollector = new DefaultRequestInfoCollector();
    defaults.submissionAdapter = new DefaultSubmissionAdapter();
    TraceKit.report.subscribe(processUnhandledException);
    TraceKit.extendToAsynchronousCallbacks();
    Error.stackTraceLimit = Infinity;
})();

return exports;

}));


//# sourceMappingURL=exceptionless.js.map
