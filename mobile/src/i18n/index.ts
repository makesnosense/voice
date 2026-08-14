import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import en from './locales/en';
import ru from './locales/ru';
import {
  isSupportedLanguage,
  type SupportedLanguage,
} from './supported-languages';

function resolveDeviceLanguage(): SupportedLanguage {
  const [deviceLocale] = getLocales();
  const languageCode = deviceLocale?.languageCode ?? '';
  return isSupportedLanguage(languageCode) ? languageCode : 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: resolveDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // react already escapes output
  },
});

export default i18n;
