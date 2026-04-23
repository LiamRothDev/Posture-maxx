import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLang } from '@lib/useLang';

export default function HowTo() {
  const router = useRouter();
  const [, , c] = useLang();

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <ScrollView contentContainerClassName="px-6 pt-4 pb-10">
        <Text className="text-[28px] leading-[32px] font-bebas tracking-wider text-white">
          {c.ob2_title}
        </Text>

        <View className="mt-8 gap-5">
          {c.ob2_steps.map((step) => (
            <View key={step.n} className="flex-row gap-4">
              <Text className="text-4xl font-bebas text-grade-a w-14">{step.n}</Text>
              <View className="flex-1">
                <Text className="text-base font-dm font-bold text-white">{step.title}</Text>
                <Text className="mt-1 text-sm text-white/55 font-dm leading-5">{step.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-10 rounded-2xl border border-grade-a/25 bg-bg-anth px-4 py-5">
          <Text className="text-xs uppercase tracking-widest text-grade-a font-dm">
            {c.ob2_demo_label}
          </Text>
          <Text className="mt-2 text-sm text-white/70 font-dm">{c.ob2_demo_text}</Text>
        </View>
      </ScrollView>

      <View className="px-6 pb-10">
        <Pressable
          className="w-full h-14 rounded-2xl bg-grade-a items-center justify-center active:opacity-80"
          onPress={() => router.push('/(onboarding)/personalize')}
        >
          <Text className="text-white font-dm font-bold text-base">{c.ob2_cta}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
