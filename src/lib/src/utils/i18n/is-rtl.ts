import { LanguageCode } from './enums';
import { i18n } from './i18n';

export const isRtl = () => LanguageCode.ARABIAN === i18n.locale as LanguageCode;
