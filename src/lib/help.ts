import type {Lang} from './i18n';
export type HelpCopy={title:string;demoTitle:string;demoNote:string;guideStep:string;guideOf:string;guideBack:string;guideNext:string;guideRestart:string;guide:{title:string;body:string}[];sections:[string,string][]};
export const help:Record<Lang,HelpCopy>={
 en:{title:'How to Create an Online Scoreboard',demoTitle:'Follow the steps',demoNote:'Try each step on this sample scoreboard. Its controls change only this preview. The toolbar is shown for reference and disabled here; use it on your actual scoreboard.',guideStep:'Step',guideOf:'of',guideBack:'Back',guideNext:'Next',guideRestart:'Start over',guide:[
  {title:'Add a point',body:'Press the highlighted + button. Select a score to enter a number directly.'},
  {title:'Choose points per tap',body:'Open Controls below the board and change the step size. Then try + again.'},
  {title:'Customise your teams',body:'Use Teams or Colours below the board to rename, add, reorder, or recolour teams.'},
  {title:'Use the timer',body:'Press Start above the scores. Open Timer below to choose a countdown, stopwatch, duration, and match options.'},
  {title:'Save, share, or export',body:'On your scoreboard, Save stores a game in this browser, Share creates a snapshot link, and Export downloads a JSON backup. These toolbar buttons are disabled in this preview.'},
 ],sections:[
 ['Score several teams','Add the teams you need, then use + or − to adjust each score. Select a score to enter a number directly. The Controls tab sets how many points each press adds or removes.'],
 ['Make it yours','The tabs below the scoreboard let you rename and reorder teams, choose colours, adjust the layout and set up a timer. Changes appear immediately and save automatically.'],
 ['Use the timer','In Timer, choose countdown or stopwatch. Enter hours, minutes and seconds, or choose a preset. Sports options add periods and timeouts. Pausing a running match also pauses score changes; resume the clock to continue. Turning the timer off stops it and restores its configured duration.'],
 ['Project the scoreboard fullscreen','Select Fullscreen, or press F when you are not editing text, to show the board on a classroom projector or another display. Move the pointer or tap to reveal controls. The pin keeps them visible; Escape exits where supported. Number keys 1 and 2 add points to the first two teams.'],
 ['Save, back up and share','No account is required. Save stores the game in this browser, where you can reopen it from Saved Scoreboards. Export or import a JSON backup to keep a copy or move games to another device. Share creates an independent snapshot link: anyone with the link can read it, and later changes are not synchronised. Clearing browser data can remove saved games.']
 ]},
 bg:{title:'Как да използвате онлайн табло за резултати',demoTitle:'Следвайте стъпките',demoNote:'Изпробвайте стъпките върху това примерно табло. Промените важат само тук. Бутоните в горната лента са само за показване и са изключени; използвайте ги в истинското си табло.',guideStep:'Стъпка',guideOf:'от',guideBack:'Назад',guideNext:'Напред',guideRestart:'Отначало',guide:[
  {title:'Добавете точка',body:'Натиснете маркирания бутон +. Изберете резултата, за да въведете число директно.'},
  {title:'Изберете точки при натискане',body:'Отворете Управление под таблото и променете точките за едно натискане. После изпробвайте +.'},
  {title:'Настройте отборите',body:'В Отбори или Цветове под таблото можете да преименувате, добавяте, пренареждате и оцветявате отбори.'},
  {title:'Използвайте таймера',body:'Натиснете Старт над резултатите. Отворете Таймер под таблото, за да изберете обратно броене, хронометър, продължителност и настройки за мача.'},
  {title:'Запазете, споделете или изнесете',body:'В истинското табло „Запази“ съхранява играта в браузъра, „Сподели“ създава връзка с моментно копие, а „Изтегли тази игра“ сваля JSON резервно копие. Тези бутони са изключени в примера.'},
 ],sections:[
 ['Точки за няколко отбора','Добавете нужните отбори, след което използвайте + или −, за да промените резултата на всеки. Изберете числото, за да въведете точките директно. В Управление задавате колко точки се добавят или отнемат при едно натискане.'],
 ['Персонализиране','Разделите под резултатите позволяват да преименувате и пренареждате отбори, да избирате цветове, подредба и таймер. Промените се показват веднага и се запазват автоматично.'],
 ['Таймер','Изберете обратно броене или хронометър. Въведете часове, минути и секунди или изберете готова продължителност. Спортните настройки добавят части на мача и прекъсвания. При пауза на започнал мач не могат да се променят точки; продължете таймера, за да играете. Изключването на таймера го спира и възстановява зададената продължителност.'],
 ['Проектиране на цял екран','Изберете Цял екран или натиснете F, когато не редактирате текст, за да покажете таблото на проектор в класната стая или на друг дисплей. Раздвижете показалеца или докоснете екрана, за да видите бутоните. Карфицата ги оставя видими. Escape излиза, когато браузърът го поддържа. Клавишите 1 и 2 добавят точки на първите два отбора.'],
 ['Запазване, архивиране и споделяне','Регистрация не е нужна. Запазете играта в този браузър и я отворете от Запазени табла. Можете да изнесете или внесете JSON архив, за да пазите копие или да преместите игрите на друго устройство. Споделянето създава връзка с независимо моментно копие: всеки с връзката може да го прочете, а следващите промени не се синхронизират. Изчистването на данните на браузъра може да изтрие игрите.']
 ]},
 tr:{title:'Online Skor Tablosu Nasıl Kullanılır',demoTitle:'Adımları izleyin',demoNote:'Adımları bu örnek skor tablosunda deneyin. Değişiklikler yalnızca bu önizlemeyi etkiler. Üstteki araç çubuğu örnek olarak gösterilir ve burada devre dışıdır; bu işlemleri kendi skor tablonuzda kullanın.',guideStep:'Adım',guideOf:'/',guideBack:'Geri',guideNext:'İleri',guideRestart:'Baştan başla',guide:[
  {title:'Puan ekleyin',body:'Vurgulanan + düğmesine basın. Sayıyı doğrudan girmek için skoru seçin.'},
  {title:'Her basıştaki puanı seçin',body:'Tablonun altındaki Kontroller sekmesini açıp puan adımını değiştirin. Ardından + düğmesini yeniden deneyin.'},
  {title:'Takımlarınızı özelleştirin',body:'Takımları yeniden adlandırmak, eklemek, sıralamak veya renklendirmek için tablonun altındaki Takımlar ya da Renkler sekmesini kullanın.'},
  {title:'Zamanlayıcıyı kullanın',body:'Skorların üstündeki Başlat düğmesine basın. Geri sayım, kronometre, süre ve maç seçenekleri için alttaki Zamanlayıcı sekmesini açın.'},
  {title:'Kaydedin, paylaşın veya dışa aktarın',body:'Gerçek skor panonuzda Kaydet oyunu bu tarayıcıya saklar, Paylaş anlık görüntü bağlantısı oluşturur ve Dışa aktar JSON yedeği indirir. Bu önizlemede araç çubuğu düğmeleri devre dışıdır.'},
 ],sections:[
 ['Birden fazla takımın puanını tutun','Gereken takımları ekleyin, ardından her takımın puanını + veya − ile değiştirin. Sayıyı doğrudan girmek için skoru seçin. Kontroller sekmesinden her basışta eklenecek ya da çıkarılacak puanı ayarlayın.'],
 ['Özelleştirin','Skorların altındaki sekmelerden takımları adlandırıp sıralayabilir, renkleri ve düzeni değiştirebilir, zamanlayıcıyı ayarlayabilirsiniz. Değişiklikler hemen görünür ve otomatik kaydedilir.'],
 ['Zamanlayıcı','Geri sayım veya kronometreyi seçin. Saat, dakika ve saniye girin ya da hazır süre kullanın. Spor seçenekleri devreler ve molalar ekler. Başlamış bir maç duraklatıldığında skor da değiştirilemez; devam etmek için saati sürdürün. Zamanlayıcıyı kapatmak onu durdurur ve ayarlanan süreye döndürür.'],
 ['Projeksiyonda tam ekran gösterim','Skor tablosunu sınıf projeksiyonunda veya başka bir ekranda göstermek için Tam ekran’ı seçin ya da metin düzenlemediğinizde F tuşuna basın. Kontroller için fareyi hareket ettirin veya ekrana dokunun. Sabitleme düğmesi kontrolleri görünür tutar. Desteklenen tarayıcılarda Escape ile çıkılır. 1 ve 2 tuşları ilk iki takıma puan ekler.'],
 ['Kaydedin, yedekleyin ve paylaşın','Üyelik gerekmez. Kaydet seçeneği oyunu bu tarayıcıya saklar; Kayıtlı Skor Tabloları bölümünden yeniden açabilirsiniz. JSON yedeğini dışa veya içe aktararak oyunu saklayabilir ya da başka bir cihaza taşıyabilirsiniz. Paylaşım bağlantısı oyunun bağımsız bir anlık görüntüsünü içerir: bağlantıya sahip herkes okuyabilir, sonraki değişiklikler eşitlenmez. Tarayıcı verilerini temizlemek kayıtlı oyunları silebilir.']
 ]}
};
