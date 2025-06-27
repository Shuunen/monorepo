import { objectDeserialize } from './object-serializer.js';
import { Result } from './result.js';
const JSON_START_REGEX = /^(?:\[\s*)?\{\s*"/u;
/**
 * Check if the given string is a JSON object
 * @param jsonString The string to check
 * @returns The parsed object or false if parsing failed
 */ export function isJson(jsonString) {
    const hasValidStart = JSON_START_REGEX.test(jsonString);
    if (!hasValidStart) return false;
    try {
        JSON.parse(jsonString);
    } catch (e) {
        return false;
    }
    return true;
}
/**
 * Parse a supposed JSON string into an object
 * @param json The JSON string to parse
 * @returns An object with shape { error: string | undefined, value: Type | Record<string, unknown> } where error is a message if parsing fails, otherwise undefined.
 */ export function parseJson(json) {
    try {
        return Result.ok(objectDeserialize(json));
    } catch (error) {
        /* c8 ignore next */ return Result.error(`Invalid JSON string: ${error instanceof Error ? error.message : String(error)}`);
    }
}

//# sourceMappingURL=json.js.map