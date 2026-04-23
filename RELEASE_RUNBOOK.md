# Posture Maxx — Release Runbook

> Von Sandbox bis App Store + Google Play. Schritt für Schritt.

## Übersicht & Timeline

| Woche | Was passiert | Wartezeiten |
|---|---|---|
| **Woche 0** | Accounts registrieren + lokale Dev-Umgebung | Apple 24-48h, Play 0h (aber 14-Tage-Testperiode startet ab erstem APK-Upload) |
| **Woche 1** | RN-App fertigstellen (Phase G-I) | EAS-Build ~15-20 min pro Build |
| **Woche 2** | Store-Assets + Listings + Privacy Policy | Apple Review: 24-48h, Google Review: 1-7 Tage |
| **Woche 3** | Submissions + Review | Google Closed-Testing: 14 Tage ab APK-Upload |
| **Woche 4** | Go-Live | — |

**Kritischer Pfad:** Google Play 14-Tage-Closed-Testing blockiert den Android-Release.
Das APK muss **in Woche 0-1** in die Play Console — je früher, desto besser.

---

## Tag 0 — Accounts registrieren (alle 4 sofort starten)

### 1. Apple Developer Program
- **URL:** https://developer.apple.com/programs/enroll/
- **Kosten:** $99 / Jahr
- **Typ:** Individual → kein D-U-N-S nötig
- **Wartezeit:** 24-48h Verifizierung
- **Danach:** Team-ID notieren (Format: `XXXXXXXXXX`)

### 2. Google Play Console
- **URL:** https://play.google.com/console/signup
- **Kosten:** $25 einmalig
- **Wartezeit (kritisch):**
  - Neu-Registrierung: sofort
  - Erster Production-Release für neue Private-Accounts: erst nach 20 Closed-Testern × 14 Tage
  - → APK in **Woche 0** hochladen, damit die 14 Tage sofort laufen
- **Schritt nach Registrierung:** App anlegen → Closed Testing-APK hochladen (Stub-Version reicht) → 20 Tester einladen

### 3. RevenueCat
- **URL:** https://app.revenuecat.com/signup
- **Kosten:** gratis bis $2.5k MRR
- **Schritte nach Signup:**
  1. Neues Projekt → "Posture Maxx"
  2. App hinzufügen → iOS (Bundle ID: `com.posturemaxx.app`)
  3. App hinzufügen → Android (Package: `com.posturemaxx.app`)
  4. API-Keys kopieren (iOS + Android getrennt) → in `.env.local` eintragen

### 4. Expo / EAS
- **URL:** https://expo.dev/signup
- **Kosten:** gratis (Free-Plan reicht)
- **Nach Signup:**
  ```bash
  npm install -g eas-cli
  eas login
  cd /home/claude/repo/native
  eas init   # erstellt projectId + schreibt sie in app.json
  ```

---

## Woche 1 — Lokale Dev-Umgebung einrichten

### Voraussetzungen installieren (Mac)

```bash
# Node 20+
node --version   # muss ≥ 20 sein

# Watchman
brew install watchman

# JDK 17 (für Android)
brew install --cask zulu@17

# Android Studio → SDK Manager → Android 14 (API 34) installieren
# ANDROID_HOME in ~/.zshrc setzen:
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc

# Xcode (Mac App Store, ~15 GB)
xcode-select --install
sudo xcode-select -s /Applications/Xcode.app

# EAS CLI
npm install -g eas-cli
```

### App-Projekt aufsetzen

```bash
cd /home/claude/repo/native
npm install

# .env.local anlegen (NICHT committen!)
cat > .env.local << EOF
EXPO_PUBLIC_RC_IOS_KEY=appl_XXXX
EXPO_PUBLIC_RC_ANDROID_KEY=goog_XXXX
EOF

# Prebuild (generiert ios/ + android/ Ordner)
npx expo prebuild --clean

# Dev-Build auf iOS-Simulator starten
npx expo run:ios --simulator

# Dev-Build auf Android-Emulator starten
npx expo run:android
```

### RevenueCat konfigurieren

```ts
// lib/purchases.ts
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

export function initPurchases() {
  const key = Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_RC_IOS_KEY!
    : process.env.EXPO_PUBLIC_RC_ANDROID_KEY!;
  Purchases.configure({ apiKey: key });
}
```

`initPurchases()` in `app/_layout.tsx` aufrufen.

---

## Woche 2 — Store-Assets erstellen

### App-Icon

