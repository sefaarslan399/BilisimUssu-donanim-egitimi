# -*- coding: utf-8 -*-
# DON-201 H08 — SVG sahneleri üretir (düz birleştirme; f-string yok). Çalıştır: python3 svg_uret.py
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
F = 'font-family="Inter,Arial,sans-serif"'


def w(ad, s):
    open(ad, 'w', encoding='utf-8').write(s.strip() + '\n')


def bg(id_, a='#f0f9ff', b='#dbeafe', W=360, H=240, r=18):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>'
            '<rect width="%d" height="%d" rx="%d" fill="url(#%s)"/>') % (id_, a, b, W, H, r, id_)


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, cls=''):
    return '<text %sx="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (
        ('class="%s" ' % cls) if cls else '', x, y, F, size, weight, fill, anchor, t)


def dosya(x, y, ad, renk='#2563eb', s=1, cls='', id_=''):
    """Belge simgesi: köşesi kıvrık kâğıt + renkli şerit + ad."""
    return ('<g %s%stransform="translate(%s %s) scale(%s)"><path d="M-12 -16h16l8 8v24h-24z" fill="#fff" stroke="#94a3b8" stroke-width="1.5"/>'
            '<path d="M4 -16v8h8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/><rect x="-8" y="-4" width="16" height="3" rx="1" fill="%s"/>'
            '<rect x="-8" y="2" width="12" height="2" rx="1" fill="#cbd5e1"/><rect x="-8" y="7" width="14" height="2" rx="1" fill="#cbd5e1"/>'
            '%s</g>') % (('id="%s" ' % id_) if id_ else '', ('class="%s" ' % cls) if cls else '', x, y, s, renk, T(0, 30, ad, 10, '#1e293b'))


def hdd_ust(x, y, s=1, kol_aci=-18):
    """Açık HDD üstten: gövde, plaka, göbek, kol ve kafa."""
    return ('<g transform="translate(%s %s) scale(%s)">'
            '<rect x="0" y="0" width="150" height="104" rx="8" fill="#8a9098"/><rect x="5" y="5" width="140" height="94" rx="6" fill="#b3b9c1"/>'
            '<circle cx="96" cy="52" r="46" fill="#e8ecf1" stroke="#9aa0a8" stroke-width="2"/>'
            '<circle cx="96" cy="52" r="34" fill="none" stroke="#cfd5dc" stroke-width="1"/><circle cx="96" cy="52" r="22" fill="none" stroke="#cfd5dc" stroke-width="1"/>'
            '<path d="M96 52 L140 40 A46 46 0 0 1 141 58 z" fill="#fff" opacity=".6"/>'
            '<circle cx="96" cy="52" r="12" fill="#9ca3af" stroke="#6b7280"/><circle cx="96" cy="52" r="3" fill="#4b5563"/>'
            '<path d="M22 76 A26 26 0 0 1 40 50 L50 64 z" fill="#c3c8ce" stroke="#9aa0a8"/>'
            '<g transform="rotate(%s 32 80)"><path d="M32 74 L80 78 L80 82 L32 86 z" fill="#a7adb5" stroke="#6b7280" stroke-width=".8"/>'
            '<path d="M78 79 L96 80 L78 81 z" fill="#d7dbe0"/><rect x="94" y="78" width="4" height="4" fill="#2f3136"/></g>'
            '<circle cx="32" cy="80" r="7" fill="#8c929a" stroke="#5b616a"/><rect x="10" y="84" width="16" height="4" fill="#c47f1a"/>'
            '</g>') % (x, y, s, kol_aci)


