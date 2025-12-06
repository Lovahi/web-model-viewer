import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    drop: {
      message: 'Drop model here',
    },
  },
  es: {
    drop: {
      message: 'Soltar modelo aquí',
    },
  },
}

export const i18n = createI18n({
  legacy: false,
  locale: (navigator.language || 'en').split('-')[0],
  fallbackLocale: 'en',
  messages,
})
