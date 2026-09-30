# DON-301 H01 — Bilgisayar Mimarisine Giriş (Format K, lise kalibrasyonu)
MODELLER = []

DERS = {
    'grade': 'lise',
    'hafta': '1. Hafta',
    'baslik': 'Bilgisayar Mimarisine Giriş',
    'aciklama': 'Von Neumann modelini, veri yollarını ve 1000 ile 1024 arasındaki farkı keşfet; kayıp 69 GB’ın izini sür.',
    'hedefler': [
        'Von Neumann modelinin bileşenlerini (CPU, bellek, G/Ç, yollar) açıklayabileceğim.',
        'Adres, veri ve kontrol yollarının görevlerini ayırt edebileceğim.',
        'Ondalık (1000) ve ikili (1024) önekler arasında dönüşüm yapabileceğim.',
        '1 TB diskin neden yaklaşık 931 GB göründüğünü hesaplayabileceğim.',
    ],
    'hedef_simgeler': [
        '<rect x="3" y="4" width="8" height="8" rx="1.5"/><rect x="13" y="4" width="8" height="8" rx="1.5"/><path d="M3 18h18"/><path d="M7 12v6M17 12v6"/>',
        '<path d="M3 7h18M3 12h18M3 17h18"/><circle cx="7" cy="7" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="17" cy="17" r="1.2"/>',
        '<path d="M4 7h7M4 12h7M13 7h7M13 12h7"/><path d="M4 17h16"/>',
        '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h5M8 17h3"/>',
    ],
    'bolumler': [
        ['Mimari', 'Sistem, Von Neumann, depolanmış program'],
        ['Veri Yolları', 'Adres, veri, kontrol'],
        ['Birimler', 'KB–KiB, kayıp 69 GB'],
    ],
    'quiz': [
        {'q': 'Von Neumann modelinde program komutları ve veriler nerede tutulur?',
         'opts': ['Aynı ana bellekte', 'Yalnız işlemcinin ALU’sunda', 'Birbirinden ayrı iki bellekte', 'Yalnız sabit diskte'], 'correct': 0,
         'fb': 'Depolanmış program fikri: komutlar ve veriler aynı bellekte, aynı yollarla taşınır.'},
        {'q': 'Görselde işlemciden belleğe giden ve hangi hücreye erişileceğini belirten yol hangisidir?<span class="q-gorsel"><!--@dahil:svg-quiz-yol.svg--></span>',
         'opts': ['Veri yolu', 'Kontrol yolu', 'Adres yolu', 'Güç hattı'], 'correct': 2,
         'fb': 'Adres yolu tek yönlüdür: işlemci, erişmek istediği bellek hücresinin adresini bu yoldan gönderir.'},
        {'q': '1 GiB (gibibayt) kaç bayttır?',
         'opts': ['1 000 000 000 B', '1 073 741 824 B (2³⁰)', '1 048 576 B (2²⁰)', '1 024 000 000 B'], 'correct': 1,
         'fb': '1 GiB = 1024 × 1024 × 1024 B = 2³⁰ B = 1 073 741 824 B.'},
        {'q': 'Mert bilgisayarına üzerinde “500 GB” yazan bir disk taktı. İşletim sistemi yaklaşık kaç GB gösterir?',
         'opts': ['500 GB', '512 GB', '488 GB', '465,7 GB'], 'correct': 3,
         'fb': '500 × 10⁹ B ÷ 2³⁰ ≈ 465,7 GiB. İşletim sistemi bu değeri “GB” diye gösterir.'},
    ],
    'bitis': 'Bilgisayarın mimarisini ve kapasite hesaplarını artık teknik olarak açıklayabiliyorsun!',
}

KAPAK = {'svg': 'kapak.svg'}

