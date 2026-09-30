# DON-301 H07 SVG üretici: python3 svg_uret.py  (bu klasörde çalıştırılır)
# Marka/logo yok; fiş ve port yüzleri sade, gerçek oranlara yakın çizilir.
F = 'font-family="Inter,Arial,sans-serif"'
M = 'font-family="JetBrains Mono,Consolas,monospace"'


def w(ad, s):
    open(ad, 'w').write(s.strip() + '\n')


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, fam=F):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x, y, fam, size, weight, fill, anchor, t)


def bg(i, a='#f8fafc', b='#e0f2fe', W=360, H=240):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
            '</linearGradient></defs><rect width="%d" height="%d" rx="16" fill="url(#%s)"/>' % (i, a, b, W, H, i))


# ── Port / fiş yüzleri (ön görünüş). Genişlikler mm oranında: HDMI 14 × 4,5 · DP 16 × 4,8 · USB-C 8,3 × 2,5 · USB-A 12 × 4,5
def hdmi(x, y, s=1.0, dolgu='#1f2937', kenar='#94a3b8'):
    w_, h, p = 14 * s, 4.6 * s, 1.6 * s
    d = 'M%.1f %.1fh%.1fv%.1fl%.1f %.1fh%.1fl%.1f %.1fz' % (x, y, w_, h - p, -p, p, -(w_ - 2 * p), -p, -p)
    return '<path d="%s" fill="%s" stroke="%s" stroke-width="%.1f" stroke-linejoin="round"/>' % (d, dolgu, kenar, 0.9 * s) + \
        '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" fill="%s"/>' % (x + 2.2 * s, y + 1.4 * s, w_ - 4.4 * s, 1.3 * s, 0.4 * s, '#d6a24a')


def dp(x, y, s=1.0, dolgu='#1f2937', kenar='#94a3b8'):
    w_, h, p = 16 * s, 4.8 * s, 2.0 * s
    d = 'M%.1f %.1fh%.1fv%.1fl%.1f %.1fh%.1fz' % (x, y, w_, h - p, -p, p, -(w_ - p))
    return '<path d="%s" fill="%s" stroke="%s" stroke-width="%.1f" stroke-linejoin="round"/>' % (d, dolgu, kenar, 0.9 * s) + \
        '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" fill="%s"/>' % (x + 2 * s, y + 1.6 * s, w_ - 5 * s, 1.3 * s, 0.4 * s, '#d6a24a')


def usbc(x, y, s=1.0, dolgu='#1f2937', kenar='#94a3b8'):
    w_, h = 8.4 * s, 2.6 * s
    return ('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" fill="%s" stroke="%s" stroke-width="%.1f"/>' % (x, y, w_, h, h / 2, dolgu, kenar, 0.9 * s) +
            '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" fill="#d6a24a"/>' % (x + 1.6 * s, y + 0.95 * s, w_ - 3.2 * s, 0.7 * s, 0.3 * s))


def usba(x, y, s=1.0, dil='#1f2937'):
    w_, h = 12 * s, 4.6 * s
    return ('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" fill="#e5e7eb" stroke="#94a3b8" stroke-width="%.1f"/>' % (x, y, w_, h, 0.5 * s, 0.9 * s) +
            '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="#111827"/>' % (x + 0.8 * s, y + 0.8 * s, w_ - 1.6 * s, h - 1.6 * s) +
            '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" fill="%s"/>' % (x + 1.1 * s, y + 1.0 * s, w_ - 2.2 * s, 1.5 * s, 0.3 * s, dil))


def fan(cx, cy, r, renk='#334155'):
    g = '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#0f172a" stroke="#475569" stroke-width="1.2"/>' % (cx, cy, r)
    for i in range(7):
        g += '<path d="M%.1f %.1fq%.1f %.1f %.1f %.1f" fill="none" stroke="%s" stroke-width="%.1f" stroke-linecap="round" transform="rotate(%d %.1f %.1f)"/>' % (
            cx, cy - r * 0.25, r * 0.45, -r * 0.2, r * 0.3, -r * 0.7, renk, r * 0.28, i * 360 / 7, cx, cy)
    g += '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#1e293b" stroke="#64748b"/>' % (cx, cy, r * 0.28)
    return g


def gpu_yan(x, y, s=1.0):
    """Ekran kartı (fan yüzü, yandan): 220·s × 96·s. Braket solda, PCIe tarağı altta."""
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    g += '<rect x="0" y="0" width="12" height="96" rx="2" fill="#cbd5e1" stroke="#94a3b8"/>'
    for i in range(4):
        g += '<rect x="3" y="%d" width="6" height="14" rx="2" fill="#1f2937"/>' % (8 + i * 20)
    g += '<rect x="12" y="6" width="206" height="78" rx="10" fill="#1f2328"/>'
    g += '<rect x="16" y="10" width="198" height="70" rx="8" fill="#2b3037"/>'
    g += fan(68, 45, 30) + fan(164, 45, 30)
    g += '<rect x="182" y="0" width="24" height="7" rx="2" fill="#111827"/>'
    g += '<rect x="40" y="84" width="170" height="4" fill="#1d1f24"/>'
    g += '<rect x="46" y="88" width="10" height="8" fill="#d6a24a"/><rect x="60" y="88" width="120" height="8" fill="#d6a24a"/>'
    return g + '</g>'


