import { err as error, ok, trySafe, unwrap } from './resultx.js'

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
  error,
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
}
