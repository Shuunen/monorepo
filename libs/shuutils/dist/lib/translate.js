import { getPath } from './browser-routing.js';
import { Result } from './result.js';
import { fillTemplate } from './strings.js';
const handledLangs = [
    'en',
    'fr'
];
const langRegex = /^\/(en|fr)\//u;
const defaultLang = 'en';
/**
 * Get the language from the path
 * @param path the path to get the language from, like "/en/contact"
 * @returns the language, like "en"
 */ export function getLangFromPath(path) {
    var _langRegex_exec;
    var _langRegex_exec_;
    const detected = (_langRegex_exec_ = (_langRegex_exec = langRegex.exec(path)) == null ? void 0 : _langRegex_exec[1]) != null ? _langRegex_exec_ : defaultLang;
    return detected === 'fr' ? 'fr' : defaultLang;
}
// oxlint-disable require-param-description
/**
 * Handle pluralization
 * @param translated the translated string, like "1 item | {count} items"
 * @param data the data to fill the template, like { count: 3 }
 * @returns the translated string, like "3 items"
 */ export function handlePlural(translated, data) {
    // oxlint-enable require-param-description
    if (!translated.includes('|')) return fillTemplate(translated, data);
    var _data_count;
    const count = Number.parseInt(String((_data_count = data == null ? void 0 : data.count) != null ? _data_count : '1'), 10);
    const [a = '', b = '', c = ''] = translated.split(' | ');
    if (c.length > 0 && count > 1) return fillTemplate(c, data);
    if (c.length > 0 && count === 1 || b.length > 0 && count > 1) return fillTemplate(b, data);
    return fillTemplate(a, data);
}
// oxlint-disable require-param-description
/**
 * Translate a message
 * @param lang the language to translate to, like "en" or "fr"
 * @param message the message to translate, like "hello world" or { en: "hello {name}", fr: "bonjour {name}" }
 * @param data the data to fill the template, like { name: "world" }
 * @returns the translated message, like "hello world" or "bonjour world"
 */ export function translate(lang, message, data) {
    // oxlint-enable require-param-description
    const translated = typeof message === 'string' ? message : message[lang];
    if (translated === undefined) return `missing translation for message "${JSON.stringify(message)}" and lang "${lang}"`;
    return handlePlural(translated, data);
}
/**
 * Translate a path
 * @param path the path to translate, like "/en/contact"
 * @param targetLang the target language to translate to, like "fr"
 * @returns the translated path, like "/fr/contact"
 */ export function localePath(path, targetLang = defaultLang) {
    if (!handledLangs.includes(targetLang)) return Result.error(`unsupported lang "${targetLang}", cannot translate path "${path}"`);
    return Result.ok(getPath(path, targetLang === defaultLang ? '' : targetLang));
}
/**
 * Get a translator
 * @param lang the language to translate to, like "en" or "fr"
 * @returns the translator function
 * @example const $t = getTranslator('en')
 */ export function getTranslator(lang) {
    return (message, data)=>translate(lang, message, data);
}

//# sourceMappingURL=translate.js.map