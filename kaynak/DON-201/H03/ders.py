# DON-201 H03 — Bağlantı Noktaları ve Çevre Birimleri (Format K)
MODELLER = ['M-ARKA-PANEL', 'M-KABLO-UCLARI', 'M-DIZUSTU', 'M-KLAVYE', 'M-MONITOR']

DERS = {
    'hafta': '3. Hafta',
    'baslik': 'Bağlantı Noktaları ve Çevre Birimleri',
    'aciklama': 'Arka paneldeki portları tanı, USB’yi doğru yönde tak, kabloları doğru portlarla eşleştir.',
    'hedefler': [
        'Portun ne olduğunu kendi cümlelerimle açıklayabileceğim.',
        'USB, HDMI, ses ve ağ portlarını görünüşlerinden tanıyabileceğim.',
        'Kablolu ve kablosuz (Wi-Fi, Bluetooth) bağlantıyı karşılaştırabileceğim.',
        'Bir cihaz için doğru kabloyu doğru porta takabileceğim.',
    ],
    'hedef_simgeler': [
        '<rect x="3" y="6" width="18" height="12" rx="2"/><rect x="7" y="10" width="4" height="4"/><rect x="13" y="10" width="4" height="4"/>',
        '<rect x="5" y="8" width="14" height="8" rx="1.5"/><path d="M8 11h8"/>',
        '<path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/>',
        '<path d="M4 12h6"/><rect x="10" y="9" width="5" height="6" rx="1"/><path d="M15 12h5"/>',
    ],
    'bolumler': [
        ['Portlar', 'Port nedir, USB'],
        ['Görüntü, Ses, Ağ', 'HDMI, ses jakları, ağ ve kablosuz'],
        ['Doğru Eşleştirme', 'Kabloyu doğru porta tak'],
    ],
    'quiz': [
        {'q': 'Port nedir?',
         'opts': ['Kablonun takıldığı bağlantı yuvası', 'Bilgisayarın içindeki bir program', 'Ekrandaki bir simge', 'Kasanın açma düğmesi'], 'correct': 0,
         'fb': 'Port, bir cihazın kablosunun takıldığı bağlantı yuvasıdır.'},
        {'q': 'Görselde gösterilen port hangisidir?<span class="q-gorsel"><!--@dahil:svg-quiz-hdmi.svg--></span>',
         'opts': ['USB-A', 'Ağ portu (RJ45)', 'HDMI', 'Ses jakı'], 'correct': 2,
         'fb': 'Alt köşeleri eğik, geniş ve ince port HDMI’dır. Görüntü ve sesi taşır.'},
        {'q': 'Elif kablosuz kulaklığını telefonuna bağlamak istiyor. Hangi bağlantıyı kullanmalı?',
         'opts': ['Ağ kablosu', 'Bluetooth', 'HDMI kablosu', 'Ses jakının pembe girişi'], 'correct': 1,
         'fb': 'Kulaklık gibi yakındaki cihazlar kablosuz olarak Bluetooth ile bağlanır.'},
        {'q': 'Selim monitörü bilgisayara bağlayacak. Elinde USB, ağ ve HDMI kabloları var. Ne yapmalı?',
         'opts': ['USB kablosunu ses girişine takmalı', 'Ağ kablosunu HDMI portuna takmalı', 'USB kablosunu HDMI portuna zorlamalı', 'HDMI kablosunu HDMI portuna takmalı'], 'correct': 3,
         'fb': 'Monitörün görüntü kablosu HDMI’dır ve yalnız HDMI portuna uyar. Kablo zorlanmaz.'},
        {'q': 'Derinleş (bonus): İki USB-C kablosu tıpatıp aynı görünüyor. Hangisi doğrudur?',
         'opts': ['Hızları farklı olabilir', 'Hepsi aynı hızda veri taşır', 'USB-C yalnız şarj içindir', 'USB-C yalnız bir yönde takılır'], 'correct': 0,
         'fb': 'Uç aynı olsa da kablonun ve portun desteklediği hız farklı olabilir. Bu soru puanını düşürmez.'},
    ],
    'bitis': 'Artık portları tanıyor, her kabloyu doğru porta takabiliyorsun!',
}

KAPAK = {'3d': 'kapak-3d', 'aria': 'Bilgisayarın arka paneli; kablolar portlarına takılı', 'yedek': 'yedek-panel.svg'}

