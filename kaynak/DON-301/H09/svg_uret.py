# DON-301 H09 SVG üretici: python3 svg_uret.py  (f-string yok; tek tırnak kullanılmaz: SVG'ler JS dizgelerine gömülür)
F = 'font-family="Inter,Arial,sans-serif"'
M = 'font-family="JetBrains Mono,Consolas,monospace"'

PCB = '#1b2723'
PCB2 = '#24352f'
SOKET = '#2a2d33'
METAL = '#c7cbd1'
METAL_DK = '#9aa1ab'
MACUN = '#9ea3a9'
ALTIN = '#f3c85a'
MOR = '#6d28d9'
MOR_DK = '#4c1d95'


def w(ad, s):
    open(ad, 'w').write(s.strip().replace('\n', '') + '\n')


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, fam=F):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x, y, fam, size, weight, fill, anchor, t)


def bg(i, a='#f8fafc', b='#ede9fe', W=360, H=240):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>'
            '<rect width="%d" height="%d" rx="16" fill="url(#%s)"/>') % (i, a, b, W, H, i)


def ucgen(x, y, s, kose, renk=ALTIN):
    """Köşe üçgeni: (x,y) köşe noktası, s kenar, kose: sa (sol-alt), so (sol-üst), sg (sağ-üst), sd (sağ-alt)."""
    dx = s if kose in ('sa', 'so') else -s
    dy = -s if kose in ('sa', 'sd') else s
    return '<path d="M%s %s h%s L%s %s z" fill="%s"/>' % (x, y, dx, x, y + dy, renk)


def soket(x, y, s=1.0, kose='sa', acik=False):
    """Üstten soket (LGA): (x,y) sol üst; 46×52 birim × s. kose: soket üçgeninin köşesi."""
    g = ('<g transform="translate(%s %s) scale(%s)"><rect x="-4" y="-5" width="54" height="62" rx="4" fill="#6b7280"/>'
         '<rect x="0" y="0" width="46" height="52" rx="3" fill="%s"/>') % (x, y, s, SOKET)
    g += '<rect x="5" y="5" width="36" height="42" rx="2" fill="#3a3226"/>'
    for i in range(7):
        for j in range(8):
            if 2 <= i <= 4 and 3 <= j <= 4:
                continue
            g += '<rect x="%s" y="%s" width="2.4" height="2.4" fill="#e4b75a"/>' % (7 + i * 5, 7 + j * 5)
    k = {'sa': (2, 50), 'so': (2, 2), 'sg': (44, 2), 'sd': (44, 50)}[kose]
    g += ucgen(k[0], k[1], 8, kose)
    return g + '</g>'


def cpu(x, y, s=1.0, kose='sa', macun=None):
    """Üstten işlemci: (x,y) sol üst; 38×38 birim × s. macun: None | 'nokta' | 'kalin' | 'yayik'."""
    g = '<g transform="translate(%s %s) scale(%s)"><rect x="0" y="0" width="38" height="38" rx="3" fill="#1f5a3a"/>' % (x, y, s)
    g += '<rect x="3" y="3" width="32" height="32" rx="3" fill="%s" stroke="%s" stroke-width=".8"/>' % (METAL, METAL_DK)
    g += '<rect x="6" y="6" width="26" height="26" rx="2.5" fill="#d7dbe0"/>'
    k = {'sa': (1, 37), 'so': (1, 1), 'sg': (37, 1), 'sd': (37, 37)}[kose]
    g += ucgen(k[0], k[1], 6, kose)
    if macun == 'nokta':
        g += '<ellipse cx="19" cy="19" rx="3.4" ry="3" fill="%s"/><ellipse cx="18" cy="18" rx="1.2" ry=".9" fill="#c9cdd2"/>' % MACUN
    elif macun == 'yayik':
        g += '<circle cx="19" cy="19" r="11" fill="%s" fill-opacity=".9"/>' % MACUN
    elif macun == 'kalin':
        g += ('<path d="M-3 4 Q-6 19 -2 34 Q6 43 19 40 Q32 44 40 35 Q44 19 41 4 Q31 -5 19 -2 Q6 -5 -3 4z" fill="%s" stroke="#7d838a" stroke-width=".8"/>'
              '<path d="M4 10 Q19 6 33 12 M5 24 Q19 20 33 26" stroke="#b4b8bd" stroke-width="1.2" fill="none"/>') % MACUN
    return g + '</g>'


