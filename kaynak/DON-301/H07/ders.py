# DON-301 H07 — Ekran Kartı ve Bağlantı Standartları (Format K, lise)
MODELLER = ['M-GPU', 'M-KABLO-UCLARI']

DERS = {
    'grade': 'lise',
    'hafta': '7. Hafta',
    'baslik': 'Ekran Kartı ve Bağlantı Standartları',
    'aciklama': 'GPU’nun binlerce çekirdekle paralel çalışmasını izle; tümleşik ve harici grafiği, VRAM’i ve bant genişliğini karşılaştır. HDMI, DisplayPort ve USB-C sürümlerini tanı; çözünürlük ve yenileme hızına göre doğru kabloyu seç.',
    'hedefler': [
        'GPU’nun binlerce basit çekirdekle paralel işlem yaptığını, hangi işlerde CPU’dan hızlı olduğunu açıklayabileceğim.',
        'VRAM’in görevini ve bant genişliğini açıklayıp VRAM yetmediğinde ne olduğunu yorumlayabileceğim.',
        'HDMI ile DisplayPort’u fiş biçimi, özellikleri ve sürümlerin bant genişliğine göre karşılaştırabileceğim.',
        'USB-C konnektörünü USB hız standartlarından ayırt edip senaryoya uygun port ve kabloyu seçebileceğim.',
    ],
    'hedef_simgeler': [
        '<rect x="3" y="4" width="7" height="7" rx="1"/><path d="M14 4h2v2h-2zM18 4h2v2h-2zM14 8h2v2h-2zM18 8h2v2h-2zM14 12h2v2h-2zM18 12h2v2h-2z"/><path d="M3 15h7v5H3z"/>',
        '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4"/>',
        '<path d="M3 8h18v6l-3 3H6l-3-3z"/><path d="M7 11h10"/>',
        '<rect x="5" y="9" width="14" height="6" rx="3"/><path d="M8 12h8M12 3v6M12 15v6"/>',
    ],
    'bolumler': [
        ['Ekran Kartı', 'Paralel işlem, tümleşik ve harici, VRAM'],
        ['Görüntü Bağlantıları', 'HDMI, DisplayPort, sürümler ve bant genişliği'],
        ['USB ve Ekran', 'USB-C, USB hızları, çözünürlük ve Hz'],
    ],
    'quiz': [
        {'q': 'Bir oyun karesini oluştururken GPU, CPU’dan çok daha hızlıdır. Bunun asıl nedeni nedir?',
         'opts': ['Piksellerin renkleri birbirinden bağımsız hesaplanabilir; GPU binlerce basit çekirdekle aynı komutu çok sayıda piksele aynı anda uygular',
                  'GPU çekirdeklerinin saat hızı CPU çekirdeklerinden birkaç kat yüksektir',
                  'GPU komutları sırayla ama CPU’dan daha az hata ile yürütür',
                  'GPU sistem RAM’ini CPU’dan daha hızlı okur'], 'correct': 0,
         'fb': 'GPU’nun saat hızı genellikle CPU’dan düşüktür; üstünlüğü çekirdek sayısındadır. Bağımsız, aynı türden çok sayıda iş (pikseller) paralel yapılır. Her adımın bir öncekini beklediği sıralı işlerde CPU öndedir.'},
        {'q': 'Ece’nin bilgisayarında harici ekran kartı takılı. 2560 × 1440, 165 Hz monitöründe HDMI 2.0 ve DisplayPort 1.4 girişleri var. Görseldeki hangi bağlantı 165 Hz’i sağlar?<span class="q-gorsel"><!--@dahil:svg-quiz-port.svg--></span>',
         'opts': ['1 numaralı port (anakart HDMI) ve HDMI kablo',
                  '2 numaralı port (ekran kartı HDMI) ve monitörün HDMI 2.0 girişi',
                  '3 numaralı port (ekran kartı DisplayPort) ve monitörün DisplayPort 1.4 girişi',
                  '4 numaralı port (anakart USB-A) ve USB–HDMI dönüştürücü'], 'correct': 2,
         'fb': '165 Hz için ≈ 15,3 Gbit/s gerekir. HDMI 2.0 ≈ 14,4 Gbit/s taşır (bu çözünürlükte ≈ 144 Hz); DisplayPort 1.4 ise yaklaşık 25,9 Gbit/s taşır. Anakart çıkışları tümleşik grafiğe bağlıdır; harici kart takılıyken kullanılmaz.'},
        {'q': 'Deniz’in ekran kartında 8 GB VRAM var. Oyunda doku kalitesini “Ultra” yapınca oyun yaklaşık 10 GB VRAM istiyor ve görüntü sık sık takılıyor. En doğru açıklama hangisidir?',
         'opts': ['İşlemcinin çekirdek sayısı az olduğu için takılıyor; doku ayarıyla ilgisi yok',
                  'VRAM taştığı için veriler PCIe üzerinden çok daha yavaş sistem RAM’inden getiriliyor; doku kalitesi düşürülmeli',
                  'Monitörün yenileme hızı düşük olduğu için takılıyor',
                  'VRAM dolunca fazla veri otomatik olarak silinir; takılma yalnız internetten kaynaklanır'], 'correct': 1,
         'fb': 'VRAM’in bant genişliği yüzlerce GB/s’dir; PCIe x16 (4.0) ise ≈ 32 GB/s. Sığmayan dokular bu yavaş yoldan getirildiği için kareler gecikir. Doku kalitesini düşürmek VRAM kullanımını en çok azaltan ayardır.'},
        {'q': 'Ece, iki ucu da USB-C olan telefon şarj kablosuyla 10 Gbit/s destekli harici SSD’sini bilgisayarın USB-C portuna bağladı. Kopyalama çok yavaş (≈ 40 MB/s). Neden?',
         'opts': ['USB-C konnektörü en çok 480 Mbit/s taşıyabilir',
                  'Fiş ters takılmıştır; USB-C yalnız bir yönde tam hızda çalışır',
                  'USB-C yalnız şarj içindir, veri taşımaz',
                  'Konnektör aynı olsa da bu kablo yalnız USB 2.0 (480 Mbit/s) destekliyor; hız port, kablo ve cihazın ortak en düşük standardıdır'], 'correct': 3,
         'fb': 'USB-C bir fiş biçimidir. Birçok şarj kablosunda yalnız USB 2.0 telleri vardır (≈ 40 MB/s gerçek hız). 10 Gbit/s için port, cihaz ve kablonun üçü de bu standardı desteklemelidir. USB-C iki yönde de aynı hızda çalışır.'},
    ],
    'bitis': 'Ekran kartını, VRAM’i ve bağlantı standartlarını artık teknik gerekçeleriyle seçebiliyorsun!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'Çift fanlı ekran kartı; önünde HDMI, DisplayPort ve USB-C kablo uçları', 'yedek': 'yedek-kapak.svg'}

FOTO_GPU = '<div class="foto-kart"><!--@foto:DON-301-H07-gpu-ust.jpg|Soğutucusu sökülmüş ekran kartı: ortada GPU çipi, çevresinde bellek çipleri--><span>Gerçekte</span></div>'
FOTO_FIS = '<div class="foto-kart"><!--@foto:DON-301-H07-hdmi-dp-fisleri.jpg|HDMI ve DisplayPort kablo uçları yan yana (DP’nin kilit düğmesi görünür)--><span>Gerçekte</span></div>'

SLAYTLAR = [
    {'tur': 'isinma',
     'title': '144 Hz Nereye Gitti?',
     'desc': 'Ece yeni aldığı <strong>2560 × 1440, 144 Hz</strong> monitörü çekmecede bulduğu eski bir HDMI kabloyla ekran kartına bağladı. Ekran ayarlarında en çok <strong>60 Hz</strong> seçilebiliyor. Sence neden?',
     'secenekler': ['Ekran kartı 144 Hz için yeterince güçlü değil.', 'Kablo ve port sürümü bu kadar veriyi taşıyamıyor.', 'Monitör arızalı; 144 Hz yazısı yanlış.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'terim', 'terimler': [
        ('GPU (Graphics Processing Unit)', 'Grafik İşlem Birimi', 'Görüntüyü ve paralel hesapları yapan, binlerce basit çekirdekli işlemci.'),
        ('Parallel Processing', 'Paralel İşlem', 'Birbirinden bağımsız çok sayıda işin aynı anda yapılması.'),
        ('iGPU / dGPU', 'Tümleşik / Harici Grafik', 'İşlemcinin içindeki grafik birimi / PCIe yuvasına takılan ayrı kart.'),
        ('VRAM (Video RAM)', 'Ekran Belleği', 'Ekran kartının dokuları, modelleri ve kareleri tuttuğu kendi belleği (ör. GDDR6).'),
        ('Memory Bandwidth', 'Bellek Bant Genişliği', 'Saniyede taşınan veri (GB/s) = veri yolu (bit) × veri hızı ÷ 8.'),
        ('HDMI', 'Yüksek Tanımlı Çoklu Ortam Arayüzü', 'Görüntü ve ses taşır; televizyon ve projeksiyonun ortak girişi.'),
        ('DisplayPort (DP)', 'Görüntü Bağlantı Noktası', 'Monitörlerde yaygın; kilitli fiş, monitörleri zincirleme (MST).'),
        ('USB-C', 'USB Tip-C Konnektör', 'Ters çevrilebilen 24 pinli fiş biçimi; hızı değil, şekli tanımlar.'),
        ('Alt Mode / Power Delivery (PD)', 'Alternatif Mod / Güç Aktarımı', 'USB-C üzerinden görüntü (DP) taşıma / 240 W’a kadar pazarlıklı güç.'),
        ('Resolution / Refresh Rate', 'Çözünürlük / Yenileme Hızı', 'Karedeki piksel sayısı (2560 × 1440) / saniyedeki yenileme (Hz).'),
    ]},

    {'tur': 'adim', 'no': 1, 'ad': 'GPU ve Paralel İşlem', 'etiket': 'ADIM 1 · PARALEL İŞLEM',
     'ikon': '<rect x="3" y="4" width="7" height="7" rx="1"/><path d="M14 4h2v2h-2zM18 4h2v2h-2zM14 8h2v2h-2zM18 8h2v2h-2zM14 12h2v2h-2zM18 12h2v2h-2z"/><path d="M3 15h7v5H3z"/>',
     'title': 'Az Güçlü Çekirdek mi, Çok Basit Çekirdek mi?',
     'desc': '<strong>CPU</strong> 6–24 güçlü çekirdekle karmaşık ve sıralı işleri hızlı yürütür. <strong>GPU</strong> ise binlerce basit çekirdeği gruplar hâlinde çalıştırır: <strong>aynı komutu farklı verilere</strong> aynı anda uygular. 1920 × 1080 bir karede ≈ 2,07 milyon piksel vardır ve her pikselin rengi diğerlerinden bağımsız hesaplanabilir. Her adımın bir öncekini beklediği <strong>sıralı işte</strong> ise GPU üstünlüğünü kaybeder.',
     'tip': ['🎨', 'Önce tahmin et: aynı resmi kim önce boyar? Sonra “Sıralı iş” ile sonucun tersine döndüğünü gör.'],
     'genis': True,
     'gorsel': {'2d': 'yaris', 'koyu': True}},

    {'tur': 'adim', 'no': 2, 'ad': 'Tümleşik ve Harici', 'etiket': 'ADIM 2 · iGPU / dGPU',
     'ikon': '<rect x="3" y="4" width="8" height="8" rx="1.5"/><path d="M5.5 8h3"/><rect x="13" y="10" width="8" height="10" rx="1.5"/><path d="M15 20v2M19 20v2"/>',
     'title': 'Belleği Paylaşan mı, Kendi Belleği Olan mı?',
     'desc': '<strong>Tümleşik grafik (iGPU)</strong> işlemcinin içindedir; sistem RAM’ini işlemciyle paylaşır ve görüntüyü <strong>anakarttaki</strong> çıkışlardan verir. <strong>Harici kart (dGPU)</strong> PCIe x16 yuvasına takılır; kendi VRAM’i, soğutucusu ve güç girişi vardır (yuvadan 75 W, her 8-pin girişten 150 W). Harici kart takılıyken monitör kablosu <strong>ekran kartının</strong> çıkışına bağlanır.',
     'tip': ['🔌', 'İki yolu karşılaştır; sonra “Kablo nereye?” ile monitör kablosunu iki porta takmayı dene.'],
     'genis': True,
     'gorsel': {'2d': 'mimari'}},

    {'tur': 'adim', 'no': 3, 'ad': 'VRAM', 'etiket': 'ADIM 3 · EKRAN BELLEĞİ',
     'ikon': '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4"/>',
     'title': 'Dokular VRAM’e Sığmalı',
     'desc': '<strong>VRAM</strong>, GPU çipinin hemen çevresindeki bellek çipleridir; dokuları, 3D modelleri ve hazırlanan kareleri tutar. Hızını <strong>bant genişliği</strong> belirler: 256 bit × 20 Gbit/s ÷ 8 = <strong>640 GB/s</strong> (paylaşılan çift kanal DDR5 ≈ 90 GB/s). VRAM dolarsa veriler PCIe üzerinden (≈ 32 GB/s) sistem RAM’inden getirilir ve oyun takılır.',
     'tip': ['🧩', 'Soğutucuyu ayır ve bellek çiplerini bul; sonra doku kalitesini artırıp VRAM’i doldur.'],
     'gorsel': {'3d': 's7-3d', 'aria': 'Ekran kartı: soğutucu ayrılınca GPU çipi ve çevresindeki sekiz VRAM çipi görünür; veri yolları parçacıklarla gösterilir, yandaki panelde VRAM kullanımı dolar',
                'yedek': 'yedek-vram.svg', 'ust': FOTO_GPU}},

    {'tur': 'adim', 'no': 4, 'ad': 'HDMI ve DisplayPort', 'etiket': 'ADIM 4 · GÖRÜNTÜ BAĞLANTISI',
     'ikon': '<path d="M3 8h18v6l-3 3H6l-3-3z"/><path d="M7 11h10"/>',
     'title': 'İkisi de Görüntü ve Ses Taşır; Sınır Sürümde',
     'desc': '<strong>HDMI</strong> fişinin iki alt köşesi eğiktir; televizyon ve projeksiyonda standarttır (ARC/eARC ile sesi ses sistemine geri gönderir, CEC ile cihazlar tek kumandayla yönetilir). <strong>DisplayPort</strong> fişinin tek köşesi eğiktir, çoğunda kilit mandalı vardır; monitör ve ekran kartlarında yaygındır, <strong>MST</strong> ile monitörler zincirlenir. Asıl sınır sürümün veri hızıdır: HDMI 2.0 ≈ 14,4, DP 1.4 ≈ 25,9, HDMI 2.1 ≈ 42,7 Gbit/s.',
     'tip': ['🔍', 'Bir fiş seç ve portuna tak; tablodan sürümlerin en yüksek ayarlarını karşılaştır.'],
     'gorsel': {'3d': 's8-3d', 'aria': 'Ekran kartının metal braketi: bir HDMI ve üç DisplayPort çıkışı; seçilen fiş portuna takılır, yandaki tabloda sürümlerin veri hızları yer alır',
                'yedek': 'yedek-port.svg', 'ust': FOTO_FIS}},

    {'tur': 'adim', 'no': 5, 'ad': 'USB Standartları ve USB-C', 'etiket': 'ADIM 5 · USB',
     'ikon': '<rect x="5" y="9" width="14" height="6" rx="3"/><path d="M8 12h8M12 3v6M12 15v6"/>',
     'title': 'USB-C Bir Şekildir, Hız Değil',
     'desc': '<strong>USB-C</strong> 24 pinli, ters çevrilebilir bir <strong>konnektördür</strong>; içinden hangi standardın geçeceğini port, kablo ve cihaz birlikte belirler. <strong>USB 2.0</strong>: 480 Mbit/s · <strong>USB 5/10/20 Gbps</strong> (eski adları 3.2 Gen 1, Gen 2, Gen 2×2) · <strong>USB4</strong>: 40–80 Gbit/s. Aynı fiş <strong>DP Alt Mode</strong> ile görüntü, <strong>USB PD</strong> ile 240 W’a kadar güç taşıyabilir. Hız, zincirdeki en yavaş halkaya iner.',
     'tip': ['🔄', 'Bir standart seç: hangi pinlerin çalıştığını ve 50 GB’lık kopyalamanın süresini izle. Sonra fişi çevir.'],
     'genis': True,
     'gorsel': {'2d': 'usbc', 'koyu': True}},

    {'tur': 'adim', 'no': 6, 'ad': 'Çözünürlük ve Yenileme Hızı', 'etiket': 'ADIM 6 · Hz VE BANT',
     'ikon': '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><path d="M7 12l3-3 2 2 4-4"/>',
     'title': 'Piksel × Hz × Renk Derinliği = Gereken Veri',
     'desc': '<strong>Çözünürlük</strong> karedeki piksel sayısı, <strong>yenileme hızı</strong> ekranın saniyede kaç kez yenilendiğidir. 60 Hz’de her kare 16,7 ms, 144 Hz’de 6,9 ms ekranda kalır; hareket daha akıcı görünür. Gereken veri ≈ genişlik × yükseklik × Hz × 24 bit (+ ≈ %5 boşluk süresi). 2560 × 1440 × 144 × 24 ≈ 12,7 Gbit/s: HDMI 1.4 yetmez, HDMI 2.0 ve DP 1.4 yeter. GPU’nun da o hızda kare üretmesi gerekir.',
     'tip': ['⏱️', 'Ağır çekim karşılaştırmayı izle; sonra çözünürlük ve Hz seçip hangi bağlantının yettiğini bul.'],
     'genis': True,
     'gorsel': {'2d': 'yenileme'}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Kablo–Senaryo Eşleştirme',
     'title': 'Hangi Bağlantı?',
     'desc': 'Her senaryo kartını doğru bağlantı kutusuna yerleştir. Karar verirken cihazın girişine, istenen çözünürlük ve Hz’e, güç ihtiyacına bak.',
     'tip': ['💡', 'Televizyon ve projeksiyonda HDMI; zincirleme monitörde DisplayPort; tek kabloyla görüntü + şarjda USB-C düşün.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Yerleşen kart</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 8</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'kablo-sinifla'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Bağlantı Planı',
     'title': 'Masayı Kablola',
     'desc': 'Dört cihazı bağla: her görev için port ve kablo seç, “Bağla”ya bas ve hedef cihazın ekranındaki sonucu oku. Hedef ayara ulaşınca görev tamamlanır.',
     'tip': ['🧮', 'Sonuç hedefin altında kalırsa en yavaş halkayı bul: port mu, kablo mu, cihazın girişi mi?'],
     'ek': '<ol class="gorevler" id="gorevler-2">'
           '<li><span class="g-isaret"></span><span><strong>Oyun monitörü:</strong> 2560 × 1440, 165 Hz.</span></li>'
           '<li><span class="g-isaret"></span><span><strong>Televizyon:</strong> 3840 × 2160, 120 Hz.</span></li>'
           '<li><span class="g-isaret"></span><span><strong>Dizüstü:</strong> tek kabloyla görüntü + şarj.</span></li>'
           '<li><span class="g-isaret"></span><span><strong>Harici SSD:</strong> 50 GB’ı en kısa sürede yedekle.</span></li></ol>'
           '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Tamamlanan görev</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 4</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'baglanti-plan'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'Paralel İşlem', 'GPU: binlerce basit çekirdek, bağımsız işlerde hızlı.'),
        ('oz-2.svg', 'iGPU / dGPU', 'Paylaşılan RAM ya da kendi VRAM’i; kablo ekran kartına.'),
        ('oz-3.svg', 'VRAM', 'Bant = veri yolu × hız ÷ 8; taşarsa takılır.'),
        ('oz-4.svg', 'HDMI / DP', 'TV’de HDMI, monitörde DP; sınır sürümün Gbit/s değeri.'),
        ('oz-5.svg', 'USB-C', 'Şekil ≠ hız; 480 Mbit/s’ten 80 Gbit/s’e, Alt Mode ve PD.'),
        ('oz-6.svg', 'Hz ve Bant', 'Piksel × Hz × 24 bit; kablo, port ve GPU yetmeli.'),
    ]},
]
