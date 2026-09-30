# DON-301 H04 SVG üretici: python3 svg_uret.py  (bu klasörde çalıştırılır)
import math

F = 'font-family="Inter,Arial,sans-serif"'
M = 'font-family="JetBrains Mono,Consolas,monospace"'


def w(ad, s):
    open(ad, 'w').write(s.strip() + '\n')


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, fam=F):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x, y, fam, size, weight, fill, anchor, t)


def bg(i, a='#f8fafc', b='#e0f2fe', W=360, H=240):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
            '</linearGradient></defs><rect width="%d" height="%d" rx="16" fill="url(#%s)"/>' % (i, a, b, W, H, i))


def m2(x, y, L, W, anahtar='M', etiket=None, arka='#f8fafc'):
    """Üstten M.2 kart: konnektör solda (x), 1. pin üstte. anahtar 'M' | 'BM'. L: boy (px), W: en (px)."""
    k = W / 22.0                      # px / mm
    s = '<g>'
    s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" fill="#1b1d22"/>' % (x, y, L, W, k * 0.8)
    # altın temaslar (sol kenar)
    s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="#e3b04f"/>' % (x, y + k * 1.0, k * 2.4, W - k * 2.0)
    for i in range(1, 22):
        s += '<rect x="%.1f" y="%.1f" width="%.1f" height="0.6" fill="#1b1d22" opacity=".55"/>' % (x, y + k * 1.0 + i * (W - k * 2.0) / 22, k * 2.4)
    # çentikler: M ≈ %83, B ≈ %20 (1. pin üstte)
    cent = [0.83] if anahtar == 'M' else [0.2, 0.83]
    for c in cent:
        cy = y + k * 1.0 + c * (W - k * 2.0)
        s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%.1f" fill="%s"/>' % (x - 1, cy - k * 0.75, k * 3.8 + 1, k * 1.5, k * 0.6, arka)
    # bileşenler
    s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="1.5" fill="#2b2f36"/>' % (x + L * 0.12, y + W * 0.24, W * 0.52, W * 0.52)
    s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="1.2" fill="#23262c"/>' % (x + L * 0.3, y + W * 0.27, W * 0.36, W * 0.46)
    s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="1.5" fill="#101114"/>' % (x + L * 0.45, y + W * 0.2, W * 0.7, W * 0.6)
    s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="1.5" fill="#101114"/>' % (x + L * 0.66, y + W * 0.2, W * 0.7, W * 0.6)
    # vida yarım ayı
    s += '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s" stroke="#e3b04f" stroke-width="%.1f"/>' % (x + L, y + W / 2, k * 1.75, arka, k * 0.8)
    if etiket:
        s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="2" fill="#e5e7eb"/>' % (x + L * 0.84 - 2, y + W * 0.22, L * 0.13, W * 0.56)
        fs = min(W * 0.2, (L * 0.13 - 3) / (len(etiket) * 0.78))
        s += T('%.1f' % (x + L * 0.905 - 2), '%.1f' % (y + W / 2 + fs * 0.36), etiket, '%.1f' % fs, '#111827', weight=900)
    return s + '</g>'


def hdd_ust(cx, cy, R, kol=True, sektor=True, izler=True):
    """Üstten HDD plakası + kol (sağ altta mil)."""
    s = '<circle cx="%s" cy="%s" r="%s" fill="#e5e9ef" stroke="#94a3b8" stroke-width="1.5"/>' % (cx, cy, R)
    if izler:
        for i in range(1, 6):
            s += '<circle cx="%s" cy="%s" r="%.1f" fill="none" stroke="#b6c0cc" stroke-width="0.8"/>' % (cx, cy, R * (0.38 + i * 0.11))
    if sektor:
        r0, r1, a0, a1 = R * 0.705, R * 0.815, -0.9, -0.55
        p = 'M%.1f %.1f A%.1f %.1f 0 0 1 %.1f %.1f L%.1f %.1f A%.1f %.1f 0 0 0 %.1f %.1f Z' % (
            cx + r1 * math.cos(a0), cy + r1 * math.sin(a0), r1, r1, cx + r1 * math.cos(a1), cy + r1 * math.sin(a1),
            cx + r0 * math.cos(a1), cy + r0 * math.sin(a1), r0, r0, cx + r0 * math.cos(a0), cy + r0 * math.sin(a0))
        s += '<path d="%s" fill="#f59e0b"/>' % p
    s += '<circle cx="%s" cy="%s" r="%.1f" fill="#9aa3ae" stroke="#6b7280"/>' % (cx, cy, R * 0.26)
    s += '<circle cx="%s" cy="%s" r="%.1f" fill="#6b7280"/>' % (cx, cy, R * 0.07)
    if kol:
        px, py = cx + R * 1.05, cy + R * 0.95
        hx, hy = cx + R * 0.76 * math.cos(-0.72), cy + R * 0.76 * math.sin(-0.72)
        s += '<path d="M%.1f %.1f L%.1f %.1f" stroke="#4b5563" stroke-width="%.1f" stroke-linecap="round"/>' % (px, py, hx, hy, R * 0.07)
        s += '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#374151"/>' % (px, py, R * 0.13)
        s += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="1" fill="#111827" transform="rotate(-40 %.1f %.1f)"/>' % (hx - R * 0.05, hy - R * 0.035, R * 0.1, R * 0.07, hx, hy)
    return s


