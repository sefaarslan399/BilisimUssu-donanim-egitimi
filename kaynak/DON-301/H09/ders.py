# DON-301 H09 — Montaj 1: Tezgâhta (Format U, lise)
MODELLER = ['M-ANAKART', 'M-CPU', 'M-SOGUTUCU', 'M-RAM', 'M-M2', 'M-ANTISTATIK-BILEKLIK']

UYARI_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg>'


def svg(ikon, sw='2.2'):
    return ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + sw + '" stroke-linecap="round" '
            'stroke-linejoin="round" aria-hidden="true">' + ikon + '</svg>')


def gk_madde(anahtar, ikon, baslik, metin):
    return ('<li><button type="button" class="gk2-madde" data-gk="' + anahtar + '" aria-pressed="false"><span class="gk2-kutu"></span>'
            '<span class="hz-ikon">' + svg(ikon) + '</span><span><b>' + baslik + '</b> ' + metin + '</span></button></li>')


def hz_kart(ikon, ad, not_):
    return ('<div class="hz-kart"><span class="hz-ikon">' + svg(ikon, '2') + '</span><b>' + ad + '</b><span>' + not_ + '</span></div>')


IK_BILEK = '<ellipse cx="8" cy="9" rx="5" ry="3.2"/><path d="M13 9.5c4 1 6 4 7 9"/><path d="M18 18.5h4"/>'
IK_KUTU = '<path d="M3 8l9-4 9 4v9l-9 4-9-4z"/><path d="M3 8l9 4 9-4M12 12v9"/>'
IK_POSET = '<path d="M6 3h12l-1 18H7z"/><path d="M9 3v3h6V3"/>'
IK_FIS = '<path d="M9 3v5M15 3v5"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v4"/><path d="M4 4l16 16"/>'
IK_EL = '<path d="M8 13V5a2 2 0 0 1 4 0v6"/><path d="M12 11V4a2 2 0 0 1 4 0v8"/><path d="M16 9a2 2 0 0 1 4 0v5a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3l-3-5a2 2 0 0 1 3-2l2 2"/>'
IK_KART = '<rect x="3" y="3" width="18" height="18" rx="2"/><rect x="6" y="6" width="6" height="6" rx="1"/><path d="M15 6v10M18 6v10M6 16h6"/>'
IK_CPU = '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><path d="M6 18l4-4"/>'
IK_FAN = '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 3-5 4-4M14 12c4 0 5 3 4 4M12 14c0 4-3 5-4 4M10 12c-4 0-5-3-4-4"/>'
IK_RAM = '<rect x="2" y="7" width="20" height="9" rx="1"/><path d="M5 16v3M8 16v3M11 16v3M15 16v3M18 16v3"/><path d="M5 10h3M10 10h3M15 10h3"/>'
IK_M2 = '<rect x="2" y="9" width="20" height="6" rx="1"/><path d="M5 9v6M19 12h.01"/><path d="M8 11h7"/>'
IK_TORNAVIDA = '<path d="M14 3l7 7-3 3-7-7z"/><path d="M11 6L3 14v4l3 3h4l8-8"/>'
IK_ALKOL = '<path d="M9 2h6v4l2 3v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l2-3z"/><path d="M7 13h10"/>'
IK_KITAP = '<path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-5"/><path d="M20 4v14h-6"/>'
IK_GOZ = '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
IK_KALEM = '<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="M14 6l4 4"/>'

