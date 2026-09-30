F='font-family="Inter,Arial,sans-serif"'
def w(ad, s): open(ad,'w').write(s.strip()+'\n')
def bg(id_, a='#f0f9ff', b='#dbeafe', W=360, H=240, r=18):
    return '<defs><linearGradient id="%s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs><rect width="%d" height="%d" rx="%d" fill="url(#%s)"/>' % (id_,a,b,W,H,r,id_)
def T(x,y,t,size=11,fill='#334155',anchor='middle',weight=800):
    return '<text x="%s" y="%s" %s font-size="%s" font-weight="%s" fill="%s" text-anchor="%s">%s</text>' % (x,y,F,size,weight,fill,anchor,t)
def kasa(x,y,s=1,acik=False):
    g='<g transform="translate(%s %s) scale(%s)"><rect x="0" y="0" width="60" height="110" rx="6" fill="#30343c"/><rect x="5" y="6" width="50" height="98" rx="4" fill="%s"/>' % (x,y,s,'#1d2027' if acik else '#3a3f48')
    if acik: g+='<rect x="10" y="12" width="40" height="46" rx="2" fill="#23272e"/><rect x="18" y="20" width="14" height="14" fill="#cbd5e1"/><rect x="36" y="16" width="4" height="30" fill="#1f5a3a"/><rect x="42" y="16" width="4" height="30" fill="#1f5a3a"/><rect x="10" y="80" width="40" height="18" rx="2" fill="#2a2d33"/>'
    else: g+='<circle cx="30" cy="20" r="5" fill="#1d2027" stroke="#bfe3ff" stroke-width="1.5"/>'
    return g+'</g>'
def priz(x,y,s=1): return '<g transform="translate(%s %s) scale(%s)"><rect x="-12" y="-12" width="24" height="24" rx="4" fill="#f1f5f9" stroke="#cbd5e1"/><circle r="8" fill="#e2e8f0"/><circle cx="-3" r="1.6" fill="#334155"/><circle cx="3" r="1.6" fill="#334155"/></g>' % (x,y,s)
def fis(x,y,s=1): return '<g transform="translate(%s %s) scale(%s)"><rect x="-7" y="-9" width="14" height="18" rx="5" fill="#1f2937"/></g>' % (x,y,s)
def ram(x,y,s=1,rot=0):
    g='<g transform="translate(%s %s) rotate(%s) scale(%s)"><rect x="0" y="0" width="120" height="30" rx="2" fill="#1f5a3a"/>' % (x,y,rot,s)
    g+=''.join('<rect x="%d" y="5" width="16" height="12" rx="1" fill="#17181c"/>' % (8+i*14) for i in range(7))
    g+='<rect x="4" y="23" width="112" height="7" fill="#e3b04f"/>'+''.join('<rect x="%d" y="23" width="1" height="7" fill="#b88a30"/>' % (6+i*4) for i in range(28))
    g+='<rect x="52" y="23" width="4" height="7" fill="#dbeafe"/></g>'
    return g
def parmak(x,y,rot=0,s=1): return '<g transform="translate(%s %s) rotate(%s) scale(%s)"><rect x="-6" y="-22" width="12" height="30" rx="6" fill="#e0a77a"/><rect x="-4.5" y="-21" width="9" height="7" rx="3.5" fill="#f0c7a4"/></g>' % (x,y,rot,s)
def rozet(x,y,iyi):
    return '<g transform="translate(%s %s)"><circle r="13" fill="%s"/><path d="%s" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>' % (x,y,'#10b981' if iyi else '#ef4444','M-6 0l4 4 8-8' if iyi else 'M-5 -5l10 10M5 -5l-10 10')
