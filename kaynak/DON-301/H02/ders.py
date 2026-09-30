# DON-301 H02 — İşlemci (Format K, lise)
MODELLER = ['M-CPU']

DERS = {
    'grade': 'lise',
    'hafta': '2. Hafta',
    'baslik': 'İşlemci',
    'aciklama': 'Çekirdeğin içine gir: ALU, kontrol birimi ve yazmaçlarla getir–çöz–yürüt döngüsünü adım adım izle; saat hızı, çekirdek, iş parçacığı, önbellek ve x86-64 ile ARM farkını teknik olarak yorumla.',
    'hedefler': [
        'ALU, kontrol birimi ve yazmaçların (PC, IR, MAR, MDR, ACC) görevlerini açıklayabileceğim.',
        'Getir–çöz–yürüt döngüsünün adımlarını sırasıyla anlatabileceğim.',
        'Çekirdek, iş parçacığı ve önbelleğin performansa etkisini açıklayabileceğim.',
        'x86-64 ile ARM mimarilerini komut yapısı ve kullanım alanıyla karşılaştırabileceğim.',
    ],
    'hedef_simgeler': [
        '<rect x="3" y="3" width="18" height="6" rx="1.5"/><rect x="3" y="11" width="8" height="4" rx="1"/><rect x="13" y="11" width="8" height="4" rx="1"/><path d="M6 17h12l-3 4H9z"/>',
        '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><polyline points="20 3 20 8 15 8"/><path d="M12 8v4l3 2"/>',
        '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="15" width="18" height="6" rx="1.5"/>',
        '<path d="M4 7h4M10 7h2M14 7h6"/><path d="M4 12h4M10 12h4M16 12h4"/><path d="M4 17h16"/>',
    ],
    'bolumler': [
        ['Çekirdeğin İçi', 'ALU, kontrol birimi, yazmaçlar; getir–çöz–yürüt'],
        ['Performans', 'IPC × saat hızı, çekirdek, iş parçacığı, önbellek'],
        ['Mimariler', 'x86-64 (CISC) ve ARM (RISC)'],
    ],
    'quiz': [
        {'q': 'IR’deki komutun işlem kodunu çözüp ALU’ya, yazmaçlara ve belleğe ne yapacaklarını sinyallerle bildiren birim hangisidir?',
         'opts': ['Kontrol birimi', 'ALU', 'L1 önbellek', 'Program sayacı (PC)'], 'correct': 0,
         'fb': 'Kontrol birimi komutu çözer ve diğer birimleri yönetir; ALU yalnızca hesaplar, PC ise yalnızca sıradaki komutun adresini tutar.'},
        {'q': 'Görselde 01 adresindeki komut yeni getirildi; IR’de ADD 0B var. PC neden 02 gösteriyor?<span class="q-gorsel"><!--@dahil:svg-quiz-pc.svg--></span>',
         'opts': ['ADD komutu 02 adresinde durduğu için', 'PC, ALU’nun son toplama sonucunu tuttuğu için',
                  'PC getirme sırasında arttı; artık sıradaki komutun adresini gösteriyor', 'Komut çözülünce PC’ye işlenenin adresi yazıldığı için'], 'correct': 2,
         'fb': 'GETİR evresinde komut IR’ye alınırken PC bir artırılır. Böylece PC her zaman sıradaki komutu gösterir; yalnız atlama komutları onu başka bir adrese götürür.'},
        {'q': 'Deniz’in video dönüştürme programı işi 8 iş parçacığına bölüyor; sık oynadığı eski bir oyun ise çoğunlukla tek iş parçacığıyla çalışıyor. Aynı nesil 4 çekirdekli işlemciden 8 çekirdekliye geçerse ne beklenir?',
         'opts': ['İkisi de yaklaşık iki kat hızlanır', 'Video dönüştürme belirgin hızlanır; oyun çekirdek sayısından pek yararlanmaz',
                  'Oyun iki kat hızlanır, video dönüştürme değişmez', 'Hiçbiri değişmez; yalnız saat hızı önemlidir'], 'correct': 1,
         'fb': 'Ek çekirdekler yalnız işi paralel iş parçacıklarına bölebilen programlara yarar. Tek iş parçacıklı bir işte belirleyici olan çekirdek başına performanstır (IPC × saat hızı).'},
        {'q': 'Ece, masaüstü bilgisayarı için x86-64’e göre derlenmiş bir programı ARM işlemcili bir cihazda açmak istiyor. Ne olur?',
         'opts': ['Aynen çalışır; bütün işlemciler aynı komutları anlar', 'ARM daha az enerji harcadığı için program daha hızlı çalışır',
                  'Saat hızları eşitse program doğrudan çalışır', 'Komut kümeleri farklı olduğundan doğrudan çalışmaz; ARM için derlenmiş sürüm ya da bir çeviri katmanı gerekir'], 'correct': 3,
         'fb': 'Program, işlemcinin komut kümesine (ISA) göre makine koduna çevrilir. x86-64 makine kodunu ARM çekirdeği tanımaz; yeniden derleme ya da çeviri (öykünme) yazılımı gerekir.'},
    ],
    'bitis': 'İşlemcinin içini, getir–çöz–yürüt döngüsünü ve performansı belirleyen etkenleri artık teknik olarak açıklayabiliyorsun!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'Masaüstü işlemci: metal kapak yukarı kaldırılmış, altında çekirdekleri ve önbelleği olan çip görünüyor', 'yedek': 'yedek-kapak.svg'}

SLAYTLAR = [
    {'tur': 'isinma',
     'title': '4,2 GHz mi, 3,6 GHz mi?',
     'desc': 'Deniz iki bilgisayar arasında kararsız: A’nın işlemcisi 4,2 GHz, B’ninki 3,6 GHz. İkisi de aynı video dönüştürme işini yapacak. Sence hangisi önce bitirir?',
     'secenekler': ['A: saat hızı yüksek olan her zaman daha hızlıdır.', 'B: düşük saat hızı daha az ısınır, bu yüzden hep önce biter.',
                    'Yalnız GHz’e bakarak söylenemez; her döngüde kaç komut bitirdiği de önemli.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'terim', 'terimler': [
        ('ALU', 'Aritmetik Mantık Birimi', 'Toplama, çıkarma, karşılaştırma ve mantık işlemlerini yapar.'),
        ('Control Unit', 'Kontrol Birimi', 'Komutu çözer; diğer birimlere ne yapacaklarını bildirir.'),
        ('Register (PC, IR, ACC)', 'Yazmaç', 'Çekirdeğin içindeki en hızlı, küçük bellek hücresi.'),
        ('MAR / MDR', 'Bellek Adres / Veri Yazmacı', 'Belleğe gidecek adresi ve taşınan veriyi tutar.'),
        ('Fetch–Decode–Execute', 'Getir–Çöz–Yürüt', 'Her komut için tekrarlanan işlemci döngüsü.'),
        ('Clock Speed (GHz)', 'Saat Hızı', 'Saniyedeki döngü sayısı: 1 GHz = 10⁹ döngü/sn.'),
        ('IPC', 'Döngü Başına Komut', 'Bir saat döngüsünde ortalama tamamlanan komut sayısı.'),
        ('Core / Thread (SMT)', 'Çekirdek / İş Parçacığı', 'Bağımsız işlem birimi / çekirdekte yürüyen komut akışı.'),
        ('Cache Hit / Miss', 'Önbellek İsabeti / Iskası', 'Veri önbellekte bulundu / bulunamadı, RAM’e gidildi.'),
        ('ISA (x86-64, ARM)', 'Komut Kümesi Mimarisi', 'İşlemcinin anladığı makine komutlarının tanımı.'),
    ]},

    {'tur': 'adim', 'no': 1, 'ad': 'ALU, Kontrol Birimi, Yazmaçlar', 'etiket': 'ADIM 1 · ÇEKİRDEĞİN İÇİ',
     'ikon': '<rect x="3" y="3" width="18" height="6" rx="1.5"/><rect x="3" y="11" width="8" height="4" rx="1"/><rect x="13" y="11" width="8" height="4" rx="1"/><path d="M6 17h12l-3 4H9z"/>',
     'title': 'Üç Birim, Tek Ekip',
     'desc': 'Geçen hafta CPU’yu tek blok olarak gördün; şimdi içine giriyoruz. <strong>Kontrol birimi</strong> komutu çözer ve diğer birimlere sinyallerle ne yapacaklarını bildirir. <strong>ALU</strong> (aritmetik mantık birimi) toplama, çıkarma ve karşılaştırma yapar. <strong>Yazmaçlar</strong> çekirdeğin içindeki en hızlı küçük hücrelerdir: PC, IR, MAR, MDR, ACC ve durum bayrakları.',
     'tip': ['🔍', 'Bir birime ya da yazmaca dokun: görevini ve getir–çöz–yürüt döngüsündeki rolünü gör.'],
     'genis': True,
     'gorsel': {'2d': 'cekirdek-ici', 'koyu': True}},

    {'tur': 'adim', 'no': 2, 'ad': 'Getir–Çöz–Yürüt', 'etiket': 'ADIM 2 · DÖNGÜ',
     'ikon': '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><polyline points="20 3 20 8 15 8"/><path d="M12 8v4l3 2"/>',
     'title': 'Her Komutta Aynı Üç Evre',
     'desc': '<strong>Getir:</strong> PC’deki adres MAR’a gider; komut bellekten MDR’ye, oradan IR’ye gelir ve PC bir artar. <strong>Çöz:</strong> kontrol birimi IR’deki işlem kodunu ve adresi ayırır. <strong>Yürüt:</strong> gereken veri okunur, ALU hesaplar ya da sonuç belleğe yazılır. Sonra döngü sıradaki komutla yeniden başlar.',
     'tip': ['▶', 'Önce tahmin et: program bitince 0C hücresinde hangi sayı olacak? Sonra Adım ile tek tek ilerle.'],
     'genis': True,
     'gorsel': {'2d': 'boru', 'koyu': True}},

    {'tur': 'adim', 'no': 3, 'ad': 'Saat Hızı Tek Ölçüt Değil', 'etiket': 'ADIM 3 · IPC × GHz',
     'ikon': '<path d="M3 15h3V9h3v6h3V9h3v6h3V9h3"/><path d="M3 20h18"/>',
     'title': 'Döngü Sayısı × Döngüdeki İş',
     'desc': '<strong>Saat hızı</strong> (GHz) saniyedeki döngü sayısıdır: 4 GHz, saniyede 4 milyar döngü demektir. Bir çekirdeğin bir döngüde ortalama kaç komut bitirdiği ise <strong>IPC</strong>’dir. Kabaca: <code>saniyedeki komut ≈ IPC × saat hızı</code>. Yeni tasarımlar aynı saat hızında daha çok komut bitirebilir; IPC çalışan programa göre de değişir.',
     'tip': ['⏱', 'Sürgülerle iki işlemciyi ayarla, sonra Yarıştır’a bas. Isınmadaki tahminini burada sına.'],
     'genis': True,
     'gorsel': {'2d': 'saat'}},

    {'tur': 'adim', 'no': 4, 'ad': 'Çekirdek ve İş Parçacığı', 'etiket': 'ADIM 4 · ÇEKİRDEK',
     'ikon': '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
     'title': 'Bir Çipte Birden Çok Çekirdek',
     'desc': 'Metal kapağın altındaki çipte birden çok <strong>çekirdek</strong> bulunur; her biri kendi kontrol birimi, ALU’ları, yazmaçları ve L1/L2 önbelleği olan ayrı bir işlem birimidir. Program işini <strong>iş parçacıklarına</strong> bölebiliyorsa çekirdekler aynı anda çalışır. <strong>SMT</strong> ile bir çekirdek iki iş parçacığını birlikte yürütür ve boşta kalan birimleri doldurur; ama ikinci bir çekirdek kadar hız katmaz.',
     'tip': ['🔬', 'Kapağı kaldır; sonra Çekirdekler ve SMT görünümlerini karşılaştır.'],
     'gorsel': {'3d': 's8-3d', 'aria': 'İşlemcinin metal kapağı kaldırılıyor; altındaki çipte dört çekirdek, paylaşılan L3 önbellek, bellek denetleyicisi, grafik ve G/Ç birimleri şematik olarak görünüyor',
                'yedek': 'yedek-cip.svg', 'yedek_metin': 'Çipin şematik yerleşimi: dört çekirdek ve paylaşılan L3 önbellek.'}},

    {'tur': 'adim', 'no': 5, 'ad': 'Önbellek (L1/L2/L3)', 'etiket': 'ADIM 5 · ÖNBELLEK',
     'ikon': '<rect x="3" y="6" width="5" height="12" rx="1"/><rect x="10" y="7" width="4" height="10" rx="1"/><rect x="16" y="4" width="5" height="16" rx="1"/>',
     'title': 'İsabet mi, Iska mı?',
     'desc': '<strong>Önbellek</strong>, RAM’deki verilerin kopyalarını çekirdeğe yakın tutar. L1 en küçük ve en hızlısıdır; L2 genellikle çekirdek başınadır; L3 en büyüğüdür ve çekirdekler arasında paylaşılır. Aranan veri önbellekte varsa <strong>isabet</strong> (hit), yoksa <strong>ıska</strong> (miss) olur; ıskada veri RAM’den getirilir ve kopyası önbelleğe yazılır.',
     'tip': ['🏁', 'Tahmin et: ıskada veri, L1 isabetine göre kaç kat geç gelir? Sonra yarışı başlat.'],
     'genis': True,
     'gorsel': {'2d': 'onbellek', 'koyu': True}},

    {'tur': 'adim', 'no': 6, 'ad': 'x86-64 ve ARM', 'etiket': 'ADIM 6 · MİMARİLER',
     'ikon': '<path d="M4 7h4M10 7h2M14 7h6"/><path d="M4 12h4M10 12h4M16 12h4"/><path d="M4 17h16"/>',
     'title': 'Aynı İş, İki Komut Kümesi',
     'desc': 'İşlemcinin anladığı makine komutlarının tanımına <strong>komut kümesi mimarisi</strong> (ISA) denir. <strong>x86-64</strong> CISC geleneğinden gelir: komut uzunluğu değişkendir ve bir komut belleği doğrudan kullanabilir. 64 bitlik <strong>ARM</strong> (AArch64) RISC yaklaşımını izler: komutlar sabit 4 bayttır, belleğe yalnız yükle/sakla komutlarıyla erişilir. Bir mimari için derlenen program diğerinde doğrudan çalışmaz.',
     'tip': ['⚖', 'Aynı işi iki mimaride oynat; sonra özellikleri ve kullanım alanlarını karşılaştır.'],
     'genis': True,
     'gorsel': {'2d': 'mimari'}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Getir–Çöz–Yürüt Simülatörü',
     'title': 'Programı Adım Adım Çalıştır',
     'desc': 'Dört görevde küçük programlar çalıştıracaksın. Her görevde önce sonucu tahmin et ya da programı değiştir, sonra döngüyü <strong>Evre</strong> düğmesiyle tek tek ilerlet ve yazmaçları izle.',
     'tip': ['💡', 'PC, GETİR evresinde artar. SUB sonucu 0 olursa Z = 1 olur; JNZ yalnız Z = 0 iken atlar.'],
     'ek': '<ul class="gorevler sm-gorevler" id="sm-gorevler">'
           '<li><span class="g-isaret"></span><span>Toplamı tahmin et, çalıştır</span></li>'
           '<li><span class="g-isaret"></span><span>Veriyi değiştir: sonuç 20 olsun</span></li>'
           '<li><span class="g-isaret"></span><span>ADD’i SUB yap, sonucu tahmin et</span></li>'
           '<li><span class="g-isaret"></span><span>Döngü: SUB kaç kez yürütülür?</span></li></ul>'
           '<div class="etk-ilerleme" id="ilerleme-1" aria-live="polite"><div class="etk-ilerleme-ust"><span>Tamamlanan görev</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 4</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'simulator'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Performans Kararları',
     'title': 'Hangi Etken Belirleyici?',
     'desc': 'Her senaryoda bir bilgisayarın ya da programın durumu verilir. Üç seçenekten en uygun açıklamayı seç ve gerekçeyi oku.',
     'tip': ['🔍', 'Önce işin türüne bak: tek iş parçacıklı mı, paralel mi? Veri önbelleğe sığıyor mu? Program hangi mimari için derlenmiş?'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Senaryo</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 5</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'kararlar'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'Çekirdeğin İçi', 'Kontrol birimi çözer, ALU hesaplar, yazmaçlar tutar.'),
        ('oz-2.svg', 'Getir–Çöz–Yürüt', 'MAR ← PC, IR ← komut, PC + 1; çöz; yürüt.'),
        ('oz-3.svg', 'IPC × GHz', 'Saniyedeki komut ≈ IPC × saat hızı.'),
        ('oz-4.svg', 'Çekirdek / SMT', 'Paralel iş çekirdeklere dağılır; SMT boşlukları doldurur.'),
        ('oz-5.svg', 'Önbellek', 'İsabet ≈ 1 ns, RAM’e ıska ≈ 80 ns.'),
        ('oz-6.svg', 'x86-64 / ARM', 'Değişken uzunluk ve bellek işlenenli / sabit 4 B, yükle–sakla.'),
    ]},
]
