# DON-301 H13 SVG üretici: python3 svg_uret.py
# Marka-nötr çizimler: logo, marka adı ya da gerçek bir arayüzün kopyası yoktur. Güç kaynağının içi çizilmez.
F = 'font-family="Inter,Arial,sans-serif"'
M = 'font-family="JetBrains Mono,Consolas,monospace"'


def w(ad, s):
    open(ad, 'w').write(s.strip() + '\n')


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, fam=F):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x, y, fam, size, weight, fill, anchor, t)


def bg(i, a='#f8fafc', b='#e0f2fe', W=360, H=240):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
            '</linearGradient></defs><rect width="%d" height="%d" rx="16" fill="url(#%s)"/>' % (i, a, b, W, H, i))


def fan(cx, cy, r, sinif='', toz=False):
    s = '<circle cx="%s" cy="%s" r="%s" fill="#0f172a" stroke="#64748b" stroke-width="2"/>' % (cx, cy, r)
    s += '<g class="%s">' % sinif
    for a in (0, 120, 240):
        s += '<path d="M%s %s l0 %s" stroke="%s" stroke-width="%s" stroke-linecap="round" transform="rotate(%d %s %s)"/>' % (
            cx, cy, -(r - 5), '#94a3b8' if not toz else '#a8a29e', r * 0.3, a, cx, cy)
    s += '</g><circle cx="%s" cy="%s" r="%s" fill="#cbd5e1"/>' % (cx, cy, r * 0.2)
    if toz:
        for dx, dy, rr in ((-6, -8, 3.2), (7, -3, 2.6), (-3, 7, 2.8), (9, 8, 2.2), (-10, 3, 2)):
            s += '<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="#a8a29e" opacity=".9"/>' % (cx + dx, cy + dy, rr * 1.4, rr)
    return s


def hava_kutusu(x, y, h=64):
    """Basınçlı hava kutusu (etiketsiz, marka yok), dik; pipet sağa bakar."""
    s = '<rect x="%s" y="%s" width="26" height="%s" rx="7" fill="#60a5fa" stroke="#1d4ed8" stroke-width="2"/>' % (x, y, h)
    s += '<rect x="%s" y="%s" width="26" height="16" fill="#eff6ff"/>' % (x, y + h * 0.38)
    s += T(x + 13, y + h * 0.38 + 11, 'HAVA', 7, '#1e3a8a')
    s += '<rect x="%s" y="%s" width="14" height="8" rx="2" fill="#1e293b"/>' % (x + 6, y - 7)
    s += '<path d="M%s %s h26" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round"/>' % (x + 20, y - 3)
    return s


# ── Isınma: 20 dakikada bir kapanan bilgisayar
s = ('<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Zaman çizgisi: açılış sorunsuz, oyun başlıyor, yaklaşık 20. dakikada bilgisayar kendiliğinden kapanıyor; hata ışığı yanmıyor">' + bg('h13is'))
# kasa
s += '<rect x="20" y="36" width="80" height="140" rx="8" fill="#1e293b"/><rect x="28" y="46" width="64" height="8" rx="3" fill="#334155"/>'
s += fan(60, 104, 24, 'is-fan')
s += '<circle cx="84" cy="164" r="4" fill="#22c55e"/>' + T(60, 194, 'hata ışığı yok', 9, '#334155', weight=700)
# monitör
s += '<rect x="120" y="36" width="116" height="80" rx="6" fill="#0f172a"/><rect class="is-ekran" x="126" y="42" width="104" height="68" rx="3" fill="#312e81"/>'
s += T(178, 81, 'oyun açık', 10, '#e0e7ff', weight=800) + '<rect x="170" y="116" width="16" height="12" fill="#1e293b"/><rect x="156" y="128" width="44" height="5" rx="2" fill="#1e293b"/>'
# zaman çizgisi
s += '<path d="M120 164 H336" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>'
for x, t, e in ((124, '0 dk', 'açılış ✓'), (190, '5 dk', 'oyun başlar'), (318, '≈ 20 dk', 'kapandı')):
    renk = '#dc2626' if t.startswith('≈') else '#4f46e5'
    s += '<circle cx="%d" cy="164" r="6" fill="%s"/>' % (x, renk) + T(x, 184, t, 9, renk) + T(x, 198, e, 8.5, '#334155', weight=700)
