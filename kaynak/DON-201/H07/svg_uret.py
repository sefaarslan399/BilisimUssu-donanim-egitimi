# -*- coding: utf-8 -*-
"""DON-201 H07 — RAM: SVG çizimlerini üretir (python3 svg_uret.py, bu klasörde çalıştır).
Not: f-string kullanılmaz (üretim standardı). Her SVG'de gradyan/desen kimlikleri benzersizdir."""
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))

F = 'font-family="Inter,Arial,sans-serif"'


def w(ad, s):
    open(ad, 'w').write(s.strip() + '\n')


def bg(id_, a='#f0f9ff', b='#dbeafe', W=360, H=240, r=18):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
            '</linearGradient></defs><rect width="%d" height="%d" rx="%d" fill="url(#%s)"/>') % (id_, a, b, W, H, r, id_)


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, ek=''):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s"%s>%s</text>' % (x, y, F, size, weight, fill, anchor, ek, t)


def svg(ad, vb, aria, ic, sinif=''):
    w(ad, '<svg viewBox="%s" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"%s>%s</svg>' % (vb, aria, (' class="' + sinif + '"') if sinif else '', ic))


# ── Çizim yardımcıları ─────────────────────────────────────────────
def ram(x, y, s=1, idp='r', centik_vurgu=False):
    """DDR4 modülü (120 × 32 birim). Çentik merkezden sağa kaymış (≈ %54), yanlarda mandal girintileri."""
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    g += ('<path d="M1 0H119Q120 0 120 1V14A2.5 2.5 0 0 0 120 19V31L119 32H66.3V27.6A1.7 1.7 0 0 0 62.9 27.6V32H1L0 31V19A2.5 2.5 0 0 0 0 14V1Q0 0 1 0Z" '
          'fill="#1f5a3a" stroke="#123826" stroke-width=".6"/>')
    g += ''.join('<rect x="%.1f" y="5" width="11" height="14" rx="1" fill="#17181c"/><rect x="%.1f" y="6.5" width="8" height="1.2" fill="#2d3038"/>' % (7 + i * 13.5, 8.5 + i * 13.5) for i in range(8))
    g += ('<defs><pattern id="%s-tm" width="2" height="6" patternUnits="userSpaceOnUse"><rect width="2" height="6" fill="#e3b04f"/>'
          '<rect x="1.4" width=".6" height="6" fill="#a87a28"/></pattern></defs>') % idp
    g += '<rect x="2.5" y="26" width="59.6" height="6" fill="url(#%s-tm)"/><rect x="67.1" y="26" width="50.4" height="6" fill="url(#%s-tm)"/>' % (idp, idp)
    if centik_vurgu:
        g += '<circle cx="64.6" cy="29" r="6" fill="none" stroke="#f59e0b" stroke-width="2"/>'
    return g + '</g>'


def ram_kucuk(x, y, s=1):
    """Küçük ölçekli RAM (desen kullanmaz)."""
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    g += '<path d="M0 0H60V16H33.4V13.4H31V16H0Z" fill="#1f5a3a"/>'
    g += ''.join('<rect x="%d" y="3" width="5.5" height="7" rx=".6" fill="#17181c"/>' % (4 + i * 7) for i in range(8))
    g += '<rect x="1.5" y="13" width="29" height="3" fill="#e3b04f"/><rect x="34" y="13" width="24.5" height="3" fill="#e3b04f"/>'
    return g + '</g>'


