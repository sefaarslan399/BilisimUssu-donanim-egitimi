# DON-301 H12 SVG üretici: python3 svg_uret.py  (f-string yok; tek tırnak kullanılmaz: SVG'ler JS dizgelerine gömülür)
F = 'font-family="Inter,Arial,sans-serif"'
M = 'font-family="JetBrains Mono,Consolas,monospace"'


def w(ad, s):
    open(ad, 'w').write(s.strip().replace('\n', '') + '\n')


def T(x, y, t, size=11, fill='#334155', anchor='middle', weight=800, fam=F):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x, y, fam, size, weight, fill, anchor, t)


def bg(i, a='#f8fafc', b='#ede9fe', W=360, H=240):
    return ('<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>'
            '<rect width="%d" height="%d" rx="16" fill="url(#%s)"/>') % (i, a, b, W, H, i)


def tarama(i, renk='#94a3b8'):
    return ('<pattern id="%s" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
            '<rect width="8" height="8" fill="#f1f5f9"/><rect width="3" height="8" fill="%s" fill-opacity=".45"/></pattern>') % (i, renk)


def usb(x, y, s=1.0, govde='#334155', uc='#cbd5e1'):
    """Yatay USB bellek: sol uçta konnektör. (x,y) sol üst, 64×24 birim × s."""
    return ('<g transform="translate(%s %s) scale(%s)"><rect x="0" y="5" width="16" height="14" rx="2" fill="%s"/>'
            '<rect x="4" y="9" width="4" height="3" fill="#475569"/><rect x="4" y="13" width="4" height="3" fill="#475569"/>'
            '<rect x="14" y="0" width="50" height="24" rx="6" fill="%s"/><rect x="22" y="8" width="26" height="8" rx="3" fill="#fff" fill-opacity=".85"/></g>') % (x, y, s, uc, govde)


# ── Kapak (tam alan; taşan arka plan)
kapak = ('<svg viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet" style="overflow:visible" xmlns="http://www.w3.org/2000/svg" role="img" '
         'aria-label="Kurulum ekranı gösteren monitör, önyüklenebilir USB bellek ve GPT ile bölümlenmiş disk çubuğu" class="kapak-kur">'
         '<defs><linearGradient id="kkBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2e1065"/><stop offset="1" stop-color="#1e3a8a"/></linearGradient></defs>'
         '<rect x="-600" y="-600" width="1560" height="1440" fill="url(#kkBg)"/>'
         '<g stroke="#a78bfa" stroke-opacity=".12">' + ''.join('<path d="M%d -600V840"/>' % x for x in range(-600, 960, 20)) +
         ''.join('<path d="M-600 %dH960"/>' % y for y in range(-600, 840, 20)) + '</g>'
         # monitör
         '<rect x="74" y="18" width="212" height="136" rx="10" fill="#0f172a" stroke="#c4b5fd" stroke-opacity=".5" stroke-width="1.5"/>'
         '<rect x="82" y="26" width="196" height="120" rx="5" fill="#f8fafc"/>'
         '<rect x="82" y="26" width="196" height="16" rx="5" fill="#1e293b"/><rect x="82" y="36" width="196" height="6" fill="#1e293b"/>' +
         T(90, 37, 'Kurulum adımları', 8, '#e2e8f0', 'start', 700) +
         ''.join('<g><circle cx="94" cy="%d" r="4.5" fill="%s"/>%s%s</g>' % (
             54 + i * 13, '#16a34a' if i < 3 else ('#7c3aed' if i == 3 else '#cbd5e1'),
             ('<path d="M92 %d l1.6 1.6 3-3" stroke="#fff" stroke-width="1.4" fill="none"/>' % (54 + i * 13)) if i < 3 else '',
             T(104, 57 + i * 13, a, 8, '#0f172a' if i <= 3 else '#94a3b8', 'start', 700 if i == 3 else 600))
             for i, a in enumerate(['Önyüklenebilir USB', 'Dil ve klavye', 'Disk: GPT', 'Dosyalar kopyalanıyor', 'Kullanıcı hesabı', 'Sürücüler'])) +
         '<rect x="190" y="118" width="78" height="8" rx="4" fill="#e2e8f0"/><rect class="kk-bar" x="190" y="118" width="78" height="8" rx="4" fill="#7c3aed"/>' +
         T(229, 138, '%64', 8, '#4c1d95', weight=800, fam=M) +
         '<rect x="166" y="154" width="28" height="12" fill="#0f172a"/><rect x="146" y="166" width="68" height="6" rx="3" fill="#0f172a" stroke="#c4b5fd" stroke-opacity=".4"/>'
         # USB bellek
         + usb(300, 70, 0.9, '#7c3aed', '#e2e8f0') +
         '<path d="M298 81 H286" stroke="#c4b5fd" stroke-width="2" stroke-dasharray="3 3"/>' +
         T(329, 104, 'USB · 8 GB+', 8, '#ddd6fe', weight=700) +
         # disk çubuğu (GPT)
         '<g transform="translate(34 190)"><rect x="0" y="0" width="292" height="26" rx="6" fill="#1e1b4b" stroke="#a78bfa" stroke-opacity=".6"/>'
         '<rect x="3" y="3" width="10" height="20" rx="3" fill="#94a3b8"/>'
         '<rect x="15" y="3" width="30" height="20" rx="3" fill="#f59e0b"/>' + T(30, 17, 'EFI', 8, '#1f1300', weight=900) +
         '<rect x="47" y="3" width="226" height="20" rx="3" fill="#8b5cf6"/>' + T(160, 17, 'Sistem', 9, '#fff', weight=800) +
         '<rect x="275" y="3" width="14" height="20" rx="3" fill="#94a3b8"/></g>' +
         T(34, 184, 'GPT', 9, '#fcd34d', 'start', 900, M) + T(326, 184, 'yedek GPT', 7, '#c4b5fd', 'end', 700, M) +
         '</svg>')
