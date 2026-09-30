# -*- coding: utf-8 -*-
"""DON-201 H14 SVG sahneleri (isınma, yedek görseller, sunum sahnesi, quiz, özet). Çalıştır: python3 svg_uret.py"""
import os

KLASOR = os.path.dirname(os.path.abspath(__file__))
F = 'font-family="Inter,Arial,sans-serif"'


def w(ad, s):
    with open(os.path.join(KLASOR, ad), 'w', encoding='utf-8') as f:
        f.write(s.strip() + '\n')


def bg(id_, a='#f0f9ff', b='#dbeafe', W=360, H=240, r=18):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
            '</linearGradient></defs><rect width="%d" height="%d" rx="%d" fill="url(#%s)"/>') % (id_, a, b, W, H, r, id_)


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x, y, F, size, weight, fill, anchor, t)


def kasa(x, y, s=1):
    """Yandan cam kapaklı masaüstü kasa (iç parçalar görünür)."""
    return ('<g transform="translate(%s %s) scale(%s)">'
            '<rect x="0" y="0" width="64" height="112" rx="6" fill="#30343c"/>'
            '<rect x="6" y="7" width="52" height="98" rx="4" fill="#1b1f26"/>'
            '<rect x="10" y="12" width="44" height="54" rx="2" fill="#262b33"/>'
            '<rect x="16" y="18" width="16" height="16" rx="2" fill="#a9afb8"/><rect x="18" y="20" width="12" height="12" fill="#c8cdd4"/>'
            '<rect x="36" y="16" width="3" height="26" fill="#2a2d33" stroke="#9aa3ad" stroke-width=".6"/><rect x="41" y="16" width="3" height="26" fill="#2a2d33" stroke="#9aa3ad" stroke-width=".6"/>'
            '<rect x="12" y="48" width="38" height="8" rx="2" fill="#17181b"/><circle cx="22" cy="52" r="3" fill="#2a2d33"/><circle cx="38" cy="52" r="3" fill="#2a2d33"/>'
            '<rect x="10" y="80" width="44" height="20" rx="2" fill="#3b404a"/><rect x="16" y="74" width="14" height="4" rx="1" fill="#a9afb8"/>'
            '<rect x="0" y="0" width="64" height="112" rx="6" fill="#9cc6ff" opacity=".08"/>'
            '<circle cx="54" cy="-2" r="0" fill="none"/></g>') % (x, y, s)


def monitor(x, y, s=1, ekran='#e0f2fe'):
    return ('<g transform="translate(%s %s) scale(%s)"><rect x="0" y="0" width="120" height="78" rx="6" fill="#1f2937"/>'
            '<rect x="5" y="5" width="110" height="64" rx="3" fill="%s"/><rect x="52" y="78" width="16" height="14" fill="#374151"/>'
            '<rect x="36" y="90" width="48" height="6" rx="3" fill="#4b5563"/></g>') % (x, y, s, ekran)


def ogrenci(x, y, s=1, sac='#3b2a20', ten='#e0a77a', govde='#4f46e5', kol=''):
    """Önden görünen 12–13 yaş öğrenci (yarım boy)."""
    return ('<g transform="translate(%s %s) scale(%s)">'
            '<path d="M-26 70v-28c0-12 10-20 26-20s26 8 26 20v28z" fill="%s"/>'
            '<rect x="-6" y="14" width="12" height="10" fill="%s"/>'
            '<circle cx="0" cy="0" r="17" fill="%s"/>'
            '<path d="M-17 -2c0-14 8-20 17-20s18 6 17 20c-4-8-10-11-17-11s-13 3-17 11z" fill="%s"/>'
            '<circle cx="-6" cy="1" r="1.8" fill="#1f2937"/><circle cx="6" cy="1" r="1.8" fill="#1f2937"/>'
            '<path d="M-5 9q5 4 10 0" stroke="#7c2d12" stroke-width="1.6" fill="none" stroke-linecap="round"/>%s</g>') % (x, y, s, govde, ten, ten, sac, kol)


def usb(x, y, s=1):
    return ('<g transform="translate(%s %s) scale(%s)"><rect x="0" y="0" width="16" height="8" rx="1" fill="#0f1115" stroke="#9aa3ad" stroke-width="1"/>'
            '<rect x="2" y="2" width="12" height="3" fill="#e5e7eb"/></g>') % (x, y, s)


