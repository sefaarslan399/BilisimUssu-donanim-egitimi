# -*- coding: utf-8 -*-
# DON-201 H12 — SVG üretici (python3 svg_uret.py). Gradyan kimlikleri 'h12' önekli (tek HTML'de çakışmasın).
import os
KLASOR = os.path.dirname(os.path.abspath(__file__))
F = 'font-family="Inter,Arial,sans-serif"'


def w(ad, s):
    with open(os.path.join(KLASOR, ad), 'w', encoding='utf-8') as f:
        f.write(s.strip() + '\n')


def svg(vb, aria, ic):
    return '<svg viewBox="%s" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s">%s</svg>' % (vb, aria, ic)


def bg(id_, a='#f0f9ff', b='#dbeafe', W=360, H=240, r=18):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
            '</linearGradient></defs><rect width="%d" height="%d" rx="%d" fill="url(#%s)"/>' % (id_, a, b, W, H, r, id_))


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, ek=''):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s"%s>%s</text>' % (x, y, F, size, weight, fill, anchor, ek, t)


def rozet(x, y, metin, renk='#0f172a', yazi='#fff', size=10, pad=7, gen=None):
    g = gen or (len(metin) * size * 0.58 + pad * 2)
    return ('<g transform="translate(%s %s)"><rect x="%.1f" y="-9" width="%.1f" height="18" rx="9" fill="%s"/>%s</g>'
            % (x, y, -g / 2, g, renk, T(0, 3.6, metin, size, yazi)))


def uyari_ucgen(x, y, s=1):
    return ('<g transform="translate(%s %s) scale(%s)"><path d="M0 -14 L15 12 H-15 Z" fill="#fbbf24" stroke="#b45309" stroke-width="2" stroke-linejoin="round"/>'
            '<rect x="-1.8" y="-6" width="3.6" height="10" rx="1.5" fill="#1f2937"/><circle cx="0" cy="7.5" r="2" fill="#1f2937"/></g>' % (x, y, s))


# ───────────────────────── Küçük parça çizimleri ─────────────────────────
def telefon(x, y, s=1, ekran='#1e3a8a', catlak=False, kilit=False):
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    g += '<rect x="-15" y="-30" width="30" height="60" rx="6" fill="#1f2937"/>'
    g += '<rect x="-13" y="-27" width="26" height="54" rx="4" fill="%s"/>' % ekran
    g += '<circle cx="0" cy="-24.5" r="1.3" fill="#0b0f19"/>'
    if catlak:
        g += '<path d="M-9 -18 L-2 -8 L-6 2 L3 10 L-1 22 M-2 -8 L8 -12 M3 10 L10 14" stroke="#e2e8f0" stroke-width="1.1" fill="none"/>'
    g += '</g>'
    return g


def dizustu_on(x, y, s=1):
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    g += '<rect x="-44" y="-52" width="88" height="56" rx="5" fill="#9aa1ab"/><rect x="-40" y="-48" width="80" height="48" rx="3" fill="#0ea5e9"/>'
    g += '<rect x="-34" y="-42" width="36" height="24" rx="3" fill="#e0f2fe" opacity=".9"/><rect x="8" y="-38" width="26" height="20" rx="3" fill="#bae6fd" opacity=".8"/>'
    g += '<path d="M-54 4 H54 L50 12 H-50 Z" fill="#aeb4bd"/><rect x="-12" y="4" width="24" height="3" rx="1.5" fill="#8b929c"/></g>'
    return g


def kasa_yan(x, y, s=1):
    """Yan kapağı camlı masaüstü kasa (içinde RAM, fan, ekran kartı; güç kaynağı kapalı kutu)."""
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    g += '<rect x="0" y="0" width="92" height="160" rx="7" fill="#2a2d33"/><rect x="6" y="6" width="80" height="148" rx="5" fill="#1b1e24"/>'
    g += '<rect x="12" y="12" width="68" height="100" rx="3" fill="#1f5a3a"/>'
    g += '<rect x="22" y="22" width="26" height="26" rx="3" fill="#aeb4bd"/><circle cx="35" cy="35" r="10" fill="#475569"/><circle cx="35" cy="35" r="3" fill="#94a3b8"/>'
    for i in range(3):
        g += '<rect x="%d" y="18" width="4" height="36" rx="1" fill="#0f172a"/><rect x="%d" y="20" width="2" height="32" fill="#3b82f6"/>' % (56 + i * 7, 57 + i * 7)
    g += '<rect x="14" y="66" width="62" height="14" rx="2" fill="#30343c"/><rect x="16" y="68" width="20" height="10" rx="2" fill="#475569"/><rect x="40" y="68" width="20" height="10" rx="2" fill="#475569"/>'
    g += '<rect x="12" y="120" width="68" height="28" rx="3" fill="#30343c"/><rect x="18" y="126" width="26" height="16" rx="2" fill="#1f2126"/>'
    g += '</g>'
    return g


