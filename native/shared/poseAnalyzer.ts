// Platform-agnostic PoseAnalyzer interface. Web and RN implementations live in
// lib/poseAnalyzer.web.ts / lib/poseAnalyzer.native.ts and expose the same shape.

import type { KeypointArray } from './types';

export interface PoseAnalyzer {
  init(): Promise<void>;
  analyze(image: unknown): Promise<KeypointArray | null>;
  dispose(): void;
}

export type PoseAnalyzerFactory = () => PoseAnalyzer;
