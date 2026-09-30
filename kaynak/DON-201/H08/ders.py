# DON-201 H08 — Depolama Birimleri (Format K)
MODELLER = ['M-HDD-ACIK', 'M-SSD', 'M-M2', 'M-USB-BELLEK']

DERS = {
    'hafta': '8. Hafta',
    'baslik': 'Depolama Birimleri',
    'aciklama': 'Dosyaların kalıcı olarak nerede durduğunu keşfet: HDD, SSD, USB bellek, hafıza kartı ve bulut.',
    'hedefler': [
        'Kalıcı depolamayı RAM’den ayırt edebileceğim.',
        'HDD ile SSD’yi yapısına ve hızına göre karşılaştırabileceğim.',
        'USB bellek ve hafıza kartı gibi taşınabilir depolama birimlerini tanıyabileceğim.',
        'Yedeklemenin neden önemli olduğunu açıklayabileceğim.',
    ],
    'hedef_simgeler': [
        '<path d="M6 3h9l4 4v14H6z"/><path d="M9 13h6M9 17h4"/>',
        '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M5 19l5-5"/>',
        '<rect x="8" y="3" width="8" height="5" rx="1"/><rect x="6" y="8" width="12" height="13" rx="3"/>',
        '<path d="M7 18a4 4 0 0 1 0-8 6 6 0 0 1 11 1 3.5 3.5 0 0 1 0 7z"/><path d="M12 11v5M10 14l2 2 2-2"/>',
    ],
    'bolumler': [
        ['Kalıcı Depolama ve HDD', 'Elektrik gidince ne kalır, dönen plakalar'],
        ['SSD ve Hız', 'Bellek çipleri, HDD mi SSD mi?'],
        ['Taşı ve Yedekle', 'USB bellek, hafıza kartı, bulut'],
    ],
    'quiz': [
        {'q': 'Bilgisayarın fişi aniden çekildi. Hangisindeki bilgi kaybolur?',
         'opts': ['RAM’deki kaydedilmemiş bilgi', 'SSD’deki kayıtlı dosyalar', 'HDD’deki fotoğraflar', 'USB bellekteki dosyalar'], 'correct': 0,
         'fb': 'RAM geçicidir; elektrik gidince içi boşalır. SSD, HDD ve USB bellek kalıcı depolamadır.'},
        {'q': 'Görseldeki depolama birimi hangisidir ve neden SSD’den yavaştır?<span class="q-gorsel"><!--@dahil:svg-quiz-hdd.svg--></span>',
         'opts': ['SSD; bellek çipleri yavaş çalışır', 'USB bellek; boyutu küçüktür', 'HDD; plaka dönmeli, kafa doğru ize gitmelidir', 'RAM; elektrik gidince silinir'], 'correct': 2,
         'fb': 'Dönen plaka ve kol HDD’nin içidir. Veriyi okumak için plakanın dönmesi ve kafanın ize gitmesi gerekir.'},
        {'q': 'Ece fotoğraf makinesiyle çektiği fotoğrafları bilgisayara aktaracak. Fotoğraflar makinede nerede durur?',
         'opts': ['Makinenin RAM’inde; kapanınca silinir', 'Makineye takılı SD hafıza kartında', 'Makinenin içindeki HDD’de', 'İnternet olmadan doğrudan bulutta'], 'correct': 1,
         'fb': 'Fotoğraf makineleri fotoğrafları çoğunlukla SD hafıza kartına kaydeder. Kart çıkarılıp bilgisayara takılabilir.'},
        {'q': 'Deniz’in proje ödevi yalnız bilgisayarında. Disk bozulursa ödevi kaybetmemek için ne yapmalıydı?',
         'opts': ['Dosyanın adını değiştirmeliydi', 'Ödevi aynı diskte başka bir klasöre kopyalamalıydı', 'Bilgisayarı hiç kapatmamalıydı', 'Ödevin bir kopyasını buluta ya da USB belleğe almalıydı'], 'correct': 3,
         'fb': 'Yedek, başka bir yerde duran ikinci kopyadır. Aynı diskteki kopya, disk bozulunca onunla birlikte gider.'},
        {'q': 'Derinleş (bonus): Dosya Gezgini’nde C: sürücüsü için “45 GB boş / 465 GB” yazıyor. Diskin ne kadarı dolu?',
         'opts': ['420 GB', '510 GB', '45 GB', '465 GB'], 'correct': 0,
         'fb': 'Dolu yer = toplam − boş: 465 − 45 = 420 GB. Bu soru puanını düşürmez.'},
    ],
    'bitis': 'Artık dosyalarının nerede durduğunu biliyor, HDD ile SSD’yi ayırt ediyor ve yedek almayı biliyorsun!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'Kapağı şeffaf sabit disk, SSD, M.2 SSD ve USB bellek', 'yedek': 'yedek-kapak.svg'}

FOTO_HDD = '<div class="foto-kart"><!--@foto:DON-201-H08-hdd-ic.jpg|Kapağı açılmış bir sabit diskin (HDD) içi: plaka ve okuma-yazma kafası--><span>Gerçekte</span></div>'
FOTO_SSD = ('<div class="foto-kart" data-foto="sata"><!--@foto:DON-201-H08-sata-ssd.jpg|2,5 inç SATA SSD--><span>Gerçekte</span></div>'
            '<div class="foto-kart" data-foto="m2" hidden><!--@foto:DON-201-H08-m2-ssd.jpg|M.2 SSD--><span>Gerçekte</span></div>')

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Kaydettiğin Dosya Nerede Uyuyor?',
     'desc': 'Ödevini yazdın, kaydettin ve bilgisayarı kapattın. Ertesi gün açınca ödevin karşına çıkıyor. Sence gece boyunca dosya neredeydi?',
     'secenekler': ['RAM’de bekledi; açınca oradan geldi.', 'Depolama biriminde durdu; elektrik gidince silinmez.', 'Kapanınca kaydedilen dosyalar da silinir.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'adim', 'no': 1, 'ad': 'Kalıcı Depolama', 'etiket': 'ADIM 1 · KALICI DEPOLAMA',
     'ikon': '<path d="M6 3h9l4 4v14H6z"/><path d="M9 13h6M9 17h4"/>',
     'title': 'Elektrik Gidince Ne Kalır?',
     'desc': 'RAM bir çalışma masası gibidir: elektrik gidince üstü boşalır. <strong>Kalıcı depolama</strong> ise dolap gibidir. Kaydettiğin dosya orada elektrik olmadan da kalır.',
     'tip': ['💾', 'Önce Kaydet, sonra Elektriği kes: hangi dosya kalıyor?'],
     'genis': True,
     'gorsel': {'2d': 'kalici'}},

    {'tur': 'adim', 'no': 2, 'ad': 'HDD', 'etiket': 'ADIM 2 · HDD',
     'ikon': '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M5 19l5-5"/>',
     'title': 'Dönen Plakalar: HDD',
     'desc': '<strong>HDD</strong> (sabit disk), plak çalara benzer. Parlak <strong>plakalar</strong> dakikada 5400 ya da 7200 kez döner. <strong>Okuma-yazma kafası</strong> plakaya değmeden veriyi okur.',
     'tip': ['🔍', 'Dosya oku: kafa izden ize gider. Bir parçaya dokun.'],
     'gorsel': {'3d': 's5-3d', 'aria': 'Şeffaf kapaklı sabit disk: plaka dönüyor, okuma-yazma kafası iz değiştiriyor', 'yedek': 'yedek-hdd.svg', 'ust': FOTO_HDD}},

    {'tur': 'adim', 'no': 3, 'ad': 'SSD', 'etiket': 'ADIM 3 · SSD',
     'ikon': '<rect x="4" y="5" width="16" height="14" rx="2"/><rect x="7" y="8" width="4" height="4"/><rect x="13" y="8" width="4" height="4"/><rect x="7" y="13" width="10" height="3"/>',
     'title': 'Hareketsiz ve Sessiz: SSD',
     'desc': '<strong>SSD</strong> (katı hal sürücüsü) içinde dönen parça yoktur. Veri, <strong>bellek çiplerinde</strong> elektrikle saklanır. Çubuk biçimli <strong>M.2 SSD</strong> ise anakarta doğrudan takılır.',
     'tip': ['⚡', 'Oku düğmesine bas: çipler sırayla yanar, hiçbir şey dönmez.'],
     'gorsel': {'3d': 's6-3d', 'aria': 'Kapağı kaldırılmış SATA SSD ve M.2 SSD: bellek çipleri sırayla yanıyor, hareketli parça yok', 'yedek': 'yedek-ssd.svg', 'ust': FOTO_SSD}},

    {'tur': 'adim', 'no': 4, 'ad': 'HDD mi SSD mi?', 'etiket': 'ADIM 4 · KARŞILAŞTIR',
     'ikon': '<path d="M4 7h10"/><path d="M4 12h16"/><path d="M4 17h7"/><circle cx="18" cy="7" r="2"/>',
     'title': 'Hangisi Önce Açar?',
     'desc': 'SSD’de kafa gidip gelmez, plaka dönmeyi beklemez. Bu yüzden oyun ve programlar daha hızlı açılır. HDD ise aynı fiyata daha çok yer sunar.',
     'tip': ['🏁', 'Önce tahmin et, sonra yarışı izle.'],
     'genis': True,
     'gorsel': {'2d': 'yaris'}},

    {'tur': 'adim', 'no': 5, 'ad': 'USB Bellek, Hafıza Kartı', 'etiket': 'ADIM 5 · TAŞINABİLİR',
     'ikon': '<rect x="8" y="3" width="8" height="5" rx="1"/><rect x="6" y="8" width="12" height="13" rx="3"/>',
     'title': 'Cepte Taşınan Depolama',
     'desc': '<strong>USB bellek</strong> ve <strong>hafıza kartı</strong> da bellek çipleriyle çalışır. SD kart fotoğraf makinesinde, microSD telefonda kullanılır. Küçüktür ve kolay kaybolur.',
     'tip': ['🔎', 'Bir birim seç: nerede kullanıldığını gör.'],
     'gorsel': {'3d': 's8-3d', 'aria': 'USB bellek, SD kart ve microSD kart yan yana; seçilen birimin kullanıldığı yer yazıyor', 'yedek': 'yedek-usb.svg'}},

    {'tur': 'adim', 'no': 6, 'ad': 'Bulut ve Yedekleme', 'etiket': 'ADIM 6 · YEDEK',
     'ikon': '<path d="M7 18a4 4 0 0 1 0-8 6 6 0 0 1 11 1 3.5 3.5 0 0 1 0 7z"/><path d="M12 11v5M10 14l2 2 2-2"/>',
     'title': 'Bir Kopya da Başka Yerde',
     'desc': '<strong>Yedek</strong>, dosyanın başka bir yerde duran ikinci kopyasıdır. <strong>Bulut</strong>, dosyanı internetteki güvenli bir depoda saklar. Disk bozulsa da dosyan geri gelir.',
     'tip': ['☁️', 'Yedekle, Arıza, Geri yükle: sırayla izle.'],
     'genis': True,
     'gorsel': {'2d': 'bulut'}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Yükleme Yarışı',
     'title': 'Hangisi Önce Biter?',
     'desc': 'Her turda bir iş var. HDD ve SSD aynı anda başlıyor. Önce tahmin et, sonra yarışı izle.',
     'tip': ['💡', 'Dikkat: her işi disk yavaşlatmaz.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Tamamlanan tur</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 4</span></div><div class="etk-ilerleme-bar"><span></span></div></div>'
           '<ol class="gorevler" id="yaris-turlari">'
           '<li><span class="g-isaret"></span><span>Bilgisayarı açmak</span></li>'
           '<li><span class="g-isaret"></span><span>Şarkı dinlemek</span></li>'
           '<li><span class="g-isaret"></span><span>İnternetten indirmek</span></li>'
           '<li><span class="g-isaret"></span><span>Fotoğraf kopyalamak</span></li></ol>',
     'gorsel': {'panel': 'yaris-oyunu'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Yedekleme Senaryosu',
     'title': 'Deniz’in Proje Ödevi',
     'desc': 'Deniz’in ödevinin başına neler gelecek? Her adımda doğru kararı seç. Kopyaların nerede durduğunu üstteki kutulardan izle.',
     'tip': ['🛟', 'Yedek, başka yerde duran ikinci kopyadır.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Tamamlanan adım</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 5</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'yedek-senaryo'}},

    {'tur': 'derinles', 'ad': 'Disk Ne Kadar Dolu?',
     'title': 'Doluluk Çubuğunu Oku',
     'desc': 'Dosya Gezgini’nde her diskin altında bir çubuk vardır. Çubuk dolmaya başladıkça disk de dolar. Dolu yer = toplam − boş.',
     'tip': ['🔎', 'Kutusunda 1 TB yazan disk burada yaklaşık 931 GB görünür.'],
     'genis': True,
     'gorsel': {'2d': 'doluluk'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'Kalıcı Depolama', 'Elektrik gidince de kalır.'),
        ('oz-2.svg', 'HDD', 'Dönen plaka, okuma-yazma kafası.'),
        ('oz-3.svg', 'SSD', 'Bellek çipleri; hareketli parça yok.'),
        ('oz-4.svg', 'HDD mi SSD mi?', 'SSD hızlı; HDD aynı fiyata geniş.'),
        ('oz-5.svg', 'USB ve Kart', 'Küçük, taşınabilir, kolay kaybolur.'),
        ('oz-6.svg', 'Bulut ve Yedek', 'İkinci kopya başka yerde.'),
    ]},
]
