import type { Lang } from "./i18n";

export type HelpSection = { id: string; title: string; paragraphs: string[]; points?: string[] };
export type HelpAction = {
  title: string;
  description: string;
  example: "teams" | "score" | "timer" | "fullscreen" | "save" | "share";
};
export type QuickGuide = { title: string; intro: string; actions: HelpAction[] };
export type HelpCopy = {
  title: string;
  intro: string;
  contentsTitle: string;
  quickGuide: QuickGuide;
  sections: HelpSection[];
};

export const help: Record<Lang, HelpCopy> = {
  en: {
    title: "Baran's Scoreboard help",
    intro:
      "Set up a board for a classroom game, match or friendly competition. This guide explains how to use it and keep a copy of your results. No account is needed.",
    contentsTitle: "On this page",
    quickGuide: {
      title: "How to use the scoreboard",
      intro: "Choose a task and use the button shown.",
      actions: [
        {
          title: "Set up teams",
          description: "Open Teams to rename or add teams.",
          example: "teams",
        },
        { title: "Change a score", description: "Use + or − on a team card.", example: "score" },
        {
          title: "Use a timer",
          description: "Open Timer to choose a countdown or stopwatch.",
          example: "timer",
        },
        {
          title: "Show the board",
          description: "Choose Fullscreen for a larger display.",
          example: "fullscreen",
        },
        {
          title: "Save a board",
          description: "Choose Save to name it and keep it in Saved.",
          example: "save",
        },
        {
          title: "Share a board",
          description: "Choose Share for a snapshot link; later changes do not sync.",
          example: "share",
        },
      ],
    },
    sections: [
      {
        id: "get-started",
        title: "Get started",
        paragraphs: [
          "Open the home page to start a board. New boards begin with two teams and a score of zero. In the Teams tab, rename the board and teams, add more teams, and use the arrow buttons to arrange them.",
        ],
      },
      {
        id: "change-scores",
        title: "Change scores",
        paragraphs: [
          "Use + or − on a team card to change its score. Select the score number to enter a value directly. In Controls, change Points per step to make each press add or remove more than one point.",
        ],
        points: [
          "Reset clears the scores after you confirm.",
          "When a started match is paused, score controls stay disabled until you resume it.",
        ],
      },
      {
        id: "customize",
        title: "Customise the board",
        paragraphs: [
          "Use Colours to set team colours and the board background. Appearance controls the board layout, spacing, size presets and icon. Changes are saved automatically in this browser.",
          "Turn on Fine-tune sizes to adjust the score, team names, and timer text independently. Each slider changes only its own item. The current score and team-name presets are temporarily disabled while fine tuning is on; their selected values remain the starting size.",
        ],
      },
      {
        id: "timer",
        title: "Use the timer",
        paragraphs: [
          "Open Timer and turn on Show timer. Choose a countdown or stopwatch. For a countdown, enter hours, minutes, and seconds or pick a quick duration. Start, pause, and restart controls sit beside the timer.",
          "You can hide the hours field to show total minutes. Show paused time displays how long the game has been paused. Turning the timer off stops it and restores its configured duration.",
        ],
      },
      {
        id: "match-options",
        title: "Set up match options",
        paragraphs: [
          "Open Sports options in the Timer tab to split a countdown into halves, periods, or quarters and to allow timeouts. A timeout pauses score changes while it is active. The options are useful for matches, and can be left off for other games.",
        ],
      },
      {
        id: "fullscreen",
        title: "Present the board",
        paragraphs: [
          "Choose Fullscreen above the board, or press F when you are not editing text. Move the pointer or tap to reveal fullscreen controls. Use the pin button to keep those controls visible, and press Escape to leave fullscreen where supported.",
        ],
        points: [
          "When you are not typing, 1 and 2 add a point to the first two teams.",
          "In Controls, choose whether to show score buttons in fullscreen and whether the controls hide automatically.",
        ],
      },
      {
        id: "save-backup",
        title: "Save and move your results",
        paragraphs: [
          "Save gives the current board a name and adds it to Saved on this device. Your edits are saved in this browser as you work. Open Saved to return to a game.",
          "Use Export backup to download a JSON copy, or Import backup on another device to bring it in. Keep backups somewhere safe: clearing browser data or changing devices can remove access to locally saved games.",
        ],
      },
      {
        id: "share",
        title: "Share a snapshot",
        paragraphs: [
          "Choose Share to make a link containing a snapshot of the board, including team names, scores and appearance. Anyone with the link can open that snapshot. Later changes to your board do not update the shared copy.",
        ],
      },
    ],
  },
  bg: {
    title: "Помощ за Baran's Scoreboard",
    intro:
      "Настройте табло за класна игра, мач или приятелско състезание. Тук ще научите как да следите резултата и да запазите копие. Не е нужна регистрация.",
    contentsTitle: "В тази страница",
    quickGuide: {
      title: "Как да използвате таблото",
      intro: "Изберете какво искате да направите и използвайте съответния бутон.",
      actions: [
        {
          title: "Настройте отборите",
          description: "Отворете раздела „Отбори“, за да промените имената или да добавите отбори.",
          example: "teams",
        },
        {
          title: "Променете резултата",
          description: "Натиснете + или − върху картата на отбора.",
          example: "score",
        },
        {
          title: "Използвайте таймер",
          description: "Отворете Таймер и изберете обратно броене или хронометър.",
          example: "timer",
        },
        {
          title: "Покажете таблото",
          description: "Изберете „Цял екран“, за да покажете таблото на целия екран.",
          example: "fullscreen",
        },
        {
          title: "Запазете таблото",
          description:
            "Изберете „Запази“, за да дадете име на таблото и да го добавите в „Моите таблици“.",
          example: "save",
        },
        {
          title: "Споделете таблото",
          description:
            "Изберете „Сподели“, за да получите връзка към моментно копие. Следващите промени няма да се отразят в него.",
          example: "share",
        },
      ],
    },
    sections: [
      {
        id: "get-started",
        title: "Първи стъпки",
        paragraphs: [
          "Отворете началната страница, за да започнете. Новото табло започва с два отбора с по 0 точки. В раздел „Отбори“ променете заглавието на таблото и имената на отборите, добавете още отбори и ги подредете със стрелките.",
        ],
      },
      {
        id: "change-scores",
        title: "Промяна на резултата",
        paragraphs: [
          "Натиснете + или − върху картата на отбора. Изберете числото, за да въведете резултат директно. В раздел „Управление“ променете „Точки при натискане“, ако искате едно натискане да добавя или отнема повече точки.",
        ],
        points: [
          "Нулиране изчиства резултатите след потвърждение.",
          "Когато започнал мач е на пауза, точките не могат да се променят, докато не продължите таймера.",
        ],
      },
      {
        id: "customize",
        title: "Персонализиране на таблото",
        paragraphs: [
          "В раздел „Цветове“ задайте цветовете на отборите и фона. В „Изглед“ изберете подредба, разстояние, предварително зададени размери и икона. Промените се запазват автоматично в този браузър.",
          "Включете „Фина настройка на размерите“, за да настройвате отделно резултата, имената на отборите и текста на таймера. Всеки плъзгач променя само съответния елемент. Докато тази настройка е включена, готовите размери на резултата и имената са заключени, но избраните им стойности остават началните.",
        ],
      },
      {
        id: "timer",
        title: "Използване на таймера",
        paragraphs: [
          "Отворете „Таймер“ и включете „Показвай таймера“. Изберете обратно броене или хронометър. За обратно броене въведете часове, минути и секунди или изберете готова продължителност. Бутоните за старт, пауза и рестартиране са до таймера.",
          "Можете да скриете полето за часове, за да се показват общите минути. Опцията „Показвай времето на пауза“ показва колко време е минало от спирането на играта. Когато изключите таймера, той спира и се връща към зададената продължителност.",
        ],
      },
      {
        id: "match-options",
        title: "Настройки за мач",
        paragraphs: [
          "В раздел „Таймер“ отворете „Спортни настройки“, за да разделите времето на периоди и да разрешите таймаути. По време на таймаут резултатите не могат да се променят. За другите игри можете да оставите тези настройки изключени.",
        ],
      },
      {
        id: "fullscreen",
        title: "Показване на таблото",
        paragraphs: [
          "Изберете „Цял екран“ над таблото или натиснете F, когато не редактирате текст. Преместете курсора или докоснете екрана, за да покажете контролите. Иконата с карфица оставя контролите видими. Натиснете Escape, за да излезете от цял екран в поддържаните браузъри.",
        ],
        points: [
          "Когато не въвеждате текст, клавишите 1 и 2 добавят точка на първите два отбора.",
          "В раздел „Управление“ изберете дали бутоните за точки да се показват на цял екран и дали контролите да се скриват автоматично.",
        ],
      },
      {
        id: "save-backup",
        title: "Запазване и прехвърляне на резултати",
        paragraphs: [
          "Изберете „Запази“, за да дадете име на таблото и да го добавите в „Моите таблици“ на това устройство. Промените се записват в браузъра, докато работите. Отворете „Моите таблици“, за да продължите играта.",
          "Изберете „Изтегли архив“, за да запазите JSON файл, или „Импортирай архив“ на друго устройство. Пазете копието: ако изчистите данните на браузъра или смените устройството, може да загубите достъп до запазените игри.",
        ],
      },
      {
        id: "share",
        title: "Споделяне на моментно копие",
        paragraphs: [
          "„Сподели“ подготвя връзка към моментно копие на таблото с имената на отборите, резултатите и изгледа. Всеки с връзката може да го отвори. Следващите промени по таблото няма да се отразят в споделеното копие.",
        ],
      },
    ],
  },
  tr: {
    title: "Baran's Scoreboard için yardım",
    intro:
      "Sınıf oyunlarında, maçlarda veya arkadaşlarınızla yaptığınız yarışmalarda skor tutun. Bu rehberde takımları ve zamanlayıcıyı ayarlamayı, skoru güncellemeyi ve sonuçları yedeklemeyi öğrenin. Hesap gerekmez.",
    contentsTitle: "Bu sayfada",
    quickGuide: {
      title: "Skor tabelası nasıl kullanılır?",
      intro: "Bir işlem seçip gösterilen düğmeyi kullanın.",
      actions: [
        {
          title: "Takımları ayarlayın",
          description:
            "Takım adlarını değiştirmek veya yeni takım eklemek için Takımlar sekmesini açın.",
          example: "teams",
        },
        {
          title: "Skoru değiştirin",
          description: "Takım kartındaki + veya − düğmesine basın.",
          example: "score",
        },
        {
          title: "Zamanlayıcıyı kullanın",
          description: "Geri sayım veya kronometre seçmek için Zamanlayıcı’yı açın.",
          example: "timer",
        },
        {
          title: "Skor tabelasını gösterin",
          description: "Skor tabelasını büyük ekranda göstermek için Tam ekran’ı seçin.",
          example: "fullscreen",
        },
        {
          title: "Skor tabelasını kaydedin",
          description: "Ad verip Tablolarım’a eklemek için Kaydet’i seçin.",
          example: "save",
        },
        {
          title: "Skor tabelasını paylaşın",
          description:
            "O anki tabloyu içeren bir bağlantı için Paylaş’ı seçin. Sonraki değişiklikler bağlantıya yansımaz.",
          example: "share",
        },
      ],
    },
    sections: [
      {
        id: "get-started",
        title: "Başlangıç",
        paragraphs: [
          "Başlamak için ana sayfayı açın. Yeni skor tabelasında iki takımın puanı da sıfırdır. Takımlar sekmesinden tabela ve takım adlarını değiştirebilir, yeni takım ekleyebilir ve ok düğmeleriyle sıralamayı düzenleyebilirsiniz.",
        ],
      },
      {
        id: "change-scores",
        title: "Skorları değiştirme",
        paragraphs: [
          "Takım kartındaki + veya − düğmesine basın. Belirli bir değer girmek için skor sayısını seçin. Her basışta birden fazla puan eklemek veya çıkarmak için Kontroller bölümündeki Adım başına puan ayarını değiştirin.",
        ],
        points: [
          "Sıfırlama, onayınızdan sonra skorları temizler.",
          "Başlamış bir maç duraklatıldığında, zamanlayıcı devam ettirilene kadar skor değiştirilemez.",
        ],
      },
      {
        id: "customize",
        title: "Skor tabelasını özelleştirme",
        paragraphs: [
          "Takım renklerini ve pano arka planını ayarlamak için Renkler’i kullanın. Görünüm bölümünde düzeni, aralığı, hazır boyutları ve simgeyi seçin. Değişiklikler bu tarayıcıya otomatik kaydedilir.",
          "Skorları, takım adlarını ve zamanlayıcı metnini birbirinden bağımsız ayarlamak için Boyutları ayrı ayrı ayarla seçeneğini açın. Her kaydırıcı yalnızca kendi öğesini değiştirir. Hazır skor ve ad boyutları geçici olarak kilitlenir; seçili değerleri başlangıç boyutu olarak kalır.",
        ],
      },
      {
        id: "timer",
        title: "Zamanlayıcıyı kullanma",
        paragraphs: [
          "Zamanlayıcı sekmesini açıp Zamanlayıcıyı göster seçeneğini etkinleştirin. Geri sayım veya kronometre seçin. Geri sayım için saat, dakika ve saniye girin ya da hazır sürelerden birini seçin. Başlatma, duraklatma ve sıfırlama düğmeleri zamanlayıcının yanındadır.",
          "Saat alanını gizleyerek toplam dakikaları gösterebilirsiniz. Duraklama süresini göster seçeneği, oyunun ne kadar süredir duraklatıldığını gösterir. Zamanlayıcıyı kapatmak sayacı durdurur ve ayarlanan süreye döndürür.",
        ],
      },
      {
        id: "match-options",
        title: "Maç seçeneklerini ayarlama",
        paragraphs: [
          "Zamanlayıcı sekmesindeki Spor ayarları bölümünden geri sayımı devrelere, periyotlara veya çeyreklere ayırın ve molalara izin verin. Mola boyunca skor değişiklikleri engellenir. Diğer oyunlarda bu seçenekleri kapalı bırakabilirsiniz.",
        ],
      },
      {
        id: "fullscreen",
        title: "Skor tabelasını ekranda gösterme",
        paragraphs: [
          "Skor tabelasının üzerindeki Tam ekran düğmesini seçin veya metin düzenlemiyorken F tuşuna basın. Tam ekran kontrollerini göstermek için fareyi hareket ettirin ya da ekrana dokunun. Sabitleme simgesi kontrolleri görünür tutar. Desteklenen tarayıcılarda Escape ile çıkabilirsiniz.",
        ],
        points: [
          "Metin girmiyorken 1 ve 2 tuşları ilk iki takıma puan ekler.",
          "Kontroller bölümünde skor düğmelerinin tam ekranda görünmesini ve kontrollerin otomatik gizlenmesini ayarlayın.",
        ],
      },
      {
        id: "save-backup",
        title: "Sonuçları kaydetme ve taşıma",
        paragraphs: [
          "Kaydet’i seçerek mevcut skor tabelasına ad verip Tablolarım’a ekleyin. Çalışırken yaptığınız değişiklikler bu tarayıcıya kaydedilir. Oyuna dönmek için Tablolarım’ı açın.",
          "JSON dosyası indirmek için Yedeği dışa aktar’ı, başka bir cihazda açmak için Yedeği içe aktar’ı kullanın. Yedeklerinizi güvenli bir yerde saklayın; tarayıcı verilerini temizlemek veya cihaz değiştirmek yerel tablolara erişimi kaldırabilir.",
        ],
      },
      {
        id: "share",
        title: "Anlık kopya paylaşma",
        paragraphs: [
          "Paylaş seçeneği; takım adlarını, skorları ve görünümü içeren anlık tablo için bir bağlantı hazırlar. Bağlantıya sahip herkes bu kopyayı açabilir. Sonraki değişiklikler paylaşılan kopyaya yansımaz.",
        ],
      },
    ],
  },
};
