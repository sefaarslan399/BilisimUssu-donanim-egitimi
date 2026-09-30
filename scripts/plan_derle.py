# -*- coding: utf-8 -*-
"""Öğretmen planı derleyici (Format K ve Format U) → HTML + PDF.

Kullanım:
  python3 scripts/plan_derle.py DON-201 1

Kaynaklar (tek doğruluk kaynağı korunur):
  mufredat/mufredat.json          ders adı, öğrenme alanı, ünite, kazanımlar (K1–K4), adımlar
  kaynak/<KOD>/H<NN>/lesson.js    Bilgi Testi soruları (öğrenci dersiyle aynı), slayt etiketleri
  kaynak/<KOD>/H<NN>/plan.json    öğretmen konuşmaları, işleniş notları, ödev, notlar

Çıktı: ogretmen-plani/<KOD>/<KOD>-H<NN>.html ve .pdf (WeasyPrint, A4)
Biçim: plan.json "format" alanına göre
  K → referans/ogretmen-plani/FORMAT-K_elektronik-203-h04.pdf
  U → referans/ogretmen-plani/FORMAT-U_PRJ-208-B4.pdf (ortaokul) taklit edilir.
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
    if os.path.exists(os.path.join(klasor, "ders.py")):
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import ders_uret
        ns = {}
        exec(compile(oku(os.path.join(klasor, "ders.py")), "ders.py", "exec"), ns)
        js = dahil_et(ders_uret.uret(ns)[0], klasor)
    else:
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
.imza{display:flex;justify-content:space-around;margin-top:14pt;text-align:center;color:#6b7a82;break-inside:avoid;break-before:avoid;page-break-before:avoid}
.sure-tablo{break-after:avoid;page-break-after:avoid}
.sure-tablo tr:last-child{break-after:avoid}
.uyg{display:grid;grid-template-columns:1fr 1fr;gap:3pt;margin-top:5pt}
.uyg div{border-radius:3pt;padding:3pt 6pt;font-size:9pt;line-height:1.32}
.uyg b{display:block;font-size:7.6pt;letter-spacing:.8pt}
.uyg .goster{background:#eff6ff;border-left:2.5pt solid #3b82f6}.uyg .goster b{color:#1d4ed8}
.uyg .sor{background:#f5f3ff;border-left:2.5pt solid #8b5cf6}.uyg .sor b{color:#6d28d9}
.uyg .kontrol{background:#ecfdf5;border-left:2.5pt solid #10b981}.uyg .kontrol b{color:#047857}
.uyg .sikhata{background:#fff7ed;border-left:2.5pt solid #f97316}.uyg .sikhata b{color:#c2410c}
.guvenlik{border:1.5pt solid #ef4444;border-radius:4pt;background:#fef2f2;padding:6pt 10pt;margin:6pt 0;break-inside:avoid}
.guvenlik b{color:#b91c1c;display:block;margin-bottom:2pt}
.guvenlik ul{margin:2pt 0;padding-left:13pt}
.imza b{display:block;color:#475569;margin-bottom:10pt}
"""


def uyg_kutular(u):
    """Format K+U: uygulama adımının GÖSTER / SOR / KONTROL / SIK HATA kutuları."""
    if not u:
        return ""
    return ('<div class="uyg"><div class="goster"><b>GÖSTER</b>' + konusma(u["goster"]) + '</div>'
            '<div class="sor"><b>SOR</b>' + konusma(u["sor"]) + '</div>'
            '<div class="kontrol"><b>✔ KONTROL</b>' + konusma(u["kontrol"]) + '</div>'
            '<div class="sikhata"><b>⚠ SIK HATA</b>' + konusma(u["sik_hata"]) + '</div></div>')