w('kapak.svg', kapak)

# ── Isınma: 4 TB disk, MBR mi GPT mi?
w('isinma.svg', '<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Kutusunda 4 TB yazan yeni disk; MBR ve GPT bölüm tablolarıyla ne kadarının kullanılabileceği soru işaretiyle soruluyor">' +
  '<defs>' + tarama('isT') + '</defs>' + bg('isBg') +
  '<rect x="22" y="44" width="100" height="136" rx="10" fill="#1e293b"/><rect x="31" y="53" width="82" height="118" rx="6" fill="#334155"/>'
  '<circle cx="72" cy="104" r="30" fill="#475569" stroke="#94a3b8" stroke-width="2"/><circle cx="72" cy="104" r="5" fill="#cbd5e1"/>'
  '<path d="M72 104 L98 128" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/>'
  '<rect x="38" y="148" width="68" height="18" rx="4" fill="#fff"/>' + T(72, 161, '4 TB', 12, '#0f172a', weight=900) +
  T(72, 200, 'Yeni disk', 10, '#475569', weight=700) +
  # MBR çubuğu
  T(142, 62, 'MBR ile', 11, '#4c1d95', 'start', 900) +
  '<rect x="142" y="70" width="196" height="26" rx="6" fill="url(#isT)" stroke="#94a3b8"/>' +
  '<circle cx="240" cy="83" r="11" fill="#fff" stroke="#f59e0b" stroke-width="2.5"/>' + T(240, 88, '?', 13, '#b45309', weight=900) +
  # GPT çubuğu
  T(142, 128, 'GPT ile', 11, '#4c1d95', 'start', 900) +
  '<rect x="142" y="136" width="196" height="26" rx="6" fill="url(#isT)" stroke="#94a3b8"/>' +
  '<circle cx="240" cy="149" r="11" fill="#fff" stroke="#f59e0b" stroke-width="2.5"/>' + T(240, 154, '?', 13, '#b45309', weight=900) +
  T(240, 192, 'Diskin ne kadarı kullanılabilir?', 11, '#b45309') +
  T(240, 208, 'Bölüm tablosu: diskin “içindekiler” sayfası', 9, '#64748b', weight=600) + '</svg>')

# ── Quiz görseli: 4 TB disk MBR ile, yarısı ayrılmamış
w('svg-quiz-mbr.svg', '<svg viewBox="0 0 240 104" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Disk 1, 4 TB, 3726 GB görünüyor: 2048 GB bölüm ve kullanılamayan 1678 GB ayrılmamış alan">' +
  '<defs>' + tarama('qT', '#64748b') + '</defs><rect width="240" height="104" rx="10" fill="#f8fafc"/>' +
  T(10, 20, 'Disk 1 · 4 TB (3726 GB) · MBR', 10, '#0f172a', 'start', 800) +
  '<rect x="10" y="30" width="220" height="34" rx="6" fill="#fff" stroke="#cbd5e1"/>' +
  '<rect x="13" y="33" width="118" height="28" rx="4" fill="#8b5cf6"/>' + T(72, 46, 'Bölüm 1', 9, '#fff') + T(72, 57, '2048 GB', 9, '#ede9fe', fam=M, weight=700) +
  '<rect x="133" y="33" width="94" height="28" rx="4" fill="url(#qT)"/>' + T(180, 46, 'Ayrılmamış', 9, '#334155') + T(180, 57, '1678 GB', 9, '#334155', fam=M, weight=700) +
  '<circle cx="180" cy="84" r="10" fill="#fff" stroke="#f59e0b" stroke-width="2"/>' + T(180, 88, '?', 12, '#b45309', weight=900) +
  T(12, 88, 'Neden kullanılamıyor?', 9, '#b45309', 'start') + '</svg>')


