# StorMAnqeL — GitHub Pages

Seçilen V3 tasarımıdır. Görünüm, video ve özellikler korunmuştur.
Sayaç Netlify ve github.io adreslerinde çalışır; aynı sayaç anahtarı korunduğu için ortak toplam devam eder.

## Tarayıcıdan kurulum
1. GitHub hesabında yeni bir Public depo oluştur.
2. Kullanıcı sitesi için depo adı tam olarak stormanqei.github.io olmalı.
   Hesap: https://github.com/StorMAnqeI — son harf İngilizce büyük I, adreste küçük i.
3. ZIP'i tamamen çıkar. ZIP'in kendisini yükleme.
4. Add file → Upload files üzerinden çıkarılan DOSYALARI ve media klasörünü deponun köküne yükle.
   index.html doğrudan kökte olmalı; fazladan üst klasör içinde kalmamalı.
5. Commit changes ile kaydet.
6. Settings → Pages → Source: Deploy from a branch → main → / (root) → Save.
7. Yayın tamamlanınca Pages ekranında gösterilen adresi aç.

Derleme komutu veya paket kurulumu gerekmez. Dosya adlarında büyük/küçük harfleri değiştirme.
.nojekyll dosyası da pakettedir; Windows'ta gizli görünebilir.

## Güncelleme
Metinler: profile-content.js. Sosyal adresler: index.html.
Görünüm: style.css ve features.css. Ana davranış: script.js ve features.js.
GitHub'da dosyayı açıp kalem simgesinden düzenle ve Commit changes ile kaydet.
Resim veya video için media klasöründeki ilgili dosyayı aynı adla değiştir.

## Kontrol
Video yalnızca giriş tıklamasından sonra kendi orijinal sesiyle oynar.
Yerel ses tercihi yeni alan adında ilk kez %65 olur; sonra o adres için hatırlanır.
Sayaç yaklaşık görüntülenmedir, tekil kişi sayısı değildir; dış Hits hizmetine bağlıdır.
Görünüm ve medya V3 ile aynı tutulmuştur. Netlify yayını değiştirilmemiştir.
Resmî kurulum: https://docs.github.com/en/pages/quickstart

## Son düzenleme
Arayüz ve metin havuzları İngilizcedir. İstenen hakkımda metni aynen Herhangi biri olarak korunmuştur.
Ses denetimi audio-controls.js dosyasındadır. Fiziksel telefon ses seviyesi web sayfasına bildirilmez; eşzamanlı yüzde gösterilemez. Desteklenen tarayıcılarda site ses kaydırıcısı; iOS veya yazılım ses kontrolünün çalışmadığı tarayıcılarda telefon tuşları + sessize al/aç kullanılır. Yeni sessiz tercihi de hatırlanır. Gerçek cihazda ses kontrolünü test et.
