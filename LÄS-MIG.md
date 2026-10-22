# MT-byte – så lägger du ut appen

Appen är fem filer: `index.html`, `sw.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`.
De måste ligga på en https-adress för att offline ska fungera. GitHub Pages är gratis.

## 1. Lägg ut på GitHub Pages (ca 10 min)
1. Skapa konto på github.com.
2. Tryck **New repository**. Döp det till `mt-byte`. Välj **Public**. Skapa.
3. Tryck **uploading an existing file**. Dra in alla fem filerna. Tryck **Commit changes**.
4. Gå till **Settings → Pages**. Under *Branch* välj `main` och `/ (root)`. Spara.
5. Efter en minut finns appen på `https://DITTNAMN.github.io/mt-byte/`.

Koden blir publik, men dina byten och foton ligger bara i din telefon. Inget laddas upp.

## 2. Installera på telefonen
- **iPhone:** Öppna adressen i Safari → Dela → *Lägg till på hemskärmen*.
- **Android:** Öppna i Chrome → meny → *Installera app*.

Öppna appen en gång med täckning. Sen fungerar den helt utan nät.

## 3. Efter varje jobb
Tryck **Skapa PDF-protokoll** under Protokoll och välj Dela → Mail.
Då finns protokollet med alla foton kvar även om telefonen tappas eller rensas.

## 4. Uppdatera appen
1. Ladda upp de nya filerna till samma repository.
2. Öppna `sw.js` och höj `mtbyte-v1` till `mtbyte-v2` (v3 nästa gång osv).
3. Öppna appen med täckning, stäng den och öppna igen.

Dina sparade byten påverkas inte av uppdateringar.

## Alternativ: liroelteknik.se
Kan också läggas i en mapp, t.ex. `liroelteknik.se/mt/`, om ditt webbhotell har https.

## Importera arbetsorder
1. Spara arket som **.xlsx** (som det är). Lägg filen i Filer på telefonen, t.ex. via mejl → Spara i Filer.
2. I appen: **Importera arbetsorder** → välj filen.
3. **Grönmarkerade rader räknas som utförda och hoppas över.** Övriga rader blir jobb under *Planerade*.
4. Jobb matchas på arbetsorder + EAN. Samma arbetsorder med flera EAN blir flera jobb.
5. Finns jobbet redan fylls bara tomma fält i. Inget du skrivit skrivs över. Importera gärna samma fil igen.
6. Kontaktperson, mobil, e-post, bokad tid, nyckel och mätarplacering hämtas från arket där de finns. Komplettera under *Inför arbetet*.

CSV fungerar fortfarande, men saknar färger. Då hoppas rader med utfört-datum, stoppställning eller status OK över.
Ekonomi, peng och NDI läses aldrig in.
Ladda aldrig upp arket till GitHub – repot är publikt.

## Arbetsgång i ett jobb
Arbetsorder → Inför arbetet → Före → Byte → Efter → Protokoll.
EAN (anläggnings-ID) och mätarnummer är olika fält. Nytt mätarnummer och den nya mätarens avläsningar visas bara när du väljer **Elmätaren byts** under Byte.

## Rad tillbaka till Excel
Under Protokoll: **Kopiera rad till Excel**. Klistra in i cellen *gammal mätarnummer* på rätt rad.
Raden finns också i protokollet du mejlar till dig själv, så du kan kopiera den från datorn.
