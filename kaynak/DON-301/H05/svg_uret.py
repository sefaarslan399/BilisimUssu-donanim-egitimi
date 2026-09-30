# DON-301 H05 SVG üretici: python3 svg_uret.py  (bu klasörde çalıştırılır)
# Anakart şeması M-ANAKART modelinin yerleşimiyle (cm) birebir aynıdır: X genişlik 24,4 (arka panel solda),
# Z boy 30,5 (soket üstte, ön panel başlıkları altta). Marka/logo yok. f-string kullanılmaz.
F = 'font-family="Inter,Arial,sans-serif"'
M = 'font-family="JetBrains Mono,Consolas,monospace"'


def w(ad, s):
    open(ad, 'w').write(s.strip() + '\n')


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, fam=F, ek=''):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s"%s>%s</text>' % (
        round(x, 1), round(y, 1), fam, size, weight, fill, anchor, ek, t)


def bg(i, a='#f8fafc', b='#e0f2fe', W=360, H=240):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
            '</linearGradient></defs><rect width="%d" height="%d" rx="16" fill="url(#%s)"/>' % (i, a, b, W, H, i))


def R(x, y, w_, h, fill, rx=1, ek=''):
    return '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%s" fill="%s"%s/>' % (x, y, w_, h, rx, fill, ek)


