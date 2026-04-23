# Posture Maxx — Native App (Expo)

React Native / Expo Implementierung der iOS- und Android-App.

## Quick Start

```bash
# einmalig
cd native
npm install
npx expo prebuild        # generiert ios/ + android/ Ordner

# Development Build (Pflicht — Expo Go reicht nicht wegen react-native-mediapipe)
npm run build:dev:ios     # via EAS, 10-20 min
npm run build:dev:android # via EAS, 10-20 min

# lokal starten (Dev-Client laden und Metro dranhängen)
npm run start
```

## Struktur

```
native/
├── app/                    # expo-router file-based routing
│   ├── _layout.tsx         # root layout + fonts + nav-stack
│   ├── index.tsx           # Splash (Route "/")
│   └── (onboarding)/       # onboarding flow group
├── shared/                 # portable code — no React/RN deps
│   ├── types.ts            # Keypoint, Grade, ComputedScores
│   ├── copy.ts             # DE/EN dictionary
│   ├── calculateScores.ts  # pure scoring function
│   └── poseAnalyzer.ts     # platform-agnostic interface
├── lib/                    # RN-specific helpers
│   ├── useLang.ts          # AsyncStorage-backed lang state
│   ├── useStore.ts         # app-global state (photos + scores)
│   └── poseAnalyzer.native.ts  # MediaPipe-Native impl (Phase H)
├── components/             # shared UI atoms (Phase G)
├── assets/                 # icon, splash, fonts
├── app.json                # Expo config
├── eas.json                # build profiles
├── babel.config.js         # NativeWind + Reanimated
├── tailwind.config.js      # brand colors (grade-a..f, bg-dark)
└── package.json
```

## Phasen-Mapping (Plan)

- **F Expo-Skelett** — dieser Commit. Layout, Splash, Problem-Screen als Smoke-Test, shared-Code, build config.
- **G Screen-Port** — restliche 7 Screens aus `../index.html` übertragen.
- **H Native-Kamera + MediaPipe** — `expo-camera`, `react-native-mediapipe`, `lib/poseAnalyzer.native.ts`.
- **I RevenueCat** — `react-native-purchases`, Paywall an Store-Products hängen.
- **J Store-Submission** — EAS Build → EAS Submit → App Store Connect / Play Console.

## Wichtige Entscheidungen (aus dem Plan)

- **Pose-Detection:** `react-native-mediapipe` BlazePose — 33 Keypoints, identisches Schema wie Web-MediaPipe → `shared/calculateScores.ts` läuft 1:1
- **Subscriptions:** RevenueCat via `react-native-purchases`
- **Styling:** NativeWind v4 (Tailwind für RN) — Klassen wie `className="bg-bg-dark text-grade-a"`
- **Navigation:** expo-router v4, typedRoutes aktiviert
- **New Architecture:** aktiviert (`newArchEnabled: true`) — nötig für moderne RN-Module

## Store-Accounts (vor dem Release beantragen)

- **Apple Developer Program** — $99/Jahr, 24-48h Verifizierung → [developer.apple.com](https://developer.apple.com/programs/enroll/)
- **Google Play Console** — $25 einmalig + **14-Tage-Closed-Test mit 20 Testern** vor Production (für neue Privat-Accounts) → [play.google.com/console](https://play.google.com/console)

## Known Gotchas

- `react-native-mediapipe` braucht **Development Build**, Expo Go crasht damit
- Nach `npx expo prebuild` nie `/ios` und `/android` manuell editieren — regenerieren via `prebuild --clean`
- NativeWind v4 braucht `nativewind-env.d.ts` (vorhanden) damit `className`-Prop typisiert ist
