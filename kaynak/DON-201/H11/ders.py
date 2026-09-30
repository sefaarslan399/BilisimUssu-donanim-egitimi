# DON-201 H11 — Atölye 2: Disk Sök–Tak, Toplama ve İlk Açılış (Format U)
MODELLER = ['M-MASAUSTU-ACIK', 'M-HDD', 'M-SSD', 'M-KABLO-SATA']

ROZET_FIS = '<div class="fis-rozet"><!--@dahil:fis-rozet.svg--><span>Fiş çekili</span></div>'

DERS = {
    'hafta': '11. Hafta',
    'baslik': 'Atölye 2: Disk Sök–Tak, Toplama ve İlk Açılış',
    'aciklama': 'Önce 3D provada izle, sonra gerçek bilgisayarda diski söküp tak ve öğretmen onayıyla aç.',
    'hedefler': [
        'Diskin veri ve güç kablolarını birbirinden ayırt edebileceğim.',
        'Diski kızağından söküp yeniden takabileceğim.',
        'Kasayı kapatıp öğretmen kontrolünden sonra açılış testini yapabileceğim.',
        'Sistem bilgisinde RAM’in ve diskin göründüğünü doğrulayabileceğim.',
    ],
    'hedef_simgeler': [
        '<path d="M4 17c4 0 4-10 8-10s4 10 8 10"/><circle cx="4" cy="17" r="1.6"/><circle cx="20" cy="17" r="1.6"/>',
        '<rect x="3" y="8" width="18" height="10" rx="2"/><path d="M7 8V5h10v3"/><path d="M8 13h8"/>',
        '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><polyline points="9 12 11 14 15 10"/>',
        '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><polyline points="8 10 11 13 16 8"/>',
    ],
    'bolumler': [
        ['Kabloları Tanı', 'Veri ve güç, L uçlar'],
        ['Disk Sök–Tak', 'Kızak, vida, klik'],
        ['Kapat ve Aç', 'Onay, açılış, doğrulama'],
    ],
    'quiz': [
        {'q': 'Diskin arkasına iki kablo takılır. Veri kablosunu güç kablosundan nasıl ayırt edersin?',
         'opts': ['Veri kablosunun ucu dar (7 pin), güç kablosununki geniştir (15 pin)', 'İkisi aynıdır, hangisi nereye takılsa olur',
                  'Güç kablosu her zaman kırmızı ve yassıdır', 'Veri kablosunun ucu daha geniştir'], 'correct': 0,
         'fb': 'Veri ucu dar ve 7 pinlidir; güç ucu geniş ve 15 pinlidir. Renkler üreticiye göre değişebilir, uç genişliği değişmez.'},
        {'q': 'Görseldeki kablo ucu porta neden girmiyor?<span class="q-gorsel"><!--@dahil:svg-quiz-ters.svg--></span>',
         'opts': ['Kablo bozuk olduğu için', 'Port kablodan büyük olduğu için', 'Kablo ucundaki L, porttaki L’ye göre ters durduğu için', 'Bu bir güç portu olduğu için'], 'correct': 2,
         'fb': 'SATA uçları L biçimlidir. Uç çevrilip L’ler aynı yöne gelince kablo düz itilir ve oturur.'},
        {'q': 'Deniz diski taktı, kabloları kontrol etti ve kapağı kapattı. Şimdi ne yapmalı?',
         'opts': ['Fişi takıp bilgisayarı hemen açmalı', 'Öğretmenini çağırıp kontrol ve izin beklemeli', 'Kabloları bir kez daha söküp takmalı', 'Güç düğmesine birkaç kez hızlıca basmalı'], 'correct': 1,
         'fb': 'Açılış yalnızca öğretmen kontrolünden sonra, öğretmenin izniyle yapılır. Fişi öğretmen takar.'},
        {'q': 'Ece’nin grubu bilgisayarı açtı. Ekranda “açılış diski bulunamadı” yazıyor. En olası neden hangisidir?',
         'opts': ['Monitör kablosu takılı değil', 'Klavye bozuk', 'Kasa fanı çok hızlı dönüyor', 'Diskin veri ya da güç kablosu tam oturmamış'], 'correct': 3,
         'fb': 'Ekranda yazı çıktığına göre monitör çalışıyor. Disk görünmüyorsa önce fiş çekilir, sonra disk kabloları kontrol edilir.'},
        {'q': 'Derinleş (bonus): BIOS ekranında bellek için “8192 MB” yazıyor. Bu yaklaşık kaç GB eder?',
         'opts': ['8 GB', '80 GB', '819 GB', '1 GB'], 'correct': 0,
         'fb': 'Bellekte 1 GB = 1024 MB kabul edilir. 8192 ÷ 1024 = 8, yani 8 GB. Bu soru puanını düşürmez.'},
    ],
    'bitis': 'Diski söküp doğru taktın, kasayı kapattın ve bilgisayarı öğretmen onayıyla güvenle açtın!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'Sabit disk; arkasına L uçlu kırmızı veri kablosu ve renkli telli güç kablosu takılı', 'yedek': 'yedek-disk.svg'}

HAZIRLIK = '''      <div class="layout-full malzeme-duzen hazirlik">
        <div class="csub">Her grup masasında bunlar olsun:</div>
        <div class="malzeme-izgara dort">
          <div class="malzeme-kart"><div class="malzeme-resim"><!--@dahil:m-bilgisayar.svg--></div><div class="malzeme-ad">Eski masaüstü bilgisayar</div><div class="malzeme-not">Geçen haftaki bilgisayarınız</div></div>
          <div class="malzeme-kart"><div class="malzeme-resim"><!--@dahil:m-tornavida.svg--></div><div class="malzeme-ad">Yıldız tornavida</div><div class="malzeme-not">Disk ve kapak vidaları için</div></div>
          <div class="malzeme-kart"><div class="malzeme-resim"><!--@dahil:m-bileklik.svg--></div><div class="malzeme-ad">Antistatik bileklik</div><div class="malzeme-not">Kasanın boyasız metaline bağlı</div></div>
          <div class="malzeme-kart"><div class="malzeme-resim"><!--@dahil:m-kutu.svg--></div><div class="malzeme-ad">Parça kutusu</div><div class="malzeme-not">Sökülen vidalar için</div></div>
        </div>
        <div class="roller">
          <div class="rol"><span class="rol-simge">🛠️</span><div><b>Uygulayan</b><span>Diske ve kablolara dokunan tek kişi.</span></div></div>
          <div class="rol"><span class="rol-simge">✅</span><div><b>Kontrolcü</b><span>Talimatı okur, uçları kontrol eder.</span></div></div>
          <div class="rol"><span class="rol-simge">📷</span><div><b>Belgeleyen</b><span>Adımları not eder, fotoğraf ister.</span></div></div>
        </div>
        <div class="guv-serit" id="guvenlik-kontrol">
          <div class="guv-bas"><span class="guv-simge" aria-hidden="true"><!--@dahil:fis-rozet.svg--></span>Başlamadan güvenlik kontrolü</div>
          <div class="gk-liste" role="group" aria-label="Güvenlik kontrol listesi"><button type="button" class="gk-madde"><span class="gk-kutu"></span>Fiş prizden çekildi</button><button type="button" class="gk-madde"><span class="gk-kutu"></span>Bileklik takıldı ve bağlandı</button><button type="button" class="gk-madde"><span class="gk-kutu"></span>Kapak açık, vidalar kutuda</button></div>
          <div class="gk-sonuc" aria-live="polite"></div>
          <div class="guv-not">⚠ Kablolar yalnız fiş çekiliyken takılır. Açılışa öğretmenin karar verir.</div>
        </div>
      </div>'''

ONAY = ('<div class="guvenlik-kontrol onay-kontrol" id="onay-kontrol"><div class="gk-sahne"><!--@dahil:adim5-onay.svg--></div>'
        '<div class="gk-liste" role="group" aria-label="Kapanış ve öğretmen onayı kontrol listesi">'
        '<button type="button" class="gk-madde" data-gk="g-kablo"><span class="gk-kutu"></span>Kablolar tam takılı</button>'
        '<button type="button" class="gk-madde" data-gk="g-alet"><span class="gk-kutu"></span>Kasada vida ve alet yok</button>'
        '<button type="button" class="gk-madde" data-gk="g-kapak"><span class="gk-kutu"></span>Kapak kapalı, vidalar sıkı</button>'
        '<button type="button" class="gk-madde gk-ogretmen" data-gk="g-ogretmen" disabled><span class="gk-kutu"></span>Öğretmen onayladı</button></div>'
        '<div class="gk-sonuc" aria-live="polite"></div></div>'
        '<div class="fis-rozet" id="onay-rozet"><span class="rozet-cekili"><!--@dahil:fis-rozet.svg--></span>'
        '<span class="rozet-onay"><!--@dahil:fis-onay.svg--></span><span class="rozet-yazi">Fiş çekili</span></div>')

ABOOT = ('<div class="aboot" id="aboot" aria-label="Açılış provası: güç ışığı, fan, başlangıç ekranı ve sistem bilgisi"></div>'
         '<div class="fis-rozet fis-rozet--onay"><!--@dahil:fis-onay.svg--><span>Öğretmen onayladı</span></div>')

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Ters Tutarsan Girer mi?',
     'desc': 'Disk kablosunun ucu L harfi gibidir. Ucu ters tutup porta bastırırsan sence ne olur?',
     'secenekler': ['Girer ama disk görünmez.', 'Girmez; L biçimi buna izin vermez.', 'Girer ve disk bozulur.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'serbest', 'baslik': 'Hazırlık ve Güvenlik', 'rozet': 'Hazırlık',
     'ikon': '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
     'govde': HAZIRLIK},

    {'tur': 'uygulama', 'no': 1, 'ad': 'Diski ve Kablolarını Bul', 'etiket': 'ADIM 1 · BUL',
     'ikon': '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
     'title': 'Veri Kablosu mu, Güç Kablosu mu?',
     'prova': {'3d': 's5-3d', 'aria': 'Açık kasanın önündeki kızakta disk parlıyor; ince kırmızı veri kablosu mavi, geniş uçlu renkli telli güç kablosu turuncu etiketle gösteriliyor',
               'yedek': 'oz-1.svg', 'ek': ROZET_FIS},
     'foto': 'DON-201-H11-1-disk-kablolar.jpg|Kızaktaki disk, takılı kırmızı veri kablosu ve renkli telli güç kablosu',
     'talimat': ['Diski bul: kasanın önündeki <strong>kızakta</strong> durur.',
                 '<strong>İnce, yassı</strong> kablo veri kablosudur; anakarta gider.',
                 '<strong>Geniş uçlu, renkli telli</strong> kablo güç kablosudur.'],
     'kontrol': 'Uygulayan iki kabloyu gösterip adlarını söyledi.'},

    {'tur': 'uygulama', 'no': 2, 'ad': 'Diski Sök', 'etiket': 'ADIM 2 · SÖK',
     'ikon': '<rect x="3" y="10" width="14" height="9" rx="1.5"/><path d="M21 7h-8M16 4l-3 3 3 3"/>',
     'title': 'Önce Kablolar, Sonra Vidalar',
     'prova': {'3d': 's6-3d', 'aria': 'Kablo uçları ucundan tutulup çekiliyor, kızaktaki iki vida sökülüyor, disk geriye kaydırılıp kasadan çıkarılıyor',
               'yedek': 'oz-2.svg', 'ek': ROZET_FIS},
     'foto': 'DON-201-H11-2-disk-sok.jpg|Ucundan tutularak çıkarılan SATA kablosu ve kızaktan kaydırılan disk',
     'talimat': ['Kabloları <strong>ucundan</strong> tutup düz çek; kablodan asılma.',
                 'Mandallı uçta önce <strong>mandala bastır</strong>.',
                 'Vidaları sök, <strong>kutuya</strong> koy; diski kaydırıp çıkar.'],
     'kontrol': 'Disk masada, vidalar kutuda, kablo uçları sağlam.'},

    {'tur': 'uygulama', 'no': 3, 'ad': 'Diski Tak', 'etiket': 'ADIM 3 · TAK',
     'ikon': '<rect x="7" y="10" width="14" height="9" rx="1.5"/><path d="M3 7h8M8 4l3 3-3 3"/>',
     'title': 'L Uca Bak, Sonra Tak',
     'prova': {'3d': 's7-3d', 'aria': 'Disk kızağa kayıyor ve vidalanıyor; veri kablosu L ucu ters tutulunca girmiyor, çevrilince klik diye oturuyor; güç kablosu da takılıyor',
               'yedek': 'oz-3.svg', 'ek': ROZET_FIS},
     'foto': 'DON-201-H11-3-disk-tak.jpg|L biçimli ucu porta hizalanıp takılan SATA veri kablosu',
     'talimat': ['Diski konnektörleri <strong>arkaya</strong> bakacak şekilde kızağa kaydır.',
                 'Delikleri hizala, vidaları tak; <strong>fazla sıkma</strong>.',
                 'Kablonun L ucunu porttaki L ile <strong>hizala</strong>, düz it.'],
     'kontrol': 'Disk sallanmıyor; iki kablo da klik diye oturdu.'},

    {'tur': 'uygulama', 'no': 4, 'ad': 'Kabloları Kontrol Et', 'etiket': 'ADIM 4 · KONTROL',
     'ikon': '<circle cx="12" cy="12" r="9"/><polyline points="8 12 11 15 16 9"/>',
     'title': 'Boşluk Yok, Kablo Sıkışmıyor',
     'prova': {'3d': 's8-3d', 'aria': 'Yarım takılı güç kablosu ucu itilip oturtuluyor, veri kablosunun mandalı ve anakarttaki ucu kontrol ediliyor',
               'yedek': 'oz-4.svg', 'ek': ROZET_FIS},
     'foto': 'DON-201-H11-4-kablo-kontrol.jpg|Tam oturmuş SATA uçları ve anakarttaki SATA girişi',
     'talimat': ['Her ucun porta <strong>tam</strong> oturduğuna bak; boşluk kalmasın.',
                 'Veri kablosunun öbür ucunu <strong>anakartta</strong> kontrol et.',
                 'Kablolar fana ya da keskin kenara <strong>değmesin</strong>.'],
     'kontrol': 'Kontrolcü üç ucu tek tek gördü ve onayladı.'},

    {'tur': 'uygulama', 'no': 5, 'ad': 'Kapağı Kapat, Öğretmen Onayı', 'etiket': 'ADIM 5 · ONAY',
     'ikon': '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3h6v3H9z"/><polyline points="9 13 11 15 15 11"/>',
     'title': 'Kapağı Kapat, Öğretmenini Çağır',
     'prova': {'html': ONAY},
     'foto': 'DON-201-H11-5-ogretmen-onay.jpg|Kapağı kapalı kasa ve kontrol listesini inceleyen öğretmen',
     'talimat': ['Kasada vida ya da alet <strong>kalmadığına</strong> bak.',
                 'Kapağı tak; vidaları <strong>kutudan</strong> alıp sık.',
                 'Öğretmenini çağır; <strong>onay vermeden</strong> fişe dokunma.'],
     'kontrol': 'Öğretmen kontrol etti ve onay verdi; fişi öğretmen takar.'},

    {'tur': 'uygulama', 'no': 6, 'ad': 'Açılış ve Doğrulama', 'etiket': 'ADIM 6 · AÇ',
     'ikon': '<path d="M12 2v9"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/>',
     'title': 'Açılışı İzle, Sistem Bilgisini Oku',
     'prova': {'html': ABOOT},
     'foto': 'DON-201-H11-6-sistem-bilgisi.jpg|Açılan bilgisayarda RAM ve diskin göründüğü sistem bilgisi ekranı',
     'talimat': ['Öğretmenin izniyle <strong>güç düğmesine</strong> bir kez bas.',
                 'Güç ışığının yandığını, <strong>fanın</strong> döndüğünü gözle.',
                 'Sistem bilgisinde <strong>RAM</strong> ve <strong>disk</strong> satırlarını bul.'],
     'kontrol': 'Sistem bilgisinde RAM ve disk görünüyor.'},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Kabloları Doğru Tak',
     'title': 'L Ucu Hizala, Kabloyu Tak',
     'desc': 'Bir kablo seç. Ucundaki L ters duruyorsa <strong>Çevir</strong>’e bas. Sonra diskteki doğru girişe dokun.',
     'tip': ['🔎', '<strong>Dar</strong> uç veri girişine, <strong>geniş</strong> uç güç girişine takılır.'],
     'ek': ('<div class="secici kablo-sec" role="group" aria-label="Kablo seç">'
            '<button type="button" data-k="veri" aria-pressed="false"><span class="kablo-renk kablo-renk--veri" aria-hidden="true"></span>Veri kablosu</button>'
            '<button type="button" data-k="guc" aria-pressed="false"><span class="kablo-renk kablo-renk--guc" aria-hidden="true"></span>Güç kablosu</button></div>'
            '<div class="etk-durum" id="etk-durum" aria-live="polite">'
            '<div class="etk-durum-satir" data-d="veri"><span class="etk-durum-isaret"></span>Veri kablosu veri girişinde</div>'
            '<div class="etk-durum-satir" data-d="guc"><span class="etk-durum-isaret"></span>Güç kablosu güç girişinde</div>'
            '<div class="etk-mesaj">Önce bir kablo seç.</div></div>'),
     'gorsel': {'3d': 's11-3d', 'aria': 'Etkinlik: veri ve güç kablosunun L uçlarını çevirip diskteki doğru girişlere takma', 'yedek': 'oz-3.svg',
                'yedek_metin': 'Bu cihazda 3D açılmadı. Gerçek kablo ucuyla dene.'}},

    {'tur': 'derinles', 'ad': 'BIOS’ta Donanımı Oku',
     'title': 'Açılışta Ayar Ekranına Bak',
     'desc': 'Açılışta ekranda yazan tuşa basınca <strong>BIOS</strong> ekranı açılır. BIOS, açılışta parçaları yoklayan küçük bir programdır; yoklama yapan öğretmen gibi. Burada RAM’i ve diski görebilirsin.',
     'tip': ['🔎', 'Yalnız oku, ayar değiştirme. <strong>Esc</strong> ile kaydetmeden çık.'],
     'genis': True,
     'gorsel': {'2d': 'bios'}},

    {'tur': 'ozet', 'alt': 'Atölyede yaptığın 6 adım:', 'kartlar': [
        ('oz-1.svg', 'Bul', 'Dar uç veri, geniş uç güç.'),
        ('oz-2.svg', 'Sök', 'Kablo ucundan tut, vidalar kutuya.'),
        ('oz-3.svg', 'Tak', 'L ucu hizala, düz it: klik.'),
        ('oz-4.svg', 'Kontrol', 'Boşluk yok, kablo sıkışmıyor.'),
        ('oz-5.svg', 'Onay', 'Kapak kapalı, öğretmen onayladı.'),
        ('oz-6.svg', 'Aç ve doğrula', 'RAM ve disk görünüyor.'),
    ]},
]
