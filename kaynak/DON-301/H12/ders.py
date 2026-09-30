# DON-301 H12 — İşletim Sistemi Kurulumu (Format U, lise)
MODELLER = []

UYARI_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg>'


def hz_madde(ikon, baslik, metin):
    return ('<li class="hz-madde"><span class="hz-ikon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" '
            'stroke-linejoin="round" aria-hidden="true">' + ikon + '</svg></span><span><b>' + baslik + '</b> ' + metin + '</span></li>')


def hz_kart(ikon, ad, not_):
    return ('<div class="hz-kart"><span class="hz-ikon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
            'stroke-linejoin="round" aria-hidden="true">' + ikon + '</svg></span><b>' + ad + '</b><span>' + not_ + '</span></div>')


IK_USB = '<rect x="8" y="2" width="8" height="6" rx="1"/><rect x="6" y="8" width="12" height="14" rx="2"/><path d="M10 4.5h1M13 4.5h1"/>'
IK_DISK = '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M12 12l5 5"/>'
IK_YEDEK = '<path d="M4 14v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/><path d="M12 3v11M8 10l4 4 4-4"/>'
IK_GUC = '<path d="M12 2v10"/><path d="M6.3 6.3a8 8 0 1 0 11.4 0"/>'
IK_KILIT = '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
IK_PC = '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'
IK_ISO = '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>'
IK_KLASOR = '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'
IK_AG = '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/>'
IK_EL = '<path d="M8 13V5a2 2 0 0 1 4 0v6"/><path d="M12 11V4a2 2 0 0 1 4 0v8"/><path d="M16 9a2 2 0 0 1 4 0v5a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3l-3-5a2 2 0 0 1 3-2l2 2"/>'
IK_GOZ = '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
IK_KALEM = '<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="M14 6l4 4"/>'

HAZIRLIK = (
    '      <div class="layout-full hz-duzen">\n'
    '        <div class="hz-guvenlik" role="note" aria-label="Güvenlik ve veri kaybı uyarıları">\n'
    '          <div class="hz-guv-bas">' + UYARI_SVG + '<span>Güvenlik: kurulum geri alınamaz adımlar içerir</span></div>\n'
    '          <ul>' +
    hz_madde(IK_YEDEK, 'Önce yedek.', 'Bölüm silmek ve biçimlendirmek içindeki veriyi kalıcı olarak yok eder. Önemli dosyalar harici diske ya da okul sunucusuna kopyalanır.') +
    hz_madde(IK_USB, 'USB de silinir.', 'Önyüklenebilir USB hazırlanırken bellekteki her şey gider; boş ya da yedeği alınmış USB kullan.') +
    hz_madde(IK_DISK, 'Diski iki kez oku.', 'Disk listesinde boyut ve ada bak; öğretmenin gösterdiği diskten başka diske dokunma.') +
    hz_madde(IK_GUC, 'Kurulumu kesme.', 'Dosyalar kopyalanırken bilgisayarı kapatma, USB’yi çekme.') +
    hz_madde(IK_KILIT, 'Kasa kapalı kalır.', 'Bu derste yazılım kurulur; kabloları ve prizleri öğretmen bağlar.') +
    '</ul>\n        </div>\n'
    '        <div class="hz-sag">\n'
    '          <div class="csub">Grup masasında:</div>\n'
    '          <div class="hz-kartlar">' +
    hz_kart(IK_PC, 'Kurulum bilgisayarı', 'H10’da topladığın sistem') +
    hz_kart(IK_USB, 'USB bellek', 'En az 8 GB, boş') +
    hz_kart(IK_ISO, 'ISO kalıp dosyası', 'Öğretmen verir') +
    hz_kart(IK_KLASOR, 'Sürücü klasörü', 'Anakart ve ağ sürücüleri') +
    hz_kart(IK_AG, 'Ağ kablosu', 'Güncellemeler için') +
    '</div>\n'
    '          <div class="csub">Roller (her adımda değişir):</div>\n'
    '          <div class="hz-roller">' +
    hz_kart(IK_EL, 'Uygulayan', 'Klavye ve fare onda.') +
    hz_kart(IK_GOZ, 'Kontrolcü', 'Talimatı okur, riskli adımda “dur” der.') +
    hz_kart(IK_KALEM, 'Kayıtçı', 'Disk, sürücü ve süreleri not eder.') +
    '</div>\n        </div>\n      </div>')


