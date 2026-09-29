# -*- coding: utf-8 -*-
"""Ders derleyici: MASTER v9.3 kopyası + ders kaynakları → tek dosya HTML.

Kullanım:
  python3 scripts/derle.py DON-201 1

Kaynak klasörü: kaynak/<KOD>/H<NN>/
  ders.json      {"modeller": ["M-..."]}  (derse gömülecek DON3D modelleri)
  lesson.js      const LESSON = {...}; const SLIDE_LABELS = [...];  (MASTER'daki örnek blok yerine)
  kapak.html     kapak görseli (MASTER'daki cover-svg bloğu yerine)
  slaytlar.html  içerik slaytları (Kazanımlar ile Quiz arasına)
  ders.css       derse özel stil
  ders.js        derse özel betik (MASTER açılışından sonra çalışır)
  <!--@dahil:dosya--> işaretçisi aynı klasördeki dosyanın içeriğiyle değiştirilir.

Çıktı: icerik/<KOD>/<KOD>-H<NN>.html
MASTER (templates/MASTER-v9_3.html) salt okunurdur; yalnız kopyası işlenir.
Not: f-string kullanılmaz (üretim standardı).
"""
import json
import os
import re
import sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASTER = os.path.join(KOK, "templates", "MASTER-v9_3.html")
DON3D = os.path.join(KOK, "bilesenler", "DON3D")
THREE_JS = os.path.join(KOK, "node_modules", "three", "build", "three.min.js")


def oku(yol):
    with open(yol, encoding="utf-8") as f:
        return f.read()


def dahil_et(metin, klasor):
    def bul(m):
        return oku(os.path.join(klasor, m.group(1).strip())).strip()
    onceki = None
    while onceki != metin:
        onceki = metin
        metin = re.sub(r"<!--@dahil:([^>]+?)-->", bul, metin)
    return metin


def script_guvenli(js):
    return js.replace("</script", "<\\/script")


def degistir(metin, eski, yeni, aciklama):
    if eski not in metin:
        raise SystemExit("HATA: MASTER'da beklenen blok bulunamadı: " + aciklama)
    return metin.replace(eski, yeni, 1)


def bolge_degistir(metin, bas, son, yeni, aciklama, sonu_koru=True):
    i = metin.find(bas)
    j = metin.find(son, i + len(bas)) if i >= 0 else -1
    if i < 0 or j < 0:
        raise SystemExit("HATA: MASTER'da beklenen bölge bulunamadı: " + aciklama)
    return metin[:i] + yeni + (metin[j:] if sonu_koru else metin[j + len(son):])


def modeller_ve_bagimliliklar(kodlar):
    """Model dosyalarındaki 'bagimli: M-A, M-B' başlık satırından bağımlılıkları çözer."""
    sonuc = []

    def ekle(kod):
        if kod in sonuc:
            return
        yol = os.path.join(DON3D, "modeller", kod + ".js")
        if not os.path.exists(yol):
            raise SystemExit("HATA: model dosyası yok: " + yol)
        m = re.search(r"bagimli:\s*([^\n*]+)", oku(yol)[:600])
        if m:
            for b in [x.strip() for x in m.group(1).split(",") if x.strip()]:
                ekle(b)
        sonuc.append(kod)

    for k in kodlar:
        ekle(k)
    return sonuc


def derle(kod, hafta):
    hh = "H" + str(hafta).zfill(2)
    klasor = os.path.join(KOK, "kaynak", kod, hh)
    if not os.path.isdir(klasor):
        raise SystemExit("HATA: kaynak klasörü yok: " + klasor)
    meta = json.loads(oku(os.path.join(klasor, "ders.json")))
    html = oku(MASTER)

    lesson_js = dahil_et(oku(os.path.join(klasor, "lesson.js")), klasor).strip()
    kapak = dahil_et(oku(os.path.join(klasor, "kapak.html")), klasor).strip()
    slaytlar = dahil_et(oku(os.path.join(klasor, "slaytlar.html")), klasor).rstrip()
    ders_css = oku(os.path.join(klasor, "ders.css"))
    ders_js = dahil_et(oku(os.path.join(klasor, "ders.js")), klasor)

    baslik = re.search(r"title:\s*'([^']*)'", lesson_js)
    if baslik:
        html = re.sub(r"<title>[^<]*</title>", "<title>" + baslik.group(1) + "</title>", html, count=1)

    # 1) Kapak görseli
    html = bolge_degistir(html, '<div class="cover-svg" id="s1-cover-svg">', '<div class="cover-info">',
                          kapak + "\n        </div>\n        ", "kapak (cover-svg)")

    # 2) İçerik slaytları: Quiz slaytından hemen önce
    html = degistir(html, "  <!-- ══════════════════════ S-QUIZ ══════════════════════ -->",
                    slaytlar + "\n\n  <!-- ══════════════════════ S-QUIZ ══════════════════════ -->",
                    "S-QUIZ işaretçisi")

    # 3) LESSON + SLIDE_LABELS
    html = bolge_degistir(html, "const LESSON = {", "const TOTAL", lesson_js + "\n\n", "LESSON bloğu")

    # 4) Stil: DON3D + ders
    stil = ("<style data-don3d>\n" + oku(os.path.join(DON3D, "don3d.css")) + "</style>\n"
            "<style data-ders>\n" + ders_css + "</style>\n")
    html = degistir(html, "</head>", stil + "</head>", "</head>")

    # 5) Kütüphaneler (satır içi, CDN yok) + ders betiği
    modeller = modeller_ve_bagimliliklar(meta.get("modeller", []))
    don3d_js = "\n".join([oku(os.path.join(DON3D, "don3d.js")),
                          oku(os.path.join(DON3D, "don3d-anim.js")),
                          oku(os.path.join(DON3D, "don3d-etkilesim.js"))] +
                         [oku(os.path.join(DON3D, "modeller", m + ".js")) for m in modeller])
    ek = ('<script data-kutuphane="three">' + script_guvenli(oku(THREE_JS)) + "</script>\n"
          '<script data-kutuphane="don3d">\n' + script_guvenli(don3d_js) + "</script>\n"
          "<script data-ders>\n" + script_guvenli(ders_js) + "</script>\n")
    son = html.rfind("</body>")
    html = html[:son] + ek + html[son:]

    cikti_klasor = os.path.join(KOK, "icerik", kod)
    os.makedirs(cikti_klasor, exist_ok=True)
    cikti = os.path.join(cikti_klasor, kod + "-" + hh + ".html")
    with open(cikti, "w", encoding="utf-8") as f:
        f.write(html)
    print("Yazıldı: " + os.path.relpath(cikti, KOK) + " (" + str(os.path.getsize(cikti) // 1024) + " KB, modeller: " +
          ", ".join(modeller) + ")")
    return cikti


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(2)
    derle(sys.argv[1], int(sys.argv[2]))
