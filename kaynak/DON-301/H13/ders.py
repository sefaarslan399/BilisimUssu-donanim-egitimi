# DON-301 H13 — Sorun Giderme, Bakım ve Veri Güvenliği (Format K+U, lise)
MODELLER = ['M-MASAUSTU-ACIK', 'M-FAN']

DERS = {
    'grade': 'lise',
    'hafta': '13. Hafta',
    'baslik': 'Sorun Giderme, Bakım ve Veri Güvenliği',
    'aciklama': 'Arızayı tahminle değil yöntemle çöz: belirtiden teste ilerle, hata ışıklarını ve sıcaklığı yorumla, bakımı güvenle yap, veriyi yedekle ve kalıcı olarak sil.',
    'hedefler': [
        'Belirti toplama, olası nedenleri sıralama, en kolay testten başlama, tek değişken değiştirme ve belgeleme adımlarıyla sistematik sorun giderebileceğim.',
        'Açılmama, görüntü gelmemesi ve aşırı ısınma durumlarını hata ışıkları, sıcaklık ve fan verileriyle teşhis edebileceğim.',
        'Fişi çekili bilgisayarda fanı sabitleyerek toz temizliği yapabilecek, disk sağlığını (SMART) izleyerek önleyici bakım uygulayabileceğim.',
        'Veriyi 3-2-1 kuralıyla yedekleyip güvenle silebilecek ve e-atık sürecini açıklayabileceğim.',
    ],
    'hedef_simgeler': [
        '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/><path d="M9 12l2 2 4-4"/>',
        '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><path d="M8 10h2l1-2 2 4 1-2h2"/>',
        '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.8"/><path d="M12 10V5M13.7 13l4.3 2.5M10.3 13L6 15.5"/>',
        '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8"/><path d="M9 16l2 2 4-4"/>',
    ],
    'bolumler': [
        ['Yöntem', 'Belirti → hipotez → test → sonuç'],
        ['Teşhis', 'Açılmıyor, görüntü yok, ısınma, disk sağlığı'],
        ['Bakım ve Veri', 'Temizlik, 3-2-1 yedek, güvenli silme, e-atık'],
    ],
    'quiz': [
        {'q': 'Sistematik sorun gidermede belirtiler toplandı ve olası nedenler sıralandı. Sıradaki doğru adım hangisidir?',
         'opts': ['Nedenleri en kolay ve ucuz testten başlayarak, her seferinde tek değişiklikle sınamak', 'En pahalı parçayı değiştirip sonucu beklemek', 'Zaman kazanmak için birkaç parçayı aynı anda değiştirmek', 'Sorun ne olursa olsun önce işletim sistemini yeniden kurmak'], 'correct': 0,
         'fb': 'Tek değişiklikle yapılan ucuz testler, sorunu neyin çözdüğünü gösterir. Aynı anda birkaç değişiklik yapılırsa gerçek neden gizlenir.'},
        {'q': 'Görseldeki tozlu kasa basınçlı havayla temizlenecek. Hangisi doğru uygulamadır?<span class="q-gorsel"><!--@dahil:svg-quiz-temizlik.svg--></span>',
         'opts': ['Bilgisayar açıkken püskürtmek; fanlar tozu dışarı atar', 'Kutuyu ters çevirip uzun ve sürekli püskürtmek', 'Fiş çekiliyken fanı sabitleyip kısa püskürtmelerle temizlemek', 'Güç kaynağının kapağını açıp içini de temizlemek'], 'correct': 2,
         'fb': 'Bakım fiş çekiliyken yapılır. Sabitlenmeyen fan aşırı hızlanıp zarar görebilir; ters tutulan kutudan soğuk sıvı çıkabilir. Güç kaynağı açılmaz.'},
        {'q': 'Ece’nin bilgisayarı oyunda yaklaşık 20 dakika sonra kendiliğinden kapanıyor. İzleme ekranında işlemci sıcaklığı 98 °C, işlemci fanı 450 dev/dk görünüyor. En doğru sonraki adım hangisidir?',
         'opts': ['Güç kaynağını yenisiyle değiştirmek', 'Fiş çekiliyken soğutucu ve fanı incelemek; toz varsa temizleyip fanın dönüşünü sınamak', 'İşletim sistemini baştan kurmak', 'Ekran kartını değiştirmek'], 'correct': 1,
         'fb': 'Yüksek sıcaklık ve yavaş fan ısınma hipotezini destekler. En ucuz test soğutucu ve fanın incelenmesidir; parça değişimi son çaredir.'},
        {'q': 'Deniz, okulun SSD’li eski bilgisayarlarını bağışlamadan önce öğrenci dosyalarını kalıcı olarak silmek istiyor. Hangisi doğrudur?',
         'opts': ['Dosyaları silip çöp kutusunu boşaltmak yeterlidir', 'Hızlı biçimlendirme veriyi geri getirilemez yapar', 'SSD’ler veriyi kendiliğinden temizler; bir şey yapmaya gerek yoktur', 'Gerekli veriler yedeklendikten sonra SSD’nin güvenli silme komutu ya da şifreli diskte anahtarı yok etme yöntemi kullanılır'], 'correct': 3,
         'fb': 'Silme ve hızlı biçimlendirme yalnız dosya adreslerini kaldırır. Güvenli silme komutu ya da anahtarın yok edilmesi, SSD’nin yedek alanı dahil tüm veriyi okunamaz yapar.'},
    ],
    'bitis': 'Arızaya yöntemle yaklaşmayı, bakımı güvenle yapmayı ve veriyi korumayı artık teknik gerekçeleriyle uygulayabiliyorsun!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'Yan kapağı açık masaüstü kasa: anakart, işlemci soğutucusu, bellekler, ekran kartı, disk ve kasa fanı', 'yedek': 'yedek-kapak.svg'}

FOTO_TOZ = '<div class="foto-kart"><!--@foto:DON-301-H13-tozlu-sogutucu.jpg|Tozla kaplanmış işlemci soğutucusu ve kasa fanı--><span>Gerçekte</span></div>'

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Yirmi Dakikada Bir Kapanan Bilgisayar',
     'desc': 'Deniz’in bilgisayarı oyun başladıktan yaklaşık 20 dakika sonra kendiliğinden kapanıyor. Açılışta sorun yok, hata ışığı da yanmıyor. Sence ilk ne yapılmalı?',
     'secenekler': ['Güç kaynağı hemen yenisiyle değiştirilir.', 'Belirti not edilir; önce sıcaklık ve fanlar kontrol edilir.', 'İşletim sistemi baştan kurulur.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'terim', 'terimler': [
        ('Troubleshooting', 'Sorun giderme', 'Arızanın nedenini adım adım, kanıta dayanarak bulma süreci.'),
        ('Symptom / Hypothesis', 'Belirti / Hipotez', 'Gözlenen durum ve onu açıklayan, test edilecek olası neden.'),
        ('Debug LED', 'Hata ışığı', 'POST’un takıldığı aşamayı (CPU, DRAM, VGA, BOOT) gösteren anakart ışığı.'),
        ('Thermal Throttling', 'Isıl kısma', 'Aşırı ısınan işlemcinin kendini korumak için saat hızını düşürmesi.'),
        ('S.M.A.R.T.', 'Kendini izleme ve raporlama', 'Diskin kendi sağlık sayaçlarını tutup raporladığı sistem.'),
        ('Preventive Maintenance', 'Önleyici bakım', 'Arıza çıkmadan yapılan düzenli temizlik ve kontroller.'),
        ('Backup (3-2-1)', 'Yedekleme', '3 kopya, 2 farklı ortam, 1 kopya başka bir yerde.'),
        ('Encryption', 'Şifreleme', 'Veriyi yalnız doğru anahtarla okunabilir hâle getirme.'),
        ('Secure Erase', 'Güvenli silme', 'Diskteki verinin geri getirilemeyecek biçimde yok edilmesi.'),
        ('E-waste (WEEE)', 'E-atık (AEEE)', 'Atık elektrikli ve elektronik eşya; ayrı toplanır, geri kazanılır.'),
    ]},

    {'tur': 'adim', 'no': 1, 'ad': 'Sorun Giderme Yöntemi', 'etiket': 'ADIM 1 · YÖNTEM',
     'ikon': '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>',
     'title': 'Tahmin Değil, Yöntem',
     'desc': 'Sistematik sorun giderme bir döngüdür: <strong>belirtiyi topla</strong> (ne, ne zaman, ne değişti?), <strong>olası nedenleri sırala</strong>, <strong>en kolay ve ucuz testten başla</strong>, her seferinde <strong>tek değişkeni değiştir</strong>, sonucu <strong>doğrula</strong> ve <strong>belgele</strong>. Test hipotezi çürütürse listedeki sıradaki nedene geçilir. Veriye dokunacak bir işlemden önce yedek alınır.',
     'tip': ['🔁', 'Döngü örnek bir vakayla kendiliğinden ilerler. Bir aşamaya dokunarak ayrıntısını oku.'],
     'genis': True,
     'gorsel': {'2d': 'yontem'}},

    {'tur': 'adim', 'no': 2, 'ad': 'Açılmıyor / Görüntü Yok', 'etiket': 'ADIM 2 · AÇILMA',
     'ikon': '<path d="M12 3v8"/><path d="M6.3 7.3a8 8 0 1 0 11.4 0"/>',
     'title': 'İlk Soru: Güç Geliyor mu?',
     'desc': 'Teşhis iki dala ayrılır. <strong>Hiç tepki yoksa</strong> güç yolu izlenir: priz, güç kablosu, güç kaynağının arka anahtarı, ön panel düğme kablosu, 24-pin ve EPS konnektörleri. <strong>Fanlar dönüyor ama görüntü yoksa</strong> önce anakarttaki <strong>hata ışığına</strong> bakılır, sonra monitörün girişi ve kablonun takılı olduğu çıkış denetlenir. Ekran kartı takılıyken kablo çoğunlukla ekran kartına bağlanır.',
     'tip': ['▶', 'Gözlemini seç: sistemin durumu seçtiğin test sonucuna göre değişir. Dalın sonunda onar ve açılışı izle.'],
     'genis': True,
     'gorsel': {'2d': 'aciliyor', 'koyu': True}},

    {'tur': 'adim', 'no': 3, 'ad': 'Isınma ve Yavaşlama', 'etiket': 'ADIM 3 · ISI VE HIZ',
     'ikon': '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/><path d="M12 11v6"/>',
     'title': 'Isınan İşlemci Yavaşlar, Sonra Kapanır',
     'desc': 'Isınan işlemci önce <strong>ısıl kısma</strong> ile saat hızını düşürür; bilgisayar yavaşlar. Soğuyamazsa kendini korumak için <strong>aniden kapanır</strong>. Nedeni çoğunlukla toz, duran fan ya da kurumuş termal macundur. Yavaşlamanın bir başka nedeni arızalanmaya başlayan disktir: <strong>SMART</strong> sayaçlarında yeniden atanmış ya da bekleyen sektörler artıyorsa önce <strong>yedek</strong> alınır.',
     'tip': ['🌡', 'Bir vaka seç ve testleri uygula: grafik ve tablo, test sonucuna göre değişir.'],
     'genis': True,
     'gorsel': {'2d': 'isi'}},

    {'tur': 'adim', 'no': 4, 'ad': 'Önleyici Bakım', 'etiket': 'ADIM 4 · BAKIM',
     'ikon': '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.8"/><path d="M12 10V5M13.7 13l4.3 2.5M10.3 13L6 15.5"/>',
     'title': 'Toz, Fan ve Basınçlı Hava',
     'desc': 'Toz, fan kanatlarını ve soğutucunun kanatçıklarını kaplar; hava akışı azalır, sıcaklık yükselir. Bakım <strong>kapalı ve fişi çekili</strong> bilgisayarda yapılır. Basınçlı hava kutusu <strong>dik</strong> tutulur, <strong>kısa püskürtmeler</strong> yapılır. Püskürtme sırasında <strong>fan sabitlenir</strong>: serbest dönen fan aşırı hızlanıp yatağına zarar verebilir. Güç kaynağının yalnız dış ızgarası temizlenir; içi asla açılmaz.',
     'tip': ['▶', 'Önce tahmin et: fan sabitlenmezse ne olur? Sonra provayı izle; sahneyi döndürebilirsin.'],
     'genis': True,
     'gorsel': {'3d': 's8-3d', 'aria': 'Yan kapağı açık kasa: toz birikince fan yavaşlar ve sıcaklık artar; fiş çekilir, fan plastik çubukla sabitlenir, dik tutulan basınçlı hava kutusuyla kısa püskürtmeler yapılır',
                'yedek': 'yedek-bakim.svg', 'yedek_metin': 'Fiş çekili, fan sabit, basınçlı hava dik ve kısa püskürtmelerle.', 'ust': FOTO_TOZ}},

    {'tur': 'adim', 'no': 5, 'ad': 'Güvenli Veri Silme', 'etiket': 'ADIM 5 · VERİ',
     'ikon': '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8"/><path d="M9 16l6 0"/>',
     'title': 'Sildim Sanma: Veri Hâlâ Orada Olabilir',
     'desc': 'Dosyayı silmek ya da <strong>hızlı biçimlendirmek</strong> yalnız dosyanın adresini kaldırır; veri blokları kurtarma araçlarıyla okunabilir. Cihaz elden çıkmadan önce veri <strong>3-2-1</strong> kuralıyla yedeklenir: 3 kopya, 2 farklı ortam, 1 kopya başka yerde. HDD’de tüm diskin <strong>üzerine yazılır</strong>. SSD’de <strong>güvenli silme</strong> komutu kullanılır; disk baştan <strong>şifreliyse</strong> anahtarın yok edilmesi veriyi okunamaz yapar.',
     'tip': ['🗂', 'Önce yedek al, sonra disk türünü seçip silme yöntemlerini dene: kurtarma aracı neyi bulabiliyor?'],
     'genis': True,
     'gorsel': {'2d': 'silme'}},

    {'tur': 'adim', 'no': 6, 'ad': 'E-Atık', 'etiket': 'ADIM 6 · E-ATIK',
     'ikon': '<path d="M7 19H4.8a2 2 0 0 1-1.7-3L6 11"/><path d="M11 19h8.2a2 2 0 0 0 1.7-3l-1.2-2"/><path d="M14 16l-3 3 3 3"/><path d="M8.3 5.5l1-1.7a2 2 0 0 1 3.4 0L16 9"/><path d="M13 9h3V6"/>',
     'title': 'Eski Bilgisayarın Yolculuğu',
     'desc': 'Çalışan cihaz, verisi güvenle silindikten sonra <strong>yeniden kullanılır</strong> ya da bağışlanır. Çalışmayan cihaz çöpe atılmaz: belediyenin e-atık noktasına ya da satıcının geri alım noktasına bırakılır, oradan <strong>lisanslı</strong> geri kazanım tesisine gider. Kartlardaki altın, bakır ve alüminyum geri kazanılır; kurşun ve cıva gibi zararlı maddeler ayrıştırılır. <strong>Piller ayrı</strong> toplanır.',
     'tip': ['♻', 'Cihazın durumunu seç ve yolculuğunu izle. Yanlış yolu görmek için “Çöpe atılırsa” düğmesine dokun.'],
     'genis': True,
     'gorsel': {'2d': 'eatik'}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Teşhis Simülatörü',
     'title': 'Beş Arıza, Tek Yöntem',
     'desc': 'Her vakada belirtiyi oku ve önce <strong>en olası nedeni</strong> işaretle. Sonra testleri seç: her testin bir <strong>süresi</strong> ve <strong>maliyeti</strong> var; sonuçlar olası nedenleri eler. Emin olunca onarımı uygula. <strong>Gereksiz parça değişimi</strong> puan düşürür.',
     'tip': ['💡', 'En kolay ve ucuz testten başla. Parça değiştirmek son çaredir.'],
     'ek': '<ul class="gorevler ts-gorevler" id="ts-gorevler">'
           '<li><span class="g-isaret"></span><span>1 · Hiç tepki yok</span></li>'
           '<li><span class="g-isaret"></span><span>2 · Fan dönüyor, görüntü yok</span></li>'
           '<li><span class="g-isaret"></span><span>3 · Yükte kendiliğinden kapanma</span></li>'
           '<li><span class="g-isaret"></span><span>4 · Önyüklenebilir aygıt yok</span></li>'
           '<li><span class="g-isaret"></span><span>5 · Yavaşlama ve disk uyarısı</span></li></ul>'
           '<div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Çözülen vaka</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 5</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'teshis'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Gerçek Sistemde',
     'title': 'Bakım ve Yedek Kartı',
     'desc': 'Grubunun bilgisayarında, öğretmeninin gözetiminde bakım kontrolünü yap ve kartı doldur. Kasayı açmadan önce bilgisayarı kapat ve fişini çek.',
     'tip': ['⚠', 'Güç kaynağını açma. Basınçlı hava yalnız öğretmen izin verince, fan sabitken ve kısa püskürtmelerle kullanılır.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Doldurulan satır</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 7</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'bakim-kart', 'ic': '<div class="bk"><div class="bk-ust"><div class="bk-not"><b>Önce güvenlik</b><span>Kapat, fişi çek, güç düğmesine birkaç saniye bas. Antistatik bilekliği tak. Kabloları zorlayarak çekme.</span></div>'
                '<div class="bk-tarih" aria-label="Kayıt tarihi"></div></div>'
                '<div class="bk-satirlar"></div><div class="bk-sonuc" aria-live="polite"></div></div>'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'Yöntem', 'Belirti → hipotez → en ucuz test → tek değişken → doğrula → belgele.'),
        ('oz-2.svg', 'Açılmıyor / Görüntü Yok', 'Güç yolu mu, POST mu? Hata ışığı ve monitör çıkışı.'),
        ('oz-3.svg', 'Isınma ve Disk Sağlığı', 'Isıl kısma yavaşlatır, aşırı ısı kapatır; SMART uyarısında önce yedek.'),
        ('oz-4.svg', 'Önleyici Bakım', 'Fiş çekili, fan sabit, kutu dik, kısa püskürtme; güç kaynağı açılmaz.'),
        ('oz-5.svg', 'Yedek ve Güvenli Silme', '3-2-1 yedek; HDD’de üzerine yaz, SSD’de güvenli silme ya da anahtarı yok et.'),
        ('oz-6.svg', 'E-Atık', 'Yeniden kullan ya da lisanslı toplama; pil ayrı, çöpe asla.'),
    ]},
]