# ── Özet simgeleri 80×60
def oz(ad, aria, ic):
    w(ad, '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="80" height="60" rx="10" fill="#ede9fe"/>%s</svg>' % (aria, ic))


oz('oz-1.svg', 'Önyüklenebilir USB', '<circle cx="20" cy="30" r="12" fill="#fff" stroke="#8b5cf6" stroke-width="2"/><circle cx="20" cy="30" r="3" fill="#8b5cf6"/>' + T(20, 52, 'ISO', 7, '#4c1d95') +
   '<path d="M34 30h8" stroke="#4c1d95" stroke-width="2"/><path d="M40 26l4 4-4 4" fill="none" stroke="#4c1d95" stroke-width="2"/>' + usb(46, 18, 0.5, '#7c3aed', '#cbd5e1'))
oz('oz-2.svg', 'GPT ve MBR', '<defs>' + tarama('ozT') + '</defs>' + T(8, 20, 'MBR', 7, '#4c1d95', 'start', 900) +
   '<rect x="26" y="12" width="46" height="11" rx="3" fill="url(#ozT)"/><rect x="26" y="12" width="24" height="11" rx="3" fill="#a78bfa"/>' +
   T(8, 42, 'GPT', 7, '#4c1d95', 'start', 900) + '<rect x="26" y="34" width="46" height="11" rx="3" fill="#7c3aed"/>')
oz('oz-3.svg', 'Bölümleme ve biçimlendirme', '<rect x="8" y="20" width="64" height="18" rx="4" fill="#fff" stroke="#cbd5e1"/><rect x="10" y="22" width="10" height="14" rx="2" fill="#f59e0b"/>'
   '<rect x="22" y="22" width="48" height="14" rx="2" fill="#8b5cf6"/>' + T(15, 50, 'FAT32', 6, '#92400e') + T(46, 50, 'NTFS · ext4', 6, '#4c1d95'))
oz('oz-4.svg', 'Kurulum', '<rect x="14" y="8" width="52" height="34" rx="4" fill="#1e293b"/><rect x="18" y="12" width="44" height="26" rx="2" fill="#f8fafc"/>'
   '<rect x="22" y="28" width="36" height="5" rx="2.5" fill="#e2e8f0"/><rect x="22" y="28" width="24" height="5" rx="2.5" fill="#7c3aed"/><rect x="34" y="42" width="12" height="6" fill="#1e293b"/><rect x="28" y="48" width="24" height="3" rx="1.5" fill="#1e293b"/>')
oz('oz-5.svg', 'Sürücüler ve Aygıt Yöneticisi', '<path d="M18 12v34M18 22h10M18 34h10M18 46h10" stroke="#64748b" stroke-width="2" fill="none"/>'
   '<rect x="30" y="17" width="34" height="10" rx="3" fill="#fff" stroke="#cbd5e1"/><path d="M34 29l5-9 5 9z" fill="#f59e0b" transform="translate(0 -2)"/>'
   '<rect x="30" y="29" width="34" height="10" rx="3" fill="#fff" stroke="#cbd5e1"/><circle cx="37" cy="34" r="3.5" fill="#16a34a"/>'
   '<rect x="30" y="41" width="34" height="10" rx="3" fill="#fff" stroke="#cbd5e1"/><circle cx="37" cy="46" r="3.5" fill="#16a34a"/>')
oz('oz-6.svg', 'Güncellemeler ve ilk ayarlar', '<path d="M40 14a16 16 0 1 1-15 10" fill="none" stroke="#7c3aed" stroke-width="4" stroke-linecap="round"/><path d="M20 20l5 5 4-7" fill="none" stroke="#7c3aed" stroke-width="3"/>'
   '<path d="M33 30l5 5 9-10" fill="none" stroke="#16a34a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>')


# ── Etkinlik 2 karar kartı çizimleri 200×90
def kr(ad, aria, ic):
    w(ad, '<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="200" height="90" rx="10" fill="#f5f3ff"/>%s</svg>' % (aria, ic))


kr('kr-1.svg', 'Kalıp dosyası 5,8 GB, USB bellek 4 GB', '<circle cx="42" cy="44" r="24" fill="#fff" stroke="#8b5cf6" stroke-width="3"/><circle cx="42" cy="44" r="6" fill="#8b5cf6"/>' + T(42, 84, 'ISO · 5,8 GB', 9, '#4c1d95', fam=M) +
   '<path d="M76 44h22" stroke="#64748b" stroke-width="2.5"/><path d="M94 38l7 6-7 6" fill="none" stroke="#64748b" stroke-width="2.5"/>' + usb(110, 30, 1.1, '#334155', '#cbd5e1') + T(146, 84, 'USB · 4 GB', 9, '#334155', fam=M))