def hdmi(x, y, s=1):
    return '<g transform="translate(%s %s) scale(%s)"><path d="M0 0h22v5l-3 4h-16l-3-4z" fill="#0f1115" stroke="#9aa3ad" stroke-width="1"/></g>' % (x, y, s)


def rj45(x, y, s=1):
    return ('<g transform="translate(%s %s) scale(%s)"><rect x="0" y="0" width="16" height="14" rx="1" fill="#0f1115" stroke="#9aa3ad" stroke-width="1"/>'
            '<rect x="5" y="11" width="6" height="3" fill="#9aa3ad"/><rect x="1" y="1" width="3" height="2" fill="#22c55e"/><rect x="12" y="1" width="3" height="2" fill="#f59e0b"/></g>') % (x, y, s)


def jak(x, y, renk, s=1):
    return '<g transform="translate(%s %s) scale(%s)"><circle r="5.5" fill="%s"/><circle r="2.4" fill="#0f1115"/></g>' % (x, y, s, renk)


def kart(x, y, s=1, dolu=True):
    """Küçük kimlik kartı (kasa resmi + değer çizgileri)."""
    g = ('<g transform="translate(%s %s) scale(%s)"><rect x="0" y="0" width="120" height="76" rx="8" fill="#fff" stroke="#0ea5e9" stroke-width="2.5"/>'
         '<rect x="0" y="0" width="120" height="16" rx="8" fill="#0ea5e9"/><rect x="0" y="9" width="120" height="7" fill="#0ea5e9"/>') % (x, y, s)
    g += T(60, 12, 'KİMLİK KARTI', 8, '#fff', weight=900)
    g += kasa(8, 22, 0.42)
    for i in range(4):
        g += '<rect x="44" y="%d" width="%d" height="5" rx="2.5" fill="%s"/>' % (24 + i * 11, 64 - i * 6 if dolu else 60, '#94a3b8' if dolu else '#e2e8f0')
    g += '<rect x="44" y="66" width="30" height="6" rx="3" fill="#d1fae5"/><rect x="78" y="66" width="30" height="6" rx="3" fill="#fef3c7"/></g>'
    return g


def oz(ad, etiket, ic, fon='#e0f2fe'):
    w(ad, '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="80" height="60" rx="10" fill="%s"/>%s</svg>' % (etiket, fon, ic))


# ── Isınma: öğrenci bilgisayarın önünde düşünüyor; üç yol
w('isinma.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Öğrenci bilgisayarın önünde: RAM kaç GB? Kasayı açmak, ekrandan okumak ya da boyutuna bakmak">' + bg('h14is') +
  '<rect x="0" y="182" width="360" height="58" fill="#e7d3b8"/><rect x="0" y="178" width="360" height="8" fill="#cfb38f"/>' +
  kasa(250, 70, 1.0) + monitor(96, 70, 1.05, '#f8fafc') +
  '<g transform="translate(101 75)"><rect x="4" y="4" width="46" height="8" rx="2" fill="#cbd5e1"/><rect x="4" y="18" width="98" height="6" rx="3" fill="#e2e8f0"/>'
  '<rect x="4" y="30" width="80" height="6" rx="3" fill="#e2e8f0"/><rect x="4" y="42" width="90" height="6" rx="3" fill="#e2e8f0"/></g>' +
  ogrenci(52, 128, 1.05) +
  '<g><rect x="14" y="16" width="118" height="44" rx="14" fill="#fff" stroke="#cbd5e1" stroke-width="2"/><path d="M50 60l-6 12 16-12z" fill="#fff" stroke="#cbd5e1" stroke-width="2"/><rect x="46" y="56" width="16" height="5" fill="#fff"/>' +
  T(73, 36, 'RAM kaç GB?', 13, '#0f172a') + T(73, 51, 'En kolay nasıl bulurum?', 9.5, '#64748b', weight=700) + '</g>' +
  '<g transform="translate(160 18)"><rect width="190" height="36" rx="12" fill="#fff" opacity=".92"/>' +
  '<circle cx="20" cy="18" r="11" fill="#fee2e2"/>' + T(20, 22, 'A', 11, '#b91c1c', weight=900) +
  '<circle cx="84" cy="18" r="11" fill="#e0f2fe"/>' + T(84, 22, 'B', 11, '#0369a1', weight=900) +
  '<circle cx="148" cy="18" r="11" fill="#fef3c7"/>' + T(148, 22, 'C', 11, '#b45309', weight=900) +
  T(46, 22, 'aç?', 9, '#64748b', weight=700) + T(112, 22, 'oku?', 9, '#64748b', weight=700) + T(174, 22, 'ölç?', 9, '#64748b', weight=700) + '</g>' +
  '<circle cx="300" cy="64" r="15" fill="#fff" stroke="#f59e0b" stroke-width="3"/>' + T(300, 71, '?', 18, '#b45309', weight=900) + '</svg>')

