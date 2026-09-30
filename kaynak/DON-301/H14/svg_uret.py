# DON-301 H14 SVG üretici: python3 svg_uret.py (yardımcılar H08 svg_uret.py ile aynı)
# Marka-nötr çizimler: logo, marka adı ya da gerçek ürün kopyası yoktur. Fiyat yerine göreli "puan".
F = 'font-family="Inter,Arial,sans-serif"'
M = 'font-family="JetBrains Mono,Consolas,monospace"'


def w(ad, s):
    open(ad, 'w').write(s.strip() + '\n')


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, fam=F):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x, y, fam, size, weight, fill, anchor, t)


def bg(i, a='#f8fafc', b='#e0e7ff', W=360, H=240):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
            '</linearGradient></defs><rect width="%d" height="%d" rx="16" fill="url(#%s)"/>' % (i, a, b, W, H, i))


def isik(x, y, d, r=6):
    """Uyumluluk ışığı: renk + simge (renk tek başına bilgi taşımaz)."""
    renk = {'ok': '#10b981', 'uy': '#f59e0b', 'no': '#ef4444'}[d]
    s = '<circle cx="%s" cy="%s" r="%s" fill="%s"/>' % (x, y, r, renk)
    if d == 'ok':
        s += '<path d="M%s %s l%s %s l%s %s" fill="none" stroke="#fff" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round"/>' % (
            x - r * .45, y, r * .3, r * .35, r * .55, -r * .7, r * .3)
    elif d == 'uy':
        s += '<path d="M%s %s v%s M%s %s v.5" stroke="#fff" stroke-width="%s" stroke-linecap="round"/>' % (x, y - r * .5, r * .55, x, y + r * .5, r * .3)
    else:
        s += '<path d="M%s %s l%s %s M%s %s l%s %s" stroke="#fff" stroke-width="%s" stroke-linecap="round"/>' % (
            x - r * .4, y - r * .4, r * .8, r * .8, x + r * .4, y - r * .4, -r * .8, r * .8, r * .3)
    return s


def cpu(x, y, s=40, yazi='CPU', renk='#cbd5e1'):
    g = '<rect x="%s" y="%s" width="%s" height="%s" rx="4" fill="#475569"/>' % (x, y, s, s)
    g += '<rect x="%s" y="%s" width="%s" height="%s" rx="3" fill="%s"/>' % (x + s * .18, y + s * .18, s * .64, s * .64, renk)
    g += '<path d="M%s %s l%s 0 l%s %s z" fill="#fbbf24"/>' % (x + 3, y + s - 3, s * .16, -s * .16, s * .16)
    return g + T(x + s / 2, y + s / 2 + 3.5, yazi, s * .2, '#334155')


def ram(x, y, gen=70, yuk=16, centik=0.029, renk='#1d4b54'):
    cx = x + gen / 2 + centik * gen
    s = '<rect x="%s" y="%s" width="%s" height="%s" rx="1.5" fill="%s"/>' % (x, y, gen, yuk, renk)
    for i in range(6):
        s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="1" fill="#0f172a"/>' % (x + 4 + i * (gen - 8) / 6, y + yuk * .2, (gen - 8) / 6 - 2, yuk * .42)
    s += '<rect x="%s" y="%s" width="%s" height="%s" fill="#e3b04f"/>' % (x + 1, y + yuk * .8, gen - 2, yuk * .2)
    s += '<rect x="%.1f" y="%.1f" width="3" height="%.1f" fill="#f8fafc"/>' % (cx - 1.5, y + yuk * .72, yuk * .3)
    return s




def belge(x, y, w_, h, baslik, satir=4, renk='#6366f1'):
    s = '<rect x="%s" y="%s" width="%s" height="%s" rx="4" fill="#fff" stroke="#cbd5e1" stroke-width="1.5"/>' % (x, y, w_, h)
    s += '<rect x="%s" y="%s" width="%s" height="8" rx="2" fill="%s"/>' % (x + 5, y + 5, w_ * .55, renk)
    for i in range(satir):
        s += '<rect x="%s" y="%s" width="%s" height="3" rx="1.5" fill="#cbd5e1"/>' % (x + 5, y + 18 + i * 7, (w_ - 10) * (.9 if i % 2 == 0 else .7))
    return s + T(x + w_ / 2, y + h + 11, baslik, 8, '#c7d2fe', weight=700)


# ── Kapak: proje dosyası — ihtiyaç → parça listesi → uyumluluk → kanıt → rapor → jüri
k = ('<svg viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet" style="overflow:visible" xmlns="http://www.w3.org/2000/svg" role="img" '
     'aria-label="Proje dosyası: ihtiyaç analizi, parça listesi, uyumluluk tablosu, montaj kanıtları ve rapor sayfaları; sağda jüri masası" class="kapak-pr">'
     '<defs><linearGradient id="u14kBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#312e81"/></linearGradient></defs>'
     '<rect x="-600" y="-600" width="1560" height="1440" fill="url(#u14kBg)"/>'
     '<g stroke="#818cf8" stroke-opacity=".10">' + ''.join('<path d="M%d -600V840"/>' % x for x in range(-600, 960, 20)) +
     ''.join('<path d="M-600 %dH960"/>' % y for y in range(-600, 840, 20)) + '</g>')
