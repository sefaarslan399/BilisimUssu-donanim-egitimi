# DON-301 H11 SVG üretici: python3 svg_uret.py
# Marka-nötr çizimler: logo, marka adı ya da gerçek bir arayüzün kopyası yoktur.
F = 'font-family="Inter,Arial,sans-serif"'
M = 'font-family="JetBrains Mono,Consolas,monospace"'


def w(ad, s):
    open(ad, 'w').write(s.strip() + '\n')


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, fam=F):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x, y, fam, size, weight, fill, anchor, t)


def bg(i, a='#f8fafc', b='#e0f2fe', W=360, H=240):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
            '</linearGradient></defs><rect width="%d" height="%d" rx="16" fill="url(#%s)"/>' % (i, a, b, W, H, i))


def led(x, y, ad, yanik=False, renk='#f59e0b', r=5):
    s = '<circle cx="%d" cy="%d" r="%d" fill="%s" stroke="#0f172a" stroke-width="1"/>' % (x, y, r, renk if yanik else '#334155')
    if yanik:
        s += '<circle cx="%d" cy="%d" r="%d" fill="none" stroke="%s" stroke-opacity=".45" stroke-width="3"/>' % (x, y, r + 3, renk)
    return s + T(x + r + 5, y + 3.5, ad, 8, '#e2e8f0' if not yanik else '#fde68a', 'start', 800, M)


# ── Kapak: marka-nötr UEFI ekranı + önyükleme zinciri (tam alan, taşan arka plan)
zincir = ['GÜÇ', 'POST', 'UEFI', 'ÖNYÜKLEYİCİ', 'İS']
kx = [28, 88, 148, 212, 300]
kw = [48, 48, 48, 76, 36]
k = ('<svg viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet" style="overflow:visible" xmlns="http://www.w3.org/2000/svg" role="img" '
     'aria-label="Önyükleme zinciri: güç, POST, UEFI, önyükleyici ve işletim sistemi; üstte sekmeli bir UEFI ayar ekranı" class="kapak-uefi">'
     '<defs><linearGradient id="u11kBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#0c4a6e"/></linearGradient></defs>'
     '<rect x="-600" y="-600" width="1560" height="1440" fill="url(#u11kBg)"/>'
     '<g stroke="#818cf8" stroke-opacity=".10">' + ''.join('<path d="M%d -600V840"/>' % x for x in range(-600, 960, 20)) +
     ''.join('<path d="M-600 %dH960"/>' % y for y in range(-600, 840, 20)) + '</g>')
# ekran
k += '<rect x="40" y="18" width="280" height="138" rx="10" fill="#0b1220" stroke="#6366f1" stroke-width="2"/>'
k += '<rect x="40" y="18" width="280" height="20" rx="10" fill="#1e293b"/><rect x="40" y="30" width="280" height="8" fill="#1e293b"/>'
k += T(52, 32, 'UEFI Ayarları', 9, '#c7d2fe', 'start', 800) + '<text class="ku-saat" x="308" y="32" %s font-size="8.5" font-weight="700" fill="#7dd3fc" text-anchor="end">09:41:07</text>' % M
sek = ['Ana', 'Gelişmiş', 'Önyükleme', 'Güvenlik', 'Çıkış']
sx = 48
for i, s in enumerate(sek):
    ww = 14 + len(s) * 5.4
    aktif = i == 2
    k += '<rect x="%.1f" y="43" width="%.1f" height="15" rx="4" fill="%s"/>' % (sx, ww, '#4f46e5' if aktif else '#1e293b')
    k += T(sx + ww / 2, 53.5, s, 8, '#fff' if aktif else '#94a3b8', 'middle', 800)
    sx += ww + 4
satir = [('Önyükleme seçeneği #1', 'USB bellek (UEFI)'), ('Önyükleme seçeneği #2', 'NVMe SSD'), ('CSM (Legacy desteği)', 'Kapalı'), ('Secure Boot', 'Etkin')]
for i, (a, b) in enumerate(satir):
    y = 66 + i * 19
    if i == 0:
        k += '<rect class="ku-sec" x="48" y="%d" width="264" height="16" rx="4" fill="#312e81" stroke="#818cf8"/>' % y
    k += T(56, y + 11.5, a, 8.5, '#e2e8f0', 'start', 700) + T(304, y + 11.5, b, 8.5, '#7dd3fc' if i else '#fde68a', 'end', 800, M)
