# DON-201 H12 — Taşınabilir Cihazlar, Piller ve E-Atık (Format K)
MODELLER = ['M-DIZUSTU-PATLAT', 'M-TELEFON-KATMAN', 'M-PIL']

DERS = {
    'hafta': '12. Hafta',
    'baslik': 'Taşınabilir Cihazlar, Piller ve E-Atık',
    'aciklama': 'Dizüstü ve telefonun içini tanı, pili güvenle kullan, eski cihazı doğru yolla elden çıkar.',
    'hedefler': [
        'Dizüstü, tablet ve telefondaki parçaları masaüstündeki karşılıklarıyla eşleştirebileceğim.',
        'Pil güvenliği kurallarını sırayla söyleyebileceğim.',
        'E-atığı neden doğru yollarla atmamız gerektiğini açıklayabileceğim.',
        'Bir cihazı vermeden önce verilerimi neden silmem gerektiğini açıklayabileceğim.',
    ],
    'hedef_simgeler': [
        '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
        '<rect x="3" y="7" width="15" height="10" rx="2"/><path d="M21 10v4"/><path d="M10.5 9.5v3.5M10.5 15h.01"/>',
        '<path d="M4 7h16"/><path d="M6 7l1 13h10l1-13"/><path d="M9.5 12.5l2.5-2.5 2.5 2.5"/><path d="M12 10v7"/>',
        '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M14.6 13a2.6 2.6 0 1 1-.8-2.2"/><polyline points="14 9 14 11 12 11"/>',
    ],
    'bolumler': [
        ['Cihazların İçi', 'Dizüstü, telefon, tek çip'],
        ['Pil', 'Lityum pil ve güvenlik'],
        ['E-Atık ve Veri', 'Geri dönüşüm ve sıfırlama'],
    ],
    'quiz': [
        {'q': 'Dizüstüdeki kısa SO-DIMM modülü, masaüstünde hangi parçanın karşılığıdır?',
         'opts': ['RAM', 'Güç kaynağı', 'Ekran kartı', 'Kasa fanı'], 'correct': 0,
         'fb': 'SO-DIMM, dizüstüye göre kısaltılmış bir RAM modülüdür. İşi masaüstü RAM ile aynıdır.'},
        {'q': 'Görseldeki telefonun ekranı içeriden itilmiş. Ne yapmalısın?<span class="q-gorsel"><!--@dahil:svg-quiz-sismis.svg--></span>',
         'opts': ['Ekrana bastırıp düzeltirim', 'Şarja takıp kullanmaya devam ederim', 'Dokunmam; güvendiğim bir yetişkine söylerim', 'Telefonu açıp pili çıkarırım'], 'correct': 2,
         'fb': 'Pil şişmiş olabilir. Şişmiş pile dokunulmaz, bastırılmaz; telefon sökülmez. Bir yetişkine haber verilir.'},
        {'q': 'Ece’nin eski telefonu tamamen bozuldu. Telefonu nereye bırakmalı?',
         'opts': ['Evdeki çöp kutusuna', 'Elektronik atık toplama noktasına', 'Kâğıt geri dönüşüm kutusuna', 'Parktaki çöp kutusuna'], 'correct': 1,
         'fb': 'Bozuk telefon e-atıktır. Toplama noktasında değerli metaller geri kazanılır, zararlı maddeler doğaya karışmaz.'},
        {'q': 'Deniz eski tabletini kuzenine verecek. Önce ne yapmalı?',
         'opts': ['Fotoğrafları çöp kutusu klasörüne taşımalı', 'Ekran kilidini kaldırıp hemen vermeli', 'Tableti kapatıp açmalı; veriler kendiliğinden silinir', 'Yedek alıp hesaplardan çıkmalı ve fabrika ayarlarına sıfırlamalı'], 'correct': 3,
         'fb': 'Silinen dosyalar ve açık hesaplar cihazda kalabilir. Önce yedek alınır, hesaplardan çıkılır, sonra cihaz sıfırlanır.'},
        {'q': 'Derinleş (bonus): Pilin daha uzun ömürlü olması için hangisi doğrudur?',
         'opts': ['Pili aşırı sıcaktan korumak', 'Pili her gün %0’a kadar bitirmek', 'Telefonu güneşin altında şarj etmek', 'Şarj olurken yastığın altına koymak'], 'correct': 0,
         'fb': 'Isı pili en çok yıpratan etkendir. Serin tutulan pil daha uzun dayanır. Bu soru puanını düşürmez.'},
    ],
    'bitis': 'Artık taşınabilir cihazların içini tanıyor, pili güvenle kullanıyor ve eski cihazı doğru yolla elden çıkarabiliyorsun!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'Parçalarına ayrılmış dizüstü bilgisayar ve katmanlarına ayrılmış telefon', 'yedek': 'yedek-dizustu.svg'}

FOTO_DIZUSTU = '<div class="foto-kart"><!--@foto:DON-201-H12-dizustu-ic.jpg|Alt kapağı açılmış dizüstü bilgisayarın iç görünümü--><span>Gerçekte</span></div>'

KURALLAR = ('<ol class="pil-kurallar" aria-label="Pil güvenliği kuralları">'
            '<li><b>1</b><span>Sıcakta, güneşte bırakma.</span></li>'
            '<li><b>2</b><span>Uygun şarj aleti kullan.</span></li>'
            '<li><b>3</b><span>Yastık altında şarj etme.</span></li>'
            '<li><b>4</b><span>Telefonu ve pili asla sökme.</span></li></ol>')

GOREVLER = ('<ol class="gorevler katman-gorev" id="katman-gorev">' +
            ''.join('<li data-katman="' + k + '"><span class="g-isaret"></span><span>' + a + '</span></li>'
                    for k, a in [('ekran', 'Ekran'), ('cerceve', 'Çerçeve'), ('pil', 'Pil'), ('anakart', 'Anakart'),
                                 ('cip', 'Çip'), ('kamera', 'Kamera'), ('arka-kapak', 'Arka kapak')]) + '</ol>')

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Bu Kadar İnce Cihaza Nasıl Sığıyor?',
     'desc': 'Masaüstü kasada işlemci, RAM ve depolama vardır. Dizüstü ve telefon ise çok incedir. Sence onların içinde ne var?',
     'secenekler': ['Hiçbiri yok; yalnız ekran ve pil var.', 'Aynı parçalar var; küçülmüş ve birleşmiş hâlde.', 'Parçalar internette durur, cihazda değil.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'adim', 'no': 1, 'ad': 'Dizüstünün İçi', 'etiket': 'ADIM 1 · DİZÜSTÜ',
     'ikon': '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
     'title': 'Dizüstünde Neler Var?',
     'desc': 'Dizüstünde de masaüstündeki parçalar vardır. Hepsi <strong>küçültülmüş</strong> ve sıkıca yerleştirilmiştir. Alt kapak kalkınca pil, anakart, RAM, SSD ve fan görünür.',
     'tip': ['🔗', 'Çizgiler parçanın masaüstündeki karşılığını gösterir. Karta dokun.'],
     'gorsel': {'3d': 's4-3d', 'aria': 'Ters çevrilmiş dizüstünün alt kapağı kalkıyor; parçalar ayrışıyor ve çizgilerle masaüstü karşılıklarına bağlanıyor',
                'yedek': 'yedek-dizustu.svg', 'ust': FOTO_DIZUSTU}},

    {'tur': 'adim', 'no': 2, 'ad': 'Tek Çipte Birçok Parça', 'etiket': 'ADIM 2 · TEK ÇİP',
     'ikon': '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
     'title': 'Telefonda Tek Çip, Birçok Parça',
     'desc': 'Telefon ince katmanlardan oluşur. <strong>İşlemci</strong> ve <strong>grafik</strong> birimi tek bir çipin içindedir. <strong>Bellek</strong> de çoğu zaman bu çipin üstüne istiflenir.',
     'tip': ['🔍', '“Çipe yaklaş” düğmesiyle çipin içine bak.'],
     'gorsel': {'3d': 's5-3d', 'aria': 'Telefon katmanlarına ayrılıyor: ekran, çerçeve, anakart, pil, kamera, arka kapak; sonra çipin içindeki işlemci, grafik ve bellek gösteriliyor',
                'yedek': 'yedek-telefon.svg'}},

    {'tur': 'adim', 'no': 3, 'ad': 'Lityum Pil', 'etiket': 'ADIM 3 · LİTYUM PİL',
     'ikon': '<rect x="3" y="7" width="15" height="10" rx="2"/><path d="M21 10v4"/><path d="M7 12h3M8.5 10.5v3M13 12h2"/>',
     'title': 'Pil Enerjiyi Nasıl Saklar?',
     'desc': '<strong>Lityum iyon pil</strong>, iki odalı bir depo gibidir. <strong>İyon</strong> denen çok küçük yüklü parçacıklar odalar arasında gidip gelir. Şarjda bir uca dolar, kullanınca geri döner.',
     'tip': ['🔋', 'Önce tahmin et: şarj olurken iyonlar hangi uca gider?'],
     'genis': True,
     'gorsel': {'2d': 'pil-akis'}},

    {'tur': 'adim', 'no': 4, 'ad': 'Pil Güvenliği', 'etiket': 'ADIM 4 · PİL GÜVENLİĞİ',
     'ikon': '<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
     'title': 'Pili Isıdan Koru',
     'desc': 'Pil çok ısınırsa yıpranır ve zamanla <strong>şişebilir</strong>. Şişmiş pil yanabilir. <strong>Dokunma</strong>, güvendiğin bir yetişkine hemen söyle.',
     'ek': KURALLAR,
     'gorsel': {'3d': 's7-3d', 'aria': 'Lityum pil ısındıkça kırmızılaşıyor ve şişiyor; uyarı işareti beliriyor',
                'yedek': 'yedek-pil.svg'}},

    {'tur': 'adim', 'no': 5, 'ad': 'E-Atık ve Geri Dönüşüm', 'etiket': 'ADIM 5 · E-ATIK',
     'ikon': '<path d="M4 7h16"/><path d="M6 7l1 13h10l1-13"/><path d="M9.5 12.5l2.5-2.5 2.5 2.5"/><path d="M12 10v7"/>',
     'title': 'Eski Cihaz Çöpe Atılmaz',
     'desc': 'Bozuk ya da eski cihazlara <strong>e-atık</strong> denir. İçlerinde değerli metaller ve zararlı maddeler vardır. Toplama noktasına giderse metaller geri kazanılır.',
     'tip': ['♻️', 'İki yolu karşılaştır: çöp mü, toplama noktası mı?'],
     'genis': True,
     'gorsel': {'2d': 'eatik'}},

    {'tur': 'adim', 'no': 6, 'ad': 'Elden Çıkarmadan Önce', 'etiket': 'ADIM 6 · VERİYİ SİL',
     'ikon': '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M14.6 13a2.6 2.6 0 1 1-.8-2.2"/><polyline points="14 9 14 11 12 11"/>',
     'title': 'Vermeden Önce Verini Koru',
     'desc': 'Cihazında fotoğrafların, mesajların ve hesapların var. Silmeden verirsen başkası görebilir. Önce <strong>yedekle</strong>, <strong>hesaplardan çık</strong>, sonra <strong>fabrika ayarlarına sıfırla</strong>.',
     'tip': ['👥', 'Bu adımları bir yetişkinle birlikte yap.'],
     'genis': True,
     'gorsel': {'2d': 'sifirla'}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Telefonun Katmanları',
     'title': 'Katmanları Bul',
     'desc': 'Modeli döndür ve yakınlaştır. Listedeki her katmanı bul, üstüne dokun.',
     'tip': ['⚠️', 'Gerçek telefon ve pil sökülmez; yalnız modelde incele.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Bulunan katman</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 7</span></div><div class="etk-ilerleme-bar"><span></span></div></div>' + GOREVLER,
     'gorsel': {'3d': 's10-3d', 'aria': 'Etkinlik: katmanlarına ayrılmış telefon modelini döndürüp her katmanı bulma', 'yedek': 'yedek-telefon.svg',
                'yedek_metin': 'Bu cihazda 3D açılmadı; çizimdeki katmanları sırayla söyle.'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'E-Atık Ayırma',
     'title': 'Doğru Kutuya At',
     'desc': 'Her kartı doğru kutuya sürükle ya da önce karta, sonra kutuya dokun.',
     'tip': ['💡', 'Pil cihazın içindeyse, cihaz bütün hâlde e-atığa gider.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Doğru atılan</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 8</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'sinifla-atik'}},

    {'tur': 'derinles', 'ad': 'Pil Sağlığı',
     'title': 'Pilin Ömrünü Uzat',
     'desc': 'Pil her dolup boşalmada biraz yıpranır. <strong>Isı</strong> ve hep sonuna kadar bitirmek onu daha çabuk yıpratır. Cihazı uzun kullanmak e-atığı da azaltır.',
     'tip': ['🔎', 'Birçok telefonda pil sağlığı ayarlardan görülebilir.'],
     'genis': True,
     'gorsel': {'2d': 'pil-saglik'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'Dizüstünün İçi', 'Aynı parçalar, daha küçük.'),
        ('oz-2.svg', 'Tek Çip', 'İşlemci ve grafik bir arada.'),
        ('oz-3.svg', 'Lityum Pil', 'İyonlar iki uç arasında gidip gelir.'),
        ('oz-4.svg', 'Pil Güvenliği', 'Şişmişse dokunma, söyle.'),
        ('oz-5.svg', 'E-Atık', 'Toplama noktasına götür.'),
        ('oz-6.svg', 'Vermeden Önce', 'Yedekle, çık, sıfırla.'),
    ]},
]
