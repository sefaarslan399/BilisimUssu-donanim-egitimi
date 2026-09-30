# DON-201 H06 — İşlemci (Format K)
MODELLER = ['M-CPU', 'M-SOGUTUCU', 'M-FAN']

DERS = {
    'hafta': '6. Hafta',
    'baslik': 'İşlemci',
    'aciklama': 'İşlemcinin komutları nasıl işlediğini, çekirdeği, saat hızını ve neden soğutulduğunu keşfet.',
    'hedefler': [
        'İşlemcinin komutları sırayla işlediğini açıklayabileceğim.',
        'Çekirdek ve saat hızının (GHz) ne demek olduğunu örnekle anlatabileceğim.',
        'İşlemcinin neden ısındığını açıklayabileceğim.',
        'Soğutucunun ve termal macunun görevini eşleştirebileceğim.',
    ],
    'hedef_simgeler': [
        '<rect x="3" y="4" width="7" height="7" rx="1.5"/><rect x="14" y="4" width="7" height="7" rx="1.5"/><path d="M6.5 15v2.5h11V15"/><path d="M4 20h16"/>',
        '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/><path d="M12 9v3l2 2"/>',
        '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/><path d="M12 9v6"/>',
        '<rect x="4" y="3" width="16" height="4" rx="1"/><rect x="5" y="9" width="14" height="2" rx="1"/><rect x="4" y="13" width="16" height="3" rx="1"/><path d="M8 20h8"/>',
    ],
    'bolumler': [
        ['İşlemci ve Komutlar', 'Görevi, sırayla işleme'],
        ['Çekirdek ve GHz', 'Aşçı yarışı, saat hızı'],
        ['Isı ve Soğutma', 'Soğutucu, fan, termal macun'],
    ],
    'quiz': [
        {'q': 'Bir işlemci çekirdeği komutları nasıl işler?',
         'opts': ['Sırayla, birer birer', 'Hepsini aynı anda, tek hamlede', 'Rastgele bir sırayla', 'Yalnız en kısa komutu'], 'correct': 0,
         'fb': 'Çekirdek komutları tek tek, verildikleri sırayla yürütür. Sıranın değişmesi sonucu da değiştirir.'},
        {'q': 'Görselde soğutucu ile işlemci arasındaki ince gri katman nedir?<span class="q-gorsel"><!--@dahil:svg-quiz-macun.svg--></span>',
         'opts': ['Yapıştırıcı bant', 'Toz tabakası', 'Termal macun', 'Yalıtım köpüğü'], 'correct': 2,
         'fb': 'Termal macun, iki metal yüzey arasındaki mikroskobik boşlukları doldurur; ısı soğutucuya kolayca geçer.'},
        {'q': 'Ece’nin bilgisayarındaki işlemcinin saat hızı 3 GHz. Bu ne demektir?',
         'opts': ['İşlemcinin 3 çekirdeği vardır', 'Saniyede 3 milyar saat vuruşu yapar', 'Saniyede yalnız 3 komut işler', 'İşlemci 3 GB bellek taşır'], 'correct': 1,
         'fb': 'GHz, saniyedeki saat vuruşu sayısıdır: 3 GHz, saniyede 3 milyar vuruş demektir. Çekirdek sayısı ayrı bir özelliktir.'},
        {'q': 'Deniz oyun oynarken bilgisayarı birden yavaşlıyor. Kasanın camından bakınca işlemci fanının durduğunu görüyor. En olası neden nedir?',
         'opts': ['Oyunun renkleri çok canlı', 'İşlemci soğuk kaldığı için yavaşladı', 'RAM ekranı ısıttı', 'İşlemci ısındı ve kendini korumak için yavaşladı'], 'correct': 3,
         'fb': 'Fan durunca ısı uzaklaşamaz. İşlemci aşırı ısınınca kendini korumak için yavaşlar; bir yetişkine haber verilir.'},
        {'q': 'Derinleş (bonus): Çoğu telefonda işlemci için fan olmamasının nedeni nedir?',
         'opts': ['Telefon işlemcisi az enerji harcar, az ısınır', 'Telefon işlemcisi hiç ısınmaz', 'Telefonun içinde hava yoktur', 'Telefon işlemcisinin çekirdeği yoktur'], 'correct': 0,
         'fb': 'Telefon çipleri pil uzun gitsin diye az enerji harcayacak biçimde yapılır; bu yüzden az ısınır. Bu soru puanını düşürmez.'},
    ],
    'bitis': 'Artık işlemcinin komutları nasıl işlediğini ve neden soğutulması gerektiğini biliyorsun!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'İşlemci, üstündeki kule tipi soğutucu ve dönen fan', 'yedek': 'yedek-sogutucu.svg'}

FOTO_CPU = '<div class="foto-kart"><!--@foto:DON-201-H06-islemci-ust-alt.jpg|Gerçek bir işlemcinin üst ve alt yüzü--><span>Gerçekte</span></div>'
FOTO_SOG = '<div class="foto-kart"><!--@foto:DON-201-H06-sogutucu-fan.jpg|Kule tipi işlemci soğutucusu ve fanı--><span>Gerçekte</span></div>'

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Soğutucuyu Kaldırırsak?',
     'desc': 'Bilgisayar çalışırken işlemcinin üstünde büyük bir soğutucu durur. Onu kaldırırsak sence ne olur?',
     'secenekler': ['Hiçbir şey olmaz; soğutucu süs içindir.', 'İşlemci çok ısınır; yavaşlar ya da bilgisayar kapanır.', 'İşlemci daha hızlı çalışmaya başlar.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'adim', 'no': 1, 'ad': 'İşlemcinin Görevi', 'etiket': 'ADIM 1 · GÖREV',
     'ikon': '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
     'title': 'Bilgisayarın Hesap Merkezi',
     'desc': '<strong>İşlemci</strong>, programların verdiği komutları işleyen parçadır. Hesap yapar, karşılaştırır, karar verir. Kısa adı <strong>CPU</strong>’dur. Anakarttaki yuvasına takılır.',
     'tip': ['👆', 'Parçalara dokun. İşlemciyi çevirip alt yüzüne de bak.'],
     'gorsel': {'3d': 's4-3d', 'aria': 'İşlemci: üstte metal kapak ve köşe üçgeni, altta altın temas pedleri; parçalara dokununca bilgi kartı açılır',
                'yedek': 'yedek-cpu.svg', 'ust': FOTO_CPU}},

    {'tur': 'adim', 'no': 2, 'ad': 'Komut Komut Çalışma', 'etiket': 'ADIM 2 · SIRAYLA',
     'ikon': '<rect x="3" y="4" width="7" height="7" rx="1.5"/><rect x="14" y="4" width="7" height="7" rx="1.5"/><path d="M6.5 15v2.5h11V15"/><path d="M4 20h16"/>',
     'title': 'Komutlar Sırayla İşlenir',
     'desc': 'Her program küçük <strong>komutlardan</strong> oluşur. İşlemci bu komutları sırayla, birer birer işler. Sıra değişirse sonuç da değişir.',
     'tip': ['🔢', 'Önce Adım adım ile ilerle. Sonra sırayı değiştirip yeniden oynat.'],
     'genis': True,
     'gorsel': {'2d': 'kuyruk'}},

    {'tur': 'adim', 'no': 3, 'ad': 'Çekirdek', 'etiket': 'ADIM 3 · ÇEKİRDEK',
     'ikon': '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="7" y="7" width="4" height="4"/><rect x="13" y="7" width="4" height="4"/><rect x="7" y="13" width="4" height="4"/><rect x="13" y="13" width="4" height="4"/>',
     'title': 'Bir Aşçı mı, Dört Aşçı mı?',
     'desc': 'İşlemcinin içindeki her <strong>çekirdek</strong>, mutfaktaki bir aşçı gibidir. Dört aşçı işleri paylaşırsa yemekler daha çabuk biter. Dört çekirdek de işleri böyle paylaşır.',
     'tip': ['🍳', 'Çok çekirdek, iş bölünebildiğinde hızlandırır.'],
     'genis': True,
     'gorsel': {'2d': 'yaris'}},

    {'tur': 'adim', 'no': 4, 'ad': 'Saat Hızı (GHz)', 'etiket': 'ADIM 4 · SAAT HIZI',
     'ikon': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
     'title': 'İşlemcinin Kalp Atışı',
     'desc': 'İşlemci bir saatin vuruşlarına göre çalışır; bu vuruşlar kalp atışına benzer. <strong>1 GHz</strong>, saniyede 1 milyar vuruş demektir. Saat hızı artınca işler hızlanır ama işlemci daha çok ısınır.',
     'tip': ['🎚️', 'Sürgüyü kaydır: bant hızlanıyor mu, ısı artıyor mu?'],
     'genis': True,
     'gorsel': {'2d': 'ghz'}},

    {'tur': 'adim', 'no': 5, 'ad': 'Isınma ve Soğutucu', 'etiket': 'ADIM 5 · ISINMA',
     'ikon': '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/><path d="M12 9v6"/>',
     'title': 'Neden Isınır, Nasıl Soğur?',
     'desc': 'İşlemcide milyarlarca küçük elektrik anahtarı vardır. Çalışırken elektrik harcar ve ısınır. <strong>Soğutucu</strong> bu ısıyı alır; <strong>fan</strong> ısıyı havayla uzaklaştırır.',
     'tip': ['🌡️', 'Soğutucuyu kaldır. Termometreyi ve işlemcinin rengini izle.'],
     'gorsel': {'3d': 's8-3d', 'aria': 'Anakarttaki işlemci ve soğutucu; soğutucu kaldırılınca işlemcinin rengi maviden kırmızıya döner, termometre yükselir',
                'yedek': 'yedek-sogutucu.svg', 'ust': FOTO_SOG}},

    {'tur': 'adim', 'no': 6, 'ad': 'Termal Macun', 'etiket': 'ADIM 6 · MACUN',
     'ikon': '<rect x="4" y="3" width="16" height="4" rx="1"/><rect x="5" y="9" width="14" height="2" rx="1"/><rect x="4" y="13" width="16" height="3" rx="1"/><path d="M8 20h8"/>',
     'title': 'Görünmez Boşlukları Doldur',
     'desc': 'Metal yüzeyler düz görünür ama mikroskopta pürüzlüdür. Aradaki boşluklarda <strong>hava</strong> kalır; hava ısıyı iyi iletmez. <strong>Termal macun</strong> bu boşlukları doldurur. İnce bir katman yeter.',
     'tip': ['🔬', 'Katmanları ayır. Sonra mikroskopla yakından bak.'],
     'gorsel': {'3d': 's9-3d', 'aria': 'Patlatma görünümü: soğutucu, termal macun ve işlemci ayrılıyor; mikroskop görünümünde boşluklar',
                'yedek': 'yedek-patlat.svg'}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Çekirdek Yarışı',
     'title': 'Çekirdek Yarışı',
     'desc': 'Her turda önce tahmin et: hangisi önce bitirir? Sonra yarışı izle.',
     'tip': ['💡', 'Her küçük iş 1 saniye sürer. Bir işi iki aşçı birlikte yapamaz.'],
     'ek': '<ol class="gorevler" id="gorevler-1">'
           '<li><span class="g-isaret"></span><span><strong>Tur 1:</strong> 8 küçük iş</span></li>'
           '<li><span class="g-isaret"></span><span><strong>Tur 2:</strong> 1 büyük iş</span></li>'
           '<li><span class="g-isaret"></span><span><strong>Tur 3:</strong> 12 küçük iş</span></li></ol>'
           '<div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Doğru tahmin</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 3</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'yaris-etk'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Isı Deneyi',
     'title': 'Isı Deneyi: Soğutucu, Macun, Fan',
     'desc': 'Oyun açık; işlemci çok çalışıyor. Düğmelerle soğutucuyu, macunu ve fanı değiştir. Termometreyi izle.',
     'tip': ['⏳', 'Her değişiklikten sonra sıcaklığın durulmasını bekle.'],
     'ek': '<ol class="gorevler" id="gorevler-2">'
           '<li><span class="g-isaret"></span><span><strong>Soğutucuyu kaldır:</strong> ne kadar ısınıyor?</span></li>'
           '<li><span class="g-isaret"></span><span><strong>Macunu sil</strong>, soğutucuyu tak.</span></li>'
           '<li><span class="g-isaret"></span><span><strong>Macun sür</strong>, soğutucuyu tak.</span></li>'
           '<li><span class="g-isaret"></span><span><strong>Fanı durdur</strong> ve izle.</span></li></ol>'
           '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Tamamlanan deney</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 4</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'3d': 's11-3d', 'aria': 'Isı deneyi: soğutucu, termal macun ve fan değiştirildikçe işlemcinin sıcaklığı termometrede değişir',
                'yedek': 'yedek-sogutucu.svg', 'yedek_metin': 'Bu cihazda 3D açılmadı. Soğutucu takılıyken işlemci normal sıcaklıktadır; soğutucu, macun ya da fan olmazsa ısınır.'}},

    {'tur': 'derinles', 'ad': 'Telefon İşlemcisi',
     'title': 'Telefon mu, Bilgisayar mı?',
     'desc': 'Telefonun işlemcisi, grafik ve modem gibi birimlerle <strong>tek bir çipte</strong> birleşir. Buna <strong>SoC</strong> (yonga üzerinde sistem) denir. Az enerji harcar; çoğu telefonda fan yoktur. Bilgisayar işlemcisi daha çok enerji harcar ve daha güçlüdür; soğutucu ve fan ister.',
     'tip': ['🔎', 'Telefon çok ısınınca işlemci kendini yavaşlatır.'],
     'gorsel': {'svg': 'derinles.svg'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'İşlemci', 'Komutları işler, hesap yapar.'),
        ('oz-2.svg', 'Sırayla', 'Komutlar birer birer işlenir.'),
        ('oz-3.svg', 'Çekirdek', 'Her çekirdek bir aşçı gibi.'),
        ('oz-4.svg', 'Saat Hızı', '1 GHz = saniyede 1 milyar vuruş.'),
        ('oz-5.svg', 'Soğutucu', 'Isıyı alır; fan uzaklaştırır.'),
        ('oz-6.svg', 'Termal Macun', 'Boşlukları doldurur; ince katman.'),
    ]},
]
