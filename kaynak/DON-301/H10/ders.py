# DON-301 H10 — Montaj 2: Kasada ve İlk POST (Format U, lise)
MODELLER = ['M-MASAUSTU-ACIK', 'M-ANAKART', 'M-CPU', 'M-SOGUTUCU', 'M-RAM', 'M-M2', 'M-PSU', 'M-GPU', 'M-KABLO-GUC', 'M-KABLO-SATA', 'M-SSD']

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
IK_FIS = '<path d="M9 3v5M15 3v5"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v4"/><path d="M4 4l16 16"/>'
IK_FIS_ACIK = '<path d="M9 3v5M15 3v5"/><path d="M6 8h12v3a6 6 0 0 1-12 0z"/><path d="M12 17v4"/>'
IK_EL = '<path d="M8 13V5a2 2 0 0 1 4 0v6"/><path d="M12 11V4a2 2 0 0 1 4 0v8"/><path d="M16 9a2 2 0 0 1 4 0v5a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3l-3-5a2 2 0 0 1 3-2l2 2"/>'
IK_KART = '<rect x="3" y="3" width="18" height="18" rx="2"/><rect x="6" y="6" width="6" height="6" rx="1"/><path d="M15 6v10M18 6v10M6 16h6"/>'
IK_KASA = '<rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="6" r="1.5"/><path d="M9 11h6M9 14h6M9 17h6"/>'
IK_PSU = '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="9" cy="12" r="3.5"/><path d="M9 8.5v7M5.5 12h7"/><path d="M16 10h3M16 14h3"/>'
IK_GPU = '<rect x="2" y="6" width="18" height="10" rx="1.5"/><circle cx="8" cy="11" r="2.8"/><circle cx="15" cy="11" r="2.8"/><path d="M4 16v3h9v-3"/><path d="M20 8h2v6h-2"/>'
IK_SSD = '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h10M7 13h6"/><path d="M17 16h1"/>'
IK_VIDA = '<circle cx="12" cy="6" r="4"/><path d="M10 6h4M12 4v4"/><path d="M10 10v10l2 2 2-2V10"/><path d="M10 13l4 1M10 16l4 1"/>'
IK_BAG = '<path d="M4 12c0-4 4-7 8-7s8 3 8 7-4 7-8 7"/><path d="M12 19l-3-2 3-2"/><path d="M8 10h8"/>'
IK_TORNAVIDA = '<path d="M14 3l7 7-3 3-7-7z"/><path d="M11 6L3 14v4l3 3h4l8-8"/>'
IK_GOZ = '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
IK_KALEM = '<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="M14 6l4 4"/>'
IK_AYAK = '<path d="M8 3h8l2 4-2 4H8L6 7z"/><path d="M10 11v10M14 11v10M10 15h4M10 18h4"/>'
IK_PIN = '<rect x="3" y="7" width="18" height="10" rx="1.5"/><circle cx="7" cy="10" r=".8"/><circle cx="10" cy="10" r=".8"/><circle cx="13" cy="10" r=".8"/><circle cx="16" cy="10" r=".8"/><circle cx="7" cy="14" r=".8"/><circle cx="10" cy="14" r=".8"/><circle cx="13" cy="14" r=".8"/><circle cx="16" cy="14" r=".8"/><circle cx="19" cy="14" r=".8"/>'
IK_POST = '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M6 8h6M6 11h9M6 14h4"/>'

