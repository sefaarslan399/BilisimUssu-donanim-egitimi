# -*- coding: utf-8 -*-
"""Bilişim Üssü v9.3 statik doğrulayıcı.

Kullanım:
  python scripts/validate.py <dosya veya klasör> [...]
  python scripts/validate.py --plan-karsilastir <plan.html> <ders.html>

Çıkış kodu: hata varsa 1, yoksa 0. Uyarılar çıkış kodunu etkilemez.

NOT: QUIZ_CEVAP_RE, MASTER'daki quiz doğru-cevap alanının adına göre ilk kalibrasyonda güncellenmelidir.
"""
import os, re, sys, json, subprocess, tempfile
from html.parser import HTMLParser

# --- Yapılandırma -------------------------------------------------------------
QUIZ_CEVAP_RE = re.compile(r"\b(?:a|ans|answer|correct|dogru|cevap)\s*:\s*([0-3])\b")

YASAK_KELIME_RE = re.compile(
    r"\b(sihir\w*|büyü|büyüler\w*|büyülü\w*|büyücü\w*|peri|periler\w*|perisi)\b",
    re.IGNORECASE)
KURS_RE = re.compile(r"\bkurs(u|a|ta|tan|un|lar\w*)?\b", re.IGNORECASE)
YASAK_EMOJI = ["\u2728", "\U0001F916", "\U0001F9E0", "\U0001FA84", "\U0001F52E"]
CLAMP_BOSLUKSUZ_RE = re.compile(r"clamp\([^)]*?\d(?:\.\d+)?(?:vw|px|vh|rem|em)[+\-]\d")
VAR_ZINCIR_RE = re.compile(r"\bvar\s+[A-Za-z_$][\w$]*\s*=\s*[A-Za-z_$][\w$]*\s*=(?!=)")
BOS_ETIKETLER = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
                 "meta", "param", "source", "track", "wbr"}
SVG_KENDINDEN_KAPALI_OK = True
# ------------------------------------------------------------------------------


class Denge(HTMLParser):
    def __init__(self):
        HTMLParser.__init__(self, convert_charrefs=True)
        self.yigin = []
        self.hatalar = []
        self.scriptler = []
        self._script_attrs = None
        self._script_buf = []

    def handle_starttag(self, tag, attrs):
        if tag in BOS_ETIKETLER:
            return
        self.yigin.append((tag, self.getpos()[0]))
        if tag == "script":
            self._script_attrs = dict(attrs)
            self._script_buf = []

    def handle_startendtag(self, tag, attrs):
        pass  # <x/> dengeyi etkilemez

    def handle_endtag(self, tag):
        if tag in BOS_ETIKETLER:
            return
        if tag == "script" and self._script_attrs is not None:
            a = self._script_attrs
            tur = (a.get("type") or "").lower()
            if not a.get("src") and tur in ("", "text/javascript", "application/javascript", "module"):
                self.scriptler.append(("".join(self._script_buf), self.getpos()[0]))
            self._script_attrs = None
        if not self.yigin:
            self.hatalar.append("Satır " + str(self.getpos()[0]) + ": fazladan </" + tag + ">")
            return
        if self.yigin[-1][0] == tag:
            self.yigin.pop()
            return
        # eşleşmeyen kapanış
        isimler = [t for t, _ in self.yigin]
        if tag in isimler:
            while self.yigin and self.yigin[-1][0] != tag:
                t, s = self.yigin.pop()
                self.hatalar.append("Satır " + str(s) + ": <" + t + "> kapatılmamış")
            self.yigin.pop()
        else:
            self.hatalar.append("Satır " + str(self.getpos()[0]) + ": eşleşmeyen </" + tag + ">")

    def handle_data(self, data):
        if self._script_attrs is not None:
            self._script_buf.append(data)


def js_kontrol(scriptler):
    hatalar = []
    for i, (kod, satir) in enumerate(scriptler):
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as t:
            t.write(kod)
            yol = t.name
        try:
            r = subprocess.run(["node", "-e",
                                "new Function(require('fs').readFileSync(process.argv[1],'utf8'))", yol],
                               capture_output=True, text=True, timeout=30)
            if r.returncode != 0:
                ilk = (r.stderr.strip().splitlines() or ["?"])
                mesaj = [l for l in ilk if "Error" in l]
                hatalar.append("Script (satır ~" + str(satir) + "): " + (mesaj[0] if mesaj else ilk[-1]))
        except FileNotFoundError:
            hatalar.append("node bulunamadı; JS kontrolü yapılamadı")
            break
        finally:
            os.unlink(yol)
    return hatalar