HAZIRLIK = (
    '      <div class="layout-full hz-duzen">\n'
    '        <div class="hz-guvenlik" id="guvenlik-listesi" role="group" aria-label="Güvenlik kontrol listesi">\n'
    '          <div class="hz-guv-bas">' + UYARI_SVG + '<span>Güvenlik kontrol listesi: montajdan önce işaretle</span></div>\n'
    '          <ul>' +
    gk_madde('esd', IK_BILEK, 'Bileklik bağlı.', 'Bant deriye değiyor, klips antistatik matın topraklama düğmesinde; mat yoksa kasanın boyasız metalinde.') +
    gk_madde('zemin', IK_KUTU, 'Kart kutusunun üstünde.', 'Anakart kendi kutusuna yatırılır; halı, kumaş ve naylon yüzey statik yük toplar.') +
    gk_madde('poset', IK_POSET, 'Parçalar poşetinde.', 'İşlemci, RAM ve SSD takılacağı ana kadar antistatik poşetinde bekler.') +
    gk_madde('guc', IK_FIS, 'Güç yok.', 'Tezgâhta güç kaynağı ve fiş kullanılmaz; ilk açılış H10’da, kasada yapılır.') +
    gk_madde('dokunma', IK_EL, 'Pimlere dokunma.', 'Soket pimleri ve altın temaslar parmakla ellenmez; parçalar kenarından tutulur.') +
    '</ul>\n'
    '          <div class="gk2-sonuc" aria-live="polite"></div>\n'
    '        </div>\n'
    '        <div class="hz-sag">\n'
    '          <div class="csub">Grup tezgâhında:</div>\n'
    '          <div class="hz-kartlar">' +
    hz_kart(IK_KART, 'Anakart', 'Kutusu ve kılavuzuyla') +
    hz_kart(IK_CPU, 'İşlemci', 'Poşetinde, kutusunda') +
    hz_kart(IK_FAN, 'Soğutucu', 'Termal macun şırıngası') +
    hz_kart(IK_RAM, '2 × RAM', 'Aynı model, çift kanal') +
    hz_kart(IK_M2, 'M.2 SSD', 'Küçük vidasıyla') +
    hz_kart(IK_TORNAVIDA, 'Yıldız tornavida', 'Küçük uçlu') +
    hz_kart(IK_BILEK, 'ESD takımı', 'Bileklik ve mat') +
    hz_kart(IK_ALKOL, 'Temizlik', 'İzopropil alkol, bez') +
    '</div>\n'
    '          <div class="csub">Roller (her parçada değişir):</div>\n'
    '          <div class="hz-roller">' +
    hz_kart(IK_EL, 'Uygulayan', 'Parçaya yalnız o dokunur.') +
    hz_kart(IK_GOZ, 'Kontrolcü', 'Kılavuzu okur, yönü ve yuvayı doğrular.') +
    hz_kart(IK_KALEM, 'Kayıtçı', 'Sırayı, yuvaları ve süreyi yazar.') +
    '</div>\n        </div>\n      </div>')


def prova3d(pid, aria, yedek):
    return {'3d': pid, 'aria': aria, 'yedek': yedek,
            'ek': '<div class="fis-rozet guc-yok">' + svg(IK_FIS) + '<span>Güç yok · tezgâh</span></div>'}


