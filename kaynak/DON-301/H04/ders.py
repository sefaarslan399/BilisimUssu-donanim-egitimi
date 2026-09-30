# DON-301 H04 — Depolama (Format K, lise)
MODELLER = ['M-HDD-ACIK', 'M-HDD', 'M-SSD', 'M-M2']

DERS = {
    'grade': 'lise',
    'hafta': '4. Hafta',
    'baslik': 'Depolama',
    'aciklama': 'Dönen plakalardan NAND flaşa: HDD ile SSD’nin çalışmasını, SATA–NVMe farkını, M.2 anahtarlarını, disk testlerini ve 3-2-1 yedekleme kuralını incele.',
    'hedefler': [
        'HDD ile SSD’nin veriyi nasıl sakladığını ve okuduğunu karşılaştırabileceğim.',
        'SATA ile NVMe (PCIe) arayüzlerini protokol ve bant genişliği yönünden ayırt edebileceğim.',
        'Bir M.2 SSD’nin bir yuvaya uyup uymadığını çentik, protokol ve PCIe nesline göre denetleyebileceğim.',
        'TBW, SMART ve 3-2-1 yedekleme kuralını açıklayıp bir disk için karar verebileceğim.',
    ],
    'hedef_simgeler': [
        '<circle cx="9" cy="12" r="6"/><circle cx="9" cy="12" r="1.5"/><rect x="16" y="6" width="5" height="12" rx="1"/>',
        '<path d="M3 8h18M3 12h18M3 16h18"/><path d="M3 5v14"/>',
        '<rect x="3" y="9" width="18" height="6" rx="1"/><path d="M15 15v-3M8 15v-3"/>',
        '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    ],
    'bolumler': [
        ['Çalışma İlkesi', 'HDD: plaka ve kafa; SSD: NAND ve denetleyici'],
        ['Arayüz ve Biçim', 'SATA–NVMe, 2,5″ / 3,5″ / M.2, çentikler'],
        ['Başarım ve Güvenlik', 'Sıralı–rastgele, TBW, SMART, 3-2-1'],
    ],
    'quiz': [
        {'q': '7200 dev/dk dönen bir HDD’de ortalama dönüş gecikmesi yaklaşık kaç milisaniyedir?',
         'opts': ['≈ 4,2 ms', '≈ 8,3 ms', '≈ 7,2 ms', '≈ 120 ms'], 'correct': 0,
         'fb': 'Bir tur = 60 000 ms ÷ 7200 ≈ 8,33 ms. Sektör ortalama yarım tur sonra kafanın altına gelir: ≈ 4,17 ms.'},
        {'q': 'Görseldeki M.2 SSD’nin kenar konnektörü için hangisi doğrudur?<span class="q-gorsel"><!--@dahil:svg-quiz-m2.svg--></span>',
         'opts': ['Tek çentikli M anahtarıdır; kesinlikle NVMe’dir', 'Yalnız B anahtarıdır; M yuvasına girmez', 'B+M anahtarlıdır; M yuvasına girer ama yuva SATA desteklemiyorsa tanınmaz', 'İki çentik, kartın PCIe x8 kullandığını gösterir'], 'correct': 2,
         'fb': 'İki çentik B+M anahtarı demektir; bu kartlar çoğunlukla M.2 SATA’dır. M yuvasına fiziksel olarak girer, ama yuva yalnız PCIe (NVMe) destekliyorsa disk görünmez.'},
        {'q': 'SATA III ile PCIe 4.0 x4 NVMe arasındaki farkı en doğru anlatan hangisidir?',
         'opts': ['NVMe daha kalın kablo kullandığı için hızlıdır', 'SATA III ≈ 600 MB/s ile sınırlıdır; PCIe 4.0 x4 teorik olarak ≈ 7,9 GB/s taşır ve NVMe çok sayıda komut kuyruğu kullanır', 'İkisinin hızı aynıdır; fark yalnız kartın boyundadır', 'SATA daha yeni bir standart olduğu için daha hızlıdır'], 'correct': 1,
         'fb': 'SATA III: 6 Gb/s hat, kodlama payıyla ≈ 600 MB/s tavan, AHCI’de tek kuyruk. NVMe: PCIe 4.0’da hat başına ≈ 2 GB/s, dört hatta ≈ 7,9 GB/s; on binlerce kuyruk.'},
        {'q': 'Ece’nin SSD’sinin SMART raporunda “Kullanılan ömür: %96” yazıyor ve yeniden atanan blok sayısı her gün artıyor. Tüm fotoğrafları bu diskte. Ece ne yapmalı?',
         'opts': ['Diski biçimlendirip kullanmaya devam etmeli', 'TRIM’i kapatarak diski korumalı', 'Birleştirme (defrag) çalıştırmalı', 'Hemen 3-2-1 kuralına göre yedek alıp diski değiştirmeyi planlamalı'], 'correct': 3,
         'fb': 'Rapor diskin dayanım sınırına yaklaştığını gösteriyor. Önce veriler güvenceye alınır (3 kopya, 2 ortam, 1 başka yerde), sonra disk değiştirilir. Defrag SSD’yi yalnız gereksiz yere yazar.'},
    ],
    'bitis': 'Diskleri çalışma ilkesine, arayüzüne ve test sonuçlarına göre artık teknik olarak değerlendirebiliyorsun!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'Kapağı saydam sabit disk, 2,5 inç SATA SSD ile M anahtarlı ve B+M anahtarlı iki M.2 SSD', 'yedek': 'yedek-kapak.svg'}

FOTO_M2 = '<div class="foto-kart"><!--@foto:DON-301-H04-m2-nvme-sata.jpg|M.2 NVMe (M anahtarı) ve M.2 SATA (B+M anahtarı) SSD yakın çekim--><span>Gerçekte</span></div>'

ILERLEME = ('<div class="etk-ilerleme" id="ilerleme-%s" aria-live="polite"><div class="etk-ilerleme-ust"><span>%s</span>'
            '<span class="etk-ilerleme-sayi"><b>0</b> / %s</span></div><div class="etk-ilerleme-bar"><span></span></div></div>')

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Oturdu Ama Görünmüyor',
     'desc': 'Deniz, yeni M.2 SSD’yi anakarttaki M.2 yuvasına taktı; kart yerine oturdu ve vidalandı. Ama disk ne UEFI’de ne de işletim sistemi kurulumunda görünüyor. Sence en olası neden ne?',
     'secenekler': ['SSD bozuk geldi; başka bir açıklaması yok.', 'SSD M.2 SATA, yuva ise yalnız NVMe (PCIe) destekliyor.', 'SSD’nin kapasitesi anakart için fazla büyük.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'terim', 'terimler': [
        ('Platter / Head', 'Plaka / Okuma-yazma kafası', 'HDD’de verinin yazıldığı dönen disk ve onu okuyan kafa.'),
        ('Seek Time', 'Arama süresi', 'Kafanın doğru ize gitmesi için geçen süre.'),
        ('SSD', 'Katı hal sürücüsü', 'Hareketli parçası olmayan, flaş bellekli depolama.'),
        ('NAND Flash', 'NAND flaş bellek', 'Güç kesilince de veriyi koruyan bellek hücreleri.'),
        ('Controller', 'Denetleyici', 'SSD’nin veriyi çiplere dağıtan ve yöneten işlemcisi.'),
        ('SATA / AHCI', 'Seri ATA / Gelişmiş Ana Denetleyici Arayüzü', 'Kablolu disk arayüzü ve komut düzeni; SATA III ≈ 600 MB/s.'),
        ('NVMe / PCIe lane', 'NVM Express / PCIe hattı', 'SSD için tasarlanmış protokol ve kullandığı veri hatları.'),
        ('M.2 Key', 'M.2 anahtarı (çentik)', 'Kartın hangi yuvaya girebileceğini belirleyen çentik.'),
        ('IOPS', 'Saniyedeki G/Ç işlemi', 'Rastgele erişim başarımının ölçüsü.'),
        ('TBW / SMART', 'Yazılabilir toplam TB / Öz izleme raporu', 'SSD dayanım değeri ve diskin sağlık kayıtları.'),
    ]},

    {'tur': 'adim', 'no': 1, 'ad': 'HDD: Plaka ve Kafa', 'etiket': 'ADIM 1 · HDD',
     'ikon': '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M4 20l6-6"/>',
     'title': 'Arama Süresi ve Dönüş Gecikmesi',
     'desc': 'Sabit diskte (<strong>HDD</strong>) veri, dönen <strong>plakaların</strong> yüzeyine manyetik olarak yazılır. Yüzey eş merkezli <strong>izlere</strong> (track), izler <strong>sektörlere</strong> (günümüzde çoğunlukla 4 KiB) bölünür. Okumak için kol, kafayı doğru ize taşır (<strong>arama süresi</strong>); sonra sektörün kafanın altına gelmesi beklenir (<strong>dönüş gecikmesi</strong>). 7200 dev/dk’da bir tur ≈ 8,3 ms, ortalama bekleme yarım tur ≈ 4,2 ms’dir.',
     'tip': ['⏱', 'Tahmin et: 5400 dev/dk’da ortalama dönüş gecikmesi kaç ms olur? Sonra hızı seç ve “Sektör oku” ile ölç.'],
     'gorsel': {'3d': 's5-3d', 'aria': 'Kapağı saydam sabit disk: plaka dönüyor, kol kafayı hedef ize taşıyor, işaretli sektör kafanın altına gelince okunuyor',
                'yedek': 'yedek-hdd.svg', 'yedek_metin': 'Erişim süresi = arama süresi + dönüş gecikmesi'}},

    {'tur': 'adim', 'no': 2, 'ad': 'SSD ve NAND Flash', 'etiket': 'ADIM 2 · SSD',
     'ikon': '<rect x="3" y="5" width="18" height="14" rx="2"/><rect x="6" y="8" width="4" height="4"/><rect x="12" y="8" width="3" height="3"/><rect x="16" y="8" width="3" height="3"/><rect x="12" y="13" width="3" height="3"/><rect x="16" y="13" width="3" height="3"/>',
     'title': 'Sayfa Yazılır, Blok Silinir',
     'desc': '<strong>SSD</strong> (katı hal sürücüsü) veriyi <strong>NAND flaş</strong> hücrelerinde, yalıtılmış katmanda hapsedilen elektrik yükü olarak saklar; hareketli parçası yoktur. <strong>Denetleyici</strong> veriyi birden çok NAND çipine dağıtır. NAND’a <strong>sayfa</strong> (page) birimiyle yazılır ama yalnız bütün bir <strong>blok</strong> (block) silinebilir; dolu sayfanın üzerine doğrudan yazılamaz. <strong>TRIM</strong> komutuyla işletim sistemi, silinen verinin hangi sayfalarda olduğunu SSD’ye bildirir.',
     'tip': ['🧪', 'Dört adımı önce TRIM kapalı, sonra açık oynat: “fazladan kopyalanan sayfa” sayısını karşılaştır.'],
     'genis': True,
     'gorsel': {'2d': 'nand', 'koyu': True}},

    {'tur': 'adim', 'no': 3, 'ad': 'SATA ve NVMe', 'etiket': 'ADIM 3 · ARAYÜZ',
     'ikon': '<path d="M3 8h18M3 12h18M3 16h18"/><path d="M3 5v14M21 5v14"/>',
     'title': 'Tek Şerit mi, Dört Hat mı?',
     'desc': '<strong>SATA III</strong> tek bir hattır: 6 Gb/s; kodlama payı düşülünce teorik tavan ≈ 600 MB/s (gerçekte ≈ 550). Komutlar <strong>AHCI</strong> ile tek kuyrukta (en çok 32 komut) sıralanır. <strong>NVMe</strong>, SSD için tasarlanmış protokoldür ve <strong>PCIe</strong> hatları üzerinden çalışır: hat başına PCIe 3.0 ≈ 1 GB/s, PCIe 4.0 ≈ 2 GB/s taşır; M.2 NVMe SSD’ler genellikle dört hat (<strong>x4</strong>) kullanır ve on binlerce kuyruğa izin verir.',
     'tip': ['🛣', 'Arayüzleri sırayla seç. “M.2 SATA”ya özellikle bak: kart M.2 ama hattı SATA.'],
     'genis': True,
     'gorsel': {'2d': 'arayuz', 'koyu': True}},

    {'tur': 'adim', 'no': 4, 'ad': '2,5″, 3,5″ ve M.2', 'etiket': 'ADIM 4 · BİÇİM VE ANAHTAR',
     'ikon': '<rect x="2" y="5" width="9" height="13" rx="1.5"/><rect x="13" y="7" width="6" height="9" rx="1"/><rect x="21" y="4" width="1.5" height="15" rx=".5"/>',
     'title': 'Biçim, Boy ve Çentik',
     'desc': 'Masaüstü HDD’ler <strong>3,5 inç</strong>, dizüstü HDD’ler ve SATA SSD’ler <strong>2,5 inç</strong> kasadadır; SATA veri ve güç kablosuyla bağlanır. <strong>M.2</strong> kart kablosuz, doğrudan yuvaya girer; adı ölçüsüdür: 2280 = 22 mm en, 80 mm boy (2242 ve 2260 de var). Kenardaki çentik <strong>anahtardır</strong>: tek çentik <strong>M</strong> (çoğunlukla NVMe), iki çentik <strong>B+M</strong> (çoğunlukla SATA). B+M kart M yuvasına girer, ama yuva SATA desteklemiyorsa disk görünmez.',
     'tip': ['🔍', 'Modelleri döndür; “Çentikler” ile konnektörlere yakınlaş, “M.2 boyları” ile vida yerlerini gör.'],
     'gorsel': {'3d': 's8-3d', 'aria': '3,5 inç HDD, 2,5 inç SATA SSD ve iki M.2 SSD gerçek oranlarıyla yan yana; M.2 kartlarda M ve B+M çentikleri',
                'yedek': 'yedek-bicim.svg', 'ust': FOTO_M2}},

    {'tur': 'adim', 'no': 5, 'ad': 'Sıralı ve Rastgele Okuma', 'etiket': 'ADIM 5 · BAŞARIM',
     'ikon': '<path d="M4 7h16"/><path d="M4 12h5M13 12h7"/><path d="M4 17h3M11 17h2M17 17h3"/>',
     'title': 'Büyük Dosya mı, Küçük Parçalar mı?',
     'desc': '<strong>Sıralı</strong> okumada veri art arda bloklardan okunur (büyük dosya kopyalama). <strong>Rastgele</strong> okumada küçük parçalar (çoğunlukla 4 KiB) diskin farklı yerlerinden istenir; işletim sistemi açılışı ve program yükleme böyledir. HDD’de her rastgele okuma arama ve dönüş gecikmesi bekler, hız yüzlerce kat düşer. SSD’de de rastgele okuma sıralıdan yavaştır ama HDD’den yaklaşık yüz kat hızlıdır. Rastgele başarım <strong>IOPS</strong> ile ölçülür.',
     'tip': ['🏁', 'Önce tahmin et: HDD rastgele okumada kaç kat yavaşlar? Sonra iki kipi de oynat.'],
     'genis': True,
     'gorsel': {'2d': 'sirali'}},

    {'tur': 'adim', 'no': 6, 'ad': 'Dayanıklılık ve Yedekleme', 'etiket': 'ADIM 6 · DAYANIKLILIK',
     'ikon': '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
     'title': 'Aşınmayı İzle, Kopyayı Çoğalt',
     'desc': 'NAND hücreleri her yazma/silme döngüsünde biraz aşınır; denetleyici yazmaları bloklara eşit dağıtır (<strong>aşınma dengeleme</strong>). Üretici dayanımı <strong>TBW</strong> (ömür boyunca yazılabilecek toplam terabayt) olarak verir. <strong>SMART</strong>, diskin kendi tuttuğu sağlık kayıtlarıdır. SMART her arızayı önceden haber vermez; bu yüzden <strong>3-2-1</strong> kuralı: 3 kopya, 2 farklı ortam, 1 kopya başka bir yerde.',
     'tip': ['🛟', 'Günlük yazma miktarını değiştir, iki SMART raporunu karşılaştır, sonra 3-2-1 planını sına.'],
     'genis': True,
     'gorsel': {'2d': 'dayanik'}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Disk Testini Oku',
     'title': 'Test Sonuçlarını Yorumla',
     'desc': 'Üç diskin hız testi ve sağlık raporları veriliyor. Her görevde tabloyu oku, en uygun cevabı seç, gerekçeyi incele.',
     'tip': ['💡', 'Önce hangi satıra bakacağına karar ver: sıralı mı, rastgele mi, kapasite mi, sağlık mı?'],
     'ek': ILERLEME % ('1', 'Tamamlanan görev', '7'),
     'gorsel': {'panel': 'test-oku'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'M.2 Uyum Denetimi',
     'title': 'Bu SSD Bu Yuvada Çalışır mı?',
     'desc': 'Her görevde bir M.2 SSD ve bir yuva veriliyor. Kartı döndürüp çentiklerini incele, sonucu seç; doğru cevapta kart yuvaya takılır ve sistemin ne gördüğü çıkar.',
     'tip': ['🔑', 'Sırayla denetle: önce çentik (fiziksel uyum), sonra protokol (SATA / NVMe), en son PCIe nesli (hız).'],
     'ek': ILERLEME % ('2', 'Görev', '5'),
     'gorsel': {'panel': 'm2-uyum',
                'ic': '<div class="mu"><div class="mu-sahne"><div class="don3d" id="m2-3d" aria-label="M.2 SSD ve M.2 yuvası; kart döndürülüp çentikleri incelenebilir">'
                      '<div data-yedek hidden><!--@dahil:yedek-m2.svg--></div></div></div>'
                      '<div class="mu-bilgi"><div class="mu-kart mu-ssd"><span>SSD</span><b></b></div><div class="mu-kart mu-yuva"><span>Yuva</span><b></b></div></div>'
                      '<div class="mu-gorev"><span class="mu-no"></span><b>Sonuç ne olur?</b></div><div class="mu-sec" role="group" aria-label="Sonuç seçenekleri"></div>'
                      '<div class="mu-geri" aria-live="polite"></div></div>'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'HDD', 'Erişim = arama + dönüş gecikmesi (7200 dev/dk: ort. ≈ 4,2 ms).'),
        ('oz-2.svg', 'SSD ve NAND', 'Sayfa yazılır, blok silinir; denetleyici ve TRIM.'),
        ('oz-3.svg', 'SATA ve NVMe', 'SATA III ≈ 600 MB/s; PCIe 4.0 x4 ≈ 7,9 GB/s (teorik).'),
        ('oz-4.svg', 'Biçim ve Anahtar', '3,5″ / 2,5″ / M.2 2280; M ya da B+M çentiği.'),
        ('oz-5.svg', 'Sıralı ve Rastgele', 'HDD rastgelede yüzlerce kat yavaşlar; IOPS ölçülür.'),
        ('oz-6.svg', 'Dayanıklılık', 'TBW, SMART ve 3-2-1 yedek.'),
    ]},
]