- **Format:** PNG, 1024×1024, kein Transparenz (iOS), kein runder Rand nötig (Expo macht das)
- **Datei:** `native/assets/icon.png`
- Expo generiert alle Platform-Größen automatisch beim Build

### Splash Screen

- **Datei:** `native/assets/splash.png` — 1284×2778 (iPhone 15 Pro Max Format)
- Hintergrundfarbe `#080808` bereits in `app.json` gesetzt

### Screenshots (Pflichtgrößen)

**iOS — 3 benötigte Größen (App Store Connect generiert Rest):**
| Größe | Gerät |
|---|---|
| 1290×2796 | iPhone 15 Pro Max (6.7") — Pflicht |
| 1242×2208 | iPhone 8 Plus (5.5") — Pflicht |
| 2048×2732 | iPad Pro 12.9" — Pflicht für iPad-Unterstützung |

**Android — 3 Größen:**
| Format | Min-Auflösung |
|---|---|
| Phone | 1080×1920 PNG |
| 7" Tablet | 1200×1920 |
| 10" Tablet | 1600×2560 |

**Schnellster Weg:** Screenshots im iOS Simulator aufnehmen (`Cmd+S`), dann in Android Emulator.

### Store-Beschreibung

**App-Titel (30 Zeichen max):**
```
Posture Maxx – Haltungs-Score
```

**Untertitel iOS / Kurzbeschreibung Android:**
```
DE: Analysiere deine Körperhaltung
EN: Analyze your posture in 60 sec.
```

**Vollständige Beschreibung (4000 Zeichen max):**

```
DE:
Posture Maxx analysiert deine Körperhaltung mit dem Smartphone — on-device, keine Cloud, keine Kontoanmeldung.

WIE ES FUNKTIONIERT:
• 3 Fotos: Seite, Front, Rücken
• KI-Pose-Detection erkennt 33 Körperpunkte direkt auf deinem Gerät
• Sofort: A–F-Scores für Kopf-Vorhaltung, Schultern, Wirbelsäule, Becken und Knie-Achse
• Wöchentlicher Re-Scan zeigt deinen Fortschritt

PRIVACY FIRST:
Deine Fotos verlassen dein Gerät nicht. Keine Cloud-Uploads. Keine Registrierung.

WICHTIG: Posture Maxx ist kein medizinisches Gerät und ersetzt keine ärztliche oder physiotherapeutische Untersuchung. Die Ergebnisse sind zur persönlichen Orientierung — nicht zur Diagnose. Bei Schmerzen bitte Arzt oder Physiotherapeut aufsuchen.

---

EN:
Posture Maxx analyzes your posture with your phone — on-device, no cloud, no sign-in required.

HOW IT WORKS:
• 3 photos: side, front, back
• AI pose detection tracks 33 body points directly on your device
• Instant A–F scores for head forward, shoulders, spine, pelvis, knee alignment
• Weekly re-scan shows your progress

PRIVACY FIRST:
Your photos never leave your device. No cloud uploads. No account needed.

IMPORTANT: Posture Maxx is not a medical device and does not replace professional medical or physiotherapy assessment. Results are for personal awareness only — not for diagnosis. See a doctor or physio if you're in pain.
```

**Keywords iOS (100 Zeichen):**
```
posture,körperhaltung,haltung,rücken,wirbelsäule,score,analyse,pose,fitness,kamera,scan,gesundheit
```

### Privacy Policy

Erstelle `privacy.md` auf GitHub → aktiviere GitHub Pages → trage URL ein.

**Mindest-Inhalt:**
```markdown
# Posture Maxx — Privacy Policy

Last updated: [Datum]

## Data collected
Posture Maxx does NOT collect, store, or transmit any personal data.
Photos taken for posture analysis are processed entirely on-device using
on-device AI (MediaPipe) and are never uploaded to any server.

## Camera & Photo Library
Camera and photo library access is used solely for capturing posture photos.
Images are processed locally and never stored beyond the current session.

## Analytics
This app does not use any analytics or tracking services.

## Contact
[deine E-Mail]
```

URL eintragen in:
- App Store Connect → App Information → Privacy Policy URL
- Google Play Console → Store Listing → Privacy Policy

---

## Woche 3 — Builds + Submissions

### EAS Production Build

```bash
cd native

# Production Build (iOS + Android gleichzeitig, ~20-30 min)
eas build --profile production --platform all

# iOS submittieren
eas submit --platform ios --profile production

# Android submittieren
eas submit --platform android --profile production
```

### iOS — App Store Connect

Nach `eas submit`:
1. App Store Connect → deine App → App Store-Version erstellen
2. Screenshots + Beschreibung einfügen
3. Build auswählen (kommt via EAS Submit automatisch)
4. **Privacy Nutrition Labels:**
   - Kamera: "Data Not Collected"
   - Fotos: "Data Not Collected"
   - Alles andere: "Not Collected"
5. "Submit for Review" klicken
6. Apple Review: 24-72h

**In-App-Purchases (App Store Connect):**
1. Monetization → In-App Purchases → "+"
2. Subscription Group: "Posture Maxx Pro"
3. Produkt 1: `pm_weekly` | Weekly | $5.99 | 3-Day Free Trial
4. Produkt 2: `pm_yearly` | Yearly | $39.99

**RevenueCat Dashboard:**
1. Products → "+" → `pm_weekly` + `pm_yearly` (App Store)
2. Entitlement: "pro" → beide Products zuordnen
3. Offering: "default" → Package "weekly" + "yearly"

### Android — Play Console

Nach `eas submit`:
1. Testing → Internal Testing → AAB hochladen
2. Testing → Closed Testing → neue Version
3. **20 Tester einladen** (E-Mail-Adressen) → 14 Tage warten
4. Nach 14 Tagen: Production → neues Release → Review → 1-7 Tage

**Play Console Subscriptions:**
1. Monetize → Products → Subscriptions → "Create subscription"
2. Product ID: `pm_weekly` | Base plan: Weekly | Price: €5.99
3. Intro-Offer: 3-Day Free Trial
4. Produkt 2: `pm_yearly` | Yearly | €39.99

**Data Safety (Pflicht):**
- Does your app collect or share data? → **No**
- Does your app allow users to request deletion? → N/A (kein Account)

---

## Post-Launch

### OTA-Updates (kein Re-Submit nötig für JS-Änderungen)

```bash
# Kleinere Bugfixes direkt pushen — landet beim nächsten App-Start
eas update --channel production --message "Fix: gallery fallback"
```

**Wann braucht es einen neuen Build + Store-Review:**
- Neue Native-Module / Plugins
- Neue Permissions
- Native Code-Änderungen

### Crash-Monitoring

```bash
# Expo Crashes sind im EAS Dashboard eingebaut — kein Setup nötig
# Optional: Sentry
npx expo install @sentry/react-native
```

### RevenueCat Metrics

- Dashboard → Overview: MRR, neue Subscriptions, Churn
- Experiments (A/B-Testing der Paywall): ab ~100 MAU sinnvoll

---

## Häufige Apple-Rejections + Fixes

| Rejection | Ursache | Fix |
|---|---|---|
| Guideline 5.1.1 — Data Collection | Privacy Policy URL ungültig | URL-Erreichbarkeit prüfen |
| Guideline 3.1.1 — In-App Purchase | Kein Restore-Button | `Purchases.restorePurchases()` Button hinzufügen |
| Guideline 4.3 — Spam | App wirkt zu simpel | Review-Notes: Galerie-Upload demonstrieren |
| Performance 2.1 — Crash | App crasht auf Reviewer-Gerät | Vor Submit auf echtem iPhone in TestFlight testen |
| Metadata — Medical Claims | "diagnose" oder "behandelt" in Beschreibung | Wording: nur "awareness", "informativer Score" |

---

## Geheime Keys — niemals committen

```
native/.env.local:
EXPO_PUBLIC_RC_IOS_KEY=appl_XXXXXXXXXXXXXXXX
EXPO_PUBLIC_RC_ANDROID_KEY=goog_XXXXXXXXXXXXXXXX
```

`native/secrets/play-service-account.json` — für `eas submit --platform android`
- Play Console → Setup → API Access → Service Account erstellen

---

## Wichtige Links

| Service | URL |
|---|---|
| Apple Developer | https://developer.apple.com |
| App Store Connect | https://appstoreconnect.apple.com |
| Google Play Console | https://play.google.com/console |
| RevenueCat Dashboard | https://app.revenuecat.com |
| Expo Dashboard | https://expo.dev |
| EAS Docs | https://docs.expo.dev/eas/ |
| RevenueCat iOS Setup | https://www.revenuecat.com/docs/getting-started/installation/ios |
| Expo Camera Docs | https://docs.expo.dev/versions/latest/sdk/camera/ |