# ── Yedek: etiketli kasa ve kimlik kartı
w('yedek-kasa.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Etiketli masaüstü kasa ve yanında bilgisayar kimlik kartı">' + bg('h14yk') +
  kasa(46, 60, 1.35) +
  '<g ' + F + ' font-size="10" font-weight="800">'
  '<rect x="6" y="36" width="104" height="18" rx="9" fill="#f59e0b"/><text x="58" y="49" text-anchor="middle" fill="#1f1300">İşlemci · 4 çekirdek</text>'
  '<rect x="116" y="36" width="70" height="18" rx="9" fill="#f59e0b"/><text x="151" y="49" text-anchor="middle" fill="#1f1300">RAM · 8 GB</text>'
  '<rect x="18" y="196" width="100" height="18" rx="9" fill="#f59e0b"/><text x="68" y="209" text-anchor="middle" fill="#1f1300">SSD · 256 GB</text></g>' +
  '<path d="M150 120h30" stroke="#0ea5e9" stroke-width="3" stroke-dasharray="5 4"/><path d="M178 113l10 7-10 7z" fill="#0ea5e9"/>' +
  kart(196, 70, 1.3) + '</svg>')

w('yedek-panel.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arka panel: 7 USB, 2 görüntü, 1 ağ, 3 ses portu sayılmış">' + bg('h14yp') +
  '<rect x="30" y="50" width="300" height="110" rx="8" fill="#1d2027"/>' +
  usb(50, 80) + usb(50, 100) + hdmi(80, 80) + '<path d="M80 100h22v6l-4 4h-18z" fill="#0f1115" stroke="#9aa3ad"/>' +
  '<rect x="116" y="76" width="12" height="6" rx="3" fill="#0f1115" stroke="#9aa3ad"/>' + usb(114, 92) + usb(114, 108) +
  rj45(150, 76) + usb(150, 100) + usb(150, 116) + jak(200, 82, '#60a5fa') + jak(200, 102, '#4ade80') + jak(200, 122, '#f472b6') +
  '<g ' + F + ' font-size="11" font-weight="800">'
  '<rect x="232" y="68" width="86" height="20" rx="10" fill="#fff"/><text x="275" y="82" text-anchor="middle" fill="#0f172a">USB · 7</text>'
  '<rect x="232" y="92" width="86" height="20" rx="10" fill="#fff"/><text x="275" y="106" text-anchor="middle" fill="#0f172a">Görüntü · 2</text>'
  '<rect x="232" y="116" width="86" height="20" rx="10" fill="#fff"/><text x="275" y="130" text-anchor="middle" fill="#0f172a">Ağ · 1  Ses · 3</text></g>' +
  T(180, 190, 'Toplam 13 port', 15, '#0369a1', weight=900) + '</svg>')

# ── Adım 6: sunum sahnesi (öğrenci tahtada kartı gösteriyor)
w('sunum.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Öğrenci akıllı tahtada bilgisayar kimlik kartını sınıfa sunuyor">' + bg('h14su', '#f8fafc', '#e0f2fe') +
  '<rect x="0" y="196" width="360" height="44" fill="#e7d3b8"/><rect x="0" y="192" width="360" height="6" fill="#cfb38f"/>' +
  '<rect x="120" y="22" width="220" height="136" rx="8" fill="#1f2937"/><rect x="126" y="28" width="208" height="124" rx="4" fill="#fff"/>' +
  kart(150, 44, 1.3) +
  '<rect x="222" y="158" width="16" height="36" fill="#374151"/>' +
  ogrenci(70, 110, 1.15, sac='#1f2937', ten='#c68a5e', govde='#0ea5e9',
          kol='<path d="M18 30l34-28" stroke="#0ea5e9" stroke-width="10" stroke-linecap="round"/><circle cx="54" cy="0" r="6" fill="#c68a5e"/>') +
  '</svg>')

