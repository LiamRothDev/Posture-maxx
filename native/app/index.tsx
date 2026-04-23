import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLang } from '@lib/useLang';

export default function Splash() {
  const router = useRouter();
  const [, , c] = useLang();

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-[40px] leading-[44px] font-bebas tracking-wider text-white text-center">
          {c.splash_title}
        </Text>
        <Text className="mt-6 text-base text-white/60 text-center font-dm">
          {c.splash_sub}
        </Text>
      </View>

      <View className="px-6 pb-10 items-center">
        <Pressable
          className="w-full h-14 rounded-2xl bg-grade-a items-center justify-center active:opacity-80"
          onPress={() => router.push('/(onboarding)/problem')}
        >
          <Text className="text-white font-dm font-bold text-base">{c.splash_cta}</Text>
        </Pressable>
        <Text className="mt-3 text-xs text-white/35 font-dm">{c.splash_sub2}</Text>
      </View>
    </SafeAreaView>
  );
}