def dolap(x, y, s=1, acik=False):
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    g += '<rect x="0" y="0" width="54" height="96" rx="4" fill="#cfc8ba" stroke="#a8a091" stroke-width="1.5"/><rect x="2" y="92" width="50" height="6" rx="2" fill="#2b2d31"/>'
    for i in range(3):
        yy = 4 + i * 29.5
        if acik and i == 0:
            g += ('<rect x="-4" y="%s" width="62" height="12" rx="2" fill="#bdb5a6"/><rect x="0" y="%s" width="54" height="4" fill="#9c9484"/>'
                  '<rect x="6" y="%s" width="4" height="8" fill="#2563eb"/><rect x="14" y="%s" width="4" height="8" fill="#16a34a"/><rect x="22" y="%s" width="4" height="8" fill="#d97706"/>') % (yy - 6, yy - 6, yy - 12, yy - 12, yy - 12)
            yy += 2
        g += '<rect x="3" y="%s" width="48" height="27" rx="2.5" fill="#d9d2c5" stroke="#b3ab9c"/><rect x="17" y="%s" width="20" height="3.4" rx="1.7" fill="#9ca3af"/><rect x="21" y="%s" width="12" height="5" fill="#f8fafc" stroke="#9ca3af" stroke-width=".6"/>' % (yy, yy + 12, yy + 4)
    return g + '</g>'


def masa(x, y, s=1, genis=150):
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    g += '<rect x="0" y="0" width="%d" height="8" rx="2.5" fill="#d4a373" stroke="#a9794b"/>' % genis
    g += '<rect x="8" y="8" width="5" height="62" fill="#3a3d44"/><rect x="%d" y="8" width="5" height="62" fill="#3a3d44"/>' % (genis - 13)
    g += '<rect x="14" y="8" width="%d" height="16" fill="#6b4a2f" opacity=".75"/>' % (genis - 28)
    return g + '</g>'


def kart(x, y, renk, s=1, ic=''):
    """Dosya kartı (28 × 20): renkli başlık bandı + kâğıt."""
    return ('<g transform="translate(%s %s) scale(%s)"><rect width="28" height="20" rx="2.5" fill="#fbfaf6" stroke="%s" stroke-width="1.4"/>'
            '<rect width="28" height="6" rx="2.5" fill="%s"/><rect y="3" width="28" height="3" fill="%s"/>'
            '<rect x="13" y="9.5" width="11" height="1.6" fill="#d6d3cc"/><rect x="13" y="13" width="11" height="1.6" fill="#d6d3cc"/><rect x="13" y="16.5" width="7" height="1.6" fill="#d6d3cc"/>%s</g>') % (x, y, s, renk, renk, renk, ic)


def cpu(x, y, s=1):
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    for i in range(5):
        g += '<rect x="%d" y="-6" width="3" height="6" fill="#b8bec7"/><rect x="%d" y="56" width="3" height="6" fill="#b8bec7"/>' % (8 + i * 10, 8 + i * 10)
        g += '<rect x="-6" y="%d" width="6" height="3" fill="#b8bec7"/><rect x="56" y="%d" width="6" height="3" fill="#b8bec7"/>' % (8 + i * 10, 8 + i * 10)
    g += '<rect width="56" height="56" rx="6" fill="#334155"/><rect x="10" y="10" width="36" height="36" rx="4" fill="#cbd5e1"/><path d="M13 43l6-6" stroke="#94a3b8" stroke-width="2"/>'
    return g + '</g>'


def simsek(x, y, s=1, fill='#facc15'):
    return '<g transform="translate(%s %s) scale(%s)"><path d="M4 -12l-10 13h7l-4 11 12-15h-7z" fill="%s" stroke="#a16207" stroke-width="1"/></g>' % (x, y, s, fill)


def rozet(x, y, iyi, r=13):
    return ('<g transform="translate(%s %s)"><circle r="%s" fill="%s"/><path d="%s" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>'
            % (x, y, r, '#10b981' if iyi else '#ef4444', 'M-6 0l4 4 8-8' if iyi else 'M-5 -5l10 10M5 -5l-10 10'))


def belge(x, y, s=1, renk='#d97706'):
    return ('<g transform="translate(%s %s) scale(%s)"><path d="M0 0h22l8 8v30H0z" fill="#fff" stroke="%s" stroke-width="2"/><path d="M22 0v8h8" fill="none" stroke="%s" stroke-width="2"/>'
            '<path d="M5 15h19M5 21h19M5 27h13" stroke="#cbd5e1" stroke-width="2.4"/></g>') % (x, y, s, renk, renk)


