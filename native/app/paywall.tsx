import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLang } from '@lib/useLang';
import { store } from '@lib/useStore';

// Phase I: replace stub with real react-native-purchases calls
// import Purchases, { PurchasesPackage } from 'react-native-purchases';

export default function Paywall() {
  const router = useRouter();
  const [, , c] = useLang();
  const [selected, setSelected] = useState<'weekly' | 'yearly'>('yearly');
  const [purchasing, setPurchasing] = useState(false);

  const buy = async () => {
    setPurchasing(true);
    // Phase I: Purchases.purchasePackage(pkg)
    // Stub: simulate success after 1s
    await new Promise((r) => setTimeout(r, 1000));
    store.setPro(true);
    router.replace('/');
    setPurchasing(false);
  };

  const restore = async () => {
    // Phase I: Purchases.restorePurchases()
    Alert.alert('Restore', 'No previous purchases found (stub).');
  };

  const weeklyPrice = '$5.99 / week';
  const yearlyPrice = '$39.99 / year';
  const ctaPrice = selected === 'weekly' ? weeklyPrice : yearlyPrice;

  return (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <ScrollView contentContainerClassName="px-6 pt-4 pb-4">
        <Text className="text-[28px] leading-[32px] font-bebas tracking-wider text-white">
          {c.pay_title}
        </Text>
        <Text className="mt-3 text-sm text-white/60 font-dm">{c.pay_sub}</Text>

        {/* Features */}
        <View className="mt-6 gap-2.5">
          {c.pay_features.map((f) => (
            <View key={f} className="flex-row gap-3 items-center">
              <View className="w-5 h-5 rounded-full bg-grade-a items-center justify-center">
                <Text className="text-white text-xs font-bold">✓</Text>
              </View>
              <Text className="text-sm text-white/80 font-dm flex-1">{f}</Text>
            </View>
          ))}
        </View>

        {/* Plan toggle */}
        <View className="mt-8 gap-3">
          {/* Yearly */}
          <Pressable
            onPress={() => setSelected('yearly')}
            className={`rounded-2xl border p-4 ${
              selected === 'yearly'
                ? 'bg-grade-a/15 border-grade-a'
                : 'bg-bg-anth border-white/10'
            }`}
          >
            <View className="flex-row justify-between items-center">
              <Text className="font-dm font-bold text-white">{c.pay_yearly_label}</Text>
              <View className="bg-grade-a px-2 py-0.5 rounded-full">
                <Text className="text-white text-xs font-dm font-bold">{c.pay_badge}</Text>
              </View>
            </View>
            <Text className="text-white/60 text-sm font-dm mt-1">{yearlyPrice}</Text>
          </Pressable>

          {/* Weekly */}
          <Pressable
            onPress={() => setSelected('weekly')}
            className={`rounded-2xl border p-4 ${
              selected === 'weekly'
                ? 'bg-grade-a/15 border-grade-a'
                : 'bg-bg-anth border-white/10'
            }`}
          >
            <Text className="font-dm font-bold text-white">{c.pay_weekly_label}</Text>
            <Text className="text-white/60 text-sm font-dm mt-1">{weeklyPrice}</Text>
          </Pressable>
        </View>

        <Text className="mt-4 text-xs text-white/35 font-dm text-center">
          {c.pay_trial_hint}
        </Text>
      </ScrollView>

      <View className="px-6 pb-10 gap-3">
        <Pressable
          onPress={buy}
          disabled={purchasing}
          className={`w-full h-14 rounded-2xl bg-grade-a items-center justify-center ${
            purchasing ? 'opacity-60' : 'active:opacity-80'
          }`}
        >
          <Text className="text-white font-dm font-bold text-base">
            {purchasing ? '…' : `${c.pay_cta_prefix} ${ctaPrice}`}
          </Text>
        </Pressable>

        <Pressable onPress={restore} className="w-full h-10 items-center justify-center">
          <Text className="text-white/35 font-dm text-sm">{c.pay_restore}</Text>
        </Pressable>

        <Text className="text-xs text-white/25 font-dm text-center leading-4">
          {c.pay_legal}
        </Text>
      </View>
    </SafeAreaView>
  );
}
