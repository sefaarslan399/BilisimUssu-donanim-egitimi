# -*- coding: utf-8 -*-
"""DON-201 H11 SVG'lerini üretir (düz birleştirme; f-string yok).
Çalıştır: python3 kaynak/DON-201/H11/svg_uret.py
"""
import os

KLASOR = os.path.dirname(os.path.abspath(__file__))
F = 'font-family="Inter,Arial,sans-serif"'


def yaz(ad, icerik):
    with open(os.path.join(KLASOR, ad), 'w', encoding='utf-8') as f:
        f.write(icerik.strip() + '\n')


def s(x):
    return str(round(x, 1))


def rect(x, y, w, h, fill, rx=0, ek=''):
    return ('<rect x="' + s(x) + '" y="' + s(y) + '" width="' + s(w) + '" height="' + s(h) + '"' +
            (' rx="' + s(rx) + '"' if rx else '') + ' fill="' + fill + '"' + (' ' + ek if ek else '') + '/>')


def yazi(x, y, metin, boy=11, renk='#1f2937', agirlik=800, hiza='middle', ek=''):
    return ('<text x="' + s(x) + '" y="' + s(y) + '" ' + F + ' font-size="' + str(boy) + '" font-weight="' + str(agirlik) +
            '" text-anchor="' + hiza + '" fill="' + renk + '"' + (' ' + ek if ek else '') + '>' + metin + '</text>')


def cip(x, y, metin, renk, yazi_renk='#fff', boy=11, w=None):
    w = w or (len(metin) * boy * 0.62 + 18)
    return rect(x - w / 2, y - 11, w, 22, renk, 11) + yazi(x, y + 4, metin, boy, yazi_renk)


def l_cokgen(x, y, w, h_dil, h_kol, k_w, sol, ters=False):
    """L biçimi: yatay dil (x..x+w, y..y+h_dil) + bir ucunda yukarı kol (k_w genişlik, h_kol yükseklik).
    ters=True ise şekil kendi merkezi etrafında 180° döner."""
    if sol:
        pts = [(x, y + h_dil), (x + w, y + h_dil), (x + w, y), (x + k_w, y), (x + k_w, y - h_kol), (x, y - h_kol)]
    else:
        pts = [(x, y + h_dil), (x + w, y + h_dil), (x + w, y - h_kol), (x + w - k_w, y - h_kol), (x + w - k_w, y), (x, y)]
    if ters:
        cx = x + w / 2.0
        cy = (y + h_dil + y - h_kol) / 2.0
        pts = [(2 * cx - px, 2 * cy - py) for (px, py) in pts]
    return ' '.join(s(px) + ',' + s(py) for (px, py) in pts)


def port(x, y, w, sol, olcek=1.0):
    """Diskteki SATA port (önden): koyu çerçeve + L biçimli dil + altın temaslar."""
    k = olcek
    o = rect(x - 5 * k, y - 16 * k, w + 10 * k, 27 * k, '#15161a', 3 * k)
    o += '<polygon points="' + l_cokgen(x, y, w, 5 * k, 12 * k, 5 * k, sol) + '" fill="#737985"/>'
    o += rect(x + 3 * k, y + 5 * k, w - 6 * k, 1.6 * k, '#e3b04f')
    return o


def fis(x, y, w, sol, ters, olcek=1.0, govde='#1b1c21'):
    """Kablo ucu (ağız önden): gövde + L biçimli koyu yuva."""
    k = olcek
    o = rect(x - 9 * k, y - 20 * k, w + 18 * k, 34 * k, govde, 5 * k)
    o += rect(x - 7 * k, y - 18 * k, w + 14 * k, 30 * k, '#3c4048', 4 * k)
    o += '<polygon points="' + l_cokgen(x - 1 * k, y - 1 * k, w + 2 * k, 7 * k, 14 * k, 7 * k, sol, ters) + '" fill="#050507"/>'
    return o


def kablo_serit(x1, y1, x2, y2, renk='#c3242a', gen=16):
    return ('<path d="M' + s(x1) + ' ' + s(y1) + ' C' + s(x1) + ' ' + s(y1 + 30) + ' ' + s(x2) + ' ' + s(y2 - 30) + ' ' + s(x2) + ' ' + s(y2) +
            '" fill="none" stroke="' + renk + '" stroke-width="' + str(gen) + '" stroke-linecap="butt"/>')


