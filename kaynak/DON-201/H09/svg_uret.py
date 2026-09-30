# -*- coding: utf-8 -*-
# DON-201 H09 — Güç Kaynağı, Ekran Kartı ve Soğutma: statik SVG sahneleri üretir (bu klasöre yazar). Çalıştır: python3 svg_uret.py
# Not: f-string kullanılmaz (üretim standardı); % biçimlendirme ve düz birleştirme kullanılır.
# Güvenlik: güç kaynağı hiçbir çizimde açık gösterilmez; yalnız dış görünüm ve uyarı etiketi.
import os

KLASOR = os.path.dirname(os.path.abspath(__file__))
F = 'font-family="Inter,Arial,sans-serif"'


def w(ad, s):
    with open(os.path.join(KLASOR, ad), 'w', encoding='utf-8') as f:
        f.write(s.strip() + '\n')


def bg(id_, a='#f0f9ff', b='#dbeafe', W=360, H=240, r=18):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/>'
            '<stop offset="1" stop-color="%s"/></linearGradient></defs><rect width="%d" height="%d" rx="%d" fill="url(#%s)"/>') % (id_, a, b, W, H, r, id_)


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, ek=''):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s"%s>%s</text>' % (x, y, F, size, weight, fill, anchor, ek, t)


def svg(ad, aria, ic, vb='0 0 360 240', sinif=''):
    w(ad, '<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + aria + '"' +
      (' class="' + sinif + '"' if sinif else '') + '>' + ic + '</svg>')


def G(x, y, s=1, ic='', ek=''):
    return '<g transform="translate(%s %s) scale(%s)"%s>%s</g>' % (x, y, s, ek, ic)


# ── Bileşenler ──────────────────────────────────────────────
def psu(x, y, s=1, kablo=True):
    """Güç kaynağı yan görünüm (yalnız dış): gövde, fan ızgarası, uyarı etiketi, kablo demeti. 90 × 56."""
    g = '<rect x="0" y="0" width="90" height="56" rx="5" fill="#1e2126"/><rect x="0" y="0" width="90" height="6" rx="3" fill="#2b2f36"/>'
    g += '<circle cx="28" cy="29" r="19" fill="#0d0e11" stroke="#4b5059" stroke-width="2"/>'
    g += ''.join('<circle cx="28" cy="29" r="%d" fill="none" stroke="#4b5059" stroke-width="1.4"/>' % r for r in (6, 11, 15))
    g += '<path d="M9 29h38M28 10v38" stroke="#4b5059" stroke-width="1.6"/>'
    g += '<rect x="54" y="11" width="31" height="34" rx="2" fill="#f4f5f7"/><rect x="54" y="11" width="31" height="6" rx="1" fill="#111"/>'
    g += '<path d="M69.5 20l9 15h-18z" fill="#facc15" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/><path d="M70.5 24l-3 6h3l-2 4 4-6h-3z" fill="#111"/>'
    g += '<rect x="58" y="38" width="23" height="3" rx="1" fill="#b91c1c"/>'
    if kablo:
        g += ''.join('<path d="M90 %d c10 0 12 %d 22 %d" fill="none" stroke="#1b1c20" stroke-width="3.2" stroke-linecap="round"/>' % (18 + i * 7, 4 + i * 3, 10 + i * 5) for i in range(4))
    return G(x, y, s, g)


def fan_on(x, y, s=1, renk='#1b1d21'):
    """Önden 12 cm fan; (x, y) merkez, 60 × 60."""
    g = '<rect x="-30" y="-30" width="60" height="60" rx="6" fill="%s"/><circle r="27" fill="#0d0e11"/>' % renk
    for i in range(7):
        g += '<path d="M0 0 C 10 -6, 18 -16, 12 -26 C 4 -22, -2 -12, 0 0z" fill="#2b2f36" transform="rotate(%d)"/>' % (i * 51.4)
    g += '<circle r="9" fill="#24272c"/>'
    for c in [(-25, -25), (25, -25), (-25, 25), (25, 25)]:
        g += '<circle cx="%d" cy="%d" r="2" fill="#0d0e11"/>' % c
    return G(x, y, s, g)