s += '<path d="M244 156 q10 -18 22 -6 q10 -18 22 -2 q8 -14 20 0" fill="none" stroke="#f97316" stroke-width="2.5" stroke-linecap="round"/>'
s += T(276, 132, 'ısınıyor mu?', 9, '#c2410c')
s += '<circle cx="300" cy="72" r="22" fill="#fff" stroke="#f59e0b" stroke-width="3"/>' + T(300, 81, '?', 24, '#b45309', weight=900)
s += T(180, 226, 'Belirti: yükte, belli bir süre sonra kapanma', 11, '#b45309') + '</svg>'
w('isinma.svg', s)

# ── Kapak yedeği (WebGL yoksa): açık kasa + büyüteç + kontrol listesi
k = ('<svg viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" '
     'aria-label="Yan kapağı açık masaüstü kasa; büyüteçle soğutucu fanı inceleniyor, yanında sorun giderme kontrol listesi">')
k += '<rect x="40" y="26" width="150" height="190" rx="10" fill="#1f2937" stroke="#475569" stroke-width="3"/>'
k += '<rect x="52" y="38" width="126" height="120" rx="4" fill="#14532d"/>'
k += '<rect x="66" y="52" width="40" height="40" rx="4" fill="#9ca3af"/>' + ''.join('<rect x="%d" y="54" width="3" height="36" fill="#6b7280"/>' % (70 + i * 6) for i in range(6))
k += ''.join('<rect x="%d" y="50" width="5" height="54" rx="1" fill="#111827"/>' % (120 + i * 9) for i in range(4))
k += '<rect x="60" y="116" width="110" height="12" rx="3" fill="#111827"/>'
k += '<rect x="52" y="168" width="126" height="40" rx="4" fill="#0b0f16"/>' + T(115, 192, 'güç kaynağı · kapalı', 8, '#94a3b8', weight=700)
k += fan(158, 70, 13)
k += '<circle cx="150" cy="80" r="26" fill="#e0f2fe" fill-opacity=".35" stroke="#f59e0b" stroke-width="5"/><path d="M170 99 l20 20" stroke="#f59e0b" stroke-width="8" stroke-linecap="round"/>'
k += '<rect x="214" y="40" width="120" height="160" rx="12" fill="#fff" stroke="#c7d2fe" stroke-width="2"/>'
for i, t in enumerate(['Belirti', 'Hipotez', 'Test', 'Sonuç', 'Kayıt']):
    y = 66 + i * 28
    s2 = '<rect x="226" y="%d" width="16" height="16" rx="4" fill="%s"/>' % (y - 12, '#4f46e5' if i < 3 else '#e2e8f0')
    if i < 3:
        s2 += '<path d="M229 %d l4 4 6 -8" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>' % (y - 4)
    k += s2 + T(250, y, t, 11, '#1e293b', 'start')
k += '</svg>'
w('yedek-kapak.svg', k)

# ── Adım 4 yedeği: fan sabit, basınçlı hava dik, kısa püskürtme
b = ('<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fişi çekili bilgisayarda tozlu fan plastik çubukla sabitlenmiş; dik tutulan basınçlı hava kutusundan kısa püskürtme yapılıyor">' + bg('h13bk'))
b += '<rect x="150" y="40" width="130" height="130" rx="12" fill="#1f2937"/>' + fan(215, 105, 52, '', True)
b += '<rect x="96" y="92" width="120" height="9" rx="4.5" fill="#f59e0b" transform="rotate(-18 150 96)"/>' + T(118, 78, 'fan sabit', 10, '#b45309')
b += hava_kutusu(40, 120, 70) + '<path d="M92 117 l40 -10" stroke="#93c5fd" stroke-width="10" stroke-opacity=".5" stroke-linecap="round"/>'
b += T(53, 214, 'dik tut', 10, '#1d4ed8') + T(215, 196, 'kısa püskürtmeler', 10, '#1d4ed8')
b += '<g transform="translate(296 40)"><circle r="18" cx="18" cy="18" fill="#fee2e2" stroke="#dc2626" stroke-width="2.5"/><path d="M11 12 v6 M25 12 v6 M8 18 h20 v4 a10 10 0 0 1 -20 0z" fill="#dc2626"/><path d="M4 32 L32 4" stroke="#dc2626" stroke-width="3"/></g>'
b += T(314, 76, 'fiş çekili', 9, '#991b1b') + '</svg>'
w('yedek-bakim.svg', b)

# ── Quiz görseli: tozlu kasa + basınçlı hava kutusu (doğru yöntem gösterilmez)
q = ('<svg viewBox="0 0 230 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tozlu kasa fanı ve basınçlı hava kutusu; nasıl temizleneceği soruluyor">'
     '<rect width="230" height="110" rx="10" fill="#f1f5f9"/>')