def anakart(x0, y0, S, yazi=True, vurgu=None):
    """M-ANAKART üstten şema. S: 1 cm'nin birim karşılığı. vurgu: vurgulanacak bölge adı listesi."""
    vurgu = vurgu or []

    def sx(x):
        return x0 + (x + 12.2) * S

    def sy(z):
        return y0 + (z + 15.25) * S

    def kutu(x, z, gw, gz, fill, ad=None, rx=1):
        e = ' stroke="#f59e0b" stroke-width="%.1f"' % (S * 0.28) if ad in vurgu else ''
        return R(sx(x - gw / 2), sy(z - gz / 2), gw * S, gz * S, fill, rx, e)

    fs = max(4.5, S * 0.62)
    g = R(sx(-12.2), sy(-15.25), 24.4 * S, 30.5 * S, '#1f3d34', S * 0.5, ' stroke="#0f2a22" stroke-width="1"')
    # vida delikleri
    for hx in (-11.55, -0.9, 10.9):
        for hz in (-14.4, -0.3, 13.6):
            g += '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#cbd5e1"/><circle cx="%.1f" cy="%.1f" r="%.1f" fill="#0b1411"/>' % (sx(hx), sy(hz), S * 0.42, sx(hx), sy(hz), S * 0.2)
    # arka panel
    g += kutu(-11.35, -8.4, 2.4, 12.4, '#4b5563', 'arka')
    for pz in (-13.9, -11.7, -9.4, -6.8, -3.6):
        g += R(sx(-12.4), sy(pz - 0.8), 1.3 * S, 1.6 * S, '#9ca3af', 1)
    # VRM soğutucusu
    g += kutu(-4.1, -12.9, 9.4, 1.9, '#6b7280', 'vrm', 2)
    # soket
    g += kutu(-3.3, -8.0, 5.8, 6.4, '#94a3b8', 'soket', 2) + kutu(-3.3, -8.0, 4.6, 5.2, '#334155')
    g += '<path d="M%.1f %.1fh%.1fl%.1f %.1fz" fill="#fbbf24"/>' % (sx(-5.5), sy(-10.5), S * 0.9, -S * 0.9, S * 0.9)
    # RAM yuvaları
    for i, x in enumerate((2.3, 3.3, 4.3, 5.3)):
        g += kutu(x, -7.4, 0.75, 14.2, '#4a4f58' if i % 2 == 0 else '#111827', 'ram')
    # güç girişleri, fan, USB3
    g += kutu(-6.3, -14.5, 2.1, 1.0, '#111827', 'eps') + kutu(0.4, -14.3, 1.1, 0.5, '#e5e7eb', 'fan')
    g += kutu(10.6, -6.0, 1.05, 5.3, '#111827', 'atx') + kutu(10.7, 2.3, 1.0, 2.3, '#1e3a8a', 'usb3')
    # PCIe
    for z, ln, ad in ((0.9, 8.9, 'p1'), (2.9, 2.5, 'p2'), (7.0, 8.9, 'p3'), (9.0, 2.5, 'p4')):
        g += kutu(-10.3 + ln / 2, z, ln, 0.75, '#0f172a' if ad != 'p1' else '#6b7280', ad)
    # M.2
    for z, ad in ((-2.2, 'm1'), (4.95, 'm2')):
        g += kutu(-8.15, z, 0.9, 2.3, '#111827', ad)
        g += '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="none" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="2 2"/>' % (sx(-7.7), sy(z - 1.1), 7.9 * S, 2.2 * S)
        g += '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#cbd5e1"/>' % (sx(0.2), sy(z), S * 0.3)
    # çipset, SATA, CMOS, ön panel
    g += kutu(4.6, 7.4, 4.6, 4.6, '#64748b', 'cipset', 3)
    for z in (8.6, 10.6):
        g += kutu(11.55, z, 1.1, 1.3, '#111827', 'sata')
    g += '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="#d1d5db" stroke="#111827" stroke-width="1"/>' % (sx(-2.4), sy(12.0), S * 1.18)
    for x, ad in ((8.6, 'fpanel'), (5.4, 'fusb'), (-9.6, 'fses')):
        g += kutu(x, 14.3, 1.25, 0.55, '#111827', ad)
    if yazi:
        c = '#e2e8f0'
        g += T(sx(-3.3), sy(-4.3), 'CPU', fs, c)
        g += T(sx(3.8), sy(0.6), 'DIMM', fs * 0.85, c)
        g += T(sx(-6.3), sy(-15.6) + fs, 'CPU_PWR', fs * 0.8, c)
        g += T(sx(0.4), sy(-13.4), 'CPU_FAN', fs * 0.8, c)
        g += T(sx(9.1), sy(-6.0), 'ATX_PWR', fs * 0.8, c, 'middle', 800, F, ' transform="rotate(-90 %.1f %.1f)"' % (sx(9.1), sy(-6.0)))
        g += T(sx(9.3), sy(2.5), 'USB3', fs * 0.8, c)
        g += T(sx(-10.2), sy(0.1), 'PCIE_1', fs * 0.8, c, 'start')
        g += T(sx(-10.2), sy(2.1), 'PCIE_2', fs * 0.8, c, 'start')
        g += T(sx(-10.2), sy(6.2), 'PCIE_3', fs * 0.8, c, 'start')
        g += T(sx(-10.2), sy(8.2), 'PCIE_4', fs * 0.8, c, 'start')
        g += T(sx(-7.4), sy(-3.5), 'M.2_1', fs * 0.8, c, 'start')
        g += T(sx(-7.4), sy(3.65), 'M.2_2', fs * 0.8, c, 'start')
        g += T(sx(4.6), sy(7.6), 'Çipset', fs * 0.85, '#f8fafc')
        g += T(sx(10.1), sy(12.3), 'SATA', fs * 0.8, c)
        g += T(sx(-2.4), sy(14.0), 'BAT', fs * 0.8, c)
        g += T(sx(8.6), sy(13.4), 'F_PANEL', fs * 0.72, c)
        g += T(sx(5.4), sy(13.4), 'F_USB', fs * 0.72, c)
        g += T(sx(-9.6), sy(13.4), 'F_AUDIO', fs * 0.72, c)
    return g


# ── Yedek (ve Etkinlik 1 “Şema”): kılavuzdaki yerleşim çizimi gibi
S = 9.4
yd = '<svg viewBox="0 0 300 312" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Anakart yerleşim şeması: sol üstte arka panel, ortada işlemci soketi, sağında dört RAM yuvası, sağ kenarda 24-pin ve SATA, solda PCIe ve M.2 yuvaları, alt kenarda ön panel başlıkları">'
yd += '<rect width="300" height="312" rx="14" fill="#f8fafc"/>'
yd += anakart(35, 6, S)
yd += '</svg>'
w('yedek-anakart.svg', yd)

