// MIT License Copyright (c) 2023-PRESENT Johann Schopplich
// I had to get sources from https://github.com/johannschopplich/resultx/blob/main/src/index.ts to be able to have a cjs working version of the library
// oxlint-disable max-classes-per-file, consistent-type-definitions, curly, sort-keys, id-length

type Result<T, E> = Ok<T> | Err<E>;

interface UnwrappedOk<T> {
  value: T;
  error: undefined;
}
interface UnwrappedErr<E> {
  value: undefined;
  error: E;
}

export type UnwrappedResult<T, E> = UnwrappedOk<T> | UnwrappedErr<E>;

class Ok<T> {
  readonly value: T;
  readonly ok = true;
  constructor(value: T) {
    this.value = value;
  }
}

class Err<E> {
  readonly error: E;
  readonly ok = false;
  constructor(error: E) {
    this.error = error;
  }
}

function ok<T>(value: T): Ok<T> {
  return new Ok(value);
}

function err<E extends string = string>(error: E): Err<E>;
function err<E = unknown>(error: E): Err<E>;
function err<E = unknown>(error: E): Err<E> {
  return new Err(error);
}

function trySafe<T, E = unknown>(fn: () => T): Result<T, E>;
function trySafe<T, E = unknown>(promise: Promise<T>): Promise<Result<T, E>>;
function trySafe<T, E = unknown>(fnOrPromise: (() => T) | Promise<T>): Result<T, E> | Promise<Result<T, E>> {
  if (fnOrPromise instanceof Promise) {
    return fnOrPromise.then(ok).catch(err as (error: unknown) => Err<E>);
  }

  try {
    return ok(fnOrPromise());
  } catch (error) {
    return err(error as E);
  }
}

function unwrap<T>(result: Ok<T>): UnwrappedOk<T>;
function unwrap<E>(result: Err<E>): UnwrappedErr<E>;
function unwrap<T, E>(result: Result<T, E>): UnwrappedResult<T, E>;
function unwrap<T, E>(result: Result<T, E>): UnwrappedResult<T, E> {
  return result.ok ? { error: undefined, value: result.value } : { error: result.error, value: undefined };
}

/**
 * A `Result` collection of functions from Johann Schopplich to handle errors and successes.
 * @see https://github.com/johannschopplich/resultx
 * @see https://github.com/Shuunen/ts-result-comparison
 */
export const Result = {
  /**
   * Create a failing `Result` with an error message.
   * @example if (shitHappen) return Result.error('File not found')
   */
  error: err,
  /**
   * Create a successful `Result` with a value.
   * @example return Result.ok(42)
   * @example return Result.ok({ a: 42 })
   */
  ok,
  /**
   * Wraps a function that might throw an error and returns a `Result` with the result of the function.
   * @example const result = trySafe(() => JSON.parse('{"a": 42}')) // { ok: true, value: { a: 42 } }
   * @example const result = trySafe(() => JSON.parse('{"a": 42')) // { ok: false, error: "SyntaxError: Unexpected..." }
   */
  trySafe,
  /**
   * Unwraps a Result, Ok, or Err value and returns the value or error in an object.
   * If the result is an Ok, the object contains the value and an undefined error.
   * If the result is an Err, the object contains an undefined value and the error.
   * @example
   * const result = Result.trySafe(() => JSON.parse('{"a": 42}')); // { ok: true, value: { a: 42 } }
   * const { value, error } = Result.unwrap(result); // value: { a: 42 } // error: undefined
   * @example
   * const result = Result.trySafe(() => JSON.parse('{"a": 42')); // { ok: false, error: "SyntaxError..." }
   * const { value, error } = Result.unwrap(result); // value: undefined // error: "SyntaxError..."
   */
  unwrap,
};

// oxlint-disable-next-line id-length
export type ResultType<T, E> = Result<T, E>;