def monitor(x, y, w_, h, ekran_ic='', cerceve='#1f2937'):
    g = '<rect x="%s" y="%s" width="%s" height="%s" rx="7" fill="%s"/>' % (x, y, w_, h, cerceve)
    g += '<rect x="%s" y="%s" width="%s" height="%s" rx="3" fill="#0e7490"/>' % (x + 5, y + 5, w_ - 10, h - 14)
    g += '<path d="M%s %sl-6 22h%s l-6 -22z" fill="#334155"/>' % (x + w_ / 2 - 8, y + h, 28)
    g += '<rect x="%s" y="%s" width="%s" height="5" rx="2.5" fill="#334155"/>' % (x + w_ / 2 - 28, y + h + 21, 56)
    return g + ekran_ic


# ── Isınma: 144 Hz monitör, ayarlarda yalnız 60 Hz
s = '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Solda 2560 × 1440, 144 Hz etiketli monitör eski bir HDMI kablosuyla ekran kartına bağlı. Sağda ekran ayarlarında yenileme hızı listesinde yalnız 60 Hz görünüyor; soru işareti">'
s += bg('h7is')
s += monitor(18, 20, 176, 108)
s += T(106, 66, '2560 × 1440', 16, '#fff', weight=900, fam=M)
s += T(106, 88, 'hareket takılıyor', 10.5, '#cffafe', weight=800)
s += '<rect x="150" y="104" width="40" height="16" rx="8" fill="#facc15"/>' + T(170, 116, '144 Hz', 9.5, '#111827', weight=900)
s += '<path d="M106 150C106 180 70 186 60 206" fill="none" stroke="#1f2937" stroke-width="4" stroke-linecap="round"/>'
s += '<rect x="40" y="200" width="46" height="18" rx="4" fill="#1f2937"/>' + hdmi(49, 204.5, 2.0, '#334155', '#cbd5e1')
s += T(63, 232, 'eski HDMI kablosu', 9.5, '#475569', weight=800)
s += '<g transform="translate(100 196)"><rect width="84" height="30" rx="6" fill="#1f2328"/>' + fan(22, 15, 11) + fan(56, 15, 11) + '</g>'
s += T(142, 238, 'ekran kartı', 9, '#475569', weight=800)
s += '<rect x="208" y="24" width="138" height="148" rx="12" fill="#fff" stroke="#cbd5e1" stroke-width="1.5"/>'
s += T(277, 44, 'Ekran ayarları', 11.5, '#0f172a', weight=900)
s += T(218, 66, 'Çözünürlük', 9.5, '#64748b', 'start', 800)
s += '<rect x="218" y="71" width="118" height="20" rx="5" fill="#f1f5f9" stroke="#cbd5e1"/>' + T(226, 85, '2560 × 1440', 10, '#0f172a', 'start', 800, M)
s += T(218, 108, 'Yenileme hızı', 9.5, '#64748b', 'start', 800)
s += '<rect x="218" y="113" width="118" height="20" rx="5" fill="#f1f5f9" stroke="#4f46e5" stroke-width="1.6"/>' + T(226, 127, '60 Hz', 10, '#0f172a', 'start', 900, M) + T(326, 127, '▾', 10, '#4f46e5', weight=900)
s += '<rect x="218" y="135" width="118" height="30" rx="5" fill="#fff" stroke="#e2e8f0"/>' + T(226, 147, '60 Hz', 9, '#334155', 'start', 800, M) + T(226, 160, '59 Hz', 9, '#94a3b8', 'start', 700, M)
s += '<circle cx="312" cy="198" r="22" fill="#fff" stroke="#f59e0b" stroke-width="3"/>' + T(312, 207, '?', 24, '#b45309', weight=900)
s += T(250, 204, '144 Hz nerede?', 11, '#b45309', weight=900)
w('isinma.svg', s + '</svg>')


