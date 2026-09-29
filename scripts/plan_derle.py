# -*- coding: utf-8 -*-
"""Öğretmen planı derleyici (Format K) → HTML + PDF.

Kullanım:
  python3 scripts/plan_derle.py DON-201 1

Kaynaklar (tek doğruluk kaynağı korunur):
  mufredat/mufredat.json          ders adı, öğrenme alanı, ünite, kazanımlar (K1–K4), adımlar
  kaynak/<KOD>/H<NN>/lesson.js    Bilgi Testi soruları (öğrenci dersiyle aynı), slayt etiketleri
  kaynak/<KOD>/H<NN>/plan.json    öğretmen konuşmaları, işleniş notları, ödev, notlar

Çıktı: ogretmen-plani/<KOD>/<KOD>-H<NN>.html ve .pdf (WeasyPrint, A4)
Biçim: referans/ogretmen-plani/FORMAT-K_elektronik-203-h04.pdf taklit edilir.
Not: f-string kullanılmaz (üretim standardı).
"""
import html
import json
import os
import re
import subprocess
import sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(KOK, "scripts"))
from derle import dahil_et, oku  # noqa: E402

LETTERS = ["A", "B", "C", "D"]


def e(t):
    return html.escape(str(t), quote=False)


def konusma(t):
    """Tırnak içindeki öğretmen konuşmalarını vurgular (metin önce kaçışlanır)."""
    t = e(t)
    return re.sub(r"&quot;|\"([^\"]+)\"", lambda m: "<q>" + m.group(1) + "</q>" if m.group(1) else m.group(0), t)


