# DON-301 H14 — Proje: Sistem Önerisi ve Montaj Raporu (Format U, lise)
# E-UYUMLULUK H08’den yeniden kullanılır (ders.js ve ders.css’teki çekirdek bloklar H08 ile aynıdır). Fiyat yok: göreli "puan".
MODELLER = []


def ik(yol):
    return ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            yol + '</svg>')


IK_KISI = '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>'
IK_LISTE = '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h1M4 12h1M4 18h1"/>'
IK_TABLO = '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>'
IK_FOTO = '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>'
IK_RAPOR = '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>'
IK_SUNUM = '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8"/>'
IK_KALKAN = '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>'


def teslim(no, ikon, ad, ac):
    return ('<li class="pk-teslim"><span class="pk-no">' + str(no) + '</span><span class="pk-ikon">' + ik(ikon) + '</span><span><b>' + ad + '</b>' + ac + '</span></li>')


def rub(olcut, yeterli):
    return '<tr><th scope="row">' + olcut + '</th><td>' + yeterli + '</td></tr>'


PROJE = (
    '      <div class="layout-full pk-duzen">\n'
    '        <div class="pk-sol">\n'
    '          <div class="csub">Proje dosyasında teslim edilecekler:</div>\n'
    '          <ol class="pk-liste">' +
    teslim(1, IK_KISI, 'İhtiyaç analizi', 'İki farklı kullanıcı profili: iş, en az gereksinim, bütçe.') +
    teslim(2, IK_LISTE, 'Parça listesi', 'Her parça için teknik değer, puan ve tek cümle gerekçe.') +
    teslim(3, IK_TABLO, 'Uyumluluk tablosu', 'Tüm kurallar; sarı satırların açıklaması, güç hesabı.') +
    teslim(4, IK_FOTO, 'Montaj ve kurulum kanıtları', 'Tarih-saatli fotoğraf, UEFI ve sistem ekran görüntüleri.') +
    teslim(5, IK_RAPOR, 'Rapor', 'Önerileri ve kanıtları düzenli sunan belge.') +
    teslim(6, IK_SUNUM, 'Jüri sunumu', '5 dakika sunum, ardından sorular.') +
    '</ol>\n        </div>\n'
    '        <div class="pk-sag">\n'
    '          <div class="csub">Jüri neye bakacak? (Yeterli düzey)</div>\n'
    '          <table class="pk-rubrik"><tbody>' +
    rub('İhtiyaç', 'İki profilin gereksinimleri sayılarla yazılmış.') +
    rub('Parça seçimi', 'Her seçim profile ve teknik değere dayanıyor.') +
    rub('Uyumluluk', 'Kırmızı yok; sarılar gerekçeli; güç payı hesaplı.') +
    rub('Kanıt', 'Her montaj adımı tarihli fotoğrafla doğrulanmış.') +
    rub('Rapor', 'Bölümler eksiksiz, ölçü birimleri doğru.') +
    rub('Savunma', 'Sorulara sayı ve kanıtla cevap veriliyor.') +
    '</tbody></table>\n'
    '          <div class="pk-alt"><span class="pk-rol"><b>Roller:</b> proje yöneticisi · teknik sorumlu · belgeleyici · sunucu</span>'
    '<span class="pk-guv">' + ik(IK_KALKAN) + '<span>Kanıt için sistem açılacaksa: fiş çekili, ESD bilekliği takılı; öğretmen onayı olmadan güç verilmez.</span></span></div>\n'
    '        </div>\n      </div>')


def prova(pid):
    return {'html': '<div class="pv" id="' + pid + '"></div>'}


