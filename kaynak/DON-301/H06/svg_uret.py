# DON-301 H06 SVG üretici: python3 svg_uret.py  (bu klasörde çalıştırılır)
# Not: güç kaynağı her çizimde KAPALI kutu olarak çizilir; içi gösterilmez.
F = 'font-family="Inter,Arial,sans-serif"'
M = 'font-family="JetBrains Mono,Consolas,monospace"'


def w(ad, s):
    open(ad, 'w').write(s.strip() + '\n')


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, fam=F):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x, y, fam, size, weight, fill, anchor, t)


def bg(i, a='#f8fafc', b='#e0f2fe', W=360, H=240):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
            '</linearGradient></defs><rect width="%d" height="%d" rx="16" fill="url(#%s)"/>' % (i, a, b, W, H, i))


def psu(x, y, s=1.0, yazi=None):
    """Kapalı ATX güç kaynağı (yandan–önden), fan ızgarası ve uyarı üçgeni. Genişlik 110·s, yükseklik 64·s."""
    W, H = 110 * s, 64 * s
    g = '<g transform="translate(%s %s)">' % (x, y)
    g += '<rect width="%.1f" height="%.1f" rx="%.1f" fill="#1f2328"/>' % (W, H, 6 * s)
    g += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" fill="#2b3037"/>' % (4 * s, 4 * s, W - 8 * s, H - 8 * s, 4 * s)
    cx, cy, r = W * 0.36, H / 2, 22 * s
    g += '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#101215" stroke="#4b5563" stroke-width="%.1f"/>' % (cx, cy, r, 1.5 * s)
    for k in (0.75, 0.5, 0.25):
        g += '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="#4b5563" stroke-width="%.1f"/>' % (cx, cy, r * k, 1.2 * s)
    g += '<path d="M%.1f %.1fH%.1fM%.1f %.1fV%.1f" stroke="#4b5563" stroke-width="%.1f"/>' % (cx - r, cy, cx + r, cx, cy - r, cy + r, 1.2 * s)
    tx, ty = W * 0.78, H * 0.3
    g += '<path d="M%.1f %.1fl%.1f %.1fh%.1fz" fill="#facc15" stroke="#111" stroke-width="%.1f" stroke-linejoin="round"/>' % (tx, ty - 9 * s, 10 * s, 17 * s, -20 * s, 1.2 * s)
    g += '<path d="M%.1f %.1fl%.1f %.1fh%.1fl%.1f %.1f" fill="none" stroke="#111" stroke-width="%.1f" stroke-linecap="round" stroke-linejoin="round"/>' % (tx + 1.5 * s, ty - 4 * s, -3.5 * s, 5 * s, 3.5 * s, -3 * s, 6 * s, 1.4 * s)
    if yazi:
        g += T(W * 0.78, H * 0.78, yazi, 9 * s, '#e5e7eb', weight=900)
    return g + '</g>'


# ── Isınma: bileşenler ≈ 420 W; üç güç kaynağı seçeneği
def cip(x, y, w_, ad, deger, renk):
    return ('<rect x="%s" y="%s" width="%s" height="22" rx="6" fill="%s"/>' % (x, y, w_, renk) +
            T(x + 8, y + 15, ad, 9.5, '#fff', 'start', 800) + T(x + w_ - 8, y + 15, deger, 9.5, '#fff', 'end', 900))


is_s = '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Solda bileşenlerin güçleri: işlemci 125 W, ekran kartı 220 W, anakart 40 W, diğer 35 W; toplam yaklaşık 420 W. Sağda 450 W, 550 W ve 1200 W güç kaynakları ve soru işareti">'
is_s += bg('h6is')
is_s += T(92, 26, 'Tam yükte güç (yaklaşık)', 10.5, '#334155')
is_s += cip(18, 36, 148, 'İşlemci (TDP)', '125 W', '#4f46e5')
is_s += cip(18, 62, 148, 'Ekran kartı', '220 W', '#0e7490')
is_s += cip(18, 88, 148, 'Anakart', '40 W', '#15803d')
is_s += cip(18, 114, 148, 'RAM · SSD · fan · USB', '35 W', '#b45309')
is_s += '<path d="M18 144H166" stroke="#334155" stroke-width="1.5"/>'
is_s += T(92, 166, 'Toplam ≈ 420 W', 15, '#0f172a', weight=900)
for i, (ad, yy) in enumerate([('450 W', 30), ('550 W', 104), ('1200 W', 178)]):
    is_s += psu(200, yy, 0.62)
    is_s += '<rect x="274" y="%d" width="70" height="24" rx="12" fill="#fff" stroke="#cbd5e1" stroke-width="1.5"/>' % (yy + 8)
    is_s += T(309, yy + 25, ad, 12, '#0f172a', weight=900)