def lesson_oku(klasor):
    js = dahil_et(oku(os.path.join(klasor, "lesson.js")), klasor)
    kod = js + "\nprocess.stdout.write(JSON.stringify({LESSON: LESSON, SLIDE_LABELS: SLIDE_LABELS}));"
    r = subprocess.run(["node", "-e", kod], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def soru_parcala(q):
    gorsel = ""
    m = re.search(r'<span class="q-gorsel">([\s\S]*?)</span>', q)
    if m:
        gorsel = m.group(1)
        q = q.replace(m.group(0), "")
    return re.sub(r"<[^>]+>", "", q).strip(), gorsel


CSS = """
@font-face{font-family:'Carlito';src:local('Carlito'),url('../../assets/font/Carlito-Regular.ttf');font-weight:400;font-style:normal}
@font-face{font-family:'Carlito';src:local('Carlito Bold'),url('../../assets/font/Carlito-Bold.ttf');font-weight:700;font-style:normal}
@font-face{font-family:'Carlito';src:local('Carlito Italic'),url('../../assets/font/Carlito-Italic.ttf');font-weight:400;font-style:italic}
@page{size:A4;margin:14mm 14mm 16mm 16.5mm;
  @bottom-center{content:'Bilişim Üssü · Etkileşimli Ders Planı · ' counter(page) ' / ' counter(pages);font-family:Carlito,Calibri,sans-serif;font-size:7.5pt;color:#6b7a82}}
*{box-sizing:border-box}
html{font-family:Carlito,Calibri,'Segoe UI',Arial,sans-serif;font-size:9.9pt;color:#1a1a1a;line-height:1.38}
body{margin:0;max-width:180mm}
@media screen{body{margin:24px auto;padding:0 12px}}
.bant{display:flex;gap:7pt;margin-bottom:9pt}
.bant-sol{flex:1;background:linear-gradient(135deg,#075985,#0a6aa3);color:#fff;border-radius:4pt;padding:9pt 14pt 10pt}
.bant-ust{font-size:7.6pt;font-weight:700;letter-spacing:2.2pt;opacity:.92}
.bant-baslik{font-size:23pt;font-weight:700;line-height:1.12;margin-top:3pt}
.bant-baslik.uzun{font-size:18pt}
.bant-sag{width:128pt;background:#0369a1;color:#fff;border-radius:4pt;display:flex;align-items:center;justify-content:center;font-size:14pt;font-weight:700}
h2{background:#0369a1;color:#fff;font-size:11pt;font-weight:700;margin:12pt 0 6pt;padding:5pt 10pt;border-radius:4pt;letter-spacing:.2pt;break-after:avoid}
h3{display:flex;justify-content:space-between;align-items:center;color:#0369a1;font-size:10.6pt;margin:9pt 0 4pt;break-after:avoid}
h3 .sure{background:#0369a1;color:#fff;font-size:8.6pt;border-radius:9pt;padding:1.5pt 8pt}
table{width:100%;border-collapse:collapse;margin:0 0 4pt}
td,th{border:1px solid #b9def1;padding:4pt 7pt;vertical-align:top;text-align:left}
th{background:#e0f2fe;color:#075985;font-size:9.2pt;font-weight:700}
tr{break-inside:avoid}
.genel td:first-child{width:134pt;background:#e0f2fe;color:#075985;font-weight:700}
.kazanim{width:100%;border-collapse:collapse}
.kazanim td{border:0;border-bottom:1px solid #eaf6fc;padding:3.5pt 4pt}
.kazanim td:first-child{width:32pt;color:#0369a1;font-weight:700}
.isleyis td:first-child{width:35pt;text-align:center;color:#6b7a82;font-weight:700}
.isleyis td:nth-child(2){width:122pt}
.adim-ad{font-weight:700}
.adim-konu{color:#475569}
.slayt{display:inline-block;margin-top:2pt;font-size:8pt;font-weight:700;color:#0369a1;background:#e0f2fe;border-radius:6pt;padding:0 5pt}
q{quotes:'“' '”'}
q::before{content:open-quote}q::after{content:close-quote}
p{margin:3pt 0 5pt;text-align:justify}
.kutu{border:1px solid #b9def1;border-left:3pt solid #0369a1;border-radius:3pt;padding:5pt 8pt;margin:5pt 0;background:#f5fbff;break-inside:avoid}
.kutu b{color:#075985}
.olcme td:first-child{width:22pt;text-align:center;font-weight:700}
.olcme td:last-child{width:40pt;text-align:center;color:#0369a1;font-weight:700}
.soru{font-weight:700}
.secenek{margin-top:1pt}
.aciklama{font-style:italic;color:#0369a1;font-size:9.5pt;margin-top:2pt}
.soru-gorsel{float:right;margin:0 0 2pt 8pt}
.soru-gorsel svg{height:38pt;width:auto}
.anahtar{font-weight:700;color:#075985;margin:3pt 0 0}
.anahtar span{font-weight:400;color:#1a1a1a}
ol.acik{margin:2pt 0;padding-left:0;list-style:none;counter-reset:a}
ol.acik li{counter-increment:a;display:flex;gap:10pt;padding:3pt 0}
ol.acik li::before{content:counter(a) '.';color:#0369a1;font-weight:700;min-width:16pt}
.etiket{color:#0369a1;font-weight:700;margin:7pt 0 2pt}
ul.not{margin:2pt 0;padding-left:12pt}
ul.not li{margin:2pt 0}
.sure-tablo td:last-child,.sure-tablo th:last-child{width:62pt}
.imza{display:flex;justify-content:space-around;margin-top:14pt;text-align:center;color:#6b7a82;break-inside:avoid}
.imza b{display:block;color:#475569;margin-bottom:10pt}
"""


def plan_html(kod, hafta):
    hh = "H" + str(hafta).zfill(2)
    klasor = os.path.join(KOK, "kaynak", kod, hh)
    muf = json.loads(oku(os.path.join(KOK, "mufredat", "mufredat.json")))
    ders = [d for d in muf["dersler"] if d["kod"] == kod][0]
    h = [x for x in ders["haftalar"] if x["hafta"] == hafta][0]
    unite = [u for u in ders["uniteler"] if hafta in u["haftalar"]][0]
    plan = json.loads(oku(os.path.join(klasor, "plan.json")))
    les = lesson_oku(klasor)
    quiz = les["LESSON"]["quiz"][:4]
    if len(h["adimlar"]) != len(plan["gelisme"]):
        raise SystemExit("HATA: plan.json gelisme satırı sayısı JSON adımlarıyla eşleşmiyor")
    kademe = "Ortaokul (" + ders["sinif"] + ". sınıf)" if ders["kademe"] == "ortaokul" else "Lise (" + ders["sinif"] + ". sınıf)"
    s = []
    s.append('<!DOCTYPE html>\n<html lang="tr">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n')
    s.append("<title>" + e(kod + " " + hh + " Öğretmen Planı — " + h["baslik"]) + "</title>\n<style>" + CSS + "</style>\n</head>\n<body>\n")
    s.append('<div class="bant"><div class="bant-sol"><div class="bant-ust">ÖĞRETMEN DERS PLANI · ' + e(kod) + '</div>'
             '<div class="bant-baslik' + (' uzun' if len(h["baslik"]) > 30 else '') + '">' + e(h["baslik"]) + '</div></div>'
             '<div class="bant-sag">' + str(hafta) + '. Hafta</div></div>\n')

    s.append("<h2>1. GENEL BİLGİLER</h2>\n<table class=\"genel\">\n")
    satirlar = [
        ("Dersin Adı", ders["ders_adi_plan"]),
        ("Sınıf / Seviye", kademe),
        ("Ünite / Konu", ders["lms_adi"] + " - " + unite["ad"] + " — " + h["baslik"]),
        ("Öğrenme Alanı", ders["ogrenme_alani"]),
        ("Süre", "1 ders saati (" + str(muf["ders_suresi_dk"]) + " dk)"),
        ("Yöntem ve Teknikler", plan["yontem"]),
        ("Araç-Gereç ve Kaynaklar", plan["arac"] + ((", " + h["materyal"]) if h.get("materyal") else "")),
        ("Kavramlar / Terimler", ", ".join(h["adimlar"])),
    ]
    for a, b in satirlar:
        s.append("<tr><td>" + e(a) + "</td><td>" + e(b) + "</td></tr>\n")
    s.append("</table>\n")

    s.append("<h2>2. KAZANIMLAR</h2>\n<table class=\"kazanim\">\n")
    for i, k in enumerate(h["kazanimlar"]):
        s.append("<tr><td>K" + str(i + 1) + ".</td><td>" + e(k) + "</td></tr>\n")
    s.append("</table>\n")

    sure = dict((x[0].split(" — ")[0], x[1]) for x in plan["sureler"])
    s.append("<h2>3. DERS İŞLENİŞİ</h2>\n")
    s.append('<h3><span>Giriş — Dikkat Çekme ve Güdüleme</span><span class="sure">' + str(sure["Giriş"]) + " dk</span></h3>\n")
    s.append("<p>" + konusma(plan["giris"]) + "</p>\n")
    s.append('<h3><span>Gelişme — Kavramların İşlenişi</span><span class="sure">' + str(sure["Gelişme"]) + " dk</span></h3>\n")
    s.append('<table class="isleyis"><thead><tr><th>Adım</th><th>Konu</th><th>Öğretmen Notu</th></tr></thead>\n')
    for i, g in enumerate(plan["gelisme"]):
        s.append("<tr><td>" + str(i + 1) + "</td><td><div class=\"adim-ad\">" + e(h["adimlar"][i]) + "</div>"
                 "<div class=\"adim-konu\">" + e(g["konu"]) + "</div><span class=\"slayt\">Slayt " + str(g["slayt"]) + "</span></td>"
                 "<td>" + konusma(g["not"]) + "</td></tr>\n")
    s.append("</table>\n")
    s.append('<div class="kutu"><b>Etkinlikler (Slayt 10–11):</b> ' + konusma(plan["etkinlik"]) + "</div>\n")
    s.append('<h3><span>Değerlendirme ve Kapanış</span><span class="sure">' + str(sure["Değerlendirme ve Kapanış"]) + " dk</span></h3>\n")
    s.append("<p>" + konusma(plan["kapanis"]) + "</p>\n")

    s.append("<h2>4. ÖLÇME VE DEĞERLENDİRME</h2>\n")
    s.append('<table class="olcme"><thead><tr><th>#</th><th>Soru ve Seçenekler</th><th>Cevap</th></tr></thead>\n')
    anahtar = []
    for i, q in enumerate(quiz):
        metin, gorsel = soru_parcala(q["q"])
        dogru = LETTERS[q["correct"]]
        anahtar.append(str(i + 1) + "-" + dogru)
        s.append("<tr><td>" + str(i + 1) + "</td><td>" + ('<div class="soru-gorsel">' + gorsel + "</div>" if gorsel else "") +
                 '<div class="soru">' + e(metin) + '</div><div class="secenek">' +
                 " ".join(LETTERS[j] + ") " + e(o) for j, o in enumerate(q["opts"])) + '</div>'
                 '<div class="aciklama">' + e(q["fb"]) + "</div></td><td>" + dogru + "</td></tr>\n")
    s.append("</table>\n<p class=\"anahtar\">Cevap Anahtarı: <span>" + " ".join(anahtar) + "</span></p>\n")

    s.append("<h2>5. AÇIK UÇLU / BİÇİMLENDİRİCİ DEĞERLENDİRME</h2>\n<ol class=\"acik\">\n")
    for k in plan["acik_uclu"]:
        s.append("<li><span>«" + e(k) + "» kavramını kendi cümlelerinle açıkla ve günlük hayattan bir örnek ver.</span></li>\n")
    s.append("<li><span>" + e(plan["oz_degerlendirme"]) + "</span></li>\n</ol>\n")

    s.append("<h2>6. ÖĞRETMEN NOTLARI VE ÖDEV</h2>\n")
    s.append('<div class="etiket">Ödev / Sınıf Dışı Etkinlik:</div><p>' + e(plan["odev"]) + "</p>\n")
    if h.get("guvenlik"):
        s.append('<div class="kutu"><b>Güvenlik:</b> ' + e(h["guvenlik"]) + "</div>\n")
    s.append('<div class="etiket">Öğretmen İçin Notlar:</div><ul class="not">\n')
    for n in plan["notlar"]:
        s.append("<li>" + konusma(n) + "</li>\n")
    s.append("</ul>\n")
    s.append('<table class="sure-tablo"><thead><tr><th>Aşama</th><th>Süre</th></tr></thead>\n')
    toplam = 0
    for a, d in plan["sureler"]:
        toplam += d
        s.append("<tr><td>" + e(a) + "</td><td>" + str(d) + " dk</td></tr>\n")
    s.append("<tr><th>Toplam</th><th>" + str(toplam) + " dk</th></tr>\n</table>\n")
    if toplam != muf["ders_suresi_dk"]:
        raise SystemExit("HATA: süre toplamı " + str(toplam) + " dk; " + str(muf["ders_suresi_dk"]) + " dk olmalı")
    s.append('<div class="imza"><div><b>Ders Öğretmeni</b>Ad Soyad / İmza</div><div><b>Uygundur</b>Okul Müdürü</div></div>\n')
    s.append("</body>\n</html>\n")
    return "".join(s)


def derle(kod, hafta):
    hh = "H" + str(hafta).zfill(2)
    klasor = os.path.join(KOK, "ogretmen-plani", kod)
    os.makedirs(klasor, exist_ok=True)
    yol = os.path.join(klasor, kod + "-" + hh + ".html")
    with open(yol, "w", encoding="utf-8") as f:
        f.write(plan_html(kod, hafta))
    pdf = yol[:-5] + ".pdf"
    from weasyprint import HTML
    HTML(filename=yol, base_url=klasor).write_pdf(pdf)
    print("Yazıldı: " + os.path.relpath(yol, KOK) + " ve " + os.path.relpath(pdf, KOK) +
          " (" + str(os.path.getsize(pdf) // 1024) + " KB)")
    return yol, pdf


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(2)
    derle(sys.argv[1], int(sys.argv[2]))