def disket(x, y, s=1):
    return ('<g transform="translate(%s %s) scale(%s)"><rect width="18" height="18" rx="2.5" fill="#2563eb"/><rect x="4" y="0" width="10" height="6" fill="#dbeafe"/>'
            '<rect x="10" y="1" width="2.5" height="4" fill="#2563eb"/><rect x="3" y="10" width="12" height="7" rx="1" fill="#fff"/></g>') % (x, y, s)


def gamepad(x, y, s=1, renk='#7c3aed'):
    return ('<g transform="translate(%s %s) scale(%s)"><path d="M8 2h24c6 0 9 6 9 13s-4 12-8 9l-5-5H12l-5 5c-4 3-8-2-8-9S2 2 8 2z" fill="%s"/>'
            '<rect x="6" y="10" width="10" height="3" fill="#fff"/><rect x="9.5" y="6.5" width="3" height="10" fill="#fff"/><circle cx="28" cy="9" r="2.2" fill="#fff"/><circle cx="32" cy="14" r="2.2" fill="#fff"/></g>') % (x, y, s, renk)


def ogrenci_arka(x, y, s=1):
    """Masada oturan öğrenci (arkadan, 12–13 yaş)."""
    return ('<g transform="translate(%s %s) scale(%s)">'
            '<rect x="-26" y="44" width="52" height="14" rx="4" fill="#475569"/><rect x="-4" y="58" width="8" height="30" fill="#334155"/><rect x="-22" y="86" width="44" height="5" rx="2.5" fill="#1f2937"/>'
            '<path d="M-24 46c0-22 8-34 24-34s24 12 24 34z" fill="#0d9488"/><path d="M-4 14h8v6h-8z" fill="#c8906a"/>'
            '<circle cx="0" cy="0" r="15" fill="#c8906a"/><path d="M-15 -1c0-12 7-17 15-17s15 5 15 17c-4-4-9-6-15-6s-11 2-15 6z" fill="#2b1d16"/>'
            '<path d="M-15 -2c0 8 3 12 6 14" fill="none" stroke="#2b1d16" stroke-width="4"/>'
            '<path d="M-22 30c-8 6-10 14-6 20" stroke="#0d9488" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M22 30c8 6 10 14 6 20" stroke="#0d9488" stroke-width="9" fill="none" stroke-linecap="round"/>'
            '</g>') % (x, y, s)


# ── Isınma: ödev yazılırken elektrik titriyor ───────────────────────
svg('isinma.svg', '0 0 360 240', 'Akşam, öğrenci bilgisayarda kaydedilmemiş ödevini yazıyor; dışarıda fırtına var, ışıklar titriyor',
    bg('h7is', '#e8eefb', '#dbe4f5') +
    '<rect x="22" y="22" width="92" height="74" rx="6" fill="#1e2a4a" stroke="#cbd5e1" stroke-width="4"/><path d="M68 22v74M22 59h92" stroke="#cbd5e1" stroke-width="3"/>'
    '<g class="h7-yagmur" stroke="#8fa8d8" stroke-width="1.4" stroke-linecap="round">' + ''.join('<path d="M%d %d l-3 8"/>' % (30 + (i * 13) % 80, 30 + (i * 17) % 58) for i in range(14)) + '</g>'
    '<g class="h7-simsek">' + simsek(92, 44, 1.6, '#fde68a') + '</g>'
    '<rect x="0" y="176" width="360" height="64" fill="#c9b08e"/><rect x="0" y="170" width="360" height="10" fill="#b08a5e"/>'
    '<rect x="150" y="60" width="150" height="96" rx="8" fill="#1f2937"/><rect x="157" y="67" width="136" height="80" rx="3" fill="#ffffff" class="h7-ekran"/>'
    '<rect x="157" y="67" width="136" height="14" fill="#d97706"/>' + T(163, 77.5, 'Ödevim.txt  •', 8.5, '#fff', 'start') +
    '<g class="h7-yazi"><rect x="164" y="88" width="104" height="4" rx="2" fill="#94a3b8"/><rect x="164" y="98" width="118" height="4" rx="2" fill="#94a3b8"/>'
    '<rect x="164" y="108" width="96" height="4" rx="2" fill="#94a3b8"/><rect x="164" y="118" width="60" height="4" rx="2" fill="#94a3b8"/><rect class="h7-imlec" x="227" y="116" width="2" height="8" fill="#0f172a"/></g>'
    '<rect x="214" y="156" width="22" height="14" fill="#374151"/><rect x="196" y="166" width="58" height="6" rx="3" fill="#374151"/>'
    '<rect x="238" y="129" width="50" height="14" rx="7" fill="#fee2e2" stroke="#ef4444"/>' + T(263, 139, 'Kaydedilmedi', 7.5, '#b91c1c') +
    ogrenci_arka(118, 150, 1.05) +
    '<rect class="h7-karart" x="0" y="0" width="360" height="240" rx="18" fill="#0b1224" opacity="0"/>'
    '<g transform="translate(248 18)"><rect width="100" height="36" rx="10" fill="#fff" stroke="#cbd5e1" stroke-width="2"/><path d="M20 36l-6 9 14-9" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>'
    '<rect x="15" y="34" width="16" height="4" fill="#fff"/>' + T(50, 16, 'Işıklar titriyor…', 9.5) + T(50, 29, 'Ya kesilirse?', 9, '#64748b') + '</g>',
    'h7-is')