def ram_yuvalari(x, y, dolu, s=1.0, etiket=True, h=96):
    """Dört dikey RAM yuvası (A1 A2 B1 B2); dolu: dolu yuva indeksleri."""
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    ad = ['A1', 'A2', 'B1', 'B2']
    for i in range(4):
        xx = i * 16
        g += '<rect x="%s" y="0" width="9" height="%s" rx="2" fill="%s"/>' % (xx, h, '#4a4f58' if i % 2 == 0 else '#17181b')
        g += '<rect x="%s" y="-4" width="9" height="5" rx="1.5" fill="#9ca3af"/><rect x="%s" y="%s" width="9" height="5" rx="1.5" fill="#9ca3af"/>' % (xx, xx, h - 1)
        if i in dolu:
            g += '<rect x="%s" y="2" width="7" height="%s" rx="1" fill="#15803d"/>' % (xx + 1, h - 4)
            for c in range(6):
                g += '<rect x="%s" y="%s" width="5" height="9" rx="1" fill="#111827"/>' % (xx + 2, 8 + c * ((h - 20) / 6.0))
        if etiket:
            g += T(xx + 4.5, h + 16, ad[i], 9, '#e2e8f0' if i in dolu else '#94a3b8', weight=800, fam=M)
    return g + '</g>'


# ── Kapak yedeği (3D açılmazsa): üstten montajı bitmiş anakart
kapak = ('<svg viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet" style="overflow:visible" xmlns="http://www.w3.org/2000/svg" role="img" '
         'aria-label="Anakart kutusunun üstünde montajı tamamlanmış anakart: işlemci ve soğutucu, A2 ve B2 yuvalarında RAM, M.2 SSD">'
         '<defs><linearGradient id="kpBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ede9fe"/><stop offset="1" stop-color="#ddd6fe"/></linearGradient></defs>'
         '<rect x="-600" y="-600" width="1560" height="1440" fill="url(#kpBg)"/>'
         '<rect x="86" y="30" width="190" height="196" rx="8" fill="#b98a55"/><rect x="92" y="24" width="178" height="190" rx="6" fill="' + PCB + '"/>'
         '<rect x="92" y="24" width="14" height="80" fill="#3b4048"/>'
         # soğutucu (üstten: kanatçık bloğu + fan)
         '<rect x="128" y="36" width="52" height="92" rx="4" fill="#cfd4da" stroke="#9aa1ab"/>' +
         ''.join('<path d="M131 %d h46" stroke="#aab1ba" stroke-width="1"/>' % (42 + i * 6) for i in range(14)) +
         '<rect x="180" y="34" width="14" height="96" rx="3" fill="#2a2d33"/>'
         + ram_yuvalari(204, 40, [1, 3], 0.9, False, 90) +
         T(214, 136, 'A2', 8, MOR_DK, weight=900, fam=M) + T(243, 136, 'B2', 8, MOR_DK, weight=900, fam=M) +
         # PCIe + M.2
         '<rect x="110" y="160" width="100" height="7" rx="2" fill="#9ca3af"/><rect x="110" y="186" width="100" height="7" rx="2" fill="#17181b"/>'
         '<rect x="118" y="146" width="62" height="10" rx="2" fill="#0f172a"/><rect x="120" y="148" width="14" height="6" fill="#111827"/><rect x="138" y="148" width="14" height="6" fill="#111827"/>'
         '<circle cx="184" cy="151" r="2.4" fill="#c9a44c"/>' +
         T(149, 142, 'M.2', 8, '#e2e8f0', weight=800, fam=M) +
         '<rect x="252" y="150" width="10" height="36" rx="2" fill="#17181b"/>' +
         T(181, 238, 'Tezgâhta montaj: işlemci · soğutucu · RAM · M.2', 10, MOR_DK, weight=800) +
         '</svg>')
w('yedek-kapak.svg', kapak)

# ── Isınma: termal macun ne kadar?
secenek = [('A', 'kalin', 'Tamamı, kalın'), ('B', 'nokta', 'Ortaya, küçük'), ('C', None, 'Hiç yok')]
isinma = ('<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sokete takılmış işlemcinin üstünde termal macun şırıngası; üç seçenek: kapağın tamamına kalın katman, ortaya küçük bir nokta, hiç macun yok">'
          + bg('isBg') +
          soket(22, 64, 1.55, 'sa') + cpu(33, 80, 1.55, 'sa') +
          # şırınga
          '<g transform="translate(62 6) rotate(20)"><rect x="0" y="0" width="16" height="46" rx="4" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>'
          '<rect x="2" y="16" width="12" height="28" rx="2" fill="' + MACUN + '"/><rect x="5" y="46" width="6" height="10" rx="1.5" fill="#cbd5e1"/>'
          '<rect x="-3" y="-6" width="22" height="6" rx="2" fill="#64748b"/></g>'
          '<circle cx="62" cy="112" r="11" fill="#fff" stroke="#f59e0b" stroke-width="2.5"/>' + T(62, 117, '?', 13, '#b45309', weight=900) +
          T(62, 170, 'Ne kadar macun?', 10, MOR_DK, weight=800) +
          '<path d="M118 20 V220" stroke="#c4b5fd" stroke-dasharray="4 4"/>')