def teller(x, y, x2, y2, ara=6, renkler=('#e8b10c', '#17181b', '#d0282b', '#17181b')):
    o = ''
    n = len(renkler)
    for i, r in enumerate(renkler):
        dx = (i - (n - 1) / 2.0) * ara
        o += ('<path d="M' + s(x + dx) + ' ' + s(y) + ' C' + s(x + dx) + ' ' + s(y + 26) + ' ' + s(x2 + dx) + ' ' + s(y2 - 26) + ' ' +
              s(x2 + dx) + ' ' + s(y2) + '" fill="none" stroke="' + r + '" stroke-width="4.2" stroke-linecap="round"/>')
    return o


def disk_arka(x, y, w, h):
    """3,5 inç diskin konnektör tarafı (önden)."""
    o = rect(x, y, w, h, '#9ba1a9', 10)
    o += rect(x, y, w, 10, '#c3c8ce', 6)
    o += rect(x + 12, y + h - 12, w - 24, 9, '#1f4a33', 2)
    return o


def arkaplan(id_, w, h, ust='#f0f9ff', alt='#dbeafe', rx=18):
    return ('<defs><linearGradient id="' + id_ + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + ust +
            '"/><stop offset="1" stop-color="' + alt + '"/></linearGradient></defs>' + rect(0, 0, w, h, 'url(#' + id_ + ')', rx))