# ── Isınma: ATX anakart ve Mini-ITX kasa
is_s = '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Solda 30,5 × 24,4 santimetre ATX anakart, sağda küçük bir Mini-ITX kasa; arada soru işareti">'
is_s += bg('h5is', '#f8fafc', '#e0e7ff')
is_s += anakart(22, 30, 5.9, yazi=False)
is_s += '<path d="M16 30V210M12 30h8M12 210h8" stroke="#334155" stroke-width="1.5"/>' + T(10, 124, '30,5 cm', 10, '#334155', 'middle', 900, F, ' transform="rotate(-90 10 124)"')
is_s += '<path d="M22 218H166M22 214v8M166 214v8" stroke="#334155" stroke-width="1.5"/>' + T(94, 232, '24,4 cm', 10, '#334155', 'middle', 900)
is_s += T(94, 20, 'ATX anakart', 12, '#0f172a', 'middle', 900)
# Mini-ITX kasa (yan kapak açık, önden-yandan)
is_s += '<g transform="translate(222 70)">'
is_s += '<path d="M0 20L22 0H122L100 20z" fill="#cbd5e1"/><path d="M100 20L122 0V112L100 132z" fill="#94a3b8"/>'
is_s += R(0, 20, 100, 112, '#e2e8f0', 4, ' stroke="#64748b" stroke-width="1.5"')
is_s += R(12, 30, 76, 76, '#1f3d34', 3, ' stroke-dasharray="4 3" stroke="#10b981" stroke-width="1.5" fill-opacity="0.25"')
is_s += T(50, 72, 'kart alanı', 9, '#065f46', 'middle', 800)
is_s += R(12, 114, 30, 6, '#64748b', 2) + '<circle cx="84" cy="118" r="4" fill="#64748b"/>'
is_s += '</g>' + T(282, 60, 'Mini-ITX kasa', 12, '#0f172a', 'middle', 900)
is_s += '<circle cx="194" cy="124" r="17" fill="#fff" stroke="#f59e0b" stroke-width="3"/>' + T(194, 132, '?', 20, '#b45309', 'middle', 900)
is_s += T(282, 226, 'Sığar mı?', 13, '#b45309', 'middle', 900)
w('isinma.svg', is_s + '</svg>')

# ── Quiz görseli: kılavuz tablosu (genişleme yuvaları)
q = '<svg viewBox="0 0 360 170" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kılavuz tablosu: PCIE_1 PCIe 4.0 x16 işlemci; PCIE_2 PCIe 3.0 x1 çipset; PCIE_3 x16 boy, x4 hat, PCIe 3.0, çipset">'
q += '<rect width="360" height="170" rx="12" fill="#fff" stroke="#cbd5e1" stroke-width="1.5"/>'
q += R(0, 0, 360, 30, '#1e293b', 12) + R(0, 18, 360, 12, '#1e293b', 0)
q += T(14, 20, '1-4  Genişleme yuvaları', 11.5, '#fff', 'start', 900)
q += T(346, 20, 'Kılavuz', 10, '#cbd5e1', 'end', 700)
hd = [('Yuva', 16), ('Boy / hat', 110), ('Nesil', 218), ('Kaynak', 284)]
for t, x in hd:
    q += T(x, 48, t, 9.5, '#64748b', 'start', 800)
satir = [('PCIE_1', 'x16 / x16', 'PCIe 4.0', 'İşlemci', False),
         ('PCIE_2', 'x1 / x1', 'PCIe 3.0', 'Çipset', False),
         ('PCIE_3', 'x16 / x4', 'PCIe 3.0', 'Çipset', True)]
for i, (a, b, c, d, v) in enumerate(satir):
    y = 56 + i * 30
    q += R(8, y, 344, 25, '#fef3c7' if v else '#f8fafc', 6, ' stroke="%s" stroke-width="1.5"' % ('#f59e0b' if v else '#e2e8f0'))
    q += T(16, y + 17, a, 11, '#0f172a', 'start', 900, M) + T(110, y + 17, b, 11, '#0f172a', 'start', 800, M)
    q += T(218, y + 17, c, 11, '#334155', 'start', 700) + T(284, y + 17, d, 11, '#334155', 'start', 700)
q += T(16, 160, 'Boy / hat: yuvanın fiziksel boyu / kullandığı elektriksel hat sayısı', 9.5, '#475569', 'start', 700)
w('svg-quiz-kilavuz.svg', q + '</svg>')