for i, (h, m, a) in enumerate(secenek):
    x = 134 + i * 76
    isinma += ('<rect x="%d" y="62" width="68" height="112" rx="10" fill="#fff" stroke="#ddd6fe" stroke-width="1.5"/>' % x +
               '<circle cx="%d" cy="80" r="10" fill="%s"/>' % (x + 34, MOR) + T(x + 34, 84, h, 11, '#fff', weight=900) +
               cpu(x + 12, 98, 1.16, 'sa', m) + T(x + 34, 162, a, 9, '#334155', weight=700))
isinma += T(248, 206, 'Soğutucu tabanı bu yüzeye oturacak.', 9.5, '#64748b', weight=600) + '</svg>'
w('isinma.svg', isinma)

# ── Quiz görseli: üçgenler farklı köşede
w('svg-quiz-ucgen.svg', '<svg viewBox="0 0 240 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Üstten görünüm: soketin köşe üçgeni sol altta, sokete indirilen işlemcinin köşe üçgeni sağ üstte">'
  '<rect width="240" height="110" rx="10" fill="#f8fafc"/>' +
  soket(24, 24, 1.1, 'sa') + T(50, 104, 'Soket', 9, '#334155') +
  '<path d="M98 55 h28" stroke="#64748b" stroke-width="2.5"/><path d="M122 49l7 6-7 6" fill="none" stroke="#64748b" stroke-width="2.5"/>' +
  T(112, 44, 'indir', 8, '#64748b', weight=700) +
  '<g opacity=".95">' + cpu(146, 18, 1.75, 'sg') + '</g>' + T(179, 104, 'İşlemci', 9, '#334155') +
  '<circle cx="222" cy="22" r="10" fill="#fff" stroke="#f59e0b" stroke-width="2"/>' + T(222, 26, '?', 12, '#b45309', weight=900) + '</svg>')


# ── Özet simgeleri 80×60
def oz(ad, aria, ic):
    w(ad, '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="80" height="60" rx="10" fill="#ede9fe"/>%s</svg>' % (aria, ic))


oz('oz-1.svg', 'ESD: bileklik matın topraklama düğmesine bağlı',
   '<rect x="6" y="38" width="68" height="14" rx="3" fill="#6b8fb5"/><circle cx="62" cy="45" r="4" fill="#e2e8f0" stroke="#475569"/>'
   '<ellipse cx="20" cy="18" rx="12" ry="7" fill="none" stroke="#2563eb" stroke-width="4"/>'
   '<path d="M32 19 C44 22 50 30 58 41" fill="none" stroke="#1f2937" stroke-width="1.8" stroke-dasharray="2.5 1.5"/>'
   '<path d="M8 8 l4 6 -3 0 4 7" fill="none" stroke="#f59e0b" stroke-width="1.8"/>')
oz('oz-2.svg', 'İşlemci üçgeni soketteki üçgenle aynı köşede', soket(18, 6, 0.9, 'sa') + cpu(24, 14, 0.85, 'sa') +
   '<path d="M62 12 v16" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/><circle cx="62" cy="10" r="3" fill="#475569"/>')
oz('oz-3.svg', 'Pirinç tanesi kadar macun ve soğutucu',
   '<rect x="12" y="40" width="34" height="8" rx="2" fill="#1f5a3a"/><rect x="15" y="34" width="28" height="7" rx="2" fill="' + METAL + '"/>'
   '<ellipse cx="29" cy="32" rx="4" ry="2.4" fill="' + MACUN + '"/>'
   '<path d="M29 8 v14" stroke="' + MOR + '" stroke-width="2.5"/><path d="M24 17l5 6 5-6" fill="none" stroke="' + MOR + '" stroke-width="2.5"/>'
   '<rect x="50" y="10" width="24" height="40" rx="3" fill="#cfd4da" stroke="#9aa1ab"/>' + ''.join('<path d="M52 %d h20" stroke="#aab1ba"/>' % (14 + i * 5) for i in range(7)))
oz('oz-4.svg', 'Çift kanal: A2 ve B2 yuvaları dolu', ram_yuvalari(18, 7, [1, 3], 0.72, False, 52) +
   T(29, 55, 'A2', 7, MOR_DK, weight=900, fam=M) + T(52, 55, 'B2', 7, MOR_DK, weight=900, fam=M))
oz('oz-5.svg', 'M.2 SSD açıyla girer, bastırılıp vidalanır',
   '<rect x="6" y="44" width="68" height="6" rx="2" fill="' + PCB + '"/><rect x="8" y="36" width="8" height="8" rx="1.5" fill="#17181b"/>'
   '<rect x="14" y="36" width="52" height="5" rx="1.5" fill="#0f766e" transform="rotate(-18 14 38)"/>'
   '<rect x="14" y="38" width="54" height="4" rx="1.5" fill="#15803d" fill-opacity=".35"/>'
   '<rect x="64" y="38" width="6" height="6" fill="#c9a44c"/><circle cx="67" cy="36" r="3" fill="#8f969f"/>'
   '<path d="M50 14 v10" stroke="' + MOR + '" stroke-width="2.5"/><path d="M45 20l5 6 5-6" fill="none" stroke="' + MOR + '" stroke-width="2.5"/>')