DERS = {
    'grade': 'lise',
    'hafta': '9. Hafta',
    'baslik': 'Montaj 1: Tezgâhta',
    'aciklama': 'Anakartı kutusunun üstünde, kasa dışında hazırla: ESD önlemini al, işlemciyi köşe üçgenine göre tak, termal macunu uygulayıp soğutucuyu monte et, RAM ve M.2 SSD’yi kılavuzdaki yuvalara yerleştir.',
    'hedefler': [
        'Antistatik bileklik ve çalışma yüzeyiyle ESD (elektrostatik boşalma) önlemlerini alabileceğim.',
        'İşlemciyi köşe üçgenini soketteki işaretle hizalayarak, kuvvet uygulamadan takabileceğim.',
        'Termal macunu doğru miktarda uygulayıp soğutucuyu monte edebileceğim.',
        'RAM’i çift kanal için kılavuzdaki yuvalara, M.2 SSD’yi yuvasına takıp sabitleyebileceğim.',
    ],
    'hedef_simgeler': [IK_BILEK, IK_CPU, IK_FAN, IK_RAM],
    'bolumler': [
        ['Hazırlık', 'ESD, çalışma yüzeyi, roller'],
        ['İşlemci ve Soğutma', 'Soket, termal macun, soğutucu'],
        ['Bellek ve Depolama', 'Çift kanal RAM, M.2 SSD, kontrol'],
    ],
    'quiz': [
        {'q': 'Tezgâhta montaja başlarken antistatik bilekliğin klipsi nereye bağlanır?',
         'opts': ['Antistatik matın topraklama düğmesine; mat yoksa kasanın boyasız metaline', 'Anakartın vida deliklerinden birine', 'Güç kaynağının fişinin metal ucuna', 'Hiçbir yere; bilekliği takmak tek başına yeterlidir'], 'correct': 0,
         'fb': 'Bileklik, vücuttaki yükü klips ve kablo üzerinden topraklama noktasına aktarır. Klips bağlı değilse bileklik işe yaramaz; anakart ve fiş topraklama noktası değildir.'},
        {'q': 'Görselde işlemci sokete indirilmek üzere. Uygulayan ne yapmalı?<span class="q-gorsel"><!--@dahil:svg-quiz-ucgen.svg--></span>',
         'opts': ['İşlemciyi hafifçe bastırarak oturtmalı', 'Kolu indirip işlemciyi yerinde sıkıştırmalı', 'İşlemciyi kaldırıp üçgeni soketteki üçgenle aynı köşeye gelecek biçimde çevirmeli', 'Önce soket pimlerini parmağıyla düzeltmeli'], 'correct': 2,
         'fb': 'Üçgenler farklı köşede: işlemci ters. Bastırmak ya da kolu indirmek pimleri eğer. İşlemci döndürülür, üçgenler aynı köşeye gelince kuvvet uygulamadan bırakılır.'},
        {'q': 'Termal macun için doğru uygulama hangisidir?',
         'opts': ['İşlemci kapağını baştan sona kalın bir katmanla kaplamak', 'Kapağın ortasına pirinç tanesi kadar koyup soğutucunun baskısıyla yaymak', 'Macunu soğutucunun kanatçıklarına sürmek', 'Macun yerine soğutucu tabanındaki koruyucu filmi bırakmak'], 'correct': 1,
         'fb': 'Macun yalnız iki metal yüzey arasındaki mikroskobik boşlukları doldurur. Pirinç tanesi kadarı baskıyla ince bir katmana yayılır; fazlası taşar, film ise ısıyı iletmez.'},
        {'q': 'Ece M.2 SSD’yi yuvaya açıyla soktu. Elini çekince kartın ucu yaklaşık 20° yukarıda kalıyor. Ece ne yapmalı?',
         'opts': ['Böyle bırakmalı; sistem açılınca kart kendiliğinden iner', 'Kartı çıkarıp ters çevirerek yeniden takmalı', 'Kartı yuvaya dik gelecek biçimde bastırmalı', 'Ucunu vida ayağına bastırıp küçük vidayla (ya da mandalla) sabitlemeli'], 'correct': 3,
         'fb': 'M.2 kart yuvaya açıyla girer ve bırakılınca yukarı kalkar; bu normaldir. Uç vida ayağına bastırılıp sabitlenmezse temas bozulur.'},
    ],
    'bitis': 'İşlemciden M.2 SSD’ye kadar tezgâh montajını doğru sırayla, ESD önlemiyle yapabiliyorsun. Sırada kasa ve ilk açılış var!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'Anakart kutusunun üstünde montajı tamamlanmış anakart: işlemci ve soğutucu, A2 ve B2 yuvalarında RAM, M.2 SSD',
         'yedek': 'yedek-kapak.svg'}

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Macun: Ne Kadar?',
     'desc': 'Deniz işlemciyi taktı, şimdi soğutucudan önce <strong>termal macun</strong> sürecek. Isının soğutucuya en iyi geçmesi için ne kadar macun kullanmalı?',
     'secenekler': ['Kapağın tamamına kalın bir katman: ne kadar çok, o kadar iyi.', 'Kapağın ortasına pirinç tanesi kadar: soğutucunun baskısı yayar.', 'Hiç gerekmez: metal metale değince ısı zaten geçer.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'terim', 'terimler': [
        ('ESD', 'Elektrostatik boşalma', 'Vücutta biriken statik yükün parçaya ani geçişi; hissedilmeden de devreye zarar verir.'),
        ('Wrist Strap', 'Antistatik bileklik', 'Vücudu kablo ve klipsle topraklama noktasına bağlayan bant.'),
        ('LGA', 'Temas pedli dizi', 'Pimlerin sokette, düz temas pedlerinin işlemcinin altında olduğu düzen.'),
        ('Zero Insertion Force', 'Sıfır kuvvetle takma', 'İşlemci bastırılmadan bırakılır; baskıyı yük plakası ve kol verir.'),
        ('Load Plate / Lever', 'Yük plakası / kilit kolu', 'İşlemciyi sokete eşit bastıran metal çerçeve ve onu kilitleyen kol.'),
        ('IHS', 'Isı dağıtıcı kapak', 'İşlemcinin üstündeki metal kapak; soğutucu buna oturur.'),
        ('Thermal Paste', 'Termal macun', 'Kapak ile soğutucu tabanı arasındaki mikroskobik boşlukları dolduran ısı iletken macun.'),
        ('CPU Cooler', 'İşlemci soğutucusu', 'Taban, ısı boruları, kanatçıklar ve fandan oluşan ısı atıcı.'),
        ('Dual Channel', 'Çift kanal', 'Modüllerin iki ayrı bellek kanalına takılıp aynı anda veri taşıması.'),
        ('M.2 Standoff', 'M.2 vida ayağı', 'SSD’nin ucunun oturup vidalandığı küçük metal ayak.'),
    ]},

    {'tur': 'serbest', 'baslik': 'Hazırlık: Güvenlik, Malzeme, Roller', 'rozet': 'Hazırlık', 'etiket': 'Hazırlık ve Güvenlik',
     'ikon': '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/>',
     'govde': HAZIRLIK},

    {'tur': 'uygulama', 'no': 1, 'ad': 'ESD ve Çalışma Alanı', 'etiket': 'ADIM 1 · ESD',
     'ikon': IK_BILEK,
     'title': 'Önce Topraklan, Sonra Dokun',
     'gercek_baslik': 'Gerçek parçada yap',
     'prova': prova3d('s6-3d', 'Antistatik mat, anakart kutusu ve bileklik: klips matın topraklama düğmesine bağlanıyor, anakart poşetinden çıkıp kutusunun üstüne yatırılıyor', 'oz-1.svg'),
     'foto': 'DON-301-H09-1-esd.jpg|Antistatik mat üzerinde anakart kutusu, üstünde anakart; bileklik klipsi matın topraklama düğmesine bağlı',
     'talimat': ['Bilekliği deriye değecek şekilde tak; klipsi matın <strong>topraklama düğmesine</strong> bağla.',
                 'Anakartı poşetinden çıkar, <strong>kenarlarından</strong> tutarak kutusunun üstüne yatır.',
                 'Kılavuzu yanına aç; diğer parçalar sırası gelene kadar <strong>poşetinde</strong> kalsın.'],
     'kontrol': 'Klips bağlı, kart kutunun üstünde, güç kaynağı ve fiş masada yok.'},

    {'tur': 'uygulama', 'no': 2, 'ad': 'İşlemciyi Tak', 'etiket': 'ADIM 2 · İŞLEMCİ',
     'ikon': IK_CPU,
     'title': 'Üçgen Üçgene, Bastırmadan Bırak',
     'gercek_baslik': 'Gerçek parçada yap',
     'prova': prova3d('s7-3d', 'İşlemci soketi yakın plan: kilit kolu kalkıyor, yük plakası açılıyor; ters tutulan işlemci oturmuyor, çevrilip üçgeni soketteki üçgenle hizalanınca bırakılıyor, plaka kapanıp kol kilitleniyor', 'oz-2.svg'),
     'foto': 'DON-301-H09-2-islemci.jpg|Sokete oturmuş işlemci: köşe üçgeni soketteki üçgenle aynı köşede, yük plakası açık',
     'talimat': ['Kolu hafifçe bastırıp kancadan kurtar, kaldır; <strong>yük plakasını</strong> aç.',
                 'İşlemciyi kenarlarından tut; <strong>köşe üçgenini</strong> soketteki üçgene hizala, düz indirip <strong>bırak</strong>.',
                 'Plakayı kapat, kolu indirip kancaya tak; çıkan <strong>koruma kapağını sakla</strong>.'],
     'kontrol': 'Üçgenler aynı köşede, işlemci düz; kol kancada, kapak kutusunda.'},

    {'tur': 'uygulama', 'no': 3, 'ad': 'Macun ve Soğutucu', 'etiket': 'ADIM 3 · SOĞUTMA',
     'ikon': IK_FAN,
     'title': 'Pirinç Tanesi Kadar Macun, Düz Baskı',
     'gercek_baslik': 'Gerçek parçada yap',
     'prova': prova3d('s8-3d', 'Soğutucu tabanındaki koruyucu film soyuluyor, işlemci kapağının ortasına küçük bir macun damlası konuyor, soğutucu düz iniyor ve macun ince bir katmana yayılıyor; vidalar dönüşümlü sıkılıyor, fan kablosu CPU_FAN başlığına takılıyor', 'oz-3.svg'),
     'foto': 'DON-301-H09-3-sogutucu.jpg|İşlemci kapağının ortasında pirinç tanesi kadar termal macun ve yanında tabanı açık soğutucu',
     'talimat': ['Soğutucu tabanındaki <strong>koruyucu filmi</strong> soy; tabana dokunma.',
                 'Kapağın ortasına <strong>pirinç tanesi kadar</strong> macun koy; yayma.',
                 'Soğutucuyu düz indir; vidaları <strong>dönüşümlü</strong>, birkaç turda sık. Fan kablosu <code>CPU_FAN</code>’a.'],
     'kontrol': 'Soğutucu sallanmıyor, macun taşmadı, fan kablosu CPU_FAN’da.'},

    {'tur': 'uygulama', 'no': 4, 'ad': 'RAM (Çift Kanal Yuvaları)', 'etiket': 'ADIM 4 · RAM',
     'ikon': IK_RAM,
     'title': 'Kılavuzdaki Yuvalar: A2 ve B2',
     'gercek_baslik': 'Gerçek parçada yap',
     'prova': prova3d('s9-3d', 'Dört RAM yuvası A1, A2, B1, B2 olarak etiketleniyor; kılavuzun iki modül için gösterdiği A2 ve B2 yuvaları parlıyor; modüller çentik hizasıyla bu yuvalara takılıyor ve mandallar kapanıyor', 'oz-4.svg'),
     'foto': 'DON-301-H09-4-ram.jpg|Anakart kılavuzundaki bellek yerleşim tablosu ve A2 ile B2 yuvalarına takılmış iki modül',
     'talimat': ['Kılavuzun bellek tablosunda <strong>iki modül</strong> satırını bul (çoğunlukla <strong>A2 + B2</strong>).',
                 'Mandalları aç; modülün <strong>çentiğini</strong> yuvadaki çıkıntıya hizala.',
                 'İki ucundan eşit bastır; mandallar <strong>klik</strong> diye kendiliğinden kapansın.'],
     'kontrol': 'Modüller kılavuzdaki yuvalarda, dört mandal kapalı, modül eğik değil.'},

    {'tur': 'uygulama', 'no': 5, 'ad': 'M.2 SSD', 'etiket': 'ADIM 5 · M.2',
     'ikon': IK_M2,
     'title': 'Açıyla Sok, Bastır, Vidala',
     'gercek_baslik': 'Gerçek parçada yap',
     'prova': prova3d('s10-3d', 'M.2 yuvası yakın plan: vida sökülüyor, SSD anahtar çentiği yuvadaki çıkıntıya denk gelecek biçimde açıyla sokuluyor, kalkık ucu vida ayağına bastırılıp vidalanıyor', 'oz-5.svg'),
     'foto': 'DON-301-H09-5-m2.jpg|M.2 yuvasına açıyla sokulmuş SSD ve yanında vida ayağı ile küçük vida',
     'talimat': ['Kılavuzdaki yuvayı bul (sistem diski için çoğunlukla <strong>M.2_1</strong>); üstünde soğutucu plaka varsa sök.',
                 'Vidayı çıkar; SSD’yi <strong>anahtar çentiği</strong> çıkıntıya denk gelecek biçimde ~30° açıyla sok.',
                 'Ucu vida ayağına bastır, vidayı <strong>elle sıkı</strong> tak; zorlama.'],
     'kontrol': 'SSD yuvaya tam girmiş, kart düz, vida takılı.'},

    {'tur': 'uygulama', 'no': 6, 'ad': 'Kontrol Listesi', 'etiket': 'ADIM 6 · KONTROL',
     'ikon': '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
     'title': 'Kasaya Geçmeden Son Bakış',
     'prova_baslik': 'Prova: kontrol turu',
     'gercek_baslik': 'Gerçek parçada kontrol et',
     'prova': prova3d('s11-3d', 'Montajı bitmiş anakartta kontrol turu: kilit kolu, soğutucu, fan kablosu, RAM mandalları, M.2 vidası ve kartın üstü sırayla işaretleniyor', 'oz-6.svg'),
     'foto': 'DON-301-H09-6-kontrol.jpg|Kutusunun üstünde montajı tamamlanmış anakart ve doldurulmuş kontrol formu',
     'talimat': ['Kontrolcü listeyi okur: kol, soğutucu, fan kablosu, mandallar, M.2 vidası.',
                 'Kartın üstünde <strong>unutulmuş vida</strong> ya da macun artığı kalmasın.',
                 'Kayıtçı yuvaları ve süreyi forma yazar; kart kutusunun üstünde H10’a bekler.'],
     'kontrol': 'Form dolu; öğretmen kartı onayladı. Güç verilmedi.'},

    {'tur': 'etkinlik', 'no': 1, 'ad': '3D Montaj Simülatörü',
     'title': 'Tezgâh Montajını Sen Yap',
     'desc': 'Tepsiden sıradaki parçayı ya da işlemi seç; 3D kartta yerine koy. Yanlış sıra ya da yanlış yuva açıklamayla geri alınır.',
     'ek': '<div class="em-tepsi" id="em-tepsi" role="group" aria-label="Parça tepsisi"></div>'
           '<div class="em-mesaj" id="em-mesaj" aria-live="polite">Önce güvenlik: ilk karta dikkat.</div>'
           '<div class="em-alt"><div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Tamamlanan aşama</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 8</span></div><div class="etk-ilerleme-bar"><span></span></div></div>'
           '<div class="em-sayac"><span>Hata</span><b id="em-hata">0</b></div><div class="em-sayac"><span>Süre</span><b id="em-sure">00:00</b></div></div>',
     'gorsel': {'3d': 's12-3d', 'aria': 'Etkinlik: anakart kutusunun üstünde; parçalar seçilip sırayla takılıyor', 'yedek': 'oz-6.svg',
                'yedek_metin': 'Bu cihazda 3D açılmadı. Montaj sırasını gerçek tezgâhta öğretmeninle uygula.'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Kontrolcü Sensin',
     'title': 'Onayla ya da Düzelt',
     'desc': 'Her kart bir grubun tezgâhından bir an. Kontrolcü olarak kararını ver: montaj doğruysa onayla, değilse doğru düzeltmeyi seç.',
     'tip': ['💡', 'Dört şeye bak: üçgenler aynı köşede mi, macun ne kadar, modüller hangi kanalda, M.2 sabit mi?'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Kart</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 6</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'kontrolcu'}},

    {'tur': 'ozet', 'alt': 'Tezgâhta yaptığın 6 adım:', 'kartlar': [
        ('oz-1.svg', 'ESD', 'Bileklik topraklamada, kart kutusunda, güç yok.'),
        ('oz-2.svg', 'İşlemci', 'Üçgen üçgene, bastırmadan bırak, kolu kilitle.'),
        ('oz-3.svg', 'Macun ve Soğutucu', 'Pirinç tanesi kadar macun, film soyulur, düz baskı.'),
        ('oz-4.svg', 'Çift Kanal', 'İki modül: kılavuzdaki A2 + B2.'),
        ('oz-5.svg', 'M.2 SSD', 'Açıyla sok, ucunu bastır, vidala.'),
        ('oz-6.svg', 'Kontrol', 'Kol, soğutucu, fan, mandal, vida; güç H10’da.'),
    ]},
]
