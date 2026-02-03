// oxlint-disable max-lines
import { consoleLog } from "./browser-console.js";
import { toastError, toastInfo, toastSuccess } from "./browser-toast.js";
import { bgGreen, bgRed, blue, cyan, gray, green, red, yellow } from "./colors.js";
import { nbFourth, nbSpacesIndent } from "./constants.js";
import { readableTime } from "./date-readable-time.js";
import { formatDate } from "./dates.js";
import { isBrowserEnvironment } from "./environment.js";
import { isVerbose } from "./flags.js";
import type { ResultType } from "./result.js";
import { stringify } from "./string-stringify.js";

/**
 * Clean stuff to log
 * @param stuff the things to log
 * @returns the cleaned log line
 * @example clean(['Hello', { name: "world" }, 42]) // "Hello { "name": "world" } 42"
 */
function clean(...stuff: Readonly<unknown[]>) {
  // ANSI escape sequence regex - using String.fromCharCode to avoid linter complaints
  const ansiEscapeRegex = new RegExp(
    // oxlint-disable-next-line no-magic-numbers
    `[${String.fromCodePoint(0x1b)}${String.fromCodePoint(0x9b)}][#();?[]*(?:\\d{1,4}(?:;\\d{0,4})*)?[\\d<=>A-ORZcf-nqry]`,
    "gu",
  );
  return stuff
    .map(thing => stringify(thing))
    .join(" ")
    .replaceAll(ansiEscapeRegex, "")
    .replaceAll('"', "'");
}

type LogLevel = "1-debug" | "2-test" | "3-info" | "4-fix" | "5-warn" | "6-good" | "7-error";

export type LoggerOptions = {
  /**
   * If the logger is active, when false, no logs will be output
   * @default true
   */
  isActive: boolean;
  /**
   * The minimum log level to output
   * @default '3-info' or '1-debug' if verbose mode is active
   */
  minimumLevel: LogLevel;
  /**
   * Will log the date in the format yyyy-MM-dd, example "2023-10-01"
   * @default false
   */
  willLogDate: boolean;
  /**
   * Will log the delay since the last log, example "+12ms"
   * @default true
   */
  willLogDelay: boolean;
  /**
   * Will log the time in the format "HH:mm:ss", example "12:34:56"
   * @default false
   */
  willLogTime: boolean;
  /**
   * Will output the logs to the global console instance
   * @default true
   */
  willOutputToConsole: boolean;
  /**
   * Will output the logs to the logger.inMemoryLogs array
   * @default false
   */
  willOutputToMemory: boolean;
};

/**
 * Logger class
 * @example const logger = new Logger()
 * @example const logger = new Logger({ isActive: false, minimumLevel: '3-info', willLogDate: false, willLogDelay: true, willLogTime: false, willOutputToConsole: true, willOutputToMemory: false })
 */
export class Logger {
  #lastLogTimestamp = 0;

  readonly #levels: LogLevel[] = ["1-debug", "2-test", "3-info", "4-fix", "5-warn", "6-good", "7-error"];

  readonly #padding: number;

  readonly #padStart = 7;

  public clean = clean;

  public inMemoryLogs: string[] = [];

  public options: LoggerOptions = {
    isActive: true,
    /* v8 ignore next -- @preserve */
    minimumLevel: isVerbose() ? "1-debug" : "3-info",
    willLogDate: false,
    willLogDelay: true,
    willLogTime: false,
    willOutputToConsole: true,
    willOutputToMemory: false,
  };

  /**
   * Create a new Logger instance
   * @param options optional, LoggerOptions
   */
  public constructor(options?: Readonly<Partial<LoggerOptions>>) {
    if (options) {
      this.options = { ...this.options, ...options };
    }
    this.#padding = Math.max(...this.#levels.map(key => key.length - nbSpacesIndent));
  }

