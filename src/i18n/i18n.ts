import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import commonEn from './locales/en/common.json'
import commonFr from './locales/fr/common.json'

export const DEFAULT_LANGUAGE = 'fr'

void i18n.use(initReactI18next).init({
  resources: {
    fr: {
      common: commonFr,
    },
    en: {
      common: commonEn,
    },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: ['fr', 'en'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