def ssd(x, y, s=1, acik=False):
    if acik:
        return ('<g transform="translate(%s %s) scale(%s)"><rect x="0" y="0" width="120" height="84" rx="6" fill="#8d949d"/><rect x="5" y="5" width="110" height="74" rx="4" fill="#1b2530"/>'
                '<rect x="14" y="14" width="26" height="26" rx="3" fill="#23262b" stroke="#f59e0b" stroke-width="1.5"/>'
                '<rect x="54" y="12" width="24" height="28" rx="2" fill="#121316"/><rect x="84" y="12" width="24" height="28" rx="2" fill="#121316"/>'
                '<rect x="54" y="46" width="24" height="28" rx="2" fill="#121316"/><rect x="84" y="46" width="24" height="28" rx="2" fill="#121316"/>'
                '<rect x="14" y="50" width="14" height="22" rx="2" fill="#1f2937"/></g>') % (x, y, s)
    return ('<g transform="translate(%s %s) scale(%s)"><rect x="0" y="0" width="120" height="84" rx="6" fill="#2b2f36"/><rect x="12" y="12" width="96" height="60" rx="5" fill="#e9ecef"/>'
            + T(30, 38, 'SSD', 16, '#111827', 'start', 900) + T(30, 56, '2,5 inç', 10, '#374151', 'start', 700) + '</g>') % (x, y, s)


def m2(x, y, s=1):
    return ('<g transform="translate(%s %s) scale(%s)"><rect x="0" y="0" width="160" height="44" rx="3" fill="#16181c"/>'
            '<rect x="0" y="0" width="8" height="44" fill="#e3b04f"/><rect x="0" y="30" width="9" height="3" fill="#dbeafe"/>'
            '<rect x="22" y="10" width="24" height="24" rx="2" fill="#23262b"/><rect x="54" y="12" width="16" height="20" rx="2" fill="#121316"/>'
            '<rect x="80" y="8" width="30" height="28" rx="2" fill="#121316"/><rect x="116" y="8" width="30" height="28" rx="2" fill="#121316"/>'
            '<path d="M160 18 a4 4 0 0 0 0 8z" fill="#dbeafe"/></g>') % (x, y, s)


def usb(x, y, s=1, rot=0):
    return ('<g transform="translate(%s %s) rotate(%s) scale(%s)"><rect x="0" y="4" width="18" height="16" rx="1" fill="#cbd5e1" stroke="#94a3b8"/><rect x="6" y="8" width="3" height="3" fill="#475569"/>'
            '<rect x="18" y="0" width="60" height="24" rx="8" fill="#1e3a8a"/><rect x="34" y="7" width="26" height="10" rx="3" fill="#e5e7eb"/><circle cx="70" cy="6" r="2" fill="#22c55e"/></g>') % (x, y, rot, s)


def sdkart(x, y, s=1, renk='#2563eb'):
    return ('<g transform="translate(%s %s) scale(%s)"><path d="M0 0h18l6 6v30h-24z" fill="#1f2937"/><rect x="3" y="12" width="18" height="12" fill="#e5e7eb"/>'
            '<rect x="3" y="24" width="18" height="8" fill="%s"/><rect x="-2" y="8" width="2" height="6" fill="#f8fafc"/></g>') % (x, y, s, renk)


def laptop(x, y, s=1, cls='', ek=''):
    return ('<g class="%s" transform="translate(%s %s) scale(%s)"><rect x="6" y="0" width="88" height="58" rx="5" fill="#1f2937"/><rect class="ekran" x="11" y="5" width="78" height="48" rx="2" fill="#e0f2fe"/>'
            '<path d="M0 60h100l-6 8H6z" fill="#94a3b8"/><rect x="40" y="61" width="20" height="3" rx="1.5" fill="#64748b"/>%s</g>') % (cls, x, y, s, ek)


def bulut_sekli(x, y, s=1, fill='#fff', stroke='#60a5fa'):
    return ('<g transform="translate(%s %s) scale(%s)"><path d="M20 60 a20 20 0 0 1 2-40 a28 28 0 0 1 52-8 a22 22 0 0 1 36 18 a18 18 0 0 1-4 30z" fill="%s" stroke="%s" stroke-width="3"/></g>') % (x, y, s, fill, stroke)