# ── Kapak yedeği (3D açılamazsa)
w('yedek-kapak.svg', '<svg viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sabit disk plakası, 2,5 inç SSD ve iki M.2 SSD">' +
  bg('d4yk', '#1e1b4b', '#312e81') +
  '<rect x="24" y="34" width="150" height="176" rx="10" fill="#8a9098"/>' + hdd_ust(99, 112, 64) +
  '<rect x="196" y="34" width="140" height="98" rx="8" fill="#1f2937"/><rect x="206" y="44" width="120" height="78" rx="4" fill="#e5e7eb"/>' + T(266, 90, '2,5″ SSD', 14, '#111827', weight=900) +
  m2(196, 148, 140, 24, 'M', 'M') + m2(196, 186, 140, 24, 'BM', 'B+M', arka='#2a2766') + '</svg>')

# ── Isınma: B+M M.2 SSD yuvada, UEFI aygıt görmüyor
w('isinma.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Anakarttaki M.2 yuvasına takılı, iki çentikli M.2 SSD; altta UEFI ekranında M.2 yuvası için aygıt yok yazıyor ve soru işareti">' +
  bg('d4is') +
  '<rect x="18" y="22" width="324" height="112" rx="10" fill="#1f5a3a"/>' +
  '<path d="M40 40h120M40 116h90M200 34v20M230 120h90" stroke="#2f7a52" stroke-width="3"/>' +
  '<rect x="38" y="52" width="26" height="48" rx="3" fill="#111827"/><rect x="58" y="60" width="6" height="32" fill="#374151"/>' +
  m2(62, 56, 220, 40, 'BM', 'SATA', arka='#1f5a3a') +
  '<circle cx="282" cy="76" r="4" fill="#d4a017" stroke="#8a6d1d"/>' +
  T(51, 116, 'M.2 yuvası', 9, '#e2e8f0') + T(51, 127, 'M anahtarı', 8.5, '#bbf7d0') +
  '<rect x="78" y="146" width="204" height="78" rx="10" fill="#0f172a"/>' +
  T(92, 166, 'UEFI · Depolama', 10.5, '#93c5fd', 'start', 900) +
  T(92, 187, 'SATA 1: —', 10, '#cbd5e1', 'start', 700, M) +
  T(92, 205, 'M.2 yuvası: aygıt yok', 10, '#fca5a5', 'start', 800, M) +
  '<circle cx="312" cy="186" r="20" fill="#fff" stroke="#f59e0b" stroke-width="3"/>' + T(312, 194, '?', 22, '#b45309', weight=900) + '</svg>')

# ── HDD yedeği (3D açılamazsa)
w('yedek-hdd.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Üstten sabit disk: plaka üzerinde izler, turuncu işaretli sektör ve kafayı taşıyan kol">' +
  bg('d4yh') + '<rect x="70" y="14" width="220" height="190" rx="12" fill="#9aa1a9"/>' + hdd_ust(165, 104, 78) +
  T(180, 226, 'Erişim = arama süresi + dönüş gecikmesi', 11.5, '#334155') + '</svg>')

