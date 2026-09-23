# Публикация в Obsidian Community Plugins

id плагина: **`djvu-viewer`** — на момент выпуска 1.0.5 в каталоге
(7984 плагинов) не занят, плагинов с «djvu» нет вообще.

## 0. Однократно: заполнить автора

Заполнено для выпуска 1.0.5: `"author": "chybypelniy"`,
`"authorUrl": "https://github.com/chybypelniy"`.

## 1. Репозиторий

```bash
git init && git add -A && git commit -m "DjVu Viewer 1.0.5"
git branch -M main
git remote add origin https://github.com/chybypelniy/obsidian-djvu-reader.git
git push -u origin main
```

В репозитории должны лежать: `manifest.json`, `versions.json`, `styles.css`,
исходники и `.github/workflows/release.yml` (уже есть).

## 2. Релиз (= установка из магазина)

```bash
git tag 1.0.5
git push origin 1.0.5
```

Workflow сам соберёт плагин, **проверит согласованность версий**
(package.json = manifest = dist-манифест = тег = ключ versions.json)
и создаст GitHub-release с четырьмя ассетами:
`main.js`, `manifest.json`, `styles.css`, `versions.json` — именно так магазин
их и ожидает (имена файлов важны).

Правила версий на будущее:

| Где | Что обновлять при релизе |
| --- | --- |
| `package.json` | `version` |
| `manifest.json` | `version` (та же, что тег) |
| `versions.json` | добавить `"<версия>": "<minAppVersion>"` |
| тег git | `X.Y.Z` без префикса `v` |
| `CHANGELOG.md` | секция `## X.Y.Z` |

`npm run build` сам синхронизирует `dist/manifest.json` и `dist/versions.json`
из `package.json`/`versions.json`, так что рассинхрон возможен только в тегах.

## 3. Заявка в каталог

1. Форкните <https://github.com/obsidianmd/obsidian-releases>.
2. В `community-plugins.json` добавьте объект (в конец массива, запятые соблюсти):

```json
{
    "id": "djvu-viewer",
    "name": "DjVu Viewer",
    "author": "chybypelniy",
    "description": "Open and read .djvu/.djv files right inside Obsidian — continuous scroll or page-by-page, with contents, thumbnails, rotation and reading position memory. Fully offline.",
    "repo": "chybypelniy/obsidian-djvu-reader"
}
```

   Описание для магазина — на английском (требование каталога), в манифесте можно держать русское.
3. Pull request → дождаться проверки (бот проверит манифест релиза и доступность ассетов).
4. После merge плагин появится в «Настройки → Сторонние плагины» у всех через ~15 минут.

## 4. Чек-лист перед PR

- [ ] `author`/`authorUrl` в manifest.json — ваши;
- [ ] тег `1.0.5` создан, релиз содержит 4 ассета с именами без папок;
- [ ] версия в манифесте релиза = тегу;
- [ ] `minAppVersion` = 1.5.0 (все используемые API существуют с 1.5);
- [ ] `isDesktopOnly: true` (воркер + canvas, мобильная платформа не поддерживается);
- [ ] в релизных ассетах нет ничего лишнего (магазин игнорирует, но чище);
- [ ] README/CHANGELOG не обещают функций, которых нет.

## 5. Обновления плагина в магазине

Поднять версию в трёх файлах + тег → workflow сделает релиз → магазин
подтянет его сам по `versions.json` (для старых версий Obsidian указываете
minAppVersion в этой карте). Заявку пере-подавать не нужно.