def quiz_kontrol(metin):
    cevaplar = [int(m.group(1)) for m in QUIZ_CEVAP_RE.finditer(metin)]
    uyarilar, hatalar = [], []
    if not cevaplar:
        uyarilar.append("Quiz doğru-cevap alanı bulunamadı (QUIZ_CEVAP_RE'yi MASTER'a göre güncelle)")
        return hatalar, uyarilar
    if len(cevaplar) >= 4 and len(set(cevaplar)) < 4:
        hatalar.append("Quiz: A/B/C/D'nin dördü de doğru cevap olarak görünmüyor: " + str(cevaplar))
    for i in range(len(cevaplar) - 2):
        if cevaplar[i] == cevaplar[i + 1] == cevaplar[i + 2]:
            hatalar.append("Quiz: üç ardışık aynı doğru cevap: " + str(cevaplar))
            break
    if cevaplar[:4] != [0, 2, 1, 3]:
        uyarilar.append("Quiz: kanonik A/C/B/D dizilimi kullanılmamış: " + str(cevaplar))
    return hatalar, uyarilar


def satir_no(metin, idx):
    return metin.count("\n", 0, idx) + 1


KUTUPHANE_RE = re.compile(r"<script[^>]*\bdata-kutuphane=\"[^\"]*\"[^>]*>[\s\S]*?</script>")


