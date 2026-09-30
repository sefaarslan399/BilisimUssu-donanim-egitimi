# -*- coding: utf-8 -*-
"""Ders tanımı (kaynak/<KOD>/HNN/ders.py) → lesson.js, kapak.html ve slaytlar.html metinleri.

ders.py şu adları tanımlar (düz Python sözlükleri; çok satırlı metin rahat yazılsın diye):
  MODELLER = ['M-...']
  DERS = {grade, hafta, baslik, aciklama, hedefler[4], hedef_simgeler[4], bolumler[[ad, alt]*3],
          quiz[{q, opts, correct, fb}*5], bitis}
  KAPAK = {'3d': 'kapak-3d', 'aria': '...', 'yedek': 'dosya.svg'}  ya da  {'svg': 'kapak.svg'}
  SLAYTLAR = [ {tur: 'isinma'|'adim'|'etkinlik'|'derinles'|'uygulama'|'serbest', ...}, ... ]  (Kapak/Hedefler hariç)
  Özet slaytı: {tur: 'ozet', kartlar: [(svg_dosyası, başlık, metin) * 6]}

Görsel alanı ('gorsel'):
  {'3d': id, 'aria': metin, 'yedek': svg, 'yedek_metin': metin}   etkileşimli 3D (DON3D)
  {'svg': dosya}                                                  hazır SVG sahne
  {'2d': id, 'koyu': bool}                                        betikle doldurulan 2D panel
  {'panel': id}                                                   etkinlik paneli
  {'html': ham}                                                   serbest
Not: f-string kullanılmaz (üretim standardı).
"""
import json

IKON_ISINMA = '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>'
IKON_DERINLES = '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M11 8v6M8 11h6"/>'
IKON_OZET = ('<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>'
             '<polyline points="3 6 4.5 7.5 7 5"/><polyline points="3 12 4.5 13.5 7 11"/><polyline points="3 18 4.5 19.5 7 17"/>')
IKON_ETKINLIK = ('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>'
                 '<rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 17.5h7M17.5 14v7"/>')


def js(v):
    return json.dumps(v, ensure_ascii=False)


def jsq(v):
    """Tek tırnaklı JS dizgesi (içine @dahil ile gömülen SVG'lerin çift tırnakları bozulmasın)."""
    if isinstance(v, list):
        return '[' + ', '.join(jsq(x) for x in v) + ']'
    return "'" + str(v).replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ') + "'"


def hdr(ikon, baslik, rozet):
    return ('    <div class="slide-hdr">\n'
            '      <div class="sh-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" '
            'stroke-linecap="round" stroke-linejoin="round">' + ikon + '</svg></div>\n'
            '      <div class="sh-title">' + baslik + '</div>\n'
            '      <div class="sh-badge">' + rozet + '</div>\n'
            '    </div>\n')


def gorsel_html(g):
    if not g:
        return ''
    if '3d' in g:
        yedek = ''
        if g.get('yedek'):
            yedek = ('<div data-yedek hidden><!--@dahil:' + g['yedek'] + '-->' +
                     ('<span>' + g['yedek_metin'] + '</span>' if g.get('yedek_metin') else '') + '</div>')
        ust = g.get('ust', '')
        return ('        <div class="step-visual v3d">' + ust + '\n'
                '          <div class="don3d" id="' + g['3d'] + '" aria-label="' + g.get('aria', '') + '">' + yedek + '</div>\n'
                '        </div>\n')
    if 'svg' in g:
        return '        <div class="step-visual"><div class="illu"><!--@dahil:' + g['svg'] + '--></div></div>\n'
    if '2d' in g:
        return ('        <div class="step-visual gorsel2d' + (' koyu' if g.get('koyu') else '') + '"><div class="gorsel2d-ic" id="' +
                g['2d'] + '">' + g.get('ic', '') + '</div></div>\n')
    if 'panel' in g:
        return '        <div class="step-visual etk-panel"><div class="etk-alan" id="' + g['panel'] + '">' + g.get('ic', '') + '</div></div>\n'
    if 'html' in g:
        return '        ' + g['html'] + '\n'
    raise SystemExit('HATA: bilinmeyen görsel türü: ' + repr(g))


def tip_html(tip):
    if not tip:
        return ''
    return '          <div class="step-tip"><span>' + tip[0] + '</span><span>' + tip[1] + '</span></div>\n'


