# DON-301 H05 — Anakart (Format K, lise)
# Not: M-ANAKART-FORM modeli yok; form faktörü karşılaştırması (A-KARSILASTIR) ölçekli 2D çizimle yapılır.
MODELLER = ['M-ANAKART', 'M-CPU', 'M-RAM', 'M-M2', 'M-KABLO-GUC']

DERS = {
    'grade': 'lise',
    'hafta': '5. Hafta',
    'baslik': 'Anakart',
    'aciklama': 'ATX, mATX ve Mini-ITX kartları ölçüleriyle karşılaştır; soket ile çipsetin birlikte bir platform oluşturduğunu gör, PCIe ve M.2 yuvalarını kılavuzdan oku, güç ve ön panel bağlantılarını doğru yere yap.',
    'hedefler': [
        'ATX, mATX ve Mini-ITX form faktörlerini ölçü, yuva sayısı ve kasa uyumuyla ayırt edebileceğim.',
        'İşlemci soketi ile çipsetin ilişkisini ve hangi bağlantının nereden geldiğini açıklayabileceğim.',
        'PCIe ve M.2 yuvalarının nesil, hat sayısı ve paylaşım bilgilerini anakart kılavuzundan okuyabileceğim.',
        '24-pin ATX, 8-pin EPS, arka panel ve ön panel başlıklarını tanıyıp yerlerini gösterebileceğim.',
    ],
    'hedef_simgeler': [
        '<rect x="3" y="3" width="14" height="18" rx="1.5"/><rect x="3" y="3" width="10" height="11" rx="1" stroke-dasharray="2 2"/><path d="M20 3v18M18.5 3h3M18.5 21h3"/>',
        '<rect x="7" y="2" width="10" height="8" rx="1.5"/><rect x="8" y="15" width="8" height="7" rx="1.5"/><path d="M12 10v5M4 6h3M17 6h3M4 18h4M16 18h4"/>',
        '<path d="M4 4h11l5 5v11H4z"/><path d="M15 4v5h5"/><path d="M7 12h10M7 15h10M7 18h6"/>',
        '<rect x="5" y="3" width="14" height="7" rx="1.5"/><path d="M8 3v3M11 3v3M14 3v3M17 3v3"/><path d="M9 10v5c0 3 1.5 5 3 6M15 10v11"/>',
    ],
    'bolumler': [
        ['Boyut ve Platform', 'Form faktörü, soket, çipset'],
        ['Yuvalar', 'PCIe hatları, M.2, kılavuz okuma'],
        ['Bağlantılar', '24-pin, EPS, arka ve ön panel'],
    ],
    'quiz': [
        {'q': 'Soket ile çipsetin ilişkisini en doğru açıklayan ifade hangisidir?',
         'opts': ['Soket takılabilecek işlemci ailesini belirler; çipset o aileyi destekler ve USB, SATA, ek PCIe hatları gibi özellikleri sağlar.',
                  'Çipset işlemcinin oturduğu yuvadır; soket ise yalnızca soğutucuyu tutar.',
                  'Soket aynıysa her çipset her işlemciyle hiçbir güncelleme gerekmeden çalışır.',
                  'RAM ve ana ekran kartı yuvası çipsete bağlıdır; işlemci yalnızca hesap yapar.'], 'correct': 0,
         'fb': 'Soket ve çipset birlikte platformu oluşturur. Bellek denetleyicisi ve ana PCIe hatları işlemcidedir; çipset ek bağlantıları tek bir hızlı yolla işlemciye taşır. Uyumu kılavuzdaki destek listesi belirler.'},
        {'q': 'Görseldeki kılavuz tablosuna göre PCIE_3 yuvası için hangisi doğrudur?<span class="q-gorsel"><!--@dahil:svg-quiz-kilavuz.svg--></span>',
         'opts': ['İşlemciye bağlıdır; ekran kartı için en hızlı yuvadır.',
                  'Uzun olduğu için x1 kartlar bu yuvaya takılamaz.',
                  'Fiziksel olarak x16 boyundadır ama x4 hatla çalışır ve çipsete bağlıdır.',
                  'Yalnızca M.2 SSD takılabilir.'], 'correct': 2,
         'fb': 'Yuvanın boyu ile elektriksel hat sayısı farklı olabilir. PCIE_3 x16 boyunda ama x4 çalışır; ekran kartı için işlemciye bağlı PCIE_1 seçilir. Kısa kartlar uzun yuvaya takılabilir.'},
        {'q': 'Ece’nin elinde mATX bir anakart, evde de boş bir ATX kasa var. Ne olur?',
         'opts': ['Takılamaz; kasa ile kart aynı form faktöründe olmak zorundadır.',
                  'Takılabilir; mATX kart, ATX kasadaki vida ayaklarının bir bölümünü kullanır ve arka panel aynı yere gelir.',
                  'Takılabilir ama arka panel portları kasanın ön yüzüne gelir.',
                  'Yalnızca Mini-ITX kasaya takılabilir.'], 'correct': 1,
         'fb': 'Küçük form faktörleri büyük kasaların vida deliklerinin bir alt kümesini kullanır; büyük kasa küçük kartı alır, tersi olmaz.'},
        {'q': 'Deniz yeni topladığı bilgisayarı açınca fanlar dönüyor ama işlemci çalışmıyor, ekrana hiçbir şey gelmiyor. Kartın üst kenarındaki CPU_PWR girişi boş. Sorun nedir?',
         'opts': ['24-pin ATX takılıysa işlemci de beslenir; sorun ekran kartındadır.',
                  'CPU_PWR, ön panel güç düğmesinin bağlandığı başlıktır.',
                  'CPU_PWR girişine SATA güç kablosu takılmalıdır.',
                  '8-pin EPS kablosu takılmamış; işlemcinin VRM’i +12 V beslemesini alamıyor.'], 'correct': 3,
         'fb': 'İşlemci gücü ayrı bir 8-pin EPS (4+4) kablosuyla gelir. 24-pin tek başına yetmez; EPS takılmazsa sistem açılış testini geçemez.'},
    ],
    'bitis': 'Anakartın boyutunu, platformunu, yuvalarını ve bağlantılarını artık kılavuza bakarak okuyabiliyorsun!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'ATX anakart: işlemci, iki RAM modülü ve M.2 SSD takılı; bakır yollarda veri akışı', 'yedek': 'yedek-anakart.svg'}

FOTO_ANAKART = '<div class="foto-kart"><!--@foto:DON-301-H05-anakart-ust.jpg|Gerçek bir ATX anakartın üstten görünümü: soket, RAM, PCIe ve M.2 yuvaları--><span>Gerçekte</span></div>'
FOTO_KILAVUZ = '<div class="foto-kart kl-foto"><!--@foto:DON-301-H05-kilavuz.jpg|Anakart kılavuzunun yerleşim ve bağlantı başlıkları sayfası--><span>Gerçekte</span></div>'
TUR_YEDEK = 'Bu cihazda 3D açılmadı; çizimdeki anakartta parçayı göster.'

KILAVUZ_TABLO = ('<table class="kt-tablo" id="kt-tablo" aria-label="Kılavuzdan: genişleme ve depolama yuvaları"><thead><tr><th>Yuva</th>'
                 '<th>Bağlantı</th><th>Kaynak</th></tr></thead><tbody>'
                 '<tr data-k="p1"><th>PCIE_1</th><td>PCIe 4.0 x16</td><td>İşlemci</td></tr>'
                 '<tr data-k="p2"><th>PCIE_2 / _4</th><td>PCIe 3.0 x1</td><td>Çipset</td></tr>'
                 '<tr data-k="p3"><th>PCIE_3</th><td>x16 boy, <b>x4</b> hat</td><td>Çipset</td></tr>'
                 '<tr data-k="m1"><th>M.2_1</th><td>M anahtar · PCIe 4.0 x4</td><td>İşlemci</td></tr>'
                 '<tr data-k="m2"><th>M.2_2</th><td>M anahtar · PCIe 3.0 x4 / SATA</td><td>Çipset</td></tr>'
                 '</tbody></table>')

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Bu Anakart Bu Kasaya Sığar mı?',
     'desc': 'Ece masasına sığsın diye küçük bir <strong>Mini-ITX</strong> kasa aldı. Mağazada beğendiği anakart ise <strong>ATX</strong>. Sence ne olur?',
     'secenekler': ['Sığar; bütün anakartlar aynı ölçüde ve aynı vida deliklerindedir.',
                    'Sığmaz; ATX kart, Mini-ITX kasanın alabileceği karttan çok büyüktür.',
                    'Sığar ama PCIe yuvalarından biri kullanılamaz.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'terim', 'terimler': [
        ('Motherboard', 'Anakart', 'Bütün bileşenleri birbirine bağlayan ve besleyen ana devre kartı.'),
        ('Form Factor', 'Biçim Standardı', 'Kartın ölçüsünü, vida deliklerini ve arka panelin yerini belirler: ATX, mATX, Mini-ITX.'),
        ('CPU Socket (LGA / PGA)', 'İşlemci Soketi', 'İşlemcinin yuvası. LGA’da yaylı pimler sokette, PGA’da pimler işlemcidedir.'),
        ('Chipset', 'Yonga Seti', 'İşlemciye tek hızlı bağlantıyla bağlanır; USB, SATA ve ek PCIe hatlarını sağlar.'),
        ('PCIe Lane', 'PCIe Hattı', 'Bir gönderme ve bir alma çiftinden oluşan seri yol; x1, x4, x16 hat sayısıdır.'),
        ('M.2 / NVMe', 'M.2 Yuvası / NVMe Protokolü', 'M.2 kart biçimi ve yuvasıdır; NVMe, SSD’nin PCIe üzerinden konuştuğu protokoldür.'),
        ('VRM', 'Voltaj Düzenleyici Modül', 'Soketin çevresindeki devre; +12 V’u işlemcinin istediği düşük gerilime indirir.'),
        ('ATX 24-pin / EPS 8-pin', 'Ana Güç / İşlemci Güç Girişi', 'Anakartı ve işlemciyi güç kaynağına bağlayan konnektörler.'),
        ('Header', 'Başlık (Pim Grubu)', 'Kart üstündeki pim dizisi: ön panel, USB, ses ve fan kabloları takılır.'),
        ('Rear I/O', 'Arka Giriş/Çıkış Paneli', 'Kasanın arkasından görünen portlar: USB, görüntü, ağ, ses.'),
    ]},

    {'tur': 'adim', 'no': 1, 'ad': 'Form Faktörleri', 'etiket': 'ADIM 1 · FORM FAKTÖRÜ',
     'ikon': '<rect x="3" y="3" width="14" height="18" rx="1.5"/><rect x="3" y="3" width="10" height="11" rx="1"/><path d="M20 3v18"/>',
     'title': 'ATX, mATX ve Mini-ITX',
     'desc': '<strong>Form faktörü</strong>; kartın ölçüsünü, vida deliklerini ve arka panelin yerini standartlaştırır. <strong>ATX</strong> 30,5 × 24,4 cm’dir ve en çok 7 genişleme yuvası taşır. <strong>mATX</strong> en çok 24,4 × 24,4 cm’dir, en çok 4 yuva taşır. <strong>Mini-ITX</strong> 17 × 17 cm’dir, tek yuvalıdır. Küçük kartlar büyüğün vida deliklerinin bir bölümünü kullanır; bu yüzden büyük kasaya küçük kart takılabilir, tersi mümkün değildir.',
     'tip': ['📐', 'Önce “Üst üste” ile kartları aynı köşeye hizala, sonra bir kasa seç: hangi kartlar sığıyor?'],
     'genis': True,
     'gorsel': {'2d': 'form'}},

    {'tur': 'adim', 'no': 2, 'ad': 'CPU Soketi', 'etiket': 'ADIM 2 · SOKET',
     'ikon': '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><path d="M8 8h3L8 11z"/>',
     'title': 'Soket İşlemci Ailesini Belirler',
     'desc': '<strong>Soket</strong>, işlemcinin anakarta hem mekanik hem elektriksel bağlantısıdır. <strong>LGA</strong> tipinde yaylı pimler sokettedir, işlemcinin altında düz temas pedleri vardır; <strong>PGA</strong> tipinde pimler işlemcidedir. Temas sayısı ve düzeni farklı bir işlemci başka sokete girmez. Köşe üçgeni ve kenar çentikleri yönü belirler: işlemci yuvaya bırakılır, bastırılmaz.',
     'tip': ['🔺', 'Tahmin et: işlemci 180° ters tutulursa ne olur? Önce “Ters dene”, sonra “Doğru tak”.'],
     'gorsel': {'3d': 's6-3d', 'aria': 'Anakart soketi yakın plan: kilit kolu ve yük plakası açılıyor, işlemci köşe üçgeni hizalanarak sokete bırakılıyor',
                'yedek': 'yedek-anakart.svg', 'yedek_metin': TUR_YEDEK}},

    {'tur': 'adim', 'no': 3, 'ad': 'Çipset', 'etiket': 'ADIM 3 · ÇİPSET',
     'ikon': '<rect x="7" y="2" width="10" height="7" rx="1.5"/><rect x="8" y="15" width="8" height="7" rx="1.5"/><path d="M12 9v6M3 18h5M16 18h5M3 5.5h4M17 5.5h4"/>',
     'title': 'Soket + Çipset = Platform',
     'desc': 'RAM’in bellek denetleyicisi, ekran kartı yuvası ve genellikle bir M.2 yuvası <strong>doğrudan işlemciye</strong> bağlıdır. <strong>Çipset</strong> ise SATA, ek M.2 ve PCIe yuvaları, USB, ağ ve sesi toplar; hepsini <strong>tek bir hızlı bağlantıyla</strong> işlemciye taşır. Aynı sokete giriş, orta ve üst seviye çipsetler üretilir; hat sayısı, USB sayısı ve ayar seçenekleri değişir. Uyumu kılavuzdaki desteklenen işlemci listesi belirler.',
     'tip': ['🔀', 'Yolları karşılaştır; “Paylaşım”da aygıtları aç: çipset bağlantısı ne zaman darboğaz olur?'],
     'genis': True,
     'gorsel': {'2d': 'cipset', 'koyu': True}},

    {'tur': 'adim', 'no': 4, 'ad': 'PCIe ve M.2 Yuvaları', 'etiket': 'ADIM 4 · YUVALAR',
     'ikon': '<rect x="2" y="6" width="20" height="4" rx="1"/><rect x="2" y="14" width="8" height="4" rx="1"/><path d="M14 16h8"/><circle cx="21" cy="16" r="1"/>',
     'title': 'Kılavuzdan Yuva Okumak',
     'desc': 'PCIe <strong>hattı</strong> bir gönderme ve bir alma çiftidir; hat başına hız her nesilde yaklaşık iki katına çıkar (3.0 ≈ 1, 4.0 ≈ 2, 5.0 ≈ 4 GB/s). Yuvanın <strong>boyu</strong> ile <strong>hat sayısı</strong> farklı olabilir. M.2’de anahtar ve boy (2242/2260/2280) kılavuzda yazar.',
     'tip': ['📖', 'Kılavuz satırına dokun: kamera yuvaya gider. M.2 satırlarında SSD takılışını izle.'],
     'ek': KILAVUZ_TABLO,
     'genis': False,
     'gorsel': {'3d': 's8-3d', 'aria': 'Anakartın PCIe ve M.2 yuvaları; seçilen kılavuz satırındaki yuva vurgulanır, M.2 SSD eğik takılıp vidalanır',
                'yedek': 'yedek-anakart.svg', 'yedek_metin': TUR_YEDEK, 'ust': FOTO_ANAKART}},

    {'tur': 'adim', 'no': 5, 'ad': 'Güç Girişleri (24-pin ATX, 8-pin EPS)', 'etiket': 'ADIM 5 · GÜÇ GİRİŞLERİ',
     'ikon': '<rect x="6" y="3" width="12" height="8" rx="1.5"/><path d="M9 3v3M12 3v3M15 3v3"/><path d="M9 11v6c0 2 1 4 3 4M15 11v10"/>',
     'title': 'Anakartın ve İşlemcinin Güç Girişleri',
     'desc': '<strong>24-pin ATX</strong> (20+4), <code>ATX_PWR</code> girişinden anakartın tamamını besler. <strong>8-pin EPS</strong> (4+4) ise <code>CPU_PWR</code> girişinden yalnız işlemci için +12 V getirir. Güçlü işlemcili kartlarda ikinci bir EPS girişi olabilir. Soketin çevresindeki <strong>VRM</strong> bu +12 V’u işlemcinin istediği 1 V dolayındaki gerilime indirir. Konnektörün kilidi tık sesiyle oturur; ters yönde girmez.',
     'tip': ['🔌', 'Tahmin et: EPS takılmazsa sistem açılır mı? Sonra iki konnektörü tak, “Ters dene” ile kilidi izle.'],
     'gorsel': {'3d': 's9-3d', 'aria': 'Anakart: 24-pin ATX ve 8-pin EPS konnektörleri yukarıdan inip girişlerine oturuyor; güç VRM üzerinden sokete akıyor',
                'yedek': 'yedek-anakart.svg', 'yedek_metin': TUR_YEDEK}},

    {'tur': 'adim', 'no': 6, 'ad': 'Arka Panel ve Ön Panel Başlıkları', 'etiket': 'ADIM 6 · PANELLER',
     'ikon': '<rect x="3" y="6" width="18" height="12" rx="2"/><rect x="6" y="9" width="4" height="3"/><circle cx="16" cy="10.5" r="1.3"/><path d="M6 15h2M10 15h2M14 15h2"/>',
     'title': 'Dışarı Bakan Portlar, İçeri Bakan Başlıklar',
     'desc': '<strong>Arka panel</strong> kasanın arkasından görünür: USB, görüntü, ağ ve ses. Buradaki görüntü çıkışları yalnız işlemcide tümleşik grafik varsa çalışır. Kasanın ön yüzü kablolarla <strong>başlıklara</strong> bağlanır: <code>F_PANEL</code> (güç ve sıfırlama düğmesi, LED’ler), <code>F_USB</code> (USB 2.0), <code>USB3</code> (19 pin), <code>F_AUDIO</code> (ses), <code>CPU_FAN</code> (4 pin). LED’lerde + / − yönü önemlidir; düğmelerde yön yoktur.',
     'tip': ['🧭', 'Bir düğme seç: kamera o bölgeye gider. F_PANEL’de pim şemasını oku.'],
     'gorsel': {'3d': 's10-3d', 'aria': 'Anakartın arka paneli ve alt kenardaki ön panel başlıkları; seçilen başlık vurgulanır, F_PANEL pim şeması gösterilir',
                'yedek': 'yedek-anakart.svg', 'yedek_metin': TUR_YEDEK}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Kılavuzdan Bul',
     'title': 'Kılavuzdaki Bağlantıyı 3D Kartta Bul',
     'desc': 'Sahnenin üstünde kılavuzdan bir satır var. Satırdaki bağlantıyı 3D anakartta bul ve dokun. Kartı döndürüp yakınlaştırabilirsin.',
     'tip': ['🗺️', '“Şema” kılavuzun yerleşim çizimini açar. İki yanlıştan sonra ipucu gelir.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Bulunan bağlantı</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 8</span></div><div class="etk-ilerleme-bar"><span></span></div></div>'
           '<ol class="av-liste" id="av-liste" aria-label="Aranan bağlantılar"></ol>',
     'gorsel': {'3d': 's11-3d', 'aria': 'Kılavuz avı: kılavuzda adı geçen bağlantıyı 3D anakartta bul ve dokun', 'yedek': 'yedek-anakart.svg',
                'yedek_metin': 'Bu cihazda 3D açılmadı; bağlantıları çizimde ya da gerçek anakartta göster.'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Kılavuzu Oku',
     'title': 'Kılavuzdan Bilgi Bul',
     'desc': 'Soldaki kılavuz sayfasının sekmelerini oku. Her görevin cevabını kılavuzda bul ve seç. Öğretmenin gerçek bir kılavuz getirdiyse aynı bilgileri onda da ara.',
     'tip': ['💡', 'Önce sorudaki anahtar kelimeyi (DIMM, PCIE, M.2, SATA, F_PANEL) bul, sonra ilgili sekmeye geç.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Çözülen görev</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 5</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'kilavuz', 'ic': FOTO_KILAVUZ}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'Form Faktörü', 'ATX > mATX > Mini-ITX; büyük kasa küçük kartı alır.'),
        ('oz-2.svg', 'Soket', 'İşlemci ailesini belirler; üçgen yönü gösterir.'),
        ('oz-3.svg', 'Çipset', 'Ek bağlantıları tek hızlı yolla işlemciye taşır.'),
        ('oz-4.svg', 'PCIe ve M.2', 'Nesil × hat sayısı; boy ile hat farklı olabilir.'),
        ('oz-5.svg', '24-pin ve EPS', 'Anakart ATX_PWR’den, işlemci CPU_PWR’den beslenir.'),
        ('oz-6.svg', 'Paneller', 'Arka panel dışarı, başlıklar ön panele bağlanır.'),
    ]},
]
