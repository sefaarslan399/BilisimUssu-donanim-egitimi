# -*- coding: utf-8 -*-
"""mufredat/mufredat.json -> mufredat/DON-XXX.md, docs/gorsel-katalog.md, DURUM.md (yoksa)

Kullanım: python3 scripts/render_mufredat.py [--durum-sifirla] [--zorla]
JSON tek doğruluk kaynağıdır; MD dosyaları elle düzenlenmez.
"""
import json, os, re, sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J = os.path.join(KOK, "mufredat", "mufredat.json")
YASAK_FIILLER = ["kavrar", "fark eder", "hatırlar", "bilir"]
KOD_RE = re.compile(r"\b([AE]-[A-ZÇĞİÖŞÜ]+(?:-[A-ZÇĞİÖŞÜ]+)*)")


def denetle(data):
    kat = data["gorsel_katalog"]
    u = []
    for d in data["dersler"]:
        n = len(d["haftalar"])
        if [w["hafta"] for w in d["haftalar"]] != list(range(1, n + 1)):
            u.append(d["kod"] + ": hafta numaraları sıralı değil")
        if sorted(h for x in d["uniteler"] for h in x["haftalar"]) != list(range(1, n + 1)):
            u.append(d["kod"] + ": üniteler haftaları bir kez kapsamıyor")
        for w in d["haftalar"]:
            e = d["kod"] + "-H" + str(w["hafta"]).zfill(2)
            if len(w["kazanimlar"]) != 4:
                u.append(e + ": 4 kazanım olmalı")
            if len(w["adimlar"]) != 6:
                u.append(e + ": 6 adım olmalı")
            if w["tur"] not in data["ders_turleri"]:
                u.append(e + ": geçersiz tür " + w["tur"])
            for k in w["kazanimlar"]:
                for f in YASAK_FIILLER:
                    if re.search(r"\b" + f + r"\b", k):
                        u.append(e + ": gözlenemeyen kazanım fiili '" + f + "'")
            g = w["gorsel"]
            for m in g["sahne3d"]:
                if m not in kat["modeller"]:
                    u.append(e + ": katalogda olmayan model " + m)
            for metin in g["animasyonlar"] + g["etkilesim"]:
                for x in KOD_RE.findall(metin):
                    grup = kat["animasyonlar"] if x.startswith("A-") else kat["etkilesimler"]
                    if x not in grup:
                        u.append(e + ": katalogda olmayan kod " + x)
            if d["kademe"] == "ortaokul":
                if not w.get("derinles"):
                    u.append(e + ": Derinleş eksik")
                if not g["sahne3d"]:
                    u.append(e + ": ortaokul dersinde 3D sahne yok")
                if not g["animasyonlar"]:
                    u.append(e + ": ortaokul dersinde animasyon yok")
    return u


def ders_md(d):
    s = ["# " + d["kod"] + " – " + d["ad"], "",
         "> `mufredat/mufredat.json` dosyasından üretilir. Elle düzenleme.", "",
         "| Alan | Değer |", "|---|---|",
         "| LMS adı | " + d["lms_adi"] + " |",
         "| Kademe | " + d["kademe"] + " (" + d["sinif"] + ". sınıf, " + d["yas_araligi"] + " yaş) |",
         "| Hafta | " + str(len(d["haftalar"])) + " × 35 dk |",
         "| Görsel seviye | " + d["gorsel_seviye"] + " |", "",
         "**Amaç:** " + d["amac"], "",
         "**Donanım:** " + ", ".join(d["donanim"]), "", "## Üniteler", ""]
    for x in d["uniteler"]:
        s.append("- **Ünite " + str(x["no"]) + " – " + x["ad"] + ":** Hafta " + ", ".join(str(h) for h in x["haftalar"]))
    s += ["", "## Haftalık Plan"]
    for w in d["haftalar"]:
        kod = d["kod"] + "-H" + str(w["hafta"]).zfill(2)
        s += ["", "### " + str(w["hafta"]) + ". Hafta – " + w["baslik"] + "  `" + kod + "` · Tür: **" + w["tur"] + "**", "", "**Kazanımlar**", ""]
        for i, k in enumerate(w["kazanimlar"], 1):
            s.append("- `K" + str(i) + "` " + k)
        s += ["", "**Adımlar:** " + " · ".join(str(i) + " " + a for i, a in enumerate(w["adimlar"], 1)), "",
              "**Etkinlik:** " + w["etkinlik"]]
        g = w["gorsel"]
        if g["sahne3d"]:
            s += ["", "**3D sahne:** " + ", ".join("`" + m + "`" for m in g["sahne3d"])]
        if g["animasyonlar"]:
            s += ["", "**Animasyonlar:**"] + ["- " + a for a in g["animasyonlar"]]
        if g["etkilesim"]:
            s += ["", "**Etkileşim:** " + "; ".join(g["etkilesim"])]
        if g["foto"]:
            s += ["", "**Gerçek fotoğraf:** " + "; ".join(g["foto"])]
        for alan, ad in [("derinles", "Derinleş (13–15 yaş / hızlı öğrenciler)"), ("guvenlik", "Güvenlik"),
                         ("materyal", "Materyal"), ("ogretmen_notu", "Öğretmen notu")]:
            if w.get(alan):
                s += ["", "**" + ad + ":** " + w[alan]]
    s.append("")
    return "\n".join(s)


