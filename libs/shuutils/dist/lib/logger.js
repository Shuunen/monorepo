import { _ as _class_private_field_loose_base } from "@swc/helpers/_/_class_private_field_loose_base";
import { _ as _class_private_field_loose_key } from "@swc/helpers/_/_class_private_field_loose_key";
import { _ as _extends } from "@swc/helpers/_/_extends";
import { consoleLog } from './browser-console.js';
import { toastError, toastInfo, toastSuccess } from './browser-toast.js';
import { bgGreen, bgRed, blue, cyan, gray, green, red, yellow } from './colors.js';
import { nbFourth, nbSpacesIndent } from './constants.js';
import { formatDate, readableTime } from './dates.js';
import { isBrowserEnvironment } from './environment.js';
import { isVerbose } from './flags.js';
/**
 * Clean stuff to log
 * @param stuff the things to log
 * @returns the cleaned log line
 * @example clean(['Hello', { name: "world" }, 42]) // "Hello { "name": "world" } 42"
 */ function clean(...stuff) {
    // oxlint-disable no-control-regex
    return stuff.map((thing)=>typeof thing === 'object' ? JSON.stringify(thing) : String(thing)).join(' ')// biome-ignore lint/suspicious/noControlCharactersInRegex: it's ok, daddy is here
    .replace(/[\u001B\u009B][#();?[]*(?:\d{1,4}(?:;\d{0,4})*)?[\d<=>A-ORZcf-nqry]/gu, '').replace(/"/gu, "'");
// oxlint-enable no-control-regex
}
var _lastLogTimestamp = /*#__PURE__*/ _class_private_field_loose_key("_lastLogTimestamp"), _levels = /*#__PURE__*/ _class_private_field_loose_key("_levels"), _padding = /*#__PURE__*/ _class_private_field_loose_key("_padding"), _padStart = /*#__PURE__*/ _class_private_field_loose_key("_padStart");
/**
 * Logger class
 * @example const logger = new Logger()
 * @example const logger = new Logger({ isActive: false, minimumLevel: '3-info', willLogDate: false, willLogDelay: true, willLogTime: false, willOutputToConsole: true, willOutputToMemory: false })
 */ export class Logger {
    /**
   * Calculate the delay since the last log
   * @returns the delay like "+12ms"
   */ __getDelay() {
        const now = Date.now();
        if (_class_private_field_loose_base(this, _lastLogTimestamp)[_lastLogTimestamp] === 0) {
            _class_private_field_loose_base(this, _lastLogTimestamp)[_lastLogTimestamp] = now;
            return gray('init'.padStart(_class_private_field_loose_base(this, _padStart)[_padStart]));
        }
        const delay = now - _class_private_field_loose_base(this, _lastLogTimestamp)[_lastLogTimestamp];
        _class_private_field_loose_base(this, _lastLogTimestamp)[_lastLogTimestamp] = now;
        return gray(`+${readableTime(delay, false)}`.padStart(_class_private_field_loose_base(this, _padStart)[_padStart]));
    }
    /**
   * Log a message
   * @param prefix the prefix to add before the message
   * @param stuff the things to log
   */ __log(prefix, stuff) {
        const prefixes = [
            prefix
        ];
        if (this.options.willLogTime) prefixes.unshift(formatDate(new Date(), 'HH:mm:ss'));
        if (this.options.willLogDate) prefixes.unshift(formatDate(new Date(), 'yyyy-MM-dd'));
        if (this.options.willLogDelay) prefixes.unshift(this.__getDelay());
        if (this.options.willOutputToConsole) consoleLog(prefixes.join(' '), ...stuff);
        if (this.options.willOutputToMemory) this.addToMemoryLogs(...prefixes, ...stuff);
    }
    /**
   * Log a message if log level allows it
   * @param prefix the prefix to add before the message
   * @param level the log level to check
   * @param stuff the things to log
   * @param color a function to colorize the prefix
   * @example logger.logIf('debug', '1-debug', ['Hello', 'world', 42])
   */ // oxlint-disable-next-line max-params
    __logIf(prefix, level, stuff, color) {
        if (!this.__shouldLog(level)) return;
        this.__log(color(prefix.padStart(_class_private_field_loose_base(this, _padding)[_padding])), stuff);
    }
    /**
   * Check if a log should be output
   * @param level the log level to check
   * @returns true if the log should be output
   */ __shouldLog(level) {
        return this.options.isActive && _class_private_field_loose_base(this, _levels)[_levels].indexOf(level) >= _class_private_field_loose_base(this, _levels)[_levels].indexOf(this.options.minimumLevel);
    }
    /**
   * Push a log to the inMemoryLogs array
   * @param stuff the things to log
   * @example logger.addToMemoryLogs(['Hello', 'world', 42])
   */ addToMemoryLogs(...stuff) {
        this.inMemoryLogs.push(clean(...stuff));
    }
    /**
   * Log a debug message
   * @param stuff the things to log
   * @example logger.debug('Hello world')
   */ debug(...stuff) {
        this.__logIf('debug', '1-debug', stuff, gray);
    }
    /**
   * Disable the logger output
   */ disable() {
        this.options.isActive = false;
    }
    /**
   * Enable the logger output
   */ enable() {
        this.options.isActive = true;
    }
    /**
   * Log an error message
   * @param stuff the things to log (will be red, such original)
   * @example logger.error('Something went wrong')
   */ error(...stuff) {
        const errors = stuff.map((thing)=>thing instanceof Error ? thing.message : thing);
        this.__logIf('error', '7-error', errors, red);
    }
    /**
   * Log a fix message
   * @param stuff the things to log
   * @example logger.fix('This is a fix')
   */ fix(...stuff) {
        this.__logIf('fix', '4-fix', stuff, cyan);
    }
    /**
   * Log a good message
   * @param stuff the things to log (will be green, as expected)
   * @example logger.good('Everything went well')
   */ good(...stuff) {
        this.__logIf('good', '6-good', stuff, green);
    }
    /**
   * Log an info message
   * @param stuff the things to log
   * @example logger.info('Hello ¯\_(ツ)_/¯')
   */ info(...stuff) {
        this.__logIf('info', '3-info', stuff, blue);
    }
    /**
   * Log an error message and show a toast
   * @param stuff the things to log (will be red, such original)
   * @example logger.error('Something went wrong')
   */ showError(...stuff) {
        this.error(...stuff);
        /* c8 ignore next */ if (isBrowserEnvironment()) toastError(clean(...stuff));
    }
    /**
   * Log an info message and show a toast
   * @param stuff the things to log
   * @example logger.info('Hello ¯\_(ツ)_/¯')
   */ showInfo(...stuff) {
        this.info(...stuff);
        /* c8 ignore next */ if (isBrowserEnvironment()) toastInfo(clean(...stuff));
    }
    /**
   * Log a success message and show a toast
   * @param stuff the things to log
   * @example logger.success('Everything went well')
   */ showSuccess(...stuff) {
        this.success(...stuff);
        /* c8 ignore next */ if (isBrowserEnvironment()) toastSuccess(clean(...stuff));
    }
    /**
   * Log a success message
   * @param stuff the things to log (will be green, as expected)
   * @example logger.success('Everything went well')
   * @alias good
   */ success(...stuff) {
        this.good(...stuff);
    }
    /**
   * Log a truthy/falsy test assertion
   * @param thing the thing to test for truthiness
   * @param stuff the things to log
   * @example logger.test(1 === 1, '1 is equal to 1') // will log : ✔️ 1 is equal to 1
   */ test(thing, ...stuff) {
        if (!this.__shouldLog('2-test')) return;
        const isTruthy = Boolean(thing);
        const box = isTruthy ? bgGreen(' ✓ ') : bgRed(' ✗ ');
        const prefix = ' '.repeat(_class_private_field_loose_base(this, _padding)[_padding] - nbFourth);
        this.__log(prefix + box, stuff);
    }
    /**
   * Log a warn message
   * @param stuff the things to log
   * @example logger.warn('Something went wrong')
   */ warn(...stuff) {
        this.__logIf('warn', '5-warn', stuff, yellow);
    }
    /**
   * Create a new Logger instance
   * @param options optional, LoggerOptions
   */ constructor(options){
        Object.defineProperty(this, _lastLogTimestamp, {
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, _levels, {
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, _padding, {
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, _padStart, {
            writable: true,
            value: void 0
        });
        _class_private_field_loose_base(this, _lastLogTimestamp)[_lastLogTimestamp] = 0;
        _class_private_field_loose_base(this, _levels)[_levels] = [
            '1-debug',
            '2-test',
            '3-info',
            '4-fix',
            '5-warn',
            '6-good',
            '7-error'
        ];
        _class_private_field_loose_base(this, _padStart)[_padStart] = 7;
        this.clean = clean;
        this.inMemoryLogs = [];
        this.options = {
            isActive: true,
            /* c8 ignore next */ minimumLevel: isVerbose() ? '1-debug' : '3-info',
            willLogDate: false,
            willLogDelay: true,
            willLogTime: false,
            willOutputToConsole: true,
            willOutputToMemory: false
        };
        if (options) this.options = _extends({}, this.options, options);
        _class_private_field_loose_base(this, _padding)[_padding] = Math.max(..._class_private_field_loose_base(this, _levels)[_levels].map((key)=>key.length - nbSpacesIndent));
    }
}

//# sourceMappingURL=logger.js.map