is_s += '<circle cx="182" cy="206" r="16" fill="#fff" stroke="#f59e0b" stroke-width="3"/>' + T(182, 213, '?', 18, '#b45309', weight=900)
is_s += T(92, 206, 'Hangisi uygun?', 12, '#b45309', weight=900)
w('isinma.svg', is_s + '</svg>')


# ── Konnektör ön görünüşleri (yedek ve özet için)
def minifit(x, y, sutun, renk_ust, renk_alt, s=1.0, kilit_sutun=None, ayrim=None):
    P = 9 * s
    g = '<g transform="translate(%s %s)">' % (x, y)
    Wd, Hd = sutun * P + 4 * s, 2 * P + 4 * s
    g += '<rect width="%.1f" height="%.1f" rx="%.1f" fill="#1a1b1f"/>' % (Wd, Hd, 2.5 * s)
    for c in range(sutun):
        for r, renk in ((0, renk_ust), (1, renk_alt)):
            px, py = 2 * s + c * P + 1.2 * s, 2 * s + r * P + 1.2 * s
            g += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" fill="#050506" stroke="%s" stroke-width="%.1f"/>' % (
                px, py, P - 2.4 * s, P - 2.4 * s, 1.8 * s if (c + r) % 2 else 0.4 * s, renk[c] if renk[c] else '#333', 1.4 * s)
    if kilit_sutun is not None:
        kx = 2 * s + kilit_sutun * P
        g += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" fill="#1a1b1f"/>' % (kx - 5 * s, -5 * s, 10 * s, 6 * s, 1.5 * s)
    if ayrim is not None:
        ax = 2 * s + ayrim * P
        g += '<path d="M%.1f 0V%.1f" stroke="#e2e8f0" stroke-width="%.1f"/>' % (ax, Hd, 1.2 * s)
    return g + '</g>'


Y, R, O, B, G, PU, GR, BL = '#f2c230', '#e0463a', '#f08a24', '#94a3b8', '#34b060', '#8b5cf6', '#cbd5e1', '#3b82f6'
ATX_UST = [O, BL, B, G, B, B, B, None, R, R, R, B]
ATX_ALT = [O, O, B, R, B, R, B, GR, PU, Y, Y, O]


def sata(x, y, s=1.0):
    g = '<g transform="translate(%s %s)">' % (x, y)
    g += '<rect width="%.1f" height="%.1f" rx="%.1f" fill="#1a1b1f"/>' % (60 * s, 18 * s, 3 * s)
    g += '<path d="M%.1f %.1fH%.1fV%.1fH%.1fV%.1fH%.1fz" fill="#050506"/>' % (5 * s, 7 * s, 49 * s, 3 * s, 55 * s, 15 * s, 5 * s)
    for i in range(15):
        g += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="#d6a24a"/>' % (7 * s + i * 2.8 * s, 9 * s, 1.3 * s, 4 * s)
    return g + '</g>'


yk = '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Güç konnektörlerinin pin yüzleri: 24-pin ATX, 8-pin EPS, 6+2 pin PCIe ve SATA güç; tel renkleri ve kilit tırnakları">'
yk += bg('h6yk')
yk += minifit(22, 44, 12, ATX_UST, ATX_ALT, 1.2, kilit_sutun=5, ayrim=10) + T(92, 100, '24-pin ATX (20+4) · anakart', 10.5, '#0f172a')
yk += minifit(196, 44, 4, [Y, Y, Y, Y], [B, B, B, B], 1.2, kilit_sutun=1, ayrim=2) + T(220, 100, '8-pin EPS · işlemci', 10.5, '#0f172a')
yk += minifit(288, 44, 4, [B, B, B, B], [Y, Y, Y, B], 1.2, kilit_sutun=1.5, ayrim=3) + T(312, 100, '6+2 PCIe · GPU', 10.5, '#0f172a')
yk += sata(40, 140, 1.5) + T(85, 190, 'SATA güç · 15 pin · L ağız', 10.5, '#0f172a')
yk += ('<g %s font-size="10" font-weight="800"><rect x="206" y="128" width="136" height="80" rx="10" fill="#fff" stroke="#cbd5e1"/>' % F +
       '<rect x="216" y="138" width="14" height="8" fill="%s"/><text x="236" y="146" fill="#334155">sarı: +12 V</text>' % Y +
       '<rect x="216" y="154" width="14" height="8" fill="%s"/><text x="236" y="162" fill="#334155">kırmızı: +5 V</text>' % R +
       '<rect x="216" y="170" width="14" height="8" fill="%s"/><text x="236" y="178" fill="#334155">turuncu: +3,3 V</text>' % O +
       '<rect x="216" y="186" width="14" height="8" fill="#1c1d21"/><text x="236" y="194" fill="#334155">siyah: toprak</text></g>')
