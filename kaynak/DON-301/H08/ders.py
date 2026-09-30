# DON-301 H08 — Uyumluluk ve Sistem Toplama (Format K+U, lise)
# Fiyat yok: bütçe göreli "puan" birimiyle verilir (öğretmen notu: güncel fiyatlar derste güncel kaynaklardan alınır).
MODELLER = []

DERS = {
    'grade': 'lise',
    'hafta': '8. Hafta',
    'baslik': 'Uyumluluk ve Sistem Toplama',
    'aciklama': 'Kullanım amacına göre parça seç; soket, bellek, boyut ve güç uyumunu gerekçesiyle denetle, bütçe içinde dengeli bir liste hazırla.',
    'hedefler': [
        'Kullanım amacına (ofis, tasarım, oyun, yazılım) göre sistem önerebileceğim.',
        'İşlemci–anakart soketini, çipset desteğini ve RAM uyumunu denetleyebileceğim.',
        'Kasa, soğutucu ve ekran kartının boyut uyumunu denetleyebileceğim.',
        'Güç hesabı yaparak bütçe içinde darboğazsız bir parça listesi hazırlayabileceğim.',
    ],
    'hedef_simgeler': [
        '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>',
        '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
        '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 13h8M8 17h5M8 8h8"/>',
        '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    ],
    'bolumler': [
        ['İhtiyaç', 'Kullanım profili, öncelikler'],
        ['Uyumluluk', 'Soket, RAM, boyut, güç'],
        ['Liste', 'Darboğaz, bütçe, parça listesi'],
    ],
    'quiz': [
        {'q': '“Soket A · ATX · DDR5” anakart için hangi işlemci–bellek ikilisi uyumludur?',
         'opts': ['Soket A işlemci + DDR5 bellek', 'Soket B işlemci + DDR5 bellek', 'Soket A işlemci + DDR4 bellek', 'Soket B işlemci + DDR4 bellek'], 'correct': 0,
         'fb': 'İşlemcinin soketi anakartınkiyle aynı olmalı; bellek de anakart yuvalarının nesliyle (DDR5) eşleşmeli. DDR4 modül DDR5 yuvasına girmez.'},
        {'q': 'Görseldeki kasaya bu ekran kartı takılabilir mi?<span class="q-gorsel"><!--@dahil:svg-quiz-boy.svg--></span>',
         'opts': ['Evet, uzunluk yalnız hava akışını etkiler', 'Evet, kasa ATX ise her kart sığar', 'Hayır, kart kasanın izin verdiği uzunluktan 25 mm uzun', 'Hayır, ekran kartları yalnız ITX kasaya takılır'], 'correct': 2,
         'fb': 'Kasanın teknik özelliğindeki en büyük ekran kartı uzunluğu (280 mm) kartın boyuyla (305 mm) karşılaştırılır; kart ön fanlara çarpar.'},
        {'q': 'Ece’nin sisteminde işlemci 105 W, ekran kartı 285 W, diğer parçalar yaklaşık 60 W. %30 pay bırakmak isteyen Ece en az hangi güç kaynağını seçmeli?',
         'opts': ['450 W', '650 W', '550 W', '1200 W'], 'correct': 1,
         'fb': '105 + 285 + 60 = 450 W; 450 × 1,3 = 585 W. 585 W’tan büyük en küçük seçenek 650 W’tır; 1200 W gereksiz yere bütçe harcar.'},
        {'q': 'Deniz oyun bilgisayarında bütçenin çoğunu 12 çekirdekli işlemciye verdi, giriş seviyesi ekran kartı seçti. Oyunlarda kare hızı düşük. En doğru öneri hangisidir?',
         'opts': ['Belleği 64 GB’a çıkarmalı', 'Daha güçlü güç kaynağı almalı', 'Depolamayı HDD’den SSD’ye geçirmeli', 'Darboğaz ekran kartında; bütçeyi işlemciden ekran kartına kaydırmalı'], 'correct': 3,
         'fb': 'Oyunda kareleri çoğunlukla ekran kartı üretir. Zayıf kart tüm sistemi yavaşlatır (darboğaz); bütçe dengelenmelidir.'},
    ],
    'bitis': 'Parçaları ihtiyaca göre seçip her uyumluluk kuralını gerekçesiyle denetleyebiliyorsun!',
}

KAPAK = {'svg': 'kapak.svg'}

ILERLEME = ('<div class="etk-ilerleme" id="%s" aria-live="polite"><div class="etk-ilerleme-ust"><span>%s</span>'
            '<span class="etk-ilerleme-sayi"><b>0</b> / %d</span></div><div class="etk-ilerleme-bar"><span></span></div></div>')

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Güçlü Parçalar, Çalışmayan Sistem',
     'desc': 'Deniz en güçlü parçaları seçti: 12 çekirdekli işlemci, üst seviye ekran kartı, 850 W güç kaynağı. Ama bilgisayar toplanamıyor. Sence en olası neden hangisi?',
     'secenekler': ['Parçalar çok güçlü olduğu için birbirini zorluyor.', 'En az bir parça diğerine uymuyor: soket, bellek türü ya da boyut.', '850 W güç kaynağı anakart için fazla; anakartı yakar.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'terim', 'terimler': [
        ('Socket', 'Soket', 'İşlemcinin anakarta oturduğu yuva; iki parçada aynı tür olmalı.'),
        ('Chipset', 'Yonga seti', 'Anakartın hangi işlemci neslini ve özelliği desteklediğini belirler.'),
        ('Firmware update', 'Bellenim (UEFI) güncellemesi', 'Anakarta yeni işlemci nesli desteği ekleyen güncelleme.'),
        ('DIMM · DDR4/DDR5', 'Bellek modülü · nesil', 'Nesiller farklı çentiklidir; birbirinin yuvasına girmez.'),
        ('Form Factor', 'Biçim faktörü', 'Anakart ve kasa ölçü standardı: ATX, mATX, ITX.'),
        ('M.2 NVMe · SATA', 'Depolama arayüzleri', 'M.2 yuvasına takılan SSD ya da kablolu SATA sürücü.'),
        ('TDP', 'Isıl tasarım gücü', 'Soğutucunun uzaklaştırması gereken ısı için verilen değer (W).'),
        ('PSU · Headroom', 'Güç kaynağı · Pay', 'Toplam tüketimin üstünde bırakılan güç (%20–30).'),
        ('PCIe power', 'PCIe ek güç konnektörü', 'Ekran kartının güç kaynağından beslendiği 8 pinli kablo (≈ 150 W).'),
        ('Bottleneck', 'Darboğaz', 'Sistemin hızını en zayıf bileşenin sınırlaması.'),
    ]},

    {'tur': 'adim', 'no': 1, 'ad': 'İhtiyaç Profili', 'etiket': 'ADIM 1 · İHTİYAÇ',
     'ikon': '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>',
     'title': 'Önce Kullanıcı, Sonra Parça',
     'desc': 'Sistem, kullanıcının işine göre seçilir. <strong>İhtiyaç profili</strong>; hangi programların çalışacağını, en az gereksinimleri ve bütçeyi yazar. Ofis işi az güç ister. Tasarım ve yazılım geliştirme çok bellek ve çekirdek, oyun güçlü ekran kartı ister. Bütçe (burada <strong>puan</strong>) en çok önceliğe ayrılır.',
     'tip': ['👤', 'Bir profil seç: bütçenin hangi parçaya ağırlık verdiğini ve en az gereksinimleri karşılaştır.'],
     'genis': True,
     'gorsel': {'2d': 'profil'}},

    {'tur': 'adim', 'no': 2, 'ad': 'Soket–Çipset', 'etiket': 'ADIM 2 · SOKET–ÇİPSET',
     'ikon': '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
     'title': 'İşlemci Anakarta Oturur mu, Tanınır mı?',
     'desc': 'İlk kural: işlemci ile anakartın <strong>soketi</strong> aynı olmalı; farklı sokette temas düzeni uymaz. İkinci kural <strong>çipset</strong> desteğidir: aynı sokette bile yeni nesil işlemci, eski çipsetli anakartta ancak <strong>UEFI güncellemesinden</strong> sonra tanınır. Üreticinin işlemci destek listesi kontrol edilir.',
     'tip': ['▶', 'Tahmin et: Soket A 2. nesil işlemci, 1. nesil çipsetli Soket A anakartta açılır mı? Sonra izle.'],
     'genis': True,
     'gorsel': {'2d': 'soket'}},

    {'tur': 'adim', 'no': 3, 'ad': 'RAM Nesli', 'etiket': 'ADIM 3 · RAM NESLİ',
     'ikon': '<rect x="3" y="8" width="18" height="8" rx="1"/><path d="M6 16v3M10 16v3M14 16v3M18 16v3"/>',
     'title': 'Bellek Yuvanın Nesline Uymalı',
     'desc': 'Anakart ya <strong>DDR4</strong> ya <strong>DDR5</strong> yuvalıdır; ikisi birden olmaz. İki nesil aynı boyda ve 288 temaslıdır ama çentik yeri ve gerilimi farklıdır. Modül sayısı <strong>yuva sayısını</strong> aşamaz: ITX anakartta çoğunlukla 2 yuva vardır. Tek modül çalışır ama <strong>tek kanal</strong> bant genişliği çift kanalın yaklaşık yarısıdır.',
     'tip': ['🔍', 'Yuva ve modül seç: çentik hizasını ve yuvaların dolmasını izle.'],
     'genis': True,
     'gorsel': {'2d': 'bellek'}},

    {'tur': 'adim', 'no': 4, 'ad': 'Boyut Uyumu', 'etiket': 'ADIM 4 · BOYUT',
     'ikon': '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 13h8M8 17h5M8 8h8"/>',
     'title': 'Kasaya Sığıyor mu?',
     'desc': 'Kasa üç ölçüyle denetlenir. <strong>Form faktörü</strong>: ATX kasa ATX, mATX ve ITX kartı alır; küçük kasa büyük kartı almaz. <strong>Ekran kartı uzunluğu</strong> kasanın verdiği en büyük değeri aşmamalı. <strong>Soğutucu yüksekliği</strong> yan kapağın izin verdiği değerden küçük olmalı. Değerler kasanın teknik özellik sayfasında milimetre olarak yazar.',
     'tip': ['📏', 'Kasa, anakart, ekran kartı ve soğutucu seç; kırmızı bölgeye taşan parçayı bul.'],
     'genis': True,
     'gorsel': {'2d': 'boyut'}},

    {'tur': 'adim', 'no': 5, 'ad': 'Güç ve Konnektör Yeterliliği', 'etiket': 'ADIM 5 · GÜÇ',
     'ikon': '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
     'title': 'Tüketim + Pay ≤ Güç Kaynağı',
     'desc': 'Tahmini tüketim: işlemci <strong>TDP</strong> + ekran kartı gücü + diğer parçalar (anakart, bellek, sürücüler, fanlar). Anlık sıçramalar ve verim için <strong>%20–30 pay</strong> bırakılır: gereken ≈ tüketim × 1,3. Güç yetse bile <strong>konnektör</strong> denetlenir: ekran kartının istediği 8 pinli PCIe kablo sayısı güç kaynağında olmalı.',
     'tip': ['⚡', 'Tahmin et: 65 W işlemci + 285 W ekran kartı için 550 W yeter mi? Sonra hesabı izle.'],
     'genis': True,
     'gorsel': {'2d': 'guc'}},

    {'tur': 'adim', 'no': 6, 'ad': 'Darboğaz ve Bütçe', 'etiket': 'ADIM 6 · DENGE',
     'ikon': '<path d="M3 6h7l2 4 2-4h7M3 18h7l2-4 2 4h7"/>',
     'title': 'En Zayıf Parça Hızı Belirler',
     'desc': '<strong>Darboğaz</strong>, sistemin en zayıf parçasının diğerlerini beklettiği durumdur: oyunda zayıf ekran kartı, derlemede az çekirdek ya da az bellek. Uyumlu bir liste yetmez; bütçe profilin önceliğine göre <strong>dengeli</strong> dağıtılır. Gereğinden güçlü parça da bütçeyi başka ihtiyaçtan alır.',
     'tip': ['⚖', 'Aynı oyun bütçesiyle üç listeyi karşılaştır: hangisi dengeli?'],
     'genis': True,
     'gorsel': {'2d': 'denge'}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Uyumluluk Denetleyicisi',
     'title': 'Deniz’in Listesini Düzelt',
     'desc': 'Deniz’in oyun listesinde (bütçe <strong>650 puan</strong>) kırmızı ışıklar var. Parçaları değiştirip hepsini söndür. Bir kurala dokun: gerekçesi altta çıkar.',
     'tip': ['💡', 'Önce işlemci–anakart ve bellek, sonra kasa, en son güç kaynağı: her değişiklik güç hesabını da değiştirir.'],
     'ek': '<ul class="gorevler" id="uy1-gorevler">'
           '<li><span class="g-isaret"></span><span>Soket: işlemci ile anakart eşleşsin</span></li>'
           '<li><span class="g-isaret"></span><span>Bellek: tür ve modül sayısı uysun</span></li>'
           '<li><span class="g-isaret"></span><span>Boyut: anakart, kart ve soğutucu sığsın</span></li>'
           '<li><span class="g-isaret"></span><span>Güç: güç ve konnektör yetsin</span></li>'
           '<li><span class="g-isaret"></span><span>Denge ve bütçe: darboğaz yok, en çok 650 puan</span></li></ul>' +
           ILERLEME % ('ilerleme-1', 'Tamamlanan görev', 5),
     'sinif': 'uy-etk',
     'gorsel': {'panel': 'uy-duzelt'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Parça Listesi',
     'title': 'Profiline Göre Liste Hazırla',
     'desc': 'Bir profil seç ve boş listeyi doldur. Dört ölçüt yeşil olunca parça listen hazır olur. Sonra listeyi defterine geçir; her parçanın <strong>güncel fiyatını</strong> öğretmeninin gösterdiği iki kaynaktan bul ve yanına yaz.',
     'tip': ['🧾', 'Puan yalnız karşılaştırma içindir; gerçek fiyat değildir. Fiyatlar zamanla değişir, bu yüzden her projede yeniden araştırılır.'],
     'ek': '<div class="etk-durum" id="uy2-durum">'
           '<div class="etk-durum-satir"><span class="etk-durum-isaret"></span><span>Uyumluluk: kırmızı ışık yok</span></div>'
           '<div class="etk-durum-satir"><span class="etk-durum-isaret"></span><span>İhtiyaç: profilin en az gereksinimleri</span></div>'
           '<div class="etk-durum-satir"><span class="etk-durum-isaret"></span><span>Denge: darboğaz uyarısı yok</span></div>'
           '<div class="etk-durum-satir"><span class="etk-durum-isaret"></span><span>Bütçe: profil bütçesi aşılmadı</span></div></div>' +
           ILERLEME % ('ilerleme-2', 'Karşılanan ölçüt', 4),
     'sinif': 'uy-etk',
     'gorsel': {'panel': 'uy-liste'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'İhtiyaç Profili', 'Programlar, en az gereksinim, bütçe ve öncelik.'),
        ('oz-2.svg', 'Soket–Çipset', 'Aynı soket şart; yeni nesil için UEFI güncellemesi gerekebilir.'),
        ('oz-3.svg', 'RAM Nesli', 'DDR4 ≠ DDR5; modül sayısı ≤ yuva; 2 modül çift kanal.'),
        ('oz-4.svg', 'Boyut Uyumu', 'Form faktörü, kart uzunluğu, soğutucu yüksekliği (mm).'),
        ('oz-5.svg', 'Güç ve Konnektör', 'Tüketim × 1,3 ≤ güç kaynağı; 8 pinli kablo sayısı yeter.'),
        ('oz-6.svg', 'Darboğaz ve Bütçe', 'Bütçe önceliğe göre dengeli dağıtılır.'),
    ]},
]