DERS = {
    'grade': 'lise',
    'hafta': '14. Hafta',
    'baslik': 'Proje: Sistem Önerisi ve Montaj Raporu',
    'aciklama': 'İki kullanıcı için bütçeye uygun sistem öner, uyumluluk tablosunu hazırla, montaj kanıtlarını belgele ve önerini jüriye savun.',
    'hedefler': [
        'İki farklı kullanım senaryosu için bütçeye uygun sistem önerebileceğim.',
        'Seçtiğim parçaların uyumluluk tablosunu gerekçeleriyle hazırlayabileceğim.',
        'Montaj ve kurulum kanıtlarını (fotoğraf, ekran görüntüsü, günlük) düzenli belgeleyebileceğim.',
        'Önerimi teknik gerekçelerle jüriye savunabileceğim.',
    ],
    'hedef_simgeler': [IK_KISI, IK_TABLO, IK_FOTO, IK_SUNUM],
    'bolumler': [
        ['Öneri', 'İhtiyaç analizi, parça listesi'],
        ['Kanıt', 'Uyumluluk tablosu, montaj ve kurulum'],
        ['Sunum', 'Rapor, jüri savunması'],
    ],
    'quiz': [
        {'q': 'Proje raporunda bir parçanın seçim gerekçesi en iyi nasıl yazılır?',
         'opts': ['Profilin gereksinimine ve teknik değere dayanarak (ör. “32 GB; tasarım profili en az 32 GB istiyor”)', 'Parçanın en yeni model olduğunu belirterek', 'Parçanın çok kişi tarafından beğenildiğini belirterek', 'Parçanın listedeki en yüksek puanlı seçenek olduğunu belirterek'], 'correct': 0,
         'fb': 'Gerekçe, kullanıcının ihtiyacını ve ölçülebilir teknik değeri birbirine bağlar; “yeni”, “popüler” ya da “pahalı” teknik gerekçe değildir.'},
        {'q': 'Görseldeki uyumluluk tablosuna göre hangi yorum doğrudur?<span class="q-gorsel"><!--@dahil:svg-quiz-tablo.svg--></span>',
         'opts': ['Sistem hazırdır; sarı ve kırmızı satırlar yalnız öneridir', 'Yalnız güç kaynağı değiştirilmelidir', 'Kırmızı satır için ekran kartı ya da kasa değişmeli; sarı satır raporda gerekçelendirilmeli', 'İşlemci ile anakart uyumsuzdur'], 'correct': 2,
         'fb': 'Kırmızı satır sistemin kurulamayacağını gösterir ve düzeltilmelidir. Sarı satır çalışır ama risklidir; ya düzeltilir ya da gerekçesi yazılır.'},
        {'q': 'Montaj ve kurulum kanıtı olarak hangisi en güçlüdür?',
         'opts': ['Grubun “sistemi kurduk” yazan notu', 'Tarih-saatli adım fotoğrafları + UEFI’de tanınan bellek ve disk + uyarısız Aygıt Yöneticisi ekran görüntüsü', 'Parça kutularının fotoğrafı', 'İnternette bulunan bir montaj videosunun bağlantısı'], 'correct': 1,
         'fb': 'Kanıt, iddiayı başkasının doğrulayabileceği biçimde gösterir: kendi montajının tarihli fotoğrafları ve sistemin parçaları tanıdığını gösteren ekranlar.'},
        {'q': 'Jüri üyesi Ece, Deniz’e “Neden 850 W değil de 650 W güç kaynağı seçtin?” diye sordu. En iyi savunma hangisidir?',
         'opts': ['“Daha ucuz olduğu için.”', '“650 W her sisteme yeter.”', '“Büyük güç kaynağı sistemi yavaşlatır.”', '“Tahmini tüketim 408 W; %30 payla 530 W gerekir. 650 W yeterli; fazlası bütçeyi ihtiyaç duyulan parçadan alırdı.”'], 'correct': 3,
         'fb': 'İyi savunma hesaba ve ihtiyaca dayanır: tüketim, pay ve bütçe dengesi birlikte söylenir.'},
    ],
    'bitis': 'Bir sistemi ihtiyaçtan kanıta kadar belgeleyip teknik gerekçelerle savunabiliyorsun!',
}

KAPAK = {'svg': 'kapak.svg'}

ILERLEME = ('<div class="etk-ilerleme" id="%s" aria-live="polite"><div class="etk-ilerleme-ust"><span>%s</span>'
            '<span class="etk-ilerleme-sayi"><b>0</b> / %d</span></div><div class="etk-ilerleme-bar"><span></span></div></div>')