def psu(x,y,s=1):
    return ('<g transform="translate(%s %s) scale(%s)"><rect x="0" y="0" width="90" height="56" rx="5" fill="#1e2126"/><circle cx="30" cy="28" r="20" fill="#0d0e11" stroke="#4b5059" stroke-width="2"/><path d="M12 28h36M30 10v36" stroke="#4b5059" stroke-width="2"/>'
            '<rect x="56" y="12" width="28" height="32" rx="2" fill="#f4f5f7"/><path d="M70 17l9 16h-18z" fill="#facc15" stroke="#111" stroke-width="1.5"/><path d="M71 21l-3 6h3l-2 5 4-7h-3z" fill="#111"/><rect x="60" y="36" width="20" height="3" fill="#b91c1c"/></g>') % (x,y,s)
def pil(x,y,s=1,sismis=True):
    g='<g transform="translate(%s %s) scale(%s)"><rect x="0" y="10" width="54" height="72" rx="5" fill="#9aa7b8"/>' % (x,y,s)
    if sismis: g+='<ellipse cx="27" cy="46" rx="30" ry="40" fill="#b6c1cf"/><ellipse cx="22" cy="36" rx="10" ry="16" fill="#d7dee7" opacity=".7"/>'
    g+='<rect x="8" y="30" width="38" height="30" rx="3" fill="#1d4ed8" opacity="%s"/><rect x="4" y="80" width="46" height="6" fill="#1f5a3a"/></g>' % ('.85' if not sismis else '.8')
    return g
def crt(x,y,s=1): return '<g transform="translate(%s %s) scale(%s)"><rect x="18" y="8" width="60" height="56" rx="10" fill="#cfc8b6"/><rect x="0" y="0" width="80" height="68" rx="8" fill="#d8d2c2"/><rect x="8" y="7" width="64" height="50" rx="6" fill="#1b2a26"/><rect x="28" y="68" width="24" height="8" fill="#d8d2c2"/><rect x="18" y="76" width="44" height="5" rx="2" fill="#cfc8b6"/></g>' % (x,y,s)
def kilit(x,y,s=1): return '<g transform="translate(%s %s) scale(%s)"><path d="M-6 -2v-5a6 6 0 0 1 12 0v5" fill="none" stroke="#b91c1c" stroke-width="3"/><rect x="-9" y="-2" width="18" height="14" rx="3" fill="#ef4444"/><circle cy="4" r="2" fill="#fff"/></g>' % (x,y,s)
def bileklik(x,y,s=1, kablo_son=None):
    g='<g transform="translate(%s %s) scale(%s)"><ellipse rx="16" ry="9" fill="none" stroke="#2563eb" stroke-width="6"/><circle cx="16" cy="0" r="4" fill="#cbd5e1" stroke="#94a3b8"/></g>' % (x,y,s)
    return g
def klips(x,y,s=1): return '<g transform="translate(%s %s) scale(%s)"><path d="M0 -3h18l3 3-3 3H0z" fill="#dc2626"/><path d="M0 2h18" stroke="#991b1b"/><rect x="18" y="-2" width="6" height="4" fill="#cbd5e1"/></g>' % (x,y,s)
def tornavida(x,y,rot=0,s=1): return '<g transform="translate(%s %s) rotate(%s) scale(%s)"><rect x="0" y="-5" width="30" height="10" rx="4" fill="#f59e0b"/><rect x="30" y="-1.5" width="30" height="3" fill="#94a3b8"/><path d="M60 -1.5l5 1.5-5 1.5z" fill="#64748b"/></g>' % (x,y,rot,s)
def simsek(x,y,s=1,fill='#facc15'): return '<g transform="translate(%s %s) scale(%s)"><path d="M4 -12l-10 13h7l-4 11 12-15h-7z" fill="%s" stroke="#a16207" stroke-width="1"/></g>' % (x,y,s,fill)
def insan(x,y,s=1,cls=''):
    # yan görünüm, yürüyen genç
    return ('<g class="insan %s" transform="translate(%s %s) scale(%s)">'
            '<g class="bacak b1"><rect x="-6" y="40" width="8" height="34" rx="4" fill="#334155"/><rect x="-8" y="70" width="14" height="6" rx="3" fill="#111827"/></g>'
            '<g class="bacak b2"><rect x="0" y="40" width="8" height="34" rx="4" fill="#475569"/><rect x="-2" y="70" width="14" height="6" rx="3" fill="#1f2937"/></g>'
            '<rect x="-10" y="0" width="22" height="46" rx="9" fill="#4f46e5"/><rect x="-6" y="4" width="14" height="4" rx="2" fill="#6366f1"/>'
            '<g class="kol"><rect x="4" y="6" width="8" height="30" rx="4" fill="#4338ca" transform="rotate(-50 8 8)"/><circle cx="33" cy="12" r="4.5" fill="#e0a77a"/></g>'
            '<circle cx="1" cy="-12" r="12" fill="#e0a77a"/><path d="M-11 -14a12 12 0 0 1 23 -3c-6 -1-12 1-15 6z" fill="#3b2a20"/><circle cx="7" cy="-13" r="1.4" fill="#1f2937"/>'
            '</g>') % (cls,x,y,s)