  /**
   * Calculate the delay since the last log
   * @returns the delay like "+12ms"
   */
  private __getDelay() {
    const now = Date.now();
    if (this.#lastLogTimestamp === 0) {
      this.#lastLogTimestamp = now;
      return gray("init".padStart(this.#padStart));
    }
    const delay = now - this.#lastLogTimestamp;
    this.#lastLogTimestamp = now;
    return gray(`+${readableTime(delay, false)}`.padStart(this.#padStart));
  }

  /**
   * Log a message
   * @param prefix the prefix to add before the message
   * @param stuff the things to log
   */
  private __log(prefix: string, stuff: Readonly<unknown[]>) {
    const prefixes = [prefix];
    if (this.options.willLogTime) {
      prefixes.unshift(formatDate(new Date(), "HH:mm:ss"));
    }
    if (this.options.willLogDate) {
      prefixes.unshift(formatDate(new Date(), "yyyy-MM-dd"));
    }
    if (this.options.willLogDelay) {
      prefixes.unshift(this.__getDelay());
    }
    if (this.options.willOutputToConsole) {
      consoleLog(prefixes.join(" "), ...stuff);
    }
    if (this.options.willOutputToMemory) {
      this.addToMemoryLogs(...prefixes, ...stuff);
    }
  }

  /**
   * Log a message if log level allows it
   * @param prefix the prefix to add before the message
   * @param level the log level to check
   * @param stuff the things to log
   * @param color a function to colorize the prefix
   * @example logger.logIf('debug', '1-debug', ['Hello', 'world', 42])
   */
  // oxlint-disable-next-line max-params
  private __logIf(prefix: string, level: LogLevel, stuff: Readonly<unknown[]>, color: (string_: string) => string) {
    if (!this.__shouldLog(level)) {
      return;
    }
    this.__log(color(prefix.padStart(this.#padding)), stuff);
  }

  /**
   * Check if a log should be output
   * @param level the log level to check
   * @returns true if the log should be output
   */
  private __shouldLog(level: LogLevel) {
    return this.options.isActive && this.#levels.indexOf(level) >= this.#levels.indexOf(this.options.minimumLevel);
  }

  /**
   * Push a log to the inMemoryLogs array
   * @param stuff the things to log
   * @example logger.addToMemoryLogs(['Hello', 'world', 42])
   */
  public addToMemoryLogs(...stuff: Readonly<unknown[]>) {
    this.inMemoryLogs.push(clean(...stuff));
  }

  /**
   * Log a debug message
   * @param stuff the things to log
   * @example logger.debug('Hello world')
   */
  public debug(...stuff: Readonly<unknown[]>) {
    this.__logIf("debug", "1-debug", stuff, gray);
  }

  /**
   * Disable the logger output
   */
  public disable() {
    this.options.isActive = false;
  }

  /**
   * Enable the logger output
   */
  public enable() {
    this.options.isActive = true;
  }

  /**
   * Log an error message
   * @param stuff the things to log (will be red, such original)
   * @example logger.error('Something went wrong')
   */
  public error(...stuff: Readonly<unknown[]>) {
    const errors = stuff.map(thing => (thing instanceof Error ? thing.message : thing));
    this.__logIf("error", "7-error", errors, red);
  }

  /**
   * Log a fix message
   * @param stuff the things to log
   * @example logger.fix('This is a fix')
   */
  public fix(...stuff: Readonly<unknown[]>) {
    this.__logIf("fix", "4-fix", stuff, cyan);
  }

  /**
   * Log a good message
   * @param stuff the things to log (will be green, as expected)
   * @example logger.good('Everything went well')
   */
  public good(...stuff: Readonly<unknown[]>) {
    this.__logIf("good", "6-good", stuff, green);
  }

  /**
   * Log an info message
   * @param stuff the things to log
   * @example logger.info('Hello ¯\_(ツ)_/¯')
   */
  public info(...stuff: Readonly<unknown[]>) {
    this.__logIf("info", "3-info", stuff, blue);
  }

  /**
   * Log an error message and show a toast
   * @param stuff the things to log (will be red, such original)
   * @example logger.error('Something went wrong')
   */
  public showError(...stuff: Readonly<unknown[]>) {
    this.error(...stuff);
    /* v8 ignore next 3 -- @preserve */
    if (isBrowserEnvironment()) {
      toastError(clean(...stuff));
    }
  }

  /**
   * Log an info message and show a toast
   * @param stuff the things to log
   * @example logger.info('Hello ¯\_(ツ)_/¯')
   */
  public showInfo(...stuff: Readonly<unknown[]>) {
    this.info(...stuff);
    /* v8 ignore next 3 -- @preserve */
    if (isBrowserEnvironment()) {
      toastInfo(clean(...stuff));
    }
  }

  /**
   * Log a success message and show a toast
   * @param stuff the things to log
   * @example logger.success('Everything went well')
   */
  public showSuccess(...stuff: Readonly<unknown[]>) {
    this.success(...stuff);
    /* v8 ignore next 3 -- @preserve */
    if (isBrowserEnvironment()) {
      toastSuccess(clean(...stuff));
    }
  }

  /**
   * Log a success message
   * @param stuff the things to log (will be green, as expected)
   * @example logger.success('Everything went well')
   * @alias good
   */
  public success(...stuff: Readonly<unknown[]>) {
    this.good(...stuff);
  }

  /**
   * Log a Result with appropriate levels
   * @param message the common message to log before the Result
   * @param result the Result to log
   * @param okLevel the log level to use if the Result is ok, default is 'info'
   * @param errorLevel the log level to use if the Result is error, default is 'error'
   * @example logger.result("update operation", result)
   * @example logger.result("another operation", result, 'success', 'warn')
   */
  // oxlint-disable-next-line max-params
  public result(
    message: string,
    result: ResultType<unknown, unknown>,
    okLevel: "info" | "success" = "info",
    errorLevel: "error" | "warn" = "error",
  ) {
    if (result.ok) {
      this[okLevel](message, "result was ok and returned :", result.value);
    } else {
      this[errorLevel](message, "result was error and returned :", result.error);
    }
  }

  /**
   * Log a Result with appropriate levels and show a toast
   * @param message the common message to log before the Result
   * @param result the Result to log
   * @param okLevel the log level to use if the Result is ok, default is 'info'
   * @param errorLevel the log level to use if the Result is error, default is 'error'
   * @example logger.showResult("update operation", result)
   * @example logger.showResult("another operation", result, 'success', 'warn')
   */
  // oxlint-disable-next-line max-params
  public showResult(
    message: string,
    result: ResultType<unknown, unknown>,
    okLevel: "info" | "success" = "info",
    errorLevel: "error" | "warn" = "error",
  ) {
    this.result(message, result, okLevel, errorLevel);
    /* v8 ignore next 7 -- @preserve */
    if (isBrowserEnvironment()) {
      const isOk = result.ok;
      const level = isOk ? okLevel : errorLevel;
      const toastMethods = { error: toastError, info: toastInfo, success: toastSuccess, warn: toastInfo };
      const showMethod = toastMethods[level];
      showMethod(`${message}: ${clean(isOk ? result.value : result.error)}`);
    }
  }

  /**
   * Log a truthy/falsy test assertion
   * @param thing the thing to test for truthiness
   * @param stuff the things to log
   * @example logger.test(1 === 1, '1 is equal to 1') // will log : ✔️ 1 is equal to 1
   */
  public test(thing: unknown, ...stuff: Readonly<unknown[]>) {
    if (!this.__shouldLog("2-test")) {
      return;
    }
    const isTruthy = Boolean(thing);
    const box = isTruthy ? bgGreen(" ✓ ") : bgRed(" ✗ ");
    const prefix = " ".repeat(this.#padding - nbFourth);
    this.__log(prefix + box, stuff);
  }

  /**
   * Log a warn message
   * @param stuff the things to log
   * @example logger.warn('Something went wrong')
   */
  public warn(...stuff: Readonly<unknown[]>) {
    this.__logIf("warn", "5-warn", stuff, yellow);
  }
}
