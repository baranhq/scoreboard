import type { Lang } from "./i18n";
export const campaignCopy = {
  en: {
    intro:
      "Make scoreboards, leaderboards and tournament brackets. Shape the display, keep the action moving and share the result.",
    headline: "Make every\nmoment count.",
    design: "One competition.\nYour signature.",
    workflow: "Ready before the first point.",
    steps: [
      ["Choose your tool", "A live score, a ranking or a road to the final."],
      ["Make it yours", "Add participants, enter results and choose your design."],
      [
        "Present the result",
        "Save your project. Use fullscreen, snapshot sharing or PNG export in the tools that support them.",
      ],
    ],
    ownership: "Built to be yours.",
    open: "Free to use. MIT licensed. No account required. Edit in your browser, save projects on this device, or host your own copy.",
    close: "Your next game\nstarts here.",
    headlines: {
      scoreboard: "Every point deserves\nthe spotlight.",
      leaderboard: "Every position\ntells a story.",
      bracket: "Every match\nleads somewhere.",
    },
    lab: {
      scoreboard: "One match. Or the whole room.",
      leaderboard: "More than a points column.",
      bracket: "Two sides. One final.",
    },
    views: {
      scoreboard: ["Two teams", "Three teams"],
      leaderboard: ["Standings", "Multiple columns"],
      bracket: ["One side", "Two sides", "Automatic byes"],
    },
  },
  bg: {
    intro:
      "Създавайте табла за резултати, класации и турнирни схеми. Настройте изгледа, следете играта и споделете резултата.",
    headline: "Всеки миг от играта\nима значение.",
    design: "Едно състезание.\nВашият почерк.",
    workflow: "Готови преди първата точка.",
    steps: [
      ["Изберете инструмент", "Резултат на живо, класиране или път към финала."],
      ["Настройте го по свой вкус", "Добавете участници, въведете резултати и изберете визия."],
      [
        "Представете резултата",
        "Запазете проекта. Според инструмента можете да го покажете на цял екран, да споделите връзка към моментно копие или да изтеглите PNG.",
      ],
    ],
    ownership: "Създаден за вашия начин на игра.",
    open: "Безплатен софтуер с лиценз MIT. Не е нужна регистрация. Редактирайте в браузъра, запазвайте проектите на това устройство или хоствайте собствено копие.",
    close: "Следващата игра\nзапочва сега.",
    headlines: {
      scoreboard: "Всеки резултат\nзаслужава да бъде видян.",
      leaderboard: "Всяка позиция\nима значение.",
      bracket: "Пътят към финала\nзапочва тук.",
    },
    lab: {
      scoreboard: "За един мач или цяла зала.",
      leaderboard: "Повече от колона с точки.",
      bracket: "От първия кръг до финала.",
    },
    views: {
      scoreboard: ["Два отбора", "Три отбора"],
      leaderboard: ["Класиране", "Няколко колони"],
      bracket: ["Едностранна схема", "Двустранна схема", "Автоматично преминаване напред"],
    },
  },
  tr: {
    intro:
      "Skor tabelaları, sıralama tabloları ve turnuva şemaları hazırlayın. Görünümü kendinize göre düzenleyin, oyunu takip edin ve sonucu paylaşın.",
    headline: "Her oyunda her anın\ntadını çıkarın.",
    design: "Her yarışma\nsizin tarzınızda.",
    workflow: "Oyun başlamadan her şey hazır.",
    steps: [
      ["İhtiyacınız olan aracı seçin", "Canlı skor, sıralama tablosu veya finale giden yol."],
      [
        "Kendi tarzınıza göre düzenleyin",
        "Katılımcıları ekleyin, sonuçları girin ve görünümü seçin.",
      ],
      [
        "Sonucu sunun",
        "Projenizi kaydedin. Araca göre tam ekranda gösterin, anlık görüntü bağlantısı paylaşın veya PNG indirin.",
      ],
    ],
    ownership: "Oyununuzu kendi tarzınızda yönetin.",
    open: "Ücretsiz ve MIT lisanslı yazılım. Hesap gerekmez. Tarayıcıda düzenleyin, projeleri bu cihaza kaydedin veya kendi sunucunuzda barındırın.",
    close: "Sıradaki oyuna\nhazır olun.",
    headlines: {
      scoreboard: "Skoru herkes\nnet görsün.",
      leaderboard: "Puanlar değiştikçe\nsıralama da değişir.",
      bracket: "Finale giden yol\nburada şekillenir.",
    },
    lab: {
      scoreboard: "Tek bir maç için de, tüm salon için de.",
      leaderboard: "Puanların ötesindeki sonuçları da gösterin.",
      bracket: "İki taraf. Tek final.",
    },
    views: {
      scoreboard: ["İki takım", "Üç takım"],
      leaderboard: ["Sıralama", "Birden çok sütun"],
      bracket: ["Tek taraflı", "İki taraflı", "Otomatik maçsız geçiş"],
    },
  },
} satisfies Record<Lang, unknown>;
