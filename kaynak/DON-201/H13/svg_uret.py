# -*- coding: utf-8 -*-
# DON-201 H13 — Basit Sorun Giderme ve Bakım · SVG üretici (python3 svg_uret.py; kendi klasöründe çalışır)
# Not: f-string kullanılmaz (üretim standardı). Marka/logo yok, emoji yok.
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))

F = 'font-family="Inter,Arial,sans-serif"'


def w(ad, s):
    open(ad, 'w', encoding='utf-8').write(s.strip() + '\n')


def bg(id_, a='#f0f9ff', b='#dbeafe', W=360, H=240, r=18):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
            '</linearGradient></defs><rect width="%d" height="%d" rx="%d" fill="url(#%s)"/>') % (id_, a, b, W, H, r, id_)


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, cls=''):
    c = (' class="%s"' % cls) if cls else ''
    return '<text%s x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (c, x, y, F, size, weight, fill, anchor, t)


def svg(ad, aria, ic, W=360, H=240, cls=''):
    c = (' class="%s"' % cls) if cls else ''
    w(ad, '<svg viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"%s>%s</svg>' % (W, H, aria, c, ic))


# ─────────────── Ortak çizim parçaları ───────────────
def kasa(x, y, s=1, acik=False, cls=''):
    """Önden kule kasa (56 × 108)."""
    g = '<g class="%s" transform="translate(%s %s) scale(%s)">' % (cls, x, y, s)
    g += '<rect x="0" y="0" width="56" height="108" rx="5" fill="#2b2f36"/><rect x="50" y="0" width="6" height="108" rx="3" fill="#23262c"/>'
    g += '<rect x="0" y="0" width="56" height="14" rx="5" fill="#353a43"/><rect x="6" y="20" width="44" height="82" rx="3" fill="#1d2026"/>'
    g += ''.join('<line x1="10" y1="%d" x2="46" y2="%d" stroke="#2a2e35" stroke-width="2.2"/>' % (yy, yy) for yy in range(25, 100, 5))
    g += '<rect x="8" y="5" width="5" height="3" rx="0.6" fill="#0f1115"/><rect x="15" y="5" width="5" height="3" rx="0.6" fill="#0f1115"/>'
    g += '<circle cx="40" cy="7" r="3.4" fill="#4b5563"/>'
    g += '<circle cx="40" cy="7" r="4.8" fill="none" stroke-width="1.5" stroke="%s"/>' % ('#60a5fa' if acik else '#475569')
    g += '<rect x="6" y="20" width="44" height="2.2" fill="#60a5fa" opacity="%s"/>' % ('0.85' if acik else '0')
    g += '<rect x="4" y="106" width="10" height="3" rx="1" fill="#111"/><rect x="42" y="106" width="10" height="3" rx="1" fill="#111"/></g>'
    return g


def monitor(x, y, s=1, ekran='kapali', led=False):
    """Önden monitör (160 × 142; taban dahil)."""
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    g += '<rect x="74" y="100" width="12" height="26" fill="#22252b"/><ellipse cx="80" cy="138" rx="34" ry="5" fill="#1f2228"/>'
    g += '<rect x="0" y="0" width="160" height="100" rx="5" fill="#16181d"/><rect x="5" y="5" width="150" height="84" rx="2" fill="#05070b"/>'
    if ekran == 'masaustu':
        g += ('<rect x="5" y="5" width="150" height="84" rx="2" fill="#1e5f8a"/><path d="M5 62c40-14 70 8 150-8v35H5z" fill="#fff" opacity=".1"/>'
              '<rect x="5" y="81" width="150" height="8" fill="#0f172a" opacity=".85"/>')
    elif ekran == 'sinyal':
        g += '<rect x="45" y="36" width="70" height="20" rx="3" fill="#1f2937" stroke="#64748b"/>' + T(80, 49.5, 'Sinyal yok', 8, '#e5e7eb')
    g += '<circle cx="142" cy="95" r="1.6" fill="#374151"/><circle cx="150" cy="95" r="1.8" fill="%s"/></g>' % ('#bae6fd' if led else '#374151')
    return g


def priz(x, y, s=1):
    return ('<g transform="translate(%s %s) scale(%s)"><rect x="-12" y="-12" width="24" height="24" rx="4" fill="#f8fafc" stroke="#cbd5e1"/>'
            '<circle r="8" fill="#e2e8f0"/><circle cx="-3" r="1.5" fill="#334155"/><circle cx="3" r="1.5" fill="#334155"/></g>') % (x, y, s)


