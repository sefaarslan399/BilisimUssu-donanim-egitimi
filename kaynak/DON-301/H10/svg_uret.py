# DON-301 H10 SVG üretici: python3 svg_uret.py  (f-string yok; tek tırnak kullanılmaz: SVG'ler JS dizgelerine gömülür)
F = 'font-family="Inter,Arial,sans-serif"'
M = 'font-family="JetBrains Mono,Consolas,monospace"'

PCB = '#1b2723'
KASA = '#30343c'
KASA_IC = '#4b515c'
METAL = '#c7cbd1'
ALTIN = '#e4b75a'
MOR = '#6d28d9'
MOR_DK = '#4c1d95'
KIRMIZI = '#b91c1c'
YESIL = '#047857'


def w(ad, s):
    open(ad, 'w').write(s.strip().replace('\n', '') + '\n')


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, fam=F):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x, y, fam, size, weight, fill, anchor, t)


def bg(i, a='#f8fafc', b='#ede9fe', W=360, H=240):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>'
            '<rect width="%d" height="%d" rx="16" fill="url(#%s)"/>') % (i, a, b, W, H, i)


def ayak(x, y, h=10, renk='#c9a44c'):
    """Mesafe vidası yandan: (x,y) taban ortası."""
    return ('<rect x="%s" y="%s" width="6" height="%s" rx="1" fill="%s"/><path d="M%s %s h6 M%s %s h6" stroke="#8a6d2a" stroke-width=".8"/>'
            % (x - 3, y - h, h, renk, x - 3, y - h * 0.35, x - 3, y - h * 0.7))


def pin_basligi(x, y, s=1.0, etiket=True, vurgu=None, fisler=None):
    """F_PANEL 2×5 (10. pim yok). Üst sıra çift (2,4,6,8), alt sıra tek (1,3,5,7,9). vurgu: pim numaraları."""
    g = '<g transform="translate(%s %s) scale(%s)"><rect x="0" y="0" width="112" height="52" rx="5" fill="#17181b"/>' % (x, y, s)
    ad = {1: 'HDD+', 3: 'HDD−', 5: 'RST', 7: 'RST', 9: 'NC', 2: 'PLED+', 4: 'PLED−', 6: 'PWR', 8: 'PWR'}
    for i in range(5):
        for j in range(2):
            n = (i * 2 + 2) if j == 0 else (i * 2 + 1)
            cx = 14 + i * 21
            cy = 15 if j == 0 else 37
            if n == 10:
                g += '<rect x="%s" y="%s" width="8" height="8" rx="1.5" fill="none" stroke="#475569" stroke-dasharray="2 1.5"/>' % (cx - 4, cy - 4)
                continue
            renk = '#fde047' if vurgu and n in vurgu else ALTIN
            g += '<rect x="%s" y="%s" width="8" height="8" rx="1.5" fill="%s"/>' % (cx - 4, cy - 4, renk)
            if etiket:
                g += T(cx, cy - 7 if j == 0 else cy + 14, str(n), 7, '#e2e8f0', weight=800, fam=M)
    if fisler:
        for (i, j, renk) in fisler:
            cx = 14 + i * 21
            cy = 15 if j == 0 else 37
            g += '<rect x="%s" y="%s" width="30" height="12" rx="2.5" fill="%s" stroke="#0f172a" stroke-width="1.2"/>' % (cx - 5, cy - 6, renk)
    return g + '</g>'