def pil_hucre(x, y, s=1, sis=0.0, renk='#9aa7b8'):
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    if sis > 0:
        g += '<path d="M-30 -40 Q-30 -46 -24 -46 H24 Q30 -46 30 -40 V40 Q30 46 24 46 H-24 Q-30 46 -30 40 Z" fill="%s"/>' % renk
        g += '<ellipse cx="0" cy="0" rx="%.1f" ry="%.1f" fill="%s" opacity=".9"/>' % (26 + sis * 6, 38 + sis * 6, renk)
        g += '<ellipse cx="-6" cy="-10" rx="%.1f" ry="%.1f" fill="#fff" opacity=".25"/>' % (10 + sis * 4, 16 + sis * 4)
    else:
        g += '<rect x="-30" y="-46" width="60" height="92" rx="6" fill="%s"/>' % renk
        g += '<rect x="-24" y="-36" width="48" height="60" rx="3" fill="#1d4ed8"/>' + T(0, -18, 'Li-ion', 10, '#fff')
    g += '<rect x="-22" y="46" width="44" height="7" rx="2" fill="#1f5a3a"/><rect x="6" y="52" width="8" height="10" rx="1" fill="#c47a23"/>'
    g += '</g>'
    return g


def cop_kutusu(x, y, s=1, renk='#64748b', kapak='#475569', simge=''):
    g = '<g transform="translate(%s %s) scale(%s)">' % (x, y, s)
    g += '<path d="M-20 -14 H20 L17 26 Q16.5 30 12 30 H-12 Q-16.5 30 -17 26 Z" fill="%s"/>' % renk
    g += '<rect x="-23" y="-21" width="46" height="8" rx="3" fill="%s"/><rect x="-6" y="-25" width="12" height="5" rx="2" fill="%s"/>' % (kapak, kapak)
    g += '<path d="M-9 -6 V22 M0 -6 V22 M9 -6 V22" stroke="#fff" stroke-opacity=".22" stroke-width="2.4"/>'
    g += simge + '</g>'
    return g


# ───────────────────────── Isınma ─────────────────────────
def isinma():
    ic = bg('h12isBg')
    ic += kasa_yan(22, 42, 1.0)
    ic += rozet(68, 222, 'Masaüstü kasa', '#334155', size=10)
    ic += dizustu_on(196, 158, 1.05)
    ic += rozet(196, 222, 'Dizüstü', '#334155', size=10)
    ic += telefon(310, 138, 1.35)
    ic += rozet(310, 222, 'Telefon', '#334155', size=10)
    # soru balonları
    for (x, y) in [(232, 50), (330, 60)]:
        ic += '<g transform="translate(%d %d)"><circle r="15" fill="#fff" stroke="#0ea5e9" stroke-width="2.5"/>%s</g>' % (x, y, T(0, 6, '?', 18, '#0284c7', weight=900))
    ic += '<path d="M120 60 C150 40 180 40 206 52" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="4 4" fill="none"/>'
    ic += rozet(158, 24, 'İşlemci, RAM, depolama nerede?', '#0ea5e9', size=10.5)
    w('isinma.svg', svg('0 0 360 240', 'Büyük masaüstü kasa, ince dizüstü ve telefon; aynı parçalar küçük cihazlara nasıl sığıyor?', ic))


