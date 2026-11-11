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
      "Създавайте табла с резултати, класирания и турнирни схеми. Настройте изгледа, следете състезанието и представете резултатите.",
    headline: "Направете всяка игра\nнезабравима.",
    design: "Едно състезание.\nВашият почерк.",
    workflow: "Готови преди първата точка.",
    steps: [
      ["Изберете инструмент", "Резултат на живо, класиране или път до финала."],
      ["Направете го свой", "Добавете участници, въведете резултати и изберете дизайн."],
      [
        "Представете резултата",
        "Запазете проекта. Използвайте цял екран, споделяне на моментно копие или PNG експорт според инструмента.",
      ],
    ],
    ownership: "Създаден да бъде ваш.",
    open: "Безплатно. С MIT лиценз. Без регистрация. Редактирайте в браузъра, запазвайте проекти на това устройство или хоствайте собствено копие.",
    close: "Следващата игра\nзапочва тук.",
    headlines: {
      scoreboard: "Всяка точка заслужава\nвнимание.",
      leaderboard: "Всяко място\nразказва история.",
      bracket: "Всеки мач\nводи напред.",
    },
    lab: {
      scoreboard: "Един мач. Или цялата зала.",
      leaderboard: "Повече от колона с точки.",
      bracket: "Две страни. Един финал.",
    },
    views: {
      scoreboard: ["Два отбора", "Три отбора"],
      leaderboard: ["Класиране", "Няколко колони"],
      bracket: ["Една страна", "Две страни", "Служебно преминаване"],
    },
  },
  tr: {
    intro:
      "Skor tabloları, sıralamalar ve turnuva eşleşmeleri oluşturun. Görünümü özelleştirin, oyunu yönetin ve sonucu sunun.",
    headline: "Oyunun heyecanını\nbirlikte yaşayın.",
    design: "Tek yarışma.\nSizin imzanız.",
    workflow: "İlk sayıdan önce hazır.",
    steps: [
      ["Aracınızı seçin", "Canlı skor, sıralama veya finale giden yol."],
      ["Kendinize uyarlayın", "Katılımcıları ekleyin, sonuçları girin ve tasarımınızı seçin."],
      [
        "Sonucu sunun",
        "Projenizi kaydedin. Destekleyen araçlarda tam ekranı, anlık kopya paylaşımını veya PNG dışa aktarımını kullanın.",
      ],
    ],
    ownership: "Sizin olması için tasarlandı.",
    open: "Ücretsiz. MIT lisanslı. Hesap gerekmez. Tarayıcıda düzenleyin, projeleri bu cihaza kaydedin veya kendi sunucunuzda barındırın.",
    close: "Sıradaki oyun\nburada başlıyor.",
    headlines: {
      scoreboard: "Her sayı\nsahneyi hak eder.",
      leaderboard: "Her sıra\nbir hikâye anlatır.",
      bracket: "Her maç\nbir yere götürür.",
    },
    lab: {
      scoreboard: "Tek maç. Ya da bütün salon.",
      leaderboard: "Bir puan sütunundan fazlası.",
      bracket: "İki taraf. Tek final.",
    },
    views: {
      scoreboard: ["İki takım", "Üç takım"],
      leaderboard: ["Sıralama", "Birden çok sütun"],
      bracket: ["Tek taraf", "İki taraf", "Otomatik bay geçişleri"],
    },
  },
} satisfies Record<Lang, unknown>;
