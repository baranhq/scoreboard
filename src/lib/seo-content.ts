import type { Lang } from "./i18n";
import { homeRoute, route } from "./routes.ts";
import { landingContent } from "./landing-content.ts";
import { repo } from "./site.ts";

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
    title: "Free Scoreboard, Leaderboards & Tournament Brackets",
    description:
      "Free online scoreboard, leaderboard and tournament bracket tools. Keep score, design rankings and export tournament graphics. No account needed.",
    pageDescriptions: {
      help: "Learn to set up a team scoreboard, change scores, use a countdown or stopwatch, present it on a projector, and save, back up or share a snapshot.",
      licenses:
        "Read the MIT terms for Baran’s Scoreboard and the licence notices required by its third-party fonts, icons and software.",
      saved: "Open the scoreboards you saved in this browser on this device.",
      scoreboard:
        "Add teams, update scores, use a timer or stopwatch, and show a free scoreboard full screen. No account is required.",
    },
    locale: "en-GB",
    openGraphLocale: "en_GB",
    imageAlt: "Baran’s Scoreboard, an online scoreboard for teams and games",
  },
  bg: {
    title: "Безплатни табла, класации и турнирни схеми",
    description:
      "Безплатни онлайн табла за резултати, класации и турнирни схеми. Следете играта, подреждайте участниците и изтегляйте готови графики. Без регистрация.",
    pageDescriptions: {
      help: "Научете как да настроите табло за отбори, да променяте резултата, да използвате обратно броене или хронометър и да запазвате, архивирате или споделяте моментно копие.",
      licenses:
        "Прочетете условията на MIT за Baran’s Scoreboard и лицензионните известия за шрифтовете, иконите и софтуера на трети страни.",
      saved: "Отворете таблата, запазени в браузъра на това устройство.",
      scoreboard:
        "Добавяйте отбори, променяйте резултата, използвайте таймер или хронометър и показвайте таблото на цял екран. Безплатно е и не изисква регистрация.",
    },
    locale: "bg",
    openGraphLocale: "bg_BG",
    imageAlt: "Baran’s Scoreboard — онлайн табло за резултати за отбори и игри",
  },
  tr: {
    title: "Ücretsiz Skor Tabelası, Sıralama Tablosu ve Turnuva Şeması",
    description:
      "Skor tabelası, sıralama tablosu ve turnuva şeması hazırlamak için ücretsiz çevrim içi araçlar. Skoru takip edin, sıralamayı düzenleyin ve görsel indirin. Hesap gerekmez.",
    pageDescriptions: {
      help: "Takım skor tabelasını ayarlamayı, skoru değiştirmeyi, geri sayım veya kronometre kullanmayı, tam ekranda göstermeyi ve sonuçları kaydetmeyi ya da yedeklemeyi öğrenin.",
      licenses:
        "Baran’s Scoreboard için MIT Lisansı koşullarını ve üçüncü taraf yazılım, yazı tipi ve simgelerin bildirimlerini inceleyin.",
      saved: "Bu cihazdaki tarayıcıya kaydettiğiniz skor tabelalarını açın.",
      scoreboard:
        "Takım ekleyin, skoru güncelleyin, zamanlayıcı veya kronometre kullanın ve skor tabelasını tam ekranda gösterin. Ücretsizdir; hesap gerekmez.",
    },
    locale: "tr",
    openGraphLocale: "tr_TR",
    imageAlt: "Baran’s Scoreboard — takımlar ve oyunlar için çevrim içi skor tabelası",
  },
};

export function softwareSchema(lang: Lang, siteOrigin: string, brand: string) {
  const content = seoContent[lang];
  const websiteId = `${siteOrigin}/#website`;
  const applicationId = `${siteOrigin}/#application`;
  const developerId = `${siteOrigin}/#developer`;
  const pageUrl = siteOrigin + homeRoute(lang);
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
        publisher: { "@id": developerId },
      },
      {
        "@type": "WebApplication",
        "@id": applicationId,
        name: brand,
        url: applicationUrl,
        description: content.pageDescriptions.scoreboard,
        applicationCategory: "UtilitiesApplication",
        browserRequirements: "A modern browser with JavaScript and IndexedDB enabled.",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: 0 },
        author: { "@id": developerId },
        license: "https://github.com/baranhq/scoreboard/blob/main/LICENSE",
        inLanguage: content.locale,
        image: `${siteOrigin}/social.png`,
        sameAs: [repo],
        featureList: landingContent[lang].features.items.map(
          ({ title, description }) => `${title}: ${description}`,
        ),
        isPartOf: { "@id": websiteId },
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: content.title,
        description: content.description,
        inLanguage: content.locale,
        isPartOf: { "@id": websiteId },
        mainEntity: { "@id": applicationId },
      },
      {
        "@type": "Person",
        "@id": developerId,
        name: "Baran Ahmedov",
        url: "https://baranhq.com/en/",
      },
    ],
  };
}