# ── Kapak yedeği
k = '<svg viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Çift fanlı ekran kartı; önünde HDMI, DisplayPort ve USB-C fişleri">'
k += bg('h7kp', '#1e1b4b', '#312e81')
k += gpu_yan(40, 40, 1.25)
for i, (fn, ad) in enumerate([(hdmi, 'HDMI'), (dp, 'DisplayPort'), (usbc, 'USB-C')]):
    x = 70 + i * 90
    k += '<rect x="%d" y="182" width="70" height="36" rx="8" fill="#0f172a" stroke="#6366f1"/>' % x
    k += fn(x + (35 - (14 if fn is hdmi else 16 if fn is dp else 8.4) * 1.6), 190, 3.2 if fn is usbc else 1.6)
    k += T(x + 35, 214, ad, 9, '#c7d2fe', weight=800)
w('yedek-kapak.svg', k + '</svg>')


# ── VRAM yedeği: GPU çipi ve 8 bellek çipi, veri yolları
v = '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Soğutucusu ayrılmış ekran kartı: ortada GPU çipi, çevresinde sekiz VRAM çipi; her çipten GPU’ya kısa veri yolları">'
v += bg('h7vr')
v += '<rect x="30" y="30" width="300" height="180" rx="12" fill="#1d1f24"/>'
v += '<rect x="150" y="90" width="60" height="60" rx="5" fill="#1e4d33"/><rect x="163" y="103" width="34" height="34" rx="3" fill="#9ca3af"/>'
v += T(180, 124, 'GPU', 11, '#0f172a', weight=900)
yer = [(100, 70), (100, 110), (100, 150), (238, 70), (238, 110), (238, 150), (156, 44), (186, 44)]
for (x, y) in yer:
    cx, cy = x + 11, y + 9
    v += '<path d="M%d %dL180 120" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="4 3" opacity=".8"/>' % (cx, cy)
for (x, y) in yer:
    v += '<rect x="%d" y="%d" width="22" height="18" rx="2" fill="#3a3d44" stroke="#64748b"/>' % (x, y)
v += T(64, 116, 'VRAM', 11, '#e2e8f0', weight=900) + T(64, 130, 'çipleri', 9.5, '#cbd5e1', weight=700)
v += T(180, 196, '256 bit × 20 Gbit/s ÷ 8 = 640 GB/s', 11, '#fde68a', weight=900, fam=M)
w('yedek-vram.svg', v + '</svg>')


# ── Port yedeği: HDMI ve DP yüzleri + sürüm tablosu
p = '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="HDMI fişi iki alt köşesi eğik, DisplayPort fişi tek köşesi eğik ve kilitli; altında sürümlere göre bant genişliği tablosu">'
p += bg('h7pt')
p += hdmi(40, 30, 6.0) + T(82, 80, 'HDMI · iki köşe eğik', 11, '#0f172a', weight=900)
p += dp(196, 30, 6.0) + T(244, 80, 'DisplayPort · tek köşe eğik', 11, '#0f172a', weight=900)
rows = [('HDMI 1.4', '8,2 Gbit/s', '4K 30 Hz'), ('HDMI 2.0', '14,4 Gbit/s', '4K 60 Hz'), ('HDMI 2.1', '42,7 Gbit/s', '4K 144 Hz'),
        ('DP 1.2', '17,3 Gbit/s', '4K 60 Hz'), ('DP 1.4', '25,9 Gbit/s', '4K 120 Hz'), ('DP 2.1', '77,4 Gbit/s', '4K 240 Hz')]
