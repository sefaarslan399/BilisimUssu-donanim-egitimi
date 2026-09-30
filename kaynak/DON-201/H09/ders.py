# DON-201 H09 — Güç Kaynağı, Ekran Kartı ve Soğutma (Format K)
MODELLER = ['M-MASAUSTU-ACIK', 'M-PSU', 'M-GPU', 'M-FAN', 'M-SOGUTUCU', 'M-GUC-FISI']

DERS = {
    'hafta': '9. Hafta',
    'baslik': 'Güç Kaynağı, Ekran Kartı ve Soğutma',
    'aciklama': 'Enerjinin güç kaynağından parçalara yolunu izle, ekran kartını tanı, hava akışını gör ve sanal bir bilgisayar topla.',
    'hedefler': [
        'Güç kaynağının elektriği nasıl çevirip parçalara dağıttığını açıklayabileceğim.',
        'Güç kaynağının neden asla açılmaması gerektiğini nedenleriyle anlatabileceğim.',
        'Tümleşik ve harici ekran kartını karşılaştırabileceğim.',
        'Parçaları sanal kasada doğru yerlerine takıp birlikte çalıştırabileceğim.',
    ],
    'hedef_simgeler': [
        '<polygon points="13 2 4 14 11 14 10 22 20 9 13 9 13 2"/>',
        '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
        '<rect x="2" y="6" width="20" height="11" rx="2"/><circle cx="8" cy="11.5" r="3"/><circle cx="16" cy="11.5" r="3"/><path d="M6 17v3M10 17v2M14 17v2"/>',
        '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M9 6h6M9 10h6"/><circle cx="12" cy="16" r="2"/>',
    ],
    'bolumler': [
        ['Güç Kaynağı', 'Görevi, neden açılmaz'],
        ['Ekran Kartı', 'GPU, tümleşik ve harici'],
        ['Soğutma ve Montaj', 'Hava akışı, sanal montaj'],
    ],
    'quiz': [
        {'q': 'Güç kaynağının görevi nedir?',
         'opts': ['Prizden gelen elektriği parçalara uygun hâle getirip dağıtmak', 'Ekranda görünecek görüntüyü hazırlamak',
                  'Dosyaları ve programları kalıcı olarak saklamak', 'Kasanın içine serin hava çekmek'], 'correct': 0,
         'fb': 'Güç kaynağı prizdeki elektriği parçaların kullandığı düşük gerilime (12 V, 5 V, 3,3 V) çevirir ve kablolarla dağıtır.'},
        {'q': 'Görseldeki açık kasada ekran kartı hangi numaralı yere takılır?<span class="q-gorsel"><!--@dahil:svg-quiz-kasa.svg--></span>',
         'opts': ['1 numaralı yere', '2 numaralı yere', '3 numaralı yere', '4 numaralı yere'], 'correct': 2,
         'fb': 'Ekran kartı anakarttaki uzun PCIe yuvasına (3) takılır. 1 RAM yuvaları, 2 işlemci, 4 güç kaynağının yeridir.'},
        {'q': 'Ece, bilgisayarının güç kaynağından yanık kokusu geldiğini fark ediyor. Ne yapmalı?',
         'opts': ['Vidaları söküp içine bakmalı', 'Bilgisayarı kapatıp fişi çekmeli, bir yetişkine haber vermeli',
                  'Fişi çekip hemen kapağını açmalı; artık elektrik kalmamıştır', 'Kokuyu gidermek için içine su püskürtmeli'], 'correct': 1,
         'fb': 'Güç kaynağı fiş çekilse bile içinde elektrik saklayabilir; asla açılmaz. Fiş çekilir ve bir yetişkine haber verilir.'},
        {'q': 'Deniz yalnız ödev yazıp video izleyecek. İnce ve pili uzun giden bir dizüstü istiyor. Hangisi ona uygundur?',
         'opts': ['En güçlü harici ekran kartı', 'İki ayrı harici ekran kartı', 'Harici kart şart; tümleşik kart görüntü veremez',
                  'Tümleşik ekran kartı yeterlidir; az enerji harcar'], 'correct': 3,
         'fb': 'Ödev ve video için tümleşik ekran kartı yeter. Az enerji harcar, az ısınır; dizüstünün pili daha uzun gider.'},
        {'q': 'Derinleş (bonus): Oyunlarda ve 3D tasarımda ekran kartı görüntüyü neden işlemciden çok daha hızlı hazırlar?',
         'opts': ['Binlerce küçük çekirdeği aynı anda çalışır', 'Ekran kartı elektrik harcamaz', 'Ekran kartının hiç belleği yoktur',
                  'Görüntüyü hazır olarak internetten indirir'], 'correct': 0,
         'fb': 'Bir sahne binlerce küçük üçgenden oluşur. Ekran kartının binlerce çekirdeği onları aynı anda boyar. Bu soru puanını düşürmez.'},
    ],
    'bitis': 'Artık güç kaynağının, ekran kartının ve fanların birlikte nasıl çalıştığını biliyorsun!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'Çift fanlı ekran kartı, uyarı etiketli güç kaynağı ve kasa fanı', 'yedek': 'yedek-kapak.svg'}

FOTO_PSU = '<div class="foto-kart"><!--@foto:DON-201-H09-psu-dis.jpg|Güç kaynağının dış görünümü: fan ızgarası, kablolar ve etiket--><span>Gerçekte</span></div>'
FOTO_ETIKET = '<div class="foto-kart"><!--@foto:DON-201-H09-psu-etiket.jpg|Güç kaynağının üzerindeki uyarı etiketi--><span>Gerçekte</span></div>'
FOTO_GPU = '<div class="foto-kart"><!--@foto:DON-201-H09-ekran-karti.jpg|Gerçek bir harici ekran kartı: fanlar, PCIe tarağı ve görüntü çıkışları--><span>Gerçekte</span></div>'

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Elektrik Parçalara Nasıl Ulaşır?',
     'desc': 'Bilgisayarın fişini prize taktın. İçerideki işlemci, ekran kartı ve fanlar da elektrik ister. Sence elektrik onlara nasıl ulaşır?',
     'secenekler': ['Her parçanın ayrı fişi vardır; hepsi prize takılır.', 'Güç kaynağı elektriği alır, uygun hâle getirip dağıtır.',
                    'Elektriği ekran kartı alır, sonra diğerlerine verir.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'adim', 'no': 1, 'ad': 'Güç Kaynağı', 'etiket': 'ADIM 1 · GÜÇ KAYNAĞI',
     'ikon': '<polygon points="13 2 4 14 11 14 10 22 20 9 13 9 13 2"/>',
     'title': 'Enerjinin Dağıtım Merkezi',
     'desc': '<strong>Güç kaynağı</strong> prizden gelen elektriği alır. Onu parçaların kullandığı düşük gerilime çevirir ve kablolarla dağıtır. Telefonun şarj aletine benzer; ama birçok parçaya birden hizmet eder.',
     'tip': ['⚡', 'Enerjiyi aç düğmesine bas. Renkli çizgileri ve etiketleri izle.'],
     'gorsel': {'3d': 's4-3d', 'aria': 'Açık kasa: prizden gelen enerji güç kaynağına girer, renkli çizgilerle işlemciye, ekran kartına, anakarta ve diske dağılır',
                'yedek': 'yedek-akis.svg', 'ust': FOTO_PSU}},

    {'tur': 'adim', 'no': 2, 'ad': 'Neden Açılmaz?', 'etiket': 'ADIM 2 · ASLA AÇMA',
     'ikon': '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
     'title': 'Güç Kaynağı Asla Açılmaz',
     'desc': 'Güç kaynağının içinde elektriği depolayan parçalar vardır. Fiş çekilse bile elektrik saklar ve çarpabilir. Bozulan güç kaynağı açılmaz; yenisiyle değiştirilir.',
     'tip': ['🔒', 'Etiketi oku. Sorun görürsen güvendiğin bir yetişkine söyle.'],
     'gorsel': {'3d': 's5-3d', 'aria': 'Güç kaynağının dış görünümü ve uyarı etiketi; vidalara dokununca kilit ve uyarı çıkar',
                'yedek': 'yedek-psu.svg', 'ust': FOTO_ETIKET}},

    {'tur': 'adim', 'no': 3, 'ad': 'Ekran Kartı', 'etiket': 'ADIM 3 · EKRAN KARTI',
     'ikon': '<rect x="2" y="6" width="20" height="11" rx="2"/><circle cx="8" cy="11.5" r="3"/><circle cx="16" cy="11.5" r="3"/><path d="M6 17v3M10 17v2M14 17v2"/>',
     'title': 'Görüntünün Ressamı',
     'desc': '<strong>Ekran kartı</strong>, ekranda gördüğün görüntüyü hazırlar. Kendi işlemcisi (<strong>GPU</strong>), belleği ve fanları vardır. Anakarttaki uzun <strong>PCIe</strong> yuvasına takılır.',
     'tip': ['👆', 'Parçalara dokun. Sonra soğutucuyu ayırıp GPU’yu bul.'],
     'gorsel': {'3d': 's6-3d', 'aria': 'Ekran kartı: iki fan, soğutucu, PCIe tarağı, görüntü çıkışları ve güç girişi; soğutucu ayrılınca GPU çipi ve bellekler görünür',
                'yedek': 'yedek-gpu.svg', 'ust': FOTO_GPU}},

    {'tur': 'adim', 'no': 4, 'ad': 'Tümleşik ve Harici', 'etiket': 'ADIM 4 · KARŞILAŞTIR',
     'ikon': '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="9" width="8" height="12" rx="1.5"/><path d="M5.5 7h3M15.5 13h3"/>',
     'title': 'İşlemcinin İçinde mi, Ayrı Kart mı?',
     'desc': '<strong>Tümleşik</strong> ekran kartı işlemcinin içindedir; RAM’i paylaşır. <strong>Harici</strong> ekran kartı ayrı bir karttır; kendi belleği ve soğutucusu vardır. Harici kart daha güçlüdür ama daha çok enerji harcar.',
     'tip': ['🎮', 'Bir iş seç. Hangi kartın zorlandığını izle.'],
     'genis': True,
     'gorsel': {'2d': 'tumlesik'}},

    {'tur': 'adim', 'no': 5, 'ad': 'Fanlar ve Hava Akışı', 'etiket': 'ADIM 5 · HAVA AKIŞI',
     'ikon': '<path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/>',
     'title': 'Önden Serin, Arkadan Sıcak',
     'desc': 'Parçalar çalışırken ısınır. Öndeki <strong>fanlar</strong> serin havayı içeri çeker; arkadaki fan sıcak havayı dışarı atar. Hava, kasada bir koridordaki gibi akar.',
     'tip': ['🌬️', 'Önce tahmin et. Sonra fanları durdurup sıcaklığı izle.'],
     'gorsel': {'3d': 's8-3d', 'aria': 'Açık kasa: mavi hava parçacıkları öndeki fanlardan girer, parçaların üstünden geçip ısınır ve turuncu olarak arkadan çıkar',
                'yedek': 'yedek-hava.svg'}},

    {'tur': 'adim', 'no': 6, 'ad': 'Hepsi Bir Arada', 'etiket': 'ADIM 6 · BİRLİKTE',
     'ikon': '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M9 6h6M9 10h6"/><circle cx="12" cy="16" r="2"/>',
     'title': 'Hepsi Birlikte Çalışır',
     'desc': 'Her parçanın bir görevi vardır. Güç kaynağı enerji verir, fanlar serinletir, ekran kartı görüntüyü hazırlar. Hepsi <strong>anakart</strong> üzerinden birbirine bağlanır.',
     'tip': ['🧩', 'Bilgisayarı parçalarına ayır. Sonra yerine döndür.'],
     'gorsel': {'3d': 's9-3d', 'aria': 'Patlatma görünümü: güç kaynağı, ekran kartı, soğutucu, bellek, disk ve fanlar kasadan ayrılıp etiketlenir, sonra yerine döner',
                'yedek': 'yedek-patlat.svg'}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Sanal Montaj',
     'title': 'Sanal Montaj: Bilgisayarı Topla',
     'desc': 'Masadaki parçaları kasadaki doğru yerlerine sürükle. İstersen önce parçaya, sonra numaralı yere dokun.',
     'tip': ['🔌', 'Montaj boyunca fiş çekili durur. Bitince fişi tak ve çalıştır.'],
     'ek': '<div class="mt-tepsi" id="mt-tepsi" role="group" aria-label="Takılacak parçalar"></div>'
           '<div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Yerleşen parça</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 6</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'3d': 's10-3d', 'aria': 'Sanal montaj: yan yatırılmış açık kasa ve masadaki parçalar; parçalar kasadaki doğru yerlerine sürüklenir',
                'yedek': 'yedek-montaj.svg', 'yedek_metin': 'Bu cihazda 3D açılmadı. Güç kaynağı alta, ekran kartı PCIe yuvasına, RAM işlemcinin yanına takılır.'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Hangi Ekran Kartı?',
     'title': 'Tümleşik Yeter mi?',
     'desc': 'Her işi doğru kutuya yerleştir: Tümleşik ekran kartı yeter mi, yoksa güçlü bir harici kart mı gerekir?',
     'tip': ['💡', 'Ağır 3D görüntü isteyen işler güçlü harici kart ister.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Yerleşen kart</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 8</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'sinifla-gpu'}},

    {'tur': 'derinles', 'ad': 'Tasarım ve Oyun',
     'title': 'Binlerce Küçük Ressam',
     'desc': 'Oyundaki ve 3D tasarımdaki her şekil küçük <strong>üçgenlerden</strong> oluşur. Ekran kartındaki binlerce küçük çekirdek bu üçgenleri aynı anda boyar. Bu yüzden oyun ve tasarım bilgisayarları güçlü ekran kartı kullanır.',
     'tip': ['🔎', 'Video kurgusu ve yapay zekâ da ekran kartından yararlanır.'],
     'genis': True,
     'gorsel': {'2d': 'boya'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'Güç Kaynağı', 'Elektriği çevirir ve dağıtır.'),
        ('oz-2.svg', 'Asla Açma', 'İçinde elektrik saklanır.'),
        ('oz-3.svg', 'Ekran Kartı', 'Görüntüyü hazırlar; GPU’su vardır.'),
        ('oz-4.svg', 'Tümleşik / Harici', 'İşlemcinin içinde ya da ayrı kart.'),
        ('oz-5.svg', 'Hava Akışı', 'Önden serin girer, arkadan sıcak çıkar.'),
        ('oz-6.svg', 'Hepsi Bir Arada', 'Parçalar anakartla birlikte çalışır.'),
    ]},
]
