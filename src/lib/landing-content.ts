import type { Lang } from "./i18n";

type LandingFeature = { title: string; description: string };
type LandingStep = { title: string; description: string };
type LandingUseCase = { title: string; description: string };

export type LandingContent = {
  hero: {
    title: string;
    description: string;
    action: string;
    featuresLink: string;
    benefits: [string, string, string];
  };
  preview: {
    accessibleDescription: string;
    boardName: string;
    firstTeam: string;
    secondTeam: string;
    thirdTeam: string;
    renamedFirstTeam: string;
  };
  features: { title: string; items: LandingFeature[] };
  steps: { title: string; items: LandingStep[] };
  useCases: { title: string; items: LandingUseCase[] };
  openSource: { title: string; description: string; starNote: string; link: string };
  finalCta: { title: string; description: string; action: string };
};

export const landingContent: Record<Lang, LandingContent> = {
  en: {
    hero: {
      title: "Free online scoreboard.",
      description:
        "Keep score for games, sports and classroom activities. Add teams and start right away, with no account or payment needed.",
      action: "Make a Scoreboard",
      featuresLink: "See features",
      benefits: ["Free to use", "No registration", "Open source"],
    },
    preview: {
      accessibleDescription:
        "Animated scoreboard example showing team names, scores, colors, settings and a countdown timer.",
      boardName: "Friendly game",
      firstTeam: "Team 1",
      secondTeam: "Team 2",
      thirdTeam: "Team 3",
      renamedFirstTeam: "Baran's Team",
    },
    features: {
      title: "Everything you need to keep score",
      items: [
        {
          title: "Change scores quickly",
          description: "Add or subtract points, or enter a score directly to correct it.",
        },
        {
          title: "Set up your teams",
          description: "Add teams, choose names and colors, then adjust the layout and text size.",
        },
        {
          title: "Timer and fullscreen",
          description:
            "Choose a countdown or stopwatch, then show the score clearly on any screen.",
        },
        {
          title: "Save or share a board",
          description:
            "Save it in this browser or send a snapshot link. Shared links do not sync later changes.",
        },
      ],
    },
    steps: {
      title: "Start in three simple steps",
      items: [
        {
          title: "Open your scoreboard",
          description: "Choose Make a Scoreboard to open a ready-to-use board.",
        },
        {
          title: "Set up the teams",
          description: "Change team names, add teams and choose colors.",
        },
        {
          title: "Play and keep score",
          description: "Update points as you go; turn on a timer or fullscreen when useful.",
        },
      ],
    },
    useCases: {
      title: "For the games and activities you already enjoy",
      items: [
        {
          title: "Classrooms and quiz nights",
          description: "Keep group points visible during lessons, trivia and school activities.",
        },
        {
          title: "Sports and tournaments",
          description: "Track team scores at football practice, a match or a friendly tournament.",
        },
        {
          title: "Family games and events",
          description: "Follow points between rounds or put the current result on a shared screen.",
        },
      ],
    },
    openSource: {
      title: "Free to use. Open source.",
      description: "The project’s source code is public on GitHub under the MIT License.",
      starNote: "If you find it useful, consider giving the project a star on GitHub.",
      link: "View the project on GitHub",
    },
    finalCta: {
      title: "Ready to keep score?",
      description: "Make a free scoreboard and get started in seconds.",
      action: "Make a Scoreboard",
    },
  },
  bg: {
    hero: {
      title: "Безплатно онлайн табло за резултати.",
      description:
        "Следете точки в игри, спорт и занимания в клас. Добавете отбори и започнете веднага, без регистрация и плащане.",
      action: "Създай табло",
      featuresLink: "Вижте функциите",
      benefits: ["Безплатно", "Без регистрация", "Отворен код"],
    },
    preview: {
      accessibleDescription:
        "Анимирано табло с имена на отбори, точки, цветове, настройки и таймер за обратно броене.",
      boardName: "Приятелска игра",
      firstTeam: "Отбор 1",
      secondTeam: "Отбор 2",
      thirdTeam: "Отбор 3",
      renamedFirstTeam: "Отборът на Баран",
    },
    features: {
      title: "Всичко нужно за отчитане на точки",
      items: [
        {
          title: "Променяйте резултата бързо",
          description: "Добавяйте или отнемайте точки, а при нужда въведете резултата директно.",
        },
        {
          title: "Настройте отборите",
          description: "Добавяйте отбори, задавайте имена и цветове и променяйте подредбата.",
        },
        {
          title: "Таймер и цял екран",
          description:
            "Изберете обратно броене или хронометър и покажете резултата ясно на всеки екран.",
        },
        {
          title: "Запазете или споделете табло",
          description:
            "Запазете го в браузъра или изпратете моментно копие. Връзките не се актуализират при следващи промени.",
        },
      ],
    },
    steps: {
      title: "Започнете в три лесни стъпки",
      items: [
        {
          title: "Отворете таблото",
          description: "Натиснете „Създай табло“, за да отворите готово табло.",
        },
        {
          title: "Настройте отборите",
          description: "Променете имената, добавете отбори и изберете цветове.",
        },
        {
          title: "Играйте и следете точките",
          description: "Променяйте резултата и включете таймер или цял екран при нужда.",
        },
      ],
    },
    useCases: {
      title: "За игри и занимания от ежедневието",
      items: [
        {
          title: "В клас и на куиз вечери",
          description:
            "Показвайте точките на групите по време на уроци, викторини и училищни игри.",
        },
        {
          title: "Спорт и турнири",
          description: "Следете резултата на футболна тренировка, мач или приятелско състезание.",
        },
        {
          title: "Семейни игри и събития",
          description: "Записвайте точките между рундовете или покажете резултата на общ екран.",
        },
      ],
    },
    openSource: {
      title: "Безплатно за използване. С отворен код.",
      description: "Кодът на проекта е публичен в GitHub под лиценза MIT.",
      starNote: "Ако таблото ви е полезно, можете да дадете звезда на проекта в GitHub.",
      link: "Вижте проекта в GitHub",
    },
    finalCta: {
      title: "Готови ли сте да следите резултата?",
      description: "Създайте безплатно табло и започнете след секунди.",
      action: "Създай табло",
    },
  },
  tr: {
    hero: {
      title: "Ücretsiz çevrim içi skor tabelası.",
      description:
        "Oyunlarda, sporda ve sınıf etkinliklerinde puanları takip edin. Takım ekleyip hemen başlayın; üyelik veya ödeme gerekmez.",
      action: "Skor tablosu oluştur",
      featuresLink: "Özellikleri gör",
      benefits: ["Ücretsiz", "Üyelik gerekmez", "Açık kaynaklı"],
    },
    preview: {
      accessibleDescription:
        "Takım adlarını, puanları, renkleri, ayarları ve geri sayım sayacını gösteren animasyonlu skor tabelası örneği.",
      boardName: "Dostluk maçı",
      firstTeam: "Takım 1",
      secondTeam: "Takım 2",
      thirdTeam: "Takım 3",
      renamedFirstTeam: "Baran'ın Takımı",
    },
    features: {
      title: "Skor tutmak için ihtiyacınız olanlar",
      items: [
        {
          title: "Skoru hızla güncelleyin",
          description: "Puan ekleyip çıkarın; düzeltmeniz gerekirse skoru doğrudan girin.",
        },
        {
          title: "Takımları düzenleyin",
          description: "Takım ekleyin, ad ve renk seçin; düzeni ve yazı boyutunu ayarlayın.",
        },
        {
          title: "Zamanlayıcı ve tam ekran",
          description: "Geri sayım veya kronometre seçin, skoru her ekranda rahatça gösterin.",
        },
        {
          title: "Kaydedin veya paylaşın",
          description:
            "Bu tarayıcıya kaydedin veya o anki görüntünün bağlantısını gönderin. Sonraki değişiklikler bağlantıyla eşitlenmez.",
        },
      ],
    },
    steps: {
      title: "Üç kolay adımda başlayın",
      items: [
        {
          title: "Skor tabelasını açın",
          description: "Skor tablosu oluştur seçeneğiyle kullanıma hazır bir tablo açın.",
        },
        {
          title: "Takımları düzenleyin",
          description: "Takım adlarını değiştirin, takım ekleyin ve renkleri seçin.",
        },
        {
          title: "Oyuna başlayıp puanları takip edin",
          description: "Skoru güncelleyin; gerektiğinde zamanlayıcıyı veya tam ekranı açın.",
        },
      ],
    },
    useCases: {
      title: "Günlük oyunlar ve etkinlikler için",
      items: [
        {
          title: "Sınıf oyunları ve quiz geceleri",
          description:
            "Derslerde, bilgi yarışmalarında ve okul etkinliklerinde grup puanlarını görünür tutun.",
        },
        {
          title: "Spor ve turnuvalar",
          description:
            "Futbol antrenmanında, maçta veya arkadaşlar arasındaki yarışmada skoru takip edin.",
        },
        {
          title: "Aile oyunları ve etkinlikler",
          description: "Turlar arasındaki puanları yazın veya güncel skoru ortak ekranda gösterin.",
        },
      ],
    },
    openSource: {
      title: "Ücretsiz. Açık kaynaklı.",
      description: "Projenin kaynak kodu MIT Lisansı ile GitHub’da herkese açıktır.",
      starNote: "Skor tablosu işinize yarıyorsa projeye GitHub’da yıldız verebilirsiniz.",
      link: "Projeyi GitHub’da görüntüleyin",
    },
    finalCta: {
      title: "Skor tutmaya hazır mısınız?",
      description: "Ücretsiz skor tabelanızı oluşturun ve saniyeler içinde başlayın.",
      action: "Skor tablosu oluştur",
    },
  },
};
