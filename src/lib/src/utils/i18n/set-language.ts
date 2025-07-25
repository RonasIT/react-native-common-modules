import * as Localization from 'expo-localization';
import { i18n } from './i18n';

/**
 * Register translation tables **once** and receive a helper to change the active language.
 *
 * > Requires `i18n-js` and `expo-localization`.
 *
 * @typeParam T Map of language codes (`en`, `fr`, `ru`, …) to their translation dictionaries.
 *
 * @param translations Object containing translation tables keyed by language code.
 * @param defaultLanguage Language that will be used when the requested language is missing.
 *
 * @returns Function that sets `i18n.locale`.
 *          When called **without** arguments, the device locale from `expo-localization` is used.
 */
export function setLanguage<T extends (typeof i18n)['translations']>(
  translations: T,
  defaultLanguage: keyof typeof translations,
): (language?: keyof typeof translations) => void {
  i18n.translations = translations;

  return (language: keyof typeof translations = Localization.getLocales()[0].languageCode as string): void => {
    i18n.locale = language in i18n.translations ? (language as string) : (defaultLanguage as string);
    i18n.enableFallback = true;
  };
}