# ── Isınma
w('isinma.svg','<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Masada fişi prize takılı eski bir bilgisayar ve yanında tornavida; önce ne yapılmalı?">'+bg('h4is')+
  '<rect x="0" y="176" width="360" height="64" fill="#e7d3b8"/><rect x="0" y="172" width="360" height="8" fill="#cfb38f"/>'+kasa(70,62,1)+
  '<path d="M130 150c30 0 40 10 60 10s40-40 70-40" fill="none" stroke="#1f2937" stroke-width="4"/>'+priz(292,120,1.4)+fis(276,120,1)+
  tornavida(150,190,-8,1.2)+'<g><rect x="200" y="30" width="140" height="46" rx="12" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>'+T(270,50,'Önce ne yapmalı?',12)+T(270,66,'Sence?',11,'#64748b')+'</g>'+
  '<circle cx="176" cy="110" r="18" fill="#fff" stroke="#f59e0b" stroke-width="3"/>'+T(176,118,'?',20,'#b45309',weight=900)+'</svg>')

# ── Yedek çizimler
w('yedek-guvenlik.svg','<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Antistatik bileklik, bellek modülü ve uyarı etiketli güç kaynağı">'+bg('h4yg')+bileklik(80,90,1.6)+klips(120,150,1.6)+'<path d="M106 90c20 20 0 40 14 60" fill="none" stroke="#1f2937" stroke-width="2" stroke-dasharray="3 2"/>'+ram(160,60,1.2)+psu(190,130,1.3)+'</svg>')
w('yedek-fis.svg','<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Fiş prizden çekilmiş, güç düğmesine basılı tutuluyor">'+bg('h4yf')+kasa(60,60,1)+priz(290,110,1.6)+fis(250,140,1.3)+
  '<path d="M120 150c40 0 90 0 124 -8" fill="none" stroke="#1f2937" stroke-width="4"/><path d="M262 118l18 -10" stroke="#10b981" stroke-width="3" marker-end=""/>'+T(290,150,'1 · Fişi çek',12)+T(90,196,'2 · Düğmeye 5 sn bas',12)+'<circle cx="90" cy="80" r="10" fill="#10b981" opacity=".35"/></svg>')
w('yedek-tutus.svg','<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bellek modülü kısa kenarlarından tutulursa doğru, altın temaslardan tutulursa yanlış">'+bg('h4yt')+
  ram(30,60,1.0)+parmak(30,74,90)+parmak(150,74,-90)+rozet(90,40,True)+T(90,118,'Kenarından: doğru',12,'#047857')+
  ram(200,60,1.0)+parmak(240,112,0)+parmak(280,112,0)+rozet(260,40,False)+T(260,150,'Altın temastan: yanlış',12,'#b91c1c')+'</svg>')