q += '<rect x="96" y="10" width="92" height="90" rx="8" fill="#1f2937"/>' + fan(142, 55, 34, '', True)
q += hava_kutusu(20, 38, 58) + T(64, 24, '?', 20, '#b45309', weight=900) + T(208, 40, '?', 20, '#b45309', weight=900)
q += '</svg>'
w('svg-quiz-temizlik.svg', q)


# ── Özet simgeleri 80×60
def oz(ad, aria, ic):
    w(ad, '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="80" height="60" rx="10" fill="#ede9fe"/>%s</svg>' % (aria, ic))


halka = ''
import math
for i in range(6):
    a = -math.pi / 2 + i * math.pi / 3
    halka += '<circle cx="%.1f" cy="%.1f" r="6" fill="%s"/>' % (40 + 20 * math.cos(a), 30 + 20 * math.sin(a), '#4f46e5' if i < 3 else '#a5b4fc')
    halka += T('%.1f' % (40 + 20 * math.cos(a)), '%.1f' % (30 + 20 * math.sin(a) + 2.6), str(i + 1), 7, '#fff')
oz('oz-1.svg', 'Sorun giderme döngüsü: altı aşama', '<circle cx="40" cy="30" r="20" fill="none" stroke="#c4b5fd" stroke-width="2" stroke-dasharray="3 3"/>' + halka)
oz('oz-2.svg', 'Açılmıyor ya da görüntü yok: güç ışığı ve hata ışıkları',
   '<rect x="8" y="12" width="20" height="36" rx="3" fill="#1e293b"/><circle cx="18" cy="20" r="3" fill="#22c55e"/>' +
   ''.join('<circle cx="40" cy="%d" r="3.2" fill="%s"/>' % (14 + i * 10, '#ef4444' if i == 1 else '#334155') for i in range(4)) +
   '<rect x="50" y="14" width="24" height="18" rx="2" fill="#0f172a"/>' + T(62, 26, '?', 9, '#fbbf24') + '<rect x="58" y="32" width="8" height="5" fill="#1e293b"/>')
oz('oz-3.svg', 'Sıcaklık yükselir, saat hızı düşer; disk sağlığı uyarısı',
   '<path d="M8 48 L28 40 L44 22 L60 12" stroke="#ef4444" stroke-width="3" fill="none"/><path d="M8 18 L40 18 L52 34 L72 36" stroke="#4f46e5" stroke-width="3" stroke-dasharray="4 3" fill="none"/>' +
   T(66, 52, 'SMART', 7, '#7c3aed', fam=M))
oz('oz-4.svg', 'Önleyici bakım: fan sabit, basınçlı hava',
   fan(52, 30, 17, '', True) + '<rect x="12" y="20" width="10" height="30" rx="3" fill="#60a5fa"/><rect x="14" y="15" width="6" height="5" fill="#1e293b"/>' +
   '<path d="M22 17 h8" stroke="#ef4444" stroke-width="2"/><rect x="34" y="20" width="30" height="4" rx="2" fill="#f59e0b" transform="rotate(-20 49 22)"/>')
oz('oz-5.svg', '3-2-1 yedek ve güvenli silme',
   ''.join('<rect x="%d" y="10" width="14" height="18" rx="2" fill="%s"/>' % (8 + i * 18, c) for i, c in enumerate(['#4f46e5', '#6366f1', '#0ea5e9'])) +
   T(31, 40, '3 · 2 · 1', 8, '#4338ca', fam=M) + '<rect x="60" y="12" width="14" height="36" rx="2" fill="#0f172a"/>' +
   ''.join('<rect x="62" y="%d" width="10" height="4" fill="#475569"/>' % (15 + i * 6) for i in range(5)) + '<path d="M58 50 l18 -40" stroke="#ef4444" stroke-width="2.5"/>')
oz('oz-6.svg', 'E-atık geri dönüşüm döngüsü',
   ''.join('<path d="M%s" fill="none" stroke="#16a34a" stroke-width="4" stroke-linecap="round"/>' % d for d in
           ['29 22 L36 11', '48 13 L55 25', '54 40 L40 45', '26 45 L21 35']) +
   ''.join('<path d="M%s" fill="#16a34a"/>' % d for d in ['33 9 L42 9 L38 17z', '58 22 L53 30 L50 22z', '42 41 L42 50 L35 45z', '17 38 L24 31 L26 39z']) +
   T(40, 33, 'AEEE', 7, '#166534', fam=M))
