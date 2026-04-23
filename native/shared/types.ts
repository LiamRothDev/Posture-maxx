// Shared types between Web-Prototype and RN-App.
// Keep this file free of React/DOM/RN imports so it copies 1:1.

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';
export type Pose = 'side' | 'front' | 'back';
export type Lang = 'de' | 'en';

export interface Keypoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export type KeypointArray = Keypoint[]; // BlazePose: length 33

export interface ScoreZone {
  key: 'head' | 'shoulders' | 'spine' | 'pelvis' | 'knees';
  score: Grade | null;
  angleDeg: number | null;
}

export interface ComputedScores {
  overall: Grade | null;
  zones: ScoreZone[];
}

export type CapturedPhotos = {
  [K in Pose]: string | null; // URI (file://) on RN, object-URL on Web
};

export type PoseResults = {
  [K in Pose]: KeypointArray | null;
};