HAZIRLIK = (
    '      <div class="layout-full hz-duzen">\n'
    '        <div class="hz-guvenlik" id="guvenlik-listesi" role="group" aria-label="Güvenlik kontrol listesi">\n'
    '          <div class="hz-guv-bas">' + UYARI_SVG + '<span>Güvenlik kontrol listesi: kasayı açmadan önce işaretle</span></div>\n'
    '          <ul>' +
    gk_madde('fis', IK_FIS, 'Fiş prizde değil.', 'Güç kaynağının kablosu çekili, arkadaki anahtarı 0 konumunda. Bütün kablolar böyle takılır.') +
    gk_madde('esd', IK_BILEK, 'Bileklik kasada.', 'Bant deriye değiyor; klips kasanın boyasız metal çerçevesine bağlı.') +
    gk_madde('kart', IK_KART, 'Kart hazır.', 'H09’da hazırlanan anakart kutusunun üstünde, kontrol formu yanında.') +
    gk_madde('kenar', IK_EL, 'Kenarından tut.', 'Anakart ve ekran kartı kenarından tutulur; altın temaslara, bileşenlere bastırılmaz.') +
    gk_madde('onay', IK_GOZ, 'Açılış öğretmenle.', 'Fiş, kontrol listesi okunup öğretmen onay verince takılır. Güç kaynağı hiçbir zaman açılmaz.') +
    '</ul>\n'
    '          <div class="gk2-sonuc" aria-live="polite"></div>\n'
    '        </div>\n'
    '        <div class="hz-sag">\n'
    '          <div class="csub">Grup masasında:</div>\n'
    '          <div class="hz-kartlar">' +
    hz_kart(IK_KASA, 'Kasa', 'ATX orta kule, vida poşetiyle') +
    hz_kart(IK_KART, 'Hazır anakart', 'H09’dan, kutusunda') +
    hz_kart(IK_PSU, 'Güç kaynağı', 'ATX, kablolarıyla') +
    hz_kart(IK_GPU, 'Ekran kartı', 'Antistatik poşetinde') +
    hz_kart(IK_SSD, '2,5 inç SSD', 'SATA veri kablosuyla') +
    hz_kart(IK_AYAK, 'Mesafe vidaları', 'Vidalar kutuda') +
    hz_kart(IK_BAG, 'Kablo bağları', 'Cırt ya da plastik') +
    hz_kart(IK_TORNAVIDA, 'Yıldız tornavida', 'Orta boy, manyetik uç') +
    '</div>\n'
    '          <div class="csub">Roller (her yapım adımında değişir):</div>\n'
    '          <div class="hz-roller">' +
    hz_kart(IK_EL, 'Uygulayan', 'Parçaya ve kabloya yalnız o dokunur.') +
    hz_kart(IK_GOZ, 'Kontrolcü', 'Kılavuzu okur, girişi ve yönü doğrular.') +
    hz_kart(IK_KALEM, 'Kayıtçı', 'Bağlantıları, POST sonucunu ve süreyi yazar.') +
    '</div>\n        </div>\n      </div>')


def prova3d(pid, aria, yedek, rozet=None):
    if rozet is None:
        rozet = '<div class="fis-rozet guc-yok">' + svg(IK_FIS) + '<span>Fiş çekili · güç yok</span></div>'
    return {'3d': pid, 'aria': aria, 'yedek': yedek, 'ek': rozet}