SLAYTLAR = [
    {'tur': 'isinma',
     'title': '1 TB Aldın, 931 GB Görüyorsun',
     'desc': 'Kutusunda “1 TB” yazan diski taktın. Dosya Gezgini ise yaklaşık 931 GB gösteriyor. Sence aradaki 69 GB nereye gitti?',
     'secenekler': ['Üretici eksik kapasiteli disk sattı.', 'Kayıp kısım sistem dosyalarına ayrıldı.', 'Üretici ve işletim sistemi “GB”yi farklı sayıyor.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'terim', 'terimler': [
        ('CPU', 'Merkezi İşlem Birimi', 'Komutları getiren, çözen ve yürüten birim.'),
        ('ALU', 'Aritmetik Mantık Birimi', 'Toplama, karşılaştırma gibi işlemleri yapar.'),
        ('Control Unit', 'Kontrol Birimi', 'Komutu çözer, diğer birimleri yönetir.'),
        ('Register', 'Yazmaç', 'İşlemci içindeki çok hızlı küçük bellek.'),
        ('Main Memory (RAM)', 'Ana Bellek', 'Çalışan program ve verilerin tutulduğu bellek.'),
        ('I/O', 'Giriş/Çıkış (G/Ç)', 'Dış dünya ile veri alışverişi yapan birimler.'),
        ('Bus', 'Yol (veri yolu)', 'Birimleri bağlayan ortak iletim hatları.'),
        ('Stored Program', 'Depolanmış Program', 'Komutların da veri gibi bellekte saklanması.'),
        ('KiB / MiB / GiB', 'Kibi / Mebi / Gibibayt', 'İkili önekler: 2¹⁰, 2²⁰, 2³⁰ bayt.'),
    ]},

    {'tur': 'adim', 'no': 1, 'ad': 'Bilgisayar Sistemi', 'etiket': 'ADIM 1 · SİSTEM',
     'ikon': '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
     'title': 'Bilgisayar Sistemi: Katmanlar',
     'desc': 'Bir <strong>bilgisayar sistemi</strong> donanım, yazılım (işletim sistemi ve uygulamalar), veri ve kullanıcıdan oluşur. Her katman bir alttakinin hizmetini kullanır; mimari, donanım katmanının nasıl düzenlendiğini tanımlar.',
     'tip': ['🧱', 'Katmanlara dokun: hangi katman neyi yönetir?'],
     'gorsel': {'2d': 'katmanlar'}},

    {'tur': 'adim', 'no': 2, 'ad': 'Von Neumann Modeli', 'etiket': 'ADIM 2 · VON NEUMANN',
     'ikon': '<rect x="3" y="4" width="8" height="8" rx="1.5"/><rect x="13" y="4" width="8" height="8" rx="1.5"/><path d="M3 18h18"/><path d="M7 12v6M17 12v6"/>',
     'title': 'Dört Blok, Ortak Yollar',
     'desc': '1945’te John von Neumann’ın tarif ettiği modelde <strong>CPU</strong> (kontrol birimi, ALU, yazmaçlar), <strong>ana bellek</strong> ve <strong>G/Ç birimleri</strong> ortak <strong>yollar</strong> üzerinden haberleşir. Bugünkü bilgisayarların çoğu bu temele dayanır.',
     'tip': ['🔍', 'Bir bloğa dokun: görevi ve bağlandığı yollar vurgulanır.'],
     'genis': True,
     'gorsel': {'2d': 'von-neumann', 'koyu': True}},

    {'tur': 'adim', 'no': 3, 'ad': 'Program ve Veri Aynı Bellekte', 'etiket': 'ADIM 3 · DEPOLANMIŞ PROGRAM',
     'ikon': '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/>',
     'title': 'Komut da Veri de Bellekte',
     'desc': '<strong>Depolanmış program</strong> ilkesinde komutlar da veriler gibi bellekte, numaralı hücrelerde durur. İşlemci önce komutu, sonra komutun istediği veriyi aynı bellekten okur.',
     'tip': ['▶', 'Adım adım ilerle: aynı bellekten önce komut, sonra veri okunur.'],
     'genis': True,
     'gorsel': {'2d': 'bellek-tablo'}},

    {'tur': 'adim', 'no': 4, 'ad': 'Veri Yolları', 'etiket': 'ADIM 4 · YOLLAR',
     'ikon': '<path d="M3 7h18M3 12h18M3 17h18"/><circle cx="7" cy="7" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="17" cy="17" r="1.2"/>',
     'title': 'Adres, Veri ve Kontrol Yolu',
     'desc': '<strong>Adres yolu</strong> hangi hücreye gidileceğini söyler (tek yön: CPU → bellek). <strong>Veri yolu</strong> değeri taşır (iki yön). <strong>Kontrol yolu</strong> okuma/yazma gibi komut sinyallerini iletir.',
     'tip': ['🔀', 'OKU ve YAZ işlemlerini karşılaştır; çizgi desenlerine dikkat et.'],
     'genis': True,
     'gorsel': {'2d': 'yollar', 'koyu': True}},

    {'tur': 'adim', 'no': 5, 'ad': 'KB mı KiB mi?', 'etiket': 'ADIM 5 · ÖNEKLER',
     'ikon': '<path d="M4 7h7M4 12h7M13 7h7M13 12h7"/><path d="M4 17h16"/>',
     'title': 'Ondalık ve İkili Önekler',
     'desc': 'SI (ondalık) önekleri 1000’in katlarıdır: 1 KB = 10³ B. IEC (ikili) önekleri 1024’ün katlarıdır: 1 KiB = 2¹⁰ B. Önek büyüdükçe iki sistem arasındaki fark da büyür.',
     'tip': ['📏', 'Öneki seç: iki değer arasındaki farkı gör.'],
     'gorsel': {'2d': 'onekler'}},

    {'tur': 'adim', 'no': 6, 'ad': 'Kayıp 69 GB Nerede?', 'etiket': 'ADIM 6 · HESAP',
     'ikon': '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h5M8 17h3"/>',
     'title': 'Kayıp Yok, Birim Farkı Var',
     'desc': 'Üretici kapasiteyi ondalık, işletim sistemi ikili birimle hesaplar ama ikisine de “GB” der. 10¹² baytı 2³⁰’a bölünce sonuç yaklaşık <strong>931,3 GiB</strong> olur.',
     'tip': ['🧮', 'Hesabı adım adım ilerlet.'],
     'genis': True,
     'gorsel': {'2d': 'hesap', 'koyu': True}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Kapasite Dönüştürücü',
     'title': 'Diskler Ne Kadar Görünecek?',
     'desc': 'Dönüştürücüyü kullanarak her diskin işletim sisteminde kaç GiB görüneceğini bul ve kutuya yaz.',
     'tip': ['💡', 'Ondalık bayta çevir, sonra 2³⁰’a böl. Virgülden sonra bir basamak yeter.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Çözülen görev</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 4</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'donusturucu'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Hangisi Daha Büyük?',
     'title': 'Hangisi Daha Büyük?',
     'desc': 'Her turda iki kapasite gelir. Büyük olanı seç ya da eşitse “Eşit” de.',
     'tip': ['⚖️', 'İkisini de aynı birime çevirip karşılaştır.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Tur</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 6</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'karsilastir'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'Sistem', 'Donanım, yazılım, veri, kullanıcı.'),
        ('oz-2.svg', 'Von Neumann', 'CPU, bellek, G/Ç ve yollar.'),
        ('oz-3.svg', 'Depolanmış Program', 'Komut ve veri aynı bellekte.'),
        ('oz-4.svg', 'Yollar', 'Adres tek yön, veri iki yön, kontrol sinyal.'),
        ('oz-5.svg', 'Önekler', 'KB = 10³ B, KiB = 2¹⁰ B.'),
        ('oz-6.svg', '931 GiB', '10¹² B ÷ 2³⁰ ≈ 931,3.'),
    ]},
]