def plan_html(kod, hafta):
    hh = "H" + str(hafta).zfill(2)
    klasor = os.path.join(KOK, "kaynak", kod, hh)
    muf = json.loads(oku(os.path.join(KOK, "mufredat", "mufredat.json")))
    ders = [d for d in muf["dersler"] if d["kod"] == kod][0]
    h = [x for x in ders["haftalar"] if x["hafta"] == hafta][0]
    unite = [u for u in ders["uniteler"] if hafta in u["haftalar"]][0]
    plan = json.loads(oku(os.path.join(klasor, "plan.json")))
    les = lesson_oku(klasor)
    if plan.get("format", "K") == "U":
        return plan_u_html(kod, hafta, ders, h, unite, plan, les, muf)
    quiz = les["LESSON"]["quiz"][:4]
    if len(h["adimlar"]) != len(plan["gelisme"]):
        raise SystemExit("HATA: plan.json gelisme satırı sayısı JSON adımlarıyla eşleşmiyor")
    kademe = "Ortaokul (" + ders["sinif"] + ". sınıf)" if ders["kademe"] == "ortaokul" else "Lise (" + ders["sinif"] + ". sınıf)"
    s = []
    s.append('<!DOCTYPE html>\n<html lang="tr">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n')
    s.append("<title>" + e(kod + " " + hh + " Öğretmen Planı — " + h["baslik"]) + "</title>\n<style>" + CSS + "</style>\n</head>\n<body>\n")
    ku = plan.get("format") == "K+U"
    s.append('<div class="bant"><div class="bant-sol"><div class="bant-ust">ÖĞRETMEN DERS PLANI' + (' (KAVRAM + UYGULAMA)' if ku else '') + ' · ' + e(kod) + '</div>'
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

    if ku:
        # Format K+U: güvenlik kutusu zorunlu (JSON güvenlik + plana özgü maddeler)
        s.append('<div class="guvenlik"><b>GÜVENLİK (uygulama öncesi okunur)</b><ul>')
        gv = h.get("guvenlik") or ""
        gv = gv if isinstance(gv, list) else [x.strip() for x in gv.split(".") if x.strip()]
        for m in gv + plan.get("guvenlik_ek", []):
            s.append("<li>" + e(m.rstrip(".") + ".") + "</li>")
        s.append("</ul></div>\n")
    sure = dict((x[0].split(" — ")[0], x[1]) for x in plan["sureler"])
    s.append("<h2>3. DERS İŞLENİŞİ</h2>\n")
    s.append('<h3><span>Giriş — Dikkat Çekme ve Güdüleme</span><span class="sure">' + str(sure["Giriş"]) + " dk</span></h3>\n")
    s.append("<p>" + konusma(plan["giris"]) + "</p>\n")
    s.append('<h3><span>Gelişme — Kavramların İşlenişi</span><span class="sure">' + str(sure["Gelişme"]) + " dk</span></h3>\n")
    s.append('<table class="isleyis"><thead><tr><th>Adım</th><th>Konu</th><th>Öğretmen Notu</th></tr></thead>\n')
    for i, g in enumerate(plan["gelisme"]):
        s.append("<tr><td>" + str(i + 1) + "</td><td><div class=\"adim-ad\">" + e(h["adimlar"][i]) + "</div>"
                 "<div class=\"adim-konu\">" + e(g["konu"]) + "</div><span class=\"slayt\">Slayt " + str(g["slayt"]) + "</span></td>"
                 "<td>" + konusma(g["not"]) + uyg_kutular(g.get("uygulama")) + "</td></tr>\n")
    s.append("</table>\n")
    etk = [i + 1 for i, l in enumerate(les["SLIDE_LABELS"]) if "Etkinlik" in l]
    etk_metin = ("Slayt " + str(etk[0]) + ("–" + str(etk[-1]) if len(etk) > 1 else "")) if etk else "Slayt 10–11"
    s.append('<div class="kutu"><b>Etkinlikler (' + etk_metin + '):</b> ' + konusma(plan["etkinlik"]) + "</div>\n")
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
    if h.get("guvenlik") and not ku:
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


# ════════════════════ Format U (uygulama) ════════════════════
CSS_U = """
@page{size:A4;margin:15mm 15mm 16mm 15mm;
  @bottom-left{content:'Bilişim Üssü · Öğretmen Uygulama Planı';font-family:'DejaVu Sans',sans-serif;font-size:7pt;color:#94a3b8}
  @bottom-right{content:counter(page) ' / ' counter(pages);font-family:'DejaVu Sans',sans-serif;font-size:7pt;color:#94a3b8}}
*{box-sizing:border-box}
html{font-family:'DejaVu Sans',Verdana,sans-serif;font-size:8.6pt;color:#0f172a;line-height:1.5}
body{margin:0;max-width:180mm}
@media screen{body{margin:24px auto;padding:0 12px;background:#f8fafc}}
.ust-rozet{display:inline-block;border:1.5px solid #e2e8f0;border-radius:12pt;padding:2pt 9pt;font-size:7pt;font-weight:700;letter-spacing:.6pt}
h1{font-size:18pt;margin:6pt 0 3pt;color:#0f172a;line-height:1.2}
.alt-baslik{font-size:9.6pt;color:#334155;margin:0 0 7pt}
.rozetler{display:flex;flex-wrap:wrap;gap:5pt;padding-bottom:9pt;border-bottom:2.5pt solid #0ea5e9;margin-bottom:10pt}
.rozetler span{border:1px solid #e2e8f0;border-radius:10pt;padding:2pt 8pt;font-size:7.4pt;font-weight:700;background:#fff}
.rozetler span:first-child{color:#0369a1;border-color:#bae6fd}
.kart{background:#fff;border:1px solid #e2e8f0;border-radius:9pt;padding:11pt 13pt;margin:0 0 10pt}
.kart h2{display:flex;align-items:center;gap:8pt;font-size:12.5pt;color:#1e1b4b;margin:0 0 8pt;break-after:avoid}
.ikon{width:20pt;height:20pt;border-radius:5pt;background:linear-gradient(135deg,#0ea5e9,#0369a1);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
.ikon svg{width:12pt;height:12pt}
h3{font-size:9.6pt;color:#1e1b4b;margin:9pt 0 5pt;break-after:avoid}
p{margin:3pt 0 6pt}
.senaryo{background:linear-gradient(135deg,#f5f3ff,#eff6ff);border-left:3pt solid #7c3aed;border-radius:6pt;padding:8pt 11pt;margin-bottom:8pt}
.senaryo .etiket{font-size:7pt;font-weight:700;letter-spacing:1pt;color:#1e1b4b}
.senaryo p{margin:4pt 0}
table{width:100%;border-collapse:collapse;margin:2pt 0 6pt}
th{background:#eef2ff;color:#1e1b4b;font-weight:700;text-align:left;font-size:7.8pt}
td,th{padding:4pt 6pt;border-bottom:1px solid #e2e8f0;vertical-align:top}
tr{break-inside:avoid}
.kunye td:first-child{width:118pt;font-weight:700;color:#334155}
.kunye ul{margin:0;padding-left:11pt}
.kavramlar{display:grid;grid-template-columns:1fr 1fr;gap:7pt}
.kavram{background:#f8fafc;border:1px solid #e2e8f0;border-radius:7pt;padding:7pt 9pt;break-inside:avoid}
.kavram b{display:block;color:#0369a1;font-size:8.8pt;margin-bottom:2pt}
.akis3{display:flex;align-items:stretch;gap:5pt;margin:6pt 0;padding:10pt;border-radius:8pt;background:linear-gradient(135deg,#eef2ff,#e0f2fe);break-inside:avoid}
.akis3-baslik{display:block;text-align:center;margin:0 auto 6pt;background:#1e1b4b;color:#fff;border-radius:9pt;padding:2pt 10pt;font-weight:700;font-size:8pt;width:max-content}
.akis3-kart{flex:1;background:#fff;border-radius:7pt;overflow:hidden;text-align:center;box-shadow:0 1pt 3pt rgba(15,23,42,.12)}
.akis3-ust{color:#fff;font-weight:700;font-size:7.4pt;letter-spacing:.8pt;padding:4pt}
.akis3-kart:nth-child(1) .akis3-ust{background:#10b981}.akis3-kart:nth-child(3) .akis3-ust{background:#6366f1}.akis3-kart:nth-child(5) .akis3-ust{background:#f59e0b}
.akis3-kart b{display:block;font-size:9pt;margin:5pt 5pt 2pt}
.akis3-kart span{display:block;font-size:7.6pt;color:#334155;padding:0 6pt 6pt}
.akis3-ok{align-self:center;color:#64748b;font-weight:700}
.kutu-liste{list-style:none;padding:0;margin:0}
.kutu-liste li{display:flex;gap:7pt;margin:0 0 5pt;break-inside:avoid}
.kutu-liste li::before{content:'';flex-shrink:0;width:9pt;height:9pt;border:1.3pt solid #0f172a;border-radius:2.5pt;margin-top:1.5pt}
.zaman{margin:4pt 0 10pt}
.zaman-bar{display:flex;height:16pt;border-radius:4pt;overflow:hidden;gap:1.5pt}
.zaman-bar div{display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:7pt;white-space:nowrap}
.zaman-etiket{display:flex;gap:1.5pt;font-size:6.6pt;color:#334155;margin-top:2pt}
.zaman-etiket div{text-align:center;overflow:hidden}
.zaman-etiket b{display:block;font-size:6.8pt;color:#1e1b4b}
.zaman-olcek{display:flex;justify-content:space-between;font-size:6.4pt;color:#94a3b8;margin-top:3pt;border-top:1px solid #e2e8f0;padding-top:1pt}
.akis td:first-child{width:70pt;font-weight:700;color:#1e1b4b}
.akis td:first-child span{display:block;font-weight:400;color:#64748b}
.akis td:last-child{width:34pt;text-align:center}
.slaytlar{display:flex;flex-wrap:wrap;gap:4pt}
.slaytlar span{border:1px solid #e2e8f0;border-radius:9pt;padding:1.5pt 7pt;font-size:7.2pt;background:#f8fafc}
.slaytlar b{color:#0369a1;margin-right:2pt}
.adim{border:1px solid #dbeafe;border-radius:8pt;overflow:hidden;margin:0 0 7pt;break-inside:avoid}
.adim-bas{display:flex;align-items:center;gap:7pt;background:#e0f2fe;padding:5pt 9pt;font-weight:700;color:#1e1b4b}
.adim-bas span{width:15pt;height:15pt;border-radius:4pt;background:#0ea5e9;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:7.6pt}
.adim table{margin:0}
.adim td{border-bottom:1px solid #f1f5f9}
.adim td:first-child{width:74pt;padding-right:0}
.et{display:inline-block;width:66pt;text-align:center;border-radius:5pt;padding:2pt 0;font-size:6.8pt;font-weight:700;letter-spacing:.5pt}
.et-goster{background:#dbeafe;color:#1d4ed8}.et-sor{background:#ede9fe;color:#7c3aed}.et-kontrol{background:#d1fae5;color:#059669}.et-hata{background:#fef9c3;color:#92400e}
.fotolar{display:grid;grid-template-columns:repeat(3,1fr);gap:6pt;margin-top:4pt}
.foto{break-inside:avoid}
.foto img{width:100%;height:72pt;object-fit:cover;border-radius:6pt;display:block}
.foto-yer{height:72pt;border:1.2pt dashed #94a3b8;border-radius:6pt;background:#f8fafc;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#64748b;font-size:6.6pt;padding:4pt;overflow:hidden}
.foto-yer svg{width:14pt;height:14pt;color:#94a3b8}
.foto-yer b{font-size:7pt;color:#475569}.foto-yer span{display:none}.foto-yer code{font-size:6pt}
.foto figcaption{font-size:7.2pt;font-weight:700;color:#1e1b4b;margin-top:2pt}
ul.madde{margin:2pt 0;padding-left:12pt}ul.madde li{margin:2pt 0}
.fark{display:grid;grid-template-columns:78pt 1fr;gap:3pt 8pt}
.fark b{color:#0369a1}
.rubrik td:first-child{font-weight:700;width:78pt}
.rubrik th{text-align:center}.rubrik th:first-child{text-align:left}
.cevap td:nth-child(3){font-weight:700;color:#0369a1;width:104pt}
.guvenlik-madde{background:#fee2e2;border-left:3pt solid #dc2626;border-radius:5pt;padding:6pt 9pt;margin:0 0 5pt;break-inside:avoid}
.bitirme{background:linear-gradient(135deg,#fef3c7,#fff7ed);border-radius:7pt;padding:8pt 11pt;border-left:3pt solid #f59e0b;margin-bottom:6pt}
.bitirme .etiket{font-size:7pt;font-weight:700;letter-spacing:1pt;color:#92400e}
.imza-alt{margin-top:8pt;font-size:7.4pt;color:#64748b;text-align:center}
"""

IKON = {
    'yildiz': '<polygon points="12 2 15 9 22 9 16.5 13.5 18.5 21 12 16.8 5.5 21 7.5 13.5 2 9 9 9"/>',
    'kutu': '<path d="M21 16V8l-9-5-9 5v8l9 5 9-5z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>',
    'ampul': '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>',
    'onay': '<circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/>',
    'saat': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'goz': '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
    'liste': '<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    'soru': '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12" y2="17"/>',
    'uyari': '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12" y2="17"/>',
    'katman': '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    'grafik': '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    'ok': '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    'kalkan': '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/>',
    'kupa': '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    'kitap': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"/>'
}
ZAMAN_RENK = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6']


def kart_ac(baslik, ikon):
    return ('<section class="kart"><h2><span class="ikon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" '
            'stroke-linecap="round" stroke-linejoin="round">' + IKON[ikon] + '</svg></span>' + e(baslik) + '</h2>\n')


def plan_u_html(kod, hafta, ders, h, unite, plan, les, muf):
    from derle import fotolar, FOTO_SIMGE
    hh = "H" + str(hafta).zfill(2)
    quiz = les["LESSON"]["quiz"][:4]
    etiketler = les["SLIDE_LABELS"]
    kademe = "Ortaokul · " + ders["sinif"] if ders["kademe"] == "ortaokul" else "Lise · " + ders["sinif"]
    s = []
    s.append('<!DOCTYPE html>\n<html lang="tr">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n')
    s.append("<title>" + e(kod + " " + hh + " Öğretmen Uygulama Planı — " + h["baslik"]) + "</title>\n<style>" + CSS_U + "</style>\n</head>\n<body>\n")
    s.append('<span class="ust-rozet">ÖĞRETMEN UYGULAMA PLANI · ' + e(kod) + " · " + hh + "</span>\n")
    s.append("<h1>" + e(h["baslik"]) + "</h1>\n<p class=\"alt-baslik\">" + e(plan["altbaslik"]) + "</p>\n")
    s.append('<div class="rozetler">' + "".join("<span>" + e(r) + "</span>" for r in plan["rozetler"]) + "</div>\n")

    # Hikâye / Senaryo
    sen = plan["senaryo"]
    s.append(kart_ac("Hikâye / Senaryo", "yildiz"))
    s.append('<div class="senaryo"><div class="etiket">' + e(sen["baslik"]) + "</div><p>" + e(sen["metin"]) + "</p><p><b>Görev:</b> " + e(sen["gorev"]) + "</p></div>\n")
    s.append("<p><b>Öğrenci bu derste ne yapıyor?</b> " + e(plan["ogrenci_ne_yapiyor"]) + "</p></section>\n")

    # 1. Ders Künyesi
    k = plan["kunye"]
    s.append(kart_ac("1. Ders Künyesi", "kutu"))
    s.append('<table class="kunye">\n')
    satirlar = [
        ("Ders kodu / hafta", kod + " · " + ders["lms_adi"] + " · " + hh + " · " + unite["ad"]),
        ("Seviye / sınıf", kademe),
        ("Süre / grup", "1 ders (" + str(muf["ders_suresi_dk"]) + " dk) · " + k["grup"]),
        ("Donanım / platform", k["donanim"]),
    ]
    for a, b in satirlar:
        s.append("<tr><td>" + e(a) + "</td><td>" + e(b) + "</td></tr>\n")
    s.append("<tr><td>Kazanımlar</td><td><ul>" + "".join("<li>K" + str(i + 1) + ". " + e(x) + "</li>" for i, x in enumerate(h["kazanimlar"])) + "</ul></td></tr>\n")
    s.append("<tr><td>Ön koşul</td><td>" + e(k["on_kosul"]) + "</td></tr>\n")
    s.append("<tr><td>Değerlendirme</td><td>" + e(k["degerlendirme"]) + "</td></tr>\n")
    s.append("<tr><td>Öğrenci dersi</td><td>" + str(len(etiketler)) + " slayt (LMS v9.3) · " + str(len(quiz)) + " soruluk bilgi testi + 1 Derinleş bonus sorusu</td></tr>\n</table></section>\n")

    # 2. Kavramsal arka plan
    s.append(kart_ac("2. Öğretmen İçin Kavramsal Arka Plan", "ampul"))
    s.append("<p>Öğrencilerin sorularını yanıtlayabilmen için bu ders şu kavramlara dayanır:</p>\n<div class=\"kavramlar\">")
    for kv in plan["kavramlar"]:
        s.append('<div class="kavram"><b>' + e(kv["baslik"]) + "</b>" + e(kv["metin"]) + "</div>")
    s.append("</div>\n<h3>Nasıl çalışır?</h3>\n")
    n = plan["nasil"]
    s.append('<div class="akis3-baslik">' + e(n["baslik"]) + '</div><div class="akis3">')
    for i, kr in enumerate(n["kartlar"]):
        if i:
            s.append('<div class="akis3-ok">→</div>')
        s.append('<div class="akis3-kart"><div class="akis3-ust">' + e(kr["ust"]) + "</div><b>" + e(kr["baslik"]) + "</b><span>" + e(kr["metin"]) + "</span></div>")
    s.append("</div>\n<p>" + e(n["metin"]) + "</p></section>\n")

    # 3. Ön hazırlık
    s.append(kart_ac("3. Ön Hazırlık (Ders Öncesi)", "onay"))
    s.append("<h3>Kontrol listesi</h3>\n<ul class=\"kutu-liste\">" + "".join("<li>" + e(x) + "</li>" for x in plan["kontrol_listesi"]) + "</ul>\n")
    s.append("<h3>Malzemeler (grup başına)</h3>\n<table><thead><tr><th>Malzeme</th><th>Adet</th><th>Not</th></tr></thead>\n")
    for m in plan["malzemeler"]:
        s.append("<tr><td>" + e(m[0]) + "</td><td>" + e(m[1]) + "</td><td>" + e(m[2]) + "</td></tr>\n")
    s.append("</table></section>\n")

    # 4. Dakika dakika
    akis = plan["akis"]
    toplam = akis[-1]["son"]
    if toplam != muf["ders_suresi_dk"] or akis[0]["bas"] != 0:
        raise SystemExit("HATA: ders akışı 0–" + str(muf["ders_suresi_dk"]) + " dk olmalı")
    for a, b in zip(akis, akis[1:]):
        if a["son"] != b["bas"]:
            raise SystemExit("HATA: ders akışında boşluk/çakışma: " + a["asama"])
    s.append(kart_ac("4. Dakika Dakika Ders Akışı", "saat"))
    s.append('<div class="zaman"><div class="zaman-bar">')
    for i, a in enumerate(akis):
        s.append('<div style="flex:' + str(a["son"] - a["bas"]) + ";background:" + ZAMAN_RENK[i % len(ZAMAN_RENK)] + '">' + str(a["son"] - a["bas"]) + " dk</div>")
    s.append('</div><div class="zaman-etiket">')
    for a in akis:
        s.append('<div style="flex:' + str(a["son"] - a["bas"]) + '"><b>' + e(a["asama"]) + "</b>slayt " + e(a["slayt"]) + "</div>")
    s.append('</div><div class="zaman-olcek">' + "".join("<span>" + str(d) + "′</span>" for d in range(0, toplam + 1, 5)) + "</div></div>\n")
    s.append('<table class="akis"><thead><tr><th>Aşama / süre</th><th>Öğretmen ne yapar/söyler</th><th>Öğrenci ne yapar</th><th>✔ Kontrol noktası</th><th>Slayt</th></tr></thead>\n')
    for a in akis:
        s.append("<tr><td>" + e(a["asama"]) + "<span>" + str(a["bas"]) + "–" + str(a["son"]) + " dk</span></td><td>" + e(a["ogretmen"]) + "</td><td>" +
                 e(a["ogrenci"]) + "</td><td>" + e(a["kontrol"]) + "</td><td>" + e(a["slayt"]) + "</td></tr>\n")
    s.append("</table>\n<h3>Öğrenci dersindeki slaytlar</h3>\n<div class=\"slaytlar\">")
    for et in etiketler:
        m = re.match(r"(\d+)\.\s*(.*)", et)
        s.append("<span><b>" + m.group(1) + "</b>" + e(m.group(2)) + "</span>")
    s.append("</div></section>\n")

    # 5. Adım adım
    if len(plan["adimlar"]) != len(h["adimlar"]):
        raise SystemExit("HATA: plan.json adimlar sayısı JSON adımlarıyla eşleşmiyor")
    s.append(kart_ac("5. Adım Adım Yönlendirme (Öğretmen Scripti)", "goz"))
    s.append("<p>Her yapım adımında: önce 3D provayı oynat, sonra gerçek parçada göster; hangi soruyu soracağın, neyi kontrol edeceğin ve sık hatada nasıl müdahale edeceğin.</p>\n")
    for i, a in enumerate(plan["adimlar"]):
        s.append('<div class="adim"><div class="adim-bas"><span>' + str(i + 1) + "</span>" + e(h["adimlar"][i]) + "</div><table>")
        for et, cls, alan in [("GÖSTER", "goster", "goster"), ("SOR", "sor", "sor"), ("✔ KONTROL", "kontrol", "kontrol"), ("⚠ SIK HATA", "hata", "sik_hata")]:
            s.append('<tr><td><span class="et et-' + cls + '">' + et + "</span></td><td>" + konusma(a[alan]) + "</td></tr>")
        s.append("</table></div>\n")
    s.append("</section>\n")

    # 6. Yapım sırası ve kontrol tablosu
    s.append(kart_ac("6. Yapım Sırası ve Kontrol Tablosu", "liste"))
    s.append("<table><thead><tr><th>Parça</th><th>Yuva / Bağlantı</th><th>Doğru yön işareti</th><th>Not</th></tr></thead>\n")
    for r in plan["yapim_tablosu"]:
        s.append("<tr>" + "".join("<td>" + e(x) + "</td>" for x in r) + "</tr>\n")
    s.append("</table>\n<h3>Fotoğraflı sıra</h3>\n<div class=\"fotolar\">")
    for ad, alt in plan["fotolar"]:
        gomulu = fotolar("<!--@foto:" + ad + "|" + alt + "-->")
        if "data-foto-gerekli" in gomulu:   # plan: yalnız simge + kısa not (dosya yolu metinde görünmez)
            gomulu = '<div class="foto-yer" data-foto-gerekli="' + ad + '">' + FOTO_SIMGE + "<b>Fotoğraf eklenecek</b></div>"
        s.append('<figure class="foto" style="margin:0">' + gomulu + "<figcaption>" + e(alt) + "</figcaption></figure>")
    s.append("</div></section>\n")

    # 7. Sokratik
    s.append(kart_ac("7. Yönlendirici (Sokratik) Sorular", "soru"))
    s.append('<ul class="madde">' + "".join("<li>" + e(x) + "</li>" for x in plan["sokratik"]) + "</ul></section>\n")

    # 8. Sık hatalar
    s.append(kart_ac("8. Sık Hatalar ve Anında Müdahale", "uyari"))
    s.append("<table><thead><tr><th>Belirti</th><th>Olası neden</th><th>Öğretmen müdahalesi</th></tr></thead>\n")
    for r in plan["sik_hatalar"]:
        s.append("<tr>" + "".join("<td>" + e(x) + "</td>" for x in r) + "</tr>\n")
    s.append("</table>\n<h3>Öğrencinin derste gördüğü sorun giderme</h3>\n<table><thead><tr><th>Belirti</th><th>Çözüm</th></tr></thead>\n")
    for r in plan["ogrenci_sorun_giderme"]:
        s.append("<tr><td>" + e(r[0]) + "</td><td>" + e(r[1]) + "</td></tr>\n")
    s.append("</table></section>\n")

    # 9. Farklılaştırma
    f = plan["farklilastirma"]
    s.append(kart_ac("9. Farklılaştırma", "katman"))
    s.append('<div class="fark"><b>Hızlı bitiren için</b><span>' + e(f["hizli"]) + "</span><b>Zorlanan için</b><span>" + e(f["zorlanan"]) +
             "</span><b>Grup yönetimi</b><span>" + e(f["grup"]) + "</span></div></section>\n")

    # 10. Değerlendirme
    s.append(kart_ac("10. Değerlendirme", "grafik"))
    s.append("<h3>Gözlem kontrol listesi (süreç)</h3>\n<ul class=\"kutu-liste\">" + "".join("<li>" + e(x) + "</li>" for x in plan["gozlem"]) + "</ul>\n")
    s.append('<h3>Ürün değerlendirme rubriği</h3>\n<table class="rubrik"><thead><tr><th>Ölçüt</th><th>Başlangıç (1)</th><th>Gelişiyor (2)</th><th>Yeterli (3)</th></tr></thead>\n')
    for r in plan["rubrik"]:
        s.append("<tr>" + "".join("<td>" + e(x) + "</td>" for x in r) + "</tr>\n")
    s.append('</table>\n<h3>Bilgi testi cevap anahtarı</h3>\n<table class="cevap"><thead><tr><th>#</th><th>Soru</th><th>Doğru cevap</th><th>Açıklama</th></tr></thead>\n')
    for i, q in enumerate(quiz):
        metin, _ = soru_parcala(q["q"])
        s.append("<tr><td>" + str(i + 1) + "</td><td>" + e(metin) + "</td><td>" + LETTERS[q["correct"]] + ") " + e(q["opts"][q["correct"]]) + "</td><td>" + e(q["fb"]) + "</td></tr>\n")
    s.append("</table>\n<p><b>Cevap anahtarı:</b> " + " ".join(str(i + 1) + "-" + LETTERS[q["correct"]] for i, q in enumerate(quiz)) + ". Derinleş bonus sorusu puanı düşürmez.</p></section>\n")

    # 11. Kapanış
    s.append(kart_ac("11. Kapanış ve Genişletme", "ok"))
    s.append("<p>" + konusma(plan["kapanis"]) + "</p></section>\n")

    # Güvenlik
    s.append(kart_ac("Güvenlik", "kalkan"))
    guv = [x.strip() + ("" if x.strip().endswith(".") else ".") for x in re.split(r"(?<=\.)\s+", h.get("guvenlik", "")) if x.strip()]
    for g in guv + plan["guvenlik_ek"]:
        s.append('<div class="guvenlik-madde">' + e(g) + "</div>\n")
    s.append("</section>\n")

    # Bitirme
    b = plan["bitirme"]
    s.append(kart_ac("Bitirme: " + b["baslik"], "kupa"))
    s.append('<div class="bitirme"><div class="etiket">ÜRÜN</div><p>' + e(b["urun"]) + "</p></div>\n<h3>Böyle sun</h3>\n<ul class=\"madde\">" +
             "".join("<li>" + e(x) + "</li>" for x in b["sunum"]) + "</ul></section>\n")

    # Kaynaklar
    s.append(kart_ac("Referans Kaynaklar", "kitap"))
    s.append('<ul class="madde">' + "".join("<li>" + e(x) + "</li>" for x in plan["kaynaklar"]) + "</ul>")
    s.append('<p class="imza-alt">Bilişim Üssü · Öğretmen Uygulama Planı · ' + e(kod + " " + hh + " · " + h["baslik"]) + "</p></section>\n")
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