def adim_govde(s, rozet_etiket):
    genis = s.get('genis', '3d' in (s.get('gorsel') or {}) or 'panel' in (s.get('gorsel') or {}))
    return ('    <div class="slide-body">\n'
            '      <div class="layout-step' + (' genis-gorsel' if genis else '') + '">\n'
            '        <div class="step-text">\n'
            '          <div class="step-num-badge">' + rozet_etiket + '</div>\n'
            '          <div class="step-title">' + s['title'] + '</div>\n'
            '          <div class="step-desc">' + s['desc'] + '</div>\n' +
            tip_html(s.get('tip')) + (('          ' + s['ek'] + '\n') if s.get('ek') else '') +
            '        </div>\n' + gorsel_html(s.get('gorsel')) +
            '      </div>\n    </div>\n')


def slayt(s, sid, sayilar):
    tur = s['tur']
    sinif = 'slide' + (' derinles' if tur == 'derinles' else '') + (' ' + s['sinif'] if s.get('sinif') else '')
    bas = '  <!-- ══════════════════════ ' + sid.upper() + ' ══════════════════════ -->\n  <div class="' + sinif + '" id="' + sid + '">\n'
    if tur == 'isinma':
        secenekler = ''.join('<button type="button" class="tahmin-sec" data-tahmin="' + str(i) + '"><span class="tahmin-harf">' +
                             'ABCD'[i] + '</span><span>' + m + '</span></button>' for i, m in enumerate(s['secenekler']))
        s2 = dict(s)
        s2['ek'] = ('<div class="tahmin" role="group" aria-label="Tahmin seçenekleri">' + secenekler +
                    '<div class="tahmin-geri" id="tahmin-geri" aria-live="polite"></div></div>')
        s2.setdefault('genis', False)
        etiket = s.get('baslik', 'Isınma: Tahmin Et')
        return bas + hdr(s.get('ikon', IKON_ISINMA), etiket, 'Isınma') + adim_govde(s2, 'ISINMA') + '  </div>\n', etiket
    if tur == 'adim':
        etiket = 'Adım ' + str(s['no']) + ': ' + s['ad']
        rozet = s.get('rozet', 'Kavram ' + str(s['no']) + ' / ' + str(sayilar['adim']))
        return bas + hdr(s['ikon'], etiket, rozet) + adim_govde(s, s['etiket']) + '  </div>\n', etiket
    if tur == 'etkinlik':
        etiket = 'Etkinlik: ' + s['ad']
        rozet = 'Etkinlik ' + str(s['no']) + ' / ' + str(sayilar['etkinlik'])
        return (bas + hdr(s.get('ikon', IKON_ETKINLIK), etiket, rozet) + adim_govde(s, s.get('etiket', 'ETKİNLİK ' + str(s['no']))) +
                '  </div>\n', etiket)
    if tur == 'derinles':
        etiket = 'Derinleş: ' + s['ad']
        return bas + hdr(IKON_DERINLES, etiket, 'Derinleş') + adim_govde(s, 'DERİNLEŞ · İSTEĞE BAĞLI') + '  </div>\n', etiket
    if tur == 'ozet':
        kartlar = ''
        for i, k in enumerate(s['kartlar']):
            kartlar += ('          <div class="ozet-kart"><div class="ozet-resim"><!--@dahil:' + k[0] + '--></div><div><div class="ozet-bas"><b>' +
                        str(i + 1) + '</b> ' + k[1] + '</div><div class="ozet-metin">' + k[2] + '</div></div></div>\n')
        return (bas + hdr(IKON_OZET, 'Özet', 'Özet') + '    <div class="slide-body">\n      <div class="layout-full">\n'
                '        <div class="csub">' + s.get('alt', 'Bugün öğrendiğin ' + str(len(s['kartlar'])) + ' adım:') + '</div>\n'
                '        <div class="ozet-izgara">\n' + kartlar + '        </div>\n      </div>\n    </div>\n  </div>\n', 'Özet')
    if tur == 'uygulama':
        etiket = 'Adım ' + str(s['no']) + ': ' + s['ad']
        rozet = s.get('rozet', 'Yapım ' + str(s['no']) + ' / ' + str(sayilar['uygulama']))
        g = s['prova']
        if '3d' in g:
            yedek = ('<div data-yedek hidden><!--@dahil:' + g['yedek'] + '--></div>') if g.get('yedek') else ''
            prova = '<div class="don3d" id="' + g['3d'] + '" aria-label="' + g.get('aria', '') + '">' + yedek + '</div>' + g.get('ek', '')
        else:
            prova = g['html']
        talimat = ''.join('<li>' + m + '</li>' for m in s['talimat'])
        govde = ('    <div class="slide-body">\n      <div class="layout-full uygulama">\n'
                 '        <div class="u-bas"><span class="step-num-badge">' + s['etiket'] + '</span><span class="u-baslik">' + s['title'] + '</span></div>\n'
                 '        <div class="u-paneller">\n'
                 '          <div class="u-panel u-prova">\n'
                 '            <div class="u-panel-bas"><span class="u-no">1</span>' + s.get('prova_baslik', 'Prova: önce izle') + '</div>\n'
                 '            <div class="u-sahne">' + prova + '</div>\n'
                 '          </div>\n'
                 '          <div class="u-panel u-gercek">\n'
                 '            <div class="u-panel-bas"><span class="u-no">2</span>' + s.get('gercek_baslik', 'Gerçek bilgisayarda yap') + '</div>\n'
                 '            <div class="u-foto"><!--@foto:' + s['foto'] + '--></div>\n'
                 '            <ol class="u-talimat">' + talimat + '</ol>\n'
                 '            <div class="u-kontrol"><span>✔</span><span><strong>Kontrol:</strong> ' + s['kontrol'] + '</span></div>\n'
                 '          </div>\n        </div>\n      </div>\n    </div>\n')
        return bas + hdr(s['ikon'], etiket, rozet) + govde + '  </div>\n', etiket
    if tur == 'serbest':
        etiket = s['baslik']
        return (bas + hdr(s['ikon'], etiket, s['rozet']) + '    <div class="slide-body">\n' + s['govde'] + '\n    </div>\n  </div>\n',
                s.get('etiket', etiket))
    raise SystemExit('HATA: bilinmeyen slayt türü: ' + tur)


