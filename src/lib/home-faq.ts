import type {Lang} from './i18n';

export const homeFaq:Record<Lang,{title:string;intro:string;items:{question:string;answer:string}[]}>= {
 en:{title:'Questions and answers',intro:'Quick answers about using your scoreboard.',items:[
  {question:'Is it free?',answer:'Yes. Baran’s Scoreboard is free to use and open source under the MIT License.'},
  {question:'Do I need an account?',answer:'No. You can create and use scoreboards without signing up.'},
  {question:'Can I add more teams?',answer:'Yes. Add teams whenever you need them, then rename and reorder them.'},
  {question:'Where are my scoreboards saved?',answer:'They stay in this browser on this device. Export a backup before clearing browser data or moving to another device.'},
  {question:'Can I share a live scoreboard?',answer:'A share link contains a snapshot of the scoreboard. Later changes are not synced to that link.'},
  {question:'Can I use a timer and full-screen display?',answer:'Yes. Choose a countdown or stopwatch, then show the scoreboard full screen.'},
 ]},
 bg:{title:'Въпроси и отговори',intro:'Кратки отговори за използването на таблото.',items:[
  {question:'Безплатно ли е?',answer:'Да. Baran’s Scoreboard е безплатен за използване софтуер с отворен код под лиценза MIT.'},
  {question:'Нужна ли е регистрация?',answer:'Не. Можете да създавате и използвате табла без регистрация.'},
  {question:'Мога ли да добавя още отбори?',answer:'Да. Добавяйте отбори при нужда, а след това можете да променяте имената и реда им.'},
  {question:'Къде се запазват таблата ми?',answer:'Те остават в този браузър на това устройство. Изтеглете резервно копие, преди да изчистите данните на браузъра или да смените устройството.'},
  {question:'Мога ли да споделя табло на живо?',answer:'Връзката за споделяне съдържа моментно копие на таблото. Последващите промени няма да се синхронизират с нея.'},
  {question:'Мога ли да използвам таймер и цял екран?',answer:'Да. Изберете обратно броене или хронометър и покажете таблото на цял екран.'},
 ]},
 tr:{title:'Sorular ve cevaplar',intro:'Skor tablonuzu kullanmayla ilgili kısa yanıtlar.',items:[
  {question:'Ücretsiz mi?',answer:'Evet. Baran’s Scoreboard ücretsiz kullanılabilir ve MIT Lisansı altında açık kaynaklıdır.'},
  {question:'Kayıt olmam gerekiyor mu?',answer:'Hayır. Hesap açmadan skor tabloları oluşturup kullanabilirsiniz.'},
  {question:'Daha fazla takım ekleyebilir miyim?',answer:'Evet. İhtiyacınız oldukça takım ekleyebilir, adlarını ve sıralarını değiştirebilirsiniz.'},
  {question:'Skor tablolarım nerede saklanıyor?',answer:'Bu cihazdaki tarayıcıda saklanır. Tarayıcı verilerini temizlemeden veya başka bir cihaza geçmeden önce yedek dışa aktarın.'},
  {question:'Canlı bir skor tablosu paylaşabilir miyim?',answer:'Paylaşım bağlantısı skor tablosunun o anki görüntüsünü içerir. Sonraki değişiklikler bağlantıyla eşitlenmez.'},
  {question:'Zamanlayıcı ve tam ekran kullanabilir miyim?',answer:'Evet. Geri sayım veya kronometre seçip skor tablosunu tam ekranda gösterebilirsiniz.'},
 ]},
};
