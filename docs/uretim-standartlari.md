# Üretim Standartları (v9.3) — Pazarlıksız Kurallar

## Kaydırma (scroll) yasağı

- 7 görünüm alanının hiçbirinde kaydırma olmayacak: 1106×652, 1660×964, 1020×684, 1280×650, 1380×650, 1366×720, 1200×720.
- İki katmanlı taşma testi zorunlu (`scripts/scroll_test.js`):
  - (a) Layout alt öğesi: `child.getBoundingClientRect().bottom - layoutRect.bottom > 4` → hata
  - (b) İç öğe: `scrollHeight - clientHeight > 4` → hata. Özellikle `.code-body` (`overflow:hidden` sessizce keser).
- Test sırasında `fitSlideContent` devre dışı.
- Tıklamayla büyüyen dinamik içerik (sonuç tablosu, kod çıktısı, simülatör çıktısı) için tıklama sonrası test zorunlu. Çözüm: dinamik kapsayıcıya `max-height: clamp(...)` + `overflow-y: auto`.

## Font tavanları (içerik CSS'inde; MASTER'a dokunmadan)

Ortaokul:
```css
--f-base:  clamp(13px, 0.45vw + 11px, 19px);
--f-title: clamp(17px, 0.7vw + 13px, 26px);
--f-sh:    clamp(14px, 0.55vw + 12px, 22px);
--f-sub:   clamp(12px, 0.4vw + 10px, 18px);
```

Lise (`body.grade-lise` override): `--f-base` en çok 18px, `--f-title` 23px, `--f-sh` 21px, `--f-sub` 17px, `.code-body` 16px.

## CSS

- `clamp()` içindeki `+`/`-` işlecinin iki yanında **boşluk zorunlu**: `clamp(32px, 0.9vw + 26px, 52px)`. Boşluksuz hali grid/flex'i sessizce bozar.
- `step-tip` flex olduğundan: emoji ilk `<span>`, geri kalan tüm metin (`<strong>` dahil) ikinci `<span>` içinde.
- `.tab-panel` **yasak** — her kavram ayrı slayt, "Kavram N / Y" rozeti.
- `layout-twocol` içerik slaytlarında **yasak** — `layout-full` + `cols2`/`cols3` grid.
- Tüm kod örnekleri `.code-block` koyu tema: koyu arka plan, pencere noktaları, dosya adı, renkli sözdizimi (`.tg .kw .fn .nm .at .st .cm`).

## İçerik

- Yasak kelimeler (tüm kademeler): sihir/sihirli/sihirbaz, büyü/büyücü/büyücülük, peri/periler. Her derlemeden sonra `validate.py` ile taranır.
- "kurs" değil **"ders"**.
- `LESSON.category` alanı **bulunmayacak**.
- HTML varlık kuralı: `LESSON.goals`, `LESSON.sections`, `SLIDE_LABELS`, quiz `q`/`opts`, `sh-title`/`step-title` içinde HTML'e benzeyen ifadeler (`<ul>`, `List<T>`) `&lt;` / `&gt;` ile yazılır (innerHTML ile işlenir). İstisna: `code-frame` içeriği ve quiz `fb` (textContent).
- `SLIDE_LABELS` numara önekli: "1. Kapak", "2. Hedefler"…
- Quiz doğru cevap dağılımı: A/B/C/D dengeli, dördü de görünür, üç ardışık aynı yok. Kanonik dizilim A/C/B/D (indeks 0, 2, 1, 3). Beşinci soru varsa bu kuralı bozmayacak şekilde.
- Cisco komutları, IP adresleri, port numaraları, dosya yolları `<code>` / kod bloğu içinde.

## SVG / Canvas

- Ortaokul içerik slaytları: `viewBox="0 0 360 240"` sahne; gradyan arka plan, katmanlı sahne, karakter detayı, sahne içi rozetler, sabit hex renk. Düz kutu yığını ve bağlamsız metin yok.
- Canvas'ta ve SVG sahnelerinde yasak emoji: ✨ 🤖 🧠 🪄 🔮 — gerekiyorsa şekli programatik çiz.
- Canvas strict mode: `var a = b = x` hata verir; ayrı ayrı tanımla.
- `fillText` içinde emoji yok; derleme sonrası 0px font kalıntısı kontrolü.