def uret(ns):
    """ders.py ad alanından (lesson_js, kapak_html, slaytlar_html, ders_js_on) üretir."""
    d = ns['DERS']
    sl = ns['SLAYTLAR']
    sayilar = {'adim': sum(1 for s in sl if s['tur'] == 'adim'),
               'etkinlik': sum(1 for s in sl if s['tur'] == 'etkinlik'),
               'uygulama': sum(1 for s in sl if s['tur'] == 'uygulama')}
    html, etiketler = [], ['Kapak', 'Hedefler']
    for i, s in enumerate(sl):
        h, e = slayt(s, 's' + str(i + 3), sayilar)
        html.append(h)
        etiketler.append(e)
    etiketler += ['Bilgi Testi', 'Tebrikler!']
    quiz = ',\n'.join('    { q:' + jsq(q['q']) + ',\n      opts:' + jsq(q['opts']) + ', correct:' + str(q['correct']) +
                      ',\n      fb:' + js(q['fb']) + ' }' for q in d['quiz'])
    lesson = ('const LESSON = {\n'
              '  grade:    ' + js(d.get('grade', 'ortaokul')) + ',\n'
              '  week:     ' + js(d['hafta']) + ',\n'
              "  title:    '" + d['baslik'].replace("'", "\\'") + "',\n"
              '  desc:     ' + js(d['aciklama']) + ',\n'
              '  goals: ' + js(d['hedefler']) + ',\n'
              '  sections: [\n' + ',\n'.join('    { icon:' + js(str(i + 1)) + ', label:' + js(b[0]) + ', sub:' + js(b[1]) + ' }'
                                            for i, b in enumerate(d['bolumler'])) + ',\n  ],\n'
              '  quiz: [\n' + quiz + ',\n  ],\n'
              '  doneMsg: ' + js(d['bitis']) + ',\n'
              '};\n\nconst SLIDE_LABELS = ' + js([str(i + 1) + '. ' + e for i, e in enumerate(etiketler)]) + ';\n')
    k = ns['KAPAK']
    if '3d' in k:
        kapak = ('<div class="cover-svg kapak-3d">\n            <div class="don3d" id="' + k['3d'] + '" aria-label="' + k['aria'] + '">\n'
                 '              <div data-yedek hidden><!--@dahil:' + k['yedek'] + '--></div>\n            </div>\n          </div>')
    else:
        kapak = '<div class="cover-svg" id="s1-cover-svg"><!--@dahil:' + k['svg'] + '--></div>'
    on = 'DERS.hedefSimgeleri(' + js(d.get('hedef_simgeler', [])) + ');\n'
    return lesson, kapak, '\n'.join(html), on