# ── Biçim yedeği: gerçek orana yakın ölçekte
S = 1.3   # px / mm
w('yedek-bicim.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="3,5 inç HDD, 2,5 inç SSD ve iki M.2 kart aynı ölçekte yan yana">' +
  bg('d4yb') +
  '<rect x="14" y="20" width="%.1f" height="%.1f" rx="6" fill="#9aa1a9"/>' % (101.6 * S, 147 * S) + T(14 + 101.6 * S / 2, 20 + 147 * S / 2, '3,5″ HDD', 12, '#1f2937', weight=900) +
  '<rect x="160" y="20" width="%.1f" height="%.1f" rx="5" fill="#1f2937"/>' % (69.85 * S, 100 * S) + T(160 + 69.85 * S / 2, 20 + 100 * S / 2, '2,5″ SSD', 11, '#f8fafc', weight=900) +
  '<g transform="translate(270 20) rotate(90) translate(0 -%.1f)">' % (22 * S) + m2(0, 0, 80 * S, 22 * S, 'M') + '</g>' +
  '<g transform="translate(%.1f 20) rotate(90) translate(0 -%.1f)">' % (270 + 22 * S + 12, 22 * S) + m2(0, 0, 80 * S, 22 * S, 'BM') + '</g>' +
  T(300, 150, 'M.2 2280', 10.5, '#334155') + T(300, 163, 'M · B+M', 9.5, '#4f46e5') +
  T(180, 228, 'Aynı ölçek · 3,5″: 101,6 × 147 mm · 2,5″: 69,85 × 100 mm', 10, '#334155') + '</svg>')

# ── Etkinlik 2 yedeği: M.2 kart ve yuva
w('yedek-m2.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="M.2 yuvası ve iki çentikli M.2 SSD; kartın M çentiği yuvadaki anahtarla hizalı">' +
  bg('d4ym') + '<rect x="24" y="60" width="40" height="110" rx="4" fill="#111827"/><rect x="58" y="138" width="10" height="7" fill="#fbbf24"/>' +
  m2(66, 72, 260, 90, 'BM', 'B+M') + T(44, 190, 'Yuva (M)', 11, '#334155') + T(196, 206, 'Çentik anahtara denk gelirse kart girer', 11, '#334155') + '</svg>')

# ── Quiz görseli: iki çentikli M.2 kartın konnektörü
w('svg-quiz-m2.svg', '<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Üstten bir M.2 SSD’nin kenar konnektörü; altın temaslarda iki çentik var">'
  '<rect width="200" height="120" rx="10" fill="#f8fafc"/>' + m2(26, 12, 250, 84, 'BM') +
  '<path d="M14 %.1fh-7M14 %.1fh-7" stroke="#dc2626" stroke-width="2.2"/>' % (12 + 84 / 22.0 + 0.2 * (84 - 2 * 84 / 22.0), 12 + 84 / 22.0 + 0.83 * (84 - 2 * 84 / 22.0)) +
  T(100, 112, 'Kenar konnektörü (üstten görünüş)', 8.5, '#475569') + '</svg>')


# ── Özet simgeleri 80×60
def oz(ad, aria, ic):
    w(ad, '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="80" height="60" rx="10" fill="#e0f2fe"/>%s</svg>' % (aria, ic))


oz('oz-1.svg', 'Sabit disk plakası ve kol', hdd_ust(36, 30, 22))
oz('oz-2.svg', 'NAND blokları: sayfalar yazılır, blok bütün olarak silinir', ''.join('<rect x="%d" y="%d" width="12" height="7" rx="1.5" fill="%s"/>' % (10 + c * 16, 8 + r * 9, ['#4f46e5', '#94a3b8', '#cbd5e1'][(c + r) % 3 if c < 3 else 2])
                                                  for c in range(4) for r in range(5)) + '<rect x="56" y="5" width="16" height="48" rx="3" fill="none" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="3 2"/>')
oz('oz-3.svg', 'Tek SATA hattı ve dört PCIe hattı', T(8, 13, 'SATA', 7, '#92400e', 'start') + '<path d="M8 19H72" stroke="#f59e0b" stroke-width="4" stroke-dasharray="6 4"/>' +
   T(8, 31, 'PCIe x4', 7, '#3730a3', 'start') + ''.join('<path d="M8 %dH72" stroke="#4f46e5" stroke-width="3" stroke-dasharray="6 3"/>' % y for y in (36, 41, 46, 51)))
oz('oz-4.svg', 'M ve B+M anahtarlı M.2 kartlar', m2(8, 10, 62, 16, 'M', arka='#e0f2fe') + m2(8, 34, 62, 16, 'BM', arka='#e0f2fe'))
oz('oz-5.svg', 'Sıralı ve rastgele okuma', '<path d="M10 18H70" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>' +
   ''.join('<rect x="%d" y="%d" width="7" height="7" rx="1.5" fill="#f59e0b"/>' % p for p in ((12, 30), (40, 44), (26, 38), (60, 32), (50, 46))))
oz('oz-6.svg', '3-2-1 yedekleme', ''.join('<rect x="%d" y="16" width="16" height="22" rx="3" fill="%s"/>' % (x, c) for x, c in ((10, '#4f46e5'), (32, '#0ea5e9'), (54, '#10b981'))) +
   T(40, 52, '3 · 2 · 1', 10, '#334155', weight=900))
