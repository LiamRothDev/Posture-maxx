import { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLang } from '@lib/useLang';

export default function Personalize() {
  const router = useRouter();
  const [, , c] = useLang();
  const [name, setName] = useState('');
  const [goalIdx, setGoalIdx] = useState<number | null>(null);

  const onContinue = async () => {
    try {
      if (name) await AsyncStorage.setItem('pm.name', name);
      if (goalIdx != null) await AsyncStorage.setItem('pm.goal', String(goalIdx));
    } catch {}
    router.push('/(onboarding)/camguide');
  };

  const canContinue = name.length > 0 && goalIdx != null;

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <ScrollView contentContainerClassName="px-6 pt-4 pb-10" keyboardShouldPersistTaps="handled">
        <Text className="text-[26px] leading-[30px] font-bebas tracking-wider text-white">
          {c.ob3_title}
        </Text>

        <Text className="mt-8 text-sm text-white/60 font-dm">{c.ob3_sub}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={c.ob3_placeholder}
          placeholderTextColor="rgba(255,255,255,0.3)"
          className="mt-3 h-14 rounded-2xl bg-bg-anth border border-white/10 px-4 text-white font-dm text-base"
          autoCapitalize="words"
          returnKeyType="done"
        />

        <Text className="mt-8 text-sm text-white/60 font-dm">{c.ob3_goal}</Text>
        <View className="mt-3 gap-2">
          {c.ob3_goals.map((g, i) => {
            const active = goalIdx === i;
            return (
              <Pressable
                key={g}
                onPress={() => setGoalIdx(i)}
                className={`h-14 rounded-2xl px-4 justify-center border ${
                  active
                    ? 'bg-grade-a/15 border-grade-a'
                    : 'bg-bg-anth border-white/10'
                }`}
              >
                <Text className={`font-dm text-sm ${active ? 'text-white' : 'text-white/75'}`}>{g}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="px-6 pb-10">
        <Pressable
          disabled={!canContinue}
          className={`w-full h-14 rounded-2xl items-center justify-center ${
            canContinue ? 'bg-grade-a active:opacity-80' : 'bg-white/10'
          }`}
          onPress={onContinue}
        >
          <Text className={`font-dm font-bold text-base ${canContinue ? 'text-white' : 'text-white/40'}`}>
            {c.ob3_cta}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
