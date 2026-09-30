# DON-201 H04 — Güvenli Çalışma (Format K+U)
MODELLER = ['M-MASAUSTU', 'M-GUC-FISI', 'M-RAM', 'M-ANTISTATIK-BILEKLIK', 'M-PSU', 'M-PIL', 'M-CRT']

DERS = {
    'hafta': '4. Hafta',
    'baslik': 'Güvenli Çalışma',
    'aciklama': 'Atölyede kendini ve parçaları koru: fişi çek, statik elektriği boşalt, parçayı doğru tut.',
    'hedefler': [
        'Atölye güvenlik kurallarını nedenleriyle sıralayabileceğim.',
        'Statik elektriğin parçaya nasıl zarar verdiğini açıklayabileceğim.',
        'Parçayı kenarından tutup antistatik bileklik kullanabileceğim.',
        'Hiçbir koşulda açılmayacak parçaları ayırt edebileceğim.',
    ],
    'hedef_simgeler': [
        '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><polyline points="9 12 11 14 15 10"/>',
        '<polygon points="13 2 4 14 11 14 10 22 20 9 13 9 13 2"/>',
        '<circle cx="12" cy="12" r="7"/><path d="M19 12h3"/>',
        '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    ],
    'bolumler': [
        ['Elektrik Güvenliği', 'Kurallar, fişi çek, boşalt'],
        ['Statik Elektrik', 'Kıvılcım, bileklik, tutma'],
        ['Asla Açılmayanlar', 'Güç kaynağı, şişmiş pil, düzen'],
    ],
    'quiz': [
        {'q': 'Kasayı açmadan önce ilk ne yapılır?',
         'opts': ['Fiş prizden çekilir', 'Vidalar sökülür', 'Fanlar temizlenir', 'RAM yerinden çıkarılır'], 'correct': 0,
         'fb': 'Önce fiş çekilir; sonra güç düğmesine basılı tutularak kalan elektrik boşaltılır.'},
        {'q': 'Görseldeki tutuş neden yanlıştır?<span class="q-gorsel"><!--@dahil:svg-quiz-tutus.svg--></span>',
         'opts': ['RAM çok ağır olduğu için', 'Kenarlar kaygan olduğu için', 'Parmaklar altın temaslara değdiği için', 'RAM ters durduğu için'], 'correct': 2,
         'fb': 'Altın temaslara ve çiplere dokunulmaz. Parça kısa kenarlarından tutulur.'},
        {'q': 'Deniz halıda yürüdükten sonra RAM’i eline alacak. Önce ne yapmalı?',
         'opts': ['Hemen dokunmalı, bir şey olmaz', 'Bilekliği takıp klipsi kasanın boyasız metaline bağlamalı', 'Ellerini ıslatmalı', 'Yün kazak giymeli'], 'correct': 1,
         'fb': 'Bileklik vücuttaki statik elektriği kasaya aktarır; parça korunur.'},
        {'q': 'Aşağıdakilerden hangisi hiçbir koşulda açılmaz?',
         'opts': ['Kasanın yan kapağı', 'RAM yuvasının mandalı', 'Disk kızağı', 'Güç kaynağı'], 'correct': 3,
         'fb': 'Güç kaynağının içinde fiş çekilse bile tehlikeli elektrik kalabilir. Asla açılmaz.'},
        {'q': 'Derinleş (bonus): Statik elektrik neden fark edilmeden zarar verebilir?',
         'opts': ['Parçayı bozan elektrik, hissedebileceğimizden çok daha azdır', 'Statik elektrik yalnız yazın oluşur', 'Parçalar elektriği hiç sevmez', 'Kıvılcım her zaman görülür'], 'correct': 0,
         'fb': 'Bir kıvılcımı hissetmemiz için binlerce volt gerekir; bazı çipler çok daha azıyla bozulabilir. Bu soru puanını düşürmez.'},
    ],
    'bitis': 'Artık atölyede kendini ve parçaları koruyarak güvenle çalışabilirsin!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'Antistatik bileklik, bellek modülü ve uyarı etiketli güç kaynağı', 'yedek': 'yedek-guvenlik.svg'}

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Kasayı Açmadan Önce…',
     'desc': 'Öğretmenin eski bir bilgisayarı masaya koydu. İçine bakmak istiyorsun. Sence önce ne yapmalısın?',
     'secenekler': ['Hemen tornavidayı alıp vidaları sökerim.', 'Fişi çeker, güvenlik kurallarını uygularım.', 'Bilgisayar kapalıysa hiçbir şey yapmam gerekmez.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'adim', 'no': 1, 'ad': 'Neden Kural?', 'etiket': 'ADIM 1 · NEDEN',
     'ikon': '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M12 8v4M12 16h.01"/>',
     'title': 'Her Kuralın Bir Nedeni Var',
     'desc': 'Atölyede üç tehlike vardır: <strong>elektrik</strong>, <strong>statik elektrik</strong> ve <strong>dağınıklık</strong>. Her kural bir tehlikeye karşı korur.',
     'tip': ['👆', 'Kartları çevir: her tehlikenin kuralını gör.'],
     'genis': True,
     'gorsel': {'2d': 'kural-kartlari'}},

    {'tur': 'adim', 'no': 2, 'ad': 'Fişi Çek, Elektriği Boşalt', 'etiket': 'ADIM 2 · FİŞ',
     'ikon': '<path d="M9 2v6M15 2v6"/><path d="M6 8h12v4a6 6 0 0 1-12 0z"/><path d="M12 18v4"/>',
     'title': 'Kapatmak Yetmez: Fişi Çek',
     'desc': 'Bilgisayar kapansa da fiş takılıysa içeride elektrik vardır. Önce <strong>fişi çek</strong>. Sonra güç düğmesine <strong>5 saniye basılı tut</strong>.',
     'tip': ['🔌', 'Düğmelere sırayla bas; içerideki ışıkları izle.'],
     'gorsel': {'3d': 's5-3d', 'aria': 'Kasa: bilgisayar kapatılıyor, fiş çekiliyor, güç düğmesine basılı tutulunca içerideki yeşil ışık sönüyor', 'yedek': 'yedek-fis.svg'}},

    {'tur': 'adim', 'no': 3, 'ad': 'Statik Elektrik', 'etiket': 'ADIM 3 · STATİK',
     'ikon': '<polygon points="13 2 4 14 11 14 10 22 20 9 13 9 13 2"/>',
     'title': 'Görünmez Kıvılcım',
     'desc': 'Halıda yürürken vücudun elektrik toplar. Buna <strong>statik elektrik</strong> denir. Parçaya dokununca küçük bir kıvılcım atlar ve çipi bozabilir.',
     'tip': ['⚡', 'Önce bilekliksiz, sonra bileklikle oynat.'],
     'gorsel': {'2d': 'kivilcim'}},

    {'tur': 'adim', 'no': 4, 'ad': 'Antistatik Bileklik ve Tutma', 'etiket': 'ADIM 4 · BİLEKLİK',
     'ikon': '<circle cx="12" cy="12" r="7"/><path d="M19 12h3"/>',
     'title': 'Bileklik Tak, Kenarından Tut',
     'desc': '<strong>Antistatik bileklik</strong> vücudundaki elektriği kasaya aktarır. Klipsi kasanın boyasız metaline tak. Parçayı <strong>kenarlarından</strong> tut; altın temaslara dokunma.',
     'tip': ['✋', 'Doğru ve yanlış tutuşu karşılaştır.'],
     'gorsel': {'3d': 's7-3d', 'aria': 'Bellek modülü: kenarından tutulunca yeşil onay, altın temaslardan tutulunca kırmızı uyarı; yanında antistatik bileklik', 'yedek': 'yedek-tutus.svg',
                'ust': '<div class="foto-kart"><!--@foto:DON-201-H04-bileklik-el.jpg|Antistatik bileklik takılmış el ve kasaya bağlı klips--><span>Gerçekte</span></div>'}},

    {'tur': 'adim', 'no': 5, 'ad': 'Asla Açılmaz', 'etiket': 'ADIM 5 · ASLA AÇILMAZ',
     'ikon': '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
     'title': 'Bu Üçüne Asla Dokunma',
     'desc': '<strong>Güç kaynağı</strong>, <strong>şişmiş pil</strong> ve <strong>tüplü monitör</strong> asla açılmaz. İçlerinde tehlikeli elektrik ya da kimyasal vardır. Görürsen bir yetişkine söyle.',
     'tip': ['🔒', 'Nesneye dokun: neden tehlikeli olduğunu gör.'],
     'gorsel': {'3d': 's8-3d', 'aria': 'Güç kaynağı, şişmiş pil ve tüplü monitör; her birinde kilit ve uyarı', 'yedek': 'yedek-asla.svg',
                'ust': '<div class="foto-kart"><!--@foto:DON-201-H04-psu-etiket.jpg|Güç kaynağının üzerindeki uyarı etiketi--><span>Gerçekte</span></div>'}},

    {'tur': 'adim', 'no': 6, 'ad': 'Vida ve Parça Düzeni', 'etiket': 'ADIM 6 · DÜZEN',
     'ikon': '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
     'title': 'Her Vida Kendi Kabına',
     'desc': 'Söktüğün vidaları <strong>etiketli kaplara</strong> koy. Masanda yalnız gerekenler olsun. Düzen, vidanın kaybolmasını ve parçaların karışmasını önler.',
     'tip': ['🧰', 'Vidaların hangi kaba gittiğini izle.'],
     'gorsel': {'2d': 'vida-duzen'}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Doğru mu, Yanlış mı?',
     'title': 'Güvenli mi, Tehlikeli mi?',
     'desc': 'Her sahneye bak. Davranış güvenliyse <strong>Doğru</strong>, tehlikeliyse <strong>Yanlış</strong> seç.',
     'tip': ['🔍', 'Yanlış seçersen açıklamayı oku.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Sahne</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 6</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'dogru-yanlis'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Güvenlik Sözleşmesi',
     'title': 'Atölye Güvenlik Sözleşmem',
     'desc': 'Her kuralı oku ve kabul ettiğini işaretle. Sonra adını yazıp sözleşmeni imzala.',
     'tip': ['✍️', 'Bu sözleşme atölyedeki sözün olacak.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Kabul edilen kural</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 6</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'sozlesme'}},

    {'tur': 'derinles', 'ad': 'Hissedemediğin Elektrik',
     'title': 'Hissetmediğin Kıvılcım da Bozar',
     'desc': 'Bir kıvılcımı hissetmen için yaklaşık <strong>3000 volt</strong> gerekir. Bazı çipler ise <strong>100 volttan azıyla</strong> bozulabilir. Yani hiçbir şey hissetmeden parçaya zarar verebilirsin.',
     'tip': ['🔎', 'Hasar hemen belli olmayabilir; parça sonra arıza yapar.'],
     'gorsel': {'svg': 'derinles.svg'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'Kurallar', 'Her kural bir tehlikeyi önler.'),
        ('oz-2.svg', 'Fişi Çek', 'Sonra düğmeye basılı tut.'),
        ('oz-3.svg', 'Statik', 'Görünmez kıvılcım çipi bozar.'),
        ('oz-4.svg', 'Bileklik', 'Kenarından tut.'),
        ('oz-5.svg', 'Asla Açma', 'Güç kaynağı, şişmiş pil, tüplü monitör.'),
        ('oz-6.svg', 'Düzen', 'Vidalar etiketli kapta.'),
    ]},
]