# ───────────────────────── Yedek görseller (WebGL yoksa) ─────────────────────────
def yedek_dizustu():
    ic = bg('h12ydBg', '#f8fafc', '#e0f2fe')
    # tepsi (üstten)
    ic += '<rect x="40" y="96" width="280" height="130" rx="10" fill="#aeb4bd"/><rect x="46" y="102" width="268" height="118" rx="7" fill="#5b616b"/>'
    ic += '<rect x="56" y="108" width="178" height="58" rx="3" fill="#1f5a3a"/>'
    ic += '<rect x="64" y="114" width="52" height="20" rx="2" fill="#2b6b47" stroke="#e3b04f" stroke-width="1.5"/>' + T(90, 128, 'RAM', 9, '#fff')
    ic += '<rect x="126" y="140" width="66" height="16" rx="2" fill="#1d1f24"/>' + T(159, 151, 'SSD', 9, '#e2e8f0')
    ic += '<rect x="140" y="114" width="22" height="18" rx="2" fill="#2a2f3a"/>'
    ic += '<path d="M151 120 C170 108 200 104 250 106" stroke="#c47a23" stroke-width="5" fill="none" stroke-linecap="round"/>'
    ic += '<circle cx="272" cy="134" r="24" fill="#23252a"/><circle cx="272" cy="134" r="14" fill="#30333a"/><circle cx="272" cy="134" r="5" fill="#3a3d44"/>'
    ic += '<rect x="80" y="172" width="200" height="42" rx="5" fill="#1f2126"/>' + T(180, 197, 'Pil', 11, '#e5e7eb')
    ic += T(151, 110, 'İşlemci', 8, '#fff')
    # kalkan alt kapak
    ic += '<rect x="60" y="20" width="240" height="56" rx="10" fill="#c7ccd3" stroke="#9aa1ab" stroke-width="1.5" transform="rotate(-4 180 48)"/>'
    ic += T(180, 52, 'Alt kapak', 12, '#334155')
    ic += '<path d="M180 80 V92" stroke="#64748b" stroke-width="2" stroke-dasharray="3 3"/>'
    w('yedek-dizustu.svg', svg('0 0 360 240', 'Dizüstü patlatma çizimi: alt kapak kalkmış; pil, anakart, RAM, SSD, işlemci ve fan görünüyor', ic))


def yedek_telefon():
    ic = bg('h12ytBg', '#f8fafc', '#ede9fe')
    katman = [('Ekran', '#4338ca'), ('Çerçeve', '#b8bec8'), ('Anakart + çip / pil', '#1e4a33'), ('Kamera', '#1c1e23'), ('Arka kapak', '#34405a')]
    for i, (ad, renk) in enumerate(katman):
        x, y = 50 + i * 14, 28 + i * 40
        ic += '<g transform="translate(%d %d) skewX(-30)"><rect width="150" height="30" rx="8" fill="%s" stroke="#fff" stroke-width="1.5"/></g>' % (x, y, renk)
        ic += T(x + 164, y + 20, ad, 11, '#334155', anchor='start')
    w('yedek-telefon.svg', svg('0 0 360 240', 'Telefonun katmanları: ekran, çerçeve, anakart ve pil, kamera, arka kapak', ic))


def yedek_pil():
    ic = bg('h12ypBg', '#fff7ed', '#fee2e2')
    ic += pil_hucre(120, 112, 1.35, sis=1.0, renk='#ef8a7a')
    ic += uyari_ucgen(250, 80, 1.8)
    ic += T(250, 140, 'Şişmiş pil', 14, '#b91c1c', weight=900)
    ic += T(250, 160, 'Dokunma, bastırma.', 11, '#7f1d1d')
    ic += T(250, 178, 'Bir yetişkine söyle.', 11, '#7f1d1d')
    w('yedek-pil.svg', svg('0 0 360 240', 'Isınıp şişmiş pil ve uyarı işareti: dokunma, güvendiğin bir yetişkine söyle', ic))


