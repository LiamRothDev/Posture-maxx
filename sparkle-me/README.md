# Sparkle Me ✨

Android-App (Kotlin, Jetpack Compose) mit Gruppen, Freunden und Bluetooth (BLE).

- **Gruppen**: erstellen oder per 6-stelligem Code beitreten, Gruppenchat
- **Freunde**: per Bluetooth in der Nähe hinzufügen, Direktnachrichten
- **Nähe**: findet andere Sparkle-Handys; Freunde hinzufügen, Gruppen beitreten
- **Geräte**: verbindet sich mit beliebigen BLE-Geräten (Dienste, Akkustand)
- Alles wird nur lokal auf dem Handy gespeichert, kein Server nötig.
  Nachrichten gehen direkt per Bluetooth, beide Handys brauchen die App offen und müssen in Reichweite sein.

## APK
Fertige APK: `SparkleMe.apk` (installieren, "Unbekannte Apps" erlauben).
Neu bauen: `echo "sdk.dir=$ANDROID_HOME" > local.properties && ./gradlew assembleRelease`
Die APK ist mit dem Debug-Schlüssel signiert, für den Play Store braucht es einen eigenen Schlüssel.