oz('oz-6.svg', 'Kontrol listesi: tüm maddeler işaretli',
   '<rect x="18" y="6" width="44" height="50" rx="5" fill="#fff" stroke="#c4b5fd"/>' +
   ''.join('<rect x="24" y="%d" width="7" height="7" rx="1.5" fill="#16a34a"/><path d="M25.5 %.1f l1.8 1.8 3-3.4" stroke="#fff" stroke-width="1.3" fill="none"/>'
           '<rect x="35" y="%d" width="21" height="3" rx="1.5" fill="#cbd5e1"/>' % (12 + i * 10, 15.5 + i * 10, 14 + i * 10) for i in range(4)))


# ── Etkinlik 2 kart çizimleri 200×90
def kr(ad, aria, ic):
    w(ad, '<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="200" height="90" rx="10" fill="#f5f3ff"/>%s</svg>' % (aria, ic))


kr('kr-1.svg', 'İşlemcinin kapağı kalın bir termal macun katmanıyla kaplanmış; macun kenarlardan sokete taşmış',
   soket(62, 10, 1.25, 'sa') + cpu(72, 23, 1.25, 'sa', 'kalin') +
   '<path d="M130 30 h22" stroke="#b91c1c" stroke-width="2"/>' + T(156, 34, 'taşmış', 10, '#b91c1c', 'start', 800))
kr('kr-2.svg', 'Soğutucunun alttan görünüşü: taban plakasında koruyucu plastik film hâlâ yapışık',
   '<rect x="40" y="12" width="120" height="66" rx="6" fill="#cfd4da" stroke="#9aa1ab"/>' +
   ''.join('<path d="M44 %d h112" stroke="#b7bdc5"/>' % (16 + i * 5) for i in range(12)) +
   '<rect x="72" y="22" width="56" height="46" rx="4" fill="#e5e7eb" stroke="#9aa1ab"/>'
   '<rect x="74" y="24" width="52" height="42" rx="3" fill="#60a5fa" fill-opacity=".45" stroke="#2563eb" stroke-width="1.5"/>'
   '<path d="M126 24 l10 -8 6 7 -12 6z" fill="#93c5fd" stroke="#2563eb"/>' +
   T(100, 49, 'FİLM', 10, '#1e3a8a', weight=900) + T(100, 86, 'Soğutucu tabanı (alttan)', 8, '#475569', weight=700))
kr('kr-3.svg', 'İşlemci sokete oturmuş; iki köşe üçgeni aynı köşede, kilit kolu kancasına takılı',
   soket(64, 8, 1.3, 'sa') + cpu(76, 22, 1.25, 'sa') +
   '<path d="M138 14 v62" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/><rect x="134" y="10" width="8" height="6" rx="1.5" fill="#64748b"/>' +
   T(146, 46, 'kol', 9, '#475569', 'start', 700) + T(146, 58, 'kilitli', 9, '#475569', 'start', 700))
kr('kr-4.svg', 'İki RAM modülü A1 ve A2 yuvalarında, B1 ve B2 boş',
   '<rect x="40" y="6" width="120" height="78" rx="6" fill="' + PCB + '"/>' + ram_yuvalari(70, 12, [0, 1], 0.95, True, 50))
kr('kr-5.svg', 'Yandan görünüş: M.2 SSD yuvaya takılmış ama ucu havada, vida ayağında vida yok',
   '<rect x="14" y="66" width="172" height="8" rx="2" fill="' + PCB + '"/><rect x="22" y="54" width="14" height="12" rx="2" fill="#17181b"/>'
   '<rect x="32" y="52" width="140" height="6" rx="2" fill="#0f766e" transform="rotate(-14 32 55)"/>'
   '<rect x="160" y="58" width="10" height="8" fill="#c9a44c"/>'
   '<circle cx="176" cy="30" r="7" fill="#fff" stroke="#f59e0b" stroke-width="2"/>' + T(176, 34, '?', 10, '#b45309', weight=900) +
   T(165, 84, 'vida yok', 8, '#b45309', weight=800))
kr('kr-6.svg', 'İki RAM modülü A2 ve B2 yuvalarında, mandallar kapalı',
   '<rect x="40" y="6" width="120" height="78" rx="6" fill="' + PCB + '"/>' + ram_yuvalari(70, 12, [1, 3], 0.95, True, 50))
print('SVG’ler yazıldı.')
