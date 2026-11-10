<p align="center">
  <a href="https://scoreboard.baranhq.com"><img src="public/wordmark.png" alt="Baran's Scoreboard" width="360"></a>
</p>

# Baran's Scoreboard

Skor tabelaları, sıralamalar ve turnuva şemaları için ücretsiz, açık kaynaklı bir platform. Hesap gerekmez; veriler tarayıcınızda kalır.

[Baran's Scoreboard uygulamasını aç](https://scoreboard.baranhq.com) · [English](README.md) · [Български](README.bg.md) · [Türkçe](README.tr.md)

- En fazla 100 satır ve 10 sütunlu sıralamalar; 2–64 katılımcılı, bay geçişli ve kazanan ilerletmeli turnuva şemaları.
- Yeni araçlarda PNG, JSON yedekleri ve yerel kayıt. Ayrılmadan önce Kaydet seçeneğini kullanın; sıralamalar ve şemalar otomatik kaydedilmez.
- Birden fazla takım, otomatik yerel kayıt ve JSON yedekleri.
- Geri sayım, kronometre, maç devreleri ve molalar.
- Sınıf ekranı veya projektör için tam ekran görünüm.
- Türkçe, Bulgarca ve Britanya İngilizcesi arayüz.
- Orijinal kod MIT Lisanslıdır; bağımlılık bildirimleri [LICENSES.md](LICENSES.md) dosyasındadır.

## Başlangıç

Node.js 24 LTS (veya 22.18 ve üzeri uyumlu bir sürüm) ile npm gerekir.

```sh
git clone https://github.com/baranhq/scoreboard.git
cd scoreboard
npm ci
npm run dev
```

[localhost:3000](http://localhost:3000) adresini açın. Oyun verileri bulut hesabına değil, tarayıcının IndexedDB alanına kaydedilir.

## Kendi sunucunuzda barındırma

Uygulamayı yalnızca evinizde veya özel bir sunucuda çalıştırabilirsiniz; alan adı satın almanız ya da herkese açmanız gerekmez. Docker Compose, ev ağından erişim, yedekleme ve paylaşımlı hosting adımları [self-hosting rehberinde](SELF_HOSTING.md) ve [kurulum belgesinde](docs/DEPLOYMENT.md) yer alır. Projede varsayılan yönetici parolası bulunmaz.

[GitHub kaynak kodu](https://github.com/baranhq/scoreboard) · [MIT Lisansı](LICENSE) · [Gizlilik](https://scoreboard.baranhq.com/tr/gizlilik/)