FOTO_PANEL = '<div class="foto-kart"><!--@foto:DON-201-H03-arka-panel.jpg|Gerçek bir masaüstü bilgisayarın arka paneli--><span>Gerçekte</span></div>'
FOTO_DIZUSTU = '<div class="foto-kart"><!--@foto:DON-201-H03-dizustu-portlar.jpg|Dizüstü bilgisayarın yan portları--><span>Gerçekte</span></div>'

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Arkada Neden Bu Kadar Delik Var?',
     'desc': 'Bir bilgisayarın arkasına bak: irili ufaklı birçok yuva var. Sence neden hepsi farklı?',
     'secenekler': ['Süs için; hepsi aynı işi yapar.', 'Her biri farklı bir cihaz ve kablo için.', 'Hangi kabloyu nereye taksan çalışır.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'adim', 'no': 1, 'ad': 'Port Nedir?', 'etiket': 'ADIM 1 · PORT',
     'ikon': '<rect x="3" y="6" width="18" height="12" rx="2"/><rect x="7" y="10" width="4" height="4"/><rect x="13" y="10" width="4" height="4"/>',
     'title': 'Kabloların Kapısı: Port',
     'desc': '<strong>Port</strong>, kablonun takıldığı yuvadır. Bilgisayar klavye, monitör ve internetle portlar sayesinde bağlanır. Her portun şekli farklıdır.',
     'tip': ['👆', 'Bir porta dokun: adını ve görevini gör.'],
     'gorsel': {'3d': 's4-3d', 'aria': 'Arka panel: portlara dokununca adı ve görevi görünür', 'yedek': 'yedek-panel.svg', 'ust': FOTO_PANEL}},

    {'tur': 'adim', 'no': 2, 'ad': 'USB (Type-A, Type-C)', 'etiket': 'ADIM 2 · USB',
     'ikon': '<path d="M12 3v14"/><path d="M8 7l4-4 4 4"/><path d="M7 12h2v3"/><path d="M17 10v3h-2"/><circle cx="12" cy="19" r="2"/>',
     'title': 'USB: Tek Yön mü, İki Yön mü?',
     'desc': '<strong>USB</strong> en çok kullanılan porttur: klavye, fare, USB bellek takılır. <strong>USB-A</strong> tek yönde girer. <strong>USB-C</strong> iki yönde de girer.',
     'tip': ['🔄', 'Düğmelere bas: ters tutulan uca ne oluyor?'],
     'gorsel': {'3d': 's5-3d', 'aria': 'USB-A ucu ters tutulunca girmiyor, çevrilince giriyor; USB-C iki yönde de giriyor', 'yedek': 'yedek-usb.svg'}},

    {'tur': 'adim', 'no': 3, 'ad': 'Görüntü: HDMI', 'etiket': 'ADIM 3 · HDMI',
     'ikon': '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
     'title': 'Görüntü ve Ses Tek Kabloda',
     'desc': '<strong>HDMI</strong> portu monitöre ya da televizyona görüntü ve sesi birlikte taşır. Alt köşeleri eğiktir. Yanındaki <strong>DisplayPort</strong> da görüntü taşır.',
     'tip': ['🔍', 'Kamera HDMI portuna gider; kablo ucu yerine oturur.'],
     'gorsel': {'3d': 's6-3d', 'aria': 'Kamera arka paneldeki HDMI portuna yaklaşıyor, HDMI kablosu takılıyor', 'yedek': 'yedek-panel.svg'}},

    {'tur': 'adim', 'no': 4, 'ad': 'Ses Giriş–Çıkışı', 'etiket': 'ADIM 4 · SES',
     'ikon': '<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="3" y="14" width="4" height="7" rx="1.5"/><rect x="17" y="14" width="4" height="7" rx="1.5"/>',
     'title': 'Yuvarlak Ses Girişleri',
     'desc': 'Ses girişleri küçük ve yuvarlaktır. <strong>Yeşil · Çıkış</strong>: hoparlör ya da kulaklık. <strong>Pembe · Mik</strong>: mikrofon. <strong>Mavi · Giriş</strong>: başka cihazdan ses.',
     'tip': ['🏷️', 'Yalnız renge güvenme: yanındaki yazıyı da oku.'],
     'gorsel': {'3d': 's7-3d', 'aria': 'Ses girişleri: yeşil çıkış, pembe mikrofon, mavi hat girişi; kulaklık jakı yeşile takılıyor', 'yedek': 'yedek-panel.svg'}},

    {'tur': 'adim', 'no': 5, 'ad': 'Ağ Portu ve Kablosuz', 'etiket': 'ADIM 5 · AĞ VE KABLOSUZ',
     'ikon': '<path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/>',
     'title': 'Kablolu mu, Kablosuz mu?',
     'desc': '<strong>Ağ portu</strong> kabloyla internete bağlar; bağlantı sağlamdır. <strong>Wi-Fi</strong> interneti kablosuz getirir. <strong>Bluetooth</strong> yakındaki cihazları kablosuz bağlar.',
     'tip': ['📶', 'Üç bağlantıyı seç ve karşılaştır.'],
     'gorsel': {'2d': 'kablosuz'}},

    {'tur': 'adim', 'no': 6, 'ad': 'Doğru Kablo, Doğru Port', 'etiket': 'ADIM 6 · EŞLEŞTİR',
     'ikon': '<path d="M4 12h6"/><rect x="10" y="9" width="5" height="6" rx="1"/><path d="M15 12h5"/>',
     'title': 'Her Kablonun Bir Yeri Var',
     'desc': 'Dizüstü bilgisayarda da aynı portlar vardır, sayıları azdır. Kablo porta <strong>zorlanmaz</strong>. Şekli uyan kablo kolayca girer.',
     'tip': ['🔌', 'Bir cihaz seç: kablosunun takılacağı portu gör.'],
     'gorsel': {'3d': 's9-3d', 'aria': 'Dizüstü bilgisayar: seçilen cihazın kablosunun takılacağı yan port gösteriliyor', 'yedek': 'yedek-dizustu.svg', 'ust': FOTO_DIZUSTU}},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Kabloyu Doğru Porta Tak',
     'title': 'Kabloyu Doğru Porta Tak',
     'desc': 'Aşağıdan bir kablo ucu seç. Sonra arka panelde doğru porta dokun.',
     'tip': ['💡', 'Yanlış porta giderse uç sığmaz ve geri döner.'],
     'ek': '<div class="fis-tepsi" id="fis-tepsi" role="group" aria-label="Kablo uçları"></div><ol class="gorevler" id="gorevler">'
           '<li><span class="g-isaret"></span><span><strong>Monitörü</strong> bağla.</span></li>'
           '<li><span class="g-isaret"></span><span><strong>Klavyeyi</strong> bağla.</span></li>'
           '<li><span class="g-isaret"></span><span><strong>İnterneti</strong> kabloyla bağla.</span></li>'
           '<li><span class="g-isaret"></span><span><strong>Kulaklığı</strong> bağla.</span></li></ol>',
     'gorsel': {'3d': 's10-3d', 'aria': 'Etkinlik: seçilen kablo ucunu arka paneldeki doğru porta takma', 'yedek': 'yedek-panel.svg',
                'yedek_metin': 'Bu cihazda 3D açılmadı; gerçek bilgisayarın arkasında portları bul.'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Hangi Port?',
     'title': 'Cihazı Portuna Yerleştir',
     'desc': 'Her cihaz kartını kablosunun takıldığı porta sürükle ya da dokunup seç.',
     'tip': ['🧩', 'Kablosuz bağlanan cihaz da var: dikkatli bak.'],
     'ek': '<div class="etk-ilerleme" id="ilerleme-2" aria-live="polite"><div class="etk-ilerleme-ust"><span>Yerleşen kart</span>'
           '<span class="etk-ilerleme-sayi"><b>0</b> / 8</span></div><div class="etk-ilerleme-bar"><span></span></div></div>',
     'gorsel': {'panel': 'sinifla-port'}},

    {'tur': 'derinles', 'ad': 'USB-C Hep Aynı mı?',
     'title': 'Aynı Uç, Farklı Hız',
     'desc': 'USB-C uçları aynı görünür. Ama kablonun ve portun desteklediği <strong>hız</strong> farklı olabilir. Aynı film bir kabloda yarım dakikada, ötekinde birkaç saniyede kopyalanabilir.',
     'tip': ['🔎', 'Portun yanındaki küçük simgeler hızı anlatır.'],
     'gorsel': {'svg': 'derinles.svg'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'Port', 'Kablonun takıldığı yuva.'),
        ('oz-2.svg', 'USB', 'A tek yönde, C iki yönde girer.'),
        ('oz-3.svg', 'HDMI', 'Görüntü ve ses taşır.'),
        ('oz-4.svg', 'Ses', 'Yeşil çıkış, pembe mikrofon.'),
        ('oz-5.svg', 'Ağ ve Kablosuz', 'Kablo, Wi-Fi, Bluetooth.'),
        ('oz-6.svg', 'Eşleştir', 'Kablo porta zorlanmaz.'),
    ]},
]
