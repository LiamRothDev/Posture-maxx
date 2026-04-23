import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLang } from '@lib/useLang';

export default function CamGuide() {
  const router = useRouter();
  const [, , c] = useLang();

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <ScrollView contentContainerClassName="px-6 pt-4 pb-8">
        <Text className="text-[26px] leading-[30px] font-bebas tracking-wider text-white">
          {c.cam_title}
        </Text>

        <View className="mt-8 gap-3">
          {c.cam_guide.map((line, i) => (
            <View key={i} className="flex-row gap-3 items-start">
              <View className="w-6 h-6 rounded-full bg-grade-a/20 border border-grade-a items-center justify-center mt-0.5">
                <Text className="text-xs font-dm font-bold text-grade-a">{i + 1}</Text>
              </View>
              <Text className="flex-1 text-sm text-white/75 font-dm leading-5">{line}</Text>
            </View>
          ))}
        </View>

        <View className="mt-8 rounded-2xl border border-white/10 bg-bg-anth p-4">
          <Text className="text-xs uppercase tracking-widest text-white/35 font-dm">
            Disclaimer
          </Text>
          <Text className="mt-2 text-xs text-white/55 font-dm leading-5">
            {c.disclaimer}
          </Text>
        </View>
      </ScrollView>

      <View className="px-6 pb-10">
        <Pressable
          className="w-full h-14 rounded-2xl bg-grade-a items-center justify-center active:opacity-80"
          onPress={() => router.push('/(scan)/side')}
        >
          <Text className="text-white font-dm font-bold text-base">{c.cam_cta}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