SLAYTLAR = [
    {'tur': 'isinma',
     'title': 'Aynı Bütçe, Aynı Sistem mi?',
     'desc': 'Bir ofis çalışanı ve bir oyuncu, ikisi de <strong>600 puanlık</strong> bütçeyle bilgisayar istiyor. İkisine aynı sistemi önermek doğru olur mu?',
     'secenekler': ['Evet; iyi bir sistem herkese uyar.', 'Hayır; bütçe her kullanıcının önceliğine göre farklı parçalara dağıtılır.', 'Evet; oyuncuya yalnız daha çok bellek eklenir.'],
     'gorsel': {'svg': 'isinma.svg'}},

    {'tur': 'terim', 'terimler': [
        ('Requirements Analysis', 'İhtiyaç analizi', 'Kullanıcının işini, en az gereksinimini ve bütçesini belirleme.'),
        ('Bill of Materials (BOM)', 'Parça listesi', 'Seçilen parçalar, teknik değerleri ve gerekçeleri.'),
        ('Compatibility Matrix', 'Uyumluluk tablosu', 'Her kural için sonuç ve gerekçe satırı.'),
        ('Power Budget', 'Güç bütçesi', 'Tüketimlerin toplamı ve bırakılan pay.'),
        ('Build Log', 'Montaj günlüğü', 'Adım, tarih-saat, yapan kişi ve sonuç kaydı.'),
        ('Evidence', 'Kanıt', 'İddiayı doğrulayan fotoğraf, ekran görüntüsü ya da ölçüm.'),
        ('Stress Test', 'Yük testi', 'Sistemi bir süre tam yükte çalıştırıp kararlılığı sınama.'),
        ('Technical Report', 'Teknik rapor', 'Kararları ve kanıtları düzenli sunan belge.'),
        ('Rubric', 'Dereceli puanlama anahtarı', 'Ürünün hangi ölçüt ve düzeyle değerlendirileceği.'),
        ('Jury Defense', 'Jüri savunması', 'Önerinin sorulara karşı gerekçeyle savunulması.'),
    ]},

    {'tur': 'serbest', 'baslik': 'Proje Kartı', 'rozet': 'Proje', 'etiket': 'Proje Kartı',
     'ikon': IK_RAPOR, 'govde': PROJE},

    {'tur': 'uygulama', 'no': 1, 'ad': 'İhtiyaç Analizi', 'etiket': 'ADIM 1 · İHTİYAÇ',
     'ikon': IK_KISI,
     'title': 'Önce Kullanıcıyı Dinle',
     'prova_baslik': 'Prova: görüşme formunu izle', 'gercek_baslik': 'Projende yap',
     'prova': prova('pv-ihtiyac'),
     'foto': 'DON-301-H14-1-ihtiyac.jpg|Grubun doldurduğu iki ihtiyaç görüşme formu',
     'talimat': ['İki farklı <strong>kullanıcı profili</strong> seç (ör. ofis/okul ve oyun).',
                 'Her biri için işi, programları, kullanım süresini ve <strong>bütçeyi (puan)</strong> yaz.',
                 'Görüşmeden <strong>en az gereksinimleri</strong> sayıyla çıkar: çekirdek, GB, TB, kart seviyesi.'],
     'kontrol': 'İki form dolu; her profilin gereksinimleri sayıyla yazılı.'},

    {'tur': 'uygulama', 'no': 2, 'ad': 'Parça Listesi', 'etiket': 'ADIM 2 · PARÇA LİSTESİ',
     'ikon': IK_LISTE,
     'title': 'Her Parçanın Bir Gerekçesi Olsun',
     'prova_baslik': 'Prova: liste satır satır', 'gercek_baslik': 'Projende yap',
     'prova': prova('pv-liste'),
     'foto': 'DON-301-H14-2-liste.jpg|Parça listesi tablosu: parça, teknik değer, puan ve gerekçe sütunları',
     'talimat': ['Önceliği en yüksek parçadan başla; bütçenin en büyük payı ona gider.',
                 'Her satıra <strong>teknik değer</strong>, <strong>puan</strong> ve tek cümle <strong>gerekçe</strong> yaz.',
                 'Toplamı bütçeyle karşılaştır; aşıyorsa önceliği düşük parçadan kıs.'],
     'kontrol': 'Her parça bir satırda; toplam puan bütçenin altında; her satırda gerekçe var.'},

    {'tur': 'uygulama', 'no': 3, 'ad': 'Uyumluluk Tablosu', 'etiket': 'ADIM 3 · UYUMLULUK',
     'ikon': IK_TABLO,
     'title': 'Kırmızıyı Düzelt, Sarıyı Açıkla',
     'prova_baslik': 'Prova: tabloyu denetle', 'gercek_baslik': 'Projende yap',
     'prova': prova('pv-uyum'),
     'foto': 'DON-301-H14-3-tablo.jpg|Grubun uyumluluk tablosu: kural, sonuç simgesi ve gerekçe sütunları',
     'talimat': ['Her kural için bir satır aç: soket, bellek, form, depolama, kart, güç, konnektör, soğutucu, görüntü.',
                 'Sonuca <strong>simge + renk</strong> ver (✓ ! ✗) ve gerekçeyi sayıyla yaz.',
                 'Güç hesabını ayrı kutuda göster: tüketim × 1,3 ≤ güç kaynağı.'],
     'kontrol': 'Tabloda kırmızı satır yok; sarı satırların gerekçesi yazılı.'},

    {'tur': 'uygulama', 'no': 4, 'ad': 'Montaj ve Kurulum Kanıtları', 'etiket': 'ADIM 4 · KANIT',
     'ikon': IK_FOTO,
     'title': 'Yaptığını Göster, Tarihiyle',
     'prova_baslik': 'Prova: kanıt klasörü', 'gercek_baslik': 'Projende yap',
     'prova': prova('pv-kanit'),
     'foto': 'DON-301-H14-4-kanit.jpg|Montaj adımı fotoğrafı: grup etiketi ve tarih-saat görünür',
     'talimat': ['H09–H12 montaj ve kurulum fotoğraflarını <strong>adım sırasına</strong> diz.',
                 'Her kanıta tarih-saat, yapan kişi ve bir cümle açıklama ekle.',
                 'UEFI ekranı (bellek, disk) ve uyarısız <strong>Aygıt Yöneticisi</strong> görüntüsünü ekle.'],
     'kontrol': 'Her montaj adımının en az bir tarihli kanıtı var.'},

    {'tur': 'uygulama', 'no': 5, 'ad': 'Rapor', 'etiket': 'ADIM 5 · RAPOR',
     'ikon': IK_RAPOR,
     'title': 'Sistem Önerisi ve Montaj Raporu',
     'prova_baslik': 'Prova: rapor iskeleti', 'gercek_baslik': 'Projende yap',
     'prova': prova('pv-rapor'),
     'foto': 'DON-301-H14-5-rapor.jpg|Raporun kapak ve içindekiler sayfası',
     'talimat': ['Bölümleri sırala: ihtiyaç, parça listesi, uyumluluk, güç, montaj sırası, kanıtlar, sonuç.',
                 'Her iddianın yanına kanıtının numarasını yaz (ör. “Kanıt 4”).',
                 'Kontrol listesini sona ekle; eksik maddeyi grupça tamamla.'],
     'kontrol': 'Rapor tüm bölümleri içeriyor; kanıt numaraları eşleşiyor.'},

    {'tur': 'uygulama', 'no': 6, 'ad': 'Sunum', 'etiket': 'ADIM 6 · SUNUM',
     'ikon': IK_SUNUM,
     'title': '5 Dakika, 3 Gerekçe',
     'prova_baslik': 'Prova: jüri sunumu akışı', 'gercek_baslik': 'Projende yap',
     'prova': prova('pv-sunum'),
     'foto': 'DON-301-H14-6-sunum.jpg|Grubun jüriye sunum yaptığı an',
     'talimat': ['Süreyi böl: ihtiyaç 1 dk, öneri 1 dk, uyumluluk ve güç 1 dk, kanıt 1 dk, özet 1 dk.',
                 'Jürinin soracağı üç soruyu tahmin et; cevaplarını sayıyla hazırla.',
                 'Her grup üyesi en az bir bölümü sunsun.'],
     'kontrol': 'Sunum 5 dakikayı aşmadı; sorular kanıtla cevaplandı.'},

    {'tur': 'etkinlik', 'no': 1, 'ad': 'Sistem Önerisi',
     'title': 'İki Profil, İki Rapor',
     'desc': 'Profil seç ve listeyi doldur. Uyumluluk, ihtiyaç ve bütçe tamam olunca <strong>rapor kartı kendiliğinden</strong> açılır. Sonra ikinci, farklı bir profil için tekrarla.',
     'tip': ['💡', 'Rapor kartındaki gerekçeleri ve montaj sırasını proje dosyana aktar; sarı satırları kendi cümlelerinle açıkla.'],
     'ek': '<ul class="gorevler" id="rp-gorevler">'
           '<li><span class="g-isaret"></span><span>1. profil: rapor oluştu</span></li>'
           '<li><span class="g-isaret"></span><span>2. profil (farklı): rapor oluştu</span></li></ul>' +
           ILERLEME % ('ilerleme-1', 'Oluşan rapor', 2),
     'sinif': 'uy-etk',
     'gorsel': {'panel': 'uy-proje'}},

    {'tur': 'etkinlik', 'no': 2, 'ad': 'Jüri Provası',
     'title': 'Soruya Kanıtla Cevap Ver',
     'desc': 'Jüri altı soru soruyor. Her soruda en güçlü savunmayı seç ve geri bildirimi oku. Güçlü cevap <strong>sayı, kural ve kanıt</strong> içerir.',
     'tip': ['🎤', 'Sunumdan önce bu soruları grubunla yüksek sesle prova et; cevabı 20 saniyede söyleyebilmelisin.'],
     'ek': ILERLEME % ('ilerleme-2', 'En güçlü cevap', 6),
     'gorsel': {'panel': 'juri'}},

    {'tur': 'ozet', 'kartlar': [
        ('oz-1.svg', 'İhtiyaç Analizi', 'İki profil; gereksinimler sayıyla, bütçe puanla.'),
        ('oz-2.svg', 'Parça Listesi', 'Teknik değer + puan + tek cümle gerekçe.'),
        ('oz-3.svg', 'Uyumluluk Tablosu', 'Kırmızı düzeltilir, sarı açıklanır, güç hesaplanır.'),
        ('oz-4.svg', 'Kanıtlar', 'Tarih-saatli fotoğraf, UEFI ve sistem ekranları.'),
        ('oz-5.svg', 'Rapor', 'Bölümler sıralı; her iddianın kanıt numarası var.'),
        ('oz-6.svg', 'Sunum', '5 dakika; sorulara sayı ve kanıtla cevap.'),
    ]},
]