DERS = {
    'grade': 'lise',
    'hafta': '10. Hafta',
    'baslik': 'Montaj 2: Kasada ve İlk POST',
    'aciklama': 'H09’da tezgâhta hazırlanan anakartı kasaya taşı: G/Ç plakasını ve mesafe vidalarını tak, anakartı vidala, güç kaynağını, 24-pin ve 8-pin kabloları, ön panel pinlerini, ekran kartını ve SSD’yi bağla; kabloları topla ve öğretmen onayıyla ilk POST’u al.',
    'hedefler': [
        'Kasayı hazırlayıp G/Ç plakasını takabilecek, anakartı mesafe vidalarıyla kasaya yerleştirebileceğim.',
        'Güç kaynağını takıp 24-pin, 8-pin EPS ve ön panel kablolarını kılavuza göre doğru girişlere bağlayabileceğim.',
        'Ekran kartını ve SSD’yi takıp kabloları tepsinin arkasından geçirerek düzenleyebileceğim.',
        'Kontrol listesi ve öğretmen onayıyla ilk açılışı yapıp POST sonucunu yorumlayabileceğim.',
    ],
    'hedef_simgeler': [IK_AYAK, IK_PIN, IK_GPU, IK_POST],
    'bolumler': [
        ['Hazırlık', 'Fiş, ESD, malzeme, roller'],
        ['Kasa ve Güç', 'G/Ç plakası, ayaklar, anakart, 24/8-pin'],
        ['Bağlantı ve Açılış', 'Ön panel, kart ve disk, kablo düzeni, POST'],
    ],
    'quiz': [
        {'q': 'Anakart kasaya takılırken mesafe vidalarının (ayakların) görevi nedir?',
         'opts': ['Kartı tepsiden birkaç milimetre yukarıda tutup alt yüzdeki lehim noktalarının metal tepsiye değmesini önlemek', 'Kartın ısısını kasanın metal gövdesine iletmek', 'Kart ile tepsi arasına hava girmesini engellemek', 'Ekran kartının ağırlığını taşımak'], 'correct': 0,
         'fb': 'Ayaklar kartı metalden ayırır: alt yüzdeki lehim noktaları tepsiye değerse kısa devre olur. Bu yüzden ayak yalnız kartta vida deliği olan yerlere takılır.'},
        {'q': 'Görseldeki ön panel şemasına göre güç düğmesi (PWR SW) kablosu hangi iki pine takılır?<span class="q-gorsel"><!--@dahil:svg-quiz-panel.svg--></span>',
         'opts': ['1 ve 3', '2 ve 4', '6 ve 8', '5 ve 7'], 'correct': 2,
         'fb': 'Şemada 6 ve 8 PWR SW olarak işaretli. 1–3 disk ışığı, 2–4 güç ışığı, 5–7 sıfırlama düğmesidir. Kesin yerleşimi her zaman kartın kılavuzu belirler.'},
        {'q': 'Deniz ilk açılışta güç düğmesine bastı: fanlar dönüyor ama ekran gelmiyor ve anakarttaki CPU hata ışığı yanık kalıyor. İlk neyi kontrol etmeli?',
         'opts': ['Ön panel ışık kablolarının yönünü', 'İşlemci güç kablosunun (8-pin EPS) takılı ve oturmuş olduğunu', 'SSD’nin SATA veri kablosunu', 'Kasa fanlarının dönüş yönünü'], 'correct': 1,
         'fb': 'CPU ışığı POST’un işlemci aşamasında takıldığını gösterir; kasa montajında en sık nedeni takılmamış ya da yarım oturmuş 8-pin EPS kablosudur. Fanların dönmesi yalnız 24-pin’in bağlı olduğunu gösterir.'},
        {'q': 'Ece kasa montajını bitirdi. İlk açılış için doğru yol hangisidir?',
         'opts': ['Fişi takıp hemen güç düğmesine basmak; sorun çıkarsa sonra bakmak', 'Önce yan kapağı kapatıp vidalamak, sonra ilk kez açmak', 'Güç kaynağını açık bırakıp eksik kabloları çalışırken takmak', 'Kontrol listesini okumak, öğretmen onayı almak, monitörü ekran kartına bağlayıp fişi takmak ve açmak'], 'correct': 3,
         'fb': 'Bütün kablolar fiş çekiliyken takılır. İlk açılış yan kapak açıkken, kontrol listesi ve öğretmen onayından sonra yapılır; böylece fanlar ve ışıklar gözlenebilir.'},
    ],
    'bitis': 'Anakartı kasaya yerleştirip güç, ön panel, ekran kartı ve disk bağlantılarını doğru yaptın; ilk POST’u güvenle alabiliyorsun. Sırada UEFI ayarları var!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'Yan yatırılmış, yan kapağı açık kasa: mesafe vidalarıyla takılmış anakart, alt bölmede güç kaynağı, ekran kartı, SSD ve düzenli güç kabloları',
         'yedek': 'yedek-kapak.svg'}

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Ayaksız Olur mu?',
     'desc': 'Deniz, H09’da hazırladığı anakartı kasanın metal tepsisine <strong>doğrudan</strong> yatırıp vidalamak istiyor; kutuda gelen küçük pirinç ayakları gereksiz buluyor. Sence ne olur?',
     'secenekler': ['Olur: tepsi düz ve sağlam, vidalar kartı tutar.', 'Olmaz: kartın altındaki lehim noktaları metale değer, kısa devre olur.', 'Olur ama kart biraz daha sıcak çalışır.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'terim', 'terimler': [
        ('I/O Shield', 'G/Ç plakası', 'Arka portların çevresini kapatan, kasaya içeriden bastırılan ince metal plaka.'),
        ('Standoff', 'Mesafe vidası (ayak)', 'Anakartı tepsiden birkaç milimetre yukarıda tutan dişli metal ayak.'),
        ('ATX 24-pin', 'Ana güç girişi', 'Güç kaynağından anakartın tamamını besleyen 24 pinli kablo ve giriş.'),
        ('EPS 8-pin (4+4)', 'İşlemci güç girişi', 'İşlemciye ayrı +12 V hattı getirir; kartın üst kenarındadır.'),
        ('PCIe 6+2 pin', 'Ekran kartı ek gücü', 'Kartın yuvadan aldığından fazlasını güç kaynağından getiren kablo.'),
        ('Front Panel Header', 'Ön panel başlığı', 'Kasanın düğme ve ışık kablolarının takıldığı pim dizisi (F_PANEL).'),
        ('Power SW / Reset SW', 'Güç / sıfırlama düğmesi', 'Kutupsuz, iki pinli düğme kabloları; yönü fark etmez.'),
        ('Power LED / HDD LED', 'Güç / disk ışığı', 'Kutuplu ışık kabloları: + ucu + pine gelir.'),
        ('Cable Management', 'Kablo düzeni', 'Kabloları tepsinin arkasından geçirip bağlarla toplamak.'),
        ('POST', 'Açılış öz sınaması', 'Güç verilince işlemci, bellek ve ekran kartının denetlendiği ilk sınama.'),
    ]},

    {'tur': 'serbest', 'baslik': 'Hazırlık: Güvenlik, Malzeme, Roller', 'rozet': 'Hazırlık', 'etiket': 'Hazırlık ve Güvenlik',
     'ikon': '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/>',
     'govde': HAZIRLIK},

    {'tur': 'uygulama', 'no': 1, 'ad': 'Kasa ve I/O Plakası', 'etiket': 'ADIM 1 · KASA',
     'ikon': IK_KASA,
     'title': 'Kasayı Aç, Plakayı İçeriden Bastır',
     'gercek_baslik': 'Gerçek kasada yap',
     'prova': prova3d('s6-3d', 'Yan yatırılmış kasa: arkadaki iki kelebek vida sökülüyor, yan kapak kaydırılıp kaldırılıyor; G/Ç plakası önce ters tutuluyor, çevrilip arka açıklığa içeriden bastırılıyor', 'oz-1.svg'),
     'foto': 'DON-301-H10-1-io.jpg|Yan kapağı sökülmüş, yan yatırılmış kasa ve arka açıklığa içeriden takılmış G/Ç plakası',
     'talimat': ['Kasayı sol yanı yukarıda yatır; arkadaki iki <strong>kelebek vidayı</strong> sök, yan kapağı geriye kaydırıp kaldır.',
                 'Bilekliğin klipsini kasanın <strong>boyasız metal</strong> çerçevesine bağla.',
                 'G/Ç plakasını kartın arka portlarıyla aynı yönde tut; açıklığa <strong>içeriden</strong> bastır, dört kenarı <strong>klik</strong> diye otursun.'],
     'kontrol': 'Plaka dört kenardan oturmuş, delikleri kartın portlarıyla aynı düzende; kapak ve vidalar kutuda.'},

    {'tur': 'uygulama', 'no': 2, 'ad': 'Mesafe Vidaları ve Anakart', 'etiket': 'ADIM 2 · ANAKART',
     'ikon': IK_AYAK,
     'title': 'Ayak Sayısı = Delik Sayısı',
     'gercek_baslik': 'Gerçek kasada yap',
     'prova': prova3d('s7-3d', 'Kasa tepsisi: kartın dokuz vida deliğinin altına mesafe vidaları takılıyor, deliğe denk gelmeyen fazla ayak sökülüyor; anakart eğik tutularak portları G/Ç plakasına sokuluyor, ayaklara iniyor ve vidalar çapraz sırayla takılıyor', 'oz-2.svg'),
     'foto': 'DON-301-H10-2-anakart.jpg|Kasa tepsisindeki mesafe vidaları ve üstüne vidalanmış anakart; arka portlar G/Ç plakasından görünüyor',
     'talimat': ['Kartın vida deliklerini say; tepside yalnız bunların altında <strong>mesafe vidası</strong> olsun. Fazla ayağı sök.',
                 'Kartı kenarlarından tut; önce <strong>arka portları</strong> G/Ç plakasına eğik sok, sonra ayakların üstüne düz indir.',
                 'Vidaları önce <strong>çapraz</strong> köşelere, sonra ortadakilere tak; <strong>elle sıkı</strong>, zorlama yok.'],
     'kontrol': 'Her delikte vida var, kartın altında boşta ayak yok; plakanın tırnakları portların içine girmemiş.'},

    {'tur': 'uygulama', 'no': 3, 'ad': 'Güç Kaynağı, 24/8-pin', 'etiket': 'ADIM 3 · GÜÇ',
     'ikon': IK_PSU,
     'title': 'Önce Yerine, Sonra İki Ana Kablo',
     'gercek_baslik': 'Gerçek kasada yap',
     'prova': prova3d('s8-3d', 'Güç kaynağı kasanın alt arka bölmesine fanı aşağı bakacak biçimde iniyor ve arkadan dört vidayla sabitleniyor; 24-pin kablo anakartın ön kenarındaki girişe, CPU yazan 8-pin kablo kartın üst kenarındaki EPS girişine takılıyor; benzer görünen PCIe 6+2 fişi EPS girişine girmiyor', 'oz-3.svg'),
     'foto': 'DON-301-H10-3-guc.jpg|Kasanın alt bölmesine takılmış güç kaynağı ile anakarta takılı 24-pin ve 8-pin güç kabloları',
     'talimat': ['Güç kaynağını alt bölmeye yerleştir: altta filtreli hava deliği varsa <strong>fanı aşağı</strong> baksın; arkadan <strong>dört vidayla</strong> sabitle.',
                 '<strong>24-pin</strong> fişi kartın ön kenarındaki girişe düz bastır; kilit tırnağı <strong>klik</strong> diye tutsun.',
                 '<strong>CPU</strong> yazan <strong>8-pin (4+4)</strong> fişi kartın üst kenarındaki EPS girişine tak. PCIe 6+2 fişi buraya girmez.'],
     'kontrol': 'Güç kaynağı dört vidalı; 24-pin ve 8-pin tırnakları oturmuş, fiş hafifçe çekilince çıkmıyor.'},

    {'tur': 'uygulama', 'no': 4, 'ad': 'Ön Panel Kabloları', 'etiket': 'ADIM 4 · ÖN PANEL',
     'ikon': IK_PIN,
     'title': 'Kılavuzdaki Şemaya Göre, Pim Pim',
     'gercek_baslik': 'Gerçek kasada yap',
     'prova': prova3d('s9-3d', 'Anakartın alt kenarındaki ön panel başlığı büyütülüyor; disk ışığı, güç ışığı, sıfırlama ve güç düğmesi kabloları kılavuzdaki şemaya göre pimlerine uçarak yerleşiyor; ters takılan güç ışığı kablosu çevriliyor', 'oz-4.svg'),
     'foto': 'DON-301-H10-4-onpanel.jpg|Anakart kılavuzundaki ön panel pim şeması ve başlığa takılmış güç, sıfırlama ve ışık kabloları',
     'talimat': ['Kılavuzda <strong>F_PANEL</strong> şemasını bul; kartın üstündeki baskı yazısıyla karşılaştır.',
                 '<strong>PWR SW</strong> ve <strong>RESET SW</strong> kutupsuzdur: kendi iki pinine her yönde takılır.',
                 'Işık kablolarında (<strong>PLED</strong>, <strong>HDD LED</strong>) <strong>+</strong> uç + pine gelir; ters takılırsa ışık yanmaz, zarar vermez.'],
     'kontrol': 'Dört fiş şemadaki pinlerde; + uçlar + pinlerde, boşta kablo yok.'},

    {'tur': 'uygulama', 'no': 5, 'ad': 'Ekran Kartı ve Diskler', 'etiket': 'ADIM 5 · KART VE DİSK',
     'ikon': IK_GPU,
     'title': 'Yuvayı Aç, Kartı Oturt, Gücünü Ver',
     'gercek_baslik': 'Gerçek kasada yap',
     'prova': prova3d('s10-3d', 'Arka paneldeki iki genişleme yuvası kapağı sökülüyor; ekran kartı ilk PCIe x16 yuvasına düz iniyor, braketi vidalanıyor ve 6+2 pin ek güç fişi takılıyor; 2,5 inç SSD yerine iniyor, SATA veri kablosu anakarta, SATA güç kablosu güç kaynağına bağlanıyor', 'oz-5.svg'),
     'foto': 'DON-301-H10-5-kart-disk.jpg|İlk PCIe x16 yuvasına takılmış, braketi vidalı ve ek gücü bağlı ekran kartı; yanında SATA kabloları takılı 2,5 inç SSD',
     'talimat': ['Kartın kaplayacağı <strong>iki yuva kapağını</strong> sök; ilk PCIe x16 yuvasının <strong>mandalını</strong> aç.',
                 'Kartı kenarından tutup yuvaya düz bastır; mandal <strong>klik</strong> der. Braketi vidala, <strong>6+2 pin</strong> ek gücü tak.',
                 'SSD’yi 2,5 inç yuvasına vidala; <strong>SATA veri</strong> kablosu anakarta, <strong>SATA güç</strong> kablosu güç kaynağına.'],
     'kontrol': 'Kart yuvaya tam girmiş ve vidalı, ek güç takılı; SSD’nin iki kablosu da sonuna kadar oturmuş.'},

    {'tur': 'uygulama', 'no': 6, 'ad': 'Kablo Düzeni, İlk Açılış', 'etiket': 'ADIM 6 · İLK AÇILIŞ',
     'ikon': IK_POST,
     'title': 'Topla, Onay Al, POST’u İzle',
     'prova_baslik': 'Prova: düzen ve ilk açılış',
     'gercek_baslik': 'Gerçek kasada yap',
     'prova': prova3d('s11-3d', 'Kartın üstünden geçen dağınık kablolar tepsinin arkasına alınıp bağlarla toplanıyor; kontrol turu yapılıyor; öğretmen onayından sonra güç düğmesine basılıyor, fanlar dönüyor, güç ışığı yanıyor ve monitörde POST sonucu beliriyor', 'oz-6.svg',
                      '<div class="fis-rozet guc-yok">' + svg(IK_FIS_ACIK) + '<span>Güç yalnız öğretmen onayıyla</span></div>'),
     'foto': 'DON-301-H10-6-post.jpg|Kabloları düzenlenmiş açık kasa ve monitörde ilk açılış (POST) ekranı',
     'talimat': ['Kabloları tepsinin <strong>arkasından</strong> geçir, bağlarla topla; fanların önünde kablo kalmasın.',
                 'Kontrolcü listeyi okur; <strong>öğretmen onay verince</strong> monitörü ekran kartına bağla, fişi tak, anahtarı I’ya al.',
                 'Güç düğmesine bas: fanlar döner, ekranda <strong>POST</strong> sonucu çıkar. Sorun varsa kapat, fişi çek, sonra bak.'],
     'kontrol': 'POST geçti: ekranda donanım bilgisi ya da UEFI’ye giriş iletisi göründü; sonuç forma yazıldı.'},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Kasa Montajı Simülatörü',
     'title': 'Kasayı Sen Kur',
     'desc': 'Tepsiden sıradaki parçayı ya da bağlantıyı seç; 3D kasada yerine koy. Yanlış sıra ya da yanlış bağlantı açıklamayla geri alınır. Ön panelde pinleri sen seçersin.',
     'ek': '<div class="em-tepsi" id="em-tepsi" role="group" aria-label="Parça tepsisi"></div>'
           '<div class="em-mesaj" id="em-mesaj" aria-live="polite">Önce güvenlik: ilk karta dikkat.</div>'
           '<div class="em-alt"><div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Tamamlanan aşama</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 9</span></div><div class="etk-ilerleme-bar"><span></span></div></div>'
           '<div class="em-sayac"><span>Hata</span><b id="em-hata">0</b></div><div class="em-sayac"><span>Süre</span><b id="em-sure">00:00</b></div></div>',
     'gorsel': {'3d': 's12-3d', 'aria': 'Etkinlik: yan yatırılmış boş kasa; parçalar ve kablolar seçilip sırayla takılıyor, sonunda ilk açılış yapılıyor', 'yedek': 'oz-6.svg',
                'yedek_metin': 'Bu cihazda 3D açılmadı. Montaj sırasını gerçek kasada öğretmeninle uygula.'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Kontrolcü Sensin',
     'title': 'Onayla ya da Düzelt',
     'desc': 'Her kart bir grubun kasasından bir an. Kontrolcü olarak kararını ver: montaj doğruysa onayla, değilse doğru düzeltmeyi seç.',
     'tip': ['💡', 'Dört şeye bak: ayak sayısı, fişin türü, ön panelde + uçlar, monitör kablosunun takıldığı çıkış.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Kart</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 6</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'kontrolcu'}},

    {'tur': 'ozet', 'alt': 'Kasada yaptığın 6 adım:', 'kartlar': [
        ('oz-1.svg', 'Kasa ve G/Ç', 'Fiş çekili, kapak sökülür; plaka içeriden, kartla aynı yönde.'),
        ('oz-2.svg', 'Ayak ve Anakart', 'Ayak sayısı = delik sayısı; portlar plakaya, vidalar çapraz.'),
        ('oz-3.svg', 'Güç', 'Kaynak alt bölmede; 24-pin ön kenarda, CPU 8-pin üst kenarda.'),
        ('oz-4.svg', 'Ön Panel', 'Şemaya göre; düğmeler kutupsuz, ışıklarda + uç + pine.'),
        ('oz-5.svg', 'Kart ve Disk', 'Yuva kapakları, x16 mandalı, 6+2 güç; SSD’ye veri ve güç.'),
        ('oz-6.svg', 'İlk Açılış', 'Kablolar toplu, öğretmen onayı, monitör karta, POST.'),
    ]},
]