def insan(x, y, s=1):
    return ('<g transform="translate(%s %s) scale(%s)">'
            '<rect x="-14" y="0" width="28" height="44" rx="11" fill="#0d9488"/><rect x="-9" y="5" width="18" height="4" rx="2" fill="#14b8a6"/>'
            '<circle cx="0" cy="-13" r="13" fill="#c68a5e"/><path d="M-13 -15a13 13 0 0 1 26 -2c-7 -3-16 -2-22 5z" fill="#2b1d16"/>'
            '<circle cx="5" cy="-13" r="1.5" fill="#1f2937"/><path d="M3 -6q3 2 6 0" stroke="#7c4a2d" stroke-width="1.4" fill="none"/>'
            '</g>') % (x, y, s)


# ── Isınma: ödev kaydedildi, bilgisayar kapatıldı, ertesi gün?
w('isinma.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Öğrenci ödevini kaydedip bilgisayarı kapatıyor; ertesi gün dosya nerede?">' + bg('h8is') +
  '<rect x="0" y="176" width="360" height="64" fill="#e7d3b8"/><rect x="0" y="172" width="360" height="8" fill="#cfb38f"/>' +
  insan(58, 118, 1.15) +
  laptop(96, 106, 0.95, '', dosya(50, 22, 'Ödev', '#2563eb', 0.62) + '<rect x="56" y="42" width="30" height="9" rx="4" fill="#10b981"/>' + T(71, 49, 'Kaydedildi', 5.5, '#fff')) +
  '<g transform="translate(212 118)"><circle r="17" fill="#fff" stroke="#ef4444" stroke-width="3"/><path d="M0 -9v8" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>'
  '<path d="M-6 -5a8 8 0 1 0 12 0" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/></g>' + T(212, 152, 'Kapat', 11, '#b91c1c') +
  '<g transform="translate(290 70)"><circle r="20" fill="#fde68a"/><circle cx="8" cy="-6" r="18" fill="#dbeafe"/></g>' + T(290, 108, 'Ertesi gün', 11) +
  '<g><rect x="222" y="16" width="126" height="30" rx="10" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>' + T(285, 36, 'Dosya nerede?', 12) + '</g>'
  '<circle cx="290" cy="148" r="18" fill="#fff" stroke="#f59e0b" stroke-width="3"/>' + T(290, 156, '?', 20, '#b45309', weight=900) + '</svg>')

# ── Adım 1: RAM (masa) ↔ kalıcı depolama (dolap). JS sınıf ve dönüşümlerle oynatır.
k1 = ('<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Solda RAM çalışma masası, sağda kalıcı depolama dolabı. Kaydedilen dosya dolaba yazılır; elektrik gidince masa boşalır, dolap kalır." class="k1">' + bg('h8k1', '#f8fafc', '#e0f2fe') +
      # güç göstergesi
      '<g class="k1-guc" transform="translate(180 26)"><rect x="-58" y="-14" width="116" height="28" rx="14" fill="#fff" stroke="#cbd5e1" stroke-width="1.5"/>'
      '<circle class="k1-led" cx="-40" cy="0" r="6" fill="#22c55e"/>' + T(6, 4, 'Elektrik var', 11, '#065f46', cls='k1-guc-yazi') + '</g>'
      # RAM masası
      '<g><rect x="16" y="56" width="150" height="150" rx="14" fill="#fff" stroke="#93c5fd" stroke-width="2"/>'
      '<rect x="16" y="56" width="150" height="26" rx="13" fill="#dbeafe"/><rect x="16" y="70" width="150" height="12" fill="#dbeafe"/>'
      + T(91, 74, 'RAM · çalışma masası', 11, '#1e40af') +
      '<rect x="30" y="160" width="122" height="10" rx="3" fill="#cfb38f"/><rect x="36" y="170" width="6" height="26" fill="#b8996f"/><rect x="140" y="170" width="6" height="26" fill="#b8996f"/>'
      '<g class="k1-ram-ic">' + dosya(60, 124, 'Ödev', '#2563eb', 1, 'k1-odev') + dosya(118, 124, 'Not', '#f59e0b', 1, 'k1-not') + '</g>'
      '<g class="k1-bos">' + T(91, 128, 'Masa boş', 12, '#94a3b8') + '</g>'
      + T(91, 196, 'Geçici', 11, '#64748b') + '</g>'
      # dolap (kalıcı depolama)
      '<g><rect x="194" y="56" width="150" height="150" rx="14" fill="#fff" stroke="#6ee7b7" stroke-width="2"/>'
      '<rect x="194" y="56" width="150" height="26" rx="13" fill="#d1fae5"/><rect x="194" y="70" width="150" height="12" fill="#d1fae5"/>'
      + T(269, 74, 'Depolama · dolap', 11, '#065f46') +
      '<rect x="206" y="90" width="126" height="98" rx="6" fill="#f1f5f9" stroke="#cbd5e1"/><path d="M206 140h126" stroke="#cbd5e1" stroke-width="2"/>'
      + dosya(232, 116, 'Foto', '#10b981') + dosya(282, 116, 'Oyun', '#8b5cf6') +
      '<rect class="k1-yuva" x="218" y="146" width="28" height="36" rx="4" fill="none" stroke="#94a3b8" stroke-dasharray="3 3"/>'
      '<g class="k1-kilit" transform="translate(318 164)"><circle r="10" fill="#10b981"/><path d="M-4 0l3 3 6-6" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>'
      + T(300, 199, 'Kalıcı', 11, '#047857') + '</g>'
      # gezgin kopya (JS taşır)
      + dosya(0, 0, 'Ödev', '#2563eb', 1, 'k1-gezgin', 'k1-gezgin') +
      '</svg>')
