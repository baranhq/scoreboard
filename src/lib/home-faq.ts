import type {Lang} from './i18n';

export const homeFaq:Record<Lang,{title:string;items:{question:string;answer:string}[]}>= {
 en:{title:'Questions and answers',items:[
  {question:'Do I need an account?',answer:'No. You can create and use scoreboards without signing up.'},
  {question:'Where are my scoreboards saved?',answer:'They stay in this browser on this device. Export a backup before clearing browser data or moving to another device.'},
  {question:'Can I share a live scoreboard?',answer:'A share link contains a snapshot of the scoreboard. Later changes are not synced to that link.'},
  {question:'Can I use a timer and full-screen display?',answer:'Yes. Choose a countdown or stopwatch, then show the scoreboard full screen.'},
 ]},
 bg:{title:'Въпроси и отговори',items:[
  {question:'Трябва ли да се регистрирам?',answer:'Не. Можете да създавате и използвате табла без регистрация.'},
  {question:'Къде се запазват таблата ми?',answer:'Те остават в този браузър на това устройство. Изтеглете резервно копие, преди да изчистите данните на браузъра или да смените устройството.'},
  {question:'Мога ли да споделя табло на живо?',answer:'Връзката за споделяне съдържа моментно копие на таблото. Последващите промени няма да се синхронизират с нея.'},
  {question:'Мога ли да използвам таймер и цял екран?',answer:'Да. Изберете обратно броене или хронометър и покажете таблото на цял екран.'},
 ]},
 tr:{title:'Sorular ve cevaplar',items:[
  {question:'Kayıt olmam gerekiyor mu?',answer:'Hayır. Hesap açmadan skor tabloları oluşturup kullanabilirsiniz.'},
  {question:'Skor tablolarım nerede saklanıyor?',answer:'Bu cihazdaki tarayıcıda saklanır. Tarayıcı verilerini temizlemeden veya başka bir cihaza geçmeden önce yedek dışa aktarın.'},
  {question:'Canlı bir skor tablosu paylaşabilir miyim?',answer:'Paylaşım bağlantısı skor tablosunun o anki görüntüsünü içerir. Sonraki değişiklikler bağlantıyla eşitlenmez.'},
  {question:'Zamanlayıcı ve tam ekran kullanabilir miyim?',answer:'Evet. Geri sayım veya kronometre seçip skor tablosunu tam ekranda gösterebilirsiniz.'},
 ]},
};
