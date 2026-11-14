import type { Lang } from "./i18n";
export const campaignCopy = {
  en: {
    intro:
      "Keep scores up to date, follow the standings and guide winners through tournament brackets. Set up the display and share the result.",
    headline: "Keep score.\nKeep playing.",
    design: "Give the scoreboard\nyour own look.",
    workflow: "Ready before the first point.",
    steps: [
      [
        "Choose your tool",
        "A scoreboard for live games, a leaderboard for standings or a bracket for knockout rounds.",
      ],
      ["Set it up", "Add teams or participants, enter results and choose a theme."],
      [
        "Present the result",
        "Save your project, show it full screen, share a snapshot link or export a PNG where available.",
      ],
    ],
    ownership: "Your game stays yours.",
    open: "Free to use. MIT licensed. No account required. Edit in your browser, save projects on this device, or host your own copy.",
    close: "Ready for the\nnext game?",
    headlines: {
      scoreboard: "Put the score where\neveryone can see it.",
      leaderboard: "Show the standings\nat a glance.",
      bracket: "Follow every match\nto the final.",
    },
    lab: {
      scoreboard: "One match. Or the whole room.",
      leaderboard: "More than a points column.",
      bracket: "Two sides. One final.",
    },
    views: {
      scoreboard: ["Two teams", "Three teams"],
      leaderboard: ["Standings", "Multiple columns"],
      bracket: ["One side", "Two sides", "Some players move on without a match"],
    },
  },
  bg: {
    intro:
      "Следете резултата, подреждайте класирането и вижте как победителите стигат до финала. Настройте изгледа и споделете резултата.",
    headline: "Следете резултата.\nИграйте нататък.",
    design: "Настройте таблото\nспоред играта.",
    workflow: "Всичко е готово преди първата точка.",
    steps: [
      [
        "Изберете инструмент",
        "Табло за резултати на живо, класация или схема за елиминационен турнир.",
      ],
      ["Настройте таблото", "Добавете отбори или участници, въведете резултатите и изберете тема."],
      [
        "Представете резултата",
        "Запазете проекта, покажете го на цял екран, споделете връзка към моментно копие или изтеглете PNG, когато е налично.",
      ],
    ],
    ownership: "Играта остава при вас.",
    open: "Безплатен софтуер с лиценз MIT. Не е нужна регистрация. Редактирайте в браузъра, запазвайте проектите на това устройство или ги хоствайте на собствен сървър.",
    close: "Готови ли сте за\nследващата игра?",
    headlines: {
      scoreboard: "Покажете резултата\nна всички.",
      leaderboard: "Ясно класиране\nза всички.",
      bracket: "Проследете пътя\nдо финала.",
    },
    lab: {
      scoreboard: "За един мач или цяла зала.",
      leaderboard: "Повече от колона с точки.",
      bracket: "От първия кръг до финала.",
    },
    views: {
      scoreboard: ["Два отбора", "Три отбора"],
      leaderboard: ["Класиране", "Няколко колони"],
      bracket: ["Едностранна схема", "Двустранна схема", "Някои участници продължават без мач"],
    },
  },
  tr: {
    intro:
      "Skorları takip edin, sıralamayı görün ve turnuva şemasında kazananları finale taşıyın. Görünümü düzenleyip sonucu paylaşın.",
    headline: "Skoru takip edin.\nOyuna devam edin.",
    design: "Skor tabelasını\noyuna göre düzenleyin.",
    workflow: "Oyun başlamadan her şey hazır.",
    steps: [
      [
        "İhtiyacınız olan aracı seçin",
        "Canlı maçlar için skor tabelası, sıralama tablosu veya eleme turnuvası için şema.",
      ],
      [
        "Aracınızı düzenleyin",
        "Takımları veya katılımcıları ekleyin, sonuçları girin ve tema seçin.",
      ],
      [
        "Sonucu sunun",
        "Projenizi kaydedin, tam ekranda gösterin, anlık görüntü bağlantısı paylaşın veya varsa PNG olarak dışa aktarın.",
      ],
    ],
    ownership: "Oyununuz sizde kalır.",
    open: "Ücretsiz ve MIT lisanslı yazılım. Hesap gerekmez. Tarayıcıda düzenleyin, projeleri bu cihaza kaydedin veya kendi sunucunuzda barındırın.",
    close: "Sıradaki oyuna\nhazır mısınız?",
    headlines: {
      scoreboard: "Skoru herkesin\ngörebileceği yerde tutun.",
      leaderboard: "Sıralamayı\nbir bakışta gösterin.",
      bracket: "Her maçı final aşamasına\nkadar takip edin.",
    },
    lab: {
      scoreboard: "Tek bir maç için de, tüm salon için de.",
      leaderboard: "Puanların ötesindeki sonuçları da gösterin.",
      bracket: "İki taraf. Tek final.",
    },
    views: {
      scoreboard: ["İki takım", "Üç takım"],
      leaderboard: ["Sıralama", "Birden çok sütun"],
      bracket: ["Tek taraflı", "İki taraflı", "Bazı oyuncular maç yapmadan ilerler"],
    },
  },
} satisfies Record<Lang, unknown>;
