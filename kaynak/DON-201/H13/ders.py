# DON-201 H13 — Basit Sorun Giderme ve Bakım (Format K+U)
MODELLER = ['M-MASAUSTU', 'M-MONITOR', 'M-FAN', 'M-GUC-FISI', 'M-KABLO-UCLARI']

DERS = {
    'hafta': '13. Hafta',
    'baslik': 'Basit Sorun Giderme ve Bakım',
    'aciklama': 'Bilgisayar açılmıyor mu, ekran karanlık mı? En basit kontrolden başla, sorunu bul ve bilgisayarını tozdan koru.',
    'hedefler': [
        'Bir sorunda en basit kontrolden başlayabileceğim.',
        '“Açılmıyor”, “görüntü yok” ve “ses yok” durumlarında kontrolleri sırayla yapabileceğim.',
        'Yavaşlamanın ve ısınmanın olası nedenlerini sıralayabileceğim.',
        'Düzenli bakım adımlarını güvenle uygulayabileceğim.',
    ],
    'hedef_simgeler': [
        '<path d="M3 20h5v-5h5v-5h5V5h3"/>',
        '<path d="M12 2v8"/><path d="M6.4 6.4a8 8 0 1 0 11.2 0"/>',
        '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/><path d="M12 9v6"/>',
        '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
    ],
    'bolumler': [
        ['Önce Basit Olan', 'Kolaydan zora kontrol sırası'],
        ['Arıza Durumları', 'Açılmıyor, görüntü, ses, fare'],
        ['Isınma ve Bakım', 'Toz, fan, güvenli temizlik'],
    ],
    'quiz': [
        {'q': 'Bilgisayarında bir sorun çıktı. İşe nereden başlarsın?',
         'opts': ['En basit ve en kolay kontrolden', 'Kasayı hemen açmaktan', 'Tüm kabloları sökmekten', 'Yeni bir parça almaktan'], 'correct': 0,
         'fb': 'Önce takılı mı, açık mı gibi kolay kontroller yapılır. Birçok sorun bu basamaklarda çözülür.'},
        {'q': 'Ece’nin bilgisayarında kasanın ışığı yanıyor ama ekran karanlık. Görselde monitörün ışığı da sönük. Ece önce ne yapmalı?<span class="q-gorsel"><!--@dahil:svg-quiz-monitor.svg--></span>',
         'opts': ['Kasayı açıp ekran kartını sökmeli', 'Klavyeyi değiştirmeli', 'Monitörün güç düğmesine basmalı', 'Bilgisayarı yeniden kurmalı'], 'correct': 2,
         'fb': 'Monitörün ışığı sönükse monitör kapalı olabilir. Önce onun düğmesine basılır; sonra kablo ve giriş kontrol edilir.'},
        {'q': 'Deniz’in bilgisayarı son aylarda çok ısınıyor ve yavaşladı. Hava deliklerinde gri tüyler var. En olası neden nedir?',
         'opts': ['Ekran parlaklığı çok yüksek', 'Fana ve hava deliklerine toz birikmiş', 'Klavyede çok tuşa basılıyor', 'Monitör kablosu çok uzun'], 'correct': 1,
         'fb': 'Toz fanı zorlar ve hava yolunu kapatır. Isı atılamaz; bilgisayar ısınır ve kendini yavaşlatır.'},
        {'q': 'Fanın tozu alınırken hangisi doğrudur?',
         'opts': ['Bilgisayar çalışırken fana hava sıkılır', 'Fan hızla dönsün diye serbest bırakılır', 'Fan ıslak bezle ovularak silinir', 'Fiş çekilir, fan tutularak kısa kısa hava sıkılır'], 'correct': 3,
         'fb': 'Fiş çekili olmalı. Fan parmakla tutulur, böylece serbestçe dönüp zarar görmez. Bu işi bir yetişkinle yaparsın.'},
        {'q': 'Derinleş (bonus): Bilgisayar açılırken alışılmadık bip sesleri çıkarıyor. Anlamını nereden öğrenirsin?',
         'opts': ['Anakartın ya da bilgisayarın kılavuzundan', 'Her bilgisayarda aynı anlama gelir, ezberlenir', 'Bip sesi her zaman hoparlörün bozuk olduğunu gösterir', 'Bip sesleri hiçbir şey anlatmaz'], 'correct': 0,
         'fb': 'Bip dizilerinin anlamı üreticiye göre değişir. Doğru bilgi kılavuzda ya da üreticinin sayfasındadır. Bu soru puanını düşürmez.'},
    ],
    'bitis': 'Artık bir arızada en basitten başlayıp sorunu bulabilir, bilgisayarını tozdan güvenle koruyabilirsin!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'Masaüstü kasa, monitör ve tozlu bir kasa fanı', 'yedek': 'yedek-kapak.svg'}

FOTO_TOZ = '<div class="foto-kart"><!--@foto:DON-201-H13-fan-tozlu-temiz.jpg|Tozlu ve temizlenmiş kasa fanı yan yana--><span>Gerçekte</span></div>'
FOTO_TEMIZ = '<div class="foto-kart"><!--@foto:DON-201-H13-fan-tutarak-temizlik.jpg|Fan parmakla tutulurken basınçlı havayla temizleniyor, fiş çekili--><span>Gerçekte</span></div>'

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Bilgisayar Açılmıyor!',
     'desc': 'Ece sabah bilgisayarının düğmesine bastı. Hiçbir ışık yanmadı, ekran karanlık kaldı. Sence Ece önce ne yapmalı?',
     'secenekler': ['Kasayı açıp parçaları tek tek kontrol etmeli.', 'Fişin ve kabloların takılı olduğuna bakmalı.', 'Hemen yeni bir bilgisayar istemeli.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'adim', 'no': 1, 'ad': 'Önce Basit Olan', 'etiket': 'ADIM 1 · ÖNCE BASİT',
     'ikon': '<path d="M3 20h5v-5h5v-5h5V5h3"/>',
     'title': 'Kolaydan Zora Git',
     'desc': 'Bir sorun olunca önce en kolay kontrolü yap: <strong>takılı mı, açık mı?</strong> Bu kontroller birkaç saniye sürer. Kasayı açmak en son çaredir ve yetişkin işidir.',
     'tip': ['⏱️', 'Yarışı izle: iki öğrenciden hangisi sorunu daha çabuk buluyor?'],
     'genis': True,
     'gorsel': {'2d': 'basit'}},

    {'tur': 'adim', 'no': 2, 'ad': 'Açılmıyor', 'etiket': 'ADIM 2 · AÇILMIYOR',
     'ikon': '<path d="M12 2v8"/><path d="M6.4 6.4a8 8 0 1 0 11.2 0"/>',
     'title': 'Düğmeye Bastım, Hiçbir Şey Olmadı',
     'desc': 'Önce <strong>güç ışığına</strong> bak: ışık yoksa elektrik gelmiyor olabilir. Sonra <strong>fişi ve prizi</strong> kontrol et. En son <strong>güç düğmesine</strong> yeniden bas.',
     'tip': ['🔌', 'Kontrolleri 1, 2, 3 sırasıyla yap. Doğru noktada bilgisayar canlanır.'],
     'gorsel': {'3d': 's5-3d', 'aria': 'Kasa, monitör ve priz: fiş prizden çıkmış; güç ışığı, fiş ve güç düğmesi sırayla kontrol edilince bilgisayar açılıyor',
                'yedek': 'yedek-acilmiyor.svg'}},

    {'tur': 'adim', 'no': 3, 'ad': 'Görüntü Yok', 'etiket': 'ADIM 3 · GÖRÜNTÜ YOK',
     'ikon': '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M9 8l6 5M15 8l-6 5"/>',
     'title': 'Kasa Çalışıyor, Ekran Karanlık',
     'desc': 'Kasa çalışıyorsa sorun görüntü yolundadır. Önce <strong>monitörün ışığına</strong> bak; sonra <strong>doğru giriş</strong> seçili mi, kontrol et. En son <strong>kablonun iki ucuna</strong> bak.',
     'tip': ['🖥️', 'Kontrol noktalarına sırayla dokun. Kamera kablonun ucuna gider.'],
     'gorsel': {'3d': 's6-3d', 'aria': 'Çalışan kasa ve Sinyal yok yazan monitör; monitör ışığı, giriş seçimi ve görüntü kablosu kontrol edilince görüntü geliyor',
                'yedek': 'yedek-goruntu.svg'}},

    {'tur': 'adim', 'no': 4, 'ad': 'Ses Yok, Fare Çalışmıyor', 'etiket': 'ADIM 4 · SES VE FARE',
     'ikon': '<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>',
     'title': 'Aynı Yöntem, Farklı Arıza',
     'desc': '<strong>Ses yoksa:</strong> ses düzeyi, hoparlörün düğmesi, sonra kablosu. <strong>Fare çalışmıyorsa:</strong> pili ve düğmesi, sonra alıcısı ya da kablosu. Kolaydan zora git.',
     'tip': ['🔊', 'Arızayı seç. Kontrolleri 1’den başlayarak yap.'],
     'genis': True,
     'gorsel': {'2d': 'ses-fare'}},

    {'tur': 'adim', 'no': 5, 'ad': 'Yavaşlama ve Isınma', 'etiket': 'ADIM 5 · ISINMA',
     'ikon': '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/><path d="M12 9v6"/>',
     'title': 'Toz Birikirse Ne Olur?',
     'desc': 'Aylar içinde fana ve hava deliklerine <strong>toz</strong> birikir. Fan zorlanır, sıcak hava dışarı atılamaz. Bilgisayar ısınır ve kendini korumak için <strong>yavaşlar</strong>.',
     'tip': ['🌡️', 'Aylar geçsin: fan hızını ve termometreyi izle.'],
     'ek': '<div class="neden-liste" aria-label="Yavaşlamanın olası nedenleri"><b>Yavaşlamanın olası nedenleri:</b>'
           '<span>🌡️ Toz ve ısınma</span><span>🗂️ Aynı anda çok program</span><span>💾 Dolmuş depolama</span><span>🚫 Kapalı hava delikleri</span></div>',
     'gorsel': {'3d': 's8-3d', 'aria': 'Kasa fanı: aylar geçtikçe toz birikiyor, fan yavaşlıyor, termometre yükseliyor',
                'yedek': 'yedek-toz.svg', 'ust': FOTO_TOZ}},

    {'tur': 'adim', 'no': 6, 'ad': 'Toz Temizliği ve Bakım', 'etiket': 'ADIM 6 · BAKIM',
     'ikon': '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
     'title': 'Güvenli Toz Temizliği',
     'desc': 'Temizliği <strong>bir yetişkinle</strong> ve <strong>fiş çekiliyken</strong> yap. Fanı parmağınla <strong>tut</strong> ki serbest dönmesin. <strong>Basınçlı hava</strong> kutusuyla tozu <strong>kısa kısa</strong> üfle.',
     'tip': ['🧹', 'Adımları sırayla uygula. Sıra bozulursa uyarı gelir.'],
     'gorsel': {'3d': 's9-3d', 'aria': 'Fiş çekiliyor, fan parmakla tutuluyor, basınçlı hava tozu uçuruyor; temizlenen fan normal hızına döner, sıcaklık düşer',
                'yedek': 'yedek-temizlik.svg', 'ust': FOTO_TEMIZ}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Arıza Teşhis Oyunu',
     'title': 'Arıza Teşhis Oyunu',
     'desc': 'Her vakada belirtiyi oku. Kontrol düğmelerine basarak sorunu bul. <strong>En basitten başlarsan</strong> yıldız kazanırsın.',
     'tip': ['⭐', 'Kolay kontrolleri bitirmeden orta kontrole geçme. Kasayı açmak yetişkin işidir.'],
     'ek': '<ol class="gorevler" id="gorevler-1">'
           '<li><span class="g-isaret"></span><span><strong>Vaka 1:</strong> Açılmıyor <em class="yildiz"></em></span></li>'
           '<li><span class="g-isaret"></span><span><strong>Vaka 2:</strong> Görüntü yok <em class="yildiz"></em></span></li>'
           '<li><span class="g-isaret"></span><span><strong>Vaka 3:</strong> Ses yok <em class="yildiz"></em></span></li>'
           '<li><span class="g-isaret"></span><span><strong>Vaka 4:</strong> Fare çalışmıyor <em class="yildiz"></em></span></li></ol>'
           '<div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Çözülen vaka</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 4</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'teshis'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Toz Temizliği Gözlemi',
     'title': 'Temizlik Gözlemi ve Bakım Kartım',
     'desc': 'Öğretmenin gerçek bir bilgisayarda toz temizliği gösterecek. Önce adımların sırasını kur. Sonra gösteriyi izle ve gördüklerini işaretle.',
     'tip': ['👀', 'Gösteri sırasında kasaya dokunma; yalnız gözle ve not al.'],
     'ek': '<ol class="gorevler" id="gorevler-2">'
           '<li><span class="g-isaret"></span><span><strong>Sırayı kur:</strong> 6 temizlik adımı</span></li>'
           '<li><span class="g-isaret"></span><span><strong>Gözle:</strong> 3 soruyu işaretle</span></li>'
           '<li><span class="g-isaret"></span><span><strong>Bakım kartını</strong> al</span></li></ol>'
           '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Tamamlanan</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 9</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'gozlem'}},

    {'tur': 'derinles', 'ad': 'Bip Seslerinin Anlamı',
     'title': 'Bilgisayar Bip ile Konuşur',
     'desc': 'Bilgisayar açılırken parçalarını denetler. Bazı anakartlar sonucu <strong>bip sesleriyle</strong> bildirir. Bip dizilerinin anlamı <strong>üreticiye göre değişir</strong>; doğru anlamı kılavuzda bulursun.',
     'tip': ['📖', 'Bazı anakartlarda bip yerine küçük hata ışıkları vardır.'],
     'genis': True,
     'gorsel': {'2d': 'bip'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'Önce Basit', 'Takılı mı, açık mı? Sonra zora geç.'),
        ('oz-2.svg', 'Açılmıyor', 'Güç ışığı, fiş ve priz, güç düğmesi.'),
        ('oz-3.svg', 'Görüntü Yok', 'Monitör açık mı? Giriş ve kablo doğru mu?'),
        ('oz-4.svg', 'Ses ve Fare', 'Ses düzeyi, hoparlör; pil, alıcı.'),
        ('oz-5.svg', 'Isınma', 'Toz fanı zorlar; ısı artar, hız düşer.'),
        ('oz-6.svg', 'Bakım', 'Fiş çekili, fan tutulur, kısa kısa hava.'),
    ]},
]