# ── Yedek çizimler ─────────────────────────────────────────────────
svg('yedek-masa.svg', '0 0 360 240', 'Çalışma masası RAM’dir, yanındaki dosya dolabı depolamadır; dosyalar dolaptan masaya gelir',
    bg('h7ym') + masa(26, 118, 1.2) +
    kart(46, 98, '#2563eb', 1.1) + kart(84, 98, '#7c3aed', 1.1) + kart(122, 98, '#db2777', 1.1) +
    dolap(240, 80, 1.15, True) +
    '<path d="M246 60C210 30 170 50 150 90" fill="none" stroke="#0369a1" stroke-width="2.5" stroke-dasharray="5 4"/><path d="M150 90l-2 -10M150 90l9 -5" stroke="#0369a1" stroke-width="2.5"/>' +
    '<rect x="42" y="190" width="136" height="24" rx="12" fill="#0369a1"/>' + T(110, 206, 'Masa = RAM (geçici)', 11, '#fff') +
    '<rect x="214" y="200" width="130" height="24" rx="12" fill="#065f46"/>' + T(279, 216, 'Dolap = Depolama', 11, '#fff'))

svg('yedek-ram.svg', '0 0 360 240', 'RAM modülü: bellek çipleri, altın temaslar ve ortada olmayan çentik',
    bg('h7yr') + ram(30, 70, 2.5, 'yr', True) +
    '<path d="M191 172v26" stroke="#b45309" stroke-width="2"/>' + T(191, 212, 'Çentik', 12, '#b45309') +
    '<path d="M90 152v40" stroke="#334155" stroke-width="1.5"/>' + T(90, 206, 'Altın temaslar', 11) +
    '<path d="M110 70v-22" stroke="#334155" stroke-width="1.5"/>' + T(110, 42, 'Bellek çipleri', 11))

svg('svg-quiz-centik.svg', '0 0 200 110', 'Bir RAM modülü; ok alt kenardaki temasların arasındaki boşluğu gösteriyor',
    '<rect width="200" height="110" rx="10" fill="#eef7fe"/>' + ram(20, 22, 1.33, 'qc') +
    '<path d="M106 100V76" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/><path d="M99 82l7-8 7 8" fill="none" stroke="#dc2626" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>')