# ───────────────────────── Adım 3: pil şeması (iyonlar JS ile eklenir) ─────────────────────────
def pil_sema():
    ic = '<defs><linearGradient id="h12psBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8fafc"/><stop offset="1" stop-color="#e0f2fe"/></linearGradient>'
    ic += '<linearGradient id="h12psEksi" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#475569"/><stop offset="1" stop-color="#64748b"/></linearGradient>'
    ic += '<linearGradient id="h12psArti" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bfdbfe"/><stop offset="1" stop-color="#93c5fd"/></linearGradient></defs>'
    ic += '<rect width="360" height="220" rx="16" fill="url(#h12psBg)"/>'
    # dış devre teli
    ic += '<path class="tel" d="M92 118 V40 H268 V118" stroke="#94a3b8" stroke-width="5" fill="none" stroke-linejoin="round"/>'
    ic += '<path class="akim" d="M92 118 V40 H268 V118" stroke="#f59e0b" stroke-width="3" fill="none" stroke-dasharray="3 11" stroke-linecap="round" stroke-linejoin="round"/>'
    # üstte: şarj aleti (şarj) ya da telefon (kullanım)
    ic += '<g class="g-sarj"><rect x="152" y="20" width="56" height="40" rx="8" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>'
    ic += '<path d="M172 32 v-8 M188 32 v-8" stroke="#64748b" stroke-width="3" stroke-linecap="round"/><path d="M183 34 l-7 11 h7 l-3 9 8 -12 h-7 z" fill="#f59e0b"/>'
    ic += T(180, 76, 'Şarj aleti', 10, '#334155') + '</g>'
    ic += '<g class="g-kullan"><rect x="162" y="12" width="36" height="56" rx="6" fill="#1f2937"/><rect class="tel-ekran" x="165" y="16" width="30" height="48" rx="4" fill="#0ea5e9"/>'
    ic += '<rect x="170" y="24" width="8" height="8" rx="2" fill="#fff" opacity=".8"/><rect x="182" y="24" width="8" height="8" rx="2" fill="#fde68a"/><rect x="170" y="36" width="8" height="8" rx="2" fill="#bbf7d0"/><rect x="182" y="36" width="8" height="8" rx="2" fill="#fecaca"/>'
    ic += T(180, 80, 'Telefon çalışıyor', 10, '#334155') + '</g>'
    # pil şeması
    ic += '<rect x="60" y="100" width="240" height="104" rx="14" fill="#fff" stroke="#94a3b8" stroke-width="2.5"/>'
    ic += '<rect x="70" y="110" width="102" height="84" rx="8" fill="url(#h12psEksi)"/>'
    for i in range(5):
        ic += '<rect x="%d" y="114" width="3" height="76" rx="1.5" fill="#334155" opacity=".6"/>' % (82 + i * 20)
    ic += '<rect x="188" y="110" width="102" height="84" rx="8" fill="url(#h12psArti)"/>'
    for i in range(5):
        ic += '<rect x="%d" y="114" width="3" height="76" rx="1.5" fill="#60a5fa" opacity=".6"/>' % (200 + i * 20)
    ic += '<path d="M180 108 V196" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>'
    ic += T(121, 213, '− uç', 11.5, '#0f172a', weight=900) + T(239, 213, '+ uç', 11.5, '#0f172a', weight=900) + T(180, 212, 'ayırıcı', 9, '#64748b', weight=700)
    ic += rozet(100, 92, 'Şema · pil açılmaz', '#334155', size=9)
    # iyonlar buraya eklenir
    ic += '<g class="iyonlar"></g>'
    # dolum göstergesi
    ic += '<rect x="316" y="106" width="30" height="92" rx="6" fill="#fff" stroke="#94a3b8" stroke-width="2"/><rect x="325" y="100" width="12" height="7" rx="2" fill="#94a3b8"/>'
    ic += '<rect class="dolum" x="320" y="110" width="22" height="84" rx="3" fill="#22c55e"/>'
    ic += '<text class="yuzde" x="331" y="88" %s font-size="12" font-weight="900" fill="#0f172a" text-anchor="middle">%%50</text>' % F
    w('pil-sema.svg', svg('0 0 360 220', 'Pil şeması: eksi ve artı uç arasında iyonlar gidip gelir; üstte şarj aleti ya da telefon, sağda doluluk göstergesi', ic))


