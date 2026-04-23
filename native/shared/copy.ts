// DE/EN copy dictionary. Shared between web prototype and RN app.
// Keep as plain data — no imports from React/RN/DOM.

import type { Lang } from './types';

export const copy = {
  de: {
    splash_title: 'DEINE HALTUNG.\nDEIN SCORE.',
    splash_sub: 'Analysiere deine Körperhaltung in 60 Sekunden — wissenschaftlich, visuell, actionable.',
    splash_cta: 'Kostenlos starten',
    splash_sub2: '1 kostenloser Scan · Kein Konto nötig',

    ob1_title: 'Du verlierst täglich Energie.',
    ob1_sub: 'Schlechte Körperhaltung verursacht Rückenschmerzen, Kopfschmerzen und Erschöpfung — ohne dass du es merkst.',
    ob1_stat1: '80%', ob1_label1: 'leiden an Rückenschmerzen',
    ob1_stat2: '6 cm', ob1_label2: 'Kopfvorhalte im Schnitt',
    ob1_stat3: '40%', ob1_label3: 'weniger Lungenvolumen',
    ob1_now: 'Jetzt',
    ob1_day30: 'Tag 30',
    ob1_cta: 'Weiter',

    ob2_title: "So funktioniert's.",
    ob2_steps: [
      { n: '01', title: '3 Fotos machen', sub: 'Seite, Front, Rücken. Silhouetten-Overlay erzwingt die richtige Position.' },
      { n: '02', title: 'KI analysiert dich', sub: 'On-device Pose-Detection misst Winkel, Schiefstellungen, Asymmetrien.' },
      { n: '03', title: 'Score + Plan', sub: 'A–F pro Zone. Dazu 3–5 Übungen täglich, 10 Minuten. Wöchentlicher Re-Scan.' },
    ],
    ob2_demo_label: 'Live-Demo',
    ob2_demo_text: 'Pose-Detection erkennt 33 Körperpunkte in Echtzeit',
    ob2_cta: 'Loslegen',

    ob3_title: 'Schnell. Kein Konto.',
    ob3_sub: 'Wie heisst du?',
    ob3_placeholder: 'Dein Vorname',
    ob3_goal: 'Was ist dein Hauptziel?',
    ob3_goals: ['Rückenschmerzen reduzieren', 'Athletischer aussehen', 'Mehr Energie im Alltag', 'Haltung für Sport optimieren'],
    ob3_cta: 'Weiter zum Scan',

    cam_title: 'Scan vorbereiten',
    cam_guide: [
      'Stelle das Handy auf Hüfthöhe ab',
      '2 Meter Abstand von der Kamera',
      'Steh seitlich zur Kamera',
      'Ganzkörper muss sichtbar sein',
    ],
    cam_cta: 'Scan starten',
    disclaimer: 'Kein Ersatz für medizinische Beratung. Bei Schmerzen bitte Arzt oder Physio aufsuchen.',

    scan_labels: { side: 'Seitenprofil', front: 'Frontal', back: 'Rücken' },
    scan_hints: {
      side: 'Steh seitlich, Arme locker am Körper',
      front: 'Blick zur Kamera, Arme leicht abgespreizt',
      back: 'Rücken zur Kamera, Arme locker am Körper',
    },
    scan_live: 'LIVE',
    scan_done: 'AUFGENOMMEN',
    scan_offline: 'OFFLINE',
    scan_no_cam: 'Kamera nicht verfügbar — nutze Galerie',
    scan_next_step: 'Nächstes Foto →',
    scan_next: 'Weiter → Analyse',
    scan_gallery: 'Aus Galerie',
    result_your_photo: 'Dein Foto',

    result_title: 'DEIN HALTUNGS-SCORE',
    result_overall: 'Gesamt',
    result_deviation: 'Abweichung',
    result_zone_labels: {
      head: 'Kopf-Vorhaltung', shoulders: 'Schultern',
      spine: 'Wirbelsäule', pelvis: 'Becken', knees: 'Knie-Achse',
    },
    result_unit: { head: '°', shoulders: '%', spine: '°', pelvis: '%', knees: '°' },
    result_cta: 'Plan freischalten →',
    result_share: 'Ergebnis teilen',

    analyze_title: 'Analyse läuft',
    analyze_sub: 'On-Device, deine Fotos bleiben auf dem Gerät',
    analyze_loading: 'Modell wird geladen…',
    analyze_step: (i: number, n: number) => `Foto ${i} / ${n}`,
    analyze_done: 'Scores berechnen…',
    analyze_error: 'Keine Person erkannt. Tritt näher und stelle sicher dass der Ganzkörper im Bild ist.',
    analyze_retry: 'Noch einmal versuchen',

    pay_title: 'Starte deinen\n30-Tage-Plan',
    pay_sub: 'Täglich 10 Minuten. Wöchentlicher Scan. Sichtbare Ergebnisse.',
    pay_features: [
      'Personalisierter Übungsplan',
      'Wöchentlicher Re-Scan mit Before/After',
      'Unbegrenzte Scans',
      'TikTok-ready Ergebnis-Cards',
    ],
    pay_weekly_label: 'Wöchentlich',
    pay_yearly_label: 'Jährlich',
    pay_trial_hint: '3 Tage kostenlos testen',
    pay_badge: 'Beliebt',
    pay_cta_prefix: '3 Tage kostenlos testen — dann',
    pay_legal: 'Jederzeit kündbar. Apple-Konto wird nach dem Testzeitraum belastet, sofern nicht 24h vorher gekündigt.',
    pay_restore: 'Kauf wiederherstellen',
  },

  en: {
    splash_title: 'YOUR POSTURE.\nYOUR SCORE.',
    splash_sub: 'Analyze your posture in 60 seconds — scientific, visual, actionable.',
    splash_cta: 'Start for free',
    splash_sub2: '1 free scan · No account needed',

    ob1_title: "You're leaking energy daily.",
    ob1_sub: 'Poor posture causes back pain, headaches, and fatigue — without you noticing.',
    ob1_stat1: '80%', ob1_label1: 'suffer from back pain',
    ob1_stat2: '6 cm', ob1_label2: 'average head forward',
    ob1_stat3: '40%', ob1_label3: 'less lung capacity',
    ob1_now: 'Now',
    ob1_day30: 'Day 30',
    ob1_cta: 'Continue',

    ob2_title: 'How it works.',
    ob2_steps: [
      { n: '01', title: 'Take 3 photos', sub: 'Side, front, back. Silhouette overlay enforces the right pose.' },
      { n: '02', title: 'AI analyzes you', sub: 'On-device pose detection measures angles, misalignments, asymmetries.' },
      { n: '03', title: 'Score + Plan', sub: 'A–F per zone. Plus 3–5 daily exercises, 10 minutes. Weekly re-scan.' },
    ],
    ob2_demo_label: 'Live demo',
    ob2_demo_text: 'Pose detection tracks 33 body points in real time',
    ob2_cta: 'Get started',

    ob3_title: 'Quick. No account.',
    ob3_sub: "What's your name?",
    ob3_placeholder: 'Your first name',
    ob3_goal: "What's your main goal?",
    ob3_goals: ['Reduce back pain', 'Look more athletic', 'More daily energy', 'Optimize posture for sports'],
    ob3_cta: 'Go to scan',

    cam_title: 'Prepare scan',
    cam_guide: [
      'Place phone at hip height',
      'Stand 2 meters from camera',
      'Stand sideways to camera',
      'Full body must be visible',
    ],
    cam_cta: 'Start scan',
    disclaimer: 'Not a substitute for medical advice. See a doctor or physio if in pain.',

    scan_labels: { side: 'Side Profile', front: 'Front', back: 'Back' },
    scan_hints: {
      side: 'Stand sideways, arms relaxed',
      front: 'Face the camera, arms slightly out',
      back: 'Back to camera, arms relaxed',
    },
    scan_live: 'LIVE',
    scan_done: 'CAPTURED',
    scan_offline: 'OFFLINE',
    scan_no_cam: 'Camera unavailable — use gallery',
    scan_next_step: 'Next photo →',
    scan_next: 'Continue → Analysis',
    scan_gallery: 'From gallery',
    result_your_photo: 'Your photo',

    result_title: 'YOUR POSTURE SCORE',
    result_overall: 'Overall',
    result_deviation: 'deviation',
    result_zone_labels: {
      head: 'Head Forward', shoulders: 'Shoulders',
      spine: 'Spine', pelvis: 'Pelvis', knees: 'Knee Axis',
    },
    result_unit: { head: '°', shoulders: '%', spine: '°', pelvis: '%', knees: '°' },
    result_cta: 'Unlock your plan →',
    result_share: 'Share result',

    analyze_title: 'Analyzing',
    analyze_sub: 'On-device. Photos stay on your phone.',
    analyze_loading: 'Loading model…',
    analyze_step: (i: number, n: number) => `Photo ${i} / ${n}`,
    analyze_done: 'Computing scores…',
    analyze_error: 'No person detected. Step closer and make sure your full body is visible.',
    analyze_retry: 'Try again',

    pay_title: 'Start your\n30-day plan',
    pay_sub: '10 minutes daily. Weekly scan. Visible results.',
    pay_features: [
      'Personalized exercise plan',
      'Weekly re-scan with before/after',
      'Unlimited scans',
      'TikTok-ready result cards',
    ],
    pay_weekly_label: 'Weekly',
    pay_yearly_label: 'Yearly',
    pay_trial_hint: 'Try 3 days free',
    pay_badge: 'Popular',
    pay_cta_prefix: 'Try 3 days free — then',
    pay_legal: 'Cancel anytime. Apple account charged after trial unless cancelled 24h before.',
    pay_restore: 'Restore purchase',
  },
};

export type Copy = typeof copy.de;

export const getCopy = (lang: Lang): Copy => copy[lang];
