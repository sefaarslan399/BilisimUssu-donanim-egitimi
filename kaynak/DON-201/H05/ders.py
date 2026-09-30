# DON-201 H05 — Anakart (Format K)
MODELLER = ['M-ANAKART', 'M-KASA-TURLERI', 'M-RAM']

DERS = {
    'hafta': '5. Hafta',
    'baslik': 'Anakart',
    'aciklama': 'Kasa türlerini karşılaştır, anakartın parçaları nasıl bağladığını gör; soketi, yuvaları ve portları bul.',
    'hedefler': [
        'Anakartın parçaları birbirine nasıl bağladığını açıklayabileceğim.',
        'İşlemci soketini, RAM yuvalarını ve genişleme yuvalarını anakartta bulabileceğim.',
        'Arka paneldeki portları tanıyabileceğim.',
        'Masaüstü, dizüstü ve tümleşik bilgisayarı karşılaştırabileceğim.',
    ],
    'hedef_simgeler': [
        '<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 6h10M6 8l5 8M18 8l-5 8"/>',
        '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
        '<rect x="3" y="6" width="18" height="12" rx="2"/><rect x="7" y="10" width="4" height="4"/><rect x="13" y="10" width="4" height="4"/>',
        '<rect x="3" y="3" width="7" height="18" rx="1.5"/><rect x="13" y="7" width="8" height="8" rx="1"/><path d="M12 19h10"/>',
    ],
    'bolumler': [
        ['Kasa Türleri', 'Masaüstü, dizüstü, tümleşik'],
        ['Anakart', 'Yollar, soket, RAM yuvaları'],
        ['Yuvalar ve Portlar', 'PCIe, M.2, arka panel'],
    ],
    'quiz': [
        {'q': 'Anakartın bilgisayardaki asıl görevi nedir?',
         'opts': ['Bütün parçaları birbirine bağlamak', 'Yalnız görüntüyü ekrana vermek', 'Dosyaları kalıcı olarak saklamak', 'Bilgisayarı serin tutmak'], 'correct': 0,
         'fb': 'Anakart, işlemciyi, RAM’i, diskleri ve kartları bakır yollarla birbirine bağlar.'},
        {'q': 'Görselde işaretli yuva hangisidir?<span class="q-gorsel"><!--@dahil:svg-quiz-pcie.svg--></span>',
         'opts': ['RAM yuvası', 'İşlemci soketi', 'PCIe x16 yuvası', 'SATA portu'], 'correct': 2,
         'fb': 'Kartın alt yarısında yatay duran en uzun yuva PCIe x16’dır. RAM yuvaları soketin yanında dizilir.'},
        {'q': 'Ece monitör kablosunu kasanın arkasına takacak. Hangi bölgeye bakmalı?',
         'opts': ['Güç kaynağının fanına', 'Anakartın arka paneline', 'RAM yuvalarının mandallarına', 'SATA portlarına'], 'correct': 1,
         'fb': 'HDMI ve diğer portlar anakartın arka panelindedir; kasanın arkasından dışarı bakar.'},
        {'q': 'Deniz’in ailesi büyük ekranlı, ayrı kasası olmayan ve masada az yer kaplayan bir bilgisayar istiyor. Hangisi uygun?',
         'opts': ['Kule kasalı masaüstü', 'Dizüstü bilgisayar', 'Oyun konsolu', 'Tümleşik bilgisayar'], 'correct': 3,
         'fb': 'Tümleşik bilgisayarda parçalar ekranın arkasındadır; ayrı kasa gerekmez.'},
        {'q': 'Derinleş (bonus): Çipsetin görevi nedir?',
         'opts': ['Diskleri, USB’leri ve ağı işlemciye bağlamak', 'Görüntüyü monitöre çizmek', 'Bilgisayara elektrik vermek', 'Programları kalıcı saklamak'], 'correct': 0,
         'fb': 'Çipset işlemcinin yardımcısıdır: SATA diskleri, bazı USB’leri, ağı ve sesi işlemciye bağlar. Bu soru puanını düşürmez.'},
    ],
    'bitis': 'Artık anakartın parçalarını tanıyor, soketi, yuvaları ve portları bulabiliyorsun!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'Yavaşça dönen bir anakart; yollarında ışık akıyor', 'yedek': 'yedek-anakart.svg'}

FOTO_ANAKART = ('<div class="foto-kart"><!--@foto:DON-201-H05-anakart-ust.jpg|Gerçek bir anakartın üstten görünümü-->'
                '<span>Gerçekte</span></div>')
TUR_YEDEK = 'Bu cihazda 3D açılmadı; çizimdeki anakartta parçayı göster.'

KASA_TABLO = ('<table class="kt-tablo" id="kt-tablo" aria-label="Kasa türleri karşılaştırması"><thead><tr><th></th>'
              '<th>Taşınır mı?</th><th>Ekran</th><th>Parça ekleme</th></tr></thead><tbody>'
              '<tr data-tur="masaustu"><th>Masaüstü</th><td>Hayır</td><td>Ayrı</td><td>Kolay</td></tr>'
              '<tr data-tur="dizustu"><th>Dizüstü</th><td>Evet, pilli</td><td>Kapakta</td><td>Sınırlı</td></tr>'
              '<tr data-tur="tumlesik"><th>Tümleşik</th><td>Zor</td><td>Gövdeyle bir</td><td>Sınırlı</td></tr>'
              '</tbody></table>')

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Parçalar Nasıl Haberleşir?',
     'desc': 'İşlemci, RAM, disk ve ekran kartı aynı kasada çalışır. Sence bu parçalar birbirine nasıl bağlanır?',
     'secenekler': ['Her parça ötekine ayrı bir kabloyla bağlanır.', 'Hepsi büyük bir karta takılır; kart onları bağlar.', 'Parçalar birbirine kablosuz sinyal gönderir.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'adim', 'no': 1, 'ad': 'Kasa Türleri', 'etiket': 'ADIM 1 · KASA TÜRLERİ',
     'ikon': '<rect x="3" y="3" width="7" height="18" rx="1.5"/><rect x="13" y="7" width="8" height="8" rx="1"/><path d="M12 19h10"/>',
     'title': 'Üç Farklı Bilgisayar Gövdesi',
     'desc': '<strong>Masaüstü</strong> bilgisayarın kasası ayrıdır; içi kolay açılır. <strong>Dizüstü</strong> katlanır ve pille taşınır. <strong>Tümleşik</strong> bilgisayarda parçalar ekranın arkasındadır.',
     'tip': ['🔄', 'Bir türe dokun: tabloda özelliklerini gör.'],
     'ek': KASA_TABLO,
     'gorsel': {'3d': 's4-3d', 'aria': 'Masaüstü kasa, dizüstü ve tümleşik bilgisayar yan yana dönen tablalarda', 'yedek': 'yedek-kasalar.svg'}},

    {'tur': 'adim', 'no': 2, 'ad': 'Anakart: Parçaların Yolları', 'etiket': 'ADIM 2 · ANAKART',
     'ikon': '<rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="5" height="5"/><path d="M15 6v6M18 6v6M7 16h11"/>',
     'title': 'Parçaları Birbirine Bağlayan Kart',
     'desc': '<strong>Anakart</strong>, bilgisayarın en büyük devre kartıdır. Bir şehrin yolları gibi parçaları birbirine bağlar. Bilgi, ince <strong>bakır yollarda</strong> akar.',
     'tip': ['💡', 'Bir yol seç: ışık hangi parçalar arasında akıyor?'],
     'gorsel': {'3d': 's5-3d', 'aria': 'Anakart: işlemci ile RAM, ekran kartı yuvası ve disk portları arasındaki yollarda ışık akıyor', 'yedek': 'yedek-anakart.svg',
                'yedek_metin': 'Işık yolları: işlemci ↔ RAM, işlemci ↔ PCIe, çipset ↔ SATA.', 'ust': FOTO_ANAKART}},

    {'tur': 'adim', 'no': 3, 'ad': 'İşlemci Soketi', 'etiket': 'ADIM 3 · SOKET',
     'ikon': '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
     'title': 'İşlemcinin Yuvası: Soket',
     'desc': '<strong>İşlemci soketi</strong>, işlemcinin oturduğu kare yuvadır. İçindeki ince <strong>pimler</strong> çok hassastır. Köşedeki <strong>üçgen</strong> işlemcinin yönünü gösterir.',
     'tip': ['🔼', 'Kolu kaldır: koruma kapağının altında ne var?'],
     'gorsel': {'3d': 's6-3d', 'aria': 'Kamera turu 1. durak: işlemci soketi; kilit kolu kalkıyor, pimler ve köşe üçgeni görünüyor', 'yedek': 'yedek-anakart.svg', 'yedek_metin': TUR_YEDEK}},

    {'tur': 'adim', 'no': 4, 'ad': 'RAM Yuvaları', 'etiket': 'ADIM 4 · RAM YUVALARI',
     'ikon': '<rect x="4" y="3" width="3" height="18" rx="1"/><rect x="10.5" y="3" width="3" height="18" rx="1"/><rect x="17" y="3" width="3" height="18" rx="1"/>',
     'title': 'Soketin Yanındaki Uzun Yuvalar',
     'desc': '<strong>RAM yuvaları</strong> soketin yanındaki uzun, ince yuvalardır. Uçlarındaki <strong>mandallar</strong> RAM’i kilitler. Çoğu anakartta 2 ya da 4 yuva vardır.',
     'tip': ['🔒', 'RAM’i tak: mandallar ne yapıyor, izle.'],
     'gorsel': {'3d': 's7-3d', 'aria': 'Kamera turu 2. durak: dört RAM yuvası; mandallar açılıyor, RAM takılıyor, mandallar kapanıyor', 'yedek': 'yedek-anakart.svg', 'yedek_metin': TUR_YEDEK}},

    {'tur': 'adim', 'no': 5, 'ad': 'Genişleme Yuvaları (PCIe, M.2)', 'etiket': 'ADIM 5 · PCIe VE M.2',
     'ikon': '<rect x="2" y="6" width="20" height="4" rx="1"/><rect x="2" y="14" width="8" height="4" rx="1"/><path d="M14 16h8"/><circle cx="21" cy="16" r="1"/>',
     'title': 'Yeni Kartlar İçin Yuvalar',
     'desc': '<strong>PCIe x16</strong> en uzun yuvadır; ekran kartı buraya takılır. Kısa <strong>PCIe x1</strong> küçük kartlar içindir. <strong>M.2</strong> yuvasına sakız büyüklüğünde SSD (hızlı depolama) vidalanır.',
     'tip': ['🧩', 'Bir yuva seç; M.2’de SSD’nin takılışını izle.'],
     'gorsel': {'3d': 's8-3d', 'aria': 'Kamera turu 3. durak: PCIe x16, PCIe x1 ve M.2 yuvaları; M.2 SSD eğik takılıp vidalanıyor', 'yedek': 'yedek-anakart.svg', 'yedek_metin': TUR_YEDEK}},

    {'tur': 'adim', 'no': 6, 'ad': 'Arka Panel', 'etiket': 'ADIM 6 · ARKA PANEL',
     'ikon': '<rect x="3" y="6" width="18" height="12" rx="2"/><rect x="6" y="9" width="4" height="3"/><rect x="6" y="13.5" width="4" height="2"/><circle cx="16" cy="10" r="1.3"/><circle cx="16" cy="14.5" r="1.3"/>',
     'title': 'Anakartın Dışarı Bakan Yüzü',
     'desc': '<strong>Arka panel</strong>, anakartın kasanın arkasından görünen bölümüdür. 3. haftada tanıdığın USB, HDMI, ağ ve ses portları buradadır.',
     'tip': ['👆', 'Bir porta dokun: adını ve görevini gör.'],
     'gorsel': {'3d': 's9-3d', 'aria': 'Kamera turu 4. durak: anakartın arka paneli; portlara dokununca adı ve görevi görünüyor', 'yedek': 'yedek-anakart.svg', 'yedek_metin': TUR_YEDEK}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Parça Avı',
     'title': 'Anakartta Parça Avı',
     'desc': 'Sahnenin üstünde sorulan parçayı bul ve ona dokun. Anakartı döndürüp yakınlaştırabilirsin.',
     'tip': ['⏱️', 'İki kez yanılırsan ipucu gelir. Süreni geçmeye çalış!'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Bulunan parça</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 8</span></div><div class="etk-ilerleme-bar"><span></span></div></div>'
           '<ol class="av-liste" id="av-liste" aria-label="Aranan parçalar"></ol>',
     'gorsel': {'3d': 's10-3d', 'aria': 'Parça avı: sorulan parçayı 3D anakartta bul ve dokun', 'yedek': 'yedek-anakart.svg',
                'yedek_metin': 'Bu cihazda 3D açılmadı; parçaları çizimde ya da gerçek anakartta göster.'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Gerçek Anakartta Bul',
     'title': 'Gerçek Anakart Dedektifi',
     'desc': 'Öğretmeninin gösterdiği gerçek anakartta bu parçaları bul. Bulunca kartına dokun, sonra kaç tane olduğunu say.',
     'tip': ['🔍', 'Parçalara dokunma; parmağınla uzaktan göster.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Bulunan parça</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 6</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'gercek-anakart'}},

    {'tur': 'derinles', 'ad': 'Çipsetin Görevi',
     'title': 'Çipset: İşlemcinin Yardımcısı',
     'desc': '<strong>Çipset</strong>, anakarttaki yardımcı çiptir. SATA diskleri, bazı USB’leri, ağı ve sesi işlemciye bağlar. RAM ve ekran kartı ise işlemciyle doğrudan konuşur.',
     'tip': ['🔎', 'Çipset ile işlemci arasında tek, hızlı bir yol vardır.'],
     'gorsel': {'2d': 'cipset'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'Kasa Türleri', 'Masaüstü, dizüstü, tümleşik.'),
        ('oz-2.svg', 'Anakart', 'Parçaları bakır yollarla bağlar.'),
        ('oz-3.svg', 'Soket', 'Üçgen, işlemcinin yönünü gösterir.'),
        ('oz-4.svg', 'RAM Yuvaları', 'Mandallar RAM’i kilitler.'),
        ('oz-5.svg', 'PCIe ve M.2', 'Ekran kartı ve SSD yuvaları.'),
        ('oz-6.svg', 'Arka Panel', 'Portlar kasanın arkasına bakar.'),
    ]},
]