def svg(vb, etiket, govde):
    return ('<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + etiket + '">' + govde + '</svg>')


# ── Isınma: L ucu ters tutulmuş kablo, diskteki porta yaklaşıyor ──
g = arkaplan('h11isBg', 360, 240)
g += rect(0, 212, 360, 28, '#cbd5e1', 0)
g += disk_arka(30, 30, 300, 96)
g += port(62, 86, 76, True, 1.0)
g += port(172, 86, 140, False, 1.0)
g += yazi(100, 60, 'veri', 11, '#334155') + yazi(242, 60, 'güç', 11, '#334155')
g += kablo_serit(100, 200, 100, 252, '#c3242a', 30)
g += fis(62, 186, 76, True, True, 1.0)
g += '<path d="M100 162 V112" stroke="#0369a1" stroke-width="3" stroke-dasharray="5 5" fill="none"/><path d="M93 119 l7 -9 l7 9" fill="none" stroke="#0369a1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
g += cip(100, 16, 'Port: L biçimli', '#0369a1', '#fff', 11)
g += cip(236, 188, 'Kablo ucu ters tutuldu', '#475569', '#fff', 11)
g += '<circle cx="318" cy="150" r="18" fill="#fff" stroke="#f59e0b" stroke-width="3"/>' + yazi(318, 157, '?', 20, '#b45309', 900)
yaz('isinma.svg', svg('0 0 360 240', 'Diskin arkasında L biçimli veri ve güç portları; altta L ucu ters tutulmuş kırmızı veri kablosu porta yaklaşıyor', g))

# ── Quiz görseli: port ve ters tutulan kablo ucu ──
g = rect(0, 0, 200, 110, '#e2e8f0', 10)
g += disk_arka(20, 10, 160, 44)
g += port(66, 40, 68, True, 0.95)
g += fis(66, 92, 68, True, True, 0.95)
g += '<path d="M100 72 V60" stroke="#475569" stroke-width="2.5" fill="none"/><path d="M95 64 l5 -6 l5 6" fill="none" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>'
g += yazi(170, 96, 'Kablo ucu', 10, '#334155') + yazi(41, 42, 'Port', 10, '#1f2937')
yaz('svg-quiz-ters.svg', svg('0 0 200 110', 'Üstte diskteki L biçimli port, altta porta doğru tutulan kablo ucu; kablo ucundaki L yuvası porttakine göre ters', g))

# ── Adım 5: kapak kapalı + öğretmen onayı kontrol sahnesi ──
g = arkaplan('h11oBg', 360, 200, '#f8fafc', '#e0f2fe', 16)
g += rect(0, 168, 360, 32, '#dbe4ee', 0)
# kablolar grubu (sol)
k = '<g id="g-kablo" class="gk">' + rect(18, 64, 70, 30, '#9ba1a9', 5) + rect(24, 88, 58, 5, '#1f4a33', 1)
k += rect(28, 70, 16, 10, '#17181c', 2) + rect(52, 70, 28, 10, '#17181c', 2)
k += kablo_serit(36, 80, 30, 130, '#c3242a', 7) + teller(66, 80, 70, 130, 3.5)
k += '<circle cx="80" cy="60" r="9" fill="#10b981"/><path d="M76 60 l3 3 l5 -6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
k += yazi(52, 150, 'Kablolar tam', 11, '#475569', 800, 'middle', 'class="gk-yazi"') + '</g>'
g += k
# kasa + kapak (orta)
g += rect(128, 30, 96, 136, '#1f2227', 6)
kp = '<g id="g-kapak" class="gk">' + rect(132, 34, 88, 128, '#30343c', 5) + rect(138, 92, 6, 26, '#3b404a', 2)
kp += '<circle cx="216" cy="46" r="5" fill="#9aa1aa"/><circle cx="216" cy="150" r="5" fill="#9aa1aa"/>'
kp += yazi(176, 186, 'Kapak kapalı', 11, '#475569', 800, 'middle', 'class="gk-yazi"') + '</g>'
g += kp
# alet ve vidalar kutuda (sağ üst)
a = '<g id="g-alet" class="gk"><path d="M252 52 h58 l-5 26 h-48z" fill="#3b82f6"/>' + rect(248, 46, 66, 8, '#60a5fa', 2)
a += '<path d="M266 40 l24 -16" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/><path d="M290 24 l10 -7" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>'
a += '<circle cx="276" cy="44" r="3.5" fill="#9aa1aa"/><circle cx="286" cy="44" r="3.5" fill="#9aa1aa"/>'
a += yazi(281, 94, 'Alet kasada yok', 11, '#475569', 800, 'middle', 'class="gk-yazi"') + '</g>'
g += a
# öğretmen onayı (sağ alt)
o = '<g id="g-ogretmen" class="gk"><circle cx="282" cy="130" r="22" fill="#fff" stroke="#047857" stroke-width="3.5"/>'
o += '<circle cx="282" cy="130" r="17" fill="none" stroke="#047857" stroke-width="1.5" stroke-dasharray="3 3"/>'
o += '<path d="M272 130 l7 7 l13 -14" fill="none" stroke="#047857" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
o += yazi(282, 170, 'Öğretmen onayı', 11, '#475569', 800, 'middle', 'class="gk-yazi"') + '</g>'
g += o
yaz('adim5-onay.svg', svg('0 0 360 200', 'Kapanış kontrolü: kablolar tam takılı, kapak kapalı ve vidalı, alet ve vidalar kutuda, öğretmen onayı', g))

# ── Rozet: öğretmen onayı (fiş takılı) ──
yaz('fis-onay.svg', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    '<path d="M9 2v5M15 2v5"/><path d="M6 7h12v4a6 6 0 0 1-12 0z"/><path d="M12 17v5"/><circle cx="19" cy="18" r="4.2" fill="#10b981" stroke="#10b981"/>'
    '<path d="M17.2 18l1.3 1.3 2.3-2.5" stroke="#fff" stroke-width="1.8"/></svg>')

# ── Kapak yedeği: disk + kablolar ──
g = arkaplan('h11kBg', 360, 240, '#f8fafc', '#e0f2fe')
g += '<polygon points="70,92 250,70 318,104 138,130" fill="#c3c8ce"/><polygon points="138,130 318,104 318,134 138,162" fill="#9ba1a9"/>'
g += '<polygon points="70,92 138,130 138,162 70,122" fill="#8a9098"/><ellipse cx="206" cy="100" rx="52" ry="16" fill="#cdd2d8"/>'
g += '<path d="M92 112 C70 150 52 170 40 214" fill="none" stroke="#c3242a" stroke-width="12"/>'
g += teller(118, 124, 92, 220, 5)
g += cip(92, 32, 'Veri kablosu', '#0369a1') + cip(236, 196, 'Güç kablosu', '#b45309')
yaz('yedek-disk.svg', svg('0 0 360 240', 'Sabit disk; arkasına kırmızı veri kablosu ve renkli telli güç kablosu takılı', g))

# ── Özet küçük resimleri (80 × 60) ──
def kucuk(ad, etiket, govde):
    yaz(ad, '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + etiket + '">' + rect(0, 0, 80, 60, '#e0f2fe', 10) + govde + '</svg>')


# 1 Bul
g = rect(10, 10, 60, 22, '#9ba1a9', 4) + rect(14, 28, 52, 3, '#1f4a33') + rect(16, 20, 12, 7, '#17181c', 1) + rect(36, 20, 26, 7, '#17181c', 1)
g += kablo_serit(22, 27, 16, 58, '#c3242a', 6) + teller(49, 27, 54, 58, 3)
g += '<circle cx="64" cy="14" r="7" fill="none" stroke="#0369a1" stroke-width="2.5"/><path d="M69 19 l5 5" stroke="#0369a1" stroke-width="2.8" stroke-linecap="round"/>'
kucuk('oz-1.svg', 'Disk ve iki kablosu: kırmızı veri, renkli telli güç', g)
# 2 Sök
g = rect(6, 44, 68, 6, '#a9afb8', 1) + rect(28, 24, 42, 18, '#9ba1a9', 3) + rect(30, 38, 38, 3, '#1f4a33')
g += '<path d="M24 32 H8 M13 27 l-5 5 l5 5" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
g += '<circle cx="54" cy="12" r="5" fill="#9aa1aa"/><path d="M51 12 h6 M54 9 v6" stroke="#475569" stroke-width="1.5"/>'
kucuk('oz-2.svg', 'Disk kızaktan kayarak çıkıyor, vida sökülüyor', g)
# 3 Tak
g = rect(8, 6, 64, 18, '#9ba1a9', 4) + port(26, 18, 28, True, 0.5)
g += fis(26, 46, 28, True, False, 0.55)
g += '<path d="M62 44 V28 M58 32 l4 -4 l4 4" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'
kucuk('oz-3.svg', 'L biçimli kablo ucu, porttaki L ile hizalı', g)
# 4 Kontrol
g = rect(8, 8, 64, 20, '#9ba1a9', 4) + rect(18, 22, 18, 12, '#17181c', 2) + rect(42, 22, 26, 12, '#17181c', 2)
g += kablo_serit(27, 34, 22, 60, '#c3242a', 6) + teller(55, 34, 58, 60, 3)
g += '<circle cx="66" cy="46" r="9" fill="#10b981"/><path d="M62 46 l3 3 l5 -6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
kucuk('oz-4.svg', 'İki kablo ucu da tam oturmuş, onay işareti', g)
# 5 Onay
g = rect(14, 8, 30, 44, '#30343c', 3) + '<circle cx="40" cy="12" r="2" fill="#9aa1aa"/><circle cx="40" cy="48" r="2" fill="#9aa1aa"/>'
g += '<circle cx="58" cy="32" r="13" fill="#fff" stroke="#047857" stroke-width="2.5"/><path d="M52 32 l4 4 l8 -8" fill="none" stroke="#047857" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
kucuk('oz-5.svg', 'Kapağı kapalı kasa ve öğretmen onayı damgası', g)
# 6 Aç ve doğrula
g = rect(10, 6, 60, 38, '#1f2937', 4) + rect(14, 10, 52, 30, '#0f172a', 2) + rect(34, 44, 12, 6, '#475569') + rect(26, 50, 28, 3, '#475569', 1)
g += rect(18, 15, 26, 5, '#e2e8f0', 1) + rect(18, 26, 26, 5, '#e2e8f0', 1)
g += '<path d="M50 17 l3 3 l6 -6 M50 28 l3 3 l6 -6" fill="none" stroke="#34d399" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
kucuk('oz-6.svg', 'Monitörde sistem bilgisi: RAM ve disk satırlarında onay', g)
print('SVG üretildi.')
