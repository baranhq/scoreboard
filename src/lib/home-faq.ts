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
        question: "Can I customize the scoreboard?",
        answer:
          "Yes. Add and rename teams, choose colors and layouts, adjust text sizes, and use a countdown or stopwatch.",
      },
      {
        question: "Where are my scoreboards saved?",
        answer:
          "Saved boards stay in this browser on this device, not in an online account. Export a backup before clearing browser data or switching devices.",
      },
      {
        question: "Does a shared scoreboard update live?",
        answer:
          "No. A share link contains a snapshot of the board when you create it. Later score changes are not synced to that link.",
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
        question: "Трябва ли да си направя акаунт?",
        answer: "Не. Отворете таблото и започнете веднага. Не е нужна регистрация.",
      },
      {
        question: "Мога ли да го използвам на телефон или таблет?",
        answer:
          "Да. Baran’s Scoreboard работи в съвременен браузър и се адаптира към телефони, таблети и компютри.",
      },
      {
        question: "Подходящо ли е за игри в класната стая?",
        answer:
          "Да. Добавете отбор за всяка група и показвайте точките от викторина, занимание или игра на целия клас.",
      },
      {
        question: "Мога ли да персонализирам таблото?",
        answer:
          "Да. Добавяйте и преименувайте отбори, избирайте цветове и подредба, настройвайте размера на текста и използвайте таймер или хронометър.",
      },
      {
        question: "Къде се запазват таблата ми?",
        answer:
          "Запазените табла остават в браузъра на това устройство, а не в онлайн акаунт. Изтеглете резервно копие, преди да изчистите данните на браузъра или да смените устройството.",
      },
      {
        question: "Споделеното табло актуализира ли се на живо?",
        answer:
          "Не. Връзката съдържа моментно копие на таблото при създаването ѝ. Последващите промени в резултата не се синхронизират с нея.",
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
          "Evet. Baran’s Scoreboard güncel bir web tarayıcısında çalışır; telefon, tablet ve bilgisayar ekranlarına uyum sağlar.",
      },
      {
        question: "Sınıf oyunlarında kullanabilir miyim?",
        answer:
          "Evet. Her grup için bir takım ekleyip bilgi yarışması, etkinlik veya sınıf oyunlarının puanlarını herkesin görebileceği şekilde tutabilirsiniz.",
      },
      {
        question: "Skor tabelasını özelleştirebilir miyim?",
        answer:
          "Evet. Takım ekleyip adlarını değiştirebilir, renk ve düzen seçebilir, yazı boyutunu ayarlayabilir, geri sayım ya da kronometre kullanabilirsiniz.",
      },
      {
        question: "Skor tablolarım nereye kaydedilir?",
        answer:
          "Kaydedilen tablolar çevrim içi bir hesapta değil, bu cihazdaki tarayıcıda saklanır. Tarayıcı verilerini silmeden veya cihaz değiştirmeden önce yedek dışa aktarın.",
      },
      {
        question: "Paylaşım bağlantısı canlı olarak güncellenir mi?",
        answer:
          "Hayır. Paylaşım bağlantısı oluşturulduğu andaki tabloyu içerir. Daha sonra yapılan skor değişiklikleri bu bağlantıyla eşitlenmez.",
      },
    ],
  },
};
