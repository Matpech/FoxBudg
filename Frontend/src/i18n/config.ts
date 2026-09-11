import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import commonFr from './locales/fr/common.json'
import commonEn from './locales/en/common.json'
import loginFr from './locales/fr/login.json'
import loginEn from './locales/en/login.json'
import dashboardFr from './locales/fr/dashboard.json'
import dashboardEn from './locales/en/dashboard.json'
import usersFr from './locales/fr/users.json'
import usersEn from './locales/en/users.json'

export const SUPPORTED_LANGS = ['fr', 'en']
export const DEFAULT_LANG = 'en'

i18n.use(initReactI18next).init({
  resources: {
    fr: { common: commonFr, login: loginFr, dashboard: dashboardFr, users: usersFr },
    en: { common: commonEn, login: loginEn, dashboard: dashboardEn, users: usersEn },
  },
  lng: DEFAULT_LANG,
  fallbackLng: DEFAULT_LANG,
  supportedLngs: SUPPORTED_LANGS,
  ns: ['common', 'login', 'dashboard', 'users'],
  defaultNS: 'common',
  interpolation: { escapeValue: false }
})

export default i18n