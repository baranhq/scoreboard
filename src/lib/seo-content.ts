import type { Lang } from "./i18n";
import { route } from "./routes.ts";
import { landingContent } from "./landing-content.ts";

export const seoContent: Record<
  Lang,
  {
    title: string;
    description: string;
    pageDescriptions: Record<"help" | "licenses" | "saved" | "scoreboard", string>;
    locale: string;
    openGraphLocale: string;
    imageAlt: string;
  }
> = {
  en: {
    title: "Free Online Scoreboard",
    description:
      "Create a free online scoreboard for games, sports, classrooms and events. Track points, customize teams, use a timer and go fullscreen. No account needed.",
    pageDescriptions: {
      help: "Learn to create a team scoreboard, change scores, use a countdown or stopwatch, present it on a projector, and save, back up or share a snapshot.",
      licenses:
        "Read the MIT terms for Baran’s Scoreboard and the licence notices required by its third-party fonts, icons and software.",
      saved: "Open the scoreboards you saved in this browser on this device.",
      scoreboard:
        "Create teams, update scores, use a timer or stopwatch, and show a free scoreboard full screen. No account is required.",
    },
    locale: "en-GB",
    openGraphLocale: "en_GB",
    imageAlt: "Baran’s Scoreboard, an online scoreboard for teams and games",
  },
  bg: {
    title: "Безплатно онлайн табло за резултати",
    description:
      "Създайте безплатно онлайн табло за резултати за игри, спорт и занимания в клас. Следете точки, настройте отборите и използвайте таймер — без регистрация.",
    pageDescriptions: {
      help: "Научете как да създадете табло за отбори, да променяте точки, да използвате обратно броене или хронометър и да запазите, експортирате или споделите моментно копие.",
      licenses:
        "Прочетете условията на MIT за Baran’s Scoreboard и лицензионните известия за шрифтовете, иконите и софтуера на трети страни.",
      saved: "Отворете таблата, запазени в браузъра на това устройство.",
      scoreboard:
        "Създавайте отбори, променяйте точки, използвайте таймер или хронометър и показвайте безплатното табло на цял екран. Не е нужна регистрация.",
    },
    locale: "bg",
    openGraphLocale: "bg_BG",
    imageAlt: "Baran’s Scoreboard — онлайн табло за резултати за отбори и игри",
  },
  tr: {
    title: "Ücretsiz Çevrim İçi Skor Tabelası",
    description:
      "Oyunlar, spor karşılaşmaları ve sınıf etkinlikleri için ücretsiz çevrim içi skor tabelası oluşturun. Puanları takip edin, takımları özelleştirin ve zamanlayıcı kullanın; üyelik gerekmez.",
    pageDescriptions: {
      help: "Takım skor tablosu oluşturmayı, puanları değiştirmeyi, geri sayım veya kronometreyi kullanmayı, tam ekranda sunmayı ve oyunu kaydedip yedeklemeyi öğrenin.",
      licenses:
        "Baran’s Scoreboard için MIT Lisansı koşullarını ve üçüncü taraf yazılım, yazı tipi ve simgelerin bildirimlerini inceleyin.",
      saved: "Bu cihazdaki tarayıcıya kaydettiğiniz skor tablolarını açın.",
      scoreboard:
        "Takım oluşturun, puanları güncelleyin, zamanlayıcı veya kronometre kullanın ve ücretsiz skor tabelasını tam ekranda gösterin. Üyelik gerekmez.",
    },
    locale: "tr",
    openGraphLocale: "tr_TR",
    imageAlt: "Baran’s Scoreboard — takımlar ve oyunlar için çevrim içi skor panosu",
  },
};

export function softwareSchema(lang: Lang, siteOrigin: string, brand: string) {
  const content = seoContent[lang];
  const websiteId = `${siteOrigin}/#website`;
  const applicationId = `${siteOrigin}/#application`;
  const applicationUrl = siteOrigin + route(lang, "scoreboard");
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
        featureList: landingContent[lang].features.items.map(
          ({ title, description }) => `${title}: ${description}`,
        ),
        isPartOf: { "@id": websiteId },
      },
    ],
  };
}