def prova(pid):
    return {'html': '<div class="pv" id="' + pid + '"></div>'}


DERS = {
    'grade': 'lise',
    'hafta': '12. Hafta',
    'baslik': 'İşletim Sistemi Kurulumu',
    'aciklama': 'Önyüklenebilir USB hazırla, GPT ile MBR arasında karar ver, diski bölümle, işletim sistemini kur ve eksik sürücüleri tamamla.',
    'hedefler': [
        'Önyüklenebilir bir USB bellek hazırlayabileceğim.',
        'Bilgisayara göre GPT ile MBR arasından doğru bölüm stilini seçebileceğim.',
        'Bölümleme ve biçimlendirmeyi yapıp işletim sistemini kurabileceğim.',
        'Aygıt Yöneticisi’nde eksik sürücüleri bulup kurabileceğim.',
    ],
    'hedef_simgeler': [
        '<rect x="8" y="2" width="8" height="6" rx="1"/><rect x="6" y="8" width="12" height="14" rx="2"/>',
        '<rect x="3" y="5" width="18" height="5" rx="1.5"/><rect x="3" y="14" width="18" height="5" rx="1.5"/><path d="M9 5v5M14 14v5M18 14v5"/>',
        '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M12 7v5M9.5 9.5 12 12l2.5-2.5"/>',
        '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    ],
    'bolumler': [
        ['Hazırlık', 'Yedek, önyüklenebilir USB'],
        ['Disk', 'GPT–MBR, bölümleme, biçimlendirme'],
        ['Kurulum', 'Kurulum, sürücüler, güncellemeler'],
    ],
    'quiz': [
        {'q': 'Önyüklenebilir USB bellek hazırlanırken USB’de duran eski dosyalara ne olur?',
         'opts': ['Silinir; bu yüzden önce yedeklenmelidir', 'Kurulum dosyalarının yanında korunur', 'Otomatik olarak bilgisayarın diskine taşınır', 'Yalnız gizli dosyalar silinir'], 'correct': 0,
         'fb': 'Hazırlama aracı USB’yi baştan bölümleyip biçimlendirir; üzerindeki her şey silinir. Önemli dosyalar önceden yedeklenir.'},
        {'q': 'Görseldeki 4 TB disk MBR ile bölümlenmiş. Diskin yaklaşık 1678 GB’lık kısmı neden kullanılamıyor?<span class="q-gorsel"><!--@dahil:svg-quiz-mbr.svg--></span>',
         'opts': ['Diskte bozuk sektörler vardır', 'Disk henüz biçimlendirilmemiştir', 'MBR en çok yaklaşık 2 TiB (2048 GB) alanı adresleyebilir', 'O alanı kurtarma bölümü kaplamaktadır'], 'correct': 2,
         'fb': 'MBR 32 bitlik sektör adresi kullanır: 2³² × 512 B = 2 TiB. Kalan alan ancak disk GPT’ye dönüştürülünce kullanılabilir.'},
        {'q': 'UEFI modunda açılan yeni bir bilgisayarın sistem diski hangi bölüm stiliyle hazırlanır?',
         'opts': ['MBR, çünkü her bilgisayarda çalışır', 'GPT', 'Bölüm tablosuna gerek yoktur', 'FAT32'], 'correct': 1,
         'fb': 'UEFI modunda kurulumda sistem diski GPT ile hazırlanır ve bir EFI sistem bölümü oluşturulur. FAT32 bir bölüm stili değil, dosya sistemidir.'},
        {'q': 'Deniz kurulumu bitirdi ama bilgisayardan ses gelmiyor. Aygıt Yöneticisi’nde “Çoklu Ortam Ses Denetleyicisi” sarı ünlemle görünüyor. Deniz ne yapmalı?',
         'opts': ['İşletim sistemini baştan kurmalı', 'Hoparlörleri yenisiyle değiştirmeli', 'Diski yeniden bölümlemeli', 'Aygıtın sürücüsünü kurup Aygıt Yöneticisi’nde yeniden denetlemeli'], 'correct': 3,
         'fb': 'Sarı ünlem, sürücünün eksik olduğunu gösterir. Anakart ya da ses yongası üreticisinin sürücüsü kurulunca ünlem kaybolur.'},
    ],
    'bitis': 'Önyüklenebilir USB’den başlayıp sürücülere kadar bir işletim sistemini baştan sona kurabiliyorsun!',
}

KAPAK = {'svg': 'kapak.svg'}

SLAYTLAR = [
    {'tur': 'isinma',
     'title': '4 TB Disk, Hangi Tablo?',
     'desc': 'Sınıfa yeni bir 4 TB disk geldi. Disk eski usul <strong>MBR</strong> bölüm tablosuyla hazırlanırsa işletim sistemi bu diskin ne kadarını kullanabilir?',
     'secenekler': ['4 TB’ın tamamını kullanır.', 'Yaklaşık 2 TB’ını kullanır, gerisi boş kalır.', 'Diski hiç göremez.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'terim', 'terimler': [
        ('Bootable USB', 'Önyüklenebilir USB', 'Açılışta işletim sistemi yerine başlatılabilen kurulum belleği.'),
        ('ISO Image', 'ISO kalıp dosyası', 'Kurulum ortamının tek dosyalık birebir kopyası.'),
        ('Boot Menu', 'Önyükleme menüsü', 'Açılışta bir tuşla hangi aygıttan başlanacağını seçtiren liste.'),
        ('MBR', 'Ana Önyükleme Kaydı', 'Eski bölüm tablosu: en çok 4 birincil bölüm, 2 TiB sınırı.'),
        ('GPT', 'GUID Bölüm Tablosu', 'UEFI ile kullanılan tablo: 128 bölüm, yedek başlık.'),
        ('Partition', 'Bölüm', 'Diskin ayrı bir birim gibi kullanılan parçası.'),
        ('Format', 'Biçimlendirme', 'Bölüme dosya sistemi yazma; içindeki veri silinir.'),
        ('File System', 'Dosya sistemi', 'Dosyaların bölümde düzenlenme biçimi: FAT32, NTFS, ext4.'),
        ('Driver', 'Sürücü', 'İşletim sisteminin bir donanımla konuşmasını sağlayan yazılım.'),
        ('Device Manager', 'Aygıt Yöneticisi', 'Donanımları ve sürücü durumlarını listeleyen araç.'),
    ]},

    {'tur': 'serbest', 'baslik': 'Hazırlık ve Güvenlik', 'rozet': 'Hazırlık', 'etiket': 'Hazırlık ve Güvenlik',
     'ikon': '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M12 8v5M12 16v.5"/>',
     'govde': HAZIRLIK},

    {'tur': 'uygulama', 'no': 1, 'ad': 'Önyüklenebilir USB', 'etiket': 'ADIM 1 · USB',
     'ikon': '<rect x="8" y="2" width="8" height="6" rx="1"/><rect x="6" y="8" width="12" height="14" rx="2"/>',
     'title': 'Kalıp USB’ye Yazılır, Kopyalanmaz',
     'prova_baslik': 'Prova: simülasyonda izle', 'gercek_baslik': 'Gerçek bilgisayarda yap',
     'prova': prova('pv-usb'),
     'foto': 'DON-301-H12-1-usb.jpg|USB hazırlama aracında seçilmiş USB bellek, ISO dosyası ve GPT bölüm şeması',
     'talimat': ['Boş USB belleği (8 GB+) tak, hazırlama aracında <strong>boyutundan</strong> tanıyıp seç.',
                 'Öğretmenin verdiği <strong>ISO</strong> dosyasını seç; bölüm şeması <strong>GPT</strong>, hedef <strong>UEFI</strong>.',
                 '“Veriler silinecek” uyarısını oku, yedek varsa onayla; bitene kadar USB’yi çekme.'],
     'kontrol': 'Araç “Hazır” dedi; USB’de kurulum klasörleri görünüyor.'},

    {'tur': 'uygulama', 'no': 2, 'ad': 'GPT ve MBR', 'etiket': 'ADIM 2 · BÖLÜM STİLİ',
     'ikon': '<rect x="3" y="5" width="18" height="5" rx="1.5"/><rect x="3" y="14" width="18" height="5" rx="1.5"/><path d="M9 5v5M14 14v5M18 14v5"/>',
     'title': 'Bölüm Tablosu: GPT mi MBR mi?',
     'prova_baslik': 'Karşılaştır: aynı disk, iki tablo', 'gercek_baslik': 'Gerçek bilgisayarda karar ver',
     'prova': prova('pv-gpt'),
     'foto': 'DON-301-H12-2-gpt.jpg|Disk özelliklerinde bölüm stili satırı: GUID Bölüm Tablosu (GPT)',
     'talimat': ['UEFI ayarlarında önyükleme modunu oku: <strong>UEFI</strong> mi, eski mod (CSM/Legacy) mi?',
                 'Disk aracında diskin <strong>bölüm stilini</strong> ve boyutunu not et.',
                 'UEFI ya da 2 TB’tan büyük disk → <strong>GPT</strong>; yalnız eski BIOS → MBR.'],
     'kontrol': 'Grubun kararı gerekçesiyle deftere yazıldı: “UEFI → GPT”.'},

    {'tur': 'uygulama', 'no': 3, 'ad': 'Bölümleme ve Biçimlendirme', 'etiket': 'ADIM 3 · BÖLÜM',
     'ikon': '<rect x="2" y="8" width="20" height="8" rx="2"/><path d="M7 8v8M16 8v8"/>',
     'title': 'Alanı Böl, Dosya Sistemini Yaz',
     'prova_baslik': 'Prova: simülasyonda izle', 'gercek_baslik': 'Gerçek bilgisayarda yap',
     'prova': prova('pv-bolum'),
     'foto': 'DON-301-H12-3-bolum.jpg|Kurulum ekranında disk ve bölüm listesi, seçili ayrılmamış alan',
     'talimat': ['Disk listesinde kurulum diskini <strong>boyutundan ve adından</strong> tanı.',
                 'Öğretmen onayıyla yalnız bu diskin eski bölümlerini <strong>sil</strong>.',
                 '<strong>Ayrılmamış alanı</strong> seç; gerekli bölümleri kurulum kendisi oluşturur.'],
     'kontrol': 'Kurulum diski tek parça “ayrılmamış alan”; diğer diskler olduğu gibi duruyor.'},

    {'tur': 'uygulama', 'no': 4, 'ad': 'Kurulum', 'etiket': 'ADIM 4 · KURULUM',
     'ikon': '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M12 7v5M9.5 9.5 12 12l2.5-2.5"/>',
     'title': 'USB’den Başlat, Diske Kur',
     'prova_baslik': 'Prova: simülasyonda izle', 'gercek_baslik': 'Gerçek bilgisayarda yap',
     'prova': prova('pv-kurulum'),
     'foto': 'DON-301-H12-4-kurulum.jpg|Kurulum ilerleme ekranı: dosyalar kopyalanıyor',
     'talimat': ['Açılışta önyükleme menüsü tuşuna bas; <strong>“UEFI: USB”</strong> satırını seç.',
                 'Dil, saat biçimi ve klavye düzenini (<strong>Türkçe Q</strong>) seç, kurulumu başlat.',
                 'İlk yeniden başlatmada <strong>USB’yi çıkar</strong>; sistem diskten açılsın.'],
     'kontrol': 'Sistem diskten açıldı ve kullanıcı hesabı ekranına geldi.'},

    {'tur': 'uygulama', 'no': 5, 'ad': 'Sürücüler ve Aygıt Yöneticisi', 'etiket': 'ADIM 5 · SÜRÜCÜ',
     'ikon': '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
     'title': 'Sarı Ünlemi Bul, Sürücüyü Kur',
     'prova_baslik': 'Prova: simülasyonda izle', 'gercek_baslik': 'Gerçek bilgisayarda yap',
     'prova': prova('pv-aygit'),
     'foto': 'DON-301-H12-5-aygit.jpg|Aygıt Yöneticisi’nde Diğer aygıtlar altında sarı ünlemli Ağ Denetleyicisi',
     'talimat': ['Aygıt Yöneticisi’ni aç; <strong>sarı ünlemli</strong> aygıtları listele.',
                 'Önce <strong>ağ sürücüsünü</strong> USB’deki sürücü klasöründen kur.',
                 'Ağ gelince diğerlerini güncellemeyle tamamla; listeyi <strong>yeniden tara</strong>.'],
     'kontrol': 'Listede ünlemli aygıt kalmadı; ağ bağlantısı var.'},

    {'tur': 'uygulama', 'no': 6, 'ad': 'Güncellemeler ve İlk Ayarlar', 'etiket': 'ADIM 6 · GÜNCELLE',
     'ikon': '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
     'title': 'Güncelle, Adlandır, Kayda Geç',
     'prova_baslik': 'Prova: simülasyonda izle', 'gercek_baslik': 'Gerçek bilgisayarda yap',
     'prova': prova('pv-guncel'),
     'foto': 'DON-301-H12-6-guncel.jpg|Güncelleme ekranında sistemin güncel olduğunu gösteren durum',
     'talimat': ['Güncellemeleri denetle, yükle; istenirse <strong>yeniden başlat</strong> ve tekrar denetle.',
                 'Bilgisayar adını masa etiketine göre ver (ör. <code>LAB-07</code>), saat dilimini kontrol et.',
                 'Kayıt formuna disk, bölüm stili ve kurulan sürücüleri yaz.'],
     'kontrol': '“Sistem güncel” yazıyor; kayıt formu dolu.'},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Kurulum Adımları Simülatörü',
     'title': 'Sistemi Baştan Kur',
     'desc': 'Simülatörde kurulumu baştan sona yap. Görev kartı: kurulum <strong>240 GB SSD’ye (Disk 0)</strong>; öğrenci proje yedeklerini tutan <strong>ARŞİV</strong> diskine dokunulmaz.',
     'tip': ['⚠️', 'Riskli adımlarda onay penceresi çıkar. Onaylamadan önce disk adını ve boyutunu oku.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Tamamlanan aşama</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 6</span></div><div class="etk-ilerleme-bar"><span></span></div></div>'
           '<div class="ku-risk" id="ku-risk" aria-live="polite"><span>Riskli adımda hata</span><b>0</b></div>',
     'gorsel': {'panel': 'kurulum-sim'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Kurulum Kararları',
     'title': 'Hangi Karar Doğru?',
     'desc': 'Her kartta gerçek bir kurulum durumu var. Doğru kararı seç, gerekçesini oku.',
     'tip': ['💡', 'Önce önyükleme moduna ve disk boyutuna bak: UEFI ya da 2 TB’tan büyük disk GPT ister.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Kart</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 6</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'kararlar'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'Önyüklenebilir USB', 'ISO yazılır; USB’deki veri silinir.'),
        ('oz-2.svg', 'GPT ve MBR', 'UEFI ve 2 TiB üstü → GPT.'),
        ('oz-3.svg', 'Bölüm ve Biçim', 'Bölüm alanı ayırır, biçim dosya sistemi yazar.'),
        ('oz-4.svg', 'Kurulum', 'UEFI: USB’den başlat, sonra USB’yi çıkar.'),
        ('oz-5.svg', 'Sürücüler', 'Sarı ünlem = eksik sürücü; önce ağ.'),
        ('oz-6.svg', 'Güncelle ve Kaydet', 'Güncel sistem, doğru ad, dolu form.'),
    ]},
]