def gpu(x, y, s=1, guc_ok=False):
    """Ekran kartı önden: braket (sol), örtü ve iki fan, altta altın PCIe tarağı (çentikli), üstte 8 pinli giriş. ≈ 156 × 70."""
    g = '<rect x="-7" y="-6" width="6" height="74" rx="1" fill="#b9bec6"/><path d="M-7 -6h-5v3h5z" fill="#9aa1aa"/>'
    g += '<rect x="-6" y="8" width="4" height="7" rx="1" fill="#0b0c0e"/><rect x="-6" y="19" width="4" height="7" rx="1" fill="#0b0c0e"/><rect x="-6" y="30" width="4" height="6" rx="1" fill="#0b0c0e"/>'
    g += '<rect x="0" y="0" width="150" height="58" rx="7" fill="#25282e"/><rect x="4" y="3" width="140" height="2" rx="1" fill="#c8cdd4"/>'
    for cx in (42, 104):
        g += '<circle cx="%d" cy="30" r="24" fill="#0d0e11" stroke="#c8cdd4" stroke-width="1.2"/>' % cx
        for i in range(9):
            g += '<path d="M%d 30 c 7 -4, 13 -12, 9 -21 c -6 3, -10 11, -9 21z" fill="#2b2f36" transform="rotate(%d %d 30)"/>' % (cx, i * 40, cx)
        g += '<circle cx="%d" cy="30" r="7" fill="#3a3f47" stroke="#8b929c" stroke-width="1"/>' % cx
    g += '<rect x="126" y="-7" width="16" height="7" rx="1" fill="#17181b"/>' + ''.join('<rect x="%d" y="-5.5" width="2.6" height="2.6" fill="#050506"/>' % (128 + i * 3.4) for i in range(4))
    g += '<path d="M14 58h56v9h-43v-9h-2v9h-11z" fill="#1d1f24"/>'
    g += ''.join('<rect x="%.1f" y="59.5" width="1.3" height="6" fill="#e3b04f"/>' % (15 + i * 2) for i in range(5))
    g += ''.join('<rect x="%.1f" y="59.5" width="1.3" height="6" fill="#e3b04f"/>' % (28.5 + i * 2) for i in range(21))
    if guc_ok:
        g += '<path d="M134 -30 v18" stroke="#ef4444" stroke-width="3"/><path d="M128 -16 l6 8 6 -8z" fill="#ef4444"/>'
    return G(x, y, s, g)