w('yedek-kablo.svg', yk + '</svg>')


# ── Kapak yedeği
kp = '<svg viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kapalı ATX güç kaynağı, güç konnektörleri ve kule tipi işlemci soğutucusu">'
kp += bg('h6kp', '#1e1b4b', '#312e81')
kp += psu(24, 70, 1.15, '550 W')
kp += minifit(40, 170, 12, ATX_UST, ATX_ALT, 0.9, kilit_sutun=5, ayrim=10)
kp += minifit(160, 170, 4, [Y, Y, Y, Y], [B, B, B, B], 0.9, kilit_sutun=1, ayrim=2)
kp += '<g transform="translate(236 40)"><rect x="10" y="150" width="90" height="10" rx="2" fill="#94a3b8"/>'
for i in range(12):
    kp += '<rect x="0" y="%d" width="110" height="4" rx="1" fill="#cbd5e1"/>' % (30 + i * 9)
kp += '<rect x="0" y="22" width="110" height="6" rx="2" fill="#e5e7eb"/>'
for i in range(4):
    kp += '<rect x="%d" y="26" width="5" height="126" rx="2.5" fill="#c47a4c"/>' % (24 + i * 18)
kp += '<rect x="-14" y="30" width="12" height="110" rx="3" fill="#1f2328"/></g>'
w('yedek-kapak.svg', kp + '</svg>')


# ── Soğutucu yedeği: yandan kule soğutucu, ısı yolu okları
ys = '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="İşlemci üzerinde kule tipi soğutucu: ısı macundan tabana, ısı borularından kanatçıklara geçer; fan havayı arkaya iter">'
ys += bg('h6ys')
ys += '<rect x="90" y="200" width="160" height="10" rx="2" fill="#1f5a3a"/><rect x="140" y="190" width="60" height="10" rx="2" fill="#c8cdd4"/><rect x="140" y="187" width="60" height="3" fill="#9da2a8"/>'
ys += '<rect x="136" y="176" width="68" height="11" rx="2" fill="#c47a4c"/>'
for i in range(14):
    ys += '<rect x="110" y="%d" width="120" height="4" rx="1" fill="#cbd5e1"/>' % (40 + i * 9)
for i in range(4):
    ys += '<path d="M%d 176V40" stroke="#c47a4c" stroke-width="5" stroke-linecap="round"/>' % (146 + i * 16)
ys += '<rect x="86" y="44" width="20" height="120" rx="4" fill="#1f2328"/><circle cx="96" cy="104" r="6" fill="#4b5563"/>'
ys += '<path d="M40 104H80" stroke="#0ea5e9" stroke-width="4"/><path d="M76 98l8 6-8 6z" fill="#0ea5e9"/>' + T(52, 92, 'soğuk hava', 9.5, '#0369a1')
ys += '<path d="M236 104H300" stroke="#ef4444" stroke-width="4"/><path d="M296 98l8 6-8 6z" fill="#ef4444"/>' + T(290, 92, 'sıcak hava', 9.5, '#b91c1c')
ys += T(170, 28, 'Isı yolu: işlemci → macun → taban → ısı boruları → kanatçıklar → hava', 9.5, '#334155')
ys += T(170, 228, 'İşlemci', 10, '#0f172a')
w('yedek-sogutucu.svg', ys + '</svg>')