def katalog_md(data):
    kat = data["gorsel_katalog"]
    kul = {}
    for d in data["dersler"]:
        for w in d["haftalar"]:
            e = d["kod"] + "-H" + str(w["hafta"]).zfill(2)
            g = w["gorsel"]
            for m in g["sahne3d"]:
                kul.setdefault(m, []).append(e)
            for metin in g["animasyonlar"] + g["etkilesim"]:
                for x in KOD_RE.findall(metin):
                    if e not in kul.setdefault(x, []):
                        kul[x].append(e)
    s = ["# Görsel Katalog (DON3D)", "", "> `mufredat/mufredat.json` dosyasından üretilir. Davranış ayrıntıları: `docs/gorsel-3d-standartlari.md`.", ""]
    for baslik, anahtar in [("3D Modeller", "modeller"), ("Animasyon Kalıpları", "animasyonlar"), ("Etkileşim Kalıpları", "etkilesimler")]:
        s += ["## " + baslik, "", "| Kod | Tanım | Kullanıldığı dersler |", "|---|---|---|"]
        for k, v in kat[anahtar].items():
            s.append("| `" + k + "` | " + v + " | " + ", ".join(kul.get(k, ["—"])) + " |")
        s.append("")
    return "\n".join(s)


def durum_md(data):
    s = ["# Üretim Durumu", "",
         "Durum: `—` başlanmadı · `K` kalibrasyon (onay bekliyor) · `✓` tamam · `R` revizyon", "",
         "## DON3D Görsel Motoru", "", "| Bileşen | Durum | Not |", "|---|---|---|",
         "| Motor çekirdeği (renderer, sahne yaşam döngüsü, yedek görsel) | — | |",
         "| Etkileşimler (E-DONDUR, E-BILGI, E-TAK) | — | |",
         "| Animasyon kalıpları | — | |",
         "| Model kütüphanesi | — | |", ""]
    for d in data["dersler"]:
        s += ["## " + d["kod"] + " – " + d["ad"], "", "| Hafta | Başlık | Tür | HTML | Plan | Not |", "|---|---|---|---|---|---|"]
        for w in d["haftalar"]:
            s.append("| H" + str(w["hafta"]).zfill(2) + " | " + w["baslik"] + " | " + w["tur"] + " | — | — | |")
        s.append("")
    return "\n".join(s)


def main():
    with open(J, encoding="utf-8") as f:
        data = json.load(f)
    u = denetle(data)
    for x in u:
        print("UYARI: " + x)
    if u and "--zorla" not in sys.argv:
        print("Müfredat denetimi geçmedi.")
        sys.exit(1)
    for d in data["dersler"]:
        with open(os.path.join(KOK, "mufredat", d["kod"] + ".md"), "w", encoding="utf-8") as f:
            f.write(ders_md(d))
    with open(os.path.join(KOK, "docs", "gorsel-katalog.md"), "w", encoding="utf-8") as f:
        f.write(katalog_md(data))
    dp = os.path.join(KOK, "DURUM.md")
    if not os.path.exists(dp) or "--durum-sifirla" in sys.argv:
        with open(dp, "w", encoding="utf-8") as f:
            f.write(durum_md(data))
    print("Tamam: " + str(len(data["dersler"])) + " ders işlendi.")


if __name__ == "__main__":
    main()