# ── Özet küçük resimleri (80 × 60)
def oz(ad, aria, ic, zemin='#e0e7ff'):
    w(ad, '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + aria + '"><rect width="80" height="60" rx="10" fill="' + zemin + '"/>' + ic + '</svg>')


oz('oz-1.svg', 'ATX, mATX ve Mini-ITX kartlar aynı köşeye hizalı, üst üste',
   R(10, 6, 48, 50, '#15803d', 3, ' fill-opacity="0.45"') + R(10, 6, 40, 38, '#2563eb', 3, ' fill-opacity="0.55"') + R(10, 6, 28, 28, '#ea580c', 3, ' fill-opacity="0.8"') +
   T(66, 20, 'ATX', 7, '#14532d', 'middle', 900) + T(66, 32, 'mATX', 7, '#1e3a8a', 'middle', 900) + T(66, 44, 'ITX', 7, '#9a3412', 'middle', 900))
oz('oz-2.svg', 'İşlemci soketi ve köşe üçgeni',
   R(20, 8, 40, 44, '#94a3b8', 4) + R(25, 13, 30, 34, '#334155', 2) + '<path d="M25 13h8l-8 8z" fill="#fbbf24"/>' +
   ''.join('<circle cx="%d" cy="%d" r="1" fill="#d4a53c"/>' % (30 + i * 5, 20 + j * 5) for i in range(5) for j in range(6)))
oz('oz-3.svg', 'İşlemci ve çipset tek bir hızlı bağlantıyla bağlı; çipsete SATA ve USB gelir',
   R(26, 5, 28, 16, '#4f46e5', 3) + T(40, 16, 'CPU', 8, '#fff', 'middle', 900) + '<path d="M40 21V34" stroke="#0f172a" stroke-width="4"/>' +
   R(26, 34, 28, 14, '#64748b', 3) + T(40, 44, 'Çipset', 7, '#fff', 'middle', 900) +
   '<path d="M26 41H10M54 41H70M40 48V56" stroke="#0891b2" stroke-width="2"/>' + T(9, 37, 'SATA', 5.5, '#0e7490', 'start', 800) + T(71, 37, 'USB', 5.5, '#0e7490', 'end', 800))
oz('oz-4.svg', 'Uzun PCIe x16 yuvası, kısa x1 yuvası ve M.2 SSD',
   R(6, 10, 50, 6, '#0f172a', 2) + R(6, 24, 16, 6, '#0f172a', 2) + R(6, 38, 6, 12, '#111827', 1) + R(12, 40, 48, 8, '#166534', 1) +
   '<circle cx="62" cy="44" r="2" fill="#cbd5e1"/>' + T(66, 16, 'x16', 7, '#1e293b', 'start', 900) + T(28, 30, 'x1', 7, '#1e293b', 'start', 900))
oz('oz-5.svg', '24-pin ATX ve 8-pin EPS konnektörleri',
   R(6, 10, 42, 14, '#111827', 2) + ''.join(R(8 + i * 3.3, 12 + j * 5.5, 2.6, 4, '#374151', 0.5) for i in range(12) for j in range(2)) +
   R(52, 10, 22, 14, '#111827', 2) + ''.join(R(54 + i * 4.8, 12 + j * 5.5, 3.6, 4, '#374151', 0.5) for i in range(4) for j in range(2)) +
   '<path d="M14 24v12M24 24v14M34 24v12M60 24v14M68 24v12" stroke="#eab308" stroke-width="2"/>' +
   T(27, 50, '24-pin', 8, '#1e293b', 'middle', 900) + T(63, 50, 'EPS', 8, '#1e293b', 'middle', 900))
oz('oz-6.svg', 'Arka panel portları ve ön panel başlığı',
   R(6, 8, 22, 44, '#4b5563', 3) + R(10, 12, 14, 5, '#e5e7eb', 1) + R(10, 20, 14, 5, '#3b82f6', 1) + R(10, 28, 14, 8, '#fbbf24', 1) +
   '<circle cx="14" cy="43" r="2.5" fill="#22c55e"/><circle cx="20" cy="43" r="2.5" fill="#ec4899"/>' +
   R(38, 26, 36, 16, '#111827', 2) + ''.join('<circle cx="%d" cy="%d" r="1.5" fill="#d4a53c"/>' % (43 + i * 6.5, 31 + j * 6) for i in range(5) for j in range(2) if not (i == 4 and j == 0)) +
   T(56, 52, 'F_PANEL', 7, '#1e293b', 'middle', 900))
print('SVG dosyaları üretildi.')