w('kalici.svg', k1)

# ── Adım 6: bulut yedekleme (A-AKIS). JS yolları kullanır.
bl = ('<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bilgisayardaki proje dosyası buluta kopyalanıyor; bilgisayarın diski bozulunca dosya buluttan geri geliyor." class="bl">' + bg('h8bl', '#eff6ff', '#dbeafe') +
      '<path id="bl-yol-yukle" d="M96 118 C 110 50, 190 40, 236 70" fill="none" stroke="#93c5fd" stroke-width="3" stroke-dasharray="6 6" class="bl-yol"/>'
      '<path id="bl-yol-geri" d="M250 100 C 240 150, 180 170, 130 150" fill="none" stroke="#86efac" stroke-width="3" stroke-dasharray="6 6" class="bl-yol bl-yol-geri"/>'
      + bulut_sekli(214, 18, 1.1) + T(274, 92, 'Bulut', 11, '#1d4ed8') +
      '<g transform="translate(252 40)"><rect x="0" y="0" width="44" height="10" rx="3" fill="#e2e8f0"/><rect x="0" y="13" width="44" height="10" rx="3" fill="#e2e8f0"/>'
      '<circle cx="38" cy="5" r="2" fill="#22c55e"/><circle cx="38" cy="18" r="2" fill="#22c55e"/></g>'
      '<g class="bl-bulut-dosya">' + dosya(232, 58, '', '#7c3aed', 0.7) + '<g transform="translate(244 48)"><circle r="7" fill="#10b981"/><path d="M-3 0l2 2 4-4" stroke="#fff" stroke-width="2" fill="none"/></g></g>'
      + laptop(20, 116, 1.15, 'bl-laptop',
               '<g class="bl-pc-dosya">' + dosya(50, 24, 'Proje', '#7c3aed', 0.8) + '</g>'
               '<g class="bl-ariza"><rect x="11" y="5" width="78" height="48" rx="2" fill="#fee2e2"/><path d="M30 12l14 14-8 6 16 14" stroke="#ef4444" stroke-width="2.5" fill="none"/>'
               + T(50, 46, 'Disk bozuldu', 8, '#b91c1c') + '</g>') +
      T(78, 214, 'Deniz’in bilgisayarı', 11, '#334155') +
      '<g id="bl-gezgin" class="bl-gezgin"><circle r="11" fill="#7c3aed" opacity=".25"/>' + dosya(0, 0, '', '#7c3aed', 0.55) + '</g>'
      '<g class="bl-rozet" transform="translate(300 180)"><rect x="-54" y="-18" width="108" height="36" rx="12" fill="#fff" stroke="#cbd5e1" stroke-width="1.5"/>'
      + T(0, -2, 'Kopya sayısı', 9, '#64748b') + T(0, 12, '1', 13, '#1e293b', cls='bl-kopya') + '</g>'
      '</svg>')