# ───────────────────────── Adım 5: e-atık iki yol ─────────────────────────
def eatik():
    ic = bg('h12eaBg', '#f8fafc', '#ecfdf5', 360, 240)
    ic += '<defs><linearGradient id="h12eaToprak" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a16207"/><stop offset="1" stop-color="#713f12"/></linearGradient></defs>'
    # başlangıç: eski telefon
    ic += '<g transform="translate(40 62)"><g class="ea-tel">' + telefon(0, 0, 0.8, '#334155', catlak=True) + '</g></g>'
    # ── Yol A: çöpe atılırsa ──
    a = '<g class="g-cop">'
    a += cop_kutusu(110, 150, 1.25, '#6b7280', '#4b5563')
    a += T(110, 200, 'Ev çöpü', 11, '#334155')
    a += '<g class="ea-a1"><path d="M142 150 H196" stroke="#94a3b8" stroke-width="3" stroke-dasharray="6 5" marker-end=""/><path d="M192 144 l8 6 -8 6" stroke="#94a3b8" stroke-width="3" fill="none"/></g>'
    a += '<g class="ea-a2"><path d="M204 186 Q262 120 330 186 Z" fill="#78716c"/><rect x="200" y="184" width="136" height="36" rx="4" fill="url(#h12eaToprak)"/>'
    a += '<rect x="236" y="160" width="14" height="18" rx="2" fill="#475569" transform="rotate(-20 243 169)"/><rect x="266" y="152" width="18" height="12" rx="2" fill="#64748b"/><rect x="292" y="166" width="12" height="16" rx="2" fill="#334155" transform="rotate(15 298 174)"/>'
    a += T(268, 146, 'Çöp alanı', 11, '#334155') + '</g>'
    a += '<g class="ea-a3">'
    for i, x in enumerate([232, 258, 284, 308]):
        a += '<path d="M%d 192 q-4 8 0 12 q4 -4 0 -12" fill="#dc2626" transform="translate(0 %d)"/>' % (x, (i % 2) * 8)
    a += rozet(254, 229, 'Zararlı maddeler toprağa ve suya karışır', '#b91c1c', size=8) + '</g>'
    a += '<g class="ea-a4">' + rozet(196, 36, 'Değerli metaller boşa gider', '#7f1d1d', size=10)
    a += '<g transform="translate(78 108)"><path d="M0 12 C-10 4 -4 -6 0 -14 C2 -6 10 -2 6 8 C10 4 10 -2 9 -4 C14 4 10 14 0 12 Z" fill="#f97316"/><path d="M1 10 C-4 6 -1 0 1 -4 C3 2 6 4 3 9 Z" fill="#fde047"/></g>'
    a += rozet(66, 90, 'Pil yangın çıkarabilir', '#b45309', size=8.6) + '</g>'
    a += '</g>'
    # ── Yol B: toplama noktası ──
    b = '<g class="g-toplama">'
    b += cop_kutusu(110, 150, 1.25, '#f59e0b', '#d97706',
                    '<g transform="translate(0 8)"><rect x="-6" y="-12" width="12" height="20" rx="2.5" fill="#fff"/><rect x="-4" y="-9" width="8" height="13" rx="1" fill="#f59e0b"/></g>')
    b += T(110, 200, 'E-atık kutusu', 11, '#334155')
    b += '<g class="ea-b1"><path d="M142 146 H176" stroke="#10b981" stroke-width="3" stroke-dasharray="6 5"/><path d="M172 140 l8 6 -8 6" stroke="#10b981" stroke-width="3" fill="none"/></g>'
    b += '<g class="ea-b2"><path d="M184 176 V126 L204 114 V126 L224 114 V126 L244 114 V176 Z" fill="#0f766e"/><rect x="232" y="98" width="8" height="22" fill="#115e59"/>'
    b += '<rect x="192" y="146" width="12" height="12" rx="2" fill="#99f6e4"/><rect x="212" y="146" width="12" height="12" rx="2" fill="#99f6e4"/><rect x="202" y="162" width="20" height="14" rx="2" fill="#134e4a"/>'
    b += T(214, 194, 'Geri dönüşüm', 10.5, '#0f766e') + T(214, 207, 'tesisi', 10.5, '#0f766e') + '</g>'
    b += '<g class="ea-b3">'
    mal = [('Altın', '#eab308', '#fef9c3'), ('Bakır', '#c2410c', '#ffedd5'), ('Alüminyum', '#94a3b8', '#f1f5f9'), ('Plastik', '#0ea5e9', '#e0f2fe')]
    for i, (ad, koyu, acik) in enumerate(mal):
        y = 64 + i * 32
        b += ('<g class="mal m%d"><path d="M250 %d H268" stroke="#10b981" stroke-width="2" stroke-dasharray="3 3"/>'
              '<rect x="272" y="%d" width="76" height="24" rx="12" fill="%s" stroke="%s" stroke-width="1.5"/>'
              '<circle cx="286" cy="%d" r="7" fill="%s"/>%s</g>') % (i + 1, y + 12, y, acik, koyu, y + 12, koyu, T(318, y + 16, ad, 9.5, '#0f172a', weight=800))
    b += '</g>'
    b += '<g class="ea-b4">' + rozet(180, 36, 'Metaller yeni ürünlere dönüşür', '#047857', size=10) + '</g>'
    b += '</g>'
    ic += a + b
    w('e-atik.svg', svg('0 0 360 240', 'Eski telefonun iki yolu: çöpe atılırsa zararlı maddeler toprağa karışır; e-atık kutusuna giderse metaller geri kazanılır', ic))


# ───────────────────────── Quiz görseli: şişmiş pil telefonu kabartmış ─────────────────────────
def quiz_sismis():
    ic = '<rect width="200" height="110" rx="10" fill="#f1f5f9"/>'
    ic += '<rect x="20" y="78" width="160" height="12" rx="3" fill="#cbd5e1"/>'
    # yan görünüş: ekran üstte, arka kapak kabarmış
    ic += '<path d="M36 76 H164 Q170 76 170 70 V64 H30 V70 Q30 76 36 76 Z" fill="#34405a"/>'
    ic += '<path d="M30 64 Q100 30 170 64 Z" fill="#9aa7b8" stroke="#ef4444" stroke-width="2"/>'
    ic += '<path d="M30 64 Q100 24 170 58" stroke="#0d0f13" stroke-width="4" fill="none" stroke-linecap="round"/>'
    ic += '<path d="M60 50 l-3 -6 M100 40 l0 -7 M140 46 l3 -6" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>'
    ic += uyari_ucgen(178, 24, 0.9)
    w('svg-quiz-sismis.svg', svg('0 0 200 110', 'Yandan görünen telefon: içindeki pil şişmiş, ekranı yukarı itmiş', ic))