def cip(x, y, s=1, grafik=False):
    """İşlemci çipi üstten (60 × 60); grafik=True ise içinde mor grafik birimi."""
    g = '<rect width="60" height="60" rx="3" fill="#155a34"/><rect x="5" y="5" width="50" height="50" rx="4" fill="#c7cbd1" stroke="#9aa0a8"/>'
    for i in range(4):
        g += '<rect x="%d" y="%d" width="13" height="13" rx="2" fill="#0ea5e9"/>' % (10 + (i % 2) * 16, 10 + (i // 2) * 16)
    if grafik:
        g += '<rect x="42" y="10" width="9" height="29" rx="2" fill="#8b5cf6"/>'
    g += '<path d="M6.2 53.8v-5l5 5z" fill="#e3b04f"/>'
    return G(x, y, s, g)


def ram_dik(x, y, s=1):
    """Dikey RAM (yandan), 10 × 56."""
    g = '<rect width="10" height="56" rx="1.5" fill="#1f5a3a"/>' + ''.join('<rect x="2" y="%d" width="6" height="7" rx="1" fill="#17181c"/>' % (4 + i * 9) for i in range(5))
    g += '<rect x="0" y="50" width="10" height="6" fill="#e3b04f"/>'
    return G(x, y, s, g)


def ram_yatay(x, y, s=1):
    """Yatay RAM (önden), 70 × 18."""
    g = '<rect width="70" height="18" rx="1.5" fill="#1f5a3a"/>' + ''.join('<rect x="%d" y="3" width="7" height="8" rx="1" fill="#17181c"/>' % (4 + i * 8.5) for i in range(8))
    g += '<rect x="0" y="13" width="70" height="5" fill="#e3b04f"/><rect x="38" y="13" width="2" height="5" fill="#fff"/>'
    return G(x, y, s, g)


def ssd(x, y, s=1):
    return G(x, y, s, '<rect width="40" height="26" rx="3" fill="#a9afb8"/><rect x="6" y="6" width="28" height="14" rx="2" fill="#f1f5f9"/>' + T(20, 16, 'SSD', 7, '#334155', weight=900))


def ogrenci(x, y, s=1, gomlek='#0ea5e9', sac='#3b2a20', ten='#e0a77a', kol_kaldir=False):
    """Önden 12–13 yaş görünümlü öğrenci; (x, y) ayak ortası."""
    g = '<rect x="-11" y="-52" width="9" height="52" rx="4.5" fill="#334155"/><rect x="2" y="-52" width="9" height="52" rx="4.5" fill="#334155"/>'
    g += '<rect x="-14" y="-3" width="13" height="5" rx="2.5" fill="#111827"/><rect x="1" y="-3" width="13" height="5" rx="2.5" fill="#111827"/>'
    g += '<rect x="-17" y="-100" width="34" height="54" rx="12" fill="%s"/>' % gomlek
    if kol_kaldir:
        g += '<rect x="13" y="-128" width="9" height="36" rx="4.5" fill="%s" transform="rotate(12 17 -96)"/><circle cx="23" cy="-128" r="5.5" fill="%s"/>' % (gomlek, ten)
    else:
        g += '<rect x="14" y="-96" width="9" height="40" rx="4.5" fill="%s"/><circle cx="18.5" cy="-55" r="5" fill="%s"/>' % (gomlek, ten)
    g += '<rect x="-23" y="-96" width="9" height="40" rx="4.5" fill="%s"/><circle cx="-18.5" cy="-55" r="5" fill="%s"/>' % (gomlek, ten)
    g += '<rect x="-4" y="-106" width="8" height="8" fill="%s"/><ellipse cx="0" cy="-118" rx="13" ry="15" fill="%s"/>' % (ten, ten)
    g += '<path d="M-13 -120c-1 -14 8 -19 14 -19c9 0 14 6 13 17c-4 -5 -9 -8 -16 -7c-5 1 -8 4 -11 9z" fill="%s"/>' % sac
    g += '<circle cx="-5" cy="-117" r="1.5" fill="#1f2937"/><circle cx="5" cy="-117" r="1.5" fill="#1f2937"/><path d="M-4 -109q4 2.5 8 0" stroke="#7c4a2d" stroke-width="1.4" fill="none"/>'
    return G(x, y, s, g)


def priz(x, y, s=1):
    return G(x, y, s, '<rect x="-12" y="-12" width="24" height="24" rx="4" fill="#f8fafc" stroke="#cbd5e1"/><circle r="8.5" fill="#e2e8f0"/>'
             '<circle cx="-3.2" r="1.7" fill="#334155"/><circle cx="3.2" r="1.7" fill="#334155"/>')


def fis(x, y, s=1, rot=0):
    return '<g transform="translate(%s %s) rotate(%s) scale(%s)"><rect x="-7" y="-9" width="14" height="18" rx="5" fill="#1f2937"/><rect x="-3" y="9" width="6" height="6" fill="#1f2937"/></g>' % (x, y, rot, s)


def kilit(x, y, s=1):
    return G(x, y, s, '<path d="M-6 -2v-5a6 6 0 0 1 12 0v5" fill="none" stroke="#b91c1c" stroke-width="3"/><rect x="-9" y="-2" width="18" height="14" rx="3" fill="#ef4444"/><circle cy="4" r="2" fill="#fff"/>')


def ok(x1, y1, x2, y2, renk='#ef4444', gen=2.6, kafa=6):
    import math
    a = math.atan2(y2 - y1, x2 - x1)
    bx, by = x2 - kafa * math.cos(a), y2 - kafa * math.sin(a)
    px, py = -math.sin(a) * kafa * 0.6, math.cos(a) * kafa * 0.6
    return ('<path d="M%.1f %.1f L%.1f %.1f" stroke="%s" stroke-width="%s" stroke-linecap="round"/>'
            '<path d="M%.1f %.1f L%.1f %.1f L%.1f %.1f z" fill="%s"/>') % (x1, y1, bx, by, renk, gen, x2, y2, bx + px, by + py, bx - px, by - py, renk)


def kasa_ic(x, y, s=1, gpu_var=True, psu_var=True, ram_var=True, kablo=False, numara=False):
    """Açık kasa yandan (arka solda, ön sağda): 150 × 170. Numara: 1 RAM yuvaları, 2 işlemci, 3 PCIe yuvası, 4 güç kaynağı yeri."""
    g = '<rect x="0" y="0" width="150" height="170" rx="7" fill="#30343c"/><rect x="6" y="6" width="138" height="158" rx="4" fill="#1d2027"/>'
    g += '<rect x="22" y="12" width="86" height="104" rx="2" fill="#2a2f37"/>'                        # anakart
    g += '<path d="M30 30h20M60 22v16M34 100h40M84 40v30" stroke="#3f4652" stroke-width="1"/>'
    g += '<rect x="34" y="26" width="26" height="26" rx="2" fill="#cbd5e1"/>'                      # soket + soğutucu
    g += '<rect x="30" y="22" width="34" height="34" rx="3" fill="#a9afb8" opacity=".9"/>' + ''.join('<rect x="31" y="%d" width="32" height="1" fill="#8d949e"/>' % (24 + i * 3) for i in range(10))
    g += fan_on(47, 39, 0.42)
    g += '<rect x="74" y="20" width="4" height="44" rx="1" fill="#0f1115"/><rect x="82" y="20" width="4" height="44" rx="1" fill="#0f1115"/>'   # RAM yuvaları
    if ram_var:
        g += '<rect x="74.5" y="21" width="3" height="42" fill="#1f5a3a"/><rect x="82.5" y="21" width="3" height="42" fill="#1f5a3a"/>'
    g += '<rect x="26" y="78" width="60" height="5" rx="1" fill="#0f1115"/>'                       # PCIe yuvası
    if gpu_var:
        g += '<rect x="8" y="80" width="90" height="16" rx="3" fill="#25282e"/><rect x="8" y="94" width="90" height="3" fill="#cfd4da"/>'
        g += '<circle cx="34" cy="92" r="6" fill="#0d0e11"/><circle cx="68" cy="92" r="6" fill="#0d0e11"/><rect x="92" y="77" width="6" height="3" fill="#17181b"/>'
    g += fan_on(8, 36, 0.38)                                                                       # arka fan (solda)
    g += fan_on(140, 52, 0.38) + fan_on(140, 96, 0.38)                                              # ön fanlar
    if psu_var:
        g += '<rect x="8" y="128" width="54" height="32" rx="3" fill="#15171b"/><circle cx="35" cy="144" r="11" fill="#0d0e11" stroke="#4b5059" stroke-width="1.4"/><path d="M24 144h22M35 133v22" stroke="#4b5059"/>'
    else:
        g += '<rect x="8" y="128" width="54" height="32" rx="3" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3"/>'
    g += '<rect x="100" y="150" width="30" height="8" rx="2" fill="#a9afb8"/>'                     # SSD
    if kablo:
        g += '<path d="M60 140 C 80 130, 95 125, 100 100 C 104 80, 104 50, 96 40" fill="none" stroke="#fb923c" stroke-width="3"/>'
        g += '<path d="M56 136 C 70 120, 88 110, 98 84" fill="none" stroke="#facc15" stroke-width="3"/>'
        g += '<path d="M52 134 C 70 110, 76 90, 66 58" fill="none" stroke="#facc15" stroke-width="3"/>'
        g += '<path d="M62 150 C 80 152, 92 154, 100 154" fill="none" stroke="#f87171" stroke-width="3"/>'
    if numara:
        for n, (cx, cy) in enumerate([(80, 12), (47, 64), (56, 72), (35, 122)]):
            g += '<circle cx="%d" cy="%d" r="8" fill="#fff" stroke="#f59e0b" stroke-width="2.2"/>' % (cx, cy) + T(cx, cy + 4, str(n + 1), 11, '#0f172a', weight=900)
    return G(x, y, s, g)


# ── Isınma ──────────────────────────────────────────────────
ic = bg('h9is', '#f8fafc', '#e0f2fe') + '<rect x="0" y="184" width="360" height="56" fill="#e7d3b8"/><rect x="0" y="180" width="360" height="7" fill="#cfb38f"/>'
ic += '<rect x="292" y="40" width="60" height="140" fill="#f1ede6"/>' + priz(322, 150, 1.3)
ic += '<rect x="178" y="56" width="70" height="124" rx="6" fill="#30343c"/><rect x="184" y="62" width="58" height="112" rx="4" fill="#3a3f48"/><circle cx="213" cy="76" r="5" fill="#1d2027" stroke="#bfe3ff" stroke-width="1.5"/>'
ic += '<path d="M248 160 C 270 170, 286 168, 306 152" fill="none" stroke="#1f2937" stroke-width="4"/>' + fis(306, 150, 1, 60)
# soru balonları: işlemci, ekran kartı, fan
ic += '<g opacity=".95"><rect x="96" y="14" width="66" height="44" rx="10" fill="#fff" stroke="#cbd5e1" stroke-width="1.5"/>' + cip(108, 20, 0.52) + T(152, 44, '?', 18, '#b45309', weight=900) + '</g>'
ic += '<g><rect x="176" y="8" width="80" height="40" rx="10" fill="#fff" stroke="#cbd5e1" stroke-width="1.5"/>' + gpu(186, 14, 0.36) + T(246, 36, '?', 18, '#b45309', weight=900) + '</g>'
ic += '<g><rect x="262" y="4" width="58" height="42" rx="10" fill="#fff" stroke="#cbd5e1" stroke-width="1.5"/>' + fan_on(284, 25, 0.5) + T(310, 32, '?', 18, '#b45309', weight=900) + '</g>'
ic += '<path d="M150 58 C 170 70, 190 70, 200 86M216 48 L 214 86M290 46 C 280 60, 250 70, 232 86" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="4 3"/>'
ic += ogrenci(64, 196, 1.02, '#8b5cf6', kol_kaldir=True)
ic += '<rect x="8" y="16" width="80" height="30" rx="10" fill="#fff" stroke="#8b5cf6" stroke-width="1.5"/>' + T(48, 29, 'Elektrik oraya', 9.5, '#5b21b6') + T(48, 40, 'nasıl ulaşır?', 9.5, '#5b21b6')
svg('isinma.svg', 'Prize takılı bir bilgisayar; işlemci, ekran kartı ve fanın yanında soru işaretleri; öğrenci elektriğin onlara nasıl ulaştığını merak ediyor', ic)

# ── Adım 2: kova benzetmesi (güç kaynağının içi GÖSTERİLMEZ) ─────────
ic = '<rect width="220" height="120" rx="10" fill="#f0f9ff"/>'
ic += '<rect x="20" y="16" width="60" height="10" rx="3" fill="#94a3b8"/><rect x="72" y="16" width="10" height="26" rx="3" fill="#94a3b8"/><rect x="40" y="8" width="20" height="8" rx="2" fill="#ef4444"/>'
ic += '<path d="M77 44 v10" stroke="#38bdf8" stroke-width="3" stroke-dasharray="2 3" opacity=".35"/><path d="M70 46 l14 12 M84 46 l-14 12" stroke="#b91c1c" stroke-width="3" stroke-linecap="round"/>'
ic += '<path d="M44 62 h66 l-8 50 h-50 z" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/><path d="M47 72 h60 l-6.6 38 h-46.8 z" fill="#38bdf8"/>'
ic += '<path d="M84 76l-10 15h7l-4 12 12-16h-7z" fill="#facc15" stroke="#a16207" stroke-width="1"/>'
ic += T(165, 50, 'Musluk kapalı', 10.5, '#b91c1c', weight=900) + T(165, 66, 'ama kova', 10.5, '#0f172a') + T(165, 80, 'hâlâ dolu!', 10.5, '#0f172a', weight=900)
ic += '<rect x="126" y="92" width="80" height="18" rx="9" fill="#fee2e2"/>' + T(166, 104.5, 'Fiş çekili ≠ güvenli', 9, '#991b1b', weight=900)
svg('kova.svg', 'Benzetme: musluk kapalı olsa da kova dolu kalır; fiş çekilse de elektrik bir süre saklanır', ic, '0 0 220 120')

# ── Adım 4: tümleşik ve harici (JS: .tm-bar-t/h, .tm-yuk-t/h, .tm-kup-t/h, .tm-durum-t/h) ─────
def monitor(cx, y, sinif):
    g = '<rect x="%d" y="%d" width="76" height="50" rx="5" fill="#1f2937"/><rect x="%d" y="%d" width="68" height="42" rx="3" fill="#0f172a"/>' % (cx - 38, y, cx - 34, y + 4)
    g += '<g transform="translate(%d %d)"><path class="%s" d="" fill="none" stroke="#34d399" stroke-width="1.6" stroke-linejoin="round"/></g>' % (cx, y + 25, sinif)
    g += '<rect x="%d" y="%d" width="10" height="6" fill="#374151"/><rect x="%d" y="%d" width="30" height="3.5" rx="1.7" fill="#374151"/>' % (cx - 5, y + 50, cx - 15, y + 56)
    return g


ic = bg('h9tm', '#f8fafc', '#eef2ff', 360, 230, 16)
for px, baslik, alt, k in ((8, 'TÜMLEŞİK', 'İşlemcinin içinde', 't'), (184, 'HARİCİ', 'Ayrı ekran kartı', 'h')):
    ic += '<rect x="%d" y="6" width="168" height="218" rx="12" fill="#fff" stroke="%s" stroke-width="1.5"/>' % (px, '#bae6fd' if k == 't' else '#ddd6fe')
    ic += T(px + 12, 22, baslik, 11, '#0369a1' if k == 't' else '#6d28d9', 'start', 900) + T(px + 12, 34, alt, 8.5, '#64748b', 'start', 700)
    ic += monitor(px + 124, 12, 'tm-kup-' + k)
    ic += '<rect x="%d" y="182" width="118" height="10" rx="5" fill="#e2e8f0"/><rect class="tm-bar-%s" x="%d" y="182" width="20" height="10" rx="5" fill="#10b981"/>' % (px + 12, k, px + 12)
    ic += T(px + 12, 178, 'Yük', 8.5, '#475569', 'start', 800) + T(px + 158, 191, '', 9, '#0f172a', 'end', 900, ' class="tm-yuk-%s"' % k)
    ic += T(px + 84, 212, '', 10, '#047857', 'middle', 900, ' class="tm-durum-%s"' % k)
# sol: anakart + işlemci (grafik birimi içinde) + RAM paylaşımı
ic += '<rect x="18" y="82" width="148" height="84" rx="5" fill="#1f5a3a"/>' + cip(30, 94, 0.95, grafik=True)
ic += T(90, 104, 'grafik', 8, '#fff', 'start', 800) + T(90, 114, 'birimi', 8, '#fff', 'start', 800) + ok(89, 108, 81, 108, '#c4b5fd', 1.6, 4)
ic += '<rect x="140" y="88" width="10" height="72" rx="1.5" fill="#0f172a"/>' + ram_dik(140, 90, 1.2)
ic += ok(92, 126, 136, 126, '#f59e0b', 2.2, 6) + ok(136, 132, 92, 132, '#f59e0b', 2.2, 6) + T(113, 147, 'RAM’i', 8, '#fff', 'middle', 800) + T(113, 157, 'paylaşır', 8, '#fff', 'middle', 800)
# sağ: harici kart + kendi belleği + ek güç + monitör kablosu
ic += gpu(208, 98, 0.8)
ic += '<path d="M313 92 C 313 82, 340 84, 346 72" fill="none" stroke="#facc15" stroke-width="3"/>' + T(304, 84, 'ek güç', 8, '#a16207', 'end', 900)
ic += '<path d="M202 112 C 192 112, 192 80, 222 78 C 250 76, 282 76, 300 70" fill="none" stroke="#475569" stroke-width="2.2"/>'
ic += T(196, 50, 'Monitör kablosu', 7.5, '#475569', 'start', 800) + T(196, 60, 'karta takılır', 7.5, '#475569', 'start', 800)
ic += '<rect x="226" y="156" width="92" height="16" rx="8" fill="#ede9fe"/>' + T(272, 167, 'kendi belleği + fanı', 8.5, '#6d28d9', 'middle', 900)
svg('tumlesik.svg', 'Karşılaştırma: solda işlemcinin içindeki grafik birimi RAM’i paylaşıyor; sağda kendi belleği, fanları ve ek güç kablosu olan harici ekran kartı; üstte iki monitörde dönen küp, altta yük göstergeleri', ic, '0 0 360 230', 'tm')

# ── Yedek çizimler ──────────────────────────────────────────
svg('yedek-kapak.svg', 'Çift fanlı ekran kartı, uyarı etiketli güç kaynağı ve kasa fanı',
    bg('h9yk') + psu(16, 120, 1.05) + gpu(118, 70, 1.05) + fan_on(310, 150, 0.8))

ic = bg('h9ya', '#f8fafc', '#e0f2fe') + kasa_ic(110, 40, 1.05, kablo=True)
ic += priz(52, 180, 1.2) + '<path d="M60 172 C 80 160, 96 168, 118 176" fill="none" stroke="#a855f7" stroke-width="3.5"/>' + T(52, 206, '230 V', 10, '#7e22ce', weight=900)
ic += '<rect x="274" y="44" width="80" height="84" rx="10" fill="#fff" stroke="#cbd5e1"/>' + T(314, 60, 'Enerji', 10, '#0f172a', weight=900)
for i, (r, t) in enumerate((('#facc15', '12 V'), ('#fb923c', '12 · 5 · 3,3 V'), ('#f87171', '5 V'), ('#a855f7', '230 V priz'))):
    ic += '<rect x="282" y="%d" width="12" height="5" rx="2" fill="%s"/>' % (70 + i * 14, r) + T(298, 75 + i * 14, t, 8, '#334155', 'start', 800)
svg('yedek-akis.svg', 'Açık kasa: prizden gelen 230 V güç kaynağına girer; renkli kablolarla işlemciye, ekran kartına ve anakarta 12 V, diske 5 V dağılır', ic)

ic = bg('h9yp', '#fff7ed', '#ffedd5') + psu(70, 70, 2.0, kablo=False) + kilit(160, 58, 1.8)
ic += '<rect x="96" y="196" width="168" height="26" rx="13" fill="#fee2e2"/>' + T(180, 214, 'Güç kaynağı asla açılmaz!', 12, '#991b1b', weight=900)
svg('yedek-psu.svg', 'Güç kaynağının dış görünümü ve uyarı etiketi; kilit simgesi: asla açılmaz', ic)

ic = bg('h9yg') + gpu(92, 70, 1.15)
ic += T(40, 120, 'Görüntü', 9.5, '#0f172a', weight=900) + T(40, 132, 'çıkışları', 9.5, '#0f172a', weight=900) + ok(60, 118, 82, 104, '#0ea5e9')
ic += T(150, 176, 'PCIe tarağı', 10, '#a16207', weight=900) + ok(150, 164, 128, 146, '#0ea5e9')
ic += T(280, 48, 'Güç girişi', 10, '#0f172a', weight=900) + ok(262, 52, 250, 62, '#0ea5e9')
ic += T(180, 30, 'Fanlar ve soğutucu', 10, '#0f172a', weight=900)
svg('yedek-gpu.svg', 'Ekran kartı: iki fan, soğutucu örtüsü, görüntü çıkışları, PCIe tarağı ve güç girişi', ic)

ic = bg('h9yh', '#f8fafc', '#e0f2fe') + kasa_ic(104, 36, 1.05)
for yy in (86, 132):
    ic += ok(330, yy, 268, yy, '#38bdf8', 4, 9)
ic += ok(112, 74, 50, 74, '#f97316', 4, 9) + ok(112, 132, 50, 132, '#f97316', 3, 8)
ic += T(302, 60, 'Serin hava girer', 10, '#0369a1', weight=900) + T(70, 58, 'Sıcak hava çıkar', 10, '#c2410c', weight=900)
svg('yedek-hava.svg', 'Açık kasa: serin hava öndeki fanlardan girer, parçaların üstünden geçip ısınır, arkadan çıkar', ic)

ic = bg('h9yx', '#f8fafc', '#eef2ff') + kasa_ic(128, 30, 0.95, gpu_var=False, psu_var=False, ram_var=False)
ic += psu(20, 176, 0.62) + T(48, 222, 'Güç kaynağı', 9, weight=900)
ic += gpu(18, 96, 0.52) + T(58, 90, 'Ekran kartı', 9, weight=900)
ic += ram_yatay(22, 40, 0.8) + T(50, 34, 'RAM', 9, weight=900)
ic += ssd(292, 190, 0.9) + T(310, 186, 'Disk', 9, weight=900)
ic += fan_on(310, 70, 0.6) + T(310, 36, 'Fan', 9, weight=900)
svg('yedek-patlat.svg', 'Patlatma görünümü: güç kaynağı, ekran kartı, bellek, disk ve fan kasadan ayrılmış, etiketli', ic)

ic = bg('h9ym', '#f8fafc', '#e0f2fe') + kasa_ic(100, 34, 1.0, gpu_var=False, psu_var=False, ram_var=False, numara=True)
ic += psu(12, 40, 0.5) + gpu(10, 90, 0.48) + ram_yatay(14, 160, 0.6) + T(46, 200, 'Parçaları sürükle', 9.5, '#0369a1', weight=900)
svg('yedek-montaj.svg', 'Sanal montaj: solda güç kaynağı, ekran kartı ve RAM; sağda numaralı yerleri olan açık kasa', ic)

# ── Quiz görseli: numaralı açık kasa (ekran kartı ve güç kaynağı takılı değil) ──
svg('svg-quiz-kasa.svg', 'Açık kasa: 1 RAM yuvaları, 2 işlemci ve soğutucusu, 3 uzun yuva, 4 kasanın altındaki boş yer',
    '<rect width="200" height="180" rx="10" fill="#eef7fe"/>' + kasa_ic(25, 5, 1.0, gpu_var=False, psu_var=False, ram_var=False, numara=True), '0 0 200 180')


# ── Etkinlik 2: kutu ve kart resimleri ─────────────────────
svg('kutu-tumlesik.svg', 'İçinde grafik birimi olan işlemci', '<rect width="120" height="90" rx="10" fill="#e0f2fe"/>' + cip(30, 15, 1.0, grafik=True), '0 0 120 90')
svg('kutu-harici.svg', 'Harici ekran kartı', '<rect width="120" height="90" rx="10" fill="#ede9fe"/>' + gpu(14, 26, 0.62), '0 0 120 90')


def kart(ad, aria, ic_, renk='#f8fafc'):
    svg(ad, aria, '<rect width="160" height="120" rx="12" fill="%s"/>' % renk + ic_, '0 0 160 120')


def ekran(x, y, ww, hh, ic_=''):
    return ('<rect x="%d" y="%d" width="%d" height="%d" rx="5" fill="#1f2937"/><rect x="%d" y="%d" width="%d" height="%d" rx="3" fill="#f8fafc"/>' %
            (x, y, ww, hh, x + 4, y + 4, ww - 8, hh - 8)) + ic_


kart('is-odev.svg', 'Ödev yazmak: ekranda yazı', ekran(30, 18, 100, 70, ''.join('<rect x="44" y="%d" width="%d" height="4" rx="2" fill="#94a3b8"/>' % (32 + i * 10, 72 - (i % 3) * 14) for i in range(5))) +
     '<rect x="70" y="88" width="20" height="8" fill="#374151"/><rect x="54" y="96" width="52" height="5" rx="2.5" fill="#374151"/>')
kart('is-oyun.svg', 'Yüksek ayarda 3D oyun: ekranda dağlar ve araba', ekran(22, 14, 116, 78,
     '<rect x="26" y="18" width="108" height="70" fill="#7dd3fc"/><path d="M26 70 L50 44 L66 58 L88 36 L112 60 L134 48 V88 H26z" fill="#15803d"/><path d="M26 88 L64 66 H96 L134 88z" fill="#475569"/>'
     '<rect x="66" y="66" width="28" height="11" rx="3" fill="#ef4444"/><circle cx="72" cy="78" r="3" fill="#111"/><circle cx="88" cy="78" r="3" fill="#111"/>') +
     '<rect x="48" y="96" width="64" height="16" rx="8" fill="#1f2937"/><circle cx="60" cy="104" r="3" fill="#f59e0b"/><circle cx="100" cy="104" r="3" fill="#10b981"/>')
kart('is-video.svg', 'Film izlemek: oynat düğmesi', ekran(30, 18, 100, 70, '<rect x="34" y="22" width="92" height="62" fill="#1e293b"/><circle cx="80" cy="53" r="17" fill="#fff" opacity=".92"/><path d="M75 44 l14 9 -14 9z" fill="#1e293b"/><rect x="40" y="76" width="80" height="3" rx="1.5" fill="#64748b"/><rect x="40" y="76" width="34" height="3" rx="1.5" fill="#ef4444"/>') +
     '<rect x="70" y="88" width="20" height="8" fill="#374151"/><rect x="54" y="96" width="52" height="5" rx="2.5" fill="#374151"/>')
kart('is-animasyon.svg', '3D animasyon film: tel kafes karakter', ekran(22, 14, 116, 80, '<rect x="26" y="18" width="108" height="72" fill="#0f172a"/>' +
     '<g fill="none" stroke="#a78bfa" stroke-width="1.2"><circle cx="80" cy="36" r="10"/><path d="M70 36h20M80 26v20M72 30l16 12M88 30l-16 12"/><path d="M66 50h28l-4 26H70z"/><path d="M66 50l-12 16M94 50l12 16M70 63h20M68 76l-2 10M92 76l2 10"/></g>') +
     '<rect x="60" y="98" width="40" height="12" rx="6" fill="#ede9fe"/>' + T(80, 107, '3D', 8, '#6d28d9', weight=900))
kart('is-arastirma.svg', 'İnternette araştırma: arama çubuğu ve büyüteç', ekran(30, 18, 100, 70, '<rect x="40" y="28" width="80" height="12" rx="6" fill="#fff" stroke="#94a3b8"/><circle cx="112" cy="34" r="3.5" fill="none" stroke="#475569" stroke-width="1.5"/>' +
     ''.join('<rect x="42" y="%d" width="%d" height="4" rx="2" fill="%s"/>' % (48 + i * 9, 60 - i * 8, '#3b82f6' if i % 2 == 0 else '#cbd5e1') for i in range(4))) +
     '<rect x="70" y="88" width="20" height="8" fill="#374151"/><rect x="54" y="96" width="52" height="5" rx="2.5" fill="#374151"/>')
kart('is-vr.svg', 'Sanal gerçeklik gözlüğü', '<path d="M36 50 h88 a12 12 0 0 1 12 12 v18 a12 12 0 0 1 -12 12 h-24 l-10 -10 h-20 l-10 10 h-24 a12 12 0 0 1 -12 -12 v-18 a12 12 0 0 1 12 -12z" fill="#334155"/>'
     '<rect x="44" y="60" width="30" height="20" rx="8" fill="#7c3aed" opacity=".8"/><rect x="86" y="60" width="30" height="20" rx="8" fill="#7c3aed" opacity=".8"/><path d="M36 58 C 20 40, 30 26, 50 26 H110 C 130 26, 140 40, 124 58" fill="none" stroke="#475569" stroke-width="5"/>')
kart('is-sunum.svg', 'Sunum hazırlamak: slayt ve grafik', ekran(30, 18, 100, 70, '<rect x="40" y="26" width="50" height="6" rx="3" fill="#0ea5e9"/><rect x="40" y="40" width="34" height="4" rx="2" fill="#94a3b8"/><rect x="40" y="48" width="30" height="4" rx="2" fill="#94a3b8"/>'
     '<rect x="88" y="58" width="8" height="18" fill="#10b981"/><rect x="100" y="48" width="8" height="28" fill="#f59e0b"/><rect x="112" y="40" width="8" height="36" fill="#8b5cf6"/>') +
     '<rect x="70" y="88" width="20" height="8" fill="#374151"/><rect x="54" y="96" width="52" height="5" rx="2.5" fill="#374151"/>')
kart('is-mimari.svg', 'Binanın 3D modeli', '<rect x="16" y="12" width="128" height="96" rx="8" fill="#0f172a"/>'
     '<g fill="none" stroke="#38bdf8" stroke-width="1.4"><path d="M40 90 V46 L80 30 L120 46 V90 Z"/><path d="M40 46 L80 62 L120 46 M80 62 V100 M40 90 L80 100 L120 90"/>'
     '<path d="M52 60v10M64 64v10M96 64v10M108 60v10M52 78v8M64 82v8M96 82v8M108 78v8"/></g>')

# ── Özet küçük resimleri (80 × 60) ───────────────────────────
def oz(ad, aria, ic_, renk='#e0f2fe'):
    svg(ad, aria, '<rect width="80" height="60" rx="10" fill="%s"/>' % renk + ic_, '0 0 80 60')


oz('oz-1.svg', 'Güç kaynağı enerjiyi dağıtır', psu(6, 14, 0.42, kablo=False) + '<path d="M44 24 C 56 24, 60 14, 72 12M44 30 H72M44 36 C 56 36, 60 46, 72 48" fill="none" stroke-width="2.4" stroke="#facc15"/><path d="M44 30 H72" stroke="#fb923c" stroke-width="2.4"/>')
oz('oz-2.svg', 'Güç kaynağı asla açılmaz', psu(8, 16, 0.42, kablo=False) + kilit(60, 28, 1.1), '#fee2e2')
oz('oz-3.svg', 'Ekran kartı', gpu(12, 18, 0.36))
oz('oz-4.svg', 'Tümleşik ve harici', cip(8, 14, 0.5, grafik=True) + T(44, 34, '/', 12, '#64748b', weight=900) + gpu(50, 20, 0.16), '#ede9fe')
oz('oz-5.svg', 'Hava akışı', '<rect x="22" y="10" width="36" height="42" rx="4" fill="#30343c"/>' + ok(78, 22, 58, 22, '#38bdf8', 3, 6) + ok(78, 38, 58, 38, '#38bdf8', 3, 6) + ok(22, 26, 3, 26, '#f97316', 3, 6))
oz('oz-6.svg', 'Hepsi bir arada', kasa_ic(22, 4, 0.31), '#dcfce7')
print('SVG üretildi.')
