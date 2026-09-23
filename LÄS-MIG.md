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
Tryck **Skicka protokoll till mig** under Klart och välj Mail.
Då finns protokollet med alla foton kvar även om telefonen tappas eller rensas.

## 4. Uppdatera appen
1. Ladda upp de nya filerna till samma repository.
2. Öppna `sw.js` och höj `mtbyte-v1` till `mtbyte-v2` (v3 nästa gång osv).
3. Öppna appen med täckning, stäng den och öppna igen.

Dina sparade byten påverkas inte av uppdateringar.

## Alternativ: liroelteknik.se
Kan också läggas i en mapp, t.ex. `liroelteknik.se/mt/`, om ditt webbhotell har https.