k += T(180, 150, '↑↓ seç · Enter değiştir · F10 kaydet ve çık', 7.5, '#64748b', 'middle', 700)
# zincir
for i, ad in enumerate(zincir):
    x = kx[i]
    k += '<g class="kz kz%d"><rect x="%d" y="180" width="%d" height="30" rx="8" fill="#1e293b" stroke="#a5b4fc" stroke-width="1.5"/>' % (i, x, kw[i])
    k += T(x + kw[i] / 2, 199, ad, 8.5, '#e0e7ff', 'middle', 900) + '</g>'
    if i < 4:
        x2 = x + kw[i]
        k += '<path d="M%d 195H%d" stroke="#a5b4fc" stroke-width="2"/><path d="M%d 191l5 4-5 4z" fill="#a5b4fc"/>' % (x2 + 2, kx[i + 1] - 6, kx[i + 1] - 6)
k += T(180, 228, 'Güç düğmesinden işletim sistemine: önyükleme zinciri', 9, '#c7d2fe', 'middle', 700)
k += '</svg>'
w('kapak.svg', k)

# ── Isınma: fanlar dönüyor, ekran siyah, DRAM ışığı yanık
s = ('<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bilgisayar açık, fan dönüyor; monitörde sinyal yok; anakarttaki DRAM hata ışığı yanık kalıyor">' + bg('u11is'))
# kasa
s += '<rect x="18" y="40" width="84" height="150" rx="8" fill="#1e293b"/><rect x="26" y="50" width="68" height="10" rx="3" fill="#334155"/>'
s += '<circle cx="60" cy="112" r="26" fill="#0f172a" stroke="#64748b" stroke-width="2"/>'
s += '<g class="is-fan">' + ''.join('<path d="M60 112 L%s" stroke="#94a3b8" stroke-width="7" stroke-linecap="round"/>' % p for p in ['60 92', '77 122', '43 122']) + '</g>'
s += '<circle cx="60" cy="112" r="5" fill="#cbd5e1"/><circle cx="84" cy="176" r="4" fill="#22c55e"/>' + T(60, 206, 'fan dönüyor', 9, '#334155', weight=700)
# monitör
s += '<rect x="116" y="40" width="112" height="78" rx="6" fill="#0f172a"/><rect x="122" y="46" width="100" height="66" rx="3" fill="#020617"/>'
s += T(172, 83, 'Sinyal yok', 10, '#64748b', weight=700) + '<rect x="164" y="118" width="16" height="12" fill="#1e293b"/><rect x="150" y="130" width="44" height="5" rx="2" fill="#1e293b"/>'
# anakart yakın plan
s += '<rect x="240" y="30" width="106" height="124" rx="8" fill="#14532d" stroke="#166534" stroke-width="2"/>'
s += T(293, 46, 'anakart', 8, '#bbf7d0', weight=700)
for i, (ad, yan) in enumerate([('CPU', False), ('DRAM', True), ('VGA', False), ('BOOT', False)]):
    s += led(256, 64 + i * 22, ad, yan, '#ef4444')
s += '<path d="M318 88 H336" stroke="#fca5a5" stroke-width="2"/><path d="M318 84l-6 4 6 4z" fill="#fca5a5"/>'
s += T(293, 150, 'yanık kalıyor', 8.5, '#fecaca', weight=800)
s += '<rect x="250" y="160" width="86" height="1" fill="none"/>'
s += '<circle cx="180" cy="190" r="20" fill="#fff" stroke="#f59e0b" stroke-width="3"/>' + T(180, 198, '?', 22, '#b45309', weight=900)
s += T(180, 226, 'Görüntü yok, sorun nerede?', 11, '#b45309') + '</svg>'
w('isinma.svg', s)