w('yedek-asla.svg','<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Güç kaynağı, şişmiş pil ve tüplü monitör kilitli: asla açılmaz">'+bg('h4ya','#fff1f2','#fee2e2')+
  psu(20,90,1)+kilit(65,70,1.4)+pil(150,70,0.9)+kilit(175,54,1.4)+crt(250,80,1)+kilit(290,64,1.4)+T(65,176,'Güç kaynağı',11)+T(175,176,'Şişmiş pil',11)+T(290,176,'Tüplü monitör',11)+T(180,212,'Asla açılmaz!',15,'#b91c1c',weight=900)+'</svg>')
w('svg-quiz-tutus.svg','<svg viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bellek modülü, parmaklar altın temaslara değiyor"><rect width="200" height="110" rx="10" fill="#eef7fe"/>'+ram(40,28,1.0)+parmak(80,84,0,1.1)+parmak(120,84,0,1.1)+'</svg>')

# ── Adım 3: kıvılcım sahnesi (JS sınıflarla oynatır)
kv=('<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Halıda yürüyen öğrencinin vücudunda elektrik birikiyor; bellek modülüne dokununca kıvılcım atlıyor; bileklik takılıyken elektrik kasaya akıyor" class="kv">'+bg('h4kv')+
    '<rect x="0" y="190" width="360" height="50" fill="#b45309" opacity=".25"/><g stroke="#b45309" stroke-opacity=".25" stroke-width="2">'+''.join('<path d="M%d 196l6 8M%d 214l6 8" />' % (i,i+8) for i in range(4,356,16))+'</g>'
    '<rect x="222" y="118" width="130" height="8" rx="3" fill="#cfb38f"/><rect x="230" y="126" width="8" height="64" fill="#b8996f"/><rect x="336" y="126" width="8" height="64" fill="#b8996f"/>'
    + kasa(300,8,1.0,True) + ram(236,106,0.62) +
    '<g class="hasar"><circle cx="262" cy="112" r="6" fill="#1f2937" opacity=".85"/><path d="M258 108l8 8M266 108l-8 8" stroke="#ef4444" stroke-width="1.5"/></g>'
    '<g class="kv-kablo"><path d="M0 0" /></g>'
    '<g class="yuruyen">' + insan(0,112,1,'') +
    '<g class="yuk">' + ''.join('<text class="arti a%d" x="%d" y="%d" %s font-size="12" font-weight="900" fill="#dc2626">+</text>' % (i,x,y,F) for i,(x,y) in enumerate([(-8,128),(6,140),(-2,152),(8,120),(-6,110),(4,160)])) + '</g>'
    '<g class="kv-bileklik"><rect x="30" y="118" width="7" height="10" rx="2" fill="#2563eb"/><path class="kv-tel" d="M34 128 C 60 190, 250 200, 300 110" fill="none" stroke="#1f2937" stroke-width="1.6" stroke-dasharray="4 3"/></g>'
    '</g>'
    '<g class="kivilcim">' + simsek(252,98,1.3) + '<circle cx="252" cy="98" r="14" fill="#fde68a" opacity=".6"/></g>'
    '<g class="kv-rozet-kotu">' + rozet(262,72,False) + T(262,56,'Çip bozuldu',11,'#b91c1c') + '</g>'
    '<g class="kv-rozet-iyi">' + rozet(262,72,True) + T(262,56,'Elektrik kasaya aktı',11,'#047857') + '</g>'
    '</svg>')
w('kivilcim.svg', kv)

