import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import commonFr from './locales/fr/common.json'
import commonEn from './locales/en/common.json'
import loginFr from './locales/fr/login.json'
import loginEn from './locales/en/login.json'

export const SUPPORTED_LANGS = ['fr', 'en']
export const DEFAULT_LANG = 'en'

i18n.use(initReactI18next).init({
  resources: {
    fr: { common: commonFr, login: loginFr },
    en: { common: commonEn, login: loginEn },
  },
  lng: DEFAULT_LANG,
  fallbackLng: DEFAULT_LANG,
  supportedLngs: SUPPORTED_LANGS,
  ns: ['common', 'login'],
  defaultNS: 'common',
  interpolation: { escapeValue: false }
})

export default i18n