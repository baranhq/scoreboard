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
    workflow: "From setup to showtime.",
    useCases: "Make room for a little competition.",
    questions: "A few useful answers.",
    themeHint:
      "These presets are available in the real editor. This example does not change your saved projects.",
    products: {
      scoreboard: {
        capability: [
          "Run the game. Keep the room with you.",
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
          "One host. A whole room watching.",
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
          "Give every result its place.",
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
          "From one list to a whole field.",
          "Support up to 100 rows, ten data columns and three side-by-side display groups. Custom canvas dimensions control the export shape; row highlights, column widths and editable ranks keep the graphic useful for more than points alone.",
        ],
        faq: [
          [
            "Will changing points automatically reorder my project?",
            "No. The real editor preserves manual order when you edit values. Use the column sorting controls when you want to reorder the table. The landing-page demo sorts its sample results to show ranking changes.",
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
        close: "Put your results in the picture.",
      },
      bracket: {
        capability: [
          "Make the path to the final clear.",
          "Set up a knockout competition, record each match and keep the next round connected to the result.",
        ],
        stories: [
          [
            "Start with the people taking part.",
            "Choose 2–64 participants, enter their names and arrange the initial order. Automatic byes handle a field that does not fill a power-of-two draw.",
          ],
          [
            "A result becomes the next match.",
            "Enter scores and choose a winner in Match results, or select a participant in the preview and use Advance. Eligible players move into the next round.",
          ],
          [
            "See both sides of the story.",
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
            "The tool creates single-elimination knockout brackets for 2–64 participants. Single-sided and two-sided are presentation layouts; they do not change the competition format.",
          ],
          [
            "What happens with an uneven participant count?",
            "The bracket adds automatic byes where necessary. A bye advances its participant without requiring a played match.",
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
    useCases: "Място за малко състезание.",
    questions: "Полезни въпроси и отговори.",
    themeHint:
      "Тези теми са налични в истинския редактор. Примерът не променя запазените ви проекти.",
    products: {
      scoreboard: {
        capability: [
          "Водете играта. Задръжте вниманието.",
          "Ясен резултат за зрителите и бързи контроли за човека, който го следи.",
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
          "Пробвайте истинските теми. В редактора настройте цветовете, контурите, ъглите, градиентите, плътността и размера на резултата. Запазете собствена тема.",
        ],
        steps: [
          [
            "Дайте имена на отборите",
            "Започнете с Отбор 1 и Отбор 2 на нула. Добавете още отбори и променете имената в панела Съдържание.",
          ],
          [
            "Следете резултата",
            "Докоснете контрол или въведете корекция директно. Настройте таймера и стъпката според играта.",
          ],
          [
            "Покажете го на всички",
            "Отворете цял екран, запазете таблото или изпратете връзка с моментно състояние. JSON архивът позволява преместване на друго устройство.",
          ],
        ],
        uses: [
          "Състезания в клас",
          "Приятелски спортни срещи",
          "Викторини",
          "Игри с няколко играчи",
        ],
        advanced: [
          "Един водещ. Цяла зала следи играта.",
          "Клавишни комбинации, размери на текста и контроли на цял екран помагат по време на живата игра. Локалното запазване съхранява отборите, резултатите и изгледа. Споделената връзка съдържа моментно състояние, а не предаване на живо.",
        ],
        faq: [
          [
            "Къде се запазва таблото?",
            "В този браузър чрез IndexedDB. Създайте JSON архив, преди да изчистите данните на сайта или да смените устройството.",
          ],
          [
            "Споделената връзка обновява ли се?",
            "Не. Връзката съдържа таблото към момента на създаването ѝ. По-късните промени не се синхронизират. Създайте нова връзка за актуалния резултат.",
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
          "Дайте място на всеки резултат.",
          "Започнете с празно класиране и създайте таблицата, от която събитието ви се нуждае.",
        ],
        stories: [
          [
            "Вашите колони. Вашето състезание.",
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
          "Сменяйте истинските теми на редактора. Настройте текст, фон, цветове на редове, контури, разстояния и видимост на заглавията. Запазете собствена тема.",
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
          "От един списък до цялото състезание.",
          "До 100 реда, десет колони с данни и три групи една до друга. Размерите на платното определят формата на експорта. Открояване, ширини на колони и редактируеми позиции позволяват повече от класиране по точки.",
        ],
        faq: [
          [
            "Промяната на точки пренарежда ли проекта?",
            "Не. Истинският редактор запазва ръчния ред. Използвайте сортиране на колона, когато желаете подреждане. Демонстрацията на тази страница сортира примерните резултати, за да покаже движение в класирането.",
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
        close: "Поставете резултатите в центъра.",
      },
      bracket: {
        capability: [
          "Ясен път до финала.",
          "Създайте елиминационно състезание, въведете резултатите и свържете следващия кръг с победителите.",
        ],
        stories: [
          [
            "Започнете с участниците.",
            "Изберете между 2 и 64 участници, въведете имена и подредете началния списък. Автоматичните служебни победи попълват непълна схема.",
          ],
          [
            "Резултатът води към следващата среща.",
            "Въведете резултат и победител или изберете участник в прегледа и натиснете Продължете. Участниците преминават в следващия кръг.",
          ],
          [
            "Погледнете схемата от две страни.",
            "Изберете едностранна или двустранна схема. Превъртането в пълен размер запазва големите турнири четливи.",
          ],
        ],
        themes: [
          "Собствена визия за турнира.",
          "Пробвайте истинските теми. В инструмента настройте цветове на участници, контури на срещи, връзки, разстояния между кръгове и видимост на резултатите.",
        ],
        steps: [
          [
            "Подгответе списъка",
            "Изберете брой участници и разположение. Заменете номерираните имена с вашите участници.",
          ],
          [
            "Въведете срещите",
            "Въведете резултатите и победителите. Проверете следващия кръг след преминаването им.",
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
          "Коригирайте ранен резултат с ясни последици.",
          "Смяната на победител обновява зависимите кръгове и изчиства несъвместимите по-късни резултати. Редакторът иска потвърждение преди загуба на резултати. Отделни настройки на връзките, цветове на участниците и разстояния оформят схемата без промяна на логиката.",
        ],
        faq: [
          [
            "Какъв формат поддържа инструментът?",
            "Единична елиминация за 2–64 участници. Едностранната и двустранната схема са визуални разположения, а не различни формати на състезание.",
          ],
          [
            "Какво става при непълен брой участници?",
            "Схемата добавя служебни победи, когато са нужни. Участникът преминава без изиграна среща.",
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
        close: "Дайте посока на следващия победител.",
      },
    },
  },
  tr: {
    workflow: "Kurulumdan gösterime.",
    useCases: "Biraz rekabete yer açın.",
    questions: "Birkaç yararlı yanıt.",
    themeHint:
      "Bu hazır temalar gerçek düzenleyicide de bulunur. Örnek, kayıtlı projelerinizi değiştirmez.",
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
            "Sonraki sayı bir dokunuş uzakta.",
            "Artı ve eksi kullanın, skoru doğrudan girin veya özel bir artış miktarı belirleyin. Değişikliği geri alın ya da yeni oyun için skorları sıfırlayın.",
          ],
          [
            "Başka araca geçmeden süre tutun.",
            "Geri sayım veya kronometre seçin, dönem etiketlerini ayarlayın ve seyirciler için tam ekranı kullanın.",
          ],
        ],
        themes: [
          "Aynı oyun. Farklı bir atmosfer.",
          "Gerçek sunum temalarını deneyin. Düzenleyicide takım renklerini, kenarlıkları, köşeleri, degradeleri, yoğunluğu ve skor boyutunu ayarlayın; özel temanızı kaydedin.",
        ],
        steps: [
          [
            "Takımları adlandırın",
            "Sıfır puanlı Takım 1 ve Takım 2 ile başlayın. İçerik panelinde yeni takım ekleyin ve adları düzenleyin.",
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
          "Bir sunucu. Oyunu izleyen bir oda dolusu insan.",
          "Klavye kısayolları, ayarlanabilir yazı boyutları ve tam ekran kontrolleri canlı oyunu yönetmeye yardımcı olur. Yerel kayıtlar takımları, skorları ve görünümü birlikte saklar. Paylaşılan bağlantılar canlı yayın değil, anlık görüntüdür.",
        ],
        faq: [
          [
            "Skor tabelam nerede saklanır?",
            "Bu tarayıcıda IndexedDB ile saklanır. Site verilerini temizlemeden veya cihaz değiştirmeden önce JSON yedeği alın.",
          ],
          [
            "Paylaşılan bağlantı skorla birlikte güncellenir mi?",
            "Hayır. Bağlantı oluşturulduğu andaki durumu içerir. Sonraki değişiklikler eşitlenmez; güncel sonucu paylaşmak için yeni bağlantı oluşturun.",
          ],
          [
            "Zamanlayıcı ve birden fazla takım kullanabilir miyim?",
            "Evet. Takımlar ekleyin, geri sayım veya kronometre seçin, dönemleri ve ekranınıza uygun düzen ile yazı boyutlarını ayarlayın.",
          ],
          [
            "Görünüm değişikliği skoru etkiler mi?",
            "Hayır. Temalar ve görünüm kontrolleri takım adlarını ve skorları korur. Özel temalar yerel olarak kaydedilebilir.",
          ],
        ],
        close: "Sıradaki oyununuz başlamaya hazır.",
      },
      leaderboard: {
        capability: [
          "Her sonuca bir yer verin.",
          "Boş bir sıralamayla başlayın; etkinliğinizin gerçekten ihtiyaç duyduğu tabloyu kurun.",
        ],
        stories: [
          [
            "Sizin sütunlarınız. Sizin yarışmanız.",
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
          "Kendine ait bir kimliği olan sıralama.",
          "Gerçek düzenleyici temaları arasında geçiş yapın. Metin, arka plan, satır renkleri, kenarlık, boşluk ve başlık görünürlüğünü ayarlayın; özel temanızı kaydedin.",
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
          "Tek bir listeden bütün katılımcılara.",
          "100 satır, on veri sütunu ve yan yana üç görünüm grubu desteklenir. Özel tuval boyutları dışa aktarımın şeklini belirler. Satır vurguları, sütun genişlikleri ve düzenlenebilir sıralar, puandan fazlasını göstermenizi sağlar.",
        ],
        faq: [
          [
            "Puanları değiştirmek projeyi otomatik sıralar mı?",
            "Hayır. Gerçek düzenleyici değerleri düzenlerken elle belirlenen sırayı korur. Yeniden sıralamak için sütun sıralama kontrollerini kullanın. Bu sayfadaki örnek, sıra değişimini göstermek için örnek sonuçları sıralar.",
          ],
          [
            "Kendi sütunlarımı ekleyebilir miyim?",
            "Evet. En fazla on veri sütununun adını, genişliğini ve sırasını değiştirebilirsiniz.",
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
            "Katılacak kişilerle başlayın.",
            "2–64 katılımcı seçin, adlarını girin ve başlangıç sırasını düzenleyin. Tam dolmayan eşleşmeler için otomatik bay geçişleri uygulanır.",
          ],
          [
            "Bir sonuç, sonraki maçı belirler.",
            "Maç sonuçlarında skoru ve kazananı seçin veya önizlemede katılımcıyı seçip İlerlet'i kullanın. Uygun oyuncular sonraki tura geçer.",
          ],
          [
            "Tabloyu iki taraftan görün.",
            "Tek veya çift taraflı düzen seçin. Tam boyutta kaydırma, büyük turnuvaları küçük ve okunaksız bir görsele dönüştürmez.",
          ],
        ],
        themes: [
          "Turnuvaya görsel bir kimlik kazandırın.",
          "Bunlar gerçek düzenleyici temalarıdır. Araçta katılımcı renklerini, maç kenarlıklarını, bağlantı renk ve kalınlığını, tur boşluklarını ve skor görünürlüğünü ayarlayın.",
        ],
        steps: [
          [
            "Katılımcıları hazırlayın",
            "Katılımcı sayısını ve düzeni seçin. Numaralı yer tutucuların yerine katılımcılarınızı yazın.",
          ],
          [
            "Maçları kaydedin",
            "Skorları girin, kazananları seçin. İlerleyen oyuncularla sonraki turu kontrol edin.",
          ],
          [
            "Sonucu saklayın",
            "Turnuvayı Tablolarım'a kaydedin. Tabloyu paylaşmak veya düzenlemeye devam etmek için PNG ya da JSON yedeği alın.",
          ],
        ],
        uses: ["Eleme yarışmaları", "Oyun turnuvaları", "Elemeli etkinlikler", "Sınıf finalleri"],
        advanced: [
          "Önceki sonucu, etkisini bilerek düzeltin.",
          "Kazananı değiştirmek bağlı turları günceller ve uyumsuz sonraki sonuçları temizler. Düzenleyici, sonuçlar silinmeden önce onay ister. Bağımsız bağlantı kontrolleri, katılımcı renkleri ve tur boşlukları, ilerleme mantığını değiştirmeden görünümü düzenler.",
        ],
        faq: [
          [
            "Hangi turnuva biçimi destekleniyor?",
            "2–64 katılımcı için tek eleme sistemi desteklenir. Tek ve çift taraflı seçenekler görsel düzendir; yarışma biçimini değiştirmez.",
          ],
          [
            "Katılımcı sayısı tabloyu doldurmazsa ne olur?",
            "Gerektiğinde otomatik bay geçişleri eklenir. Katılımcı, oynanmış bir maç olmadan sonraki tura geçer.",
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
        close: "Sıradaki kazanana bir yol açın.",
      },
    },
  },
};
