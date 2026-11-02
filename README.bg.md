<p align="center">
  <a href="https://scoreboard.baranhq.com"><img src="public/wordmark.png" alt="Baran's Scoreboard" width="360"></a>
</p>

# Baran's Scoreboard

Безплатно табло за резултати с отворен код за класни игри, отбори и състезания. Променяйте точките, настройвайте имената и цветовете на отборите, използвайте вградения таймер и показвайте резултатите на цял екран. Не е необходим профил. Игрите се запазват в браузъра.

[Отвори Baran's Scoreboard](https://scoreboard.baranhq.com) · [English](README.md) · [Български](README.bg.md) · [Türkçe](README.tr.md)

- Няколко отбора, автоматично локално запазване и JSON архиви.
- Обратно броене, хронометър, части на мача и почивки.
- Изглед на цял екран за класна стая или проектор.
- Интерфейс на български, турски и британски английски.
- MIT лиценз за оригиналния код; известията за зависимости са в [LICENSES.md](LICENSES.md).

## Стартиране

Необходими са Node.js 24 LTS (или съвместима версия поне 22.18) и npm.

```sh
git clone https://github.com/baranhq/scoreboard.git
cd scoreboard
npm ci
npm run dev
```

Отворете [localhost:3000](http://localhost:3000). Данните на игрите се съхраняват локално в IndexedDB на браузъра, а не в облачен профил.

## Самостоятелно хостване

Подробните инструкции за споделен хостинг и cPanel, Docker Compose, PHP/MySQL администрация, HTTPS, резервни копия и актуализации са в английския [раздел за самостоятелно хостване](README.md#self-hosting) и [ръководството за внедряване](docs/DEPLOYMENT.md). Настройте собствен домейн и частни данни за достъп; в проекта няма готова администраторска парола.

[Изходен код в GitHub](https://github.com/baranhq/scoreboard) · [Лиценз MIT](LICENSE) · [Поверителност](https://scoreboard.baranhq.com/bg/poveritelnost/)
