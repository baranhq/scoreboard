import type { Lang } from "./i18n";
import type { Tool } from "@/components/content/tool-demo";
type ProductDetail = {
  capability: [string, string];
  stories: [string, string][];
  themes: [string, string];
  steps: [string, string][];
  uses: string[];
  advanced: [string, string];
  faq: [string, string][];
  close: string;
};
type ProductLocale = {
  workflow: string;
  useCases: string;
  questions: string;
  themeHint: string;
  products: Record<Tool, ProductDetail>;
};
export const productDetails: Record<Lang, ProductLocale> = {
  en: {
    workflow: "Set up the board and put it on screen.",
    useCases: "For classrooms, matches and game nights.",
    questions: "Answers to common questions.",
    themeHint: "Try these themes in the editor. This preview will not change your saved projects.",
    products: {
      scoreboard: {
        capability: [
          "Keep the game moving and the score in view.",
          "A clear result for everyone watching, with quick controls for the person keeping score.",
        ],
        stories: [
          [
            "More teams, one shared screen.",
            "Add, rename, remove and reorder teams. Give each team its own colours and choose a side-by-side or grid arrangement.",
          ],
          [
            "The next point is one tap away.",
            "Use plus and minus, enter a score directly, or set a custom increment. Undo a change or reset scores when the next game begins.",
          ],
          [
            "Keep time without changing tools.",
            "Choose a countdown or stopwatch, set period labels and use fullscreen when the audience needs a bigger view.",
          ],
        ],
        themes: [
          "Same game. A different atmosphere.",
          "Try the actual presentation presets. In the editor, refine team colours, borders, corners, gradients, density and score size; save a custom theme to use again.",
        ],
        steps: [
          [
            "Name the teams",
            "Start with Team 1 and Team 2 at zero. Add more teams and change their names in the Content panel.",
          ],
          [
            "Keep the score moving",
            "Tap a score control or enter a correction directly. Configure the timer and increments when you need them.",
          ],
          [
            "Show it to everyone",
            "Switch to fullscreen, save the board or send a snapshot link. Keep a JSON backup for another device.",
          ],
        ],
        uses: [
          "Classroom competitions",
          "Friendly sports matches",
          "Quiz rounds",
          "Multiplayer games",
        ],
        advanced: [
          "One person keeps score. Everyone can see it.",
          "Keyboard shortcuts, adjustable text sizes and fullscreen controls help you run a live session. Local saves keep your teams, scores and appearance together; shared links contain a snapshot, not a live broadcast.",
        ],
        faq: [
          [
            "Where is my scoreboard saved?",
            "Scoreboards are stored in this browser using IndexedDB. Keep a JSON backup before clearing site data or moving to another device.",
          ],
          [
            "Does a shared link update as I score?",
            "No. A shared link is a snapshot of the board. Later changes are not synced; share a fresh link to show the updated result.",
          ],
          [
            "Can I use a timer and several teams?",
            "Yes. Add teams, choose a countdown or stopwatch, configure periods and adjust the layout and text sizes for your screen.",
          ],
          [
            "Can I change the appearance without changing the score?",
            "Yes. Presets and appearance controls change the presentation while preserving team names and scores. Custom themes can be saved locally.",
          ],
        ],
        close: "Your next game is ready to begin.",
      },
      leaderboard: {
        capability: [
          "Turn results into a clear leaderboard.",
          "Start with an empty ranking and build the table your event actually needs.",
        ],
        stories: [
          [
            "Your columns. Your competition.",
            "Add participants and up to ten data columns. Rename and reorder columns, adjust their widths and enter names and values directly in the table or graphic.",
          ],
          [
            "Decide what determines the order.",
            "Keep a manual arrangement or explicitly sort a column. Mark leaders, customise individual row colours and display rankings in one, two or three columns.",
          ],
          [
            "Make the final result worth sharing.",
            "Choose an aspect ratio or custom dimensions, refine the graphic and export a PNG. A JSON backup keeps the result editable.",
          ],
        ],
        themes: [
          "A ranking with its own identity.",
          "Switch between real editor presets. Then adjust text, backgrounds, row colours, borders, spacing and title visibility in the tool; save the result as a custom theme.",
        ],
        steps: [
          [
            "Add the field",
            "Open a blank leaderboard and add participant rows. Use columns for points, results or the other information your event needs.",
          ],
          [
            "Choose the order",
            "Enter values, keep your manual order or sort a column. Highlight the entries you want people to notice.",
          ],
          [
            "Save or export",
            "Save to My Tables to reopen the project. Export a PNG for sharing, or download a JSON backup for further editing.",
          ],
        ],
        uses: ["Tournament rankings", "School competitions", "Event standings", "Group challenges"],
        advanced: [
          "Room for a full leaderboard.",
          "Use up to 100 rows, ten data columns and a three-column display. Set custom canvas dimensions for export, highlight rows, adjust column widths and keep a manual order when points are not the only result.",
        ],
        faq: [
          [
            "Will the table reorder when I change a score?",
            "No. The editor keeps your manual order when you change values. Use the column sorting controls when you want to reorder the table. The demo sorts its sample results to show how rankings change.",
          ],
          [
            "Can I add my own columns?",
            "Yes. A leaderboard supports up to ten data columns. Change their names, widths and order to suit your results.",
          ],
          [
            "How do I share a leaderboard?",
            "Export a PNG graphic to share the finished ranking. Download a JSON backup when you want an editable copy; leaderboards do not offer live shared links.",
          ],
          [
            "Does the editor save automatically?",
            "Use Save to My Tables for a persistent browser-local project. The editor can recover an unsaved draft in the same tab, but a draft is not a replacement for saving or keeping a backup.",
          ],
        ],
        close: "Share a clear view of the results.",
      },
      bracket: {
        capability: [
          "Make the path to the final clear.",
          "Set up a knockout competition, record each match and keep the next round connected to the result.",
        ],
        stories: [
          [
            "Start with the people taking part.",
            "Choose 2–64 participants, enter their names and set the order. If someone has no opponent in the first round, they move on without playing.",
          ],
          [
            "A result becomes the next match.",
            "Enter scores and choose a winner in Match results, or select a participant in the preview and choose “Set as winner”. Eligible players move into the next round.",
          ],
          [
            "Choose how to display the bracket.",
            "Choose a single-sided or two-sided bracket. Full-size scrolling keeps large tournaments readable without shrinking every match into a miniature.",
          ],
        ],
        themes: [
          "Give the tournament a visual identity.",
          "These are real editor themes. Fine-tune participant colours, match borders, connector colours and thickness, round spacing and score visibility in the tool.",
        ],
        steps: [
          [
            "Set the field",
            "Choose the participant count and bracket layout. Replace the numbered placeholders with your participants.",
          ],
          [
            "Record the matches",
            "Enter scores and choose the winner. Check the next round as the winners advance.",
          ],
          [
            "Keep the result",
            "Save the tournament to My Tables. Export a PNG or a JSON backup when you want to share the draw or keep an editable copy.",
          ],
        ],
        uses: [
          "Knockout competitions",
          "Gaming tournaments",
          "Elimination events",
          "Classroom playoffs",
        ],
        advanced: [
          "Change an early result with a clear view of the consequences.",
          "Changing a winner updates the dependent rounds and clears incompatible later results. The editor asks before changes that discard existing results. Independent connector controls, participant colours and round spacing let you refine a complex draw without changing its progression.",
        ],
        faq: [
          [
            "Which tournament format is supported?",
            "Set up a single-elimination bracket for 2–64 participants. The single-sided and two-sided options change only how the bracket is displayed, not the competition format.",
          ],
          [
            "What happens with an uneven participant count?",
            "If someone has no opponent in the first round, the bracket moves them to the next round without a match. It handles this automatically.",
          ],
          [
            "Can I correct an earlier winner?",
            "Yes. Select a different winner in Match results. The dependent rounds are updated and any incompatible later results are cleared, with confirmation before discarding results.",
          ],
          [
            "Can I reopen or export my tournament?",
            "Save it to My Tables to reopen it in this browser. Export PNG for a finished graphic and JSON for an editable backup. Clearing browser data can remove locally stored projects.",
          ],
        ],
        close: "Give the next winner somewhere to go.",
      },
    },
  },
  bg: {
    workflow: "От подготовката до резултата.",
    useCases: "За игри, класни стаи и турнири.",
    questions: "Полезни въпроси и отговори.",
    themeHint:
      "Можете да ползвате тези теми и в редактора. Прегледът не променя запазените ви проекти.",
    products: {
      scoreboard: {
        capability: [
          "Водете играта и покажете резултата ясно.",
          "Зрителите виждат резултата, а човекът, който следи играта, управлява таблото бързо.",
        ],
        stories: [
          [
            "Повече отбори на общ екран.",
            "Добавяйте, преименувайте, премахвайте и подреждайте отбори. Изберете отделни цветове и разположение един до друг или в мрежа.",
          ],
          [
            "Следващата точка е на едно докосване.",
            "Използвайте плюс и минус, въведете резултат директно или задайте стъпка. Отменете промяна или нулирайте резултатите за нова игра.",
          ],
          [
            "Следете времето на същото място.",
            "Изберете обратно броене или хронометър, задайте етикети на периодите и използвайте цял екран за публиката.",
          ],
        ],
        themes: [
          "Същата игра. Друго настроение.",
          "Изберете готова тема или настройте цветовете, контурите, ъглите, градиентите, разстоянията и размера на резултата. Запазете и собствена тема.",
        ],
        steps: [
          [
            "Задайте имена на отборите",
            "Започнете с Отбор 1 и Отбор 2 на нула. Добавете още отбори и променете имената в панела Съдържание.",
          ],
          [
            "Следете резултата",
            "Докоснете контрол или въведете корекция директно. Настройте таймера и стъпката според играта.",
          ],
          [
            "Покажете го на всички",
            "Преминете на цял екран, запазете таблото или споделете връзка към моментното му състояние. JSON архивът помага да го прехвърлите на друго устройство.",
          ],
        ],
        uses: [
          "Състезания в клас",
          "Приятелски спортни срещи",
          "Викторини",
          "Игри с няколко играчи",
        ],
        advanced: [
          "Един човек води играта, а цялата зала вижда резултата.",
          "Клавишните комбинации, настройките за размер на текста и контролите на цял екран улесняват играта на живо. Таблото се запазва в този браузър заедно с отборите, резултатите и изгледа. Споделената връзка показва моментното състояние, а не предаване на живо.",
        ],
        faq: [
          [
            "Къде се запазва таблото?",
            "В този браузър чрез IndexedDB. Изтеглете JSON архив, преди да изчистите данните на сайта или да смените устройството.",
          ],
          [
            "Споделената връзка обновява ли се?",
            "Не. Връзката показва таблото във вида му при споделянето. По-късните промени не се синхронизират. Споделете отново, за да изпратите актуалния резултат.",
          ],
          [
            "Мога ли да използвам таймер и няколко отбора?",
            "Да. Добавете отбори, изберете обратно броене или хронометър, настройте периодите, разположението и размера на текста.",
          ],
          [
            "Промяната на изгледа засяга ли резултата?",
            "Не. Темите и настройките запазват имената и резултатите. Собствените теми се запазват локално.",
          ],
        ],
        close: "Следващата ви игра може да започне.",
      },
      leaderboard: {
        capability: [
          "Подредете резултатите така, че да се виждат ясно.",
          "Започнете с празна таблица и я оформете според нуждите на събитието.",
        ],
        stories: [
          [
            "Добавете нужните ви колони.",
            "Добавете участници и до десет колони. Променяйте имената, реда и ширината им. Редактирайте данните в таблицата или в графиката.",
          ],
          [
            "Вие решавате реда.",
            "Запазете ръчно подреждане или сортирайте избрана колона. Откроявайте водещите, задавайте цветове на редовете и показвайте класирането в една, две или три колони.",
          ],
          [
            "Резултат, готов за споделяне.",
            "Изберете пропорции или собствени размери и експортирайте PNG. JSON архивът запазва възможността за редактиране.",
          ],
        ],
        themes: [
          "Класиране със собствен облик.",
          "Изберете готова тема, а след това настройте текста, фона, цветовете на редовете, контурите, разстоянията и заглавията. Запазете собствена тема.",
        ],
        steps: [
          [
            "Добавете участниците",
            "Отворете празно класиране и добавете редове. Използвайте колони за точки, резултати или друга информация.",
          ],
          [
            "Изберете подредбата",
            "Въведете стойности и запазете ръчния ред или сортирайте колона. Откроете важните участници.",
          ],
          [
            "Запазете или експортирайте",
            "Запазете в Моите таблици за повторно отваряне. Експортирайте PNG за споделяне или JSON за редактиране.",
          ],
        ],
        uses: [
          "Турнирни класирания",
          "Училищни състезания",
          "Класирания на събития",
          "Групови предизвикателства",
        ],
        advanced: [
          "Подходяща и за дълги класирания.",
          "Добавете до 100 реда, десет колони с данни и изберете изглед в три колони. Размерите на платното определят формата на експортираното изображение. Откроявайте редове, настройвайте ширината на колоните и запазвайте ръчния ред, когато класирането не зависи само от точките.",
        ],
        faq: [
          [
            "Промяната на точки пренарежда ли проекта?",
            "Не. Редакторът запазва ръчната подредба, докато променяте стойности. За да я смените, сортирайте по колона. Примерът на тази страница подрежда резултатите автоматично, за да покаже как се променя класирането.",
          ],
          [
            "Мога ли да добавя собствени колони?",
            "Да. Класирането поддържа до десет колони с променяеми имена, ширини и ред.",
          ],
          [
            "Как се споделя класиране?",
            "Експортирайте PNG за готовата графика. JSON архивът е редактируемо копие. Няма връзки със синхронизация на живо.",
          ],
          [
            "Редакторът запазва ли автоматично?",
            "Използвайте Запазете в Моите таблици за постоянен локален проект. Незапазена чернова може да се възстанови в същия раздел, но не замества запазването или архива.",
          ],
        ],
        close: "Покажете ясно резултатите.",
      },
      bracket: {
        capability: [
          "Ясен път до финала.",
          "Подгответе схема за елиминационен турнир, въведете резултатите и свържете следващия кръг с победителите.",
        ],
        stories: [
          [
            "Започнете с участниците.",
            "Добавете от 2 до 64 участници и подредете началния списък. Ако някой няма съперник в първия кръг, продължава напред без мач.",
          ],
          [
            "Резултатът води към следващата среща.",
            "Въведете резултат и победител или изберете участник в прегледа и натиснете „Обявете за победител“. Така той преминава в следващия кръг.",
          ],
          [
            "Изберете как да изглежда схемата.",
            "Покажете схемата едностранно или двустранно. При големи турнири я разглеждайте с превъртане в пълен размер, за да остане четлива.",
          ],
        ],
        themes: [
          "Собствена визия за турнира.",
          "Изберете готова тема и настройте цветовете на участниците, контурите на срещите, връзките, разстоянията между кръговете и видимостта на резултатите.",
        ],
        steps: [
          [
            "Подгответе списъка",
            "Изберете брой участници и разположение. Заменете номерираните имена с вашите участници.",
          ],
          [
            "Въведете резултатите",
            "Посочете резултата и победителя във всяка среща. Следете как победителите продължават в следващия кръг.",
          ],
          [
            "Запазете резултата",
            "Запазете турнира в Моите таблици. Експортирайте PNG или JSON архив за споделяне или бъдещо редактиране.",
          ],
        ],
        uses: [
          "Елиминационни състезания",
          "Турнири по видеоигри",
          "Събития с елиминации",
          "Плейофи в клас",
        ],
        advanced: [
          "Променете по-ранен резултат и вижте какво се променя нататък.",
          "Смяната на победителя обновява следващите кръгове и изчиства несъвместимите резултати. Редакторът иска потвърждение, преди да изтрие резултати. Настройките за връзки, цветове и разстояния променят изгледа, без да засягат правилата на турнира.",
        ],
        faq: [
          [
            "Какъв формат поддържа инструментът?",
            "Поддържат се турнири с директна елиминация и от 2 до 64 участници. Едностранната и двустранната подредба променят само изгледа на схемата.",
          ],
          [
            "Какво става при непълен брой участници?",
            "Ако участник няма съперник в първия кръг, схемата го придвижва в следващия без мач.",
          ],
          [
            "Мога ли да коригирам по-ранен победител?",
            "Да. Изберете друг победител в Резултати от срещите. Зависимите кръгове се обновяват и несъвместимите резултати се изчистват след потвърждение.",
          ],
          [
            "Мога ли да отворя отново или експортирам турнира?",
            "Запазете в Моите таблици за отваряне в този браузър. PNG е готова графика, а JSON е редактируем архив. Изчистването на данните на браузъра може да премахне локалните проекти.",
          ],
        ],
        close: "Покажете как всеки кръг води към финала.",
      },
    },
  },
  tr: {
    workflow: "Kurulumdan gösterime.",
    useCases: "Okulda, sahada veya arkadaşlarınızla.",
    questions: "Sık sorulan sorular.",
    themeHint:
      "Bu temaları düzenleyicide de kullanabilirsiniz. Önizleme, kayıtlı projelerinizi değiştirmez.",
    products: {
      scoreboard: {
        capability: [
          "Oyunu yönetin. Herkes sonucu görsün.",
          "İzleyenler için net bir skor, skoru tutan kişi için hızlı kontroller.",
        ],
        stories: [
          [
            "Daha fazla takım, ortak bir ekran.",
            "Takım ekleyin, adlarını değiştirin, kaldırın ve sıralayın. Her takıma ayrı renk verin; yan yana veya ızgara düzeni seçin.",
          ],
          [
            "Skoru tek dokunuşla güncelleyin.",
            "Artı ve eksi kullanın, skoru doğrudan girin veya özel bir artış miktarı belirleyin. Değişikliği geri alın ya da yeni oyun için skorları sıfırlayın.",
          ],
          [
            "Başka araca geçmeden süre tutun.",
            "Geri sayım veya kronometre seçin, maç bölümü etiketlerini ayarlayın ve seyirciler için tam ekranı kullanın.",
          ],
        ],
        themes: [
          "Aynı oyun. Farklı bir atmosfer.",
          "Hazır temalardan birini seçin; ardından takım renklerini, kenarlıkları, köşeleri, renk geçişlerini, aralıkları ve skor boyutunu düzenleyin. Kendi temanızı da kaydedebilirsiniz.",
        ],
        steps: [
          [
            "Takımları adlandırın",
            "Takım 1 ve Takım 2 sıfır puanla başlar. İçerik bölümünden takım ekleyip adlarını değiştirebilirsiniz.",
          ],
          [
            "Skoru güncel tutun",
            "Kontrollere dokunun veya düzeltmeyi doğrudan girin. Gerektiğinde zamanlayıcıyı ve artış miktarını ayarlayın.",
          ],
          [
            "Herkese gösterin",
            "Tam ekrana geçin, kaydedin veya anlık görüntü bağlantısı gönderin. Başka bir cihaz için JSON yedeği tutun.",
          ],
        ],
        uses: ["Sınıf yarışmaları", "Dostluk maçları", "Bilgi yarışmaları", "Çok oyunculu oyunlar"],
        advanced: [
          "Oyunu bir kişi yönetir, salondakiler skoru ekrandan takip eder.",
          "Klavye kısayolları, ayarlanabilir yazı boyutları ve tam ekran kontrolleri oyunu yönetmeyi kolaylaştırır. Takımlar, skorlar ve görünüm bu tarayıcıya birlikte kaydedilir. Paylaşılan bağlantı, canlı yayın yerine o anki tabloyu gösterir.",
        ],
        faq: [
          [
            "Skor tabelam nerede saklanır?",
            "Bu tarayıcıda IndexedDB ile saklanır. Site verilerini temizlemeden veya cihaz değiştirmeden önce JSON yedeği indirin.",
          ],
          [
            "Paylaşılan bağlantı skorla birlikte güncellenir mi?",
            "Hayır. Bağlantı, paylaşıldığı andaki durumu gösterir. Sonraki değişiklikler eşitlenmez; güncel sonucu paylaşmak için yeni bir bağlantı gönderin.",
          ],
          [
            "Zamanlayıcı ve birden fazla takım kullanabilir miyim?",
            "Evet. Takımlar ekleyin, geri sayım veya kronometre seçin, maç bölümlerini ve ekranınıza uygun düzen ile yazı boyutlarını ayarlayın.",
          ],
          [
            "Görünüm değişikliği skoru etkiler mi?",
            "Hayır. Temalar ve görünüm kontrolleri takım adlarını ve skorları korur. Özel temalar yerel olarak kaydedilebilir.",
          ],
        ],
        close: "Sıradaki oyuna başlayın.",
      },
      leaderboard: {
        capability: [
          "Sonuçları anlaşılır bir sıralama tablosunda gösterin.",
          "Boş bir tabloyla başlayıp etkinliğinize uygun şekilde düzenleyin.",
        ],
        stories: [
          [
            "İhtiyacınız olan sütunları ekleyin.",
            "Katılımcı ve en fazla on veri sütunu ekleyin. Adları, sıralamayı ve genişlikleri değiştirin; tablo veya görsel üzerinde düzenleyin.",
          ],
          [
            "Sırayı neyin belirlediğine siz karar verin.",
            "Elle belirlenen sırayı koruyun veya bir sütunu özellikle sıralayın. Liderleri vurgulayın, satır renklerini değiştirin; bir, iki veya üç sütunlu görünüm seçin.",
          ],
          [
            "Paylaşmaya değer bir sonuç hazırlayın.",
            "En boy oranı veya özel boyut seçin, görseli düzenleyin ve PNG olarak dışa aktarın. JSON yedeği düzenlemeye devam etmenizi sağlar.",
          ],
        ],
        themes: [
          "Kendi tarzınızı yansıtan bir sıralama.",
          "Hazır temalardan birini seçin. Metni, arka planı, satır renklerini, kenarlıkları, aralıkları ve başlık görünürlüğünü düzenleyip kendi temanızı kaydedin.",
        ],
        steps: [
          [
            "Katılımcıları ekleyin",
            "Boş tabloya katılımcı satırları ekleyin. Puanlar, sonuçlar veya başka bilgiler için sütunlar kullanın.",
          ],
          [
            "Sırayı seçin",
            "Değerleri girin; elle belirlenen sırayı koruyun veya sütunu sıralayın. Önemli katılımcıları vurgulayın.",
          ],
          [
            "Kaydedin veya dışa aktarın",
            "Yeniden açmak için Tablolarım'a kaydedin. Paylaşım için PNG, düzenlenebilir yedek için JSON indirin.",
          ],
        ],
        uses: [
          "Turnuva sıralamaları",
          "Okul yarışmaları",
          "Etkinlik puan durumları",
          "Grup mücadeleleri",
        ],
        advanced: [
          "Uzun sıralama tabloları için de uygun.",
          "Tablo, 100 satıra, on veri sütununa ve üç sütunlu görünüme kadar genişletilebilir. Tuval boyutu dışa aktarılan görselin şeklini belirler. Satırları vurgulayabilir, sütun genişliklerini ayarlayabilir ve puan dışındaki sonuçları elle sıralayabilirsiniz.",
        ],
        faq: [
          [
            "Skoru değiştirince tablo otomatik sıralanır mı?",
            "Hayır. Düzenleyicide değerleri değiştirmeniz, elle belirlediğiniz sırayı bozmaz. Yeniden sıralamak için sütun sıralama düğmelerini kullanın. Bu sayfadaki örnek, sıralamanın nasıl değiştiğini göstermek için sonuçları otomatik sıralar.",
          ],
          [
            "Kendi sütunlarımı ekleyebilir miyim?",
            "Evet. En fazla on veri sütunu ekleyebilir; adlarını, genişliklerini ve sıralarını değiştirebilirsiniz.",
          ],
          [
            "Sıralamayı nasıl paylaşırım?",
            "Bitmiş görseli PNG olarak dışa aktarın. Düzenlenebilir kopya için JSON yedeği indirin. Sıralama aracında canlı paylaşılan bağlantı bulunmaz.",
          ],
          [
            "Düzenleyici otomatik kaydeder mi?",
            "Kalıcı yerel proje için Tablolarım'a Kaydet'i kullanın. Kaydedilmemiş taslak aynı sekmede kurtarılabilir; ancak kaydetmenin veya yedek almanın yerini tutmaz.",
          ],
        ],
        close: "Sonuçlarınızı görünür kılın.",
      },
      bracket: {
        capability: [
          "Finale giden yol net olsun.",
          "Eleme yarışması kurun, maçları kaydedin ve sonraki turu sonuçlara bağlayın.",
        ],
        stories: [
          [
            "Katılımcı listesini hazırlayın.",
            "2–64 katılımcı ekleyip adlarını ve sıralarını belirleyin. İlk turda rakibi olmayan katılımcı maç yapmadan ilerler.",
          ],
          [
            "Bir sonuç, sonraki maçı belirler.",
            "Maç sonuçlarında skoru ve kazananı seçin veya önizlemede katılımcıyı seçip “Kazanan olarak belirle” seçeneğini kullanın. Uygun oyuncular sonraki tura geçer.",
          ],
          [
            "Şemanın görünümünü seçin.",
            "Tek veya iki taraflı düzen kullanın. Büyük turnuvaları tam boyutta kaydırarak okunaklı biçimde inceleyin.",
          ],
        ],
        themes: [
          "Turnuva şemasını kendi tarzınıza göre düzenleyin.",
          "Hazır temalardan birini seçin. Katılımcı renklerini, maç kenarlıklarını, bağlantı rengini ve kalınlığını, turlar arasındaki boşluğu ve skor görünürlüğünü ayarlayın.",
        ],
        steps: [
          [
            "Katılımcıları hazırlayın",
            "Katılımcı sayısını ve düzeni seçin. Numaralı yer tutucuların yerine katılımcılarınızı yazın.",
          ],
          [
            "Maç sonuçlarını girin",
            "Skorları girip kazananı seçin. Kazananların sonraki tura geçtiğini görün.",
          ],
          [
            "Sonucu saklayın",
            "Turnuva şemasını Tablolarım'a kaydedin. Paylaşmak için PNG, düzenlemeye devam etmek için JSON yedeği alın.",
          ],
        ],
        uses: ["Eleme yarışmaları", "Oyun turnuvaları", "Elemeli etkinlikler", "Sınıf finalleri"],
        advanced: [
          "Önceki maçın sonucunu değiştirin, sonraki turları da görün.",
          "Kazanan değişince sonraki turlar güncellenir ve artık geçerli olmayan sonuçlar temizlenir. Sonuçlar silinmeden önce onayınız istenir. Bağlantı, renk ve tur aralığı ayarları turnuva kurallarını değiştirmez.",
        ],
        faq: [
          [
            "Hangi turnuva biçimi destekleniyor?",
            "2–64 katılımcılı tek eleme turnuvaları desteklenir. Tek veya iki taraflı seçenekler yalnızca şemanın görünümünü değiştirir.",
          ],
          [
            "Katılımcı sayısı tabloyu doldurmazsa ne olur?",
            "İlk turda rakibi olmayan katılımcı maç yapmadan sonraki tura geçer. Şema bunu otomatik yapar.",
          ],
          [
            "Önceki bir kazananı düzeltebilir miyim?",
            "Evet. Maç sonuçlarında başka bir kazanan seçin. Bağlı turlar güncellenir ve uyumsuz sonuçlar onayınızdan sonra temizlenir.",
          ],
          [
            "Turnuvayı yeniden açabilir veya dışa aktarabilir miyim?",
            "Bu tarayıcıda yeniden açmak için Tablolarım'a kaydedin. Bitmiş görsel için PNG, düzenlenebilir yedek için JSON kullanın. Tarayıcı verilerini temizlemek yerel projeleri kaldırabilir.",
          ],
        ],
        close: "Kazananı sonraki tura taşıyın.",
      },
    },
  },
};
