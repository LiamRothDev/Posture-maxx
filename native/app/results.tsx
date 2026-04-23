import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLang } from '@lib/useLang';
import { useStore, store } from '@lib/useStore';
import type { Grade } from '@shared/types';

const GRADE_COLORS: Record<Grade, string> = {
  A: 'text-grade-a',
  B: 'text-grade-b',
  C: 'text-grade-c',
  D: 'text-grade-d',
  F: 'text-grade-f',
};

const GRADE_BG: Record<Grade, string> = {
  A: 'bg-grade-a/15 border-grade-a',
  B: 'bg-grade-b/15 border-grade-b',
  C: 'bg-grade-c/15 border-grade-c',
  D: 'bg-grade-d/15 border-grade-d',
  F: 'bg-grade-f/15 border-grade-f',
};

export default function Results() {
  const router = useRouter();
  const [, , c] = useLang();
  const scores = useStore((s) => s.scores);

  if (!scores) {
    return (
      <SafeAreaView className="flex-1 bg-bg-dark items-center justify-center">
        <Text className="text-white/60 font-dm">No results yet.</Text>
        <Pressable
          className="mt-4 px-6 py-3 rounded-2xl bg-grade-a"
          onPress={() => router.replace('/(scan)/side')}
        >
          <Text className="text-white font-dm font-bold">Start scan</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const overall = scores.overall ?? 'F';

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <ScrollView contentContainerClassName="px-6 pt-4 pb-8">
        <Text className="text-xs uppercase tracking-widest text-white/35 font-dm">
          {c.result_title}
        </Text>

        {/* Overall grade */}
        <View className={`mt-4 rounded-3xl border p-6 items-center ${GRADE_BG[overall]}`}>
          <Text className={`text-8xl font-bebas ${GRADE_COLORS[overall]}`}>{overall}</Text>
          <Text className="text-sm text-white/60 font-dm mt-1">{c.result_overall}</Text>
        </View>

        {/* Zone scores */}
        <View className="mt-6 gap-3">
          {scores.zones.map((zone) => {
            const g = (zone.score ?? 'F') as Grade;
            const labelKey = zone.key as keyof typeof c.result_zone_labels;
            const unitKey = zone.key as keyof typeof c.result_unit;
            return (
              <View
                key={zone.key}
                className="flex-row items-center rounded-2xl bg-bg-anth border border-white/10 px-4 py-3"
              >
                <View className="flex-1">
                  <Text className="text-sm font-dm font-bold text-white">
                    {c.result_zone_labels[labelKey] ?? zone.key}
                  </Text>
                  <Text className="text-xs text-white/40 font-dm mt-0.5">
                    {(zone.angleDeg ?? 0).toFixed(1)}{c.result_unit[unitKey] ?? ''} {c.result_deviation}
                  </Text>
                </View>
                <View className={`w-10 h-10 rounded-full border items-center justify-center ${GRADE_BG[g] ?? 'bg-grade-f/15 border-grade-f'}`}>
                  <Text className={`text-base font-bebas ${GRADE_COLORS[g] ?? 'text-grade-f'}`}>{g}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Disclaimer */}
        <View className="mt-6 rounded-2xl border border-white/10 bg-bg-anth p-4">
          <Text className="text-xs text-white/40 font-dm leading-5">{c.disclaimer}</Text>
        </View>
      </ScrollView>

      <View className="px-6 pb-10 gap-3">
        <Pressable
          className="w-full h-14 rounded-2xl bg-grade-a items-center justify-center active:opacity-80"
          onPress={() => router.push('/paywall')}
        >
          <Text className="text-white font-dm font-bold text-base">{c.result_cta}</Text>
        </Pressable>
        <Pressable
          className="w-full h-12 items-center justify-center"
          onPress={() => {
            store.reset();
            router.replace('/(scan)/side');
          }}
        >
          <Text className="text-white/40 font-dm text-sm">{c.result_share}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