w('bulut.svg', bl)

# ── Yedek çizimler (WebGL yoksa)
w('yedek-hdd.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Açık sabit disk: parlak plaka, ortada mil, köşede okuma-yazma kafası kolu">' + bg('h8yh') +
  hdd_ust(30, 30, 1.9) + T(310, 22, 'Plaka', 11) + T(70, 226, 'Okuma-yazma kafası', 11) + '</svg>')
w('yedek-ssd.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kapağı açık SSD: denetleyici ve bellek çipleri; yanında M.2 SSD">' + bg('h8ys') +
  ssd(24, 40, 1.35, True) + T(105, 172, 'SATA SSD (içi)', 11) + m2(200, 80, 0.85) + T(268, 134, 'M.2 SSD', 11) + '</svg>')
w('yedek-usb.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="USB bellek, SD kart ve microSD kart yan yana">' + bg('h8yu') +
  usb(30, 90, 1.6) + T(96, 150, 'USB bellek', 11) + sdkart(210, 80, 1.6) + T(230, 150, 'SD kart', 11) + sdkart(290, 100, 0.8, '#dc2626') + T(300, 150, 'microSD', 11) + '</svg>')
w('yedek-kapak.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Açık sabit disk, SSD, M.2 SSD ve USB bellek">' + bg('h8yk', '#ffffff', '#e0f2fe') +
  hdd_ust(20, 30, 1.1) + ssd(200, 30, 1.0) + m2(40, 170, 0.8) + usb(220, 160, 1.1) + '</svg>')
w('svg-quiz-hdd.svg', '<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kapağı açık bir depolama birimi: parlak dönen plaka ve kol"><rect width="200" height="120" rx="10" fill="#eef7fe"/>' +
  hdd_ust(24, 8, 1.0) + '</svg>')


# ── Özet küçük resimleri (80×60)
def oz(ad, aria, ic, zemin='#e0f2fe'):
    w(ad, '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="80" height="60" rx="10" fill="%s"/>%s</svg>' % (aria, zemin, ic))


oz('oz-1.svg', 'Kalıcı depolama', dosya(26, 26, '', '#2563eb', 0.9) + '<path d="M44 30h10" stroke="#10b981" stroke-width="3"/><rect x="54" y="16" width="18" height="28" rx="3" fill="#10b981"/><path d="M58 30h10M58 24h10M58 36h10" stroke="#d1fae5" stroke-width="2"/>')
oz('oz-2.svg', 'HDD', hdd_ust(6, 6, 0.46))
oz('oz-3.svg', 'SSD', ssd(13, 4, 0.45, True) + m2(7, 44, 0.3))
oz('oz-4.svg', 'HDD mi SSD mi', '<rect x="8" y="14" width="52" height="10" rx="5" fill="#cbd5e1"/><rect x="8" y="14" width="22" height="10" rx="5" fill="#94a3b8"/>'
   '<rect x="8" y="34" width="52" height="10" rx="5" fill="#cbd5e1"/><rect x="8" y="34" width="52" height="10" rx="5" fill="#10b981"/>' + T(70, 23, 'HDD', 7, '#475569') + T(70, 43, 'SSD', 7, '#047857'))
oz('oz-5.svg', 'USB bellek ve hafıza kartı', usb(4, 20, 0.6) + sdkart(54, 12, 0.8))
oz('oz-6.svg', 'Bulut ve yedekleme', bulut_sekli(16, 4, 0.4) + dosya(40, 30, '', '#7c3aed', 0.5), '#ede9fe')
print('SVG’ler yazıldı')