sayfalar = [('İhtiyaç', '#f59e0b'), ('Parça listesi', '#6366f1'), ('Uyumluluk', '#10b981'), ('Kanıtlar', '#0ea5e9'), ('Rapor', '#a855f7')]
for i, (ad, renk) in enumerate(sayfalar):
    x = 14 + i * 46
    y = 40 + (i % 2) * 10
    k += '<g class="kp-s kp-s%d">' % i + belge(x, y, 40, 56, ad, 5, renk) + '</g>'
# uyumluluk ışıkları şeridi
for i, d in enumerate(['ok', 'ok', 'ok', 'uy', 'ok', 'ok']):
    k += isik(30 + i * 30, 150, d, 7)
k += T(105, 176, 'uyumluluk denetimi', 8.5, '#c7d2fe', weight=700)
# jüri masası
k += '<rect x="250" y="120" width="100" height="14" rx="4" fill="#475569"/><rect x="258" y="134" width="6" height="44" fill="#475569"/><rect x="336" y="134" width="6" height="44" fill="#475569"/>'
for i in range(3):
    cx = 268 + i * 32
    k += '<circle cx="%d" cy="92" r="9" fill="#c7d2fe"/><path d="M%d 118 q0 -16 12 -16 q12 0 12 16z" fill="#a5b4fc"/>' % (cx, cx - 12)
k += '<rect x="244" y="36" width="112" height="34" rx="10" fill="#fff"/><path d="M290 70 l6 8 l4 -8z" fill="#fff"/>'
k += T(300, 50, 'Neden bu güç', 8.5, '#312e81') + T(300, 62, 'kaynağı?', 8.5, '#312e81')
k += T(300, 196, 'Jüri', 9, '#c7d2fe', weight=700)
k += '<path class="kp-ok" d="M232 108 H248" stroke="#fbbf24" stroke-width="2.5"/><path d="M246 103 l6 5 -6 5z" fill="#fbbf24"/>'
k += T(180, 222, 'Öner · denetle · belgele · savun', 10, '#e0e7ff', weight=800)
k += '</svg>'
w('kapak.svg', k)

# ── Isınma: aynı bütçe, iki kullanıcı
s = ('<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="İki kullanıcı: ofiste belge hazırlayan bir çalışan ve oyun oynayan bir öğrenci; ikisinin de bütçesi 600 puan; ortada tek bir bilgisayar ve soru işareti">' + bg('u14is'))
# sol kullanıcı: ofis
s += '<rect x="20" y="40" width="120" height="150" rx="12" fill="#fff" stroke="#cbd5e1"/>'
s += '<circle cx="80" cy="76" r="16" fill="#fcd34d"/><path d="M52 124 q0 -30 28 -30 q28 0 28 30z" fill="#0ea5e9"/>'
s += '<rect x="44" y="130" width="72" height="30" rx="3" fill="#e2e8f0"/>' + ''.join('<rect x="50" y="%d" width="%d" height="3" rx="1.5" fill="#64748b"/>' % (136 + i * 7, 60 - i * 12) for i in range(3))
s += T(80, 178, 'Ofis: belge, tablo', 9.5, '#334155')
# sağ kullanıcı: oyun
s += '<rect x="220" y="40" width="120" height="150" rx="12" fill="#fff" stroke="#cbd5e1"/>'
s += '<circle cx="280" cy="76" r="16" fill="#a16207"/><path d="M252 124 q0 -30 28 -30 q28 0 28 30z" fill="#f97316"/>'
s += '<rect x="248" y="132" width="64" height="26" rx="13" fill="#334155"/><circle cx="262" cy="145" r="4" fill="#94a3b8"/><circle cx="298" cy="145" r="4" fill="#94a3b8"/>'
s += T(280, 178, 'Oyun: 3B, kare hızı', 9.5, '#334155')
for x in (80, 280):
    s += '<rect x="%d" y="16" width="70" height="18" rx="9" fill="#4f46e5"/>' % (x - 35) + T(x, 29, '600 puan', 9, '#fff')
s += '<rect x="158" y="96" width="44" height="54" rx="5" fill="#334155"/><circle cx="180" cy="136" r="6" fill="none" stroke="#94a3b8"/>'
s += '<path d="M142 120 H156 M204 120 H218" stroke="#94a3b8" stroke-width="2" stroke-dasharray="3 3"/>'
s += '<circle cx="180" cy="72" r="16" fill="#fff" stroke="#f59e0b" stroke-width="3"/>' + T(180, 79, '?', 18, '#b45309', weight=900)
s += T(180, 222, 'Aynı bütçe, aynı sistem mi?', 11, '#b45309') + '</svg>'
w('isinma.svg', s)