# ── Adım 1: depolama → RAM → işlemci akışı (paketleri betik oynatır) ──
svg('bellek-akis.svg', '0 0 360 200', 'Uygulama depolamadan RAM’e yükleniyor; işlemci bilgiyi RAM’den çok hızlı alıp veriyor',
    bg('h7ba', '#ffffff', '#eef6ff', 360, 200, 16) +
    '<path d="M70 104H144" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 8"/>'
    '<path d="M222 104H266" stroke="#0ea5e9" stroke-width="9" stroke-linecap="round" opacity=".35"/>' +
    dolap(28, 50, 0.62) + ram_kucuk(150, 96, 1.2) + cpu(276, 76, 0.9) +
    T(45, 150, 'Depolama', 12, '#065f46') + T(45, 164, 'kalıcı · daha yavaş', 9, '#64748b', weight=700) +
    T(186, 150, 'RAM', 12, '#0369a1') + T(186, 164, 'geçici · çok hızlı', 9, '#64748b', weight=700) +
    T(301, 150, 'İşlemci', 12, '#334155') + T(301, 164, 'işi yapar', 9, '#64748b', weight=700) +
    '<g class="ba-paket ba-yukle"><rect x="-8" y="-8" width="16" height="16" rx="3.5" class="ba-renk"/></g>'
    '<g class="ba-paket ba-islem ba-i1"><rect x="-5" y="-5" width="10" height="10" rx="2.5" class="ba-renk"/></g>'
    '<g class="ba-paket ba-islem ba-i2"><rect x="-5" y="-5" width="10" height="10" rx="2.5" class="ba-renk"/></g>'
    '<g class="ba-paket ba-islem ba-i3"><rect x="-5" y="-5" width="10" height="10" rx="2.5" class="ba-renk"/></g>'
    '<g class="ba-hiz ba-hiz1">' + T(107, 92, 'yükleniyor', 9, '#64748b', weight=800) + '</g>'
    '<g class="ba-hiz ba-hiz2">' + T(244, 88, 'çok hızlı', 9, '#0369a1', weight=900) + '</g>' +
    '<rect x="112" y="18" width="136" height="26" rx="13" fill="#fff" stroke="#cbd5e1" stroke-width="1.5"/>' + T(180, 35, 'Uygulama seç', 11, '#334155', ek=' class="ba-baslik"'))

# ── Etkinlik 2: kart ve kutu resimleri (80 × 60) ────────────────────
def kucuk(ad, aria, ic, zemin='#f1f5f9'):
    svg(ad, '0 0 80 60', aria, '<rect width="80" height="60" rx="10" fill="%s"/>' % zemin + ic)


def uyari_nokta(x, y):
    return '<circle cx="%s" cy="%s" r="6" fill="#ef4444"/><path d="M%s %sv4M%s %sv.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>' % (x, y, x, y - 3.5, x, y + 2.5)


def tik(x, y):
    return '<circle cx="%s" cy="%s" r="6" fill="#10b981"/><path d="M%s %sl2.2 2.2 4-4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>' % (x, y, x - 3, y, )


