import { TranslateOptions } from 'i18n-js';
import { i18n } from './i18n';

/**
 * Returns a function bound to a **base namespace** so you can translate keys without repetition.
 *
 * > Requires `i18n-js`.
 *
 * @param basePath Translation namespace, e.g. `'ACCOUNT.WELCOME'`.
 * @returns Translator function `(key, options?) => string`.
 */
export function useTranslation(basePath: string) {
  return (key: string, options?: TranslateOptions): string => {
    return i18n.t(`${basePath}.${key}`, options);
  };
}
