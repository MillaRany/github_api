import { createI18n } from 'vue-i18n';
import en from './locales/en';
import pt from './locales/pt';

const savedLocale = localStorage.getItem('locale') || 'en';

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    pt
  }
});

export default i18n;
