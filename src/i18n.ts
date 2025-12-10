import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    drop: {
      message: 'Drop model here',
    },
    error: {
      texture_missing: 'Missing texture: {filename}',
      textures_missing: 'Missing textures: {filenames}',
      generic: 'Error loading model: {error}',
    },
  },
  es: {
    drop: {
      message: 'Suelta el modelo aquí',
    },
    error: {
      texture_missing: 'Falta la textura: {filename}',
      textures_missing: 'Faltan las texturas: {filenames}',
      generic: 'Error al cargar el modelo: {error}',
    },
  },
}

export const i18n = createI18n({
  legacy: false,
  locale: (navigator.language || 'en').split('-')[0],
  fallbackLocale: 'en',
  messages,
})
