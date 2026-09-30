# DON-301 H06 — Güç Kaynağı ve Soğutma (Format K, lise)
MODELLER = ['M-PSU', 'M-KABLO-GUC', 'M-SOGUTUCU', 'M-CPU']

DERS = {
    'grade': 'lise',
    'hafta': '6. Hafta',
    'baslik': 'Güç Kaynağı ve Soğutma',
    'aciklama': 'Prizdeki AC gerilimin +12 V, +5 V ve +3,3 V DC hatlara nasıl dönüştüğünü incele; sistemin güç ihtiyacını pay bırakarak hesapla, 80 PLUS verimini yorumla, soğutucuyu TDP’ye göre seç ve kasa hava akışını planla.',
    'hedefler': [
        'Güç kaynağının prizdeki AC gerilimi +12 V, +5 V ve +3,3 V DC gerilimlere dönüştürdüğünü açıklayabileceğim.',
        'Bileşenlerin güç değerlerini toplayıp %20–30 pay bırakarak uygun güç kaynağını hesaplayabileceğim.',
        '80 PLUS sertifikalarını yorumlayıp prizden çekilen gücü ve ısı kaybını hesaplayabileceğim.',
        'Hava ve sıvı soğutmayı TDP üzerinden karşılaştırıp kasa hava akışını planlayabileceğim.',
    ],
    'hedef_simgeler': [
        '<path d="M2 12c2-5 4-5 6 0s4 5 6 0"/><path d="M16 9h6M16 15h6"/>',
        '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h6M7 17h3"/>',
        '<path d="M12 3v4M5 7l2 2M19 7l-2 2"/><path d="M4 17a8 8 0 0 1 16 0"/><path d="M12 17l3-5"/>',
        '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/><path d="M18 6h3M18 10h3"/>',
    ],
    'bolumler': [
        ['Güç', 'AC’den DC’ye, raylar, güç hesabı'],
        ['Verim ve Kablolar', '80 PLUS, 24-pin, EPS, PCIe, SATA'],
        ['Soğutma', 'TDP, hava ve sıvı soğutma, kasa hava akışı'],
    ],
    'quiz': [
        {'q': 'Masaüstü bilgisayardaki güç kaynağının (PSU) temel görevi nedir?',
         'opts': ['Prizdeki AC gerilimi +12 V, +5 V ve +3,3 V gibi düşük DC gerilimlere dönüştürmek',
                  'Anakarttan gelen DC gerilimi AC’ye çevirip bileşenlere dağıtmak',
                  'Elektrik kesilince sistemi saatlerce çalıştıracak enerjiyi depolamak',
                  'İşlemcinin saat hızını ve çekirdek sayısını ayarlamak'], 'correct': 0,
         'fb': 'Güç kaynağı şebekedeki 230 V AC’yi bileşenlerin kullandığı düşük ve sabit DC gerilimlere çevirir. Enerji depolayan cihaz kesintisiz güç kaynağıdır (UPS), PSU değildir.'},
        {'q': 'Görseldeki sistemin bileşenleri toplam yaklaşık 360 W çekiyor. %25 pay bırakılırsa hangi güç kaynağı en uygundur?<span class="q-gorsel"><!--@dahil:svg-quiz-guc.svg--></span>',
         'opts': ['360 W', '400 W', '450 W', '1000 W'], 'correct': 2,
         'fb': '360 W × 1,25 = 450 W. Tam toplamı seçmek pay bırakmaz; çok büyük bir güç kaynağı ise gereksiz pahalıdır ve düşük yükte verimsiz çalışır.'},
        {'q': 'Deniz’in bilgisayarı oyun sırasında 450 W DC güç çekiyor. Güç kaynağı bu yükte %90 verimle (80 PLUS Gold) çalışıyor. Prizden yaklaşık ne kadar güç çekilir?',
         'opts': ['405 W', '500 W', '450 W', '540 W'], 'correct': 1,
         'fb': 'Prizden çekilen = DC güç ÷ verim = 450 ÷ 0,90 = 500 W. Aradaki 50 W güç kaynağında ısıya dönüşür.'},
        {'q': 'Ece, TDP değeri 170 W olan bir işlemci için soğutucu seçiyor. Hangi seçim en uygundur?',
         'opts': ['İşlemci kutusundan çıkan 65 W’lık alçak soğutucu; işlemci zaten kendini korur',
                  'Fansız pasif soğutucu; sessiz olduğu için yeterlidir',
                  'Termal macunu kalın sürmek; ısı daha iyi iletilir',
                  'TDP kapasitesi en az 170 W olan büyük kule soğutucu ya da 240/360 mm sıvı soğutucu'], 'correct': 3,
         'fb': 'Soğutucunun ısı kapasitesi işlemcinin TDP değerini karşılamalıdır. Yetersiz soğutucuda işlemci ısınıp yavaşlar; kalın macun ise ısı iletimini kötüleştirir.'},
    ],
    'bitis': 'Güç kaynağını, verimi, konnektörleri ve soğutmayı artık teknik gerekçeleriyle seçebiliyorsun!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'ATX güç kaynağı, 24-pin, EPS, PCIe ve SATA güç konnektörleri ile kule tipi işlemci soğutucusu', 'yedek': 'yedek-kapak.svg'}

FOTO_ETIKET = '<div class="foto-kart ac-foto"><!--@foto:DON-301-H06-psu-etiketi.jpg|Güç kaynağının yan yüzündeki etiket: DC çıkış tablosu--><span>Gerçekte</span></div>'
FOTO_KABLO = '<div class="foto-kart"><!--@foto:DON-301-H06-guc-konnektorleri.jpg|Güç kaynağının 24-pin, EPS, PCIe ve SATA konnektörleri--><span>Gerçekte</span></div>'
FOTO_SOG = '<div class="foto-kart"><!--@foto:DON-301-H06-sogutucular.jpg|Kule tipi hava soğutucu ve hazır sıvı soğutucu (AIO)--><span>Gerçekte</span></div>'

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Hangi Güç Kaynağı?',
     'desc': 'Ece yeni oyun bilgisayarının parçalarını seçti. Bileşenlerin tam yükte toplam yaklaşık <strong>420 W</strong> çektiğini hesapladı. Sence hangi güç kaynağını almalı?',
     'secenekler': ['450 W: 420 W’ı karşılıyor, fazlası gereksiz.', '550 W: yaklaşık %25 pay bırakıyor.', '1200 W: ne kadar büyük o kadar güvenli.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'terim', 'terimler': [
        ('PSU (Power Supply Unit)', 'Güç Kaynağı', 'Prizdeki elektriği bilgisayarın kullandığı DC gerilimlere çevirir.'),
        ('AC / DC', 'Alternatif / Doğru Akım', 'AC yön değiştirir (şebeke, 50 Hz); DC sabittir (+12 V gibi).'),
        ('Rail', 'Gerilim Hattı (Ray)', 'Güç kaynağının +12 V, +5 V, +3,3 V çıkışlarından her biri.'),
        ('Headroom', 'Güç Payı', 'Hesaplanan yükün üzerine bırakılan %20–30 fazlalık.'),
        ('Efficiency', 'Verim', 'DC çıkış gücünün prizden çekilen güce oranı; kalanı ısıya dönüşür.'),
        ('80 PLUS', 'Verimlilik Sertifikası', 'Bronze, Gold, Platinum… Belirli yüklerde en az verimi garanti eder.'),
        ('EPS / PCIe Power', 'İşlemci / Ekran Kartı Güç Konnektörü', '+12 V’u işlemciye (EPS) ve ekran kartına (PCIe) taşır.'),
        ('TDP (Thermal Design Power)', 'Isıl Tasarım Gücü', 'Soğutucunun uzaklaştırması gereken yaklaşık ısı (W).'),
        ('AIO Liquid Cooler', 'Hazır Sıvı Soğutucu', 'Pompa, blok ve radyatörden oluşan kapalı devre soğutma.'),
        ('Airflow / CFM', 'Hava Akışı / Dakikada Fit Küp', 'Fanların taşıdığı hava; giriş > çıkış ise pozitif basınç.'),
    ]},

    {'tur': 'adim', 'no': 1, 'ad': 'AC’den DC’ye', 'etiket': 'ADIM 1 · DÖNÜŞÜM',
     'ikon': '<path d="M2 12c2-5 4-5 6 0s4 5 6 0"/><path d="M16 9h6M16 15h6"/>',
     'title': '230 V AC Girer, Sabit DC Çıkar',
     'desc': 'Prizdeki gerilim <strong>AC</strong>’dir: saniyede 50 kez yön değiştirir. Güç kaynağı bunu bileşenlerin kullandığı sabit <strong>DC</strong> hatlara çevirir: <strong>+12 V</strong> (işlemci, ekran kartı, fanlar), <strong>+5 V</strong> (USB, SATA diskler), <strong>+3,3 V</strong> (M.2 SSD, anakart devreleri). Her hattın akım sınırı etikette yazar; güç = gerilim × akım. İçindeki kondansatörler fiş çekilince de yük tutabilir: kutu asla açılmaz.',
     'tip': ['⚡', 'Dönüşümü izle; sonra “Etiketi oku” ile hat güçlerini hesapla.'],
     'genis': True,
     'gorsel': {'2d': 'acdc', 'koyu': True, 'ic': FOTO_ETIKET}},

    {'tur': 'adim', 'no': 2, 'ad': 'Güç Hesabı', 'etiket': 'ADIM 2 · GÜÇ BÜTÇESİ',
     'ikon': '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h6M7 17h3"/>',
     'title': 'Topla, Pay Bırak, Yukarı Yuvarla',
     'desc': 'Bileşenlerin tam yükteki güçlerini topla (işlemcide TDP, ekran kartında toplam kart gücü). Üzerine <strong>%20–30 pay</strong> ekle: ekran kartlarının anlık güç sıçramaları, yıllar içinde yaşlanma ve yükseltme için. Sonucu piyasadaki bir üst değere yuvarla (450, 550, 650, 750 W…).',
     'tip': ['🧮', 'Oynat’a bas: güç bütçesi parça parça dolsun; sonra güç kaynaklarını karşılaştır.'],
     'genis': True,
     'gorsel': {'2d': 'guc-hesap'}},

    {'tur': 'adim', 'no': 3, 'ad': '80 PLUS Verimlilik', 'etiket': 'ADIM 3 · VERİM',
     'ikon': '<path d="M12 3v4M5 7l2 2M19 7l-2 2"/><path d="M4 17a8 8 0 0 1 16 0"/><path d="M12 17l3-5"/>',
     'title': 'Prizden Çekilen = DC Güç ÷ Verim',
     'desc': 'Hiçbir güç kaynağı %100 verimli değildir; kayıp güç <strong>ısıya</strong> dönüşür. <strong>80 PLUS</strong> sertifikası %20, %50 ve %100 yükte en düşük verimi belirtir (Bronze → Titanium arttıkça verim artar). Verim en çok %50 yük civarında yüksektir. Örnek: 400 W DC yük, %90 verim → prizden ≈ 444 W, ısı ≈ 44 W.',
     'tip': ['📈', 'Tahmin et: Bronze yerine Gold seçilirse ısı kaybı ne kadar azalır? Sertifikayı ve yükü seç.'],
     'genis': True,
     'gorsel': {'2d': 'verim', 'koyu': True}},

    {'tur': 'adim', 'no': 4, 'ad': 'Güç Kabloları', 'etiket': 'ADIM 4 · KONNEKTÖRLER',
     'ikon': '<rect x="6" y="3" width="12" height="8" rx="1.5"/><path d="M9 3v3M12 3v3M15 3v3"/><path d="M9 11v6c0 2 1 4 3 4M15 11v10"/>',
     'title': 'Her Bileşenin Kendi Fişi',
     'desc': '<strong>24-pin ATX</strong> (20+4) anakartı, <strong>8-pin EPS</strong> (4+4) işlemciyi, <strong>6+2 pin PCIe</strong> ekran kartını, <strong>SATA güç</strong> (15 pin, L ağız) diskleri besler. Tel renkleri standarttır: sarı +12 V, kırmızı +5 V, turuncu +3,3 V, siyah toprak. EPS ile PCIe 8-pin benzer görünür ama kilit ve pin biçimleri farklıdır; asla zorlanmaz.',
     'tip': ['🔌', 'Bir konnektör seç: döndürüp pin yüzünü göster. “EPS ≠ PCIe” ile ikisini karşılaştır.'],
     'gorsel': {'3d': 's8-3d', 'aria': 'Güç konnektörleri: 24-pin ATX, 8-pin EPS, 6+2 pin PCIe ve SATA güç; seçilen konnektör vurgulanır ve pin yüzü gösterilir',
                'yedek': 'yedek-kablo.svg', 'ust': FOTO_KABLO}},

    {'tur': 'adim', 'no': 5, 'ad': 'TDP ve Soğutucu Türleri', 'etiket': 'ADIM 5 · SOĞUTUCU',
     'ikon': '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/><path d="M18 6h3M18 10h3"/>',
     'title': 'Soğutucu Kapasitesi ≥ TDP',
     'desc': '<strong>TDP</strong>, soğutucunun sürekli uzaklaştırması gereken yaklaşık ısıdır. <strong>Hava soğutmada</strong> ısı macun → taban → ısı boruları → kanatçıklar yolunu izler, fan havayla atar. <strong>Sıvı soğutmada</strong> (AIO) pompa, bloktaki ısıyı sıvıyla radyatöre taşır. İkisinde de ısı sonunda kasa havasına verilir.',
     'tip': ['🌡️', 'TDP değerini değiştir: bu kule soğutucu hangi değere kadar yeter?'],
     'gorsel': {'3d': 's9-3d', 'aria': 'İşlemci ve kule tipi soğutucu; TDP arttıkça işlemcinin rengi ve termometre değişir, ısı yolu parçacıklarla gösterilir',
                'yedek': 'yedek-sogutucu.svg', 'ust': FOTO_SOG}},

    {'tur': 'adim', 'no': 6, 'ad': 'Kasa Hava Akışı', 'etiket': 'ADIM 6 · HAVA AKIŞI',
     'ikon': '<path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h15a3 3 0 1 1-3 3"/><path d="M3 16h7"/>',
     'title': 'Önden Soğuk Hava Girer, Arkadan ve Üstten Çıkar',
     'desc': 'Sıcak hava yükselir; bu yüzden genellikle <strong>ön fanlar içeri</strong> soğuk hava alır, <strong>arka ve üst fanlar dışarı</strong> atar. Giriş toplamı çıkıştan biraz fazlaysa <strong>pozitif basınç</strong> oluşur: hava filtreli girişlerden girer, toz azalır. Çıkış fazlaysa <strong>negatif basınç</strong>: hava her aralıktan emilir, toz birikir.',
     'tip': ['🌀', 'Önce tahmin et: arka fan ters takılırsa işlemci ısınır mı? Sonra düzenleri karşılaştır.'],
     'genis': True,
     'gorsel': {'2d': 'hava', 'koyu': True}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Güç Hesaplayıcı',
     'title': 'Güç Hesaplayıcı Görevi',
     'desc': 'Hesaplayıcıda bileşenleri seç, payı ve sertifikayı ayarla. Sağdaki dört görevi hesaplayıcının sonuçlarıyla çöz.',
     'tip': ['💡', 'Önerilen güç = toplam × (1 + pay), sonra bir üst standart değer. Prizden çekilen = DC yük ÷ verim.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Çözülen görev</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 4</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'hesaplayici'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Fan Yönü ve Hızı',
     'title': 'Kasa Hava Akışını Planla',
     'desc': 'Her fanın yönünü ve hızını ayarla; ısı haritasını ve ölçümleri izle. Görevler istediğin sırayla tamamlanır.',
     'tip': ['⏳', 'Her değişiklikten sonra sıcaklıkların durulmasını birkaç saniye bekle.'],
     'ek': '<ol class="gorevler" id="gorevler-2">'
           '<li><span class="g-isaret"></span><span><strong>Ters fanı düzelt:</strong> arka fan dışarı atsın, işlemci soğusun.</span></li>'
           '<li><span class="g-isaret"></span><span><strong>Pozitif basınç:</strong> giriş, çıkıştan en az %10 fazla olsun.</span></li>'
           '<li><span class="g-isaret"></span><span><strong>Negatif basınç</strong> oluştur ve toz uyarısını oku.</span></li>'
           '<li><span class="g-isaret"></span><span><strong>Sessiz ve serin:</strong> tüm fanlar ≤ %60, işlemci &lt; 65 °C.</span></li></ol>'
           '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Tamamlanan görev</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 4</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'hava-gorev'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'AC → DC', '230 V AC → +12 V, +5 V, +3,3 V DC hatları.'),
        ('oz-2.svg', 'Güç Hesabı', 'Toplam × 1,2–1,3 → bir üst standart değer.'),
        ('oz-3.svg', '80 PLUS', 'Prizden çekilen = DC ÷ verim; fark ısıdır.'),
        ('oz-4.svg', 'Konnektörler', '24-pin anakart, EPS işlemci, PCIe ekran kartı, SATA disk.'),
        ('oz-5.svg', 'TDP', 'Soğutucu kapasitesi ≥ TDP; hava ya da sıvı.'),
        ('oz-6.svg', 'Hava Akışı', 'Ön giriş, arka/üst çıkış; hafif pozitif basınç.'),
    ]},
]
