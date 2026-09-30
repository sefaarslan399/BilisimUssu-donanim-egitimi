# DON-201 H07 — RAM (Format K)
MODELLER = ['M-RAM', 'M-RAM-YUVASI', 'M-MASA-DOLAP']

DERS = {
    'hafta': '7. Hafta',
    'baslik': 'RAM',
    'aciklama': 'Bilgisayarın çalışma masasını tanı: RAM ne işe yarar, neden geçicidir, kapasitesi neden önemlidir?',
    'hedefler': [
        'RAM’in görevini çalışma masası benzetmesiyle açıklayabileceğim.',
        'RAM’in geçici olduğunu ve elektrik kesilince silindiğini açıklayabileceğim.',
        'RAM kapasitesinin (GB) bilgisayarın hızına etkisini örnekle anlatabileceğim.',
        'RAM modülünü çentiğinden ve altın temaslarından tanıyabileceğim.',
    ],
    'hedef_simgeler': [
        '<rect x="2" y="9" width="20" height="3" rx="1"/><path d="M5 12v8M19 12v8"/><rect x="7" y="5" width="5" height="4" rx="0.5"/>',
        '<polygon points="13 2 4 14 11 14 10 22 20 9 13 9 13 2"/>',
        '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
        '<rect x="2" y="7" width="20" height="10" rx="1"/><path d="M5 17v3M8 17v3M16 17v3M19 17v3"/><path d="M12 17v-2"/>',
    ],
    'bolumler': [
        ['Bellek ve Masa', 'Bellek nedir, çalışma masası'],
        ['Geçici ve Kapasite', 'Kaydetmek, GB, RAM yetmezse'],
        ['RAM Modülü', 'Çentik ve altın temaslar'],
    ],
    'quiz': [
        {'q': 'Bilgisayarda RAM’in görevi nedir?',
         'opts': ['Çalışan programları ve açık dosyaları geçici olarak tutmak', 'Dosyaları kalıcı olarak saklamak', 'Görüntüyü ekrana göndermek', 'Parçalara elektrik dağıtmak'], 'correct': 0,
         'fb': 'RAM bilgisayarın çalışma masasıdır: o an açık olan işleri tutar. Kalıcı saklama depolamanın işidir.'},
        {'q': 'Görselde okla gösterilen boşluğun adı nedir?<span class="q-gorsel"><!--@dahil:svg-quiz-centik.svg--></span>',
         'opts': ['Soğutucu', 'Etiket', 'Çentik', 'Bellek çipi'], 'correct': 2,
         'fb': 'Altın temasların arasındaki boşluk çentiktir. Ortada değil, biraz yandadır; RAM yuvaya tek yönde girer.'},
        {'q': 'Ece ödevini yazarken elektrik kesildi. Dosyayı hiç kaydetmemişti. Bilgisayar açılınca ne görür?',
         'opts': ['Ödevi olduğu gibi durur', 'Kaydetmediği yazılar kaybolmuştur', 'Ödev RAM’de saklanmıştır', 'Ödev kendiliğinden diske geçmiştir'], 'correct': 1,
         'fb': 'Kaydedilmemiş yazılar RAM’deydi; elektrik gidince silindi. Bazı programlar otomatik kaydeder ama buna güvenme, sık sık kaydet.'},
        {'q': 'Deniz’in bilgisayarında 4 GB RAM var. Oyun, tarayıcı ve müzik birlikte açıkken bilgisayar çok yavaşlıyor. Hangisi en çok işe yarar?',
         'opts': ['Monitörü değiştirmek', 'Daha büyük bir disk takmak', 'Klavyeyi temizlemek', 'Bazı programları kapatmak ya da RAM’i artırmak'], 'correct': 3,
         'fb': 'Masa küçük olduğu için dosyalar dolaba gidip geliyor. Programları azaltmak ya da RAM kapasitesini artırmak bu beklemeyi azaltır.'},
        {'q': 'Derinleş (bonus): Görev Yöneticisi’nde bellek kullanımı %95 görünüyor. Bu ne anlama gelir?',
         'opts': ['RAM neredeyse dolmuş; bilgisayar yavaşlayabilir', 'Diskte hiç boş yer kalmamış', 'İşlemci en yüksek hızında çalışıyor', 'Bilgisayarın pili %95 dolu'], 'correct': 0,
         'fb': 'Bellek yüzdesi RAM’in ne kadarının dolu olduğunu gösterir. Dolmaya yaklaşınca bilgisayar yavaşlar. Bu soru puanını düşürmez.'},
    ],
    'bitis': 'Artık RAM’i çalışma masasına benzetebiliyor, çalışmanı kaydetmeyi unutmuyor ve RAM modülünü çentiğinden tanıyorsun!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'Bir RAM modülü yavaşça dönüyor; arkasında çalışma masası ve dosya dolabı', 'yedek': 'yedek-ram.svg'}

FOTO_RAM = '<div class="foto-kart"><!--@foto:DON-201-H07-ram-modulu.jpg|Masaüstü bilgisayarın RAM modülü (DDR4)--><span>Gerçekte</span></div>'
TERIM_RAM = ('<div class="terim-kart"><b>RAM</b><span><em>Random Access Memory</em> · Rastgele Erişimli Bellek: '
             'İstediği bilgiye sırayla aramadan, doğrudan ulaşır.</span></div>')
YEDEK_MASA = 'Bu cihazda 3D açılmadı. Çizimde masa RAM’i, dolap depolamayı gösteriyor.'

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Elektrik Kesilirse Ne Olur?',
     'desc': 'Ödevini bilgisayarda yazıyorsun. Henüz kaydetmedin. Birden elektrik kesiliyor. Sence yazdıkların ne olur?',
     'secenekler': ['Hepsi olduğu gibi durur; bilgisayar hatırlar.', 'Kaydetmediğim kısım kaybolur.', 'Bilgisayar kapanırken yazıları kendiliğinden saklar.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'adim', 'no': 1, 'ad': 'Bellek Nedir?', 'etiket': 'ADIM 1 · BELLEK',
     'ikon': '<rect x="2" y="7" width="20" height="10" rx="1"/><path d="M6 17v3M10 17v3M14 17v3M18 17v3"/><rect x="5" y="9.5" width="3" height="4"/><rect x="10.5" y="9.5" width="3" height="4"/><rect x="16" y="9.5" width="3" height="4"/>',
     'title': 'Bilgisayar da Hatırlamalı',
     'desc': '<strong>Bellek</strong>, bilgisayarın bilgiyi tuttuğu yerdir. <strong>RAM</strong>, o an çalışan işlerin bilgisini tutar. İşlemci bu bilgiye RAM’den çok hızlı ulaşır.',
     'tip': ['▶️', 'Bir uygulama seç: bilgi nereden nereye gidiyor, izle.'],
     'ek': TERIM_RAM,
     'genis': True,
     'gorsel': {'2d': 'bellek-akis'}},

    {'tur': 'adim', 'no': 2, 'ad': 'Çalışma Masası', 'etiket': 'ADIM 2 · MASA',
     'ikon': '<rect x="2" y="9" width="20" height="3" rx="1"/><path d="M5 12v8M19 12v8"/><rect x="7" y="5" width="5" height="4" rx="0.5"/>',
     'title': 'RAM: Bilgisayarın Çalışma Masası',
     'desc': 'Dolap, dosyaların saklandığı <strong>depolamadır</strong>. Masa ise <strong>RAM</strong>’dir. Bir uygulamayı açınca dosyası dolaptan masaya gelir; işlemci masadakilerle çalışır.',
     'tip': ['📂', 'Bir uygulama aç: dosyası dolaptan masaya gelsin.'],
     'gorsel': {'3d': 's5-3d', 'aria': 'Çalışma masası ve dosya dolabı: açılan her uygulamanın dosyası dolaptan masaya geliyor', 'yedek': 'yedek-masa.svg', 'yedek_metin': YEDEK_MASA}},

    {'tur': 'adim', 'no': 3, 'ad': 'Geçici Bellek: Kaydetmeyi Unutma', 'etiket': 'ADIM 3 · GEÇİCİ',
     'ikon': '<polygon points="13 2 4 14 11 14 10 22 20 9 13 9 13 2"/>',
     'title': 'Elektrik Gidince Masa Boşalır',
     'desc': 'RAM <strong>geçici</strong> bellektir: elektrik kesilince içi silinir. Depolama ise <strong>kalıcıdır</strong>. <strong>Kaydetmek</strong>, dosyayı dolaba koymaktır; bu yüzden sık sık kaydet.',
     'tip': ['💾', 'Önce kaydetmeden elektriği kes. Sonra kaydedip tekrar dene.'],
     'gorsel': {'3d': 's6-3d', 'aria': 'Elektrik kesiliyor: masadaki dosyalar kayboluyor, dolaba kaydedilen dosya kalıyor', 'yedek': 'yedek-masa.svg', 'yedek_metin': YEDEK_MASA}},

    {'tur': 'adim', 'no': 4, 'ad': 'Kapasite (GB)', 'etiket': 'ADIM 4 · KAPASİTE',
     'ikon': '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
     'title': 'Masa Ne Kadar Büyük?',
     'desc': 'RAM’in büyüklüğüne <strong>kapasite</strong> denir. Kapasite <strong>GB</strong> (gigabayt) ile ölçülür; 1 GB yaklaşık 1 milyar bayttır. Kapasite büyüdükçe aynı anda daha çok uygulama sığar.',
     'tip': ['🎚️', 'Sürgüyle RAM’i seç, uygulamaları aç: kaçı sığıyor?'],
     'genis': True,
     'gorsel': {'2d': 'kapasite'}},

    {'tur': 'adim', 'no': 5, 'ad': 'RAM Yetmezse', 'etiket': 'ADIM 5 · YETMEZSE',
     'ikon': '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 2h6"/>',
     'title': 'Masa Küçükse Beklersin',
     'desc': 'Masa doluysa yeni dosyaya yer açmak için eski dosya dolaba gider. Ona yeniden gerekince geri gelir. Bu gidip gelmeler zaman alır; bilgisayar <strong>yavaşlar</strong>.',
     'tip': ['⏳', 'Oynat: iki masanın bekleme çubuklarını karşılaştır.'],
     'genis': True,
     'gorsel': {'2d': 'yavasla'}},

    {'tur': 'adim', 'no': 6, 'ad': 'RAM Modülünü Tanı', 'etiket': 'ADIM 6 · MODÜL',
     'ikon': '<rect x="2" y="7" width="20" height="10" rx="1"/><path d="M5 17v3M8 17v3M16 17v3M19 17v3"/><path d="M12 17v-2"/>',
     'title': 'Çentiğe Bak, RAM’i Tanı',
     'desc': 'RAM modülü, üzerinde <strong>bellek çipleri</strong> olan ince bir karttır. Alt kenarda <strong>altın temaslar</strong> vardır. Aradaki boşluk <strong>çentiktir</strong>: ortada değil, biraz yandadır ve RAM’in yuvaya tek yönde girmesini sağlar.',
     'tip': ['🔄', 'Modeli döndür; düğmelerle parçaları vurgula.'],
     'gorsel': {'3d': 's9-3d', 'aria': 'RAM modülü dönüyor; çentik ve altın temaslar vurgulanıyor, yuvaya doğru yönde iniyor', 'yedek': 'yedek-ram.svg', 'ust': FOTO_RAM}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Masa Büyüklüğü Deneyi',
     'title': 'Masa Büyüklüğü Deneyi',
     'desc': 'Sürgüyle RAM’i seç. <strong>Deneyi başlat</strong>: aynı uygulamalar açılır, sonra oyuna geri dönülür. Dolaba gidiş-gelişleri say.',
     'tip': ['🔬', 'Üç kapasiteyi de dene ve sonuçları karşılaştır.'],
     'ek': '<div class="surgu" id="surgu-deney"></div>'
           '<table class="deney-tablo" id="deney-tablo" aria-live="polite"><thead><tr><th>RAM</th><th>Gidiş-geliş</th><th>Sonuç</th></tr></thead><tbody>'
           '<tr data-gb="4"><td>4 GB</td><td>–</td><td>–</td></tr><tr data-gb="8"><td>8 GB</td><td>–</td><td>–</td></tr>'
           '<tr data-gb="16"><td>16 GB</td><td>–</td><td>–</td></tr></tbody></table>'
           '<div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Denenen kapasite</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 3</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'3d': 's10-3d', 'aria': 'Etkinlik: seçilen RAM kapasitesine göre masa büyüyor; uygulamalar açılınca dosyalar dolaba gidip geliyor', 'yedek': 'yedek-masa.svg',
                'yedek_metin': YEDEK_MASA}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Elektrik Kesilince Ne Kalır?',
     'title': 'Kesintiden Sonra Ne Kalır?',
     'desc': 'Her kartı doğru kutuya yerleştir: elektrik kesilince <strong>kaybolur</strong> mu, <strong>kalır</strong> mı? Bitince elektriği kes ve sonucu izle.',
     'tip': ['💡', 'Kaydedilmemiş her şey RAM’dedir.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Yerleşen kart</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 8</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'sinifla-guc'}},

    {'tur': 'derinles', 'ad': 'Görev Yöneticisi',
     'title': 'RAM Kullanımını İzle',
     'desc': '<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Esc</kbd> tuşlarına birlikte basınca <strong>Görev Yöneticisi</strong> açılır. Burada her programın ne kadar RAM kullandığını görürsün. Bellek dolmaya yaklaşınca bilgisayar yavaşlar.',
     'tip': ['🔎', 'Uygulamaları aç, kapat; bellek grafiğini izle.'],
     'genis': True,
     'gorsel': {'2d': 'gorev-yon', 'koyu': True}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'Bellek', 'RAM çalışan işlerin bilgisini tutar.'),
        ('oz-2.svg', 'Masa', 'RAM masa, depolama dolaptır.'),
        ('oz-3.svg', 'Geçici', 'Elektrik gidince RAM silinir: kaydet!'),
        ('oz-4.svg', 'Kapasite', 'GB büyüdükçe masa büyür.'),
        ('oz-5.svg', 'Yetmezse', 'Dosyalar gidip gelir, bilgisayar yavaşlar.'),
        ('oz-6.svg', 'Modül', 'Çentik ve altın temaslardan tanı.'),
    ]},
]
