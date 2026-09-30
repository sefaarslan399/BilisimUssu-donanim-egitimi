# DON-201 H14 — Proje: Bilgisayar Kimlik Kartı (Format U)
MODELLER = ['M-MASAUSTU', 'M-ARKA-PANEL']

DERS = {
    'hafta': '14. Hafta',
    'baslik': 'Proje: Bilgisayar Kimlik Kartı',
    'aciklama': 'Bir bilgisayarın değerlerini bul, portlarını say, ne için uygun olduğunu gerekçelendir ve kimlik kartını sun.',
    'hedefler': [
        'Sistem bilgisinden işlemci, RAM ve depolama değerlerini bulabileceğim.',
        'Bilgisayarın portlarını sayıp türlerine göre listeleyebileceğim.',
        'Bilgisayarın hangi işlere uygun olduğunu gerekçesiyle söyleyebileceğim.',
        'Bilgisayarın kimlik kartını hazırlayıp sınıfa sunabileceğim.',
    ],
    'hedef_simgeler': [
        '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M12 9v5M12 6.5h.01"/>',
        '<rect x="3" y="7" width="18" height="10" rx="2"/><rect x="6" y="10" width="4" height="3"/><rect x="12" y="10" width="3" height="3"/>',
        '<circle cx="12" cy="12" r="9"/><polyline points="8 12 11 15 16 9"/>',
        '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2.5"/><path d="M13 10h5M13 14h4"/>',
    ],
    'bolumler': [
        ['Bilgiyi Topla', 'Sistem bilgisi, tablo, portlar'],
        ['Yorumla', 'Ne için uygun? Gerekçe'],
        ['Kart ve Sunum', 'Kimlik kartı, sunum, yükseltme'],
    ],
    'quiz': [
        {'q': 'Bir bilgisayarın işlemci ve RAM bilgisini en kolay nerede bulursun?',
         'opts': ['Ayarlar > Sistem > Hakkında ekranında', 'Masaüstündeki Geri Dönüşüm Kutusu’nda', 'Kasanın ön panelindeki ışıklarda', 'Klavyenin altındaki etikette'], 'correct': 0,
         'fb': 'Hakkında ekranı işlemciyi ve yüklü RAM’i gösterir. Kasayı açmaya gerek yoktur.'},
        {'q': 'Görseldeki arka panelde kaç USB-A portu var?<span class="q-gorsel"><!--@dahil:svg-quiz-panel.svg--></span>',
         'opts': ['2', '6', '4', '9'], 'correct': 2,
         'fb': 'Dikdörtgen, içinde dil olan dört USB-A var. HDMI, ağ ve ses girişleri ayrı türdür.'},
        {'q': 'Ece bilgisayarda çizim ve fotoğraf düzenleme yapacak. Hangi kimlik kartı ona daha uygundur?',
         'opts': ['4 GB RAM, HDD, 2 çekirdek', '8 GB RAM, SSD, 4 çekirdek', '2 GB RAM, SSD, 2 çekirdek', '4 GB RAM ama 10 USB portu'], 'correct': 1,
         'fb': 'Çizim programları için 8 GB RAM, 4 çekirdek ve hızlı SSD iyi bir başlangıçtır. Port sayısı hızı değiştirmez.'},
        {'q': 'Deniz kimlik kartını sunuyor. Hangi cümle en iyi gerekçedir?',
         'opts': ['“Kasası büyük, o yüzden çok hızlı.”', '“Rengi güzel, oyun için uygun.”', '“Portu çok, çizim için uygun.”', '“8 GB RAM’i ve SSD’si var; ödev ve programlama için uygun.”'], 'correct': 3,
         'fb': 'İyi gerekçe bir değere dayanır: RAM, depolama türü ya da ekran kartı. Kasanın boyutu ve rengi gerekçe değildir.'},
        {'q': 'Derinleş (bonus): HDD yerine SSD takılırsa en çok ne kazanılır?',
         'opts': ['Açılış ve program yükleme hızlanır', 'Ekranın çözünürlüğü artar', 'Port sayısı artar', 'İnternet hızlanır'], 'correct': 0,
         'fb': 'SSD’de dönen parça yoktur; veriyi çok daha hızlı okur. Bu soru puanını düşürmez.'},
    ],
    'bitis': 'Bir bilgisayarı değerleriyle tanıttın, gerekçeli yorumladın ve kimlik kartını sundun!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'Masaüstü bilgisayar kasası yavaşça dönüyor; camdan iç parçaları görünüyor', 'yedek': 'yedek-kasa.svg'}


def foto(no, ad, aciklama):
    return 'DON-201-H14-' + str(no) + '-' + ad + '.jpg|' + aciklama


SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Bu Bilgisayar Ne Kadar Güçlü?',
     'desc': 'Okuldaki bir bilgisayarın RAM’ini öğrenmek istiyorsun. Sence en kolay yol hangisi?',
     'secenekler': ['Kasayı açıp RAM’in üstündeki etikete bakarım.', 'Sistem bilgisi ekranından okurum.', 'Kasanın ne kadar büyük olduğuna bakarım.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'uygulama', 'no': 1, 'ad': 'Sistem Bilgisini Bul', 'etiket': 'ADIM 1 · BUL',
     'ikon': '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M12 9v5M12 6.5h.01"/>',
     'title': 'Bilgisayar Kendini Tanıtıyor',
     'prova': {'html': '<div class="u2d" id="p-sistem"></div>'},
     'foto': foto(1, 'sistem-bilgisi', 'Ekranda açık Hakkında sayfası; işlemci ve RAM satırları görünüyor'),
     'talimat': ['<strong>Ayarlar &gt; Sistem &gt; Hakkında</strong>’yı aç.',
                 '<strong>İşlemci</strong> ve <strong>Yüklü RAM</strong> satırlarını oku.',
                 '<strong>Görev Yöneticisi &gt; Performans</strong>’ta diski ve ekran kartını bul.'],
     'kontrol': 'İşlemci, RAM ve disk değerleri not edildi.'},

    {'tur': 'uygulama', 'no': 2, 'ad': 'Tabloyu Doldur', 'etiket': 'ADIM 2 · TABLO',
     'ikon': '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M10 4v16"/>',
     'title': 'Her Değer Birimiyle Yazılır',
     'prova': {'html': '<div class="u2d" id="p-tablo"></div>'},
     'foto': foto(2, 'tablo', 'Öğrencinin doldurduğu kimlik tablosu çalışma kâğıdı'),
     'talimat': ['Çalışma kâğıdındaki tabloyu satır satır doldur.',
                 'Her sayının yanına <strong>birimini</strong> yaz: 8 GB, 256 GB.',
                 'Ayrı ekran kartı yoksa <strong>“tümleşik”</strong> yaz.'],
     'kontrol': 'Bütün satırlar dolu, her sayının birimi var.'},

    {'tur': 'uygulama', 'no': 3, 'ad': 'Portları Say', 'etiket': 'ADIM 3 · PORTLAR',
     'ikon': '<rect x="3" y="7" width="18" height="10" rx="2"/><rect x="6" y="10" width="4" height="3"/><rect x="12" y="10" width="3" height="3"/><circle cx="18" cy="11.5" r="1.2"/>',
     'title': 'Önü ve Arkayı Türüne Göre Say',
     'prova': {'3d': 's6-3d', 'aria': 'Arka panel: portlar türüne göre tek tek vurgulanıyor ve sayılıyor', 'yedek': 'yedek-panel.svg'},
     'foto': foto(3, 'portlar', 'Masaüstü bilgisayarın arka paneli; portlar türüne göre sayılıyor'),
     'talimat': ['Kablolara <strong>dokunmadan</strong> kasanın arkasına bak.',
                 'Portları türüne göre say: <strong>USB, görüntü, ağ, ses</strong>.',
                 'Ön paneldeki portları da ekle.'],
     'kontrol': 'Her tür için bir sayı var; ön ve arka toplandı.'},

    {'tur': 'uygulama', 'no': 4, 'ad': 'Ne İçin Uygun?', 'etiket': 'ADIM 4 · YORUMLA',
     'ikon': '<circle cx="12" cy="12" r="9"/><polyline points="8 12 11 15 16 9"/>',
     'title': 'Değerler Ne Söylüyor?',
     'prova': {'html': '<div class="u2d" id="p-uygun"></div>'},
     'foto': foto(4, 'uygunluk', 'Gerekçeli “ne için uygun” notları yazılmış çalışma kâğıdı'),
     'talimat': ['<strong>RAM</strong>’e, <strong>depolama türüne</strong> ve <strong>ekran kartına</strong> bak.',
                 'Dört iş için karar ver: ödev, çizim, oyun, programlama.',
                 'Her karara “<strong>… çünkü …</strong>” diye gerekçe yaz.'],
     'kontrol': 'Her kararın yanında bir “çünkü” cümlesi var.'},

    {'tur': 'uygulama', 'no': 5, 'ad': 'Kimlik Kartını Hazırla', 'etiket': 'ADIM 5 · KART',
     'ikon': '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2.5"/><path d="M13 10h5M13 14h4"/>',
     'title': 'Değerler Karta Yerleşiyor',
     'prova': {'3d': 's8-3d', 'aria': 'Kasa: işlemci, RAM, depolama, ekran kartı ve arka panel değerleriyle sırayla etiketleniyor; sonra etiketli model kimlik kartının yüzüne yerleşiyor', 'yedek': 'yedek-kasa.svg'},
     'foto': foto(5, 'kimlik-karti', 'Tamamlanmış bilgisayar kimlik kartı'),
     'talimat': ['Kart şablonuna ya da <strong>kart üreticiye</strong> değerlerini gir.',
                 'Karta bir ad ver: ör. “Sınıf-3 Bilgisayarı”.',
                 'Uygun olduğu işleri kartın altına yaz.'],
     'kontrol': 'Kartta tüm değerler ve en az bir uygun iş var.'},

    {'tur': 'uygulama', 'no': 6, 'ad': 'Sun', 'etiket': 'ADIM 6 · SUN',
     'ikon': '<rect x="3" y="3" width="18" height="12" rx="1.5"/><path d="M12 15v4M8 21l4-2 4 2"/><path d="M7 11l3-3 2 2 4-4"/>',
     'title': 'Bir Dakikada Tanıt',
     'prova': {'html': '<div class="u2d" id="p-sun"></div>'},
     'foto': foto(6, 'sunum', 'Kimlik kartını sınıfa sunan öğrenci grubu'),
     'talimat': ['Kartını göster, bilgisayarı <strong>1 dakikada</strong> anlat.',
                 'Değerleri ve port sayılarını söyle.',
                 '“… için uygun, <strong>çünkü</strong> …” cümlesiyle bitir.'],
     'kontrol': 'Sunumda en az bir gerekçe cümlesi var.'},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Kimlik Kartı Üretici', 'etiket': 'ETKİNLİK 1 · KART ÜRETİCİ',
     'title': 'Kartını Oluştur',
     'desc': 'Bulduğun değerleri gir. Kart ve etiketli model sen yazdıkça oluşur.',
     'tip': ['💡', 'Bir değeri bilmiyorsan Adım 1’deki ekranlara dön.'],
     'ek': '<div class="kf" id="kart-form"></div>'
           '<div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Doldurulan alan</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 8</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'kimlik-karti',
                'ic': '<div class="kk" id="kk-kart"><div class="kk-ust"><span class="kk-tur">BİLGİSAYAR KİMLİK KARTI</span><b class="kk-ad">Bilgisayarım</b></div>'
                      '<div class="kk-govde"><div class="kk-model"><div class="don3d" id="kart-3d" aria-label="Kimlik kartındaki mini kasa modeli; girilen değerler parçaların üstünde etiket olarak görünür">'
                      '<div data-yedek hidden><!--@dahil:yedek-kasa.svg--></div></div></div><dl class="kk-liste" id="kk-liste"></dl></div>'
                      '<div class="kk-uygun"><div class="kk-uygun-bas">Uygun olduğu işler</div><div class="kk-isler" id="kk-isler" role="group" aria-label="Uygun olduğu işler"></div>'
                      '<div class="kk-neden" id="kk-neden" aria-live="polite"></div></div>'
                      '<div class="kk-alt"><button type="button" class="kk-indir" id="kk-indir" disabled>Kartı indir (PNG)</button></div></div>'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Uygun mu?', 'etiket': 'ETKİNLİK 2 · YORUMLA',
     'title': 'Bu İş İçin Uygun mu?',
     'desc': 'Kimlik kartına bak. Bu bilgisayar verilen iş için <strong>Uygun</strong> mu, <strong>İdare eder</strong> mi, yoksa <strong>Zorlanır</strong> mı?',
     'tip': ['🔍', 'Önce RAM’e, sonra depolama türüne ve ekran kartına bak.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Doğru karar</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 6</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'uygun-mu'}},

    {'tur': 'derinles', 'ad': 'Yükseltme Önerisi',
     'title': 'Hangi Parça Değişirse Ne Kazanılır?',
     'desc': 'Bazen tek bir parçayı değiştirmek yeter. Önce işi yavaşlatan değeri bul. Sonra o parçayı yükselt.',
     'tip': ['🔧', 'Yeni parça anakartla uyumlu olmalı. Önce kılavuza bakılır.'],
     'genis': True,
     'gorsel': {'2d': 'yukseltme'}},

    {'tur': 'ozet', 'alt': 'Projede yaptığın 6 adım:', 'kartlar': [
        ('oz-1.svg', 'Bul', 'Hakkında ve Görev Yöneticisi.'),
        ('oz-2.svg', 'Tabloya yaz', 'Her sayı birimiyle.'),
        ('oz-3.svg', 'Portları say', 'USB, görüntü, ağ, ses.'),
        ('oz-4.svg', 'Yorumla', '“… için uygun, çünkü …”'),
        ('oz-5.svg', 'Kartı hazırla', 'Değerler ve uygun işler.'),
        ('oz-6.svg', 'Sun', 'Bir dakikada, gerekçeyle.'),
    ]},
]