# ── Adım 6: vida düzeni
def vida(x,y,s=1,cls=''): return '<g class="vida %s" transform="translate(%s %s) scale(%s)"><circle r="4.5" fill="#94a3b8" stroke="#64748b"/><path d="M-2.5 0h5M0 -2.5v5" stroke="#475569" stroke-width="1.2"/></g>' % (cls,x,y,s)
vd=('<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Etiketli parça kutusu: yan kapak vidaları 1 numaralı, disk vidaları 2 numaralı kaba gidiyor; masa düzenli" class="vd">'+bg('h4vd','#fef9f0','#fde7c7')+
    '<rect x="14" y="120" width="332" height="108" rx="12" fill="#e7d3b8"/>'
    '<rect x="30" y="134" width="200" height="84" rx="10" fill="#475569"/>'
    + ''.join('<rect x="%d" y="142" width="44" height="68" rx="7" fill="#64748b"/><rect x="%d" y="146" width="36" height="14" rx="3" fill="#fffbeb"/>' % (36+i*48, 40+i*48) for i in range(4))
    + T(58,157,'1 Kapak',8)+T(106,157,'2 Disk',8)+T(154,157,'3 Kablo',8)+T(202,157,'4 Küçük',8)
    + tornavida(246,196,-20,1.3)+kasa(260,18,0.85,True)
    + '<rect x="290" y="30" width="3" height="10" fill="#94a3b8"/><rect x="290" y="80" width="3" height="10" fill="#94a3b8"/>'
    + vida(300,36,1,'v1')+vida(300,86,1,'v2')+vida(56,196,1,'v0a')+vida(64,188,1,'v0b')+vida(102,194,1,'v0c')
    + '<g class="etiket-not"><rect x="30" y="24" width="150" height="70" rx="8" fill="#fff" stroke="#fbbf24" stroke-width="2"/>'+T(42,46,'1 · Söktüğün vidayı',11,anchor='start')+T(42,62,'   hemen kabına koy.',11,anchor='start')+T(42,82,'2 · Kabı etiketle.',11,anchor='start')+'</g>'
    + '</svg>')
w('vida-duzen.svg', vd)

# ── Doğru/yanlış mini sahneleri (240×150)
def mini(ad, aria, ic): w(ad, '<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s">%s%s</svg>' % (aria, bg(ad.replace('.svg','').replace('-',''),'#f8fafc','#e0f2fe',240,150,12), ic))
mini('dy-1.svg','Fişi prize takılı bilgisayarın kasası tornavidayla açılıyor',
     kasa(40,20,0.95)+tornavida(90,70,160,0.9)+'<path d="M97 118c30 0 60 10 90 -20" fill="none" stroke="#1f2937" stroke-width="3"/>'+priz(200,90,1.2)+fis(190,90,0.8)+simsek(160,50,1.2))
mini('dy-2.svg','Bellek modülü kısa kenarlarından iki parmakla tutuluyor', ram(60,55,1.0)+parmak(60,70,90)+parmak(180,70,-90))
mini('dy-3.svg','Antistatik bileklik bilekte, klipsi kasanın boyasız metal kısmına takılı',
     kasa(150,15,1.0,True)+'<rect x="146" y="80" width="6" height="16" fill="#cbd5e1"/>'+bileklik(55,95,1.4)+'<path d="M78 95c30 20 40 -10 66 -8" fill="none" stroke="#1f2937" stroke-width="2" stroke-dasharray="3 2"/>'+klips(128,88,1.2)+'<rect x="36" y="80" width="30" height="40" rx="12" fill="#e0a77a" opacity=".9"/>')
mini('dy-4.svg','Şişmiş telefon pili parmakla bastırılıyor', pil(90,20,1.1,True)+parmak(122,40,180,1.2)+'<g stroke="#ef4444" stroke-width="2"><path d="M150 30l10 -8M152 44l14 -2M150 58l10 8"/></g>')
mini('dy-5.svg','Sökülen vidalar etiketli kaba konuluyor',
     '<rect x="40" y="70" width="80" height="60" rx="8" fill="#64748b"/><rect x="46" y="76" width="68" height="14" rx="3" fill="#fffbeb"/>'+T(80,87,'Kapak vidaları',8)+vida(64,108)+vida(84,112)+vida(96,104)+
     '<path d="M170 40c-20 0-40 20-50 50" fill="none" stroke="#10b981" stroke-width="2.5" stroke-dasharray="5 4"/>'+vida(172,38,1.4)+parmak(190,40,-60))