# ── Quiz görseli: 360 W sistem, %25 pay
q = '<svg viewBox="0 0 240 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Yığılmış çubuk: işlemci 105 W, ekran kartı 200 W, diğer 55 W; toplam 360 W, yüzde 25 pay eklenince kaç W">'
q += '<rect width="240" height="130" rx="10" fill="#f8fafc"/>'
q += T(120, 20, 'Tam yükte bileşen güçleri', 10, '#334155')
x0, olc = 14, 212 / 360.0
for ad, v, renk in (('İşlemci 105 W', 105, '#4f46e5'), ('Ekran kartı 200 W', 200, '#0e7490'), ('55 W', 55, '#b45309')):
    q += '<rect x="%.1f" y="32" width="%.1f" height="26" fill="%s"/>' % (x0, v * olc, renk) + T(x0 + v * olc / 2, 49, ad, 8.5, '#fff')
    x0 += v * olc
q += '<path d="M14 66H226" stroke="#334155" stroke-width="1.2"/><path d="M14 62v8M226 62v8" stroke="#334155" stroke-width="1.2"/>'
q += T(120, 82, 'Toplam ≈ 360 W', 11, '#0f172a', weight=900)
q += '<rect x="46" y="94" width="148" height="24" rx="12" fill="#fff" stroke="#f59e0b" stroke-width="2"/>' + T(120, 110, '+ %25 pay → ? W', 11, '#b45309', weight=900)
w('svg-quiz-guc.svg', q + '</svg>')


# ── Özet simgeleri 80×60
def oz(ad, aria, ic):
    w(ad, '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="80" height="60" rx="10" fill="#e0f2fe"/>%s</svg>' % (aria, ic))


oz('oz-1.svg', 'AC dalgası güç kaynağına girer, düz DC çizgiler çıkar',
   '<path d="M4 30c4-12 8-12 12 0s8 12 12 0" fill="none" stroke="#0369a1" stroke-width="2.5"/><rect x="30" y="18" width="20" height="24" rx="3" fill="#1f2328"/>'
   '<path d="M52 22H76" stroke="%s" stroke-width="3"/><path d="M52 30H76" stroke="%s" stroke-width="3"/><path d="M52 38H76" stroke="%s" stroke-width="3"/>' % (Y, R, O))
oz('oz-2.svg', 'Güç bütçesi çubuğu ve pay',
   '<rect x="8" y="22" width="22" height="14" fill="#4f46e5"/><rect x="30" y="22" width="26" height="14" fill="#0e7490"/><rect x="56" y="22" width="8" height="14" fill="#b45309"/>'
   '<rect x="64" y="22" width="10" height="14" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3 2"/>' + T(40, 52, '× 1,25', 9, '#b45309', fam=M))
oz('oz-3.svg', 'Prizden çekilen güç: DC çıkış ve ısı kaybı',
   '<rect x="8" y="14" width="64" height="12" rx="3" fill="#94a3b8"/><rect x="8" y="32" width="56" height="12" rx="3" fill="#10b981"/><rect x="64" y="32" width="8" height="12" rx="2" fill="#ef4444"/>'
   + T(40, 55, 'verim %90', 8, '#334155'))
oz('oz-4.svg', 'Güç konnektörleri', minifit(4, 12, 5, [O, B, G, B, R], [O, R, B, PU, Y], 0.8) + minifit(50, 12, 3, [Y, Y, Y], [B, B, B], 0.8)
   + sata(12, 38, 0.9))
oz('oz-5.svg', 'Kule soğutucu ve termometre',
   ''.join('<rect x="14" y="%d" width="36" height="3" rx="1" fill="#94a3b8"/>' % (10 + i * 5) for i in range(7)) +
   '<rect x="22" y="44" width="20" height="5" fill="#c47a4c"/><rect x="18" y="49" width="28" height="4" fill="#1f5a3a"/>'
   '<rect x="60" y="12" width="6" height="30" rx="3" fill="#fff" stroke="#334155"/><rect x="61.5" y="26" width="3" height="15" fill="#ef4444"/><circle cx="63" cy="44" r="5" fill="#ef4444"/>')
oz('oz-6.svg', 'Kasa hava akışı: önden giriş, arkadan çıkış',
   '<rect x="12" y="8" width="56" height="44" rx="4" fill="none" stroke="#334155" stroke-width="2"/>'
   '<path d="M4 22H22M4 38H22" stroke="#0ea5e9" stroke-width="3"/><path d="M58 18H76" stroke="#ef4444" stroke-width="3"/><path d="M40 4V16" stroke="#ef4444" stroke-width="3"/>'
   '<path d="M20 18l4 4-4 4M20 34l4 4-4 4M72 14l4 4-4 4" fill="none" stroke="#334155" stroke-width="1.5"/>')