## Derleme (build) kuralları

- Python derleme scriptlerinde f-string yerine düz birleştirme (iç içe tırnak hatalarını önler).
- JS string içinde kesme işareti `\'`.
- Tüm `<script>` blokları: `node -e "new Function(src)"` ile sözdizimi kontrolü.
- HTML etiket dengesi: Python `HTMLParser`.
- Tek dosya: harici CSS/JS/görsel yok; her şey satır içi, görseller base64.

## Pedagojik kurallar

- **Kazanım uyumu:** Hedefler slaytı JSON kazanımlarını öğrenci diliyle verir. Her kazanımın en az bir kavram slaytı, bir etkinlik ve bir quiz sorusu karşılığı olur.
- **Bilişsel yük:** Bir derste en çok 5 (ortaokul) / 7 (lise) yeni kavram. Bir slaytta tek ana fikir.
- **Quiz:** En az bir soru senaryo/uygulama düzeyinde olur ("Bu ağda Emir neden internete çıkamıyor?"). Yalnızca tanım soran quiz kabul edilmez. Çeldiriciler bilinen kavram yanılgılarından seçilir.
- **Dil:** Ortaokulda cümle ≤ 15 kelime; terim ilk geçişte benzetmeyle verilir. Lisede terim + Türkçe karşılık.
- **Terim kartı:** İngilizce teknik terimler (SSD, NVMe, UEFI, POST…) ilk geçtiğinde Türkçe açıklamasıyla verilir; DON-301'de her derste EN → TR terim kartı slaytı bulunur.
- **Tahmin et → izle:** Animasyonların çoğu önce bir tahmin sorusuyla açılır ("Soğutucuyu kaldırırsak ne olur?"), sonra oynatılır.
- **Erişilebilirlik:** Renk tek başına bilgi taşımaz (kablo dizilimi, VLAN, doğru/yanlış geri bildirimi). Numara, etiket veya simge eşlik eder. Metin–arka plan kontrastı yüksek tutulur.
- **Kapsayıcılık:** Karakterler ve örnek isimler cinsiyet dengeli. 
- **Cihaz varsayımı:** Öğrenci telefonuna dayanan etkinlik yok. Sosyal medya hesabı varsayılmaz.
- **Güvenlik mesajı (ortaokul):** Her güvenlik dersinde "güvendiğin bir yetişkine söyle" davranışı yer alır.

## Ortaokul yaş aralığı (10–15)

Ortaokul dersleri **tek HTML** ile 10–15 yaşa hizmet eder.

- **Çekirdek içerik** alt banda (10–12) göre yazılır: kısa cümle, somut benzetme, adım adım.
- **"Derinleş" slaytı** her ortaokul dersinde zorunludur ve özetten hemen önce gelir. İçeriği JSON'daki `derinles` alanıdır. Üst bant (13–15) ve hızlı öğrenciler içindir.
  - Başlık rozeti: "Derinleş".
  - Görsel olarak isteğe bağlı olduğu belli olur.
  - Öğretmen atlasa bile ders akışı bozulmaz.
- Quizde 4 çekirdek soru ve Derinleş'ten 1 bonus soru bulunur. Bonus soru puanı düşürmez.
- **Görsel dil yaş-nötr olur.**
  - Karakterler 12–13 yaş görünümündedir.
  - Bebeksi oranlar, oyuncak/pastel ilkokul estetiği ve "sevimli maskot" kullanılmaz.
  - Sahneler gerçekçi okul/ev/şehir ortamıdır.
- **Hitap saygılı "sen" dilidir.** "Çocuklar", "minik dostlar", "yavrum" kullanılmaz. `validate.py` bunları uyarı olarak işaretler.
- **Örnekler iki bandı da kapsar.** Oyun, okul, aile ve spor örnekleri kullanılır. Sosyal medya örnekleri yalnızca Derinleş katmanında yer alır (13+ platform yaş sınırı).

## Görsel zenginlik

Görsel kurallar `docs/gorsel-3d-standartlari.md` dosyasındadır ve bu belge kadar bağlayıcıdır. DON-201'de yalnız metin içeren içerik slaytı yasaktır.
