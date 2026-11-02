import type {Lang} from './i18n';

export const seoContent: Record<Lang, {
  title: string;
  description: string;
  pageDescriptions: Record<'help'|'licenses',string>;
  locale: string;
  openGraphLocale: string;
  imageAlt: string;
  features: string[];
}> = {
  en: {
    title: 'Online Scoreboard',
    description: 'A free online scoreboard for classroom teams and games. Customise names and colours, use a built-in timer and display scores fullscreen.',
    pageDescriptions: {
      help: 'Learn to change team scores, customise the board, use match timers, present fullscreen and save or share a scoreboard.',
      licenses: 'Read the MIT terms for Baran’s Scoreboard and the licence notices required by its third-party fonts, icons and software.',
    },
    locale: 'en-GB',
    openGraphLocale: 'en_GB',
    imageAlt: 'Baran’s Scoreboard, an online scoreboard for teams and games',
    features: ['Keep score for multiple teams', 'Customise team names, colours and layouts', 'Use a countdown, stopwatch, match periods and timeouts', 'Save games locally or share a snapshot link that is not live-synchronised'],
  },
  bg: {
    title: 'Онлайн табло за резултати',
    description: 'Безплатно онлайн табло за класни игри и отбори. Променяйте имена и цветове, използвайте таймер и показвайте резултата на цял екран.',
    pageDescriptions: {
      help: 'Научете как да променяте точки, да персонализирате таблото, да използвате таймер, цял екран и запазване или споделяне на игра.',
      licenses: 'Прочетете условията на MIT за Baran’s Scoreboard и лицензионните известия за шрифтовете, иконите и софтуера на трети страни.',
    },
    locale: 'bg',
    openGraphLocale: 'bg_BG',
    imageAlt: 'Baran’s Scoreboard — онлайн табло за резултати за отбори и игри',
    features: ['Отчитане на точки за няколко отбора', 'Имена, цветове и подредба по избор', 'Обратно броене, хронометър, части на мача и почивки', 'Локално запазване или споделяне на моментно копие с връзка'],
  },
  tr: {
    title: 'Çevrim İçi Skor Panosu',
    description: 'Sınıf etkinlikleri ve takım oyunları için ücretsiz çevrim içi skor panosu. Adları ve renkleri özelleştirin; zamanlayıcıyı ve tam ekranı kullanın.',
    pageDescriptions: {
      help: 'Takım puanlarını değiştirmeyi, panoyu özelleştirmeyi, zamanlayıcıyı kullanmayı, tam ekran sunmayı ve oyunu kaydedip paylaşmayı öğrenin.',
      licenses: 'Baran’s Scoreboard için MIT Lisansı koşullarını ve üçüncü taraf yazılım, yazı tipi ve simgelerin bildirimlerini inceleyin.',
    },
    locale: 'tr',
    openGraphLocale: 'tr_TR',
    imageAlt: 'Baran’s Scoreboard — takımlar ve oyunlar için çevrim içi skor panosu',
    features: ['Birden fazla takımın skorunu tutma', 'Takım adlarını, renkleri ve düzeni özelleştirme', 'Geri sayım, kronometre, devreler ve molalar', 'Oyunları yerel olarak kaydetme veya anlık görüntü bağlantısı paylaşma'],
  },
};

export function softwareSchema(lang: Lang, siteOrigin: string, brand: string) {
  const content = seoContent[lang];
  const url = `${siteOrigin}/${lang}/`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${url}#website`,
        name: brand,
        url,
        description: content.description,
        inLanguage: content.locale,
      },
      {
        '@type': 'WebApplication',
        '@id': `${url}#application`,
        name: brand,
        url,
        description: content.description,
        applicationCategory: 'UtilitiesApplication',
        browserRequirements: 'A modern browser with JavaScript and IndexedDB enabled.',
        isAccessibleForFree: true,
        offers: {'@type': 'Offer', price: 0},
        license: 'https://github.com/baranhq/scoreboard/blob/main/LICENSE',
        inLanguage: content.locale,
        featureList: content.features,
        isPartOf: {'@id': `${url}#website`},
      },
    ],
  };
}