# ── Kapak yedeği (3D açılmazsa): yan yatırılmış açık kasa, üstten
kapak = ('<svg viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet" style="overflow:visible" xmlns="http://www.w3.org/2000/svg" role="img" '
         'aria-label="Yan yatırılmış, yan kapağı açık kasa: anakart, güç kaynağı, ekran kartı, SSD ve düzenli güç kabloları">'
         '<defs><linearGradient id="kpBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ede9fe"/><stop offset="1" stop-color="#ddd6fe"/></linearGradient></defs>'
         '<rect x="-600" y="-600" width="1560" height="1440" fill="url(#kpBg)"/>'
         '<rect x="40" y="24" width="280" height="196" rx="10" fill="' + KASA + '"/><rect x="48" y="32" width="264" height="180" rx="6" fill="' + KASA_IC + '"/>'
         '<rect x="118" y="40" width="186" height="146" rx="4" fill="' + PCB + '"/>'
         '<rect x="236" y="46" width="60" height="56" rx="4" fill="#cfd4da" stroke="#9aa1ab"/>' +
         ''.join('<path d="M240 %d h52" stroke="#aab1ba"/>' % (50 + i * 6) for i in range(8)) +
         ''.join('<rect x="%d" y="112" width="5" height="62" rx="1.5" fill="#15803d"/>' % (270 + i * 9) for i in range(2)) +
         '<rect x="126" y="128" width="118" height="30" rx="4" fill="#23262c"/><circle cx="160" cy="143" r="11" fill="#111827" stroke="#475569"/><circle cx="208" cy="143" r="11" fill="#111827" stroke="#475569"/>'
         '<rect x="54" y="40" width="54" height="84" rx="4" fill="#1e2126"/>' + T(81, 86, 'GÜÇ', 9, '#94a3b8', weight=800) +
         '<rect x="58" y="146" width="44" height="30" rx="3" fill="#9aa1ab"/>' + T(80, 165, 'SSD', 8, '#1f2937', weight=900) +
         '<path d="M108 70 C130 70 150 170 290 170" stroke="#111" stroke-width="5" fill="none"/>'
         '<path d="M108 60 C140 30 250 30 296 44" stroke="#111" stroke-width="3" fill="none"/>' +
         T(180, 234, 'Kasada montaj: anakart · güç · ekran kartı · SSD', 10, MOR_DK, weight=800) +
         '</svg>')
w('yedek-kapak.svg', kapak)

# ── Isınma: ayaksız anakart (yandan kesit)
isinma = ('<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Yandan kesit: solda anakart doğrudan metal tepsiye yatırılmış, alt yüzündeki lehim noktaları metale değiyor ve soru işareti var; sağda aynı kart mesafe vidalarının üstünde, tepsiden birkaç milimetre yukarıda">'
          + bg('isBg') +
          T(92, 30, 'Doğrudan tepsiye?', 12, KIRMIZI, weight=900) + T(268, 30, 'Ayakların üstünde', 12, YESIL, weight=900) +
          '<path d="M180 16 V224" stroke="#c4b5fd" stroke-dasharray="4 4"/>'
          # sol: tepsi + kart temasta
          '<rect x="20" y="150" width="144" height="16" rx="3" fill="' + METAL + '" stroke="#9aa1ab"/>' + T(92, 184, 'Metal tepsi', 10, '#475569', weight=700) +
          '<rect x="26" y="128" width="132" height="14" rx="2" fill="' + PCB + '"/>' +
          ''.join('<path d="M%d 142 l3 8 3 -8z" fill="#cbd5e1"/>' % (34 + i * 16) for i in range(8)) +
          ''.join('<path d="M%d 152 l-4 -6 M%d 152 l4 -6" stroke="#f59e0b" stroke-width="1.6"/>' % (37 + i * 32, 37 + i * 32) for i in range(4)) +
          '<rect x="44" y="104" width="30" height="24" rx="3" fill="#cfd4da"/><rect x="96" y="116" width="40" height="12" rx="2" fill="#23262c"/>'
          '<circle cx="150" cy="90" r="14" fill="#fff" stroke="#f59e0b" stroke-width="2.5"/>' + T(150, 96, '?', 16, '#b45309', weight=900) +
          T(92, 206, 'Lehim noktaları metale değiyor', 9.5, KIRMIZI, weight=700) +
          # sağ: ayaklı
          '<rect x="196" y="150" width="144" height="16" rx="3" fill="' + METAL + '" stroke="#9aa1ab"/>' + T(268, 184, 'Metal tepsi', 10, '#475569', weight=700) +
          ayak(212, 150, 18) + ayak(268, 150, 18) + ayak(324, 150, 18) +
          '<rect x="202" y="118" width="132" height="14" rx="2" fill="' + PCB + '"/>' +
          ''.join('<path d="M%d 132 l3 6 3 -6z" fill="#cbd5e1"/>' % (218 + i * 16) for i in range(7)) +
          '<rect x="220" y="94" width="30" height="24" rx="3" fill="#cfd4da"/><rect x="272" y="106" width="40" height="12" rx="2" fill="#23262c"/>'
          '<path d="M346 132 v18" stroke="' + MOR + '" stroke-width="1.5"/><path d="M342 136 l4 -4 4 4 M342 146 l4 4 4 -4" stroke="' + MOR + '" stroke-width="1.5" fill="none"/>' +
          T(268, 206, 'Mesafe vidası = boşluk', 9.5, YESIL, weight=700) + '</svg>')