# ── Etkinlik 2: küçük kasa simgesi
w('kasa-mini.svg', '<svg viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Masaüstü kasa">' + kasa(8, 4, 1) + '</svg>')

# ── Quiz: arka panel (4 USB-A, 1 HDMI, 1 ağ, 3 ses)
w('svg-quiz-panel.svg', '<svg viewBox="0 0 220 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Arka panel: dikdörtgen USB-A portları, HDMI, ağ portu ve üç ses girişi"><rect width="220" height="110" rx="10" fill="#eef7fe"/>'
  '<rect x="12" y="18" width="196" height="76" rx="6" fill="#1d2027"/>' +
  usb(24, 32, 1.2) + usb(24, 58, 1.2) + usb(54, 32, 1.2) + usb(54, 58, 1.2) + hdmi(86, 36, 1.2) + rj45(126, 34, 1.4) +
  jak(170, 34, '#60a5fa') + jak(170, 54, '#4ade80') + jak(170, 74, '#f472b6') + '</svg>')

# ── Özet küçük resimleri
oz('oz-1.svg', 'Sistem bilgisini bul', '<rect x="12" y="10" width="56" height="36" rx="4" fill="#1f2937"/><rect x="15" y="13" width="50" height="30" rx="2" fill="#fff"/>'
   '<rect x="19" y="18" width="18" height="4" rx="2" fill="#0ea5e9"/><rect x="19" y="26" width="40" height="4" rx="2" fill="#f59e0b"/><rect x="19" y="34" width="32" height="4" rx="2" fill="#f59e0b"/>'
   '<rect x="34" y="46" width="12" height="6" fill="#374151"/>')
oz('oz-2.svg', 'Tabloyu doldur', '<rect x="14" y="8" width="52" height="44" rx="4" fill="#fff" stroke="#94a3b8" stroke-width="2"/><path d="M14 19h52M14 30h52M14 41h52M34 8v44" stroke="#cbd5e1" stroke-width="1.5"/>'
   + T(50, 27, '8 GB', 7.5, '#0369a1', weight=900) + T(50, 38, 'SSD', 7.5, '#0369a1', weight=900))
oz('oz-3.svg', 'Portları say', '<rect x="8" y="16" width="64" height="30" rx="4" fill="#1d2027"/>' + usb(14, 22, 0.9) + usb(14, 34, 0.9) + hdmi(32, 24, 0.8) + rj45(52, 22, 0.8) +
   '<circle cx="66" cy="12" r="9" fill="#0ea5e9"/>' + T(66, 16, '13', 9, '#fff', weight=900))
oz('oz-4.svg', 'Ne için uygun', '<rect x="10" y="10" width="60" height="12" rx="6" fill="#d1fae5"/>' + T(40, 19, '✓ Uygun', 8, '#065f46', weight=900) +
   '<rect x="10" y="25" width="60" height="12" rx="6" fill="#fef3c7"/>' + T(40, 34, '~ İdare eder', 8, '#92400e', weight=900) +
   '<rect x="10" y="40" width="60" height="12" rx="6" fill="#fee2e2"/>' + T(40, 49, '✗ Zorlanır', 8, '#991b1b', weight=900))
oz('oz-5.svg', 'Kimlik kartını hazırla', kart(8, 8, 0.53))
oz('oz-6.svg', 'Sun', '<rect x="26" y="8" width="46" height="30" rx="3" fill="#1f2937"/><rect x="29" y="11" width="40" height="24" rx="2" fill="#fff"/>' + kart(31, 13, 0.3) +
   ogrenci(16, 36, 0.5, govde='#0ea5e9'))
print('SVG dosyaları yazıldı.')