kr('kr-2.svg', 'UEFI modu, Secure Boot açık, yeni 1 TB SSD', '<rect x="14" y="18" width="62" height="40" rx="6" fill="#1e293b"/>' + T(45, 36, 'UEFI', 12, '#c4b5fd', weight=900, fam=M) + T(45, 50, 'mod: UEFI', 8, '#e2e8f0', weight=600, fam=M) +
   '<path d="M100 16l16 6v12c0 10-7 17-16 21-9-4-16-11-16-21V22z" fill="#16a34a"/><path d="M93 35l5 5 9-10" fill="none" stroke="#fff" stroke-width="3"/>' + T(100, 76, 'Secure Boot', 8, '#166534') +
   '<rect x="128" y="24" width="58" height="30" rx="4" fill="#0f172a"/><rect x="134" y="30" width="30" height="6" rx="2" fill="#a78bfa"/>' + T(157, 70, 'SSD · 1 TB', 8, '#334155', fam=M))
kr('kr-3.svg', '4 TB veri diski tek bölüm olarak kullanılacak', '<rect x="12" y="16" width="44" height="58" rx="6" fill="#1e293b"/><circle cx="34" cy="40" r="13" fill="#475569" stroke="#94a3b8" stroke-width="2"/>' + T(34, 68, '4 TB', 9, '#fff', weight=900) +
   '<rect x="68" y="32" width="120" height="24" rx="5" fill="#8b5cf6"/>' + T(128, 48, 'Tek bölüm · 3726 GB', 9, '#fff') + T(128, 74, 'Tamamı kullanılacak', 8, '#4c1d95', weight=700))
kr('kr-4.svg', 'Yalnız eski BIOS destekli bilgisayar, 500 GB sistem diski', '<rect x="16" y="12" width="44" height="66" rx="4" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/><rect x="22" y="20" width="32" height="6" rx="2" fill="#64748b"/><circle cx="38" cy="64" r="4" fill="#64748b"/>' +
   '<rect x="76" y="22" width="108" height="32" rx="6" fill="#0f172a"/>' + T(130, 36, 'BIOS (Legacy)', 10, '#fde68a', weight=900, fam=M) + T(130, 48, 'UEFI desteği yok', 8, '#e2e8f0', weight=600) + T(130, 72, 'Sistem diski · 500 GB', 9, '#334155', fam=M))
kr('kr-5.svg', 'Disk listesi: Disk 0 SSD eski sistem, Disk 1 HDD ARŞİV', '<rect x="10" y="14" width="180" height="26" rx="5" fill="#fff" stroke="#8b5cf6" stroke-width="2"/>' + T(18, 31, 'Disk 0 · SSD · 238,5 GB', 9, '#4c1d95', 'start', 800) + T(182, 31, 'eski sistem', 8, '#64748b', 'end', 700) +
   '<rect x="10" y="48" width="180" height="26" rx="5" fill="#f0fdfa" stroke="#0f766e" stroke-width="2"/>' + T(18, 65, 'Disk 1 · HDD · 931,5 GB', 9, '#134e4a', 'start', 800) + T(166, 65, 'ARŞİV', 8, '#0f766e', 'end', 900) +
   '<rect x="171" y="57" width="12" height="10" rx="2" fill="#dc2626"/><path d="M173 57v-3a4 4 0 0 1 8 0v3" fill="none" stroke="#dc2626" stroke-width="2"/>')
kr('kr-6.svg', 'Aygıt Yöneticisinde sarı ünlemli Ağ Denetleyicisi', '<path d="M20 14v58M20 30h14M20 50h14M20 70h14" stroke="#64748b" stroke-width="2" fill="none"/>' +
   '<rect x="36" y="22" width="150" height="16" rx="4" fill="#fff" stroke="#cbd5e1"/>' + T(46, 34, 'Diğer aygıtlar', 9, '#334155', 'start', 800) +
   '<rect x="36" y="42" width="150" height="16" rx="4" fill="#fff7ed" stroke="#f59e0b" stroke-width="1.5"/><path d="M42 55l6-10 6 10z" fill="#f59e0b"/>' + T(51, 54, '!', 8, '#fff', weight=900) + T(60, 54, 'Ağ Denetleyicisi', 9, '#92400e', 'start', 800) + T(181, 54, 'sürücü yok', 7.5, '#b45309', 'end', 800) +
   '<rect x="36" y="62" width="150" height="16" rx="4" fill="#fff" stroke="#cbd5e1"/>' + T(46, 74, 'Disk sürücüleri', 9, '#334155', 'start', 700))
print('SVG’ler yazıldı.')