w('isinma.svg', isinma)

# ── Quiz görseli: ön panel şeması
w('svg-quiz-panel.svg', '<svg viewBox="0 0 260 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ön panel başlığı şeması: üst sıra 2 PLED artı, 4 PLED eksi, 6 PWR, 8 PWR, 10 boş; alt sıra 1 HDD artı, 3 HDD eksi, 5 RST, 7 RST, 9 boşta">'
  '<rect width="260" height="120" rx="10" fill="#f8fafc"/>' + T(130, 15, 'Kılavuz · F_PANEL', 10, MOR_DK, weight=900) +
  pin_basligi(54, 26, 1.35, True) +
  ''.join(T(54 + (14 + i * 21) * 1.35, 23, a, 8, '#334155', weight=800) for i, a in enumerate(['PLED+', 'PLED−', 'PWR', 'PWR', '—'])) +
  ''.join(T(54 + (14 + i * 21) * 1.35, 106, a, 8, '#334155', weight=800) for i, a in enumerate(['HDD+', 'HDD−', 'RST', 'RST', 'NC'])) +
  T(130, 117, 'Güç düğmesi (PWR SW) nereye?', 8.5, '#b45309', weight=800) + '</svg>')


# ── Özet simgeleri 80×60
def oz(ad, aria, ic):
    w(ad, '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="80" height="60" rx="10" fill="#ede9fe"/>%s</svg>' % (aria, ic))


oz('oz-1.svg', 'Kasanın arka açıklığına içeriden takılan G/Ç plakası',
   '<rect x="8" y="8" width="64" height="44" rx="4" fill="' + KASA + '"/><rect x="18" y="14" width="44" height="14" rx="2" fill="' + METAL + '"/>' +
   ''.join('<rect x="%d" y="18" width="5" height="6" rx="1" fill="#1f2937"/>' % (22 + i * 8) for i in range(4)) +
   '<circle cx="56" cy="21" r="2" fill="#1f2937"/>' +
   ''.join('<rect x="%d" y="34" width="4" height="14" rx="1" fill="#6b7280"/>' % (22 + i * 7) for i in range(6)))
oz('oz-2.svg', 'Mesafe vidalarının üstünde anakart',
   '<rect x="6" y="46" width="68" height="6" rx="2" fill="' + METAL + '"/>' + ayak(16, 46, 8) + ayak(40, 46, 8) + ayak(64, 46, 8) +
   '<rect x="8" y="30" width="64" height="8" rx="2" fill="' + PCB + '"/>' +
   '<path d="M16 14 v10 M40 14 v10 M64 14 v10" stroke="' + MOR + '" stroke-width="2"/><path d="M12 20l4 5 4-5M36 20l4 5 4-5M60 20l4 5 4-5" fill="none" stroke="' + MOR + '" stroke-width="2"/>')
oz('oz-3.svg', 'Güç kaynağından anakarta 24-pin ve 8-pin kablolar',
   '<rect x="6" y="34" width="26" height="20" rx="3" fill="#1e2126"/><circle cx="19" cy="44" r="6" fill="none" stroke="#4b5059" stroke-width="2"/>'
   '<rect x="40" y="6" width="34" height="48" rx="3" fill="' + PCB + '"/><rect x="66" y="22" width="5" height="20" rx="1" fill="#e5e7eb"/><rect x="46" y="9" width="10" height="4" rx="1" fill="#e5e7eb"/>'
   '<path d="M32 42 C50 44 58 32 66 32" stroke="#111" stroke-width="3" fill="none"/><path d="M28 36 C30 18 40 11 46 11" stroke="#111" stroke-width="2" fill="none"/>' +
   T(62, 52, '24', 7, '#e2e8f0', weight=900) + T(51, 21, '8', 7, '#e2e8f0', weight=900))
