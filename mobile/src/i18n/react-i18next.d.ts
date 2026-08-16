// this file makes t() key paths type-checked against en.ts's shape

import 'react-i18next';
import type en from '../../../shared/i18n/locales/en';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof en;
    };
  }
}
