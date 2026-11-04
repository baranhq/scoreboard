import type { Lang } from "./i18n";

export const seoContent: Record<
  Lang,
  {
    title: string;
    heading: string;
    description: string;
    intro: string;
    pageDescriptions: Record<"help" | "licenses", string>;
    locale: string;
    openGraphLocale: string;
    imageAlt: string;
    features: string[];
  }
> = {
  en: {
    title: "Free Online Scoreboard for Teams & Games",
    heading: "Free online scoreboard for teams and games",
    description:
      "Create a free online scoreboard for classroom games, sports and team competitions. Customize teams, adjust scores, use a countdown or stopwatch, and display the board full screen.",
    intro:
      "Create a free online scoreboard for classroom games, sports and team competitions. Add teams, adjust scores, use a countdown or stopwatch, and display the board full screen. No account is needed: games stay in this browser, and shared links contain a snapshot, not live updates. The MIT-licensed project is open source and can be self-hosted.",
    pageDescriptions: {
      help: "Learn to create a team scoreboard, change scores, use a countdown or stopwatch, present it on a projector, and save, back up or share a snapshot.",
      licenses:
        "Read the MIT terms for Baran’s Scoreboard and the licence notices required by its third-party fonts, icons and software.",
    },
    locale: "en-GB",
    openGraphLocale: "en_GB",
    imageAlt: "Baran’s Scoreboard, an online scoreboard for teams and games",
    features: [
      "Free to use without an account",
      "Keep score for multiple teams and customise names, colours and layouts",
      "Use a countdown, stopwatch, match periods and timeouts",
      "Save games in this browser or share a snapshot link without live synchronisation",
    ],
  },
  bg: {
    title: "Безплатно онлайн табло за резултати",
    heading: "Безплатно онлайн табло за точки и резултати",
    description:
      "Безплатно онлайн табло за резултати в класни игри, спорт и отборни състезания. Настройвайте отборите, точките и таймера, а таблото показвайте на цял екран.",
    intro:
      "Създайте безплатно онлайн табло за резултати за класни игри, спорт и отборни състезания. Добавяйте отбори, променяйте точките и използвайте обратно броене или хронометър. Показвайте таблото на цял екран. Не е нужна регистрация: игрите се запазват в този браузър, а споделената връзка съдържа моментно копие без последваща синхронизация. Проектът е с отворен код под лиценз MIT и може да се хоства самостоятелно.",
    pageDescriptions: {
      help: "Научете как да създадете табло за отбори, да променяте точки, да използвате обратно броене или хронометър и да запазите, изнесете или споделите моментно копие.",
      licenses:
        "Прочетете условията на MIT за Baran’s Scoreboard и лицензионните известия за шрифтовете, иконите и софтуера на трети страни.",
    },
    locale: "bg",
    openGraphLocale: "bg_BG",
    imageAlt: "Baran’s Scoreboard — онлайн табло за резултати за отбори и игри",
    features: [
      "Безплатно използване без регистрация",
      "Отчитане на точки за няколко отбора с имена, цветове и подредба по избор",
      "Обратно броене, хронометър, части на мача и прекъсвания",
      "Запазване в този браузър или споделяне на моментно копие без синхронизация",
    ],
  },
  tr: {
    title: "Ücretsiz Online Skor Tablosu",
    heading: "Takımlar ve oyunlar için online skor tablosu",
    description:
      "Sınıf oyunları, spor ve takım yarışmaları için ücretsiz online skor tablosu. Takımları özelleştirin, puanları değiştirin; zamanlayıcıyı tam ekranda kullanın.",
    intro:
      "Sınıf içi oyunlar, spor karşılaşmaları ve takım yarışmaları için ücretsiz bir online skor tablosu oluşturun. Takımlar ekleyin, puanları değiştirin; geri sayım veya kronometre kullanıp tabloyu tam ekranda gösterin. Hesap gerekmez: oyunlar bu tarayıcıda saklanır, paylaşılan bağlantılar canlı eşitleme yerine bir anlık görüntü içerir. Proje MIT lisanslı açık kaynaklıdır ve uygulamayı kendi sunucunuzda barındırabilirsiniz.",
    pageDescriptions: {
      help: "Takım skor tablosu oluşturmayı, puanları değiştirmeyi, geri sayım veya kronometreyi kullanmayı, tam ekranda sunmayı ve oyunu kaydedip yedeklemeyi öğrenin.",
      licenses:
        "Baran’s Scoreboard için MIT Lisansı koşullarını ve üçüncü taraf yazılım, yazı tipi ve simgelerin bildirimlerini inceleyin.",
    },
    locale: "tr",
    openGraphLocale: "tr_TR",
    imageAlt: "Baran’s Scoreboard — takımlar ve oyunlar için çevrim içi skor panosu",
    features: [
      "Ücretsiz kullanım; üyelik gerekmez",
      "Birden çok takımın puanlarını ad, renk ve düzen seçenekleriyle takip etme",
      "Geri sayım, kronometre, devreler ve molalar",
      "Oyunları bu tarayıcıya kaydetme veya canlı eşitleme olmadan anlık görüntü bağlantısı paylaşma",
    ],
  },
};

export function softwareSchema(lang: Lang, siteOrigin: string, brand: string) {
  const content = seoContent[lang];
  const websiteId = `${siteOrigin}/#website`;
  const applicationId = `${siteOrigin}/#application`;
  const applicationUrl = `${siteOrigin}/en/`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: brand,
        url: `${siteOrigin}/`,
        description: content.description,
        inLanguage: ["en-GB", "bg", "tr"],
      },
      {
        "@type": "WebApplication",
        "@id": applicationId,
        name: brand,
        url: applicationUrl,
        description: content.description,
        applicationCategory: "UtilitiesApplication",
        browserRequirements: "A modern browser with JavaScript and IndexedDB enabled.",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: 0 },
        author: { "@type": "Person", name: "Baran Ahmedov", url: "https://baranhq.com/en/" },
        license: "https://github.com/baranhq/scoreboard/blob/main/LICENSE",
        inLanguage: content.locale,
        image: `${siteOrigin}/social.png`,
        featureList: content.features,
        isPartOf: { "@id": websiteId },
      },
    ],
  };
}
