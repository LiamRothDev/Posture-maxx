import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLang } from '@lib/useLang';

export default function Problem() {
  const router = useRouter();
  const [, , c] = useLang();
  const stats = [
    { v: c.ob1_stat1, l: c.ob1_label1 },
    { v: c.ob1_stat2, l: c.ob1_label2 },
    { v: c.ob1_stat3, l: c.ob1_label3 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <ScrollView contentContainerClassName="px-6 pt-4 pb-10">
        <Text className="text-[28px] leading-[32px] font-bebas tracking-wider text-white">
          {c.ob1_title}
        </Text>
        <Text className="mt-4 text-sm text-white/60 font-dm leading-5">{c.ob1_sub}</Text>

        <View className="mt-8 gap-4">
          {stats.map((s) => (
            <View key={s.l} className="flex-row items-center gap-4 rounded-2xl bg-bg-anth px-4 py-4 border border-white/5">
              <Text className="text-3xl font-bebas text-grade-a w-16">{s.v}</Text>
              <Text className="flex-1 text-sm text-white/70 font-dm">{s.l}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="px-6 pb-10">
        <Pressable
          className="w-full h-14 rounded-2xl bg-grade-a items-center justify-center active:opacity-80"
          onPress={() => router.push('/(onboarding)/howto')}
        >
          <Text className="text-white font-dm font-bold text-base">{c.ob1_cta}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
