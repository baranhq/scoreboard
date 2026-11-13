import type { Lang } from "./i18n";

export const homeFaq: Record<
  Lang,
  { title: string; items: { question: string; answer: string }[] }
> = {
  en: {
    title: "Frequently asked questions",
    items: [
      {
        question: "Is this online scoreboard really free?",
        answer: "Yes. You can use every scoreboard feature without a subscription or payment.",
      },
      {
        question: "Do I need an account?",
        answer: "No. Open the scoreboard and start using it. There is no sign-up step.",
      },
      {
        question: "Can I use it on my phone or tablet?",
        answer:
          "Yes. Baran’s Scoreboard runs in a modern web browser and adapts to phones, tablets and computers.",
      },
      {
        question: "Can I use it for classroom games?",
        answer:
          "Yes. Add a team for each group and keep quiz, activity or classroom-game points visible to everyone.",
      },
      {
        question: "Can I use this as an online score counter for several teams?",
        answer:
          "Yes. Add teams, choose their names and colours, and keep every score together on one board.",
      },
      {
        question: "Can I customise the scoreboard?",
        answer:
          "Yes. Add and rename teams, choose colours and layouts, adjust text sizes, and use a countdown or stopwatch.",
      },
      {
        question: "Where are my scoreboards saved?",
        answer:
          "Saved boards stay in this browser on this device, not in an online account. Export a backup before clearing browser data or switching devices.",
      },
      {
        question: "Does a shared scoreboard update live?",
        answer:
          "No. A share link is a snapshot of the board. Later score changes are not synced to that link.",
      },
    ],
  },
  bg: {
    title: "Често задавани въпроси",
    items: [
      {
        question: "Наистина ли онлайн таблото е безплатно?",
        answer: "Да. Всички функции са без абонамент и плащане.",
      },
      {
        question: "Нужна ли ми е регистрация?",
        answer: "Не. Отворете таблото и започнете веднага.",
      },
      {
        question: "Мога ли да го използвам на телефон или таблет?",
        answer:
          "Да. Baran’s Scoreboard работи в съвременен браузър и се адаптира към телефони, таблети и компютри.",
      },
      {
        question: "Подходящо ли е за игри в класната стая?",
        answer:
          "Да. Добавете отбор за всяка група и показвайте точките от викторината или класната игра пред целия клас.",
      },
      {
        question: "Мога ли да следя резултата на няколко отбора едновременно?",
        answer:
          "Да. Добавете отбори, изберете имена и цветове и следете всички резултати на едно табло.",
      },
      {
        question: "Мога ли да персонализирам таблото?",
        answer:
          "Да. Добавяйте отбори, променяйте имената и цветовете им, настройвайте подредбата и размера на текста и изберете таймер или хронометър.",
      },
      {
        question: "Къде се запазват таблата ми?",
        answer:
          "Таблата се пазят в браузъра на това устройство, а не в онлайн акаунт. Изтеглете архив, преди да изчистите данните на браузъра или да смените устройството.",
      },
      {
        question: "Споделеното табло актуализира ли се на живо?",
        answer:
          "Не. Връзката показва таблото във вида му при споделянето. Последващите промени в резултата не се синхронизират.",
      },
    ],
  },
  tr: {
    title: "Sık sorulan sorular",
    items: [
      {
        question: "Bu çevrim içi skor tabelası gerçekten ücretsiz mi?",
        answer: "Evet. Tüm özellikleri abonelik veya ödeme olmadan kullanabilirsiniz.",
      },
      {
        question: "Hesap açmam gerekiyor mu?",
        answer: "Hayır. Skor tabelasını açıp hemen kullanabilirsiniz; kayıt gerekmez.",
      },
      {
        question: "Telefonumda veya tabletimde kullanabilir miyim?",
        answer:
          "Evet. Baran’s Scoreboard güncel bir web tarayıcısında çalışır ve telefon, tablet ve bilgisayarlara uyum sağlar.",
      },
      {
        question: "Sınıf oyunlarında kullanabilir miyim?",
        answer:
          "Evet. Her grup için bir takım ekleyebilir; bilgi yarışması ve sınıf oyunlarının skorunu herkesin görebileceği şekilde tutabilirsiniz.",
      },
      {
        question: "Birden fazla takımın skorunu aynı anda takip edebilir miyim?",
        answer:
          "Evet. Takım ekleyip adlarını ve renklerini seçerek tüm skorları tek bir tabelada takip edebilirsiniz.",
      },
      {
        question: "Skor tabelasını özelleştirebilir miyim?",
        answer:
          "Evet. Takım ekleyip adını ve rengini değiştirebilir, yerleşimi ve yazı boyutunu ayarlayabilir, geri sayım veya kronometre kullanabilirsiniz.",
      },
      {
        question: "Skor tablolarım nereye kaydedilir?",
        answer:
          "Skor tabelaları çevrim içi bir hesapta değil, bu cihazdaki tarayıcıda saklanır. Tarayıcı verilerini silmeden veya cihaz değiştirmeden önce yedek indirin.",
      },
      {
        question: "Paylaşım bağlantısı canlı olarak güncellenir mi?",
        answer:
          "Hayır. Bağlantı, paylaşıldığı andaki tabelayı gösterir. Sonraki skor değişiklikleri bağlantıya yansımaz.",
      },
    ],
  },
};
