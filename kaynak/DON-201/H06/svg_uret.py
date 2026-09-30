# -*- coding: utf-8 -*-
# DON-201 H06 — İşlemci: statik SVG sahneleri üretir (bu klasöre yazar). Çalıştır: python3 svg_uret.py
# Not: f-string kullanılmaz (üretim standardı); % biçimlendirme ve düz birleştirme kullanılır.
import os

KLASOR = os.path.dirname(os.path.abspath(__file__))
F = 'font-family="Inter,Arial,sans-serif"'


def w(ad, s):
    with open(os.path.join(KLASOR, ad), 'w', encoding='utf-8') as f:
        f.write(s.strip() + '\n')


def bg(id_, a='#f0f9ff', b='#dbeafe', W=360, H=240, r=18):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/>'
            '<stop offset="1" stop-color="%s"/></linearGradient></defs><rect width="%d" height="%d" rx="%d" fill="url(#%s)"/>') % (id_, a, b, W, H, r, id_)


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x, y, F, size, weight, fill, anchor, t)


def svg(ad, aria, ic, vb='0 0 360 240'):
    w(ad, '<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + aria + '">' + ic + '</svg>')


# ── Bileşenler ──────────────────────────────────────────────
def cpu_ust(x, y, s=1, isi=None):
    """Üstten işlemci: yeşil alt kart, metal kapak, altın köşe üçgeni (sol-alt)."""
    kapak = isi or '#c7cbd1'
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    g += '<rect x="0" y="0" width="60" height="60" rx="2" fill="#155a34"/>'
    g += '<path d="M0 22a2.6 2.6 0 0 0 0 -5.2zM60 22a2.6 2.6 0 0 1 0 -5.2z" fill="#eef4f8"/>'
    g += '<rect x="5" y="5" width="50" height="50" rx="3" fill="#aeb3ba"/>'
    g += '<rect x="8" y="8" width="44" height="44" rx="4" fill="%s" stroke="#9aa0a8" stroke-width="1"/>' % kapak
    g += '<rect x="14" y="16" width="26" height="2.4" fill="#8a9098"/><rect x="14" y="21" width="20" height="2.4" fill="#8a9098"/><rect x="14" y="26" width="30" height="2.4" fill="#8a9098"/>'
    g += '<rect x="37" y="37" width="9" height="9" fill="#8a9098" opacity=".8"/>'
    g += '<path d="M1.2 58.8v-5.4h0l5.4 5.4z" fill="#e3b04f"/>'
    return g + '</g>'


def cpu_alt(x, y, s=1):
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    g += '<rect x="0" y="0" width="60" height="60" rx="2" fill="#155a34"/>'
    g += '<path d="M0 22a2.6 2.6 0 0 0 0 -5.2zM60 22a2.6 2.6 0 0 1 0 -5.2z" fill="#eef4f8"/>'
    for i in range(13):
        for j in range(13):
            px, py = 5 + i * 4.2, 5 + j * 4.2
            if 21 < px < 38 and 21 < py < 38:
                continue
            g += '<circle cx="%.1f" cy="%.1f" r="1.25" fill="#e3b04f"/>' % (px, py)
    g += ''.join('<rect x="%s" y="%s" width="3" height="1.6" fill="#8a7658"/>' % (p[0], p[1]) for p in [(24, 25), (29, 24), (33, 27), (25, 30), (30, 31), (34, 33), (27, 35)])
    return g + '</g>'


def cpu_yan(x, y, w_=60, isi=None):
    """Yandan işlemci: alt kart + kapak (w_ genişlik)."""
    k = w_ / 60.0
    g = '<g transform="translate(%s %s)">' % (x, y)
    g += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" fill="%s"/>' % (6 * k, -9 * k, 48 * k, 6 * k, 1.2 * k, isi or '#c7cbd1')
    g += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="#aeb3ba"/>' % (3 * k, -4 * k, 54 * k, 2 * k)
    g += '<rect x="0" y="%.1f" width="%.1f" height="%.1f" rx="1" fill="#155a34"/>' % (-2.4 * k, w_, 2.6 * k)
    return g + '</g>'


def fan_on(x, y, s=1):
    """Önden 12 cm fan."""
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    g += '<rect x="-30" y="-30" width="60" height="60" rx="6" fill="#1b1d21"/><circle r="27" fill="#0d0e11"/>'
    for i in range(7):
        g += '<path d="M0 0 C 10 -6, 18 -16, 12 -26 C 4 -22, -2 -12, 0 0z" fill="#2b2f36" transform="rotate(%d)"/>' % (i * 51.4)
    g += '<circle r="9" fill="#24272c"/>'
    for c in [(-25, -25), (25, -25), (-25, 25), (25, 25)]:
        g += '<circle cx="%d" cy="%d" r="2" fill="#0d0e11"/>' % c
    return g + '</g>'


def sogutucu_on(x, y, s=1, fanli=True):
    """Önden kule soğutucu (fan önde); (x,y) = taban altı ortası."""
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    g += '<rect x="-10" y="-5" width="20" height="5" rx="1.2" fill="#d5d8dc"/><rect x="-11" y="-10" width="22" height="5" rx="1.5" fill="#a9afb8"/>'
    for px in [-26, -18, -10, -4, 4, 10, 18, 26]:
        g += '<rect x="%d" y="-24" width="3" height="16" rx="1.5" fill="#c47a4c"/>' % (px - 1.5)
    g += '<rect x="-32" y="-88" width="64" height="66" rx="2" fill="#cfd4da"/>'
    g += ''.join('<rect x="-32" y="%.1f" width="64" height="0.7" fill="#9aa1aa"/>' % (-87 + i * 2.2) for i in range(30))
    g += '<rect x="-33" y="-92" width="66" height="5" rx="2" fill="#2b2f36"/>'
    if fanli:
        g += fan_on(0, -55, 0.94)
    return g + '</g>'


def sogutucu_yan(x, y, s=1):
    """Yandan kule soğutucu (fan sağda); (x,y) = taban altı ortası."""
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    g += '<rect x="-12" y="-5" width="24" height="5" rx="1.2" fill="#d5d8dc"/><rect x="-12" y="-10" width="24" height="5" rx="1.5" fill="#a9afb8"/>'
    for px in [-8, -3, 3, 8]:
        g += '<path d="M%d -9 C %d -16, %d -20, %d -26 L %d -92" stroke="#c47a4c" stroke-width="3" fill="none"/>' % (px, px, px * 1.6, px * 1.8, px * 1.8)
    g += '<rect x="-15" y="-88" width="30" height="66" fill="#cfd4da" opacity=".95"/>'
    g += ''.join('<rect x="-15" y="%.1f" width="30" height="0.8" fill="#9aa1aa"/>' % (-87 + i * 2.2) for i in range(30))
    for px in [-8, -3, 3, 8]:
        g += '<rect x="%.1f" y="-88" width="3" height="66" fill="#c47a4c" opacity=".35"/>' % (px * 1.8 - 1.5)
    g += '<rect x="-16" y="-92" width="32" height="5" rx="2" fill="#2b2f36"/>'
    g += '<rect x="15" y="-88" width="8" height="66" rx="2" fill="#1b1d21"/>'
    return g + '</g>'


def termometre(x, y, s=1, oran=0.5, renk='#ef4444'):
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    g += '<rect x="-7" y="-60" width="14" height="62" rx="7" fill="#fff" stroke="#94a3b8" stroke-width="2"/>'
    g += '<circle cx="0" cy="8" r="11" fill="#fff" stroke="#94a3b8" stroke-width="2"/><circle cx="0" cy="8" r="8" fill="%s"/>' % renk
    h = 54 * oran
    g += '<rect x="-3.5" y="%.1f" width="7" height="%.1f" rx="3.5" fill="%s"/>' % (2 - h, h + 4, renk)
    for i in range(5):
        g += '<rect x="7" y="%d" width="5" height="1.6" fill="#94a3b8"/>' % (-52 + i * 12)
    return g + '</g>'


def sapka(x, y, s=1):
    """Aşçı şapkası simgesi (çekirdek = aşçı benzetmesi)."""
    return ('<g transform="translate(%s %s) scale(%s)"><path d="M-8 2c-5 0-7-6-3-9 0-6 7-8 11-4 4-4 11-2 11 4 4 3 2 9-3 9z" fill="#fff" stroke="#94a3b8" stroke-width="1.2"/>'
            '<rect x="-7" y="2" width="14" height="6" rx="1.5" fill="#fff" stroke="#94a3b8" stroke-width="1.2"/></g>') % (x, y, s)


def telefon(x, y, s=1):
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    g += '<rect x="0" y="0" width="64" height="124" rx="12" fill="#1f2937"/><rect x="4" y="4" width="56" height="116" rx="9" fill="#334155"/>'
    g += '<rect x="8" y="10" width="48" height="58" rx="4" fill="#1d4ed8" opacity=".55"/>'
    g += '<rect x="8" y="74" width="48" height="40" rx="4" fill="#155a34"/>'
    g += '<rect x="20" y="82" width="24" height="24" rx="3" fill="#475569" stroke="#cbd5e1" stroke-width="1.4"/>'
    g += '<rect x="23" y="85" width="8" height="8" fill="#60a5fa"/><rect x="33" y="85" width="8" height="8" fill="#f59e0b"/><rect x="23" y="95" width="8" height="8" fill="#a78bfa"/><rect x="33" y="95" width="8" height="8" fill="#34d399"/>'
    return g + '</g>'


def ok(x1, y1, x2, y2, renk='#ef4444', gen=3):
    return ('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="%s" stroke-linecap="round"/>'
            '<path d="M%s %s l-5 -7 h10z" fill="%s" transform="rotate(%s %s %s)"/>') % (
        x1, y1, x2, y2, renk, gen, x2, y2 + 1, renk, 0 if y2 >= y1 else 180, x2, y2)


# ── Isınma ──────────────────────────────────────────────────
ic = bg('h6is')
ic += '<rect x="18" y="168" width="222" height="56" rx="6" fill="#1d5c36"/>'
ic += ''.join('<rect x="%d" y="176" width="4" height="42" rx="2" fill="#2f7a4b"/>' % (32 + i * 10) for i in range(4))
ic += '<rect x="112" y="186" width="84" height="22" rx="3" fill="#2a2d33"/>'
ic += cpu_yan(117, 190, 74)
ic += sogutucu_on(154, 150, 1.25)
ic += '<path d="M84 150 v-40" stroke="#0369a1" stroke-width="3.5" stroke-linecap="round"/><path d="M76 112 l8 -12 8 12z" fill="#0369a1"/>'
ic += '<path d="M224 150 v-40" stroke="#0369a1" stroke-width="3.5" stroke-linecap="round"/><path d="M216 112 l8 -12 8 12z" fill="#0369a1"/>'
ic += termometre(296, 168, 1.25, 0.72, '#ef4444')
ic += '<g><rect x="236" y="22" width="112" height="52" rx="14" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>' + T(292, 44, 'Soğutucuyu', 12) + T(292, 60, 'kaldırırsak?', 12) + '</g>'
ic += '<circle cx="322" cy="116" r="15" fill="#fff" stroke="#f59e0b" stroke-width="3"/>' + T(322, 123, '?', 19, '#b45309', weight=900)
svg('isinma.svg', 'Anakart üzerindeki işlemcinin soğutucusu yukarı kaldırılıyor; yanda termometre ve soru: soğutucuyu kaldırırsak ne olur?', ic)

# ── Yedek çizimler ──────────────────────────────────────────
ic = bg('h6yc') + cpu_ust(40, 52, 1.9) + cpu_alt(208, 52, 1.9)
ic += T(97, 38, 'Üst yüz: metal kapak', 12) + T(265, 38, 'Alt yüz: temas pedleri', 12)
ic += '<path d="M46 162 L60 196" stroke="#b45309" stroke-width="2"/>' + T(60, 210, 'Köşe üçgeni', 12, '#b45309')
svg('yedek-cpu.svg', 'İşlemcinin üst yüzünde metal kapak ve köşe üçgeni, alt yüzünde altın temas pedleri', ic)

ic = bg('h6ys') + '<rect x="40" y="198" width="190" height="20" rx="4" fill="#1d5c36"/>' + cpu_yan(105, 198, 60) + sogutucu_on(135, 188, 1.35)
ic += termometre(290, 160, 1.2, 0.35, '#3b82f6') + T(290, 204, 'Normal', 12, '#1d4ed8')
svg('yedek-sogutucu.svg', 'Kule tipi soğutucu işlemcinin üstünde; fan havayı kanatçıkların arasından geçiriyor, termometre normal', ic)

ic = bg('h6yp') + sogutucu_on(150, 100, 0.95) + '<rect x="120" y="136" width="60" height="5" rx="1.5" fill="#8d9298"/>' + cpu_yan(120, 190, 60)
ic += '<path d="M198 80 H250" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3"/>' + T(256, 84, 'Soğutucu', 12, '#334155', 'start')
ic += '<path d="M184 139 H250" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3"/>' + T(256, 143, 'Termal macun', 12, '#334155', 'start')
ic += '<path d="M184 184 H250" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3"/>' + T(256, 188, 'İşlemci', 12, '#334155', 'start')
svg('yedek-patlat.svg', 'Patlatma görünümü: üstte soğutucu, ortada ince termal macun katmanı, altta işlemci', ic)

# ── Quiz görseli: katmanlar (macun sorusu) ──────────────────
ic = '<rect width="220" height="120" rx="10" fill="#eef7fe"/>' + sogutucu_on(78, 80, 0.82) + '<rect x="54" y="81" width="48" height="4" rx="1.2" fill="#6b7078"/>' + cpu_yan(46, 102, 64)
ic += '<path d="M104 83 H150" stroke="#b91c1c" stroke-width="1.8"/><circle cx="104" cy="83" r="2.6" fill="#b91c1c"/>' + '<rect x="152" y="72" width="34" height="22" rx="6" fill="#fff" stroke="#b91c1c" stroke-width="1.8"/>' + T(169, 88, '?', 15, '#b91c1c', weight=900)
ic += T(118, 30, 'Soğutucu', 10, '#334155', 'start') + T(118, 108, 'İşlemci', 10, '#334155', 'start')
svg('svg-quiz-macun.svg', 'Soğutucu ile işlemci arasında ince gri bir katman oklarla gösterilmiş', ic, '0 0 220 120')

# ── Derinleş: telefon işlemcisi ve bilgisayar işlemcisi ───────
ic = bg('h6dr', '#f5f3ff', '#ede9fe')
ic += '<rect x="14" y="14" width="160" height="212" rx="14" fill="#fff" stroke="#c4b5fd" stroke-width="1.5"/><rect x="186" y="14" width="160" height="212" rx="14" fill="#fff" stroke="#c4b5fd" stroke-width="1.5"/>'
ic += T(94, 36, 'Telefon', 14, '#5b21b6', weight=900) + T(266, 36, 'Bilgisayar', 14, '#5b21b6', weight=900)
ic += telefon(28, 52, 0.95)
ic += '<path d="M72 144 L100 126" stroke="#7c3aed" stroke-width="1.5"/>'
ic += T(104, 70, 'Tek çipte:', 10.5, '#334155', 'start') + T(104, 84, 'işlemci,', 10.5, '#334155', 'start', 700) + T(104, 97, 'grafik,', 10.5, '#334155', 'start', 700) + T(104, 110, 'modem…', 10.5, '#334155', 'start', 700)
ic += '<g transform="translate(24 186)"><rect width="140" height="30" rx="8" fill="#ecfdf5"/>' + T(70, 13, 'Az enerji · fan yok', 10.5, '#065f46') + T(70, 25, 'Pille uzun süre çalışır', 9.5, '#065f46', weight=700) + '</g>'
ic += '<rect x="206" y="148" width="120" height="14" rx="3" fill="#1d5c36"/>' + cpu_yan(246, 148, 40) + sogutucu_on(266, 138, 0.9)
ic += '<g transform="translate(196 186)"><rect width="140" height="30" rx="8" fill="#fff7ed"/>' + T(70, 13, 'Çok enerji · soğutucu + fan', 10.5, '#9a3412') + T(70, 25, 'Daha güçlü, daha sıcak', 9.5, '#9a3412', weight=700) + '</g>'
svg('derinles.svg', 'Karşılaştırma: telefonda işlemci, grafik ve modem tek çipte, az enerji harcar ve fanı yoktur; bilgisayar işlemcisi çok enerji harcar, soğutucu ve fan gerekir', ic)

# ── Özet küçük resimleri (80 × 60) ───────────────────────────
def oz(ad, aria, ic_, renk='#e0f2fe'):
    svg(ad, aria, '<rect width="80" height="60" rx="10" fill="%s"/>' % renk + ic_, '0 0 80 60')


oz('oz-1.svg', 'İşlemci', cpu_ust(22, 12, 0.6))
oz('oz-2.svg', 'Sırayla', ''.join('<g transform="translate(%d 20)"><rect width="16" height="20" rx="3" fill="#fff" stroke="#0ea5e9" stroke-width="1.5"/>%s</g>' % (6 + i * 18, T(8, 14, str(i + 1), 10, '#0369a1', weight=900)) for i in range(4)) + '<path d="M8 48 H72" stroke="#0ea5e9" stroke-width="2.5"/><path d="M72 48 l-6 -4 v8z" fill="#0ea5e9"/>')
oz('oz-3.svg', 'Çekirdek', '<rect x="18" y="8" width="44" height="44" rx="5" fill="#155a34"/>' + ''.join('<rect x="%d" y="%d" width="17" height="17" rx="3" fill="#c7cbd1"/>' % (22 + (i % 2) * 19, 12 + (i // 2) * 19) for i in range(4)) + ''.join(sapka(30.5 + (i % 2) * 19, 19 + (i // 2) * 19, 0.55) for i in range(4)))
oz('oz-4.svg', 'GHz', '<path d="M6 40 h8 v-18 h8 v18 h8 v-18 h8 v18 h8 v-18 h8 v18 h8 v-18 h8 v18 h4" fill="none" stroke="#0369a1" stroke-width="2.5" stroke-linejoin="round"/>' + T(40, 54, '3 GHz', 9, '#0369a1', weight=900))
oz('oz-5.svg', 'Soğutucu', sogutucu_on(32, 56, 0.5) + termometre(64, 40, 0.5, 0.35, '#3b82f6'))
oz('oz-6.svg', 'Termal macun', '<rect x="16" y="14" width="48" height="8" rx="2" fill="#a9afb8"/><rect x="18" y="24" width="44" height="5" rx="2" fill="#8d9298"/>' + cpu_yan(16, 44, 48))
print('SVG üretildi.')