# ── Quiz görseli: VGA ışığı yanık
q = ('<svg viewBox="0 0 220 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Anakart hata ışıkları: CPU, DRAM, VGA ve BOOT; VGA ışığı yanık ve okla gösterilmiş">'
     '<rect width="220" height="110" rx="10" fill="#14532d"/>' + T(110, 18, 'Açılışta yanık kalan ışık', 10, '#dcfce7'))
for i, (ad, yan) in enumerate([('CPU', False), ('DRAM', False), ('VGA', True), ('BOOT', False)]):
    q += led(22 + i * 50, 58, ad, yan, '#ef4444', 6)
q += '<path d="M128 90 V74" stroke="#fecaca" stroke-width="2"/><path d="M124 76l4-7 4 7z" fill="#fecaca"/>' + T(128, 102, 'yanık', 9, '#fecaca')
q += '</svg>'
w('svg-quiz-led.svg', q)


# ── Özet simgeleri 80×60
def oz(ad, aria, ic):
    w(ad, '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="80" height="60" rx="10" fill="#ede9fe"/>%s</svg>' % (aria, ic))


oz('oz-1.svg', 'BIOS ve UEFI',
   '<rect x="8" y="14" width="28" height="32" rx="4" fill="#94a3b8"/>' + T(22, 34, 'BIOS', 8, '#fff') +
   '<rect x="44" y="14" width="28" height="32" rx="4" fill="#6366f1"/>' + T(58, 34, 'UEFI', 8, '#fff') + '<path d="M37 30h5" stroke="#334155" stroke-width="2"/>')
oz('oz-2.svg', 'POST ve hata ışıkları',
   ''.join('<circle cx="%d" cy="24" r="5" fill="%s"/>' % (16 + i * 16, '#ef4444' if i == 1 else '#334155') for i in range(4)) +
   ''.join(T(16 + i * 16, 44, a, 6.5, '#334155', fam=M) for i, a in enumerate(['CPU', 'DRAM', 'VGA', 'BOOT'])))
oz('oz-3.svg', 'UEFI donanım bilgisi',
   '<rect x="10" y="8" width="60" height="44" rx="5" fill="#0f172a"/>' +
   ''.join('<rect x="16" y="%d" width="22" height="4" rx="2" fill="#94a3b8"/><rect x="44" y="%d" width="20" height="4" rx="2" fill="#7dd3fc"/>' % (16 + i * 9, 16 + i * 9) for i in range(4)))
oz('oz-4.svg', 'Önyükleme sırası',
   ''.join('<rect x="14" y="%d" width="52" height="11" rx="3" fill="%s"/>' % (8 + i * 15, '#6366f1' if i == 0 else '#cbd5e1') for i in range(3)) +
   T(40, 16.5, '1 · USB', 7.5, '#fff') + T(40, 31.5, '2 · SSD', 7.5, '#334155') + T(40, 46.5, '3 · Ağ', 7.5, '#334155'))
oz('oz-5.svg', 'XMP ve EXPO bellek profili',
   '<rect x="8" y="22" width="64" height="18" rx="2" fill="#15803d"/>' + ''.join('<rect x="%d" y="26" width="8" height="9" fill="#0f172a"/>' % (13 + i * 11) for i in range(5)) +
   '<rect x="8" y="40" width="64" height="4" fill="#eab308"/>' + T(40, 16, '4800 → 6000', 8, '#4338ca', fam=M))
oz('oz-6.svg', 'Secure Boot ve TPM',
   '<path d="M26 10l14 5v11c0 9-6 15-14 19-8-4-14-10-14-19V15z" fill="#6366f1"/><path d="M20 27l5 5 8-9" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>' +
   '<rect x="46" y="20" width="24" height="24" rx="3" fill="#0f172a"/>' + T(58, 35, 'TPM', 7, '#e0e7ff', fam=M) +
   ''.join('<path d="M%d 18v2M%d 44v2" stroke="#94a3b8" stroke-width="2"/>' % (50 + i * 6, 50 + i * 6) for i in range(4)))
