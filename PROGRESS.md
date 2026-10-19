# Гонка за сотыми — прогресс (урок 81 «Десятичные дроби»)
Возобновляемая сборка. Каждая сессия: читать этот файл, продолжать с первого незакрытого пункта.
Сервер для тестов: `python3 -m http.server 18681` в корне репо. Тесты: `/workspace/venvs/pw/bin/python tools/test_touch.py` (VPS=, ZS=).
- [x] репо, refs (heroes_v1, villain_v1 — утверждены)
- [x] арт: позы героев, фоны, UI, реквизит зон, картинги (refs/*.jpg)
- [x] нарезка birefnet / color-key (tools/cut.py, кнопки — color-key, рамки — fill holes)
- [x] движок (js/core.js), титул, вступление, карта, финал (js/scenes.js)
- [x] зоны 1-5 написаны (js/z1..z5.js), секреты
- [ ] голос: tools/voicegen.py запущен (Qwen 1.7B CPU, ~2 мин/реплика); перезапуск продолжает с места
- [x] test_touch z1 (844) проходит; z2 почти (мёд заменён на 34,5)
- [ ] test_touch все зоны × 3 размера, text audit, ground audit, rotate
- [ ] иконки, публикация Pages, live-check