# ───────────────────────── Adım 1 kartları: masaüstü karşılıkları (48×36) ─────────────────────────
def kart_ikonlari():
    k = {}
    k['k-ram.svg'] = ('RAM modülü', '<rect x="3" y="11" width="42" height="14" rx="1.5" fill="#1f5a3a"/>' +
                      ''.join('<rect x="%d" y="13" width="6" height="7" rx="1" fill="#17181c"/>' % (6 + i * 7) for i in range(5)) +
                      '<rect x="4" y="21" width="40" height="4" fill="#e3b04f"/><rect x="21" y="21" width="2" height="4" fill="#1f5a3a"/>')
    k['k-disk.svg'] = ('Disk', '<rect x="8" y="5" width="32" height="26" rx="3" fill="#475569"/><rect x="11" y="8" width="26" height="20" rx="2" fill="#64748b"/>'
                       '<rect x="14" y="12" width="20" height="6" rx="1" fill="#e2e8f0"/><rect x="14" y="21" width="12" height="3" rx="1" fill="#cbd5e1"/>')
    k['k-islemci.svg'] = ('İşlemci', '<rect x="11" y="5" width="26" height="26" rx="2" fill="#1f5a3a"/><rect x="15" y="9" width="18" height="18" rx="2" fill="#cbd5e1"/>'
                          '<rect x="19" y="13" width="10" height="10" rx="1" fill="#94a3b8"/>' +
                          ''.join('<rect x="%d" y="2" width="2" height="3" fill="#e3b04f"/><rect x="%d" y="31" width="2" height="3" fill="#e3b04f"/>' % (14 + i * 5, 14 + i * 5) for i in range(4)))
    k['k-sogutucu.svg'] = ('Soğutucu ve fan', '<rect x="8" y="4" width="32" height="28" rx="3" fill="#334155"/><circle cx="24" cy="18" r="11" fill="#1e293b"/>' +
                           ''.join('<path d="M24 18 L%.1f %.1f" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>' % (24 + 9 * __import__('math').cos(a), 18 + 9 * __import__('math').sin(a)) for a in [0, 1.26, 2.51, 3.77, 5.03]) +
                           '<circle cx="24" cy="18" r="3" fill="#cbd5e1"/>')
    k['k-anakart.svg'] = ('Anakart', '<rect x="6" y="4" width="36" height="28" rx="2" fill="#1f5a3a"/><rect x="11" y="8" width="10" height="10" rx="1" fill="#cbd5e1"/>'
                          '<rect x="25" y="7" width="2.5" height="16" fill="#0f172a"/><rect x="30" y="7" width="2.5" height="16" fill="#0f172a"/><rect x="10" y="24" width="24" height="3" rx="1" fill="#0f172a"/>')
    k['k-psu.svg'] = ('Güç kaynağı', '<rect x="6" y="7" width="36" height="24" rx="3" fill="#1e2126"/><circle cx="18" cy="19" r="8" fill="#0d0e11" stroke="#4b5059" stroke-width="1.5"/>'
                      '<path d="M12 19 H24 M18 13 V25" stroke="#4b5059" stroke-width="1.2"/><rect x="30" y="12" width="8" height="10" rx="1" fill="#111"/><path d="M33 22 v4" stroke="#cbd5e1" stroke-width="2"/>')
    for ad, (aria, ic) in k.items():
        w(ad, svg('0 0 48 36', aria, ic))


