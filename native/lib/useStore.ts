// Global, light-weight app store — no Redux/Zustand needed for this scale.
// Holds captured photo URIs + computed scores across screens.

import { useSyncExternalStore } from 'react';
import type { CapturedPhotos, ComputedScores } from '@shared/types';

interface AppState {
  photos: CapturedPhotos;
  scores: ComputedScores | null;
  isPro: boolean;
}

const initial: AppState = {
  photos: { side: null, front: null, back: null },
  scores: null,
  isPro: false,
};

let state = initial;
const listeners = new Set<() => void>();

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const getSnapshot = () => state;

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

export const store = {
  setPhoto(step: keyof CapturedPhotos, uri: string) {
    state = { ...state, photos: { ...state.photos, [step]: uri } };
    listeners.forEach((l) => l());
  },
  setScores(scores: ComputedScores) {
    state = { ...state, scores };
    listeners.forEach((l) => l());
  },
  setPro(isPro: boolean) {
    state = { ...state, isPro };
    listeners.forEach((l) => l());
  },
  reset() {
    state = initial;
    listeners.forEach((l) => l());
  },
};
