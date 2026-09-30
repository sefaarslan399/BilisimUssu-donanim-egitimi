# DON-301 H03 — Bellek Hiyerarşisi ve RAM (Format K, lise)
MODELLER = ['M-RAM', 'M-RAM-DDR5', 'M-SODIMM', 'M-RAM-YUVASI']

DERS = {
    'grade': 'lise',
    'hafta': '3. Hafta',
    'baslik': 'Bellek Hiyerarşisi ve RAM',
    'aciklama': 'Yazmaçtan sabit diske bellek katmanlarını hız ve kapasiteyle karşılaştır; DDR4–DDR5 farkını, MT/s ve CL değerlerini, çift kanalı ve SO-DIMM’i incele.',
    'hedefler': [
        'Bellek hiyerarşisini (yazmaç, önbellek, RAM, depolama) hız, kapasite ve maliyete göre sıralayabileceğim.',
        'DDR4 ile DDR5 modüllerinin neden birbirinin yuvasına fiziksel olarak takılamadığını açıklayabileceğim.',
        'Bellek hızını (MT/s) ve gecikmesini (CL) yorumlayıp gerçek gecikmeyi nanosaniye olarak hesaplayabileceğim.',
        'Çift kanal çalışmanın bant genişliğine etkisini ve modüllerin hangi yuvalara takılacağını açıklayabileceğim.',
    ],
    'hedef_simgeler': [
        '<path d="M12 3l9 17H3z"/><path d="M7.5 12h9M5.5 16h13"/>',
        '<rect x="3" y="8" width="18" height="8" rx="1"/><path d="M13 16v-3"/><path d="M6 11h2M10 11h2M15 11h2"/>',
        '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><path d="M9 2h6"/>',
        '<path d="M3 8h18M3 16h18"/><circle cx="8" cy="8" r="1.6"/><circle cx="15" cy="16" r="1.6"/>',
    ],
    'bolumler': [
        ['Hiyerarşi', 'Yazmaç, önbellek, RAM, depolama; uçuculuk'],
        ['DDR Nesilleri', 'DDR4–DDR5, MT/s ve CL'],
        ['Modüller', 'Çift kanal, DIMM ve SO-DIMM'],
    ],
    'quiz': [
        {'q': 'Aşağıdakilerden hangisi bellek katmanlarını en hızlıdan en yavaşa doğru sıralar?',
         'opts': ['Yazmaç → L1 → L3 → RAM → SSD', 'L1 → Yazmaç → RAM → L3 → SSD', 'RAM → L1 → L2 → SSD → HDD', 'SSD → RAM → L3 → L1 → Yazmaç'], 'correct': 0,
         'fb': 'İşlemciye yaklaştıkça erişim hızlanır: yazmaç, önbellekler (L1 → L3), ana bellek (RAM), en sonda kalıcı depolama.'},
        {'q': 'Görselde bir DDR4 modül, DDR5 yuvasının üzerinde tutuluyor. Modül neden yuvaya girmez?<span class="q-gorsel"><!--@dahil:svg-quiz-centik.svg--></span>',
         'opts': ['DDR4’ün temas sayısı daha az', 'DDR5 yuvası daha kısa', 'Çentik, yuvadaki çıkıntıyla aynı hizada değil', 'UEFI eski modülü engelliyor'], 'correct': 2,
         'fb': 'İki modül de 288 temaslı ve aynı boydadır; çentik konumu farklı olduğu için yuvadaki çıkıntı yanlış nesli fiziksel olarak içeri almaz.'},
        {'q': 'DDR4-3200 CL16 bir modülün gerçek gecikmesi yaklaşık kaç nanosaniyedir?',
         'opts': ['16 ns', '10 ns', '5 ns', '3,2 ns'], 'correct': 1,
         'fb': 'Gerçek gecikme = CL × 2000 ÷ MT/s = 16 × 2000 ÷ 3200 = 10 ns.'},
        {'q': 'Ece 16 GB için iki adet 8 GB modül aldı ve ikisini de A kanalının yuvalarına (A1 ve A2) taktı. Sonuç ne olur?',
         'opts': ['Bilgisayar yalnız 8 GB görür', 'Bant genişliği iki katına çıkar', 'Modüllerin CL değeri yarıya iner', 'Sistem çalışır ama tek kanalda kalır; çift kanal için A2 ve B2 gibi farklı kanallar gerekir'], 'correct': 3,
         'fb': 'Kapasite 16 GB görünür ama iki modül aynı kanalı paylaşır. Çift kanal için modüller kılavuzda belirtilen, farklı kanallardaki yuvalara takılmalıdır.'},
    ],
    'bitis': 'Bellek katmanlarını, RAM nesillerini ve modül seçimini artık teknik gerekçeleriyle açıklayabiliyorsun!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'DDR4 ve DDR5 masaüstü bellek modülleri ile dizüstü SO-DIMM modülü', 'yedek': 'yedek-kapak.svg'}

FOTO_DDR = '<div class="foto-kart"><!--@foto:DON-301-H03-ddr4-ddr5.jpg|DDR4 ve DDR5 modülleri yan yana--><span>Gerçekte</span></div>'

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Aynı 288 Temas, Farklı Yuva',
     'desc': 'Ece, eski bilgisayarındaki DDR4 belleği yeni aldığı DDR5 anakarta takmak istiyor. İki modülün de 288 teması var. Sence ne olur?',
     'secenekler': ['Takılır ama daha yavaş çalışır.', 'Takılmaz: çentik yuvadaki çıkıntıyla hizalanmaz.', 'Takılır; UEFI güncellemesiyle çalışır.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'terim', 'terimler': [
        ('Register', 'Yazmaç', 'İşlemcinin içindeki en hızlı ve en küçük bellek.'),
        ('Cache (L1/L2/L3)', 'Önbellek', 'Sık kullanılan veriyi işlemcinin içinde tutan hızlı bellek.'),
        ('RAM', 'Rastgele Erişimli Bellek', 'Çalışan program ve verilerin tutulduğu ana bellek.'),
        ('Volatile', 'Uçucu', 'Güç kesilince içeriği kaybolan bellek.'),
        ('DRAM', 'Dinamik RAM', 'Biti kondansatörde yük olarak tutar; sürekli tazelenir.'),
        ('DDR', 'Çift Veri Hızı', 'Saat sinyalinin iki kenarında da veri aktarımı.'),
        ('MT/s', 'Saniyede Milyon Aktarım', 'Bellek hız birimi (ör. DDR4-3200 = 3200 MT/s).'),
        ('CAS Latency (CL)', 'CAS Gecikmesi', 'Okuma komutundan verinin gelmesine kadar geçen saat döngüsü.'),
        ('Dual Channel', 'Çift Kanal', 'İki bellek kanalının aynı anda veri taşıması.'),
        ('DIMM / SO-DIMM', 'Bellek Modülü / Küçük Modül', 'Masaüstü ve dizüstü bellek modülü biçimleri.'),
    ]},

    {'tur': 'adim', 'no': 1, 'ad': 'Bellek Hiyerarşisi', 'etiket': 'ADIM 1 · HİYERARŞİ',
     'ikon': '<path d="M12 3l9 17H3z"/><path d="M7.5 12h9M5.5 16h13"/>',
     'title': 'Hız mı, Kapasite mi?',
     'desc': 'İşlemciye yaklaştıkça bellek <strong>hızlanır</strong> ama <strong>küçülür</strong> ve bayt başına <strong>pahalılaşır</strong>. Yazmaçlar ve önbellek (L1, L2, L3) işlemcinin içinde, RAM anakartta; SSD ve HDD kalıcı depolamadır. Süreleri hissetmek için 1 ns’yi 1 saniye sayalım.',
     'tip': ['⏱', 'Önce tahmin et: RAM’den veri gelmesi bu ölçekte ne kadar sürer? Sonra Oynat’a bas.'],
     'genis': True,
     'gorsel': {'2d': 'hiyerarsi', 'koyu': True}},

    {'tur': 'adim', 'no': 2, 'ad': 'RAM Neden Uçucu?', 'etiket': 'ADIM 2 · UÇUCULUK',
     'ikon': '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M9 14h6v5H9z"/><path d="M12 7v3"/>',
     'title': 'Yük Sızarsa Bit Kaybolur',
     'desc': '<strong>DRAM</strong> her biti küçük bir kondansatörde yük olarak tutar (yük var: 1, yok: 0). Yük kendiliğinden sızdığı için bellek denetleyicisi satırları düzenli olarak <strong>tazeler</strong> (DDR4’te her satır 64 ms içinde). Güç kesilince tazeleme durur, veri kaybolur: RAM <strong>uçucudur</strong>.',
     'tip': ['🔌', 'Tazelemeyi izle, sonra “Gücü kes” düğmesine bas.'],
     'genis': True,
     'gorsel': {'2d': 'ucucu'}},

    {'tur': 'adim', 'no': 3, 'ad': 'DDR4 ve DDR5', 'etiket': 'ADIM 3 · NESİLLER',
     'ikon': '<rect x="3" y="5" width="18" height="6" rx="1"/><rect x="3" y="14" width="18" height="6" rx="1"/><path d="M13 5v18" stroke-dasharray="2 2"/>',
     'title': 'Aynı Boy, Farklı Çentik',
     'desc': 'DDR4 ve DDR5 modülleri aynı boyda ve 288 temaslıdır ama <strong>çentik</strong> farklı yerdedir; yuvadaki çıkıntı yanlış nesli içeri almaz. DDR5 daha düşük gerilimle çalışır (1,1 V; DDR4 1,2 V), güç yönetim çipi (<strong>PMIC</strong>) modülün üzerindedir ve her modül iki bağımsız 32 bitlik alt kanala ayrılır.',
     'tip': ['📐', '“Çakıştır” ile modülleri üst üste koy, “Yuvaya dene” ile DDR5’i DDR4 yuvasında dene.'],
     'gorsel': {'3d': 's7-3d', 'aria': 'DDR4 ve DDR5 modülleri alt alta; çentiklerden geçen çizgiler farklı konumda. DDR5 modül DDR4 yuvasına girmiyor, DDR4 modül oturuyor.',
                'yedek': 'yedek-ddr.svg', 'ust': FOTO_DDR}},

    {'tur': 'adim', 'no': 4, 'ad': 'MT/s ve CL', 'etiket': 'ADIM 4 · HIZ VE GECİKME',
     'ikon': '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><path d="M9 2h6"/>',
     'title': 'Hız ve Gecikme Birlikte Okunur',
     'desc': '<strong>MT/s</strong> saniyedeki milyon aktarım sayısıdır; DDR saat sinyalinin iki kenarında aktarım yaptığından saat frekansı bunun yarısıdır (3200 MT/s → 1600 MHz). <strong>CL</strong>, okuma komutundan verinin gelmesine kadar geçen saat döngüsü sayısıdır. Gerçek gecikme: <code>CL × 2000 ÷ MT/s</code> ns.',
     'tip': ['🧮', 'Tahmin et: DDR5-4800 CL40 mı, DDR4-3200 CL16 mı daha kısa sürede cevap verir? Modülleri seçip karşılaştır.'],
     'genis': True,
     'gorsel': {'2d': 'mtcl', 'koyu': True}},

    {'tur': 'adim', 'no': 5, 'ad': 'Tek ve Çift Kanal', 'etiket': 'ADIM 5 · KANAL',
     'ikon': '<path d="M3 8h18M3 16h18"/><circle cx="8" cy="8" r="1.6"/><circle cx="15" cy="16" r="1.6"/>',
     'title': 'İki Kanal, İki Kat Yol',
     'desc': 'Bellek denetleyicisi işlemcinin içindedir; masaüstü sistemlerde genellikle iki kanalı (A ve B) vardır. Modüller farklı kanallara takılırsa iki kanal aynı anda veri taşır ve teorik <strong>bant genişliği</strong> iki katına çıkar. Hangi yuvaların kullanılacağını anakart kılavuzu belirtir (çoğunlukla A2 ve B2).',
     'tip': ['🛣', 'Üç yerleşimi karşılaştır: veri şeritlerini ve bant genişliğini izle.'],
     'genis': True,
     'gorsel': {'2d': 'kanal'}},

    {'tur': 'adim', 'no': 6, 'ad': 'DIMM ve SO-DIMM', 'etiket': 'ADIM 6 · MODÜL BİÇİMİ',
     'ikon': '<rect x="2" y="6" width="20" height="6" rx="1"/><rect x="2" y="15" width="10" height="6" rx="1"/>',
     'title': 'Masaüstü ve Dizüstü Modülleri',
     'desc': '<strong>DIMM</strong> masaüstü modülüdür (≈ 13,3 cm). <strong>SO-DIMM</strong> dizüstü ve mini bilgisayarlarda kullanılır (≈ 7 cm); DDR4 SO-DIMM 260, DDR5 SO-DIMM 262 temaslıdır ve nesiller yine çentikle ayrılır. Bazı ince dizüstülerde bellek anakarta lehimlidir, sonradan yükseltilemez.',
     'tip': ['🔄', 'Modülleri sürükleyerek döndür; “SO-DIMM nesilleri” ile iki çentiği karşılaştır.'],
     'gorsel': {'3d': 's10-3d', 'aria': 'Masaüstü DIMM modülü ile DDR4 ve DDR5 SO-DIMM modülleri; boyları ve çentikleri karşılaştırılıyor', 'yedek': 'yedek-sodimm.svg'}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'İnsan Ölçeğinde Hiyerarşi',
     'title': 'Gecikmeyi İnsan Ölçeğine Çevir',
     'desc': 'Önce katmanları en hızlıdan en yavaşa sırala: kartlara sırayla dokun. Ardından üç görevde 1 ns = 1 sn ölçeğiyle bekleme süresini seç.',
     'tip': ['💡', 'İşlemcinin içinden dışına doğru ilerle: yazmaç, önbellekler, ana bellek, depolama.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Tamamlanan adım</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 10</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'olcek-gorev'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Doğru Belleği Seç',
     'title': 'Doğru Belleği Seç',
     'desc': 'Her görevde bir bilgisayarın özelliği verilir. Üç seçenekten uygun olanı seç ve gerekçeyi oku.',
     'tip': ['🔍', 'Önce biçime (DIMM / SO-DIMM) ve nesle (DDR4 / DDR5) bak; sonra hız, gecikme ve kanal yerleşimini karşılaştır.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Görev</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 5</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'bellek-sec'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'Hiyerarşi', 'Yazmaç → önbellek → RAM → SSD/HDD: hız azalır, kapasite artar.'),
        ('oz-2.svg', 'Uçucu RAM', 'DRAM yükü sızar; tazeleme ve güç olmadan veri kaybolur.'),
        ('oz-3.svg', 'DDR4 ≠ DDR5', 'Aynı 288 temas, farklı çentik ve gerilim; DDR5’te PMIC modülde.'),
        ('oz-4.svg', 'MT/s ve CL', 'Gerçek gecikme = CL × 2000 ÷ MT/s (ns).'),
        ('oz-5.svg', 'Çift Kanal', 'Farklı kanallardaki iki modül: teorik bant genişliği × 2.'),
        ('oz-6.svg', 'DIMM / SO-DIMM', 'Masaüstü ≈ 13,3 cm, dizüstü ≈ 7 cm.'),
    ]},
]