def fis(x, y, s=1, rot=0):
    return ('<g transform="translate(%s %s) rotate(%s) scale(%s)"><circle r="7" fill="#1f2937"/><rect x="-4" y="4" width="8" height="9" rx="2.5" fill="#1f2937"/>'
            '<path d="M0 13v14" stroke="#1f2937" stroke-width="3" fill="none"/></g>') % (x, y, rot, s)


def fan(x, y, s=1, tozlu=False, cls=''):
    """Önden 12 cm fan (60 × 60)."""
    g = '<g class="%s" transform="translate(%s %s) scale(%s)">' % (cls, x, y, s)
    g += '<rect x="0" y="0" width="60" height="60" rx="8" fill="#1f2328"/><circle cx="30" cy="30" r="26" fill="#0e1013"/>'
    g += ''.join('<circle cx="%s" cy="%s" r="2.2" fill="#0e1013" stroke="#3a3f47"/>' % (c[0], c[1]) for c in [(5.5, 5.5), (54.5, 5.5), (5.5, 54.5), (54.5, 54.5)])
    g += '<g class="kanatlar">'
    for i in range(7):
        g += '<path d="M30 30 C36 22 44 12 38 6 C32 8 29 18 30 30z" fill="%s" transform="rotate(%d 30 30)"/>' % ('#8b8f96' if tozlu else '#2f343c', i * 360 // 7)
    g += '<circle cx="30" cy="30" r="9" fill="%s"/><circle cx="30" cy="30" r="5.5" fill="%s"/></g>' % ('#9ca3af' if tozlu else '#2a2e35', '#a8adb4' if tozlu else '#3a3f47')
    if tozlu:
        tozlar = [(12, 14, 3), (48, 12, 2.6), (50, 46, 3.2), (10, 48, 2.8), (30, 8, 2.2), (22, 26, 2.4), (40, 36, 2.6), (34, 20, 2), (18, 40, 2.2), (44, 26, 1.8),
                  (4, 30, 2.4), (56, 30, 2.2), (28, 52, 2.6)]
        g += ''.join('<circle cx="%s" cy="%s" r="%s" fill="#c3c7cc" opacity=".92"/>' % t for t in tozlar)
        g += '<rect x="0" y="0" width="60" height="60" rx="8" fill="#b8bcc2" opacity=".28"/>'
    return g + '</g>'


def termo(x, y, s=1, oran=0.5, renk='#ef4444'):
    h = 54 * oran
    return ('<g transform="translate(%s %s) scale(%s)"><rect x="-5" y="0" width="10" height="60" rx="5" fill="#fff" stroke="#94a3b8" stroke-width="2"/>'
            '<rect x="-2.5" y="%s" width="5" height="%s" rx="2.5" fill="%s"/><circle cy="64" r="8" fill="%s" stroke="#94a3b8" stroke-width="2"/></g>') % (x, y, s, 58 - h, h, renk, renk)


def sprey(x, y, s=1, rot=0):
    """Basınçlı hava kutusu (marka yok)."""
    return ('<g transform="translate(%s %s) rotate(%s) scale(%s)"><rect x="0" y="10" width="22" height="50" rx="5" fill="#2563eb"/>'
            '<rect x="0" y="24" width="22" height="18" fill="#e0f2fe"/><path d="M4 30h14M4 35h10" stroke="#1e3a8a" stroke-width="1.6"/>'
            '<rect x="4" y="4" width="14" height="8" rx="2" fill="#94a3b8"/><rect x="7" y="0" width="12" height="5" rx="1.5" fill="#1f2937"/>'
            '<path d="M19 2h22" stroke="#dc2626" stroke-width="2.4" stroke-linecap="round"/></g>') % (x, y, rot, s)


def parmak(x, y, rot=0, s=1):
    return ('<g transform="translate(%s %s) rotate(%s) scale(%s)"><rect x="-6" y="-22" width="12" height="30" rx="6" fill="#d9a07a"/>'
            '<rect x="-4.5" y="-21" width="9" height="7" rx="3.5" fill="#f0c7a4"/></g>') % (x, y, rot, s)


def rozet(x, y, iyi, r=13):
    return ('<g transform="translate(%s %s)"><circle r="%s" fill="%s"/><path d="%s" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" '
            'stroke-linejoin="round"/></g>') % (x, y, r, '#10b981' if iyi else '#ef4444', 'M-6 0l4 4 8-8' if iyi else 'M-5 -5l10 10M5 -5l-10 10')


def kisi(x, y, s=1, sac='#3b2a20', kazak='#0ea5e9', uzun=True, cls=''):
    """12–13 yaş görünümlü öğrenci, göğüs üstü (önden). Orijin: boyun altı."""
    g = '<g class="%s" transform="translate(%s %s) scale(%s)">' % (cls, x, y, s)
    if uzun:
        g += '<path d="M-17 -30c0 -18 34 -18 34 0v26h-34z" fill="%s"/>' % sac
    g += '<path d="M-26 34c0 -22 10 -34 26 -34s26 12 26 34z" fill="%s"/>' % kazak
    g += '<path d="M-7 1c2 5 12 5 14 0" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>'
    g += '<rect x="-5" y="-8" width="10" height="10" rx="3" fill="#d9a07a"/><circle cx="0" cy="-20" r="14" fill="#e0ad86"/>'
    g += '<path d="M-14 -22c0 -12 8 -17 15 -17s14 5 13 16c-5 -7 -12 -9 -18 -8c-4 1-7 4-10 9z" fill="%s"/>' % sac
    g += '<circle cx="-5" cy="-19" r="1.5" fill="#1f2937"/><circle cx="5" cy="-19" r="1.5" fill="#1f2937"/>'
    g += '<path d="M-4 -12c2 1.6 6 1.6 8 0" fill="none" stroke="#7c3a2a" stroke-width="1.4" stroke-linecap="round"/></g>'
    return g


def balon(x, y, w_, h_, metin, size=11, fill='#fff', stroke='#cbd5e1', renk='#1f2937', kuyruk='sol'):
    kx = x + 18 if kuyruk == 'sol' else x + w_ - 18
    return ('<g><rect x="%s" y="%s" width="%s" height="%s" rx="12" fill="%s" stroke="%s" stroke-width="2"/>'
            '<path d="M%s %s l-6 12 l14 -12z" fill="%s" stroke="%s" stroke-width="2" stroke-linejoin="round"/>'
            '<rect x="%s" y="%s" width="18" height="4" fill="%s"/>%s</g>') % (
        x, y, w_, h_, fill, stroke, kx, y + h_ - 1, fill, stroke, kx - 2, y + h_ - 3, fill, T(x + w_ / 2.0, y + h_ / 2.0 + size * 0.36, metin, size, renk))


# ─────────────── Masa sahnesi (Adım 4 ve Etkinlik 1; JS sınıflarla durum değiştirir) ───────────────
def masa(p, aria):
    s = '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s" class="masa">' % aria
    s += ('<defs><linearGradient id="%s-duvar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f8ff"/><stop offset="1" stop-color="#dfe9f6"/></linearGradient>'
          '<linearGradient id="%s-masa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6c8a0"/><stop offset="1" stop-color="#d3ac80"/></linearGradient>'
          '<linearGradient id="%s-ekran" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e3a8a"/><stop offset=".55" stop-color="#0e7490"/><stop offset="1" stop-color="#0f766e"/></linearGradient>'
          '</defs>') % (p, p, p)
    s += '<rect width="360" height="240" rx="18" fill="url(#%s-duvar)"/>' % p
    s += '<rect x="0" y="204" width="360" height="36" fill="#ece3d6"/><path d="M0 240V204h360v36z" fill="#e6dccd" opacity=".6"/>'
    # Duvar prizi + fiş (fiş grubu kablosuyla birlikte hareket eder)
    s += priz(334, 120, 1)
    s += ('<g class="fis-g"><path d="M334 131 C334 146 330 154 326 170" stroke="#1f2937" stroke-width="2.6" fill="none"/>'
          '<circle cx="334" cy="120" r="7" fill="#1f2937"/><rect x="330" y="124" width="8" height="9" rx="2.5" fill="#1f2937"/></g>')
    # Masa üstünde kablolar (cihazların arkasında)
    s += '<path d="M176 166 C140 168 100 167 60 160" stroke="#111827" stroke-width="2.4" fill="none"/>'
    s += '<path class="hop-kablo-tak" d="M262 166 C220 171 130 171 60 164" stroke="#334155" stroke-width="1.7" fill="none"/>'
    s += ('<g class="hop-kablo-cik"><path d="M262 166 C226 173 150 175 96 173" stroke="#334155" stroke-width="1.7" fill="none"/>'
          '<rect x="84" y="171" width="12" height="4" rx="1.5" fill="#22c55e"/><rect x="80" y="172" width="5" height="2" fill="#cbd5e1"/></g>')
    # Masa
    s += '<rect x="0" y="158" width="360" height="38" fill="url(#%s-masa)"/><rect x="0" y="196" width="360" height="9" fill="#b98c5e"/>' % p
    s += '<rect x="0" y="158" width="360" height="1.5" fill="#c9a075"/>'
    # Kasa (ışıklar sınıflarla)
    s += '<g class="kasa-g" transform="translate(14 62)">'
    s += '<rect x="0" y="0" width="56" height="108" rx="5" fill="#2b2f36"/><rect x="50" y="0" width="6" height="108" rx="3" fill="#23262c"/>'
    s += '<rect x="0" y="0" width="56" height="14" rx="5" fill="#353a43"/><rect x="6" y="20" width="44" height="82" rx="3" fill="#1d2026"/>'
    s += ''.join('<line x1="10" y1="%d" x2="46" y2="%d" stroke="#2a2e35" stroke-width="2.2"/>' % (yy, yy) for yy in range(25, 100, 5))
    s += '<rect class="k-isik" x="6" y="20" width="44" height="2.4" fill="#60a5fa"/>'
    s += '<rect x="8" y="5" width="5" height="3" rx="0.6" fill="#0f1115"/><rect x="15" y="5" width="5" height="3" rx="0.6" fill="#0f1115"/>'
    s += '<g class="alici"><rect x="15.5" y="1.2" width="4" height="5.5" rx="1" fill="#111827"/><rect x="16.5" y="1.8" width="2" height="1.3" fill="#3b82f6"/></g>'
    s += '<circle cx="40" cy="7" r="3.4" fill="#4b5563"/><circle class="k-led" cx="40" cy="7" r="4.8" fill="none" stroke-width="1.5"/>'
    s += '<circle class="k-disk" cx="49" cy="7" r="1.3"/>'
    s += '<rect x="4" y="106" width="10" height="3" rx="1" fill="#111"/><rect x="42" y="106" width="10" height="3" rx="1" fill="#111"/></g>'
    s += '<g class="alici-masa"><rect x="100" y="165" width="6" height="4" rx="1" fill="#111827"/><rect x="106" y="166" width="3" height="2" fill="#cbd5e1"/></g>'
    # Monitör
    s += '<g transform="translate(94 30)">'
    s += '<rect x="74" y="100" width="12" height="26" fill="#22252b"/><ellipse cx="80" cy="138" rx="34" ry="5" fill="#1f2228"/>'
    s += '<rect x="0" y="0" width="160" height="100" rx="5" fill="#16181d"/><rect x="5" y="5" width="150" height="84" rx="2" fill="#05070b"/>'
    s += '<g class="ek-masa"><rect x="5" y="5" width="150" height="84" rx="2" fill="url(#%s-ekran)"/>' % p
    s += '<path d="M5 64c40-16 72 10 150-8v33H5z" fill="#fff" opacity=".08"/>'
    s += ''.join('<rect x="11" y="%d" width="10" height="10" rx="2" fill="#fff" opacity=".85"/>' % yy for yy in (11, 27, 43))
    s += '<rect x="36" y="14" width="96" height="60" rx="3" fill="#f8fafc"/><rect x="36" y="14" width="96" height="7" rx="3" fill="#cbd5e1"/>'
    s += '<rect x="41" y="25" width="86" height="44" rx="2" fill="#0f172a"/><path d="M79 38v18l15 -9z" fill="#fff" opacity=".9"/>'
    s += '<rect x="41" y="64" width="86" height="2" fill="#334155"/><rect class="video-ilerleme" x="41" y="64" width="30" height="2" fill="#ef4444"/>'
    s += '<rect x="5" y="81" width="150" height="8" fill="#0f172a" opacity=".88"/>'
    s += ''.join('<rect x="%d" y="82.8" width="5" height="4.4" rx="1" fill="%s"/>' % (x, c) for x, c in ((64, '#38bdf8'), (72, '#f59e0b'), (80, '#10b981'), (88, '#a78bfa')))
    s += ('<g class="ses-simge" transform="translate(140 85)"><path d="M-3.5 -1.5h2l2.5 -2v7l-2.5 -2h-2z" fill="#fff"/>'
          '<g class="ses-yay" stroke="#fff" stroke-width=".8" fill="none"><path d="M1.6 -1.4q1 1.4 0 2.8"/><path d="M3 -2.6q2 2.6 0 5.2"/></g>'
          '<g class="ses-x" stroke="#f87171" stroke-width="1" stroke-linecap="round"><path d="M1.6 -1.6l3 3M4.6 -1.6l-3 3"/></g></g>')
    s += '<path class="imlec" d="M100 50l0 11l3 -3l2 5l2 -1l-2 -4.6h4z" fill="#fff" stroke="#111827" stroke-width=".7"/>'
    s += '</g>'
    s += '<circle cx="142" cy="95" r="1.7" fill="#374151"/><circle class="m-led" cx="150" cy="95" r="1.8"/></g>'
    # Hoparlörler
    for i, hx in enumerate((258, 282)):
        s += '<g transform="translate(%d 110)"><rect x="0" y="0" width="18" height="60" rx="4" fill="#2a2e35"/>' % hx
        s += '<circle cx="9" cy="14" r="4" fill="#111" stroke="#4b5563"/><circle cx="9" cy="35" r="6.5" fill="#111" stroke="#4b5563" stroke-width="1.5"/>'
        if i == 0:
            s += '<circle cx="5.5" cy="53" r="2" fill="#4b5563"/><circle class="h-led" cx="12.5" cy="53" r="1.5"/>'
        s += '</g>'
    s += '<g class="dalga" stroke="#10b981" stroke-width="1.8" fill="none" stroke-linecap="round">'
    for cx in (267, 291):
        s += '<path d="M%d 104q6 -6 12 0"/><path d="M%d 99q10 -10 20 0"/>' % (cx - 6, cx - 10)
    s += '</g>'
    # Klavye ve fare
    s += '<path d="M118 178h112l6 14h-124z" fill="#2b2f36"/>'
    for r_, (y0, x0, x1) in enumerate(((180.5, 121, 227), (184.5, 119, 229), (188.5, 117, 231))):
        n = 13
        dx = (x1 - x0) / float(n)
        s += ''.join('<rect x="%.1f" y="%s" width="%.1f" height="2.6" rx=".6" fill="#454b56"/>' % (x0 + k * dx + 0.4, y0, dx - 0.9) for k in range(n))
    s += '<g class="fare-g"><ellipse cx="256" cy="186" rx="7" ry="10" fill="#2f343c"/><ellipse cx="256" cy="182" rx="5.5" ry="5.5" fill="#3a4049"/>'
    s += '<line x1="256" y1="176.5" x2="256" y2="183" stroke="#1f2328" stroke-width=".8"/><rect x="255.1" y="178" width="1.8" height="3" rx=".9" fill="#9ca3af"/>'
    s += '<circle class="fare-led" cx="256" cy="193" r="1.2"/></g>'
    # Vurgu halkaları (kontrol noktaları)
    H = 'fill="none" stroke="#f59e0b" stroke-width="2.4" stroke-dasharray="5 3"'
    s += '<circle class="hl hl-fis" cx="334" cy="121" r="16" %s/>' % H
    s += '<circle class="hl hl-kasa-dugme" cx="54" cy="69" r="8" %s/>' % H
    s += '<circle class="hl hl-mon-dugme" cx="240" cy="125" r="8" %s/>' % H
    s += '<circle class="hl hl-hop-dugme" cx="267" cy="163" r="7" %s/>' % H
    s += '<circle class="hl hl-ses" cx="234" cy="115" r="7" %s/>' % H
    s += '<ellipse class="hl hl-fare" cx="256" cy="186" rx="12" ry="15" %s/>' % H
    s += '<g class="hl hl-alici"><circle cx="32" cy="66" r="7" %s/><circle cx="104" cy="167" r="8" %s/></g>' % (H, H)
    s += '<circle class="hl hl-usb" cx="25" cy="68" r="6" %s/>' % H
    s += '<rect class="hl hl-kablo" x="56" y="155" width="216" height="24" rx="10" %s/>' % H
    s += '<rect class="hl hl-kasa" x="9" y="57" width="66" height="118" rx="8" %s/>' % H
    return s + '</svg>'


# ─────────────── Isınma ───────────────
svg('isinma.svg', 'Ece masasında; bilgisayarın ışıkları sönük, ekran karanlık. Ece şaşkın: bilgisayar açılmıyor. Önce ne yapmalı?',
    bg('h13is') + '<rect x="0" y="176" width="360" height="64" fill="#e7d3b8"/><rect x="0" y="170" width="360" height="9" fill="#cfb38f"/>' +
    '<rect x="252" y="24" width="84" height="58" rx="6" fill="#bfdbfe" stroke="#fff" stroke-width="4"/><path d="M294 24v58M252 53h84" stroke="#fff" stroke-width="3"/>' +
    kasa(22, 64, 1) + monitor(86, 26, 0.86, 'kapali', False) +
    '<path d="M60 170 C 70 186 300 190 318 150" fill="none" stroke="#1f2937" stroke-width="3"/>' + priz(326, 130, 1.1) + fis(312, 150, 0.9, -30) +
    kisi(262, 136, 1.15, '#3b2a20', '#8b5cf6', True) +
    balon(196, 60, 104, 30, 'Açılmıyor!', 13, '#fff', '#f59e0b', '#b45309', 'sag') +
    '<circle cx="60" cy="36" r="17" fill="#fff" stroke="#f59e0b" stroke-width="3"/>' + T(60, 44, '?', 22, '#b45309', weight=900))

# ─────────────── Adım 1: Önce basit (iki şerit yarışı; JS sınıflarla oynatır) ───────────────
def cip(x, y, w_, metin, cls, simge=''):
    return ('<g class="ya-cip %s"><rect x="%s" y="%s" width="%s" height="24" rx="12"/>%s%s</g>') % (
        cls, x, y, w_, simge, T(x + w_ / 2.0 + (4 if simge else 0), y + 16, metin, 8.6, '#334155', cls='ya-yazi'))


def saat(x, y):
    return ('<g transform="translate(%s %s)"><circle r="7" fill="#fff" stroke="#64748b" stroke-width="1.6"/>'
            '<path d="M0 -4v4l3 2" stroke="#64748b" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>') % (x, y)


ya = bg('h13ya', '#f8fbff', '#eaf3ff', 360, 200, 16)
ya += '<rect x="8" y="8" width="344" height="86" rx="12" fill="#fff" stroke="#a7f3d0" stroke-width="2"/>'
ya += '<rect x="8" y="104" width="344" height="86" rx="12" fill="#fff" stroke="#fecaca" stroke-width="2"/>'
ya += kisi(34, 58, 0.78, '#3b2a20', '#8b5cf6', True) + T(34, 88, 'Ece', 9, '#334155')
ya += kisi(34, 154, 0.78, '#1f2937', '#0ea5e9', False) + T(34, 184, 'Deniz', 9, '#334155')
ya += T(62, 26, 'Önce en basit kontrol', 10, '#047857', 'start', 900) + T(62, 122, 'Önce kasayı açıyor', 10, '#b91c1c', 'start', 900)
ya += saat(284, 22) + T(344, 26, '0 sn', 10.5, '#0f172a', 'end', 900, 'ya-sure-1')
ya += saat(284, 118) + T(344, 122, '0 sn', 10.5, '#0f172a', 'end', 900, 'ya-sure-2')
ya += cip(62, 42, 96, 'Fiş takılı mı?', 'c1-1')
ya += '<g class="ya-sonuc ya-sonuc-1">' + rozet(180, 54, True, 11) + T(196, 51, 'Sorun bulundu!', 9.5, '#047857', 'start', 900) + T(196, 63, 'Fiş çıkmıştı.', 8.5, '#475569', 'start', 700) + '</g>'
xs = [(62, 70, 'Vidaları sök'), (136, 70, 'Parçalara bak'), (210, 70, 'Kapağı kapat'), (284, 62, 'Fiş takılı mı?')]
for i, (x, w_, m) in enumerate(xs):
    ya += cip(x, 138, w_, m, 'c2-%d' % (i + 1))
ya += '<g class="ya-sonuc ya-sonuc-2">' + T(62, 180, 'Sorun aynı: fiş çıkmıştı. Çok zaman gitti.', 8.8, '#b91c1c', 'start', 800) + '</g>'
svg('basit.svg', 'İki öğrencinin yarışı: Ece önce fişe bakıyor ve 10 saniyede sorunu buluyor; Deniz önce kasayı açıyor ve aynı sorunu yaklaşık 20 dakikada buluyor',
    ya, 360, 200, 'ya')

# ─────────────── Masa sahneleri ───────────────
w('masa-a.svg', masa('h13ma', 'Masa: kasa, monitör, hoparlörler, klavye, kablosuz fare ve duvar prizi; kontrol edilen yer turuncu halkayla gösterilir'))
w('masa-b.svg', masa('h13mb', 'Arıza teşhis masası: kasa, monitör, hoparlörler, klavye, kablosuz fare ve duvar prizi; kontrol edilen yer turuncu halkayla gösterilir'))

# ─────────────── Yedek çizimler (WebGL yoksa) ───────────────
svg('yedek-kapak.svg', 'Masaüstü kasa, monitör ve tozlu bir kasa fanı',
    bg('h13yk') + kasa(40, 70, 1.1, True) + monitor(120, 40, 1.0, 'masaustu', True) + fan(270, 120, 1.1, True) + termo(338, 96, 0.9, 0.8, '#ef4444'))
svg('yedek-acilmiyor.svg', 'Bilgisayar açılmıyor: fiş prizden çıkmış. Kontrol sırası: 1 güç ışığı, 2 fiş, 3 güç düğmesi',
    bg('h13ya2') + kasa(60, 60, 1.1) + monitor(150, 40, 0.9, 'kapali', True) + priz(318, 110, 1.3) + fis(300, 150, 1, -30) +
    '<path d="M120 178 C160 196 280 196 296 176" fill="none" stroke="#1f2937" stroke-width="3"/>' +
    T(90, 210, '1 · Güç ışığı', 11) + T(310, 210, '2 · Fiş', 11) + T(200, 26, '3 · Güç düğmesine bas', 11))
svg('yedek-goruntu.svg', 'Görüntü yok: kasa çalışıyor, monitörde Sinyal yok yazıyor; kablonun monitör ucu gevşek',
    bg('h13yg') + kasa(30, 80, 1.0, True) + monitor(120, 40, 1.1, 'sinyal', True) +
    '<path d="M86 176 C120 190 190 186 208 176" fill="none" stroke="#111827" stroke-width="3"/>' +
    '<circle cx="210" cy="172" r="18" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="5 3"/>' + T(210, 214, 'Kablo gevşek: tam tak', 11, '#b45309'))
svg('yedek-toz.svg', 'Tozlu fan yavaşlar, termometre yükselir',
    bg('h13yt') + fan(70, 60, 2.0, True) + termo(260, 60, 1.6, 0.85, '#ef4444') + T(130, 210, 'Tozlu fan: yavaş', 12, '#475569') + T(260, 210, 'Sıcaklık yüksek', 12, '#b91c1c'))
svg('yedek-temizlik.svg', 'Fiş çekili, fan parmakla tutuluyor, basınçlı hava kısa kısa sıkılıyor',
    bg('h13yc') + fan(120, 60, 1.8, False) + parmak(150, 140, 20, 1.2) + sprey(40, 40, 1.4, -20) +
    '<g fill="#cbd5e1" opacity=".8"><circle cx="112" cy="70" r="6"/><circle cx="102" cy="58" r="4"/><circle cx="96" cy="76" r="3"/></g>' +
    priz(310, 90, 1.3) + fis(290, 140, 1, -35) +
    T(300, 190, 'Fiş çekili', 11, '#047857') + T(160, 214, 'Fanı tut · kısa kısa sık', 12, '#334155'))

# ─────────────── Quiz görseli ───────────────
svg('svg-quiz-monitor.svg', 'Kasanın mavi ışığı yanıyor; monitörün ekranı karanlık ve güç ışığı sönük',
    '<rect width="220" height="120" rx="10" fill="#eef7fe"/>' + kasa(20, 18, 0.8, True) + monitor(84, 10, 0.62, 'kapali', False) +
    '<circle cx="177" cy="69" r="8" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 2"/>' + T(134, 113, 'Monitörün ışığı sönük', 9, '#b45309'), 220, 120)

# ─────────────── Özet küçük resimleri (80×60) ───────────────
def oz(ad, aria, ic, zemin='#e0f2fe'):
    svg(ad, aria, '<rect width="80" height="60" rx="10" fill="%s"/>%s' % (zemin, ic), 80, 60)


oz('oz-1.svg', 'Önce basit: kolaydan zora basamaklar',
   '<path d="M10 50h16v-10h16v-10h16v-10h14" fill="none" stroke="#0ea5e9" stroke-width="4" stroke-linejoin="round"/>' + rozet(18, 34, True, 7))
oz('oz-2.svg', 'Açılmıyor: fiş ve güç düğmesi', priz(56, 28, 1.3) + fis(30, 34, 0.9, -20) +
   '<g transform="translate(18 18)"><circle r="7" fill="none" stroke="#10b981" stroke-width="2.6"/><path d="M0 -9v8" stroke="#10b981" stroke-width="2.6" stroke-linecap="round"/></g>')
oz('oz-3.svg', 'Görüntü yok: monitör ve kablo', monitor(10, 6, 0.38, 'sinyal', True) + '<path d="M40 48 C44 56 60 56 66 50" stroke="#111827" stroke-width="2" fill="none"/>')
oz('oz-4.svg', 'Ses ve fare', '<g transform="translate(14 14)"><rect width="16" height="32" rx="3" fill="#2a2e35"/><circle cx="8" cy="20" r="5" fill="#111" stroke="#4b5563"/></g>' +
   '<path d="M34 22q4 4 0 8M38 18q7 8 0 16" stroke="#10b981" stroke-width="2" fill="none"/>' +
   '<ellipse cx="60" cy="34" rx="8" ry="12" fill="#2f343c"/><line x1="60" y1="23" x2="60" y2="31" stroke="#1f2328"/>')
oz('oz-5.svg', 'Isınma: tozlu fan ve yüksek sıcaklık', fan(8, 8, 0.72, True) + termo(64, 6, 0.62, 0.85, '#ef4444'), '#fee2e2')
oz('oz-6.svg', 'Bakım: fan tutulur, basınçlı hava', fan(30, 10, 0.64, False) + parmak(52, 50, 20, 0.6) + sprey(6, 12, 0.62, -20), '#dcfce7')

# ─────────────── Etkinlik 2: temizlik adımı simgeleri (64×48) ───────────────
def ad(ad_, aria, ic, zemin='#f1f5f9'):
    svg(ad_, aria, '<rect width="64" height="48" rx="8" fill="%s"/>%s' % (zemin, ic), 64, 48)


ad('ad-1.svg', 'Fişi çek', priz(44, 22, 1.1) + fis(22, 22, 0.8, -90) + '<path d="M28 34h8" stroke="#10b981" stroke-width="2.4" stroke-linecap="round"/>')
ad('ad-2.svg', 'Yetişkin kapağı açar', kasa(10, 4, 0.36) + '<rect x="34" y="6" width="3" height="38" rx="1" fill="#94a3b8" transform="rotate(14 34 6)"/>' +
   kisi(50, 30, 0.5, '#1f2937', '#64748b', False))
ad('ad-3.svg', 'Fanı parmakla tut', fan(12, 6, 0.6, True) + parmak(38, 40, 25, 0.75))
ad('ad-4.svg', 'Basınçlı havayı kısa kısa sık', sprey(6, 8, 0.6, -15) + fan(30, 10, 0.5, False) +
   '<g fill="#cbd5e1"><circle cx="30" cy="14" r="3"/><circle cx="25" cy="10" r="2"/></g>')
ad('ad-5.svg', 'Kapağı kapat, fişi tak', kasa(8, 4, 0.36, False) + priz(48, 22, 1.0) + fis(48, 22, 0.7, 0))
ad('ad-6.svg', 'Sıcaklığı ve fanı kontrol et', termo(18, 6, 0.5, 0.35, '#3b82f6') + rozet(44, 24, True, 10))

# ─────────────── Derinleş: bip ───────────────
bp = bg('h13bp', '#f5f3ff', '#ede9fe', 360, 130, 14)
bp += kasa(24, 14, 0.96, True)
bp += monitor(92, 14, 0.66, 'kapali', True)
bp += '<rect x="102" y="22" width="86" height="48" fill="#05070b"/>' + T(145, 38, 'Açılış denetimi', 7.5, '#e5e7eb', weight=700) + '<rect x="112" y="48" width="66" height="4" rx="2" fill="#334155"/><rect x="112" y="48" width="44" height="4" rx="2" fill="#a78bfa"/>'
bp += '<g transform="translate(250 30)"><rect x="-4" y="0" width="36" height="36" rx="18" fill="#1f2937"/><circle cx="14" cy="18" r="9" fill="#111" stroke="#a78bfa" stroke-width="2"/>' + T(14, 50, 'Bip hoparlörü', 8.5, '#5b21b6') + '</g>'
bp += '<g class="bip-dalga" stroke="#8b5cf6" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M290 42q6 6 0 12"/><path d="M298 36q12 12 0 24"/><path d="M306 30q18 18 0 36"/></g>'
svg('bip.svg', 'Bilgisayar açılırken açılış denetimi yapıyor; anakarttaki küçük hoparlör bip sesleriyle sonucu bildiriyor', bp, 360, 130, 'bip')

print('SVG dosyaları yazıldı.')