oz('oz-4.svg', 'Ön panel başlığına takılı dört fiş', pin_basligi(12, 16, 0.5, False, None, [(0, 1, '#f59e0b'), (0, 0, '#22c55e'), (2, 0, '#3b82f6'), (2, 1, '#ef4444')]))
oz('oz-5.svg', 'Ekran kartı yuvada, ek gücü takılı; yanında SSD',
   '<rect x="4" y="44" width="72" height="6" rx="2" fill="' + PCB + '"/><rect x="8" y="16" width="44" height="26" rx="3" fill="#23262c"/>'
   '<circle cx="22" cy="29" r="8" fill="#111827" stroke="#475569"/><circle cx="40" cy="29" r="8" fill="#111827" stroke="#475569"/>'
   '<rect x="14" y="42" width="30" height="4" fill="' + ALTIN + '"/><rect x="42" y="10" width="7" height="6" rx="1" fill="#111"/><path d="M45 10 C45 4 56 4 60 8" stroke="#111" stroke-width="2" fill="none"/>'
   '<rect x="58" y="20" width="16" height="22" rx="2" fill="#9aa1ab"/>')
oz('oz-6.svg', 'Monitörde POST ekranı: donanım denetimi geçti',
   '<rect x="12" y="6" width="56" height="38" rx="4" fill="#0f172a"/><path d="M34 44 h12 v6 h-12z" fill="#475569"/><rect x="26" y="50" width="28" height="4" rx="2" fill="#475569"/>' +
   ''.join('<rect x="18" y="%d" width="%d" height="3" rx="1.5" fill="#86efac"/>' % (12 + i * 7, 28 + (i % 2) * 10) for i in range(4)) +
   '<circle cx="60" cy="14" r="3" fill="#22c55e"/>')


# ── Etkinlik 2 kart çizimleri 200×90
def kr(ad, aria, ic):
    w(ad, '<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="200" height="90" rx="10" fill="#f5f3ff"/>%s</svg>' % (aria, ic))


kr('kr-1.svg', 'Üstten görünüş: kartın dokuz vida deliği ayaklarla eşleşiyor ama ortada deliğe denk gelmeyen onuncu bir ayak kartın altında kalmış',
   '<rect x="40" y="8" width="120" height="74" rx="4" fill="' + METAL + '"/>'
   '<rect x="50" y="12" width="100" height="66" rx="3" fill="' + PCB + '" fill-opacity=".82"/>' +
   ''.join('<circle cx="%d" cy="%d" r="4" fill="#c9a44c" stroke="#e2e8f0"/>' % (x, y) for x in (56, 100, 144) for y in (18, 45, 72)) +
   '<circle cx="122" cy="58" r="4.5" fill="#ef4444" stroke="#fff" stroke-width="1.5"/>' +
   '<path d="M128 60 h28" stroke="' + KIRMIZI + '" stroke-width="1.5"/>' + T(160, 64, 'delik yok', 8.5, KIRMIZI, 'start', 800))
kr('kr-2.svg', 'Arka panelden görünüş: G/Ç plakasının bir tırnağı USB portunun ağzına girmiş',
   '<rect x="30" y="18" width="140" height="54" rx="4" fill="' + METAL + '" stroke="#9aa1ab"/>' +
   ''.join('<rect x="%d" y="30" width="16" height="10" rx="1.5" fill="#1f2937"/><rect x="%d" y="48" width="16" height="10" rx="1.5" fill="#1f2937"/>' % (44 + i * 26, 44 + i * 26) for i in range(4)) +
   '<path d="M70 48 l6 6 l-2 4" stroke="#e5e7eb" stroke-width="2.5" fill="none"/><circle cx="74" cy="53" r="11" fill="none" stroke="' + KIRMIZI + '" stroke-width="2"/>' +
   T(100, 84, 'Tırnak USB portunun içinde', 8.5, KIRMIZI, weight=800))
