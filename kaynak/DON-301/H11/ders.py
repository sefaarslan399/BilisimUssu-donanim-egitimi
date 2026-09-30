# DON-301 H11 — BIOS/UEFI ve Önyükleme (Format K+U, lise)
MODELLER = []

DERS = {
    'grade': 'lise',
    'hafta': '11. Hafta',
    'baslik': 'BIOS/UEFI ve Önyükleme',
    'aciklama': 'Güç düğmesinden işletim sistemine giden zinciri izle: POST ışıklarını yorumla, UEFI’de önyükleme sırasını, bellek profilini ve güvenlik ayarlarını yönet.',
    'hedefler': [
        'BIOS ile UEFI’yi çalışma biçimi, disk düzeni (MBR/GPT) ve güvenlik açısından karşılaştırabileceğim.',
        'POST sürecini, bip kodlarını ve anakart hata ışıklarını (debug LED) yorumlayabileceğim.',
        'UEFI’de önyükleme sırasını ayarlayabileceğim.',
        'XMP/EXPO bellek profilini, Secure Boot ve TPM ayarlarını okuyup doğru biçimde yapabileceğim.',
    ],
    'hedef_simgeler': [
        '<rect x="3" y="6" width="7" height="12" rx="1.5"/><rect x="14" y="6" width="7" height="12" rx="1.5"/><path d="M10 12h4"/>',
        '<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><path d="M3 18h18"/>',
        '<path d="M5 6h14M5 12h10M5 18h6"/><path d="M19 10l-2-2-2 2M17 8v10"/>',
        '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    ],
    'bolumler': [
        ['Firmware', 'BIOS, UEFI, CSM, MBR–GPT'],
        ['Açılış', 'POST, hata ışıkları, önyükleme sırası'],
        ['Ayarlar', 'XMP/EXPO, Secure Boot, TPM'],
    ],
    'quiz': [
        {'q': 'Aşağıdakilerden hangisi UEFI’nin sunduğu, eski BIOS’ta bulunmayan bir özelliktir?',
         'opts': ['Önyükleyicinin dijital imzasını doğrulayan Secure Boot', 'Açılışta POST ile donanımı sınaması', 'Önyükleme sırasının değiştirilebilmesi', 'Sistem saatinin tutulması'], 'correct': 0,
         'fb': 'POST, önyükleme sırası ve sistem saati BIOS’ta da vardır. İmza denetimi yapan Secure Boot ise UEFI ile gelir.'},
        {'q': 'Açılışta görseldeki hata ışığı yanık kalıyor ve monitörde görüntü yok. En olası sorun hangisidir?<span class="q-gorsel"><!--@dahil:svg-quiz-led.svg--></span>',
         'opts': ['RAM modülleri yuvaya tam oturmamış', 'İşletim sistemi dosyaları silinmiş', 'Ekran kartı ya da görüntü bağlantısında sorun var', 'Önyükleme sırası yanlış ayarlanmış'], 'correct': 2,
         'fb': 'VGA ışığı, POST’un ekran kartı aşamasında takıldığını gösterir. Kartın oturması, ek güç kablosu ve monitör bağlantısı kontrol edilir.'},
        {'q': 'Ece işletim sistemi kurmak için kurulum belleğini taktı, ama bilgisayar her seferinde diskteki eski sistemle açılıyor. Ece ne yapmalı?',
         'opts': ['Secure Boot’u kapatmalı', 'UEFI’de USB belleği önyükleme sırasında diskin önüne almalı ya da tek seferlik önyükleme menüsünü kullanmalı', 'XMP/EXPO profilini etkinleştirmeli', 'Anakart pilini çıkarıp ayarları sıfırlamalı'], 'correct': 1,
         'fb': 'Firmware aygıtları sırayla dener ve ilk önyüklenebilir aygıtta durur. USB öne alınmalı ya da tek seferlik menüden seçilmelidir.'},
        {'q': 'Deniz kutusunda “DDR5-6000” yazan bellekleri taktı. UEFI’de bellek hızı 4800 MT/s görünüyor. Bunun en olası nedeni nedir?',
         'opts': ['Bellekler arızalı', 'Anakart bellekleri tanımadı', 'Secure Boot bellek hızını sınırlıyor', 'XMP/EXPO profili etkin değil; bellek standart (JEDEC) hızda çalışıyor'], 'correct': 3,
         'fb': 'Bellek önce güvenli JEDEC hızında çalışır. Etiketteki hız, UEFI’de XMP/EXPO profili seçilince uygulanır.'},
    ],
    'bitis': 'Açılış zincirini ve UEFI ayarlarını artık teknik olarak yorumlayıp güvenle yönetebiliyorsun!',
}

KAPAK = {'svg': 'kapak.svg'}

FOTO_ANA = '<div class="foto-mini"><!--@foto:DON-301-H11-uefi-ana-ekran.jpg|Gerçek bir UEFI ana ekranı (işlemci, bellek, saat bilgisi)--><span>Gerçekte</span></div>'
FOTO_GERCEK = '<div class="foto-mini"><!--@foto:DON-301-H11-uefi-onyukleme.jpg|Gerçek bir UEFI önyükleme sırası ekranı--><span>Gerçekte</span></div>'

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Fanlar Dönüyor, Ekran Siyah',
     'desc': 'Bilgisayarı açtın. Fanlar dönüyor ama monitörde görüntü yok. Anakartta “DRAM” yazan küçük bir ışık yanık kalıyor. Sence sorun nerede?',
     'secenekler': ['İşletim sistemi bozulmuş.', 'Bellek (RAM) yerine tam oturmamış ya da tanınmıyor.', 'Monitörün parlaklığı en düşükte.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'terim', 'terimler': [
        ('Firmware', 'Bellenim', 'Anakarttaki flaş bellekte duran, açılışta ilk çalışan yazılım.'),
        ('BIOS', 'Temel Giriş/Çıkış Sistemi', 'Eski tip firmware; 16-bit, MBR’den önyükler.'),
        ('UEFI', 'Birleşik Genişletilebilir Bellenim Arabirimi', 'Modern firmware standardı; .efi önyükleyicileri çalıştırır.'),
        ('CSM / Legacy', 'Uyumluluk Destek Modülü', 'UEFI’nin eski BIOS gibi önyükleme yapmasını sağlayan katman.'),
        ('POST', 'Açılış Öz Sınaması', 'Açılışta işlemci, bellek ve ekran kartının denetlenmesi.'),
        ('MBR / GPT', 'Ana Önyükleme Kaydı / GUID Bölüm Tablosu', 'Diskteki bölümlerin eski ve yeni kayıt düzeni.'),
        ('Bootloader', 'Önyükleyici', 'İşletim sistemini belleğe yükleyip başlatan küçük program.'),
        ('XMP / EXPO', 'Bellek Hız Profili', 'Bellek modülünde saklanan, test edilmiş yüksek hız ayarı.'),
        ('Secure Boot', 'Güvenli Önyükleme', 'Önyükleyicinin dijital imzasını denetleyen UEFI özelliği.'),
        ('TPM', 'Güvenilir Platform Modülü', 'Şifreleme anahtarlarını saklayan, açılışı ölçen güvenlik birimi.'),
    ]},

    {'tur': 'adim', 'no': 1, 'ad': 'Firmware: BIOS ve UEFI', 'etiket': 'ADIM 1 · FIRMWARE',
     'ikon': '<rect x="3" y="6" width="7" height="12" rx="1.5"/><rect x="14" y="6" width="7" height="12" rx="1.5"/><path d="M10 12h4"/>',
     'title': 'Açılışta İlk Çalışan Yazılım',
     'desc': '<strong>Firmware</strong> (bellenim), anakarttaki flaş bellekte durur. Donanımı hazırlar, sonra işletim sistemini başlatır. Eski <strong>BIOS</strong> diskin ilk sektöründeki (<strong>MBR</strong>) kodu çalıştırır. <strong>UEFI</strong> ise diskteki EFI sistem bölümünden (ESP; çoğunlukla <strong>GPT</strong> diskte) bir <code>.efi</code> dosyası yükler. <strong>CSM</strong> açıkken UEFI, BIOS gibi (Legacy) önyükleme yapabilir.',
     'tip': ['🔍', 'Bir sütun seç: önyükleme yolu ve disk düzeni altta çizilir. Satıra dokun, ayrıntıyı oku.'],
     'genis': True,
     'gorsel': {'2d': 'firmware'}},

    {'tur': 'adim', 'no': 2, 'ad': 'POST ve Bip Kodları', 'etiket': 'ADIM 2 · POST',
     'ikon': '<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><path d="M3 18h18"/>',
     'title': 'POST: Açılış Öz Sınaması',
     'desc': 'Firmware önce <strong>POST</strong> yapar: işlemci, bellek ve ekran kartı sırayla denetlenir. Anakarttaki <strong>hata ışıkları</strong> (CPU, DRAM, VGA, BOOT) bu sırayla yanıp söner. Yanık kalan ışık, takılınan aşamayı gösterir. <strong>Bip kodlarının</strong> anlamı üreticiye göre değişir; anakart kılavuzundan okunur.',
     'tip': ['▶', 'Bir arıza seç, önce hangi ışıkta takılacağını tahmin et, sonra izle.'],
     'genis': True,
     'gorsel': {'2d': 'aboot', 'koyu': True}},

    {'tur': 'adim', 'no': 3, 'ad': 'UEFI’de Donanım Bilgisi', 'etiket': 'ADIM 3 · DONANIM BİLGİSİ',
     'ikon': '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 9h6M7 13h9M8 21h8"/>',
     'title': 'İşletim Sistemi Olmadan Donanımı Gör',
     'desc': 'UEFI’ye açılışta ekranda yazan tuşla (çoğunlukla <kbd>Del</kbd> ya da <kbd>F2</kbd>) girilir. Ana ekran; işlemciyi, toplam belleği, bellek hızını, diskleri, sıcaklığı ve saati gösterir. Montajdan sonra her parçanın <strong>tanındığı</strong> ilk burada doğrulanır.',
     'tip': ['🧾', 'Satırlara dokun: her bilgi hangi sorunu yakalamaya yarar?'],
     'genis': True,
     'gorsel': {'2d': 'uefi-ana', 'ic': '<div class="u3-duzen"><div class="u3-ekran"></div><div class="u3-alt"><div class="u3-kart" aria-live="polite"></div>' + FOTO_ANA + '</div></div>'}},

    {'tur': 'adim', 'no': 4, 'ad': 'Önyükleme Sırası', 'etiket': 'ADIM 4 · ÖNYÜKLEME',
     'ikon': '<path d="M5 6h14M5 12h10M5 18h6"/><path d="M19 10l-2-2-2 2M17 8v10"/>',
     'title': 'Hangi Aygıttan Açılacak?',
     'desc': 'Firmware, <strong>önyükleme sırasındaki</strong> aygıtları tek tek dener; geçerli bir önyükleyici bulduğu ilk aygıtta durur. <strong>UEFI</strong> modunda <code>.efi</code> önyükleyicisi, <strong>Legacy</strong> modunda MBR’deki kod aranır. Kalıcı ayar UEFI’de yapılır; tek seferlik seçim için açılış menüsü (çoğunlukla <kbd>F8</kbd>, <kbd>F11</kbd> ya da <kbd>F12</kbd>) kullanılır.',
     'tip': ['↕', 'Sırayı değiştir, modu seç, “Açılışı dene” ile hangi aygıttan açıldığını izle.'],
     'genis': True,
     'gorsel': {'2d': 'bootsira'}},

    {'tur': 'adim', 'no': 5, 'ad': 'XMP/EXPO', 'etiket': 'ADIM 5 · BELLEK PROFİLİ',
     'ikon': '<rect x="3" y="8" width="18" height="8" rx="1"/><path d="M6 16v3M10 16v3M14 16v3M18 16v3M7 11h2M11 11h2M15 11h2"/>',
     'title': 'Etiketteki Hız Kendiliğinden Gelmez',
     'desc': 'Bellek önce <strong>JEDEC</strong> standardındaki güvenli hızda çalışır. Modüldeki <strong>SPD</strong> yongası, üreticinin test ettiği daha yüksek hız profilini de saklar: <strong>XMP</strong> ya da <strong>EXPO</strong>. Profil UEFI’de seçilince hız, gecikme (CL) ve voltaj birlikte uygulanır. Bu bir hız aşırtmadır; sistem kararsızlaşırsa profil kapatılır.',
     'tip': ['⚡', 'Tahmin et: 4800’den 6000 MT/s’ye çıkınca bant genişliği yüzde kaç artar? Sonra profili aç.'],
     'genis': True,
     'gorsel': {'2d': 'xmp', 'koyu': True}},

    {'tur': 'adim', 'no': 6, 'ad': 'Secure Boot ve TPM', 'etiket': 'ADIM 6 · GÜVENLİK',
     'ikon': '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
     'title': 'İmzayı Denetle, Açılışı Ölç',
     'desc': '<strong>Secure Boot</strong>, önyükleyicinin dijital imzasını firmware’deki güvenilir anahtarlarla karşılaştırır; imza geçersizse önyüklemeyi durdurur. Yalnız UEFI modunda (CSM kapalı) çalışır. <strong>TPM</strong>, açılış aşamalarını ölçer ve şifreleme anahtarlarını saklar; zincir değişirse TPM’e bağlı şifreli diskin anahtarını vermez.',
     'tip': ['🛡', 'Üç senaryoyu sırayla oynat: Secure Boot ile TPM’in neyi yakaladığını karşılaştır.'],
     'genis': True,
     'gorsel': {'2d': 'guvenli', 'koyu': True}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'UEFI Simülatörü',
     'title': 'UEFI Görevleri',
     'desc': 'Simülatördeki görevleri tamamla. Klavyede <kbd>←</kbd> <kbd>→</kbd> sekme, <kbd>↑</kbd> <kbd>↓</kbd> satır, <kbd>Enter</kbd> seçim, <kbd>F10</kbd> kaydet ve çık; dokunarak da kullanabilirsin.',
     'tip': ['💡', 'Kaydetmeden önce değişiklik listesini oku. Yanlış bir ayar uyarı verir.'],
     'ek': '<ul class="gorevler uf-gorevler" id="uf-gorevler">'
           '<li><span class="g-isaret"></span><span>Ana: sistem saatini bul</span></li>'
           '<li><span class="g-isaret"></span><span>Önyükleme: CSM kapalı mı, doğrula</span></li>'
           '<li><span class="g-isaret"></span><span>Gelişmiş: XMP/EXPO Profil 1’i seç</span></li>'
           '<li><span class="g-isaret"></span><span>Önyükleme: USB belleği 1. sıraya al</span></li>'
           '<li><span class="g-isaret"></span><span>Güvenlik: Secure Boot ve TPM durumunu oku</span></li>'
           '<li><span class="g-isaret"></span><span>Çıkış: kaydet ve çık (F10)</span></li></ul>'
           '<div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Tamamlanan görev</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 6</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'uefi-sim'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Gerçek Sistemde',
     'title': 'UEFI Keşif Kartı',
     'desc': 'Öğretmeninin gösterdiği bilgisayarda açılışı izle, UEFI’ye gir ve bilgileri karta işle. Bu turda <strong>hiçbir ayarı değiştirme</strong>: yalnız oku, sonra kaydetmeden çık.',
     'tip': ['⚠', 'Sekme adları ve yerleri üreticiye göre değişir. Aradığını bulamazsan arama ya da yardım tuşunu (çoğunlukla F1) kullan.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Doldurulan satır</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 7</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'kesif', 'ic': '<div class="ks"><div class="ks-ust">' + FOTO_GERCEK +
                '<div class="ks-not"><b>Yalnız oku</b><span>Voltaj, frekans, parola ve güvenlik ayarlarına dokunma. Çıkarken “Kaydetmeden çık” seç.</span></div></div>'
                '<div class="ks-satirlar"></div><div class="ks-sonuc" aria-live="polite"></div></div>'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'BIOS ve UEFI', 'BIOS: MBR kodu. UEFI: ESP’deki .efi, GPT, Secure Boot.'),
        ('oz-2.svg', 'POST', 'CPU → DRAM → VGA → BOOT; yanık kalan ışık sorunu gösterir.'),
        ('oz-3.svg', 'Donanım Bilgisi', 'UEFI ana ekranı parçaların tanındığını doğrular.'),
        ('oz-4.svg', 'Önyükleme Sırası', 'İlk geçerli önyükleyicide durur; tek seferlik menü de var.'),
        ('oz-5.svg', 'XMP/EXPO', 'Profil seçilmezse bellek JEDEC hızında kalır.'),
        ('oz-6.svg', 'Secure Boot + TPM', 'İmza denetimi ve açılış ölçümü; okulda kapatılmaz.'),
    ]},
]