# ── Quiz görseli: uyumluluk tablosu kesiti
satirlar = [('Soket ve çipset', 'ok', 'A = A'), ('Bellek türü', 'ok', 'DDR5 = DDR5'), ('Kart uzunluğu', 'no', '305 > 280 mm'), ('Güç kaynağı', 'uy', 'pay %24')]
q = ('<svg viewBox="0 0 240 118" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Uyumluluk tablosu: soket uyumlu, bellek türü uyumlu, ekran kartı uzunluğu uyumsuz (305 mm, kasa 280 mm), güç kaynağı dikkat (pay yüzde 24)">'
     '<rect width="240" height="118" rx="10" fill="#fff" stroke="#cbd5e1"/>' + T(12, 16, 'Uyumluluk tablosu', 9.5, '#312e81', 'start'))
for i, (ad, d, kisa) in enumerate(satirlar):
    y = 30 + i * 21
    q += '<rect x="8" y="%d" width="224" height="18" rx="4" fill="%s"/>' % (y - 12, {'ok': '#ecfdf5', 'uy': '#fffbeb', 'no': '#fef2f2'}[d])
    q += isik(18, y - 3, d, 6) + T(30, y, ad, 8.5, '#0f172a', 'start', 700) + T(228, y, kisa, 8.5, {'ok': '#047857', 'uy': '#92400e', 'no': '#b91c1c'}[d], 'end', 800, M)
q += '</svg>'
w('svg-quiz-tablo.svg', q)


def oz(ad, aria, ic):
    w(ad, '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="80" height="60" rx="10" fill="#e0e7ff"/>%s</svg>' % (aria, ic))


def sayfa(x, y, renk, n=4):
    s = '<rect x="%s" y="%s" width="28" height="36" rx="3" fill="#fff" stroke="#94a3b8"/><rect x="%s" y="%s" width="16" height="5" rx="1" fill="%s"/>' % (x, y, x + 4, y + 4, renk)
    return s + ''.join('<rect x="%s" y="%s" width="%s" height="2.5" rx="1" fill="#cbd5e1"/>' % (x + 4, y + 13 + i * 5, 20 if i % 2 == 0 else 14) for i in range(n))


oz('oz-1.svg', 'İhtiyaç analizi: iki profil',
   '<circle cx="22" cy="22" r="8" fill="#0ea5e9"/><path d="M10 44 q0 -14 12 -14 q12 0 12 14z" fill="#0ea5e9"/>'
   '<circle cx="58" cy="22" r="8" fill="#f97316"/><path d="M46 44 q0 -14 12 -14 q12 0 12 14z" fill="#f97316"/>' + T(40, 55, '2 profil', 7.5, '#312e81'))
oz('oz-2.svg', 'Parça listesi ve puan', sayfa(10, 12, '#6366f1') + '<rect x="44" y="20" width="26" height="8" rx="4" fill="#e2e8f0"/><rect x="44" y="20" width="19" height="8" rx="4" fill="#6366f1"/>' + T(57, 42, 'puan', 8, '#312e81'))
oz('oz-3.svg', 'Uyumluluk tablosu', ''.join(isik(16, 14 + i * 12, d, 4.5) + '<rect x="26" y="%d" width="42" height="3" rx="1.5" fill="#94a3b8"/>' % (13 + i * 12) for i, d in enumerate(['ok', 'ok', 'uy', 'ok'])))
oz('oz-4.svg', 'Montaj ve kurulum kanıtları: fotoğraf ve ekran görüntüsü',
   '<rect x="10" y="14" width="28" height="22" rx="3" fill="#334155"/><circle cx="24" cy="25" r="6" fill="none" stroke="#e2e8f0" stroke-width="2"/>'
   '<rect x="42" y="14" width="28" height="22" rx="3" fill="#0f172a"/><rect x="46" y="19" width="16" height="2.5" fill="#7dd3fc"/><rect x="46" y="25" width="12" height="2.5" fill="#7dd3fc"/>' + T(40, 50, 'tarih · saat', 7, '#312e81'))
oz('oz-5.svg', 'Rapor', sayfa(14, 10, '#a855f7', 5) + sayfa(38, 14, '#10b981', 5))
oz('oz-6.svg', 'Jüri sunumu', '<rect x="10" y="12" width="36" height="24" rx="3" fill="#fff" stroke="#94a3b8"/><rect x="14" y="18" width="12" height="12" fill="#6366f1"/><rect x="28" y="24" width="14" height="6" fill="#f59e0b"/>'
   + ''.join('<circle cx="%d" cy="42" r="4" fill="#a5b4fc"/>' % (54 + i * 9) for i in range(3)) + '<rect x="50" y="46" width="26" height="4" rx="2" fill="#475569"/>')