# ───────────────────────── E-SINIFLA ögeleri (64×48) ve kutular (80×60) ─────────────────────────
def sinifla():
    o = {}
    o['is-telefon.svg'] = ('Eski telefon', telefon(32, 24, 0.7, '#334155', catlak=True))
    o['is-kulaklik.svg'] = ('Kablolu kulaklık', '<path d="M18 30 C12 10 52 10 46 30" stroke="#334155" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
                            '<rect x="12" y="26" width="10" height="16" rx="4" fill="#1f2937"/><rect x="42" y="26" width="10" height="16" rx="4" fill="#1f2937"/>'
                            '<path d="M17 42 C17 46 30 46 32 40" stroke="#475569" stroke-width="1.8" fill="none"/><path d="M47 42 C47 46 34 46 32 40 V46" stroke="#475569" stroke-width="1.8" fill="none"/>'
                            '<rect x="30" y="44" width="4" height="4" rx="1" fill="#94a3b8"/>')
    o['is-sarj.svg'] = ('Şarj aleti ve kablo', '<rect x="8" y="12" width="22" height="22" rx="5" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>'
                        '<path d="M14 12 V6 M24 12 V6" stroke="#64748b" stroke-width="2.5" stroke-linecap="round"/><rect x="16" y="30" width="6" height="4" fill="#cbd5e1"/>'
                        '<path d="M19 34 C19 44 40 44 42 32 C44 22 50 20 52 22" stroke="#e2e8f0" stroke-width="3" fill="none" stroke-linecap="round"/>'
                        '<path d="M19 34 C19 44 40 44 42 32 C44 22 50 20 52 22" stroke="#94a3b8" stroke-width="1" fill="none"/>'
                        '<rect x="50" y="18" width="8" height="8" rx="2" fill="#cbd5e1" stroke="#94a3b8"/>')
    o['is-kalem-pil.svg'] = ('Kalem pil', '<g transform="rotate(-20 32 24)"><rect x="12" y="16" width="38" height="16" rx="3" fill="#111827"/><rect x="34" y="16" width="16" height="16" rx="3" fill="#f59e0b"/>'
                            '<rect x="50" y="20" width="4" height="8" rx="1" fill="#cbd5e1"/>' + T(43, 28, '+', 10, '#78350f', weight=900) + T(21, 28, '−', 10, '#fff', weight=900) + '</g>')
    o['is-dugme-pil.svg'] = ('Düğme pil', '<ellipse cx="32" cy="28" rx="18" ry="8" fill="#94a3b8"/><ellipse cx="32" cy="24" rx="18" ry="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>'
                             + T(32, 27, '+', 10, '#475569', weight=900))
    o['is-karton.svg'] = ('Karton kutu', '<path d="M12 18 L32 10 L52 18 V38 L32 46 L12 38 Z" fill="#d6a15c"/><path d="M12 18 L32 26 L52 18" stroke="#a16207" stroke-width="1.5" fill="none"/>'
                          '<path d="M32 26 V46" stroke="#a16207" stroke-width="1.5"/><path d="M12 18 L32 26 V46 L12 38 Z" fill="#c68b45"/><rect x="36" y="30" width="10" height="6" rx="1" fill="#fff" opacity=".7"/>')
    o['is-sise.svg'] = ('Plastik şişe', '<rect x="27" y="4" width="10" height="6" rx="1.5" fill="#0ea5e9"/><path d="M27 10 H37 L40 18 V42 Q40 45 37 45 H27 Q24 45 24 42 V18 Z" fill="#bae6fd" stroke="#38bdf8" stroke-width="1.5"/>'
                        '<rect x="24" y="24" width="16" height="9" fill="#0ea5e9" opacity=".7"/>')
    o['is-pecete.svg'] = ('Kullanılmış peçete', '<path d="M18 30 C12 22 20 12 28 16 C30 8 42 8 44 16 C52 14 56 24 50 30 C54 38 44 44 38 40 C34 46 22 44 22 38 C14 38 14 32 18 30 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>'
                          '<path d="M26 24 C30 28 34 22 38 28 M24 34 C30 32 34 36 42 32" stroke="#e2e8f0" stroke-width="1.5" fill="none"/><circle cx="36" cy="33" r="3" fill="#fde68a" opacity=".6"/>')
    for ad, (aria, ic) in o.items():
        w(ad, svg('0 0 64 48', aria, ic))
    k = {}
    k['kutu-eatik.svg'] = ('Elektronik atık kutusu', '#fef3c7', cop_kutusu(40, 32, 0.8, '#f59e0b', '#d97706',
                           '<g transform="translate(0 7)"><rect x="-6" y="-11" width="12" height="19" rx="2.5" fill="#fff"/><rect x="-4" y="-8" width="8" height="12" rx="1" fill="#f59e0b"/></g>'))
    k['kutu-pil.svg'] = ('Pil toplama kutusu', '#dcfce7', '<rect x="20" y="10" width="40" height="44" rx="5" fill="#10b981"/><rect x="28" y="16" width="24" height="5" rx="2.5" fill="#065f46"/>'
                         '<g transform="translate(40 36)"><rect x="-12" y="-6" width="22" height="12" rx="2" fill="#fff"/><rect x="10" y="-3" width="3" height="6" rx="1" fill="#fff"/>'
                         '<rect x="-10" y="-4" width="10" height="8" rx="1" fill="#10b981"/></g>')
    k['kutu-geri.svg'] = ('Kâğıt ve plastik geri dönüşüm kutusu', '#dbeafe', cop_kutusu(40, 32, 0.8, '#3b82f6', '#1d4ed8',
                          '<g transform="translate(0 7)" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">'
                          '<path d="M-8 -3 A8.5 8.5 0 0 1 6 -7"/><path d="M3 -10 L6.5 -7 L3 -3.5"/><path d="M8 3 A8.5 8.5 0 0 1 -6 7"/><path d="M-3 10 L-6.5 7 L-3 3.5"/></g>'))
    k['kutu-cop.svg'] = ('Çöp kutusu', '#f1f5f9', cop_kutusu(40, 32, 0.8, '#64748b', '#475569'))
    for ad, (aria, zemin, ic) in k.items():
        w(ad, svg('0 0 80 60', aria, '<rect width="80" height="60" rx="10" fill="%s"/>' % zemin + ic))