kr('kr-3.svg', 'Anakartın EPS işlemci güç girişine PCIe 6+2 yazılı fiş zorlanmış, fiş tam girmemiş',
   '<rect x="30" y="50" width="140" height="30" rx="3" fill="' + PCB + '"/><rect x="74" y="54" width="52" height="16" rx="2" fill="#17181b"/>' +
   T(100, 88, 'EPS (CPU) girişi', 8, '#475569', weight=800) +
   '<g transform="rotate(-6 100 36)"><rect x="72" y="26" width="56" height="20" rx="3" fill="#23262c" stroke="#475569"/>' + T(100, 40, 'PCIe 6+2', 9, '#fde68a', weight=900) + '</g>'
   '<path d="M100 8 v14" stroke="#111" stroke-width="5"/><path d="M134 44 l10 -6" stroke="' + KIRMIZI + '" stroke-width="2"/>' + T(148, 38, 'zorlanmış', 8.5, KIRMIZI, 'start', 800))
kr('kr-4.svg', 'Ön panel başlığı: güç ışığı fişinin artı ucu eksi pinde, diğer fişler doğru yerde',
   pin_basligi(44, 18, 1.0, True, None, [(0, 1, '#f59e0b'), (2, 1, '#3b82f6'), (2, 0, '#ef4444')]) +
   '<rect x="53" y="27" width="30" height="12" rx="2.5" fill="#22c55e" stroke="#0f172a" stroke-width="1.2"/>' + T(55, 36, '−', 9, '#fff', weight=900) + T(73, 36, '+', 9, '#fff', weight=900) +
   T(172, 36, 'PLED', 9, '#15803d', 'start', 900) + T(172, 48, '+ nerede?', 8, '#b45309', 'start', 800))
kr('kr-5.svg', 'Kasanın arkası: ekran kartı takılı ama monitör kablosu anakartın HDMI çıkışına takılmış; ekranda sinyal yok',
   '<rect x="20" y="8" width="84" height="74" rx="4" fill="' + KASA + '"/><rect x="30" y="14" width="40" height="14" rx="2" fill="' + METAL + '"/>'
   '<rect x="44" y="18" width="8" height="5" rx="1" fill="#111827"/><rect x="30" y="44" width="60" height="10" rx="2" fill="' + METAL + '"/>' +
   ''.join('<rect x="%d" y="47" width="7" height="4" rx="1" fill="#111827"/>' % (36 + i * 12) for i in range(4)) +
   '<path d="M48 20 C80 -4 120 10 128 26" stroke="#111" stroke-width="3" fill="none"/>'
   '<rect x="128" y="18" width="56" height="38" rx="4" fill="#0f172a"/>' + T(156, 41, 'Sinyal yok', 8.5, '#fca5a5', weight=800) +
   T(60, 38, 'anakart', 7, '#e2e8f0', weight=700) + T(60, 66, 'ekran kartı', 7, '#e2e8f0', weight=700))
kr('kr-6.svg', 'Anakartta 24-pin, 8-pin ve ekran kartı ek güç fişleri tırnaklarıyla oturmuş; ekran kartı braketinden vidalı',
   '<rect x="24" y="10" width="126" height="72" rx="4" fill="' + PCB + '"/>'
   '<rect x="136" y="26" width="10" height="36" rx="2" fill="#17181b"/><rect x="132" y="26" width="6" height="36" rx="1" fill="#23262c"/>'
   '<rect x="40" y="14" width="22" height="8" rx="2" fill="#17181b"/><rect x="40" y="10" width="22" height="6" rx="1" fill="#23262c"/>'
   '<rect x="30" y="50" width="96" height="22" rx="3" fill="#23262c"/><rect x="100" y="44" width="16" height="7" rx="1.5" fill="#17181b"/>'
   '<circle cx="34" cy="61" r="2.5" fill="#c9a44c"/>' +
   ''.join('<path d="M%d %d l3 3 5 -6" stroke="#22c55e" stroke-width="2.2" fill="none"/>' % (x, y) for (x, y) in ((154, 44), (66, 18), (120, 40))) +
   T(176, 50, '24-pin', 7.5, '#475569', 'start', 800))
print('SVG’ler yazıldı.')