def dosya_kontrol(yol):
    with open(yol, encoding="utf-8") as f:
        ham = f.read()
    hatalar, uyarilar = [], []
    kutuphaneler = KUTUPHANE_RE.findall(ham)
    # Satır içi kütüphaneler (three.min.js vb.) metin denetimlerinden çıkarılır; satır sayısı korunur.
    metin = KUTUPHANE_RE.sub(lambda m: "\n" * m.group(0).count("\n"), ham)
    if "REVISION" in metin and "WebGLRenderer" in metin and len(metin) > 300000:
        hatalar.append("Three.js satır içi gömülmüş ama <script data-kutuphane=\"three\"> etiketi yok")

    for m in YASAK_KELIME_RE.finditer(metin):
        hatalar.append("Satır " + str(satir_no(metin, m.start())) + ": yasak kelime '" + m.group(0) + "'")
    for m in KURS_RE.finditer(metin):
        uyarilar.append("Satır " + str(satir_no(metin, m.start())) + ": 'kurs' yerine 'ders' kullan ('" + m.group(0) + "')")
    for e in YASAK_EMOJI:
        for m in re.finditer(re.escape(e), metin):
            hatalar.append("Satır " + str(satir_no(metin, m.start())) + ": yasak emoji " + e)
    for m in CLAMP_BOSLUKSUZ_RE.finditer(metin):
        hatalar.append("Satır " + str(satir_no(metin, m.start())) + ": clamp() içinde boşluksuz işleç")
    for m in VAR_ZINCIR_RE.finditer(metin):
        hatalar.append("Satır " + str(satir_no(metin, m.start())) + ": zincirli 'var a = b =' (strict mode hatası)")
    for desen, ad in [(r"class=\"[^\"]*\btab-panel\b", "tab-panel"),
                      (r"class=\"[^\"]*\blayout-twocol\b", "layout-twocol")]:
        for m in re.finditer(desen, metin):
            hatalar.append("Satır " + str(satir_no(metin, m.start())) + ": yasak sınıf " + ad)
    lm = re.search(r"\bLESSON\s*=\s*\{", metin)
    if lm:
        derinlik, i = 0, lm.end() - 1
        while i < len(metin):
            if metin[i] == "{":
                derinlik += 1
            elif metin[i] == "}":
                derinlik -= 1
                if derinlik == 0:
                    break
            i += 1
        govde = metin[lm.end() - 1:i + 1]
        cm = re.search(r"\bcategory\s*:", govde)
        if cm:
            hatalar.append("Satır " + str(satir_no(metin, lm.end() - 1 + cm.start())) + ": LESSON.category bulunmamalı")
    for m in re.finditer(r"(?:src|href)=\"(?!data:|#|javascript:)([^\"]+\.(?:png|jpe?g|gif|webp|svg|css|js))\"", metin):
        hatalar.append("Satır " + str(satir_no(metin, m.start())) + ": harici dosya referansı (tek dosya kuralı): " + m.group(1))
    ad = os.path.basename(yol)
    plan_mi = "/ogretmen-plani/" in "/" + yol.replace("\\", "/")
    if ad.startswith("DON-") and not plan_mi:
        kullanici_js = metin
        n_renderer = len(re.findall(r"new\s+THREE\.WebGLRenderer", kullanici_js))
        if n_renderer > 1:
            hatalar.append("Birden fazla WebGLRenderer (" + str(n_renderer) + "); tek renderer kuralı")
        uc_boyut = "WebGLRenderer" in kullanici_js or any("three" in k[:300].lower() for k in kutuphaneler)
        if uc_boyut:
            if not any("REVISION" in k for k in kutuphaneler):
                hatalar.append("3D kullanılıyor ama Three.js satır içi kütüphane olarak gömülü değil")
            if "prefers-reduced-motion" not in metin:
                hatalar.append("prefers-reduced-motion desteği yok")
            if "data-yedek" not in metin:
                hatalar.append("WebGL yedek görseli (data-yedek) yok")
            if "visibilitychange" not in metin and not any("visibilitychange" in k for k in kutuphaneler):
                uyarilar.append("visibilitychange ile render duraklatma bulunamadı")
        elif ad.startswith("DON-201"):
            hatalar.append("DON-201 dersinde 3D sahne yok (her derste en az 1 zorunlu)")
        boyut = os.path.getsize(yol)
        if boyut > 1600000:
            uyarilar.append("Dosya boyutu " + str(boyut // 1024) + " KB (hedef ≤ 1,5 MB)")
    if ad.startswith("DON-2") and not plan_mi:
        for m in re.finditer(r"\b(çocuklar|minik\w*|minicik\w*|küçük dost\w*|yavrum\w*)\b", metin, re.IGNORECASE):
            uyarilar.append("Satır " + str(satir_no(metin, m.start())) + ": 10–15 yaşa uygun olmayan hitap '" + m.group(0) + "'")
        if "Derinleş" not in metin:
            hatalar.append("Ortaokul dersinde 'Derinleş' slaytı yok")
    if re.search(r"\bdata-foto-gerekli\b", metin):
        uyarilar.append("Gerçek fotoğraf bekleyen yer tutucu var (data-foto-gerekli)")

    p = Denge()
    try:
        p.feed(ham)
        p.close()
    except Exception as ex:
        hatalar.append("HTML ayrıştırma hatası: " + str(ex))
    hatalar.extend(p.hatalar)
    for t, s in p.yigin:
        if t not in ("html", "body", "head"):
            hatalar.append("Satır " + str(s) + ": <" + t + "> kapatılmamış")
    hatalar.extend(js_kontrol([x for x in p.scriptler if "REVISION" not in x[0][:2000000] or len(x[0]) < 100000]))

    if "/icerik/" in "/" + yol.replace("\\", "/") or "--quiz" in sys.argv:
        h, u = quiz_kontrol(metin)
        hatalar.extend(h)
        uyarilar.extend(u)
    return hatalar, uyarilar


def gorunur_metin(yol):
    with open(yol, encoding="utf-8") as f:
        t = f.read()
    t = re.sub(r"<(script|style)[\s\S]*?</\1>", " ", t)
    t = re.sub(r"<[^>]+>", " ", t)
    return re.findall(r"\w+", t.lower())


def plan_karsilastir(plan, ders, n=8):
    a = gorunur_metin(plan)
    b = gorunur_metin(ders)
    # Dersin adı (başlık) iki belgede de bulunmak zorundadır; ortak ifade sayılmaz.
    with open(ders, encoding="utf-8") as f:
        m = re.search(r"<title>([^<]*)</title>", f.read())
    baslik = " ".join(re.findall(r"\w+", m.group(1).lower())) if m else ""
    bset = set(tuple(b[i:i + n]) for i in range(len(b) - n + 1))
    ortak = set()
    for i in range(len(a) - n + 1):
        g = tuple(a[i:i + n])
        if g in bset and not (baslik and " ".join(g) in baslik):
            ortak.add(" ".join(g))
    return sorted(ortak)


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    if argv[0] == "--plan-karsilastir":
        ortak = plan_karsilastir(argv[1], argv[2])
        if ortak:
            print("HATA: planda slaytla birebir ortak " + str(len(ortak)) + " ifade var:")
            for o in ortak[:20]:
                print("  - " + o)
            return 1
        print("Tamam: birebir ortak ifade yok.")
        return 0
    dosyalar = []
    for a in argv:
        if os.path.isdir(a):
            for kok, _, fs in os.walk(a):
                dosyalar += [os.path.join(kok, f) for f in fs if f.endswith(".html")]
        else:
            dosyalar.append(a)
    toplam_hata = 0
    for d in sorted(dosyalar):
        h, u = dosya_kontrol(d)
        durum = "GEÇTİ" if not h else "KALDI"
        print("[" + durum + "] " + d + "  (" + str(len(h)) + " hata, " + str(len(u)) + " uyarı)")
        for x in h:
            print("   HATA   " + x)
        for x in u:
            print("   uyarı  " + x)
        toplam_hata += len(h)
    return 1 if toplam_hata else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