for i, (a, b, c) in enumerate(rows):
    x, y = 24 + (i // 3) * 164, 102 + (i % 3) * 40
    p += '<rect x="%d" y="%d" width="150" height="32" rx="8" fill="#fff" stroke="#cbd5e1"/>' % (x, y)
    p += T(x + 10, y + 14, a, 10.5, '#0f172a', 'start', 900) + T(x + 140, y + 14, b, 9.5, '#4f46e5', 'end', 800, M) + T(x + 10, y + 27, 'en çok ≈ ' + c, 9, '#475569', 'start', 700)
w('yedek-port.svg', p + '</svg>')


# ── Quiz görseli: anakart arka paneli ve ekran kartı braketi, numaralı portlar
q = '<svg viewBox="0 0 240 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kasanın arkası: üstte anakart arka panelinde 1 numaralı HDMI ve 4 numaralı USB-A portu; altta ekran kartı braketinde 2 numaralı HDMI ve 3 numaralı DisplayPort">'
q += '<rect width="240" height="130" rx="10" fill="#f8fafc"/>'
q += '<rect x="14" y="10" width="212" height="44" rx="6" fill="#e2e8f0" stroke="#94a3b8"/>' + T(22, 22, 'Anakart arka paneli', 8.5, '#475569', 'start', 800)
q += hdmi(40, 30, 1.6) + usba(120, 30, 1.4, '#2563eb')
q += '<rect x="14" y="66" width="212" height="44" rx="6" fill="#cbd5e1" stroke="#64748b"/>' + T(22, 78, 'Ekran kartı braketi', 8.5, '#334155', 'start', 800)
q += hdmi(40, 86, 1.6) + dp(110, 86, 1.6) + dp(150, 86, 1.6) + dp(190, 86, 1.6)


def no(x, y, n):
    return '<circle cx="%s" cy="%s" r="7" fill="#4f46e5"/>' % (x, y) + T(x, y + 3.5, n, 9, '#fff', weight=900)


q += no(62, 48, '1') + no(62, 104, '2') + no(123, 104, '3') + no(128, 48, '4')
q += T(120, 124, 'Ekran kartı takılı · monitör girişleri: HDMI 2.0, DP 1.4', 8, '#475569', weight=800)
w('svg-quiz-port.svg', q + '</svg>')


# ── Özet küçük resimleri (80 × 60)
def oz(ad, aria, ic):
    w(ad, '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="80" height="60" rx="10" fill="#e0f2fe"/>%s</svg>' % (aria, ic))


c1 = '<rect x="6" y="14" width="26" height="30" rx="3" fill="#fff" stroke="#4f46e5"/>'
for i in range(4):
    c1 += '<rect x="%d" y="%d" width="9" height="9" rx="1.5" fill="#4f46e5"/>' % (9 + (i % 2) * 11, 18 + (i // 2) * 12)
c1 += '<rect x="38" y="10" width="36" height="38" rx="3" fill="#fff" stroke="#0e7490"/>'
for i in range(48):
    c1 += '<rect x="%.1f" y="%.1f" width="3.2" height="3.2" rx=".6" fill="#0e7490"/>' % (41 + (i % 8) * 4, 13 + (i // 8) * 5.5)
oz('oz-1.svg', 'Az sayıda güçlü işlemci çekirdeği ve çok sayıda basit GPU çekirdeği', c1 + T(19, 54, 'CPU', 8, '#312e81', weight=900) + T(56, 56, 'GPU', 8, '#155e75', weight=900))

c2 = ('<rect x="6" y="12" width="28" height="28" rx="3" fill="#475569"/><rect x="10" y="16" width="10" height="20" rx="1.5" fill="#94a3b8"/><rect x="22" y="16" width="8" height="20" rx="1.5" fill="#22d3ee"/>' +
      '<rect x="40" y="16" width="36" height="20" rx="3" fill="#1f2328"/><circle cx="50" cy="26" r="6" fill="#0f172a" stroke="#64748b"/><circle cx="66" cy="26" r="6" fill="#0f172a" stroke="#64748b"/>' +
      '<rect x="44" y="36" width="28" height="3" fill="#d6a24a"/>')
oz('oz-2.svg', 'Solda grafik birimi işlemcinin içinde, sağda ayrı ekran kartı', c2 + T(20, 52, 'iGPU', 8, '#0f172a', weight=900) + T(58, 52, 'dGPU', 8, '#0f172a', weight=900))

c3 = '<rect x="28" y="18" width="24" height="24" rx="3" fill="#1e4d33"/><rect x="34" y="24" width="12" height="12" rx="1.5" fill="#9ca3af"/>'
for (x, y) in [(10, 14), (10, 26), (10, 38), (58, 14), (58, 26), (58, 38), (30, 4), (42, 4)]:
    c3 += '<rect x="%d" y="%d" width="10" height="8" rx="1" fill="#3a3d44"/>' % (x, y)
oz('oz-3.svg', 'GPU çipi ve çevresindeki VRAM çipleri', c3 + T(40, 56, 'GB/s', 8, '#0f172a', weight=900))

oz('oz-4.svg', 'HDMI ve DisplayPort fiş yüzleri', hdmi(6, 16, 2.2) + dp(42, 16, 2.0) + T(21, 46, 'HDMI', 8, '#0f172a', weight=900) + T(58, 46, 'DP', 8, '#0f172a', weight=900))

c5 = usbc(12, 14, 6.6) + T(40, 44, '0,48 → 80', 9, '#0f172a', weight=900, fam=M) + T(40, 54, 'Gbit/s', 7.5, '#475569', weight=800)
oz('oz-5.svg', 'USB-C fiş yüzü ve hız aralığı', c5)

c6 = '<path d="M6 40H74" stroke="#94a3b8"/>'
for i in range(4):
    c6 += '<circle cx="%d" cy="22" r="3" fill="#f59e0b" opacity="%.2f"/>' % (10 + i * 18, 0.4 + i * 0.2)
for i in range(10):
    c6 += '<circle cx="%d" cy="34" r="2.2" fill="#4f46e5" opacity="%.2f"/>' % (10 + i * 6.6, 0.3 + i * 0.07)
oz('oz-6.svg', '60 Hz’de seyrek, 144 Hz’de sık kare konumları', c6 + T(40, 14, '60 Hz', 8, '#b45309', weight=900) + T(40, 52, '144 Hz', 8, '#3730a3', weight=900))
print('SVG üretildi.')
