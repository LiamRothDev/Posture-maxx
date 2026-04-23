import { useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useLang } from '@lib/useLang';
import { store } from '@lib/useStore';
import type { Pose } from '@shared/types';

const STEPS: Pose[] = ['side', 'front', 'back'];
const FACING: CameraType = 'back';

export default function ScanStep() {
  const { step } = useLocalSearchParams<{ step: Pose }>();
  const router = useRouter();
  const [, , c] = useLang();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);

  const currentIdx = STEPS.indexOf(step as Pose);
  const label = c.scan_labels[step as Pose] ?? step;
  const hint = c.scan_hints[step as Pose] ?? '';

  const goNext = useCallback((pose: Pose) => {
    const nextIdx = STEPS.indexOf(pose) + 1;
    if (nextIdx < STEPS.length) {
      router.push(`/(scan)/${STEPS[nextIdx]}`);
    } else {
      router.push('/analyzing');
    }
  }, [router]);

  const capturePhoto = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
        exif: false,
      });
      if (photo?.uri) {
        store.setPhoto(step as Pose, photo.uri);
        goNext(step as Pose);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not take photo. Try gallery instead.');
    } finally {
      setCapturing(false);
    }
  };

  const fromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      store.setPhoto(step as Pose, result.assets[0].uri);
      goNext(step as Pose);
    }
  };

  // Permission denied → gallery-only fallback
  const renderPermissionDenied = () => (
    <SafeAreaView className="flex-1 bg-bg-dark">
      <Header />
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-5xl mb-4">📷</Text>
        <Text className="text-white font-dm font-bold text-center text-base mb-2">
          {c.scan_no_cam}
        </Text>
        <Text className="text-white/40 font-dm text-sm text-center mb-8">
          Kamera-Zugriff verweigert
        </Text>
        <Pressable
          onPress={fromGallery}
          className="w-full h-14 rounded-2xl bg-grade-a items-center justify-center active:opacity-80"
        >
          <Text className="text-white font-dm font-bold text-base">{c.scan_gallery}</Text>
        </Pressable>
        <Pressable
          onPress={requestPermission}
          className="mt-3 w-full h-12 items-center justify-center"
        >
          <Text className="text-white/40 font-dm text-sm">Kamera-Erlaubnis erteilen</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );

  const Header = () => (
    <View className="px-6 pt-2 pb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-white/40 font-dm text-sm">
          {currentIdx + 1} / {STEPS.length}
        </Text>
        <View className="flex-row gap-1.5">
          {STEPS.map((s, i) => (
            <View
              key={s}
              className={`h-1.5 rounded-full ${
                i < currentIdx
                  ? 'w-6 bg-grade-a'
                  : i === currentIdx
                  ? 'w-6 bg-white'
                  : 'w-6 bg-white/20'
              }`}
            />
          ))}
        </View>
      </View>
      <Text className="text-[24px] leading-[28px] font-bebas tracking-wider text-white">
        {label}
      </Text>
      <Text className="mt-1 text-sm text-white/55 font-dm">{hint}</Text>
    </View>
  );

  if (!permission) {
    return <View className="flex-1 bg-bg-dark" />;
  }

  if (!permission.granted) {
    return renderPermissionDenied();
  }

  return (
    <View className="flex-1 bg-bg-dark">
      {/* Camera fills the screen */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={FACING}
        ratio="16:9"
      />

      {/* Dark overlay at top for header readability */}
      <SafeAreaView className="flex-1" edges={['top']}>
        <View style={styles.topOverlay}>
          <Header />
        </View>

        {/* Silhouette hint overlay — centered in the camera view */}
        <View className="flex-1 items-center justify-center">
          <View
            className="border-2 border-white/30 rounded-3xl"
            style={styles.silhouetteFrame}
          />
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomOverlay} className="pb-12 px-6">
          <View className="flex-row items-center justify-between">
            {/* Gallery button */}
            <Pressable
              onPress={fromGallery}
              className="w-14 h-14 rounded-full bg-white/15 border border-white/20 items-center justify-center active:opacity-70"
            >
              <Text className="text-2xl">🖼</Text>
            </Pressable>

            {/* Shutter button */}
            <Pressable
              onPress={capturePhoto}
              disabled={capturing}
              className={`w-20 h-20 rounded-full items-center justify-center border-4 ${
                capturing
                  ? 'border-white/40 bg-white/30'
                  : 'border-white bg-white/20 active:bg-white/40'
              }`}
            >
              <View className={`w-14 h-14 rounded-full ${capturing ? 'bg-grade-a/60' : 'bg-white'}`} />
            </Pressable>

            {/* Placeholder to balance layout */}
            <View className="w-14 h-14" />
          </View>

          {currentIdx > 0 && (
            <Text className="text-white/35 font-dm text-xs text-center mt-4">
              {c.scan_next_step}
            </Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  topOverlay: {
    backgroundColor: 'rgba(8,8,8,0.65)',
    paddingTop: 8,
  },
  bottomOverlay: {
    backgroundColor: 'rgba(8,8,8,0.65)',
    paddingTop: 20,
  },
  silhouetteFrame: {
    width: 180,
    height: 320,
  },
});
