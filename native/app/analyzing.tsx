import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLang } from '@lib/useLang';
import { store, useStore } from '@lib/useStore';
import { calculateScores } from '@shared/calculateScores';
import type { KeypointArray } from '@shared/types';

// Dynamically require the native analyzer to avoid crashes in Expo Go
// (react-native-mediapipe is a native module — only available in dev builds)
function loadAnalyzer() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createNativePoseAnalyzer } = require('@lib/poseAnalyzer.native');
    return createNativePoseAnalyzer();
  } catch {
    return null;
  }
}

type AnalyzeStep = 'loading' | 'pose1' | 'pose2' | 'pose3' | 'scoring' | 'error';

export default function Analyzing() {
  const router = useRouter();
  const [, , c] = useLang();
  const photos = useStore((s) => s.photos);
  const [phase, setPhase] = useState<AnalyzeStep>('loading');
  const [errMsg, setErrMsg] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    run();
  }, []);

  const run = async () => {
    const analyzer = loadAnalyzer();

    // Graceful fallback when native module unavailable (e.g. Expo Go)
    if (!analyzer) {
      setPhase('scoring');
      await new Promise((r) => setTimeout(r, 800));
      const mock = buildMockKeypoints();
      store.setScores(calculateScores({ side: mock, front: mock, back: mock }));
      router.replace('/results');
      return;
    }

    try {
      setPhase('loading');
      await analyzer.init();

      const phaseMap: [keyof typeof photos, AnalyzeStep][] = [
        ['side', 'pose1'],
        ['front', 'pose2'],
        ['back', 'pose3'],
      ];

      const results: (KeypointArray | null)[] = [];

      for (const [key, stepPhase] of phaseMap) {
        setPhase(stepPhase);
        const uri = photos[key];
        if (!uri) {
          results.push(null);
          continue;
        }
        const kpts = await analyzer.analyze(uri);
        results.push(kpts);

        if (!kpts) {
          analyzer.dispose();
          setErrMsg(c.analyze_error);
          setPhase('error');
          return;
        }
      }

      setPhase('scoring');
      const [side, front, back] = results;
      const scores = calculateScores({ side, front, back });
      store.setScores(scores);

      analyzer.dispose();
      router.replace('/results');
    } catch (e: unknown) {
      analyzer.dispose();
      setErrMsg(e instanceof Error ? e.message : c.analyze_error);
      setPhase('error');
    }
  };

  const retry = () => {
    store.reset();
    router.replace('/(scan)/side');
  };

  if (phase === 'error') {
    return (
      <SafeAreaView className="flex-1 bg-bg-dark items-center justify-center px-8">
        <Text className="text-5xl mb-4">⚠️</Text>
        <Text className="text-white font-dm font-bold text-center text-base mb-3">
          {c.analyze_error}
        </Text>
        <Text className="text-white/40 font-dm text-xs text-center mb-8">{errMsg}</Text>
        <Pressable
          onPress={retry}
          className="w-full h-14 rounded-2xl bg-grade-a items-center justify-center active:opacity-80"
        >
          <Text className="text-white font-dm font-bold text-base">{c.analyze_retry}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const phaseLabel = (() => {
    switch (phase) {
      case 'loading': return c.analyze_loading;
      case 'pose1': return c.analyze_step(1, 3);
      case 'pose2': return c.analyze_step(2, 3);
      case 'pose3': return c.analyze_step(3, 3);
      case 'scoring': return c.analyze_done;
    }
  })();

  const progress = phase === 'loading' ? 0
    : phase === 'pose1' ? 25
    : phase === 'pose2' ? 50
    : phase === 'pose3' ? 75
    : 100;

  return (
    <SafeAreaView className="flex-1 bg-bg-dark items-center justify-center px-8">
      <ActivityIndicator size="large" color="#22c55e" />

      <Text className="mt-6 text-[26px] font-bebas tracking-wider text-white">
        {c.analyze_title}
      </Text>
      <Text className="mt-2 text-sm text-white/55 font-dm text-center">
        {c.analyze_sub}
      </Text>

      {/* Progress bar */}
      <View className="mt-10 w-full h-1.5 rounded-full bg-white/10">
        <View
          className="h-full rounded-full bg-grade-a"
          style={{ width: `${progress}%` }}
        />
      </View>

      <Text className="mt-3 text-xs text-white/40 font-dm text-center">
        {phaseLabel}
      </Text>
    </SafeAreaView>
  );
}

// Plausible mock keypoints for dev without native module
function buildMockKeypoints(): KeypointArray {
  const arr = new Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, visibility: 1 }));
  arr[7] = { x: 0.51, y: 0.08, visibility: 1 };   // left ear
  arr[8] = { x: 0.49, y: 0.08, visibility: 1 };   // right ear
  arr[11] = { x: 0.42, y: 0.28, visibility: 1 };  // left shoulder
  arr[12] = { x: 0.58, y: 0.28, visibility: 1 };  // right shoulder
  arr[23] = { x: 0.43, y: 0.55, visibility: 1 };  // left hip
  arr[24] = { x: 0.57, y: 0.55, visibility: 1 };  // right hip
  arr[25] = { x: 0.43, y: 0.73, visibility: 1 };  // left knee
  arr[26] = { x: 0.57, y: 0.73, visibility: 1 };  // right knee
  arr[27] = { x: 0.43, y: 0.92, visibility: 1 };  // left ankle
  arr[28] = { x: 0.57, y: 0.92, visibility: 1 };  // right ankle
  return arr as KeypointArray;
}