# ───────────────────────── Özet küçük resimleri (80×60) ─────────────────────────
def ozet():
    z = lambda c: '<rect width="80" height="60" rx="10" fill="%s"/>' % c
    o = {}
    o['oz-1.svg'] = ('Dizüstünün içi', z('#e0f2fe') + '<rect x="10" y="12" width="60" height="38" rx="4" fill="#5b616b"/><rect x="14" y="16" width="34" height="16" rx="1.5" fill="#1f5a3a"/>'
                     '<rect x="17" y="19" width="12" height="5" fill="#2b6b47" stroke="#e3b04f"/><rect x="32" y="25" width="14" height="4" fill="#1d1f24"/>'
                     '<circle cx="60" cy="24" r="7" fill="#23252a"/><circle cx="60" cy="24" r="3" fill="#3a3d44"/><rect x="18" y="35" width="44" height="12" rx="2" fill="#1f2126"/>')
    o['oz-2.svg'] = ('Tek çipte birçok parça', z('#ede9fe') + '<rect x="18" y="8" width="44" height="44" rx="4" fill="#2f5140"/><rect x="24" y="14" width="32" height="32" rx="2" fill="#2c3440"/>'
                     '<rect x="26" y="16" width="13" height="13" fill="#3b82f6"/><rect x="41" y="16" width="13" height="13" fill="#16a34a"/><rect x="26" y="31" width="28" height="13" fill="#a16207"/>')
    o['oz-3.svg'] = ('Lityum pil', z('#dcfce7') + '<rect x="12" y="16" width="52" height="28" rx="5" fill="#fff" stroke="#94a3b8" stroke-width="2"/><rect x="64" y="25" width="5" height="10" rx="1.5" fill="#94a3b8"/>'
                     '<rect x="15" y="19" width="22" height="22" rx="3" fill="#64748b"/><rect x="39" y="19" width="22" height="22" rx="3" fill="#93c5fd"/>'
                     '<path d="M24 12 C34 4 46 4 54 12" stroke="#16a34a" stroke-width="2.5" fill="none"/><path d="M50 8 l4 4 -5 2" stroke="#16a34a" stroke-width="2.5" fill="none"/>'
                     '<circle cx="30" cy="30" r="3.5" fill="#f59e0b"/><circle cx="48" cy="26" r="3.5" fill="#f59e0b"/><circle cx="46" cy="35" r="3.5" fill="#f59e0b"/>')
    o['oz-4.svg'] = ('Pil güvenliği', z('#fee2e2') + pil_hucre(30, 27, 0.42, sis=1.0, renk='#ef8a7a') + uyari_ucgen(60, 30, 0.95))
    o['oz-5.svg'] = ('E-atık', z('#fef3c7') + cop_kutusu(40, 30, 0.85, '#f59e0b', '#d97706',
                     '<g transform="translate(0 7)"><rect x="-6" y="-11" width="12" height="19" rx="2.5" fill="#fff"/><rect x="-4" y="-8" width="8" height="12" rx="1" fill="#f59e0b"/></g>'))
    o['oz-6.svg'] = ('Elden çıkarmadan önce', z('#e0f2fe') + '<rect x="28" y="6" width="24" height="48" rx="5" fill="#1f2937"/><rect x="30.5" y="9" width="19" height="42" rx="3" fill="#f8fafc"/>'
                     '<path d="M46 30 a6 6 0 1 1 -2 -4.5" stroke="#0ea5e9" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M45 21 v5 h-5" stroke="#0ea5e9" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')
    for ad, (aria, ic) in o.items():
        w(ad, svg('0 0 80 60', aria, ic))


if __name__ == '__main__':
    isinma(); yedek_dizustu(); yedek_telefon(); yedek_pil(); pil_sema(); eatik(); quiz_sismis(); kart_ikonlari(); sinifla(); ozet()
    print('SVG üretildi.')