kucuk('is-odev-kaydedilmemis.svg', 'Kaydedilmemiş ödev yazısı', belge(25, 10, 1) + uyari_nokta(58, 16))
kucuk('is-hesap.svg', 'Hesap makinesi ekranındaki sonuç',
      '<rect x="26" y="8" width="28" height="44" rx="4" fill="#334155"/><rect x="30" y="12" width="20" height="9" rx="1.5" fill="#bbf7d0"/>' +
      T(48, 19.5, '42', 7.5, '#14532d', 'end', 900) + ''.join('<rect x="%d" y="%d" width="5" height="5" rx="1" fill="#94a3b8"/>' % (30 + (i % 3) * 7, 25 + (i // 3) * 7) for i in range(9)))
kucuk('is-pano.svg', 'Kopyalanan yazı (pano)',
      '<rect x="24" y="10" width="32" height="42" rx="4" fill="#d6a55f"/><rect x="31" y="6" width="18" height="8" rx="2" fill="#64748b"/><rect x="28" y="16" width="24" height="32" rx="2" fill="#fff"/>'
      '<path d="M32 24h16M32 30h16M32 36h10" stroke="#94a3b8" stroke-width="2.2"/>')
kucuk('is-oyun-ilerleme.svg', 'Oyunda kaydedilmemiş bölüm',
      gamepad(19, 8, 1) + '<rect x="18" y="40" width="44" height="8" rx="4" fill="#e2e8f0"/><rect x="18" y="40" width="30" height="8" rx="4" fill="#7c3aed"/>' + uyari_nokta(64, 12))
kucuk('is-odev-kayitli.svg', 'Kaydedilmiş ödev dosyası', belge(20, 10, 1) + disket(46, 30, 1))
kucuk('is-oyun-kurulu.svg', 'Bilgisayara kurulu oyun',
      '<rect x="14" y="36" width="52" height="14" rx="3" fill="#475569"/><circle cx="58" cy="43" r="2" fill="#22c55e"/>' + gamepad(21, 6, 0.95) + tik(66, 14))
kucuk('is-muzik-indirilmis.svg', 'İndirilmiş müzik dosyası',
      '<ellipse cx="30" cy="42" rx="7" ry="5" fill="#db2777"/><ellipse cx="50" cy="38" rx="7" ry="5" fill="#db2777"/><path d="M36 42V14l20-4v28" fill="none" stroke="#db2777" stroke-width="3.5"/>' + tik(66, 14))
kucuk('is-foto-kayitli.svg', 'Kaydedilmiş fotoğraf',
      '<rect x="16" y="12" width="44" height="34" rx="3" fill="#fff" stroke="#059669" stroke-width="2.5"/><path d="M19 43l12-14 8 9 6-6 12 11z" fill="#059669"/><circle cx="48" cy="22" r="3.5" fill="#f59e0b"/>' + disket(52, 34, 0.8))
kucuk('kutu-kaybolur.svg', 'Kaybolur: RAM’deydi', ram_kucuk(10, 26, 1) + simsek(58, 20, 1.3), '#fee2e2')
kucuk('kutu-kalir.svg', 'Kalır: depolamada kayıtlı', dolap(26, 6, 0.5) + tik(62, 16), '#dcfce7')

svg('mini-dolap.svg', '0 0 60 104', 'Dosya dolabı', dolap(3, 2, 1))

# ── Özet küçük resimleri ───────────────────────────────────────────
def oz(ad, aria, ic, zemin='#e0f2fe'):
    kucuk(ad, aria, ic, zemin)


oz('oz-1.svg', 'Bellek: RAM ve işlemci', ram_kucuk(6, 24, 0.75) + '<path d="M52 30h6" stroke="#0ea5e9" stroke-width="3" stroke-linecap="round"/>' + cpu(60, 20, 0.28))
oz('oz-2.svg', 'Masa ve dolap', masa(6, 26, 0.34, 120) + kart(12, 18, '#2563eb', 0.5) + kart(28, 18, '#7c3aed', 0.5) + dolap(54, 12, 0.36))
oz('oz-3.svg', 'Geçici: elektrik gidince silinir', kart(10, 20, '#d97706', 1) + '<rect x="10" y="20" width="28" height="20" fill="#e0f2fe" opacity=".55"/>' + simsek(56, 30, 1.6), '#fef3c7')
oz('oz-4.svg', 'Kapasite: 4, 8, 16 GB',
   '<rect x="14" y="36" width="12" height="10" rx="2" fill="#7dd3fc"/><rect x="34" y="26" width="12" height="20" rx="2" fill="#38bdf8"/><rect x="54" y="10" width="12" height="36" rx="2" fill="#0284c7"/>' +
   T(20, 55, '4', 7) + T(40, 55, '8', 7) + T(60, 55, '16', 7))
oz('oz-5.svg', 'Yetmezse: bekleme çubuğu uzar',
   '<rect x="10" y="38" width="60" height="9" rx="4.5" fill="#fee2e2"/><rect x="10" y="38" width="46" height="9" rx="4.5" fill="#ef4444"/>' +
   kart(12, 10, '#2563eb', 0.6) + '<path d="M36 17h12" stroke="#64748b" stroke-width="2"/><path d="M44 13l4 4-4 4" fill="none" stroke="#64748b" stroke-width="2"/>' + dolap(54, 4, 0.26), '#fef2f2')
oz('oz-6.svg', 'RAM modülü ve çentiği', ram(8, 18, 0.53, 'oz6', True))

print('SVG dosyaları üretildi.')