mini('dy-6.svg','Güç kaynağının kapağı tornavidayla açılmaya çalışılıyor', psu(70,50,1.1)+tornavida(40,40,20,1.1)+simsek(180,40,1.3))

# ── Kural kartı ön yüz simgeleri (80×60)
def oz(ad, aria, ic, zemin='#e0f2fe'): w(ad, '<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="%s"><rect width="80" height="60" rx="10" fill="%s"/>%s</svg>' % (aria, zemin, ic))
oz('tehlike-elektrik.svg','Elektrik çarpması', priz(28,30,1.2)+simsek(56,30,1.5), '#fee2e2')
oz('tehlike-statik.svg','Statik elektrik', ram(10,34,0.5)+simsek(46,20,1.2), '#fef3c7')
oz('tehlike-daginik.svg','Dağınıklık', vida(20,40)+vida(40,24)+vida(58,44)+tornavida(8,16,15,0.6)+'<path d="M30 48l6 -4" stroke="#ef4444" stroke-width="2"/>', '#ede9fe')
oz('oz-1.svg','Kurallar', '<path d="M40 10l18 6v12c0 11-8 18-18 22-10-4-18-11-18-22V16z" fill="#10b981"/><path d="M32 30l6 6 11-11" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/>')
oz('oz-2.svg','Fişi çek', priz(52,30,1.2)+fis(26,30,1)+'<path d="M36 30h6" stroke="#10b981" stroke-width="3"/>')
oz('oz-3.svg','Statik', ram(8,36,0.55)+simsek(48,20,1.2))
oz('oz-4.svg','Bileklik', bileklik(30,30,1.2)+klips(52,40,1))
oz('oz-5.svg','Asla açma', psu(8,18,0.4)+pil(46,8,0.4)+kilit(62,40,1.1), '#fee2e2')
oz('oz-6.svg','Düzen', '<rect x="14" y="16" width="52" height="32" rx="6" fill="#64748b"/><rect x="18" y="20" width="20" height="24" rx="4" fill="#94a3b8"/><rect x="42" y="20" width="20" height="24" rx="4" fill="#94a3b8"/>'+vida(28,34,0.8)+vida(52,34,0.8))

# ── Derinleş
dr=('<svg viewBox="0 0 360 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Volt ölçeği: kıvılcımı hissetmek için yaklaşık 3000 volt gerekir; bazı çipler 100 volttan azıyla bozulur">'+bg('h4dr','#f5f3ff','#ede9fe')+
    T(180,30,'Hissettiğin ve hissetmediğin elektrik',13,'#5b21b6')+
    '<rect x="40" y="60" width="280" height="22" rx="11" fill="#e9d5ff"/><rect x="40" y="60" width="4" height="22" rx="2" fill="#ef4444"/>'
    '<rect x="40" y="110" width="280" height="22" rx="11" fill="#e9d5ff"/><rect x="40" y="110" width="170" height="22" rx="11" fill="#8b5cf6"/>'
    +T(48,54,'Bazı çipleri bozan: 100 volttan az',11,'#b91c1c',anchor='start')+T(48,104,'Hissetmen için: ≈ 3000 volt',11,'#5b21b6',anchor='start')
    +'<rect x="40" y="160" width="280" height="22" rx="11" fill="#e9d5ff"/><rect x="40" y="160" width="280" height="22" rx="11" fill="#6d28d9"/>'+T(48,154,'Kıvılcımı görmen için: çok daha fazla',11,'#4c1d95',anchor='start')
    +T(180,214,'Hissetmediğin küçük bir kıvılcım bile çipe zarar verebilir.',10,'#6d28d9')+'</svg>')
w('derinles.svg', dr)
