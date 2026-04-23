// Native PoseAnalyzer — react-native-mediapipe BlazePose (33 keypoints).
// Requires a dev build (Expo Go does NOT support native modules).
// Run: eas build --profile development --platform ios|android
//
// The model file lives at assets/pose_landmarker_lite.task and is bundled
// via app.json "assetBundlePatterns": ["**/*"].

import type { PoseAnalyzer } from '@shared/poseAnalyzer';
import type { KeypointArray, Keypoint } from '@shared/types';

// Lazy require so the module is only resolved at runtime on native
// (avoids import errors in environments without the native module).
let _module: typeof import('react-native-mediapipe') | null = null;
const getRNMP = () => {
  if (!_module) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    _module = require('react-native-mediapipe') as typeof import('react-native-mediapipe');
  }
  return _module;
};

// react-native-mediapipe v0.5.x landmark type
interface MPLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  presence?: number;
}

export function createNativePoseAnalyzer(): PoseAnalyzer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let landmarker: any = null;

  return {
    async init() {
      if (landmarker) return;
      const { PoseLandmarker, FilesetResolver } = getRNMP();

      const fileset = await FilesetResolver.forVisionTasks(
        // Using bundled WASM — no CDN needed on native (handled by the plugin)
        undefined as any,
      );

      landmarker = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: {
          // require() resolves to the bundled asset path at runtime
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          modelAssetPath: require('../assets/pose_landmarker_lite.task'),
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputSegmentationMasks: false,
      });
    },

    async analyze(imageUri: unknown): Promise<KeypointArray | null> {
      if (!landmarker) await this.init();
      if (typeof imageUri !== 'string') return null;

      const result = await (landmarker as any).detect({ uri: imageUri });
      const raw: MPLandmark[] | undefined = result?.landmarks?.[0];
      if (!raw || raw.length < 33) return null;

      const pts: KeypointArray = raw.slice(0, 33).map(
        (p): Keypoint => ({
          x: p.x,
          y: p.y,
          z: p.z,
          visibility: p.visibility ?? p.presence ?? 1,
        }),
      );
      return pts;
    },

    dispose() {
      if (landmarker) {
        (landmarker as any).close?.();
        landmarker = null;
      }
    },
  };
}
